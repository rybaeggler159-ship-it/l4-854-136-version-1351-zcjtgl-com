var MoviePlayer = (function () {
  function init(id, streamUrl) {
    var root = document.getElementById(id);
    if (!root) {
      return;
    }
    var video = root.querySelector("video");
    var cover = root.querySelector(".player-cover");
    var playButton = root.querySelector(".player-play");
    var loaded = false;
    var hls = null;

    function attach() {
      if (!video || loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      loaded = true;
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    if (playButton) {
      playButton.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!loaded) {
          start();
        } else if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
      video.addEventListener("ended", function () {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  return {
    init: init
  };
})();
