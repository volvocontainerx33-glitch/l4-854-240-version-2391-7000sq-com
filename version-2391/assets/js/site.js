(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      const isOpen = panel.hasAttribute("hidden") === false;
      if (isOpen) {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      } else {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
      }
    });
  }

  function initHero() {
    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length === 0) {
      return;
    }
    let current = 0;
    let timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    show(0);
    start();
  }

  function initFilters() {
    const list = document.querySelector(".js-card-list");
    if (!list) {
      return;
    }
    const input = document.querySelector(".js-card-filter");
    const year = document.querySelector(".js-year-filter");
    const buttons = Array.from(document.querySelectorAll(".js-sort"));
    const cards = Array.from(list.querySelectorAll("[data-search]"));
    const initial = cards.slice();

    function applyFilter() {
      const keyword = input ? input.value.trim().toLowerCase() : "";
      const yearValue = year ? year.value : "";
      cards.forEach(function (card) {
        const text = (card.getAttribute("data-search") || "").toLowerCase();
        const cardYear = card.getAttribute("data-year") || "";
        const matchedKeyword = keyword === "" || text.indexOf(keyword) !== -1;
        const matchedYear = yearValue === "" || cardYear.indexOf(yearValue) !== -1;
        card.classList.toggle("hidden-card", !(matchedKeyword && matchedYear));
      });
    }

    function applySort(mode) {
      buttons.forEach(function (button) {
        button.classList.toggle("active", button.getAttribute("data-sort") === mode);
      });
      const ordered = initial.slice();
      if (mode === "latest") {
        ordered.sort(function (a, b) {
          return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
        });
      }
      if (mode === "views") {
        ordered.sort(function (a, b) {
          return Number(b.getAttribute("data-views") || 0) - Number(a.getAttribute("data-views") || 0);
        });
      }
      ordered.forEach(function (card) {
        list.appendChild(card);
      });
      applyFilter();
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (year) {
      year.addEventListener("change", applyFilter);
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        applySort(button.getAttribute("data-sort") || "default");
      });
    });
    applyFilter();
  }

  function initPlayer() {
    document.querySelectorAll(".js-player").forEach(function (player) {
      const video = player.querySelector("video");
      const overlay = player.querySelector(".play-overlay");
      const message = player.querySelector(".player-message");
      const source = player.getAttribute("data-source");
      let prepared = false;
      let hls = null;

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.removeAttribute("hidden");
      }

      function prepare() {
        if (prepared || !video || !source) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage("视频加载失败，请稍后重试。");
            }
          });
        } else {
          showMessage("当前浏览器不支持此视频播放。");
        }
      }

      function start() {
        prepare();
        player.classList.add("is-started");
        const attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            player.classList.remove("is-started");
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-started");
        });
        video.addEventListener("ended", function () {
          player.classList.remove("is-started");
        });
      }
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildSearchCard(item) {
    return [
      '<a class="movie-card" href="' + escapeHtml(item.href) + '">',
      '  <span class="poster-wrap">',
      '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="badge">' + escapeHtml(item.category) + '</span>',
      '    <span class="year-badge">' + escapeHtml(item.year) + '</span>',
      '  </span>',
      '  <span class="card-body">',
      '    <strong>' + escapeHtml(item.title) + '</strong>',
      '    <span class="card-desc">' + escapeHtml(item.description) + '</span>',
      '    <span class="card-meta">' + escapeHtml(item.genre) + ' · ' + escapeHtml(item.region) + '</span>',
      '  </span>',
      '</a>'
    ].join("");
  }

  function initSearchPage() {
    const results = document.querySelector(".js-search-results");
    const status = document.querySelector(".js-search-status");
    const input = document.querySelector(".js-search-input");
    if (!results || !status || !window.SEARCH_INDEX) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matched = window.SEARCH_INDEX.filter(function (item) {
      const haystack = [
        item.title,
        item.description,
        item.genre,
        item.region,
        item.category,
        item.year,
        (item.tags || []).join(" ")
      ].join(" ").toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);
    status.textContent = matched.length ? '“' + query + '” 的相关内容' : '没有找到与“' + query + '”匹配的内容。';
    results.innerHTML = matched.map(buildSearchCard).join("");
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
    initSearchPage();
  });
})();
