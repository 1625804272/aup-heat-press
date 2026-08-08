/* ===== AUP 特采规则独立页 · 渲染 + 多语言 ===== */
(function () {
  "use strict";
  var $ = function (s, p) { return (p || document).querySelector(s); };

  var D = null;

  function renderRules() {
    var tiers = [
      { range: "rule_range1", desc: "rule_desc1", featured: false },
      { range: "rule_range2", desc: "rule_desc2", featured: true },
      { range: "rule_range3", desc: "rule_desc3", featured: false },
      { range: "rule_range4", desc: "rule_desc4", featured: false }
    ];
    var cards = $("#ruleCards");
    if (cards) {
      cards.innerHTML = tiers.map(function (tt) {
        return '<div class="rule-card reveal ' + (tt.featured ? "featured" : "") + '">' +
          '<div class="tier">' + t(tt.range) + '</div>' +
          '<div class="rate">' + Math.round([1.0, 0.98, 0.95, 0.95][tiers.indexOf(tt)] * 100) + '<small>%</small></div>' +
          '<div class="desc">' + t(tt.desc) + '</div>' +
        '</div>';
      }).join("");
    }
    var note = $("#ruleNote");
    if (note) {
      note.innerHTML = '<h4>' + t("rule_note_title") + '</h4><p>' + (getLang() === "zh" ? (D.specialRule || "") : t("special_rule")) + '</p>';
    }
  }

  function boot(data) {
    D = data;
    window.__D = D;
    renderRules();
    if (typeof window.buildLangSwitch === "function") window.buildLangSwitch();
    applyI18n();
  }
  window.__rerender = renderRules;

  (async function () {
    try {
      var r = await fetch("/api/data", { cache: "no-store", credentials: "same-origin" });
      if (r.ok) { boot(await r.json()); return; }
    } catch (e) { /* 无后端 → 回退 */ }
    if (window.PRODUCT_DATA) { boot(window.PRODUCT_DATA); return; }
    var c = $("#ruleCards");
    if (c) c.innerHTML = '<p class="stock-empty">' + t("stock_unavailable") + '</p>';
  })();
})();
