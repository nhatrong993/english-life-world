/* =====================================================================
   TOPIC: OUTDOOR ACTIVITIES (Hoạt động ngoài trời / Cắm trại & Dã ngoại — Pine Valley Camp)
   2.5D SVG scene (1000×640) · 22 interactive objects · 104 actions
   2 NPCs (Park Ranger 🤠 + Kayak Guide 🚣) · 3 missions · 1 challenge · 60+ vocab
   ===================================================================== */
(function(){
"use strict";
const root=typeof window!=="undefined"?window:globalThis;

const ODV={
 trailhead:["/ˈtreɪlhed/","đầu đường mòn","n"],
 trail_map:["/treɪl mæp/","bản đồ đường mòn","n"],
 ranger:["/ˈreɪndʒər/","nhân viên kiểm lâm","n"],
 ranger_station:["/ˈreɪndʒər ˈsteɪʃən/","trạm kiểm lâm","n"],
 tent:["/tent/","lều cắm trại","n"],
 pitch:["/pɪtʃ/","dựng (lều)","v"],
 campfire:["/ˈkæmpfaɪər/","lửa trại","n"],
 firewood:["/ˈfaɪərwʊd/","củi khô","n"],
 marshmallow:["/ˈmɑːrʃmeloʊ/","kẹo dẻo nướng","n"],
 roast:["/roʊst/","nướng trên lửa","v"],
 embers:["/ˈembərz/","than hồng","n"],
 picnic_blanket:["/ˈpɪknɪk ˈblæŋkɪt/","thảm dã ngoại","n"],
 cooler:["/ˈkuːlər/","thùng giữ lạnh","n"],
 sandwich:["/ˈsænwɪtʃ/","bánh mì kẹp","n"],
 backpack:["/ˈbækpæk/","ba lô leo núi","n"],
 compass:["/ˈkʌmpəs/","la bàn","n"],
 lookout:["/ˈlʊkaʊt/","điểm ngắm cảnh","n"],
 binoculars:["/bɪˈnɑːkjələrz/","ống nhòm","n"],
 kayak:["/ˈkaɪæk/","thuyền kayak","n"],
 life_jacket:["/ˈlaɪf dʒækɪt/","áo phao","n"],
 paddle:["/ˈpædəl/","chèo thuyền / mái chèo","v"],
 lantern:["/ˈlæntərn/","đèn lồng cắm trại","n"],
 hike:["/haɪk/","đi bộ đường dài / leo núi","v"],
 trace:["/treɪs/","dấu vết","n"],
 hammock:["/ˈhæmək/","võng cắm trại","n"],
 camp_stove:["/kæmp stoʊv/","bếp ga dã ngoại","n"],
 fishing_rod:["/ˈfɪʃɪŋ rɑːd/","cần câu cá","n"],
 bait:["/beɪt/","mồi câu","n"],
 trout:["/traʊt/","cá hồi suối","n"],
 first_aid_kit:["/ˌfɜːrst ˈeɪd kɪt/","hộp sơ cứu y tế","n"],
 sunscreen:["/ˈsʌnskriːn/","kem chống nắng","n"],
 bug_spray:["/bʌɡ spreɪ/","xịt chống côn trùng","n"],
 bandage:["/ˈbændɪdʒ/","băng cá nhân","n"],
 wildlife:["/ˈwaɪldlaɪf/","động vật hoang dã","n"],
 squirrel:["/ˈskwɜːrəl/","con sóc","n"],
 pine_cone:["/paɪn koʊn/","quả thông","n"],
 woodpile:["/ˈwʊdpaɪl/","đống củi khô","n"],
 tarp:["/tɑːrp/","tấm bạt chống thấm","n"],
 kindling:["/ˈkɪndlɪŋ/","củi mồi / cành khô nhỏ","n"],
 camp_chair:["/kæmp tʃer/","ghế xếp cắm trại","n"],
 cocoa:["/ˈkoʊkoʊ/","ca cao nóng","n"],
 bear_bin:["/ber bɪn/","thùng rác chống gấu","n"],
 recycle:["/ˌriːˈsaɪkəl/","tái chế","v"],
 litter:["/ˈlɪtər/","rác vụn","n"],
 wildflower:["/ˈwaɪldflaʊər/","hoa dại trên núi","n"],
 honeybee:["/ˈhʌnibiː/","ong mật","n"],
 water_pump:["/ˈwɔːtər pʌmp/","vòi bơm nước","n"],
 spring_water:["/sprɪŋ ˈwɔːtər/","nước suối nguồn","n"],
 telescope:["/ˈtelɪskoʊp/","kính thiên văn","n"],
 constellation:["/ˌkɑːnstəˈleɪʃən/","chòm sao","n"],
 guitar:["/ɡɪˈtɑːr/","đàn ghi-ta","n"],
 strum:["/strʌm/","gảy đàn","v"],
 permit:["/ˈpɜːrmɪt/","giấy phép cắm trại","n"],
 whistle:["/ˈwɪsəl/","còi cứu hộ","n"],
 sleeping_bag:["/ˈsliːpɪŋ bæɡ/","túi ngủ","n"],
 stake:["/steɪk/","cọc ghim lều","n"],
 poncho:["/ˈpɑːntʃoʊ/","áo mưa cánh dơi","n"],
 flashlight:["/ˈflæʃlaɪt/","đèn pin","n"],
 breeze:["/briːz/","làn gió nhẹ","n"],
 breathtaking:["/ˈbreθteɪkɪŋ/","đẹp ngoạn mục","adj"],
 waterproof:["/ˈwɔːtərpruːf/","chống thấm nước","adj"],
 refreshing:["/rɪˈfreʃɪŋ/","sảng khoái, mát lành","adj"]
};
const V=(...ks)=>ks.filter(k=>ODV[k]).map(k=>[k.replace(/_/g," "),ODV[k][0],ODV[k][1]]);
const W4=(...ks)=>ks.filter(k=>ODV[k]).map(k=>[k.replace(/_/g," "),ODV[k][0],ODV[k][2]||"n",ODV[k][1]]);

const go=spot=>["walk",spot];
const set=(k,v)=>["set",k,v];
const pose=(p,ms=520)=>["pose",p,ms];
const wait=(ms=300)=>["wait",ms];

const OD_SHELL=`
<defs>
 <linearGradient id="odSky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#6eb5e5"/>
  <stop offset=".52" stop-color="#a8dcf5"/>
  <stop offset="1" stop-color="#fce4b8"/>
 </linearGradient>
 <linearGradient id="odLake" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#3a9ad9"/>
  <stop offset=".6" stop-color="#297fb8"/>
  <stop offset="1" stop-color="#1c5d8a"/>
 </linearGradient>
 <linearGradient id="odGrass" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#7ec464"/>
  <stop offset=".55" stop-color="#5da848"/>
  <stop offset="1" stop-color="#488c36"/>
 </linearGradient>
 <linearGradient id="odTrail" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#d8b589"/>
  <stop offset="1" stop-color="#b89162"/>
 </linearGradient>
 <radialGradient id="odFireGlow" cx=".5" cy=".5" r=".5">
  <stop offset="0" stop-color="#ff9d2e" stop-opacity=".62"/>
  <stop offset="1" stop-color="#ff9d2e" stop-opacity="0"/>
 </radialGradient>
</defs>

<!-- Sky & distant sun -->
<rect width="1000" height="390" fill="url(#odSky)"/>
<circle cx="840" cy="88" r="42" fill="#fff4b8" opacity=".9"/>
<circle cx="840" cy="88" r="62" fill="#ffe58f" opacity=".32"/>

<!-- Soft clouds -->
<g fill="#fff" opacity=".82">
 <ellipse cx="180" cy="74" rx="52" ry="18"/><ellipse cx="215" cy="68" rx="38" ry="15"/>
 <ellipse cx="530" cy="62" rx="64" ry="20"/><ellipse cx="572" cy="58" rx="42" ry="16"/>
</g>

<!-- Distant snow-capped mountain range -->
<polygon points="0,330 140,145 295,330" fill="#6f8ba6"/>
<polygon points="140,145 182,198 156,198 140,178 122,198 98,198" fill="#f3f8fc"/>
<polygon points="210,330 390,118 575,330" fill="#5b7894"/>
<polygon points="390,118 442,184 412,184 390,160 368,184 338,184" fill="#f7fbff"/>
<polygon points="480,330 675,152 860,330" fill="#68849e"/>
<polygon points="675,152 715,198 690,198 675,178 656,198 635,198" fill="#f2f7fc"/>
<polygon points="740,330 915,175 1000,330" fill="#7893ad"/>

<!-- Pine forest ridge -->
<path d="M0 330 Q260 285 520 315 T1000 305 L1000 390 L0 390 Z" fill="#467c44"/>
<g fill="#2e5e30">
 <polygon points="48,332 68,268 88,332"/><polygon points="75,335 98,258 121,335"/>
 <polygon points="445,326 468,262 491,326"/><polygon points="478,328 500,252 522,328"/>
 <polygon points="690,322 712,262 734,322"/>
</g>

<!-- Valley grass ground -->
<rect y="330" width="1000" height="310" fill="url(#odGrass)"/>

<!-- Crystal mountain lake on the right -->
<path d="M685 372 Q760 352 1000 356 L1000 578 Q780 584 705 522 Q660 468 685 372 Z" fill="url(#odLake)" stroke="#d9c096" stroke-width="6"/>
<!-- Water ripples -->
<g stroke="#9fd7f7" stroke-width="2" fill="none" opacity=".65" stroke-linecap="round">
 <path d="M760 412 q22 -5 44 0"/><path d="M845 438 q28 -6 56 0"/><path d="M790 505 q26 -5 52 0"/>
</g>

<!-- Winding dirt hiking trail from gate to scenic lookout -->
<path d="M60 638 Q135 550 185 480 Q235 415 318 352 L365 352 Q285 422 242 492 Q196 562 145 638 Z" fill="url(#odTrail)" opacity=".88"/>
<!-- Stepping stones toward campfire & dock -->
<g fill="#c9baa3" stroke="#8c7d68" stroke-width="1.5">
 <ellipse cx="260" cy="565" rx="22" ry="9"/><ellipse cx="325" cy="562" rx="20" ry="8"/>
 <ellipse cx="615" cy="528" rx="22" ry="8"/><ellipse cx="672" cy="512" rx="20" ry="8"/>
</g>
`;

const OD_WORLD=`
<!-- 1. Scenic Lookout Ridge (elevated hill back-left) -->
<g class="obj" id="o-lookout" data-obj="lookout" data-base="368">
 <rect class="hit" x="268" y="255" width="142" height="118"/>
 <path d="M272 365 L292 316 L392 316 L410 365 Z" fill="#8b7d6b" stroke="#4f463b" stroke-width="2.5"/>
 <ellipse cx="342" cy="316" rx="52" ry="12" fill="#a89984" stroke="#4f463b" stroke-width="2"/>
 <line x1="296" y1="286" x2="296" y2="316" stroke="#5c3818" stroke-width="4"/>
 <line x1="342" y1="284" x2="342" y2="316" stroke="#5c3818" stroke-width="4"/>
 <line x1="386" y1="286" x2="386" y2="316" stroke="#5c3818" stroke-width="4"/>
 <line x1="292" y1="294" x2="390" y2="294" stroke="#7a4b24" stroke-width="3.5"/>
 <line x1="292" y1="305" x2="390" y2="305" stroke="#7a4b24" stroke-width="3"/>
 <g transform="translate(362,276)">
  <line x1="0" y1="6" x2="0" y2="38" stroke="#3b444b" stroke-width="3"/>
  <rect x="-10" y="0" width="20" height="9" rx="4" fill="#2c3e50" stroke="#fff" stroke-width="1.2"/>
  <circle cx="11" cy="4.5" r="3.5" fill="#7ec8e3"/>
 </g>
 <text class="tag label" x="342" y="250" text-anchor="middle">scenic lookout</text>
</g>

<!-- 2. Ranger Station Cabin (back-left) -->
<g class="obj" id="o-rangerpost" data-obj="rangerpost" data-base="432">
 <rect class="hit" x="128" y="286" width="142" height="152"/>
 <ellipse cx="198" cy="432" rx="68" ry="12" fill="#000" opacity=".18"/>
 <rect x="142" y="334" width="112" height="94" rx="4" fill="#9c6234" stroke="#4a2810" stroke-width="2.8"/>
 <line x1="142" y1="356" x2="254" y2="356" stroke="#6b3e1b" stroke-width="2"/>
 <line x1="142" y1="378" x2="254" y2="378" stroke="#6b3e1b" stroke-width="2"/>
 <line x1="142" y1="400" x2="254" y2="400" stroke="#6b3e1b" stroke-width="2"/>
 <polygon points="128,338 198,288 268,338" fill="#2d6a3e" stroke="#183d22" stroke-width="3"/>
 <rect x="156" y="350" width="52" height="44" rx="4" fill="#fef3d6" stroke="#4a2810" stroke-width="2.5"/>
 <g transform="translate(182,384)">
  <path d="M-13 10 Q-12 -4 0 -4 Q12 -4 13 10 Z" fill="#4e6e3a" stroke="#26381b" stroke-width="1.8"/>
  <circle cx="0" cy="-12" r="9" fill="#f1c292"/>
  <ellipse cx="0" cy="-19" rx="14" ry="3.5" fill="#7a5229" stroke="#3b240e" stroke-width="1.5"/>
  <path d="M-8 -19 Q0 -29 8 -19 Z" fill="#8c6032" stroke="#3b240e" stroke-width="1.5"/>
  <circle cx="4" cy="-21" r="2" fill="#ffd54f"/>
 </g>
 <rect x="216" y="352" width="30" height="38" rx="3" fill="#fff8e7" stroke="#5c3818" stroke-width="1.8"/>
 <circle cx="231" cy="365" r="6" fill="#ffb300"/>
 <line x1="221" y1="378" x2="241" y2="378" stroke="#4a6375" stroke-width="2"/>
 <rect x="158" y="320" width="80" height="16" rx="3" fill="#f7e3b5" stroke="#4a2810" stroke-width="1.8"/>
 <text x="198" y="331" text-anchor="middle" font-size="8.5" font-weight="800" fill="#2d4a22">RANGER POST</text>
 <text class="tag label" x="198" y="282" text-anchor="middle">ranger station</text>
</g>

<!-- 3. Camping Tent (center-mid meadow) -->
<g class="obj" id="o-campsite" data-obj="campsite" data-base="458">
 <rect class="hit" x="405" y="332" width="195" height="132"/>
 <ellipse cx="502" cy="454" rx="88" ry="16" fill="#000" opacity=".2"/>
 <polygon points="418,452 442,418 564,418 586,452" fill="#5c768d" stroke="#344654" stroke-width="2"/>
 <g class="od-tent-bag" transform="translate(502,438)">
  <rect x="-36" y="-12" width="72" height="22" rx="10" fill="#e67e22" stroke="#783c08" stroke-width="2.2"/>
  <line x1="-18" y1="-12" x2="-18" y2="10" stroke="#3b2313" stroke-width="2.5"/>
  <line x1="18" y1="-12" x2="18" y2="10" stroke="#3b2313" stroke-width="2.5"/>
 </g>
 <g class="od-tent-pitched">
  <path d="M422 450 Q458 334 502 334 Q546 334 582 450 Z" fill="#f39c12" stroke="#6e3b09" stroke-width="3"/>
  <path d="M452 362 Q502 334 552 362 L540 390 Q502 374 464 390 Z" fill="#d35400" stroke="#6e3b09" stroke-width="2"/>
  <polygon class="od-tent-open" points="468,450 502,368 536,450" fill="#2c3e50" stroke="#6e3b09" stroke-width="2"/>
  <polygon class="od-tent-zipped" points="468,450 502,368 536,450" fill="#e67e22" stroke="#6e3b09" stroke-width="2"/>
  <line class="od-tent-zipped" x1="502" y1="368" x2="502" y2="450" stroke="#fff3cd" stroke-width="2" stroke-dasharray="4 3"/>
  <line x1="422" y1="448" x2="408" y2="456" stroke="#c0392b" stroke-width="2"/>
  <line x1="582" y1="448" x2="596" y2="456" stroke="#c0392b" stroke-width="2"/>
 </g>
 <text class="tag label" x="502" y="326" text-anchor="middle">camping tent</text>
</g>

<!-- 4. Camping Lantern on wooden post next to tent -->
<g class="obj" id="o-camplantern" data-obj="camplantern" data-base="456">
 <rect class="hit" x="598" y="352" width="56" height="108"/>
 <line x1="624" y1="368" x2="624" y2="452" stroke="#5c3818" stroke-width="5" stroke-linecap="round"/>
 <line x1="624" y1="368" x2="608" y2="368" stroke="#5c3818" stroke-width="4" stroke-linecap="round"/>
 <circle class="od-lantern-glow" cx="608" cy="388" r="34" fill="url(#odFireGlow)"/>
 <g transform="translate(608,386)">
  <rect x="-9" y="-12" width="18" height="6" rx="2" fill="#2c3e50"/>
  <rect class="od-lantern-glass" x="-7" y="-6" width="14" height="16" rx="2" fill="#d8e6ec" stroke="#2c3e50" stroke-width="1.8"/>
  <rect x="-10" y="10" width="20" height="6" rx="2" fill="#c0392b"/>
 </g>
 <text class="tag label" x="620" y="346" text-anchor="middle">camping lantern</text>
</g>

<!-- 5. Wooden Lake Dock & Kayak (right side on lake) -->
<g class="obj" id="o-lakedock" data-obj="lakedock" data-base="492">
 <rect class="hit" x="678" y="405" width="215" height="122"/>
 <polygon points="682,456 805,436 815,472 690,492" fill="#a67446" stroke="#4f3117" stroke-width="2.5"/>
 <line x1="712" y1="452" x2="720" y2="487" stroke="#5e3a1b" stroke-width="2"/>
 <line x1="742" y1="447" x2="750" y2="482" stroke="#5e3a1b" stroke-width="2"/>
 <line x1="772" y1="442" x2="780" y2="477" stroke="#5e3a1b" stroke-width="2"/>
 <rect x="688" y="446" width="8" height="52" fill="#5e3a1b"/>
 <rect x="798" y="428" width="8" height="54" fill="#5e3a1b"/>
 <g class="od-dock-vest" transform="translate(692,438)">
  <rect x="-9" y="-12" width="18" height="20" rx="4" fill="#ff5722" stroke="#872608" stroke-width="1.8"/>
  <line x1="-9" y1="-2" x2="9" y2="-2" stroke="#ffeb3b" stroke-width="2.5"/>
 </g>
 <g transform="translate(756,438)">
  <path d="M-12 12 Q-11 -4 0 -4 Q11 -4 12 12 Z" fill="#00897b" stroke="#004d40" stroke-width="1.8"/>
  <circle cx="0" cy="-12" r="8.5" fill="#f0c090"/>
  <path d="M-9 -15 Q0 -23 9 -15 Z" fill="#e53935"/>
 </g>
 <g class="od-kayak-boat" transform="translate(838,488)">
  <path d="M-56 0 Q0 -16 56 0 Q0 16 -56 0 Z" fill="#ffca28" stroke="#b26a00" stroke-width="2.5"/>
  <ellipse cx="0" cy="0" rx="16" ry="7" fill="#37474f" stroke="#263238" stroke-width="2"/>
  <line x1="-38" y1="-14" x2="38" y2="14" stroke="#5d4037" stroke-width="3"/>
  <rect x="-44" y="-18" width="12" height="6" rx="2" fill="#e53935" transform="rotate(20 -38 -15)"/>
  <rect x="32" y="12" width="12" height="6" rx="2" fill="#e53935" transform="rotate(20 38 15)"/>
 </g>
 <text class="tag label" x="785" y="400" text-anchor="middle">wooden dock &amp; kayak</text>
</g>

<!-- 6. Trailhead Gate & Map Board (front-left entrance) -->
<g class="obj" id="o-trailhead" data-obj="trailhead" data-base="568">
 <rect class="hit" x="28" y="438" width="136" height="145"/>
 <ellipse cx="96" cy="566" rx="58" ry="12" fill="#000" opacity=".18"/>
 <rect x="44" y="454" width="12" height="112" rx="3" fill="#6b3e1b" stroke="#3b200c" stroke-width="2.2"/>
 <rect x="132" y="454" width="12" height="112" rx="3" fill="#6b3e1b" stroke="#3b200c" stroke-width="2.2"/>
 <polygon points="28,462 94,434 160,462" fill="#4a2c14" stroke="#291709" stroke-width="2.5"/>
 <rect x="54" y="468" width="80" height="56" rx="4" fill="#fdf6e2" stroke="#4a2c14" stroke-width="2.5"/>
 <path d="M62 514 Q78 492 94 498 T124 478" fill="none" stroke="#d35400" stroke-width="2.5" stroke-dasharray="4 2"/>
 <polygon points="104,492 114,474 124,492" fill="#467c44"/>
 <circle cx="64" cy="514" r="3.5" fill="#e53935"/>
 <text x="94" y="458" text-anchor="middle" font-size="8.5" font-weight="800" fill="#ffe082">PINE VALLEY TRAIL</text>
 <text class="tag label" x="94" y="584" text-anchor="middle">trail map board</text>
</g>

<!-- 7. Picnic Blanket & Basket (front-left meadow) -->
<g class="obj" id="o-picnicspot" data-obj="picnicspot" data-base="552">
 <rect class="hit" x="188" y="486" width="186" height="82"/>
 <g class="od-blanket-rolled" transform="translate(278,528)">
  <rect x="-32" y="-10" width="64" height="20" rx="8" fill="#e53935" stroke="#7f1d1d" stroke-width="2"/>
  <line x1="-12" y1="-10" x2="-12" y2="10" stroke="#fff" stroke-width="3"/>
  <line x1="12" y1="-10" x2="12" y2="10" stroke="#fff" stroke-width="3"/>
 </g>
 <g class="od-blanket-spread">
  <polygon points="210,502 346,502 368,548 192,548" fill="#e53935" stroke="#7f1d1d" stroke-width="2.5"/>
  <line x1="242" y1="502" x2="232" y2="548" stroke="#ffcdd2" stroke-width="6" opacity=".65"/>
  <line x1="280" y1="502" x2="278" y2="548" stroke="#ffcdd2" stroke-width="6" opacity=".65"/>
  <line x1="318" y1="502" x2="324" y2="548" stroke="#ffcdd2" stroke-width="6" opacity=".65"/>
  <line x1="201" y1="525" x2="357" y2="525" stroke="#ffcdd2" stroke-width="6" opacity=".65"/>
  <rect x="222" y="494" width="38" height="24" rx="4" fill="#c88a4b" stroke="#5c3818" stroke-width="2"/>
  <g class="od-picnic-food" transform="translate(304,522)">
   <ellipse cx="0" cy="4" rx="20" ry="7" fill="#fff" stroke="#90a4ae" stroke-width="1.5"/>
   <polygon points="-12,2 0,-9 12,2" fill="#f5d69b" stroke="#8d6e63" stroke-width="1.5"/>
   <line x1="-9" y1="0" x2="9" y2="0" stroke="#4caf50" stroke-width="2"/>
  </g>
 </g>
 <text class="tag label" x="280" y="566" text-anchor="middle">picnic blanket</text>
</g>

<!-- 8. Cooler Box (next to picnic spot) -->
<g class="obj" id="o-cooler" data-obj="cooler" data-base="548">
 <rect class="hit" x="372" y="486" width="76" height="70"/>
 <ellipse cx="410" cy="544" rx="32" ry="8" fill="#000" opacity=".18"/>
 <rect x="382" y="502" width="56" height="38" rx="5" fill="#1e88e5" stroke="#0d47a1" stroke-width="2.2"/>
 <rect x="379" y="494" width="62" height="10" rx="3" fill="#ffffff" stroke="#0d47a1" stroke-width="2"/>
 <g class="od-cooler-juice" transform="translate(410,486)">
  <rect x="-5" y="-10" width="10" height="16" rx="3" fill="#ff9800" stroke="#e65100" stroke-width="1.4"/>
  <rect x="-3" y="-14" width="6" height="4" fill="#2e7d32"/>
 </g>
 <text class="tag label" x="410" y="560" text-anchor="middle">cooler box</text>
</g>

<!-- 9. Stone Campfire Ring & Log Seat (center foreground) -->
<g class="obj" id="o-firepit" data-obj="firepit" data-base="556">
 <rect class="hit" x="466" y="478" width="144" height="92"/>
 <circle class="od-fire-glow" cx="538" cy="528" r="64" fill="url(#odFireGlow)"/>
 <rect x="472" y="486" width="76" height="18" rx="8" fill="#7a4b24" stroke="#3e230d" stroke-width="2.2"/>
 <ellipse cx="474" cy="495" rx="5" ry="9" fill="#d7b38c" stroke="#3e230d" stroke-width="1.8"/>
 <g fill="#7f8c8d" stroke="#3b4446" stroke-width="2">
  <ellipse cx="510" cy="536" rx="12" ry="7"/><ellipse cx="528" cy="542" rx="13" ry="7"/>
  <ellipse cx="550" cy="542" rx="13" ry="7"/><ellipse cx="568" cy="536" rx="12" ry="7"/>
  <ellipse cx="564" cy="524" rx="11" ry="6"/><ellipse cx="514" cy="524" rx="11" ry="6"/>
  <ellipse cx="538" cy="520" rx="14" ry="6"/>
 </g>
 <g class="od-fire-wood">
  <line x1="518" y1="536" x2="558" y2="522" stroke="#5d3a1a" stroke-width="6" stroke-linecap="round"/>
  <line x1="520" y1="522" x2="556" y2="536" stroke="#4a2c11" stroke-width="6" stroke-linecap="round"/>
 </g>
 <g class="od-fire-flames">
  <path d="M524 532 Q530 496 538 486 Q548 498 552 532 Z" fill="#ff6d00"/>
  <path d="M530 532 Q535 506 539 498 Q544 508 547 532 Z" fill="#ffd600"/>
 </g>
 <g class="od-fire-out" stroke="#cfd8dc" stroke-width="2.5" fill="none" stroke-linecap="round">
  <path d="M532 524 Q528 508 535 496"/><path d="M544 526 Q548 510 541 498"/>
 </g>
 <text class="tag label" x="538" y="566" text-anchor="middle">campfire ring</text>
</g>

<!-- 10. Hiking Backpack on wooden stump (center-right foreground) -->
<g class="obj" id="o-backpack" data-obj="backpack" data-base="552">
 <rect class="hit" x="614" y="484" width="76" height="78"/>
 <ellipse cx="652" cy="548" rx="28" ry="8" fill="#000" opacity=".2"/>
 <rect x="632" y="524" width="40" height="24" rx="3" fill="#7a4b24" stroke="#3e230d" stroke-width="2"/>
 <ellipse cx="652" cy="524" rx="20" ry="6" fill="#d7b38c" stroke="#3e230d" stroke-width="1.8"/>
 <rect x="634" y="490" width="36" height="38" rx="10" fill="#2e7d32" stroke="#1b4d20" stroke-width="2.2"/>
 <path d="M634 502 Q652 510 670 502" fill="none" stroke="#ffca28" stroke-width="2.2"/>
 <rect class="od-pack-bottle" x="668" y="502" width="9" height="20" rx="3" fill="#29b6f6" stroke="#0277bd" stroke-width="1.5"/>
 <text class="tag label" x="652" y="564" text-anchor="middle">hiking backpack</text>
</g>

<!-- 11. Camping Hammock (strung between pine trees on left) -->
<g class="obj" id="o-hammock" data-obj="hammock" data-base="415">
 <rect class="hit" x="28" y="340" width="98" height="82"/>
 <rect x="34" y="344" width="10" height="72" rx="3" fill="#5d3a1a" stroke="#3b2313" stroke-width="1.8"/>
 <rect x="110" y="344" width="10" height="72" rx="3" fill="#5d3a1a" stroke="#3b2313" stroke-width="1.8"/>
 <path d="M42 372 Q77 408 112 372 Q77 392 42 372 Z" fill="#26a69a" stroke="#00695c" stroke-width="2.2"/>
 <text class="tag label" x="77" y="336" text-anchor="middle">camping hammock</text>
</g>

<!-- 12. Portable Camp Stove & Grill (between ranger cabin and tent) -->
<g class="obj" id="o-campgrill" data-obj="campgrill" data-base="460">
 <rect class="hit" x="285" y="395" width="80" height="72"/>
 <rect x="296" y="424" width="58" height="34" rx="4" fill="#cfd8dc" stroke="#455a64" stroke-width="2"/>
 <rect x="302" y="410" width="46" height="14" rx="3" fill="#d32f2f" stroke="#7f0000" stroke-width="1.8"/>
 <circle cx="314" cy="417" r="3" fill="#ffeb3b"/>
 <circle cx="336" cy="417" r="3" fill="#ffeb3b"/>
 <text class="tag label" x="325" y="390" text-anchor="middle">portable camp stove</text>
</g>

<!-- 13. Fishing Rod & Tackle Box (lakeside lower right) -->
<g class="obj" id="o-fishingrod" data-obj="fishingrod" data-base="585">
 <rect class="hit" x="700" y="525" width="92" height="70"/>
 <rect x="708" y="556" width="32" height="22" rx="4" fill="#43a047" stroke="#1b5e20" stroke-width="2"/>
 <line x1="736" y1="564" x2="786" y2="528" stroke="#5d4037" stroke-width="3" stroke-linecap="round"/>
 <line x1="786" y1="528" x2="788" y2="558" stroke="#e0f7fa" stroke-width="1.4" stroke-dasharray="3 2"/>
 <text class="tag label" x="746" y="598" text-anchor="middle">fishing rod &amp; tackle</text>
</g>

<!-- 14. Camp First-Aid Kit (mounted by ranger post) -->
<g class="obj" id="o-firstaid" data-obj="firstaid" data-base="428">
 <rect class="hit" x="248" y="365" width="46" height="65"/>
 <rect x="255" y="376" width="32" height="26" rx="4" fill="#ffffff" stroke="#c62828" stroke-width="2.2"/>
 <rect x="268" y="381" width="6" height="16" fill="#e53935"/>
 <rect x="263" y="386" width="16" height="6" fill="#e53935"/>
 <text class="tag label" x="271" y="362" text-anchor="middle">first-aid kit</text>
</g>

<!-- 15. Wildlife Sign & Bird Nest (upper right ridge) -->
<g class="obj" id="o-wildlifesign" data-obj="wildlifesign" data-base="368">
 <rect class="hit" x="642" y="292" width="80" height="80"/>
 <rect x="676" y="328" width="8" height="40" fill="#5d3a1a"/>
 <rect x="654" y="302" width="52" height="30" rx="4" fill="#ffe0b2" stroke="#5d3a1a" stroke-width="2"/>
 <ellipse cx="680" cy="298" rx="14" ry="6" fill="#8d6e63" stroke="#4e342e" stroke-width="1.5"/>
 <text class="tag label" x="682" y="286" text-anchor="middle">wildlife sign &amp; nest</text>
</g>

<!-- 16. Firewood Rack & Logs (near campfire) -->
<g class="obj" id="o-woodpile" data-obj="woodpile" data-base="500">
 <rect class="hit" x="435" y="455" width="62" height="52"/>
 <rect x="444" y="468" width="44" height="26" rx="3" fill="#6d4c41" stroke="#3e2723" stroke-width="2"/>
 <circle cx="454" cy="476" r="5" fill="#d7ccc8"/><circle cx="466" cy="476" r="5" fill="#d7ccc8"/><circle cx="478" cy="476" r="5" fill="#d7ccc8"/>
 <text class="tag label" x="466" y="452" text-anchor="middle">firewood rack</text>
</g>

<!-- 17. Folding Camp Chair (beside campfire) -->
<g class="obj" id="o-campchair" data-obj="campchair" data-base="508">
 <rect class="hit" x="592" y="455" width="60" height="58"/>
 <path d="M604 462 L638 462 L642 492 L600 492 Z" fill="#1976d2" stroke="#0d47a1" stroke-width="2"/>
 <line x1="604" y1="492" x2="600" y2="508" stroke="#455a64" stroke-width="2.5"/>
 <line x1="638" y1="492" x2="642" y2="508" stroke="#455a64" stroke-width="2.5"/>
 <text class="tag label" x="622" y="450" text-anchor="middle">folding camp chair</text>
</g>

<!-- 18. Bear-Proof Trash & Recycling Bin (near trailhead) -->
<g class="obj" id="o-campbin" data-obj="campbin" data-base="606">
 <rect class="hit" x="152" y="545" width="52" height="68"/>
 <rect x="160" y="556" width="36" height="48" rx="5" fill="#5d4037" stroke="#271c19" stroke-width="2.2"/>
 <rect x="158" y="550" width="40" height="9" rx="3" fill="#3e2723" stroke="#271c19" stroke-width="1.8"/>
 <text class="tag label" x="178" y="620" text-anchor="middle">bear-proof trash bin</text>
</g>

<!-- 19. Mountain Wildflowers Patch (front meadow) -->
<g class="obj" id="o-wildflowers" data-obj="wildflowers" data-base="618">
 <rect class="hit" x="235" y="572" width="100" height="56"/>
 <ellipse cx="285" cy="606" rx="44" ry="14" fill="#4caf50" opacity=".75"/>
 <circle cx="262" cy="598" r="6" fill="#ffeb3b" stroke="#f57f17" stroke-width="1.5"/>
 <circle cx="285" cy="594" r="6" fill="#ff80ab" stroke="#c51162" stroke-width="1.5"/>
 <circle cx="308" cy="600" r="6" fill="#ce93d8" stroke="#6a1b9a" stroke-width="1.5"/>
 <text class="tag label" x="285" y="630" text-anchor="middle">mountain wildflowers</text>
</g>

<!-- 20. Camp Water Pump (front meadow near cooler) -->
<g class="obj" id="o-waterpump" data-obj="waterpump" data-base="616">
 <rect class="hit" x="365" y="562" width="60" height="64"/>
 <ellipse cx="395" cy="614" rx="22" ry="7" fill="#78909c" stroke="#37474f" stroke-width="1.8"/>
 <rect x="390" y="574" width="10" height="38" rx="3" fill="#2e7d32" stroke="#1b5e20" stroke-width="1.8"/>
 <line x1="398" y1="582" x2="414" y2="594" stroke="#1b5e20" stroke-width="3" stroke-linecap="round"/>
 <text class="tag label" x="395" y="630" text-anchor="middle">camp water pump</text>
</g>

<!-- 21. Stargazing Telescope (back-center ridge) -->
<g class="obj" id="o-telescope" data-obj="telescope" data-base="362">
 <rect class="hit" x="515" y="288" width="70" height="78"/>
 <line x1="550" y1="322" x2="536" y2="358" stroke="#37474f" stroke-width="3"/>
 <line x1="550" y1="322" x2="550" y2="360" stroke="#37474f" stroke-width="3"/>
 <line x1="550" y1="322" x2="564" y2="358" stroke="#37474f" stroke-width="3"/>
 <rect x="532" y="304" width="38" height="12" rx="4" transform="rotate(-22 550 310)" fill="#eceff1" stroke="#263238" stroke-width="2"/>
 <text class="tag label" x="550" y="284" text-anchor="middle">stargazing telescope</text>
</g>

<!-- 22. Acoustic Camp Guitar (front-center by campfire) -->
<g class="obj" id="o-campguitar" data-obj="campguitar" data-base="620">
 <rect class="hit" x="488" y="568" width="70" height="60"/>
 <ellipse cx="518" cy="604" rx="16" ry="12" fill="#d88c46" stroke="#5d3a1a" stroke-width="2"/>
 <circle cx="518" cy="604" r="4" fill="#3e2723"/>
 <line x1="528" y1="596" x2="548" y2="578" stroke="#5d3a1a" stroke-width="4" stroke-linecap="round"/>
 <text class="tag label" x="524" y="632" text-anchor="middle">acoustic camp guitar</text>
</g>
`;

const OD_CSS=`
#room .od-tent-pitched,
#room .od-tent-zipped,
#room .od-lantern-glow,
#room .od-blanket-spread,
#room .od-cooler-juice,
#room .od-fire-wood,
#room .od-fire-flames,
#room .od-fire-glow,
#room .od-fire-out,
#room .od-pack-bottle{opacity:0;transition:opacity .28s ease,transform .35s ease}
#room.od-tent-up .od-tent-bag{opacity:0}
#room.od-tent-up .od-tent-pitched{opacity:1}
#room.od-tent-zip .od-tent-zipped{opacity:1}
#room.od-lantern-on .od-lantern-glow{opacity:1}
#room.od-lantern-on #o-camplantern .od-lantern-glass{fill:#fff59d}
#room.od-blanket-down .od-blanket-rolled{opacity:0}
#room.od-blanket-down .od-blanket-spread{opacity:1}
#room.od-sandwich-eaten .od-picnic-food{opacity:0}
#room.od-juice-out .od-cooler-juice{opacity:1}
#room.od-wood-ready .od-fire-wood{opacity:1}
#room.od-fire-lit .od-fire-wood,
#room.od-fire-lit .od-fire-flames,
#room.od-fire-lit .od-fire-glow{opacity:1}
#room.od-fire-flames-anim .od-fire-flames{animation:odFlicker .9s ease-in-out infinite alternate}
#room.od-fire-extinguished .od-fire-wood,
#room.od-fire-extinguished .od-fire-out{opacity:1}
#room.od-bottle-packed .od-pack-bottle{opacity:1}
#room.od-vest-worn .od-dock-vest{opacity:0}
#room.od-kayak-out .od-kayak-boat{transform:translate(876px,465px)}
@keyframes odFlicker{from{transform:scaleY(.94)}to{transform:scaleY(1.06)}}
`;

const OD_SPOTS={
 od_door:{x:96,y:604,d:1},
 od_trailhead:{x:112,y:582,d:-1},
 od_ranger:{x:198,y:454,d:-1},
 od_tent:{x:495,y:472,d:1},
 od_lantern:{x:608,y:472,d:1},
 od_picnic:{x:280,y:558,d:-1},
 od_picnic_seat:{x:268,y:532,d:1},
 od_cooler:{x:410,y:558,d:-1},
 od_firepit:{x:538,y:562,d:-1},
 od_backpack:{x:652,y:562,d:1},
 od_lookout:{x:342,y:368,d:1},
 od_dock:{x:742,y:494,d:1},
 od_hammock:{x:82,y:432,d:-1},
 od_grill:{x:325,y:472,d:-1},
 od_fishing:{x:712,y:582,d:1},
 od_firstaid:{x:252,y:448,d:-1},
 od_wildlife:{x:668,y:386,d:1},
 od_woodpile:{x:465,y:516,d:-1},
 od_chair:{x:612,y:522,d:-1},
 od_bin:{x:178,y:610,d:-1},
 od_flowers:{x:285,y:612,d:-1},
 od_pump:{x:395,y:612,d:-1},
 od_telescope:{x:548,y:378,d:1},
 od_guitar:{x:522,y:614,d:-1}
};

const OD_W0={
 od_map:"unread",
 od_rules:"unread",
 od_distance:"unchecked",
 od_brochure:"none",
 od_ranger:"none",
 od_weather:"unchecked",
 od_permit:"none",
 od_bears:"unasked",
 od_wind:"unchecked",
 od_whistle:"none",
 od_tent:"bag",
 od_tent_door:"open",
 od_stakes:"loose",
 od_sleeping_bag:"rolled",
 od_tent_aired:"no",
 od_lantern:"off",
 od_lantern_dim:"normal",
 od_lantern_charged:"no",
 od_lantern_hung:"no",
 od_lantern_off_done:"no",
 od_blanket:"rolled",
 od_picnic_sat:"no",
 od_watermelon:"whole",
 od_leftovers:"out",
 od_juice:"in_cooler",
 od_cooler_ice:"low",
 od_yogurt:"in_cooler",
 od_cooler_lid:"open",
 od_sandwich:"fresh",
 od_fire:"empty",
 od_marshmallow:"raw",
 od_hands_warm:"no",
 od_story_told:"no",
 od_bottle:"out",
 od_compass:"unchecked",
 od_straps:"loose",
 od_poncho:"out",
 od_flashlight:"in_bag",
 od_hiked:"no",
 od_binoculars:"no",
 od_photo:"no",
 od_air_breathed:"no",
 od_sketch:"no",
 od_vest:"dock",
 od_kayak:"docked",
 od_kayak_tied:"no",
 od_feet_dipped:"no",
 od_guide_tips:"no",
 od_packed:"no",
 od_hammock_tied:"no",
 od_hammock_rest:"no",
 od_hammock_book:"unread",
 od_hammock_swing:"no",
 od_hammock_untied:"no",
 od_stove:"off",
 od_kettle:"cold",
 od_corn:"raw",
 od_skewers:"raw",
 od_stove_off_done:"no",
 od_hook_baited:"no",
 od_line_cast:"no",
 od_trout:"in_lake",
 od_fish_released:"no",
 od_sunscreen:"none",
 od_bugspray:"none",
 od_bandaid:"none",
 od_firstaid_checked:"no",
 od_electrolyte:"none",
 od_wildlife_read:"no",
 od_squirrel:"unseen",
 od_birds_listened:"no",
 od_pinecone_photo:"no",
 od_logs_stacked:"no",
 od_wood_tarp:"off",
 od_kindling:"ground",
 od_bark_checked:"no",
 od_chair_open:"no",
 od_chair_sat:"no",
 od_cocoa:"full",
 od_chair_folded:"no",
 od_cans_sorted:"no",
 od_trash_binned:"no",
 od_bin_latched:"no",
 od_litter_picked:"no",
 od_flowers_smelled:"no",
 od_bee_watched:"no",
 od_flower_sketched:"no",
 od_flower_path:"careful",
 od_water_pumped:"no",
 od_hands_rinsed:"no",
 od_kettle_filled:"no",
 od_apples_washed:"no",
 od_scope_focused:"no",
 od_evening_star:"unseen",
 od_big_dipper:"unseen",
 od_lens_cleaned:"no",
 od_scope_capped:"no",
 od_guitar_tuned:"no",
 od_guitar_strummed:"no",
 od_camp_sung:"no",
 od_guitar_cased:"no"
};

function A(id,obj,label,labelVi,sentence,vi,keywords,also,grammarNote,chunks,disc,examples,pre,seq,vocab,extra){
 const vList=vocab&&vocab.length?vocab:[["camp","/kæmp/","trại dã ngoại"]];
 const wList=(extra&&extra.words)||vList.map(v=>v.length===4?v:[v[0],v[1],"n",v[2]]);
 const rawSeq=seq;
 const wrappedSeq=(W={},ctx)=>{
  const steps=rawSeq(W,ctx);
  if(ctx&&typeof ctx.set==="function"){
   for(const s of steps)if(Array.isArray(s)&&s[0]==="set")ctx.set(s[1],s[2]);
  }
  return steps;
 };
 const probeW={...OD_W0,sitting:false};
 const initSteps=rawSeq(probeW)||[];
 const changed=initSteps.filter(s=>Array.isArray(s)&&s[0]==="set"&&OD_W0[s[1]]!==s[2]);
 const lastSet=changed[changed.length-1]||initSteps.filter(s=>Array.isArray(s)&&s[0]==="set").pop();
 const doneFn=(extra&&extra.done)||(lastSet?(W=>W[lastSet[1]]===lastSet[2]):(W=>!!W.sitting));
 const discObj=Array.isArray(disc)?{ans:disc[0],opts:disc}:disc;
 const a={
  id,obj,room:"outdoor",label,labelVi,en:label,sentence,vi,viSent:vi,
  keywords,key:keywords,also:also||[],
  grammarNote,grammar:grammarNote,note:grammarNote,
  chunks,disc:discObj,examples,patterns:examples,
  pre,seq:wrappedSeq,done:doneFn,
  vocab:vList,words:wList,
  story:[label.toLowerCase(),label.toLowerCase(),labelVi.toLowerCase()]
 };
 if(extra)Object.assign(a,extra);
 if(!a.done)a.done=doneFn;
 if(!a.words)a.words=wList;
 return a;
}

function Q(id,obj,spot,poseName,stateKey,stateVal,label,labelVi,sentence,vi,keywords,grammarNote,chunks,discOpts,examples,vKeys,storyArr){
 return A(id,obj,label,labelVi,sentence,vi,keywords,[],grammarNote,chunks,{ans:discOpts[0],opts:discOpts},examples,
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),go(spot),pose(poseName,520),set(stateKey,stateVal),wait(280)],
  V(...vKeys),{words:W4(...vKeys),done:W=>W[stateKey]===stateVal,story:storyArr||[label.toLowerCase(),label.toLowerCase(),labelVi.toLowerCase()]});
}

