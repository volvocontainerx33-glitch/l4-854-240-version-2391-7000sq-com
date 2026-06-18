import { H as Hls } from './hls-vendor.js';

function attachHls(video, source) {
  if (!video || !source) {
    return Promise.reject(new Error('播放器缺少 video 或 HLS 地址。'));
  }

  if (Hls && Hls.isSupported()) {
    return new Promise(function (resolve, reject) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(source);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        resolve();
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          reject(new Error('HLS 播放初始化失败。'));
        }
      });

      hls.attachMedia(video);
      video._hlsInstance = hls;
    });
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    return Promise.resolve();
  }

  return Promise.reject(new Error('当前浏览器不支持 HLS 播放。'));
}

function setupPlayer(shell) {
  const video = shell.querySelector('video[data-hls-source]');
  const button = shell.querySelector('[data-play-button]');
  let readyPromise = null;

  function startPlayback() {
    if (!video) {
      return;
    }

    const source = video.getAttribute('data-hls-source');
    if (!readyPromise) {
      readyPromise = attachHls(video, source);
    }

    readyPromise
      .then(function () {
        shell.classList.add('is-playing');
        return video.play();
      })
      .catch(function (error) {
        shell.classList.remove('is-playing');
        if (button) {
          button.innerHTML = '<span>!</span> 播放器初始化失败';
        }
        window.console.error(error);
      });
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
  }
}

Array.from(document.querySelectorAll('[data-player-shell]')).forEach(setupPlayer);
