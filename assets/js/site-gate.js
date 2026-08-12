/* site-gate.js —— 网站访问密码门（仅前端速记锁）
 * 密码：auplex2026（正确后本会话 sessionStorage 记住，刷新仍可见）
 * 说明：纯前端校验，非服务端鉴权；站点静态数据文件仍可被直接 URL 获取。
 *       作用仅是给访客加一道「进入密码」，避免站点内容被爬虫/外人随意浏览。
 */
(function () {
  "use strict";

  var PW = "auplex2026";
  var KEY = "aup_site_access";

  function unlocked() {
    try { return sessionStorage.getItem(KEY) === "1"; } catch (e) { return false; }
  }

  function reveal() {
    try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
    document.body.classList.remove("gate-locked");
    var g = document.getElementById("siteGate");
    if (g) g.parentNode && g.parentNode.removeChild(g);
  }

  function injectStyle() {
    if (document.getElementById("siteGateStyle")) return;
    var s = document.createElement("style");
    s.id = "siteGateStyle";
    s.textContent =
      "body.gate-locked > *:not(#siteGate){visibility:hidden !important;}\n" +
      "#siteGate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;" +
      "background:rgba(15,23,32,.96);backdrop-filter:blur(6px);font-family:'Noto Sans SC',system-ui,sans-serif;}\n" +
      ".sg-card{width:min(360px,90vw);background:#fff;border-radius:16px;padding:34px 28px;box-shadow:0 24px 70px rgba(0,0,0,.45);text-align:center;}\n" +
      ".sg-badge{display:inline-block;font-size:12px;letter-spacing:2px;color:#2F6FE0;background:#EAF1FD;padding:4px 12px;border-radius:999px;margin-bottom:16px;}\n" +
      ".sg-title{font-size:22px;margin:0 0 6px;color:#15202E;font-weight:700;}\n" +
      ".sg-sub{font-size:13px;color:#6B7787;margin:0 0 20px;}\n" +
      ".sg-err{display:none;color:#DC4A3D;font-size:13px;margin:0 0 10px;}\n" +
      ".sg-input{width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid #E4EAF1;border-radius:10px;font-size:15px;margin-bottom:14px;outline:none;}\n" +
      ".sg-input:focus{border-color:#2F6FE0;}\n" +
      ".sg-btn{width:100%;padding:12px;border:none;border-radius:10px;background:#2F6FE0;color:#fff;font-size:15px;font-weight:600;cursor:pointer;}\n" +
      ".sg-btn:hover{background:#1B4FB0;}";
    document.head.appendChild(s);
  }

  function lock() {
    injectStyle();
    document.body.classList.add("gate-locked");
    if (document.getElementById("siteGate")) return;
    var d = document.createElement("div");
    d.id = "siteGate";
    d.innerHTML =
      '<div class="sg-card">' +
      '<div class="sg-badge">AUP · 内部资料</div>' +
      '<h1 class="sg-title">访问密码</h1>' +
      '<p class="sg-sub">本站点为内部资料，请输入访问密码</p>' +
      '<p class="sg-err" id="sgErr">访问密码错误，请重试</p>' +
      '<input class="sg-input" id="sgPass" type="password" placeholder="请输入访问密码" autocomplete="current-password" />' +
      '<button class="sg-btn" id="sgBtn" type="button">进 入</button>' +
      '</div>';
    document.body.appendChild(d);
    var input = d.querySelector("#sgPass");
    var err = d.querySelector("#sgErr");
    var btn = d.querySelector("#sgBtn");
    function go() {
      if (input.value === PW) { reveal(); }
      else { err.style.display = "block"; input.focus(); input.select(); }
    }
    btn.addEventListener("click", go);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
    setTimeout(function () { try { input.focus(); } catch (e) {} }, 60);
  }

  function init() {
    if (unlocked()) { reveal(); return; }
    lock();
  }

  // 脚本位于 <body> 顶部：执行时 body 已存在、后续内容尚未解析 → 立即加锁，避免内容闪现
  init();
})();
