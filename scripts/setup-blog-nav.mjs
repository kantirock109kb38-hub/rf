import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const contact = fs.readFileSync(path.join(ROOT, 'contact.html'), 'utf8');

const headerStart = contact.indexOf('<!-- Header Start -->');
const headerEnd = contact.indexOf('<!-- Header End -->') + '<!-- Header End -->'.length;
let header = contact.slice(headerStart, headerEnd);

header = header.replace(/<li class="active"><a href="/index\">home<\/a><\/li>/, '<li><a href="/">home</a></li>');
header = header.replace(/<li class="active"><a href="/contact\">contact<\/a><\/li>/, '<li><a href="/contact">contact</a></li>');

const footerStart = contact.indexOf('<section class="footer-bar">');
const footerEnd = contact.indexOf('<!-- end footer -->') + '<!-- end footer -->'.length;
const footer = contact.slice(footerStart, footerEnd);

fs.mkdirSync(path.join(ROOT, 'partials'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'partials/site-header.html'), header);
fs.writeFileSync(path.join(ROOT, 'partials/site-footer.html'), footer);

const blogNav = '\t\t\t\t\t<li><a href="/blog">blog</a></li>\n';
let updated = 0;

for (const file of fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'))) {
  let html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  if (html.includes('href="blog.html"')) continue;
  const contactNeedle = '<li><a href="/contact">contact</a></li>';
  const contactActiveNeedle = '<li class="active"><a href="/contact">contact</a></li>';
  if (html.includes(contactNeedle)) {
    html = html.replace(contactNeedle, contactNeedle + '\n' + blogNav);
  } else if (html.includes(contactActiveNeedle)) {
    html = html.replace(contactActiveNeedle, contactActiveNeedle + '\n' + blogNav);
  } else {
    continue;
  }
  fs.writeFileSync(path.join(ROOT, file), html);
  updated++;
}

console.log(`Partials created. Blog nav added after contact on ${updated} pages.`);
