(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function setupMobileNav() {
        var toggle = qs('.mobile-toggle');
        var nav = qs('.mobile-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
            toggle.textContent = nav.classList.contains('is-open') ? '×' : '☰';
        });
    }

    function setupHeroCarousel() {
        var carousel = qs('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = qsa('.hero-slide', carousel);
        var dots = qsa('.hero-dot', carousel);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    function setupLocalFilter() {
        var input = qs('.local-filter');
        var targets = qsa('.filter-targets .movie-card, .filter-targets .rank-row');
        if (!input || !targets.length) {
            return;
        }
        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            targets.forEach(function (item) {
                var text = item.textContent.toLowerCase();
                item.classList.toggle('is-hidden-by-filter', keyword && text.indexOf(keyword) === -1);
            });
        });
    }

    function getQuery(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function renderSearchCard(item) {
        return [
            '<a class="movie-card" href="' + escapeHtml(item.file) + '">',
            '    <figure>',
            '        <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async">',
            '        <span class="year-badge">' + escapeHtml(item.year) + '</span>',
            '    </figure>',
            '    <div class="movie-card-body">',
            '        <h3>' + escapeHtml(item.title) + '</h3>',
            '        <p>' + escapeHtml(item.oneLine) + '</p>',
            '        <div class="card-meta">',
            '            <span>' + escapeHtml(item.region) + '</span>',
            '            <span>' + escapeHtml(item.type) + '</span>',
            '        </div>',
            '        <div class="tag-row">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
            '    </div>',
            '</a>'
        ].join('');
    }

    function setupSearchPage() {
        var results = qs('#searchResults');
        var input = qs('#searchInput');
        var title = qs('#searchTitle');
        var hint = qs('#searchHint');
        if (!results || !input || !window.SEARCH_DATA) {
            return;
        }
        var initial = getQuery('q');
        input.value = initial;

        function runSearch() {
            var keyword = input.value.trim().toLowerCase();
            var data = window.SEARCH_DATA || [];
            var matched = keyword ? data.filter(function (item) {
                return [item.title, item.oneLine, item.region, item.type, item.year, item.genre, item.tags.join(' ')].join(' ').toLowerCase().indexOf(keyword) !== -1;
            }) : data.slice(0, 24);
            results.innerHTML = matched.slice(0, 96).map(renderSearchCard).join('');
            if (title) {
                title.textContent = keyword ? '“' + input.value.trim() + '”相关影片' : '推荐影片';
            }
            if (hint) {
                hint.textContent = keyword ? '点击卡片进入影片详情页。' : '输入关键词可继续筛选片库内容。';
            }
        }

        input.addEventListener('input', runSearch);
        runSearch();
    }

    window.setupVideoPlayer = function (containerId, source) {
        var container = document.getElementById(containerId);
        if (!container) {
            return;
        }
        var video = qs('video', container);
        var button = qs('.player-start', container);
        var attached = false;
        var hls = null;

        function attach() {
            if (attached || !video) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else {
                video.src = source;
            }
        }

        function play() {
            attach();
            if (button) {
                button.classList.add('is-hidden');
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNav();
        setupHeroCarousel();
        setupLocalFilter();
        setupSearchPage();
    });
})();
