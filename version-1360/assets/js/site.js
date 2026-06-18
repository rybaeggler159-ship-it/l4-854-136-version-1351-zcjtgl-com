(function () {
  function text(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenus() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.textContent = nav.classList.contains("open") ? "×" : "☰";
    });
  }

  function setupHeaderSearch() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot) {
        dot.classList.toggle("is-active", Number(dot.getAttribute("data-hero-dot")) === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")));
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-card-list]");
    if (!panel || !list) {
      return;
    }
    var input = panel.querySelector("[data-page-search]");
    var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-field]"));
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input && query) {
      input.value = query;
    }

    function cardMatches(card) {
      var q = input ? text(input.value) : "";
      var haystack = text([
        card.getAttribute("data-title"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.textContent
      ].join(" "));

      if (q && haystack.indexOf(q) === -1) {
        return false;
      }

      return selects.every(function (select) {
        var field = select.getAttribute("data-filter-field");
        var expected = text(select.value);
        var actual = text(card.getAttribute("data-" + field));
        return !expected || actual.indexOf(expected) !== -1;
      });
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var matched = cardMatches(card);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible > 0;
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    apply();
  }

  window.setupMoviePlayer = function (source) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playerOverlay");
    if (!video || !source) {
      return;
    }
    var started = false;
    var hls = null;

    function attach() {
      if (started) {
        return;
      }
      started = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }
      video.src = source;
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener("click", attach);
    }
    video.addEventListener("click", function () {
      if (!started) {
        attach();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenus();
    setupHeaderSearch();
    setupHero();
    setupFilters();
  });
})();
