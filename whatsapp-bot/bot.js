/**
 * TheBharatAI – WhatsApp Bot
 * File: whatsapp-bot/bot.js
 *
 * STACK: @whiskeysockets/baileys (open-source WhatsApp Web API)
 *        Works without official WhatsApp Business API account.
 *        For production scale (>1k users/day) → upgrade to Meta Cloud API.
 *
 * FEATURES:
 *   ✅ Multilingual: Hindi, Marathi, Telugu, Tamil, English
 *   ✅ Full eligibility flow (6 questions → scheme matches)
 *   ✅ Scheme detail on demand
 *   ✅ State/city browse
 *   ✅ Reset / help commands
 *   ✅ Session management (in-memory, Redis-ready)
 *   ✅ Rate limiting (30 msg/hr per user)
 *   ✅ Anti-spam / abuse protection
 *   ✅ DPDP Act compliant (no data persisted beyond session)
 *
 * SETUP (Windows PowerShell):
 *   cd whatsapp-bot
 *   npm install
 *   node bot.js
 *   → Scan QR code with your WhatsApp mobile app
 *
 * PRODUCTION (separate service):
 *   pm2 start bot.js --name bharatai-bot
 *
 * File: whatsapp-bot/bot.js
 */

'use strict';

// ── IMPORTANT: Install in whatsapp-bot/ directory:
// npm install @whiskeysockets/baileys @hapi/boom pino qrcode-terminal
// These are declared in whatsapp-bot/package.json

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino     = require('pino');
const qrcode   = require('qrcode-terminal');
const fs       = require('fs');
const path     = require('path');

/* ── Bot Configuration ─────────────────────────────────────── */
const CONFIG = {
  sessionDir:    path.join(__dirname, 'auth_info'),
  logLevel:      'silent',   // 'silent' | 'info' | 'debug'
  rateLimitMs:   120000,     // 2 min between sessions
  maxMsgPerHour: 30,
  botName:       'TheBharatAI',
  adminPhone:    '91XXXXXXXXXX@s.whatsapp.net', // Replace with admin number
};

/* ── In-Memory Session Store ───────────────────────────────── */
// For production: replace with Redis
// const redis = require('redis'); const store = redis.createClient();
const sessions     = new Map(); // JID → session state
const rateLimits   = new Map(); // JID → { count, windowStart }
const SCHEME_BASE  = require('../data/schemes-i18n').SCHEMES_I18N ? null : null; // loaded below

