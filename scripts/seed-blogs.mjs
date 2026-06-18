/**
 * Seed published blog posts for SEO. Uses DATABASE_URL from .env.local only.
 * Run: npm run blog:seed
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.rfflanges.com';

function loadEnvFile(filename) {
  const file = path.join(ROOT, filename);
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const POSTS = [
  {
    slug: 'stainless-steel-flanges-guide-types-standards-applications',
    title: 'Stainless Steel Flanges: Complete Guide to Types, Standards & Applications',
    excerpt:
      'Learn about weld neck, slip-on, blind and socket weld stainless steel flanges. Covers ASTM A182 grades, pressure ratings, and how to source quality flanges from India.',
    cover_image: 'images/hero-flanges-manufacturing.png',
    published_at: '2026-01-10T10:00:00Z',
    content: `
<p>Stainless steel flanges are critical components in piping systems across oil &amp; gas, petrochemical, power generation, and food processing industries. Choosing the right flange type and grade directly affects safety, pressure integrity, and project lifecycle cost.</p>

<h2>Common Types of Stainless Steel Flanges</h2>
<ul>
  <li><strong>Weld Neck (WNRF)</strong> — Best for high-pressure and high-temperature service; tapered hub reduces stress concentration at the weld.</li>
  <li><strong>Slip-On (SORF)</strong> — Economical option for lower-pressure systems; fillet welded inside and outside.</li>
  <li><strong>Blind (BLRF)</strong> — Used to close pipeline ends or isolate sections for maintenance.</li>
  <li><strong>Socket Weld (SWRF)</strong> — Ideal for smaller bore pipes in high-pressure applications.</li>
  <li><strong>Lap Joint</strong> — Used with stub ends where frequent dismantling is required.</li>
</ul>

<h2>Key Standards &amp; Grades</h2>
<p>Most industrial buyers specify flanges per <strong>ASTM A182</strong> (forged stainless) and <strong>ASME B16.5</strong> (dimensions &amp; pressure classes). Popular grades include:</p>
<ul>
  <li><strong>SS 304 / 304L</strong> — General corrosion resistance, food &amp; chemical applications</li>
  <li><strong>SS 316 / 316L</strong> — Superior resistance to chlorides and marine environments</li>
  <li><strong>SS 321 / 347</strong> — Stabilized grades for elevated temperature service</li>
  <li><strong>SS 904L</strong> — Aggressive chemical and sulphuric acid environments</li>
</ul>

<h2>Pressure Classes Explained</h2>
<p>ASME B16.5 defines pressure classes from 150# through 2500#. Selection depends on design temperature, pipe schedule, and fluid pressure. Always match flange class with valve and fitting ratings in the same line.</p>

<h2>What to Look for in a Flange Supplier</h2>
<p>When sourcing from India or globally, verify:</p>
<ol>
  <li>Mill test certificates (MTC) traceable to heat numbers</li>
  <li>Dimensional inspection per ASME B16.5</li>
  <li>Positive material identification (PMI) testing</li>
  <li>ISO 9001:2015 certified manufacturing</li>
</ol>

<p>Ramdevra Forge &amp; Fittings manufactures and exports a full range of <a href="/stainless-steel-flanges-supplier-exporter">stainless steel flanges</a> from Mumbai, India — including 304, 316, 321, 347, and 904L grades in all pressure classes. <a href="/contact">Request a quote</a> with your size, rating, and quantity requirements.</p>
`,
  },
  {
    slug: 'astm-ansi-flange-standards-difference-buyers-guide',
    title: 'ASTM vs ANSI Flange Standards: What Industrial Buyers Need to Know',
    excerpt:
      'Understand the difference between ASTM material specs and ANSI/ASME dimensional standards for flanges. A practical guide for procurement teams and project engineers.',
    cover_image: 'images/flangesbg.jpg',
    published_at: '2026-02-18T10:00:00Z',
    content: `
<p>Procurement engineers often encounter both <strong>ASTM</strong> and <strong>ANSI/ASME</strong> references when buying flanges. These standards serve different purposes — confusing them can lead to costly rework on site.</p>

<h2>ASTM — Material Specification</h2>
<p>ASTM standards (e.g. <strong>ASTM A105</strong> for carbon steel, <strong>ASTM A182</strong> for stainless and alloy steel) define:</p>
<ul>
  <li>Chemical composition limits</li>
  <li>Mechanical property requirements</li>
  <li>Heat treatment conditions</li>
  <li>Testing and certification requirements</li>
</ul>
<p>ASTM does not define flange dimensions — only what the metal must be.</p>

<h2>ANSI / ASME — Dimensional &amp; Pressure Standards</h2>
<p><strong>ASME B16.5</strong> (formerly ANSI B16.5) covers dimensions, tolerances, pressure-temperature ratings, and marking for flanges from NPS ½" to 24". <strong>ASME B16.47</strong> covers larger sizes (26"–60") in Series A and B.</p>

<h2>How They Work Together</h2>
<p>A typical specification might read: <em>"Flanges per ASME B16.5, Class 300, Material ASTM A182 F316L"</em>. This tells the manufacturer both the size/rating and the metallurgy required.</p>

<h2>Common Mistakes to Avoid</h2>
<ul>
  <li>Ordering ASTM A105 flanges for sour service without NACE MR0175 compliance</li>
  <li>Mixing metric pipe with imperial B16.5 flanges without adapter spools</li>
  <li>Specifying wrong facing type (RF vs RTJ) for the gasket system</li>
  <li>Accepting flanges without MTC or third-party inspection when required</li>
</ul>

<h2>Global Sourcing from India</h2>
<p>India is one of the world's largest exporters of forged flanges. Mumbai's Kumbharwada and surrounding industrial zones host established manufacturers with decades of export experience to the US, Middle East, and Europe.</p>

<p>At <a href="/about-us">Ramdevra Forge &amp; Fittings</a>, we supply flanges meeting ASTM A182, A105, and ASME B16.5 / B16.47 requirements with full documentation. Browse our <a href="/stainless-steel-flanges-supplier-exporter">stainless steel flange range</a> or <a href="/contact">contact our sales team</a> for project-specific quotes.</p>
`,
  },
  {
    slug: 'duplex-super-duplex-steel-piping-corrosive-environments',
    title: 'Duplex & Super Duplex Steel in Piping: Why Industries Choose Them',
    excerpt:
      'Duplex S31803 and Super Duplex S32750 offer higher strength and superior chloride resistance than austenitic stainless. Learn applications, grades, and sourcing tips.',
    cover_image: 'images/ss-products.jpg',
    published_at: '2026-03-25T10:00:00Z',
    content: `
<p>When austenitic stainless steels like 316L reach their corrosion limits — particularly in chloride-rich environments — engineers turn to <strong>duplex</strong> and <strong>super duplex</strong> stainless steels for piping, flanges, and fittings.</p>

<h2>What Makes Duplex Different?</h2>
<p>Duplex stainless steels have a mixed austenitic-ferritic microstructure, delivering:</p>
<ul>
  <li>Approximately twice the yield strength of 316L</li>
  <li>Excellent resistance to stress corrosion cracking (SCC)</li>
  <li>Good pitting and crevice corrosion resistance</li>
  <li>Lower nickel content than austenitic grades — cost advantage in volatile nickel markets</li>
</ul>

<h2>Popular Grades</h2>
<table>
  <thead><tr><th>Grade</th><th>UNS</th><th>Typical Use</th></tr></thead>
  <tbody>
    <tr><td>Duplex 2205</td><td>S31803 / S32205</td><td>Offshore, desalination, chemical processing</td></tr>
    <tr><td>Super Duplex 2507</td><td>S32750 / S32760</td><td>Sour gas, subsea, aggressive chloride service</td></tr>
  </tbody>
</table>

<h2>Applications in Oil &amp; Gas</h2>
<p>Super duplex flanges and fittings are widely used in:</p>
<ul>
  <li>Subsea flowlines and risers</li>
  <li>HPHT wellhead equipment</li>
  <li>Offshore platform firewater systems</li>
  <li>LNG and cryogenic adjacent piping (with proper impact testing)</li>
</ul>

<h2>Sourcing Considerations</h2>
<p>Duplex materials require careful heat treatment and welding procedures. Always request:</p>
<ol>
  <li>Full MTC per EN 10204 3.1 or 3.2</li>
  <li>Ferrite/austenite phase balance reports where applicable</li>
  <li>Impact test results for low-temperature service</li>
  <li>NACE MR0175 / ISO 15156 compliance for sour service</li>
</ol>

<p>Ramdevra Forge exports <a href="/super-duplex-steel-s32750-s32760-flanges-supplier-exporter">super duplex flanges</a>, pipes, fittings, and fasteners to projects worldwide. <a href="/contact">Get a technical quote</a> with your NACE, temperature, and pressure requirements.</p>
`,
  },
  {
    slug: 'pipe-fittings-oil-gas-projects-selection-guide',
    title: 'How to Choose Pipe Fittings for Oil & Gas Projects',
    excerpt:
      'A procurement guide to butt weld, forged, and socket weld fittings for oil and gas pipelines. Covers ASTM specs, material selection, and quality documentation.',
    cover_image: 'images/slider-3.jpg',
    published_at: '2026-05-08T10:00:00Z',
    content: `
<p>Pipe fittings connect, redirect, and branch piping in refineries, pipelines, and process plants. Selecting the correct fitting type and material grade is essential for code compliance and long-term integrity.</p>

<h2>Main Fitting Categories</h2>
<h3>Butt Weld Fittings (ASTM A234 / A403)</h3>
<p>Used on larger bore lines; welded for permanent joints. Includes elbows, tees, reducers, and caps. Carbon steel (WPB) and stainless (WP304/316) are most common.</p>

<h3>Forged Socket Weld &amp; Threaded Fittings (ASTM A105 / A182)</h3>
<p>Used on smaller bore, high-pressure lines typically ≤ 2". Common in instrument and utility piping.</p>

<h3>High-Pressure Forged Fittings</h3>
<p>3000# and 6000# class fittings for severe service. Material grades must match parent pipe and flanges.</p>

<h2>Material Selection by Service</h2>
<ul>
  <li><strong>Sweet service</strong> — Carbon steel A234 WPB or A105; standard corrosion allowance</li>
  <li><strong>Sour service (H₂S)</strong> — NACE-compliant carbon or low-alloy steel; hardness limits apply</li>
  <li><strong>Corrosive chemical</strong> — SS 316L, duplex, or alloy 20 depending on media</li>
  <li><strong>High temperature</strong> — Alloy steel (A234 WP11/WP22) or SS 321/347</li>
</ul>

<h2>Documentation Checklist</h2>
<p>For oil &amp; gas projects, fittings should ship with:</p>
<ul>
  <li>Mill test certificates (EN 10204 3.1 minimum)</li>
  <li>Dimensional reports per ASME B16.9 / B16.11</li>
  <li>Heat number traceability on every component</li>
  <li>Third-party inspection (TPI) when specified in the PO</li>
</ul>

<p>Ramdevra Forge supplies <a href="/carbon-steel-astm-a234-pipe-fittings-supplier-exporter">carbon steel ASTM A234 fittings</a>, stainless and alloy forged fittings, and complete piping packages. Based in Mumbai with global export capability — <a href="/contact">submit your bill of materials</a> for competitive pricing.</p>
`,
  },
  {
    slug: 'flange-manufacturer-mumbai-india-global-export-guide',
    title: 'Flange Manufacturer in Mumbai, India: A Global Buyer\'s Guide',
    excerpt:
      'Why international buyers source flanges from Mumbai manufacturers. Covers quality standards, export logistics, inspection, and what to expect from Indian suppliers.',
    cover_image: 'images/hero-factory-ramdevra-forge.png',
    published_at: '2026-06-05T10:00:00Z',
    content: `
<p>Mumbai — particularly the Kumbharwada forging district — has been a global hub for flange and fitting manufacturing for over four decades. Buyers from the United States, Middle East, Europe, and Southeast Asia regularly source from Indian manufacturers for quality, lead time, and cost advantages.</p>

<h2>Why Source Flanges from India?</h2>
<ul>
  <li><strong>Established supply chain</strong> — Raw material access, forging, machining, and testing in one region</li>
  <li><strong>Export experience</strong> — Manufacturers accustomed to ASTM, ASME, EN, and DIN specifications</li>
  <li><strong>Competitive pricing</strong> — Lower manufacturing costs without compromising on code compliance</li>
  <li><strong>Flexibility</strong> — Custom sizes, non-standard thicknesses, and project-specific coatings</li>
</ul>

<h2>Quality Markers to Verify</h2>
<p>Not all suppliers are equal. Before placing orders, confirm:</p>
<ol>
  <li><strong>ISO 9001:2015</strong> certification with valid scope covering forging/flange manufacturing</li>
  <li>In-house or approved-lab <strong>PMI (Positive Material Identification)</strong> capability</li>
  <li>Ultrasonic testing (UT) and dye penetrant testing (DPT) for critical applications</li>
  <li>Track record exporting to your target market (US, EU, GCC)</li>
</ol>

<h2>Export Logistics from Mumbai</h2>
<p>Mumbai's Nhava Sheva (JNPT) port handles the majority of flange exports. Typical lead times:</p>
<ul>
  <li>Standard catalog sizes: 2–4 weeks manufacturing + 3–5 weeks shipping (destination dependent)</li>
  <li>Custom forgings: 4–8 weeks depending on size and grade</li>
  <li>Air freight available for urgent shutdown / turnaround projects</li>
</ul>

<h2>About Ramdevra Forge &amp; Fittings</h2>
<p>Established in 2006, <a href="/about-us">Ramdevra Forge &amp; Fittings</a> is an ISO 9001:2015 certified manufacturer and exporter of:</p>
<ul>
  <li><a href="/stainless-steel-flanges-supplier-exporter">Stainless steel flanges</a> — 304, 316, 321, 347, 904L</li>
  <li>Carbon steel and alloy steel flanges — A105, A182, A350</li>
  <li>Pipe fittings, forged fittings, fasteners, and specialty alloys</li>
</ul>
<p>We serve clients across 40+ countries with full MTC documentation and third-party inspection support.</p>

<h2>Request a Quote</h2>
<p>Email <strong>sales@rfflanges.com</strong> or call <strong>+91-9920142161</strong> with your flange specification, quantity, and delivery destination. Our team responds within 24 hours on business days.</p>
<p><a href="/contact" class="fixit_btn">Contact Us Today</a></p>
`,
  },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not set. Add it to .env.local');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  let inserted = 0;
  let skipped = 0;

  for (const post of POSTS) {
    const { rowCount } = await client.query(
      `INSERT INTO public.blog_posts
        (title, slug, excerpt, content, cover_image, author_name, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'published', $7)
       ON CONFLICT (slug) DO NOTHING`,
      [
        post.title,
        post.slug,
        post.excerpt,
        post.content.trim(),
        post.cover_image,
        'Ramdevra Forge',
        post.published_at,
      ]
    );
    if (rowCount > 0) inserted++;
    else skipped++;
  }

  const { rows } = await client.query(
    `SELECT slug, published_at FROM public.blog_posts WHERE status = 'published' ORDER BY published_at DESC`
  );

  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');

  for (const row of rows) {
    const loc = `${SITE}/blog/${encodeURIComponent(row.slug)}`;
    if (sitemap.includes(loc)) continue;
    const lastmod = new Date(row.published_at).toISOString().slice(0, 10);
    const entry = `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>
`;
    sitemap = sitemap.replace('</urlset>', entry + '</urlset>');
  }

  fs.writeFileSync(sitemapPath, sitemap);
  await client.end();

  console.log(`Blog seed complete: ${inserted} inserted, ${skipped} already existed.`);
  console.log(`Sitemap updated with ${rows.length} blog post URL(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
