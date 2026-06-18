/** Adds product context to Enquiry Now / contact links on product pages */
document.addEventListener('DOMContentLoaded', () => {
  const h2 = document.querySelector('h2.product_title');
  const productName = h2?.textContent?.trim() || document.title.split('|')[0].trim();
  if (!productName) return;

  document.querySelectorAll('a[href="contact.html"], a[href="./contact.html"]').forEach((a) => {
    const url = new URL('contact.html', window.location.href);
    url.searchParams.set('product', productName);
    url.searchParams.set('from', window.location.href);
    a.href = url.pathname + url.search;
  });
});
