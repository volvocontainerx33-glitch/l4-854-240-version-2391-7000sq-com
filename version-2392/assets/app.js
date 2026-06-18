(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function setupLocalFilters() {
    var input = document.querySelector('[data-filter-input]');
    var area = document.querySelector('[data-filter-area]');
    if (!input || !area) {
      return;
    }
    var cards = selectAll('[data-card]', area);
    var pills = selectAll('[data-filter-value]');
    var activeValue = '';

    function applyFilters() {
      var query = normalize(input.value);
      var selected = normalize(activeValue);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-filter-text'));
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesPill = !selected || text.indexOf(selected) !== -1;
        card.classList.toggle('is-hidden', !(matchesQuery && matchesPill));
      });
    }

    input.addEventListener('input', applyFilters);
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        activeValue = pill.getAttribute('data-filter-value') || '';
        pills.forEach(function (item) {
          item.classList.toggle('is-active', item === pill);
        });
        applyFilters();
      });
    });
  }

  function setupImageFallbacks() {
    selectAll('img.poster-image').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-hidden');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroSlider();
    setupLocalFilters();
    setupImageFallbacks();
  });
})();
