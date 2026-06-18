(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = carousel.querySelector('[data-hero-dots]');
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function paintDots() {
      if (!dots) {
        return;
      }
      dots.innerHTML = '';
      slides.forEach(function (_, index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = index === current ? 'active' : '';
        dot.addEventListener('click', function () {
          show(index);
          restart();
        });
        dots.appendChild(dot);
      });
    }

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      paintDots();
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    paintDots();
    restart();
  }

  function setupFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-card-list]'));
    lists.forEach(function (list) {
      var block = list.closest('.section-block') || document;
      var input = block.querySelector('[data-card-search]');
      var typeSelect = block.querySelector('[data-card-type]');
      var yearSelect = block.querySelector('[data-card-year]');
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
      var years = [];

      cards.forEach(function (card) {
        var year = card.getAttribute('data-year') || '';
        if (year && years.indexOf(year) === -1) {
          years.push(year);
        }
      });

      years.sort(function (a, b) {
        return Number(b) - Number(a);
      });

      if (yearSelect) {
        years.forEach(function (year) {
          var option = document.createElement('option');
          option.value = year;
          option.textContent = year;
          yearSelect.appendChild(option);
        });
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type')
          ].join(' ').toLowerCase();
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedType = !type || card.getAttribute('data-type') === type;
          var matchedYear = !year || card.getAttribute('data-year') === year;
          card.style.display = matchedKeyword && matchedType && matchedYear ? '' : 'none';
        });
      }

      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.SITE_MOVIES) {
      return;
    }
    var meta = document.querySelector('[data-search-meta]');
    var input = document.querySelector('[data-search-input]');
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (input) {
      input.value = query;
    }

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '<a href="./' + movie.url + '">',
        '<div class="card-cover">',
        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="card-year">' + escapeHtml(movie.year) + '</span>',
        '</div>',
        '<div class="card-body">',
        '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '<h3>' + escapeHtml(movie.title) + '</h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</a>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (item) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[item];
      });
    }

    var source = window.SITE_MOVIES;
    var matches = source;
    if (query) {
      var lower = query.toLowerCase();
      matches = source.filter(function (movie) {
        return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase().indexOf(lower) !== -1;
      });
    } else {
      matches = source.slice(0, 60);
    }

    results.innerHTML = matches.slice(0, 240).map(card).join('');
    if (meta) {
      meta.textContent = query ? '已为你筛选相关影片' : '输入关键词开始检索，下面展示部分热门内容';
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
