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
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.hidden = true), 2200);
  }
  async function api(path, opts) {
    const r = await fetch(path, Object.assign({ credentials: "same-origin" }, opts));
    const j = await r.json().catch(() => ({}));
    return { r, j };
  }

  /* ---------- 登录 ---------- */
  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = $("#loginUser").value.trim();
    const pass = $("#loginPass").value;
    const { r, j } = await api("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, pass }),
    });
    if (r.ok && j.ok) await enterAdmin();
    else $("#loginErr").textContent = j.error || "登录失败";
  });

  async function enterAdmin() {
    // 以库存接口鉴权；未登录返回 401 时退回登录页
    const { r, j } = await api("/api/admin/stock");
    if (!r.ok) {
      $("#loginView").hidden = false;
      $("#appView").hidden = true;
      return;
    }
    // 先显示后台框架，再渲染库存——避免渲染异常导致整页卡在登录页
    $("#loginView").hidden = true;
    $("#appView").hidden = false;
    try {
      if (j && Array.isArray(j.items)) {
        stock = j;
        stockLoaded = true;
        renderStockAdmin();
      } else {
        toast("库存数据格式异常");
      }
    // 后台框架已显示，后台台账也一并加载（不影响库存渲染）
    loadReturnsAdmin();
    } catch (e) {
      console.error("[renderStockAdmin]", e);
      toast("库存加载失败：" + (e && e.message ? e.message : e));
    }
  }

  $("#logoutBtn").addEventListener("click", () => {
    fetch("/api/logout", { method: "POST", credentials: "same-origin" }).then(() => location.reload());
  });

  /* ---------- Tabs ---------- */
  $$(".atab").forEach((b) =>
    b.addEventListener("click", () => {
      $$(".atab").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      const t = b.dataset.tab;
      $$(".atab-panel").forEach((p) => p.classList.remove("active"));
      $("#tab-" + t).classList.add("active");
      if (t === "stock" && !stockLoaded) loadStockAdmin();
      if (t === "returns" && !returnsLoaded) loadReturnsAdmin();
    })
  );

  /* ---------- 库存管理 ---------- */
  let stock = { items: [], updatedAt: null };
  let stockLoaded = false;

  async function loadStockAdmin() {
    const { r, j } = await api("/api/admin/stock");
    if (r.ok && j && Array.isArray(j.items)) {
      stock = j;
      stockLoaded = true;
      renderStockAdmin();
    } else if (r.status === 401) {
      // 未登录态由 enterAdmin 统一处理
    } else {
      toast("库存加载失败：" + (j.error || r.status));
    }
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
    const { r, j } = await api("/api/admin/stock", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stock),
    });
    if (r.ok && j.ok) {
      stock.updatedAt = j.savedAt;
      $("#stockUpdatedAt").textContent = "最近更新：" + new Date(j.savedAt).toLocaleString("zh-CN", { hour12: false });
      toast("库存已保存 ✓");
    } else {
      toast("库存保存失败：" + (j.error || r.status));
    }
  });

  /* ---------- 退货 / 补发管理（独立台账，不影响库存） ---------- */
  const FAMILIES = ["AUP-M2", "AUP-L", "AUP-L2", "AUP-L3"];
  let returnsData = { returns: [], reships: [] };
  let returnsLoaded = false;
  let returnFilter = { family: "全部", voltage: "全部" };
  let reshipFilter = { family: "全部", voltage: "全部" };

  function genId(p) {
    return p + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
  function statusTag(s) {
    const cls = s === "待补发" ? "st-pending" : s === "已补发" ? "st-shipped" : "st-received";
    return '<span class="st-tag ' + cls + '">' + esc(s) + "</span>";
  }

  async function loadReturnsAdmin() {
    const { r, j } = await api("/api/admin/returns");
    if (r.ok && j) {
      returnsData = {
        returns: Array.isArray(j.returns) ? j.returns : [],
        reships: Array.isArray(j.reships) ? j.reships : [],
      };
      returnsLoaded = true;
      renderReturns();
    } else if (r.status === 401) {
      // 未登录态由 enterAdmin 统一处理
    } else {
      toast("退货数据加载失败：" + (j.error || r.status));
    }
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
    const { r, j } = await api("/api/admin/returns", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(returnsData),
    });
    if (r.ok && j.ok) {
      returnsData.updatedAt = j.savedAt;
      renderReturns();
      if (msg) toast(msg);
    } else {
      toast("保存失败：" + (j.error || r.status));
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

  /* ---------- 初始化：尝试已有会话 ---------- */
  (async () => {
    await enterAdmin();
  })();
})();
