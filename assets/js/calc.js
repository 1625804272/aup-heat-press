/* ===== AUP 报价计算器独立页 · 纯前端 ===== */
(function () {
  "use strict";
  var $ = function (s, p) { return (p || document).querySelector(s); };

  function yuan(n) { return "¥" + Number(n).toLocaleString("zh-CN"); }
  function calcRateText(rate) {
    var l = getLang();
    if (l === "zh") { return { num: String(Math.round(rate * 100)), suffix: " 折" }; }
    return { num: String(Math.round((1 - rate) * 100)), suffix: "%" };
  }
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
    if (!amtInput || !resultBox) return;
    var a = parseFloat(amtInput.value);
    if (isNaN(a) || a < 0) a = 0;
    if (amtRange) amtRange.value = Math.min(a, 400000);
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

  function boot() {
    updateCalc();
    if (typeof window.buildLangSwitch === "function") window.buildLangSwitch();
    applyI18n();
  }
  window.__rerender = function () { updateCalc(); applyI18n(); };

  var amtInput = $("#orderAmount");
  var amtRange = $("#orderRange");
  if (amtInput) amtInput.addEventListener("input", updateCalc);
  if (amtRange) amtRange.addEventListener("input", function () { if (amtInput) amtInput.value = amtRange.value; updateCalc(); });
  boot();
})();
