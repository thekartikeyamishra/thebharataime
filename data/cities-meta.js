/**
 * TheBharatAI – Cities Metadata
 * File: data/cities-meta.js
 *
 * 500+ Indian cities with:
 *   slug       - URL-safe slug (generated at runtime)
 *   name       - Display name in English
 *   nameHi     - Name in Hindi (for /hi/ pages)
 *   state      - State code (maps to STATES in index.html)
 *   stateName  - State name in English
 *   tier       - 1=metro, 2=major, 3=medium, 4=small
 *   lat/lng    - Approximate coordinates
 *
 * Usage: const { CITIES_META, slugify } = require('./data/cities-meta');
 */
'use strict';

function slugify(name) {
  return name.toLowerCase()
    .replace(/[&\/\\#,+()$~%.'":*?<>{}\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

var CITIES_META = [
  // TIER 1 — METROS
  {name:'Mumbai',       nameHi:'मुंबई',        state:'MH', stateName:'Maharashtra', tier:1, lat:19.076, lng:72.877},
  {name:'Delhi',        nameHi:'दिल्ली',         state:'DL', stateName:'Delhi',       tier:1, lat:28.679, lng:77.069},
  {name:'Bengaluru',    nameHi:'बेंगलुरु',        state:'KA', stateName:'Karnataka',   tier:1, lat:12.972, lng:77.593},
  {name:'Hyderabad',    nameHi:'हैदराबाद',        state:'TS', stateName:'Telangana',   tier:1, lat:17.388, lng:78.474},
  {name:'Ahmedabad',    nameHi:'अहमदाबाद',        state:'GJ', stateName:'Gujarat',     tier:1, lat:23.022, lng:72.571},
  {name:'Chennai',      nameHi:'चेन्नई',          state:'TN', stateName:'Tamil Nadu',  tier:1, lat:13.083, lng:80.270},
  {name:'Kolkata',      nameHi:'कोलकाता',         state:'WB', stateName:'West Bengal', tier:1, lat:22.572, lng:88.363},
  {name:'Pune',         nameHi:'पुणे',            state:'MH', stateName:'Maharashtra', tier:1, lat:18.521, lng:73.857},
  {name:'Jaipur',       nameHi:'जयपुर',           state:'RJ', stateName:'Rajasthan',   tier:1, lat:26.912, lng:75.787},
  {name:'Lucknow',      nameHi:'लखनऊ',           state:'UP', stateName:'Uttar Pradesh', tier:1, lat:26.846, lng:80.946},
  {name:'Surat',        nameHi:'सूरत',            state:'GJ', stateName:'Gujarat',     tier:1, lat:21.170, lng:72.831},
  {name:'Kanpur',       nameHi:'कानपुर',          state:'UP', stateName:'Uttar Pradesh', tier:1, lat:26.449, lng:80.331},
  // TIER 2 — MAJOR CITIES
  {name:'Nagpur',       nameHi:'नागपुर',          state:'MH', stateName:'Maharashtra', tier:2, lat:21.145, lng:79.088},
  {name:'Patna',        nameHi:'पटना',            state:'BR', stateName:'Bihar',       tier:2, lat:25.594, lng:85.137},
  {name:'Indore',       nameHi:'इंदौर',           state:'MP', stateName:'Madhya Pradesh', tier:2, lat:22.719, lng:75.857},
  {name:'Bhopal',       nameHi:'भोपाल',           state:'MP', stateName:'Madhya Pradesh', tier:2, lat:23.259, lng:77.412},
  {name:'Visakhapatnam',nameHi:'विशाखापत्तनम',     state:'AP', stateName:'Andhra Pradesh',tier:2, lat:17.686, lng:83.218},
  {name:'Vadodara',     nameHi:'वडोदरा',          state:'GJ', stateName:'Gujarat',     tier:2, lat:22.307, lng:73.181},
  {name:'Ludhiana',     nameHi:'लुधियाना',         state:'PB', stateName:'Punjab',      tier:2, lat:30.900, lng:75.857},
  {name:'Agra',         nameHi:'आगरा',            state:'UP', stateName:'Uttar Pradesh', tier:2, lat:27.176, lng:78.008},
  {name:'Nashik',       nameHi:'नाशिक',           state:'MH', stateName:'Maharashtra', tier:2, lat:19.997, lng:73.789},
  {name:'Faridabad',    nameHi:'फरीदाबाद',         state:'HR', stateName:'Haryana',     tier:2, lat:28.408, lng:77.317},
  {name:'Meerut',       nameHi:'मेरठ',            state:'UP', stateName:'Uttar Pradesh', tier:2, lat:28.984, lng:77.706},
  {name:'Rajkot',       nameHi:'राजकोट',          state:'GJ', stateName:'Gujarat',     tier:2, lat:22.303, lng:70.800},
  {name:'Varanasi',     nameHi:'वाराणसी',          state:'UP', stateName:'Uttar Pradesh', tier:2, lat:25.317, lng:82.973},
  {name:'Prayagraj',    nameHi:'प्रयागराज',        state:'UP', stateName:'Uttar Pradesh', tier:2, lat:25.435, lng:81.846},
  {name:'Srinagar',     nameHi:'श्रीनगर',          state:'JK', stateName:'J&K',         tier:2, lat:34.083, lng:74.797},
  {name:'Aurangabad',   nameHi:'औरंगाबाद',         state:'MH', stateName:'Maharashtra', tier:2, lat:19.876, lng:75.343},
  {name:'Amritsar',     nameHi:'अमृतसर',           state:'PB', stateName:'Punjab',      tier:2, lat:31.634, lng:74.872},
  {name:'Coimbatore',   nameHi:'कोयम्बटूर',        state:'TN', stateName:'Tamil Nadu',  tier:2, lat:11.017, lng:76.952},
  {name:'Vijayawada',   nameHi:'विजयवाड़ा',         state:'AP', stateName:'Andhra Pradesh',tier:2, lat:16.506, lng:80.648},
  {name:'Guwahati',     nameHi:'गुवाहाटी',         state:'AS', stateName:'Assam',       tier:2, lat:26.144, lng:91.736},
  {name:'Chandigarh',   nameHi:'चंडीगढ़',           state:'PB', stateName:'Punjab',      tier:2, lat:30.733, lng:76.779},
  {name:'Jodhpur',      nameHi:'जोधपुर',           state:'RJ', stateName:'Rajasthan',   tier:2, lat:26.295, lng:73.017},
  {name:'Gwalior',      nameHi:'ग्वालियर',          state:'MP', stateName:'Madhya Pradesh', tier:2, lat:26.218, lng:78.182},
  {name:'Kochi',        nameHi:'कोच्चि',           state:'KL', stateName:'Kerala',      tier:2, lat:9.931,  lng:76.267},
  {name:'Jabalpur',     nameHi:'जबलपुर',           state:'MP', stateName:'Madhya Pradesh', tier:2, lat:23.181, lng:79.986},
  {name:'Raipur',       nameHi:'रायपुर',           state:'CG', stateName:'Chhattisgarh', tier:2, lat:21.251, lng:81.629},
  {name:'Kota',         nameHi:'कोटा',             state:'RJ', stateName:'Rajasthan',   tier:2, lat:25.180, lng:75.842},
  {name:'Ranchi',       nameHi:'रांची',            state:'JH', stateName:'Jharkhand',   tier:2, lat:23.344, lng:85.309},
  {name:'Dehradun',     nameHi:'देहरादून',          state:'UK', stateName:'Uttarakhand', tier:2, lat:30.316, lng:78.032},
  {name:'Gurgaon',      nameHi:'गुरुग्राम',         state:'HR', stateName:'Haryana',     tier:2, lat:28.457, lng:77.026},
  {name:'Noida',        nameHi:'नोएडा',            state:'UP', stateName:'Uttar Pradesh', tier:2, lat:28.535, lng:77.391},
  {name:'Howrah',       nameHi:'हावड़ा',            state:'WB', stateName:'West Bengal', tier:2, lat:22.586, lng:88.311},
  {name:'Thiruvananthapuram', nameHi:'तिरुवनंतपुरम', state:'KL', stateName:'Kerala', tier:2, lat:8.524, lng:76.936},
  {name:'Guntur',       nameHi:'गुंटूर',           state:'AP', stateName:'Andhra Pradesh',tier:2, lat:16.306, lng:80.436},
  {name:'Madurai',      nameHi:'मदुरै',            state:'TN', stateName:'Tamil Nadu',  tier:2, lat:9.925,  lng:78.119},
  {name:'Tiruchirappalli', nameHi:'तिरुचिरापल्ली', state:'TN', stateName:'Tamil Nadu', tier:2, lat:10.790, lng:78.702},
  {name:'Warangal',     nameHi:'वारंगल',           state:'TS', stateName:'Telangana',   tier:2, lat:17.977, lng:79.598},
  {name:'Salem',        nameHi:'सेलम',             state:'TN', stateName:'Tamil Nadu',  tier:2, lat:11.664, lng:78.145},
  {name:'Siliguri',     nameHi:'सिलीगुड़ी',         state:'WB', stateName:'West Bengal', tier:2, lat:26.727, lng:88.394},
  // TIER 3 — MEDIUM CITIES
  {name:'Bareilly',     nameHi:'बरेली',            state:'UP', stateName:'Uttar Pradesh', tier:3, lat:28.364, lng:79.414},
  {name:'Aligarh',      nameHi:'अलीगढ़',            state:'UP', stateName:'Uttar Pradesh', tier:3, lat:27.887, lng:78.082},
  {name:'Jalandhar',    nameHi:'जालंधर',           state:'PB', stateName:'Punjab',      tier:3, lat:31.324, lng:75.579},
  {name:'Moradabad',    nameHi:'मुरादाबाद',         state:'UP', stateName:'Uttar Pradesh', tier:3, lat:28.838, lng:78.774},
  {name:'Gorakhpur',    nameHi:'गोरखपुर',           state:'UP', stateName:'Uttar Pradesh', tier:3, lat:26.760, lng:83.373},
  {name:'Bikaner',      nameHi:'बीकानेर',           state:'RJ', stateName:'Rajasthan',   tier:3, lat:28.022, lng:73.312},
  {name:'Solapur',      nameHi:'सोलापुर',           state:'MH', stateName:'Maharashtra', tier:3, lat:17.686, lng:75.905},
  {name:'Kolhapur',     nameHi:'कोल्हापुर',         state:'MH', stateName:'Maharashtra', tier:3, lat:16.705, lng:74.243},
  {name:'Jahanabad',    nameHi:'जहानाबाद',          state:'BR', stateName:'Bihar',       tier:3, lat:25.210, lng:84.987},
  {name:'Muzaffarpur',  nameHi:'मुजफ्फरपुर',        state:'BR', stateName:'Bihar',       tier:3, lat:26.120, lng:85.364},
  {name:'Durgapur',     nameHi:'दुर्गापुर',          state:'WB', stateName:'West Bengal', tier:3, lat:23.524, lng:87.310},
  {name:'Amravati',     nameHi:'अमरावती',           state:'MH', stateName:'Maharashtra', tier:3, lat:20.929, lng:77.749},
  {name:'Nanded',       nameHi:'नांदेड़',            state:'MH', stateName:'Maharashtra', tier:3, lat:19.153, lng:77.309},
  {name:'Cuttack',      nameHi:'कटक',              state:'OD', stateName:'Odisha',      tier:3, lat:20.459, lng:85.879},
  {name:'Bhubaneswar',  nameHi:'भुवनेश्वर',         state:'OD', stateName:'Odisha',      tier:3, lat:20.296, lng:85.824},
  {name:'Mysuru',       nameHi:'मैसूर',             state:'KA', stateName:'Karnataka',   tier:3, lat:12.295, lng:76.639},
  {name:'Hubli',        nameHi:'हुबली',             state:'KA', stateName:'Karnataka',   tier:3, lat:15.362, lng:75.123},
  {name:'Mangaluru',    nameHi:'मंगलुरु',           state:'KA', stateName:'Karnataka',   tier:3, lat:12.914, lng:74.855},
  {name:'Tirupati',     nameHi:'तिरुपति',           state:'AP', stateName:'Andhra Pradesh',tier:3,lat:13.628, lng:79.420},
  {name:'Bellary',      nameHi:'बेल्लारी',           state:'KA', stateName:'Karnataka',   tier:3, lat:15.139, lng:76.928},
  {name:'Nellore',      nameHi:'नेल्लोर',            state:'AP', stateName:'Andhra Pradesh',tier:3,lat:14.432, lng:79.987},
  {name:'Kozhikode',    nameHi:'कोझीकोड',           state:'KL', stateName:'Kerala',      tier:3, lat:11.258, lng:75.780},
  {name:'Thrissur',     nameHi:'त्रिशूर',            state:'KL', stateName:'Kerala',      tier:3, lat:10.527, lng:76.214},
  {name:'Malappuram',   nameHi:'मलप्पुरम',           state:'KL', stateName:'Kerala',      tier:3, lat:11.073, lng:76.074},
  {name:'Erode',        nameHi:'ईरोड',              state:'TN', stateName:'Tamil Nadu',  tier:3, lat:11.340, lng:77.717},
  {name:'Tirunelveli',  nameHi:'तिरुनेलवेली',        state:'TN', stateName:'Tamil Nadu',  tier:3, lat:8.727,  lng:77.699},
  {name:'Vellore',      nameHi:'वेल्लोर',            state:'TN', stateName:'Tamil Nadu',  tier:3, lat:12.916, lng:79.132},
  {name:'Jamshedpur',   nameHi:'जमशेदपुर',           state:'JH', stateName:'Jharkhand',   tier:3, lat:22.802, lng:86.185},
  {name:'Dhanbad',      nameHi:'धनबाद',             state:'JH', stateName:'Jharkhand',   tier:3, lat:23.799, lng:86.430},
  {name:'Bokaro',       nameHi:'बोकारो',             state:'JH', stateName:'Jharkhand',   tier:3, lat:23.670, lng:85.966},
  {name:'Asansol',      nameHi:'आसनसोल',             state:'WB', stateName:'West Bengal', tier:3, lat:23.683, lng:86.977},
  {name:'Agartala',     nameHi:'अगरतला',             state:'TR', stateName:'Tripura',     tier:3, lat:23.831, lng:91.279},
  {name:'Imphal',       nameHi:'इम्फाल',             state:'MN', stateName:'Manipur',     tier:3, lat:24.817, lng:93.938},
  {name:'Shillong',     nameHi:'शिलांग',             state:'ML', stateName:'Meghalaya',   tier:3, lat:25.578, lng:91.893},
  {name:'Jammu',        nameHi:'जम्मू',              state:'JK', stateName:'J&K',         tier:3, lat:32.726, lng:74.857},
  {name:'Udaipur',      nameHi:'उदयपुर',             state:'RJ', stateName:'Rajasthan',   tier:3, lat:24.585, lng:73.712},
  {name:'Ajmer',        nameHi:'अजमेर',              state:'RJ', stateName:'Rajasthan',   tier:3, lat:26.451, lng:74.641},
  {name:'Shimla',       nameHi:'शिमला',              state:'HP', stateName:'Himachal Pradesh',tier:3,lat:31.104,lng:77.167},
  {name:'Bhilai',       nameHi:'भिलाई',              state:'CG', stateName:'Chhattisgarh', tier:3, lat:21.209, lng:81.428},
  {name:'Bilaspur',     nameHi:'बिलासपुर',            state:'CG', stateName:'Chhattisgarh', tier:3, lat:22.080, lng:82.148},
  // TIER 4 — SMALLER CITIES (selected for SEO)
  {name:'Mathura',      nameHi:'मथुरा',              state:'UP', stateName:'Uttar Pradesh', tier:4, lat:27.492, lng:77.673},
  {name:'Vrindavan',    nameHi:'वृंदावन',             state:'UP', stateName:'Uttar Pradesh', tier:4, lat:27.577, lng:77.700},
  {name:'Hathras',      nameHi:'हाथरस',              state:'UP', stateName:'Uttar Pradesh', tier:4, lat:27.606, lng:78.052},
  {name:'Firozabad',    nameHi:'फिरोज़ाबाद',           state:'UP', stateName:'Uttar Pradesh', tier:4, lat:27.151, lng:78.395},
  {name:'Etawah',       nameHi:'इटावा',              state:'UP', stateName:'Uttar Pradesh', tier:4, lat:26.781, lng:79.022},
  {name:'Mainpuri',     nameHi:'मैनपुरी',             state:'UP', stateName:'Uttar Pradesh', tier:4, lat:27.235, lng:79.026},
  {name:'Farrukhabad',  nameHi:'फर्रुखाबाद',          state:'UP', stateName:'Uttar Pradesh', tier:4, lat:27.391, lng:79.579},
  {name:'Banda',        nameHi:'बांदा',              state:'UP', stateName:'Uttar Pradesh', tier:4, lat:25.479, lng:80.330},
  {name:'Chitrakoot',   nameHi:'चित्रकूट',            state:'UP', stateName:'Uttar Pradesh', tier:4, lat:25.197, lng:80.889},
  {name:'Pratapgarh',   nameHi:'प्रतापगढ़',            state:'UP', stateName:'Uttar Pradesh', tier:4, lat:25.899, lng:81.993},
  {name:'Rae Bareli',   nameHi:'रायबरेली',             state:'UP', stateName:'Uttar Pradesh', tier:4, lat:26.234, lng:81.240},
  {name:'Sitapur',      nameHi:'सीतापुर',             state:'UP', stateName:'Uttar Pradesh', tier:4, lat:27.563, lng:80.683},
  {name:'Hardoi',       nameHi:'हरदोई',              state:'UP', stateName:'Uttar Pradesh', tier:4, lat:27.395, lng:80.123},
  {name:'Unnao',        nameHi:'उन्नाव',              state:'UP', stateName:'Uttar Pradesh', tier:4, lat:26.544, lng:80.487},
  {name:'Lakhimpur',    nameHi:'लखीमपुर',             state:'UP', stateName:'Uttar Pradesh', tier:4, lat:27.951, lng:80.780},
  {name:'Bahraich',     nameHi:'बहराइच',             state:'UP', stateName:'Uttar Pradesh', tier:4, lat:27.574, lng:81.596},
  {name:'Shravasti',    nameHi:'श्रावस्ती',            state:'UP', stateName:'Uttar Pradesh', tier:4, lat:27.477, lng:81.476},
  {name:'Balrampur',    nameHi:'बलरामपुर',             state:'UP', stateName:'Uttar Pradesh', tier:4, lat:27.431, lng:82.175},
  {name:'Gonda',        nameHi:'गोंडा',              state:'UP', stateName:'Uttar Pradesh', tier:4, lat:27.133, lng:81.962},
  {name:'Basti',        nameHi:'बस्ती',               state:'UP', stateName:'Uttar Pradesh', tier:4, lat:26.800, lng:82.717},
  {name:'Deoria',       nameHi:'देवरिया',              state:'UP', stateName:'Uttar Pradesh', tier:4, lat:26.504, lng:83.780},
  {name:'Kushinagar',   nameHi:'कुशीनगर',              state:'UP', stateName:'Uttar Pradesh', tier:4, lat:26.740, lng:83.890},
  {name:'Maharajganj',  nameHi:'महराजगंज',              state:'UP', stateName:'Uttar Pradesh', tier:4, lat:27.142, lng:83.562},
  {name:'Siddharthnagar', nameHi:'सिद्धार्थनगर',       state:'UP', stateName:'Uttar Pradesh', tier:4, lat:27.282, lng:82.743},
  {name:'Ballia',       nameHi:'बलिया',              state:'UP', stateName:'Uttar Pradesh', tier:4, lat:25.767, lng:84.147},
  {name:'Mau',          nameHi:'मऊ',                 state:'UP', stateName:'Uttar Pradesh', tier:4, lat:25.942, lng:83.559},
  {name:'Azamgarh',     nameHi:'आज़मगढ़',              state:'UP', stateName:'Uttar Pradesh', tier:4, lat:26.063, lng:83.183},
  {name:'Jaunpur',      nameHi:'जौनपुर',              state:'UP', stateName:'Uttar Pradesh', tier:4, lat:25.731, lng:82.684},
  {name:'Ghazipur',     nameHi:'गाजीपुर',             state:'UP', stateName:'Uttar Pradesh', tier:4, lat:25.579, lng:83.572},
  {name:'Mirzapur',     nameHi:'मिर्ज़ापुर',            state:'UP', stateName:'Uttar Pradesh', tier:4, lat:25.145, lng:82.568},
  {name:'Sonbhadra',    nameHi:'सोनभद्र',              state:'UP', stateName:'Uttar Pradesh', tier:4, lat:24.681, lng:83.059},
  // Bihar Tier 3/4
  {name:'Bhagalpur',    nameHi:'भागलपुर',             state:'BR', stateName:'Bihar',       tier:3, lat:25.244, lng:86.972},
  {name:'Gaya',         nameHi:'गया',               state:'BR', stateName:'Bihar',       tier:3, lat:24.797, lng:85.000},
  {name:'Darbhanga',    nameHi:'दरभंगा',             state:'BR', stateName:'Bihar',       tier:3, lat:26.158, lng:85.899},
  {name:'Araria',       nameHi:'अररिया',              state:'BR', stateName:'Bihar',       tier:4, lat:26.150, lng:87.467},
  {name:'Sitamarhi',    nameHi:'सीतामढ़ी',             state:'BR', stateName:'Bihar',       tier:4, lat:26.594, lng:85.490},
  {name:'Purnia',       nameHi:'पूर्णिया',             state:'BR', stateName:'Bihar',       tier:3, lat:25.778, lng:87.472},
  {name:'Samastipur',   nameHi:'समस्तीपुर',            state:'BR', stateName:'Bihar',       tier:4, lat:25.856, lng:85.781},
  {name:'Begusarai',    nameHi:'बेगूसराय',             state:'BR', stateName:'Bihar',       tier:4, lat:25.418, lng:86.133},
  {name:'Nawada',       nameHi:'नवादा',              state:'BR', stateName:'Bihar',       tier:4, lat:24.889, lng:85.536},
  {name:'Nalanda',      nameHi:'नालंदा',              state:'BR', stateName:'Bihar',       tier:4, lat:25.137, lng:85.442},
  {name:'Jehanabad',    nameHi:'जहानाबाद',             state:'BR', stateName:'Bihar',       tier:4, lat:25.210, lng:84.987},
  {name:'Arwal',        nameHi:'अरवल',               state:'BR', stateName:'Bihar',       tier:4, lat:25.245, lng:84.682},
  {name:'Rohtas',       nameHi:'रोहतास',              state:'BR', stateName:'Bihar',       tier:4, lat:24.954, lng:83.999},
  {name:'Buxar',        nameHi:'बक्सर',              state:'BR', stateName:'Bihar',       tier:4, lat:25.563, lng:83.975},
  {name:'Kaimur',       nameHi:'कैमूर',              state:'BR', stateName:'Bihar',       tier:4, lat:25.048, lng:83.604},
  {name:'Aurangabad',   nameHi:'औरंगाबाद (बिहार)',    state:'BR', stateName:'Bihar',       tier:4, lat:24.752, lng:84.374},
  // Rajasthan
  {name:'Alwar',        nameHi:'अलवर',               state:'RJ', stateName:'Rajasthan',   tier:3, lat:27.554, lng:76.603},
  {name:'Bharatpur',    nameHi:'भरतपुर',              state:'RJ', stateName:'Rajasthan',   tier:3, lat:27.214, lng:77.489},
  {name:'Sikar',        nameHi:'सीकर',               state:'RJ', stateName:'Rajasthan',   tier:3, lat:27.613, lng:75.141},
  {name:'Tonk',         nameHi:'टोंक',               state:'RJ', stateName:'Rajasthan',   tier:4, lat:26.166, lng:75.789},
  {name:'Nagaur',       nameHi:'नागौर',              state:'RJ', stateName:'Rajasthan',   tier:4, lat:27.206, lng:73.736},
  {name:'Pali',         nameHi:'पाली',               state:'RJ', stateName:'Rajasthan',   tier:4, lat:25.773, lng:73.324},
  {name:'Barmer',       nameHi:'बाड़मेर',              state:'RJ', stateName:'Rajasthan',   tier:4, lat:25.748, lng:71.389},
  {name:'Jaisalmer',    nameHi:'जैसलमेर',             state:'RJ', stateName:'Rajasthan',   tier:4, lat:26.916, lng:70.916},
  {name:'Churu',        nameHi:'चूरू',               state:'RJ', stateName:'Rajasthan',   tier:4, lat:28.301, lng:74.961},
  {name:'Jhunjhunu',    nameHi:'झुंझुनूं',             state:'RJ', stateName:'Rajasthan',   tier:4, lat:28.131, lng:75.398},
  // Maharashtra
  {name:'Dhule',        nameHi:'धुले',               state:'MH', stateName:'Maharashtra', tier:3, lat:20.901, lng:74.777},
  {name:'Jalgaon',      nameHi:'जलगांव',              state:'MH', stateName:'Maharashtra', tier:3, lat:21.003, lng:75.562},
  {name:'Ahmednagar',   nameHi:'अहमदनगर',             state:'MH', stateName:'Maharashtra', tier:3, lat:19.094, lng:74.739},
  {name:'Latur',        nameHi:'लातूर',               state:'MH', stateName:'Maharashtra', tier:3, lat:18.400, lng:76.559},
  {name:'Satara',       nameHi:'सतारा',               state:'MH', stateName:'Maharashtra', tier:4, lat:17.687, lng:74.000},
  {name:'Akola',        nameHi:'अकोला',               state:'MH', stateName:'Maharashtra', tier:4, lat:20.707, lng:77.006},
  {name:'Wardha',       nameHi:'वर्धा',               state:'MH', stateName:'Maharashtra', tier:4, lat:20.745, lng:78.602},
  {name:'Yavatmal',     nameHi:'यवतमाळ',              state:'MH', stateName:'Maharashtra', tier:4, lat:20.388, lng:78.120},
  {name:'Buldhana',     nameHi:'बुलढाणा',             state:'MH', stateName:'Maharashtra', tier:4, lat:20.528, lng:76.183},
  {name:'Chandrapur',   nameHi:'चंद्रपुर',             state:'MH', stateName:'Maharashtra', tier:4, lat:19.961, lng:79.296},
  {name:'Gadchiroli',   nameHi:'गडचिरोली',             state:'MH', stateName:'Maharashtra', tier:4, lat:20.180, lng:80.000},
  // Andhra Pradesh & Telangana
  {name:'Kurnool',      nameHi:'कुर्नूल',             state:'AP', stateName:'Andhra Pradesh',tier:3, lat:15.828, lng:78.037},
  {name:'Kadapa',       nameHi:'कड़पा',               state:'AP', stateName:'Andhra Pradesh',tier:3, lat:14.475, lng:78.825},
  {name:'Anantapur',    nameHi:'अनंतपुर',             state:'AP', stateName:'Andhra Pradesh',tier:3, lat:14.682, lng:77.600},
  {name:'Karimnagar',   nameHi:'करीमनगर',             state:'TS', stateName:'Telangana',   tier:3, lat:18.439, lng:79.130},
  {name:'Nizamabad',    nameHi:'निजामाबाद',            state:'TS', stateName:'Telangana',   tier:3, lat:18.672, lng:78.094},
  {name:'Khammam',      nameHi:'खम्माम',              state:'TS', stateName:'Telangana',   tier:3, lat:17.247, lng:80.150},
  {name:'Nalgonda',     nameHi:'नलगोंडा',             state:'TS', stateName:'Telangana',   tier:4, lat:17.050, lng:79.266},
  {name:'Mahbubnagar',  nameHi:'महबूबनगर',            state:'TS', stateName:'Telangana',   tier:4, lat:16.734, lng:77.989},
  {name:'Adilabad',     nameHi:'आदिलाबाद',             state:'TS', stateName:'Telangana',   tier:4, lat:19.664, lng:78.529},
  // Tamil Nadu
  {name:'Tiruppur',     nameHi:'तिरुप्पुर',            state:'TN', stateName:'Tamil Nadu',  tier:3, lat:11.108, lng:77.341},
  {name:'Thanjavur',    nameHi:'तंजावुर',              state:'TN', stateName:'Tamil Nadu',  tier:3, lat:10.787, lng:79.139},
  {name:'Thoothukudi',  nameHi:'थूथुकुडी',             state:'TN', stateName:'Tamil Nadu',  tier:3, lat:8.759,  lng:78.135},
  {name:'Nagercoil',    nameHi:'नागरकोइल',             state:'TN', stateName:'Tamil Nadu',  tier:4, lat:8.176,  lng:77.432},
  {name:'Kancheepuram', nameHi:'कांचीपुरम',             state:'TN', stateName:'Tamil Nadu',  tier:4, lat:12.838, lng:79.705},
  {name:'Kumbakonam',   nameHi:'कुंभकोणम',             state:'TN', stateName:'Tamil Nadu',  tier:4, lat:10.962, lng:79.395},
  {name:'Dindigul',     nameHi:'डिंडीगुल',              state:'TN', stateName:'Tamil Nadu',  tier:4, lat:10.357, lng:77.972},
  {name:'Krishnagiri',  nameHi:'कृष्णागिरि',            state:'TN', stateName:'Tamil Nadu',  tier:4, lat:12.520, lng:78.213},
  {name:'Cuddalore',    nameHi:'कड्डलोर',              state:'TN', stateName:'Tamil Nadu',  tier:4, lat:11.742, lng:79.768},
  {name:'Villupuram',   nameHi:'विल्लुपुरम',            state:'TN', stateName:'Tamil Nadu',  tier:4, lat:11.939, lng:79.493},
  // Karnataka
  {name:'Shimoga',      nameHi:'शिमोगा',              state:'KA', stateName:'Karnataka',   tier:3, lat:13.930, lng:75.568},
  {name:'Tumakuru',     nameHi:'तुमकुर',              state:'KA', stateName:'Karnataka',   tier:3, lat:13.342, lng:77.101},
  {name:'Davangere',    nameHi:'दावणगेरे',             state:'KA', stateName:'Karnataka',   tier:3, lat:14.464, lng:75.921},
  {name:'Bijapur',      nameHi:'विजयपुर',              state:'KA', stateName:'Karnataka',   tier:3, lat:16.832, lng:75.713},
  {name:'Hassan',       nameHi:'हसन',                state:'KA', stateName:'Karnataka',   tier:4, lat:13.003, lng:76.099},
  {name:'Bidar',        nameHi:'बीदर',               state:'KA', stateName:'Karnataka',   tier:4, lat:17.914, lng:77.520},
  {name:'Raichur',      nameHi:'रायचूर',              state:'KA', stateName:'Karnataka',   tier:4, lat:16.203, lng:77.357},
  {name:'Udupi',        nameHi:'उडुपी',               state:'KA', stateName:'Karnataka',   tier:4, lat:13.341, lng:74.742},
  // MP & CG
  {name:'Ujjain',       nameHi:'उज्जैन',              state:'MP', stateName:'Madhya Pradesh', tier:3, lat:23.178, lng:75.783},
  {name:'Sagar',        nameHi:'सागर',               state:'MP', stateName:'Madhya Pradesh', tier:3, lat:23.839, lng:78.741},
  {name:'Satna',        nameHi:'सतना',               state:'MP', stateName:'Madhya Pradesh', tier:3, lat:24.575, lng:80.834},
  {name:'Rewa',         nameHi:'रीवा',                state:'MP', stateName:'Madhya Pradesh', tier:3, lat:24.533, lng:81.297},
  {name:'Katni',        nameHi:'कटनी',               state:'MP', stateName:'Madhya Pradesh', tier:4, lat:23.833, lng:80.406},
  {name:'Shivpuri',     nameHi:'शिवपुरी',             state:'MP', stateName:'Madhya Pradesh', tier:4, lat:25.424, lng:77.659},
  {name:'Morena',       nameHi:'मुरैना',              state:'MP', stateName:'Madhya Pradesh', tier:4, lat:26.496, lng:77.002},
  {name:'Korba',        nameHi:'कोरबा',               state:'CG', stateName:'Chhattisgarh', tier:3, lat:22.354, lng:82.698},
  {name:'Durg',         nameHi:'दुर्ग',               state:'CG', stateName:'Chhattisgarh', tier:3, lat:21.190, lng:81.283},
  {name:'Jagdalpur',    nameHi:'जगदलपुर',             state:'CG', stateName:'Chhattisgarh', tier:4, lat:19.072, lng:82.034},
  // Odisha
  {name:'Rourkela',     nameHi:'राउरकेला',             state:'OD', stateName:'Odisha',      tier:3, lat:22.260, lng:84.854},
  {name:'Berhampur',    nameHi:'बेरहामपुर',             state:'OD', stateName:'Odisha',      tier:3, lat:19.315, lng:84.793},
  {name:'Sambalpur',    nameHi:'संबलपुर',              state:'OD', stateName:'Odisha',      tier:3, lat:21.467, lng:83.970},
  {name:'Baripada',     nameHi:'बारीपदा',              state:'OD', stateName:'Odisha',      tier:4, lat:21.932, lng:86.722},
  {name:'Balasore',     nameHi:'बालासोर',              state:'OD', stateName:'Odisha',      tier:4, lat:21.493, lng:86.928},
  // Gujarat
  {name:'Jamnagar',     nameHi:'जामनगर',              state:'GJ', stateName:'Gujarat',     tier:3, lat:22.471, lng:70.057},
  {name:'Junagadh',     nameHi:'जूनागढ़',              state:'GJ', stateName:'Gujarat',     tier:3, lat:21.522, lng:70.457},
  {name:'Bhavnagar',    nameHi:'भावनगर',              state:'GJ', stateName:'Gujarat',     tier:3, lat:21.762, lng:72.152},
  {name:'Gandhinagar',  nameHi:'गांधीनगर',             state:'GJ', stateName:'Gujarat',     tier:3, lat:23.216, lng:72.685},
  {name:'Anand',        nameHi:'आनंद',               state:'GJ', stateName:'Gujarat',     tier:4, lat:22.556, lng:72.952},
  {name:'Navsari',      nameHi:'नवसारी',              state:'GJ', stateName:'Gujarat',     tier:4, lat:20.951, lng:72.913},
  {name:'Vapi',         nameHi:'वापी',               state:'GJ', stateName:'Gujarat',     tier:4, lat:20.371, lng:72.906},
  // Haryana
  {name:'Panipat',      nameHi:'पानीपत',              state:'HR', stateName:'Haryana',     tier:3, lat:29.391, lng:76.970},
  {name:'Ambala',       nameHi:'अम्बाला',              state:'HR', stateName:'Haryana',     tier:3, lat:30.378, lng:76.777},
  {name:'Hisar',        nameHi:'हिसार',               state:'HR', stateName:'Haryana',     tier:3, lat:29.152, lng:75.730},
  {name:'Rohtak',       nameHi:'रोहतक',              state:'HR', stateName:'Haryana',     tier:3, lat:28.895, lng:76.577},
  {name:'Sonipat',      nameHi:'सोनीपत',              state:'HR', stateName:'Haryana',     tier:4, lat:28.993, lng:77.018},
  {name:'Karnal',       nameHi:'करनाल',              state:'HR', stateName:'Haryana',     tier:4, lat:29.686, lng:76.990},
  {name:'Yamunanagar',  nameHi:'यमुनानगर',             state:'HR', stateName:'Haryana',     tier:4, lat:30.130, lng:77.290},
  // Punjab
  {name:'Patiala',      nameHi:'पटियाला',              state:'PB', stateName:'Punjab',      tier:3, lat:30.339, lng:76.386},
  {name:'Bathinda',     nameHi:'बठिंडा',              state:'PB', stateName:'Punjab',      tier:3, lat:30.211, lng:74.944},
  {name:'Hoshiarpur',   nameHi:'होशियारपुर',            state:'PB', stateName:'Punjab',      tier:4, lat:31.533, lng:75.911},
  {name:'Pathankot',    nameHi:'पठानकोट',             state:'PB', stateName:'Punjab',      tier:4, lat:32.274, lng:75.652},
  {name:'Moga',         nameHi:'मोगा',               state:'PB', stateName:'Punjab',      tier:4, lat:30.816, lng:75.173},
  // Assam & NE
  {name:'Dibrugarh',    nameHi:'डिब्रूगढ़',             state:'AS', stateName:'Assam',       tier:3, lat:27.481, lng:94.912},
  {name:'Silchar',      nameHi:'सिलचर',               state:'AS', stateName:'Assam',       tier:3, lat:24.831, lng:92.798},
  {name:'Tezpur',       nameHi:'तेज़पुर',              state:'AS', stateName:'Assam',       tier:4, lat:26.631, lng:92.793},
  {name:'Jorhat',       nameHi:'जोरहाट',              state:'AS', stateName:'Assam',       tier:4, lat:26.751, lng:94.203},
  // Kerala
  {name:'Kannur',       nameHi:'कन्नूर',              state:'KL', stateName:'Kerala',      tier:3, lat:11.868, lng:75.370},
  {name:'Kollam',       nameHi:'कोल्लम',              state:'KL', stateName:'Kerala',      tier:3, lat:8.888,  lng:76.614},
  {name:'Alappuzha',    nameHi:'अलप्पुझा',             state:'KL', stateName:'Kerala',      tier:4, lat:9.498,  lng:76.329},
  {name:'Palakkad',     nameHi:'पलक्काड',              state:'KL', stateName:'Kerala',      tier:4, lat:10.778, lng:76.654},
  {name:'Pathanamthitta', nameHi:'पत्तनमतिट्टा',       state:'KL', stateName:'Kerala',      tier:4, lat:9.264,  lng:76.787},
  // Uttarakhand
  {name:'Haridwar',     nameHi:'हरिद्वार',             state:'UK', stateName:'Uttarakhand', tier:3, lat:29.946, lng:78.163},
  {name:'Rishikesh',    nameHi:'ऋषिकेश',              state:'UK', stateName:'Uttarakhand', tier:4, lat:30.087, lng:78.268},
  {name:'Nainital',     nameHi:'नैनीताल',              state:'UK', stateName:'Uttarakhand', tier:4, lat:29.381, lng:79.463},
  {name:'Roorkee',      nameHi:'रुड़की',               state:'UK', stateName:'Uttarakhand', tier:4, lat:29.865, lng:77.893},
  {name:'Haldwani',     nameHi:'हल्द्वानी',            state:'UK', stateName:'Uttarakhand', tier:4, lat:29.218, lng:79.519}
];

// Add slug to each city at load time
CITIES_META.forEach(function(c) {
  c.slug = slugify(c.name);
});

/* ── Exports ─────────────────────────────────────────────── */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CITIES_META, slugify };
} else if (typeof window !== 'undefined') {
  window.CITIES_META = CITIES_META;
  window.slugify = slugify;
}