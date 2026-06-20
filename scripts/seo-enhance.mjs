/**
 * SEO enhancements: alt text fixes, related products blocks, robots.txt admin block.
 * Run: npm run seo:enhance
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pagePath, toCleanHref } from './url-utils.js';
import { SITE } from './seo-config.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RELATED_START = '<!-- RELATED-PRODUCTS:START -->';
const RELATED_END = '<!-- RELATED-PRODUCTS:END -->';

const PRODUCT_TYPES = [
  'compression-tube-fittings',
  'pipe-fittings',
  'forged-fittings',
  'rod-bars-wire-mesh',
  'sheet-plate',
  'flanges',
  'fasteners',
  'pipes',
];

const BASE_MATERIALS = [
  'super-duplex-steel-s32750-s32760',
  'duplex-steel-s31803-s32205',
  'stainless-steel',
  'carbon-steel',
  'alloy-steel',
  'inconel',
  'hastelloy',
  'monel',
  'nickel',
  'titanium',
  'cupro-nickel',
  'alloy-20',
  'smo-254',
  'incoloy',
  'copper-brass',
  'ferralium',
  'hardox',
  'corten',
];

const TYPE_LABELS = {
  pipes: 'Pipes',
  'pipe-fittings': 'Pipe Fittings',
  'forged-fittings': 'Forged Fittings',
  flanges: 'Flanges',
  fasteners: 'Fasteners',
  'rod-bars-wire-mesh': 'Rod, Bars & Wire',
  'compression-tube-fittings': 'Compression Tube Fittings',
  'sheet-plate': 'Sheet & Plate',
};

const CATEGORY_PAGES = {
  'stainless-steel': 'stainless-steel-products.html',
  'duplex-steel-s31803-s32205': 'duplex-steel-products.html',
  'super-duplex-steel-s32750-s32760': 'super-duplex-steel-products.html',
  'carbon-steel': 'carbon-steel-products.html',
  'alloy-steel': 'alloy-steel-products.html',
  inconel: 'inconel-products.html',
  hastelloy: 'hastelloy-products.html',
  monel: 'monel-products.html',
  nickel: 'nickel-products.html',
  titanium: 'titanium-products.html',
  'alloy-20': 'alloy-20-products.html',
  'smo-254': 'smo-254-products.html',
  'cupro-nickel': 'cupro-nickel-products.html',
  'copper-brass': 'copper-brass-products.html',
};

const allHtmlFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
const productFiles = new Set(
  allHtmlFiles.filter((f) => f.endsWith('-supplier-exporter.html'))
);

function slugToLabel(slug) {
  return slug
    .replace(/-supplier-exporter$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bAstm\b/gi, 'ASTM')
    .replace(/\bSs\b/g, 'SS')
    .replace(/\bGr\b/g, 'Gr');
}

function parseProductPage(filename) {
  if (!productFiles.has(filename)) return null;
  const slug = filename.replace('.html', '').replace(/-supplier-exporter$/, '');
  let productType = null;
  for (const t of [...PRODUCT_TYPES].sort((a, b) => b.length - a.length)) {
    if (slug.endsWith(`-${t}`)) {
      productType = t;
      break;
    }
  }
  if (!productType) return null;
  const materialSlug = slug.slice(0, -(productType.length + 1));
  return { filename, slug, materialSlug, productType };
}

function getBaseMaterial(materialSlug) {
  for (const m of [...BASE_MATERIALS].sort((a, b) => b.length - a.length)) {
    if (materialSlug === m || materialSlug.startsWith(`${m}-`)) return m;
  }
  return materialSlug;
}

function productFile(materialSlug, type) {
  const f = `${materialSlug}-${type}-supplier-exporter.html`;
  return productFiles.has(f) ? f : null;
}

function extractProductTitle(html) {
  const m = html.match(/<h2[^>]*class="[^"]*product_title[^"]*"[^>]*>([^<]+)</i);
  if (m) return m[1].replace(/&reg;/g, '®').replace(/\s+/g, ' ').trim().slice(0, 80);
  const title = html.match(/<title>([^<|]+)/i);
  return title ? title[1].trim() : 'Industrial piping product';
}

function buildRelatedLinks(parsed) {
  const links = [];
  const { filename, materialSlug, productType } = parsed;
  const baseMaterial = getBaseMaterial(materialSlug);

  const catPage = CATEGORY_PAGES[baseMaterial];
  if (catPage && fs.existsSync(path.join(ROOT, catPage))) {
    links.push({
      href: pagePath(catPage),
      label: `${slugToLabel(baseMaterial)} Products`,
    });
  }

  for (const type of PRODUCT_TYPES) {
    if (type === productType) continue;
    const f = productFile(baseMaterial, type);
    if (f) {
      links.push({
        href: pagePath(f),
        label: `${slugToLabel(baseMaterial)} ${TYPE_LABELS[type]}`,
      });
    }
  }

  const parentFile = productFile(baseMaterial, productType);
  if (materialSlug !== baseMaterial && parentFile && parentFile !== filename) {
    links.unshift({
      href: pagePath(parentFile),
      label: `All ${slugToLabel(baseMaterial)} ${TYPE_LABELS[productType]}`,
    });
  }

  const gradePrefix = `${materialSlug}-${productType}`;
  const siblings = [...productFiles]
    .filter((f) => {
      if (f === filename) return false;
      const p = parseProductPage(f);
      return p && p.productType === productType && p.materialSlug.startsWith(`${baseMaterial}-`);
    })
    .slice(0, 6);

  for (const sib of siblings) {
    const p = parseProductPage(sib);
    links.push({
      href: pagePath(sib),
      label: slugToLabel(p.materialSlug) + ` ${TYPE_LABELS[productType]}`,
    });
  }

  links.push({ href: '/contact', label: 'Request a Quote' });

  const seen = new Set();
  return links.filter((l) => {
    if (seen.has(l.href)) return false;
    seen.add(l.href);
    return true;
  }).slice(0, 10);
}

function buildRelatedSection(links) {
  const items = links
    .map((l) => `      <li><a href="${l.href}">${escapeHtml(l.label)}</a></li>`)
    .join('\n');
  return `${RELATED_START}
<section class="aeo-related-section" aria-labelledby="related-products-heading">
  <div class="container">
    <h2 id="related-products-heading">Related Products</h2>
    <ul class="aeo-related-links">
${items}
    </ul>
  </div>
</section>
${RELATED_END}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function altFromSrc(src, productName) {
  const base = path.basename(src).replace(/\.[^.]+$/, '').toLowerCase();
  const staticMap = {
    'contact-icon01': 'Phone contact icon',
    'contact-icon02': 'Email contact icon',
    'contact-icon03': 'Office address icon',
    'contact-icon04': 'Fax contact icon',
    'logo-light': 'Ramdevra Forge & Fittings logo',
    logo_home4: 'Ramdevra Forge logo',
    'iso-9001': 'ISO 9001 certified badge',
    iso: 'ISO certification mark',
    'appication-industry': `${productName} — industrial applications`,
    flangesbg: 'Industrial steel flanges manufacturing',
    'slider-3': 'Stainless steel pipe fittings and flanges',
    'ss-products': 'Stainless steel industrial products',
    india: 'India export market',
    usa: 'United States export market',
    sa: 'Saudi Arabia export market',
    kuwait: 'Kuwait export market',
    singapore: 'Singapore export market',
    malaysia: 'Malaysia export market',
    uae: 'UAE export market',
    germany: 'Germany export market',
    italy: 'Italy export market',
    china: 'China export market',
    uk: 'United Kingdom export market',
    canada: 'Canada export market',
    iran: 'Iran export market',
    thailand: 'Thailand export market',
    korea: 'South Korea export market',
    turkey: 'Turkey export market',
    morocco: 'Morocco export market',
    'costa-rica': 'Costa Rica export market',
    kazakhstan: 'Kazakhstan export market',
    philippines: 'Philippines export market',
  };
  if (staticMap[base]) return staticMap[base];

  if (base.includes('flange')) return `${productName} — flange product image`;
  if (base.includes('pipe')) return `${productName} — pipe product image`;
  if (base.includes('fitting')) return `${productName} — fitting product image`;
  if (base.includes('fastener')) return `${productName} — fastener product image`;
  if (base.includes('forge')) return `${productName} — forged fitting image`;

  return `${productName} — product image`;
}

function fixAltText(html, productName) {
  return html.replace(/<img\b([^>]*?)>/gi, (full, attrs) => {
    const altMatch = attrs.match(/\balt=(["'])(.*?)\1/i);
    const srcMatch = attrs.match(/\bsrc=(["'])(.*?)\1/i);
    if (!srcMatch) return full;

    const src = srcMatch[2];
    if (src.includes('logo.jpg') && !src.includes('logo-light')) {
      const alt = 'Ramdevra Forge & Fittings logo';
      if (altMatch && altMatch[2] && altMatch[2] !== 'Image' && altMatch[2].length > 2) return full;
      return `<img${attrs.replace(/\balt=(["'])(.*?)\1/i, '')} alt="${alt}">`.replace(/<img\s+/, '<img ');
    }

    const currentAlt = altMatch ? altMatch[2] : null;
    const needsFix = !currentAlt || currentAlt === 'Image' || currentAlt.trim() === '';
    if (!needsFix) return full;

    const newAlt = escapeHtml(altFromSrc(src, productName));
    if (altMatch) {
      return `<img${attrs.replace(/\balt=(["'])(.*?)\1/i, ` alt="${newAlt}"`)}>`;
    }
    return `<img${attrs} alt="${newAlt}">`;
  });
}

function injectRelatedProducts(html, filename) {
  const parsed = parseProductPage(filename);
  if (!parsed) return html;

  const section = buildRelatedSection(buildRelatedLinks(parsed));

  if (html.includes(RELATED_START)) {
    return html.replace(
      new RegExp(`${RELATED_START}[\\s\\S]*?${RELATED_END}`),
      section
    );
  }

  const anchors = [
    '<!-- AEO-FAQ:START -->',
    '<!-- main body end -->',
    '<div class="fixit_footer_wrapper">',
  ];
  for (const anchor of anchors) {
    if (html.includes(anchor)) {
      return html.replace(anchor, `${section}\n${anchor}`);
    }
  }
  return html;
}

function ensureSeoFaqCss(html) {
  if (html.includes('seo-faq.css')) return html;
  if (html.includes('<!-- SEO:START -->')) return html;
  return html.replace(
    '</head>',
    '    <link rel="stylesheet" href="css/seo-faq.css" media="screen">\n</head>'
  );
}

function writeRobotsTxt() {
  fs.writeFileSync(
    path.join(ROOT, 'robots.txt'),
    `User-agent: *
Allow: /
Disallow: /admin/

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
`
  );
}

let altFixed = 0;
let relatedAdded = 0;

for (const file of allHtmlFiles) {
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;
  const productName = file.endsWith('-supplier-exporter.html')
    ? extractProductTitle(html)
    : file === 'index.html'
      ? 'Ramdevra Forge industrial flanges and fittings'
      : 'Ramdevra Forge & Fittings';

  html = fixAltText(html, productName);
  if (file.endsWith('-supplier-exporter.html')) {
    html = injectRelatedProducts(html, file);
    html = ensureSeoFaqCss(html);
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html);
    if (html !== fixAltText(original, productName)) altFixed++;
    if (file.endsWith('-supplier-exporter.html') && html.includes(RELATED_START)) relatedAdded++;
  }
}

writeRobotsTxt();

console.log(`SEO enhance complete:`);
console.log(`  - robots.txt updated (Disallow: /admin/)`);
console.log(`  - Alt text fixed across HTML files`);
console.log(`  - Related products on ${relatedAdded} product pages`);
