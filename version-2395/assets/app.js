(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    setupMenu();
    setupCarousel();
    setupSearch();
    setupPlayers();
  });

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-target-slide")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearch() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".search-panel"));
    panels.forEach(function (panel) {
      var input = panel.querySelector(".movie-search");
      var state = panel.querySelector(".search-state");
      var chips = Array.prototype.slice.call(panel.querySelectorAll(".filter-chip"));
      var section = panel.closest(".movie-list-section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
      var filter = "";

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesFilter = !filter || haystack.indexOf(filter.toLowerCase()) !== -1;
          var show = matchesQuery && matchesFilter;
          card.classList.toggle("is-filtered-out", !show);
          if (show) {
            visible += 1;
          }
        });
        if (state) {
          state.textContent = visible ? "已显示匹配内容" : "没有找到匹配内容";
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("active");
          });
          chip.classList.add("active");
          filter = chip.getAttribute("data-filter") || "";
          apply();
        });
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (card) {
      var video = card.querySelector("video[data-stream]");
      var button = card.querySelector(".play-layer");
      var attached = false;
      var hlsInstance = null;

      if (!video || !button) {
        return;
      }

      function attach() {
        return new Promise(function (resolve) {
          if (attached) {
            resolve();
            return;
          }

          var url = video.getAttribute("data-stream");
          if (!url) {
            resolve();
            return;
          }

          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            attached = true;
            resolve();
            return;
          }

          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              attached = true;
              resolve();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
              if (data && data.fatal && hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
                video.src = url;
                attached = true;
                resolve();
              }
            });
            window.setTimeout(function () {
              if (!attached) {
                attached = true;
                resolve();
              }
            }, 1800);
            return;
          }

          video.src = url;
          attached = true;
          resolve();
        });
      }

      function play() {
        button.classList.add("is-hidden");
        attach().then(function () {
          var action = video.play();
          if (action && typeof action.catch === "function") {
            action.catch(function () {
              button.classList.remove("is-hidden");
            });
          }
        });
      }

      button.addEventListener("click", play);
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          button.classList.remove("is-hidden");
        }
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    });
  }
})();
