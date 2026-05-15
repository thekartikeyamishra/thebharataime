/**
 * TheBharatAI – Project Validator
 * File: scripts/validate.js
 * Run:  node scripts/validate.js
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let pass = 0, warn = 0, fail = 0;
const ok   = m => { console.log(`  ✅  ${m}`); pass++; };
const bad  = m => { console.log(`  ❌  ${m}`); fail++; };
const note = m => { console.log(`  ⚠️   ${m}`); warn++; };

const REQUIRED = [
  'index.html','about.html','disclaimer.html','privacy-policy.html',
  'terms.html','404.html','offline.html','manifest.json','sw.js',
  'vercel.json','_headers','robots.txt','llms.txt',
  'sitemap.xml','sitemap-index.xml','sitemap-schemes.xml',
  'sitemap-cities.xml','sitemap-states.xml','sitemap-articles.xml',
  'sitemap-hi.xml','og-image.png',
  'icons/icon-72.png','icons/icon-96.png','icons/icon-128.png',
  'icons/icon-144.png','icons/icon-152.png','icons/icon-192.png',
  'icons/icon-384.png','icons/icon-512.png',
];

console.log('\n🔍  TheBharatAI Project Validator\n');
console.log('── Required Files ───────────────────────────────────────');
REQUIRED.forEach(f => {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) ok(`${f}  (${(fs.statSync(p).size/1024).toFixed(1)} KB)`);
  else bad(`MISSING: ${f}`);
});

console.log('\n── index.html Content Checks ────────────────────────────');
const ip = path.join(ROOT,'index.html');
if (fs.existsSync(ip)) {
  const h = fs.readFileSync(ip,'utf8');
  const checks = [
    ['AdSense ID ca-pub-4557897331416844', /ca-pub-4557897331416844/],
    ['Schema.org @graph',                  /@graph/],
    ['Freshness REF date',                 /REF\s*=\s*new Date/],
    ['Closed scheme guard',                /status.*===.*'closed'/],
    ['DPDP Act mention',                   /DPDP/],
    ['NOT affiliated disclaimer',          /NOT affiliated/],
    ['Service Worker register',            /serviceWorker.*register/],
    ['PWA manifest link',                  /manifest\.json/],
    ['Haptic vibrate API',                 /navigator\.vibrate/],
    ['GA4 gtag config',                    /gtag\('config'/],
    ['IntersectionObserver',               /IntersectionObserver/],
    ['Haq Engine form ID',                 /id="haqForm"/],
    ['Results wrapper ID',                 /id="resultsWrap"/],
    ['WhatsApp share',                     /wa\.me/],
    ['Report modal ID',                    /id="reportModal"/],
    ['Disclaimer bar ID',                  /id="discBar"/],
    ['Ticker element',                     /id="ticker"/],
    ['States grid',                        /id="statesGrid"/],
    ['Cities cloud',                       /id="citiesCloud"/],
    ['FAQ list',                           /id="faqList"/],
    ['hreflang hi',                        /hreflang="hi"/],
    ['OG meta image',                      /og:image/],
    ['Fraunces font',                      /Fraunces/],
    ['Devanagari font',                    /Devanagari/],
  ];
  checks.forEach(([l,r]) => r.test(h) ? ok(l) : bad(`Missing: ${l}`));
  if (/G-XXXXXXXXXX/.test(h)) note('Replace G-XXXXXXXXXX with your GA4 Measurement ID');
  const lines = h.split('\n').length;
  lines > 1500 ? ok(`index.html ${lines} lines`) : bad(`index.html only ${lines} lines`);
}

console.log('\n── manifest.json ─────────────────────────────────────────');
const mp = path.join(ROOT,'manifest.json');
if (fs.existsSync(mp)) {
  try {
    const m = JSON.parse(fs.readFileSync(mp,'utf8'));
    m.name         ? ok(`name: ${m.name}`)    : bad('Missing name');
    m.icons?.length>=8 ? ok(`${m.icons.length} icons`) : bad('Need 8 icons');
    m.start_url    ? ok(`start_url: ${m.start_url}`) : bad('Missing start_url');
    m.theme_color  ? ok(`theme_color: ${m.theme_color}`) : bad('Missing theme_color');
    m.shortcuts?.length ? ok(`${m.shortcuts.length} shortcuts`) : note('No shortcuts defined');
  } catch(e) { bad('manifest.json invalid JSON: '+e.message); }
}

console.log('\n── Summary ───────────────────────────────────────────────');
console.log(`  ✅ Passed: ${pass}  ⚠️  Warnings: ${warn}  ❌ Failed: ${fail}`);
if (fail === 0) {
  console.log('\n  🚀  Ready to deploy!\n');
  console.log('  Vercel:  npx vercel --prod');
  console.log('  Netlify: npx netlify deploy --prod --dir=.\n');
  process.exit(0);
} else {
  console.log('\n  Fix the issues above before deploying.\n');
  process.exit(1);
}