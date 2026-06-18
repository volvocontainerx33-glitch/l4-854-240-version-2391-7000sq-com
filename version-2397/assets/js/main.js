(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero-carousel");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 6500);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    hero.addEventListener("mouseenter", function () {
      clearInterval(timer);
    });
    hero.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".site-search"));
    if (!inputs.length) {
      return;
    }

    inputs.forEach(function (input) {
      var scope = input.closest("section") || document;
      var buttons = Array.prototype.slice.call(scope.querySelectorAll(".filter-button"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".js-card"));
      var activeFilter = "all";

      function apply() {
        var keyword = normalize(input.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var category = normalize(card.getAttribute("data-category"));
          var type = normalize(card.getAttribute("data-type"));
          var filter = normalize(activeFilter);
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchFilter = filter === "all" || category === filter || type === filter || text.indexOf(filter) !== -1;
          card.classList.toggle("is-hidden", !(matchKeyword && matchFilter));
        });
      }

      input.addEventListener("input", apply);
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          activeFilter = button.getAttribute("data-filter") || "all";
          apply();
        });
      });
      apply();
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
