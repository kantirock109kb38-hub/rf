/** Loads shared site header & footer partials for blog pages */
(function () {
  async function inject(id, url) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      el.innerHTML = await res.text();
      highlightNav();
    } catch (e) {
      console.warn('Could not load partial:', url);
    }
  }

  function highlightNav() {
    const page = document.body.dataset.page;
    if (!page) return;
    const link = document.querySelector(`.fixit_menu a[href="${page}"]`);
    if (link?.parentElement) {
      link.parentElement.classList.add('active');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    inject('site-header', 'partials/site-header.html');
    inject('site-footer', 'partials/site-footer.html');
  });
})();
