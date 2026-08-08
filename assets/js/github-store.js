/* github-store.js —— 浏览器端 GitHub Contents API 客户端
 * 仅用于 GitHub Pages 静态托管场景：后台从浏览器直接读写仓库内的数据文件。
 * Token 仅存于 sessionStorage（本次会话），不写死、不留盘。
 */
(function () {
  "use strict";

  // 目标仓库（GitHub Pages 站点对应的仓库）
  var REPO = "1625804272/aup-heat-press";
  var BRANCH = "main";
  var API = "https://api.github.com";

  function b64encode(str) {
    // UTF-8 安全编码（支持中文）
    return btoa(unescape(encodeURIComponent(str)));
  }
  function b64decode(b64) {
    return decodeURIComponent(escape(atob(String(b64).replace(/\s/g, ""))));
  }
  function getToken() {
    try { return sessionStorage.getItem("aup_gh_token") || ""; } catch (e) { return ""; }
  }
  function setToken(t) {
    try {
      if (t) sessionStorage.setItem("aup_gh_token", t);
      else sessionStorage.removeItem("aup_gh_token");
    } catch (e) {}
  }

  // 校验 Token 是否有效（读取当前用户）
  async function verify(t) {
    try {
      var r = await fetch(API + "/user", {
        headers: { "Authorization": "Bearer " + t, "Accept": "application/vnd.github+json" }
      });
      if (!r.ok) return { ok: false, status: r.status };
      var j = await r.json();
      return { ok: true, login: j.login, status: r.status };
    } catch (e) {
      return { ok: false, status: 0, error: String(e) };
    }
  }

  // 读取仓库内文件（path 相对仓库根）。返回 { notFound } / { content, sha } / { error }
  async function read(path) {
    var t = getToken();
    var url = API + "/repos/" + REPO + "/contents/" + path + "?ref=" + BRANCH;
    try {
      var r = await fetch(url, {
        headers: { "Authorization": "Bearer " + t, "Accept": "application/vnd.github+json" },
        cache: "no-store"
      });
      if (r.status === 404) return { notFound: true };
      if (!r.ok) {
        var e = await r.json().catch(function () { return {}; });
        return { error: e.message || ("HTTP " + r.status) };
      }
      var j = await r.json();
      var content;
      try { content = JSON.parse(b64decode(j.content)); }
      catch (err) { return { error: "文件内容解析失败" }; }
      return { content: content, sha: j.sha };
    } catch (e) {
      return { error: String(e) };
    }
  }

  // 写入（创建或更新）仓库内文件。sha 缺省时为新建
  async function write(path, obj, sha, message) {
    var t = getToken();
    var url = API + "/repos/" + REPO + "/contents/" + path;
    var body = {
      message: message || ("Update " + path),
      content: b64encode(JSON.stringify(obj, null, 2)),
      branch: BRANCH
    };
    if (sha) body.sha = sha;
    try {
      var r = await fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": "Bearer " + t,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (!r.ok) {
        var e = await r.json().catch(function () { return {}; });
        return { ok: false, status: r.status, error: e.message || ("HTTP " + r.status) };
      }
      var j = await r.json();
      return { ok: true, sha: j.content ? j.content.sha : undefined };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  window.GHStore = {
    repo: REPO,
    branch: BRANCH,
    token: getToken,
    setToken: setToken,
    verify: verify,
    read: read,
    write: write
  };
})();
