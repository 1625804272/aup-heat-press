/* admin.js —— GitHub Pages 版后台（无 Functions，数据同步到仓库）
 * 登录：填入 GitHub Token（经典令牌，含 repo 权限）→ 验证 → 存 sessionStorage
 * 数据：库存/台账读写仓库内 assets/data/stock.json、assets/data/returns.json
 * 保存即一次 git commit，访客刷新后可见（约数秒 CDN 生效）
 */
(function () {
  "use strict";
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );
  }
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.hidden = true), 2400);
  }

  const STOCK_PATH = "assets/data/stock.json";
  const RETURNS_PATH = "assets/data/returns.json";

  // 库存种子（仓库文件不存在时启用，保证后台有可编辑的 SKU 行）
  const DEFAULT_STOCK = {
    updatedAt: null,
    items: [
      { family: "AUP-M2", color: "红色", plug: "欧插", qty: 0 },
      { family: "AUP-M2", color: "绿色", plug: "欧插", qty: 0 },
      { family: "AUP-L", color: "红色", plug: "中插", qty: 0 },
      { family: "AUP-L", color: "红色", plug: "欧插", qty: 0 },
      { family: "AUP-L", color: "绿色", plug: "中插", qty: 0 },
      { family: "AUP-L", color: "绿色", plug: "欧插", qty: 0 },
      { family: "AUP-L2", color: "紫色", plug: "中插", qty: 0 },
      { family: "AUP-L3", color: "绿色", plug: "中插", qty: 0 },
      { family: "AUP-L3", color: "绿色", plug: "欧插", qty: 0 }
    ]
  };

  const FAMILIES = ["AUP-M2", "AUP-L", "AUP-L2", "AUP-L3"];

  // 状态
  let stock = { items: [], updatedAt: null };
  let stockLoaded = false;
  let stockSha = null;
  let returnsData = { returns: [], reships: [] };
  let returnsLoaded = false;
  let returnsSha = null;
  let returnFilter = { family: "全部", voltage: "全部" };
  let reshipFilter = { family: "全部", voltage: "全部" };

  /* ---------- 登录 ---------- */
  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const tok = $("#loginToken").value.trim();
    if (!tok) {
      $("#loginErr").textContent = "请填入 GitHub Token（经典令牌，勾选 repo 权限）";
      return;
    }
    $("#loginErr").textContent = "正在验证 Token…";
    const v = await GHStore.verify(tok);
    if (!v.ok) {
      $("#loginErr").textContent = "Token 无效或无权限（HTTP " + v.status + "）";
      return;
    }
    GHStore.setToken(tok);
    showGhStatus(v.login);
    await enterAdmin();
  });

  function showGhStatus(login) {
    const el = $("#ghStatus");
    if (el) el.textContent = "● 已连接 GitHub · @" + (login || "?");
  }

  async function enterAdmin() {
    const tok = GHStore.token();
    if (!tok) {
      $("#loginView").hidden = false;
      $("#appView").hidden = true;
      return;
    }
    // 先显示后台框架，再加载数据，避免异常导致卡在登录页
    $("#loginView").hidden = true;
    $("#appView").hidden = false;
    try {
      await loadStockAdmin();
    } catch (e) {
      console.error("[loadStockAdmin]", e);
      toast("库存加载失败：" + (e && e.message ? e.message : e));
    }
    try {
      await loadReturnsAdmin();
    } catch (e) {
      console.error("[loadReturnsAdmin]", e);
      toast("退货加载失败：" + (e && e.message ? e.message : e));
    }
  }

  $("#logoutBtn").addEventListener("click", () => {
    GHStore.setToken("");
    location.reload();
  });

  /* ---------- Tabs ---------- */
  $$(".atab").forEach((b) =>
    b.addEventListener("click", () => {
      $$(".atab").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      const t = b.dataset.tab;
      $$(".atab-panel").forEach((p) => p.classList.remove("active"));
      $("#tab-" + t).classList.add("active");
    })
  );

  /* ---------- 库存管理 ---------- */
  async function loadStockAdmin() {
    const res = await GHStore.read(STOCK_PATH);
    if (res.notFound) {
      stock = JSON.parse(JSON.stringify(DEFAULT_STOCK));
      stockSha = null;
    } else if (res.error) {
      toast("库存读取失败：" + res.error);
      return;
    } else {
      stock = res.content && Array.isArray(res.content.items) ? res.content : JSON.parse(JSON.stringify(DEFAULT_STOCK));
      stockSha = res.sha;
    }
    stockLoaded = true;
    renderStockAdmin();
  }

  function renderStockAdmin() {
    const tb = $("#stockTable tbody");
    const items = stock.items || [];
    if (!items.length) {
      tb.innerHTML = '<tr><td colspan="4" style="color:#8a8178;padding:14px">暂无库存数据</td></tr>';
      renderStockOverview(items);
      const u = stock.updatedAt ? new Date(stock.updatedAt) : null;
      $("#stockUpdatedAt").textContent = u ? "最近更新：" + u.toLocaleString("zh-CN", { hour12: false }) : "尚未更新";
      return;
    }
    tb.innerHTML = items
      .map(
        (it, i) => `<tr>
          <td>${esc(it.family)}</td>
          <td>${esc(it.color)}</td>
          <td>${esc(it.plug)}</td>
          <td><input class="stock-qty-input" type="number" min="0" step="1" value="${it.qty == null ? 0 : it.qty}" data-i="${i}"></td>
        </tr>`
      )
      .join("");
    $$("#stockTable .stock-qty-input").forEach((inp) =>
      inp.addEventListener("input", () => {
        const i = +inp.dataset.i;
        stock.items[i].qty = Math.max(0, parseInt(inp.value, 10) || 0);
        renderStockOverview(stock.items);
      })
    );
    renderStockOverview(items);
    const u = stock.updatedAt ? new Date(stock.updatedAt) : null;
    $("#stockUpdatedAt").textContent = u
      ? "最近更新：" + u.toLocaleString("zh-CN", { hour12: false })
      : "尚未更新";
  }

  function renderStockOverview(items) {
    const ov = $("#stockOverview");
    if (!ov) return;
    const LOW = 5;
    let on = 0, low = 0, out = 0;
    (items || []).forEach((it) => {
      const q = it.qty == null ? 0 : it.qty;
      if (q <= 0) out++; else if (q <= LOW) low++; else on++;
    });
    ov.innerHTML =
      '<div class="ov-card"><span class="ov-num">' + items.length + '</span><span class="ov-label">SKU 总数</span></div>' +
      '<div class="ov-card ok"><span class="ov-num">' + on + '</span><span class="ov-label">库存充足</span></div>' +
      '<div class="ov-card low"><span class="ov-num">' + low + '</span><span class="ov-label">库存紧张</span></div>' +
      '<div class="ov-card out"><span class="ov-num">' + out + '</span><span class="ov-label">缺货</span></div>';
  }

  $("#saveStockBtn").addEventListener("click", async () => {
    const btn = $("#saveStockBtn");
    btn.disabled = true;
    stock.updatedAt = new Date().toISOString();
    const res = await GHStore.write(STOCK_PATH, stock, stockSha, "更新实时库存（后台）");
    btn.disabled = false;
    if (res.ok) {
      stockSha = res.sha || stockSha;
      $("#stockUpdatedAt").textContent = "最近更新：" + new Date(stock.updatedAt).toLocaleString("zh-CN", { hour12: false });
      toast("库存已保存并提交到 GitHub ✓（访客稍后可见）");
    } else {
      toast("库存保存失败：" + (res.error || res.status));
    }
  });

  /* ---------- 退货 / 补发管理（独立台账，不影响库存） ---------- */
  function genId(p) {
    return p + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
  function statusTag(s) {
    const cls = s === "待补发" ? "st-pending" : s === "已补发" ? "st-shipped" : "st-received";
    return '<span class="st-tag ' + cls + '">' + esc(s) + "</span>";
  }

  async function loadReturnsAdmin() {
    const res = await GHStore.read(RETURNS_PATH);
    if (res.notFound) {
      returnsData = { returns: [], reships: [] };
      returnsSha = null;
    } else if (res.error) {
      toast("退货读取失败：" + res.error);
      return;
    } else {
      returnsData = {
        returns: Array.isArray(res.content.returns) ? res.content.returns : [],
        reships: Array.isArray(res.content.reships) ? res.content.reships : []
      };
      returnsSha = res.sha;
    }
    returnsLoaded = true;
    renderReturns();
  }

  // 客户端聚合（与 Netlify /api/returns 输出格式一致，供公开页渲染）
  function summarize(d) {
    const returns = d.returns || [];
    const reships = d.reships || [];
    let totalReturns = 0, pendingReship = 0, shipped = 0, received = 0, recentReturns = 0;
    const since7 = Date.now() - 7 * 24 * 3600 * 1000;
    returns.forEach((r) => {
      const q = Number(r.qty) || 0;
      totalReturns += q;
      const tt = r.date ? new Date(r.date).getTime() : NaN;
      if (!isNaN(tt) && tt >= since7) recentReturns += q;
    });
    reships.forEach((s) => {
      const q = Number(s.qty) || 0;
      const st = s.status || "";
      if (st === "待补发") pendingReship += q;
      else if (st === "已补发") shipped += q;
      else if (st === "已收货") received += q;
    });
    const map = {};
    const add = (f) => { if (!map[f]) map[f] = { family: f, returned: 0, reshiped: 0, pending: 0 }; return map[f]; };
    returns.forEach((r) => { if (r.family) add(r.family).returned += Number(r.qty) || 0; });
    reships.forEach((s) => {
      if (!s.family) return;
      const m = add(s.family);
      const q = Number(s.qty) || 0;
      const st = s.status || "";
      if (st === "待补发") m.pending += q; else m.reshiped += q;
    });
    const byModel = FAMILIES.filter((f) => map[f]).map((f) => map[f]);
    const returnsLite = returns.map((r) => ({
      family: r.family || "", color: r.color || "", plug: r.plug || "",
      voltage: r.voltage || "", qty: Number(r.qty) || 0, date: r.date || "", source: r.source || ""
    }));
    const reshipsLite = reships.map((s) => ({
      family: s.family || "", color: s.color || "", plug: s.plug || "",
      voltage: s.voltage || "", qty: Number(s.qty) || 0, shipDate: s.shipDate || "",
      supplier: s.supplier || "", status: s.status || ""
    }));
    return {
      updatedAt: d.updatedAt || null,
      overview: { totalReturns, pendingReship, shipped, received, recentReturns },
      byModel, returns: returnsLite, reships: reshipsLite
    };
  }

  function renderReturns() {
    renderReturnsOverview();
    renderReturnsByModel();
    renderReturnTable();
    renderReshipOptions();
    renderReshipTable();
    const u = returnsData.updatedAt ? new Date(returnsData.updatedAt) : null;
    const el = $("#returnsUpdatedAt");
    if (el) el.textContent = u ? "最近更新：" + u.toLocaleString("zh-CN", { hour12: false }) : "尚未更新";
  }

  function renderReturnsOverview() {
    const ov = $("#returnsOverview");
    if (!ov) return;
    const ret = returnsData.returns || [];
    const res = returnsData.reships || [];
    const returnedTotal = ret.reduce((s, x) => s + (+x.qty || 0), 0);
    const reshipedTotal = res.reduce((s, x) => s + (+x.qty || 0), 0);
    const pending = Math.max(0, returnedTotal - reshipedTotal);
    const received = res.filter((x) => x.status === "已收货").reduce((s, x) => s + (+x.qty || 0), 0);
    const card = (n, label, cls) =>
      '<div class="ov-card ' + (cls || "") + '"><span class="ov-num">' + n +
      '</span><span class="ov-label">' + label + "</span></div>";
    ov.innerHTML =
      card(returnedTotal, "退货总台数", "") +
      card(pending, "待补发台数", "low") +
      card(reshipedTotal, "已补发台数", "ok") +
      card(received, "已收货台数", "");
  }

  function renderReturnsByModel() {
    const tb = $("#returnsByModel tbody");
    if (!tb) return;
    const ret = returnsData.returns || [];
    const res = returnsData.reships || [];
    const map = {};
    FAMILIES.forEach((f) => (map[f] = { returned: 0, reshiped: 0 }));
    ret.forEach((x) => { if (map[x.family]) map[x.family].returned += (+x.qty || 0); });
    res.forEach((x) => { if (map[x.family]) map[x.family].reshiped += (+x.qty || 0); });
    const rows = FAMILIES.filter((f) => map[f].returned || map[f].reshiped).map((f) => {
      const r = map[f];
      const pending = Math.max(0, r.returned - r.reshiped);
      return "<tr><td>" + esc(f) + "</td><td>" + r.returned + "</td><td>" + r.reshiped + "</td><td>" + pending + "</td></tr>";
    });
    tb.innerHTML = rows.length
      ? rows.join("")
      : '<tr><td colspan="4" style="color:#8A97A8;padding:14px">暂无退货数据</td></tr>';
  }

  function renderReturnTable() {
    const tb = $("#returnTable tbody");
    if (!tb) return;
    let rows = (returnsData.returns || []).slice();
    if (returnFilter.family !== "全部") rows = rows.filter((x) => x.family === returnFilter.family);
    if (returnFilter.voltage !== "全部") rows = rows.filter((x) => x.voltage === returnFilter.voltage);
    rows.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    if (!rows.length) {
      tb.innerHTML = '<tr><td colspan="9" style="color:#8A97A8;padding:14px">暂无退货记录</td></tr>';
      return;
    }
    tb.innerHTML = rows
      .map(
        (x) =>
          "<tr>" +
          "<td>" + esc(x.family) + "</td>" +
          "<td>" + esc(x.color || "-") + "</td>" +
          "<td>" + esc(x.plug || "-") + "</td>" +
          "<td>" + esc(x.voltage || "-") + "</td>" +
          '<td class="num">' + (+x.qty || 0) + "</td>" +
          "<td>" + esc(x.date || "-") + "</td>" +
          "<td>" + esc(x.source || "-") + "</td>" +
          "<td>" + esc(x.reason || "-") + "</td>" +
          '<td><button class="row-del" data-del-return="' + esc(x.id) + '">删除</button></td>' +
          "</tr>"
      )
      .join("");
    $$("#returnTable [data-del-return]").forEach((b) =>
      b.addEventListener("click", () => deleteReturn(b.dataset.delReturn))
    );
  }

  function renderReshipOptions() {
    const sel = $("#returnLinkSelect");
    if (!sel) return;
    const cur = sel.value;
    const ret = returnsData.returns || [];
    sel.innerHTML =
      '<option value="">不关联</option>' +
      ret
        .map(
          (x) =>
            '<option value="' + esc(x.id) + '">' +
            esc([x.family, x.color, x.plug, x.voltage, "×" + (+x.qty || 0), x.date || ""].filter(Boolean).join(" ")) +
            "</option>"
        )
        .join("");
    if (cur) sel.value = cur;
  }

  function renderReshipTable() {
    const tb = $("#reshipTable tbody");
    if (!tb) return;
    let rows = (returnsData.reships || []).slice();
    if (reshipFilter.family !== "全部") rows = rows.filter((x) => x.family === reshipFilter.family);
    if (reshipFilter.voltage !== "全部") rows = rows.filter((x) => x.voltage === reshipFilter.voltage);
    rows.sort((a, b) => (b.shipDate || "").localeCompare(a.shipDate || ""));
    if (!rows.length) {
      tb.innerHTML = '<tr><td colspan="10" style="color:#8A97A8;padding:14px">暂无补发记录</td></tr>';
      return;
    }
    tb.innerHTML = rows
      .map(
        (x) =>
          "<tr>" +
          "<td>" + esc(x.family) + "</td>" +
          "<td>" + esc(x.color || "-") + "</td>" +
          "<td>" + esc(x.plug || "-") + "</td>" +
          "<td>" + esc(x.voltage || "-") + "</td>" +
          '<td class="num">' + (+x.qty || 0) + "</td>" +
          "<td>" + esc(x.shipDate || "-") + "</td>" +
          "<td>" + esc(x.supplier || "-") + "</td>" +
          "<td>" + esc(x.tracking || "-") + "</td>" +
          "<td>" + statusTag(x.status || "待补发") + "</td>" +
          '<td><button class="row-del" data-del-reship="' + esc(x.id) + '">删除</button></td>' +
          "</tr>"
      )
      .join("");
    $$("#reshipTable [data-del-reship]").forEach((b) =>
      b.addEventListener("click", () => deleteReship(b.dataset.delReship))
    );
  }

  async function saveReturns(msg) {
    returnsData.updatedAt = new Date().toISOString();
    const payload = summarize(returnsData);
    const res = await GHStore.write(RETURNS_PATH, payload, returnsSha, "更新退货台账（后台）");
    if (res.ok) {
      returnsSha = res.sha || returnsSha;
      renderReturns();
      if (msg) toast(msg + " · 已提交到 GitHub ✓");
    } else {
      toast("保存失败：" + (res.error || res.status));
    }
  }

  async function deleteReturn(id) {
    returnsData.returns = returnsData.returns.filter((x) => x.id !== id);
    returnsData.reships = returnsData.reships.filter((x) => x.returnId !== id);
    await saveReturns("已删除退货记录");
  }
  async function deleteReship(id) {
    returnsData.reships = returnsData.reships.filter((x) => x.id !== id);
    await saveReturns("已删除补发记录");
  }

  $("#returnForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const item = {
      id: genId("r"),
      family: fd.get("family"),
      color: (fd.get("color") || "").trim(),
      plug: (fd.get("plug") || "").trim(),
      voltage: fd.get("voltage"),
      qty: Math.max(0, parseInt(fd.get("qty"), 10) || 0),
      date: fd.get("date") || new Date().toISOString().slice(0, 10),
      source: (fd.get("source") || "").trim(),
      reason: (fd.get("reason") || "").trim(),
      note: (fd.get("note") || "").trim(),
      createdAt: new Date().toISOString(),
    };
    if (!item.family || !item.qty) { toast("请填写型号和数量"); return; }
    returnsData.returns.push(item);
    saveReturns("退货记录已添加 ✓");
    e.target.reset();
  });

  $("#reshipForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const item = {
      id: genId("s"),
      returnId: fd.get("returnId") || "",
      family: fd.get("family"),
      color: (fd.get("color") || "").trim(),
      plug: (fd.get("plug") || "").trim(),
      voltage: fd.get("voltage"),
      qty: Math.max(0, parseInt(fd.get("qty"), 10) || 0),
      shipDate: fd.get("shipDate") || new Date().toISOString().slice(0, 10),
      supplier: (fd.get("supplier") || "").trim(),
      tracking: (fd.get("tracking") || "").trim(),
      status: fd.get("status") || "待补发",
      note: (fd.get("note") || "").trim(),
      createdAt: new Date().toISOString(),
    };
    if (!item.family || !item.qty) { toast("请填写型号和数量"); return; }
    returnsData.reships.push(item);
    saveReturns("补发记录已添加 ✓");
    e.target.reset();
  });

  $("#returnFilterFamily").addEventListener("change", (e) => { returnFilter.family = e.target.value; renderReturnTable(); });
  $("#returnFilterVoltage").addEventListener("change", (e) => { returnFilter.voltage = e.target.value; renderReturnTable(); });
  $("#reshipFilterFamily").addEventListener("change", (e) => { reshipFilter.family = e.target.value; renderReshipTable(); });
  $("#reshipFilterVoltage").addEventListener("change", (e) => { reshipFilter.voltage = e.target.value; renderReshipTable(); });

  /* ---------- 初始化：若有会话直接进后台 ---------- */
  (async () => {
    if (GHStore.token()) {
      const v = await GHStore.verify(GHStore.token());
      if (v.ok) { showGhStatus(v.login); await enterAdmin(); return; }
      GHStore.setToken("");
    }
    $("#loginView").hidden = false;
    $("#appView").hidden = true;
  })();
})();
