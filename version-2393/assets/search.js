(function () {
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const summary = document.getElementById('searchSummary');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  const movies = window.MOVIE_SEARCH_INDEX || [];

  if (!input || !results || !summary) {
    return;
  }

  input.value = initialQuery;

  function createCard(movie) {
    const tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card movie-card--standard">' +
        '<a class="movie-card__cover" href="' + movie.url + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="movie-card__year">' + escapeHtml(movie.year) + '</span>' +
          '<span class="movie-card__type">' + escapeHtml(movie.type) + '</span>' +
        '</a>' +
        '<div class="movie-card__body">' +
          '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p class="movie-card__meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>' +
          '<p class="movie-card__desc">' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function runSearch() {
    const query = normalize(input.value);
    if (!query) {
      results.innerHTML = '';
      summary.textContent = '请输入关键词进行搜索。';
      return;
    }

    const words = query.split(/\s+/).filter(Boolean);
    const matched = movies.filter(function (movie) {
      const source = normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' '));

      return words.every(function (word) {
        return source.indexOf(word) !== -1;
      });
    }).slice(0, 120);

    summary.textContent = '共找到 ' + matched.length + ' 个结果' + (matched.length === 120 ? '，已显示前 120 个。' : '。');
    results.innerHTML = matched.map(createCard).join('');
  }

  input.addEventListener('input', runSearch);
  runSearch();
})();
