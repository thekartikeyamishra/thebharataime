/**
 * TheBharatAI – Sitemap Generator v2
 * File: scripts/generate-sitemap-v2.js
 *
 * Generates:
 *   sitemap-programmatic.xml    — all 1072+ programmatic URLs
 *   sitemap-index.xml           — updated index referencing all sitemaps
 *
 * Run: node scripts/generate-sitemap-v2.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const { CITIES_META } = require('../data/cities-meta');
const { SCHEMES_I18N } = require('../data/schemes-i18n');

const BASE = 'https://thebharatai.me';
const TODAY = new Date().toISOString().split('T')[0];
const LANGS = ['hi','mr','te','ta'];

const SCHEME_SLUGS = {
  'pm-kisan': {
    hi:'pm-kisan-samman-nidhi-patrata-avedan',
    mr:'pm-kisan-samman-nidhi-patrata-arj',
    te:'pm-kisan-samman-nidhi-arhata-darkhasthu',
    ta:'pm-kisan-samman-nidhi-thakulidhal-vilmpu',
  },
  'pm-mudra': {
    hi:'pm-mudra-yojana-loan-patrata-avedan',
    mr:'pm-mudra-yojana-karz-patrata-arj',
    te:'pm-mudra-yojana-loan-arhata-darkhasthu',
    ta:'pm-mudra-yojana-kadan-thakulidhal-vilmpu',
  },
  'ayushman': {
    hi:'ayushman-bharat-pm-jay-patrata-golden-card',
    mr:'ayushman-bharat-pm-jay-patrata-golden-card',
    te:'ayushman-bharat-pm-jay-arhata-golden-card',
    ta:'ayushman-bharat-pm-jay-thakulidhal-card',
  },
  'pm-awas':        { hi:'pm-awas-yojana-gramin-patrata-avedan',  mr:'pm-awas-yojana-patrata-arj',    te:'pm-awas-yojana-arhata',        ta:'pm-awas-yojana-thakulidhal'        },
  'pm-ujjwala':     { hi:'pm-ujjwala-yojana-free-lpg-patrata',    mr:'pm-ujjwala-yojana-free-lpg',    te:'pm-ujjwala-yojana-free-lpg',   ta:'pm-ujjwala-yojana-free-lpg'        },
  'nsp':            { hi:'nsp-scholarship-patrata-avedan',         mr:'nsp-scholarship-patrata-arj',   te:'nsp-scholarship-arhata',       ta:'nsp-scholarship-thakulidhal'       },
  'pm-vishwakarma': { hi:'pm-vishwakarma-yojana-patrata-loan',    mr:'pm-vishwakarma-yojana-patrata', te:'pm-vishwakarma-yojana-arhata', ta:'pm-vishwakarma-yojana-thakulidhal' },
  'e-shram':        { hi:'e-shram-card-patrata-registration',     mr:'e-shram-card-patrata-nondani',  te:'e-shram-card-arhata',          ta:'e-shram-card-thakulidhal'          },
  'stand-up':       { hi:'stand-up-india-loan-patrata',           mr:'stand-up-india-loan-patrata',   te:'stand-up-india-loan-arhata',   ta:'stand-up-india-loan-thakulidhal'   },
  'sukanya':        { hi:'sukanya-samriddhi-yojana-patrata',       mr:'sukanya-samriddhi-yojana',      te:'sukanya-samriddhi-yojana',     ta:'sukanya-samriddhi-tiru-thakulidhal'},
  'atal-pension':   { hi:'atal-pension-yojana-patrata',           mr:'atal-pension-yojana-patrata',   te:'atal-pension-yojana-arhata',   ta:'atal-pension-thakulidhal'          },
  'up-laptop':      { hi:'up-free-laptop-yojana-patrata',         mr:'up-free-laptop-yojana',         te:'up-free-laptop-yojana',        ta:'up-free-laptop-yojana'             },
};

const STATE_CODES = ['UP','MH','BR','WB','RJ','MP','TN','KA','TS','AP','GJ','HR','PB','OD','KL','JH','AS','CG','UK','HP','DL','JK','GA','MN','ML','NL','MZ','TR','SK','AR'];

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function generateProgrammaticSitemap() {
  const urls = [];

  // Language homes
  LANGS.forEach(lang => {
    urls.push(urlEntry(`${BASE}/${lang}/`, TODAY, 'weekly', '0.90'));
  });

  // Scheme pages
  Object.keys(SCHEME_SLUGS).forEach(schemeId => {
    LANGS.forEach(lang => {
      const slug = SCHEME_SLUGS[schemeId][lang];
      if (slug) {
        urls.push(urlEntry(`${BASE}/${lang}/schemes/${slug}/`, TODAY, 'monthly', '0.80'));
      }
    });
  });

  // City pages
  CITIES_META.forEach(city => {
    LANGS.forEach(lang => {
      const prio = city.tier === 1 ? '0.75' : city.tier === 2 ? '0.70' : city.tier === 3 ? '0.65' : '0.60';
      urls.push(urlEntry(`${BASE}/${lang}/schemes/city/${city.slug}/`, TODAY, 'monthly', prio));
    });
  });

  // State pages
  STATE_CODES.forEach(sc => {
    LANGS.forEach(lang => {
      urls.push(urlEntry(`${BASE}/${lang}/schemes/state/${sc.toLowerCase()}/`, TODAY, 'monthly', '0.78'));
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(ROOT, 'sitemap-programmatic.xml'), xml, 'utf8');
  console.log(`  ✅  sitemap-programmatic.xml  (${urls.length} URLs)`);
  return urls.length;
}

function updateSitemapIndex(totalProgrammatic) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${BASE}/sitemap.xml</loc><lastmod>${TODAY}</lastmod></sitemap>
  <sitemap><loc>${BASE}/sitemap-schemes.xml</loc><lastmod>${TODAY}</lastmod></sitemap>
  <sitemap><loc>${BASE}/sitemap-cities.xml</loc><lastmod>${TODAY}</lastmod></sitemap>
  <sitemap><loc>${BASE}/sitemap-states.xml</loc><lastmod>${TODAY}</lastmod></sitemap>
  <sitemap><loc>${BASE}/sitemap-articles.xml</loc><lastmod>${TODAY}</lastmod></sitemap>
  <sitemap><loc>${BASE}/sitemap-hi.xml</loc><lastmod>${TODAY}</lastmod></sitemap>
  <sitemap><loc>${BASE}/sitemap-programmatic.xml</loc><lastmod>${TODAY}</lastmod></sitemap>
</sitemapindex>`;
  fs.writeFileSync(path.join(ROOT, 'sitemap-index.xml'), xml, 'utf8');
  console.log('  ✅  sitemap-index.xml updated (7 sitemaps)');
}

console.log('\n  🗺️   TheBharatAI Sitemap Generator v2\n');
const count = generateProgrammaticSitemap();
updateSitemapIndex(count);
console.log(`\n  ✨  Done! ${count} programmatic URLs in sitemap\n`);