function applyOutdoor(W,roomEl){
 if(!roomEl)return;
 roomEl.classList.toggle("od-tent-up",W.od_tent==="pitched");
 roomEl.classList.toggle("od-tent-zip",W.od_tent==="pitched"&&W.od_tent_door==="zipped");
 roomEl.classList.toggle("od-lantern-on",W.od_lantern==="on");
 roomEl.classList.toggle("od-blanket-down",W.od_blanket==="spread");
 roomEl.classList.toggle("od-sandwich-eaten",W.od_sandwich==="eaten");
 roomEl.classList.toggle("od-juice-out",W.od_juice==="taken");
 roomEl.classList.toggle("od-wood-ready",W.od_fire==="wood");
 roomEl.classList.toggle("od-fire-lit",W.od_fire==="lit");
 roomEl.classList.toggle("od-fire-flames-anim",W.od_fire==="lit");
 roomEl.classList.toggle("od-fire-extinguished",W.od_fire==="out");
 roomEl.classList.toggle("od-bottle-packed",W.od_bottle==="packed");
 roomEl.classList.toggle("od-vest-worn",W.od_vest==="wearing");
 roomEl.classList.toggle("od-kayak-out",W.od_kayak==="paddled");
}

const OD_PROPS={
 marshmallow_stick:`<g><line x1="0" y1="0" x2="26" y2="-16" stroke="#6b3e1b" stroke-width="2.5"/><rect x="22" y="-22" width="10" height="8" rx="3" fill="#fff8e7" stroke="#bcaaa4" stroke-width="1.2"/></g>`,
 binoculars:`<g><rect x="-8" y="-6" width="16" height="10" rx="3" fill="#2c3e50" stroke="#fff" stroke-width="1.2"/><circle cx="-4" cy="4" r="3.5" fill="#7ec8e3"/><circle cx="4" cy="4" r="3.5" fill="#7ec8e3"/></g>`,
 compass:`<g><circle cx="0" cy="0" r="8" fill="#fdf6e2" stroke="#b26a00" stroke-width="2"/><polygon points="0,-6 2,0 0,6 -2,0" fill="#e53935"/></g>`,
 juice_bottle:`<g><rect x="-5" y="-12" width="10" height="18" rx="3" fill="#ff9800" stroke="#e65100" stroke-width="1.4"/><rect x="-3" y="-16" width="6" height="4" fill="#2e7d32"/></g>`,
 sandwich:`<g><polygon points="-10,4 0,-8 10,4" fill="#f5d69b" stroke="#8d6e63" stroke-width="1.5"/><line x1="-8" y1="2" x2="8" y2="2" stroke="#4caf50" stroke-width="2"/></g>`,
 water_jug:`<g><rect x="-6" y="-12" width="12" height="18" rx="4" fill="#29b6f6" stroke="#0277bd" stroke-width="1.5"/></g>`,
 kayak_paddle:`<g><line x1="-18" y1="-10" x2="18" y2="10" stroke="#5d4037" stroke-width="3"/><rect x="14" y="6" width="10" height="6" rx="2" fill="#e53935" transform="rotate(28 19 9)"/></g>`
};

