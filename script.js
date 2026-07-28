(function () {
  "use strict";

  var navLinks = document.querySelectorAll(".nav-link");
  var archView = document.getElementById("archView");
  var sectionView = document.getElementById("sectionView");
  var heroSection = document.getElementById("heroSection");
  var archCanvas = document.getElementById("archCanvas");
  var archCore = document.getElementById("archCore");
  var archNodes = document.querySelectorAll(".arch-node");
  var archLines = document.getElementById("archLines");
  var logoHome = document.getElementById("logoHome");
  var overlay = document.getElementById("overlay");

  var currentSection = null;
  var archExpanded = false;
  var archAnimating = false;

  // ========== 架构图：计算节点位置并绘制连接线 ==========
  function layoutArchNodes() {
    var w = archCanvas.offsetWidth;
    var h = archCanvas.offsetHeight;
    var cx = w / 2;
    var cy = h / 2;
    var scale = Math.min(w, h) / 1200; // 自适应缩放

    archNodes.forEach(function (node) {
      var angle = parseFloat(node.getAttribute("data-angle")) * Math.PI / 180;
      var dist = parseFloat(node.getAttribute("data-dist")) * scale;
      var x = cx + Math.cos(angle) * dist;
      var y = cy + Math.sin(angle) * dist;
      node.style.left = x + "px";
      node.style.top = y + "px";
    });

    drawArchLines(cx, cy, scale);
  }

  function drawArchLines(cx, cy, scale) {
    var svg = archLines;
    svg.setAttribute("width", archCanvas.offsetWidth);
    svg.setAttribute("height", archCanvas.offsetHeight);
    svg.innerHTML = "";

    // 绘制中心到各层的连接线
    var layers = {};
    archNodes.forEach(function (node) {
      var layer = node.getAttribute("data-layer");
      if (!layers[layer]) layers[layer] = [];
      layers[layer].push(node);
    });

    // 同层节点之间的弧线
    Object.keys(layers).forEach(function (layer) {
      var nodes = layers[layer];
      var color = getLayerColor(layer);
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j];
          var ax = parseFloat(a.style.left), ay = parseFloat(a.style.top);
          var bx = parseFloat(b.style.left), by = parseFloat(b.style.top);
          var midX = (ax + bx) / 2, midY = (ay + by) / 2;
          // 向中心偏移的控制点
          var ctrlX = midX + (cx - midX) * 0.25;
          var ctrlY = midY + (cy - midY) * 0.25;
          var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", "M" + ax + "," + ay + " Q" + ctrlX + "," + ctrlY + " " + bx + "," + by);
          path.setAttribute("fill", "none");
          path.setAttribute("stroke", color);
          path.setAttribute("stroke-width", "1");
          path.setAttribute("opacity", "0.35");
          path.setAttribute("class", "arch-line");
          svg.appendChild(path);
        }
      }
    });

    // 中心到各节点的射线
    archNodes.forEach(function (node) {
      var x = parseFloat(node.style.left), y = parseFloat(node.style.top);
      var layer = node.getAttribute("data-layer");
      var color = getLayerColor(layer);
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", cx); line.setAttribute("y1", cy);
      line.setAttribute("x2", x); line.setAttribute("y2", y);
      line.setAttribute("stroke", color);
      line.setAttribute("stroke-width", "1.5");
      line.setAttribute("opacity", "0.2");
      line.setAttribute("class", "arch-line");
      line.setAttribute("stroke-dasharray", "4 4");
      svg.appendChild(line);
    });
  }

  function getLayerColor(layer) {
    var map = { sense: "#0891b2", analyze: "#4f46e5", monitor: "#d97706", data: "#059669", standard: "#7c3aed" };
    return map[layer] || "#5c6b8a";
  }

  // ========== 架构图展开/收缩动画 ==========
  function expandArch() {
    if (archAnimating || archExpanded) return;
    archAnimating = true;
    archExpanded = true;

    // 隐藏 hero 和 sectionView
    heroSection.style.display = "none";
    sectionView.style.display = "none";
    archView.classList.add("active");

    // 布局节点
    layoutArchNodes();

    // 中心枢纽动画
    archCore.classList.add("expanded");

    // 节点从中心向外扩散
    archNodes.forEach(function (node, i) {
      var card = node.querySelector(".arch-node-card");
      card.style.opacity = "0";
      card.style.transform = "translate(-50%, -50%) scale(0.3)";
      card.style.transition = "none";

      setTimeout(function () {
        card.style.transition = "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
        card.style.opacity = "1";
        card.style.transform = "translate(-50%, -50%) scale(1)";
      }, 80 + i * 40);
    });

    // 连接线淡入
    setTimeout(function () {
      var lines = archLines.querySelectorAll(".arch-line");
      lines.forEach(function (line, i) {
        line.style.opacity = "0";
        line.style.transition = "opacity 0.5s ease";
        setTimeout(function () { line.style.opacity = line.getAttribute("opacity") || "0.35"; }, i * 15);
      });
      archAnimating = false;
    }, 300);

    // 标签显示
    var labels = document.querySelector(".arch-labels");
    if (labels) labels.classList.add("show");
  }

  function collapseArch() {
    if (archAnimating || !archExpanded) return;
    archAnimating = true;
    archExpanded = false;

    // 节点向中心收缩
    archNodes.forEach(function (node, i) {
      var card = node.querySelector(".arch-node-card");
      setTimeout(function () {
        card.style.transition = "all 0.5s cubic-bezier(0.55, 0, 0.55, 0.2)";
        card.style.opacity = "0";
        card.style.transform = "translate(-50%, -50%) scale(0.3)";
      }, i * 25);
    });

    // 连接线淡出
    var lines = archLines.querySelectorAll(".arch-line");
    lines.forEach(function (line) {
      line.style.transition = "opacity 0.3s ease";
      line.style.opacity = "0";
    });

    // 中心枢纽收缩
    archCore.classList.remove("expanded");

    // 标签隐藏
    var labels = document.querySelector(".arch-labels");
    if (labels) labels.classList.remove("show");

    // 恢复 hero
    setTimeout(function () {
      archView.classList.remove("active");
      heroSection.style.display = "";
      archAnimating = false;
    }, 600);
  }

  // ========== 一级目录切换 ==========
  function showSection(sectionId, linkEl) {
    // 如果点击的是智能体协同
    if (sectionId === "section-arch") {
      if (archExpanded) {
        collapseArch();
      } else {
        // 先关闭其他 section
        sectionView.style.display = "none";
        currentSection = null;
        navLinks.forEach(function (l) { l.classList.remove("active"); });
        linkEl.classList.add("active");
        expandArch();
      }
      return;
    }

    // 点击其他目录：收缩架构图（如果展开）
    if (archExpanded) {
      collapseArch();
      // 延迟显示 section，等待收缩动画
      setTimeout(function () {
        showSectionContent(sectionId, linkEl);
      }, 500);
    } else {
      showSectionContent(sectionId, linkEl);
    }
  }

  function showSectionContent(sectionId, linkEl) {
    // 更新导航激活状态
    navLinks.forEach(function (l) { l.classList.remove("active"); });
    linkEl.classList.add("active");

    // 隐藏架构图
    archView.classList.remove("active");
    archExpanded = false;

    // 隐藏 hero
    heroSection.style.display = "none";

    // 显示 sectionView
    sectionView.style.display = "block";

    // 隐藏所有 section
    var sections = sectionView.querySelectorAll(".platform-section");
    sections.forEach(function (s) { s.style.display = "none"; });

    // 显示目标 section
    var target = document.getElementById(sectionId);
    if (target) {
      target.style.display = "block";
      target.style.animation = "sectionIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
    }

    currentSection = sectionId;
  }

  function showHome() {
    // 收缩架构图
    if (archExpanded) {
      collapseArch();
    }

    // 隐藏 sectionView
    sectionView.style.display = "none";

    // 显示 hero
    heroSection.style.display = "";

    // 清除导航激活
    navLinks.forEach(function (l) { l.classList.remove("active"); });
    currentSection = null;
  }

  // ========== 事件绑定 ==========
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var sectionId = link.getAttribute("data-section");

      // 如果当前已激活且不是架构图，则返回首页
      if (currentSection === sectionId && sectionId !== "section-arch") {
        showHome();
        return;
      }

      showSection(sectionId, link);
    });
  });

  // Logo 点击返回首页
  logoHome.addEventListener("click", function (e) {
    e.preventDefault();
    showHome();
  });

  // 遮罩点击
  overlay.addEventListener("click", function () {
    if (archExpanded) collapseArch();
    else showHome();
  });

  // ESC 键
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (archExpanded) collapseArch();
      else showHome();
    }
  });

  // 架构图节点点击跳转
  document.querySelectorAll(".arch-node-card").forEach(function (card) {
    card.addEventListener("click", function () {
      var link = card.getAttribute("data-link");
      if (link) window.open(link, "_blank");
    });
  });

  // 窗口 resize 时重新布局架构图
  window.addEventListener("resize", function () {
    if (archExpanded) layoutArchNodes();
  });

  // 初始化：默认显示首页
  showHome();
})();
