(function () {
  "use strict";

  var navLinks = document.querySelectorAll(".nav-link");
  var tileView = document.getElementById("tileView");
  var sectionView = document.getElementById("sectionView");
  var heroSection = document.getElementById("heroSection");
  var tileCanvas = document.getElementById("tileCanvas");
  var logoHome = document.getElementById("logoHome");
  var overlay = document.getElementById("overlay");

  var currentSection = null;
  var tileVisible = false;

  // ========== 23 瓦片数据 ==========
  // x: 0=信息属性(左), 1=数据属性(右)
  // y: 0=通用基础(上), 1=专用智能(下)
  // size: sm/md/lg/xl
  var TILES = [
    // ── 通用基础 · 信息属性（左上）──
    { name: "政策洞察", sub: "涟漪分析", link: "http://localhost:18880", color: "cyan", size: "lg", x:0.05,y:0.05 },
    { name: "技贸措施", sub: "TBT/SPS", link: "http://localhost:5403", color: "cyan", size: "md", x:0.10,y:0.18 },
    { name: "跨境执法", sub: "GatherInfo", link: "http://localhost:5178", color: "cyan", size: "lg", x:0.12,y:0.35 },

    // ── 通用基础 · 数据属性（右上）──
    { name: "UN Comtrade", sub: "贸易镜像", link: "http://localhost:8150", color: "emerald", size: "lg", x:0.65,y:0.03 },
    { name: "基础参数", sub: "税则8972条", link: "http://localhost:8780", color: "violet", size: "md", x:0.70,y:0.18 },
    { name: "法规标准", sub: "3082条", link: "http://localhost:8289", color: "violet", size: "lg", x:0.72,y:0.30 },
    { name: "管制清单", sub: "486条物项", link: "http://localhost:8600", color: "violet", size: "md", x:0.80,y:0.05 },
    { name: "价格库", sub: "World Bank", link: "http://localhost:9201", color: "emerald", size: "sm", x:0.82,y:0.38 },
    { name: "数据汇集", sub: "8源入库", link: "http://localhost:8158", color: "emerald", size: "md", x:0.68,y:0.40 },
    { name: "历史案件", sub: "LLM抽取", link: "http://localhost:8500", color: "emerald", size: "md", x:0.60,y:0.45 },

    // ── 专用智能 · 信息属性（左下）──
    { name: "部委新政", sub: "政策采集", link: "http://localhost:18880", color: "cyan", size: "sm", x:0.02,y:0.55 },
    { name: "情报检索", sub: "全文搜索", link: "http://localhost:5178", color: "cyan", size: "md", x:0.08,y:0.62 },
    { name: "公众号情报", sub: "微信归档", link: "http://localhost:5001", color: "cyan", size: "sm", x:0.04,y:0.75 },
    { name: "全球政策", sub: "外贸动态", link: "http://localhost:18880", color: "cyan", size: "sm", x:0.12,y:0.80 },
    { name: "HaiSee转译", sub: "情报→任务书", link: "http://localhost:5400", color: "rose", size: "lg", x:0.18,y:0.55 },
    { name: "以案找案", sub: "案例比对", link: "http://localhost:8190", color: "rose", size: "lg", x:0.22,y:0.65 },
    { name: "查验因子", sub: "风险量化", link: "http://localhost:8173", color: "rose", size: "md", x:0.15,y:0.75 },
    { name: "特征提取", sub: "要素抽取", link: "http://localhost:8173", color: "rose", size: "sm", x:0.10,y:0.88 },

    // ── 专用智能 · 数据属性（右下）──
    { name: "关键矿产", sub: "战略管制", link: "http://localhost:8100", color: "amber", size: "lg", x:0.65,y:0.55 },
    { name: "出口管制", sub: "反制措施", link: "http://localhost:8300", color: "amber", size: "lg", x:0.68,y:0.65 },
    { name: "两用物项", sub: "51号公告", link: "http://localhost:8200", color: "amber", size: "md", x:0.78,y:0.52 },
    { name: "化肥贸易", sub: "HS3101-3105", link: "http://localhost:8560", color: "amber", size: "md", x:0.82,y:0.66 },
    { name: "AIS轨迹", sub: "港新/加勒比", link: "http://localhost:8160", color: "emerald", size: "sm", x:0.60,y:0.78 },
    { name: "风控知识库", sub: "本地知识库", link: "http://localhost:8788", color: "emerald", size: "md", x:0.70,y:0.22 },
  ];

  var CARD_VISUALS = {
    "跨境贸易执法查发": { tone: "cyan", motif: "globe", kicker: "开源情报", title: "跨境贸易查发", sub: "全球线索 · 案例挖掘", label: "OSINT", tags: ["全网智采", "执法案例", "风险线索"] },
    "全球经济体外贸政策": { tone: "cyan", motif: "ripple", kicker: "开源情报", title: "政策涟漪分析", sub: "外贸动态 · 影响传导", label: "POLICY", tags: ["政策雷达", "传导网络", "经济体"] },
    "中国国家部委新政": { tone: "cyan", motif: "document", kicker: "开源情报", title: "部委新政监控", sub: "源站采集 · 文件检索", label: "NEW", tags: ["部委源站", "政策文件", "健康监控"] },
    "全球技贸措施通报": { tone: "cyan", motif: "tbt", kicker: "开源情报", title: "TBT/SPS 通报", sub: "技贸措施 · 风险预警", label: "WTO", tags: ["通报监测", "措施检索", "预警"] },
    "信息情报查询检索": { tone: "cyan", motif: "search", kicker: "开源情报", title: "情报全文检索", sub: "多源速查 · 线索定位", label: "SEARCH", tags: ["统一查询", "全文检索", "风险速查"] },

    "关键矿产资源": { tone: "amber", motif: "minerals", kicker: "专题监控", title: "关键矿产资源", sub: "战略矿产 · 贸易流向", label: "WATCH", tags: ["镜像分析", "出口管制", "供应链"] },
    "出口管制与反制措施": { tone: "amber", motif: "shield", kicker: "专题监控", title: "出口管制反制", sub: "清单名录 · 执法案例", label: "CONTROL", tags: ["反制关税", "实体清单", "执法案例"] },
    "两用物项监控平台": { tone: "amber", motif: "cube", kicker: "专题监控", title: "两用物项监控", sub: "许可证 · 终端用户审查", label: "DUAL", tags: ["51号公告", "许可制度", "物项识别"] },
    "化肥贸易监控平台": { tone: "amber", motif: "fertilizer", kicker: "专题监控", title: "化肥贸易监控", sub: "HS3101-3105 · 氮磷钾", label: "TRADE", tags: ["全球贸易", "品类追踪", "供需变化"] },

    "信息情报价值与处置评估": { tone: "rose", motif: "task", kicker: "风控技能", title: "情报价值评估", sub: "风险文章 → 任务书", label: "SKILL", tags: ["结构化抽取", "价值评分", "处置建议"] },
    "查验结果因子化": { tone: "rose", motif: "factors", kicker: "风控技能", title: "查验因子化", sub: "记录结构化 · 因子量化", label: "FACTOR", tags: ["查验记录", "风险因子", "布控建议"] },
    "「以案找案」风险分析": { tone: "rose", motif: "case", kicker: "风控技能", title: "以案找案研判", sub: "案例比对 · 三分流", label: "CASE", tags: ["线索输入", "案例检索", "转口走私"] },
    "风险特征提取": { tone: "rose", motif: "feature", kicker: "风控技能", title: "风险特征提取", sub: "要素抽取 · 表达式生成", label: "AGENT", tags: ["特征要素", "规则生成", "协作共享"] },

    "全球海关法规标准库": { tone: "emerald", motif: "regulation", kicker: "资源工具", title: "法规标准库", sub: "法规 · 标准 · 通报", label: "KB", tags: ["3082条", "产品标准", "WTO通报"] },
    "海关数据基础参数库": { tone: "emerald", motif: "table", kicker: "资源工具", title: "基础参数库", sub: "税则8972条 · 证件代码", label: "DATA", tags: ["税则查询", "证件代码", "参数表"] },
    "贸易管制清单库": { tone: "emerald", motif: "checklist", kicker: "资源工具", title: "管制清单库", sub: "486条物项 · 型号正则", label: "LIST", tags: ["两用物项", "厂商型号", "布控表达"] },
    "UN Comtrade 数据": { tone: "emerald", motif: "database", kicker: "资源工具", title: "UN Comtrade", sub: "任务拉取 · 写入 PG", label: "API", tags: ["贸易镜像", "任务日志", "数据入库"] },
    "国际商品价格库": { tone: "emerald", motif: "commodity", kicker: "资源工具", title: "商品价格库", sub: "Pink Sheet · 月度 USD", label: "PRICE", tags: ["World Bank", "IMF", "价格曲线"] },
    "AIS 船舶轨迹数据面板": { tone: "emerald", motif: "ship", kicker: "资源工具", title: "AIS 船舶轨迹", sub: "港新分拨 · 目的港", label: "TRACK", tags: ["航线轨迹", "分拨记录", "Leaflet"] },
    "海关历史案件信息库": { tone: "emerald", motif: "archive", kicker: "资源工具", title: "历史案件库", sub: "采集 · 抽取 · 风险预测", label: "CASE DB", tags: ["走私案件", "LLM抽取", "风险预测"] },
    "全球贸易数据汇集": { tone: "emerald", motif: "pipeline", kicker: "资源工具", title: "贸易数据汇集", sub: "8源入库 · 图表报告", label: "ETL", tags: ["免费数据源", "生产入库", "源详情"] },
    "风控领域知识库": { tone: "emerald", motif: "knowledge", kicker: "资源工具", title: "风控知识库", sub: "本地资料 · 条线服务", label: "LOCAL", tags: ["本地知识", "智能体建设", "风控条线"] },
  };

  function escapeHtml(value) {
    var escapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return String(value).replace(/[&<>"']/g, function (char) {
      return escapeMap[char];
    });
  }

  function renderVisualTags(tags) {
    return tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join("");
  }

  function getMotifSvg(motif) {
    var svgs = {
      globe: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><circle cx="58" cy="58" r="31"/><path d="M27 58h62M58 27c9 9 14 19 14 31s-5 22-14 31c-9-9-14-19-14-31s5-22 14-31z"/><path d="M34 38c14 7 31 7 48 0M34 78c14-7 31-7 48 0"/><path d="M83 83l17 17"/><circle cx="90" cy="35" r="5"/><path d="M91 40l8 12"/></svg>',
      ripple: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><circle cx="58" cy="58" r="10"/><circle cx="58" cy="58" r="27"/><circle cx="58" cy="58" r="43"/><path d="M68 49l26-18M68 68l24 20M49 68L27 91"/><circle cx="96" cy="29" r="7"/><circle cx="94" cy="90" r="6"/><circle cx="25" cy="94" r="5"/></svg>',
      document: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><path d="M38 18h31l17 17v65H38z"/><path d="M69 18v18h17"/><path d="M50 48h25M50 60h25M50 72h17"/><circle cx="80" cy="82" r="14"/><path d="M74 82l5 5 9-11"/></svg>',
      tbt: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><circle cx="48" cy="57" r="26"/><path d="M22 57h52M48 31c8 8 12 16 12 26s-4 18-12 26c-8-8-12-16-12-26s4-18 12-26z"/><path d="M72 38h25v25M96 39L66 69"/><path d="M80 78h21M80 90h15"/></svg>',
      search: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><circle cx="48" cy="50" r="23"/><path d="M65 67l25 25"/><path d="M38 46h21M38 57h14"/><rect x="73" y="26" width="28" height="18" rx="4"/><rect x="20" y="78" width="38" height="16" rx="4"/></svg>',
      minerals: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><path d="M24 82l16-37 19 12 17-27 20 52z"/><path d="M40 45l8 37M59 57l-7 25M76 30l5 52"/><path d="M26 96h72"/><path d="M78 78l9-11 8 5"/></svg>',
      shield: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><path d="M60 18l34 15v24c0 24-15 42-34 49-19-7-34-25-34-49V33z"/><path d="M45 62h30M60 47v30"/><path d="M85 29l17-10M91 45h20M85 61l17 10"/></svg>',
      cube: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><path d="M60 18l38 21v42l-38 21-38-21V39z"/><path d="M60 60l38-21M60 60v42M60 60L22 39"/><path d="M43 31l38 21"/><circle cx="91" cy="86" r="10"/><path d="M87 86h8M91 82v8"/></svg>',
      fertilizer: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><path d="M35 95c-6-18-3-34 9-46 12-12 29-17 51-17-1 23-7 41-20 53-11 10-25 13-40 10z"/><path d="M37 94c17-26 33-41 51-54"/><path d="M25 87h12M25 75h20M25 63h28"/></svg>',
      task: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><rect x="27" y="20" width="55" height="78" rx="8"/><path d="M42 43h27M42 57h27M42 71h18"/><path d="M80 31h13a8 8 0 018 8v43a8 8 0 01-8 8H80"/><path d="M83 62l8 8 15-19"/></svg>',
      factors: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><path d="M24 36h72M24 60h72M24 84h72"/><circle cx="45" cy="36" r="9"/><circle cx="74" cy="60" r="9"/><circle cx="56" cy="84" r="9"/><rect x="28" y="20" width="64" height="80" rx="10"/></svg>',
      case: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><path d="M25 38h28l8 10h34v44H25z"/><circle cx="58" cy="65" r="18"/><path d="M72 79l20 20"/><path d="M48 64h20M58 54v20"/></svg>',
      feature: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><path d="M60 20l20 12v24L60 68 40 56V32z"/><path d="M31 73l18-10M89 73L71 63M60 68v22"/><circle cx="29" cy="75" r="11"/><circle cx="91" cy="75" r="11"/><circle cx="60" cy="96" r="11"/></svg>',
      regulation: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><path d="M34 20h46a8 8 0 018 8v70H34a8 8 0 01-8-8V28a8 8 0 018-8z"/><path d="M42 40h30M42 54h30M42 68h20"/><path d="M88 31l14 7v16c0 15-8 24-14 28-7-4-14-13-14-28V38z"/></svg>',
      table: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><rect x="24" y="25" width="72" height="70" rx="7"/><path d="M24 45h72M48 25v70M72 25v70M34 60h6M58 60h6M82 60h6M34 77h6M58 77h6M82 77h6"/></svg>',
      checklist: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><rect x="32" y="20" width="56" height="78" rx="8"/><path d="M47 46l6 6 12-15M47 67l6 6 12-15M70 50h8M70 71h8"/><path d="M45 89h30"/></svg>',
      database: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><ellipse cx="60" cy="32" rx="34" ry="13"/><path d="M26 32v46c0 7 15 13 34 13s34-6 34-13V32"/><path d="M26 55c0 7 15 13 34 13s34-6 34-13"/><path d="M26 78c0 7 15 13 34 13s34-6 34-13"/></svg>',
      commodity: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><path d="M36 21h48l14 25-38 53-38-53z"/><path d="M22 46h76M45 46l15 53 15-53M45 46l15-25 15 25"/><path d="M26 91c15-25 29-21 44-33 9-7 17-20 26-31"/></svg>',
      ship: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><path d="M25 79c12-8 24-8 35 0s23 8 35 0"/><path d="M30 91c12-6 23-6 34 0s22 6 33 0"/><path d="M38 70l6-35h32l7 35"/><path d="M60 35V18M50 18h20"/><path d="M22 29c22 5 39 18 51 37"/></svg>',
      archive: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><path d="M32 22h56v76l-28-15-28 15z"/><path d="M44 44h32M44 58h32M44 72h18"/><circle cx="83" cy="78" r="12"/><path d="M78 78l4 4 8-10"/></svg>',
      pipeline: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><path d="M22 36h22l12 24h22l20 25"/><path d="M22 84h22l12-24"/><rect x="18" y="28" width="28" height="18" rx="5"/><rect x="52" y="51" width="28" height="18" rx="5"/><rect x="76" y="76" width="28" height="18" rx="5"/><path d="M91 42v20M81 52h20"/></svg>',
      knowledge: '<svg viewBox="0 0 120 120" class="visual-motif" aria-hidden="true"><path d="M60 16l34 15v25c0 23-15 40-34 48-19-8-34-25-34-48V31z"/><path d="M42 42h28a10 10 0 0110 10v31H52a10 10 0 00-10 10z"/><path d="M42 42v51M52 56h18M52 69h14"/></svg>',
    };

    return svgs[motif] || svgs.globe;
  }

  function renderCardVisual(config) {
    var visual = document.createElement("div");
    visual.className = "p-visual visual-" + config.tone + " visual-" + config.motif;
    visual.setAttribute("aria-hidden", "true");
    visual.innerHTML =
      '<div class="visual-copy">' +
        '<span class="visual-kicker">' + escapeHtml(config.kicker) + ' 》</span>' +
        '<strong class="visual-title">' + escapeHtml(config.title) + '</strong>' +
        '<span class="visual-sub">' + escapeHtml(config.sub) + '</span>' +
        '<span class="visual-tags">' + renderVisualTags(config.tags) + '</span>' +
      '</div>' +
      '<div class="visual-stage">' +
        getMotifSvg(config.motif) +
        '<span class="visual-code">' + escapeHtml(config.label) + '</span>' +
      '</div>' +
      '<span class="visual-badge">重点</span>';

    return visual;
  }

  function enrichPlatformCards() {
    var cards = document.querySelectorAll(".p-card");

    cards.forEach(function (card) {
      var titleEl = card.querySelector(".p-meta b");
      var title = titleEl ? titleEl.textContent.trim() : "";
      var config = CARD_VISUALS[title];

      if (!config || card.querySelector(".p-visual")) return;

      card.insertBefore(renderCardVisual(config), card.firstElementChild);
    });
  }

  // ========== 生成瓦片图 ==========
  function renderTiles() {
    tileCanvas.innerHTML = "";

    TILES.forEach(function (t, i) {
      var tile = document.createElement("a");
      tile.href = t.link;
      tile.target = "_blank";
      tile.rel = "noopener";
      tile.className = "tile " + t.color + " tile-" + t.size;
      tile.style.order = i;

      tile.innerHTML =
        '<div class="tile-inner">' +
          '<span class="tile-title">' + t.name + '</span>' +
          '<span class="tile-sub">' + t.sub + '</span>' +
        '</div>';

      tileCanvas.appendChild(tile);
    });
  }

  // ========== 显示/隐藏瓦片图 ==========
  function showTileView() {
    heroSection.style.display = "none";
    sectionView.style.display = "none";
    tileView.classList.add("active");
    tileVisible = true;
    renderTiles();
  }

  function hideTileView() {
    tileView.classList.remove("active");
    tileVisible = false;
  }

  // ========== 一级目录切换 ==========
  function showSection(sectionId, linkEl) {
    if (sectionId === "section-arch") {
      navLinks.forEach(function (l) { l.classList.remove("active"); });
      linkEl.classList.add("active");
      hideAllSections();
      showTileView();
      currentSection = "section-arch";
      return;
    }

    hideTileView();
    navLinks.forEach(function (l) { l.classList.remove("active"); });
    linkEl.classList.add("active");

    heroSection.style.display = "none";
    sectionView.style.display = "block";

    var sections = sectionView.querySelectorAll(".platform-section");
    sections.forEach(function (s) { s.style.display = "none"; });

    var target = document.getElementById(sectionId);
    if (target) {
      target.style.display = "block";
      target.style.animation = "sectionIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
    }

    currentSection = sectionId;
  }

  function hideAllSections() {
    sectionView.style.display = "none";
    tileView.classList.remove("active");
    heroSection.style.display = "none";
  }

  function showHome() {
    hideAllSections();
    heroSection.style.display = "";
    navLinks.forEach(function (l) { l.classList.remove("active"); });
    currentSection = null;
  }

  // ========== 事件绑定 ==========
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var sectionId = link.getAttribute("data-section");

      if (currentSection === sectionId) {
        showHome();
        return;
      }

      showSection(sectionId, link);
    });
  });

  logoHome.addEventListener("click", function (e) {
    e.preventDefault();
    showHome();
  });

  overlay.addEventListener("click", function () {
    showHome();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") showHome();
  });

  window.addEventListener("resize", function () {
    if (tileVisible) renderTiles();
  });

  enrichPlatformCards();
  showHome();
})();
