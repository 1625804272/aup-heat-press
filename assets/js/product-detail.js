/* ===== AUP 机型详情页 · 渲染 + 多语言 ===== */
(function () {
  "use strict";

  var $ = function (s, p) { return (p || document).querySelector(s); };
  var $$ = function (s, p) { return Array.prototype.slice.call((p || document).querySelectorAll(s)); };

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
    }).join("") + '</span>';
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

  var D = null, FAM = null, K3 = null, initDone = false;

  function specRowsFor(p) {
    var s = D.specs[p.family] || {};
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
    return rows;
  }

  function revealObserve() {
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$(".reveal:not(.in)").forEach(function (el) { io.observe(el); });
  }

  function renderDetail() {
    var body = $("#pdBody");
    if (!body) return;
    if (FAM && D.specs[FAM]) { renderSeries(FAM); return; }
    if (K3) { renderVariant(K3); return; }
    body.innerHTML = '<p class="stock-empty">' + t("detail_missing") + '</p>';
  }

  function renderVariant(k3) {
    var body = $("#pdBody");
    var p = (D.products || []).find(function (x) { return x.k3 === k3; });
    if (!p) { body.innerHTML = '<p class="stock-empty">' + t("detail_missing") + '</p>'; return; }

    var im = imgFor(p);
    var tierKeys = Object.keys(p.tiers || {});
    var tierPills = tierKeys.length
      ? tierKeys.map(function (k) {
          return '<span class="tier-pill">' + k + '：<b>' + p.tiers[k].price + '</b>' + (p.tiers[k].special ? ' ' + t("price_special") : '') + '</span>';
        }).join("")
      : '<span class="tier-pill">' + t("modal_no_tier") + '</span>';

    var specRows = specRowsFor(p);
    var priceHead = '<thead><tr><th>' + t("price_tier_range") + '</th><th>' + t("cat_price_label") + '</th><th>' + t("cat_standard") + '</th></tr></thead>';
    var priceBody = tierKeys.length
      ? '<tbody>' + tierKeys.map(function (k) {
          var c = p.tiers[k];
          return '<tr><td>' + k + '</td><td class="special">' + c.price + (c.special ? ' <small>' + t("price_special") + '</small>' : '') + '</td><td>' + (c.special ? t("price_special") : t("cat_standard")) + '</td></tr>';
        }).join("") + '</tbody>'
      : '<tbody><tr><td colspan="3" class="muted">' + t("price_muted") + '</td></tr></tbody>';

    var shipping = '<tr><td>' + t("modal_inner_box") + '</td><td>' + (p.innerBox || "—") + ' / ' + (p.innerWeight || "—") + '</td></tr>' +
      '<tr><td>' + t("modal_outer_box") + '</td><td>' + (p.outerBox || "—") + ' / ' + (p.outerWeight || "—") + '</td></tr>' +
      '<tr><td>' + t("modal_units_box") + '</td><td>' + (p.unitsPerBox == null ? "—" : p.unitsPerBox) + '</td></tr>';

    var media = im
      ? '<img src="' + im + '" alt="' + productName(p.name) + '">'
      : '<div class="pd-media-ph">' + p.family + '</div>';

    body.innerHTML =
      '<a class="back-link" href="product-detail.html?family=' + encodeURIComponent(p.family) + '">← ' + familyName(p.family) + '</a>' +
      '<article class="pd-card reveal">' +
        '<div class="pd-media">' + media + '</div>' +
        '<div class="pd-info">' +
          '<h1 class="pd-name">' + productName(p.name) + '</h1>' +
          '<div class="pd-sub">' + (p.voltage ? p.voltage + ' · ' : '') + familyTag(p.family) + '</div>' +
          '<div class="meta-row"><span class="chip">K3 ' + p.k3 + '</span>' + (p.discontinued ? '<span class="chip" style="background:var(--ink-faint);color:#fff">' + t("modal_discontinued") + '</span>' : '') + '</div>' +
          (colorsOf(p.family).length ? '<div class="pd-colors"><span class="mc-label" data-i18n="modal_color_label">颜色</span>' + colorDots(p.family) + '<span class="mc-names">' + colorsOf(p.family).map(colorName).join(" / ") + '</span></div>' : '') +
          '<div class="pd-price"><div class="pt" data-i18n="cat_price_label">散单结算价</div><div class="pv">' + yuan(p.basePrice) + '<small> /' + t("unit") + '</small></div><div class="tier-line">' + tierPills + '</div></div>' +
        '</div>' +
      '</article>' +
      '<section class="pd-section"><h2 data-i18n="nav_specs">规格参数</h2><div class="table-wrap"><table class="spec-table">' + (specRows ? '<tbody>' + specRows + '</tbody>' : '<tbody><tr><td>' + t("modal_no_spec") + '</td></tr></tbody>') + '</table></div></section>' +
      '<section class="pd-section"><h2 data-i18n="nav_pricing">结算价</h2><div class="table-wrap"><table class="price-table">' + priceHead + priceBody + '</table></div></section>' +
      '<section class="pd-section"><h2 data-i18n="modal_shipping_title">装箱与物流</h2><div class="table-wrap"><table class="spec-table"><tbody>' + shipping + '</tbody></table></div></section>';

    applyI18n();
    revealObserve();
  }

  function renderSeries(fam) {
    var body = $("#pdBody");
    var s = D.specs[fam] || {};
    var m = D.familyMeta[fam] || { name: fam, tag: "" };
    var variants = (D.products || []).filter(function (p) { return p.family === fam; });
    var skuCount = variants.length;

    var specRows = "";
    D.attrOrder.forEach(function (a) {
      var v = s[a.key];
      if (v === undefined || v === null || v === "") return;
      if (typeof v === "string" && v.indexOf("assets/") === 0) return;
      if (a.key === "机器颜色") v = translateColorsInText(v);
      if (a.key === "电源规格") v = translatePlugsInText(v);
      v = specValue(v);
      specRows += '<tr><th>' + specLabel(a.key) + '</th><td>' + v + '</td></tr>';
    });

    var media = s._image ? '<img src="' + s._image + '" alt="' + familyName(fam) + '">' : '<div class="pd-media-ph">' + fam + '</div>';

    var chips = (familySize(fam) ? '<span class="chip">' + familySize(fam) + '</span>' : "") +
      '<span class="chip">' + skuCount + ' ' + t("fam_model_unit") + '</span>' +
      '<span class="chip">110/220V</span>';

    var variantsHtml = variants.map(function (p) {
      var im = imgFor(p);
      return '<a class="series-variant" href="product-detail.html?k3=' + encodeURIComponent(p.k3) + '">' +
        '<div class="sv-media">' + (im ? '<img src="' + im + '" alt="' + productName(p.name) + '">' : '<div class="pd-media-ph">' + fam + '</div>') + '</div>' +
        '<div class="sv-body">' +
          '<div class="sv-name">' + productName(p.name) + '</div>' +
          '<div class="sv-meta">' + (p.voltage ? p.voltage + ' · ' : '') + colorDots(fam) + '</div>' +
          '<div class="sv-price">' + yuan(p.basePrice) + '<small> /' + t("unit") + '</small></div>' +
          '<span class="sv-go">' + t("fam_view_detail") + '</span>' +
        '</div>' +
      '</a>';
    }).join("");

    body.innerHTML =
      '<a class="back-link" href="index.html#families">' + t("back_to_families") + '</a>' +
      '<article class="pd-card reveal series-card">' +
        '<div class="pd-media">' + media + '</div>' +
        '<div class="pd-info">' +
          '<h1 class="pd-name">' + familyName(fam) + '</h1>' +
          '<div class="pd-sub">' + (m.tag || familyTag(fam)) + '</div>' +
          '<div class="meta-row">' + chips + colorDots(fam) + '</div>' +
        '</div>' +
      '</article>' +
      '<section class="pd-section"><h2 data-i18n="nav_specs">规格参数</h2><div class="table-wrap"><table class="spec-table"><tbody>' + (specRows ? specRows : '<tr><td>' + t("modal_no_spec") + '</td></tr>') + '</tbody></table></div></section>' +
      '<section class="pd-section"><h2 data-i18n="series_models_title">机型列表</h2>' +
        '<p class="pd-section-hint" data-i18n="series_models_hint">' + t("series_models_hint") + '</p>' +
        '<div class="series-variants">' + variantsHtml + '</div>' +
      '</section>';

    applyI18n();
    revealObserve();
  }

  function boot(data) {
    D = data;
    window.__D = D;
    renderDetail();
    if (typeof window.buildLangSwitch === "function") window.buildLangSwitch();
    applyI18n();
  }
  window.__rerender = renderDetail;

  (async function () {
    var params = new URLSearchParams(location.search);
    FAM = params.get("family");
    K3 = params.get("k3");
    try {
      var r = await fetch("/api/data", { cache: "no-store", credentials: "same-origin" });
      if (r.ok) { boot(await r.json()); return; }
    } catch (e) { /* 无后端 → 回退 */ }
    if (window.PRODUCT_DATA) { boot(window.PRODUCT_DATA); return; }
    var b = $("#pdBody");
    if (b) b.innerHTML = '<p class="stock-empty">' + t("stock_unavailable") + '</p>';
  })();
})();
