(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function textOf(value) {
    return String(value || "").toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.getElementById("mobileNav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = nav.classList.toggle("open");
      document.body.classList.toggle("menu-open", opened);
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });
    slider.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    slider.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function setupFiltering() {
    var panel = document.querySelector("[data-filter-panel]");
    var items = Array.prototype.slice.call(document.querySelectorAll(".search-item"));
    if (!panel || !items.length) {
      return;
    }
    var input = panel.querySelector("[data-filter-keyword]");
    var type = panel.querySelector("[data-filter-type]");
    var region = panel.querySelector("[data-filter-region]");
    var year = panel.querySelector("[data-filter-year]");
    var reset = panel.querySelector("[data-filter-reset]");
    var empty = document.querySelector(".empty-state");

    function apply() {
      var keyword = textOf(input && input.value).trim();
      var typeValue = type ? type.value : "";
      var regionValue = region ? region.value : "";
      var yearValue = year ? year.value : "";
      var visible = 0;
      items.forEach(function (item) {
        var haystack = [
          item.getAttribute("data-title"),
          item.getAttribute("data-region"),
          item.getAttribute("data-type"),
          item.getAttribute("data-year"),
          item.getAttribute("data-genre"),
          item.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (typeValue && item.getAttribute("data-type") !== typeValue) {
          matched = false;
        }
        if (regionValue && item.getAttribute("data-region") !== regionValue) {
          matched = false;
        }
        if (yearValue && item.getAttribute("data-year") !== yearValue) {
          matched = false;
        }
        item.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    [input, type, region, year].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (type) {
          type.value = "";
        }
        if (region) {
          region.value = "";
        }
        if (year) {
          year.value = "";
        }
        apply();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
    }
    apply();
  }

  ready(function () {
    setupMenu();
    setupHeroSlider();
    setupFiltering();
  });

  window.initMoviePlayer = function (videoId, layerId, streamUrl) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    var hlsInstance = null;
    var attached = false;

    if (!video || !layer || !streamUrl) {
      return;
    }

    function bindStream() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startPlayback() {
      bindStream();
      video.controls = true;
      layer.classList.add("is-hidden");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          video.controls = true;
          layer.classList.remove("is-hidden");
        });
      }
    }

    layer.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      layer.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
