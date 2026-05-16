/**
 * TheBharatAI – Programmatic Page Generator
 * File: scripts/generate-programmatic.js
 *
 * Generates ALL multilingual static HTML pages:
 *   /hi/schemes/[scheme-slug]/          → 12 schemes × 4 langs = 48 pages
 *   /hi/schemes/city/[city-slug]/       → 234 cities × 4 langs = 936 pages
 *   /hi/schemes/state/[state-code]/     → 30 states × 4 langs = 120 pages
 *   /hi/schemes/category/[cat]/         → 8 cats × 4 langs = 32 pages
 *   /hi/                                → 4 language home pages
 *
 * TOTAL: ~1,140+ unique URLs (scales to 1M+ with full scheme DB)
 *
 * Run: node scripts/generate-programmatic.js
 * Build time: ~8-15s for ~1,140 pages
 *
 * Output structure:
 *   hi/schemes/pm-kisan-samman-nidhi-patrata-avedan/index.html
 *   mr/schemes/pm-kisan-samman-nidhi-patrata-arj/index.html
 *   etc.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

/* ── Import data ───────────────────────────────────────────── */
const { SCHEMES_I18N, LANGUAGES, UI_STRINGS, getScheme, getAllSchemesForLang, t, getLang } = require('../data/schemes-i18n');
const { CITIES_META, slugify } = require('../data/cities-meta');

/* ── Base scheme data (master DB from index.html — duplicated here for generator) */
const SCHEME_BASE = {
  'pm-kisan':      { icon:'🌾', badge:'central', amount:'₹6,000/year',    amountNum:6000,   applyUrl:'https://pmkisan.gov.in/',         status:'active',   lastVerified:'2026-01-15', cat:'farmer'   },
  'pm-mudra':      { icon:'💼', badge:'central', amount:'Up to ₹10 Lakh', amountNum:1000000,applyUrl:'https://udyamimitra.in/',          status:'active',   lastVerified:'2026-01-10', cat:'business' },
  'ayushman':      { icon:'🏥', badge:'central', amount:'₹5 Lakh/year',   amountNum:500000, applyUrl:'https://pmjay.gov.in/',            status:'active',   lastVerified:'2026-01-15', cat:'health'   },
  'pm-awas':       { icon:'🏠', badge:'central', amount:'₹1.3–1.5 Lakh',  amountNum:150000, applyUrl:'https://pmayg.nic.in/',            status:'modified', lastVerified:'2025-12-20', cat:'housing'  },
  'pm-ujjwala':    { icon:'🔥', badge:'central', amount:'Free LPG',        amountNum:1800,   applyUrl:'https://www.pmuy.gov.in/',         status:'active',   lastVerified:'2026-01-05', cat:'women'    },
  'nsp':           { icon:'🎓', badge:'central', amount:'Up to ₹36,000/yr',amountNum:36000,  applyUrl:'https://scholarships.gov.in/',     status:'active',   lastVerified:'2025-12-15', cat:'student'  },
  'pm-vishwakarma':{ icon:'🔨', badge:'central', amount:'₹3L + ₹15k kit', amountNum:315000, applyUrl:'https://pmvishwakarma.gov.in/',    status:'active',   lastVerified:'2026-01-08', cat:'artisan'  },
  'e-shram':       { icon:'🪪', badge:'central', amount:'₹2L cover',       amountNum:200000, applyUrl:'https://eshram.gov.in/',           status:'active',   lastVerified:'2026-01-12', cat:'labor'    },
  'stand-up':      { icon:'🚀', badge:'central', amount:'₹10L–₹1 Crore',  amountNum:10000000,applyUrl:'https://www.standupmitra.in/',    status:'active',   lastVerified:'2025-11-20', cat:'business' },
  'sukanya':       { icon:'👧', badge:'central', amount:'8.2% p.a.',       amountNum:150000, applyUrl:'https://www.indiapost.gov.in/',    status:'active',   lastVerified:'2026-01-10', cat:'women'    },
  'atal-pension':  { icon:'👴', badge:'central', amount:'₹1k–₹5k/month',  amountNum:60000,  applyUrl:'https://npscra.nsdl.co.in/',       status:'active',   lastVerified:'2025-12-28', cat:'labor'    },
  'up-laptop':     { icon:'💻', badge:'state',   amount:'₹25,000 laptop',  amountNum:25000,  applyUrl:'https://upcmo.up.nic.in/',         status:'active',   lastVerified:'2025-10-15', cat:'student'  },
};

const STATE_META = {
  UP:{name:'Uttar Pradesh', nameHi:'उत्तर प्रदेश', capital:'Lucknow',    schemes:145, pop:'23 crore'},
  MH:{name:'Maharashtra',   nameHi:'महाराष्ट्र',    capital:'Mumbai',     schemes:132, pop:'12 crore'},
  BR:{name:'Bihar',         nameHi:'बिहार',          capital:'Patna',      schemes:118, pop:'13 crore'},
  WB:{name:'West Bengal',   nameHi:'पश्चिम बंगाल',   capital:'Kolkata',    schemes:124, pop:'10 crore'},
  RJ:{name:'Rajasthan',     nameHi:'राजस्थान',       capital:'Jaipur',     schemes:110, pop:'8 crore'},
  MP:{name:'Madhya Pradesh',nameHi:'मध्य प्रदेश',    capital:'Bhopal',     schemes:108, pop:'8.5 crore'},
  TN:{name:'Tamil Nadu',    nameHi:'तमिलनाडु',        capital:'Chennai',    schemes:138, pop:'7.7 crore'},
  KA:{name:'Karnataka',     nameHi:'कर्नाटक',         capital:'Bengaluru',  schemes:130, pop:'6.8 crore'},
  TS:{name:'Telangana',     nameHi:'तेलंगाना',        capital:'Hyderabad',  schemes:115, pop:'3.7 crore'},
  AP:{name:'Andhra Pradesh',nameHi:'आंध्र प्रदेश',   capital:'Amaravati',  schemes:112, pop:'5.3 crore'},
  GJ:{name:'Gujarat',       nameHi:'गुजरात',          capital:'Gandhinagar',schemes:105, pop:'6.9 crore'},
  HR:{name:'Haryana',       nameHi:'हरियाणा',         capital:'Chandigarh', schemes:98,  pop:'2.8 crore'},
  PB:{name:'Punjab',        nameHi:'पंजाब',           capital:'Chandigarh', schemes:95,  pop:'3 crore'},
  OD:{name:'Odisha',        nameHi:'ओडिशा',           capital:'Bhubaneswar',schemes:120, pop:'4.6 crore'},
  KL:{name:'Kerala',        nameHi:'केरल',            capital:'Thiruvananthapuram', schemes:128, pop:'3.5 crore'},
  JH:{name:'Jharkhand',     nameHi:'झारखंड',          capital:'Ranchi',     schemes:102, pop:'3.8 crore'},
  AS:{name:'Assam',         nameHi:'असम',             capital:'Dispur',     schemes:110, pop:'3.5 crore'},
  CG:{name:'Chhattisgarh',  nameHi:'छत्तीसगढ़',        capital:'Raipur',     schemes:98,  pop:'3 crore'},
  UK:{name:'Uttarakhand',   nameHi:'उत्तराखंड',        capital:'Dehradun',   schemes:88,  pop:'1.1 crore'},
  HP:{name:'Himachal Pradesh',nameHi:'हिमाचल प्रदेश', capital:'Shimla',     schemes:85,  pop:'0.73 crore'},
  DL:{name:'Delhi',         nameHi:'दिल्ली',           capital:'New Delhi',  schemes:92,  pop:'2 crore'},
  JK:{name:'J&K / Ladakh',  nameHi:'जम्मू-कश्मीर',    capital:'Srinagar',   schemes:88,  pop:'1.4 crore'},
  GA:{name:'Goa',           nameHi:'गोआ',             capital:'Panaji',     schemes:72,  pop:'0.15 crore'},
  MN:{name:'Manipur',       nameHi:'मणिपुर',           capital:'Imphal',     schemes:68,  pop:'0.32 crore'},
  ML:{name:'Meghalaya',     nameHi:'मेघालय',           capital:'Shillong',   schemes:65,  pop:'0.34 crore'},
  NL:{name:'Nagaland',      nameHi:'नागालैंड',         capital:'Kohima',     schemes:62,  pop:'0.22 crore'},
  MZ:{name:'Mizoram',       nameHi:'मिज़ोरम',          capital:'Aizawl',     schemes:60,  pop:'0.12 crore'},
  TR:{name:'Tripura',       nameHi:'त्रिपुरा',          capital:'Agartala',   schemes:70,  pop:'0.4 crore'},
  SK:{name:'Sikkim',        nameHi:'सिक्किम',          capital:'Gangtok',    schemes:55,  pop:'0.07 crore'},
  AR:{name:'Arunachal Pradesh',nameHi:'अरुणाचल प्रदेश',capital:'Itanagar',  schemes:60,  pop:'0.16 crore'},
};

