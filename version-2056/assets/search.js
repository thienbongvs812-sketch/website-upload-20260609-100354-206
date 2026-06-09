document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('[data-site-search]');
  var input = form ? form.querySelector('input[name="q"]') : null;
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var data = window.MOVIE_SEARCH_DATA || [];

  function getQueryFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function makeCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '海报" loading="lazy">',
      '    <span class="poster-play">▶</span>',
      '    <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + movie.year + ' 年</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '    </div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function search(keyword) {
    var q = keyword.trim().toLowerCase();
    if (!q) {
      results.innerHTML = '';
      status.textContent = '输入关键词开始搜索。';
      return;
    }

    var matched = data.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return haystack.indexOf(q) !== -1;
    }).slice(0, 80);

    status.textContent = '找到 ' + matched.length + ' 条相关结果' + (matched.length === 80 ? '，已显示前 80 条。' : '。');
    results.innerHTML = matched.map(makeCard).join('\n');
  }

  if (form && input && results && status) {
    var initialQuery = getQueryFromUrl();
    input.value = initialQuery;
    search(initialQuery);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var url = q ? 'search.html?q=' + encodeURIComponent(q) : 'search.html';
      history.replaceState(null, '', url);
      search(q);
    });

    input.addEventListener('input', function () {
      search(input.value);
    });
  }
});
