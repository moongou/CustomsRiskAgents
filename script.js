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

  showHome();
})();