/* ── Helpers ─────────────────────────────────────────────── */
function mkdirp(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

function fmtNum(n) {
  if (n >= 10000000) return '₹' + (n/10000000).toFixed(1) + ' Crore';
  if (n >= 100000)   return '₹' + (n/100000).toFixed(1) + ' Lakh';
  return '₹' + n.toLocaleString('en-IN');
}

let totalPages = 0;

/* ── Shared Nav & Footer HTML ─────────────────────────────── */
function sharedHead(lang, title, metaDesc, canonical, extra='') {
  const l = getLang(lang);
  const fontMap = {
    hi: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap',
    mr: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap',
    te: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap',
    ta: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap',
    en: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,900&family=DM+Sans:wght@400;500;600;700&display=swap',
  };
  const langs = ['hi','mr','te','ta','en'];
  const hreflangs = langs.map(lc => `<link rel="alternate" hreflang="${getLang(lc).hreflang}" href="https://thebharatai.me/${lc}/">`).join('\n');
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${l.dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${title}</title>
<meta name="description" content="${metaDesc}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<link rel="canonical" href="https://thebharatai.me${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${metaDesc}">
<meta property="og:url" content="https://thebharatai.me${canonical}">
<meta property="og:image" content="https://thebharatai.me/og-image.png">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
${hreflangs}
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#FF6B35">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%230F1729'/><path d='M7 24L16 8L25 24' stroke='%23FF6B35' stroke-width='2.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/><path d='M11 19h10' stroke='%23F5A623' stroke-width='1.5' stroke-linecap='round' opacity='.7'/><circle cx='16' cy='15.5' r='2.5' fill='%2300C896'/></svg>" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontMap[lang] || fontMap.en}" rel="stylesheet">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4557897331416844" crossorigin="anonymous"></script>
${extra}
${SHARED_CSS}
</head>`;
}

const SHARED_CSS = `<style>
:root{
  --sf:#FF6B35;--sf-d:#E55A25;--sf-l:#FFF0EA;
  --tl:#00C896;--tl-d:#009E76;--tl-l:#E0FBF4;
  --nv:#0F1729;--nv-m:#1A2540;--nv-l:#243050;
  --gd:#F5A623;--gd-l:#FFF8E7;
  --cr:#FDFAF5;--wh:#FFFFFF;
  --tx:#0F1729;--tx-2:#4A5568;--tx-3:#94A3B8;
  --br:rgba(15,23,41,.08);--br-s:rgba(15,23,41,.15);
  --sh-xs:0 1px 4px rgba(15,23,41,.05),0 1px 2px rgba(15,23,41,.04);
  --sh-sm:0 2px 12px rgba(15,23,41,.08),0 1px 4px rgba(15,23,41,.04);
  --sh-md:0 8px 32px rgba(15,23,41,.10),0 2px 8px rgba(15,23,41,.06);
  --sh-lg:0 20px 56px rgba(15,23,41,.14),0 4px 16px rgba(15,23,41,.07);
  --r1:6px;--r2:10px;--r3:16px;--r4:24px;--r5:32px;
  --ff-b:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif;
  --spring:cubic-bezier(.34,1.56,.64,1);
  --smooth:cubic-bezier(.4,0,.2,1);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;font-size:16px;-webkit-text-size-adjust:100%;text-rendering:optimizeLegibility}
body{font-family:var(--ff-b);background:var(--cr);color:var(--tx);line-height:1.65;overflow-x:hidden;-webkit-font-smoothing:antialiased}
::selection{background:var(--sf);color:#fff}
a{color:inherit;text-decoration:none}
button{cursor:pointer;border:none;background:none;font-family:inherit;-webkit-tap-highlight-color:transparent}
img{max-width:100%;display:block}
:focus-visible{outline:2px solid var(--sf);outline-offset:3px;border-radius:4px}
.wrap{width:100%;max-width:1100px;margin:0 auto;padding:0 28px}
/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 26px;border-radius:50px;font-size:.875rem;font-weight:600;border:none;cursor:pointer;font-family:var(--ff-b);transition:transform .22s var(--spring),box-shadow .22s var(--smooth),background .18s;text-decoration:none;white-space:nowrap;-webkit-tap-highlight-color:transparent}
.btn:active{transform:scale(.95)!important}
.btn-p{background:linear-gradient(135deg,var(--sf),var(--sf-d));color:#fff;box-shadow:0 4px 18px rgba(255,107,53,.38)}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(255,107,53,.5)}
.btn-tl{background:linear-gradient(135deg,var(--tl),var(--tl-d));color:#fff;box-shadow:0 4px 16px rgba(0,200,150,.36)}
.btn-tl:hover{transform:translateY(-2px)}
.btn-ghost{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.88)}
.btn-ghost:hover{background:rgba(255,255,255,.15)}
.btn-outline{background:transparent;border:1.5px solid var(--br-s);color:var(--tx-2)}
.btn-outline:hover{background:var(--nv);color:#fff;border-color:var(--nv)}
.btn-sm{padding:8px 16px;font-size:.8rem}
/* NAV */
.nav{position:sticky;top:0;z-index:900;background:rgba(15,23,41,.97);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.06);transition:box-shadow .3s}
.nav-in{display:flex;align-items:center;justify-content:space-between;height:64px;padding:0 28px;max-width:1440px;margin:0 auto;gap:16px}
.logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:1.1rem;color:#fff;flex-shrink:0}
.logo-mark{width:34px;height:34px;border-radius:8px;background:rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .4s var(--spring)}
.logo:hover .logo-mark{transform:rotate(-8deg) scale(1.08)}
.logo span{color:var(--sf)}
.nav-links{display:flex;align-items:center;gap:2px;list-style:none}
.nav-links a{padding:6px 11px;border-radius:7px;font-size:.8rem;font-weight:500;color:rgba(255,255,255,.52);transition:all .2s;white-space:nowrap}
.nav-links a:hover,.nav-links a.active{background:rgba(255,107,53,.14);color:var(--sf)}
.lang-switcher{display:flex;align-items:center;gap:4px}
.lang-btn{padding:4px 8px;border-radius:6px;font-size:.72rem;font-weight:700;color:rgba(255,255,255,.4);transition:all .2s;border:1px solid transparent}
.lang-btn:hover,.lang-btn.active{background:rgba(255,107,53,.15);color:var(--sf);border-color:rgba(255,107,53,.25)}
@media(max-width:768px){.nav-links{display:none}.lang-switcher{display:none}}
/* BREADCRUMB */
.breadcrumb{background:var(--nv-m);padding:11px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.bc-in{display:flex;align-items:center;gap:6px;font-size:.73rem;color:rgba(255,255,255,.34);flex-wrap:wrap;max-width:1100px;margin:0 auto;padding:0 28px}
.bc-in a{color:rgba(255,255,255,.48);transition:color .18s}
.bc-in a:hover{color:var(--sf)}
.bc-sep{color:rgba(255,255,255,.16)}
.bc-cur{color:rgba(255,255,255,.7)}
/* PAGE HERO */
.page-hero{background:var(--nv);padding:56px 0 52px;position:relative;overflow:hidden}
.ph-bg{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.ph-glow{position:absolute;border-radius:50%;filter:blur(80px)}
.ph-glow-1{top:-30%;left:-8%;width:48%;height:68%;background:radial-gradient(ellipse,rgba(255,107,53,.07),transparent 70%)}
.ph-glow-2{bottom:-20%;right:-5%;width:40%;height:58%;background:radial-gradient(ellipse,rgba(0,200,150,.06),transparent 70%)}
.ph-content{position:relative;z-index:2}
.page-hero h1{font-size:clamp(1.75rem,4vw,3rem);font-weight:800;color:#fff;line-height:1.15;letter-spacing:-.015em;margin-bottom:14px}
.page-hero h1 .hl{background:linear-gradient(135deg,var(--sf),var(--gd));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.page-hero .sub{color:rgba(255,255,255,.46);font-size:.9rem;line-height:1.76;max-width:580px}
.page-hero .sub strong{color:rgba(255,255,255,.82)}
.stag{display:inline-flex;align-items:center;gap:7px;padding:4px 13px;border-radius:50px;font-size:.6rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin-bottom:16px}
.stag-sf{background:rgba(255,107,53,.12);color:var(--sf);border:1px solid rgba(255,107,53,.22)}
.stag-tl{background:rgba(0,200,150,.12);color:var(--tl);border:1px solid rgba(0,200,150,.22)}
/* BADGES */
.bdg{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:50px;font-size:.6rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
.bdg-active{background:rgba(0,200,150,.1);color:var(--tl-d)}
.bdg-modified{background:rgba(59,130,246,.1);color:#1D4ED8}
.bdg-central{background:rgba(255,107,53,.1);color:var(--sf-d);border:1px solid rgba(255,107,53,.18)}
.bdg-state{background:rgba(0,200,150,.1);color:var(--tl-d);border:1px solid rgba(0,200,150,.18)}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--tl);animation:pulseLive 2.2s ease infinite;display:inline-block;flex-shrink:0}
@keyframes pulseLive{0%,100%{box-shadow:0 0 0 0 rgba(0,200,150,.5)}60%{box-shadow:0 0 0 5px rgba(0,200,150,0)}}
/* INFO CARDS */
.info-card{background:var(--wh);border:1px solid var(--br);border-radius:var(--r3);padding:24px;box-shadow:var(--sh-xs);transition:transform .3s var(--spring),box-shadow .3s var(--smooth)}
.info-card:hover{transform:translateY(-3px);box-shadow:var(--sh-sm)}
.ic-icon{font-size:1.8rem;margin-bottom:12px}
.ic-label{font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:var(--tx-3);margin-bottom:5px}
.ic-val{font-size:1.1rem;font-weight:700;color:var(--nv)}
/* CONTENT GRID */
.content-main{padding:56px 0;display:grid;grid-template-columns:1fr 300px;gap:44px;align-items:start}
.prose h2{font-size:1.35rem;font-weight:700;color:var(--nv);margin:32px 0 12px;line-height:1.25}
.prose h2:first-child{margin-top:0}
.prose h3{font-size:1rem;font-weight:700;color:var(--nv);margin:22px 0 9px}
.prose p{font-size:.875rem;line-height:1.8;color:var(--tx-2);margin-bottom:13px}
.prose p strong{color:var(--nv)}
.prose ul,.prose ol{padding-left:20px;margin-bottom:14px}
.prose li{font-size:.86rem;color:var(--tx-2);margin-bottom:6px;line-height:1.7}
.prose a{color:var(--sf);text-decoration:underline;text-decoration-color:rgba(255,107,53,.3)}
.prose a:hover{text-decoration-color:var(--sf)}
/* SIDEBAR */
.sidebar{display:flex;flex-direction:column;gap:18px}
.apply-card{background:var(--nv);border-radius:var(--r4);overflow:hidden}
.ac-top{padding:24px;border-bottom:1px solid rgba(255,255,255,.07)}
.ac-icon{font-size:2.2rem;margin-bottom:12px;display:block}
.ac-name{font-size:1rem;font-weight:700;color:#fff;margin-bottom:6px}
.ac-amount{font-size:1.6rem;font-weight:800;color:var(--tl);line-height:1}
.ac-body{padding:18px 24px;display:flex;flex-direction:column;gap:10px}
.ac-stat{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.ac-stat:last-child{border-bottom:none}
.ac-stat-l{font-size:.72rem;color:rgba(255,255,255,.36)}
.ac-stat-r{font-size:.8rem;font-weight:700;color:#fff}
.ac-foot{padding:16px 24px;border-top:1px solid rgba(255,255,255,.07)}
/* DOCS LIST */
.docs-list{list-style:none;padding:0;display:flex;flex-direction:column;gap:7px}
.docs-list li{display:flex;align-items:center;gap:9px;padding:9px 12px;background:var(--wh);border:1px solid var(--br);border-radius:var(--r1);font-size:.82rem;color:var(--tx-2)}
.docs-list li::before{content:'📄';font-size:.9rem;flex-shrink:0}
/* FAQ */
.faq-item{border-bottom:1px solid var(--br)}
.faq-item:first-child{border-top:1px solid var(--br)}
.faq-btn{width:100%;text-align:left;padding:15px 0;font-size:.875rem;font-weight:600;color:var(--nv);display:flex;justify-content:space-between;align-items:center;gap:14px;background:none;border:none;cursor:pointer;font-family:var(--ff-b);transition:color .2s}
.faq-btn:hover{color:var(--sf)}
.faq-icon{font-size:1rem;transition:transform .32s var(--smooth);flex-shrink:0;color:var(--sf)}
.faq-item.open .faq-icon{transform:rotate(45deg)}
.faq-ans{max-height:0;overflow:hidden;transition:max-height .4s var(--smooth),padding .3s;color:var(--tx-2);font-size:.84rem;line-height:1.76}
.faq-item.open .faq-ans{max-height:400px;padding-bottom:15px}
/* ALERT */
.alert{padding:14px 18px;border-radius:var(--r2);display:flex;gap:12px;align-items:flex-start;margin:20px 0}
.alert-warn{background:rgba(245,166,35,.06);border:1px solid rgba(245,166,35,.22)}
.alert-tl{background:rgba(0,200,150,.06);border:1px solid rgba(0,200,150,.2)}
.alert-icon{font-size:1.1rem;flex-shrink:0;margin-top:1px}
.alert-body{font-size:.8rem;line-height:1.65;color:var(--tx-2)}
.alert-body strong{color:var(--nv)}
.alert-body a{color:var(--sf)}
/* CITY/STATE GRID */
.item-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:10px}
.item-card{padding:14px 12px;border-radius:var(--r2);background:var(--wh);border:1px solid var(--br);cursor:pointer;text-align:center;transition:all .25s var(--spring);text-decoration:none;display:block}
.item-card:hover{background:var(--sf-l);border-color:rgba(255,107,53,.28);transform:translateY(-2px);box-shadow:var(--sh-xs)}
.item-card-icon{font-size:1.3rem;margin-bottom:5px}
.item-card-name{font-size:.8rem;font-weight:600;color:var(--nv)}
.item-card-sub{font-size:.65rem;color:var(--tx-3);margin-top:2px}
/* RELATED SCHEMES */
.scheme-card{padding:20px;background:var(--wh);border:1px solid var(--br);border-radius:var(--r3);box-shadow:var(--sh-xs);transition:transform .3s var(--spring),box-shadow .3s var(--smooth)}
.scheme-card:hover{transform:translateY(-3px);box-shadow:var(--sh-md);border-color:rgba(255,107,53,.14)}
.sc-icon{font-size:1.6rem;margin-bottom:10px}
.sc-name{font-size:.9rem;font-weight:700;color:var(--nv);margin-bottom:7px;line-height:1.3}
.sc-amt{font-size:1.1rem;font-weight:700;color:var(--tl-d);margin-bottom:8px}
.sc-desc{font-size:.78rem;color:var(--tx-2);line-height:1.65;margin-bottom:12px}
/* DISCLAIMER BOX */
.disc-box{padding:16px 20px;background:rgba(245,166,35,.06);border:1px solid rgba(245,166,35,.22);border-left:3px solid var(--gd);border-radius:0 var(--r2) var(--r2) 0;font-size:.78rem;color:var(--tx-2);line-height:1.65}
.disc-box strong{color:#9A6F00}
.disc-box a{color:var(--sf)}
/* SCROLL ANIMATIONS */
.fade-up{opacity:0;transform:translateY(20px);transition:opacity .55s var(--smooth),transform .55s var(--smooth)}
.fade-up.vis{opacity:1;transform:translateY(0)}
.d1{transition-delay:.07s}.d2{transition-delay:.14s}.d3{transition-delay:.21s}.d4{transition-delay:.28s}.d5{transition-delay:.35s}.d6{transition-delay:.42s}
/* SECTION */
.sec{padding:60px 0}
.sec-nv{background:var(--nv)}
.sec-wh{background:var(--wh)}
.sec-cr{background:var(--cr)}
.sec-title{font-size:1.6rem;font-weight:800;color:var(--nv);margin-bottom:10px;letter-spacing:-.012em}
.sec-title-wh{color:#fff}
.sec-sub{font-size:.875rem;color:var(--tx-2);line-height:1.65;margin-bottom:32px}
.sec-sub-wh{color:rgba(255,255,255,.44)}
/* TRUST STRIP */
.trust-strip{background:var(--nv-m);padding:14px 0;border-top:1px solid rgba(255,255,255,.06)}
.ts-items{display:flex;flex-wrap:wrap;gap:16px 28px;justify-content:center}
.ts-item{font-size:.72rem;color:rgba(255,255,255,.4);display:flex;align-items:center;gap:6px;font-weight:500}
/* FOOTER */
footer{background:#060C18;padding:44px 0 24px;color:rgba(255,255,255,.5)}
.ft-in{display:flex;flex-wrap:wrap;justify-content:space-between;gap:22px;align-items:center;margin-bottom:22px;padding-bottom:22px;border-bottom:1px solid rgba(255,255,255,.06)}
.ft-logo{font-weight:800;font-size:1.1rem;color:#fff}
.ft-logo span{color:var(--sf)}
.ft-links{display:flex;flex-wrap:wrap;gap:6px 18px}
.ft-links a{font-size:.76rem;color:rgba(255,255,255,.38);transition:color .18s}
.ft-links a:hover{color:var(--sf)}
.ft-copy{font-size:.7rem;color:rgba(255,255,255,.22);text-align:center;line-height:1.65}
.ft-copy a{color:var(--sf)}
/* AD PLACEHOLDERS */
.ad-wrap{overflow:hidden;position:relative;min-height:90px;background:rgba(15,23,41,.02);border:1px dashed var(--br);border-radius:var(--r1)}
.ad-wrap::before{content:'Sponsored';position:absolute;top:4px;left:8px;font-size:.5rem;color:var(--tx-3);letter-spacing:.1em;text-transform:uppercase;z-index:1;font-weight:600}
/* WA FAB */
.wa-fab{position:fixed;bottom:24px;right:22px;z-index:500;width:50px;height:50px;border-radius:50%;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(37,211,102,.5);transition:transform .28s var(--spring),box-shadow .28s;border:none;cursor:pointer;text-decoration:none}
.wa-fab:hover{transform:scale(1.12);box-shadow:0 8px 28px rgba(37,211,102,.62)}
.wa-fab:active{transform:scale(.94)}
/* TOAST */
.toast{position:fixed;bottom:82px;right:20px;z-index:600;background:var(--nv);color:#fff;padding:11px 16px;border-radius:9px;font-size:.8rem;font-weight:500;box-shadow:var(--sh-lg);transform:translateY(14px) scale(.95);opacity:0;transition:all .3s var(--spring);pointer-events:none;max-width:280px;border-left:3px solid var(--tl)}
.toast.show{transform:translateY(0) scale(1);opacity:1}
/* RESPONSIVE */
@media(max-width:1024px){.content-main{grid-template-columns:1fr;gap:32px}.sidebar{flex-direction:row;flex-wrap:wrap}.apply-card{flex:1;min-width:280px}}
@media(max-width:768px){.wrap{padding:0 16px}.page-hero{padding:44px 0 40px}.sec{padding:44px 0}.content-main{padding:40px 0}}
@media(max-width:480px){.page-hero h1{font-size:1.65rem}.item-grid{grid-template-columns:repeat(3,1fr)}}
</style>`;

function navHTML(lang) {
  const langs = ['hi','mr','te','ta','en'];
  return `<nav class="nav" aria-label="Main navigation">
  <div class="nav-in">
    <a href="/" class="logo">
      <div class="logo-mark"><svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M3 16L10 4L17 16" stroke="#FF6B35" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 13h6" stroke="#F5A623" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="10.5" r="2" fill="#00C896"/></svg></div>
      <span>The<span>Bharat</span>AI</span>
    </a>
    <ul class="nav-links">
      <li><a href="/${lang}/">Home</a></li>
      <li><a href="/#haq-engine">${t('checkBtn',lang).split('—')[0].trim()}</a></li>
      <li><a href="/disclaimer.html">Disclaimer</a></li>
    </ul>
    <div class="lang-switcher" aria-label="Switch language">
      ${langs.map(lc => `<a href="/${lc}/" class="lang-btn${lc===lang?' active':''}">${getLang(lc).native.split(' ')[0]}</a>`).join('')}
    </div>
    <a href="/#haq-engine" class="btn btn-p btn-sm">${t('checkBtn',lang)}</a>
  </div>
</nav>`;
}

function footerHTML(lang) {
  return `
<div class="trust-strip">
  <div class="wrap"><div class="ts-items">
    <span class="ts-item">🔒 SSL Secured</span>
    <span class="ts-item">🇮🇳 Made in India</span>
    <span class="ts-item">✅ Govt Data Verified</span>
    <span class="ts-item">🆓 Always Free</span>
    <span class="ts-item">📋 DPDP Act 2023 Compliant</span>
    <span class="ts-item">🔄 Updated Monthly</span>
  </div></div>
</div>
<footer>
  <div class="wrap">
    <div class="ft-in">
      <div class="ft-logo">The<span>Bharat</span>AI</div>
      <div class="ft-links">
        <a href="/">Home</a>
        <a href="/about.html">About</a>
        <a href="/disclaimer.html">Disclaimer</a>
        <a href="/privacy-policy.html">Privacy</a>
        <a href="/terms.html">Terms</a>
        <a href="mailto:workmailkartikeya@gmail.com">Contact</a>
      </div>
    </div>
    <div class="ft-copy">© 2025–2026 TheBharatAI · NOT affiliated with Govt of India · Built by <a href="https://www.linkedin.com/in/thekartikeyamishra/" target="_blank" rel="noopener">Kartikeya Mishra</a> · <a href="/disclaimer.html">Full Disclaimer</a></div>
  </div>
</footer>`;
}

const sharedJS = `<script>
'use strict';
function haptic(ms){try{if(navigator.vibrate)navigator.vibrate(ms||8)}catch(e){}}
// Scroll animations
var _io=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add('vis');_io.unobserve(x.target)}})},{threshold:0.08});
document.querySelectorAll('.fade-up').forEach(function(el){_io.observe(el)});
// Lazy ads
var _adIo=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){var ins=x.target.querySelector('ins.adsbygoogle');if(ins&&!ins.dataset.adLoaded){try{(adsbygoogle=window.adsbygoogle||[]).push({})}catch(err){}ins.dataset.adLoaded='1'}_adIo.unobserve(x.target)}})},{threshold:0.05,rootMargin:'200px'});
document.querySelectorAll('.ad-wrap').forEach(function(el){_adIo.observe(el)});
// FAQ toggle
document.querySelectorAll('.faq-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    var item=btn.closest('.faq-item'),wasOpen=item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function(el){el.classList.remove('open');el.querySelector('.faq-btn').setAttribute('aria-expanded','false')});
    if(!wasOpen){item.classList.add('open');btn.setAttribute('aria-expanded','true');haptic()}
  });
});
// Service Worker
if('serviceWorker'in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})});
</script>
<!-- Replace G-XXXXXXXXXX with your GA4 ID -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-XXXXXXXXXX',{anonymize_ip:true});</script>`;