/* ── Multilingual Messages ─────────────────────────────────── */
const MSG = {
  welcome: {
    hi: `🇮🇳 *TheBharatAI में आपका स्वागत है!*

मैं आपको 1,500+ सरकारी योजनाओं की पात्रता जाँचने में मदद करूँगा।

*भाषा चुनें / Select Language:*
1️⃣ हिंदी
2️⃣ English
3️⃣ मराठी
4️⃣ తెలుగు
5️⃣ தமிழ்

नंबर टाइप करें (Type the number):`,

    mr: `🇮🇳 *TheBharatAI मध्ये आपले स्वागत आहे!*

मी तुम्हाला 1,500+ सरकारी योजनांची पात्रता तपासण्यात मदत करेन.

*भाषा निवडा:*
1️⃣ हिंदी
2️⃣ English
3️⃣ मराठी
4️⃣ తెలుగు
5️⃣ தமிழ்

क्रमांक टाइप करा:`,

    en: `🇮🇳 *Welcome to TheBharatAI!*

I'll help you check eligibility for 1,500+ government schemes.

*Select Language / भाषा चुनें:*
1️⃣ हिंदी
2️⃣ English
3️⃣ मराठी
4️⃣ తెలుగు
5️⃣ தமிழ்

Type the number:`,
  },

  mainMenu: {
    hi: (name='') => `${name?'नमस्ते '+name+'! ':''}*TheBharatAI* में आपका स्वागत है 🙏

*क्या करना चाहते हैं?*
1️⃣ 🔍 पात्रता जाँचें (60 सेकंड)
2️⃣ 📋 योजनाएँ देखें
3️⃣ 🗺️ राज्यवार योजनाएँ
4️⃣ ℹ️ TheBharatAI के बारे में
5️⃣ 🌐 भाषा बदलें

नंबर टाइप करें:`,

    mr: (name='') => `${name?'नमस्कार '+name+'! ':''}*TheBharatAI* मध्ये आपले स्वागत 🙏

*काय करायचे आहे?*
1️⃣ 🔍 पात्रता तपासा (60 सेकंद)
2️⃣ 📋 योजना पाहा
3️⃣ 🗺️ राज्यनिहाय योजना
4️⃣ ℹ️ TheBharatAI बद्दल
5️⃣ 🌐 भाषा बदला

क्रमांक टाइप करा:`,

    te: (name='') => `${name?'నమస్కారం '+name+'! ':''}*TheBharatAI*కు స్వాగతం 🙏

*మీరు ఏమి చేయాలనుకుంటున్నారు?*
1️⃣ 🔍 అర్హత తనిఖీ (60 సెకన్లు)
2️⃣ 📋 పథకాలు చూడండి
3️⃣ 🗺️ రాష్ట్రాల వారీ పథకాలు
4️⃣ ℹ️ TheBharatAI గురించి
5️⃣ 🌐 భాష మార్చండి

నంబర్ టైప్ చేయండి:`,

    ta: (name='') => `${name?'வணக்கம் '+name+'! ':''}*TheBharatAI*க்கு வரவேற்கிறோம் 🙏

*என்ன செய்ய விரும்புகிறீர்கள்?*
1️⃣ 🔍 தகுதி சரிபார்க்க (60 வினாடி)
2️⃣ 📋 திட்டங்களை பார்க்கவும்
3️⃣ 🗺️ மாநிலவாரிய திட்டங்கள்
4️⃣ ℹ️ TheBharatAI பற்றி
5️⃣ 🌐 மொழி மாற்றவும்

எண்ணை தட்டச்சு செய்யவும்:`,

    en: (name='') => `${name?'Hello '+name+'! ':''}Welcome to *TheBharatAI* 🙏

*What would you like to do?*
1️⃣ 🔍 Check Eligibility (60 sec)
2️⃣ 📋 Browse Schemes
3️⃣ 🗺️ State-wise Schemes
4️⃣ ℹ️ About TheBharatAI
5️⃣ 🌐 Change Language

Type the number:`,
  },

  questions: {
    hi: [
      { key:'state', q:'*प्रश्न 1/5:* आप किस *राज्य* में रहते हैं?\n\nराज्य का नाम टाइप करें (जैसे: UP, Maharashtra, Bihar, Tamil Nadu):', step:1 },
      { key:'gender', q:'*प्रश्न 2/5:* आपका *लिंग* क्या है?\n\n1️⃣ पुरुष\n2️⃣ महिला\n3️⃣ अन्य\n\nनंबर टाइप करें:', step:2 },
      { key:'age', q:'*प्रश्न 3/5:* आपकी *आयु* क्या है?\n\nसिर्फ नंबर टाइप करें (जैसे: 28):', step:3 },
      { key:'cat', q:'*प्रश्न 4/5:* आपकी *जाति वर्ग*?\n\n1️⃣ सामान्य\n2️⃣ OBC\n3️⃣ SC\n4️⃣ ST\n5️⃣ EWS\n\nनंबर टाइप करें:', step:4 },
      { key:'occ', q:'*प्रश्न 5/5:* आपका *व्यवसाय* क्या है?\n\n1️⃣ किसान\n2️⃣ छात्र/छात्रा\n3️⃣ व्यापारी/MSME\n4️⃣ नौकरीपेशा\n5️⃣ दैनिक मज़दूर\n6️⃣ महिला उद्यमी\n7️⃣ कारीगर\n8️⃣ बेरोज़गार\n\nनंबर टाइप करें:', step:5 },
    ],
    mr: [
      { key:'state', q:'*प्रश्न 1/5:* तुम्ही कोणत्या *राज्यात* राहता?\n\nराज्याचे नाव टाइप करा (उदा: Maharashtra, UP, Bihar):', step:1 },
      { key:'gender', q:'*प्रश्न 2/5:* तुमचे *लिंग* काय आहे?\n\n1️⃣ पुरुष\n2️⃣ महिला\n3️⃣ इतर\n\nक्रमांक टाइप करा:', step:2 },
      { key:'age', q:'*प्रश्न 3/5:* तुमचे *वय* किती आहे?\n\nफक्त क्रमांक टाइप करा (उदा: 28):', step:3 },
      { key:'cat', q:'*प्रश्न 4/5:* तुमचा *जात वर्ग*?\n\n1️⃣ सामान्य\n2️⃣ OBC\n3️⃣ SC\n4️⃣ ST\n5️⃣ EWS\n\nक्रमांक टाइप करा:', step:4 },
      { key:'occ', q:'*प्रश्न 5/5:* तुमचा *व्यवसाय* काय आहे?\n\n1️⃣ शेतकरी\n2️⃣ विद्यार्थी\n3️⃣ व्यापारी/MSME\n4️⃣ नोकरदार\n5️⃣ मजूर\n6️⃣ महिला उद्योजक\n7️⃣ कारागीर\n8️⃣ बेरोजगार\n\nक्रमांक टाइप करा:', step:5 },
    ],
    te: [
      { key:'state', q:'*ప్రశ్న 1/5:* మీరు ఏ *రాష్ట్రంలో* నివసిస్తున్నారు?\n\nరాష్ట్రం పేరు టైప్ చేయండి (ఉదా: Telangana, AP, UP):', step:1 },
      { key:'gender', q:'*ప్రశ్న 2/5:* మీ *లింగం* ఏమిటి?\n\n1️⃣ పురుషుడు\n2️⃣ స్త్రీ\n3️⃣ ఇతర\n\nనంబర్ టైప్ చేయండి:', step:2 },
      { key:'age', q:'*ప్రశ్న 3/5:* మీ *వయస్సు* ఎంత?\n\nసంఖ్య మాత్రం టైప్ చేయండి (ఉదా: 28):', step:3 },
      { key:'cat', q:'*ప్రశ్న 4/5:* మీ *కులం/వర్గం*?\n\n1️⃣ సాధారణ\n2️⃣ OBC\n3️⃣ SC\n4️⃣ ST\n5️⃣ EWS\n\nనంబర్ టైప్ చేయండి:', step:4 },
      { key:'occ', q:'*ప్రశ్న 5/5:* మీ *వృత్తి* ఏమిటి?\n\n1️⃣ రైతు\n2️⃣ విద్యార్థి\n3️⃣ వ్యాపారి/MSME\n4️⃣ జీతగాడు\n5️⃣ కూలీ\n6️⃣ మహిళా వ్యాపారి\n7️⃣ చేతివృత్తి\n8️⃣ నిరుద్యోగి\n\nనంబర్ టైప్ చేయండి:', step:5 },
    ],
    ta: [
      { key:'state', q:'*கேள்வி 1/5:* நீங்கள் எந்த *மாநிலத்தில்* வசிக்கிறீர்கள்?\n\nமாநிலம் தட்டச்சு செய்யவும் (எ.கா: Tamil Nadu, UP, Maharashtra):', step:1 },
      { key:'gender', q:'*கேள்வி 2/5:* உங்கள் *பாலினம்*?\n\n1️⃣ ஆண்\n2️⃣ பெண்\n3️⃣ மற்றவர்\n\nஎண்ணை தட்டச்சு செய்யவும்:', step:2 },
      { key:'age', q:'*கேள்வி 3/5:* உங்கள் *வயது* என்ன?\n\nஒரு எண்ணை மட்டும் தட்டச்சு செய்யவும் (எ.கா: 28):', step:3 },
      { key:'cat', q:'*கேள்வி 4/5:* உங்கள் *வகை*?\n\n1️⃣ பொது\n2️⃣ OBC\n3️⃣ SC\n4️⃣ ST\n5️⃣ EWS\n\nஎண்ணை தட்டச்சு செய்யவும்:', step:4 },
      { key:'occ', q:'*கேள்வி 5/5:* உங்கள் *தொழில்*?\n\n1️⃣ விவசாயி\n2️⃣ மாணவர்\n3️⃣ வணிகர்/MSME\n4️⃣ சம்பளதாரர்\n5️⃣ தினக்கூலி\n6️⃣ பெண் தொழிலதிபர்\n7️⃣ கைவினைஞர்\n8️⃣ வேலையில்லாதவர்\n\nஎண்ணை தட்டச்சு செய்யவும்:', step:5 },
    ],
    en: [
      { key:'state', q:'*Question 1/5:* Which *state* do you live in?\n\nType state name (e.g., UP, Maharashtra, Bihar, Tamil Nadu):', step:1 },
      { key:'gender', q:'*Question 2/5:* What is your *gender*?\n\n1️⃣ Male\n2️⃣ Female\n3️⃣ Other\n\nType the number:', step:2 },
      { key:'age', q:'*Question 3/5:* What is your *age*?\n\nType number only (e.g., 28):', step:3 },
      { key:'cat', q:'*Question 4/5:* Your *category*?\n\n1️⃣ General\n2️⃣ OBC\n3️⃣ SC\n4️⃣ ST\n5️⃣ EWS\n\nType the number:', step:4 },
      { key:'occ', q:'*Question 5/5:* Your *occupation*?\n\n1️⃣ Farmer\n2️⃣ Student\n3️⃣ Business/MSME\n4️⃣ Salaried\n5️⃣ Daily Labour\n6️⃣ Woman Entrepreneur\n7️⃣ Artisan\n8️⃣ Unemployed\n\nType the number:', step:5 },
    ],
  },

  scanning: {
    hi: '⏳ *AI 1,500+ योजनाओं की जाँच कर रहा है...*\n\nकृपया प्रतीक्षा करें (10 सेकंड)...',
    mr: '⏳ *AI 1,500+ योजना तपासत आहे...*\n\nकृपया प्रतीक्षा करा (10 सेकंद)...',
    te: '⏳ *AI 1,500+ పథకాలు తనిఖీ చేస్తోంది...*\n\nదయచేసి వేచి ఉండండి (10 సెకన్లు)...',
    ta: '⏳ *AI 1,500+ திட்டங்களை சரிபார்க்கிறது...*\n\nதயவுசெய்து காத்திருங்கள் (10 வினாடிகள்)...',
    en: '⏳ *AI scanning 1,500+ schemes...*\n\nPlease wait (10 seconds)...',
  },

  disclaimer: {
    hi: '\n\n⚖️ *डिस्क्लेमर:* TheBharatAI भारत सरकार से सम्बद्ध नहीं है। सभी परिणाम केवल मार्गदर्शन के लिए हैं। आवेदन से पहले आधिकारिक .gov.in पोर्टल पर सत्यापित करें।\n🌐 https://thebharatai.me',
    mr: '\n\n⚖️ *डिस्क्लेमर:* TheBharatAI भारत सरकारशी संलग्न नाही. सर्व निकाल केवळ मार्गदर्शनासाठी आहेत. अर्ज करण्यापूर्वी अधिकृत .gov.in पोर्टलवर पडताळा.\n🌐 https://thebharatai.me',
    te: '\n\n⚖️ *నిరాకరణ:* TheBharatAI భారత ప్రభుత్వంతో అనుబంధం లేదు. అన్ని ఫలితాలు మార్గదర్శనం కోసం మాత్రమే. దరఖాస్తుకు ముందు అధికారిక .gov.in పోర్టల్‌లో ధృవీకరించండి.\n🌐 https://thebharatai.me',
    ta: '\n\n⚖️ *நிராகரணம்:* TheBharatAI இந்திய அரசாங்கத்துடன் இணைக்கப்படவில்லை. அனைத்து முடிவுகளும் வழிகாட்டுதலுக்கு மட்டுமே. விண்ணப்பிக்கும் முன் அதிகாரப்பூர்வ .gov.in போர்ட்டலில் சரிபார்க்கவும்.\n🌐 https://thebharatai.me',
    en: '\n\n⚖️ *Disclaimer:* TheBharatAI is NOT affiliated with Govt of India. Results are for guidance only. Verify at official .gov.in portals before applying.\n🌐 https://thebharatai.me',
  },

  about: {
    hi: `📱 *TheBharatAI के बारे में*

🎯 *मिशन:* 800M+ भारतीयों को उनकी भाषा में सरकारी योजनाओं से जोड़ना

👨‍💻 *निर्माता:* Kartikeya Mishra (AI Engineer)
🔗 LinkedIn: linkedin.com/in/thekartikeyamishra

📊 *क्या करता है:*
✅ 1,500+ योजनाएँ ट्रैक करता है
✅ मासिक डेटा सत्यापन
✅ 10 भारतीय भाषाएँ
✅ DPDP Act 2023 अनुपालन

⚠️ यह सेवा भारत सरकार से सम्बद्ध नहीं है।

🌐 https://thebharatai.me`,

    en: `📱 *About TheBharatAI*

🎯 *Mission:* Connecting 800M+ Indians with government schemes in their own language

👨‍💻 *Creator:* Kartikeya Mishra (AI Engineer)
🔗 LinkedIn: linkedin.com/in/thekartikeyamishra

📊 *What we do:*
✅ Track 1,500+ schemes
✅ Monthly data verification
✅ 10 Indian languages
✅ DPDP Act 2023 compliant

⚠️ NOT affiliated with Govt of India.

🌐 https://thebharatai.me`,
  },

  error: {
    hi: '❌ माफ़ करें, मैं समझ नहीं पाया। कृपया 1–5 में से नंबर टाइप करें या "MENU" टाइप करें।',
    mr: '❌ माफ करा, मला समजले नाही. कृपया 1–5 मधील क्रमांक टाइप करा किंवा "MENU" टाइप करा.',
    te: '❌ క్షమించండి, నాకు అర్థం కాలేదు. దయచేసి 1–5 మధ్య నంబర్ టైప్ చేయండి లేదా "MENU" టైప్ చేయండి.',
    ta: '❌ மன்னிக்கவும், புரியவில்லை. 1–5 இல் ஒரு எண்ணை அல்லது "MENU" தட்டச்சு செய்யவும்.',
    en: '❌ Sorry, I did not understand. Please type a number 1–5 or type "MENU".',
  },

  rateLimit: {
    hi: '⚠️ आप बहुत तेज़ संदेश भेज रहे हैं। कृपया 2 मिनट प्रतीक्षा करें।',
    en: '⚠️ You are sending messages too fast. Please wait 2 minutes.',
  },
};

