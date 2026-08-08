/* ===== AUP 机型对比页 · 渲染 + 多语言 ===== */
(function () {
  "use strict";

  var $ = function (s, p) { return (p || document).querySelector(s); };
  var $$ = function (s, p) { return Array.prototype.slice.call((p || document).querySelectorAll(s)); };

  /* ===== 工具（复用 product-detail 逻辑） ===== */
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
  function voltTags(v) {
    var t2 = [];
    if ((v || "").indexOf("110") !== -1) t2.push("110V");
    if ((v || "").indexOf("220") !== -1) t2.push("220V");
    return t2.length ? t2 : [v || "—"];
  }

  /* ===== 状态 ===== */
  var D = null, K3LIST = [], onlyDiff = false, initDone = false;

  /* ===== 单元格渲染器 ===== */
  function mediaHtml(p) {
    var im = imgFor(p);
    return im
      ? '<img src="' + im + '" alt="' + productName(p.name) + '" class="cmp-media-img">'
      : '<div class="cmp-media-ph">' + p.family + '</div>';
  }
  function tierHtml(p) {
    var keys = Object.keys(p.tiers || {});
    if (!keys.length) return '<span class="muted">' + t("modal_no_tier") + '</span>';
    return '<div class="cmp-tiers">' + keys.map(function (k) {
      return '<span class="cmp-tier">' + k + ' <b>' + p.tiers[k].price + '</b>' + (p.tiers[k].special ? ' <small>' + t("price_special") + '</small>' : '') + '</span>';
    }).join("") + '</div>';
  }
  function headCell(p) {
    return '<div class="cmp-head-card">' +
      '<button class="cmp-remove" type="button" data-k3="' + p.k3 + '" title="' + t("compare_remove") + '" aria-label="' + t("compare_remove") + '">✕</button>' +
      '<div class="cmp-head-media">' + mediaHtml(p) + '</div>' +
      '<div class="cmp-head-name">' + productName(p.name) + '</div>' +
      '<a class="cmp-head-link" href="product-detail.html?k3=' + encodeURIComponent(p.k3) + '">' + t("compare_col_model") + ' →</a>' +
    '</div>';
  }

  /* ===== 行构建 ===== */
  function row(label, list, rawFn, htmlFn, skipDiff) {
    var raws = list.map(rawFn);
    var diff = skipDiff ? false : raws.some(function (r, i) { return i > 0 && r !== raws[0]; });
    return { label: label, cells: list.map(htmlFn), diff: diff };
  }
  function rowsFor(list) {
    var rows = [];
    rows.push(row(t("cmp_image"), list, function (p) { return imgFor(p) || p.family; }, mediaHtml, true));
    rows.push(row(t("cmp_name"), list, function (p) { return p.name; }, function (p) { return productName(p.name); }));
    rows.push(row(t("cmp_family"), list, function (p) { return p.family; }, function (p) { return familyTag(p.family); }));
    rows.push(row(t("cmp_k3"), list, function (p) { return p.k3; }, function (p) { return "K3 " + p.k3; }));
    rows.push(row(t("cmp_volt"), list, function (p) { return p.voltage; }, function (p) { return voltTags(p.voltage).join(" / "); }));
    rows.push(row(t("cmp_color"), list,
      function (p) { return colorsOf(p.family).join("|"); },
      function (p) { return colorDots(p.family) + '<span class="cmp-color-names">' + colorsOf(p.family).map(colorName).join(" / ") + '</span>'; }));
    rows.push(row(t("cmp_price"), list,
      function (p) { return String(p.basePrice); },
      function (p) { return yuan(p.basePrice) + '<small> /' + t("unit") + '</small>'; }));
    rows.push(row(t("cmp_tier"), list,
      function (p) { return JSON.stringify(p.tiers || {}); },
      tierHtml));
    /* 规格参数 */
    (D.attrOrder || []).forEach(function (a) {
      rows.push(row(specLabel(a.key), list,
        function (p) {
          var s = D.specs[p.family] || {};
          var v = s[a.key];
          if (v == null || v === "") return "—";
          if (a.key === "机器颜色") return translateColorsInText(v);
          if (a.key === "电源规格") return translatePlugsInText(v);
          return specValue(v);
        },
        function (p) {
          var s = D.specs[p.family] || {};
          var v = s[a.key];
          if (v == null || v === "") return "—";
          if (typeof v === "string" && v.indexOf("assets/") === 0) return "—";
          if (a.key === "机器颜色") v = translateColorsInText(v);
          if (a.key === "电源规格") v = translatePlugsInText(v);
          return specValue(v);
        }));
    });
    /* 装箱与物流 */
    rows.push(row(t("modal_inner_box"), list,
      function (p) { return (p.innerBox || "—") + "/" + (p.innerWeight || "—"); },
      function (p) { return (p.innerBox || "—") + " / " + (p.innerWeight || "—"); }));
    rows.push(row(t("modal_outer_box"), list,
      function (p) { return (p.outerBox || "—") + "/" + (p.outerWeight || "—"); },
      function (p) { return (p.outerBox || "—") + " / " + (p.outerWeight || "—"); }));
    rows.push(row(t("modal_units_box"), list,
      function (p) { return String(p.unitsPerBox == null ? "—" : p.unitsPerBox); },
      function (p) { return p.unitsPerBox == null ? "—" : p.unitsPerBox; }));
    return rows;
  }

  /* ===== 渲染 ===== */
  function renderCompare() {
    var body = $("#cmpBody");
    if (!body) return;
    var list = K3LIST.map(function (k3) { return (D.products || []).find(function (x) { return x.k3 === k3; }); }).filter(Boolean);
    if (!list.length) {
      body.innerHTML =
        '<div class="cmp-empty">' +
          '<h1 class="cmp-title" data-i18n="compare_title">机型对比</h1>' +
          '<p class="cmp-empty-msg">' + t("compare_empty") + '</p>' +
          '<a class="btn btn-primary" href="index.html#catalog" data-i18n="compare_back">返回机型列表</a>' +
        '</div>';
      applyI18n();
      return;
    }

    var rows = rowsFor(list);
    var maxHint = (list.length >= 4) ? '' :
      '<a class="btn btn-ghost sm cmp-add-more" href="index.html#catalog">' + t("compare_add_more") + '</a>';

    var html =
      '<div class="cmp-head-bar">' +
        '<a class="back-link" href="index.html#catalog" data-i18n="compare_back">← ' + t("compare_back") + '</a>' +
        '<h1 class="cmp-title" data-i18n="compare_title">机型对比</h1>' +
        '<div class="cmp-head-actions">' +
          '<label class="cmp-toggle"><input type="checkbox" id="cmpDiffOnly"' + (onlyDiff ? " checked" : "") + '> <span data-i18n="compare_only_diff">' + t("compare_only_diff") + '</span></label>' +
          maxHint +
        '</div>' +
      '</div>' +
      '<p class="cmp-hint" data-i18n="compare_diff_hint">' + t("compare_diff_hint") + '</p>' +
      '<div class="table-wrap cmp-scroll">' +
        '<table class="cmp-table' + (onlyDiff ? " diff-only" : "") + '">' +
          '<thead><tr><th class="cmp-corner"></th>' + list.map(headCell).map(function (h) { return '<th>' + h + '</th>'; }).join("") + '</tr></thead>' +
          '<tbody>' + rows.map(function (r) {
            return '<tr class="cmp-row' + (r.diff ? " diff" : "") + '"><th class="cmp-label">' + r.label + '</th>' +
              r.cells.map(function (c) { return '<td>' + c + '</td>'; }).join("") + '</tr>';
          }).join("") + '</tbody>' +
        '</table>' +
      '</div>';

    body.innerHTML = html;
    applyI18n();
    bindEvents();
  }

  function bindEvents() {
    $$("#cmpBody .cmp-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var k3 = btn.getAttribute("data-k3");
        K3LIST = K3LIST.filter(function (x) { return x !== k3; });
        syncUrl();
        renderCompare();
      });
    });
    var diffChk = $("#cmpDiffOnly");
    if (diffChk) diffChk.addEventListener("change", function () { onlyDiff = diffChk.checked; renderCompare(); });
  }
  function syncUrl() {
    var url = "compare.html" + (K3LIST.length ? "?k3=" + encodeURIComponent(K3LIST.join(",")) : "");
    try { history.replaceState(null, "", url); } catch (e) {}
  }

  /* ===== 入口 ===== */
  function boot(data) {
    D = data;
    window.__D = D;
    renderCompare();
    if (typeof window.buildLangSwitch === "function") window.buildLangSwitch();
    applyI18n();
  }
  window.__rerender = renderCompare;

  (async function () {
    var params = new URLSearchParams(location.search);
    var raw = params.get("k3");
    K3LIST = raw ? raw.split(",").map(function (s) { return s.trim(); }).filter(Boolean) : [];
    try {
      var r = await fetch("/api/data", { cache: "no-store", credentials: "same-origin" });
      if (r.ok) { boot(await r.json()); return; }
    } catch (e) { /* 无后端 → 回退 */ }
    if (window.PRODUCT_DATA) { boot(window.PRODUCT_DATA); return; }
    var b = $("#cmpBody");
    if (b) b.innerHTML = '<p class="stock-empty">' + t("stock_unavailable") + '</p>';
  })();
})();
