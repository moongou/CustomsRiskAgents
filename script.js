(function () {
  "use strict";

  var navLinks = document.querySelectorAll(".nav-link");
  var megaPanel = document.getElementById("megaPanel");
  var overlay = document.getElementById("overlay");
  var panelContents = document.querySelectorAll(".panel-content");
  var currentPanel = null;

  function openPanel(panelId, linkEl) {
    navLinks.forEach(function (l) { l.classList.remove("active"); });
    linkEl.classList.add("active");

    panelContents.forEach(function (p) { p.classList.remove("show"); });
    var target = document.getElementById(panelId);
    if (target) { target.classList.add("show"); }

    megaPanel.classList.add("open");
    overlay.classList.add("show");
    currentPanel = panelId;
  }

  function closePanel() {
    megaPanel.classList.remove("open");
    overlay.classList.remove("show");
    navLinks.forEach(function (l) { l.classList.remove("active"); });
    currentPanel = null;
  }

  function togglePanel(panelId, linkEl) {
    if (currentPanel === panelId) {
      closePanel();
    } else {
      openPanel(panelId, linkEl);
    }
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var panelId = link.getAttribute("data-panel");
      togglePanel(panelId, link);
    });
  });

  overlay.addEventListener("click", closePanel);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closePanel(); }
  });

  document.addEventListener("click", function (e) {
    if (!megaPanel.contains(e.target) && !e.target.closest(".main-nav")) {
      closePanel();
    }
  });

  // 搜索框过滤平台卡片
  var searchInput = document.querySelector(".search-box input");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      var kw = searchInput.value.trim().toLowerCase();
      document.querySelectorAll(".p-card").forEach(function (card) {
        var text = card.textContent.toLowerCase();
        card.style.display = !kw || text.indexOf(kw) !== -1 ? "" : "none";
      });
    });
  }
})();