const OD_OBJECTS={
 trailhead:{en:"trail map board",vi:"bảng bản đồ đường mòn",ipa:"/treɪl mæp bɔːrd/",
  acts:["check_trail_map","pack_up_campsite","read_park_rules","measure_trail_distance","take_trail_brochure"]},
 rangerpost:{en:"ranger station",vi:"trạm kiểm lâm",ipa:"/ˈreɪndʒər ˈsteɪʃən/",
  acts:["ask_the_ranger","check_weather_board","register_campsite_permit","ask_about_bears","check_wind_speed","borrow_emergency_whistle"]},
 campsite:{en:"camping tent",vi:"lều cắm trại",ipa:"/ˈkæmpɪŋ tent/",
  acts:["set_up_the_tent","zip_up_tent","hammer_tent_stakes","unroll_sleeping_bag","air_out_the_tent"]},
 firepit:{en:"campfire ring",vi:"bếp lửa trại bằng đá",ipa:"/ˈkæmpfaɪər rɪŋ/",
  acts:["gather_dry_firewood","light_the_campfire","roast_marshmallows","put_out_campfire","warm_hands_by_fire","tell_campfire_stories"]},
 picnicspot:{en:"picnic blanket",vi:"thảm dã ngoại",ipa:"/ˈpɪknɪk ˈblæŋkɪt/",
  acts:["spread_picnic_blanket","sit_on_picnic_blanket","eat_picnic_sandwich","slice_fresh_watermelon","pack_leftover_food"]},
 cooler:{en:"cooler box",vi:"thùng đá dã ngoại",ipa:"/ˈkuːlər bɒks/",
  acts:["take_cold_juice","drink_cold_juice","add_ice_to_cooler","grab_yogurt_cup","close_cooler_tightly"]},
 backpack:{en:"hiking backpack",vi:"ba lô leo núi",ipa:"/ˈhaɪkɪŋ ˈbækpæk/",
  acts:["pack_water_bottle","check_the_compass","adjust_shoulder_straps","pack_rain_poncho","grab_flashlight_from_bag"]},
 lookout:{en:"scenic lookout",vi:"điểm ngắm cảnh trên đồi",ipa:"/ˈsiːnɪk ˈlʊkaʊt/",
  acts:["hike_to_lookout","use_binoculars","take_panoramic_photo","breathe_mountain_air","sketch_mountain_peaks"]},
 lakedock:{en:"wooden dock & kayak",vi:"bến thuyền & thuyền kayak",ipa:"/ˈwʊdən dɒk/",
  acts:["put_on_life_jacket","paddle_the_kayak","tie_kayak_to_dock","dip_feet_in_lake","ask_kayak_guide_tips"]},
 camplantern:{en:"camping lantern",vi:"đèn lồng cắm trại",ipa:"/ˈkæmpɪŋ ˈlæntərn/",
  acts:["turn_on_camp_lantern","adjust_lantern_brightness","recharge_solar_lantern","hang_lantern_on_hook","turn_off_camp_lantern"]},
 hammock:{en:"camping hammock",vi:"võng cắm trại",ipa:"/ˈkæmpɪŋ ˈhæmək/",
  acts:["tie_up_hammock","lie_in_hammock","read_book_in_hammock","swing_gently_in_hammock","untie_the_hammock"]},
 campgrill:{en:"portable camp stove",vi:"bếp nướng dã ngoại",ipa:"/ˈpɔːrtəbəl kæmp stoʊv/",
  acts:["turn_on_camp_stove","boil_kettle_for_tea","grill_corn_on_cob","flip_veggie_skewers","turn_off_camp_stove"]},
 fishingrod:{en:"fishing rod & tackle",vi:"cần câu cá & hộp đồ câu",ipa:"/ˈfɪʃɪŋ rɑːd/",
  acts:["bait_fishing_hook","cast_fishing_line","reel_in_trout","release_fish_into_lake"]},
 firstaid:{en:"first-aid kit",vi:"hộp sơ cứu y tế",ipa:"/ˌfɜːrst ˈeɪd kɪt/",
  acts:["apply_sunscreen_lotion","spray_bug_repellent","put_bandaid_on_scrape","check_first_aid_supplies","drink_electrolyte_water"]},
 wildlifesign:{en:"wildlife sign & nest",vi:"biển động vật & tổ chim",ipa:"/ˈwaɪldlaɪf saɪn/",
  acts:["read_wildlife_sign","spot_red_squirrel","listen_to_chirping_birds","photograph_pine_cones"]},
 woodpile:{en:"firewood rack",vi:"giá để củi khô",ipa:"/ˈfaɪərwʊd ræk/",
  acts:["stack_dry_logs","cover_woodpile_with_tarp","carry_kindling_twigs","check_dry_bark"]},
 campchair:{en:"folding camp chair",vi:"ghế xếp cắm trại",ipa:"/ˈfoʊldɪŋ kæmp tʃer/",
  acts:["unfold_camp_chair","sit_in_camp_chair","sip_hot_cocoa_in_chair","fold_up_camp_chair"]},
 campbin:{en:"bear-proof trash bin",vi:"thùng rác chống gấu",ipa:"/ˈberpruːf træʃ bɪn/",
  acts:["sort_recyclable_cans","throw_trash_in_bear_bin","latch_bear_proof_lid","pick_up_trail_litter"]},
 wildflowers:{en:"mountain wildflowers",vi:"bụi hoa dại trên núi",ipa:"/ˈmaʊntən ˈwaɪldflaʊərz/",
  acts:["smell_mountain_flowers","observe_honeybee_on_flower","sketch_wildflower_petals","avoid_stepping_on_flowers"]},
 waterpump:{en:"camp water pump",vi:"vòi bơm nước sạch",ipa:"/kæmp ˈwɔːtər pʌmp/",
  acts:["pump_fresh_spring_water","rinse_hands_at_pump","fill_camping_kettle","wash_fresh_apples"]},
 telescope:{en:"stargazing telescope",vi:"kính thiên văn ngắm sao",ipa:"/ˈstɑːrɡeɪzɪŋ ˈtelɪskoʊp/",
  acts:["focus_the_telescope","spot_evening_star","find_big_dipper","clean_telescope_lens","cover_telescope_cap"]},
 campguitar:{en:"acoustic camp guitar",vi:"đàn ghi-ta lửa trại",ipa:"/əˈkuːstɪk ɡɪˈtɑːr/",
  acts:["tune_acoustic_guitar","strum_campfire_song","sing_along_with_friends","put_guitar_in_case"]}
};

