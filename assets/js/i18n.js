/* ===== AUP 多语言 (zh / en / ru / es) ===== */
(function () {
  "use strict";

  var LANGS = ["zh", "en", "ru", "es"];
  var LANG_META = {
    zh: { code: "zh-CN", short: "中" },
    en: { code: "en", short: "EN" },
    ru: { code: "ru", short: "РУ" },
    es: { code: "es", short: "ES" }
  };

  var I18N = {
    zh: {
      doc_title: "AUP 熨斗机 · 2026 产品与结算价手册",
      nav_products: "产品系列",
      nav_catalog: "全部机型",
      nav_specs: "规格参数",
      nav_pricing: "结算价",
      nav_rules: "特采规则",
      nav_calc: "报价计算器",
      nav_stock: "实时库存",
      nav_returns: "退货台账",
      nav_cta: "获取报价",

      hero_eyebrow: "2026 产品手册 · 业务技术专用",
      hero_title_accent: "精准压烫，从一块发热板开始",
      hero_sub: "面向热转印、白墨、服饰定制等场景的迷你 / 台式压烫机系列。双电压、多国认证、特氟龙纯铝发热板，覆盖从家居烫画到批量生产的全需求。",
      hero_btn_catalog: "浏览全部机型",
      hero_btn_calc: "结算价测算 →",
      hero_stat_families: "产品系列",
      hero_stat_sku: "在售机型",
      hero_stat_volt: "双电压",
      hero_stat_cert: "国际认证",

      fam_h2: "四大产品系列",
      fam_p: "从 2.5 寸迷你到 12 寸台式，按发热板尺寸与用途划分，总有一款适配你的压烫场景。",
      fam_model_unit: "款机型",
      fam_view_spec: "查看规格参数",

      cat_h2: "全部机型",
      cat_p: "全部机型，含 K3 代码、电压、散单结算价与装箱数据。点击卡片查看完整规格与阶梯报价。",
      cat_standard: "标准价",
      cat_special: "阶梯特价",
      cat_price_label: "散单结算价",
      cat_soldout: "已下架",
      filter_nomatch: "无匹配机型。",

      stock_h2: "实时库存",
      stock_p: "常备库存实时查询。数据由后台更新，下方显示最近更新时间。",
      stock_updated_prefix: "更新时间：",
      stock_refresh: "↻ 刷新",
      stock_empty: "暂无库存数据。",
      stock_unavailable: "库存数据需连接本地管理后台（node server.js）后查看；当前未连接库存服务。",
      stock_note_none: "",
      status_ok: "充足",
      status_low: "紧张",
      status_out: "缺货",
      unit: "台",

      returns_h2: "退货台账",
      returns_p: "退货与供应商补发台账概览（公开聚合）。型号、颜色、插头、电压、补发明细与登记请在后台「退货管理」中维护。",
      returns_refresh: "↻ 刷新",
      returns_clear: "✕ 清除筛选",
      returns_detail_all: "退货明细 · 全部",
      returns_detail_recent7: "退货明细 · 近7天",
      returns_detail_reship: "补发明细 · ",
      returns_no_data: "暂无对应数据",
      returns_no_ledger: "暂无退货台账数据",
      returns_empty_msg: "退货台账需连接本地管理后台（node server.js）后查看；当前未连接服务。",
      ov_all: "退货总台数",
      ov_recent7: "近7天退货",
      ov_pending: "待补发",
      ov_shipped: "已补发",
      ov_received: "已收货",
      rtab_time: "时间",
      rtab_model: "型号",
      rtab_color: "颜色",
      rtab_plug: "插头",
      rtab_volt: "电压",
      rtab_qty: "数量",
      rtab_supplier: "供应商",
      rtab_status: "状态",
      rtab_source: "来源",
      rtab_returned: "退货台数",
      rtab_reshiped: "已补发",
      rtab_pending: "待补发",
      status_return: "退货",
      status_pending: "待补发",
      status_shipped: "已补发",
      status_received: "已收货",

      specs_h2: "规格参数",
      specs_p: "切换系列查看完整技术规格，含尺寸、功率、温控、认证与包装清单。",

      pricing_h2: "2026 结算价表",
      pricing_p: "散单结算价与阶梯报价（单位：元 / 台）。标注「特」为特价机型；无阶梯报价的机型按散单结算价执行。",
      price_model: "机型",
      price_volt: "电压",
      price_k3: "K3 代码",
      price_base: "散单结算价",
      price_perbox: "台/箱",
      price_special: "特",
      price_tier_range: "数量区间",
      price_muted: "—",

      rules_h2: "特采折扣规则",
      rules_p: "按部门下单，以单笔销售订单金额（含港杂运费）核算折扣。多部门拼货时，港杂运费按各部门金额比例分摊。",
      rule_featured: "推荐",
      rule_range1: "≤ 8万",
      rule_range2: "8万 – 20万",
      rule_range3: "20万 – 35万",
      rule_range4: "35万以上",
      rule_desc1: "散货档 · 按常规结算价执行",
      rule_desc2: "整笔订单享 98 折",
      rule_desc3: "整笔订单享 95 折",
      rule_desc4: "95 折封顶 · 可洽谈更优",
      rule_note_title: "特采规则说明（原文）",

      calc_h2: "特采报价计算器",
      calc_p: "输入单笔订单金额，自动匹配适用折扣率与折后参考金额。",
      calc_label: "单笔订单金额（元）",
      calc_hint: "提示：金额按「含港杂运费」的整笔订单核算；多部门拼货时运费按比例分摊，不可集中计入某一部门以套取折扣。",
      calc_tier_label: "适用档位",
      calc_tier1: "≤ 8万 · 散货（常规结算价）",
      calc_tier2: "8万 – 20万 · 98 折",
      calc_tier3: "20万 – 35万 · 95 折",
      calc_tier4: "35万以上 · 95 折封顶（可洽谈）",
      calc_after: "折后参考金额：",
      calc_saved: "预计节省：",
      calc_scale: "订单规模示意（0 – 40万）",

      footer_brand: "AUP 熨斗机",
      footer_sub: "热转印压烫设备 · 产品与结算价手册",
      footer_src: "数据来源：2026熨斗结算价（2026.7.22）业务技术专用。本页价格为业务参考，最终以正式合同为准。",
      footer_admin: "后台管理",

      gate_badge: "AUP · 内部资料",
      gate_title: "登录访问",
      gate_sub: "本站点为保密内容，请输入账号密码",
      gate_err: "账号或密码错误，请重试",
      gate_user: "账号",
      gate_pass: "密码",
      gate_btn: "登 录",
      gate_status: "正在解密…",

      filter_series: "系列",
      filter_volt: "电压",
      filter_color: "颜色",
      filter_all: "全部",
      filter_source: "退货来源",
      modal_price_label: "散单结算价",
      modal_color_label: "颜色",
      modal_no_tier: "无阶梯价 · 按散单结算价",
      modal_shipping_title: "装箱与物流",
      modal_spec_title: "技术规格",
      modal_inner_box: "内箱规 / 重",
      modal_outer_box: "外箱规 / 重",
      modal_units_box: "台 / 箱",
      modal_no_spec: "该机型暂无详细规格数据。",
      modal_discontinued: "已下架",

      hero_brand: "AUP 熨斗机",
      hero_stat_cert_value: "4 项",
      meta_description: "AUP 系列熨斗机（热转印压烫机）产品展示、技术规格与 2026 结算价查询。",
      aria_brand_home: "AUP 首页",
      aria_menu: "菜单",
      aria_scroll_down: "向下滚动",
      aria_close: "关闭",
      calc_placeholder: "例如 120000",
      gate_user_placeholder: "请输入账号",
      gate_pass_placeholder: "请输入密码",
      admin_title: "后台管理",
      table_note: "注：结算价为业务技术参考价，最终以合同与特采规则为准。陶瓷杯等不参与折扣，特殊结算价与特采价不可叠加。",
      range_80k: "8万",
      range_200k: "20万",
      range_350k: "35万",
      range_400k: "40万+",

      /* ===== 机型对比 ===== */
      compare_bar: "机型对比",
      compare_add: "加入对比",
      compare_added: "已加入",
      compare_remove: "移除",
      compare_go: "去对比",
      compare_clear: "清空",
      compare_empty: "请先在「全部机型」勾选要对比的机型",
      compare_max: "最多对比 4 个机型",
      compare_title: "机型对比",
      compare_only_diff: "仅显示差异",
      compare_back: "返回机型列表",
      compare_add_more: "继续添加机型",
      compare_col_model: "机型",
      compare_diff_hint: "高亮行为各机型存在差异的项目",
      compare_no_data: "未选择任何机型",
      special_rule: "     特采规则:按部门分为热转印，耗材一部，白墨二部，衣服三部。根据部门下单，单笔销售订单金额算，包含港杂运费。\n8万（含8万）以下统称为散货，按常规结算价，8万到20万（含20万）按0.98结算价，20万到35万（含35万）按0.95结算价。多部门拼货，港杂运费按部门金额比例分摊。\n    举例：一个柜子合计总金额40.5万，其中热转印只有7万，耗材一部有9万，白墨有21万，衣服三部有2万，港杂运费1.5万。\n业务员想把收到的港杂运费1.5万算在热转印上就可以享受0.98折扣，这个是不允许的，港杂运费按部门金额比例分摊。\n    注意：陶瓷杯不参与折扣优惠，但是有计入部门金额。特殊结算价（如熨斗）与特采价不能同时折扣。"
    },

    en: {
      doc_title: "AUP Iron · 2026 Product & Price Manual",
      nav_products: "Product Lines",
      nav_catalog: "All Models",
      nav_specs: "Specifications",
      nav_pricing: "Prices",
      nav_rules: "Volume Discount",
      nav_calc: "Quote Calculator",
      nav_stock: "Live Stock",
      nav_returns: "Returns Ledger",
      nav_cta: "Get a Quote",

      hero_eyebrow: "2026 Catalog · Sales & Technical",
      hero_title_accent: "Precision pressing, from one heating plate",
      hero_sub: "A mini / desktop heat-press series for sublimation, DTF and apparel customization. Dual voltage, multi-certification, PTFE pure-aluminum heating plates — from home heat-transfer to mass production.",
      hero_btn_catalog: "Browse all models",
      hero_btn_calc: "Price estimate →",
      hero_stat_families: "Product lines",
      hero_stat_sku: "Models",
      hero_stat_volt: "Dual voltage",
      hero_stat_cert: "Certifications",

      fam_h2: "Four Product Lines",
      fam_p: "From 2.5-inch mini to 12-inch desktop, grouped by heating-plate size and use — there is a fit for every pressing scenario.",
      fam_model_unit: "models",
      fam_view_spec: "View specifications",

      cat_h2: "All Models",
      cat_p: "Every model with K3 code, voltage, unit settlement price and box data. Click a card for full specs and tiered pricing.",
      cat_standard: "Standard",
      cat_special: "Tiered special",
      cat_price_label: "Unit price",
      cat_soldout: "Discontinued",
      filter_nomatch: "No matching models.",

      stock_h2: "Live Stock",
      stock_p: "Real-time query of standing inventory. Data is updated from the admin backend; the last update time is shown below.",
      stock_updated_prefix: "Updated: ",
      stock_refresh: "↻ Refresh",
      stock_empty: "No stock data yet.",
      stock_unavailable: "Stock data requires the local admin server (node server.js); not connected.",
      stock_note_none: "",
      status_ok: "In stock",
      status_low: "Low",
      status_out: "Out of stock",
      unit: "pcs",

      returns_h2: "Returns Ledger",
      returns_p: "Overview of returns and supplier reships (public aggregate). Model, color, plug, voltage, reship details and registration are managed in the admin «Returns» tab.",
      returns_refresh: "↻ Refresh",
      returns_clear: "✕ Clear filter",
      returns_detail_all: "Return details · All",
      returns_detail_recent7: "Return details · Last 7 days",
      returns_detail_reship: "Reship details · ",
      returns_no_data: "No matching data",
      returns_no_ledger: "No returns data yet",
      returns_empty_msg: "Returns ledger requires the local admin server (node server.js); not connected.",
      ov_all: "Total returns",
      ov_recent7: "Last 7 days",
      ov_pending: "Pending reship",
      ov_shipped: "Reshipped",
      ov_received: "Received",
      rtab_time: "Time",
      rtab_model: "Model",
      rtab_color: "Color",
      rtab_plug: "Plug",
      rtab_volt: "Voltage",
      rtab_qty: "Qty",
      rtab_supplier: "Supplier",
      rtab_status: "Status",
      rtab_source: "Source",
      rtab_returned: "Returned",
      rtab_reshiped: "Reshipped",
      rtab_pending: "Pending",
      status_return: "Returned",
      status_pending: "Pending",
      status_shipped: "Shipped",
      status_received: "Received",

      specs_h2: "Specifications",
      specs_p: "Switch lines to view full technical specs: dimensions, power, temperature control, certifications and packing list.",

      pricing_h2: "2026 Settlement Price",
      pricing_p: "Unit settlement price and tiered pricing (¥ / unit). «Sp» marks special-tier models; models without tiers use the unit price.",
      price_model: "Model",

      /* ===== Model Compare ===== */
      compare_bar: "Compare",
      compare_add: "Add to compare",
      compare_added: "Added",
      compare_remove: "Remove",
      compare_go: "Compare",
      compare_clear: "Clear",
      compare_empty: "Select models in “All Models” to compare",
      compare_max: "Compare up to 4 models",
      compare_title: "Model Comparison",
      compare_only_diff: "Differences only",
      compare_back: "Back to models",
      compare_add_more: "Add more models",
      compare_col_model: "Model",
      compare_diff_hint: "Highlighted rows differ across models",
      compare_no_data: "No models selected",
      price_volt: "Voltage",
      price_k3: "K3 code",
      price_base: "Unit price",
      price_perbox: "Units/box",
      price_special: "Sp",
      price_tier_range: "Qty range",
      price_muted: "—",

      rules_h2: "Volume Discount Rules",
      rules_p: "Discount is calculated per department order amount (including freight). When multiple departments share a container, freight is split by each department's amount ratio.",
      rule_featured: "Recommended",
      rule_range1: "≤ 80k",
      rule_range2: "80k – 200k",
      rule_range3: "200k – 350k",
      rule_range4: "350k+",
      rule_desc1: "Loose goods · regular settlement price",
      rule_desc2: "Whole order gets 2% off",
      rule_desc3: "Whole order gets 5% off",
      rule_desc4: "5% off cap · negotiable",
      rule_note_title: "Volume discount rules (original)",

      calc_h2: "Quote Calculator",
      calc_p: "Enter a single order amount to match the applicable discount rate and discounted reference amount.",
      calc_label: "Order amount (¥)",
      calc_hint: "Tip: the amount is the whole order including freight; when departments share a container, freight is split by ratio and must not be pooled into one department to grab a discount.",
      calc_tier_label: "Applicable tier",
      calc_tier1: "≤ 80k · loose goods (regular price)",
      calc_tier2: "80k – 200k · 2% off",
      calc_tier3: "200k – 350k · 5% off",
      calc_tier4: "350k+ · 5% off cap (negotiable)",
      calc_after: "Discounted amount: ",
      calc_saved: "Estimated saving: ",
      calc_scale: "Order size (0 – 400k)",

      footer_brand: "AUP Iron",
      footer_sub: "Heat-transfer press · product & price manual",
      footer_src: "Source: 2026 Iron Settlement Price (2026.7.22), for internal sales & technical use. Prices are for reference; final price per formal contract.",
      footer_admin: "Admin",

      gate_badge: "AUP · Internal",
      gate_title: "Sign in",
      gate_sub: "This site is confidential. Please enter your credentials",
      gate_err: "Wrong account or password, please retry",
      gate_user: "Account",
      gate_pass: "Password",
      gate_btn: "Sign in",
      gate_status: "Decrypting…",

      filter_series: "Line",
      filter_volt: "Voltage",
      filter_color: "Color",
      filter_all: "All",
      filter_source: "Return source",
      modal_price_label: "Unit price",
      modal_color_label: "Color",
      modal_no_tier: "No tiered price · unit price",
      modal_shipping_title: "Packing & Logistics",
      modal_spec_title: "Specifications",
      modal_inner_box: "Inner box / W",
      modal_outer_box: "Outer box / W",
      modal_units_box: "Units / box",
      modal_no_spec: "No detailed specs for this model yet.",
      modal_discontinued: "Discontinued",

      hero_brand: "AUP Heat Press",
      hero_stat_cert_value: "4",
      meta_description: "AUP heat press series product showcase, technical specifications and 2026 settlement price lookup.",
      aria_brand_home: "AUP Home",
      aria_menu: "Menu",
      aria_scroll_down: "Scroll down",
      aria_close: "Close",
      calc_placeholder: "e.g. 120000",
      gate_user_placeholder: "Enter account",
      gate_pass_placeholder: "Enter password",
      admin_title: "Admin",
      table_note: "Note: settlement prices are for internal reference only; the final price is subject to the formal contract. Ceramic mugs are excluded from discounts, and special settlement prices cannot be combined with volume discounts.",
      range_80k: "80k",
      range_200k: "200k",
      range_350k: "350k",
      range_400k: "400k+",
      special_rule: "     Volume discount rules: orders are split by department — Sublimation, Consumables Dept. 1, DTF Dept. 2, and Apparel Dept. 3. Each sales order amount (including freight) is calculated separately.\nOrders ≤ 80k are treated as loose goods at regular settlement price; 80k–200k get 0.98; 200k–350k get 0.95. When multiple departments share a container, freight is allocated by each department's order amount.\n     Example: a container totals 405k — Sublimation 70k, Consumables 90k, DTF 210k, Apparel 20k, freight 15k.\nIt is not allowed to pool the 15k freight into Sublimation to reach the 0.98 tier; freight must be shared proportionally.\n     Note: ceramic mugs are excluded from discounts but still count toward department amount. Special settlement prices (e.g. heat presses) cannot be combined with volume discounts."
    },

    ru: {
      doc_title: "AUP Утюг · Каталог и цены 2026",
      nav_products: "Линейки",
      nav_catalog: "Все модели",
      nav_specs: "Характеристики",
      nav_pricing: "Цены",
      nav_rules: "Оптовая скидка",
      nav_calc: "Калькулятор",

      /* ===== Сравнение ===== */
      compare_bar: "Сравнение",
      compare_add: "Добавить",
      compare_added: "Добавлено",
      compare_remove: "Убрать",
      compare_go: "Сравнить",
      compare_clear: "Очистить",
      compare_empty: "Выберите модели в «Все модели» для сравнения",
      compare_max: "До 4 моделей",
      compare_title: "Сравнение моделей",
      compare_only_diff: "Только различия",
      compare_back: "К списку моделей",
      compare_add_more: "Добавить ещё",
      compare_col_model: "Модель",
      compare_diff_hint: "Подсвечены строки с различиями",
      compare_no_data: "Модели не выбраны",
      nav_stock: "Склад",
      nav_returns: "Возвраты",
      nav_cta: "Запросить цену",

      hero_eyebrow: "Каталог 2026 · Продажи и техника",
      hero_title_accent: "Точная прессовка, от одной нагревательной плиты",
      hero_sub: "Серия мини- и настольных термопрессов для сублимации, DTF и пошива одежды. Двойное напряжение, международные сертификаты, плиты из чистого алюминия с PTFE-покрытием — от домашнего переноса до серийного производства.",
      hero_btn_catalog: "Смотреть все модели",
      hero_btn_calc: "Расчёт цены →",
      hero_stat_families: "Линейки",
      hero_stat_sku: "Модели",
      hero_stat_volt: "Двойное напряжение",
      hero_stat_cert: "Сертификаты",

      fam_h2: "Четыре линейки продукции",
      fam_p: "От мини 2.5 дюйма до настольного 12 дюймов, по размеру плиты и назначению — найдётся вариант под любую задачу.",
      fam_model_unit: "моделей",
      fam_view_spec: "Смотреть характеристики",

      cat_h2: "Все модели",
      cat_p: "Все модели с кодом K3, напряжением, ценой за шт и данными упаковки. Нажмите на карточку для полных характеристик и ступенчатых цен.",
      cat_standard: "Стандарт",
      cat_special: "Ступенчатая скидка",
      cat_price_label: "Цена за шт",
      cat_soldout: "Снят с пр-ва",
      filter_nomatch: "Нет подходящих моделей.",

      stock_h2: "Склад",
      stock_p: "Запрос остатков в реальном времени. Данные обновляются из админ-панели; ниже указано время последнего обновления.",
      stock_updated_prefix: "Обновлено: ",
      stock_refresh: "↻ Обновить",
      stock_empty: "Нет данных о складе.",
      stock_unavailable: "Данные склада требуют локальный сервер (node server.js); не подключено.",
      stock_note_none: "",
      status_ok: "В наличии",
      status_low: "Заканчивается",
      status_out: "Нет в наличии",
      unit: "шт",

      returns_h2: "Возвраты",
      returns_p: "Обзор возвратов и дозаказов поставщику (публичная сводка). Модель, цвет, вилка, напряжение, детали дозаказа и регистрация ведутся в админ-панели, вкладка «Возвраты».",
      returns_refresh: "↻ Обновить",
      returns_clear: "✕ Сбросить",
      returns_detail_all: "Детали возвратов · Все",
      returns_detail_recent7: "Детали возвратов · 7 дней",
      returns_detail_reship: "Детали дозаказа · ",
      returns_no_data: "Нет данных",
      returns_no_ledger: "Нет данных о возвратах",
      returns_empty_msg: "Журнал возвратов требует локальный сервер (node server.js); не подключено.",
      ov_all: "Всего возвратов",
      ov_recent7: "7 дней",
      ov_pending: "Ожидает отправки",
      ov_shipped: "Отправлено",
      ov_received: "Получено",
      rtab_time: "Время",
      rtab_model: "Модель",
      rtab_color: "Цвет",
      rtab_plug: "Вилка",
      rtab_volt: "Напряжение",
      rtab_qty: "Кол-во",
      rtab_supplier: "Поставщик",
      rtab_status: "Статус",
      rtab_source: "Источник",
      rtab_returned: "Возвращено",
      rtab_reshiped: "Отправлено",
      rtab_pending: "Ожидает",
      status_return: "Возврат",
      status_pending: "Ожидает",
      status_shipped: "Отправлено",
      status_received: "Получено",

      specs_h2: "Характеристики",
      specs_p: "Переключайте линейки, чтобы увидеть полные технические характеристики: размеры, мощность, термоконтроль, сертификаты и комплект.",

      pricing_h2: "Цены 2026",
      pricing_p: "Цена за шт и ступенчатые цены (¥ / шт). «Сп» — спец. модель; модели без ступеней используют цену за шт.",
      price_model: "Модель",
      price_volt: "Напряжение",
      price_k3: "Код K3",
      price_base: "Цена за шт",
      price_perbox: "шт/кор",
      price_special: "Сп",
      price_tier_range: "Диапазон",
      price_muted: "—",

      rules_h2: "Правила оптовой скидки",
      rules_p: "Скидка считается по сумме заказа отдела (включая фрахт). При совместной отгрузке нескольких отделов фрахт делится пропорционально их суммам.",
      rule_featured: "Рекомендуем",
      rule_range1: "≤ 80k",
      rule_range2: "80k – 200k",
      rule_range3: "200k – 350k",
      rule_range4: "350k+",
      rule_desc1: "Россыпь · обычная цена",
      rule_desc2: "Весь заказ −2%",
      rule_desc3: "Весь заказ −5%",
      rule_desc4: "Потолок −5% · обсуждается",
      rule_note_title: "Правила скидок (оригинал)",

      calc_h2: "Калькулятор скидок",
      calc_p: "Введите сумму заказа, чтобы подобрать ставку скидки и сумму со скидкой.",
      calc_label: "Сумма заказа (¥)",
      calc_hint: "Подсказка: сумма — весь заказ с фрахтом; при совместной отгрузке фрахт делится пропорционально и не сводится в один отдел ради скидки.",
      calc_tier_label: "Уровень",
      calc_tier1: "≤ 80k · россыпь (обычная цена)",
      calc_tier2: "80k – 200k · −2%",
      calc_tier3: "200k – 350k · −5%",
      calc_tier4: "350k+ · потолок −5% (обсуждается)",
      calc_after: "Сумма со скидкой: ",
      calc_saved: "Экономия: ",
      calc_scale: "Размер заказа (0 – 400k)",

      footer_brand: "AUP Утюг",
      footer_sub: "Термопресс · каталог и цены",
      footer_src: "Источник: цены утюгов 2026 (2026.7.22), для внутренних продаж и техники. Цены — справочно, итог по договору.",
      footer_admin: "Админ",

      gate_badge: "AUP · Внутреннее",
      gate_title: "Вход",
      gate_sub: "Сайт конфиденциален. Введите учётные данные",
      gate_err: "Неверный логин или пароль, попробуйте снова",
      gate_user: "Учётная запись",
      gate_pass: "Пароль",
      gate_btn: "Войти",
      gate_status: "Расшифровка…",

      filter_series: "Линейка",
      filter_volt: "Напряжение",
      filter_color: "Цвет",
      filter_all: "Все",
      filter_source: "Источник возврата",
      modal_price_label: "Цена за шт",
      modal_color_label: "Цвет",
      modal_no_tier: "Нет ступенчатой цены · цена за шт",
      modal_shipping_title: "Упаковка и логистика",
      modal_spec_title: "Характеристики",
      modal_inner_box: "Внутр. коробка / В",
      modal_outer_box: "Внеш. коробка / В",
      modal_units_box: "шт / кор",
      modal_no_spec: "Подробные характеристики для этой модели отсутствуют.",
      modal_discontinued: "Снят с пр-ва",

      hero_brand: "AUP Термопресс",
      hero_stat_cert_value: "4",
      meta_description: "Каталог термопрессов AUP, технические характеристики и расчётные цены на 2026 год.",
      aria_brand_home: "Главная AUP",
      aria_menu: "Меню",
      aria_scroll_down: "Прокрутить вниз",
      aria_close: "Закрыть",
      calc_placeholder: "например 120000",
      gate_user_placeholder: "Введите логин",
      gate_pass_placeholder: "Введите пароль",
      admin_title: "Админка",
      table_note: "Примечание: расчётные цены носят справочный характер; окончательная цена определяется договором. Керамические кружки не участвуют в скидках, специальные цены не суммируются с оптовыми скидками.",
      range_80k: "80k",
      range_200k: "200k",
      range_350k: "350k",
      range_400k: "400k+",
      special_rule: "     Правила оптовой скидки: заказы разделяются по отделам — Сублимация, Расходники 1, DTF 2 и Одежда 3. Сумма каждого заказа (с фрахтом) считается отдельно.\nЗаказы ≤ 80k — россыпь по обычной цене; 80k–200k — 0,98; 200k–350k — 0,95. При совместной загрузке нескольких отделов фрахт распределяется пропорционально их суммам.\n     Пример: контейнер на 405k — Сублимация 70k, Расходники 90k, DTF 210k, Одежда 20k, фрахт 15k.\nНельзя засчитать весь фрахт 15k в Сублимацию ради уровня 0,98; фрахт должен распределяться пропорционально.\n     Внимание: керамические кружки не участвуют в скидках, но входят в сумму отдела. Специальные цены (например, на термопрессы) не суммируются с оптовыми скидками."
    },

    es: {
      doc_title: "AUP Plancha · Catálogo y precios 2026",
      nav_products: "Líneas",
      nav_catalog: "Todos los modelos",
      nav_specs: "Especificaciones",
      nav_pricing: "Precios",
      nav_rules: "Descuento por volumen",
      nav_calc: "Calculadora",

      /* ===== Comparar ===== */
      compare_bar: "Comparar",
      compare_add: "Añadir",
      compare_added: "Añadido",
      compare_remove: "Quitar",
      compare_go: "Comparar",
      compare_clear: "Limpiar",
      compare_empty: "Selecciona modelos en «Todos los modelos»",
      compare_max: "Compara hasta 4 modelos",
      compare_title: "Comparación de modelos",
      compare_only_diff: "Solo diferencias",
      compare_back: "Volver a modelos",
      compare_add_more: "Añadir más",
      compare_col_model: "Modelo",
      compare_diff_hint: "Filas resaltadas difieren entre modelos",
      compare_no_data: "Ningún modelo seleccionado",
      nav_stock: "Stock en vivo",
      nav_returns: "Devoluciones",
      nav_cta: "Solicitar cotización",

      hero_eyebrow: "Catálogo 2026 · Ventas y técnica",
      hero_title_accent: "Planchado de precisión, desde una placa calefactora",
      hero_sub: "Serie de prensas térmicas mini y de escritorio para sublimación, DTF y confección. Doble voltaje, múltiples certificaciones, placas de aluminio puro con PTFE — del transfer doméstico a la producción en serie.",
      hero_btn_catalog: "Ver todos los modelos",
      hero_btn_calc: "Cotizar →",
      hero_stat_families: "Líneas",
      hero_stat_sku: "Modelos",
      hero_stat_volt: "Doble voltaje",
      hero_stat_cert: "Certificaciones",

      fam_h2: "Cuatro líneas de productos",
      fam_p: "De mini 2.5 pulgadas a escritorio 12 pulgadas, por tamaño de placa y uso — hay una opción para cada necesidad.",
      fam_model_unit: "modelos",
      fam_view_spec: "Ver especificaciones",

      cat_h2: "Todos los modelos",
      cat_p: "Todos los modelos con código K3, voltaje, precio unitario y datos de caja. Haz clic en una tarjeta para ver specs y precios escalonados.",
      cat_standard: "Estándar",
      cat_special: "Precio escalonado",
      cat_price_label: "Precio unitario",
      cat_soldout: "Descontinuado",
      filter_nomatch: "Sin modelos coincidentes.",

      stock_h2: "Stock en vivo",
      stock_p: "Consulta de inventario en tiempo real. Los datos se actualizan desde el backend; abajo se muestra la última actualización.",
      stock_updated_prefix: "Actualizado: ",
      stock_refresh: "↻ Actualizar",
      stock_empty: "Sin datos de stock.",
      stock_unavailable: "El stock requiere el servidor local (node server.js); no conectado.",
      stock_note_none: "",
      status_ok: "En stock",
      status_low: "Poco stock",
      status_out: "Agotado",
      unit: "ud",

      returns_h2: "Devoluciones",
      returns_p: "Resumen de devoluciones y reenvíos del proveedor (agregado público). Modelo, color, enchufe, voltaje, detalles de reenvío y registro se gestionan en el panel, pestaña «Devoluciones».",
      returns_refresh: "↻ Actualizar",
      returns_clear: "✕ Limpiar",
      returns_detail_all: "Detalle de devoluciones · Todas",
      returns_detail_recent7: "Detalle de devoluciones · Últimos 7 días",
      returns_detail_reship: "Detalle de reenvíos · ",
      returns_no_data: "Sin datos",
      returns_no_ledger: "Sin datos de devoluciones",
      returns_empty_msg: "El registro de devoluciones requiere el servidor local (node server.js); no conectado.",
      ov_all: "Total devoluciones",
      ov_recent7: "Últimos 7 días",
      ov_pending: "Reenvío pendiente",
      ov_shipped: "Reenviado",
      ov_received: "Recibido",
      rtab_time: "Hora",
      rtab_model: "Modelo",
      rtab_color: "Color",
      rtab_plug: "Enchufe",
      rtab_volt: "Voltaje",
      rtab_qty: "Cant.",
      rtab_supplier: "Proveedor",
      rtab_status: "Estado",
      rtab_source: "Origen",
      rtab_returned: "Devuelto",
      rtab_reshiped: "Reenviado",
      rtab_pending: "Pendiente",
      status_return: "Devuelto",
      status_pending: "Pendiente",
      status_shipped: "Enviado",
      status_received: "Recibido",

      specs_h2: "Especificaciones",
      specs_p: "Cambia de línea para ver especificaciones completas: dimensiones, potencia, control de temperatura, certificaciones y lista de empaque.",

      pricing_h2: "Precios 2026",
      pricing_p: "Precio unitario y precios escalonados (¥ / ud). «Esp» marca modelo especial; los modelos sin tramos usan precio unitario.",
      price_model: "Modelo",
      price_volt: "Voltaje",
      price_k3: "Código K3",
      price_base: "Precio unitario",
      price_perbox: "ud/caja",
      price_special: "Esp",
      price_tier_range: "Rango",
      price_muted: "—",

      rules_h2: "Reglas de descuento por volumen",
      rules_p: "El descuento se calcula por el monto del pedido del departamento (incluido flete). Al compartir contenedor, el flete se reparte según el monto de cada departamento.",
      rule_featured: "Recomendado",
      rule_range1: "≤ 80k",
      rule_range2: "80k – 200k",
      rule_range3: "200k – 350k",
      rule_range4: "350k+",
      rule_desc1: "Carga suelta · precio regular",
      rule_desc2: "Pedido completo −2%",
      rule_desc3: "Pedido completo −5%",
      rule_desc4: "Tope −5% · negociable",
      rule_note_title: "Reglas de descuento (original)",

      calc_h2: "Calculadora de cotización",
      calc_p: "Introduce el monto del pedido para ver la tasa de descuento y el monto con descuento.",
      calc_label: "Monto del pedido (¥)",
      calc_hint: "Consejo: el monto es el pedido completo con flete; al compartir contenedor, el flete se reparte y no se acumula en un departamento para obtener descuento.",
      calc_tier_label: "Nivel aplicable",
      calc_tier1: "≤ 80k · carga suelta (precio regular)",
      calc_tier2: "80k – 200k · −2%",
      calc_tier3: "200k – 350k · −5%",
      calc_tier4: "350k+ · tope −5% (negociable)",
      calc_after: "Monto con descuento: ",
      calc_saved: "Ahorro estimado: ",
      calc_scale: "Tamaño del pedido (0 – 400k)",

      footer_brand: "AUP Plancha",
      footer_sub: "Prensa térmica · catálogo y precios",
      footer_src: "Fuente: precios de planchas 2026 (2026.7.22), uso interno de ventas y técnica. Precios referenciales; final según contrato.",
      footer_admin: "Administración",

      gate_badge: "AUP · Interno",
      gate_title: "Iniciar sesión",
      gate_sub: "Sitio confidencial. Introduce tus credenciales",
      gate_err: "Usuario o contraseña incorrectos, reintenta",
      gate_user: "Usuario",
      gate_pass: "Contraseña",
      gate_btn: "Entrar",
      gate_status: "Descifrando…",

      filter_series: "Línea",
      filter_volt: "Voltaje",
      filter_color: "Color",
      filter_all: "Todos",
      filter_source: "Origen de devolución",
      modal_price_label: "Precio unitario",
      modal_color_label: "Color",
      modal_no_tier: "Sin precio escalonado · precio unitario",
      modal_shipping_title: "Embalaje y logística",
      modal_spec_title: "Especificaciones",
      modal_inner_box: "Caja interna / Peso",
      modal_outer_box: "Caja externa / Peso",
      modal_units_box: "ud / caja",
      modal_no_spec: "Esta modelo aún no tiene especificaciones detalladas.",
      modal_discontinued: "Descontinuado",

      hero_brand: "AUP Prensa Térmica",
      hero_stat_cert_value: "4",
      meta_description: "Showcase de prensas térmicas AUP, especificaciones técnicas y consulta de precios de liquidación 2026.",
      aria_brand_home: "Inicio AUP",
      aria_menu: "Menú",
      aria_scroll_down: "Desplazar hacia abajo",
      aria_close: "Cerrar",
      calc_placeholder: "p. ej. 120000",
      gate_user_placeholder: "Ingrese usuario",
      gate_pass_placeholder: "Ingrese contraseña",
      admin_title: "Administración",
      table_note: "Nota: los precios de liquidación son referencia interna; el precio final se define en el contrato formal. Las tazas cerámicas no participan en descuentos, y los precios especiales no son acumulables con descuentos por volumen.",
      range_80k: "80k",
      range_200k: "200k",
      range_350k: "350k",
      range_400k: "400k+",
      special_rule: "     Reglas de descuento por volumen: los pedidos se dividen por departamento — Sublimación, Consumibles 1, DTF 2 y Ropa 3. El monto de cada pedido (incluido flete) se calcula por separado.\nPedidos ≤ 80k se tratan como carga suelta a precio regular; 80k–200k aplican 0,98; 200k–350k aplican 0,95. Al compartir contenedor entre departamentos, el flete se prorratea según el monto de cada uno.\n     Ejemplo: un contenedor totaliza 405k — Sublimación 70k, Consumibles 90k, DTF 210k, Ropa 20k, flete 15k.\nNo está permitido cargar los 15k de flete a Sublimación para alcanzar el nivel 0,98; el flete debe distribuirse proporcionalmente.\n     Nota: las tazas cerámicas no participan en descuentos pero sí cuentan para el monto del departamento. Los precios especiales (p. ej. prensas) no son acumulables con descuentos por volumen."
    }
  };

  /* 规格属性标签（按 data.js 的 attrOrder.key 索引） */
  var SPEC_LABELS = {
    "产品尺寸": { en: "Product dimensions", ru: "Габариты изделия", es: "Dimensiones del producto" },
    "产品重量": { en: "Product weight", ru: "Вес изделия", es: "Peso del producto" },
    "包装尺寸": { en: "Package size", ru: "Размер упаковки", es: "Tamaño del paquete" },
    "包装重量": { en: "Package weight", ru: "Вес упаковки", es: "Peso del paquete" },
    "外箱尺寸": { en: "Outer box size", ru: "Размер внеш. коробки", es: "Tamaño de caja externa" },
    "外箱重量": { en: "Outer box weight", ru: "Вес внеш. коробки", es: "Peso de caja externa" },
    "外箱数量": { en: "Qty in outer box", ru: "Кол-во в коробке", es: "Cantidad por caja" },
    "发热板尺寸": { en: "Heating plate size", ru: "Размер плиты", es: "Tamaño de placa" },
    "材质": { en: "Material", ru: "Материал", es: "Material" },
    "发热板材料": { en: "Heating plate material", ru: "Материал плиты", es: "Material de la placa" },
    "机器颜色": { en: "Machine color", ru: "Цвет", es: "Color de la máquina" },
    "电源规格": { en: "Power specifications", ru: "Характеристики питания", es: "Especificaciones de alimentación" },
    "电压伏特V": { en: "Voltage (V)", ru: "Напряжение (В)", es: "Voltaje (V)" },
    "频率赫兹HZ": { en: "Frequency (Hz)", ru: "Частота (Гц)", es: "Frecuencia (Hz)" },
    "功率瓦特W": { en: "Power (W)", ru: "Мощность (Вт)", es: "Potencia (W)" },
    "温度显示方式": { en: "Display mode", ru: "Режим отображения", es: "Modo de visualización" },
    "倒计时方式": { en: "Countdown method", ru: "Таймер обратного отсчёта", es: "Método de cuenta regresiva" },
    "最高温度": { en: "Max temperature", ru: "Макс. температура", es: "Temperatura máxima" },
    "最低温度": { en: "Min temperature", ru: "Мин. температура", es: "Temperatura mínima" },
    "相关证书认证": { en: "Certifications", ru: "Сертификаты", es: "Certificaciones" },
    "特点与购买建议": { en: "Features & advice", ru: "Особенности и советы", es: "Características y consejos" },
    "单台包装清单": { en: "Packing list", ru: "Комплект поставки", es: "Lista de empaque" }
  };

  /* 系列名 / 标签 / 发热板尺寸（按 family 索引） */
  var FAMILY_I18N = {
    "AUP-M2": {
      name: { en: "AUP-M2 Mini 2nd Gen", ru: "AUP-M2 Мини 2-го пок.", es: "AUP-M2 Mini 2ª Gen" },
      tag: { en: "Compact mini · home heat-transfer", ru: "Компактный мини · для дома", es: "Mini compacto · para el hogar" },
      size: { en: "2.5×4.2in heating plate", ru: "2.5×4.2in нагрев. плита", es: "2.5×4.2in placa" }
    },
    "AUP-L": {
      name: { en: "AUP-L 9in Press", ru: "AUP-L 9 дюйм", es: "AUP-L Plancha 9in" },
      tag: { en: "Digital display · U-shape heater", ru: "Цифр. дисплей · U-обр. нагреватель", es: "Pantalla digital · calentador en U" },
      size: { en: "9×9in heating plate", ru: "9×9in нагрев. плита", es: "9×9in placa" }
    },
    "AUP-L2": {
      name: { en: "AUP-L2 12in Press", ru: "AUP-L2 12 дюйм", es: "AUP-L2 Plancha 12in" },
      tag: { en: "One-piece shell · large format", ru: "Цельный корпус · большой формат", es: "Carcasa integral · gran formato" },
      size: { en: "12×10in heating plate", ru: "12×10in нагрев. плита", es: "12×10in placa" }
    },
    "AUP-L3": {
      name: { en: "AUP-L3 7.5in Press", ru: "AUP-L3 7.5 дюйм", es: "AUP-L3 Plancha 7.5in" },
      tag: { en: "Illustrated design · portable", ru: "Иллюстр. дизайн · портативный", es: "Diseño ilustrado · portátil" },
      size: { en: "7.5×4.75in heating plate", ru: "7.5×4.75in нагрев. плита", es: "7.5×4.75in placa" }
    }
  };

  /* 机型名称（按 data.js 的 product.name 精确匹配） */
  var PRODUCT_NAME_I18N = {
    "AUP-M2 迷你二代熨斗机（110V）": {
      en: "AUP-M2 Mini Heat Press (110V)",
      ru: "AUP-M2 Мини термопресс (110V)",
      es: "AUP-M2 Mini Prensa Térmica (110V)"
    },
    "AUP-M2 迷你二代熨斗机（220v)": {
      en: "AUP-M2 Mini Heat Press (220V)",
      ru: "AUP-M2 Мини термопресс (220V)",
      es: "AUP-M2 Mini Prensa Térmica (220V)"
    },
    "AUP-L 熨斗机（9*9）(110V)": {
      en: "AUP-L Heat Press (9×9) (110V)",
      ru: "AUP-L Термопресс (9×9) (110V)",
      es: "AUP-L Prensa Térmica (9×9) (110V)"
    },
    "AUP-L 熨斗机（9*9）(220V)": {
      en: "AUP-L Heat Press (9×9) (220V)",
      ru: "AUP-L Термопресс (9×9) (220V)",
      es: "AUP-L Prensa Térmica (9×9) (220V)"
    },
    "AUP-L2 熨斗机（12*10）(110V)": {
      en: "AUP-L2 Heat Press (12×10) (110V)",
      ru: "AUP-L2 Термопресс (12×10) (110V)",
      es: "AUP-L2 Prensa Térmica (12×10) (110V)"
    },
    "AUP-L2 熨斗机（12*10）(220V)": {
      en: "AUP-L2 Heat Press (12×10) (220V)",
      ru: "AUP-L2 Термопресс (12×10) (220V)",
      es: "AUP-L2 Prensa Térmica (12×10) (220V)"
    },
    "AUP-L3 熨斗机（7.5*4.75）(110V)": {
      en: "AUP-L3 Heat Press (7.5×4.75) (110V)",
      ru: "AUP-L3 Термопресс (7.5×4.75) (110V)",
      es: "AUP-L3 Prensa Térmica (7.5×4.75) (110V)"
    },
    "AUP-L3 熨斗机（7.5*4.75）(220V)": {
      en: "AUP-L3 Heat Press (7.5×4.75) (220V)",
      ru: "AUP-L3 Термопресс (7.5×4.75) (220V)",
      es: "AUP-L3 Prensa Térmica (7.5×4.75) (220V)"
    }
  };

  /* 颜色名（data.js 中使用完整名称如“红色”） */
  var COLOR_I18N = {
    "红色": { en: "Red", ru: "Красный", es: "Rojo" },
    "绿色": { en: "Green", ru: "Зелёный", es: "Verde" },
    "灰色": { en: "Gray", ru: "Серый", es: "Gris" },
    "蓝色": { en: "Blue", ru: "Синий", es: "Azul" },
    "紫色": { en: "Purple", ru: "Фиолетовый", es: "Morado" },
    "黄色": { en: "Yellow", ru: "Жёлтый", es: "Amarillo" },
    "黑色": { en: "Black", ru: "Чёрный", es: "Negro" },
    "白色": { en: "White", ru: "Белый", es: "Blanco" },
    "粉色": { en: "Pink", ru: "Розовый", es: "Rosa" },
    "橙色": { en: "Orange", ru: "Оранжевый", es: "Naranja" },
    "金色": { en: "Gold", ru: "Золотой", es: "Dorado" },
    "银色": { en: "Silver", ru: "Серебристый", es: "Plateado" }
  };

  /* 插头规格 */
  var PLUG_I18N = {
    "中插": { en: "CN plug", ru: "Китайская вилка", es: "Enchufe CN" },
    "英规": { en: "UK plug", ru: "Британская вилка", es: "Enchufe UK" },
    "欧规": { en: "EU plug", ru: "Европейская вилка", es: "Enchufe EU" },
    "美规": { en: "US plug", ru: "Американская вилка", es: "Enchufe US" },
    "澳规": { en: "AU plug", ru: "Австралийская вилка", es: "Enchufe AU" }
  };

  /* 规格值整段翻译（按 data.js 的精确值匹配） */
  var SPEC_VALUE_I18N = {
    "ABS环保材料": {
      en: "ABS eco-friendly material",
      ru: "Экологичный ABS пластик",
      es: "Material ABS ecológico"
    },
    "特氟龙纯铝发热板": {
      en: "PTFE pure-aluminum heating plate",
      ru: "Чистоалюминиевая пластина с PTFE-покрытием",
      es: "Placa de aluminio puro con PTFE"
    },
    "智能数显": {
      en: "Smart digital display",
      ru: "Цифровой дисплей",
      es: "Pantalla digital inteligente"
    },
    "无": {
      en: "None",
      ru: "Нет",
      es: "Ninguno"
    },
    "声音": {
      en: "Sound",
      ru: "Звук",
      es: "Sonido"
    },
    "三档调整\n1档   140℃  2档  160℃  3档  190℃": {
      en: "3-gear adjustment\nGear 1 140℃  Gear 2 160℃  Gear 3 190℃",
      ru: "3 режима\nРежим 1 140℃  Режим 2 160℃  Режим 3 190℃",
      es: "Ajuste de 3 niveles\nNivel 1 140℃  Nivel 2 160℃  Nivel 3 190℃"
    },
    "专利证书（申请号或专利号:202030770827.7)\nCE认证；\nROHS；\nFCC；\nUL （电源线）": {
      en: "Patent certificate (application/patent No. 202030770827.7)\nCE certified;\nROHS;\nFCC;\nUL (power cord)",
      ru: "Патент (заявка/патент № 202030770827.7)\nCE;\nROHS;\nFCC;\nUL (сетевой шнур)",
      es: "Certificado de patente (solicitud/patente No. 202030770827.7)\nCE;\nROHS;\nFCC;\nUL (cable de alimentación)"
    },
    "CE认证；\nROHS；\nFCC；\nUL （电源线）": {
      en: "CE certified;\nROHS;\nFCC;\nUL (power cord)",
      ru: "CE;\nROHS;\nFCC;\nUL (сетевой шнур)",
      es: "CE;\nROHS;\nFCC;\nUL (cable de alimentación)"
    },
    "1.静置不动，10分自动关机\n2.三档调整快速升温\n3.轻便小巧易携带，适合家居\n4.应用范围广，主要应用于棉、麻、化纤等织物的烫画，也可通过丝\n印、胶水、发泡等方式进行热处理。": {
      en: "1. Auto power-off after 10 min idle\n2. 3-gear adjustment for fast heating\n3. Lightweight and portable, ideal for home use\n4. Wide application for cotton, linen, chemical-fiber fabrics; also supports heat treatment via screen printing, glue and foaming.",
      ru: "1. Автоотключение через 10 мин бездействия\n2. 3 режима для быстрого нагрева\n3. Лёгкий и компактный, подходит для дома\n4. Широкое применение: хлопок, лён, синтетика; также термообработка через шелкографию, клей и вспенивание.",
      es: "1. Apagado automático a los 10 min de inactividad\n2. Ajuste de 3 niveles para calentamiento rápido\n3. Ligero y portátil, ideal para el hogar\n4. Amplia aplicación en algodón, lino, fibras químicas; también compatible con serigrafía, pegamento y espumado."
    },
    "1.静置不动，10分自动关机\n2.可切换摄氏度和华氏度\n3.最高温度205摄氏度\n4.压烫倒计时功能\n5.U型发热管，温度更均匀\n6.轻便小巧易携带，适合家居\n7.应用范围广，主要应用于棉、麻、化纤等织物的烫画，也可通过丝\n印、胶水、发泡等方式进行热处理。": {
      en: "1. Auto power-off after 10 min idle\n2. Switchable ℃/℉\n3. Max temperature 205℃\n4. Press countdown timer\n5. U-shaped heater for even temperature\n6. Lightweight and portable, ideal for home use\n7. Wide application for cotton, linen, chemical-fiber fabrics; also supports heat treatment via screen printing, glue and foaming.",
      ru: "1. Автоотключение через 10 мин бездействия\n2. Переключение ℃/℉\n3. Макс. температура 205℃\n4. Таймер прессования\n5. U-образный нагреватель для равномерного нагрева\n6. Лёгкий и компактный, подходит для дома\n7. Широкое применение: хлопок, лён, синтетика; также термообработка через шелкографию, клей и вспенивание.",
      es: "1. Apagado automático a los 10 min de inactividad\n2. ℃/℉ conmutable\n3. Temperatura máxima 205℃\n4. Temporizador de prensado\n5. Calentador en U para temperatura uniforme\n6. Ligero y portátil, ideal para el hogar\n7. Amplia aplicación en algodón, lino, fibras químicas; también compatible con serigrafía, pegamento y espumado."
    },
    "1.开模一体式机壳，美观便携\n2.静置不动，10分自动关机\n   3.可切换摄氏度和华氏度\n4.应用范围广，主要应用于棉、麻、化纤等织物的烫画，也可通过丝\n印、胶水、发泡等方式进行热处理。": {
      en: "1. One-piece molded shell, stylish and portable\n2. Auto power-off after 10 min idle\n3. Switchable ℃/℉\n4. Wide application for cotton, linen, chemical-fiber fabrics; also supports heat treatment via screen printing, glue and foaming.",
      ru: "1. Цельный корпус, стильный и портативный\n2. Автоотключение через 10 мин бездействия\n3. Переключение ℃/℉\n4. Широкое применение: хлопок, лён, синтетика; также термообработка через шелкографию, клей и вспенивание.",
      es: "1. Carcasa moldeada integral, elegante y portátil\n2. Apagado automático a los 10 min de inactividad\n3. ℃/℉ conmutable\n4. Amplia aplicación en algodón, lino, fibras químicas; también compatible con serigrafía, pegamento y espumado."
    },
    "1.ID设计灵感来自于专业插画师设计；\n2.多重隔热安全温度保护；\n3.图案采用移印工艺，美观高大上；\n4.发热铝板采用铁氟龙烤漆工艺，耐高温，不粘织物；\n5.配备多种图案选择，满足不同客户审美\n6.外观新颖，识别度高；": {
      en: "1. ID design inspired by professional illustrators\n2. Multi-layer heat insulation and over-temperature protection\n3. Patterns applied by pad printing, premium look\n4. Teflon-coated aluminum heating plate, high-temperature resistant and non-stick\n5. Multiple pattern options to suit different tastes\n6. Novel appearance with high recognition",
      ru: "1. Дизайн ID вдохновлён профессиональными иллюстраторами\n2. Многослойная теплоизоляция и защита от перегрева\n3. Рисунок нанесён тампопечатью, премиальный вид\n4. Алюминиевая пластина с тефлоновым покрытием, термостойкая и не прилипает\n5. Несколько вариантов рисунков на любой вкус\n6. Оригинальный внешний вид, легко узнаваемый",
      es: "1. Diseño ID inspirado en ilustradores profesionales\n2. Protección térmica multicapa contra sobretemperatura\n3. Patrones aplicados en tampografía, acabado premium\n4. Placa de aluminio con revestimiento de teflón, resistente al calor y antiadherente\n5. Varios patrones para diferentes gustos\n6. Apariencia novedosa y reconocible"
    },
    "1.迷你熨斗机1套（含硅胶底座）\n2.30ml喷水瓶1个\n3.说明书1份\n4.贴纸3-6张\n5.收纳袋1个": {
      en: "1. Mini heat press set ×1 (with silicone base)\n2. 30ml spray bottle ×1\n3. User manual ×1\n4. Stickers ×3-6\n5. Storage bag ×1",
      ru: "1. Мини термопресс ×1 (с силиконовой подставкой)\n2. Пульверизатор 30 мл ×1\n3. Инструкция ×1\n4. Наклейки ×3-6\n5. Чехол для хранения ×1",
      es: "1. Mini prensa térmica ×1 (con base de silicona)\n2. Botella de spray 30 ml ×1\n3. Manual de usuario ×1\n4. Pegatinas ×3-6\n5. Bolsa de almacenamiento ×1"
    },
    "1.9寸熨斗机1套（含硅胶底座）\n2.说明书1份\n3.贴纸2-3张": {
      en: "1. 9-inch heat press set ×1 (with silicone base)\n2. User manual ×1\n3. Stickers ×2-3",
      ru: "1. Термопресс 9 дюймов ×1 (с силиконовой подставкой)\n2. Инструкция ×1\n3. Наклейки ×2-3",
      es: "1. Prensa térmica 9 pulgadas ×1 (con base de silicona)\n2. Manual de usuario ×1\n3. Pegatinas ×2-3"
    },
    "1.12寸熨斗机1套（含硅胶底座）\n2.说明书1份\n3.贴纸2-3张": {
      en: "1. 12-inch heat press set ×1 (with silicone base)\n2. User manual ×1\n3. Stickers ×2-3",
      ru: "1. Термопресс 12 дюймов ×1 (с силиконовой подставкой)\n2. Инструкция ×1\n3. Наклейки ×2-3",
      es: "1. Prensa térmica 12 pulgadas ×1 (con base de silicona)\n2. Manual de usuario ×1\n3. Pegatinas ×2-3"
    },
    "1.7.5寸熨斗机1套（含硅胶底座）\n2.说明书1份\n3.贴纸2-3张": {
      en: "1. 7.5-inch heat press set ×1 (with silicone base)\n2. User manual ×1\n3. Stickers ×2-3",
      ru: "1. Термопресс 7.5 дюймов ×1 (с силиконовой подставкой)\n2. Инструкция ×1\n3. Наклейки ×2-3",
      es: "1. Prensa térmica 7.5 pulgadas ×1 (con base de silicona)\n2. Manual de usuario ×1\n3. Pegatinas ×2-3"
    }
  };

  function getLang() {
    var l = null;
    try { l = localStorage.getItem("aup_lang"); } catch (e) {}
    if (!l || LANGS.indexOf(l) === -1) l = "zh";
    return l;
  }
  function setLang(l) {
    if (LANGS.indexOf(l) === -1) l = "zh";
    try { localStorage.setItem("aup_lang", l); } catch (e) {}
    if (document.documentElement) document.documentElement.lang = (LANG_META[l] || LANG_META.zh).code;
    applyI18n();
    if (typeof window.__rerender === "function") window.__rerender();
    buildLangSwitch();
  }
  function t(key) {
    var l = getLang();
    if (I18N[l] && I18N[l][key] !== undefined) return I18N[l][key];
    if (I18N.zh[key] !== undefined) return I18N.zh[key];
    return key;
  }
  function applyI18n() {
    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute("data-i18n");
      var v = (I18N[getLang()] && I18N[getLang()][key] !== undefined) ? I18N[getLang()][key] : I18N.zh[key];
      if (v !== undefined) els[i].textContent = v;
    }
    var attrEls = document.querySelectorAll("[data-i18n-attr]");
    for (var j = 0; j < attrEls.length; j++) {
      var spec = attrEls[j].getAttribute("data-i18n-attr");
      spec.split(";").forEach(function (pair) {
        var parts = pair.split(":").map(function (s) { return s.trim(); });
        if (parts.length < 2) return;
        var v2 = (I18N[getLang()] && I18N[getLang()][parts[1]] !== undefined) ? I18N[getLang()][parts[1]] : I18N.zh[parts[1]];
        if (v2 !== undefined) attrEls[j].setAttribute(parts[0], v2);
      });
    }
    var tk = "doc_title";
    var tv = (I18N[getLang()] && I18N[getLang()][tk] !== undefined) ? I18N[getLang()][tk] : I18N.zh[tk];
    if (tv !== undefined) document.title = tv;
  }
  function buildLangSwitch() {
    var box = document.getElementById("langSwitch");
    if (!box) return;
    box.innerHTML = LANGS.map(function (l) {
      return '<button type="button" class="lang-btn' + (l === getLang() ? " active" : "") + '" data-lang="' + l + '" title="' + (LANG_META[l] || LANG_META.zh).code + '">' + (LANG_META[l] || LANG_META.zh).short + "</button>";
    }).join("");
    var btns = box.querySelectorAll(".lang-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () { setLang(this.getAttribute("data-lang")); });
    }
  }
  function specLabel(key) {
    var m = SPEC_LABELS[key];
    if (!m) return key;
    var lang = getLang();
    return (m[lang] !== undefined ? m[lang] : (m.zh !== undefined ? m.zh : key));
  }
  function specValue(v) {
    if (v === undefined || v === null || getLang() === "zh") return v;
    var s = String(v);
    var m = SPEC_VALUE_I18N[s];
    if (m && m[getLang()] !== undefined) return m[getLang()];
    if (/^\d+\/台$/.test(s)) {
      var n = s.replace("/台", "");
      var units = { en: n + " units", ru: n + " шт", es: n + " ud" };
      return units[getLang()] || s;
    }
    return v;
  }
  function familyName(fam) {
    var m = FAMILY_I18N[fam];
    if (m && m.name && m.name[getLang()] !== undefined) return m.name[getLang()];
    return (window.__D && window.__D.familyMeta[fam]) ? window.__D.familyMeta[fam].name : fam;
  }
  function familyTag(fam) {
    var m = FAMILY_I18N[fam];
    if (m && m.tag && m.tag[getLang()] !== undefined) return m.tag[getLang()];
    return (window.__D && window.__D.familyMeta[fam]) ? window.__D.familyMeta[fam].tag : "";
  }
  function familySize(fam) {
    var m = FAMILY_I18N[fam];
    if (m && m.size && m.size[getLang()] !== undefined) return m.size[getLang()];
    return (window.__D && window.__D.familyMeta[fam]) ? window.__D.familyMeta[fam].size : "";
  }
  function productName(name) {
    var m = PRODUCT_NAME_I18N[name];
    if (m && m[getLang()] !== undefined) return m[getLang()];
    return name;
  }
  function colorName(c) {
    var m = COLOR_I18N[c];
    if (m && m[getLang()] !== undefined) return m[getLang()];
    return c;
  }
  function plugName(p) {
    var m = PLUG_I18N[p];
    if (m && m[getLang()] !== undefined) return m[getLang()];
    return p;
  }
  function translateColorsInText(text) {
    if (!text || getLang() === "zh") return text;
    var out = text;
    Object.keys(COLOR_I18N).forEach(function (k) {
      out = out.split(k).join(colorName(k));
    });
    return out;
  }
  function translatePlugsInText(text) {
    if (!text || getLang() === "zh") return text;
    var out = text;
    Object.keys(PLUG_I18N).forEach(function (k) {
      out = out.split(k).join(plugName(k));
    });
    return out;
  }

  window.I18N = I18N;
  window.LANGS = LANGS;
  window.getLang = getLang;
  window.setLang = setLang;
  window.t = t;
  window.applyI18n = applyI18n;
  window.buildLangSwitch = buildLangSwitch;
  window.specLabel = specLabel;
  window.specValue = specValue;
  window.familyName = familyName;
  window.familyTag = familyTag;
  window.familySize = familySize;
  window.productName = productName;
  window.colorName = colorName;
  window.plugName = plugName;
  window.translateColorsInText = translateColorsInText;
  window.translatePlugsInText = translatePlugsInText;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { applyI18n(); buildLangSwitch(); });
  } else {
    applyI18n();
    buildLangSwitch();
  }
})();
