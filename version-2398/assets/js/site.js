(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
      document.body.classList.toggle('nav-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var active = 0;
    var timer = null;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function startCarousel() {
      stopCarousel();
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    function stopCarousel() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-slide') || 0);
        showSlide(next);
        startCarousel();
      });
    });

    carousel.addEventListener('mouseenter', stopCarousel);
    carousel.addEventListener('mouseleave', startCarousel);
    startCarousel();
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('.filter-panel').forEach(function (panel) {
    var targetSelector = panel.getAttribute('data-target');
    var target = targetSelector ? document.querySelector(targetSelector) : null;
    if (!target) {
      return;
    }
    var searchInput = panel.querySelector('.js-card-search');
    var typeSelect = panel.querySelector('.js-type-filter');
    var empty = target.parentElement ? target.parentElement.querySelector('.empty-state') : null;
    var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));

    function applyFilters() {
      var keyword = normalizeText(searchInput ? searchInput.value : '');
      var type = normalizeText(typeSelect ? typeSelect.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalizeText([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var cardType = normalizeText(card.getAttribute('data-type'));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedType = !type || cardType.indexOf(type) !== -1;
        var matched = matchedKeyword && matchedType;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilters);
    }
  });

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function resultCard(movie) {
    var title = escapeHtml(movie.title);
    var year = escapeHtml(movie.year);
    var region = escapeHtml(movie.region);
    var type = escapeHtml(movie.type);
    var genre = escapeHtml(movie.genre);
    var url = escapeHtml(movie.url);
    var cover = escapeHtml(movie.cover);
    return [
      '<a class="search-result-card" href="' + url + '">',
      '<img src="' + cover + '" alt="' + title + '">',
      '<span>',
      '<h3>' + title + '</h3>',
      '<p>' + year + ' · ' + region + ' · ' + type + '</p>',
      '<p>' + genre + '</p>',
      '</span>',
      '</a>'
    ].join('');
  }

  document.querySelectorAll('[data-global-search]').forEach(function (input) {
    var output = document.querySelector('[data-global-results]');
    var index = window.MOVIE_SEARCH_INDEX || [];

    if (!output) {
      return;
    }

    input.addEventListener('input', function () {
      var keyword = normalizeText(input.value);
      if (!keyword) {
        output.innerHTML = '';
        return;
      }
      var results = index.filter(function (movie) {
        return normalizeText(movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.year + ' ' + movie.genre).indexOf(keyword) !== -1;
      }).slice(0, 12);
      output.innerHTML = results.map(resultCard).join('');
    });
  });
})();