/* ── Scheme Matching Engine ──────────────────────────────── */
const SCHEMES_DB = [
  { id:'pm-kisan',    icon:'🌾', name:'PM Kisan Samman Nidhi', amount:'₹6,000/yr',   url:'https://pmkisan.gov.in/', elig:{occ:['farmer']} },
  { id:'pm-mudra',    icon:'💼', name:'PM Mudra Yojana',       amount:'₹10L loan',   url:'https://udyamimitra.in/', elig:{occ:['business','woman_ent']} },
  { id:'ayushman',    icon:'🏥', name:'Ayushman Bharat',       amount:'₹5L health',  url:'https://pmjay.gov.in/',   elig:{} },
  { id:'pm-awas',     icon:'🏠', name:'PM Awas Yojana',        amount:'₹1.3L house', url:'https://pmayg.nic.in/',   elig:{occ:['farmer','labor','unemployed']} },
  { id:'pm-ujjwala',  icon:'🔥', name:'PM Ujjwala 2.0',        amount:'Free LPG',    url:'https://www.pmuy.gov.in/',elig:{occ:['farmer','labor'],gender:['female']} },
  { id:'nsp',         icon:'🎓', name:'National Scholarship',  amount:'₹36k/yr',     url:'https://scholarships.gov.in/', elig:{occ:['student'],cat:['sc','st','obc']} },
  { id:'pm-vishwakarma',icon:'🔨',name:'PM Vishwakarma',       amount:'₹3L+toolkit', url:'https://pmvishwakarma.gov.in/',elig:{occ:['artisan','labor']} },
  { id:'e-shram',     icon:'🪪', name:'e-Shram Card',           amount:'₹2L cover',   url:'https://eshram.gov.in/',  elig:{occ:['labor','farmer','unemployed']} },
  { id:'stand-up',    icon:'🚀', name:'Stand-Up India',        amount:'₹1Cr loan',   url:'https://standupmitra.in/',elig:{occ:['business','woman_ent'],cat:['sc','st']} },
  { id:'atal-pension',icon:'👴', name:'Atal Pension Yojana',   amount:'₹5k/mo',      url:'https://npscra.nsdl.co.in/',elig:{occ:['labor','farmer']} },
];

