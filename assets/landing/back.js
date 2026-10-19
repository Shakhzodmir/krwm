// Кнопка «Назад» для публичных страниц (статьи, блог): они открываются из приложения в том же окне,
// а у установленного приложения нет кнопки браузера «назад».
(function () {
  var h = document.querySelector('.lp-header');
  if (!h || h.querySelector('.lp-backrow')) return;
  var fromSite = false;
  try { fromSite = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (_) {}
  var row = document.createElement('div');
  row.className = 'lp-backrow';
  var a = document.createElement('a');
  a.className = 'lp-back';
  a.href = '/';
  a.setAttribute('aria-label', fromSite ? 'Назад' : 'В приложение');
  a.textContent = fromSite ? '← Назад' : '← В приложение';
  // Пришли с этого же сайта (из приложения или другой статьи) — идём назад по истории, иначе — в приложение
  a.addEventListener('click', function (e) {
    if (fromSite && history.length > 1) { e.preventDefault(); history.back(); }
  });
  row.appendChild(a);
  h.insertBefore(row, h.firstChild);
})();
