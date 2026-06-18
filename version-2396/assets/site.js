(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".primary-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initSearch() {
    var panel = document.querySelector("[data-search-panel]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var openButtons = document.querySelectorAll(".search-open, [data-open-search]");
    var closeButton = document.querySelector(".search-close");
    var data = window.movieSearchData || [];

    if (!panel || !input || !results) {
      return;
    }

    function openPanel() {
      panel.hidden = false;
      setTimeout(function () {
        input.focus();
      }, 30);
    }

    function closePanel() {
      panel.hidden = true;
      input.value = "";
      results.innerHTML = "";
    }

    openButtons.forEach(function (button) {
      button.addEventListener("click", openPanel);
    });

    if (closeButton) {
      closeButton.addEventListener("click", closePanel);
    }

    panel.addEventListener("click", function (event) {
      if (event.target === panel) {
        closePanel();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) {
        closePanel();
      }
    });

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        results.innerHTML = "";
        return;
      }
      var matches = data.filter(function (item) {
        return [item.title, item.region, item.category, item.genre, item.desc]
          .join(" ")
          .toLowerCase()
          .indexOf(query) !== -1;
      }).slice(0, 14);

      if (!matches.length) {
        results.innerHTML = "<p>没有找到匹配内容</p>";
        return;
      }

      results.innerHTML = matches.map(function (item) {
        return "<a class=\"search-result-link\" href=\"" + escapeHtml(item.url) + "\">" +
          "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\">" +
          "<span><strong>" + escapeHtml(item.title) + "</strong>" +
          "<em>" + escapeHtml(item.region) + " · " + escapeHtml(item.year) + " · " + escapeHtml(item.category) + "</em></span>" +
          "</a>";
      }).join("");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function startVideo(video) {
    var source = video.getAttribute("data-stream");
    if (!source) {
      return;
    }

    function play() {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (video.dataset.ready === "1") {
      play();
      return;
    }

    video.dataset.ready = "1";

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      play();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, play);
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        }
      });
      video._hls = hls;
      return;
    }

    video.src = source;
    play();
  }

  function initPlayer() {
    document.querySelectorAll("[data-player-card]").forEach(function (card) {
      var video = card.querySelector("video");
      var trigger = card.querySelector("[data-play-trigger]");
      if (!video || !trigger) {
        return;
      }

      function begin() {
        trigger.classList.add("is-hidden");
        startVideo(video);
      }

      trigger.addEventListener("click", begin);
      video.addEventListener("click", function () {
        if (video.paused) {
          startVideo(video);
        }
      });
      video.addEventListener("play", function () {
        trigger.classList.add("is-hidden");
      });
    });
  }

  ready(function () {
    initNavigation();
    initSearch();
    initHero();
    initPlayer();
  });
})();
