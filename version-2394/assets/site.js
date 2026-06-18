(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
      });
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        showSlide(itemIndex);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var scope = panel.parentElement || document;
    var input = panel.querySelector('[data-filter-input]');
    var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.js-card'));
    var empty = scope.querySelector('[data-empty-state]');

    function includesText(card, query) {
      if (!query) {
        return true;
      }

      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();

      return text.indexOf(query) !== -1;
    }

    function matchesSelects(card) {
      return selects.every(function (select) {
        var key = select.getAttribute('data-filter-select');
        var value = select.value;

        if (!value) {
          return true;
        }

        return card.getAttribute('data-' + key) === value;
      });
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matched = includesText(card, query) && matchesSelects(card);
        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilter);
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play]');
    var message = player.querySelector('[data-player-message]');
    var stream = player.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    function showMessage() {
      if (message) {
        message.hidden = false;
      }
    }

    function prepareVideo() {
      if (ready || !video || !stream) {
        return;
      }

      ready = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        showMessage();
      }
    }

    function playVideo() {
      prepareVideo();
      player.classList.add('is-active');

      if (video) {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            player.classList.remove('is-active');
          });
        }
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          playVideo();
        }
      });
      video.addEventListener('error', showMessage);
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });

  var playerLinks = Array.prototype.slice.call(document.querySelectorAll('[data-scroll-player]'));

  playerLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      var player = document.querySelector('[data-player]');

      if (player) {
        event.preventDefault();
        player.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        var button = player.querySelector('[data-play]');

        if (button) {
          button.click();
        }
      }
    });
  });
}());
