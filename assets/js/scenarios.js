/* ===== AUP 应用场景页 · 渲染 + 多语言 ===== */
(function () {
  "use strict";
  var $ = function (s, p) { return (p || document).querySelector(s); };
  var $$ = function (s, p) { return Array.prototype.slice.call((p || document).querySelectorAll(s)); };

  var D = window.PRODUCT_DATA;
  var FAMILY_ORDER = ["AUP-M2", "AUP-L", "AUP-L2", "AUP-L3"];
  var IMG_KEY = { "AUP-M2": "scenario-m2", "AUP-L": "scenario-l", "AUP-L2": "scenario-l2", "AUP-L3": "scenario-l3" };

  /* ===== 工具 ===== */
  function yuan(n) { return "¥" + Number(n).toLocaleString("zh-CN"); }
  var COLOR_HEX = { "红": "#e23b3b", "绿": "#2f9e57", "灰": "#9aa3ab", "蓝": "#2b6cb0", "紫": "#8b5cf6", "黄": "#ecc94b", "黑": "#23262b", "白": "#f4f4f4", "粉": "#ec4899", "橙": "#f0842e", "金": "#c9a24a", "银": "#c4c9ce" };
  function colorHex(name) { for (var k in COLOR_HEX) if (name.indexOf(k) !== -1) return COLOR_HEX[k]; return "#cbd5e0"; }
  function colorsOf(fam) { var s = D.specs[fam]; if (!s) return []; return (s["机器颜色"] || "").split(/[、,，/\s]+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function colorDots(fam) {
    var cs = colorsOf(fam);
    if (!cs.length) return "";
    return '<span class="color-dots">' + cs.map(function (c) { return '<i class="cdot" style="background:' + colorHex(c) + '" title="' + c + '"></i>'; }).join("") + "</span>";
  }
  function imgFor(p) { if (p.image) return p.image; var s = D.specs[p.family]; return s && s._image ? s._image : null; }
  function familyName(f) { return (D.familyMeta[f] || {}).name || f; }
  function familyTag(f) { return (D.familyMeta[f] || {}).tag || ""; }
  function familySize(f) { return (D.familyMeta[f] || {}).size || ""; }
  function productName(n) { return (n || "").replace(/\s*[\(（][^\)）]*[\)）]\s*$/, ""); }

  /* ===== 应用场景文案（中文，与产品数据一致） ===== */
  var SCENARIOS = {
    "AUP-M2": [
      { icon: "🏠", title: "家居 DIY 烫画", desc: "在客厅、书房桌面用迷你压烫机给 T 恤、帆布袋烫印个性图案，享受手工乐趣。" },
      { icon: "🎨", title: "手工工作室", desc: "手作博主、小批量定制礼品，迷你机身不占空间，随手创作。" },
      { icon: "🛍️", title: "便携出摊", desc: "市集、展会上随身携带，现场为顾客烫印姓名与图案，即时交付。" }
    ],
    "AUP-L": [
      { icon: "👕", title: "服饰定制店", desc: "裁缝店、潮牌工作室用 9 寸压烫机为 T 恤、卫衣、帽子烫印图案与 logo。" },
      { icon: "🎁", title: "礼品定制", desc: "企业团建、活动纪念 T 恤与帆布包个性化定制，一件起做。" },
      { icon: "📦", title: "网店一件代发", desc: "电商卖家小批量多款印花，灵活响应订单。" }
    ],
    "AUP-L2": [
      { icon: "🏭", title: "服装工厂批量生产", desc: "大版面一体机壳，流水线批量压烫成衣，效率高、温度均匀。" },
      { icon: "🚚", title: "电商大货印花", desc: "促销季大批量 T 恤 / 卫衣统一印花，稳定出货。" },
      { icon: "👥", title: "团队制服", desc: "企业、球队、社团大批量统一烫印 logo 与号码。" }
    ],
    "AUP-L3": [
      { icon: "🧢", title: "帽子精细烫印", desc: "细长发热板精准压烫帽檐、帽侧，个性化帽品定制。" },
      { icon: "👔", title: "袖标 / 裤脚改衣", desc: "袖口、裤脚、衣领等小面积位置烫印标识与号码。" },
      { icon: "✂️", title: "裁缝店个性化", desc: "裁缝铺为顾客改衣同时加印姓名 / 图案，提升附加值。" }
    ]
  };

  /* ===== 渲染 ===== */
  function render() {
    var body = $("#scenarioBody");
    if (!body) return;
    var params = new URLSearchParams(location.search);
    var fam = params.get("family");
    if (!fam || !D.familyMeta[fam]) {
      body.innerHTML = '<div class="sc-missing"><a class="back-link" href="index.html#families">← ' + t("back_to_families") + '</a><p>' + t("detail_missing") + '</p></div>';
      applyI18n();
      return;
    }
    var m = D.familyMeta[fam];
    var list = D.products.filter(function (p) { return p.family === fam; });
    var scs = SCENARIOS[fam] || [];
    var scCards = scs.map(function (x) {
      return '<article class="sc-card reveal"><div class="sc-card-icon">' + x.icon + '</div><h3>' + x.title + '</h3><p>' + x.desc + '</p></article>';
    }).join("");
    var modelCards = list.map(function (p) {
      var im = imgFor(p);
      var media = im ? '<img src="' + im + '" alt="' + productName(p.name) + '">' : '<div class="sc-model-ph">' + p.family + '</div>';
      return '<a class="sc-model reveal" href="product-detail.html?k3=' + encodeURIComponent(p.k3) + '">' +
        '<div class="sc-model-media">' + media + '</div>' +
        '<div class="sc-model-name">' + productName(p.name) + '</div>' +
        '<div class="sc-model-k3">K3 · ' + p.k3 + '</div>' +
        '<div class="sc-model-foot"><span class="price-val">' + yuan(p.basePrice) + '</span><span class="sc-model-go">' + t("fam_view_detail") + ' →</span></div>' +
        '</a>';
    }).join("");

    body.innerHTML =
      '<a class="back-link" href="index.html#families">← ' + t("back_to_families") + '</a>' +
      '<section class="sc-hero">' +
        '<div class="sc-hero-copy">' +
          '<span class="sc-kicker">' + m.tag + '</span>' +
          '<h1 class="sc-title">' + m.name + '</h1>' +
          '<div class="sc-chips"><span class="chip hot">' + m.size + '</span><span class="chip">110/220V</span>' + colorDots(fam) + '</div>' +
          '<a class="btn btn-primary" href="calc.html">' + t("nav_cta") + ' →</a>' +
        '</div>' +
        '<div class="sc-hero-media"><img src="assets/img/' + IMG_KEY[fam] + '.png?v=20260902" alt="' + m.name + ' 应用场景"></div>' +
      '</section>' +
      '<section class="sc-section">' +
        '<div class="section-head"><span class="kicker">APPLICATION SCENARIOS</span><h2>' + t("scenarios_title") + '</h2><p>' + t("scenarios_hint") + '</p></div>' +
        '<div class="sc-grid">' + scCards + '</div>' +
      '</section>' +
      '<section class="sc-section">' +
        '<div class="section-head"><span class="kicker">MODELS</span><h2>' + t("series_models_title") + '</h2><p>' + t("series_models_hint") + '</p></div>' +
        '<div class="sc-models">' + modelCards + '</div>' +
      '</section>';

    applyI18n();
    observeReveal();
  }

  /* ===== reveal 动画 ===== */
  function observeReveal() {
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$(".reveal:not(.in)").forEach(function (el) { io.observe(el); });
  }

  /* ===== 移动端菜单 + 滚动进度 ===== */
  function initUI() {
    var nav = $("#nav"), prog = $("#scrollProgress");
    var progH = function () {
      if (!prog) return;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", function () {
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 10);
      progH();
    }, { passive: true });
    progH();
    var tg = $("#navToggle"), links = $("#navLinks");
    if (tg && links) tg.addEventListener("click", function () { links.classList.toggle("open"); tg.classList.toggle("open"); });
    if (links) $$("a", links).forEach(function (a) { a.addEventListener("click", function () { links.classList.remove("open"); tg.classList.remove("open"); }); });
  }

  window.__rerender = render;
  document.addEventListener("DOMContentLoaded", function () {
    initUI();
    if (window.applyI18n) applyI18n();
    render();
  });
})();
