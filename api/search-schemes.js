/**
 * TheBharatAI – Scheme Search API
 * File: api/search-schemes.js
 *
 * Vercel Serverless Function (Node.js 18+)
 * GET /api/search-schemes?q=kisan&lang=hi&limit=10
 *
 * Parameters:
 *   q     {string}  search query (min 2 chars, max 100 chars)
 *   lang  {string}  language code: hi | mr | te | ta | en (default: en)
 *   limit {number}  max results 1–20 (default: 10)
 *   cat   {string}  filter by category: farmer|student|business|women|health|labor
 *
 * Returns:
 *   { results: [{id, name, amount, desc, slug, url, matchScore}], total, lang }
 *
 * Caching: 10-minute edge cache (Vercel Edge Network)
 * Deploy: auto-deployed as /api/search-schemes on Vercel
 */

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://thebharatai.me';

// Inline scheme data (mirrors data/schemes-i18n.js — no file I/O in serverless)
const SCHEMES_SEARCH = [
  {
    id: 'pm-kisan', cat: 'farmer', status: 'active', amount: '₹6,000/yr',
    applyUrl: 'https://pmkisan.gov.in/',
    en: { name: 'PM Kisan Samman Nidhi', slug: 'pm-kisan-eligibility-apply', tags: ['farmer','kisan','agricultural','land','6000'] },
    hi: { name: 'पीएम किसान सम्मान निधि', slug: 'pm-kisan-samman-nidhi-patrata-avedan', tags: ['किसान','खेती','भूमि','6000','सम्मान'] },
    mr: { name: 'पीएम किसान सन्मान निधी', slug: 'pm-kisan-samman-nidhi-patrata-arj', tags: ['शेतकरी','शेती'] },
    te: { name: 'పీఎం కిసాన్ సమ్మాన్ నిధి', slug: 'pm-kisan-samman-nidhi-arhata-darkhasthu', tags: ['రైతు','వ్యవసాయం'] },
    ta: { name: 'பிரதமர் கிசான் சம்மான் நிதி', slug: 'pm-kisan-samman-nidhi-thakulidhal-vilmpu', tags: ['விவசாயி'] },
  },
  {
    id: 'pm-mudra', cat: 'business', status: 'active', amount: '₹10L loan',
    applyUrl: 'https://udyamimitra.in/',
    en: { name: 'PM Mudra Yojana', slug: 'pm-mudra-yojana-loan-eligibility', tags: ['loan','business','msme','mudra','10lakh','collateral'] },
    hi: { name: 'पीएम मुद्रा योजना', slug: 'pm-mudra-yojana-loan-patrata-avedan', tags: ['ऋण','व्यापार','मुद्रा','लोन'] },
    mr: { name: 'पीएम मुद्रा योजना', slug: 'pm-mudra-yojana-karz-patrata-arj', tags: ['कर्ज','व्यापार'] },
    te: { name: 'పీఎం ముద్రా యోజన', slug: 'pm-mudra-yojana-loan-arhata-darkhasthu', tags: ['రుణం','వ్యాపారం'] },
    ta: { name: 'பிரதமர் முத்ரா திட்டம்', slug: 'pm-mudra-yojana-kadan-thakulidhal-vilmpu', tags: ['கடன்','தொழில்'] },
  },
  {
    id: 'ayushman', cat: 'health', status: 'active', amount: '₹5L/yr health',
    applyUrl: 'https://pmjay.gov.in/',
    en: { name: 'Ayushman Bharat PM-JAY', slug: 'ayushman-bharat-eligibility-card', tags: ['health','hospital','insurance','ayushman','golden card','5lakh'] },
    hi: { name: 'आयुष्मान भारत पीएम-जेएवाई', slug: 'ayushman-bharat-pm-jay-patrata-golden-card', tags: ['स्वास्थ्य','अस्पताल','आयुष्मान','गोल्डन कार्ड'] },
    mr: { name: 'आयुष्मान भारत पीएम-जेएवाई', slug: 'ayushman-bharat-pm-jay-patrata-golden-card', tags: ['आरोग्य','रुग्णालय'] },
    te: { name: 'ఆయుష్మాన్ భారత్ పిఎం-జెఎవై', slug: 'ayushman-bharat-pm-jay-arhata-golden-card', tags: ['ఆరోగ్యం','ఆసుపత్రి'] },
    ta: { name: 'ஆயுஷ்மான் பாரத் பிரதமர்-ஜே', slug: 'ayushman-bharat-pm-jay-thakulidhal-card', tags: ['சுகாதாரம்','மருத்துவமனை'] },
  },
  {
    id: 'pm-awas', cat: 'housing', status: 'modified', amount: '₹1.3–1.5L',
    applyUrl: 'https://pmayg.nic.in/',
    en: { name: 'PM Awas Yojana Gramin', slug: 'pm-awas-yojana-eligibility-apply', tags: ['house','home','housing','awas','rural','gramin'] },
    hi: { name: 'पीएम आवास योजना ग्रामीण', slug: 'pm-awas-yojana-gramin-patrata-avedan', tags: ['घर','आवास','ग्रामीण','मकान'] },
    mr: { name: 'पीएम आवास योजना ग्रामीण', slug: 'pm-awas-yojana-patrata-arj', tags: ['घर','ग्रामीण'] },
    te: { name: 'పీఎం ఆవాస్ యోజన గ్రామీణ', slug: 'pm-awas-yojana-arhata', tags: ['ఇల్లు','గ్రామీణ'] },
    ta: { name: 'பிரதமர் ஆவாஸ் யோஜனா கிராமீண', slug: 'pm-awas-yojana-thakulidhal', tags: ['வீடு','கிராமீண'] },
  },
  {
    id: 'pm-ujjwala', cat: 'women', status: 'active', amount: 'Free LPG',
    applyUrl: 'https://www.pmuy.gov.in/',
    en: { name: 'PM Ujjwala Yojana 2.0', slug: 'pm-ujjwala-free-lpg-eligibility', tags: ['lpg','gas','free','women','ujjwala','cylinder'] },
    hi: { name: 'पीएम उज्ज्वला योजना 2.0', slug: 'pm-ujjwala-yojana-free-lpg-patrata', tags: ['एलपीजी','गैस','उज्ज्वला','महिला','मुफ्त'] },
    mr: { name: 'पीएम उज्ज्वला योजना 2.0', slug: 'pm-ujjwala-yojana-free-lpg', tags: ['एलपीजी','गैस'] },
    te: { name: 'పీఎం ఉజ్జ్వల యోజన 2.0', slug: 'pm-ujjwala-yojana-free-lpg', tags: ['ఎల్‌పీజీ','గ్యాస్'] },
    ta: { name: 'பிரதமர் உஜ்வலா திட்டம் 2.0', slug: 'pm-ujjwala-yojana-free-lpg', tags: ['எல்பிஜி','இலவசம்'] },
  },
  {
    id: 'nsp', cat: 'student', status: 'active', amount: '₹36,000/yr',
    applyUrl: 'https://scholarships.gov.in/',
    en: { name: 'National Scholarship Portal (NSP)', slug: 'nsp-scholarship-eligibility-apply', tags: ['scholarship','student','study','nsp','sc','st','obc','36000'] },
    hi: { name: 'राष्ट्रीय छात्रवृत्ति पोर्टल (NSP)', slug: 'nsp-scholarship-patrata-avedan', tags: ['छात्रवृत्ति','स्कॉलरशिप','विद्यार्थी'] },
    mr: { name: 'राष्ट्रीय शिष्यवृत्ती पोर्टल', slug: 'nsp-scholarship-patrata-arj', tags: ['शिष्यवृत्ती','विद्यार्थी'] },
    te: { name: 'జాతీయ స్కాలర్‌షిప్ పోర్టల్', slug: 'nsp-scholarship-arhata', tags: ['స్కాలర్‌షిప్','విద్యార్థి'] },
    ta: { name: 'தேசிய உதவித்தொகை போர்டல்', slug: 'nsp-scholarship-thakulidhal', tags: ['உதவித்தொகை','மாணவர்'] },
  },
  {
    id: 'pm-vishwakarma', cat: 'artisan', status: 'active', amount: '₹3L+toolkit',
    applyUrl: 'https://pmvishwakarma.gov.in/',
    en: { name: 'PM Vishwakarma Yojana', slug: 'pm-vishwakarma-artisan-guide', tags: ['artisan','craftsman','vishwakarma','tool','loan','18 trades'] },
    hi: { name: 'पीएम विश्वकर्मा योजना', slug: 'pm-vishwakarma-yojana-patrata-loan', tags: ['कारीगर','शिल्पकार','विश्वकर्मा','औजार'] },
    mr: { name: 'पीएम विश्वकर्मा योजना', slug: 'pm-vishwakarma-yojana-patrata', tags: ['कारागीर','हस्तकला'] },
    te: { name: 'పీఎం విశ్వకర్మ యోజన', slug: 'pm-vishwakarma-yojana-arhata', tags: ['చేతివృత్తి'] },
    ta: { name: 'பிரதமர் விஸ்வகர்மா திட்டம்', slug: 'pm-vishwakarma-yojana-thakulidhal', tags: ['கைவினை'] },
  },
  {
    id: 'e-shram', cat: 'labor', status: 'active', amount: '₹2L cover',
    applyUrl: 'https://eshram.gov.in/',
    en: { name: 'e-Shram Card', slug: 'e-shram-card-registration-eligibility', tags: ['eshram','labour','worker','informal','insurance','2lakh','card'] },
    hi: { name: 'ई-श्रम कार्ड', slug: 'e-shram-card-patrata-registration', tags: ['श्रम','कार्ड','मजदूर','बीमा','ई-श्रम'] },
    mr: { name: 'ई-श्रम कार्ड', slug: 'e-shram-card-patrata-nondani', tags: ['श्रम','मजूर'] },
    te: { name: 'ఇ-శ్రమ కార్డ్', slug: 'e-shram-card-arhata', tags: ['శ్రమ','కూలీ'] },
    ta: { name: 'ஈ-ஷ்ரம் கார்டு', slug: 'e-shram-card-thakulidhal', tags: ['தொழிலாளர்'] },
  },
  {
    id: 'sukanya', cat: 'women', status: 'active', amount: '8.2% p.a.',
    applyUrl: 'https://www.indiapost.gov.in/',
    en: { name: 'Sukanya Samriddhi Yojana', slug: 'sukanya-samriddhi-yojana-eligibility', tags: ['girl','daughter','sukanya','savings','interest','tax'] },
    hi: { name: 'सुकन्या समृद्धि योजना', slug: 'sukanya-samriddhi-yojana-patrata', tags: ['बेटी','लड़की','सुकन्या','बचत'] },
    mr: { name: 'सुकन्या समृद्धी योजना', slug: 'sukanya-samriddhi-yojana', tags: ['मुलगी','बचत'] },
    te: { name: 'సుకన్యా సమృద్ధి యోజన', slug: 'sukanya-samriddhi-yojana', tags: ['బాలిక','పొదుపు'] },
    ta: { name: 'சுகன்யா சம்ருத்தி திட்டம்', slug: 'sukanya-samriddhi-tiru-thakulidhal', tags: ['பெண்','சேமிப்பு'] },
  },
  {
    id: 'atal-pension', cat: 'labor', status: 'active', amount: '₹5k/month',
    applyUrl: 'https://npscra.nsdl.co.in/',
    en: { name: 'Atal Pension Yojana', slug: 'atal-pension-yojana-eligibility', tags: ['pension','retirement','atal','monthly','5000'] },
    hi: { name: 'अटल पेंशन योजना', slug: 'atal-pension-yojana-patrata', tags: ['पेंशन','वृद्धावस्था','अटल'] },
    mr: { name: 'अटल पेन्शन योजना', slug: 'atal-pension-yojana-patrata', tags: ['पेन्शन'] },
    te: { name: 'అటల్ పెన్షన్ యోజన', slug: 'atal-pension-yojana-arhata', tags: ['పెన్షన్'] },
    ta: { name: 'அடல் ஓய்வூதிய திட்டம்', slug: 'atal-pension-thakulidhal', tags: ['ஓய்வூதியம்'] },
  },
];

