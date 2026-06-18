function initMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var button = document.getElementById(config.buttonId);
  var source = config.source;
  var hls = null;
  var ready = false;

  if (!video || !button || !source) {
    return;
  }

  function attachSource() {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      ready = true;
      return;
    }

    video.src = source;
    ready = true;
  }

  function playVideo() {
    attachSource();
    video.controls = true;
    button.classList.add('is-hidden');
    var playing = video.play();
    if (playing && typeof playing.catch === 'function') {
      playing.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      playVideo();
    }
  });
  video.addEventListener('ended', function () {
    button.classList.remove('is-hidden');
  });
  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