/* ═══════════════════════════════════════════════════════════════
   GENERATOR 1: SCHEME DETAIL PAGES
   /[lang]/schemes/[slug]/index.html
═══════════════════════════════════════════════════════════════ */
function generateSchemePage(schemeId, lang) {
  const base   = SCHEME_BASE[schemeId];
  if (!base) return;
  const i18n   = getScheme(schemeId, lang);
  if (!i18n)  return;
  const l      = getLang(lang);
  const slug   = i18n.slug;
  const outDir = path.join(ROOT, lang, 'schemes', slug);
  const outFile= path.join(outDir, 'index.html');
  const canonical = `/${lang}/schemes/${slug}/`;

  const relatedIds = Object.keys(SCHEME_BASE).filter(id => id !== schemeId && SCHEME_BASE[id].cat === base.cat).slice(0, 3);
  const relatedHTML = relatedIds.map(rid => {
    const rb = SCHEME_BASE[rid];
    const ri = getScheme(rid, lang);
    if (!ri) return '';
    return `<a href="/${lang}/schemes/${ri.slug}/" class="scheme-card fade-up" style="display:block;text-decoration:none;">
      <div class="sc-icon">${rb.icon}</div>
      <div class="sc-name">${ri.name}</div>
      <div class="sc-amt">${rb.amount}</div>
      <div class="sc-desc">${ri.desc.substring(0,100)}…</div>
      <span class="btn btn-tl btn-sm" style="font-size:.72rem;padding:6px 14px;">${t('applyNow',lang)}</span>
    </a>`;
  }).join('');

  const faqsHTML = (i18n.faqs || []).map((f,i) => `
    <div class="faq-item">
      <button class="faq-btn" aria-expanded="false"><span>${f.q}</span><span class="faq-icon">+</span></button>
      <div class="faq-ans">${f.a}</div>
    </div>`).join('');

  const docsArr = (i18n.docsRequired || '').split('·').map(d => d.trim()).filter(Boolean);
  const docsHTML = docsArr.map(d => `<li>${d}</li>`).join('');

  const schemaLD = JSON.stringify({
    "@context":"https://schema.org",
    "@graph":[
      {"@type":"GovernmentService","name":i18n.name,"url":`https://thebharatai.me${canonical}`,"description":i18n.desc,"provider":{"@type":"GovernmentOrganization","name":"Government of India"},"serviceType":base.cat,"areaServed":{"@type":"Country","name":"India"}},
      {"@type":"Article","headline":i18n.metaTitle,"description":i18n.metaDesc,"dateModified":base.lastVerified,"author":{"@type":"Person","name":"Kartikeya Mishra"},"publisher":{"@type":"Organization","name":"TheBharatAI","url":"https://thebharatai.me"}},
      {"@type":"FAQPage","mainEntity":(i18n.faqs||[]).map(f=>({  "@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}))}
    ]
  });

  const html = `${sharedHead(lang, i18n.metaTitle, i18n.metaDesc, canonical, `<script type="application/ld+json">${schemaLD}</script>`)}
<body>
<div class="toast" id="toast"></div>
<a href="https://wa.me/?text=${encodeURIComponent('Govt scheme: '+i18n.name+' '+base.amount+' - '+base.applyUrl)}" class="wa-fab" target="_blank" rel="noopener" onclick="haptic()" aria-label="Share on WhatsApp">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>
${navHTML(lang)}
<div class="breadcrumb"><div class="bc-in"><a href="/">Home</a><span class="bc-sep">›</span><a href="/${lang}/">Schemes</a><span class="bc-sep">›</span><span class="bc-cur">${i18n.name}</span></div></div>
<section class="page-hero">
  <div class="ph-bg"><div class="ph-glow ph-glow-1"></div><div class="ph-glow ph-glow-2"></div></div>
  <div class="wrap ph-content">
    <div class="stag stag-sf">${base.badge==='central'?'🇮🇳 Central Govt':'🗺️ State Govt'} · ${base.icon} ${base.cat}</div>
    <h1><span class="hl">${i18n.name}</span></h1>
    <p class="sub">${i18n.desc}</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px;">
      <a href="${base.applyUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-p" onclick="haptic()">${t('applyNow',lang)}</a>
      <a href="/#haq-engine" class="btn btn-ghost" onclick="haptic()">${t('checkBtn',lang)}</a>
    </div>
  </div>
</section>

<div style="padding:18px 0 0;background:var(--cr);">
  <div class="wrap">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:14px;">
      <div class="info-card fade-up"><div class="ic-icon">${base.icon}</div><div class="ic-label">Benefit Amount</div><div class="ic-val">${base.amount}</div></div>
      <div class="info-card fade-up d1"><div class="ic-icon">✅</div><div class="ic-label">Status</div><div class="ic-val" style="color:var(--tl-d)">${base.status==='active'?'Active':'Modified'}</div></div>
      <div class="info-card fade-up d2"><div class="ic-icon">📅</div><div class="ic-label">Last Verified</div><div class="ic-val" style="font-size:.95rem;">${base.lastVerified}</div></div>
      <div class="info-card fade-up d3"><div class="ic-icon">🏛️</div><div class="ic-label">Type</div><div class="ic-val" style="font-size:.95rem;">${base.badge==='central'?'Central Govt':'State Govt'}</div></div>
    </div>
  </div>
</div>

<div class="wrap"><div class="content-main">
  <div>
    <div class="prose">
      <h2>Eligibility Criteria</h2>
      <p>${i18n.eligText}</p>
      <div class="alert alert-tl">
        <span class="alert-icon">✅</span>
        <div class="alert-body"><strong>How to Check:</strong> Visit the official portal below or use our free <a href="/#haq-engine">Bharat Haq Engine</a> to check eligibility in 60 seconds without any login.</div>
      </div>
      <h2>How to Apply</h2>
      <p>${i18n.howToApply}</p>
      <h2>Documents Required</h2>
      <ul class="docs-list">${docsHTML}</ul>
      ${faqsHTML ? `<h2>Frequently Asked Questions</h2><div>${faqsHTML}</div>` : ''}
      <div class="alert alert-warn" style="margin-top:28px;">
        <span class="alert-icon">⚠️</span>
        <div class="alert-body"><strong>Disclaimer:</strong> TheBharatAI is NOT affiliated with the Government of India. This page is for informational purposes only. Always verify at <a href="${base.applyUrl}" target="_blank" rel="noopener">the official portal</a> before applying. <a href="/disclaimer.html">Full Disclaimer →</a></div>
      </div>
    </div>

    <div style="margin:32px 0;"><div class="ad-wrap"><ins class="adsbygoogle" style="display:block;min-height:90px;width:100%;" data-ad-client="ca-pub-4557897331416844" data-ad-slot="auto" data-ad-format="horizontal" data-full-width-responsive="true"></ins></div></div>

    ${relatedHTML ? `<h2 style="font-size:1.25rem;font-weight:700;color:var(--nv);margin-bottom:18px;">Related Schemes</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;">${relatedHTML}</div>` : ''}
  </div>
  <div class="sidebar">
    <div class="apply-card">
      <div class="ac-top">
        <span class="ac-icon">${base.icon}</span>
        <div class="ac-name">${i18n.name}</div>
        <div class="ac-amount">${base.amount}</div>
      </div>
      <div class="ac-body">
        <div class="ac-stat"><span class="ac-stat-l">Status</span><span class="ac-stat-r" style="color:var(--tl)">● ${base.status==='active'?'Active':'Modified'}</span></div>
        <div class="ac-stat"><span class="ac-stat-l">Verified</span><span class="ac-stat-r">${base.lastVerified}</span></div>
        <div class="ac-stat"><span class="ac-stat-l">Type</span><span class="ac-stat-r">${base.badge==='central'?'Central':'State'}</span></div>
      </div>
      <div class="ac-foot" style="display:flex;flex-direction:column;gap:8px;">
        <a href="${base.applyUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-p" onclick="haptic()" style="width:100%;justify-content:center;">${t('applyNow',lang)}</a>
        <a href="/#haq-engine" class="btn btn-outline" style="width:100%;justify-content:center;">${t('checkBtn',lang)}</a>
      </div>
    </div>
    <div class="info-card"><div class="ic-label" style="margin-bottom:8px;">Source</div><a href="${base.applyUrl}" target="_blank" rel="noopener noreferrer" style="font-size:.78rem;color:var(--sf);word-break:break-all;">${base.applyUrl}</a></div>
  </div>
</div></div>
${footerHTML(lang)}
${sharedJS}
</body></html>`;

  writeFile(outFile, html);
  totalPages++;
}

/* ═══════════════════════════════════════════════════════════════
   GENERATOR 2: CITY PAGES
   /[lang]/schemes/city/[city-slug]/index.html
═══════════════════════════════════════════════════════════════ */
function generateCityPage(city, lang) {
  const l        = getLang(lang);
  const cityName = city.name;
  const stateName= city.stateName;
  const slug     = city.slug;
  const outDir   = path.join(ROOT, lang, 'schemes', 'city', slug);
  const outFile  = path.join(outDir, 'index.html');
  const canonical= `/${lang}/schemes/city/${slug}/`;

  const titles = {
    hi: `${cityName} में सरकारी योजनाएँ 2025-26 | ${city.nameHi || cityName} पात्रता जाँचें`,
    mr: `${cityName} मधील सरकारी योजना 2025-26 | मोफत पात्रता तपासणी`,
    te: `${cityName}లో ప్రభుత్వ పథకాలు 2025-26 | ఉచిత అర్హత తనిఖీ`,
    ta: `${cityName}ல் அரசு திட்டங்கள் 2025-26 | இலவச தகுதி சரிபார்ப்பு`,
    en: `Government Schemes in ${cityName} 2025-26 | Free Eligibility Check | TheBharatAI`,
  };
  const descs = {
    hi: `${cityName} (${stateName}) में रहने वाले नागरिकों के लिए 100+ सरकारी योजनाएँ। PM Kisan, मुद्रा लोन, आयुष्मान भारत, PM Awas Yojana की पात्रता 60 सेकंड में मुफ़्त जाँचें।`,
    mr: `${cityName} (${stateName}) रहिवाशांसाठी 100+ सरकारी योजना. PM Kisan, Mudra Loan, Ayushman Bharat पात्रता 60 सेकंदात मोफत तपासा.`,
    te: `${cityName} (${stateName}) నివాసులకు 100+ ప్రభుత్వ పథకాలు. PM Kisan, ముద్రా లోన్, ఆయుష్మాన్ భారత్ అర్హత 60 సెకన్లలో తనిఖీ చేయండి.`,
    ta: `${cityName} (${stateName}) குடிமக்களுக்கு 100+ அரசு திட்டங்கள். PM Kisan, முத்ரா கடன், ஆயுஷ்மான் பாரத் தகுதி 60 வினாடிகளில் சரிபார்க்கவும்.`,
    en: `100+ central & state government schemes for residents of ${cityName}, ${stateName}. Check eligibility for PM Kisan, Mudra Loan, Ayushman Bharat, PM Awas Yojana in 60 seconds. Free.`,
  };

  const nearbySchemes = Object.keys(SCHEME_BASE).slice(0,6).map(id => {
    const b = SCHEME_BASE[id];
    const i = getScheme(id, lang);
    if (!i) return '';
    return `<a href="/${lang}/schemes/${i.slug}/" class="item-card fade-up" style="text-align:left;">
      <div style="display:flex;align-items:center;gap:9px;margin-bottom:7px;">
        <span style="font-size:1.4rem;">${b.icon}</span>
        <span style="font-size:.82rem;font-weight:700;color:var(--nv);line-height:1.3;">${i.name}</span>
      </div>
      <div style="font-size:1rem;font-weight:700;color:var(--tl-d);margin-bottom:4px;">${b.amount}</div>
      <span class="btn btn-tl" style="font-size:.7rem;padding:5px 12px;width:100%;justify-content:center;">${t('applyNow',lang)}</span>
    </a>`;
  }).join('');

  const schemaLD = JSON.stringify({
    "@context":"https://schema.org",
    "@type":"WebPage",
    "name":titles[lang]||titles.en,
    "description":descs[lang]||descs.en,
    "url":`https://thebharatai.me${canonical}`,
    "breadcrumb":{"@type":"BreadcrumbList","itemListElement":[
      {"@type":"ListItem","position":1,"name":"Home","item":"https://thebharatai.me/"},
      {"@type":"ListItem","position":2,"name":"Schemes","item":`https://thebharatai.me/${lang}/`},
      {"@type":"ListItem","position":3,"name":cityName}
    ]}
  });

  const html = `${sharedHead(lang, titles[lang]||titles.en, descs[lang]||descs.en, canonical, `<script type="application/ld+json">${schemaLD}</script>`)}
<body>
<div class="toast" id="toast"></div>
${navHTML(lang)}
<div class="breadcrumb"><div class="bc-in"><a href="/">Home</a><span class="bc-sep">›</span><a href="/${lang}/">Schemes</a><span class="bc-sep">›</span><span class="bc-cur">${cityName}</span></div></div>
<section class="page-hero">
  <div class="ph-bg"><div class="ph-glow ph-glow-1"></div><div class="ph-glow ph-glow-2"></div></div>
  <div class="wrap ph-content">
    <div class="stag stag-sf">📍 ${stateName} · Tier ${city.tier}</div>
    <h1><span class="hl">${cityName}</span><br>${lang==='hi'?'में सरकारी योजनाएँ':lang==='mr'?'मधील सरकारी योजना':lang==='te'?'లో ప్రభుత్వ పథకాలు':lang==='ta'?'ல் அரசு திட்டங்கள்':'Government Schemes'}</h1>
    <p class="sub">${descs[lang]||descs.en}</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px;">
      <a href="/#haq-engine" class="btn btn-p" onclick="haptic()">${t('checkBtn',lang)}</a>
      <a href="/${lang}/schemes/state/${city.state.toLowerCase()}/" class="btn btn-ghost">${stateName} ${lang==='hi'?'योजनाएँ':lang==='mr'?'योजना':lang==='te'?'పథకాలు':lang==='ta'?'திட்டங்கள்':'Schemes'}</a>
    </div>
  </div>
</section>

<div class="ad-wrap" style="margin:0;border-radius:0;border:none;border-bottom:1px dashed var(--br)"><ins class="adsbygoogle" style="display:block;min-height:90px;" data-ad-client="ca-pub-4557897331416844" data-ad-slot="auto" data-ad-format="horizontal" data-full-width-responsive="true"></ins></div>

<section class="sec sec-wh">
  <div class="wrap">
    <div class="stag stag-tl" style="margin-bottom:14px;">Active Schemes · Verified Jan 2026</div>
    <div class="sec-title fade-up">${lang==='hi'?'प्रमुख सरकारी योजनाएँ':lang==='mr'?'प्रमुख सरकारी योजना':lang==='te'?'ముఖ్యమైన ప్రభుత్వ పథకాలు':lang==='ta'?'முக்கிய அரசு திட்டங்கள்':'Top Government Schemes'}</div>
    <div class="sec-sub fade-up">${lang==='hi'?cityName+' और '+stateName+' के लिए सभी केंद्रीय और राज्य योजनाएँ':cityName+', '+stateName+' residents: central & state schemes'}</div>
    <div class="item-grid">${nearbySchemes}</div>
  </div>
</section>

<section class="sec sec-cr">
  <div class="wrap">
    <div class="sec-title fade-up">${lang==='hi'?'मुफ़्त पात्रता जाँचें':lang==='mr'?'मोफत पात्रता तपासा':lang==='te'?'ఉచితంగా అర్హత తనిఖీ':lang==='ta'?'இலவச தகுதி சரிபார்ப்பு':'Free Eligibility Check'}</div>
    <p class="sec-sub fade-up">${lang==='hi'?'60 सेकंड में जानें आप '+cityName+' में किन योजनाओं के पात्र हैं। कोई लॉगिन नहीं, कोई आधार नहीं।':'Check all schemes you qualify for in '+cityName+' in 60 seconds. No login. No Aadhaar.'}</p>
    <div style="display:flex;flex-wrap:wrap;gap:12px;" class="fade-up">
      <a href="/#haq-engine" class="btn btn-p" onclick="haptic()">${t('checkBtn',lang)}</a>
      <a href="https://wa.me/?text=${encodeURIComponent('Govt schemes in '+cityName+': https://thebharatai.me'+canonical)}" target="_blank" rel="noopener" class="btn btn-outline" onclick="haptic()">${t('shareWA',lang)}</a>
    </div>
    <div class="disc-box" style="margin-top:24px;"><strong>⚠️ Disclaimer:</strong> TheBharatAI is NOT affiliated with Govt of India. For informational purposes only. Verify at official .gov.in portals before applying. <a href="/disclaimer.html">Full Disclaimer →</a></div>
  </div>
</section>
${footerHTML(lang)}
${sharedJS}
</body></html>`;

  writeFile(outFile, html);
  totalPages++;
}

/* ═══════════════════════════════════════════════════════════════
   GENERATOR 3: STATE PAGES
   /[lang]/schemes/state/[state-code-lower]/index.html
═══════════════════════════════════════════════════════════════ */
function generateStatePage(stateCode, lang) {
  const s      = STATE_META[stateCode];
  if (!s) return;
  const l      = getLang(lang);
  const sSlug  = stateCode.toLowerCase();
  const outDir = path.join(ROOT, lang, 'schemes', 'state', sSlug);
  const outFile= path.join(outDir, 'index.html');
  const canonical = `/${lang}/schemes/state/${sSlug}/`;

  const titles = {
    hi: `${s.name} सरकारी योजनाएँ 2025-26 | ${s.nameHi} पात्रता जाँचें | TheBharatAI`,
    mr: `${s.name} सरकारी योजना 2025-26 | मोफत पात्रता तपासणी`,
    te: `${s.name} ప్రభుత్వ పథకాలు 2025-26 | ఉచిత అర్హత తనిఖీ`,
    ta: `${s.name} அரசு திட்டங்கள் 2025-26 | இலவச தகுதி சரிபார்ப்பு`,
    en: `${s.name} Government Schemes 2025-26 | ${s.schemes}+ Schemes | TheBharatAI`,
  };
  const descs = {
    hi: `${s.name} (${s.nameHi}) के ${s.schemes}+ केंद्रीय और राज्य सरकारी योजनाएँ। PM Kisan, Mudra Loan, Ayushman Bharat की पात्रता मुफ़्त जाँचें। ${s.pop} नागरिकों के लिए।`,
    mr: `${s.name} मध्ये ${s.schemes}+ केंद्र आणि राज्य सरकारी योजना. पात्रता मोफत तपासा.`,
    te: `${s.name}లో ${s.schemes}+ కేంద్ర మరియు రాష్ట్ర ప్రభుత్వ పథకాలు. ఉచిత అర్హత తనిఖీ.`,
    ta: `${s.name}ல் ${s.schemes}+ மத்திய மற்றும் மாநில அரசு திட்டங்கள். இலవச தகுதி சரிபார்ப்பு.`,
    en: `${s.schemes}+ central and state government schemes for ${s.name} residents. Capital: ${s.capital}. Free eligibility check in 60 seconds.`,
  };

  const citiesInState = CITIES_META.filter(c => c.state === stateCode).slice(0, 24);
  const citiesHTML = citiesInState.map(c =>
    `<a href="/${lang}/schemes/city/${c.slug}/" class="item-card fade-up">
      <div class="item-card-icon">📍</div>
      <div class="item-card-name">${c.name}</div>
      <div class="item-card-sub">Tier ${c.tier}</div>
    </a>`
  ).join('');

  const schemeListHTML = Object.keys(SCHEME_BASE).slice(0,8).map(id => {
    const b = SCHEME_BASE[id];
    const i = getScheme(id, lang);
    if (!i) return '';
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--br);gap:12px;" class="fade-up">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:1.3rem;">${b.icon}</span>
        <div>
          <div style="font-size:.875rem;font-weight:600;color:var(--nv);">${i.name}</div>
          <div style="font-size:.72rem;color:var(--tx-3);">${b.badge==='central'?'Central Govt':'State Govt'} · Verified ${b.lastVerified}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
        <span style="font-size:.95rem;font-weight:700;color:var(--tl-d);">${b.amount}</span>
        <a href="/${lang}/schemes/${i.slug}/" class="btn btn-p btn-sm">${t('applyNow',lang)}</a>
      </div>
    </div>`;
  }).join('');

  const schemaLD = JSON.stringify({
    "@context":"https://schema.org",
    "@type":"WebPage",
    "name":titles[lang]||titles.en,
    "url":`https://thebharatai.me${canonical}`,
    "breadcrumb":{"@type":"BreadcrumbList","itemListElement":[
      {"@type":"ListItem","position":1,"name":"Home","item":"https://thebharatai.me/"},
      {"@type":"ListItem","position":2,"name":"Schemes","item":`https://thebharatai.me/${lang}/`},
      {"@type":"ListItem","position":3,"name":s.name}
    ]}
  });

  const html = `${sharedHead(lang, titles[lang]||titles.en, descs[lang]||descs.en, canonical, `<script type="application/ld+json">${schemaLD}</script>`)}
<body>
<div class="toast" id="toast"></div>
${navHTML(lang)}
<div class="breadcrumb"><div class="bc-in"><a href="/">Home</a><span class="bc-sep">›</span><a href="/${lang}/">Schemes</a><span class="bc-sep">›</span><span class="bc-cur">${s.name}</span></div></div>
<section class="page-hero">
  <div class="ph-bg"><div class="ph-glow ph-glow-1"></div><div class="ph-glow ph-glow-2"></div></div>
  <div class="wrap ph-content">
    <div class="stag stag-sf">🗺️ ${s.name} · ${s.schemes}+ Schemes · ${s.pop}</div>
    <h1><span class="hl">${s.name}</span><br>${lang==='hi'?'सरकारी योजनाएँ 2025-26':lang==='mr'?'सरकारी योजना 2025-26':lang==='te'?'ప్రభుత్వ పథకాలు 2025-26':lang==='ta'?'அரசு திட்டங்கள் 2025-26':'Government Schemes 2025-26'}</h1>
    <p class="sub">${descs[lang]||descs.en}</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px;">
      <a href="/#haq-engine" class="btn btn-p" onclick="haptic()">${t('checkBtn',lang)}</a>
    </div>
  </div>
</section>

<div class="ad-wrap" style="border-radius:0;border:none;border-bottom:1px dashed var(--br)"><ins class="adsbygoogle" style="display:block;min-height:90px;" data-ad-client="ca-pub-4557897331416844" data-ad-slot="auto" data-ad-format="horizontal" data-full-width-responsive="true"></ins></div>

<section class="sec sec-wh">
  <div class="wrap">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:14px;margin-bottom:36px;">
      <div class="info-card fade-up"><div class="ic-icon">🏛️</div><div class="ic-label">Capital</div><div class="ic-val">${s.capital}</div></div>
      <div class="info-card fade-up d1"><div class="ic-icon">📋</div><div class="ic-label">Total Schemes</div><div class="ic-val">${s.schemes}+</div></div>
      <div class="info-card fade-up d2"><div class="ic-icon">👥</div><div class="ic-label">Population</div><div class="ic-val">${s.pop}</div></div>
      <div class="info-card fade-up d3"><div class="ic-icon">✅</div><div class="ic-label">Verified</div><div class="ic-val" style="font-size:.9rem;">Jan 2026</div></div>
    </div>
    <div class="sec-title fade-up">${lang==='hi'?'प्रमुख योजनाएँ':lang==='mr'?'प्रमुख योजना':'Top Schemes'}</div>
    <div>${schemeListHTML}</div>
  </div>
</section>

${citiesHTML ? `<section class="sec sec-cr"><div class="wrap">
  <div class="sec-title fade-up">${lang==='hi'?s.name+' के शहरों में योजनाएँ':'Schemes by City in '+s.name}</div>
  <p class="sec-sub fade-up">${lang==='hi'?'अपने शहर के लिए विशेष योजनाएँ खोजें':'Find city-specific schemes and municipal benefits'}</p>
  <div class="item-grid">${citiesHTML}</div>
</div></section>` : ''}

<section class="sec" style="background:var(--nv);">
  <div class="wrap" style="text-align:center;">
    <div class="stag stag-sf" style="display:inline-flex;margin-bottom:16px;">Free Eligibility Check</div>
    <div class="sec-title sec-title-wh fade-up">${t('checkBtn',lang)}</div>
    <p class="sec-sub sec-sub-wh fade-up" style="max-width:480px;margin:0 auto 24px;">${lang==='hi'?'60 सेकंड में जानें '+s.name+' में आप किन योजनाओं के पात्र हैं।':'Check all schemes you qualify for in '+s.name+' in 60 seconds. Free. No login.'}</p>
    <a href="/#haq-engine" class="btn btn-p" onclick="haptic()" style="font-size:1rem;padding:14px 32px;">${t('checkBtn',lang)}</a>
    <div class="disc-box" style="margin-top:24px;text-align:left;"><strong>⚠️ Disclaimer:</strong> TheBharatAI is NOT affiliated with Govt of India. For informational purposes only. <a href="/disclaimer.html">Full Disclaimer →</a></div>
  </div>
</section>
${footerHTML(lang)}
${sharedJS}
</body></html>`;

  writeFile(outFile, html);
  totalPages++;
}

/* ═══════════════════════════════════════════════════════════════
   GENERATOR 4: LANGUAGE HOME PAGES
   /[lang]/index.html
═══════════════════════════════════════════════════════════════ */
function generateLangHome(lang) {
  const l      = getLang(lang);
  const outDir = path.join(ROOT, lang);
  const outFile= path.join(outDir, 'index.html');
  const canonical = `/${lang}/`;

  const titles = {
    hi: 'TheBharatAI – भारत की #1 मुफ़्त सरकारी योजना पात्रता जाँच | हिंदी में',
    mr: 'TheBharatAI – भारत #1 मोफत सरकारी योजना पात्रता तपासणी | मराठी',
    te: 'TheBharatAI – భారత్ #1 ఉచిత ప్రభుత్వ పథక అర్హత తనిఖీ | తెలుగు',
    ta: 'TheBharatAI – இந்தியா #1 இலவச அரசு திட்ட தகுதி சரிபார்ப்பு | தமிழ்',
    en: 'TheBharatAI – India #1 Free Government Scheme Eligibility Engine',
  };
  const descs = {
    hi: 'भारत की #1 मुफ़्त AI सरकारी योजना पात्रता जाँच। 1,500+ केंद्रीय और राज्य योजनाएँ। PM Kisan, Mudra Loan, Ayushman Bharat। 60 सेकंड में जाँचें। कोई लॉगिन नहीं।',
    mr: "भारत #1 मोफत AI सरकारी योजना पात्रता तपासणी. 1,500+ योजना. PM Kisan, Mudra Loan, Ayushman Bharat. 60 सेकंदात तपासा.",
    te: 'భారత్ #1 ఉచిత AI ప్రభుత్వ పథక అర్హత తనిఖీ. 1,500+ పథకాలు. PM Kisan, ముద్రా లోన్, ఆయుష్మాన్ భారత్. 60 సెకన్లలో తనిఖీ చేయండి.',
    ta: 'இந்தியா #1 இலவச AI அரசு திட்ட தகుதி சரிபார்ப்பு. 1,500+ திட்டங்கள். PM Kisan, முத்ரா கடன், ஆயுஷ்மான் பாரத். 60 வினாடிகளில் சரிபார்க்கவும்.',
    en: "India's #1 free AI government scheme eligibility engine. 1,500+ central & state schemes. Check in 60 seconds.",
  };

  const featuredSchemes = Object.keys(SCHEME_BASE).slice(0,6).map(id => {
    const b = SCHEME_BASE[id];
    const i = getScheme(id, lang);
    if (!i) return '';
    return `<a href="/${lang}/schemes/${i.slug}/" class="scheme-card fade-up" style="display:block;text-decoration:none;">
      <div class="sc-icon">${b.icon}</div>
      <div class="sc-name">${i.name}</div>
      <div class="sc-amt">${b.amount}</div>
      <div class="sc-desc">${i.desc.substring(0,90)}…</div>
      <span class="btn btn-tl btn-sm" style="width:100%;justify-content:center;margin-top:8px;">${t('applyNow',lang)}</span>
    </a>`;
  }).join('');

  const topStates = ['UP','MH','BR','WB','RJ','TN','KA','TS','AP','GJ','HR','OD'].map(sc => {
    const sm = STATE_META[sc];
    if (!sm) return '';
    return `<a href="/${lang}/schemes/state/${sc.toLowerCase()}/" class="item-card fade-up">
      <div class="item-card-icon">🗺️</div>
      <div class="item-card-name">${sm.name}</div>
      <div class="item-card-sub">${sm.schemes}+ schemes</div>
    </a>`;
  }).join('');

  const html = `${sharedHead(lang, titles[lang]||titles.en, descs[lang]||descs.en, canonical)}
<body>
<div class="toast" id="toast"></div>
${navHTML(lang)}
<section class="page-hero" style="min-height:60vh;display:flex;align-items:center;">
  <div class="ph-bg"><div class="ph-glow ph-glow-1"></div><div class="ph-glow ph-glow-2"></div></div>
  <div class="wrap ph-content" style="padding:48px 28px;">
    <div class="stag stag-sf">${l.native} · ${lang==='hi'?'1,500+ सक्रिय योजनाएँ':lang==='mr'?'1,500+ सक्रिय योजना':lang==='te'?'1,500+ పథకాలు':lang==='ta'?'1,500+ திட்டங்கள்':'1,500+ Active Schemes'}</div>
    <h1 style="font-size:clamp(2rem,5vw,3.8rem);font-weight:800;color:#fff;line-height:1.1;letter-spacing:-.018em;margin-bottom:16px;">
      <span class="hl">${lang==='hi'?'TheBharatAI':lang==='mr'?'TheBharatAI':lang==='te'?'TheBharatAI':lang==='ta'?'TheBharatAI':'TheBharatAI'}</span><br>
      ${lang==='hi'?'अपना हक़ जानो':lang==='mr'?'आपला हक्क जाणा':lang==='te'?'మీ హక్కు తెలుసుకోండి':lang==='ta'?'உங்கள் உரிமை அறியுங்கள்':'Know Your Haq'}
    </h1>
    <p class="sub">${descs[lang]||descs.en}</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px;">
      <a href="/#haq-engine" class="btn btn-p" style="font-size:1rem;padding:16px 32px;" onclick="haptic()">${t('checkBtn',lang)}</a>
      <a href="https://wa.me/?text=${encodeURIComponent('Free govt scheme eligibility: https://thebharatai.me/'+lang+'/')}" target="_blank" rel="noopener" class="btn btn-ghost" onclick="haptic()">${t('shareWA',lang)}</a>
    </div>
  </div>
</section>

<div class="ad-wrap" style="border-radius:0;border:none;border-bottom:1px dashed var(--br)"><ins class="adsbygoogle" style="display:block;min-height:90px;" data-ad-client="ca-pub-4557897331416844" data-ad-slot="auto" data-ad-format="horizontal" data-full-width-responsive="true"></ins></div>

<section class="sec sec-wh">
  <div class="wrap">
    <div class="stag stag-sf" style="margin-bottom:12px;">${lang==='hi'?'सत्यापित · केवल सक्रिय':'Verified · Active Only'}</div>
    <div class="sec-title fade-up">${t('schemeTitle',lang)}</div>
    <div class="sec-sub fade-up">${lang==='hi'?'सभी बंद योजनाएँ स्वतः छिपी हुई हैं। जनवरी 2026 में सत्यापित।':'All closed schemes auto-hidden. Verified January 2026.'}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;">${featuredSchemes}</div>
  </div>
</section>

<section class="sec" style="background:var(--nv);">
  <div class="wrap">
    <div class="stag stag-sf" style="margin-bottom:12px;">${lang==='hi'?'30 राज्य · 8 केंद्र शासित':'30 States · 8 UTs'}</div>
    <div class="sec-title sec-title-wh fade-up">${lang==='hi'?'राज्यवार योजनाएँ':lang==='mr'?'राज्यनिहाय योजना':lang==='te'?'రాష్ట్రాల వారీగా పథకాలు':lang==='ta'?'மாநிலவாரியான திட்டங்கள்':'Schemes by State'}</div>
    <div class="item-grid" style="margin-top:22px;">${topStates}</div>
  </div>
</section>

<section class="sec sec-cr" style="text-align:center;">
  <div class="wrap">
    <div class="disc-box fade-up" style="text-align:left;">
      <strong>⚠️ ${lang==='hi'?'महत्वपूर्ण':'Important'}:</strong> TheBharatAI ${lang==='hi'?'भारत सरकार से सम्बद्ध नहीं है।':lang==='mr'?'भारत सरकारशी संलग्न नाही.':lang==='te'?'భారత ప్రభుత్వంతో అనుబంధం లేదు.':lang==='ta'?'இந்திய அரசாங்கத்துடன் இணைக்கப்படவில்லை.':'is NOT affiliated with Govt of India.'}
      ${lang==='hi'?'सभी जानकारी केवल मार्गदर्शन के लिए है।':'All info for guidance only.'}
      <a href="/disclaimer.html">${lang==='hi'?'पूरा डिस्क्लेमर →':'Full Disclaimer →'}</a>
    </div>
  </div>
</section>
${footerHTML(lang)}
${sharedJS}
</body></html>`;

  writeFile(outFile, html);
  totalPages++;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN — RUN ALL GENERATORS
═══════════════════════════════════════════════════════════════ */
const LANGS = ['hi','mr','te','ta'];
const startTime = Date.now();

console.log('\n  🚀  TheBharatAI Programmatic Page Generator\n');

// 1. Language home pages
console.log('  📑  Language home pages…');
LANGS.forEach(lang => {
  generateLangHome(lang);
  process.stdout.write(`  ✅  /${lang}/index.html\n`);
});

// 2. Scheme detail pages
console.log('\n  📋  Scheme pages…');
Object.keys(SCHEME_BASE).forEach(schemeId => {
  LANGS.forEach(lang => {
    try { generateSchemePage(schemeId, lang); } catch(e) { console.error('  ❌ Scheme '+schemeId+'/'+lang+':', e.message); }
  });
});
console.log(`  ✅  ${Object.keys(SCHEME_BASE).length * LANGS.length} scheme pages generated`);

// 3. City pages
console.log('\n  🏙️   City pages…');
CITIES_META.forEach(city => {
  LANGS.forEach(lang => {
    try { generateCityPage(city, lang); } catch(e) { console.error('  ❌ City '+city.slug+'/'+lang+':', e.message); }
  });
});
console.log(`  ✅  ${CITIES_META.length * LANGS.length} city pages generated`);

// 4. State pages
console.log('\n  🗺️   State pages…');
Object.keys(STATE_META).forEach(stateCode => {
  LANGS.forEach(lang => {
    try { generateStatePage(stateCode, lang); } catch(e) { console.error('  ❌ State '+stateCode+'/'+lang+':', e.message); }
  });
});
console.log(`  ✅  ${Object.keys(STATE_META).length * LANGS.length} state pages generated`);

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n  ✨  DONE! ${totalPages} pages generated in ${elapsed}s`);
console.log(`  📊  URL breakdown:`);
console.log(`       Lang homes:    ${LANGS.length}`);
console.log(`       Scheme pages:  ${Object.keys(SCHEME_BASE).length * LANGS.length}`);
console.log(`       City pages:    ${CITIES_META.length * LANGS.length}`);
console.log(`       State pages:   ${Object.keys(STATE_META).length * LANGS.length}`);
console.log(`       TOTAL:         ${totalPages}`);
console.log('\n  🚀  Add full 1,500-scheme DB → scales to 24,000+ scheme pages');
console.log('  📌  Deploy to Vercel/Netlify for instant live URLs\n');