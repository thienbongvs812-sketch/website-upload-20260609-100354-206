(function () {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const navToggle = $('[data-nav-toggle]');
  const mobileNav = $('[data-mobile-nav]');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  const backTop = $('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('is-visible', window.scrollY > 480);
    }, { passive: true });
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  const hero = $('[data-hero]');
  if (hero) {
    const slides = $$('[data-hero-slide]', hero);
    const dots = $$('[data-hero-dot]', hero);
    const prev = $('[data-hero-prev]', hero);
    const next = $('[data-hero-next]', hero);
    let active = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) return;
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(active + 1), 5600);
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(active + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  $$('[data-filter-scope]').forEach((scope) => {
    const input = $('[data-filter-text]', scope);
    const yearSelect = $('[data-filter-year]', scope);
    const typeSelect = $('[data-filter-type]', scope);
    const reset = $('[data-filter-reset]', scope);
    const grid = $('[data-card-grid]');
    const result = $('[data-filter-result]');
    const cards = grid ? $$('[data-movie-card]', grid) : [];

    function applyFilter() {
      const text = (input?.value || '').trim().toLowerCase();
      const year = yearSelect?.value || '';
      const type = typeSelect?.value || '';
      let visible = 0;

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.tags,
          card.dataset.year
        ].join(' ').toLowerCase();
        const matchText = !text || haystack.includes(text);
        const matchYear = !year || card.dataset.year === year;
        const matchType = !type || card.dataset.type === type;
        const show = matchText && matchYear && matchType;
        card.classList.toggle('is-hidden-by-filter', !show);
        if (show) visible += 1;
      });

      if (result) {
        result.textContent = `共 ${visible} 部影片`;
      }
    }

    [input, yearSelect, typeSelect].forEach((control) => {
      if (control) control.addEventListener('input', applyFilter);
      if (control) control.addEventListener('change', applyFilter);
    });

    if (reset) {
      reset.addEventListener('click', () => {
        if (input) input.value = '';
        if (yearSelect) yearSelect.value = '';
        if (typeSelect) typeSelect.value = '';
        applyFilter();
      });
    }
  });

  const globalSearch = $('[data-global-search]');
  if (globalSearch && Array.isArray(window.MOVIE_DATA)) {
    const input = $('[data-global-search-input]', globalSearch);
    const categorySelect = $('[data-global-category]', globalSearch);
    const yearSelect = $('[data-global-year]', globalSearch);
    const reset = $('[data-global-reset]', globalSearch);
    const results = $('[data-global-results]');
    const count = $('[data-global-count]');

    function card(movie) {
      const tags = (movie.tags || []).slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
      return `
        <article class="movie-card" data-movie-card>
          <a class="movie-card__poster" href="${movie.url}" aria-label="观看 ${escapeHtml(movie.title)}">
            <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
            <span class="movie-card__play">▶</span>
            <span class="movie-card__year">${movie.year || '精选'}</span>
          </a>
          <div class="movie-card__body">
            <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
            <p>${escapeHtml(movie.oneLine || '')}</p>
            <div class="movie-card__meta"><span>${escapeHtml(movie.region || '')}</span><span>${escapeHtml(movie.type || '')}</span></div>
            <div class="tag-row">${tags}</div>
          </div>
        </article>`;
    }

    function escapeHtml(value) {
      return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }

    function render() {
      const query = (input?.value || '').trim().toLowerCase();
      const category = categorySelect?.value || '';
      const year = yearSelect?.value || '';

      const matches = window.MOVIE_DATA.filter((movie) => {
        const haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.year,
          ...(movie.tags || [])
        ].join(' ').toLowerCase();
        const matchQuery = !query || haystack.includes(query);
        const matchCategory = !category || movie.category === category;
        const matchYear = !year || String(movie.year) === year;
        return matchQuery && matchCategory && matchYear;
      }).slice(0, 96);

      if (results) {
        results.innerHTML = matches.map(card).join('');
      }
      if (count) {
        count.textContent = matches.length ? `展示 ${matches.length} 条匹配结果` : '没有找到匹配影片，请更换关键词。';
      }
    }

    [input, categorySelect, yearSelect].forEach((control) => {
      if (control) control.addEventListener('input', render);
      if (control) control.addEventListener('change', render);
    });

    if (reset) {
      reset.addEventListener('click', () => {
        if (input) input.value = '';
        if (categorySelect) categorySelect.value = '';
        if (yearSelect) yearSelect.value = '';
        render();
      });
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (initialQuery && input) {
      input.value = initialQuery;
    }
    render();
  }
})();
