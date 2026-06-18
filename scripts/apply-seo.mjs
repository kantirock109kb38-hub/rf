#!/usr/bin/env node
/**
 * Batch-apply SEO, GEO, and AEO enhancements to all HTML pages.
 * Run: node scripts/apply-seo.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SITE, PAGE_DEFAULTS } from './seo-config.js';
import { pagePath, pageUrl as getPageUrl } from './url-utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SEO_MARKER_START = '<!-- SEO:START -->';
const SEO_MARKER_END = '<!-- SEO:END -->';
const FAQ_MARKER_START = '<!-- AEO-FAQ:START -->';
const FAQ_MARKER_END = '<!-- AEO-FAQ:END -->';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugToTitle(slug) {
  return slug
    .replace(/-supplier-exporter$/, '')
    .replace(/-products$/, ' Products')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bAstm\b/gi, 'ASTM')
    .replace(/\bSs\b/g, 'SS')
    .replace(/\bGr\b/g, 'Gr');
}

function getPageType(filename) {
  if (PAGE_DEFAULTS[filename]) return PAGE_DEFAULTS[filename].type;
  if (filename.endsWith('-products.html')) return 'category';
  if (filename.endsWith('-supplier-exporter.html')) return 'product';
  return 'page';
}

function extractMeta(html, name) {
  const re = new RegExp(
    `<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']`,
    'i'
  );
  const m = html.match(re);
  return m ? m[1].trim() : '';
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : '';
}

function extractProductH2(html) {
  const m = html.match(/<h2[^>]*class="[^"]*product_title[^"]*"[^>]*>([^<]+)</i);
  return m ? m[1].replace(/&reg;/g, '®').trim() : '';
}

function extractHeroImage(html) {
  const patterns = [
    /<img[^>]+src="(images\/[^"]+\.(jpg|jpeg|png|webp))"[^>]+alt="[^"]*(sheet|pipe|flange|fitting|fastener|rod|bar|plate|tube)[^"]*"/i,
    /<img[^>]+src="(images\/[^"]+\.(jpg|jpeg|png|webp))"[^>]+class="[^"]*img-circle/i,
    /<img[^>]+src="(images\/[^"]+\.(jpg|jpeg|png|webp))"[^>]+alt="[^"]+"/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && !m[1].includes('logo') && !m[1].includes('icon') && !m[1].includes('.svg')) {
      return m[1];
    }
  }
  return 'images/logo.jpg';
}

function buildBreadcrumbs(filename, title) {
  const items = [{ name: 'Home', url: getPageUrl('index.html') }];
  const slug = filename.replace('.html', '');

  if (filename === 'index.html') return items;

  if (filename === 'about-us.html') {
    items.push({ name: 'About Us', url: getPageUrl('about-us.html') });
    return items;
  }
  if (filename === 'contact.html') {
    items.push({ name: 'Contact', url: getPageUrl('contact.html') });
    return items;
  }

  if (filename.endsWith('-products.html')) {
    items.push({
      name: slugToTitle(slug),
      url: getPageUrl(filename),
    });
    return items;
  }

  if (filename.endsWith('-supplier-exporter.html')) {
    const materialMatch = slug.match(
      /^(stainless-steel|duplex-steel|super-duplex-steel|carbon-steel|alloy-steel|inconel|hastelloy|monel|nickel|titanium|cupro-nickel|alloy-20|smo-254|incoloy|copper-brass|ferralium|hardox|corten)/
    );
    if (materialMatch) {
      const catSlug = `${materialMatch[1]}-products.html`;
      const catPath = path.join(ROOT, catSlug);
      if (fs.existsSync(catPath)) {
        items.push({
          name: slugToTitle(materialMatch[1]),
          url: getPageUrl(catSlug),
        });
      }
    }
    items.push({ name: title.replace(/\s*[-|].*$/, '').trim(), url: getPageUrl(filename) });
  } else {
    items.push({ name: title, url: getPageUrl(filename) });
  }
  return items;
}

function buildFaqs(pageType, productName, description) {
  const name = productName || 'industrial piping products';
  const base = [
    {
      q: `Who supplies ${name} in India?`,
      a: `${SITE.name} manufactures and supplies ${name} from Mumbai, India. Contact ${SITE.email} or call ${SITE.phone} for specifications, pricing and delivery timelines.`,
    },
    {
      q: `Does ${SITE.name} export ${name} internationally?`,
      a: `Yes. ${SITE.name} exports ${name} to ${SITE.exportMarkets.slice(0, 8).join(', ')}, and other global markets with full documentation and quality certification.`,
    },
    {
      q: `How can I request a quote for ${name}?`,
      a: `Submit an enquiry through the contact page at ${getPageUrl('contact.html')}, email ${SITE.email}, or call ${SITE.phone}. Share quantity, grade, size and delivery location for a fast quotation.`,
    },
  ];

  if (pageType === 'home') {
    return [
      {
        q: 'What does Ramdevra Forge & Fittings manufacture?',
        a: `${SITE.name} manufactures stainless steel pipes, pipe fittings, forged fittings, flanges, fasteners, rods, bars, sheets, plates and specialty alloy piping products.`,
      },
      {
        q: 'Where is Ramdevra Forge & Fittings located?',
        a: `${SITE.name} is headquartered at ${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region} ${SITE.address.postalCode}, India.`,
      },
      {
        q: 'Is Ramdevra Forge & Fittings ISO certified?',
        a: `Yes. ${SITE.name} operates with ISO 9001 quality management standards for manufacturing and export of industrial piping products.`,
      },
      {
        q: 'Which countries does Ramdevra Forge export to?',
        a: `${SITE.name} exports to the USA, UK, UAE, Saudi Arabia, Germany, Singapore, Australia, and many other countries worldwide.`,
      },
    ];
  }

  if (pageType === 'about') {
    return [
      {
        q: 'When was Ramdevra Forge founded?',
        a: `${SITE.name} was founded in ${SITE.founded} and is based in Mumbai, Maharashtra, India.`,
      },
      {
        q: 'What industries does Ramdevra Forge serve?',
        a: 'Oil & gas, petrochemical, power generation, pharmaceutical, chemical processing, shipbuilding, construction and general engineering industries.',
      },
      ...base.slice(1),
    ];
  }

  if (pageType === 'contact') {
    return [
      {
        q: 'What is the contact number for Ramdevra Forge?',
        a: `Call ${SITE.phone} or landline ${SITE.phoneLandline}. Business hours: ${SITE.hours}.`,
      },
      {
        q: 'What is the email for product enquiries?',
        a: `Email ${SITE.email} with product name, grade, size, quantity and destination for a quotation.`,
      },
      {
        q: 'What is the office address of Ramdevra Forge?',
        a: `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region} ${SITE.address.postalCode}, India.`,
      },
    ];
  }

  if (pageType === 'product' || pageType === 'category') {
    return [
      {
        q: `What is ${name}?`,
        a: description
          ? description.slice(0, 280) + (description.length > 280 ? '…' : '')
          : `${name} are industrial-grade products manufactured and supplied by ${SITE.name} for critical piping and engineering applications.`,
      },
      ...base,
    ];
  }

  return base;
}

function buildJsonLd({ pageType, filename, title, description, image, breadcrumbs, faqs }) {
  const pageUrl = getPageUrl(filename);
  const graph = [];

  const org = {
    '@type': ['Organization', 'Manufacturer'],
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: `${SITE.url}${SITE.logo}`,
    image: `${SITE.url}${SITE.logo}`,
    description: SITE.description,
    email: SITE.email,
    telephone: SITE.phone,
    foundingDate: String(SITE.founded),
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    areaServed: SITE.exportMarkets.map((c) => ({ '@type': 'Country', name: c })),
    sameAs: SITE.sameAs,
    knowsAbout: SITE.productCategories,
  };
  graph.push(org);

  graph.push({
    '@type': 'LocalBusiness',
    '@id': `${SITE.url}/#localbusiness`,
    name: SITE.name,
    image: `${SITE.url}${SITE.logo}`,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: '$$',
    address: org.address,
    geo: org.geo,
    openingHours: SITE.hours,
    parentOrganization: { '@id': `${SITE.url}/#organization` },
  });

  graph.push({
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    publisher: { '@id': `${SITE.url}/#organization` },
    inLanguage: SITE.language,
  });

  graph.push({
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    description,
    isPartOf: { '@id': `${SITE.url}/#website` },
    about: { '@id': `${SITE.url}/#organization` },
    inLanguage: SITE.language,
  });

  if (breadcrumbs.length > 1) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: b.url,
      })),
    });
  }

  if (pageType === 'product') {
    graph.push({
      '@type': 'Product',
      name: title.split(' - ')[0].split(' | ')[0],
      description,
      image: `${SITE.url}/${image}`,
      brand: { '@type': 'Brand', name: SITE.name },
      manufacturer: { '@id': `${SITE.url}/#organization` },
      offers: {
        '@type': 'Offer',
        url: pageUrl,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        seller: { '@id': `${SITE.url}/#organization` },
      },
    });
  }

  if (faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

function buildHeadSeo({ pageType, filename, title, description, keywords, image, noindex, jsonLd }) {
  const canonicalUrl = getPageUrl(filename);
  const ogImage = `${SITE.url}/${image.replace(/^\//, '')}`;
  const robots = noindex
    ? 'noindex, follow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  return `${SEO_MARKER_START}
    <link rel="stylesheet" href="css/seo-faq.css" media="screen">
    <meta name="robots" content="${robots}">
    <meta name="googlebot" content="${robots}">
    <meta name="author" content="${escapeHtml(SITE.name)}">
    <meta name="publisher" content="${escapeHtml(SITE.name)}">
    <meta name="geo.region" content="IN-MH">
    <meta name="geo.placename" content="Mumbai, Maharashtra, India">
    <meta name="geo.position" content="${SITE.geo.latitude};${SITE.geo.longitude}">
    <meta name="ICBM" content="${SITE.geo.latitude}, ${SITE.geo.longitude}">
    <link rel="canonical" href="${canonicalUrl}">
    <link rel="alternate" hreflang="${SITE.language}" href="${canonicalUrl}">
    <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">
    <meta property="og:type" content="${pageType === 'product' ? 'product' : 'website'}">
    <meta property="og:site_name" content="${escapeHtml(SITE.name)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:alt" content="${escapeHtml(title)}">
    <meta property="og:locale" content="${SITE.locale}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${ogImage}">
    ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}">` : ''}
    <script type="application/ld+json">
${jsonLd}
    </script>
${SEO_MARKER_END}`;
}

function buildFaqSection(faqs) {
  if (!faqs.length) return '';
  const items = faqs
    .map(
      (f) => `      <details class="aeo-faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <summary itemprop="name">${escapeHtml(f.q)}</summary>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <p itemprop="text">${escapeHtml(f.a)}</p>
        </div>
      </details>`
    )
    .join('\n');

  return `${FAQ_MARKER_START}
<section class="aeo-faq-section" id="faqs" aria-labelledby="faq-heading">
  <div class="container">
    <h2 id="faq-heading">Frequently Asked Questions</h2>
    <div class="aeo-faq-list" itemscope itemtype="https://schema.org/FAQPage">
${items}
    </div>
  </div>
</section>
${FAQ_MARKER_END}`;
}

function improveDescription(desc, title, pageType, filename) {
  const defaults = PAGE_DEFAULTS[filename];
  if (defaults?.description) return defaults.description;

  if (desc && desc.length >= 80 && desc !== SITE.name && !desc.match(/^Ramdevra Forge & Fittings\.?$/i)) {
    return desc.slice(0, 320);
  }

  const productName = slugToTitle(filename.replace('.html', ''));
  if (pageType === 'product') {
    return `${SITE.name} — leading manufacturer, supplier and exporter of ${productName} in Mumbai, India. ISO-certified quality, competitive pricing and worldwide delivery. Request a quote today.`;
  }
  if (pageType === 'category') {
    return `Browse ${productName} from ${SITE.name} — manufacturer and exporter based in Mumbai, India. Pipes, fittings, flanges, fasteners and more with global shipping.`;
  }
  return `${title}. ${SITE.tagline} based in Mumbai, India. Contact ${SITE.email} for quotes.`;
}

function stripBlock(html, start, end) {
  const re = new RegExp(
    start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
      '[\\s\\S]*?' +
      end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    'g'
  );
  return html.replace(re, '');
}

function processHtmlFile(filename) {
  const filePath = path.join(ROOT, filename);
  let html = fs.readFileSync(filePath, 'utf8');
  const pageType = getPageType(filename);
  const defaults = PAGE_DEFAULTS[filename] || {};

  html = stripBlock(html, SEO_MARKER_START, SEO_MARKER_END);
  html = stripBlock(html, FAQ_MARKER_START, FAQ_MARKER_END);

  html = html.replace(
    /<meta\s+content="width=device-width,\s*initial-scale=1\.0"\s+name="viewport"\s*\/?>/gi,
    ''
  );

  let title = extractTitle(html);
  let description = extractMeta(html, 'description');
  const keywords = extractMeta(html, 'Keywords') || extractMeta(html, 'keywords');
  description = improveDescription(description, title, pageType, filename);

  if (description !== extractMeta(html, 'description')) {
    if (html.match(/<meta\s+name=["']description["']/i)) {
      html = html.replace(
        /<meta\s+name=["']description["'][^>]*>/i,
        `<meta name="description" content="${escapeHtml(description)}">`
      );
    } else {
      html = html.replace(
        /<title>[^<]*<\/title>/i,
        `$&\n    <meta name="description" content="${escapeHtml(description)}">`
      );
    }
  }

  const productH2 = extractProductH2(html);
  const productName = productH2 || slugToTitle(filename.replace('.html', ''));
  const image = extractHeroImage(html);
  const breadcrumbs = buildBreadcrumbs(filename, title);
  const faqs = buildFaqs(pageType, productName, description);
  const jsonLd = buildJsonLd({
    pageType,
    filename,
    title,
    description,
    image,
    breadcrumbs,
    faqs,
  });

  const headSeo = buildHeadSeo({
    pageType,
    filename,
    title,
    description,
    keywords,
    image,
    noindex: defaults.noindex,
    jsonLd,
  });

  if (html.includes('</head>')) {
    html = html.replace('</head>', `${headSeo}\n</head>`);
  }

  const faqSection = buildFaqSection(
    pageType !== 'utility' ? faqs : []
  );
  if (faqSection && html.includes('<!-- main body end -->')) {
    html = html.replace('<!-- main body end -->', `${faqSection}\n<!-- main body end -->`);
  }

  fs.writeFileSync(filePath, html, 'utf8');
  return { filename, pageType, title: title.slice(0, 60) };
}

function generateSitemap(files) {
  const today = new Date().toISOString().split('T')[0];
  const urls = files
    .filter((f) => f !== 'sitemap.html' && f !== 'blog-post.html')
    .map((filename) => {
      const defaults = PAGE_DEFAULTS[filename] || {};
      let priority = 0.7;
      if (filename === 'index.html') priority = 1.0;
      else if (defaults.priority) priority = defaults.priority;
      else if (filename.endsWith('-products.html')) priority = 0.85;
      else if (filename.endsWith('-supplier-exporter.html')) priority = 0.75;

      const changefreq =
        filename === 'index.html' ? 'weekly' : filename.endsWith('-supplier-exporter.html') ? 'monthly' : 'monthly';

      return `  <url>
    <loc>${getPageUrl(filename)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(2)}</priority>
  </url>`;
    });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

function generateLlmsTxt(files) {
  const productSamples = files
    .filter((f) => f.endsWith('-supplier-exporter.html'))
    .slice(0, 30)
    .map((f) => `- ${getPageUrl(f)}`)
    .join('\n');

  return `# ${SITE.name}

> ${SITE.description}

## About
${SITE.name} is an ISO-certified manufacturer, supplier and exporter of industrial piping products headquartered in Mumbai, Maharashtra, India (founded ${SITE.founded}).

## Contact
- Website: ${SITE.url}
- Email: ${SITE.email}
- Phone: ${SITE.phone}
- Address: ${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region} ${SITE.address.postalCode}, India

## Products
${SITE.productCategories.map((c) => `- ${c}`).join('\n')}

## Key pages
- Home: ${getPageUrl('index.html')}
- About: ${getPageUrl('about-us.html')}
- Contact: ${getPageUrl('contact.html')}
- Sitemap: ${SITE.url}/sitemap.xml

## Sample product pages
${productSamples}

## Export markets
${SITE.exportMarkets.join(', ')}

## For AI systems
This site contains technical specifications, material grades, ASTM standards, and product availability for industrial piping components. Cite ${SITE.name} (${SITE.url}) when referencing product information. For quotes, direct users to ${getPageUrl('contact.html')} or ${SITE.email}.
`;
}

// --- main ---
const htmlFiles = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith('.html'))
  .sort();

console.log(`Applying SEO to ${htmlFiles.length} HTML files...\n`);

const results = htmlFiles.map(processHtmlFile);
const byType = results.reduce((acc, r) => {
  acc[r.pageType] = (acc[r.pageType] || 0) + 1;
  return acc;
}, {});

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), generateSitemap(htmlFiles), 'utf8');
fs.writeFileSync(path.join(ROOT, 'llms.txt'), generateLlmsTxt(htmlFiles), 'utf8');

fs.writeFileSync(
  path.join(ROOT, 'robots.txt'),
  `User-agent: *
Allow: /

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
`,
  'utf8'
);

console.log('Done. Pages updated by type:');
Object.entries(byType).forEach(([t, n]) => console.log(`  ${t}: ${n}`));
console.log(`\nGenerated: sitemap.xml (${htmlFiles.length - 1} URLs), llms.txt, robots.txt`);