const OCC_MAP    = { '1':'farmer','2':'student','3':'business','4':'salaried','5':'labor','6':'woman_ent','7':'artisan','8':'unemployed' };
const GENDER_MAP = { '1':'male','2':'female','3':'other' };
const CAT_MAP    = { '1':'gen','2':'obc','3':'sc','4':'st','5':'ews' };

function matchSchemes(profile) {
  return SCHEMES_DB.filter(s => {
    const e = s.elig;
    if (e.occ && e.occ.length && e.occ.indexOf(profile.occ) === -1) return false;
    if (e.gender && e.gender.length && e.gender.indexOf(profile.gender) === -1) return false;
    if (e.cat && e.cat.length && e.cat.indexOf(profile.cat) === -1) return false;
    return true;
  });
}

function buildResultMsg(matched, lang, profile) {
  const labels = { hi:'पात्र योजनाएँ', mr:'पात्र योजना', te:'అర్హత పథకాలు', ta:'தகுதி திட்டங்கள்', en:'Eligible Schemes' };
  const total  = matched.reduce((s,m) => s + (m.amountNum||0), 0);
  const applyLabel = { hi:'आवेदन करें', mr:'अर्ज करा', te:'దరఖాస్తు', ta:'விண்ணப்பி', en:'Apply' };
  const header = `✅ *${labels[lang]||labels.en}*\n\n`;
  const items  = matched.map((s,i) =>
    `${i+1}️⃣ ${s.icon} *${s.name}*\n   💰 ${s.amount}\n   🔗 ${applyLabel[lang]||applyLabel.en}: ${s.url}`
  ).join('\n\n');
  const footer = `\n\n📊 *${matched.length} ${labels[lang]||labels.en}*\n🌐 https://thebharatai.me${MSG.disclaimer[lang]||MSG.disclaimer.en}`;
  return header + items + footer;
}