function scoreScheme(scheme, query, lang, cat) {
  const l = lang in scheme ? lang : 'en';
  const ldata = scheme[l] || scheme.en;
  if (!ldata) return 0;
  // Category filter
  if (cat && scheme.cat !== cat) return 0;
  // Closed schemes never returned
  if (scheme.status === 'closed') return 0;

  const q = query.toLowerCase();
  const name = (ldata.name || '').toLowerCase();
  const tags = (ldata.tags || []).join(' ').toLowerCase();
  const id   = scheme.id.toLowerCase();
  const amt  = scheme.amount.toLowerCase();

  let score = 0;
  if (name.includes(q))     score += 100;
  if (name.startsWith(q))   score += 50;
  if (tags.includes(q))     score += 60;
  if (id.includes(q))       score += 40;
  if (amt.includes(q))      score += 20;
  // Partial word matches
  const words = q.split(/\s+/);
  words.forEach(w => {
    if (w.length < 2) return;
    if (name.includes(w))  score += 30;
    if (tags.includes(w))  score += 20;
  });
  return score;
}

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60'); // 10-min edge cache
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET')     return res.status(405).json({ error: 'Method Not Allowed' });

  const { q = '', lang = 'en', limit = '10', cat = '' } = req.query;

  // Validate query
  const query = String(q).trim().substring(0, 100);
  if (query.length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters', results: [], total: 0 });
  }

  const validLangs  = ['en','hi','mr','te','ta'];
  const chosenLang  = validLangs.includes(lang) ? lang : 'en';
  const limitNum    = Math.min(Math.max(parseInt(limit) || 10, 1), 20);
  const catFilter   = String(cat).trim().toLowerCase();

  // Score all schemes
  const scored = SCHEMES_SEARCH
    .map(s => ({ ...s, score: scoreScheme(s, query, chosenLang, catFilter) }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limitNum);

  const results = scored.map(s => {
    const l = chosenLang in s ? chosenLang : 'en';
    const ldata = s[l] || s.en;
    return {
      id:     s.id,
      name:   ldata.name,
      amount: s.amount,
      cat:    s.cat,
      status: s.status,
      slug:   ldata.slug,
      url:    `/${chosenLang}/schemes/${ldata.slug}/`,
      applyUrl: s.applyUrl,
      score:  s.score,
    };
  });

  return res.status(200).json({
    results,
    total:  results.length,
    query,
    lang:   chosenLang,
  });
}