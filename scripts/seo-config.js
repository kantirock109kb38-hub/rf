/** Central SEO / GEO / AEO configuration for Ramdevra Forge & Fittings */
export const SITE = {
  url: 'https://www.rfflanges.com',
  name: 'Ramdevra Forge & Fittings',
  legalName: 'Ramdevra Forge & Fittings',
  tagline: 'Manufacturer, Supplier & Exporter of Industrial Piping Products',
  description:
    'ISO-certified manufacturer and global exporter of stainless steel pipes, pipe fittings, forged fittings, flanges, fasteners, rods, bars, and specialty alloy products from Mumbai, India.',
  email: 'sales@rfflanges.com',
  phone: '+91-9920142161',
  phoneLandline: '+91-22-66159077',
  founded: 2006,
  logo: '/images/logo.jpg',
  defaultImage: '/images/logo.jpg',
  locale: 'en_IN',
  language: 'en',
  address: {
    street: 'Shop No-3, Ground Floor, Plot No-171/181, 3rd Kumbharwada, Dr M.G Marg',
    locality: 'Kumbharwada',
    city: 'Mumbai',
    region: 'Maharashtra',
    postalCode: '400004',
    country: 'IN',
    countryName: 'India',
  },
  geo: {
    latitude: 18.9582,
    longitude: 72.8321,
  },
  hours: 'Mo-Fr 10:30-18:30',
  sameAs: [
    'https://www.facebook.com/flangesandpipefitting',
    'https://www.linkedin.com/in/ramdevra-forge-a85839aa/',
    'https://www.instagram.com/ramdevraforge/',
  ],
  exportMarkets: [
    'United States', 'United Kingdom', 'UAE', 'Saudi Arabia', 'Germany',
    'France', 'Italy', 'Singapore', 'Malaysia', 'Australia', 'Canada',
    'Netherlands', 'Qatar', 'Kuwait', 'Oman', 'South Africa', 'Brazil',
  ],
  certifications: ['ISO 9001:2015'],
  productCategories: [
    'Stainless Steel', 'Duplex Steel', 'Super Duplex Steel', 'Carbon Steel',
    'Alloy Steel', 'Inconel', 'Hastelloy', 'Monel', 'Nickel', 'Titanium',
    'Cupro Nickel', 'Alloy 20', 'SMO 254', 'Copper Brass',
  ],
};

export const PAGE_DEFAULTS = {
  'index.html': {
    type: 'home',
    description:
      'Ramdevra Forge & Fittings — ISO-certified manufacturer, supplier and exporter of stainless steel pipes, fittings, flanges, forged fittings and fasteners from Mumbai, India. Global delivery.',
    priority: 1.0,
  },
  'about-us.html': {
    type: 'about',
    description:
      'About Ramdevra Forge & Fittings — established in 2006 in Mumbai, India. Manufacturer and exporter of flanges, pipe fittings, fasteners and stainless steel products with ISO 9001 certification.',
    priority: 0.9,
  },
  'contact.html': {
    type: 'contact',
    description:
      'Contact Ramdevra Forge & Fittings in Mumbai, India for quotes on pipes, fittings, flanges and industrial piping products. Phone +91-9920142161 | sales@rfflanges.com',
    priority: 0.9,
  },
  'sitemap.html': {
    type: 'utility',
    description: 'HTML sitemap of all product pages and categories at Ramdevra Forge & Fittings.',
    priority: 0.3,
    noindex: true,
  },
  'blog.html': {
    type: 'page',
    description:
      'Blog and industry insights from Ramdevra Forge & Fittings — guides on stainless steel pipes, flanges, fittings and specialty alloy products.',
    priority: 0.85,
  },
  'blog-post.html': {
    type: 'page',
    description: 'Read the latest blog article from Ramdevra Forge & Fittings.',
    priority: 0.7,
    noindex: true,
  },
};
