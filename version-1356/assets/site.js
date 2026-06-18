(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
      var index = 0;
      var timer = null;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function play() {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          show(i);
          play();
        });
      });

      show(0);
      play();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panelEl) {
      var scope = panelEl.closest(".content-wrap") || document;
      var search = panelEl.querySelector("[data-local-search]");
      var region = panelEl.querySelector("[data-region-filter]");
      var type = panelEl.querySelector("[data-type-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

      function apply() {
        var q = normalize(search && search.value);
        var r = region && region.value;
        var t = type && type.value;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-category")
          ].join(" "));
          var ok = true;

          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (r && card.getAttribute("data-region") !== r) {
            ok = false;
          }
          if (t && card.getAttribute("data-type") !== t) {
            ok = false;
          }

          card.hidden = !ok;
        });
      }

      [search, region, type].forEach(function (input) {
        if (input) {
          input.addEventListener("input", apply);
          input.addEventListener("change", apply);
        }
      });
    });

    var searchRoot = document.getElementById("searchResults");
    var searchForm = document.getElementById("siteSearchForm");

    if (searchRoot && typeof SITE_SEARCH_INDEX !== "undefined") {
      var params = new URLSearchParams(window.location.search);
      var queryInput = document.getElementById("searchQuery");
      var regionInput = document.getElementById("searchRegion");
      var q = params.get("q") || "";
      var r = params.get("region") || "";

      if (queryInput) {
        queryInput.value = q;
      }
      if (regionInput) {
        regionInput.value = r;
      }

      function makeCard(item) {
        return [
          '<article class="movie-card" data-card data-title="', escapeHtml(item.title), '" data-region="', escapeHtml(item.region), '" data-type="', escapeHtml(item.type), '" data-year="', escapeHtml(item.year), '">',
          '<a class="poster-link" href="', escapeHtml(item.url), '" aria-label="', escapeHtml(item.title), '">',
          '<img src="', escapeHtml(item.image), '" alt="', escapeHtml(item.title), '" loading="lazy">',
          '<span class="play-chip">播放</span>',
          '</a>',
          '<div class="card-body">',
          '<h2><a href="', escapeHtml(item.url), '">', escapeHtml(item.title), '</a></h2>',
          '<p class="movie-meta">', escapeHtml(item.year), ' · ', escapeHtml(item.region), ' · ', escapeHtml(item.type), '</p>',
          '<p class="movie-line">', escapeHtml(item.oneLine), '</p>',
          '<div class="tag-row"><span class="tag-pill">', escapeHtml(item.category), '</span><span class="tag-pill">', escapeHtml(item.genre), '</span></div>',
          '</div>',
          '</article>'
        ].join("");
      }

      function render() {
        var nextQ = normalize(queryInput && queryInput.value);
        var nextR = regionInput && regionInput.value;
        var items = SITE_SEARCH_INDEX.filter(function (item) {
          var haystack = normalize([item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine, item.category].join(" "));
          var ok = true;

          if (nextQ && haystack.indexOf(nextQ) === -1) {
            ok = false;
          }
          if (nextR && item.region !== nextR) {
            ok = false;
          }
          return ok;
        }).slice(0, 120);

        if (!items.length) {
          searchRoot.innerHTML = '<div class="search-empty">没有找到匹配影片，换一个关键词再试试。</div>';
          return;
        }

        searchRoot.innerHTML = '<div class="movie-grid">' + items.map(makeCard).join("") + '</div>';
      }

      if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
          event.preventDefault();
          var params = new URLSearchParams();
          if (queryInput && queryInput.value.trim()) {
            params.set("q", queryInput.value.trim());
          }
          if (regionInput && regionInput.value) {
            params.set("region", regionInput.value);
          }
          history.replaceState(null, "", "./search.html" + (params.toString() ? "?" + params.toString() : ""));
          render();
        });
      }

      [queryInput, regionInput].forEach(function (input) {
        if (input) {
          input.addEventListener("input", render);
          input.addEventListener("change", render);
        }
      });

      render();
    }
  });
})();
