function initMoviePlayer(videoId, overlayId, streamUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var loaded = false;
  var instance = null;

  if (!video || !overlay || !streamUrl) {
    return;
  }

  function loadStream() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      instance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      instance.loadSource(streamUrl);
      instance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
    video.load();
  }

  function startVideo() {
    loadStream();
    overlay.classList.add("is-hidden");
    var request = video.play();

    if (request && typeof request.catch === "function") {
      request.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", startVideo);
  overlay.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      startVideo();
    }
  });

  video.addEventListener("click", function () {
    if (video.paused) {
      startVideo();
    }
  });

  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });

  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });

  window.addEventListener("beforeunload", function () {
    if (instance) {
      instance.destroy();
    }
  });
}

(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel.hidden = expanded;
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });

      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var category = panel.querySelector("[data-filter-category]");
      var year = panel.querySelector("[data-filter-year]");
      var grid = document.querySelector("[data-card-grid]");
      var empty = document.querySelector("[data-empty-state]");

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function apply() {
        var query = normalize(input ? input.value : "");
        var selectedCategory = normalize(category ? category.value : "");
        var selectedYear = normalize(year ? year.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var keywords = normalize(card.getAttribute("data-keywords"));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matchesQuery = !query || keywords.indexOf(query) !== -1;
          var matchesCategory = !selectedCategory || cardCategory === selectedCategory;
          var matchesYear = !selectedYear || cardYear === selectedYear;
          var shouldShow = matchesQuery && matchesCategory && matchesYear;

          card.hidden = !shouldShow;

          if (shouldShow) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      if (category) {
        category.addEventListener("change", apply);
      }

      if (year) {
        year.addEventListener("change", apply);
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");

      if (q && input) {
        input.value = q;
      }

      apply();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
