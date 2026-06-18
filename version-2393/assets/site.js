(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    let timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(nextIndex);
        startAutoPlay();
      });
    });

    hero.addEventListener('mouseenter', stopAutoPlay);
    hero.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');
  const filterGrid = document.querySelector('[data-filter-grid]');

  if (filterPanel && filterGrid) {
    const cards = Array.from(filterGrid.querySelectorAll('[data-movie-card]'));
    const searchInput = filterPanel.querySelector('[data-filter-search]');
    const yearSelect = filterPanel.querySelector('[data-filter-year]');
    const regionInput = filterPanel.querySelector('[data-filter-region]');
    const regionSelect = filterPanel.querySelector('[data-filter-region-select]');
    const typeSelect = filterPanel.querySelector('[data-filter-type]');
    const resetButton = filterPanel.querySelector('[data-filter-reset]');
    const countNode = filterPanel.querySelector('[data-filter-count]');

    function includesText(source, keyword) {
      return !keyword || source.indexOf(keyword) !== -1;
    }

    function applyFilter() {
      const keyword = (searchInput && searchInput.value || '').trim().toLowerCase();
      const year = (yearSelect && yearSelect.value || '').trim();
      const region = ((regionInput && regionInput.value) || (regionSelect && regionSelect.value) || '').trim().toLowerCase();
      const type = (typeSelect && typeSelect.value || '').trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach(function (card) {
        const title = (card.dataset.title || '').toLowerCase();
        const tags = (card.dataset.tags || '').toLowerCase();
        const cardRegion = (card.dataset.region || '').toLowerCase();
        const cardType = (card.dataset.type || '').toLowerCase();
        const cardYear = card.dataset.year || '';
        const keywordSource = title + ' ' + tags + ' ' + cardRegion + ' ' + cardType + ' ' + cardYear;
        const matched = includesText(keywordSource, keyword) &&
          (!year || cardYear === year) &&
          includesText(cardRegion, region) &&
          includesText(cardType, type);

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visibleCount += 1;
        }
      });

      if (countNode) {
        countNode.textContent = visibleCount + ' 部';
      }
    }

    [searchInput, yearSelect, regionInput, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        [searchInput, yearSelect, regionInput, regionSelect, typeSelect].forEach(function (control) {
          if (control) {
            control.value = '';
          }
        });
        applyFilter();
      });
    }
  }
})();