const ACTIONS=[
 // 1. Trailhead (2 existing + 3 new = 5)
 A("check_trail_map","trailhead","Check the trail map","Xem bản đồ đường mòn",
  "I'm checking the trail map before we start hiking.",
  "Tôi đang xem bản đồ đường mòn trước khi bắt đầu đi bộ leo núi.",
  ["checking","trail","map","hiking"],["Let's look at the trail map first."],
  "<b>before + mệnh đề (S + V)</b> hoặc <b>before + V-ing</b>: <i>before we start hiking</i> (trước khi chúng ta bắt đầu leo núi).",
  ["I'm checking","the trail map","before we start hiking."],{ans:"trail",opts:["trail","train","tail"]},
  ["Always check the <b>trail map</b> before hiking.","Which <b>trail</b> leads to the scenic lookout?"],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_trailhead"],["pose","read",550],["set","od_map","read"],["wait",300]],
  V("trail_map","trailhead","hike"),{story:["check the trail map","checked the trail map","xem bản đồ đường mòn"]}),

 A("pack_up_campsite","trailhead","Pack up the campsite","Thu dọn khu cắm trại (Leave No Trace)",
  "We're packing up our gear so we leave no trace.",
  "Chúng tôi đang thu dọn đồ đạc để không để lại dấu vết rác thải nào.",
  ["packing","gear","leave","trace"],["Always leave no trace when camping."],
  "Nguyên tắc dã ngoại văn minh: <b>leave no trace</b> = không để lại dấu vết / giữ nguyên vẹn thiên nhiên.",
  ["We're packing up","our gear","so we leave no trace."],{ans:"trace",opts:["trace","place","track"]},
  ["<b>Pack up</b> all your trash before leaving.","Good campers always <b>leave no trace</b>."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_trailhead"],["pose","reach",520],["set","od_packed","yes"],["set","od_tent","bag"],["set","od_blanket","rolled"],["wait",350]],
  V("trace","tent","backpack"),{story:["pack up the campsite","packed up the campsite cleanly","thu dọn sạch sẽ khu cắm trại"]}),

 Q("read_park_rules","trailhead","od_trailhead","read","od_rules","read","Read the park safety rules","Đọc nội quy an toàn khu rừng",
  "I'm reading the park safety rules at the trailhead.",
  "Tôi đang đọc nội quy an toàn của công viên ở ngay đầu đường mòn.",
  ["reading","safety","rules","trailhead"],"Giới từ <b>at the trailhead</b> = tại điểm khởi đầu đường mòn.",
  ["I'm reading","the park safety rules","at the trailhead."],["rules","roles","tools"],
  ["Please follow all <b>park safety rules</b>.","Read the notice <b>at the trailhead</b>."],["trailhead","trail_map"]),

 Q("measure_trail_distance","trailhead","od_trailhead","point","od_distance","measured","Check the trail distance","Xem khoảng cách đường mòn",
  "How far is the scenic lookout from the trailhead? It's two kilometers uphill.",
  "Điểm ngắm cảnh cách đầu đường mòn bao xa? Nó cách đây hai ki-lô-mét đường lên đồi.",
  ["far","lookout","trailhead","uphill"],"Mẫu câu hỏi khoảng cách: <b>How far is A from B?</b> (A cách B bao xa?).",
  ["How far is the lookout","from the trailhead?","It's two kilometers uphill."],["far","car","jar"],
  ["<b>How far is</b> the lake from here?","It's a short walk <b>uphill</b>."],["trailhead","lookout","hike"]),

 Q("take_trail_brochure","trailhead","od_trailhead","reach","od_brochure","taken","Take a trail guide brochure","Lấy tờ gấp hướng dẫn đường mòn",
  "I'm taking a free trail brochure from the wooden box.",
  "Tôi đang lấy một tờ gấp hướng dẫn đường mòn miễn phí từ hộp gỗ.",
  ["taking","free","trail","brochure"],"Tính từ <b>free</b> = miễn phí; <b>trail brochure</b> = tờ gấp hướng dẫn tuyến đường.",
  ["I'm taking","a free trail brochure","from the wooden box."],["free","tree","three"],
  ["Grab a <b>free brochure</b> at the gate.","This <b>trail map</b> shows all campsites."],["trail_map","trailhead"]),

 // 2. Ranger station (2 existing + 4 new = 6)
 A("ask_the_ranger","rangerpost","Ask the ranger about the trail","Hỏi kiểm lâm về đường mòn",
  "Excuse me, is the ridge trail safe to hike today?",
  "Xin lỗi, hôm nay đường mòn lên sống núi đi bộ có an toàn không ạ?",
  ["ridge","trail","safe","hike"],["Is the mountain trail open today?"],
  "Cấu trúc <b>Adj + to V</b>: <b>safe to hike</b> (an toàn để leo bộ).",
  ["Excuse me,","is the ridge trail","safe to hike today?"],{ans:"safe",opts:["safe","save","same"]},
  ["Is the trail <b>safe to hike</b> today?","Ask the <b>park ranger</b> for trail advice."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_ranger"],["pose","point",480],["set","od_ranger","asked"],["wait",380]],
  V("ranger","ranger_station","hike"),{story:["ask the park ranger about the trail","asked the park ranger about the trail","hỏi kiểm lâm về đường mòn"]}),

 A("check_weather_board","rangerpost","Check the mountain weather","Xem bảng dự báo thời tiết núi",
  "The weather board says clear skies and a light breeze all afternoon.",
  "Bảng thời tiết báo trời quang mây tạnh và có gió nhẹ suốt buổi chiều.",
  ["weather","clear","skies","breeze"],["What's the mountain weather forecast?"],
  "Cụm từ thời tiết đẹp khi đi dã ngoại: <b>clear skies</b> (trời quang) và <b>a light breeze</b> (gió nhẹ).",
  ["The weather board says","clear skies","and a light breeze."],{ans:"breeze",opts:["breeze","freeze","trees"]},
  ["We have <b>clear skies</b> for our hike today.","Enjoy the cool mountain <b>breeze</b>."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_ranger"],["pose","read",500],["set","od_weather","checked"],["wait",300]],
  V("ranger_station","breeze"),{story:["check the mountain weather board","checked the mountain weather board","xem bảng thời tiết trên núi"]}),

 Q("register_campsite_permit","rangerpost","od_ranger","reach","od_permit","registered","Register a camping permit","Đăng ký giấy phép cắm trại",
  "Excuse me, do we need a permit to camp overnight in Pine Valley?",
  "Xin lỗi, chúng tôi có cần giấy phép để cắm trại qua đêm ở Thung lũng Thông không ạ?",
  ["permit","camp","overnight"],"Trạng từ <b>overnight</b> = qua đêm; <b>camping permit</b> = giấy phép cắm trại.",
  ["Do we need a permit","to camp overnight","in Pine Valley?"],["permit","planet","pocket"],
  ["We registered our <b>camping permit</b> at the station.","Are you staying <b>overnight</b>?"],["permit","ranger_station"]),

 Q("ask_about_bears","rangerpost","od_ranger","point","od_bears","asked","Ask about wildlife safety","Hỏi về an toàn động vật hoang dã",
  "Are there any wild bears near the campground, Ranger?",
  "Có con gấu hoang nào ở gần khu cắm trại không vậy chú kiểm lâm?",
  ["wild","bears","campground","Ranger"],"Câu hỏi tồn tại số nhiều: <b>Are there any + danh từ số nhiều...?</b>",
  ["Are there any","wild bears","near the campground?"],["bears","pears","ears"],
  ["<b>Are there any</b> deer on this trail?","Keep food locked away from <b>wildlife</b>."],["wildlife","ranger"]),

 Q("check_wind_speed","rangerpost","od_ranger","read","od_wind","checked","Check the wind and temperature","Xem tốc độ gió và nhiệt độ",
  "It's sunny and twenty degrees now, but it'll get chilly tonight.",
  "Bây giờ trời nắng và hai mươi độ, nhưng tối nay trời sẽ trở nên se lạnh đấy.",
  ["sunny","degrees","chilly","tonight"],"Tính từ thời tiết: <b>chilly</b> = se lạnh (lạnh nhẹ dễ chịu hoặc cần áo khoác mỏng).",
  ["It's sunny now,","but it'll get chilly","tonight."],["chilly","chili","silly"],
  ["Put on a sweater when it gets <b>chilly</b>.","The mountain <b>breeze</b> feels cool."],["breeze","ranger_station"]),

 Q("borrow_emergency_whistle","rangerpost","od_ranger","reach","od_whistle","borrowed","Get a safety whistle","Nhận còi cứu hộ an toàn",
  "I'm clipping a loud safety whistle onto my backpack strap.",
  "Tôi đang kẹp một chiếc còi cứu hộ kêu to lên quai ba lô của mình.",
  ["clipping","loud","safety","whistle"],"<b>clip A onto B</b> = kẹp/móc vật A lên vật B; <b>safety whistle</b> = còi báo hiệu an toàn.",
  ["I'm clipping","a loud safety whistle","onto my backpack strap."],["whistle","whisper","thistle"],
  ["Blow your <b>whistle</b> three times if you get lost.","Carry a <b>safety whistle</b> when hiking."],["whistle","backpack"]),

 // 3. Camping tent (2 existing + 3 new = 5)
 A("set_up_the_tent","campsite","Set up the camping tent","Dựng lều cắm trại",
  "I'm pitching our camping tent on flat ground.",
  "Tôi đang dựng lều cắm trại trên mặt đất bằng phẳng.",
  ["pitching","camping","tent","flat"],["Let's set up the tent here."],
  "Khi dựng lều, người bản xứ dùng cả <b>pitch a tent</b> lẫn <b>set up a tent</b>; <b>on flat ground</b> = trên mặt đất bằng phẳng.",
  ["I'm pitching","our camping tent","on flat ground."],{ans:"pitching",opts:["pitching","picking","catching"]},
  ["We <b>pitched our tent</b> near the pine trees.","Find some <b>flat ground</b> to set up the tent."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_tent"],["pose","sweep",650],["set","od_tent","pitched"],["set","od_tent_door","open"],["wait",380]],
  V("tent","pitch"),{story:["pitch the camping tent on flat ground","pitched the camping tent on flat ground","dựng lều cắm trại trên mặt đất bằng phẳng"]}),

 A("zip_up_tent","campsite","Zip up the tent door","Kéo khoá cửa lều",
  "I'm zipping up the tent door to keep bugs out.",
  "Tôi đang kéo khoá cửa lều lại để ngăn côn trùng bay vào.",
  ["zipping","tent","bugs"],["Remember to zip up the tent flap."],
  "<b>zip up</b> = kéo khoá kín lại; <b>keep bugs/mosquitoes out</b> = ngăn côn trùng/muỗi bay vào.",
  ["I'm zipping up","the tent door","to keep bugs out."],{ans:"bugs",opts:["bugs","bags","mugs"]},
  ["<b>Zip up</b> the tent so mosquitoes don't get in.","This mesh screen <b>keeps bugs out</b>."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_tent"],["pose","reach",450],["set","od_tent","pitched"],["set","od_tent_door","zipped"],["wait",300]],
  V("tent"),{done:W=>W.od_tent_door==="zipped",story:["zip up the tent door","zipped up the tent door","kéo khoá kín cửa lều"]}),

 Q("hammer_tent_stakes","campsite","od_tent","bend","od_stakes","hammered","Hammer the tent stakes","Đóng cọc ghim giữ lều",
  "I'm hammering the metal tent stakes firmly into the ground.",
  "Tôi đang đóng những chiếc cọc ghim lều bằng kim loại thật chắc xuống đất.",
  ["hammering","metal","stakes","firmly"],"Trạng từ <b>firmly</b> = một cách chắc chắn, vững vàng.",
  ["I'm hammering","the metal tent stakes","firmly into the ground."],["stakes","snakes","cakes"],
  ["Secure the <b>tent stakes</b> before it gets windy.","The tent stands <b>firmly</b> on the grass."],["stake","tent"]),

 Q("unroll_sleeping_bag","campsite","od_tent","reach","od_sleeping_bag","unrolled","Unroll the warm sleeping bag","Trải túi ngủ ấm áp trong lều",
  "I'm unrolling my warm sleeping bag inside the waterproof tent.",
  "Tôi đang trải chiếc túi ngủ ấm áp của mình bên trong chiếc lều chống thấm nước.",
  ["unrolling","warm","sleeping","waterproof"],"Tính từ <b>waterproof</b> = chống thấm nước; <b>unroll</b> = mở cuộn/trải ra.",
  ["I'm unrolling","my warm sleeping bag","inside the waterproof tent."],["waterproof","waterfront","waterfall"],
  ["My <b>sleeping bag</b> keeps me warm at night.","This tent has a <b>waterproof</b> rainfly."],["sleeping_bag","waterproof","tent"]),

 Q("air_out_the_tent","campsite","od_tent","sweep","od_tent_aired","yes","Open the tent vents for fresh air","Mở cửa thoáng khí cho lều",
  "I'm opening the mesh window to let fresh air into the tent.",
  "Tôi đang mở cửa lưới để đón không khí trong lành vào trong lều.",
  ["opening","mesh","fresh","tent"],"Cấu trúc <b>let + tân ngữ + into...</b> = cho phép cái gì tràn vào.",
  ["I'm opening the mesh window","to let fresh air","into the tent."],["fresh","flash","flesh"],
  ["Open the flap to <b>air out the tent</b>.","The pine breeze brings <b>fresh air</b> inside."],["tent","breeze"]),

 // 4. Campfire ring (4 existing + 2 new = 6)
 A("gather_dry_firewood","firepit","Gather dry firewood","Gom củi khô",
  "I'm collecting some dry firewood for our campfire.",
  "Tôi đang gom một ít củi khô cho bếp lửa trại của chúng tôi.",
  ["collecting","dry","firewood","campfire"],["Let's gather some dry wood for the fire."],
  "<b>firewood</b> (củi đốt) là danh từ không đếm được: dùng <b>some dry firewood</b> (không thêm -s).",
  ["I'm collecting","some dry firewood","for our campfire."],{ans:"firewood",opts:["firewood","firework","plywood"]},
  ["We need <b>some dry firewood</b> before sunset.","Stack the <b>firewood</b> inside the stone ring."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_firepit"],["pose","reach",550],["set","od_fire","wood"],["wait",350]],
  V("firewood","campfire"),{story:["gather some dry firewood","gathered some dry firewood","gom củi khô cho bếp lửa trại"]}),

 A("light_the_campfire","firepit","Light the campfire","Nhóm lửa trại",
  "I'm lighting a warm campfire inside the stone ring.",
  "Tôi đang nhóm một bếp lửa trại ấm áp bên trong vòng đá.",
  ["lighting","warm","campfire","stone"],["Let's light the campfire now."],
  "<b>light a fire / campfire</b> (quá khứ: <b>lit</b>) = nhóm lửa trại.",
  ["I'm lighting","a warm campfire","inside the stone ring."],{ans:"campfire",opts:["campfire","campground","camper"]},
  ["We <b>lit a warm campfire</b> as evening fell.","Sit around the <b>campfire</b> to stay warm."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),...(W.od_fire==="empty"?[["set","od_fire","wood"]]:[]),["walk","od_firepit"],["pose","pour",580],["set","od_fire","lit"],["wait",400]],
  V("campfire","firewood"),{done:W=>W.od_fire==="lit",story:["light a warm campfire","lit a warm campfire","nhóm bếp lửa trại ấm áp"]}),

 A("roast_marshmallows","firepit","Roast marshmallows","Nướng kẹo marshmallow",
  "I'm roasting a marshmallow over the glowing campfire.",
  "Tôi đang nướng một viên kẹo dẻo marshmallow trên bếp lửa trại rực hồng.",
  ["roasting","marshmallow","campfire"],["These toasted marshmallows are golden brown!"],
  "<b>roast + món ăn + over the campfire</b> = nướng trên ngọn lửa trại.",
  ["I'm roasting","a marshmallow","over the glowing campfire."],{ans:"roasting",opts:["roasting","boasting","coasting"]},
  ["Let's <b>roast marshmallows</b> over the fire!","My <b>marshmallow</b> is golden and gooey."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_firepit"],["spawn","marshmallow_stick"],["pose","pour",700],["set","od_fire","lit"],["set","od_marshmallow","roasted"],["despawn"],["wait",350]],
  V("marshmallow","roast","campfire"),{done:W=>W.od_marshmallow==="roasted",story:["roast marshmallows over the campfire","roasted marshmallows over the campfire","nướng kẹo marshmallow trên lửa trại"]}),

 A("put_out_campfire","firepit","Put out the campfire safely","Dập lửa trại an toàn",
  "I'm pouring water on the embers to put the campfire completely out.",
  "Tôi đang dội nước lên than hồng để dập tắt hoàn toàn bếp lửa trại.",
  ["pouring","water","embers","put","out"],["Always put out your campfire before leaving."],
  "Cụm động từ <b>put out a fire</b> = dập lửa; <b>embers</b> = than hồng còn âm ỉ.",
  ["I'm pouring water","on the embers","to put the campfire out."],{ans:"embers",opts:["embers","members","numbers"]},
  ["Pour water to <b>put out the campfire</b>.","Make sure the <b>embers</b> are cold to the touch."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_firepit"],["spawn","water_jug"],["pose","pour",620],["set","od_fire","out"],["despawn"],["wait",350]],
  V("embers","campfire"),{done:W=>W.od_fire==="out",story:["put out the campfire safely","put out the campfire safely","dập lửa trại an toàn"]}),

 Q("warm_hands_by_fire","firepit","od_firepit","reach","od_hands_warm","yes","Warm hands by the campfire","Hơ ấm đôi tay bên bếp lửa",
  "My fingers feel cold, so I'm warming my hands by the crackling fire.",
  "Ngón tay tôi hơi lạnh nên tôi đang hơ ấm đôi tay bên bếp lửa tí tách.",
  ["cold","warming","hands","crackling"],"Tính từ <b>crackling</b> = nổ tí tách (tiếng củi khô cháy).",
  ["My fingers feel cold,","so I'm warming my hands","by the crackling fire."],["warming","warning","walking"],
  ["Come <b>warm your hands</b> by the campfire.","I love the sound of a <b>crackling fire</b>."],["campfire","embers"]),

 Q("tell_campfire_stories","firepit","od_firepit","point","od_story_told","yes","Tell stories around the campfire","Kể chuyện bên bếp lửa trại",
  "We're sitting on the log bench and telling funny stories around the campfire.",
  "Chúng tôi đang ngồi trên ghế gỗ tròn và kể những câu chuyện vui quanh bếp lửa trại.",
  ["sitting","telling","funny","campfire"],"Collocation: <b>tell a story / tell stories</b> (kể chuyện).",
  ["We're sitting on the log","and telling funny stories","around the campfire."],["stories","stores","storms"],
  ["Grandpa <b>told funny stories</b> around the campfire.","Everyone laughed at the <b>camping story</b>."],["campfire","firewood"]),

 // 5. Picnic blanket (3 existing + 2 new = 5)
 A("spread_picnic_blanket","picnicspot","Spread the picnic blanket","Trải thảm dã ngoại",
  "Let's spread the picnic blanket on the soft grass.",
  "Hãy trải tấm thảm dã ngoại lên bãi cỏ mềm nhé.",
  ["spread","picnic","blanket","grass"],["Spread out the blanket under the trees."],
  "Động từ <b>spread</b> (trải ra) có 3 dạng nguyên mẫu – quá khứ – phân từ giống hệt nhau: <b>spread – spread – spread</b>.",
  ["Let's spread","the picnic blanket","on the soft grass."],{ans:"blanket",opts:["blanket","basket","bracket"]},
  ["We <b>spread the picnic blanket</b> by the lake.","Come sit on the <b>picnic blanket</b>."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_picnic"],["pose","sweep",520],["set","od_blanket","spread"],["wait",320]],
  V("picnic_blanket"),{story:["spread the picnic blanket on the grass","spread the picnic blanket on the grass","trải thảm dã ngoại lên bãi cỏ"]}),

 A("sit_on_picnic_blanket","picnicspot","Sit on the picnic blanket","Ngồi trên thảm dã ngoại",
  "I'm sitting on the picnic blanket and enjoying the mountain view.",
  "Tôi đang ngồi trên thảm dã ngoại và tận hưởng khung cảnh núi đồi.",
  ["sitting","picnic","blanket","view"],["Relax on the picnic blanket."],
  "<b>enjoy + danh từ / V-ing</b> = tận hưởng điều gì (<i>enjoy the mountain view</i>).",
  ["I'm sitting","on the picnic blanket","and enjoying the view."],{ans:"view",opts:["view","few","new"]},
  ["Let's sit on the <b>picnic blanket</b> and relax.","The mountain <b>view</b> from here is breathtaking."],
  ()=>null,
  W=>[...(W.od_blanket!=="spread"?[["set","od_blanket","spread"]]:[]),["walk","od_picnic_seat"],["sit"],["set","od_picnic_sat","yes"],["wait",350]],
  V("picnic_blanket"),{sitOk:true,done:W=>W.od_picnic_sat==="yes",story:["sit down on the picnic blanket","sat down on the picnic blanket","ngồi xuống thảm dã ngoại"]}),

 A("eat_picnic_sandwich","picnicspot","Eat a homemade sandwich","Ăn bánh mì kẹp dã ngoại",
  "This homemade sandwich tastes even better in the fresh air!",
  "Chiếc bánh mì kẹp tự làm này ăn giữa không khí trong lành lại càng ngon hơn!",
  ["homemade","sandwich","tastes","fresh"],["Let's eat our picnic sandwiches."],
  "<b>taste + tính từ / so sánh hơn</b>: <b>tastes even better</b> (có vị còn ngon hơn nữa).",
  ["This homemade sandwich","tastes even better","in the fresh air!"],{ans:"sandwich",opts:["sandwich","sandals","salad"]},
  ["I packed a <b>homemade sandwich</b> for lunch.","Food always <b>tastes better</b> outdoors!"],
  ()=>null,
  W=>[...(W.od_blanket!=="spread"?[["set","od_blanket","spread"]]:[]),...(W.sitting?[]:[["walk","od_picnic"]]),["spawn","sandwich"],["pose","drink",650],["set","od_sandwich","eaten"],["despawn"],["wait",300]],
  V("sandwich","picnic_blanket"),{sitOk:true,done:W=>W.od_sandwich==="eaten",story:["eat a homemade picnic sandwich","ate a homemade picnic sandwich","ăn bánh mì kẹp dã ngoại"]}),

 Q("slice_fresh_watermelon","picnicspot","od_picnic","pour","od_watermelon","sliced","Slice sweet watermelon","Cắt dưa hấu ngọt mát",
  "I'm slicing some sweet, juicy watermelon for our picnic dessert.",
  "Tôi đang cắt vài miếng dưa hấu ngọt mọng nước làm món tráng miệng dã ngoại.",
  ["slicing","sweet","juicy","watermelon"],"Hai tính từ miêu tả trái cây ngon: <b>sweet and juicy</b> (ngọt và mọng nước).",
  ["I'm slicing","some sweet, juicy watermelon","for our picnic dessert."],["juicy","juice","noisy"],
  ["This red watermelon is so <b>sweet and juicy</b>!","Would you like a slice of <b>watermelon</b>?"],["picnic_blanket","refreshing"]),

 Q("pack_leftover_food","picnicspot","od_picnic","reach","od_leftovers","packed","Pack away leftover food","Cất thức ăn thừa vào hộp kín",
  "I'm putting our leftover food into sealed containers inside the basket.",
  "Tôi đang cất phần thức ăn còn dư vào các hộp đậy kín bên trong giỏ mây.",
  ["putting","leftover","sealed","containers"],"<b>leftover food / leftovers</b> = thức ăn còn dư sau bữa ăn.",
  ["I'm putting","our leftover food","into sealed containers."],["leftover","turnover","pullover"],
  ["Never leave <b>leftover food</b> out at a campsite."," Seal the <b>containers</b> tightly."],["picnic_blanket","sandwich"]),

 // 6. Cooler box (2 existing + 3 new = 5)
 A("take_cold_juice","cooler","Grab a cold fruit juice","Lấy nước trái cây mát lạnh",
  "I'm grabbing a cold bottle of orange juice from the cooler.",
  "Tôi đang lấy một chai nước cam mát lạnh từ trong thùng đá.",
  ["grabbing","cold","juice","cooler"],["Keep the drinks cold in the cooler."],
  "<b>grab + đồ vật + from...</b> = lấy nhanh món gì từ đâu (thân mật, tự nhiên hơn <i>take</i>).",
  ["I'm grabbing","a cold bottle of juice","from the cooler."],{ans:"cooler",opts:["cooler","collar","color"]},
  ["There's cold juice inside the <b>cooler</b>.","<b>Grab</b> a drink if you're thirsty!"],
  ()=>null,
  W=>[...(W.sitting?[]:[["walk","od_cooler"]]),["pose","reach",460],["set","od_juice","taken"],["wait",300]],
  V("cooler"),{sitOk:true,story:["grab a cold juice from the cooler","grabbed a cold juice from the cooler","lấy chai nước trái cây mát từ thùng đá"]}),

 A("drink_cold_juice","cooler","Drink the cold juice","Uống nước trái cây mát",
  "I'm drinking some chilled orange juice after our walk.",
  "Tôi đang uống một ít nước cam ướp lạnh sau chuyến đi bộ.",
  ["drinking","chilled","orange","juice"],["This cold juice is so refreshing."],
  "<b>chilled</b> = được ướp lạnh vừa phải, rất hay dùng cho đồ uống dã ngoại.",
  ["I'm drinking","some chilled orange juice","after our walk."],{ans:"chilled",opts:["chilled","child","filled"]},
  ["Have some <b>chilled orange juice</b>.","Cold fruit <b>juice</b> hits the spot on a sunny day."],
  ()=>null,
  W=>[...(W.od_juice==="in_cooler"?[["set","od_juice","taken"]]:[]),...(W.sitting?[]:[["walk","od_cooler"]]),["spawn","juice_bottle"],["pose","drink",620],["set","od_juice","drunk"],["despawn"],["wait",280]],
  V("cooler","refreshing"),{sitOk:true,done:W=>W.od_juice==="drunk",story:["drink the chilled orange juice","drank the chilled orange juice","uống nước cam ướp lạnh"]}),

 Q("add_ice_to_cooler","cooler","od_cooler","pour","od_cooler_ice","full","Put ice packs in the cooler","Bỏ thêm đá lạnh vào thùng giữ nhiệt",
  "I'm adding fresh ice packs to keep our drinks cold all day.",
  "Tôi đang bỏ thêm túi đá lạnh để giữ cho đồ uống mát suốt cả ngày.",
  ["adding","ice","keep","cold"],"Cấu trúc <b>keep + tân ngữ + tính từ</b>: <i>keep our drinks cold</i> (giữ đồ uống lạnh).",
  ["I'm adding","fresh ice packs","to keep our drinks cold."],["cooler","ruler","color"],
  ["The ice packs <b>keep the food cold</b>.","Is there enough ice in the <b>cooler</b>?"],["cooler","refreshing"]),

 Q("grab_yogurt_cup","cooler","od_cooler","reach","od_yogurt","taken","Take a chilled fruit yogurt","Lấy hũ sữa chua trái cây mát",
  "Would you like a cup of cold strawberry yogurt from the cooler?",
  "Bạn có muốn ăn một hũ sữa chua dâu mát lạnh lấy từ thùng đá không?",
  ["Would","cold","strawberry","yogurt"],"Lời mời lịch sự: <b>Would you like + danh từ...?</b> (Bạn dùng ... nhé?).",
  ["Would you like","a cup of cold yogurt","from the cooler?"],["yogurt","younger","yellow"],
  ["<b>Would you like</b> some cold fruit?","I love eating <b>chilled yogurt</b> on a warm day."],["cooler","refreshing"]),

 Q("close_cooler_tightly","cooler","od_cooler","bend","od_cooler_lid","latched","Close the cooler lid tightly","Đậy chặt nắp thùng giữ lạnh",
  "I'm shutting the cooler lid tightly so the ice doesn't melt.",
  "Tôi đang đóng chặt nắp thùng đá để đá bên trong không bị tan.",
  ["shutting","cooler","lid","melt"],"Liên từ chỉ mục đích: <b>so (that) + S + V</b> (để mà...): <i>so the ice doesn't melt</i>.",
  ["I'm shutting","the cooler lid tightly","so the ice doesn't melt."],["melt","belt","felt"],
  ["Close the lid so the ice <b>doesn't melt</b>.","Latch the <b>cooler</b> tightly."],["cooler"]),

 // 7. Hiking backpack (2 existing + 3 new = 5)
 A("pack_water_bottle","backpack","Pack a full water bottle","Cất bình nước vào ba lô",
  "I'm putting a full water bottle into my hiking backpack.",
  "Tôi đang cất một bình nước đầy vào trong chiếc ba lô leo núi của mình.",
  ["putting","water","bottle","backpack"],["Always bring enough water when hiking."],
  "<b>put + vật + into + nơi chứa</b>: cất/bỏ vật gì vào trong ba lô.",
  ["I'm putting","a full water bottle","into my hiking backpack."],{ans:"backpack",opts:["backpack","backyard","background"]},
  ["Pack extra water in your <b>hiking backpack</b>.","My <b>water bottle</b> fits in the side pocket."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_backpack"],["pose","reach",480],["set","od_bottle","packed"],["wait",300]],
  V("backpack"),{story:["pack a water bottle into my backpack","packed a water bottle into my backpack","cất bình nước vào ba lô leo núi"]}),

 A("check_the_compass","backpack","Check the compass","Xem la bàn định hướng",
  "I'm checking my compass to make sure we head north.",
  "Tôi đang xem la bàn để chắc chắn rằng chúng ta đi về hướng bắc.",
  ["checking","compass","north"],["The compass needle points north."],
  "<b>head + hướng (north/south/uphill)</b> = tiến về hướng nào.",
  ["I'm checking my compass","to make sure","we head north."],{ans:"compass",opts:["compass","campus","compare"]},
  ["Use a <b>compass</b> and map on mountain trails.","We're <b>heading north</b> toward the ridge."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_backpack"],["spawn","compass"],["pose","read",540],["set","od_compass","checked"],["despawn"],["wait",280]],
  V("compass","backpack"),{story:["check the compass direction","checked the compass direction","xem la bàn định hướng"]}),

 Q("adjust_shoulder_straps","backpack","od_backpack","reach","od_straps","adjusted","Adjust the backpack straps","Chỉnh lại quai đeo ba lô",
  "I'm tightening my backpack straps so my shoulders don't ache.",
  "Tôi đang chỉnh chặt lại quai đeo ba lô để hai vai không bị mỏi.",
  ["tightening","backpack","straps","shoulders"],"Từ vựng sức khỏe: <b>ache</b> (/eɪk/) = đau mỏi âm ỉ (<i>my shoulders ache</i>).",
  ["I'm tightening","my backpack straps","so my shoulders don't ache."],["straps","steps","stamps"],
  ["Adjust the <b>shoulder straps</b> before a long hike.","A heavy <b>backpack</b> can make your back ache."],["backpack","hike"]),

 Q("pack_rain_poncho","backpack","od_backpack","reach","od_poncho","packed","Pack a waterproof rain poncho","Xếp áo mưa vào ba lô",
  "I'm packing a lightweight rain poncho in case it rains on the mountain.",
  "Tôi đang cất một chiếc áo mưa mỏng nhẹ vào ba lô phòng khi trời mưa trên núi.",
  ["packing","lightweight","poncho","rains"],"Cấu trúc phòng ngừa thời tiết: <b>in case + S + V</b> (phòng khi...): <i>in case it rains</i>.",
  ["I'm packing","a lightweight rain poncho","in case it rains."],["poncho","piano","potato"],
  ["Bring a <b>rain poncho</b> in case it rains.","Mountain weather can change quickly!"],["poncho","waterproof","backpack"]),

 Q("grab_flashlight_from_bag","backpack","od_backpack","reach","od_flashlight","ready","Take out the LED flashlight","Lấy đèn pin từ ngăn trước ba lô",
  "I'm taking my bright LED flashlight out of the front pocket.",
  "Tôi đang lấy chiếc đèn pin LED siêu sáng ra khỏi ngăn túi trước.",
  ["taking","bright","flashlight","pocket"],"<b>in the front/side pocket</b> = ở trong ngăn trước/ngăn bên hông.",
  ["I'm taking","my bright LED flashlight","out of the front pocket."],["flashlight","flight","sunlight"],
  ["Keep a <b>flashlight</b> handy after sunset.","Check the batteries in your <b>flashlight</b>."],["flashlight","backpack"]),

 // 8. Scenic lookout (2 existing + 3 new = 5)
 A("hike_to_lookout","lookout","Hike up to the lookout","Leo lên điểm ngắm cảnh",
  "We're hiking up the dirt trail to the scenic lookout.",
  "Chúng tôi đang đi bộ leo theo đường mòn lên điểm ngắm cảnh trên đồi.",
  ["hiking","trail","scenic","lookout"],["The hike up to the lookout takes ten minutes."],
  "<b>hike up to + địa điểm</b> = đi bộ leo lên tới điểm nào.",
  ["We're hiking up","the dirt trail","to the scenic lookout."],{ans:"lookout",opts:["lookout","logout","workout"]},
  ["Let's <b>hike up to the scenic lookout</b>!","The view from the <b>lookout</b> is worth the climb."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_lookout"],["pose","point",520],["set","od_hiked","yes"],["wait",350]],
  V("hike","lookout"),{story:["hike up to the scenic lookout","hiked up to the scenic lookout","leo lên điểm ngắm cảnh trên đồi"]}),

 A("use_binoculars","lookout","Look through the binoculars","Nhìn qua ống nhòm",
  "Wow, I can see the whole pine valley through these binoculars!",
  "Chà, tôi có thể nhìn thấy toàn bộ thung lũng thông qua chiếc ống nhòm này!",
  ["valley","through","binoculars"],["Look at the mountain peaks through the binoculars."],
  "<b>binoculars</b> (ống nhòm) luôn ở dạng số nhiều (gồm 2 ống kính), đi với <b>these / those binoculars</b>.",
  ["I can see","the whole pine valley","through these binoculars!"],{ans:"binoculars",opts:["binoculars","bicycles","calendars"]},
  ["Look <b>through these binoculars</b> at the eagle!","Can I borrow your <b>binoculars</b> for a second?"],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_lookout"],["spawn","binoculars"],["pose","read",650],["set","od_binoculars","yes"],["despawn"],["wait",320]],
  V("binoculars","lookout"),{story:["look through the binoculars at the valley","looked through the binoculars at the valley","nhìn ngắm thung lũng qua ống nhòm"]}),

 Q("take_panoramic_photo","lookout","od_lookout","point","od_photo","taken","Take a panoramic mountain photo","Chụp ảnh toàn cảnh núi đồi",
  "The mountain view is breathtaking! Let's take a panoramic photo here.",
  "Khung cảnh núi non đẹp ngoạn mục quá! Hãy chụp một bức ảnh toàn cảnh ở đây nhé.",
  ["mountain","breathtaking","panoramic","photo"],"Tính từ <b>breathtaking</b> (/ˈbreθteɪkɪŋ/) = đẹp đến nghẹt thở / đẹp ngoạn mục.",
  ["The mountain view","is breathtaking!","Let's take a photo here."],["breathtaking","breakfast","breaking"],
  ["The sunset from the ridge is <b>breathtaking</b>!","Smile for our <b>mountain photo</b>!"],["lookout","breathtaking"]),

 Q("breathe_mountain_air","lookout","od_lookout","idle","od_air_breathed","yes","Breathe the crisp mountain air","Hít thở không khí núi rừng trong lành",
  "I'm taking a deep breath of the crisp, pine-scented mountain air.",
  "Tôi đang hít một hơi thật sâu bầu không khí miền núi trong lành thoang thoảng hương thông.",
  ["deep","breath","crisp","mountain"],"<b>take a deep breath</b> = hít một hơi thật sâu; <b>crisp air</b> = không khí mát lành, tinh khiết.",
  ["I'm taking","a deep breath","of the crisp mountain air."],["breath","bread","break"],
  ["<b>Take a deep breath</b> and relax.","The morning air is <b>crisp and refreshing</b>."],["lookout","refreshing","breeze"]),

 Q("sketch_mountain_peaks","lookout","od_lookout","read","od_sketch","drawn","Sketch the snow-capped peaks","Vẽ phác thảo những đỉnh núi tuyết",
  "I'm sketching the distant snow-capped peaks in my travel journal.",
  "Tôi đang vẽ phác thảo những đỉnh núi phủ tuyết xa xa vào sổ nhật ký hành trình.",
  ["sketching","distant","snow-capped","peaks"],"Tính từ ghép <b>snow-capped</b> = có đỉnh phủ tuyết trắng.",
  ["I'm sketching","the snow-capped peaks","in my travel journal."],["peaks","parks","beaks"],
  ["Look at those <b>snow-capped peaks</b> in the distance.","She drew a quick <b>sketch</b> of the valley."],["lookout","hike"]),

 // 9. Wooden dock & kayak (2 existing + 3 new = 5)
 A("put_on_life_jacket","lakedock","Put on a life jacket","Mặc áo phao",
  "I'm putting on a life jacket before getting into the kayak.",
  "Tôi đang mặc áo phao trước khi bước xuống thuyền kayak.",
  ["putting","life","jacket","kayak"],["Fasten your life jacket tightly."],
  "Cụm động từ <b>put on + trang phục/đồ bảo hộ</b> = mặc vào (<i>put on a life jacket</i>).",
  ["I'm putting on","a life jacket","before getting into the kayak."],{ans:"jacket",opts:["jacket","racket","packet"]},
  ["Everyone must wear a <b>life jacket</b> on the lake.","<b>Put on</b> your life vest and buckle it up."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_dock"],["pose","reach",500],["set","od_vest","wearing"],["wait",320]],
  V("life_jacket","kayak"),{story:["put on a life jacket","put on a life jacket","mặc áo phao an toàn"]}),

 A("paddle_the_kayak","lakedock","Paddle the kayak on the lake","Chèo thuyền kayak trên hồ",
  "I'm paddling the kayak across the calm mountain lake.",
  "Tôi đang chèo thuyền kayak băng qua mặt hồ trên núi phẳng lặng.",
  ["paddling","kayak","calm","lake"],["Let's go kayaking on the lake!"],
  "<b>paddle</b> vừa là danh từ (mái chèo) vừa là động từ (chèo thuyền bằng mái chèo đôi).",
  ["I'm paddling the kayak","across","the calm mountain lake."],{ans:"paddling",opts:["paddling","pedaling","painting"]},
  ["We <b>paddled our kayak</b> across the clear lake.","The lake water is so <b>calm</b> this morning."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_dock"],["spawn","kayak_paddle"],["pose","sweep",700],["set","od_vest","wearing"],["set","od_kayak","paddled"],["despawn"],["wait",380]],
  V("kayak","paddle","life_jacket"),{done:W=>W.od_kayak==="paddled",story:["paddle the kayak across the lake","paddled the kayak across the lake","chèo thuyền kayak trên mặt hồ"]}),

 Q("tie_kayak_to_dock","lakedock","od_dock","bend","od_kayak_tied","yes","Tie the kayak rope to the dock","Buộc dây neo thuyền kayak vào bến",
  "I'm tying the kayak rope securely to the wooden dock post.",
  "Tôi đang buộc dây thuyền kayak thật chắc vào cột gỗ của bến thuyền.",
  ["tying","kayak","rope","securely"],"Động từ <b>tie</b> → V-ing đổi <i>ie</i> thành <i>y</i>: <b>tying</b>.",
  ["I'm tying","the kayak rope securely","to the wooden dock post."],["tying","trying","flying"],
  ["Always <b>tie the kayak</b> to the dock so it doesn't drift away.","Tie a strong knot on the post."],["kayak","paddle"]),

 Q("dip_feet_in_lake","lakedock","od_dock","bend","od_feet_dipped","yes","Dip feet in the cool lake water","Ngâm chân xuống làn nước hồ mát lạnh",
  "I'm sitting on the wooden pier and dipping my feet in the cool water.",
  "Tôi đang ngồi trên cầu tàu bằng gỗ và ngâm chân xuống làn nước mát lạnh.",
  ["sitting","pier","dipping","cool"],"<b>dip + cái gì + in/into...</b> = nhúng/ngâm nhẹ xuống nước.",
  ["I'm sitting on the pier","and dipping my feet","in the cool water."],["dipping","dripping","skipping"],
  ["The mountain lake water feels <b>cool and refreshing</b>!","Let's <b>dip our feet</b> in the lake."],["refreshing","kayak"]),

 Q("ask_kayak_guide_tips","lakedock","od_dock","point","od_guide_tips","asked","Ask the guide for paddling tips","Hỏi hướng dẫn viên mẹo chèo thuyền",
  "Could you show me how to hold the double-bladed paddle correctly?",
  "Anh có thể chỉ giúp tôi cách cầm mái chèo hai đầu sao cho đúng không ạ?",
  ["show","hold","paddle","correctly"],"Mẫu câu nhờ hướng dẫn lịch sự: <b>Could you show me how to + V...?</b>",
  ["Could you show me","how to hold","the paddle correctly?"],["paddle","saddle","puddle"],
  ["<b>Could you show me how to</b> steer the kayak?","Hold the <b>paddle</b> with both hands."],["paddle","kayak","life_jacket"]),

 // 10. Camping lantern (1 existing + 4 new = 5)
 A("turn_on_camp_lantern","camplantern","Turn on the camping lantern","Bật đèn lồng cắm trại",
  "I'm turning on the solar lantern to light up our campsite.",
  "Tôi đang bật chiếc đèn lồng năng lượng mặt trời để chiếu sáng khu cắm trại.",
  ["turning","lantern","light","campsite"],["Hang the lantern outside the tent."],
  "<b>turn on</b> (bật đèn) · <b>light up</b> (chiếu sáng rực cả một khu vực).",
  ["I'm turning on","the solar lantern","to light up our campsite."],{ans:"lantern",opts:["lantern","pattern","modern"]},
  ["<b>Turn on the lantern</b> when it gets dark.","The warm <b>lantern</b> lit up our tent."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","od_lantern"],["pose","reach",450],["set","od_lantern","on"],["wait",300]],
  V("lantern","tent"),{story:["turn on the camping lantern","turned on the camping lantern","bật đèn lồng cắm trại"]}),

 Q("adjust_lantern_brightness","camplantern","od_lantern","reach","od_lantern_dim","soft","Dim the lantern to a soft glow","Chỉnh ánh đèn lồng dịu nhẹ",
  "I'm dimming the camping lantern to a warm, cozy glow.",
  "Tôi đang giảm độ sáng của đèn lồng sang ánh sáng vàng ấm áp, dễ chịu.",
  ["dimming","lantern","warm","glow"],"Động từ <b>dim</b> = giảm độ sáng / vặn nhỏ đèn.",
  ["I'm dimming","the camping lantern","to a warm, cozy glow."],["glow","grow","slow"],
  ["Dim the <b>lantern</b> before going to sleep.","The <b>warm glow</b> makes the campsite cozy."],["lantern","tent"]),

 Q("recharge_solar_lantern","camplantern","od_lantern","reach","od_lantern_charged","yes","Charge the solar lantern in the sun","Sạc đèn lồng bằng năng lượng mặt trời",
  "I'm placing the solar panel in the sunlight so the lantern charges.",
  "Tôi đang đặt tấm pin mặt trời ra ngoài nắng để sạc đầy chiếc đèn lồng.",
  ["placing","solar","sunlight","charges"],"<b>solar lantern</b> = đèn lồng sạc bằng năng lượng mặt trời.",
  ["I'm placing","the solar panel in the sunlight","so the lantern charges."],["solar","polar","collar"],
  ["This <b>solar lantern</b> charges during the sunny afternoon.","It's eco-friendly and bright."],["lantern"]),

 Q("hang_lantern_on_hook","camplantern","od_lantern","reach","od_lantern_hung","yes","Hang the lantern on the wooden post","Treo đèn lồng lên giá gỗ",
  "I'm hanging the lantern securely on the wooden hook outside our tent.",
  "Tôi đang treo chiếc đèn lồng thật chắc lên móc gỗ bên ngoài lều.",
  ["hanging","lantern","wooden","hook"],"<b>hang + vật + on the hook</b> = treo vật gì lên móc.",
  ["I'm hanging","the lantern securely","on the wooden hook."],["hook","book","cook"],
  ["<b>Hang the lantern</b> high so everyone can see.","Don't put a hot <b>lantern</b> near tent fabric."],["lantern","tent"]),

 Q("turn_off_camp_lantern","camplantern","od_lantern","reach","od_lantern_off_done","yes","Turn off the lantern to see the stars","Tắt đèn lồng để ngắm bầu trời sao",
  "Let's turn off the camp lantern so we can see the starry night sky clearly.",
  "Hãy tắt đèn lồng cắm trại đi để chúng ta có thể ngắm bầu trời đêm đầy sao thật rõ nhé.",
  ["turn","off","lantern","starry"],"Tính từ <b>starry</b> = đầy sao (<i>the starry night sky</i>).",
  ["Let's turn off","the camp lantern","to see the starry sky."],["starry","sorry","story"],
  ["<b>Turn off</b> the lights and look up at the stars!","What a clear, <b>starry night</b>!"],["lantern","constellation"]),

 // 11. Camping hammock (5 new)
 Q("tie_up_hammock","hammock","od_hammock","reach","od_hammock_tied","yes","Tie the hammock between two pines","Mắc võng giữa hai cây thông",
  "I'm tying the tree-friendly hammock straps between two sturdy pine trees.",
  "Tôi đang buộc dây đai mắc võng thân thiện với cây cối vào giữa hai thân cây thông vững chắc.",
  ["tying","hammock","sturdy","pine"],"Tính từ <b>sturdy</b> (/ˈstɜːrdi/) = chắc chắn, cứng cáp.",
  ["I'm tying","the hammock straps","between two sturdy pines."],["hammock","hammer","happen"],
  ["Find two <b>sturdy trees</b> to hang your hammock.","These wide straps protect the tree bark."],["hammock"]),

 Q("lie_in_hammock","hammock","od_hammock","idle","od_hammock_rest","yes","Relax in the shady hammock","Nằm thư giãn trên võng dưới bóng râm",
  "I'm lying back in the hammock and resting in the cool shade.",
  "Tôi đang ngả lưng trên chiếc võng và nghỉ ngơi dưới bóng râm mát mẻ.",
  ["lying","hammock","resting","shade"],"Cụm giới từ <b>in the shade</b> = ở dưới bóng râm mát.",
  ["I'm lying back","in the hammock","and resting in the shade."],["shade","shake","shape"],
  ["It feels great to nap <b>in the hammock</b>.","Let's rest <b>in the cool shade</b> after our hike."],["hammock","refreshing"]),

 Q("read_book_in_hammock","hammock","od_hammock","read","od_hammock_book","read","Read an adventure book in the hammock","Đọc sách phiêu lưu trên võng",
  "I'm reading a thrilling adventure novel while relaxing in the hammock.",
  "Tôi đang đọc một cuốn tiểu thuyết phiêu lưu hấp dẫn trong lúc thư giãn trên võng.",
  ["reading","thrilling","adventure","hammock"],"<b>while + V-ing</b> diễn tả hai hành động thư giãn diễn ra song song.",
  ["I'm reading","an adventure novel","while relaxing in the hammock."],["novel","level","travel"],
  ["Reading in a <b>camping hammock</b> is so peaceful.","This <b>adventure book</b> is really exciting."],["hammock"]),

 Q("swing_gently_in_hammock","hammock","od_hammock","sweep","od_hammock_swing","yes","Sway gently in the mountain breeze","Đung đưa võng nhẹ nhàng trong gió núi",
  "The hammock is swaying gently in the cool mountain breeze.",
  "Chiếc võng đang đung đưa nhè nhẹ trong làn gió núi mát rượi.",
  ["hammock","swaying","gently","breeze"],"Động từ <b>sway gently</b> = đung đưa nhẹ nhàng qua lại.",
  ["The hammock","is swaying gently","in the mountain breeze."],["swaying","saying","staying"],
  ["The pine branches <b>sway gently</b> in the wind.","Enjoy the cool <b>mountain breeze</b>."],["hammock","breeze"]),

 Q("untie_the_hammock","hammock","od_hammock","reach","od_hammock_untied","yes","Take down and fold the hammock","Tháo và gấp gọn võng cắm trại",
  "I'm untying the hammock and folding it back into its small pouch.",
  "Tôi đang tháo dây võng và gấp gọn nó lại vào trong chiếc túi nhỏ.",
  ["untying","hammock","folding","pouch"],"Tiền tố <b>un-</b>: <b>tie</b> (buộc) → <b>untie</b> (tháo dây).",
  ["I'm untying","the hammock","and folding it into its pouch."],["pouch","couch","touch"],
  ["<b>Untie the hammock</b> before it rains.","It folds into a tiny travel <b>pouch</b>."],["hammock"]),

 // 12. Portable camp stove & grill (5 new)
 Q("turn_on_camp_stove","campgrill","od_grill","reach","od_stove","on","Ignite the portable camp stove","Bật bếp ga dã ngoại",
  "I'm turning the knob to ignite our portable camp stove.",
  "Tôi đang vặn nút để bật chiếc bếp ga dã ngoại nhỏ gọn của chúng tôi.",
  ["turning","knob","ignite","stove"],"Tính từ <b>portable</b> (/ˈpɔːrtəbəl/) = nhỏ gọn, dễ mang theo khi đi dã ngoại.",
  ["I'm turning the knob","to ignite","our portable camp stove."],["stove","stone","store"],
  ["Set the <b>portable camp stove</b> on a flat table.","Keep the stove away from the tent."],["camp_stove"]),

 Q("boil_kettle_for_tea","campgrill","od_grill","pour","od_kettle","boiled","Boil water for herbal tea","Đun nước sôi pha trà thảo mộc",
  "I'm boiling a kettle of spring water on the camp stove for hot tea.",
  "Tôi đang đun sôi một ấm nước suối trên bếp dã ngoại để pha trà nóng.",
  ["boiling","kettle","spring","tea"],"<b>boil a kettle of water</b> = đun sôi một ấm nước.",
  ["I'm boiling","a kettle of water","on the camp stove."],["kettle","cattle","little"],
  ["Hot tea tastes wonderful on a <b>chilly</b> morning.","The <b>kettle</b> is whistling on the stove."],["camp_stove","spring_water"]),

 Q("grill_corn_on_cob","campgrill","od_grill","pour","od_corn","grilled","Grill sweet corn on the cob","Nướng bắp ngô ngọt trên bếp",
  "I'm grilling fresh sweet corn on the cob with a little butter.",
  "Tôi đang nướng những bắp ngô ngọt tươi nguyên trái với một chút bơ thơm.",
  ["grilling","sweet","corn","butter"],"Cụm danh từ <b>corn on the cob</b> = bắp ngô để nguyên trái khi nướng/luộc.",
  ["I'm grilling","sweet corn on the cob","with a little butter."],["corn","horn","born"],
  ["<b>Grilled corn on the cob</b> smells amazing!","Pass me an ear of <b>sweet corn</b>, please."],["camp_stove","roast"]),

 Q("flip_veggie_skewers","campgrill","od_grill","reach","od_skewers","flipped","Flip the vegetable skewers","Lật xiên rau củ nướng",
  "I'm flipping the colorful bell pepper and mushroom skewers on the grill.",
  "Tôi đang lật đều những xiên ớt chuông và nấm đầy màu sắc trên vỉ nướng.",
  ["flipping","colorful","skewers","grill"],"Động từ <b>flip</b> = lật mặt thức ăn khi nướng/chiên để chín đều.",
  ["I'm flipping","the vegetable skewers","on the camp grill."],["flipping","slipping","clipping"],
  ["<b>Flip the skewers</b> so they don't burn.","These grilled mushrooms are delicious!"],["camp_stove","roast"]),

 Q("turn_off_camp_stove","campgrill","od_grill","reach","od_stove_off_done","yes","Turn off the camp stove valve","Khoá van tắt bếp ga dã ngoại",
  "I'm turning off the gas valve completely after cooking lunch.",
  "Tôi đang khoá chặt hoàn toàn van bình ga sau khi nấu xong bữa trưa.",
  ["turning","off","valve","cooking"],"Luôn dùng <b>turn off completely</b> để nhấn mạnh việc tắt/khoá an toàn tuyệt đối.",
  ["I'm turning off","the gas valve completely","after cooking lunch."],["valve","value","valley"],
  ["Double-check that the <b>camp stove</b> is off.","Let the grill cool down before packing."],["camp_stove"]),

 // 13. Fishing rod & tackle (4 new)
 Q("bait_fishing_hook","fishingrod","od_fishing","bend","od_hook_baited","yes","Put bait on the fishing hook","Mắc mồi vào lưỡi câu",
  "I'm carefully putting a rubber lure on the fishing hook.",
  "Tôi đang cẩn thận gắn một con mồi giả bằng cao su vào lưỡi câu cá.",
  ["carefully","putting","lure","hook"],"Trạng từ <b>carefully</b> = một cách cẩn thận (tránh bị lưỡi câu đâm vào tay).",
  ["I'm carefully putting","a lure","on the fishing hook."],["hook","look","book"],
  ["Handle the sharp <b>fishing hook</b> carefully.","Attach the <b>bait</b> before casting."],["fishing_rod","bait"]),

 Q("cast_fishing_line","fishingrod","od_fishing","sweep","od_line_cast","yes","Cast the fishing line into the lake","Quăng dây câu xuống mặt hồ",
  "I'm casting my fishing line out into the deep, clear lake.",
  "Tôi đang quăng dây câu ra phía vùng nước sâu và trong vắt của hồ.",
  ["casting","fishing","line","lake"],"Động từ <b>cast</b> (quăng dây câu) có 3 dạng bất quy tắc giống nhau: <b>cast – cast – cast</b>.",
  ["I'm casting","my fishing line","into the clear lake."],["casting","costing","coasting"],
  ["He <b>cast his fishing line</b> near the reeds.","Wait quietly for a fish to bite."],["fishing_rod","bait"]),

 Q("reel_in_trout","fishingrod","od_fishing","reach","od_trout","caught","Reel in a rainbow trout","Quay cần kéo chú cá hồi suối",
  "Look, a fish is biting! I'm reeling in a shiny rainbow trout!",
  "Nhìn kìa, cá cắn câu rồi! Tôi đang quay dây kéo lên một chú cá hồi vân lấp lánh!",
  ["biting","reeling","shiny","trout"],"Phrasal verb <b>reel in</b> = quay guồng thu dây câu kéo cá vào bờ.",
  ["A fish is biting!","I'm reeling in","a shiny rainbow trout!"],["trout","shout","about"],
  ["She <b>reeled in</b> a big mountain trout!","The fish is <b>biting</b> the lure!"],["fishing_rod","trout"]),

 Q("release_fish_into_lake","fishingrod","od_fishing","bend","od_fish_released","yes","Release the fish back into the lake","Thả cá bơi lại về hồ",
  "We practice catch and release, so I'm letting the trout swim free.",
  "Chúng tôi câu cá giải trí bảo tồn nên tôi đang thả chú cá hồi bơi tự do về lại mặt hồ.",
  ["catch","release","letting","swim"],"Thuật ngữ câu cá văn minh: <b>catch and release</b> = câu rồi thả lại tự nhiên.",
  ["We practice catch and release,","so I'm letting","the trout swim free."],["release","realize","replace"],
  ["Gently <b>release the fish</b> back into the water.","Watch the <b>trout</b> swim away happily!"],["trout","fishing_rod"]),

 // 14. First-aid kit (5 new — health & outdoor safety!)
 Q("apply_sunscreen_lotion","firstaid","od_firstaid","reach","od_sunscreen","applied","Put on SPF 50 sunscreen","Thoa kem chống nắng bảo vệ da",
  "I'm putting on waterproof sunscreen so I don't get a painful sunburn.",
  "Tôi đang thoa kem chống nắng kháng nước để không bị cháy nắng rát da.",
  ["putting","waterproof","sunscreen","sunburn"],"Từ vựng sức khỏe ngoài trời: <b>sunscreen</b> (kem chống nắng) · <b>sunburn</b> (bị cháy nắng).",
  ["I'm putting on","waterproof sunscreen","so I don't get a sunburn."],["sunscreen","sunglasses","sunshine"],
  ["Reapply <b>sunscreen</b> every two hours outdoors.","The mountain sun is strong even on cool days."],["sunscreen","waterproof","first_aid_kit"]),

 Q("spray_bug_repellent","firstaid","od_firstaid","pour","od_bugspray","sprayed","Spray natural bug repellent","Xịt thuốc chống muỗi và côn trùng",
  "I'm spraying herbal bug repellent on my ankles to prevent mosquito bites.",
  "Tôi đang xịt dung dịch thảo mộc chống côn trùng lên cổ chân để phòng muỗi đốt.",
  ["spraying","bug","repellent","mosquito"],"<b>prevent + danh từ</b> = ngăn ngừa (<i>prevent itchy mosquito bites</i>).",
  ["I'm spraying","herbal bug repellent","to prevent mosquito bites."],["mosquito","rito","potato"],
  ["Use <b>bug spray</b> near the lake in the evening.","Mosquito bites can be very itchy!"],["bug_spray","first_aid_kit"]),

 Q("put_bandaid_on_scrape","firstaid","od_firstaid","bend","od_bandaid","applied","Put a band-aid on a small scrape","Dán băng cá nhân lên vết trầy nhẹ",
  "I scraped my knee on a rock, so I'm cleaning it and putting on a bandage.",
  "Tôi bị trầy nhẹ đầu gối vào tảng đá nên đang sát khuẩn và dán băng cá nhân.",
  ["scraped","knee","cleaning","bandage"],"Từ vựng y tế thường gặp: <b>scrape</b> (vết trầy xước da nhẹ) · <b>bandage / band-aid</b> (băng cá nhân).",
  ["I scraped my knee,","so I'm putting on","a sterile bandage."],["bandage","baggage","cabbage"],
  ["Clean the cut with antiseptic wipes from the <b>first-aid kit</b>.","Put a clean <b>bandage</b> over the scrape."],["bandage","first_aid_kit"]),

 Q("check_first_aid_supplies","firstaid","od_firstaid","read","od_firstaid_checked","yes","Check the first-aid kit supplies","Kiểm tra dụng cụ trong hộp sơ cứu",
  "I'm checking that our first-aid kit has antiseptic wipes, gauze, and bandages.",
  "Tôi đang kiểm tra để chắc chắn hộp sơ cứu có đủ khăn sát khuẩn, gạc y tế và băng cá nhân.",
  ["checking","first-aid","antiseptic","bandages"],"Luôn kiểm tra <b>first-aid kit</b> trước mỗi chuyến đi bộ đường dài.",
  ["I'm checking","that our first-aid kit","has bandages and gauze."],["gauze","cause","pause"],
  ["Every hiker should carry a small <b>first-aid kit</b>.","Do you have any <b>bandages</b> in your kit?"],["first_aid_kit","bandage"]),

 Q("drink_electrolyte_water","firstaid","od_firstaid","drink","od_electrolyte","drunk","Drink electrolyte water for energy","Uống nước điện giải chống mệt mỏi",
  "I feel a little dizzy from the sun, so I'm drinking cool electrolyte water.",
  "Tôi thấy hơi choáng nhẹ vì nắng nên đang uống nước bù điện giải mát lạnh.",
  ["dizzy","sun","drinking","electrolyte"],"Từ vựng sức khỏe: <b>feel dizzy</b> = cảm thấy chóng mặt, choáng váng.",
  ["I feel a little dizzy,","so I'm drinking","cool electrolyte water."],["dizzy","busy","fizzy"],
  ["Sit in the shade and drink water if you <b>feel dizzy</b>.","Stay hydrated when hiking in warm weather!"],["first_aid_kit","refreshing"]),

 // 15. Wildlife sign & bird nest (4 new)
 Q("read_wildlife_sign","wildlifesign","od_wildlife","read","od_wildlife_read","yes","Read the mountain wildlife board","Đọc bảng thông tin động vật rừng thông",
  "I'm reading the illustrated guide about local birds, deer, and squirrels.",
  "Tôi đang đọc bảng hướng dẫn có hình minh họa về các loài chim, hươu và sóc trong vùng.",
  ["reading","local","birds","squirrels"],"<b>wildlife</b> (động vật hoang dã) là danh từ không đếm được.",
  ["I'm reading","the illustrated guide","about local wildlife."],["wildlife","wildfire","nightlife"],
  ["Respect <b>local wildlife</b> and observe from a distance.","What kinds of birds live in this forest?"],["wildlife","squirrel"]),

 Q("spot_red_squirrel","wildlifesign","od_wildlife","point","od_squirrel","spotted","Spot a squirrel holding a pine cone","Bắt gặp chú sóc đang ôm quả thông",
  "Look! A fluffy red squirrel is nibbling a pine cone on that branch!",
  "Nhìn kìa! Một chú sóc đỏ lông xù đang gặm quả thông trên cành cây đằng kia!",
  ["fluffy","squirrel","nibbling","pine"],"Động từ <b>nibble</b> = gặm nhấm từng chút một; <b>fluffy</b> = bông xù dễ thương.",
  ["A fluffy red squirrel","is nibbling a pine cone","on that branch!"],["squirrel","square","squirt"],
  ["The little <b>squirrel</b> ran up the pine tree.","Look at the <b>pine cones</b> under the tree."],["squirrel","pine_cone","wildlife"]),

 Q("listen_to_chirping_birds","wildlifesign","od_wildlife","idle","od_birds_listened","yes","Listen to the forest birds singing","Lắng nghe tiếng chim rừng hót líu lo",
  "I'm standing quietly and listening to the songbirds chirping in the pines.",
  "Tôi đang đứng yên lặng và lắng nghe đàn chim rừng hót líu lo trên rặng thông.",
  ["standing","quietly","listening","chirping"],"<b>listen to + tân ngữ + V-ing</b>: lắng nghe âm thanh đang diễn ra (<i>birds chirping</i>).",
  ["I'm standing quietly","and listening to","the birds chirping."],["chirping","chipping","shipping"],
  ["Can you hear the <b>birds chirping</b> in the trees?","The forest is so peaceful in the morning."],["wildlife"]),

 Q("photograph_pine_cones","wildlifesign","od_wildlife","point","od_pinecone_photo","yes","Take a close-up photo of pine cones","Chụp ảnh cận cảnh quả thông và tổ chim",
  "I'm taking a close-up photo of the pine cones without disturbing the bird nest.",
  "Tôi đang chụp một bức ảnh cận cảnh những quả thông mà không làm động đến tổ chim.",
  ["close-up","photo","without","disturbing"],"Giới từ <b>without + V-ing</b> = mà không làm gì (<i>without disturbing the nest</i>).",
  ["I'm taking a close-up photo","without disturbing","the bird nest."],["disturbing","describing","discovering"],
  ["Take photos <b>without disturbing</b> the wild birds.","These big brown <b>pine cones</b> look cool."],["pine_cone","wildlife"]),

 // 16. Firewood rack & logs (4 new)
 Q("stack_dry_logs","woodpile","od_woodpile","reach","od_logs_stacked","yes","Stack the split logs neatly","Xếp gọn các thanh củi khô lên giá",
  "I'm stacking the dry pine logs neatly on the metal firewood rack.",
  "Tôi đang xếp những khúc củi thông khô thật gọn gàng lên giá để củi bằng sắt.",
  ["stacking","dry","logs","neatly"],"Động từ <b>stack</b> = xếp chồng gọn gàng lên nhau.",
  ["I'm stacking","the dry pine logs","neatly on the rack."],["logs","dogs","fogs"],
  ["Keep the <b>woodpile</b> off the damp grass.","Dry <b>logs</b> burn cleanly with less smoke."],["woodpile","firewood"]),

 Q("cover_woodpile_with_tarp","woodpile","od_woodpile","sweep","od_wood_tarp","covered","Cover the woodpile with a waterproof tarp","Phủ bạt chống thấm che đống củi",
  "I'm pulling a waterproof tarp over the woodpile so the logs stay bone-dry.",
  "Tôi đang kéo tấm bạt chống thấm phủ lên đống củi để củi luôn khô cong.",
  ["pulling","waterproof","tarp","woodpile"],"Thành ngữ nhấn mạnh: <b>bone-dry</b> = khô cong / khô ráo hoàn toàn.",
  ["I'm pulling a waterproof tarp","over the woodpile","so the logs stay dry."],["tarp","harp","sharp"],
  ["Cover the <b>woodpile with a tarp</b> before nightfall.","Wet <b>firewood</b> is very hard to light."],["tarp","woodpile","waterproof"]),

 Q("carry_kindling_twigs","woodpile","od_woodpile","reach","od_kindling","carried","Pick up small kindling twigs","Nhặt cành củi khô nhỏ để nhóm lửa",
  "I'm gathering a handful of dry kindling twigs to start the campfire easily.",
  "Tôi đang gom một nắm cành củi mồi khô nhỏ để nhóm lửa trại dễ dàng hơn.",
  ["gathering","handful","kindling","twigs"],"<b>kindling</b> (/ˈkɪndlɪŋ/) = củi mồi, cành khô nhỏ dễ bén lửa.",
  ["I'm gathering","dry kindling twigs","to start the campfire."],["kindling","kindness","finding"],
  ["Use small <b>kindling twigs</b> to catch the spark first.","Then add larger <b>firewood</b> logs."],["kindling","firewood","campfire"]),

 Q("check_dry_bark","woodpile","od_woodpile","read","od_bark_checked","yes","Check if the wood is dry enough","Kiểm tra độ khô của vỏ cây và củi",
  "I'm knocking two logs together to hear if the firewood is completely dry.",
  "Tôi đang gõ nhẹ hai thanh củi vào nhau để nghe thử xem củi đã khô hoàn toàn chưa.",
  ["knocking","logs","together","dry"],"<b>if / whether + mệnh đề</b>: kiểm tra xem liệu điều gì có đúng không.",
  ["I'm knocking two logs together","to see if","the firewood is dry."],["bark","dark","park"],
  ["Dry <b>firewood</b> makes a sharp sound when knocked together.","Damp wood only makes thick smoke."],["firewood","woodpile"]),

 // 17. Folding camp chair (4 new)
 Q("unfold_camp_chair","campchair","od_chair","reach","od_chair_open","yes","Unfold the canvas camp chair","Mở chiếc ghế xếp cắm trại",
  "I'm unfolding the sturdy canvas camp chair beside the campfire ring.",
  "Tôi đang mở chiếc ghế xếp vải bố chắc chắn ra đặt cạnh vòng đá lửa trại.",
  ["unfolding","sturdy","canvas","chair"],"<b>fold</b> (gấp lại) ↔ <b>unfold</b> (mở ghế xếp/bản đồ ra).",
  ["I'm unfolding","the sturdy camp chair","beside the campfire."],["chair","cheer","share"],
  ["<b>Unfold your camp chair</b> and join us by the fire!","This folding chair has a cup holder."],["camp_chair","campfire"]),

 Q("sit_in_camp_chair","campchair","od_chair","idle","od_chair_sat","yes","Sit back in the folding camp chair","Ngồi tựa lưng trên ghế xếp cắm trại",
  "I'm sitting back in the comfortable camp chair and watching the sunset.",
  "Tôi đang ngồi tựa lưng thoải mái trên chiếc ghế xếp cắm trại và ngắm hoàng hôn.",
  ["sitting","comfortable","chair","sunset"],"<b>sit back</b> = ngồi ngả lưng thư giãn thoải mái.",
  ["I'm sitting back","in the comfortable camp chair","and watching the sunset."],["sunset","sunrise","sunday"],
  ["<b>Sit back</b> and enjoy the golden mountain sunset.","My <b>camp chair</b> is super comfy."],["camp_chair"]),

 Q("sip_hot_cocoa_in_chair","campchair","od_chair","drink","od_cocoa","drunk","Sip a mug of hot cocoa by the fire","Nhâm nhi cốc ca cao nóng trên ghế xếp",
  "I'm sipping a steaming mug of hot cocoa while sitting by the campfire.",
  "Tôi đang nhâm nhi một cốc ca cao nóng bốc khói thơm lừng khi ngồi bên bếp lửa trại.",
  ["sipping","steaming","mug","cocoa"],"Tính từ <b>steaming</b> = đang bốc khói nghi ngút (đồ uống nóng).",
  ["I'm sipping","a steaming mug of hot cocoa","by the campfire."],["cocoa","coconut","coffee"],
  ["Would you like a mug of <b>hot cocoa</b>?","<b>Sipping hot cocoa</b> under the stars is the best!"],["cocoa","camp_chair","campfire"]),

 Q("fold_up_camp_chair","campchair","od_chair","bend","od_chair_folded","yes","Fold up the camp chair into its bag","Gấp gọn ghế xếp vào túi đeo",
  "I'm folding up the camp chair and sliding it into its carry bag.",
  "Tôi đang gấp gọn chiếc ghế xếp lại và cho nó vào trong túi đeo chuyên dụng.",
  ["folding","camp","chair","carry"],"Phrasal verb <b>fold up</b> = gấp gọn lại sau khi sử dụng.",
  ["I'm folding up","the camp chair","into its carry bag."],["folding","holding","scolding"],
  ["Please <b>fold up the chairs</b> before we leave.","This <b>camp chair</b> is light and easy to carry."],["camp_chair"]),

 // 18. Bear-proof trash bin (4 new)
 Q("sort_recyclable_cans","campbin","od_bin","reach","od_cans_sorted","yes","Sort empty cans and plastic bottles","Phân loại vỏ lon và chai nhựa tái chế",
  "I'm separating our empty juice bottles and aluminum cans for recycling.",
  "Tôi đang phân loại riêng các vỏ chai nước trái cây và lon nhôm để tái chế.",
  ["separating","empty","cans","recycling"],"<b>separate A for recycling</b> = phân loại riêng A để đưa đi tái chế.",
  ["I'm separating","empty bottles and cans","for recycling."],["recycling","bicycling","circling"],
  ["Always <b>recycle</b> cans and plastic bottles at camp.","Keep nature clean and green!"],["recycle","bear_bin"]),

 Q("throw_trash_in_bear_bin","campbin","od_bin","reach","od_trash_binned","yes","Put food wrappers in the bear-proof bin","Bỏ vỏ gói thức ăn vào thùng rác chống gấu",
  "I'm throwing all food wrappers into the heavy metal bear-proof bin.",
  "Tôi đang bỏ tất cả vỏ gói thức ăn vào trong chiếc thùng rác kim loại chống gấu.",
  ["throwing","wrappers","heavy","bear-proof"],"Tính từ ghép <b>bear-proof</b> = được thiết kế khóa kín để gấu không mở được.",
  ["I'm throwing","all food wrappers","into the bear-proof bin."],["wrappers","rappers","zippers"],
  ["Never leave food trash inside your tent.","Use the <b>bear-proof trash bin</b> near the gate."],["bear_bin","litter"]),

 Q("latch_bear_proof_lid","campbin","od_bin","bend","od_bin_latched","yes","Lock the safety latch on the trash bin","Cài chốt khoá an toàn nắp thùng rác",
  "I'm clicking the safety latch shut so wild animals can't open the bin.",
  "Tôi đang bấm khoá chốt an toàn lại để thú rừng không thể cạy mở nắp thùng rác.",
  ["clicking","safety","latch","animals"],"<b>click the latch shut</b> = đóng sập chốt khoá an toàn.",
  ["I'm clicking","the safety latch shut","so animals can't open it."],["latch","catch","match"],
  ["Make sure the <b>bear bin</b> latch clicks shut.","Raccoons and bears have a strong sense of smell!"],["bear_bin","wildlife"]),

 Q("pick_up_trail_litter","campbin","od_bin","bend","od_litter_picked","yes","Pick up stray litter along the path","Nhặt rác vụn rơi dọc lối đi",
  "I spotted a stray plastic wrapper on the grass, so I'm picking it up.",
  "Tôi nhìn thấy một mảnh vỏ nhựa rơi trên bãi cỏ nên đang cúi xuống nhặt bỏ vào thùng.",
  ["spotted","stray","wrapper","picking"],"Phrasal verb <b>pick up litter</b> = nhặt rác vụn.",
  ["I spotted a stray wrapper,","so I'm picking it up","right away."],["litter","letter","little"],
  ["If you see <b>litter</b> on the trail, please pick it up.","We leave the campground cleaner than we found it!"],["litter","trace","bear_bin"]),

 // 19. Mountain wildflowers (4 new)
 Q("smell_mountain_flowers","wildflowers","od_flowers","bend","od_flowers_smelled","yes","Smell the fragrant wildflowers","Ngửi hương hoa dại thơm ngát",
  "These purple and yellow mountain wildflowers smell so sweet and fresh!",
  "Những bông hoa dại màu tím và vàng trên núi này tỏa hương thơm dịu và tươi mới quá!",
  ["purple","wildflowers","smell","sweet"],"Động từ giác quan <b>smell + tính từ</b> (<i>smell sweet and fresh</i> — không dùng trạng từ <i>sweetly</i>).",
  ["These mountain wildflowers","smell so sweet","and fresh!"],["smell","spell","shell"],
  ["The pine forest <b>smells fresh</b> after the morning dew.","Look at the colorful <b>wildflowers</b>!"],["wildflower","refreshing"]),

 Q("observe_honeybee_on_flower","wildflowers","od_flowers","read","od_bee_watched","yes","Watch a honeybee collecting nectar","Ngắm chú ong mật đang hút mật hoa",
  "Look closely! A busy honeybee is collecting nectar from the yellow flower.",
  "Nhìn kỹ kìa! Một chú ong mật chăm chỉ đang lấy mật trên bông hoa màu vàng.",
  ["closely","busy","honeybee","nectar"],"<b>collect nectar / pollen</b> = hút mật / gom phấn hoa.",
  ["A busy honeybee","is collecting nectar","from the yellow flower."],["honeybee","honeycomb","honeymoon"],
  ["Bees help pollinate the <b>mountain wildflowers</b>.","Stay calm and let the <b>honeybee</b> work."],["honeybee","wildflower"]),

 Q("sketch_wildflower_petals","wildflowers","od_flowers","read","od_flower_sketched","yes","Draw the wildflower instead of picking it","Vẽ lại bông hoa dại thay vì hái hoa",
  "I'm drawing the wildflower petals in my notebook instead of picking them.",
  "Tôi đang vẽ lại những cánh hoa dại vào sổ tay thay vì ngắt hoa.",
  ["drawing","petals","instead","picking"],"Cấu trúc <b>instead of + V-ing</b> = thay vì làm gì (<i>instead of picking them</i>).",
  ["I'm drawing the wildflowers","in my notebook","instead of picking them."],["instead","inside","indeed"],
  ["Take photos <b>instead of picking</b> the wildflowers.","Leave the <b>wildflowers</b> for everyone to enjoy."],["wildflower","trace"]),

 Q("avoid_stepping_on_flowers","wildflowers","od_flowers","point","od_flower_path","stepped_stone","Stay on the stepping stones","Đi trên đá lát để không giẫm lên hoa cỏ",
  "I'm walking on the flat stepping stones so I don't crush the wildflowers.",
  "Tôi đang bước đi trên các phiến đá lát để không giẫm nát bụi hoa dại.",
  ["walking","stepping","stones","wildflowers"],"<b>stepping stones</b> = các phiến đá lát lối đi trên cỏ.",
  ["I'm walking","on the stepping stones","to protect the wildflowers."],["stones","bones","cones"],
  ["Stay on the trail and <b>stepping stones</b>.","Protect the delicate <b>mountain wildflowers</b>."],["wildflower","trailhead"]),

 // 20. Camp water pump (4 new)
 Q("pump_fresh_spring_water","waterpump","od_pump","pour","od_water_pumped","yes","Pump cold mountain spring water","Bơm nước suối nguồn mát lạnh",
  "I'm pushing the iron handle up and down to pump fresh spring water.",
  "Tôi đang ấn cần gạt bằng sắt lên xuống để bơm dòng nước suối nguồn trong mát.",
  ["pushing","handle","pump","spring"],"<b>up and down</b> = lên xuống nhịp nhàng; <b>spring water</b> = nước mạch/nước suối ngầm.",
  ["I'm pushing the handle","up and down","to pump spring water."],["pump","jump","bump"],
  ["The <b>camp water pump</b> draws clean mountain water.","This <b>spring water</b> is ice-cold!"],["water_pump","spring_water"]),

 Q("rinse_hands_at_pump","waterpump","od_pump","wipe","od_hands_rinsed","yes","Wash hands with biodegradable soap","Rửa sạch tay dưới vòi nước trại",
  "I'm washing my dusty hands at the water pump before eating lunch.",
  "Tôi đang rửa sạch đôi bàn tay bám bụi ở vòi bơm nước trước khi ăn trưa.",
  ["washing","dusty","hands","pump"],"Tính từ <b>dusty</b> = bám bụi (sau khi dựng lều hoặc gom củi).",
  ["I'm washing","my dusty hands","at the water pump."],["dusty","rusty","musty"],
  ["Always <b>wash your hands</b> before eating at camp.","The cold water feels so <b>refreshing</b>."],["water_pump","refreshing"]),

 Q("fill_camping_kettle","waterpump","od_pump","pour","od_kettle_filled","yes","Fill the camping pot with clean water","Hứng đầy ấm nước sạch để đun",
  "I'm filling our stainless-steel kettle with clean water from the pump.",
  "Tôi đang hứng đầy chiếc ấm inox bằng nguồn nước sạch từ vòi bơm.",
  ["filling","kettle","clean","pump"],"Cấu trúc <b>fill A with B</b> = làm đầy vật A bằng chất B.",
  ["I'm filling","our camping kettle","with clean water."],["filling","feeling","falling"],
  ["<b>Fill your bottle with</b> fresh water before the hike.","We need clean water for tea and soup."],["water_pump","spring_water"]),

 Q("wash_fresh_apples","waterpump","od_pump","pour","od_apples_washed","yes","Rinse crisp red apples at the pump","Rửa sạch những quả táo đỏ giòn",
  "I'm rinsing a bag of crisp red apples under the cool running water.",
  "Tôi đang rửa sạch túi táo đỏ giòn tan dưới làn nước mát đang chảy.",
  ["rinsing","crisp","apples","running"],"<b>running water</b> = dòng nước đang chảy trực tiếp từ vòi.",
  ["I'm rinsing","crisp red apples","under the running water."],["crisp","clip","chip"],
  ["Rinse your fruit under <b>running water</b>.","These <b>crisp apples</b> are a great hiking snack."],["water_pump","refreshing"]),

 // 21. Stargazing telescope (5 new)
 Q("focus_the_telescope","telescope","od_telescope","read","od_scope_focused","yes","Focus the stargazing telescope","Chỉnh nét kính thiên văn ngắm sao",
  "I'm turning the focus wheel on the telescope to get a sharp view of the sky.",
  "Tôi đang xoay núm lấy nét trên kính thiên văn để nhìn bầu trời thật sắc nét.",
  ["turning","focus","telescope","sharp"],"Tính từ <b>sharp</b> (ngoài nghĩa sắc bén) còn có nghĩa là <b>rõ nét, sắc nét</b> (<i>a sharp view/image</i>).",
  ["I'm turning the focus wheel","on the telescope","for a sharp view."],["sharp","shark","harp"],
  ["Adjust the <b>telescope</b> until the stars look sharp.","The mountain ridge has zero light pollution!"],["telescope","constellation"]),

 Q("spot_evening_star","telescope","od_telescope","read","od_evening_star","spotted","Spot Venus shining in the twilight","Ngắm sao Hôm tỏa sáng lúc chạng vạng",
  "Look through the telescope! That bright planet near the horizon is Venus.",
  "Nhìn qua kính thiên văn kìa! Hành tinh sáng rực gần đường chân trời đó chính là sao Kim đấy.",
  ["bright","planet","horizon","Venus"],"<b>horizon</b> (/həˈraɪzən/) = đường chân trời.",
  ["Look through the telescope!","That bright planet","is Venus."],["planet","plant","plan"],
  ["Venus is often called the <b>Evening Star</b>.","It shines brightly above the mountain <b>horizon</b>."],["telescope","constellation"]),

 Q("find_big_dipper","telescope","od_telescope","point","od_big_dipper","found","Find the Big Dipper constellation","Tìm chòm sao Bắc Đẩu trên bầu trời",
  "I found the seven bright stars of the Big Dipper in the northern sky!",
  "Tôi đã tìm thấy bảy ngôi sao sáng của nhóm sao Bắc Đẩu trên bầu trời phía bắc!",
  ["found","seven","stars","northern"],"<b>constellation</b> (/ˌkɑːnstəˈleɪʃən/) = chòm sao trên bầu trời đêm.",
  ["I found","the seven bright stars","of the Big Dipper!"],["stars","stairs","scars"],
  ["The <b>Big Dipper</b> points toward the North Star.","How many <b>constellations</b> can you name?"],["constellation","telescope"]),

 Q("clean_telescope_lens","telescope","od_telescope","wipe","od_lens_cleaned","yes","Wipe the telescope lens gently","Lau nhẹ thấu kính thiên văn bằng khăn mềm",
  "I'm wiping the glass lens gently with a soft microfiber cloth.",
  "Tôi đang lau nhẹ thấu kính bằng một miếng vải sợi nhỏ thật mềm.",
  ["wiping","glass","lens","gently"],"<b>wipe ... gently with a soft cloth</b> = lau nhẹ nhàng bằng khăn mềm để không trầy kính.",
  ["I'm wiping","the telescope lens gently","with a soft cloth."],["lens","pens","tens"],
  ["Never touch the <b>telescope lens</b> with dusty fingers.","Use a clean cloth to wipe the optics."],["telescope","binoculars"]),

 Q("cover_telescope_cap","telescope","od_telescope","reach","od_scope_capped","yes","Put the dust cap on the telescope","Đậy nắp chống bụi và sương cho kính thiên văn",
  "I'm putting the protective cap back on the telescope to keep morning dew off.",
  "Tôi đang đậy nắp bảo vệ lại vào ống kính thiên văn để tránh sương đêm làm ướt kính.",
  ["putting","protective","cap","dew"],"<b>morning dew</b> = sương sớm đọng trên cỏ và đồ vật ngoài trời.",
  ["I'm putting","the protective cap","on the telescope."],["dew","few","new"],
  ["Cover the <b>telescope</b> so dew doesn't form on the lens.","Pack optical gear carefully."],["telescope"]),

 // 22. Acoustic camp guitar (4 new)
 Q("tune_acoustic_guitar","campguitar","od_guitar","reach","od_guitar_tuned","yes","Tune the acoustic guitar strings","Lên dây đàn ghi-ta thùng",
  "I'm tuning the six strings of my acoustic guitar before our sing-along.",
  "Tôi đang chỉnh lại sáu dây của cây đàn ghi-ta thùng trước buổi hát giao lưu lửa trại.",
  ["tuning","strings","acoustic","guitar"],"<b>tune a guitar</b> = lên dây đàn cho chuẩn cao độ.",
  ["I'm tuning","the six strings","of my acoustic guitar."],["strings","springs","wings"],
  ["Let me <b>tune my guitar</b> for a minute.","The wooden <b>acoustic guitar</b> sounds warm and rich."],["guitar","strum"]),

 Q("strum_campfire_song","campguitar","od_guitar","sweep","od_guitar_strummed","yes","Strum a cheerful campfire melody","Gảy đàn một giai điệu lửa trại vui tươi",
  "I'm strumming a cheerful folk melody on the acoustic guitar.",
  "Tôi đang gảy một giai điệu dân ca vui tươi trên chiếc đàn ghi-ta thùng.",
  ["strumming","cheerful","melody","guitar"],"Động từ <b>strum</b> (gảy hợp âm đàn ghi-ta) → V-ing gấp đôi <i>m</i>: <b>strumming</b>.",
  ["I'm strumming","a cheerful folk melody","on the acoustic guitar."],["strumming","swimming","drumming"],
  ["He <b>strummed his guitar</b> beside the glowing fire.","Everyone clapped along to the rhythm."],["strum","guitar","campfire"]),

 Q("sing_along_with_friends","campguitar","od_guitar","point","od_camp_sung","yes","Sing along to a camping song","Cùng hát vang bài ca dã ngoại",
  "Everyone is singing along happily to our favorite acoustic camping song!",
  "Mọi người đang cùng nhau hát theo thật vui vẻ bài hát cắm trại yêu thích của chúng tôi!",
  ["singing","along","happily","favorite"],"Phrasal verb <b>sing along (to a song / with friends)</b> = hát hòa theo.",
  ["Everyone is singing along","happily","to our favorite camping song!"],["singing","ringing","bringing"],
  ["Come sit by the fire and <b>sing along</b>!","Music makes every <b>camping trip</b> unforgettable."],["guitar","campfire"]),

 Q("put_guitar_in_case","campguitar","od_guitar","bend","od_guitar_cased","yes","Pack the guitar into its padded case","Cất đàn ghi-ta vào bao da chống ẩm",
  "I'm putting the guitar back into its padded case to protect it from the night air.",
  "Tôi đang cất cây đàn ghi-ta vào lại trong bao có đệm lót để bảo vệ đàn khỏi khí ẩm ban đêm.",
  ["putting","guitar","padded","protect"],"<b>protect A from B</b> = bảo vệ vật A khỏi tác nhân B (<i>protect it from the damp night air</i>).",
  ["I'm putting the guitar","into its padded case","to protect it."],["padded","added","faded"],
  ["Always keep your <b>guitar</b> in its case overnight.","Cold damp air can detune the strings."],["guitar","waterproof"])
];

const NPCS=[
 {id:"ranger",name:"Park Ranger",vi:"Kiểm lâm viên",avatar:"🤠",voice:"adult_male",anchor:"obj:rangerpost"},
 {id:"guide",name:"Kayak Guide",vi:"Hướng dẫn viên chèo thuyền",avatar:"🚣",voice:"young_male",anchor:"obj:lakedock"}
];

const LINES={
 check_trail_map:{who:"Park Ranger",vi_who:"Kiểm lâm viên",avatar:"🤠",
  en:"Welcome to Pine Valley! The yellow trail goes right up to the scenic lookout.",
  vi:"Chào mừng đến Thung lũng Thông! Đường mòn màu vàng dẫn thẳng lên điểm ngắm cảnh trên đồi đấy."},
 ask_the_ranger:{who:"Park Ranger",vi_who:"Kiểm lâm viên",avatar:"🤠",
  en:"Yes, the ridge trail is dry and completely safe today. Stay on the marked path and enjoy!",
  vi:"Vâng, đường mòn lên đồi hôm nay khô ráo và rất an toàn. Cứ đi theo lối có biển chỉ dẫn nhé!"},
 check_weather_board:{who:"Park Ranger",vi_who:"Kiểm lâm viên",avatar:"🤠",
  en:"It'll stay sunny until 6 PM, though it gets chilly after sunset—keep a jacket handy!",
  vi:"Trời sẽ nắng đẹp đến 6 giờ chiều, nhưng sau khi mặt trời lặn sẽ hơi se lạnh—nhớ chuẩn bị áo khoác nhé!"},
 set_up_the_tent:{who:"Park Ranger",vi_who:"Kiểm lâm viên",avatar:"🤠",
  en:"Nice spot! That flat patch of grass is sheltered from the wind.",
  vi:"Chỗ đó đẹp đấy! Khoảng cỏ bằng phẳng đó được hàng thông chắn gió rất tốt."},
 light_the_campfire:{who:"Park Ranger",vi_who:"Kiểm lâm viên",avatar:"🤠",
  en:"Great campfire! Just remember to keep it inside the stone ring and put it out before you leave.",
  vi:"Lửa trại cháy đẹp quá! Chỉ cần nhớ giữ lửa trong vòng đá và dập tắt hoàn toàn trước khi rời đi nhé."},
 put_out_campfire:{who:"Park Ranger",vi_who:"Kiểm lâm viên",avatar:"🤠",
  en:"Thank you for putting the embers completely out! You're a responsible camper.",
  vi:"Cảm ơn bạn đã dội tắt hoàn toàn than hồng! Bạn đúng là một người cắm trại có trách nhiệm."},
 pack_up_campsite:{who:"Park Ranger",vi_who:"Kiểm lâm viên",avatar:"🤠",
  en:"Spotless! Thanks for practicing Leave No Trace. Hope to see you back at Pine Valley soon!",
  vi:"Sạch bóng luôn! Cảm ơn bạn đã thực hiện nguyên tắc Không Để Lại Dấu Vết. Hẹn sớm gặp lại ở Thung lũng Thông!"},
 put_on_life_jacket:{who:"Kayak Guide",vi_who:"Hướng dẫn viên chèo thuyền",avatar:"🚣",
  en:"Good job buckling up your life jacket! Safety first on the mountain lake.",
  vi:"Bạn cài khoá áo phao chuẩn lắm! Đi trên hồ núi là cứ phải an toàn trên hết."},
 paddle_the_kayak:{who:"Kayak Guide",vi_who:"Hướng dẫn viên chèo thuyền",avatar:"🚣",
  en:"Smooth strokes! The water near the pine shore is crystal clear today!",
  vi:"Nhịp chèo đều và mượt lắm! Nước hồ gần bờ thông hôm nay trong vắt luôn!"}
};

function reply(actionId){return LINES[actionId]||null;}

const RANGER_G={name:"Park Ranger",vi:"Kiểm lâm viên",avatar:"🤠",voice:"adult_male",anchor:"obj:rangerpost"};
const GUIDE_G={name:"Kayak Guide",vi:"Hướng dẫn viên kayak",avatar:"🚣",voice:"young_male",anchor:"obj:lakedock"};
const st=(n,icon,en,vi,acts,done,autoId,hen,hvi)=>({n,icon,title_en:en,title_vi:vi,actions:acts,say_en:en,done,auto:W=>typeof autoId==="function"?autoId(W):autoId,hint:{en:hen,vi:hvi}});
const story=(log,hEn,hVi,map,cEn,cVi)=>{
 const used=map.filter(([id])=>log.includes(id));
 const mids=used.length?used:map.slice(0,3);
 return {
  en:`${hEn} First, I ${mids[0][1]}. ${mids.slice(1).map(x=>"Then I "+x[1]+".").join(" ")} ${cEn}`,
  vi:`${hVi} Đầu tiên, tôi ${mids[0][2]}. ${mids.slice(1).map(x=>"Sau đó tôi "+x[2]+".").join(" ")} ${cVi}`
 };
};

const MISSIONS=[
 {id:"outdoor_pitch_camp",title_en:"Set Up Camp",title_vi:"Dựng trại bên bìa rừng",room:"outdoor",topic:"outdoor",urgency:"normal",giver:RANGER_G,
  desc_vi:"Xem bản đồ đường mòn, dựng lều cắm trại, gom củi khô, nhóm bếp lửa trại và bật đèn lồng.",
  request:{en:"Welcome to Pine Valley! Let's check the map, pitch your tent, and build a warm campfire!",
           vi:"Chào mừng đến Thung lũng Thông! Hãy xem bản đồ, dựng lều và nhóm một bếp lửa trại ấm áp nhé!"},
  steps:[
   st(1,"🗺️","Check the trail map","Xem bản đồ đường mòn",["check_trail_map"],W=>W.od_map==="read","check_trail_map","Click the trail map board at the entrance.","Nhấn vào bảng bản đồ ở đầu đường mòn."),
   st(2,"⛺","Set up the camping tent","Dựng lều cắm trại",["set_up_the_tent"],W=>W.od_tent==="pitched","set_up_the_tent","Click the camping tent spot in the meadow.","Nhấn vào khu vực dựng lều trên bãi cỏ."),
   st(3,"🪵","Gather dry firewood","Gom củi khô",["gather_dry_firewood"],W=>W.od_fire==="wood"||W.od_fire==="lit","gather_dry_firewood","Click the stone campfire ring to collect dry wood.","Nhấn vào bếp đá lửa trại để gom củi khô."),
   st(4,"🔥","Light the campfire","Nhóm lửa trại",["light_the_campfire"],W=>W.od_fire==="lit","light_the_campfire","Light a warm campfire inside the stone ring.","Nhóm ngọn lửa ấm áp bên trong vòng đá."),
   st(5,"🏮","Turn on the camping lantern","Bật đèn lồng cắm trại",["turn_on_camp_lantern"],W=>W.od_lantern==="on","turn_on_camp_lantern","Click the hanging lantern next to the tent.","Nhấn vào chiếc đèn lồng treo cạnh lều.")
  ],
  result:log=>story(log,"Our campsite is cozy and ready!","Khu cắm trại của chúng tôi đã ấm cúng và sẵn sàng!",
   [["check_trail_map","checked the trail map","xem bản đồ đường mòn"],["set_up_the_tent","pitched our tent on flat ground","dựng lều trên bãi cỏ phẳng"],["gather_dry_firewood","gathered dry firewood","gom củi khô"],["light_the_campfire","lit a warm campfire","nhóm lửa trại"],["turn_on_camp_lantern","turned on the solar lantern","bật đèn lồng cắm trại"]],
   "You set up camp like a pro!","Bạn dựng trại chuyên nghiệp thật đấy!")},

 {id:"outdoor_sunny_picnic",title_en:"Sunny Lakeside Picnic",title_vi:"Dã ngoại & Chèo kayak bên hồ",room:"outdoor",topic:"outdoor",urgency:"chill",giver:GUIDE_G,
  desc_vi:"Trải thảm dã ngoại, lấy nước cam mát lạnh từ thùng đá, ăn bánh sandwich rồi mặc áo phao chèo kayak.",
  request:{en:"The lake is crystal clear! Enjoy a sunny picnic on the grass and then go kayaking!",
           vi:"Nước hồ đang trong vắt! Hãy trải thảm ăn trưa dã ngoại rồi xuống bến chèo thuyền kayak nhé!"},
  steps:[
   st(1,"🧺","Spread the picnic blanket","Trải thảm dã ngoại",["spread_picnic_blanket","sit_on_picnic_blanket"],W=>W.od_blanket==="spread","spread_picnic_blanket","Click the picnic spot on the left meadow.","Nhấn vào khu vực thảm dã ngoại bên trái bãi cỏ."),
   st(2,"🧃","Grab a cold fruit juice","Lấy nước trái cây mát",["take_cold_juice","drink_cold_juice"],W=>W.od_juice==="taken"||W.od_juice==="drunk","take_cold_juice","Click the blue cooler box next to the blanket.","Nhấn vào thùng đá màu xanh cạnh thảm dã ngoại."),
   st(3,"🥪","Eat a homemade sandwich","Ăn bánh mì kẹp dã ngoại",["eat_picnic_sandwich"],W=>W.od_sandwich==="eaten","eat_picnic_sandwich","Click the picnic blanket to eat your sandwich.","Nhấn vào thảm dã ngoại để thưởng thức bánh sandwich."),
   st(4,"🦺","Put on a life jacket","Mặc áo phao",["put_on_life_jacket"],W=>W.od_vest==="wearing","put_on_life_jacket","Click the wooden dock to put on your life vest.","Nhấn vào bến thuyền gỗ để mặc áo phao."),
   st(5,"🚣","Paddle the kayak on the lake","Chèo thuyền kayak trên hồ",["paddle_the_kayak"],W=>W.od_kayak==="paddled","paddle_the_kayak","Paddle across the calm mountain lake.","Chèo thuyền kayak trên mặt hồ phẳng lặng.")
  ],
  result:log=>story(log,"What a refreshing afternoon by the lake!","Một buổi chiều bên hồ thật sảng khoái!",
   [["spread_picnic_blanket","spread the picnic blanket","trải thảm dã ngoại"],["take_cold_juice","grabbed a cold juice","lấy nước cam mát lạnh"],["eat_picnic_sandwich","ate a homemade sandwich","ăn bánh sandwich"],["put_on_life_jacket","put on a life jacket","mặc áo phao"],["paddle_the_kayak","paddled the kayak across the lake","chèo thuyền kayak trên hồ"]],
   "Nothing beats a picnic and kayaking outdoors!","Không gì tuyệt bằng dã ngoại và chèo kayak ngoài trời!")},

 {id:"outdoor_safe_hiker",title_en:"Trail Explorer & Safe Camper",title_vi:"Khám phá đường mòn & Cắm trại an toàn",room:"outdoor",topic:"outdoor",urgency:"normal",giver:RANGER_G,
  desc_vi:"Hỏi kiểm lâm về đường mòn, cất bình nước vào ba lô, leo lên đồi ngắm cảnh qua ống nhòm và dập lửa trại an toàn.",
  request:{en:"Ready to hike the ridge? Check trail safety with me, pack water, hike to the lookout, and practice fire safety!",
           vi:"Sẵn sàng leo đồi chưa? Hãy hỏi tôi về độ an toàn, cất nước vào ba lô, leo lên điểm ngắm cảnh và thực hành dập lửa an toàn nhé!"},
  steps:[
   st(1,"🤠","Ask the ranger about the trail","Hỏi kiểm lâm về đường mòn",["ask_the_ranger"],W=>W.od_ranger==="asked","ask_the_ranger","Click the ranger station cabin.","Nhấn vào trạm kiểm lâm."),
   st(2,"🎒","Pack a full water bottle","Cất bình nước vào ba lô",["pack_water_bottle"],W=>W.od_bottle==="packed","pack_water_bottle","Click the green hiking backpack on the tree stump.","Nhấn vào chiếc ba lô leo núi trên gốc cây."),
   st(3,"🥾","Hike up to the lookout","Leo lên điểm ngắm cảnh",["hike_to_lookout"],W=>W.od_hiked==="yes","hike_to_lookout","Click the scenic lookout on the hill.","Nhấn vào điểm ngắm cảnh trên đồi."),
   st(4,"🔭","Look through the binoculars","Nhìn qua ống nhòm",["use_binoculars"],W=>W.od_binoculars==="yes","use_binoculars","Look at the pine valley through the binoculars.","Ngắm nhìn thung lũng thông qua ống nhòm."),
   st(5,"💧","Put out the campfire safely","Dập lửa trại an toàn",["put_out_campfire","pack_up_campsite"],W=>W.od_fire==="out"||W.od_packed==="yes",W=>W.od_fire==="lit"?"put_out_campfire":"pack_up_campsite","Extinguish the campfire or pack up your campsite cleanly.","Dập tắt hoàn toàn lửa trại hoặc thu dọn trại sạch sẽ.")
  ],
  result:log=>story(log,"An unforgettable and safe mountain adventure!","Một chuyến khám phá núi đồi đáng nhớ và an toàn!",
   [["ask_the_ranger","asked the ranger about the trail","hỏi kiểm lâm về đường mòn"],["pack_water_bottle","packed a full water bottle","cất bình nước đầy vào ba lô"],["hike_to_lookout","hiked up to the scenic lookout","leo lên điểm ngắm cảnh"],["use_binoculars","looked through the binoculars","nhìn qua ống nhòm"],["put_out_campfire","put out the campfire safely","dập lửa trại an toàn"]],
   "You're an awesome trail explorer!","Bạn đúng là một nhà thám hiểm đường mòn tuyệt vời!")}
];

const T=(id,en,vi,anyOf,len,lvi,o)=>Object.assign({id,title_en:en,title_vi:vi,anyOf,learn_en:len,learn_vi:lvi},o||{});
const CHALLENGES=[
 {id:"outdoor_weekend_camp",icon:"⛺",title_en:"Weekend Camping Adventure",title_vi:"Chuyến cắm trại cuối tuần",
  goal_vi:"Xem bản đồ, dựng lều, nhóm lửa nướng kẹo marshmallow, leo lên điểm ngắm cảnh và dập lửa an toàn.",minutes:7,
  requires:["go_outdoor","set_up_the_tent","light_the_campfire"],tasks:[
   T("map","Check the trail map","Xem bản đồ đường mòn",["check_trail_map"],"trail map","bản đồ đường mòn",{free:true}),
   T("ranger","Ask the park ranger","Hỏi kiểm lâm",["ask_the_ranger"],"safe to hike","an toàn để leo bộ",{free:true}),
   T("tent","Pitch the camping tent","Dựng lều cắm trại",["set_up_the_tent"],"pitch a tent","dựng lều"),
   T("wood","Gather dry firewood","Gom củi khô",["gather_dry_firewood"],"dry firewood","củi khô"),
   T("fire","Light the campfire","Nhóm lửa trại",["light_the_campfire"],"light a campfire","nhóm lửa trại"),
   T("roast","Roast marshmallows","Nướng kẹo marshmallow",["roast_marshmallows"],"roast over the fire","nướng trên lửa"),
   T("picnic","Eat a picnic sandwich","Ăn bánh mì kẹp dã ngoại",["eat_picnic_sandwich"],"tastes better outdoors","ăn ngoài trời ngon hơn"),
   T("hike","Hike to the lookout","Leo lên điểm ngắm cảnh",["hike_to_lookout","use_binoculars"],"scenic lookout","điểm ngắm cảnh"),
   T("kayak","Paddle the kayak","Chèo thuyền kayak",["paddle_the_kayak"],"paddle across","chèo qua hồ"),
   T("out","Put out the campfire safely","Dập lửa trại an toàn",["put_out_campfire","pack_up_campsite"],"put out the fire","dập tắt lửa")]}
];

const VOCAB_PACK=Object.entries(ODV).map(([k,[ipa,vi]])=>({id:"od_"+k,en:k.replace(/_/g," "),ipa,vi,cat:"outdoor",room:"outdoor"}));

const outdoor={
 id:"outdoor",name:"Campground",nameVi:"Khu dã ngoại",topic:"outdoor",
 entry:{x:96,y:604,d:1},
 shellSvg:OD_SHELL,worldSvg:OD_WORLD,css:OD_CSS,
 spots:OD_SPOTS,objects:OD_OBJECTS,actions:ACTIONS,
 props:OD_PROPS,W0:OD_W0,applyState:applyOutdoor,
 catalog:VOCAB_PACK,
 obstacles:[{x1:415,x2:585,y1:385,y2:455}]
};
root.ELW_ROOMS=root.ELW_ROOMS||{};
root.ELW_ROOMS.outdoor=outdoor;
root.ELW_OUTDOOR={topic:"outdoor",rooms:["outdoor"],id:"outdoor",npcs:NPCS,reply,missions:MISSIONS,challenges:CHALLENGES,vocab:VOCAB_PACK,lines:LINES,room:outdoor,objects:OD_OBJECTS,actions:ACTIONS,W0:OD_W0,worldSvg:OD_WORLD};
if(typeof module!=="undefined"&&module.exports)module.exports=root.ELW_OUTDOOR;
})();
