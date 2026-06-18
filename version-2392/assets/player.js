(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function bindPlayer(frame) {
    var video = frame.querySelector('video[data-stream]');
    var button = frame.querySelector('[data-play-button]');
    var hlsInstance = null;
    var started = false;

    if (!video || !button) {
      return;
    }

    function startPlayback() {
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }

      if (!started) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          frame.classList.add('has-error');
          button.innerHTML = '<span class="play-circle">!</span><span>视频暂时无法加载</span>';
          return;
        }
        started = true;
      }

      var playPromise = video.play();
      frame.classList.add('is-playing');
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          frame.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      startPlayback();
    });

    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        frame.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(bindPlayer);
  });
})();
