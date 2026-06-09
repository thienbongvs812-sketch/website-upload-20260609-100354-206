document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initCarousels();
    initFilters();
    initPlayers();
});

function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
    });
}

function initCarousels() {
    var carousels = document.querySelectorAll("[data-carousel]");

    carousels.forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    });
}

function initFilters() {
    var panels = document.querySelectorAll("[data-filter-form]");

    panels.forEach(function (panel) {
        var input = panel.querySelector("[data-search-input]");
        var year = panel.querySelector("[data-year-filter]");
        var type = panel.querySelector("[data-type-filter]");
        var container = panel.nextElementSibling;

        while (container && !container.querySelector(".movie-card, .rank-item")) {
            container = container.nextElementSibling;
        }

        if (!container) {
            return;
        }

        var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card, .rank-item"));

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var yearValue = year ? year.value : "";
            var typeValue = type ? type.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var title = (card.getAttribute("data-title") || "").toLowerCase();
                var tags = (card.getAttribute("data-tags") || "").toLowerCase();
                var region = (card.getAttribute("data-region") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var cardType = card.getAttribute("data-type") || "";
                var matchesText = !query || title.indexOf(query) >= 0 || tags.indexOf(query) >= 0 || region.indexOf(query) >= 0;
                var matchesYear = !yearValue || cardYear === yearValue;
                var matchesType = !typeValue || cardType.indexOf(typeValue) >= 0;
                var isVisible = matchesText && matchesYear && matchesType;

                card.classList.toggle("is-hidden-card", !isVisible);

                if (isVisible) {
                    visible += 1;
                }
            });

            panel.classList.toggle("has-empty", visible === 0);
        }

        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    });
}

function initPlayers() {
    var players = document.querySelectorAll("[data-player]");

    players.forEach(function (shell) {
        var video = shell.querySelector("video");
        var button = shell.querySelector("[data-play-button]");
        var hlsInstance = null;
        var attached = false;

        if (!video || !button) {
            return;
        }

        function attach() {
            var stream = video.getAttribute("data-stream");

            if (attached || !stream) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.load();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = stream;
            video.load();
        }

        function play() {
            attach();
            button.classList.add("is-hidden");
            var result = video.play();

            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", play);

        shell.addEventListener("click", function (event) {
            if (!attached && (event.target === shell || event.target === video)) {
                play();
            }
        });

        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });

        video.addEventListener("error", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
            attached = false;
        });
    });
}
