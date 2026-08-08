/* ===== AUP 熨斗机站点 · 渲染 + 多语言 ===== */
(function () {
  "use strict";

  var $ = function (s, p) { return (p || document).querySelector(s); };
  var $$ = function (s, p) { return Array.prototype.slice.call((p || document).querySelectorAll(s)); };

  /* ===== 加密登录墙（保密站使用，公开部署不触发） ===== */
  function b64ToBytes(b64) {
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  async function decryptData(password) {
    var salt = window.AUP_ENC.salt, iv = window.AUP_ENC.iv, ct = window.AUP_ENC.ct;
    var enc = new TextEncoder();
    var keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    var key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: b64ToBytes(salt), iterations: 150000, hash: "SHA-256" },
      keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
    );
    var plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(iv) }, key, b64ToBytes(ct));
    return JSON.parse(new TextDecoder().decode(plain));
  }

  /* ===== 全局状态 ===== */
  var D = null;
  var initDone = false;
  var curFam = "全部", curVol = "全部", curColor = "全部";
  var lastReturns = [], lastReships = [], activeFilter = "all", activeSource = "";

  var FAMILY_ORDER = ["AUP-M2", "AUP-L", "AUP-L2", "AUP-L3"];

  /* ===== 机型对比状态 ===== */
  var COMPARE_MAX = 4;
  function loadCompare() {
    try { return JSON.parse(localStorage.getItem("aup_compare") || "[]"); } catch (e) { return []; }
  }
  function saveCompare() {
    try { localStorage.setItem("aup_compare", JSON.stringify(compareList)); } catch (e) {}
  }
  var compareList = loadCompare();

  /* ===== 工具 ===== */
  function yuan(n) { return "¥" + Number(n).toLocaleString("zh-CN"); }
  var COLOR_HEX = {
    "红": "#e23b3b", "绿": "#2f9e57", "灰": "#9aa3ab", "蓝": "#2b6cb0", "紫": "#8b5cf6",
    "黄": "#ecc94b", "黑": "#23262b", "白": "#f4f4f4", "粉": "#ec4899", "橙": "#f0842e",
    "金": "#c9a24a", "银": "#c4c9ce"
  };
  function colorHex(name) {
    for (var k in COLOR_HEX) if (name.indexOf(k) !== -1) return COLOR_HEX[k];
    return "#cbd5e0";
  }
  function colorsOf(fam) {
    var s = D.specs[fam];
    if (!s) return [];
    return (s["机器颜色"] || "").split(/[、,，/\s]+/).map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function colorDots(fam) {
    var cs = colorsOf(fam);
    if (!cs.length) return "";
    return '<span class="color-dots">' + cs.map(function (c) {
      return '<i class="cdot" style="background:' + colorHex(c) + '" title="' + c + '"></i>';
    }).join("") + "</span>";
  }
  function imgFor(p) {
    if (p.image) return p.image;
    var s = D.specs[p.family];
    return s && s._image ? s._image : null;
  }
  function escStock(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]);
    });
  }
  function fmtStockTime(iso) {
    if (!iso) return t("stock_updated_prefix") ? "—" : "—";
    try {
      var d = new Date(iso);
      var p = function (n) { return String(n).padStart(2, "0"); };
      return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
    } catch (e) { return iso; }
  }
  function observeReveal() {
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$(".reveal:not(.in)").forEach(function (el) { io.observe(el); });
  }
  function statusText(zh) {
    var map = { "待补发": "status_pending", "已补发": "status_shipped", "已收货": "status_received", "退货": "status_return" };
    return map[zh] ? t(map[zh]) : zh;
  }
  function calcRateText(rate) {
    var l = getLang();
    if (l === "zh") { return { num: String(Math.round(rate * 100)), suffix: " 折" }; }
    return { num: String(Math.round((1 - rate) * 100)), suffix: "%" };
  }

  /* ===== 渲染：HERO ===== */
  function renderHero() {
    $("#statFam").textContent = Object.keys(D.specs).length;
    $("#statSku").textContent = D.products.length;
    var orbitImgs = [
      { src: D.specs["AUP-M2"] && D.specs["AUP-M2"]._image, label: "M2", cls: "orb-1" },
      { src: D.specs["AUP-L"] && D.specs["AUP-L"]._image, label: "L", cls: "orb-2" },
      { src: D.specs["AUP-L2"] && D.specs["AUP-L2"]._image, label: "L2", cls: "orb-3" },
      { src: D.specs["AUP-L3"] && D.specs["AUP-L3"]._image, label: "L3", cls: "orb-4" }
    ];
    $("#heroOrbit").innerHTML = orbitImgs.map(function (o) {
      return o.src ? '<div class="orb ' + o.cls + '" data-label="' + o.label + '"><img src="' + o.src + '" alt="' + o.label + '"></div>' : "";
    }).join("");
  }

  /* ===== 渲染：FAMILIES ===== */
  function renderFamilies() {
    var famWrap = $("#familyGrid");
    famWrap.innerHTML = FAMILY_ORDER.filter(function (f) { return D.familyMeta[f]; }).map(function (f) {
      var m = D.familyMeta[f];
      var s = D.specs[f] || {};
      var skuCount = D.products.filter(function (p) { return p.family === f; }).length;
      return '<article class="family-card reveal" data-family="' + f + '">' +
        '<div class="family-thumb">' + (s._image ? '<img src="' + s._image + '" alt="' + familyName(f) + '">' : "") + '</div>' +
        '<div class="family-name">' + familyName(f) + '</div>' +
        '<div class="family-tag">' + familyTag(f) + '</div>' +
        '<div class="family-meta">' +
          '<span class="chip hot">' + familySize(f) + '</span>' +
          '<span class="chip">' + skuCount + " " + t("fam_model_unit") + '</span>' +
          '<span class="chip">110/220V</span>' +
        '</div>' +
        '<span class="family-link" data-goto-spec="' + f + '">' + t("fam_view_spec") + '</span>' +
      '</article>';
    }).join("");
  }

  /* ===== 渲染：CATALOG 筛选 + 列表 ===== */
  function renderFilters() {
    var families = ["全部"].concat(FAMILY_ORDER.filter(function (f) { return D.familyMeta[f]; }));
    var voltages = ["全部", "110V", "220V"];
    var allColors = [];
    D.products.forEach(function (p) {
      colorsOf(p.family).forEach(function (c) { if (allColors.indexOf(c) === -1) allColors.push(c); });
    });
    var famBtn = function (f) {
      return '<button class="fbtn ' + (f === curFam ? "active" : "") + '" data-fam="' + f + '">' +
        (f === "全部" ? t("filter_all") : familyName(f).replace(/\s.*/, "")) + '</button>';
    };
    var volBtn = function (v) {
      return '<button class="fbtn ' + (v === curVol ? "active" : "") + '" data-vol="' + v + '">' +
        (v === "全部" ? t("filter_all") : v) + '</button>';
    };
    var colBtn = function (c) {
      return '<button class="fbtn color-fbtn ' + (c === curColor ? "active" : "") + '" data-color="' + c + '">' +
        (c === "全部" ? t("filter_all") : '<i class="cdot" style="background:' + colorHex(c) + '"></i>' + colorName(c)) + '</button>';
    };
    $("#filterFamily").innerHTML = '<span class="flabel">' + t("filter_series") + '</span>' + families.map(famBtn).join("");
    $("#filterVoltage").innerHTML = '<span class="flabel">' + t("filter_volt") + '</span>' + voltages.map(volBtn).join("");
    $("#filterColor").innerHTML = '<span class="flabel">' + t("filter_color") + '</span>' + allColors.map(colBtn).join("");
  }
  function voltTags(v) {
    var t2 = [];
    if ((v || "").indexOf("110") !== -1) t2.push("110V");
    if ((v || "").indexOf("220") !== -1) t2.push("220V");
    return t2.length ? t2 : [v];
  }
  function renderCatalog() {
    var list = D.products.filter(function (p) {
      return (curFam === "全部" || p.family === curFam) &&
        (curVol === "全部" || p.voltage.indexOf(curVol.replace("V", "")) !== -1) &&
        (curColor === "全部" || colorsOf(p.family).indexOf(curColor) !== -1);
    });
    var grid = $("#catalogGrid");
    if (!list.length) { grid.innerHTML = '<p style="color:var(--ink-faint)">' + t("filter_nomatch") + '</p>'; return; }
    grid.innerHTML = list.map(function (p) {
      var im = imgFor(p);
      var tierKeys = Object.keys(p.tiers);
      var hasSpecial = tierKeys.some(function (k) { return p.tiers[k].special; });
      var media = im
        ? '<img src="' + im + '" alt="' + p.name + '">'
        : '<div style="height:120px;display:grid;place-items:center;color:var(--ink-faint);font-family:var(--font-display)">' + p.family + '</div>';
      return '<article class="product-card reveal ' + (p.discontinued ? "sold-out" : "") + '" data-k3="' + p.k3 + '">' +
        '<div class="product-media">' + media +
          (p.voltage ? '<span class="volt-tags">' + voltTags(p.voltage).map(function (x) { return '<span class="volt-tag">' + x + '</span>'; }).join("") + '</span>' : "") +
          (p.discontinued ? '<span class="sold-out-tag">' + t("cat_soldout") + '</span>' : "") + '</div>' +
        '<div class="product-body">' +
          '<div class="product-name">' + productName(p.name) + '</div>' +
          '<div class="product-k3">K3 · ' + p.k3 + " " + colorDots(p.family) + '</div>' +
          '<div class="product-foot">' +
            '<div><div class="price-label">' + t("cat_price_label") + '</div><div class="price-val">' + yuan(p.basePrice) + '<small> /' + t("unit") + '</small></div></div>' +
            (hasSpecial ? '<span class="disc-tag">' + t("cat_special") + '</span>' : '<span class="chip">' + t("cat_standard") + '</span>') +
          '</div>' +
          '<label class="cmp-check' + (compareList.indexOf(p.k3) >= 0 ? " checked" : "") + '">' +
            '<input type="checkbox" data-cmp="' + p.k3 + '"' + (compareList.indexOf(p.k3) >= 0 ? " checked" : "") + '>' +
            '<span class="cmp-check-text">' + (compareList.indexOf(p.k3) >= 0 ? t("compare_added") : t("compare_add")) + '</span>' +
          '</label>' +
        '</div>' +
      '</article>';
    }).join("");
    observeReveal();
  }

  /* ===== 渲染：SPECS ===== */
  function renderSpecs() {
    var specFams = FAMILY_ORDER.filter(function (f) { return D.specs[f]; });
    $("#specTabs").innerHTML = specFams.map(function (f, i) {
      return '<button class="spec-tab ' + (i === 0 ? "active" : "") + '" data-spec="' + f + '">' + familyName(f).replace(/\s.*/, "") + '</button>';
    }).join("");
    if (specFams.length) selectSpec(specFams[0]);
  }
  function selectSpec(fam) {
    var tab = $('#specTabs .spec-tab[data-spec="' + fam + '"]');
    if (!tab) return;
    $$("#specTabs .spec-tab").forEach(function (x) { x.classList.remove("active"); });
    tab.classList.add("active");
    var s = D.specs[fam] || {};
    var m = D.familyMeta[fam] || { name: fam, tag: "" };
    var rows = "";
    D.attrOrder.forEach(function (a) {
      var v = s[a.key];
      if (v === undefined || v === null || v === "") return;
      if (typeof v === "string" && v.indexOf("assets/") === 0) return;
      if (a.key === "机器颜色") v = translateColorsInText(v);
      if (a.key === "电源规格") v = translatePlugsInText(v);
      v = specValue(v);
      rows += '<tr><th>' + specLabel(a.key) + '</th><td>' + v + '</td></tr>';
    });
    $("#specPanel").innerHTML =
      '<div class="spec-hero">' +
        '<div class="thumb">' + (s._image ? '<img src="' + s._image + '" alt="' + familyName(fam) + '">' : "") + '</div>' +
        '<h3>' + familyName(fam) + '</h3>' +
        '<div class="tag">' + familyTag(fam) + '</div>' +
        (s._imageExtra ? '<img src="' + s._imageExtra + '" alt="accessory" style="max-height:120px;margin-top:14px;object-fit:contain;border-radius:10px;background:#faf6f0;width:100%">' : "") +
      '</div>' +
      '<div><table class="spec-table">' + rows + '</table></div>';
  }

  /* ===== 渲染：PRICING ===== */
  function renderPricing() {
    var tierCols = [
      ["51-100", "51–100"], ["101-300", "101–300"], ["301-500", "301–500"],
      ["501-1000", "501–1000"], ["1001-5000", "1001–5000"], ["5000+", "5000+"]
    ];
    var thead = '<thead><tr><th>' + t("price_model") + '</th><th>' + t("price_volt") + '</th><th>' + t("price_k3") +
      '</th><th>' + t("price_base") + '</th>' +
      tierCols.map(function (x) { return '<th>' + x[1] + '</th>'; }).join("") + '<th>' + t("price_perbox") + '</th></tr></thead>';
    var tbody = "<tbody>" + D.products.map(function (p) {
      var tds = tierCols.map(function (x) {
        var cell = p.tiers[x[0]];
        if (!cell) return '<td class="muted">' + t("price_muted") + '</td>';
        return '<td class="special">' + cell.price + (cell.special ? '<small> ' + t("price_special") + '</small>' : "") + '</td>';
      }).join("");
      return '<tr><td>' + productName(p.name) + '</td><td>' + (p.voltage || "—") + '</td><td>' + p.k3 + '</td><td class="base">' +
        yuan(p.basePrice) + '</td>' + tds + '<td>' + (p.unitsPerBox == null ? "—" : p.unitsPerBox) + '</td></tr>';
    }).join("") + "</tbody>";
    $("#priceTable").innerHTML = thead + tbody;
  }

  /* ===== 渲染：RULES ===== */
  function renderRules() {
    var tiers = [
      { range: "rule_range1", desc: "rule_desc1", featured: false },
      { range: "rule_range2", desc: "rule_desc2", featured: true },
      { range: "rule_range3", desc: "rule_desc3", featured: false },
      { range: "rule_range4", desc: "rule_desc4", featured: false }
    ];
    $("#ruleCards").innerHTML = tiers.map(function (tt) {
      return '<div class="rule-card reveal ' + (tt.featured ? "featured" : "") + '">' +
        '<div class="tier">' + t(tt.range) + '</div>' +
        '<div class="rate">' + Math.round([1.0, 0.98, 0.95, 0.95][tiers.indexOf(tt)] * 100) + '<small>%</small></div>' +
        '<div class="desc">' + t(tt.desc) + '</div>' +
      '</div>';
    }).join("");
    $("#ruleNote").innerHTML = '<h4>' + t("rule_note_title") + '</h4><p>' + (getLang() === "zh" ? (D.specialRule || "") : t("special_rule")) + '</p>';
  }

  /* ===== 渲染：CALCULATOR ===== */
  function computeRate(a) {
    if (a > 350000) return { rate: 0.95, tierKey: "calc_tier4" };
    if (a > 200000) return { rate: 0.95, tierKey: "calc_tier3" };
    if (a >= 80000) return { rate: 0.98, tierKey: "calc_tier2" };
    return { rate: 1.00, tierKey: "calc_tier1" };
  }
  function updateCalc() {
    var amtInput = $("#orderAmount");
    var amtRange = $("#orderRange");
    var resultBox = $("#calcResult");
    var a = parseFloat(amtInput.value);
    if (isNaN(a) || a < 0) a = 0;
    amtRange.value = Math.min(a, 400000);
    var ro = computeRate(a);
    var rate = ro.rate, tierKey = ro.tierKey;
    var discounted = a * rate;
    var saved = a - discounted;
    var barPct = Math.min(100, (a / 400000) * 100);
    var rt = calcRateText(rate);
    resultBox.innerHTML =
      '<div class="r-tier">' + t("calc_tier_label") + '</div>' +
      '<div class="r-rate">' + rt.num + '<small>' + rt.suffix + '</small></div>' +
      '<div class="r-amount">' + t(tierKey) + '</div>' +
      '<div class="r-amount" style="margin-top:18px">' + t("calc_after") + '<b>' + yuan(Math.round(discounted)) + '</b></div>' +
      '<div class="r-amount">' + t("calc_saved") + '<b style="color:var(--ok)">' + yuan(Math.round(saved)) + '</b></div>' +
      '<div class="r-bar"><span style="width:' + barPct + '%"></span></div>' +
      '<div class="r-amount" style="font-size:12px;color:var(--ink-faint);margin-top:8px">' + t("calc_scale") + '</div>';
  }

  /* ===== 渲染：实时库存 ===== */
  function renderStock(s) {
    var grid = $("#stockGrid");
    var upd = $("#stockUpdated");
    var items = (s && s.items) || [];
    upd.textContent = t("stock_updated_prefix") + fmtStockTime(s && s.updatedAt);
    if (!items.length) { grid.innerHTML = '<p class="stock-empty">' + t("stock_empty") + '</p>'; return; }
    var famOrder = FAMILY_ORDER.filter(function (f) { return items.some(function (it) { return it.family === f; }); });
    grid.innerHTML = famOrder.map(function (f) {
      var famItems = items.filter(function (it) { return it.family === f; });
      var meta = D.familyMeta[f] || { name: f };
      return '<div class="stock-family"><div class="stock-family-name">' + escStock(meta.name || f) +
        ' <span>' + escStock(f) + '</span></div><div class="stock-items">' +
        famItems.map(function (it) {
          var out = it.qty === 0, low = it.qty > 0 && it.qty <= 5;
          return '<div class="stock-card reveal ' + (out ? "is-out" : low ? "is-low" : "") + '">' +
            '<span class="stock-dot" style="background:' + colorHex(it.color) + '" title="' + escStock(it.color) + '"></span>' +
            '<div class="stock-info"><div class="stock-color">' + escStock(colorName(it.color)) + '</div><div class="stock-plug">' + escStock(plugName(it.plug)) + '</div></div>' +
            '<div class="stock-qty">' + it.qty + '<small>' + t("unit") + '</small></div>' +
            '<div class="stock-status">' + (out ? t("status_out") : low ? t("status_low") : t("status_ok")) + '</div>' +
          '</div>';
        }).join("") + '</div></div>';
    }).join("");
    observeReveal();
  }
  async function loadStock() {
    var grid = $("#stockGrid");
    $("#stockUpdated").textContent = t("stock_updated_prefix") + "…";
    try {
      var r = await fetch("/api/stock", { cache: "no-store" });
      if (!r.ok) throw new Error("接口不可用");
      renderStock(await r.json());
    } catch (e) {
      grid.innerHTML = '<p class="stock-empty">' + t("stock_unavailable") + '</p>';
      $("#stockUpdated").textContent = t("stock_updated_prefix") + "—";
    }
  }

  /* ===== 渲染：退货台账概览 ===== */
  function renderReturns(sum) {
    var ov = $("#returnsOverview");
    var upd = $("#returnsUpdated");
    sum = sum || { updatedAt: null, overview: { totalReturns: 0, pendingReship: 0, shipped: 0, received: 0, recentReturns: 0 }, byModel: [], returns: [], reships: [] };
    var o = sum.overview || {};
    lastReturns = Array.isArray(sum.returns) ? sum.returns : [];
    lastReships = Array.isArray(sum.reships) ? sum.reships : [];
    upd.textContent = t("stock_updated_prefix") + fmtStockTime(sum.updatedAt);
    var cards = [
      { key: "all", n: o.totalReturns || 0, l: t("ov_all"), c: "var(--accent)" },
      { key: "recent7", n: o.recentReturns || 0, l: t("ov_recent7"), c: "var(--danger)" },
      { key: "pending", n: o.pendingReship || 0, l: t("ov_pending"), c: "var(--warn)" },
      { key: "shipped", n: o.shipped || 0, l: t("ov_shipped"), c: "var(--accent-2)" },
      { key: "received", n: o.received || 0, l: t("ov_received"), c: "var(--ok)" }
    ];
    ov.innerHTML = cards.map(function (c) {
      return '<div class="ov-card reveal ' + (c.key === activeFilter && activeFilter !== "all" ? "active" : "") + '" data-key="' + c.key + '" style="cursor:pointer">' +
        '<div class="ov-num" style="color:' + c.c + '">' + c.n + '</div><div class="ov-label">' + c.l + '</div></div>';
    }).join("");
    var rows = (sum.byModel || []).map(function (m) {
      return '<tr><td>' + escStock(familyName(m.family)) + ' <span class="mini-tag">' + escStock(m.family) + '</span></td>' +
        '<td class="num">' + m.returned + '</td><td class="num ok">' + m.reshiped + '</td><td class="num warn">' + m.pending + '</td></tr>';
    }).join("");
    $("#returnsModelTable").innerHTML =
      '<thead><tr><th>' + t("rtab_model") + '</th><th class="num">' + t("rtab_returned") + '</th><th class="num">' + t("rtab_reshiped") + '</th><th class="num">' + t("rtab_pending") + '</th></tr></thead>' +
      '<tbody>' + (rows || '<tr><td colspan="4" style="color:var(--ink-faint);text-align:center;padding:18px">' + t("returns_no_ledger") + '</td></tr>') + '</tbody>';
    renderSourceFilter();
    renderDetail();
    observeReveal();
  }
  function renderSourceFilter() {
    var box = $("#returnsSourceFilter");
    if (!box) return;
    var sources = [];
    lastReturns.forEach(function (r) {
      var s = r.source || "";
      if (s && sources.indexOf(s) === -1) sources.push(s);
    });
    var chips = ['<span class="flabel">' + t("filter_source") + '</span>'];
    chips.push('<button type="button" class="sbtn ' + (activeSource === "" ? "active" : "") + '" data-src="">' + t("filter_all") + '</button>');
    sources.forEach(function (s) {
      chips.push('<button type="button" class="sbtn ' + (activeSource === s ? "active" : "") + '" data-src="' + escStock(s) + '">' + escStock(s) + '</button>');
    });
    box.innerHTML = chips.join("");
    box.hidden = (sources.length === 0);
  }
  function renderDetail() {
    var titleEl = $("#detailTitle");
    var clearBtn = $("#detailClear");
    var table = $("#returnsDetailTable");
    var since7 = Date.now() - 7 * 24 * 3600 * 1000;
    var rows = [], title = "";
    if (activeFilter === "recent7") {
      rows = lastReturns.filter(function (r) {
        var tt = r.date ? new Date(r.date).getTime() : NaN; return !isNaN(tt) && tt >= since7;
      }).map(function (r) { return detailRow(r.date, r, t("status_return")); });
      title = t("returns_detail_recent7");
    } else if (activeFilter === "all") {
      rows = lastReturns.map(function (r) { return detailRow(r.date, r, t("status_return")); });
      title = t("returns_detail_all");
    } else {
      var map = { pending: "待补发", shipped: "已补发", received: "已收货" };
      rows = lastReships.filter(function (s) { return (s.status || "") === map[activeFilter]; })
        .map(function (s) { return detailRow(s.shipDate, s, statusText(s.status), s.supplier); });
      title = t("returns_detail_reship") + t("ov_" + activeFilter);
    }
    if (activeSource && (activeFilter === "all" || activeFilter === "recent7")) {
      rows = rows.filter(function (r) { return r.source === activeSource; });
      title += " · " + activeSource;
    }
    rows.sort(function (a, b) { return b._t - a._t; });
    titleEl.textContent = title + (rows.length ? "（" + rows.length + "）" : "（" + t("returns_no_data") + "）");
    if (clearBtn) clearBtn.hidden = (activeFilter === "all");
    if (!rows.length) {
      table.innerHTML = '<thead><tr><th>' + t("rtab_time") + '</th><th>' + t("rtab_model") + '</th><th>' + t("rtab_color") +
        '</th><th>' + t("rtab_plug") + '</th><th>' + t("rtab_volt") + '</th><th class="num">' + t("rtab_qty") +
        '</th><th>' + t("rtab_supplier") + '</th><th>' + t("rtab_source") + '</th><th>' + t("rtab_status") + '</th></tr></thead><tbody><tr><td colspan="9" style="color:var(--ink-faint);text-align:center;padding:18px">' + t("returns_no_data") + '</td></tr></tbody>';
      return;
    }
    var body = rows.map(function (r) {
      return '<tr><td>' + escStock(r.date) + '</td><td>' + escStock(familyName(r.family)) + '</td><td>' + escStock(colorName(r.color)) +
        '</td><td>' + escStock(plugName(r.plug)) + '</td><td>' + escStock(r.voltage) + '</td><td class="num">' + r.qty +
        '</td><td>' + escStock(r.supplier || "—") + '</td><td>' + escStock(r.source || "—") + '</td><td>' + escStock(r.statusLabel) + '</td></tr>';
    }).join("");
    table.innerHTML = '<thead><tr><th>' + t("rtab_time") + '</th><th>' + t("rtab_model") + '</th><th>' + t("rtab_color") +
      '</th><th>' + t("rtab_plug") + '</th><th>' + t("rtab_volt") + '</th><th class="num">' + t("rtab_qty") +
      '</th><th>' + t("rtab_supplier") + '</th><th>' + t("rtab_source") + '</th><th>' + t("rtab_status") + '</th></tr></thead><tbody>' + body + '</tbody>';
  }
  function detailRow(time, rec, statusLabel, supplier) {
    return {
      _t: time ? new Date(time).getTime() : 0, date: time || "—", family: rec.family || "", color: rec.color || "",
      plug: rec.plug || "", voltage: rec.voltage || "", qty: rec.qty || 0, supplier: supplier || "", source: rec.source || "", statusLabel: statusLabel || ""
    };
  }
  async function loadReturns() {
    var ov = $("#returnsOverview");
    $("#returnsUpdated").textContent = t("stock_updated_prefix") + "…";
    try {
      var r = await fetch("/api/returns", { cache: "no-store" });
      if (!r.ok) throw new Error("接口不可用");
      renderReturns(await r.json());
    } catch (e) {
      ov.innerHTML = '<p class="stock-empty">' + t("returns_empty_msg") + '</p>';
      $("#returnsUpdated").textContent = t("stock_updated_prefix") + "—";
    }
  }

  /* ===== 渲染：MODAL ===== */
  function openModal(k3) {
    var p = D.products.find(function (x) { return x.k3 === k3; });
    if (!p) return;
    var im = imgFor(p);
    var s = D.specs[p.family];
    var tierPills = Object.keys(p.tiers).length
      ? Object.keys(p.tiers).map(function (k) { return '<span class="tier-pill">' + k + '：<b>' + p.tiers[k].price + '</b>' + (p.tiers[k].special ? " " + t("price_special") : "") + '</span>'; }).join("")
      : '<span class="tier-pill">' + t("modal_no_tier") + '</span>';
    var specRows = "";
    if (s) {
      D.attrOrder.forEach(function (a) {
        var v = s[a.key];
        if (v === undefined || v === null || v === "") return;
        if (typeof v === "string" && v.indexOf("assets/") === 0) return;
        if (a.key === "机器颜色") v = translateColorsInText(v);
        if (a.key === "电源规格") v = translatePlugsInText(v);
        v = specValue(v);
        specRows += '<tr><td>' + specLabel(a.key) + '</td><td>' + v + '</td></tr>';
      });
    }
    var shipping = '<tr><td>' + t("modal_inner_box") + '</td><td>' + (p.innerBox || "—") + ' / ' + (p.innerWeight || "—") + '</td></tr>' +
      '<tr><td>' + t("modal_outer_box") + '</td><td>' + (p.outerBox || "—") + ' / ' + (p.outerWeight || "—") + '</td></tr>' +
      '<tr><td>' + t("modal_units_box") + '</td><td>' + (p.unitsPerBox == null ? "—" : p.unitsPerBox) + '</td></tr>';
    $("#modalBody").innerHTML =
      '<div class="modal-hero"><div class="modal-media">' + (im ? '<img src="' + im + '" alt="' + productName(p.name) + '">' : '<div style="color:var(--ink-faint);font-family:var(--font-display)">' + p.family + '</div>') + '</div>' +
      '<div class="modal-info"><h3>' + productName(p.name) + '</h3>' +
      '<div class="sub">' + (p.voltage ? p.voltage + " · " : "") + familyTag(p.family) + '</div>' +
      '<div class="meta-row"><span class="chip">K3 ' + p.k3 + '</span>' + (p.discontinued ? '<span class="chip" style="background:var(--ink-faint);color:#fff">' + t("modal_discontinued") + '</span>' : "") + '</div>' +
      (colorsOf(p.family).length ? '<div class="modal-colors"><span class="mc-label">' + t("modal_color_label") + '</span>' + colorsOf(p.family).map(function (c) { return '<span class="cdot lg" style="background:' + colorHex(c) + '" title="' + colorName(c) + '"></span>'; }).join("") + '<span class="mc-names">' + colorsOf(p.family).map(colorName).join(" / ") + '</span></div>' : "") +
      '<div class="modal-price"><div class="pt">' + t("modal_price_label") + '</div><div class="pv">' + yuan(p.basePrice) + '<small> /' + t("unit") + '</small></div><div class="tier-line">' + tierPills + '</div></div>' +
      '</div></div>' +
      '<div class="modal-spec-grid"><h4>' + t("modal_shipping_title") + '</h4><table>' + shipping + '</table>' +
      (specRows ? '<h4>' + familyName(p.family) + ' ' + t("modal_spec_title") + '</h4><table>' + specRows + '</table>' : '<p style="color:var(--ink-faint);font-size:13px">' + t("modal_no_spec") + '</p>') +
      '</div>';
    var modal = $("#modal");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    var modal = $("#modal");
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  /* ===== 一次性事件绑定（使用事件委托，支持语言切换重渲染） ===== */
  function initEvents() {
    var nav = $("#nav"), prog = $("#scrollProgress");
    function onScroll() {
      nav.classList.toggle("scrolled", window.scrollY > 30);
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    $("#navToggle").addEventListener("click", function () { $("#navLinks").classList.toggle("open"); });
    $$("#navLinks a").forEach(function (a) { a.addEventListener("click", function () { $("#navLinks").classList.remove("open"); }); });

    $("#filterFamily").addEventListener("click", function (e) {
      var b = e.target.closest(".fbtn"); if (!b) return;
      curFam = b.getAttribute("data-fam");
      $$("#filterFamily .fbtn").forEach(function (x) { x.classList.remove("active"); }); b.classList.add("active"); renderCatalog();
    });
    $("#filterVoltage").addEventListener("click", function (e) {
      var b = e.target.closest(".fbtn"); if (!b) return;
      curVol = b.getAttribute("data-vol");
      $$("#filterVoltage .fbtn").forEach(function (x) { x.classList.remove("active"); }); b.classList.add("active"); renderCatalog();
    });
    $("#filterColor").addEventListener("click", function (e) {
      var b = e.target.closest(".fbtn"); if (!b) return;
      curColor = b.getAttribute("data-color");
      $$("#filterColor .fbtn").forEach(function (x) { x.classList.remove("active"); }); b.classList.add("active"); renderCatalog();
    });
    $("#familyGrid").addEventListener("click", function (e) {
      var card = e.target.closest(".family-card"); if (!card) return;
      var f = card.getAttribute("data-family");
      curFam = f;
      renderFilters();
      renderCatalog();
      var cat = document.getElementById("catalog");
      if (cat) cat.scrollIntoView({ behavior: "smooth" });
    });
    $("#catalogGrid").addEventListener("click", function (e) {
      var chk = e.target.closest(".cmp-check");
      if (chk) {
        var cb = chk.querySelector('input[type="checkbox"]');
        toggleCompare(cb.getAttribute("data-cmp"), cb.checked, chk);
        return;
      }
      var c = e.target.closest(".product-card"); if (!c) return;
      location.href = "product-detail.html?k3=" + encodeURIComponent(c.getAttribute("data-k3"));
    });
    $("#returnsOverview").addEventListener("click", function (e) {
      var card = e.target.closest(".ov-card"); if (!card) return;
      var key = card.getAttribute("data-key");
      activeFilter = (activeFilter === key) ? "all" : key;
      $$("#returnsOverview .ov-card").forEach(function (c) { c.classList.toggle("active", c.getAttribute("data-key") === activeFilter && activeFilter !== "all"); });
      renderDetail();
    });
    var detailClearBtn = $("#detailClear");
    if (detailClearBtn) detailClearBtn.addEventListener("click", function () {
      activeFilter = "all";
      activeSource = "";
      $$("#returnsOverview .ov-card").forEach(function (c) { c.classList.remove("active"); });
      renderSourceFilter();
      renderDetail();
    });
    var srcFilter = $("#returnsSourceFilter");
    if (srcFilter) srcFilter.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest(".sbtn") : null; if (!btn) return;
      var src = btn.getAttribute("data-src");
      activeSource = (activeSource === src) ? "" : src;
      $$("#returnsSourceFilter .sbtn").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-src") === activeSource); });
      renderDetail();
    });
    var stockRefreshBtn = $("#stockRefresh"); if (stockRefreshBtn) stockRefreshBtn.addEventListener("click", loadStock);
    var returnsRefreshBtn = $("#returnsRefresh"); if (returnsRefreshBtn) returnsRefreshBtn.addEventListener("click", loadReturns);
    var cbChips = $("#cbChips");
    if (cbChips) cbChips.addEventListener("click", function (e) {
      var x = e.target.closest(".cb-chip-x"); if (!x) return;
      removeCompare(x.getAttribute("data-cmp"));
    });
    var cbClear = $("#cbClear"); if (cbClear) cbClear.addEventListener("click", function () {
      compareList = []; saveCompare(); renderCompareBar(); renderCatalog();
    });
    /* 机型详情弹窗已移除，点击产品卡片跳转 product-detail.html；报价计算器已迁至 calc.html */
  }

  /* ===== 总渲染（语言切换时重跑） ===== */
  function renderAll() {
    renderHero();
    renderFamilies();
    renderFilters();
    renderCatalog();
    loadStock();
    loadReturns();
    applyI18n();
    $$(".section-head").forEach(function (el) { el.classList.add("reveal"); });
    observeReveal();
    renderCompareBar();
  }

  /* ===== 机型对比：状态管理 ===== */
  function toggleCompare(k3, checked, labelEl) {
    var idx = compareList.indexOf(k3);
    if (checked) {
      if (compareList.length >= COMPARE_MAX && idx < 0) {
        if (labelEl) labelEl.querySelector('input[type="checkbox"]').checked = false;
        showCmpToast(t("compare_max"));
        return;
      }
      if (idx < 0) compareList.push(k3);
    } else if (idx >= 0) {
      compareList.splice(idx, 1);
    }
    saveCompare();
    renderCompareBar();
    if (labelEl) {
      var on = compareList.indexOf(k3) >= 0;
      labelEl.classList.toggle("checked", on);
      var span = labelEl.querySelector(".cmp-check-text");
      if (span) span.textContent = on ? t("compare_added") : t("compare_add");
    }
  }
  function removeCompare(k3) {
    var i = compareList.indexOf(k3);
    if (i >= 0) compareList.splice(i, 1);
    saveCompare();
    renderCompareBar();
    renderCatalog();
  }
  function renderCompareBar() {
    var bar = $("#compareBar"), chips = $("#cbChips"), count = $("#cbCount"), go = $("#cbGo");
    if (!bar) return;
    if (!compareList.length) { bar.hidden = true; return; }
    bar.hidden = false;
    count.textContent = compareList.length;
    chips.innerHTML = compareList.map(function (k3) {
      var p = (D.products || []).find(function (x) { return x.k3 === k3; });
      var name = p ? productName(p.name) : k3;
      return '<span class="cb-chip">' + name + '<button type="button" class="cb-chip-x" data-cmp="' + k3 + '" title="' + t("compare_remove") + '">✕</button></span>';
    }).join("");
    go.setAttribute("href", "compare.html?k3=" + encodeURIComponent(compareList.join(",")));
  }
  var cmpToastTimer = null;
  function showCmpToast(msg) {
    var bar = $("#compareBar"), toast = $("#cbToast");
    if (!bar || !toast) return;
    bar.hidden = false;
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(cmpToastTimer);
    cmpToastTimer = setTimeout(function () { toast.hidden = true; }, 2200);
  }

  function boot(data) {
    D = data;
    window.__D = D;
    if (!initDone) { initEvents(); initDone = true; }
    renderAll();
  }
  window.__rerender = renderAll;

  /* ===== 入口 ===== */
  (async function () {
    var gate = document.getElementById("gate");
    var form = document.getElementById("gateForm");
    var err = document.getElementById("gateErr");
    var status = document.getElementById("gateStatus");
    var uname = document.getElementById("gateUser");
    var pass = document.getElementById("gatePass");

    async function loadAndBoot() {
      try {
        var r = await fetch("/api/data", { cache: "no-store", credentials: "same-origin" });
        if (r.ok) { boot(await r.json()); return true; }
      } catch (e) { /* 无后端 → 回退 */ }
      return false;
    }
    function showGate() {
      gate.hidden = false;
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        err.style.display = "none";
        status.style.display = "block";
        status.textContent = t("gate_status");
        try {
          var lr = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ user: uname.value.trim(), pass: pass.value }) });
          if (lr.ok && (await loadAndBoot())) { gate.hidden = true; status.style.display = "none"; return; }
          err.textContent = t("gate_err");
        } catch (ex) { err.textContent = t("gate_err"); }
        err.style.display = "block";
        status.style.display = "none";
      });
    }

    if (await loadAndBoot()) return;
    if (window.PRODUCT_DATA) { boot(window.PRODUCT_DATA); return; }
    showGate();
  })();
})();
