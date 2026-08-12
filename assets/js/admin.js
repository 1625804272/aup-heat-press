/* admin.js —— GitHub Pages 版后台（只读查看）
 * 登录：访问密码（auplex2026）进入，仅查看，不修改
 * 数据：直接读取仓库内静态文件 assets/data/stock.json、assets/data/returns.json
 * 无需 GitHub Token / API，适合给同事或自己随时查看退货台账
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

  /* ---------- 登录（访问密码，只读查看） ---------- */
  const ACCESS_PASS = "auplex2026";

  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const pass = $("#loginPass").value;
    if (pass !== ACCESS_PASS) {
      $("#loginErr").textContent = "访问密码错误";
      return;
    }
    try { sessionStorage.setItem("aup_view_ok", "1"); } catch (e) {}
    enterAdmin();
  });

  async function enterAdmin() {
    // 只读查看模式：直接读取仓库内静态数据文件，无需任何 Token
    $("#loginView").hidden = true;
    $("#appView").hidden = false;
    document.body.classList.add("readonly");
    const gs = $("#ghStatus");
    if (gs) gs.textContent = "只读模式 · 查看";
    try {
      await loadStockAdmin();
    } catch (e) {
      console.error("[loadStockAdmin]", e);
      toast("库存加载失败");
    }
    try {
      await loadReturnsAdmin();
    } catch (e) {
      console.error("[loadReturnsAdmin]", e);
      toast("退货加载失败");
    }
  }

  $("#logoutBtn").addEventListener("click", () => {
    try { sessionStorage.removeItem("aup_view_ok"); } catch (e) {}
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
    let data = null;
    try {
      const r = await fetch(STOCK_PATH, { cache: "no-store" });
      if (!r.ok) throw 0;
      data = await r.json();
    } catch (e) {
      data = null;
    }
    stock = data && Array.isArray(data.items) ? data : JSON.parse(JSON.stringify(DEFAULT_STOCK));
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
        (it) => `<tr>
          <td>${esc(it.family)}</td>
          <td>${esc(it.color)}</td>
          <td>${esc(it.plug)}</td>
          <td class="num">${it.qty == null ? 0 : it.qty}</td>
        </tr>`
      )
      .join("");
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

  /* ---------- 退货 / 补发管理（只读查看） ---------- */
  function statusTag(s) {
    const cls = s === "待补发" ? "st-pending" : s === "已补发" ? "st-shipped" : "st-received";
    return '<span class="st-tag ' + cls + '">' + esc(s) + "</span>";
  }

  async function loadReturnsAdmin() {
    let data = null;
    try {
      const r = await fetch(RETURNS_PATH, { cache: "no-store" });
      if (!r.ok) throw 0;
      data = await r.json();
    } catch (e) {
      data = null;
    }
    returnsData = {
      returns: data && Array.isArray(data.returns) ? data.returns : [],
      reships: data && Array.isArray(data.reships) ? data.reships : []
    };
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
      tb.innerHTML = '<tr><td colspan="8" style="color:#8A97A8;padding:14px">暂无退货记录</td></tr>';
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
          "</tr>"
      )
      .join("");
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
      tb.innerHTML = '<tr><td colspan="9" style="color:#8A97A8;padding:14px">暂无补发记录</td></tr>';
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
          "</tr>"
      )
      .join("");
  }

  $("#returnFilterFamily").addEventListener("change", (e) => { returnFilter.family = e.target.value; renderReturnTable(); });
  $("#returnFilterVoltage").addEventListener("change", (e) => { returnFilter.voltage = e.target.value; renderReturnTable(); });
  $("#reshipFilterFamily").addEventListener("change", (e) => { reshipFilter.family = e.target.value; renderReshipTable(); });
  $("#reshipFilterVoltage").addEventListener("change", (e) => { reshipFilter.voltage = e.target.value; renderReshipTable(); });

  /* ---------- 初始化：若本会话已解锁则直接进入 ---------- */
  (async () => {
    let ok = false;
    try { ok = sessionStorage.getItem("aup_view_ok") === "1"; } catch (e) {}
    if (ok) { enterAdmin(); return; }
    $("#loginView").hidden = false;
    $("#appView").hidden = true;
  })();
})();
