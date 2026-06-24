/**
 * Opens social post when a gallery tile is clicked (no social URLs in HTML — ad-blocker safe).
 */
(function () {
  var section = document.querySelector('.rf-gallery-section');
  if (!section) return;

  var host = ['https://www.', 'instagram', '.com/p/'].join('');

  section.addEventListener('click', function (event) {
    var tile = event.target.closest('[data-sc]');
    if (!tile || !section.contains(tile)) return;
    var code = tile.getAttribute('data-sc');
    if (!code) return;
    window.open(host + code + '/', '_blank', 'noopener,noreferrer');
  });

  section.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    var tile = event.target.closest('[data-sc]');
    if (!tile || !section.contains(tile)) return;
    event.preventDefault();
    tile.click();
  });
})();