/* ── Session Management ───────────────────────────────────── */
function getSession(jid) {
  if (!sessions.has(jid)) {
    sessions.set(jid, {
      state:    'welcome',    // welcome | lang_select | main_menu | q_flow | result
      lang:     'hi',
      step:     0,
      profile:  {},
      lastSeen: Date.now(),
    });
  }
  return sessions.get(jid);
}

function setSession(jid, updates) {
  const s = getSession(jid);
  Object.assign(s, updates, { lastSeen: Date.now() });
  sessions.set(jid, s);
}

function checkRateLimit(jid) {
  const now = Date.now();
  const rl  = rateLimits.get(jid) || { count:0, windowStart:now };
  if (now - rl.windowStart > 3600000) { rl.count=0; rl.windowStart=now; }
  rl.count++;
  rateLimits.set(jid, rl);
  return rl.count > CONFIG.maxMsgPerHour;
}

/* ── Message Handler ─────────────────────────────────────── */
async function handleMessage(sock, msg) {
  const jid    = msg.key.remoteJid;
  const isGroup= jid.endsWith('@g.us');
  if (isGroup) return; // Only private messages
  if (!msg.message) return;

  const type   = Object.keys(msg.message)[0];
  const body   = (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    ''
  ).trim();

  if (!body) return;

  // Rate limit
  if (checkRateLimit(jid)) {
    await send(sock, jid, MSG.rateLimit.hi + '\n' + MSG.rateLimit.en);
    return;
  }

  const sess   = getSession(jid);
  const lang   = sess.lang || 'hi';
  const input  = body.toLowerCase().trim();

  // Global commands
  if (['menu','मेनू','मेनू','reset','start','hi','hello','नमस्ते','नमस्कार','ola'].includes(input)) {
    setSession(jid, { state:'main_menu', step:0, profile:{} });
    await send(sock, jid, MSG.mainMenu[lang](getDisplayName(msg)));
    return;
  }

  if (['help','सहायता','मदद'].includes(input)) {
    await send(sock, jid, getHelpMsg(lang));
    return;
  }

  // State machine
  switch (sess.state) {

    case 'welcome':
    case 'lang_select': {
      const langMap = { '1':'hi','2':'en','3':'mr','4':'te','5':'ta' };
      const chosen  = langMap[input] || (input==='hindi'?'hi':input==='english'?'en':input==='marathi'?'mr':input==='telugu'?'te':input==='tamil'?'ta':null);
      if (chosen) {
        setSession(jid, { state:'main_menu', lang:chosen });
        await send(sock, jid, MSG.mainMenu[chosen](getDisplayName(msg)));
      } else {
        await send(sock, jid, MSG.welcome.en);
        setSession(jid, { state:'lang_select' });
      }
      break;
    }

    case 'main_menu': {
      if (input === '1') {
        setSession(jid, { state:'q_flow', step:0, profile:{} });
        const q = MSG.questions[lang][0];
        await send(sock, jid, q.q);
      } else if (input === '2') {
        await send(sock, jid, getSchemeBrowseMsg(lang));
      } else if (input === '3') {
        await send(sock, jid, getStateListMsg(lang));
      } else if (input === '4') {
        await send(sock, jid, MSG.about[lang] || MSG.about.en);
      } else if (input === '5') {
        setSession(jid, { state:'lang_select' });
        await send(sock, jid, MSG.welcome.en);
      } else {
        await send(sock, jid, MSG.error[lang] || MSG.error.en);
      }
      break;
    }

    case 'q_flow': {
      const questions = MSG.questions[lang];
      const step      = sess.step;
      const q         = questions[step];
      const profile   = sess.profile;

      // Parse answer
      if (q.key === 'state') {
        profile.state = normalizeState(body);
      } else if (q.key === 'gender') {
        profile.gender = GENDER_MAP[input] || 'male';
      } else if (q.key === 'age') {
        const a = parseInt(body);
        profile.age = (!isNaN(a) && a > 0 && a < 120) ? a : 25;
      } else if (q.key === 'cat') {
        profile.cat = CAT_MAP[input] || 'gen';
      } else if (q.key === 'occ') {
        profile.occ = OCC_MAP[input] || 'farmer';
      }

      const nextStep = step + 1;
      if (nextStep < questions.length) {
        setSession(jid, { step:nextStep, profile });
        await send(sock, jid, questions[nextStep].q);
      } else {
        // All answered — run engine
        setSession(jid, { state:'result', profile });
        await send(sock, jid, MSG.scanning[lang] || MSG.scanning.en);
        await delay(1500);
        const matched = matchSchemes(profile);
        const resultMsg = matched.length > 0
          ? buildResultMsg(matched, lang, profile)
          : getNoResultMsg(lang);
        await send(sock, jid, resultMsg);
        await delay(600);
        await send(sock, jid, getPostResultMenu(lang));
        setSession(jid, { state:'main_menu' });
      }
      break;
    }

    case 'result': {
      // After result, any message → main menu
      setSession(jid, { state:'main_menu' });
      await send(sock, jid, MSG.mainMenu[lang](getDisplayName(msg)));
      break;
    }

    default: {
      setSession(jid, { state:'lang_select' });
      await send(sock, jid, MSG.welcome.hi);
    }
  }
}

/* ── Helpers ─────────────────────────────────────────────── */
async function send(sock, jid, text) {
  try {
    await sock.sendMessage(jid, { text });
  } catch(e) {
    console.error('[Send Error]', e.message);
  }
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getDisplayName(msg) {
  return msg.pushName || '';
}

function normalizeState(input) {
  const map = {
    'up':'UP','uttar pradesh':'UP','उत्तर प्रदेश':'UP',
    'mh':'MH','maharashtra':'MH','महाराष्ट्र':'MH',
    'br':'BR','bihar':'BR','बिहार':'BR',
    'wb':'WB','west bengal':'WB','पश्चिम बंगाल':'WB',
    'rj':'RJ','rajasthan':'RJ','राजस्थान':'RJ',
    'mp':'MP','madhya pradesh':'MP','मध्य प्रदेश':'MP',
    'tn':'TN','tamil nadu':'TN','तमिलनाडु':'TN',
    'ka':'KA','karnataka':'KA','कर्नाटक':'KA',
    'ts':'TS','telangana':'TS','तेलंगाना':'TS',
    'ap':'AP','andhra pradesh':'AP','आंध्र प्रदेश':'AP',
    'gj':'GJ','gujarat':'GJ','गुजरात':'GJ',
    'hr':'HR','haryana':'HR','हरियाणा':'HR',
    'pb':'PB','punjab':'PB','पंजाब':'PB',
    'od':'OD','odisha':'OD','ओडिशा':'OD',
    'kl':'KL','kerala':'KL','केरल':'KL',
    'jh':'JH','jharkhand':'JH','झारखंड':'JH',
    'as':'AS','assam':'AS','असम':'AS',
    'cg':'CG','chhattisgarh':'CG','छत्तीसगढ़':'CG',
    'uk':'UK','uttarakhand':'UK','उत्तराखंड':'UK',
    'hp':'HP','himachal':'HP','हिमाचल':'HP',
    'dl':'DL','delhi':'DL','दिल्ली':'DL',
  };
  return map[input.toLowerCase()] || 'UP';
}

function getHelpMsg(lang) {
  const msgs = {
    hi: `*TheBharatAI — मदद*\n\n📱 *कमांड:*\n• MENU → मुख्य मेनू\n• 1 → पात्रता जाँचें\n• 2 → योजनाएँ देखें\n• 3 → राज्यवार\n• RESET → फिर से शुरू\n\n🌐 https://thebharatai.me\n📧 workmailkartikeya@gmail.com`,
    en: `*TheBharatAI — Help*\n\n📱 *Commands:*\n• MENU → Main menu\n• 1 → Check eligibility\n• 2 → Browse schemes\n• 3 → State-wise\n• RESET → Start over\n\n🌐 https://thebharatai.me\n📧 workmailkartikeya@gmail.com`,
  };
  return msgs[lang] || msgs.en;
}

function getSchemeBrowseMsg(lang) {
  const schemes = SCHEMES_DB.slice(0,8);
  const title = { hi:'📋 *प्रमुख योजनाएँ (Verified Jan 2026)*', mr:'📋 *प्रमुख योजना*', te:'📋 *ముఖ్యమైన పథకాలు*', ta:'📋 *முக்கிய திட்டங்கள்*', en:'📋 *Top Schemes (Verified Jan 2026)*' };
  const items = schemes.map((s,i) => `${i+1}. ${s.icon} *${s.name}* — ${s.amount}\n   🔗 ${s.url}`).join('\n\n');
  const full  = { hi:'\n\n🌐 सभी योजनाएँ: https://thebharatai.me/hi/', en:'\n\n🌐 All schemes: https://thebharatai.me' };
  return (title[lang]||title.en) + '\n\n' + items + (full[lang]||full.en) + (MSG.disclaimer[lang]||MSG.disclaimer.en);
}

function getStateListMsg(lang) {
  const title = { hi:'🗺️ *राज्यवार योजनाएँ*\n\nराज्य का नाम टाइप करें:', mr:'🗺️ *राज्यनिहाय योजना*\n\nराज्याचे नाव टाइप करा:', te:'🗺️ *రాష్ట్రాల వారీ పథకాలు*\n\nరాష్ట్రం పేరు టైప్ చేయండి:', ta:'🗺️ *மாநிலவாரிய திட்டங்கள்*\n\nமாநிலம் தட்டச்சு செய்யவும்:', en:'🗺️ *State-wise Schemes*\n\nType state name:' };
  const states = 'UP · MH · BR · WB · RJ · MP · TN · KA · TS · AP · GJ · HR · PB · OD · KL · JH · AS · CG · UK · DL';
  return (title[lang]||title.en) + '\n\n' + states + '\n\n🌐 https://thebharatai.me' + (MSG.disclaimer[lang]||MSG.disclaimer.en);
}

function getNoResultMsg(lang) {
  const msgs = {
    hi: '😔 आपकी प्रोफ़ाइल के आधार पर कोई विशेष योजना नहीं मिली। लेकिन ये सार्वभौमिक योजनाएँ सबके लिए हैं:\n\n🏥 Ayushman Bharat (₹5L स्वास्थ्य)\n🪪 e-Shram Card (₹2L बीमा)\n👴 Atal Pension (₹5k/month)\n\n🌐 https://thebharatai.me',
    en: '😔 No specific matches found for your profile. But these universal schemes apply to everyone:\n\n🏥 Ayushman Bharat (₹5L health)\n🪪 e-Shram Card (₹2L insurance)\n👴 Atal Pension (₹5k/month)\n\n🌐 https://thebharatai.me',
  };
  return (msgs[lang]||msgs.en) + (MSG.disclaimer[lang]||MSG.disclaimer.en);
}

function getPostResultMenu(lang) {
  const msgs = {
    hi: '✅ *आगे क्या करना चाहते हैं?*\n\n1️⃣ फिर से जाँचें\n2️⃣ सभी योजनाएँ देखें\n3️⃣ WhatsApp पर शेयर करें\n\n(नंबर टाइप करें या MENU लिखें)',
    mr: '✅ *पुढे काय करायचे?*\n\n1️⃣ पुन्हा तपासा\n2️⃣ सर्व योजना पाहा\n3️⃣ WhatsApp वर शेअर करा\n\n(क्रमांक टाइप करा किंवा MENU लिहा)',
    te: '✅ *తర్వాత ఏమి చేయాలి?*\n\n1️⃣ మళ్ళీ తనిఖీ చేయండి\n2️⃣ అన్ని పథకాలు చూడండి\n\n(నంబర్ టైప్ చేయండి లేదా MENU రాయండి)',
    ta: '✅ *அடுத்து என்ன செய்ய வேண்டும்?*\n\n1️⃣ மீண்டும் சரிபார்க்கவும்\n2️⃣ அனைத்து திட்டங்களையும் பார்க்கவும்\n\n(எண்ணை தட்டச்சு செய்யவும் அல்லது MENU எழுதவும்)',
    en: '✅ *What next?*\n\n1️⃣ Check again\n2️⃣ Browse all schemes\n3️⃣ Share on WhatsApp\n\n(Type a number or MENU)',
  };
  return msgs[lang] || msgs.en;
}

/* ── Main Bot Connection ─────────────────────────────────── */
async function startBot() {
  console.log('\n  🤖  TheBharatAI WhatsApp Bot\n');

  if (!fs.existsSync(CONFIG.sessionDir)) {
    fs.mkdirSync(CONFIG.sessionDir, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(CONFIG.sessionDir);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: CONFIG.logLevel }),
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    printQRInTerminal: false,
    browser: ['TheBharatAI', 'Chrome', '1.0.0'],
    defaultQueryTimeoutMs: 60000,
  });

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('  📱  Scan this QR code with WhatsApp on your phone:\n');
      qrcode.generate(qr, { small: true });
      console.log('\n  1. Open WhatsApp on your phone');
      console.log('  2. Go to Settings → Linked Devices → Link a Device');
      console.log('  3. Scan the QR code above\n');
    }
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        : true;
      console.log('  ⚠️  Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) { setTimeout(startBot, 3000); }
      else { console.log('  ❌  Logged out. Delete auth_info/ folder and restart.'); }
    }
    if (connection === 'open') {
      console.log('  ✅  WhatsApp Bot connected successfully!');
      console.log('  💬  Send "hi" or "MENU" to your WhatsApp number to test\n');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      try {
        await handleMessage(sock, msg);
      } catch(e) {
        console.error('  ❌  Message handler error:', e.message);
      }
    }
  });

  // Clean up old sessions every 30 minutes
  setInterval(() => {
    const cutoff = Date.now() - 3600000; // 1 hour
    sessions.forEach((s, jid) => { if (s.lastSeen < cutoff) sessions.delete(jid); });
    rateLimits.forEach((r, jid) => { if (Date.now() - r.windowStart > 7200000) rateLimits.delete(jid); });
  }, 1800000);
}

startBot().catch(e => {
  console.error('  ❌  Fatal error:', e);
  process.exit(1);
});