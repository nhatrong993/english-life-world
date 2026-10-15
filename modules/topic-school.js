/* =====================================================================
   TOPIC: AT SCHOOL (Trường học / Lớp học — Sunnyvale Academy Room 204)
   2.5D SVG scene (1000×640) · 20 interactive objects · 104 actions
   2 NPCs (English Teacher 👩‍🏫 + School Librarian 📚) · 6 missions · 3 challenges · 24 vocab
   ===================================================================== */
(function(){
"use strict";

const SCV={
 classroom:["/ˈklæsruːm/","phòng học / lớp học"],
 schedule:["/ˈskedʒuːl/","thời khóa biểu"],
 whiteboard:["/ˈwaɪtbɔːrd/","bảng trắng"],
 eraser:["/ɪˈreɪsər/","đồ lau bảng / cục tẩy"],
 teacher:["/ˈtiːtʃər/","giáo viên"],
 homework:["/ˈhoʊmwɜːrk/","bài tập về nhà"],
 assignment:["/əˈsaɪnmənt/","bài tập được giao"],
 textbook:["/ˈtekstbʊk/","sách giáo khoa"],
 notebook:["/ˈnoʊtbʊk/","vở ghi chép"],
 take_notes:["/teɪk noʊts/","ghi chép bài"],
 raise_hand:["/reɪz hænd/","giơ tay phát biểu"],
 pronounce:["/prəˈnaʊns/","phát âm"],
 backpack:["/ˈbækpæk/","cặp sách / ba lô đi học"],
 librarian:["/laɪˈbreriən/","thủ thư"],
 borrow:["/ˈbɑːroʊ/","mượn (sách)"],
 storybook:["/ˈstɔːribʊk/","sách truyện"],
 globe:["/ɡloʊb/","quả địa cầu"],
 continent:["/ˈkɑːntɪnənt/","châu lục"],
 microscope:["/ˈmaɪkrəskoʊp/","kính hiển vi"],
 locker:["/ˈlɑːkər/","tủ đồ cá nhân"],
 classmate:["/ˈklæsmeɪt/","bạn cùng lớp"],
 break_time:["/breɪk taɪm/","giờ giải lao"],
 projector:["/prəˈdʒektər/","máy chiếu"],
 dictionary:["/ˈdɪkʃəneri/","từ điển"]
};
const V=(...ks)=>ks.filter(k=>SCV[k]).map(k=>[k.replace(/_/g," "),SCV[k][0],SCV[k][1]]);

function A(id,obj,label,labelVi,sentence,vi,keywords,also,grammarNote,chunks,disc,examples,pre,seq,vocab,extra){
 const a={id,obj,label,labelVi,sentence,vi,keywords,also,grammarNote,chunks,disc,examples,pre,seq,vocab:vocab||[]};
 if(extra)Object.assign(a,extra);return a;
}

const SC_SHELL=`
<defs>
 <linearGradient id="scWall" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#f7f3e8"/>
  <stop offset=".68" stop-color="#ede5d0"/>
  <stop offset="1" stop-color="#dfd3b8"/>
 </linearGradient>
 <linearGradient id="scFloor" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#d7b384"/>
  <stop offset=".5" stop-color="#c69c6a"/>
  <stop offset="1" stop-color="#b08452"/>
 </linearGradient>
 <linearGradient id="scSky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#87cefa"/>
  <stop offset="1" stop-color="#e0f6ff"/>
 </linearGradient>
 <linearGradient id="scBoard" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#ffffff"/>
  <stop offset="1" stop-color="#eef5f9"/>
 </linearGradient>
</defs>

<!-- Back classroom wall & left window wall -->
<polygon points="0,0 1000,0 1000,395 160,395 0,485" fill="url(#scWall)"/>
<polygon points="0,0 160,0 160,395 0,485" fill="#e6dcc4"/>

<!-- Wainscoting / lower wall wood trim -->
<polygon points="160,315 1000,315 1000,395 160,395" fill="#d8c39e" stroke="#b89b6e" stroke-width="2"/>
<polygon points="0,395 160,315 160,395 0,485" fill="#cbb289" stroke="#b89b6e" stroke-width="2"/>

<!-- Classroom header banner & clock -->
<g transform="translate(360,18)">
 <rect x="0" y="0" width="320" height="36" rx="8" fill="#2b579a" stroke="#1b3a6b" stroke-width="2.5"/>
 <text x="160" y="23" text-anchor="middle" font-size="14" font-weight="800" fill="#fff" letter-spacing="1">🏫 SUNNYVALE ENGLISH CLASS 204</text>
</g>
<g transform="translate(735,36)">
 <circle cx="0" cy="0" r="22" fill="#fff" stroke="#455a64" stroke-width="3.5"/>
 <line x1="0" y1="0" x2="0" y2="-13" stroke="#263238" stroke-width="2.5" stroke-linecap="round"/>
 <line x1="0" y1="0" x2="10" y2="4" stroke="#e53935" stroke-width="2" stroke-linecap="round"/>
 <circle cx="0" cy="0" r="2.5" fill="#263238"/>
</g>

<!-- Wooden Classroom Floor -->
<polygon points="160,395 1000,395 1000,640 0,640 0,485" fill="url(#scFloor)"/>
<g stroke="#9c7243" stroke-width="1.2" opacity=".45">
 <line x1="120" y1="440" x2="1000" y2="440"/>
 <line x1="65" y1="490" x2="1000" y2="490"/>
 <line x1="10" y1="545" x2="1000" y2="545"/>
 <line x1="0" y1="600" x2="1000" y2="600"/>
 <line x1="160" y1="395" x2="40" y2="640"/>
 <line x1="360" y1="395" x2="280" y2="640"/>
 <line x1="560" y1="395" x2="520" y2="640"/>
 <line x1="760" y1="395" x2="760" y2="640"/>
</g>
`;

const SC_WORLD=`
<!-- 15. SUNNY WINDOW & WEATHER CHART (left wall upper) -->
<g id="o-windowbench" class="obj sc-obj" data-obj="windowbench" data-base="315">
 <rect class="hit" x="15" y="70" width="135" height="175"/>
 <g transform="translate(22,85)">
  <polygon points="0,35 112,-15 112,135 0,185" fill="url(#scSky)" stroke="#6d4c41" stroke-width="4.5"/>
  <circle cx="42" cy="48" r="16" fill="#fff59d" opacity=".95"/>
  <path d="M8,135 Q48,108 88,125 L108,120 L108,133 L4,180 Z" fill="#81c784"/>
  <line x1="56" y1="10" x2="56" y2="160" stroke="#6d4c41" stroke-width="3"/>
  <line x1="0" y1="105" x2="112" y2="55" stroke="#6d4c41" stroke-width="3"/>
 </g>
 <rect x="108" y="88" width="42" height="52" rx="4" fill="#fffde7" stroke="#fbc02d" stroke-width="2"/>
 <text x="129" y="102" text-anchor="middle" font-size="6.5" font-weight="800" fill="#f57f17">WEATHER</text>
 <text x="129" y="122" text-anchor="middle" font-size="14">☀️</text>
 <text class="label" x="82" y="76" text-anchor="middle">window &amp; weather chart</text>
</g>

<!-- 16. SMART CEILING PROJECTOR (above whiteboard) -->
<g id="o-projector" class="obj sc-obj" data-obj="projector" data-base="385">
 <rect class="hit" x="455" y="42" width="100" height="44"/>
 <line x1="505" y1="0" x2="505" y2="52" stroke="#546e7a" stroke-width="4"/>
 <rect x="475" y="50" width="60" height="20" rx="5" fill="#eceff1" stroke="#37474f" stroke-width="2"/>
 <circle cx="505" cy="60" r="6" fill="#29b6f6" stroke="#0277bd" stroke-width="1.5"/>
 <polygon class="sc-proj-beam" points="495,68 515,68 620,175 390,175" fill="#fff59d" opacity="0"/>
 <text class="label" x="505" y="48" text-anchor="middle">smart projector</text>
</g>

<!-- 1. CLASSROOM DOOR & NOTICEBOARD (left entrance) -->
<g id="o-classdoor" class="obj sc-obj" data-obj="classdoor" data-base="465">
 <rect class="hit" x="30" y="215" width="175" height="250"/>
 <polygon points="34,265 128,220 128,415 34,465" fill="#8d5524" stroke="#4e2c0c" stroke-width="3"/>
 <polygon points="46,278 116,245 116,320 46,353" fill="#b3e5fc" stroke="#5d3a1a" stroke-width="2.5"/>
 <circle cx="112" cy="355" r="5" fill="#ffd54f" stroke="#5d4037" stroke-width="1.5"/>
 <!-- Noticeboard with Class Schedule next to door -->
 <rect x="135" y="215" width="68" height="86" rx="4" fill="#d7a86e" stroke="#6d4c41" stroke-width="3"/>
 <rect x="142" y="223" width="54" height="32" fill="#fff9c4" stroke="#fbc02d" stroke-width="1"/>
 <text x="169" y="235" text-anchor="middle" font-size="7" font-weight="800" fill="#37474f">SCHEDULE</text>
 <text x="169" y="247" text-anchor="middle" font-size="6.2" fill="#1565c0">08:00 English</text>
 <rect x="143" y="260" width="24" height="28" fill="#e1f5fe"/>
 <rect x="171" y="260" width="24" height="28" fill="#f8bbd0"/>
 <circle class="sc-sched-badge" cx="169" cy="219" r="6" fill="#43a047" opacity="0"/>
 <text class="label" x="118" y="208" text-anchor="middle">classroom door</text>
</g>

<!-- 14. SCHOOL HEALTH & FIRST-AID KIT (wall beside door) -->
<g id="o-firstaidbox" class="obj sc-obj" data-obj="firstaidbox" data-base="410">
 <rect class="hit" x="135" y="305" width="52" height="58"/>
 <rect x="140" y="310" width="42" height="46" rx="5" fill="#ffffff" stroke="#e53935" stroke-width="2.5"/>
 <rect x="157" y="321" width="8" height="24" rx="1.5" fill="#e53935"/>
 <rect x="149" y="329" width="24" height="8" rx="1.5" fill="#e53935"/>
 <text class="label" x="161" y="303" text-anchor="middle">first-aid kit</text>
</g>

<!-- 2. INTERACTIVE WHITEBOARD (center back wall) -->
<g id="o-whiteboard" class="obj sc-obj" data-obj="whiteboard" data-base="390">
 <rect class="hit" x="320" y="72" width="370" height="196"/>
 <rect x="330" y="74" width="350" height="182" rx="6" fill="url(#scBoard)" stroke="#546e7a" stroke-width="6"/>
 <rect x="322" y="254" width="366" height="10" rx="3" fill="#78909c" stroke="#37474f" stroke-width="1.5"/>
 <!-- Markers & eraser on tray -->
 <rect x="440" y="248" width="28" height="6" rx="2" fill="#e53935"/>
 <rect x="474" y="248" width="28" height="6" rx="2" fill="#1e88e5"/>
 <rect x="520" y="245" width="34" height="9" rx="2" fill="#37474f"/>
 <!-- Default lesson text on board -->
 <g class="sc-board-lesson">
  <text x="355" y="106" font-size="14" font-weight="800" fill="#1565c0">Unit 5: Daily Communication</text>
  <text x="355" y="134" font-size="12.5" font-weight="700" fill="#2e7d32">• Q: How do you get to school?</text>
  <text x="355" y="158" font-size="12" fill="#455a64">• Vocabulary: textbook, schedule, globe</text>
 </g>
 <!-- Student written answer (shown when write_answer_on_board) -->
 <g class="sc-board-answer" opacity="0">
  <rect x="352" y="174" width="300" height="36" rx="6" fill="#e8f5e9" stroke="#43a047" stroke-width="1.5" stroke-dasharray="4,2"/>
  <text x="364" y="197" font-size="13" font-weight="800" fill="#d84315">✍️ A: I ride my bicycle to school! ✓</text>
 </g>
 <!-- Clean sparkle (shown when clean_the_board) -->
 <g class="sc-board-sparkle" opacity="0">
  <text x="505" y="165" text-anchor="middle" font-size="18" font-weight="800" fill="#0288d1">✨ Spotless &amp; Ready for Next Lesson! ✨</text>
 </g>
 <text class="label" x="505" y="70" text-anchor="middle">whiteboard</text>
</g>

<!-- 3. TEACHER'S DESK & ENGLISH TEACHER NPC (left-center front) -->
<g id="o-teacherdesk" class="obj sc-obj" data-obj="teacherdesk" data-base="436">
 <rect class="hit" x="188" y="240" width="160" height="200"/>
 <!-- Teacher NPC standing behind desk -->
 <g transform="translate(268,262)">
  <ellipse cx="0" cy="118" rx="24" ry="8" fill="rgba(0,0,0,.16)"/>
  <path d="M-16,66 L16,66 L20,108 L-20,108 Z" fill="#3949ab"/>
  <rect x="-18" y="28" width="36" height="42" rx="8" fill="#5c6bc0" stroke="#283593" stroke-width="2"/>
  <polygon points="-8,28 0,44 8,28" fill="#fff"/>
  <circle cx="0" cy="-16" r="9" fill="#4e342e"/>
  <circle cx="0" cy="6" r="16" fill="#ffdfc4" stroke="#5d4037" stroke-width="1.8"/>
  <path d="M-16,2 Q0,-14 16,2 Q14,-12 0,-12 Q-14,-12 -16,2 Z" fill="#4e342e"/>
  <rect x="-11" y="1" width="9" height="6" rx="2" fill="none" stroke="#263238" stroke-width="1.6"/>
  <rect x="2" y="1" width="9" height="6" rx="2" fill="none" stroke="#263238" stroke-width="1.6"/>
  <line x1="-2" y1="4" x2="2" y2="4" stroke="#263238" stroke-width="1.4"/>
  <path d="M-5,12 Q0,16 5,12" fill="none" stroke="#8d6e63" stroke-width="1.8" stroke-linecap="round"/>
 </g>
 <!-- Teacher desk -->
 <polygon points="195,355 340,355 352,378 183,378" fill="#a1662f" stroke="#5d3a1a" stroke-width="2.5"/>
 <rect x="192" y="378" width="152" height="58" rx="3" fill="#8d5524" stroke="#5d3a1a" stroke-width="2.5"/>
 <polygon points="222,340 258,340 264,364 216,364" fill="#cfd8dc" stroke="#455a64" stroke-width="2"/>
 <circle cx="315" cy="356" r="8" fill="#e53935" stroke="#b71c1c" stroke-width="1.5"/>
 <path d="M315,347 Q319,343 322,346" fill="none" stroke="#2e7d32" stroke-width="2"/>
 <g class="sc-hw-stack" opacity="0">
  <rect x="275" y="346" width="28" height="18" rx="2" fill="#fff" stroke="#1565c0" stroke-width="1.8"/>
  <line x1="280" y1="352" x2="298" y2="352" stroke="#1565c0" stroke-width="1.5"/>
  <text x="289" y="361" text-anchor="middle" font-size="8" font-weight="800" fill="#e53935">A+</text>
 </g>
 <rect x="208" y="392" width="120" height="22" rx="5" fill="#fff8e1" stroke="#f57f17" stroke-width="1.5"/>
 <text x="268" y="407" text-anchor="middle" font-size="9.5" font-weight="800" fill="#e65100">👩‍🏫 Ms. Claire (Teacher)</text>
 <text class="label" x="268" y="232" text-anchor="middle">teacher's desk</text>
</g>

<!-- 13. CLASSROOM MUSIC STAND & UKULELE (between teacher desk and whiteboard) -->
<g id="o-musicstand" class="obj sc-obj" data-obj="musicstand" data-base="435">
 <rect class="hit" x="348" y="320" width="56" height="118"/>
 <ellipse cx="376" cy="432" rx="18" ry="6" fill="rgba(0,0,0,.16)"/>
 <line x1="376" y1="362" x2="376" y2="432" stroke="#37474f" stroke-width="3.5"/>
 <polygon points="354,336 398,336 392,364 360,364" fill="#263238" stroke="#cfd8dc" stroke-width="1.5"/>
 <rect x="362" y="340" width="28" height="20" fill="#fff9c4"/>
 <text x="376" y="354" text-anchor="middle" font-size="11" fill="#d84315">♪♫</text>
 <ellipse cx="392" cy="410" rx="8" ry="12" fill="#ffb74d" stroke="#e65100" stroke-width="1.5"/>
 <line x1="392" y1="382" x2="392" y2="400" stroke="#5d4037" stroke-width="3"/>
 <text class="label" x="376" y="314" text-anchor="middle">music stand</text>
</g>

<!-- 12. ART EASEL & PAINT CORNER (right of whiteboard) -->
<g id="o-artcorner" class="obj sc-obj" data-obj="artcorner" data-base="430">
 <rect class="hit" x="620" y="298" width="66" height="134"/>
 <line x1="652" y1="306" x2="632" y2="428" stroke="#8d5524" stroke-width="4" stroke-linecap="round"/>
 <line x1="652" y1="306" x2="672" y2="428" stroke="#8d5524" stroke-width="4" stroke-linecap="round"/>
 <line x1="652" y1="316" x2="652" y2="424" stroke="#6d4c41" stroke-width="3"/>
 <rect x="630" y="322" width="44" height="56" rx="3" fill="#fff" stroke="#bcaaa4" stroke-width="2"/>
 <circle cx="645" cy="342" r="8" fill="#ffca28"/>
 <path d="M634,370 Q652,352 670,370 Z" fill="#66bb6a"/>
 <ellipse cx="662" cy="390" rx="12" ry="7" fill="#d7ccc8" stroke="#5d4037" stroke-width="1.5"/>
 <circle cx="658" cy="389" r="2.5" fill="#e53935"/><circle cx="665" cy="391" r="2.5" fill="#1e88e5"/>
 <text class="label" x="652" y="294" text-anchor="middle">art easel</text>
</g>

<!-- 7. WORLD GLOBE & MAP STAND (center-right near board) -->
<g id="o-globe" class="obj sc-obj" data-obj="globe" data-base="420">
 <rect class="hit" x="692" y="316" width="62" height="110"/>
 <ellipse cx="722" cy="418" rx="22" ry="8" fill="rgba(0,0,0,.18)"/>
 <rect x="718" y="375" width="8" height="40" fill="#78909c" stroke="#37474f" stroke-width="1.8"/>
 <ellipse cx="722" cy="415" rx="18" ry="6" fill="#546e7a" stroke="#263238" stroke-width="2"/>
 <g class="sc-globe-sphere" style="transform-origin:722px 350px">
  <circle cx="722" cy="350" r="24" fill="#29b6f6" stroke="#0277bd" stroke-width="2.2"/>
  <path d="M708,340 Q718,334 724,344 Q730,352 718,362 Q708,356 708,340 Z" fill="#66bb6a"/>
  <path d="M728,336 Q738,342 736,356 Q728,354 728,336 Z" fill="#81c784"/>
 </g>
 <path d="M722,320 A30,30 0 0,1 722,380" fill="none" stroke="#ffb300" stroke-width="3.5"/>
 <text class="label" x="722" y="310" text-anchor="middle">world globe</text>
</g>

<!-- 6. LIBRARY CORNER & SCHOOL LIBRARIAN NPC (right back wall) -->
<g id="o-bookshelf" class="obj sc-obj" data-obj="bookshelf" data-base="410">
 <rect class="hit" x="776" y="130" width="164" height="270"/>
 <rect x="780" y="135" width="155" height="255" rx="6" fill="#8d5524" stroke="#4e2c0c" stroke-width="3.5"/>
 <rect x="790" y="148" width="135" height="52" fill="#5d3a1a"/>
 <rect x="790" y="210" width="135" height="52" fill="#5d3a1a"/>
 <rect x="790" y="272" width="135" height="52" fill="#5d3a1a"/>
 <g>
  <rect x="796" y="156" width="13" height="44" fill="#e53935"/><rect x="811" y="160" width="13" height="40" fill="#1e88e5"/>
  <rect x="826" y="154" width="15" height="46" fill="#43a047"/><rect x="843" y="158" width="13" height="42" fill="#fb8c00"/>
  <rect x="858" y="155" width="14" height="45" fill="#8e24aa"/><rect x="874" y="162" width="13" height="38" fill="#00acc1"/>
  <rect x="798" y="218" width="15" height="44" fill="#fdd835"/><rect x="815" y="215" width="14" height="47" fill="#3949ab"/>
  <rect x="831" y="220" width="13" height="42" fill="#d81b60"/><rect x="846" y="216" width="15" height="46" fill="#00897b"/>
  <rect class="sc-shelf-storybook" x="865" y="216" width="18" height="46" fill="#ff7043" stroke="#fff" stroke-width="1.2"/>
 </g>
 <!-- Librarian NPC standing beside bookshelf -->
 <g transform="translate(912,282)">
  <ellipse cx="0" cy="112" rx="22" ry="7" fill="rgba(0,0,0,.16)"/>
  <rect x="-14" y="64" width="12" height="44" rx="4" fill="#37474f"/>
  <rect x="2" y="64" width="12" height="44" rx="4" fill="#37474f"/>
  <rect x="-17" y="24" width="34" height="42" rx="8" fill="#00897b" stroke="#004d40" stroke-width="2"/>
  <circle cx="0" cy="4" r="15" fill="#ffdfc4" stroke="#5d4037" stroke-width="1.8"/>
  <path d="M-15,0 Q0,-15 15,0 Q12,-14 0,-14 Q-12,-14 -15,0 Z" fill="#3e2723"/>
  <circle cx="-5" cy="4" r="2" fill="#263238"/><circle cx="5" cy="4" r="2" fill="#263238"/>
  <path d="M-4,11 Q0,14 4,11" fill="none" stroke="#6d4c41" stroke-width="1.8" stroke-linecap="round"/>
 </g>
 <rect x="792" y="342" width="132" height="22" rx="5" fill="#e0f2f1" stroke="#00695c" stroke-width="1.5"/>
 <text x="858" y="357" text-anchor="middle" font-size="9.5" font-weight="800" fill="#004d40">📚 Mr. Leo (Librarian)</text>
 <text class="label" x="858" y="125" text-anchor="middle">library bookshelf</text>
</g>

<!-- 18. SCHOOL HONOR TROPHY CASE (far right wall) -->
<g id="o-trophycase" class="obj sc-obj" data-obj="trophycase" data-base="435">
 <rect class="hit" x="942" y="210" width="54" height="215"/>
 <rect x="945" y="220" width="48" height="198" rx="4" fill="#e1f5fe" stroke="#5d4037" stroke-width="3"/>
 <line x1="945" y1="285" x2="993" y2="285" stroke="#5d4037" stroke-width="2.5"/>
 <line x1="945" y1="350" x2="993" y2="350" stroke="#5d4037" stroke-width="2.5"/>
 <text x="969" y="268" text-anchor="middle" font-size="20">🏆</text>
 <text x="969" y="332" text-anchor="middle" font-size="18">🥇</text>
 <text class="label" x="965" y="208" text-anchor="middle">trophy case</text>
</g>

<!-- 17. COZY READING CORNER RUG (right floor near bookshelf) -->
<g id="o-readingrug" class="obj sc-obj" data-obj="readingrug" data-base="485">
 <rect class="hit" x="765" y="425" width="145" height="60"/>
 <ellipse cx="838" cy="455" rx="68" ry="26" fill="#4db6ac" stroke="#00796b" stroke-width="2.5" opacity=".9"/>
 <ellipse cx="838" cy="455" rx="48" ry="17" fill="#80cbc4" opacity=".7"/>
 <circle cx="808" cy="450" r="10" fill="#ff8a65" stroke="#d84315" stroke-width="1.5"/>
 <circle cx="868" cy="452" r="10" fill="#ffd54f" stroke="#f57f17" stroke-width="1.5"/>
 <text class="label" x="838" y="422" text-anchor="middle">reading corner rug</text>
</g>

<!-- 9. STUDENT LOCKER (left foreground wall) -->
<g id="o-locker" class="obj sc-obj" data-obj="locker" data-base="525">
 <rect class="hit" x="20" y="332" width="104" height="198"/>
 <rect x="24" y="340" width="84" height="185" rx="5" fill="#42a5f5" stroke="#1565c0" stroke-width="3"/>
 <line x1="66" y1="340" x2="66" y2="525" stroke="#1565c0" stroke-width="2.5"/>
 <rect x="32" y="355" width="26" height="6" rx="2" fill="#1e88e5"/>
 <rect x="74" y="355" width="26" height="6" rx="2" fill="#1e88e5"/>
 <circle cx="58" cy="432" r="4" fill="#ffd54f"/>
 <circle cx="100" cy="432" r="4" fill="#ffd54f"/>
 <g class="sc-locker-open" opacity="0">
  <rect x="68" y="344" width="38" height="176" fill="#263238"/>
  <path class="sc-locker-jacket" d="M76,375 L98,375 L102,435 L72,435 Z" fill="#ff7043" stroke="#d84315" stroke-width="1.5" opacity="0"/>
  <polygon points="106,340 132,326 132,508 106,525" fill="#64b5f6" stroke="#1565c0" stroke-width="2.5"/>
 </g>
 <text class="label" x="66" y="328" text-anchor="middle">student locker</text>
</g>

<!-- 10. WATER COOLER DISPENSER (next to locker) -->
<g id="o-watercooler" class="obj sc-obj" data-obj="watercooler" data-base="512">
 <rect class="hit" x="128" y="378" width="48" height="140"/>
 <ellipse cx="152" cy="512" rx="24" ry="8" fill="rgba(0,0,0,.18)"/>
 <rect x="134" y="428" width="36" height="82" rx="5" fill="#eceff1" stroke="#607d8b" stroke-width="2.5"/>
 <rect x="140" y="446" width="24" height="22" rx="3" fill="#cfd8dc"/>
 <circle cx="147" cy="454" r="3" fill="#e53935"/>
 <circle cx="157" cy="454" r="3" fill="#1e88e5"/>
 <rect x="137" y="382" width="30" height="46" rx="10" fill="#81d4fa" stroke="#0288d1" stroke-width="2" opacity=".88"/>
 <rect x="142" y="395" width="20" height="28" rx="4" fill="#29b6f6" opacity=".6"/>
 <text class="label" x="152" y="372" text-anchor="middle">water dispenser</text>
</g>

<!-- 11. COMPUTER LEARNING STATION (left-center foreground) -->
<g id="o-computerstation" class="obj sc-obj" data-obj="computerstation" data-base="568">
 <rect class="hit" x="192" y="468" width="96" height="104"/>
 <ellipse cx="240" cy="566" rx="44" ry="12" fill="rgba(0,0,0,.16)"/>
 <polygon points="200,506 280,506 288,526 192,526" fill="#b0bec5" stroke="#455a64" stroke-width="2"/>
 <rect x="202" y="526" width="8" height="38" fill="#455a64"/>
 <rect x="270" y="526" width="8" height="38" fill="#455a64"/>
 <rect x="216" y="472" width="48" height="30" rx="4" fill="#263238" stroke="#37474f" stroke-width="2"/>
 <rect x="220" y="476" width="40" height="22" rx="2" fill="#4fc3f7"/>
 <rect x="236" y="502" width="8" height="6" fill="#546e7a"/>
 <text class="label" x="240" y="464" text-anchor="middle">computer station</text>
</g>

<!-- 19. ECO RECYCLING BINS (between computer station and student desk) -->
<g id="o-recyclingbin" class="obj sc-obj" data-obj="recyclingbin" data-base="562">
 <rect class="hit" x="304" y="492" width="66" height="74"/>
 <polygon points="308,504 334,504 330,558 312,558" fill="#43a047" stroke="#1b5e20" stroke-width="2"/>
 <polygon points="340,504 366,504 362,558 344,558" fill="#1e88e5" stroke="#0d47a1" stroke-width="2"/>
 <text x="321" y="535" text-anchor="middle" font-size="11" fill="#fff">♻️</text>
 <text x="353" y="535" text-anchor="middle" font-size="10" fill="#fff">📄</text>
 <text class="label" x="337" y="488" text-anchor="middle">recycling bins</text>
</g>

<!-- 4. STUDENT DESK & CHAIR (center classroom) -->
<g id="o-studentdesk" class="obj sc-obj" data-obj="studentdesk" data-base="555">
 <rect class="hit" x="378" y="454" width="186" height="106"/>
 <ellipse cx="470" cy="555" rx="78" ry="20" fill="rgba(0,0,0,.16)"/>
 <rect x="440" y="492" width="60" height="12" rx="4" fill="#d7a86e" stroke="#6d4c41" stroke-width="2"/>
 <rect x="444" y="504" width="8" height="42" fill="#546e7a"/>
 <rect x="488" y="504" width="8" height="42" fill="#546e7a"/>
 <polygon points="395,462 545,462 560,492 380,492" fill="#e6be8a" stroke="#6d4c41" stroke-width="2.5"/>
 <rect x="392" y="492" width="156" height="18" rx="3" fill="#b8864b" stroke="#6d4c41" stroke-width="2"/>
 <rect x="400" y="510" width="10" height="45" fill="#455a64"/>
 <rect x="530" y="510" width="10" height="45" fill="#455a64"/>
 <g class="sc-book-closed">
  <polygon points="420,468 468,468 474,484 416,484" fill="#1e88e5" stroke="#0d47a1" stroke-width="1.8"/>
  <text x="445" y="479" text-anchor="middle" font-size="7" font-weight="800" fill="#fff">ENGLISH</text>
 </g>
 <g class="sc-book-open" opacity="0">
  <polygon points="412,466 476,466 482,486 406,486" fill="#fff" stroke="#1565c0" stroke-width="2"/>
  <line x1="444" y1="466" x2="444" y2="486" stroke="#90caf9" stroke-width="1.5"/>
 </g>
 <g class="sc-desk-notebook" opacity="0">
  <polygon points="492,468 536,468 540,485 488,485" fill="#fff9c4" stroke="#fbc02d" stroke-width="1.8"/>
  <line class="sc-notes-lines" x1="496" y1="475" x2="532" y2="475" stroke="#1565c0" stroke-width="1.8" opacity="0"/>
  <line class="sc-notes-lines" x1="496" y1="480" x2="526" y2="480" stroke="#1565c0" stroke-width="1.8" opacity="0"/>
 </g>
 <text class="label" x="470" y="450" text-anchor="middle">student desk</text>
</g>

<!-- 5. SCHOOL BACKPACK (beside student desk) -->
<g id="o-schoolbag" class="obj sc-obj" data-obj="schoolbag" data-base="548">
 <rect class="hit" x="565" y="472" width="60" height="82"/>
 <ellipse cx="595" cy="548" rx="30" ry="10" fill="rgba(0,0,0,.2)"/>
 <path d="M572,542 Q570,488 595,486 Q620,488 618,542 Z" fill="#e53935" stroke="#b71c1c" stroke-width="2.5"/>
 <path d="M578,505 Q595,514 612,505" fill="none" stroke="#ffcdd2" stroke-width="2.2"/>
 <rect x="581" y="514" width="28" height="22" rx="5" fill="#c62828" stroke="#ffd54f" stroke-width="1.5"/>
 <rect class="sc-bag-notebook" x="584" y="478" width="22" height="14" rx="2" fill="#fff59d" stroke="#f9a825" stroke-width="1.5"/>
 <text class="label" x="595" y="468" text-anchor="middle">school backpack</text>
</g>

<!-- 20. HEALTHY SNACK & LUNCH CUBBY (right of backpack) -->
<g id="o-lunchcubby" class="obj sc-obj" data-obj="lunchcubby" data-base="562">
 <rect class="hit" x="630" y="485" width="66" height="82"/>
 <rect x="634" y="492" width="58" height="68" rx="5" fill="#ffcc80" stroke="#ef6c00" stroke-width="2.2"/>
 <line x1="634" y1="526" x2="692" y2="526" stroke="#ef6c00" stroke-width="2"/>
 <rect x="642" y="502" width="22" height="18" rx="3" fill="#66bb6a" stroke="#2e7d32" stroke-width="1.5"/>
 <circle cx="676" cy="512" r="7" fill="#e53935"/>
 <rect x="646" y="534" width="34" height="18" rx="3" fill="#4fc3f7" stroke="#0277bd" stroke-width="1.5"/>
 <text class="label" x="663" y="480" text-anchor="middle">lunch cubby</text>
</g>

<!-- 8. SCIENCE EXPERIMENT TABLE & MICROSCOPE (right foreground) -->
<g id="o-sciencetable" class="obj sc-obj" data-obj="sciencetable" data-base="575">
 <rect class="hit" x="702" y="468" width="192" height="114"/>
 <ellipse cx="795" cy="575" rx="85" ry="22" fill="rgba(0,0,0,.18)"/>
 <polygon points="715,500 875,500 890,528 700,528" fill="#cfd8dc" stroke="#455a64" stroke-width="2.5"/>
 <rect x="718" y="528" width="12" height="48" fill="#37474f"/>
 <rect x="860" y="528" width="12" height="48" fill="#37474f"/>
 <g transform="translate(755,488)">
  <rect x="-14" y="18" width="28" height="6" rx="2" fill="#263238"/>
  <path d="M4,18 Q16,2 4,-12" fill="none" stroke="#546e7a" stroke-width="5" stroke-linecap="round"/>
  <rect x="-8" y="-22" width="10" height="18" rx="2" transform="rotate(-20 -3 -13)" fill="#eceff1" stroke="#263238" stroke-width="1.8"/>
  <circle class="sc-micro-glow" cx="-4" cy="8" r="7" fill="#80deea" opacity=".35"/>
 </g>
 <g transform="translate(835,498)">
  <polygon points="-14,0 14,0 10,20 -10,20" fill="#d84315" stroke="#8d6e63" stroke-width="1.8"/>
  <path d="M0,0 Q-16,-18 -6,-28 Q2,-16 0,0" fill="#43a047"/>
  <path d="M0,0 Q16,-20 8,-30 Q-2,-16 0,0" fill="#2e7d32"/>
  <circle class="sc-plant-flower" cx="0" cy="-28" r="6" fill="#ffeb3b" stroke="#f57f17" stroke-width="1.5" opacity="0"/>
 </g>
 <text class="label" x="795" y="462" text-anchor="middle">science table</text>
</g>
`;

const SC_CSS=`
#room.sc-sched-checked .sc-sched-badge{opacity:1}
#room.sc-board-written .sc-board-answer{opacity:1}
#room.sc-board-cleaned .sc-board-answer{opacity:0}
#room.sc-board-cleaned .sc-board-sparkle{opacity:1}
#room.sc-hw-handed .sc-hw-stack{opacity:1}
#room.sc-book-opened .sc-book-closed{opacity:0}
#room.sc-book-opened .sc-book-open{opacity:1}
#room.sc-notebook-out .sc-bag-notebook{opacity:0}
#room.sc-notebook-out .sc-desk-notebook{opacity:1}
#room.sc-notes-taken .sc-desk-notebook{opacity:1}
#room.sc-notes-taken .sc-notes-lines{opacity:1}
#room.sc-storybook-borrowed .sc-shelf-storybook{opacity:0}
#room.sc-globe-spun .sc-globe-sphere{transform:rotate(25deg)}
#room.sc-micro-used .sc-micro-glow{opacity:1;fill:#ffd54f}
#room.sc-plant-watered .sc-plant-flower{opacity:1}
#room.sc-locker-opened .sc-locker-open{opacity:1}
#room.sc-jacket-stored .sc-locker-open{opacity:1}
#room.sc-jacket-stored .sc-locker-jacket{opacity:1}
#room.sc-proj-on .sc-proj-beam{opacity:.38}
`;

const SC_SPOTS={
 sc_door:{x:118,y:495,d:1},
 sc_board:{x:505,y:418,d:-1},
 sc_teacher:{x:268,y:452,d:-1},
 sc_desk:{x:470,y:542,d:-1},
 sc_desk_seat:{x:470,y:505,d:-1},
 sc_bag:{x:602,y:552,d:-1},
 sc_library:{x:865,y:435,d:1},
 sc_globe:{x:722,y:438,d:1},
 sc_science:{x:795,y:585,d:1},
 sc_locker:{x:95,y:535,d:-1},
 sc_water:{x:168,y:525,d:-1},
 sc_computer:{x:240,y:568,d:-1},
 sc_art:{x:652,y:445,d:1},
 sc_music:{x:376,y:445,d:-1},
 sc_firstaid:{x:161,y:460,d:-1},
 sc_window:{x:95,y:465,d:-1},
 sc_projector:{x:505,y:425,d:-1},
 sc_rug:{x:838,y:492,d:1},
 sc_trophy:{x:945,y:465,d:1},
 sc_recycle:{x:337,y:565,d:-1},
 sc_lunch:{x:663,y:565,d:1}
};

const SC_W0={
 sc_teacher_greeted:"no",
 sc_schedule:"unchecked",
 sc_board:"lesson",
 sc_question:"none",
 sc_homework:"in_bag",
 sc_seat:"standing",
 sc_textbook:"closed",
 sc_notebook:"in_bag",
 sc_notes:"empty",
 sc_hand:"down",
 sc_lib_book:"shelf",
 sc_globe:"still",
 sc_country:"none",
 sc_microscope:"idle",
 sc_plant:"dry",
 sc_locker:"closed",
 sc_jacket:"wearing",
 sc_water:"full",
 sc_projector:"off"
};

function applySchool(W,roomEl){
 if(!roomEl)return;
 roomEl.classList.toggle("sc-sched-checked",W.sc_schedule==="checked");
 roomEl.classList.toggle("sc-board-written",W.sc_board==="answered");
 roomEl.classList.toggle("sc-board-cleaned",W.sc_board==="clean");
 roomEl.classList.toggle("sc-hw-handed",W.sc_homework==="handed_in");
 roomEl.classList.toggle("sc-book-opened",W.sc_textbook==="open");
 roomEl.classList.toggle("sc-notebook-out",W.sc_notebook==="on_desk");
 roomEl.classList.toggle("sc-notes-taken",W.sc_notes==="written");
 roomEl.classList.toggle("sc-storybook-borrowed",W.sc_lib_book==="borrowed");
 roomEl.classList.toggle("sc-globe-spun",W.sc_globe==="spun");
 roomEl.classList.toggle("sc-micro-used",W.sc_microscope==="checked");
 roomEl.classList.toggle("sc-plant-watered",W.sc_plant==="watered");
 roomEl.classList.toggle("sc-locker-opened",W.sc_locker==="open");
 roomEl.classList.toggle("sc-jacket-stored",W.sc_jacket==="in_locker");
 roomEl.classList.toggle("sc-proj-on",W.sc_projector==="on");
}

const SC_PROPS={
 marker_pen:`<g><rect x="-3" y="-12" width="6" height="18" rx="2" fill="#e53935" stroke="#fff" stroke-width="1.2"/></g>`,
 board_eraser:`<g><rect x="-10" y="-6" width="20" height="10" rx="2" fill="#37474f" stroke="#cfd8dc" stroke-width="1.5"/></g>`,
 homework_sheet:`<g><rect x="-8" y="-11" width="16" height="22" rx="2" fill="#fff" stroke="#1565c0" stroke-width="1.5"/><line x1="-5" y1="-5" x2="5" y2="-5" stroke="#1565c0" stroke-width="1.2"/><line x1="-5" y1="1" x2="5" y2="1" stroke="#1565c0" stroke-width="1.2"/></g>`,
 storybook:`<g><rect x="-9" y="-11" width="18" height="22" rx="2" fill="#ff7043" stroke="#fff" stroke-width="1.5"/></g>`,
 watering_cup:`<g><rect x="-6" y="-10" width="12" height="16" rx="3" fill="#29b6f6" stroke="#0277bd" stroke-width="1.5"/></g>`,
 paper_cup:`<g><polygon points="-6,-8 6,-8 4,8 -4,8" fill="#e1f5fe" stroke="#0288d1" stroke-width="1.5"/></g>`
};

const SC_OBJECTS={
 classdoor:{en:"classroom door & schedule",vi:"cửa lớp & bảng thời khóa biểu",ipa:"/ˈklæsruːm dɔːr/",
  acts:["greet_the_teacher","check_class_schedule","knock_on_class_door","read_club_poster","check_exam_notice"]},
 whiteboard:{en:"interactive whiteboard",vi:"bảng trắng lớp học",ipa:"/ˈwaɪtbɔːrd/",
  acts:["read_the_board","write_answer_on_board","clean_the_board","draw_mindmap_on_board","underline_key_adjective","match_synonyms_on_board"]},
 teacherdesk:{en:"teacher's desk",vi:"bàn giáo viên (Cô Claire)",ipa:"/ˈtiːtʃərz desk/",
  acts:["ask_teacher_question","hand_in_homework","ask_homework_feedback","borrow_hall_pass","discuss_speaking_topic","thank_teacher_after_class"]},
 studentdesk:{en:"student desk",vi:"bàn học sinh",ipa:"/ˈstuːdənt desk/",
  acts:["sit_at_student_desk","open_english_textbook","take_class_notes","raise_hand_to_speak","practice_pair_dialogue","review_flashcards_at_desk"]},
 schoolbag:{en:"school backpack",vi:"cặp sách đi học",ipa:"/skuːl ˈbækpæk/",
  acts:["take_out_notebook","pack_school_bag","take_out_pencil_case","check_homework_folder","zip_up_school_bag"]},
 bookshelf:{en:"library bookshelf",vi:"kệ sách thư viện (Thầy Leo)",ipa:"/ˈlaɪbreri ˈbʊkʃelf/",
  acts:["borrow_storybook","return_library_book","look_up_word_in_dictionary","ask_librarian_for_recommendation","read_comic_book_summary","organize_bookshelf_row"]},
 globe:{en:"world globe",vi:"quả địa cầu",ipa:"/wɜːrld ɡloʊb/",
  acts:["spin_the_globe","find_country_on_globe","trace_equator_on_globe","compare_time_zones_globe","quiz_classmate_capitals"]},
 sciencetable:{en:"science table",vi:"bàn thí nghiệm khoa học",ipa:"/ˈsaɪrns ˈteɪbəl/",
  acts:["look_through_microscope","water_class_plant","measure_plant_growth","mix_color_beakers","write_lab_observation"]},
 locker:{en:"student locker",vi:"tủ đồ cá nhân",ipa:"/ˈstuːdənt ˈlɑːkər/",
  acts:["open_student_locker","put_away_jacket","get_pe_shoes_from_locker","decorate_locker_door","lock_student_locker"]},
 watercooler:{en:"water dispenser",vi:"bình nước uống lớp học",ipa:"/ˈwɔːtər dɪˈspensər/",
  acts:["drink_cup_of_water","refill_reusable_water_bottle","offer_water_to_classmate","chat_by_water_cooler","wipe_water_spill"]},
 computerstation:{en:"computer learning station",vi:"máy tính học tập",ipa:"/kəmˈpjuːtər ˈsteɪʃən/",
  acts:["log_into_school_computer","practice_pronunciation_headset","type_english_essay","take_vocabulary_quiz_online","save_project_file"]},
 artcorner:{en:"art easel & paint corner",vi:"góc vẽ tranh mỹ thuật",ipa:"/ɑːrt ˈiːzəl/",
  acts:["paint_colorful_poster","sketch_classroom_scene","mix_watercolor_paints","label_art_project_english","wash_paintbrushes_clean"]},
 musicstand:{en:"classroom music stand",vi:"giá nhạc & đàn ukulele",ipa:"/ˈmjuːzɪk stænd/",
  acts:["read_english_song_lyrics","strum_classroom_ukulele","sing_pronunciation_song","clap_syllable_rhythm","adjust_music_stand_height"]},
 firstaidbox:{en:"school health & first-aid kit",vi:"tủ y tế học đường",ipa:"/fɜːrst eɪd kɪt/",
  acts:["check_first_aid_supplies","get_bandaid_paper_cut","rest_tired_eyes_exercise","apply_hand_sanitizer_school","ask_nurse_pass_headache"]},
 windowbench:{en:"sunny window & weather chart",vi:"cửa sổ lớp & bảng thời tiết",ipa:"/ˈwɪndoʊ bentʃ/",
  acts:["open_window_fresh_air","update_daily_weather_chart","describe_sunny_sky_outside","close_blinds_reduce_glare","watch_birds_outside_window"]},
 projector:{en:"smart ceiling projector",vi:"máy chiếu bài giảng",ipa:"/prəˈdʒektər/",
  acts:["turn_on_smart_projector","watch_english_video_clip","present_group_slides","point_at_projected_map","turn_off_projector_save_power"]},
 readingrug:{en:"cozy reading corner rug",vi:"thảm góc đọc sách êm ái",ipa:"/ˈriːdɪŋ rʌɡ/",
  acts:["sit_on_cozy_reading_rug","read_aloud_story_circle","share_favorite_book_character","listen_to_librarian_story","fluff_reading_cushions"]},
 trophycase:{en:"school honor trophy case",vi:"tủ cúp thành tích của lớp",ipa:"/ˈtroʊfi keɪs/",
  acts:["admire_spelling_bee_trophy","read_student_of_month_plaque","polish_trophy_glass","set_personal_study_goal","take_class_pride_photo"]},
 recyclingbin:{en:"eco recycling bins",vi:"thùng phân loại rác tái chế",ipa:"/ˌriːˈsaɪklɪŋ bɪn/",
  acts:["sort_scrap_paper_recycle","recycle_empty_plastic_bottle","read_eco_classroom_rules","sharpen_pencil_over_bin","tidy_classroom_floor_litter"]},
 lunchcubby:{en:"healthy snack & lunch shelf",vi:"kệ hộp cơm & bữa phụ lành mạnh",ipa:"/lʌntʃ ˈkʌbi/",
  acts:["check_healthy_lunchbox","eat_fresh_apple_snack","share_granola_bar_friend","read_nutrition_poster","pack_empty_lunch_container"]}
};

const ACTIONS=[
 // 1. Classroom Door & Schedule (5)
 A("greet_the_teacher","classdoor","Greet the teacher","Chào cô giáo khi vào lớp",
  "Good morning, Ms. Claire! I'm ready for our exciting English class today.",
  "Chào buổi sáng cô Claire! Hôm nay em đã sẵn sàng cho tiết học tiếng Anh thú vị của chúng ta ạ.",
  ["good morning","ready","exciting","English"],["Good morning, teacher! Happy to be in class today."],
  "Cụm <b>ready for + cụm danh từ có tính từ (exciting English class)</b> diễn tả sự hào hứng sẵn sàng.",
  ["Good morning, Ms. Claire!","I'm ready for","our exciting English class today."],{ans:"ready",opts:["ready","read","really"]},
  ["She is always <b>ready for</b> school early.","<b>Good morning</b>! Welcome to English class."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_door"],["pose","wave",550],["set","sc_teacher_greeted","yes"],["wait",300]],
  V("classroom","teacher"),
  {done:W=>W.sc_teacher_greeted==="yes",story:["greet Ms. Claire at the classroom door","greeted Ms. Claire cheerfully at the classroom door","chào cô Claire ở cửa lớp"]}),

 A("check_class_schedule","classdoor","Check the class schedule","Xem thời khóa biểu",
  "I'm checking the weekly class schedule on the wooden noticeboard.",
  "Tôi đang xem thời khóa biểu hằng tuần trên bảng thông báo bằng gỗ.",
  ["checking","weekly","schedule","noticeboard"],["Let's look at today's timetable on the board."],
  "Danh từ <b>schedule</b> (/ˈskedʒuːl/) kết hợp tính từ <b>weekly</b> chỉ thời khóa biểu hằng tuần.",
  ["I'm checking","the weekly class schedule","on the wooden noticeboard."],{ans:"schedule",opts:["schedule","school","science"]},
  ["English is the first subject on our <b>schedule</b> today.","Check the <b>class schedule</b> on the wall."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_door"],["pose","read",550],["set","sc_schedule","checked"],["wait",300]],
  V("schedule","classroom"),
  {done:W=>W.sc_schedule==="checked",story:["check today's class schedule","checked today's class schedule on the noticeboard","xem thời khóa biểu trên bảng thông báo"]}),

 // 2. Interactive Whiteboard (3 original)
 A("read_the_board","whiteboard","Read the lesson on the board","Đọc bài học trên bảng",
  "I'm reading the useful vocabulary and clear example sentences on the whiteboard.",
  "Tôi đang đọc các từ vựng hữu ích và câu ví dụ rõ ràng trên bảng trắng.",
  ["reading","useful","vocabulary","whiteboard"],["I'm looking at the grammar examples on the board."],
  "Giới từ <b>on the whiteboard / on the board</b> dùng cho nội dung được viết hoặc chiếu trên bảng.",
  ["I'm reading","the useful vocabulary","on the whiteboard."],{ans:"whiteboard",opts:["whiteboard","cardboard","skateboard"]},
  ["Please read the sentences <b>on the whiteboard</b> aloud.","Look at the example <b>on the board</b>."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_board"],["pose","read",550],["set","sc_board","read"],["wait",300]],
  V("whiteboard","classroom"),
  {done:W=>W.sc_board==="read"||W.sc_board==="answered"||W.sc_board==="clean",story:["read the new vocabulary on the whiteboard","read the new vocabulary on the whiteboard","đọc từ vựng mới trên bảng trắng"]}),

 A("write_answer_on_board","whiteboard","Write the answer on the board","Viết đáp án lên bảng",
  "I'm writing my complete answer neatly on the whiteboard with a red marker.",
  "Tôi đang viết câu trả lời hoàn chỉnh của mình thật gọn gàng lên bảng trắng bằng bút lông đỏ.",
  ["writing","complete","answer","whiteboard"],["I'm coming to the front to write the sentence on the board."],
  "Cấu trúc <b>write + nội dung + on the board + with a marker</b>: viết gì lên bảng bằng bút lông.",
  ["I'm writing my complete answer","on the whiteboard","with a red marker."],{ans:"answer",opts:["answer","ask","ant"]},
  ["He wrote a clear <b>answer on the whiteboard</b>.","Use a marker to write <b>on the whiteboard</b>."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_board"],["prop","marker_pen"],["pose","reach",600],["set","sc_board","answered"],["prop",null],["wait",300]],
  V("whiteboard"),
  {done:W=>W.sc_board==="answered"||W.sc_board==="clean",story:["write my answer on the whiteboard","wrote my answer neatly on the whiteboard","viết câu trả lời lên bảng trắng"]}),

 A("clean_the_board","whiteboard","Clean the whiteboard","Lau sạch bảng trắng",
  "I'm wiping the bright whiteboard spotless with the soft eraser for the next lesson.",
  "Tôi đang lau chiếc bảng trắng sáng bóng bằng đồ lau bảng mềm cho tiết học tiếp theo.",
  ["wiping","whiteboard","spotless","eraser"],["I'm cleaning the board with an eraser."],
  "Cụm <b>wipe something clean / spotless</b> mang nghĩa lau sạch bóng một bề mặt.",
  ["I'm wiping","the bright whiteboard spotless","with the soft eraser."],{ans:"eraser",opts:["eraser","easier","early"]},
  ["Whose turn is it to <b>clean the whiteboard</b> today?","Wipe the board clean with the <b>eraser</b>."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_board"],["prop","board_eraser"],["pose","wipe",600],["set","sc_board","clean"],["prop",null],["wait",300]],
  V("whiteboard","eraser"),
  {done:W=>W.sc_board==="clean",story:["wipe the whiteboard clean","wiped the whiteboard clean with the eraser","lau sạch bảng trắng"]}),

 // 3. Teacher's Desk (2 original)
 A("ask_teacher_question","teacherdesk","Ask the teacher a question","Hỏi bài cô giáo",
  "Excuse me, Ms. Claire, how do we pronounce this difficult word correctly?",
  "Thưa cô Claire, chúng em phát âm từ khó này sao cho đúng ạ?",
  ["excuse","pronounce","difficult","correctly"],["How do you pronounce this word in English?"],
  "Mẫu câu <b>How do we pronounce...?</b> cực kỳ hữu ích khi bạn muốn hỏi cách phát âm một từ mới trong lớp.",
  ["Excuse me, Ms. Claire,","how do we pronounce","this difficult word correctly?"],{ans:"pronounce",opts:["pronounce","promise","produce"]},
  ["How do we <b>pronounce</b> this word?","Don't be shy to <b>ask the teacher</b> a question."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_teacher"],["pose","point",550],["set","sc_question","asked"],["wait",300]],
  V("teacher","pronounce"),
  {done:W=>W.sc_question==="asked",story:["ask the teacher how to pronounce a word","asked the teacher how to pronounce a new word","hỏi cô giáo cách phát âm từ mới"]}),

 A("hand_in_homework","teacherdesk","Hand in homework","Nộp bài tập về nhà",
  "Here is my completed English homework assignment, Ms. Claire.",
  "Thưa cô Claire, đây là bài tập về nhà môn tiếng Anh đã hoàn thành của em ạ.",
  ["completed","homework","assignment","English"],["I'm handing in my completed homework on time."],
  "Phrasal verb <b>hand in</b> (hoặc <i>turn in</i>) nghĩa là nộp bài tập cho giáo viên.",
  ["Here is","my completed English homework assignment,","Ms. Claire."],{ans:"homework",opts:["homework","housework","teamwork"]},
  ["Please <b>hand in your homework</b> before the bell rings.","She finished her <b>homework assignment</b>."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_teacher"],["prop","homework_sheet"],["pose","reach",600],["set","sc_homework","handed_in"],["prop",null],["wait",300]],
  V("homework","assignment","teacher"),
  {done:W=>W.sc_homework==="handed_in",story:["hand in my English homework","handed in my English homework at the teacher's desk","nộp bài tập tiếng Anh trên bàn cô giáo"]}),

 // 4. Student Desk & Chair (4 original)
 A("sit_at_student_desk","studentdesk","Sit at the student desk","Ngồi vào bàn học",
  "I'm taking my comfortable seat at the front desk.",
  "Tôi đang ngồi vào chỗ ngồi thoải mái của mình ở bàn học đầu lớp.",
  ["taking","comfortable","seat","desk"],["I'm sitting down at my desk in the classroom."],
  "Cụm <b>take my seat</b> tự nhiên và trang trọng hơn <i>sit down</i> khi vào lớp học.",
  ["I'm taking","my comfortable seat","at the front desk."],{ans:"seat",opts:["seat","sit","set"]},
  ["Everyone <b>took their seats</b> when the teacher walked in.","Please sit at your <b>student desk</b>."],
  ()=>null,
  ()=>[["walk","sc_desk"],["sit","sc_desk_seat"],["set","sc_seat","seated"],["wait",300]],
  V("classroom","classmate"),
  {sitOk:true,done:W=>W.sc_seat==="seated",story:["take my seat at the student desk","took my seat at the student desk","ngồi vào bàn học sinh"]}),

 A("open_english_textbook","studentdesk","Open the English textbook","Mở sách giáo khoa tiếng Anh",
  "I'm opening my colorful English textbook to page twenty-four.",
  "Tôi đang mở cuốn sách giáo khoa tiếng Anh nhiều màu sắc ra trang hai mươi tư.",
  ["opening","colorful","textbook","page"],["Please open your textbooks to Unit 5."],
  "Lưu ý giới từ: <b>open the book TO page 24</b> (mở sách ra trang 24).",
  ["I'm opening","my colorful English textbook","to page twenty-four."],{ans:"textbook",opts:["textbook","notebook","cookbook"]},
  ["Let's <b>open our textbooks to</b> page ten.","Read the dialogue in your <b>English textbook</b>."],
  ()=>null,
  W=>[...(W.sitting?[]:[["walk","sc_desk"]]),["pose","read",550],["set","sc_textbook","open"],["wait",300]],
  V("textbook"),
  {sitOk:true,done:W=>W.sc_textbook==="open",story:["open my English textbook","opened my English textbook to today's lesson","mở sách giáo khoa tiếng Anh"]}),

 A("take_class_notes","studentdesk","Take notes in the notebook","Ghi chép bài vào vở",
  "I'm taking careful notes in my lined notebook while listening to the teacher.",
  "Tôi đang ghi chép bài cẩn thận vào quyển vở kẻ ngang trong khi nghe cô giáo giảng.",
  ["taking","careful","notes","notebook"],["I'm writing down the new grammar points in my notebook."],
  "Collocation <b>take notes</b> (ghi chép bài) luôn dùng danh từ <i>notes</i> ở dạng số nhiều.",
  ["I'm taking careful notes","in my lined notebook","while listening to the teacher."],{ans:"notes",opts:["notes","knots","nuts"]},
  ["<b>Taking good notes</b> helps you remember new words.","Write it down in your <b>notebook</b>."],
  ()=>null,
  W=>[...(W.sitting?[]:[["walk","sc_desk"]]),["pose","read",600],["set","sc_notebook","on_desk"],["set","sc_notes","written"],["wait",300]],
  V("notebook","take_notes"),
  {sitOk:true,done:W=>W.sc_notes==="written",story:["take careful notes in my notebook","took careful notes in my notebook","ghi chép bài cẩn thận vào vở"]}),

 A("raise_hand_to_speak","studentdesk","Raise hand to answer","Giơ tay phát biểu",
  "I'm raising my hand confidently to answer the teacher's question.",
  "Tôi đang tự tin giơ tay để trả lời câu hỏi của cô giáo.",
  ["raising","hand","confidently","answer"],["May I answer this question, Ms. Claire?"],
  "Ngoại động từ <b>raise + tân ngữ</b> (<i>raise your hand</i>: giơ tay lên).",
  ["I'm raising my hand","confidently to answer","the teacher's question."],{ans:"raise",opts:["raise","rise","race"]},
  ["She <b>raised her hand</b> confidently to speak.","<b>Raise your hand</b> if you know the answer."],
  ()=>null,
  W=>[...(W.sitting?[]:[["walk","sc_desk"]]),["pose","wave",550],["set","sc_hand","raised"],["wait",300]],
  V("raise_hand","teacher"),
  {sitOk:true,done:W=>W.sc_hand==="raised",story:["raise my hand to answer","raised my hand to answer the teacher's question","giơ tay phát biểu"]}),

 // 5. School Backpack (2 original)
 A("take_out_notebook","schoolbag","Take notebook out of backpack","Lấy vở ra khỏi cặp sách",
  "I'm taking my yellow notebook and blue pen out of my school backpack.",
  "Tôi đang lấy quyển vở màu vàng và cây bút xanh ra khỏi cặp sách đi học.",
  ["taking","yellow","notebook","backpack"],["I unzipped my backpack and took out my notebook."],
  "Cụm <b>take [something] out of [a bag]</b>: lấy vật gì ra khỏi cặp/túi.",
  ["I'm taking my yellow notebook","and blue pen","out of my school backpack."],{ans:"backpack",opts:["backpack","backyard","background"]},
  ["<b>Take out</b> your notebooks and pens, everyone.","My English book is in my <b>backpack</b>."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_bag"],["pose","reach",550],["set","sc_notebook","on_desk"],["wait",300]],
  V("backpack","notebook"),
  {done:W=>W.sc_notebook==="on_desk",story:["take my notebook out of my backpack","took my notebook out of my backpack","lấy vở ra khỏi cặp sách"]}),

 A("pack_school_bag","schoolbag","Pack the school backpack","Thu dọn sách vở vào cặp",
  "I'm packing my heavy textbook and notebook neatly into my sturdy backpack.",
  "Tôi đang xếp cuốn sách giáo khoa dày và vở gọn gàng vào chiếc cặp sách chắc chắn.",
  ["packing","heavy","textbook","backpack"],["I'm putting all my books back into my schoolbag."],
  "Động từ <b>pack ... into ...</b> dùng khi thu xếp đồ dùng học tập gọn vào cặp.",
  ["I'm packing","my heavy textbook and notebook","neatly into my sturdy backpack."],{ans:"packing",opts:["packing","parking","picking"]},
  ["Don't forget to <b>pack your backpack</b> tonight.","She packed her books <b>neatly into her bag</b>."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_bag"],["pose","reach",550],["set","sc_notebook","in_bag"],["set","sc_textbook","closed"],["set","sc_bag_packed","yes"],["wait",300]],
  V("backpack","textbook"),
  {done:W=>W.sc_bag_packed==="yes",story:["pack my books into my backpack","packed my books neatly into my backpack","xếp sách vở gọn vào cặp"]}),

 // 6. Library Corner (2 original)
 A("borrow_storybook","bookshelf","Borrow an English storybook","Mượn sách truyện tiếng Anh",
  "Excuse me, Mr. Leo, may I borrow this illustrated English adventure storybook?",
  "Thưa thầy Leo, em có thể mượn cuốn sách truyện phiêu lưu tiếng Anh có tranh minh họa này được không ạ?",
  ["borrow","illustrated","adventure","storybook"],["Can I borrow this book for the weekend?"],
  "Phân biệt: <b>borrow</b> (mượn từ ai) và <b>lend</b> (cho ai mượn).",
  ["Excuse me, Mr. Leo,","may I borrow","this illustrated English adventure storybook?"],{ans:"borrow",opts:["borrow","lend","bring"]},
  ["May I <b>borrow</b> this storybook from the library?","Reading <b>English storybooks</b> builds vocabulary."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_library"],["prop","storybook"],["pose","read",600],["set","sc_lib_book","borrowed"],["prop",null],["wait",300]],
  V("librarian","borrow","storybook"),
  {done:W=>W.sc_lib_book==="borrowed"||W.sc_lib_book==="returned",story:["borrow an English storybook","borrowed an English storybook from the library corner","mượn truyện tiếng Anh ở góc thư viện"]}),

 A("return_library_book","bookshelf","Return the library book","Trả sách thư viện",
  "I'm returning the interesting storybook to the wooden library shelf on time.",
  "Tôi đang trả lại cuốn sách truyện thú vị lên kệ thư viện bằng gỗ đúng hạn.",
  ["returning","interesting","storybook","shelf"],["Here is the book I borrowed, Mr. Leo. Thank you!"],
  "Cụm <b>on time</b> nghĩa là đúng hạn, đúng giờ quy định.",
  ["I'm returning","the interesting storybook","to the wooden library shelf on time."],{ans:"return",opts:["return","repeat","remind"]},
  ["Always <b>return library books</b> on time.","Put the book back on the <b>library shelf</b>."],
  W=>W.sc_lib_book!=="borrowed"?"Hãy mượn sách trước khi trả lại kệ nhé (Borrow an English storybook).":null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_library"],["prop","storybook"],["pose","reach",550],["set","sc_lib_book","returned"],["prop",null],["wait",300]],
  V("librarian","storybook"),
  {done:W=>W.sc_lib_book==="returned",story:["return the storybook to the library shelf","returned the storybook to the library shelf","trả sách truyện lên kệ thư viện"]}),

 // 7. World Globe (2 original)
 A("spin_the_globe","globe","Spin the world globe","Xoay quả địa cầu",
  "I'm spinning the colorful world globe to look at the vast oceans and continents.",
  "Tôi đang xoay quả địa cầu nhiều màu sắc để ngắm nhìn các đại dương mênh mông và châu lục.",
  ["spinning","colorful","globe","continents"],["Let's spin the globe and learn geography in English."],
  "Động từ <b>spin</b> (quá khứ: <i>spun</i>) nghĩa là xoay tròn quanh trục.",
  ["I'm spinning","the colorful world globe","to look at the vast oceans."],{ans:"globe",opts:["globe","glove","glow"]},
  ["There are seven continents on the <b>world globe</b>.","Spin the <b>globe</b> and point to a country."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_globe"],["pose","reach",550],["set","sc_globe","spun"],["wait",300]],
  V("globe","continent"),
  {done:W=>W.sc_globe==="spun",story:["spin the world globe","spun the world globe to explore the continents","xoay quả địa cầu"]}),

 A("find_country_on_globe","globe","Find a country on the globe","Tìm quốc gia trên quả địa cầu",
  "I found sunny Vietnam and the United Kingdom on the round globe!",
  "Tôi đã tìm thấy đất nước Việt Nam đầy nắng và Vương quốc Anh trên quả địa cầu tròn!",
  ["found","sunny","Vietnam","globe"],["Look, here is Vietnam on the world globe!"],
  "Các quốc gia có từ <i>Kingdom, States, Republic</i> dùng mạo từ <b>the</b> (<b>the United Kingdom</b>).",
  ["I found sunny Vietnam","and the United Kingdom","on the round globe!"],{ans:"found",opts:["found","find","fond"]},
  ["Can you find Australia <b>on the globe</b>?","She pointed to <b>Vietnam</b> on the map."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_globe"],["pose","point",550],["set","sc_globe","spun"],["set","sc_country","found"],["wait",300]],
  V("globe","continent"),
  {done:W=>W.sc_country==="found",story:["find Vietnam and the UK on the globe","found Vietnam and the United Kingdom on the globe","tìm thấy Việt Nam và Anh trên quả địa cầu"]}),

 // 8. Science Experiment Table (2 original)
 A("look_through_microscope","sciencetable","Look through the microscope","Nhìn qua kính hiển vi",
  "I'm looking at a tiny green leaf cell through the powerful science microscope.",
  "Tôi đang quan sát tế bào lá cây xanh nhỏ xíu qua chiếc kính hiển vi khoa học độ phóng đại lớn.",
  ["looking","tiny","leaf","microscope"],["I can see tiny plant cells through the microscope!"],
  "Giới từ <b>through the microscope</b> (nhìn qua kính hiển vi) hoặc <b>under the microscope</b>.",
  ["I'm looking at","a tiny green leaf cell","through the powerful science microscope."],{ans:"microscope",opts:["microscope","microphone","microwave"]},
  ["The leaf looks amazing <b>through the microscope</b>!","We use a <b>microscope</b> in science class."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_science"],["pose","read",600],["set","sc_microscope","checked"],["wait",300]],
  V("microscope"),
  {done:W=>W.sc_microscope==="checked",story:["look through the science microscope","looked at a leaf cell through the microscope","quan sát tế bào lá qua kính hiển vi"]}),

 A("water_class_plant","sciencetable","Water the classroom plant","Tưới cây xanh của lớp",
  "I'm watering the little green potted plant on the clean science table.",
  "Tôi đang tưới nước cho chậu cây xanh nhỏ trên chiếc bàn khoa học sạch sẽ.",
  ["watering","little","potted","plant"],["Let's give the classroom plant some fresh water."],
  "Từ <b>water</b> vừa là danh từ (<i>nước</i>), vừa là động từ (<i>tưới nước cho cây</i>: <b>water the plant</b>).",
  ["I'm watering","the little green potted plant","on the clean science table."],{ans:"watering",opts:["watering","watching","walking"]},
  ["Remember to <b>water the plant</b> by the window.","Our class plant grew a bright yellow flower!"],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_science"],["prop","watering_cup"],["pose","pour",600],["set","sc_plant","watered"],["prop",null],["wait",300]],
  V("classroom"),
  {done:W=>W.sc_plant==="watered",story:["water the potted plant","watered the potted plant on the science table","tưới chậu cây trên bàn khoa học"]}),

 // 9. Student Locker (2 original)
 A("open_student_locker","locker","Open the student locker","Mở tủ đồ cá nhân",
  "I'm unlocking and opening my blue metal school locker.",
  "Tôi đang mở khóa và mở cánh tủ đồ cá nhân bằng kim loại màu xanh ở trường.",
  ["unlocking","opening","metal","locker"],["I opened my locker to keep my extra things safe."],
  "Tiền tố <b>un-</b> trong <b>unlock</b> mang nghĩa đảo ngược hành động (<i>lock</i> → <i>unlock</i>).",
  ["I'm unlocking","and opening","my blue metal school locker."],{ans:"locker",opts:["locker","locked","kettle"]},
  ["My <b>school locker</b> is near the door.","Unlock your <b>locker</b> before class."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_locker"],["pose","reach",520],["set","sc_locker","open"],["wait",300]],
  V("locker"),
  {done:W=>W.sc_locker==="open"||W.sc_jacket==="in_locker",story:["open my student locker","opened my student locker","mở tủ đồ cá nhân"]}),

 A("put_away_jacket","locker","Put jacket in the locker","Cất áo khoác vào tủ đồ",
  "I'm hanging my warm jacket neatly inside my personal locker.",
  "Tôi đang treo chiếc áo khoác ấm áp của mình gọn gàng vào trong tủ đồ cá nhân.",
  ["hanging","warm","jacket","locker"],["I put my coat away in the student locker."],
  "Phrasal verb <b>put away</b> nghĩa là cất đồ đạc vào đúng chỗ quy định.",
  ["I'm hanging","my warm jacket neatly","inside my personal locker."],{ans:"jacket",opts:["jacket","ticket","pocket"]},
  ["Please hang your <b>jacket inside your locker</b>.","Put your coat away neatly."],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_locker"],["pose","reach",550],["set","sc_locker","open"],["set","sc_jacket","in_locker"],["wait",300]],
  V("locker"),
  {done:W=>W.sc_jacket==="in_locker",story:["hang my jacket inside my locker","hung my jacket neatly inside my locker","treo áo khoác vào tủ đồ"]}),

 // 10. Water Cooler (1 original)
 A("drink_cup_of_water","watercooler","Drink water during break","Uống nước giờ giải lao",
  "I'm drinking a refreshing cup of cool water during break time to stay hydrated.",
  "Tôi đang uống một cốc nước mát sảng khoái trong giờ giải lao để giữ cơ thể đủ nước.",
  ["drinking","refreshing","water","break"],["Let's get a cup of water from the dispenser."],
  "Giới từ <b>during + danh từ</b> (<i>during break time / during class</i>) chỉ khoảng thời gian một sự việc diễn ra.",
  ["I'm drinking","a refreshing cup of cool water","during break time."],{ans:"break",opts:["break","brake","bake"]},
  ["We chat and drink water <b>during break time</b>.","Stay hydrated at school!"],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","sc_water"],["prop","paper_cup"],["pose","drink",650],["set","sc_water","drunk"],["prop",null],["wait",300]],
  V("break_time"),
  {done:W=>W.sc_water==="drunk",story:["drink a cup of water during break time","drank a refreshing cup of water during break time","uống cốc nước mát giờ giải lao"]})
];

// ── Expand to 104 natural classroom actions across all 20 objects ─────────
const EXTRA_SPECS=[
 // classdoor (+3)
 ["knock_on_class_door","classdoor","sc_door","Knock politely on the door","Gõ cửa lớp lịch sự",
  "Excuse me, may I come into the bright classroom, Ms. Claire?",
  "Xin lỗi cô, em có thể bước vào phòng học sáng sủa được không ạ, cô Claire?",
  ["excuse","come","bright","classroom"],"Mẫu xin phép lịch sự khi vào lớp: <b>May I come in?</b>.",
  "Thank you for knocking politely! Come right in and join the class.","Cảm ơn em đã gõ cửa rất lịch sự! Em vào lớp cùng các bạn nhé."],
 ["read_club_poster","classdoor","sc_door","Read the English club poster","Đọc áp phích câu lạc bộ tiếng Anh",
  "When does the weekly English Drama Club meet after school?",
  "Câu lạc bộ Kịch tiếng Anh hằng tuần họp vào lúc nào sau giờ học vậy ạ?",
  ["when","weekly","club","meet"],"Câu hỏi thời gian với <b>When does + chủ ngữ số ít + động từ nguyên mẫu?</b>.",
  "The English Drama Club meets every Thursday afternoon at four o'clock!","Câu lạc bộ Kịch tiếng Anh họp vào mỗi chiều thứ Năm lúc 4 giờ nhé!"],
 ["check_exam_notice","classdoor","sc_door","Check the speaking test date","Xem thông báo lịch thi nói",
  "I'm checking the important notice for our upcoming English speaking test.",
  "Tôi đang xem thông báo quan trọng về bài kiểm tra nói tiếng Anh sắp tới của chúng tôi.",
  ["checking","important","upcoming","speaking"],"Tính từ <b>upcoming</b> dùng cho sự kiện sắp diễn ra trong tương lai gần.",
  "Don't worry about the upcoming speaking test—you practice every day!","Đừng lo lắng về bài thi nói sắp tới nhé — em luyện tập mỗi ngày mà!"],

 // whiteboard (+3)
 ["draw_mindmap_on_board","whiteboard","sc_board","Draw a vocabulary mind map","Vẽ sơ đồ tư duy từ vựng",
  "I'm drawing a colorful mind map on the whiteboard to connect weather and health words.",
  "Tôi đang vẽ một sơ đồ tư duy đầy màu sắc lên bảng trắng để kết nối các từ vựng về thời tiết và sức khỏe.",
  ["drawing","colorful","mind map","connect"],"Cụm <b>draw a mind map</b> nghĩa là vẽ sơ đồ tư duy giúp nhớ từ vựng theo chủ đề.",
  "What a creative mind map! Grouping words by topic makes them so easy to remember.","Sơ đồ tư duy sáng tạo quá! Nhóm từ theo chủ đề giúp nhớ từ cực kỳ dễ dàng."],
 ["underline_key_adjective","whiteboard","sc_board","Underline the descriptive adjectives","Gạch chân các tính từ miêu tả",
  "Can you see how I underlined the descriptive adjectives in this long sentence?",
  "Cô có thấy cách em gạch chân các tính từ miêu tả trong câu dài này không ạ?",
  ["underlined","descriptive","adjectives","sentence"],"Động từ <b>underline</b> nghĩa là gạch chân từ quan trọng.",
  "Spot on! You underlined every single descriptive adjective accurately!","Chuẩn xác luôn! Em đã gạch chân đúng từng tính từ miêu tả!"],
 ["match_synonyms_on_board","whiteboard","sc_board","Match synonyms on the board","Nối các cặp từ đồng nghĩa",
  "I matched the word 'joyful' with its synonym 'happy' on the interactive board.",
  "Tôi đã nối từ 'joyful' với từ đồng nghĩa 'happy' trên chiếc bảng tương tác.",
  ["matched","joyful","synonym","interactive"],"Danh từ <b>synonym</b> (/ˈsɪnənɪm/) nghĩa là từ đồng nghĩa.",
  "Fantastic! Knowing synonyms like 'joyful' and 'happy' makes your English sound natural.","Tuyệt lắm! Biết các từ đồng nghĩa như 'joyful' và 'happy' giúp tiếng Anh của em rất tự nhiên."],

 // teacherdesk (+4)
 ["ask_homework_feedback","teacherdesk","sc_teacher","Ask for feedback on essay","Xin nhận xét bài viết",
  "Ms. Claire, could you give me some helpful feedback on my short story?",
  "Cô Claire ơi, cô có thể cho em vài nhận xét hữu ích về truyện ngắn của em được không ạ?",
  ["helpful","feedback","short","story"],"Collocation <b>give feedback on something</b>: đưa ra nhận xét/góp ý cho bài làm.",
  "I loved your creative story! Your adjectives made the characters come alive.","Cô rất thích câu chuyện sáng tạo của em! Các tính từ em dùng làm nhân vật rất sống động."],
 ["borrow_hall_pass","teacherdesk","sc_teacher","Ask for the classroom hall pass","Xin thẻ ra ngoài lớp",
  "Excuse me, may I take the wooden hall pass to wash my hands quickly?",
  "Thưa cô, em có thể lấy thẻ ra ngoài bằng gỗ để đi rửa tay nhanh được không ạ?",
  ["wooden","hall pass","wash","quickly"],"Trong trường học phương Tây, <b>hall pass</b> là thẻ xin phép ra hành lang trong giờ học.",
  "Of course! Here is the hall pass—come right back after washing your hands.","Được chứ em! Thẻ ra ngoài đây — rửa tay xong em quay lại lớp ngay nhé."],
 ["discuss_speaking_topic","teacherdesk","sc_teacher","Discuss daily speaking topic","Thảo luận chủ đề luyện nói",
  "What is your favorite season of the year, Ms. Claire? I love breezy autumn days!",
  "Mùa yêu thích trong năm của cô là mùa nào vậy cô Claire? Em rất thích những ngày mùa thu lộng gió!",
  ["favorite","season","breezy","autumn"],"Tính từ <b>breezy</b> miêu tả thời tiết có gió nhẹ mát mẻ dễ chịu.",
  "I love breezy autumn days too! The crisp air is perfect for reading outside.","Cô cũng thích những ngày thu mát gió! Không khí trong lành rất hợp để đọc sách ngoài trời."],
 ["thank_teacher_after_class","teacherdesk","sc_teacher","Thank the teacher after lesson","Cảm ơn cô giáo sau tiết học",
  "Thank you for such an inspiring and fun English lesson today, Ms. Claire!",
  "Cảm ơn cô vì một tiết học tiếng Anh thật truyền cảm hứng và vui vẻ hôm nay ạ, cô Claire!",
  ["thank","inspiring","fun","lesson"],"Cấu trúc <b>such a/an + tính từ + danh từ</b> dùng để nhấn mạnh cảm xúc khen ngợi.",
  "You're very welcome! Your enthusiasm makes teaching a joy every single day.","Không có gì đâu em! Sự nhiệt tình của em khiến việc dạy học mỗi ngày đều thật vui."],

 // studentdesk (+2)
 ["practice_pair_dialogue","studentdesk","sc_desk","Practice dialogue with a classmate","Luyện hội thoại cặp với bạn",
  "Hey, how are you feeling today? Let's practice this everyday conversation together!",
  "Chào cậu, hôm nay cậu cảm thấy trong người thế nào? Mình cùng luyện đoạn hội thoại đời thường này nhé!",
  ["feeling","today","practice","conversation"],"Mẫu hỏi thăm sức khỏe/tâm trạng: <b>How are you feeling today?</b>.",
  "Great pair work! Speaking with a partner builds real-life confidence.","Làm việc cặp tốt lắm! Luyện nói cùng bạn giúp tăng sự tự tin ngoài đời thực."],
 ["review_flashcards_at_desk","studentdesk","sc_desk","Review vocabulary flashcards","Ôn thẻ từ vựng tại bàn",
  "I'm reviewing twenty colorful vocabulary flashcards before our warm-up game.",
  "Tôi đang ôn lại hai mươi thẻ từ vựng nhiều màu sắc trước trò chơi khởi động.",
  ["reviewing","colorful","vocabulary","flashcards"],"Động từ <b>review</b> (ôn tập lại) đi cùng <b>flashcards</b> (thẻ học từ vựng).",
  "Reviewing flashcards for five minutes a day keeps new words fresh in your memory!","Ôn thẻ từ 5 phút mỗi ngày giúp từ mới luôn tươi mới trong trí nhớ của em!"],

 // schoolbag (+3)
 ["take_out_pencil_case","schoolbag","sc_bag","Take out the zipper pencil case","Lấy hộp bút khóa kéo",
  "I'm taking my neat zipper pencil case and highlighter out of my backpack.",
  "Tôi đang lấy chiếc hộp bút có khóa kéo gọn gàng và bút dạ quang ra khỏi cặp sách.",
  ["neat","pencil case","highlighter","backpack"],"Danh từ ghép <b>pencil case</b> (hộp đựng bút) và <b>highlighter</b> (bút dạ quang đánh dấu).",
  "Having a neat pencil case with highlighters makes note-taking so organized!","Có hộp bút gọn gàng cùng bút dạ quang giúp việc ghi chép ngăn nắp hơn hẳn!"],
 ["check_homework_folder","schoolbag","sc_bag","Check the plastic homework folder","Kiểm tra bìa kẹp bài tập",
  "Did I put my graded grammar worksheet inside my transparent folder?",
  "Mình đã cất tờ bài tập ngữ pháp đã chấm điểm vào trong bìa kẹp trong suốt chưa nhỉ?",
  ["graded","grammar","worksheet","transparent"],"Tính từ <b>graded</b> (đã được chấm điểm) và <b>transparent</b> (trong suốt).",
  "Keeping your graded worksheets in a folder is a great study habit!","Giữ các tờ bài tập đã chấm trong bìa kẹp là một thói quen học tập rất tốt!"],
 ["zip_up_school_bag","schoolbag","sc_bag","Zip up the school backpack","Kéo khóa cặp sách lại",
  "I'm zipping up my heavy backpack carefully so nothing falls out on the way home.",
  "Tôi đang kéo khóa chiếc ba lô nặng của mình thật cẩn thận để không thứ gì rơi ra trên đường về nhà.",
  ["zipping","heavy","backpack","carefully"],"Phrasal verb <b>zip up</b> nghĩa là kéo khóa (cặp sách, áo khoác) đóng kín lại.",
  "Always zip up your backpack before leaving the classroom!","Hãy luôn kéo khóa cặp sách cẩn thận trước khi rời phòng học nhé!"],

 // bookshelf (+4)
 ["look_up_word_in_dictionary","bookshelf","sc_library","Look up a word in the dictionary","Tra từ mới trong từ điển",
  "I'm looking up the exact meaning of 'resilient' in this thick English dictionary.",
  "Tôi đang tra cứu ý nghĩa chính xác của từ 'resilient' trong cuốn từ điển tiếng Anh dày này.",
  ["looking up","exact","meaning","dictionary"],"Phrasal verb <b>look up a word in the dictionary</b>: tra một từ trong từ điển.",
  "Great initiative! 'Resilient' means being strong and bouncing back quickly from difficulties.","Chủ động tốt lắm! 'Resilient' nghĩa là kiên cường và phục hồi nhanh sau khó khăn.",
  "librarian"],
 ["ask_librarian_for_recommendation","bookshelf","sc_library","Ask Mr. Leo for a book tip","Nhờ thầy thủ thư gợi ý sách",
  "Mr. Leo, could you recommend a funny mystery book with simple English dialogues?",
  "Thầy Leo ơi, thầy có thể gợi ý cho em một cuốn truyện trinh thám hài hước có hội thoại tiếng Anh đơn giản không ạ?",
  ["recommend","funny","mystery","dialogues"],"Động từ <b>recommend + danh từ</b>: giới thiệu/gợi ý một cuốn sách hay.",
  "I highly recommend 'The Detective Club'! It's hilarious and full of useful daily phrases.","Thầy rất gợi ý cuốn 'Câu lạc bộ Thám tử' nhé! Truyện vừa vui nhộn vừa nhiều câu giao tiếp bổ ích.",
  "librarian"],
 ["read_comic_book_summary","bookshelf","sc_library","Read the back cover summary","Đọc tóm tắt bìa sau cuốn truyện",
  "I'm reading the short summary on the back cover to see if the story is exciting.",
  "Tôi đang đọc phần tóm tắt ngắn ở bìa sau để xem câu chuyện có hấp dẫn không.",
  ["reading","short","summary","back cover"],"Cụm <b>on the back cover</b> nghĩa là ở mặt bìa sau của cuốn sách.",
  "Reading the back cover summary is the best way to pick a book you'll love!","Đọc tóm tắt ở bìa sau là cách hay nhất để chọn được cuốn sách hợp gu đấy!",
  "librarian"],
 ["organize_bookshelf_row","bookshelf","sc_library","Organize books neatly on the shelf","Xếp lại hàng sách ngay ngắn",
  "I'm arranging these colorful picture books in alphabetical order for Mr. Leo.",
  "Tôi đang sắp xếp những cuốn sách tranh nhiều màu sắc này theo thứ tự bảng chữ cái giúp thầy Leo.",
  ["arranging","colorful","alphabetical","order"],"Cụm cố định <b>in alphabetical order</b>: theo thứ tự bảng chữ cái A–Z.",
  "Thank you so much! Organizing the shelf in alphabetical order helps every student find books fast.","Cảm ơn em nhiều lắm! Xếp kệ theo thứ tự bảng chữ cái giúp mọi học sinh tìm sách nhanh hơn.",
  "librarian"],

 // globe (+3)
 ["trace_equator_on_globe","globe","sc_globe","Trace the equator with a finger","Chỉ dọc đường xích đạo",
  "I'm tracing the warm equator line around the middle of the spinning globe.",
  "Tôi đang đưa ngón tay dọc theo đường xích đạo ấm áp quanh chính giữa quả địa cầu đang xoay.",
  ["tracing","warm","equator","globe"],"Danh từ <b>the equator</b> (/ɪˈkweɪtər/) chỉ đường xích đạo của Trái Đất.",
  "Countries along the equator have warm, tropical weather all year round!","Các quốc gia nằm dọc đường xích đạo có thời tiết nhiệt đới ấm áp quanh năm đấy!",
  "librarian"],
 ["compare_time_zones_globe","globe","sc_globe","Compare international time zones","So sánh múi giờ quốc tế",
  "When it is sunny morning in Hanoi, is it still quiet nighttime in London?",
  "Khi trời đang là buổi sáng nắng đẹp ở Hà Nội, có phải ở Luân Đôn vẫn đang là ban đêm yên tĩnh không ạ?",
  ["sunny","morning","quiet","nighttime"],"Câu hỏi so sánh thời gian/thời tiết giữa hai địa điểm với <b>When it is..., is it...?</b>.",
  "Yes, indeed! Hanoi is seven hours ahead of London because of the time zones.","Đúng vậy đấy! Hà Nội nhanh hơn Luân Đôn bảy tiếng đồng hồ do chênh lệch múi giờ.",
  "librarian"],
 ["quiz_classmate_capitals","globe","sc_globe","Play a world capitals quiz","Đố vui thủ đô các nước",
  "Do you know what the bustling capital city of Australia is? It's Canberra!",
  "Cậu có biết thủ đô nhộn nhịp của nước Úc là thành phố nào không? Đó là Canberra đấy!",
  ["bustling","capital","Australia","Canberra"],"Cụm <b>the capital city of + tên nước</b>: thủ đô của quốc gia nào.",
  "Bravo! Many people guess Sydney, but Canberra is the real capital of Australia!","Giỏi lắm! Nhiều người hay đoán là Sydney, nhưng Canberra mới là thủ đô thật sự của Úc!",
  "librarian"],

 // sciencetable (+3)
 ["measure_plant_growth","sciencetable","sc_science","Measure the green plant with a ruler","Đo chiều cao cây bằng thước",
  "Our healthy bean sprout has grown three centimeters taller in the warm sunlight!",
  "Mầm đậu khỏe mạnh của lớp chúng ta đã cao thêm ba xăng-ti-mét dưới ánh nắng ấm áp!",
  ["healthy","grown","taller","sunlight"],"Thì hiện tại hoàn thành <b>has grown + so sánh hơn (taller)</b> diễn tả sự phát triển.",
  "Amazing observation! Warm sunlight and regular watering helped it grow so fast.","Quan sát tuyệt vời! Ánh nắng ấm áp và việc tưới nước đều đặn đã giúp cây lớn nhanh đấy.",
  "librarian"],
 ["mix_color_beakers","sciencetable","sc_science","Mix primary colors in beakers","Pha màu cơ bản trong cốc thí nghiệm",
  "When we mix bright yellow water and clear blue water, it turns emerald green!",
  "Khi chúng ta pha nước màu vàng tươi với nước màu xanh lam trong trẻo, nó chuyển sang màu xanh ngọc lục bảo!",
  ["mix","bright","yellow","emerald"],"Câu điều kiện loại 0 (sự thật khoa học): <b>When we mix..., it turns + tính từ chỉ màu</b>.",
  "Science and English together! 'It turns emerald green' is a wonderful descriptive phrase.","Kết hợp cả Khoa học và Tiếng Anh! 'It turns emerald green' là cụm miêu tả rất hay.",
  "librarian"],
 ["write_lab_observation","sciencetable","sc_science","Write a science lab observation","Ghi chép quan sát thí nghiệm",
  "I'm writing down our detailed science observation in clear English sentences.",
  "Tôi đang ghi lại kết quả quan sát khoa học chi tiết của nhóm bằng những câu tiếng Anh rõ ràng.",
  ["writing","detailed","observation","sentences"],"Danh từ <b>observation</b> (/ˌɑːbzərˈveɪʃən/) nghĩa là sự quan sát / ghi chép thí nghiệm.",
  "Clear lab notes make you both a great scientist and a strong English writer!","Ghi chép thí nghiệm rõ ràng giúp em vừa là nhà khoa học giỏi vừa viết tiếng Anh tốt!",
  "librarian"],

 // locker (+3)
 ["get_pe_shoes_from_locker","locker","sc_locker","Take clean sneakers for PE class","Lấy giày thể thao cho tiết Thể dục",
  "I'm taking my comfortable running shoes out of my locker for outdoor PE class.",
  "Tôi đang lấy đôi giày chạy bộ êm ái ra khỏi tủ đồ để chuẩn bị cho tiết Thể dục ngoài trời.",
  ["comfortable","running","shoes","outdoor"],"Cụm <b>PE (Physical Education) class</b> là tiết học Thể dục ở trường.",
  "Have fun in outdoor PE class! Running in the fresh air is great for your health.","Chúc em học tiết Thể dục ngoài trời thật vui! Chạy bộ trong không khí trong lành rất tốt cho sức khỏe."],
 ["decorate_locker_door","locker","sc_locker","Put an inspiring magnet on locker","Gắn nam châm khích lệ lên tủ",
  "I put a cheerful star magnet on my locker door that says 'Keep Learning Every Day!'",
  "Tôi đã gắn một chiếc nam châm hình ngôi sao vui tươi lên cánh tủ có dòng chữ 'Hãy học hỏi mỗi ngày!'",
  ["cheerful","magnet","locker","learning"],"Mệnh đề quan hệ <b>that says '...'</b> dùng để giới thiệu nội dung ghi trên biển/nhãn.",
  "What an uplifting message on your locker! Positive reminders keep us motivated.","Thông điệp trên tủ đồ của em thật tích cực! Những lời nhắc nhở vui vẻ giúp chúng ta luôn có động lực."],
 ["lock_student_locker","locker","sc_locker","Close and lock the locker securely","Đóng và khóa tủ đồ an toàn",
  "I'm closing my metal locker door and turning the combination lock securely.",
  "Tôi đang đóng cánh tủ kim loại và xoay ổ khóa số thật chắc chắn.",
  ["closing","metal","combination","securely"],"Cụm <b>combination lock</b> chỉ ổ khóa mật mã xoay số ở tủ học sinh.",
  "Good job locking up securely! Your personal belongings will be completely safe.","Khóa tủ cẩn thận thế là rất tốt! Đồ đạc cá nhân của em sẽ hoàn toàn an toàn."],

 // watercooler (+4)
 ["refill_reusable_water_bottle","watercooler","sc_water","Refill reusable water bottle","Châm đầy bình nước cá nhân",
  "I'm refilling my reusable sports bottle with cool filtered water to stay healthy.",
  "Tôi đang châm đầy bình nước thể thao tái sử dụng của mình bằng nước lọc mát để giữ gìn sức khỏe.",
  ["refilling","reusable","filtered","healthy"],"Động từ <b>refill A with B</b>: làm đầy lại bình A bằng chất lỏng B.",
  "Using a reusable water bottle is healthy for you and eco-friendly for our planet!","Dùng bình nước cá nhân tái sử dụng vừa tốt cho sức khỏe vừa bảo vệ môi trường!"],
 ["offer_water_to_classmate","watercooler","sc_water","Offer a cup of water to a friend","Rót nước mời bạn cùng lớp",
  "You look a little thirsty after speaking practice—would you like a cup of cold water?",
  "Trông cậu hơi khát sau phần luyện nói — cậu có muốn uống một cốc nước mát không?",
  ["thirsty","speaking","would you like","cold"],"Lời mời lịch sự: <b>Would you like a cup of...?</b>.",
  "How kind and thoughtful of you to share water with your classmate!","Em thật tốt bụng và chu đáo khi rót nước mời bạn cùng lớp!"],
 ["chat_by_water_cooler","watercooler","sc_water","Chat about the weather at break","Trò chuyện về thời tiết giờ ra chơi",
  "It's quite warm and humid today, isn't it? This cool water feels so refreshing!",
  "Hôm nay trời khá ấm và ẩm nhỉ? Ngụm nước mát này thật làm tỉnh cả người!",
  ["warm","humid","refreshing","water"],"Câu hỏi đuôi <b>isn't it?</b> dùng để bắt chuyện tự nhiên về thời tiết.",
  "Natural small talk! Using tag questions like 'isn't it?' sounds just like a native speaker.","Bắt chuyện tự nhiên lắm! Dùng câu hỏi đuôi 'isn't it?' nghe chuẩn như người bản xứ vậy."],
 ["wipe_water_spill","watercooler","sc_water","Wipe water drops near the cooler","Lau khô giọt nước vương bên bình",
  "I'm wiping up a few drops of spilled water so nobody slips on the wooden floor.",
  "Tôi đang lau khô vài giọt nước bị sánh ra ngoài để không ai bị trượt chân trên sàn gỗ.",
  ["wiping","spilled","slips","wooden"],"Liên từ <b>so (that) nobody slips</b> diễn tả mục đích phòng tránh trơn trượt.",
  "Thank you for keeping our classroom floor dry and safe for everyone!","Cảm ơn em đã giữ sàn lớp học luôn khô ráo và an toàn cho mọi người!"],

 // 11. computerstation (5)
 ["log_into_school_computer","computerstation","sc_computer","Log into the learning computer","Đăng nhập máy tính học tập",
  "I'm typing my student username to log into the classroom desktop computer.",
  "Tôi đang gõ tên tài khoản học sinh để đăng nhập vào máy tính để bàn của lớp.",
  ["typing","username","log into","computer"],"Phrasal verb <b>log into</b> (đăng nhập vào hệ thống/máy tính).",
  "You're logged in! Open the interactive English pronunciation app on the desktop.","Em đăng nhập xong rồi đấy! Hãy mở ứng dụng luyện phát âm tiếng Anh trên màn hình nhé."],
 ["practice_pronunciation_headset","computerstation","sc_computer","Practice pronunciation with headset","Đeo tai nghe luyện phát âm",
  "I'm wearing the comfortable headset and repeating English sentences into the microphone.",
  "Tôi đang đeo chiếc tai nghe êm ái và đọc lặp lại các câu tiếng Anh vào micrô.",
  ["wearing","comfortable","headset","repeating"],"Động từ <b>repeat after...</b> / <b>repeat into the microphone</b>: đọc lặp lại để luyện phát âm.",
  "The computer gave your pronunciation five stars! Your intonation is super clear.","Máy tính chấm phần phát âm của em 5 sao kìa! Ngữ điệu của em cực kỳ rõ ràng."],
 ["type_english_essay","computerstation","sc_computer","Type a short paragraph on computer","Gõ đoạn văn tiếng Anh trên máy",
  "I'm typing a short paragraph about my healthy morning routine on the keyboard.",
  "Tôi đang gõ một đoạn văn ngắn kể về thói quen buổi sáng lành mạnh của mình trên bàn phím.",
  ["typing","short","paragraph","healthy"],"Cụm <b>healthy morning routine</b> chỉ thói quen sinh hoạt buổi sáng tốt cho sức khỏe.",
  "Typing your paragraph in English helps you practice spelling and punctuation at once!","Gõ đoạn văn bằng tiếng Anh giúp em luyện cả chính tả lẫn dấu câu cùng lúc đấy!"],
 ["take_vocabulary_quiz_online","computerstation","sc_computer","Complete the fun vocabulary quiz","Làm bài đố từ vựng trực tuyến",
  "How many questions did you get right on the interactive vocabulary quiz? I got ten out of ten!",
  "Cậu trả lời đúng bao nhiêu câu trong bài đố từ vựng tương tác thế? Mình đạt 10 trên 10 luôn!",
  ["questions","right","interactive","ten out of ten"],"Cụm <b>ten out of ten (10/10)</b> dùng khi đạt điểm tuyệt đối.",
  "Ten out of ten! You've mastered all the school and daily life vocabulary!","Mười trên mười luôn! Em đã nắm vững toàn bộ từ vựng trường học và đời sống rồi!"],
 ["save_project_file","computerstation","sc_computer","Save the group project file","Lưu tệp bài thuyết trình nhóm",
  "I'm saving our English presentation file into the shared classroom folder before logging out.",
  "Tôi đang lưu tệp bài thuyết trình tiếng Anh của nhóm vào thư mục chung của lớp trước khi đăng xuất.",
  ["saving","presentation","shared","folder"],"Phân biệt <b>log in</b> (đăng nhập) và <b>log out</b> (đăng xuất).",
  "Smart move! Always save your presentation file before logging out of the computer.","Cẩn thận lắm! Hãy luôn lưu tệp bài thuyết trình trước khi đăng xuất khỏi máy tính nhé."],

 // 12. artcorner (5)
 ["paint_colorful_poster","artcorner","sc_art","Paint a classroom welcome poster","Vẽ áp phích chào mừng đầy màu sắc",
  "I'm painting a bright rainbow poster that says 'Speak English with Confidence!'",
  "Tôi đang vẽ một tấm áp phích cầu vồng rực rỡ có dòng chữ 'Hãy tự tin nói tiếng Anh!'",
  ["painting","bright","poster","confidence"],"Cụm <b>with confidence</b> (= <i>confidently</i>) nghĩa là một cách đầy tự tin.",
  "That rainbow poster looks gorgeous! We'll hang it right above the classroom door.","Tấm áp phích cầu vồng đẹp tuyệt! Chúng ta sẽ treo nó ngay phía trên cửa lớp nhé."],
 ["sketch_classroom_scene","artcorner","sc_art","Sketch our lively classroom","Phác họa khung cảnh lớp học",
  "I'm sketching our sunny classroom and friendly classmates on the wooden easel.",
  "Tôi đang phác họa phòng học đầy nắng và những người bạn cùng lớp thân thiện trên giá vẽ bằng gỗ.",
  ["sketching","sunny","friendly","easel"],"Danh từ <b>easel</b> (/ˈiːzəl/) nghĩa là giá đỡ tranh vẽ.",
  "You captured our sunny classroom so well! Art makes learning vocabulary memorable.","Em phác họa lớp học đầy nắng của chúng ta giống quá! Mỹ thuật giúp việc nhớ từ vựng thật ấn tượng."],
 ["mix_watercolor_paints","artcorner","sc_art","Mix soft watercolor paints","Pha màu nước dịu mắt",
  "Which two colors should I blend to paint a peaceful sunset sky?",
  "Em nên pha trộn hai màu nào để vẽ bầu trời hoàng hôn yên bình ạ?",
  ["colors","blend","peaceful","sunset"],"Động từ <b>blend / mix colors</b> nghĩa là pha trộn các màu sắc với nhau.",
  "Try blending warm orange and soft purple—it makes a magical sunset sky!","Em thử pha màu cam ấm với màu tím dịu xem — sẽ tạo ra bầu trời hoàng hôn tuyệt đẹp đấy!"],
 ["label_art_project_english","artcorner","sc_art","Label the drawing in English","Dán nhãn tiếng Anh cho bức vẽ",
  "I'm writing descriptive English labels next to every object in my nature drawing.",
  "Tôi đang viết các nhãn từ tiếng Anh miêu tả bên cạnh từng đồ vật trong bức tranh thiên nhiên của mình.",
  ["writing","descriptive","labels","nature"],"Động từ/danh từ <b>label</b> dùng khi ghi chú tên gọi tiếng Anh lên tranh ảnh.",
  "Labeling your drawings in English is a brilliant visual learning technique!","Ghi nhãn tiếng Anh lên tranh vẽ là một phương pháp học qua hình ảnh cực kỳ thông minh!"],
 ["wash_paintbrushes_clean","artcorner","sc_art","Wash the paintbrushes clean","Rửa sạch cọ vẽ sau khi dùng",
  "I'm rinsing the soft paintbrushes in the water cup so the bristles stay soft.",
  "Tôi đang rửa sạch những chiếc cọ vẽ mềm trong cốc nước để lông cọ luôn mềm mại.",
  ["rinsing","soft","paintbrushes","bristles"],"Động từ <b>rinse</b> nghĩa là tráng/rửa sạch bằng nước.",
  "Thank you for rinsing the paintbrushes! Taking care of art supplies helps the whole class.","Cảm ơn em đã rửa sạch cọ vẽ nhé! Giữ gìn đồ dùng mỹ thuật giúp ích cho cả lớp."],

 // 13. musicstand (5)
 ["read_english_song_lyrics","musicstand","sc_music","Read the English song lyrics","Đọc lời bài hát tiếng Anh",
  "I'm reading the cheerful lyrics on the music stand before we sing together.",
  "Tôi đang đọc lời bài hát vui tươi trên giá nhạc trước khi cả lớp cùng hát.",
  ["reading","cheerful","lyrics","music stand"],"Danh từ <b>lyrics</b> (/ˈlɪrɪks/ — luôn ở dạng số nhiều) nghĩa là lời bài hát.",
  "Learning English through cheerful song lyrics is one of the fastest ways to improve fluency!","Học tiếng Anh qua lời bài hát vui tươi là một trong những cách nhanh nhất để nói lưu loát!"],
 ["strum_classroom_ukulele","musicstand","sc_music","Strum a gentle chord on ukulele","Gảy hợp âm nhẹ nhàng trên đàn ukulele",
  "I'm strumming a gentle C-major chord on the wooden classroom ukulele.",
  "Tôi đang gảy một hợp âm Đô trưởng êm dịu trên cây đàn ukulele bằng gỗ của lớp.",
  ["strumming","gentle","chord","ukulele"],"Động từ <b>strum</b> dùng cho hành động quạt/gảy dây đàn guitar hoặc ukulele.",
  "What a sweet sound! Music brings such a joyful atmosphere to Room 204.","Âm thanh êm dịu quá! Âm nhạc mang lại bầu không khí thật vui tươi cho phòng 204."],
 ["sing_pronunciation_song","musicstand","sc_music","Sing the English rhythm song","Hát bài luyện ngữ điệu tiếng Anh",
  "Singing along to this catchy English melody helps me connect words smoothly!",
  "Hát theo giai điệu tiếng Anh bắt tai này giúp tôi nối âm giữa các từ thật mượt mà!",
  ["singing","catchy","melody","smoothly"],"Tính từ <b>catchy</b> dùng để khen một giai điệu bài hát dễ nhớ, bắt tai.",
  "Wonderful singing! Notice how words link together naturally in a catchy melody.","Hát hay lắm! Em có để ý các từ nối âm với nhau tự nhiên thế nào trong giai điệu không?"],
 ["clap_syllable_rhythm","musicstand","sc_music","Clap the word stress rhythm","Vỗ tay theo nhịp trọng âm từ",
  "Let's clap our hands to count the three syllables in 'com-pu-ter'!",
  "Chúng mình cùng vỗ tay để đếm ba âm tiết trong từ 'com-pu-ter' nào!",
  ["clap","count","syllables","computer"],"Danh từ <b>syllable</b> (/ˈsɪləbəl/) nghĩa là âm tiết của từ.",
  "Clapping syllables makes word stress so clear: com-PU-ter!","Vỗ tay theo âm tiết giúp nhận biết trọng âm từ cực kỳ rõ: com-PU-ter!"],
 ["adjust_music_stand_height","musicstand","sc_music","Adjust the music stand neatly","Chỉnh độ cao giá nhạc vừa tầm",
  "I'm adjusting the metal music stand so everyone can read the sheet music comfortably.",
  "Tôi đang chỉnh lại chiếc giá nhạc kim loại để mọi người đều đọc được bản nhạc một cách thoải mái.",
  ["adjusting","metal","sheet music","comfortably"],"Danh từ ghép <b>sheet music</b> chỉ bản nhạc in trên giấy.",
  "Perfect height! Now the whole front row can see the sheet music clearly.","Độ cao vừa đẹp luôn! Giờ cả dãy bàn đầu đều nhìn rõ bản nhạc rồi."],

 // 14. firstaidbox (5 — Health & Hygiene focus!)
 ["check_first_aid_supplies","firstaidbox","sc_firstaid","Check the school first-aid kit","Kiểm tra tủ y tế lớp học",
  "I'm checking the classroom first-aid kit to make sure we have clean bandages and antiseptic wipes.",
  "Tôi đang kiểm tra tủ y tế của lớp để chắc chắn rằng chúng ta có đủ băng cá nhân sạch và khăn sát khuẩn.",
  ["checking","first-aid","clean","bandages"],"Cụm <b>make sure (that)...</b> nghĩa là kiểm tra để đảm bảo điều gì.",
  "Being prepared is important! Our classroom first-aid kit is fully stocked and tidy.","Chuẩn bị sẵn sàng luôn rất quan trọng! Tủ y tế lớp mình đã đầy đủ và ngăn nắp rồi."],
 ["get_bandaid_paper_cut","firstaidbox","sc_firstaid","Put a band-aid on a small paper cut","Dán băng cá nhân cho vết đứt tay vì giấy",
  "Ouch, I got a tiny paper cut on my finger—may I get a clean band-aid from the first-aid box?",
  "Ái chà, em bị giấy cứa một vết nhỏ trên ngón tay — em xin một miếng băng cá nhân sạch trong tủ y tế được không ạ?",
  ["tiny","paper cut","finger","band-aid"],"Cụm <b>paper cut</b> chỉ vết đứt tay nhỏ do mép giấy sắc cứa vào.",
  "Oh dear, paper cuts can sting! Wash your finger gently and put this clean band-aid on.","Ôi, vết đứt tay do giấy hơi xót đấy! Em rửa nhẹ ngón tay rồi dán miếng băng cá nhân sạch này vào nhé."],
 ["rest_tired_eyes_exercise","firstaidbox","sc_firstaid","Do healthy eye-relaxing exercises","Tập thể dục thư giãn mắt",
  "My eyes feel a little tired after reading, so I'm looking at the green trees outside to rest them.",
  "Mắt tôi cảm thấy hơi mỏi sau khi đọc sách, nên tôi đang nhìn ra hàng cây xanh bên ngoài để thư giãn mắt.",
  ["tired","reading","green","rest"],"Quy tắc sức khỏe học đường 20-20-20: <b>rest your tired eyes</b> bằng cách nhìn cây xanh ở xa.",
  "Great health habit! Resting your eyes every twenty minutes keeps your vision sharp and healthy.","Thói quen sức khỏe rất tốt! Cho mắt nghỉ ngơi mỗi 20 phút giúp thị lực luôn sáng khỏe."],
 ["apply_hand_sanitizer_school","firstaidbox","sc_firstaid","Clean hands with sanitizer gel","Sát khuẩn tay sạch sẽ trước giờ ăn",
  "I'm rubbing refreshing hand sanitizer on my palms to keep germs away before snack time.",
  "Tôi đang xoa gel rửa tay khô mát dịu lên lòng bàn tay để ngăn vi khuẩn trước giờ ăn nhẹ.",
  ["rubbing","hand sanitizer","germs","snack"],"Cụm <b>keep germs away</b> nghĩa là giữ sạch khuẩn, bảo vệ sức khỏe.",
  "Clean hands keep everyone healthy and happy during the school day!","Đôi tay sạch sẽ giúp cả lớp luôn khỏe mạnh và vui vẻ suốt ngày học!"],
 ["ask_nurse_pass_headache","firstaidbox","sc_firstaid","Tell teacher about a mild headache","Báo cô giáo khi thấy hơi đau đầu",
  "Ms. Claire, I have a slight headache this morning—could I rest for a few minutes and drink some warm water?",
  "Cô Claire ơi, sáng nay em bị đau đầu nhẹ — em có thể nghỉ vài phút và uống chút nước ấm được không ạ?",
  ["slight","headache","morning","warm water"],"Mẫu câu thông báo sức khỏe: <b>I have a slight headache / sore throat / runny nose</b>.",
  "Of course, take it easy! Sit quietly, drink some warm water, and let me know if you need the school nurse.","Được chứ em, nghỉ ngơi đi nhé! Em ngồi thư giãn, uống chút nước ấm và báo cô nếu cần xuống phòng y tế nhé."],

 // 15. windowbench (5 — Weather & Nature focus!)
 ["open_window_fresh_air","windowbench","sc_window","Open the window for fresh breeze","Mở cửa sổ đón gió mát trong lành",
  "Let's open the classroom window a little bit to let the cool morning breeze in!",
  "Chúng mình cùng mở hé cửa sổ lớp học một chút để đón làn gió sớm mát lành vào phòng nhé!",
  ["open","window","cool","breeze"],"Cụm <b>let the cool breeze in</b>: đón làn gió mát thổi vào phòng.",
  "Ah, that fresh morning breeze feels wonderful! Good ventilation helps us concentrate better.","À, làn gió buổi sáng trong lành dễ chịu quá! Phòng học thoáng khí giúp chúng ta tập trung tốt hơn nhiều."],
 ["update_daily_weather_chart","windowbench","sc_window","Update the classroom weather chart","Cập nhật bảng thời tiết hằng ngày",
  "How is the weather today? It's bright, sunny, and pleasantly warm with a clear blue sky!",
  "Thời tiết hôm nay thế nào nhỉ? Trời sáng sủa, có nắng đẹp và ấm áp dễ chịu với bầu trời xanh trong!",
  ["weather","bright","sunny","pleasantly"],"Mẫu hỏi–đáp thời tiết chuẩn: <b>How is the weather today? — It's bright, sunny, and warm!</b>.",
  "Thank you for updating our weather chart! 'Pleasantly warm with a clear blue sky' is a great description.","Cảm ơn em đã cập nhật bảng thời tiết! 'Pleasantly warm with a clear blue sky' là cách miêu tả rất hay."],
 ["describe_sunny_sky_outside","windowbench","sc_window","Describe the fluffy white clouds","Miêu tả những đám mây trắng ngoài cửa sổ",
  "Look out the window! Fluffy white clouds are floating slowly across the blue sky.",
  "Nhìn ra ngoài cửa sổ kìa! Những đám mây trắng xốp đang trôi chậm rãi ngang bầu trời xanh.",
  ["window","fluffy","clouds","floating"],"Tính từ <b>fluffy</b> (/ˈflʌfi/) miêu tả những đám mây trắng bồng bềnh như bông.",
  "What poetic English! 'Fluffy white clouds floating slowly' paints a vivid picture.","Câu tiếng Anh giàu hình ảnh quá! 'Fluffy white clouds floating slowly' vẽ nên một bức tranh thật sống động."],
 ["close_blinds_reduce_glare","windowbench","sc_window","Adjust window blinds for the screen","Chỉnh rèm cửa sổ giảm chói nắng",
  "The afternoon sun is very bright, so I'm tilting the window blinds to reduce glare on the board.",
  "Nắng chiều đang rất chói, nên tôi nghiêng nhẹ rèm cửa sổ để giảm độ lóa trên bảng trắng.",
  ["afternoon","bright","blinds","glare"],"Danh từ <b>glare</b> chỉ ánh sáng chói lóa chiếu vào màn hình hoặc bảng.",
  "Very thoughtful! Adjusting the blinds makes the whiteboard much easier for everyone to read.","Chu đáo lắm! Chỉnh lại rèm cửa giúp mọi người nhìn bảng trắng dịu mắt hơn hẳn."],
 ["watch_birds_outside_window","windowbench","sc_window","Listen to birds chirping outside","Nghe tiếng chim hót trên cành cây",
  "Can you hear those little sparrows chirping cheerfully in the green schoolyard tree?",
  "Cậu có nghe thấy mấy chú chim sẻ nhỏ đang hót líu lo vui vẻ trên tán cây xanh sân trường không?",
  ["hear","sparrows","chirping","cheerfully"],"Cấu trúc giác quan <b>hear + tân ngữ + V-ing</b> (nghe thấy âm thanh đang diễn ra).",
  "Those little sparrows sound like they're practicing their morning lesson too!","Mấy chú chim sẻ nhỏ nghe như cũng đang luyện bài học buổi sáng cùng lớp mình vậy!"],

 // 16. projector (5)
 ["turn_on_smart_projector","projector","sc_projector","Turn on the smart projector","Bật máy chiếu thông minh",
  "I'm pressing the remote button to turn on the ceiling projector for our video lesson.",
  "Tôi đang bấm nút điều khiển từ xa để bật chiếc máy chiếu trên trần cho bài học qua video.",
  ["pressing","remote","turn on","projector"],"Phrasal verb <b>turn on / switch on</b> (bật thiết bị điện tử).",
  "The projector is warming up! Everyone get ready to watch a short English dialogue clip.","Máy chiếu đang lên hình rồi! Cả lớp chuẩn bị xem một đoạn video hội thoại tiếng Anh ngắn nhé."],
 ["watch_english_video_clip","projector","sc_projector","Watch a native English dialogue video","Xem video hội thoại người bản xứ",
  "Watching short videos with English subtitles helps me understand natural expressions.",
  "Xem các đoạn video ngắn có phụ đề tiếng Anh giúp tôi hiểu được những cách diễn đạt tự nhiên.",
  ["watching","subtitles","understand","natural"],"Danh từ <b>subtitles</b> (/ˈsʌbtaɪtəlz/) nghĩa là phụ đề hiển thị dưới màn hình.",
  "Watching with English subtitles is fantastic for linking spoken sounds to written words!","Xem kèm phụ đề tiếng Anh rất tuyệt để kết nối âm thanh nghe được với mặt chữ!"],
 ["present_group_slides","projector","sc_projector","Present group slides to the class","Thuyết trình slide nhóm trước lớp",
  "Good morning, everyone! Today our group will present three easy ways to stay healthy at school.",
  "Chào buổi sáng mọi người! Hôm nay nhóm mình sẽ thuyết trình về ba cách đơn giản để giữ sức khỏe ở trường.",
  ["present","group","easy","healthy"],"Động từ <b>present</b> (/prɪˈzent/) nghĩa là trình bày / thuyết trình trước lớp.",
  "Wonderful opening for your presentation! Your voice is clear, confident, and engaging.","Mở đầu bài thuyết trình ấn tượng lắm! Giọng của em rõ ràng, tự tin và cuốn hút."],
 ["point_at_projected_map","projector","sc_projector","Point at the projected weather map","Chỉ vào bản đồ thời tiết trên màn chiếu",
  "As you can see on the projected map, northern Vietnam has cool, crisp weather in winter.",
  "Như các bạn có thể thấy trên bản đồ chiếu trên bảng, miền Bắc Việt Nam có thời tiết mát lạnh trong lành vào mùa đông.",
  ["projected","northern","cool","winter"],"Cụm mở đầu thuyết trình chuyên nghiệp: <b>As you can see on the map/screen...</b>.",
  "Great use of transition phrases! 'As you can see on the map' sounds very professional.","Dùng cụm chuyển ý chuẩn lắm! 'As you can see on the map' nghe rất chuyên nghiệp."],
 ["turn_off_projector_save_power","projector","sc_projector","Turn off projector to save energy","Tắt máy chiếu để tiết kiệm điện",
  "I'm turning off the projector after our presentation to save electricity and keep the bulb cool.",
  "Tôi đang tắt máy chiếu sau bài thuyết trình của nhóm để tiết kiệm điện và giữ bóng đèn mát.",
  ["turning off","projector","save","electricity"],"Cụm <b>save electricity / save energy</b> nghĩa là tiết kiệm điện năng.",
  "Thank you for turning off the projector! Saving energy is a smart habit.","Cảm ơn em đã tắt máy chiếu nhé! Tiết kiệm điện là một thói quen rất văn minh."],

 // 17. readingrug (5)
 ["sit_on_cozy_reading_rug","readingrug","sc_rug","Sit on the cozy reading rug","Ngồi lên tấm thảm đọc sách êm ái",
  "I'm sitting cross-legged on the soft teal rug in the quiet reading corner.",
  "Tôi đang ngồi xếp bằng trên tấm thảm màu xanh ngọc êm ái ở góc đọc sách yên tĩnh.",
  ["sitting","soft","rug","quiet"],"Tính từ ghép <b>cross-legged</b> chỉ tư thế ngồi khoanh chân trên thảm.",
  "Make yourself comfortable on the reading rug! A cozy spot makes reading even more enjoyable.","Em cứ ngồi thoải mái trên thảm đọc sách nhé! Một góc êm ái giúp việc đọc sách càng thú vị hơn.",
  "librarian"],
 ["read_aloud_story_circle","readingrug","sc_rug","Read a story page aloud with expression","Đọc to trang truyện với ngữ điệu truyền cảm",
  "I'm reading this exciting dialogue aloud with expressive voices for each character!",
  "Tôi đang đọc to đoạn hội thoại gay cấn này với giọng điệu biểu cảm cho từng nhân vật!",
  ["reading","aloud","expressive","character"],"Cụm <b>read aloud with expression</b> nghĩa là đọc thành tiếng một cách diễn cảm.",
  "Wow, your character voices are amazing! Everyone in the reading circle is smiling.","Ồ, giọng giả nhân vật của em đỉnh quá! Cả nhóm đọc sách đều đang mỉm cười kìa.",
  "librarian"],
 ["share_favorite_book_character","readingrug","sc_rug","Talk about your favorite character","Kể về nhân vật sách yêu thích",
  "Who is your favorite character in the book? I admire the brave and curious young explorer!",
  "Nhân vật yêu thích của cậu trong cuốn sách là ai? Mình rất ngưỡng mộ nhà thám hiểm trẻ tuổi dũng cảm và giàu trí tò mò!",
  ["favorite","character","brave","curious"],"Tính từ <b>brave</b> (dũng cảm) và <b>curious</b> (ham học hỏi, tò mò khám phá).",
  "Great character description! Using adjectives like 'brave' and 'curious' explains why you admire them.","Miêu tả nhân vật hay lắm! Dùng tính từ 'brave' và 'curious' giải thích rất rõ vì sao em yêu thích nhân vật đó.",
  "librarian"],
 ["listen_to_librarian_story","readingrug","sc_rug","Listen to Mr. Leo's storytelling","Lắng nghe thầy Leo kể chuyện tiếng Anh",
  "We are listening attentively as Mr. Leo tells a heartwarming fable about friendship.",
  "Chúng tôi đang chăm chú lắng nghe khi thầy Leo kể một câu chuyện ngụ ngôn ấm áp về tình bạn.",
  ["listening","attentively","heartwarming","friendship"],"Trạng từ <b>attentively</b> (một cách chăm chú) và tính từ <b>heartwarming</b> (ấm lòng).",
  "Thank you for listening so attentively! What moral lesson did you learn from this fable?","Cảm ơn các em đã lắng nghe chăm chú! Các em rút ra bài học ý nghĩa gì từ truyện ngụ ngôn này nào?",
  "librarian"],
 ["fluff_reading_cushions","readingrug","sc_rug","Tidy the colorful floor cushions","Xếp gọn những chiếc đệm ngồi đọc sách",
  "I'm fluffing the soft orange and yellow cushions and placing them neatly on the rug.",
  "Tôi đang vỗ phồng những chiếc đệm ngồi màu cam và vàng êm ái rồi xếp chúng ngay ngắn trên thảm.",
  ["fluffing","soft","cushions","neatly"],"Động từ <b>fluff the cushions</b> nghĩa là vỗ nhẹ cho gối/đệm phồng êm trở lại.",
  "The reading corner looks so inviting now! Thank you for tidying the cushions.","Góc đọc sách trông thật ấm cúng và bắt mắt! Cảm ơn em đã xếp gọn các tấm đệm nhé.",
  "librarian"],

 // 18. trophycase (5)
 ["admire_spelling_bee_trophy","trophycase","sc_trophy","Admire the Spelling Bee gold cup","Chiêm ngưỡng cúp vàng Đánh vần tiếng Anh",
  "Look at this shiny gold trophy our class won in the annual English Spelling Bee!",
  "Hãy nhìn chiếc cúp vàng sáng bóng mà lớp chúng ta đã giành được trong cuộc thi Đánh vần tiếng Anh thường niên kìa!",
  ["shiny","trophy","annual","Spelling Bee"],"Tính từ <b>annual</b> (/ˈænjuəl/) nghĩa là diễn ra hằng năm (thường niên).",
  "Room 204 worked so hard for that Spelling Bee trophy! You should all be proud.","Phòng 204 đã nỗ lực rất nhiều để giành chiếc cúp Spelling Bee đó! Các em rất đáng tự hào.",
  "librarian"],
 ["read_student_of_month_plaque","trophycase","sc_trophy","Read the Student of the Month board","Đọc bảng vinh danh Học sinh của Tháng",
  "I'm reading the inspiring names on the 'Helpful & Kind Student of the Month' plaque.",
  "Tôi đang đọc những cái tên đầy cảm hứng trên tấm bảng vinh danh 'Học sinh Tốt bụng & Nhiệt tình của Tháng'.",
  ["reading","inspiring","helpful","plaque"],"Danh từ <b>plaque</b> (/plæk/) chỉ tấm bảng vinh danh gắn trên tường hoặc tủ cúp.",
  "Being kind and helpful to classmates is just as important as getting high grades!","Sống tốt bụng và hay giúp đỡ bạn bè cũng đáng quý không kém gì việc đạt điểm cao!",
  "librarian"],
 ["polish_trophy_glass","trophycase","sc_trophy","Wipe fingerprints off the trophy case","Lau sạch mặt kính tủ cúp",
  "I'm gently wiping the glass door of the trophy case so the medals sparkle brightly.",
  "Tôi đang nhẹ nhàng lau cánh cửa kính của tủ cúp để những tấm huy chương lấp lánh rực rỡ.",
  ["gently","wiping","medals","sparkle"],"Động từ <b>sparkle</b> nghĩa là tỏa sáng lấp lánh.",
  "Look how those gold medals sparkle now! Thank you for keeping the display case clean.","Nhìn những tấm huy chương vàng lấp lánh chưa kìa! Cảm ơn em đã giữ tủ trưng bày sạch bóng.",
  "librarian"],
 ["set_personal_study_goal","trophycase","sc_trophy","Set a personal English goal","Đặt mục tiêu học tiếng Anh cá nhân",
  "My personal goal this semester is to speak English fluently for ten minutes without stopping!",
  "Mục tiêu cá nhân của tôi trong học kỳ này là nói tiếng Anh lưu loát suốt mười phút không ngừng!",
  ["personal","goal","semester","fluently"],"Trạng từ <b>fluently</b> (một cách trôi chảy, lưu loát) đi với động từ <i>speak</i>.",
  "That is a fantastic and achievable goal! Practice a little every day and you'll reach it easily.","Đó là một mục tiêu rất tuyệt và hoàn toàn khả thi! Cứ luyện tập mỗi ngày một chút là em sẽ đạt được thôi.",
  "librarian"],
 ["take_class_pride_photo","trophycase","sc_trophy","Smile by the class honor case","Chụp ảnh kỷ niệm bên tủ truyền thống",
  "Let's stand by the trophy case and give a big, cheerful smile for the school newsletter!",
  "Chúng mình cùng đứng cạnh tủ cúp thành tích và nở nụ cười thật tươi cho bản tin trường nhé!",
  ["stand","trophy","cheerful","newsletter"],"Cụm <b>give a big smile</b> nghĩa là nở một nụ cười thật tươi.",
  "Say 'Sunnyvale!' That photo will look wonderful in this month's school newsletter!","Cùng hô 'Sunnyvale' nào! Bức ảnh này lên bản tin trường tháng này sẽ đẹp lắm đây!",
  "librarian"],

 // 19. recyclingbin (5)
 ["sort_scrap_paper_recycle","recyclingbin","sc_recycle","Put scrap paper in the blue bin","Bỏ giấy nháp vào thùng tái chế màu xanh",
  "I'm placing my used scratch paper into the blue paper-recycling bin.",
  "Tôi đang bỏ tờ giấy nháp đã dùng vào chiếc thùng tái chế giấy màu xanh dương.",
  ["placing","used","scratch paper","recycling"],"Cụm <b>scratch paper / scrap paper</b> chỉ giấy nháp đã viết qua.",
  "Great eco-habit! Recycling paper saves trees and keeps our classroom clutter-free.","Thói quen xanh tuyệt vời! Tái chế giấy giúp bảo vệ cây rừng và giữ lớp học gọn gàng."],
 ["recycle_empty_plastic_bottle","recyclingbin","sc_recycle","Recycle an empty plastic bottle","Bỏ vỏ chai nhựa vào thùng tái chế",
  "Where should I put this empty plastic bottle? It goes right into the green recycling bin!",
  "Mình nên bỏ vỏ chai nhựa rỗng này vào đâu nhỉ? Nó thuộc về thùng tái chế màu xanh lá cây này đây!",
  ["where","empty","plastic","recycling bin"],"Cấu trúc hỏi–đáp vị trí để đồ: <b>Where should I put...? — It goes into...</b>.",
  "Spot on! Sorting plastic and paper into separate bins makes recycling super easy.","Chính xác! Phân loại nhựa và giấy vào các thùng riêng giúp việc tái chế cực kỳ hiệu quả."],
 ["read_eco_classroom_rules","recyclingbin","sc_recycle","Read the 'Reduce, Reuse, Recycle' sign","Đọc khẩu hiệu 'Giảm thiểu, Tái sử dụng, Tái chế'",
  "Our green classroom motto is 'Reduce waste, Reuse bottles, and Recycle paper every day!'",
  "Khẩu hiệu lớp học xanh của chúng tôi là 'Giảm rác thải, Tái sử dụng bình nước và Tái chế giấy mỗi ngày!'",
  ["motto","reduce","reuse","recycle"],"Bộ ba động từ môi trường nổi tiếng: <b>Reduce, Reuse, Recycle</b>.",
  "Say it loud and proud: Reduce, Reuse, Recycle! Room 204 is the greenest class in school.","Đọc vang thật tự hào nào: Reduce, Reuse, Recycle! Phòng 204 là lớp học xanh nhất trường đấy."],
 ["sharpen_pencil_over_bin","recyclingbin","sc_recycle","Sharpen wooden pencil neatly over bin","Gọt bút chì gọn gàng trên miệng thùng rác",
  "I'm sharpening my dull wooden pencil over the bin so the shavings don't fall on the floor.",
  "Tôi đang gọt chiếc bút chì gỗ bị cùn ngay trên miệng thùng để vỏ bút không rơi xuống sàn.",
  ["sharpening","dull","pencil","shavings"],"Tính từ <b>dull</b> (cùn, tù đầu bút) đối lập với <b>sharp</b> (nhọn, sắc).",
  "Now your pencil has a sharp point for writing, and the floor stayed completely clean!","Giờ bút chì của em đã nhọn để viết bài, mà sàn lớp vẫn sạch tinh tươm!"],
 ["tidy_classroom_floor_litter","recyclingbin","sc_recycle","Pick up a stray wrapper from floor","Nhặt mẩu giấy vụn trên sàn bỏ vào thùng",
  "I picked up a small piece of crumpled paper from the floor and tossed it in the bin.",
  "Tôi đã nhặt một mẩu giấy nhàu nhỏ trên sàn lên và bỏ gọn vào thùng rác.",
  ["picked up","crumpled","floor","tossed"],"Phrasal verb <b>pick up</b> (nhặt lên) và tính từ <b>crumpled</b> (bị vo nhàu).",
  "Thank you for picking that up without even being asked! You're a true role model.","Cảm ơn em đã tự giác nhặt rác giúp lớp! Em đúng là một tấm gương sáng."],

 // 20. lunchcubby (5 — Healthy food & everyday Q&A!)
 ["check_healthy_lunchbox","lunchcubby","sc_lunch","Check my nutritious lunchbox","Kiểm tra hộp cơm trưa bổ dưỡng",
  "What did you bring for lunch today? My mom packed a nutritious sandwich and fresh fruit!",
  "Hôm nay cậu mang gì đi ăn trưa thế? Mẹ mình đã chuẩn bị một chiếc bánh mì kẹp bổ dưỡng và trái cây tươi!",
  ["bring","lunch","nutritious","fresh"],"Tính từ <b>nutritious</b> (/nuˈtrɪʃəs/) nghĩa là giàu dinh dưỡng, bổ dưỡng cho sức khỏe.",
  "A nutritious sandwich and fresh fruit will give you plenty of energy for afternoon classes!","Bánh mì kẹp bổ dưỡng và trái cây tươi sẽ tiếp thêm thật nhiều năng lượng cho buổi học chiều!"],
 ["eat_fresh_apple_snack","lunchcubby","sc_lunch","Eat a crisp red apple at break","Ăn táo đỏ giòn ngọt giờ giải lao",
  "I'm eating a crisp, sweet red apple during break time—an apple a day keeps the doctor away!",
  "Tôi đang ăn một quả táo đỏ giòn ngọt trong giờ giải lao — mỗi ngày một quả táo giúp chẳng cần gặp bác sĩ!",
  ["crisp","sweet","apple","doctor"],"Thành ngữ sức khỏe nổi tiếng: <b>An apple a day keeps the doctor away</b>.",
  "I love that proverb! 'An apple a day keeps the doctor away' is great advice for staying healthy.","Cô rất thích câu tục ngữ đó! 'An apple a day keeps the doctor away' là lời khuyên tuyệt vời cho sức khỏe."],
 ["share_granola_bar_friend","lunchcubby","sc_lunch","Share a healthy oat bar with a friend","Chia sẻ thanh ngũ cốc lành mạnh với bạn",
  "Would you like half of myrunchy honey-oat granola bar? It's delicious and healthy!",
  "Cậu có muốn ăn một nửa thanh ngũ cốc yến mạch mật ong giòn rụm của mình không? Ngon và tốt cho sức khỏe lắm đấy!",
  ["would you like","crunchy","granola","healthy"],"Tính từ <b>crunchy</b> (giòn rụm) và <b>healthy</b> (lành mạnh).",
  "Sharing healthy snacks with friends makes break time twice as sweet!","Chia sẻ đồ ăn nhẹ lành mạnh với bạn bè làm giờ giải lao vui gấp đôi!"],
 ["read_nutrition_poster","lunchcubby","sc_lunch","Read the healthy food pyramid chart","Đọc bảng tháp dinh dưỡng học đường",
  "According to the nutrition chart, eating colorful vegetables and drinking water helps us focus in class.",
  "Theo bảng dinh dưỡng, ăn nhiều rau củ nhiều màu sắc và uống đủ nước giúp chúng ta tập trung học tập trên lớp.",
  ["nutrition","colorful","vegetables","focus"],"Cụm <b>According to + nguồn thông tin</b>: theo như (biểu đồ, bài báo, cô giáo...).",
  "True! A healthy body and a sharp mind always go hand in hand.","Chuẩn luôn! Một cơ thể khỏe mạnh và một trí óc minh mẫn luôn đi đôi với nhau."],
 ["pack_empty_lunch_container","lunchcubby","sc_lunch","Pack the clean lunchbox back on shelf","Xếp gọn hộp cơm sạch lên kệ",
  "I'm placing my closed lunch container neatly back on the cubby shelf after snack time.",
  "Tôi đang đặt chiếc hộp đựng đồ ăn đã đậy nắp thật gọn gàng trở lại kệ sau giờ ăn nhẹ.",
  ["placing","closed","container","neatly"],"Danh từ <b>cubby / cubby shelf</b> chỉ kệ chia ngăn để đồ của học sinh trong lớp.",
  "Look how neat the lunch cubby shelf is! Everyone is ready for the next part of our lesson.","Nhìn kệ hộp cơm gọn gàng chưa kìa! Cả lớp đã sẵn sàng cho phần tiếp theo của bài học rồi."]
];

for(const spec of EXTRA_SPECS){
 const [id,obj,spot,label,labelVi,sentence,vi,keywords,grammarNote]=spec;
 const chunks=sentence.split(/\s+/);
 const mid=Math.max(2,Math.floor(chunks.length/3));
 const c3=[chunks.slice(0,mid).join(" "),chunks.slice(mid,mid*2).join(" "),chunks.slice(mid*2).join(" ")];
 const ans=keywords[0].split(" ")[0].replace(/[^a-zA-Z]/g,"").toLowerCase()||"school";
 ACTIONS.push(A(
  id,obj,label,labelVi,sentence,vi,keywords,[sentence],grammarNote,c3,
  {ans,opts:[ans,"school","class"]},
  [`In English class: <b>${sentence}</b>`],
  ()=>null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk",spot],["pose","reach",450],["set","sc_act_"+id,"done"],[" set_extra",id],["wait",220]].filter(s=>s[0]!==" set_extra"),
  V("classroom","teacher"),
  {done:W=>Boolean(W["sc_act_"+id]),story:[label.toLowerCase(),label.toLowerCase(),labelVi.toLowerCase()]}
 ));
}
// Special visual state hooks for projector actions
for(const a of ACTIONS){
 if(a.id==="turn_on_smart_projector"||a.id==="watch_english_video_clip"||a.id==="present_group_slides"||a.id==="point_at_projected_map"){
  const origSeq=a.seq;
  a.seq=W=>{const s=origSeq(W);s.splice(s.length-1,0,["set","sc_projector","on"]);return s;};
 }else if(a.id==="turn_off_projector_save_power"){
  const origSeq=a.seq;
  a.seq=W=>{const s=origSeq(W);s.splice(s.length-1,0,["set","sc_projector","off"]);return s;};
 }
}

// ── NPCs: English Teacher & School Librarian ──────────────────────────────
const NPCS=[
 {id:"teacher",name:"English Teacher",nameVi:"Cô giáo tiếng Anh",avatar:"👩‍🏫",anchor:"obj:teacherdesk",voice:"adult_female"},
 {id:"librarian",name:"School Librarian",nameVi:"Thầy thủ thư",avatar:"📚",anchor:"obj:bookshelf",voice:"young_male"}
];

const TEACHER_REPLIES={
 greet_the_teacher:{
  en:"Good morning! Welcome to Room 204. Take your seat and let's have a wonderful English class!",
  vi:"Chào buổi sáng em! Chào mừng đến phòng 204. Em ngồi vào chỗ để chúng ta bắt đầu tiết tiếng Anh thật vui nhé!"},
 check_class_schedule:{
  en:"Today we have Speaking Practice first, and then Reading Time at the library corner!",
  vi:"Hôm nay chúng ta có tiết Luyện nói trước, sau đó là giờ Đọc sách ở góc thư viện nhé!"},
 read_the_board:{
  en:"Great focus! Notice how we use full sentences when answering daily questions.",
  vi:"Tập trung tốt lắm! Em hãy chú ý cách chúng ta dùng câu hoàn chỉnh khi trả lời các câu hỏi hằng ngày nhé."},
 write_answer_on_board:{
  en:"Excellent handwriting and grammar! 'I ride my bicycle to school' is a perfect sentence!",
  vi:"Chữ viết và ngữ pháp xuất sắc! 'I ride my bicycle to school' là một câu hoàn hảo!"},
 clean_the_board:{
  en:"Thank you so much for wiping the whiteboard clean! You're very helpful.",
  vi:"Cảm ơn em rất nhiều vì đã lau sạch bảng trắng nhé! Em rất nhiệt tình giúp đỡ lớp."},
 ask_teacher_question:{
  en:"Good question! Break it into syllables and stress the first part clearly. Repeat after me!",
  vi:"Câu hỏi rất hay! Em hãy tách từ thành từng âm tiết và nhấn trọng âm rõ ràng nhé. Đọc theo cô nào!"},
 hand_in_homework:{
  en:"Thank you for handing in your homework on time! Your sentences are very neat — A plus!",
  vi:"Cảm ơn em đã nộp bài tập về nhà đúng hạn! Các câu em viết rất chỉn chu — Điểm A+ nhé!"},
 sit_at_student_desk:{
  en:"Sitting right in the front row shows great enthusiasm for learning English!",
  vi:"Ngồi ngay bàn đầu thể hiện tinh thần học tiếng Anh rất hăng hái đấy!"},
 open_english_textbook:{
  en:"Everyone is on page twenty-four now. Let's read the dialogue together!",
  vi:"Cả lớp đã mở trang 24 rồi. Chúng ta cùng đọc đoạn hội thoại nhé!"},
 take_class_notes:{
  en:"Writing down new phrases in your notebook is the best secret to mastering English!",
  vi:"Ghi chép các cụm từ mới vào vở chính là bí quyết tuyệt nhất để giỏi tiếng Anh đấy!"},
 raise_hand_to_speak:{
  en:"Yes, go ahead! I love seeing you raise your hand so confidently!",
  vi:"Cô mời em! Cô rất vui khi thấy em giơ tay phát biểu tự tin như vậy!"},
 take_out_notebook:{
  en:"Great, you have your notebook and pen ready on the desk!",
  vi:"Tuyệt lắm, em đã chuẩn bị sẵn vở và bút trên bàn rồi!"},
 pack_school_bag:{
  en:"Packing your textbook and notebook neatly keeps your schoolbag organized!",
  vi:"Xếp sách giáo khoa và vở gọn gàng giúp cặp sách của em luôn ngăn nắp!"},
 open_student_locker:{
  en:"Feel free to keep your extra items safely inside your locker during class.",
  vi:"Em cứ thoải mái cất đồ đạc cá nhân an toàn trong tủ đồ trong giờ học nhé."},
 put_away_jacket:{
  en:"Hanging your jacket neatly in the locker keeps your desk nice and spacious!",
  vi:"Treo áo khoác gọn trong tủ đồ giúp bàn học của em rộng rãi và thoáng đãng hơn!"},
 drink_cup_of_water:{
  en:"Staying hydrated during break time keeps your voice clear for speaking practice!",
  vi:"Uống đủ nước trong giờ giải lao giúp giọng của em luôn trong trẻo để luyện nói nhé!"}
};

const LIBRARIAN_REPLIES={
 borrow_storybook:{
  en:"Sure thing! This adventure storybook has great illustrations and everyday English idioms. Enjoy!",
  vi:"Được chứ em! Cuốn truyện phiêu lưu này có hình minh họa rất đẹp và nhiều thành ngữ tiếng Anh thông dụng. Chúc em đọc vui!"},
 return_library_book:{
  en:"Thank you for returning the book on time! Ready to pick out your next read?",
  vi:"Cảm ơn em đã trả sách đúng hạn nhé! Em đã sẵn sàng chọn cuốn tiếp theo chưa?"},
 spin_the_globe:{
  en:"Geography is fascinating! Every country on that globe has its own wonderful stories.",
  vi:"Địa lý thú vị lắm đấy! Mỗi quốc gia trên quả địa cầu đều có những câu chuyện tuyệt vời riêng."},
 find_country_on_globe:{
  en:"Spot on! You found both Vietnam and the UK right away!",
  vi:"Chính xác luôn! Em đã tìm ra cả Việt Nam và Vương quốc Anh ngay lập tức!"},
 look_through_microscope:{
  en:"Isn't science cool? Look how neatly those green plant cells are arranged!",
  vi:"Khoa học thú vị phải không nào? Nhìn xem các tế bào thực vật xếp đều nhau đẹp chưa kìa!"},
 water_class_plant:{
  en:"Look! The classroom plant bloomed right after you watered it!",
  vi:"Nhìn kìa! Chậu cây của lớp vừa nở hoa tươi tắn ngay sau khi em tưới nước đấy!"}
};

for(const spec of EXTRA_SPECS){
 const [id,,,,,,,,,en,vi,who]=spec;
 if(who==="librarian")LIBRARIAN_REPLIES[id]={en,vi};
 else TEACHER_REPLIES[id]={en,vi};
}

function reply(actionId){
 if(LIBRARIAN_REPLIES[actionId]){
  const r=LIBRARIAN_REPLIES[actionId];
  return {who:"School Librarian",vi_who:"Thầy thủ thư",avatar:"📚",en:r.en,vi:r.vi,anchor:"obj:bookshelf",voice:"young_male"};
 }
 if(TEACHER_REPLIES[actionId]){
  const r=TEACHER_REPLIES[actionId];
  return {who:"English Teacher",vi_who:"Cô giáo tiếng Anh",avatar:"👩‍🏫",en:r.en,vi:r.vi,anchor:"obj:teacherdesk",voice:"adult_female"};
 }
 return {who:"English Teacher",vi_who:"Cô giáo tiếng Anh",avatar:"👩‍🏫",
  en:"Wonderful English sentence! Keep practicing with confidence!",
  vi:"Câu tiếng Anh tuyệt lắm! Em hãy tiếp tục tự tin luyện tập nhé!",
  anchor:"obj:teacherdesk",voice:"adult_female"};
}

const LINES=[
 {speaker:"English Teacher",vi_speaker:"Cô giáo tiếng Anh",en:"Don't worry about making mistakes when speaking English—every sentence is progress!",vi:"Đừng sợ mắc lỗi khi nói tiếng Anh nhé — mỗi câu nói ra đều là một bước tiến bộ!"},
 {speaker:"School Librarian",vi_speaker:"Thầy thủ thư",en:"Reading just one short English story a day builds an amazing vocabulary.",vi:"Chỉ cần đọc một câu chuyện tiếng Anh ngắn mỗi ngày sẽ giúp bạn có vốn từ vựng tuyệt vời."}
];
for(const a of ACTIONS){
 const r=reply(a.id);
 if(r)LINES.push({id:a.id,actionId:a.id,speaker:r.who,vi_speaker:r.vi_who,en:r.en,vi:r.vi});
}

// ── Missions & Challenges ────────────────────────────────────────────────
const TEACHER_G={name:"English Teacher",vi:"Cô giáo tiếng Anh",avatar:"👩‍🏫",voice:"adult_female",anchor:"obj:teacherdesk"};
const LIBRARIAN_G={name:"School Librarian",vi:"Thầy thủ thư",avatar:"📚",voice:"young_male",anchor:"obj:bookshelf"};

function st(n,icon,ten,tvi,acts,done,auto,hen,hvi){
 return {n,icon,title_en:ten,title_vi:tvi,actions:acts,say_en:ten,
  done:typeof done==="function"?done:()=>false,
  autoAction:auto,next:typeof auto==="function"?auto:()=>auto,
  hint_en:hen,hint_vi:hvi,hint:{en:hen,vi:hvi}};
}
function story(log,leadEn,leadVi,map,closeEn,closeVi){
 const m=new Map(map.map(([a,en,vi])=>[a,{en,vi}]));
 const pEn=[],pVi=[];
 for(const x of (log||[]))if(m.has(x.id)&&!pEn.includes(m.get(x.id).en)){pEn.push(m.get(x.id).en);pVi.push(m.get(x.id).vi);}
 if(!pEn.length)for(const [,en,vi] of map){pEn.push(en);pVi.push(vi);}
 return {
  en:`${leadEn} I ${pEn.join(", then ")}. ${closeEn}`,
  vi:`${leadVi} Tôi đã ${pVi.join(", rồi ")}. ${closeVi}`
 };
}

const MISSIONS=[
 {id:"school_morning_class",title_en:"Ready for English Class",title_vi:"Tiết học tiếng Anh sôi nổi",room:"school",topic:"school",urgency:"normal",giver:TEACHER_G,
  desc_vi:"Chào cô giáo khi vào lớp, ngồi vào bàn học, mở sách giáo khoa, giơ tay phát biểu và nộp bài tập về nhà.",
  request:{en:"Good morning! Come in, take your seat, open your English textbook, raise your hand in class, and hand in your homework!",
           vi:"Chào buổi sáng! Em hãy vào lớp, ngồi vào bàn, mở sách giáo khoa tiếng Anh, giơ tay phát biểu và nộp bài tập về nhà nhé!"},
  steps:[
   st(1,"👋","Greet the English teacher","Chào cô giáo tiếng Anh",["greet_the_teacher"],W=>W.sc_teacher_greeted==="yes","greet_the_teacher","Click the classroom door on the left.","Nhấn vào cửa lớp học ở bên trái."),
   st(2,"🪑","Sit at the student desk","Ngồi vào bàn học",["sit_at_student_desk"],W=>W.sc_seat==="seated","sit_at_student_desk","Click the student desk in the middle of the classroom.","Nhấn vào bàn học sinh ở giữa lớp."),
   st(3,"📖","Open the English textbook","Mở sách giáo khoa tiếng Anh",["open_english_textbook"],W=>W.sc_textbook==="open","open_english_textbook","Click the student desk to open your textbook.","Nhấn vào bàn học để mở sách giáo khoa."),
   st(4,"✋","Raise your hand to answer","Giơ tay phát biểu",["raise_hand_to_speak"],W=>W.sc_hand==="raised","raise_hand_to_speak","Click the student desk to raise your hand.","Nhấn vào bàn học để giơ tay trả lời câu hỏi."),
   st(5,"📝","Hand in your homework","Nộp bài tập về nhà",["hand_in_homework"],W=>W.sc_homework==="handed_in","hand_in_homework","Click the teacher's desk to hand in your homework.","Nhấn vào bàn giáo viên để nộp bài tập về nhà.")
  ],
  result:log=>story(log,"What a productive English lesson!","Một tiết học tiếng Anh thật hiệu quả!",
   [["greet_the_teacher","greeted the teacher at the door","chào cô giáo ở cửa lớp"],["sit_at_student_desk","took my seat at the front desk","ngồi vào bàn học"],["open_english_textbook","opened my English textbook","mở sách giáo khoa tiếng Anh"],["raise_hand_to_speak","raised my hand confidently","tự tin giơ tay phát biểu"],["hand_in_homework","handed in my homework on time","nộp bài tập về nhà đúng hạn"]],
   "Ms. Claire gave me an A plus!","Cô Claire đã chấm cho tôi điểm A+!")},

 {id:"school_board_star",title_en:"Whiteboard & Notes Star",title_vi:"Sao sáng trên bảng & Ghi chép",room:"school",topic:"school",urgency:"chill",giver:TEACHER_G,
  desc_vi:"Đọc bài mới trên bảng, ghi chép vào vở, lên bảng viết câu trả lời rồi lau bảng sạch sẽ giúp lớp.",
  request:{en:"Let's practice writing! Read the examples on the board, take notes in your notebook, write your answer on the whiteboard, and wipe it clean!",
           vi:"Cùng luyện viết câu nhé! Em hãy đọc ví dụ trên bảng, ghi chép vào vở, lên bảng viết đáp án và lau bảng sạch sẽ giúp lớp nào!"},
  steps:[
   st(1,"👀","Read the lesson on the whiteboard","Đọc bài học trên bảng trắng",["read_the_board"],W=>W.sc_board==="read"||W.sc_board==="answered"||W.sc_board==="clean","read_the_board","Click the large whiteboard on the back wall.","Nhấn vào chiếc bảng trắng lớn trên tường."),
   st(2,"📓","Take notes in your notebook","Ghi chép bài vào vở",["take_out_notebook","take_class_notes"],W=>W.sc_notes==="written","take_class_notes","Click your student desk to take class notes.","Nhấn vào bàn học sinh để ghi chép bài."),
   st(3,"✍️","Write the answer on the board","Viết câu trả lời lên bảng",["write_answer_on_board"],W=>W.sc_board==="answered"||W.sc_board==="clean","write_answer_on_board","Click the whiteboard to write your sentence.","Nhấn vào bảng trắng để viết đáp án."),
   st(4,"🧽","Clean the whiteboard","Lau sạch bảng trắng",["clean_the_board"],W=>W.sc_board==="clean","clean_the_board","Click the whiteboard to wipe it clean with the eraser.","Nhấn vào bảng trắng để lau sạch bằng đồ lau bảng.")
  ],
  result:log=>story(log,"I practiced both reading and writing in class!","Tôi đã luyện cả kỹ năng đọc và viết trên lớp!",
   [["read_the_board","read the lesson on the whiteboard","đọc bài trên bảng trắng"],["take_class_notes","took careful notes in my notebook","ghi chép cẩn thận vào vở"],["write_answer_on_board","wrote my answer on the board","viết câu trả lời lên bảng"],["clean_the_board","wiped the whiteboard clean","lau sạch bảng trắng"]],
   "Practicing actively makes English so much easier!","Chủ động thực hành giúp tiếng Anh dễ hơn rất nhiều!")},

 {id:"school_curious_explorer",title_en:"Library & Science Explorer",title_vi:"Khám phá Thư viện & Khoa học",room:"school",topic:"school",urgency:"normal",giver:LIBRARIAN_G,
  desc_vi:"Xem thời khóa biểu, xoay quả địa cầu tìm các nước, quan sát tế bào lá qua kính hiển vi và mượn sách truyện tiếng Anh.",
  request:{en:"Welcome to the discovery corner! Check the schedule, find countries on the globe, look through the microscope, and borrow a storybook!",
           vi:"Chào mừng đến góc khám phá! Em hãy xem thời khóa biểu, tìm các quốc gia trên quả địa cầu, nhìn kính hiển vi và mượn một cuốn truyện nhé!"},
  steps:[
   st(1,"📅","Check the class schedule","Xem thời khóa biểu",["check_class_schedule"],W=>W.sc_schedule==="checked","check_class_schedule","Click the schedule noticeboard by the classroom door.","Nhấn vào bảng thời khóa biểu cạnh cửa lớp."),
   st(2,"🌍","Find countries on the world globe","Tìm quốc gia trên quả địa cầu",["spin_the_globe","find_country_on_globe"],W=>W.sc_globe==="spun"||W.sc_country==="found","find_country_on_globe","Click the world globe stand near the bookshelf.","Nhấn vào quả địa cầu cạnh kệ sách."),
   st(3,"🔬","Look through the science microscope","Nhìn qua kính hiển vi",["look_through_microscope"],W=>W.sc_microscope==="checked","look_through_microscope","Click the science experiment table on the right.","Nhấn vào bàn thí nghiệm khoa học ở góc phải."),
   st(4,"📚","Borrow an English storybook","Mượn sách truyện tiếng Anh",["borrow_storybook"],W=>W.sc_lib_book==="borrowed","borrow_storybook","Click the library bookshelf to borrow a storybook from Mr. Leo.","Nhấn vào kệ sách thư viện để mượn truyện từ thầy Leo.")
  ],
  result:log=>story(log,"I explored geography, science, and reading at school!","Tôi đã khám phá địa lý, khoa học và đọc sách tại trường!",
   [["check_class_schedule","checked the class schedule","xem thời khóa biểu"],["find_country_on_globe","found Vietnam and the UK on the globe","tìm thấy Việt Nam và Anh trên quả địa cầu"],["look_through_microscope","looked at a leaf cell through the microscope","quan sát tế bào lá qua kính hiển vi"],["borrow_storybook","borrowed an English adventure storybook","mượn một cuốn truyện phiêu lưu tiếng Anh"]],
   "Learning English across different subjects is awesome!","Học tiếng Anh qua nhiều môn học thật tuyệt vời!")},

 {id:"school_multimedia_presenter",title_en:"Multimedia & Pronunciation Lab",title_vi:"Thuyết trình Đa phương tiện & Phát âm",room:"school",topic:"school",urgency:"normal",giver:TEACHER_G,
  desc_vi:"Đăng nhập máy tính học tập, đeo tai nghe luyện phát âm, bật máy chiếu thông minh và thuyết trình slide nhóm.",
  request:{en:"Let's use our digital tools! Log into the computer, practice pronunciation with the headset, turn on the projector, and present your group slides!",
           vi:"Cùng sử dụng thiết bị số của lớp nhé! Em hãy đăng nhập máy tính, đeo tai nghe luyện phát âm, bật máy chiếu và thuyết trình slide nhóm nào!"},
  steps:[
   st(1,"💻","Log into the school computer","Đăng nhập máy tính học tập",["log_into_school_computer"],W=>Boolean(W.sc_act_log_into_school_computer),"log_into_school_computer","Click the computer station on the left foreground.","Nhấn vào bàn máy tính ở góc trước bên trái."),
   st(2,"🎧","Practice pronunciation with headset","Luyện phát âm với tai nghe",["practice_pronunciation_headset"],W=>Boolean(W.sc_act_practice_pronunciation_headset),"practice_pronunciation_headset","Click the computer station to practice speaking.","Nhấn vào bàn máy tính để đeo tai nghe luyện phát âm."),
   st(3,"📽️","Turn on the smart projector","Bật máy chiếu thông minh",["turn_on_smart_projector"],W=>W.sc_projector==="on"||Boolean(W.sc_act_turn_on_smart_projector),"turn_on_smart_projector","Click the smart ceiling projector above the whiteboard.","Nhấn vào chiếc máy chiếu phía trên bảng trắng."),
   st(4,"🗣️","Present group slides to the class","Thuyết trình slide nhóm",["present_group_slides"],W=>Boolean(W.sc_act_present_group_slides),"present_group_slides","Click the projector to present your slides.","Nhấn vào máy chiếu để thuyết trình slide trước lớp.")
  ],
  result:log=>story(log,"Our multimedia presentation went smoothly!","Bài thuyết trình đa phương tiện của chúng tôi diễn ra thật suôn sẻ!",
   [["log_into_school_computer","logged into the classroom computer","đăng nhập máy tính lớp học"],["practice_pronunciation_headset","practiced pronunciation with the headset","luyện phát âm qua tai nghe"],["turn_on_smart_projector","turned on the ceiling projector","bật máy chiếu thông minh"],["present_group_slides","presented our healthy-living slides confidently","tự tin thuyết trình slide về lối sống lành mạnh"]],
   "Everyone applauded our clear English speaking!","Cả lớp đã vỗ tay khen ngợi phần nói tiếng Anh rõ ràng của chúng tôi!")},

 {id:"school_weather_health_guardian",title_en:"Weather, Health & Eco Helper",title_vi:"Sức khỏe, Thời tiết & Lớp học Xanh",room:"school",topic:"school",urgency:"chill",giver:TEACHER_G,
  desc_vi:"Cập nhật bảng thời tiết ở cửa sổ, sát khuẩn tay ở tủ y tế, ăn táo đỏ bổ dưỡng và phân loại giấy tái chế.",
  request:{en:"Let's keep our class healthy and green! Update the weather chart by the window, sanitize your hands, enjoy a healthy apple snack, and recycle scrap paper!",
           vi:"Cùng giữ lớp học khỏe mạnh và xanh sạch nhé! Em hãy cập nhật bảng thời tiết cạnh cửa sổ, sát khuẩn tay, ăn táo đỏ giờ giải lao và bỏ giấy nháp vào thùng tái chế nào!"},
  steps:[
   st(1,"☀️","Update the classroom weather chart","Cập nhật bảng thời tiết",["update_daily_weather_chart","open_window_fresh_air"],W=>Boolean(W.sc_act_update_daily_weather_chart||W.sc_act_open_window_fresh_air),"update_daily_weather_chart","Click the sunny window & weather chart on the left wall.","Nhấn vào cửa sổ và bảng thời tiết trên tường trái."),
   st(2,"🧴","Clean hands at the first-aid kit","Sát khuẩn tay sạch sẽ",["apply_hand_sanitizer_school","check_first_aid_supplies"],W=>Boolean(W.sc_act_apply_hand_sanitizer_school||W.sc_act_check_first_aid_supplies),"apply_hand_sanitizer_school","Click the white first-aid box near the door.","Nhấn vào tủ y tế màu trắng cạnh cửa lớp."),
   st(3,"🍎","Eat a crisp apple at the lunch cubby","Ăn táo đỏ giòn ngọt",["eat_fresh_apple_snack","check_healthy_lunchbox"],W=>Boolean(W.sc_act_eat_fresh_apple_snack||W.sc_act_check_healthy_lunchbox),"eat_fresh_apple_snack","Click the lunch cubby shelf next to the backpack.","Nhấn vào kệ hộp cơm cạnh chiếc cặp sách."),
   st(4,"♻️","Sort scrap paper into recycling bin","Phân loại giấy tái chế",["sort_scrap_paper_recycle","read_eco_classroom_rules"],W=>Boolean(W.sc_act_sort_scrap_paper_recycle||W.sc_act_read_eco_classroom_rules),"sort_scrap_paper_recycle","Click the recycling bins near the student desk.","Nhấn vào thùng phân loại rác tái chế gần bàn học.")
  ],
  result:log=>story(log,"I practiced talking about weather, health, and eco-habits!","Tôi đã thực hành nói về thời tiết, sức khỏe và thói quen sống xanh!",
   [["update_daily_weather_chart","updated the sunny weather chart","cập nhật bảng thời tiết nắng đẹp"],["apply_hand_sanitizer_school","cleaned my hands with sanitizer","sát khuẩn tay sạch sẽ"],["eat_fresh_apple_snack","ate a crisp red apple at break","ăn một quả táo đỏ giòn ngọt"],["sort_scrap_paper_recycle","sorted scrap paper into the recycling bin","phân loại giấy nháp vào thùng tái chế"]],
   "Room 204 is bright, healthy, and eco-friendly!","Phòng 204 thật thoáng sáng, khỏe mạnh và thân thiện với môi trường!")},

 {id:"school_creative_arts_circle",title_en:"Arts, Music & Reading Circle",title_vi:"Sáng tạo Mỹ thuật, Âm nhạc & Đọc sách",room:"school",topic:"school",urgency:"chill",giver:LIBRARIAN_G,
  desc_vi:"Vẽ áp phích tiếng Anh trên giá vẽ, hát bài luyện ngữ điệu ở giá nhạc, ngồi thảm đọc sách và đặt mục tiêu ở tủ cúp.",
  request:{en:"Time for creative English! Paint a poster at the art easel, sing a rhythm song at the music stand, read aloud on the cozy rug, and set your study goal at the trophy case!",
           vi:"Đến giờ tiếng Anh sáng tạo rồi! Em hãy vẽ áp phích ở giá vẽ, hát luyện ngữ điệu ở giá nhạc, đọc truyện trên thảm êm và đặt mục tiêu học tập bên tủ cúp nhé!"},
  steps:[
   st(1,"🎨","Paint an English poster at the easel","Vẽ áp phích tiếng Anh",["paint_colorful_poster","label_art_project_english"],W=>Boolean(W.sc_act_paint_colorful_poster||W.sc_act_label_art_project_english),"paint_colorful_poster","Click the wooden art easel to the right of the whiteboard.","Nhấn vào giá vẽ mỹ thuật bên phải bảng trắng."),
   st(2,"🎵","Sing the pronunciation song","Hát bài luyện ngữ điệu",["sing_pronunciation_song","read_english_song_lyrics"],W=>Boolean(W.sc_act_sing_pronunciation_song||W.sc_act_read_english_song_lyrics),"sing_pronunciation_song","Click the music stand near the teacher's desk.","Nhấn vào giá nhạc gần bàn cô giáo."),
   st(3,"🧶","Read aloud on the cozy reading rug","Đọc truyện trên thảm đọc sách",["read_aloud_story_circle","sit_on_cozy_reading_rug"],W=>Boolean(W.sc_act_read_aloud_story_circle||W.sc_act_sit_on_cozy_reading_rug),"read_aloud_story_circle","Click the teal reading corner rug on the right.","Nhấn vào tấm thảm đọc sách màu xanh ngọc bên phải."),
   st(4,"🏆","Set a personal goal at trophy case","Đặt mục tiêu bên tủ cúp",["set_personal_study_goal","admire_spelling_bee_trophy"],W=>Boolean(W.sc_act_set_personal_study_goal||W.sc_act_admire_spelling_bee_trophy),"set_personal_study_goal","Click the trophy case on the far right wall.","Nhấn vào tủ cúp thành tích ở sát tường bên phải.")
  ],
  result:log=>story(log,"Art, music, and stories made English unforgettable today!","Mỹ thuật, âm nhạc và những câu chuyện đã làm tiết tiếng Anh hôm nay thật đáng nhớ!",
   [["paint_colorful_poster","painted a colorful confidence poster","vẽ tấm áp phích tự tin đầy màu sắc"],["sing_pronunciation_song","sang the catchy pronunciation song","hát bài luyện phát âm bắt tai"],["read_aloud_story_circle","read a story aloud on the rug","đọc to câu chuyện trên thảm êm"],["set_personal_study_goal","set my personal English speaking goal","đặt mục tiêu nói tiếng Anh cá nhân"]],
   "Mr. Leo and Ms. Claire were both super proud!","Cả thầy Leo và cô Claire đều vô cùng tự hào!")}
];

const T=(id,en,vi,anyOf,len,lvi,o)=>Object.assign({id,title_en:en,title_vi:vi,anyOf,learn_en:len,learn_vi:lvi},o||{});
const CHALLENGES=[
 {id:"school_model_student",icon:"🏫",title_en:"Model Student Day",title_vi:"Một ngày làm học sinh gương mẫu",
  goal_vi:"Chào cô giáo, cất áo khoác vào tủ, ngồi học và ghi chép bài, lên bảng viết đáp án, nộp bài tập và mượn sách thư viện.",minutes:7,
  requires:["go_school","open_english_textbook","hand_in_homework"],tasks:[
   T("greet","Greet the teacher","Chào cô giáo",["greet_the_teacher"],"ready for class","sẵn sàng cho tiết học",{free:true}),
   T("locker","Put jacket in locker","Cất áo khoác vào tủ đồ",["open_student_locker","put_away_jacket"],"inside my locker","trong tủ đồ cá nhân",{free:true}),
   T("seat","Sit at the student desk","Ngồi vào bàn học",["sit_at_student_desk"],"take my seat","ngồi vào chỗ"),
   T("book","Open the English textbook","Mở sách giáo khoa",["open_english_textbook"],"open to page","mở ra trang"),
   T("notes","Take class notes","Ghi chép bài vào vở",["take_class_notes"],"take careful notes","ghi chép bài cẩn thận"),
   T("board","Write answer on whiteboard","Viết đáp án lên bảng",["write_answer_on_board"],"on the whiteboard","lên bảng trắng"),
   T("ask","Ask how to pronounce a word","Hỏi cô cách phát âm",["ask_teacher_question"],"how do we pronounce","chúng ta phát âm thế nào"),
   T("hw","Hand in homework","Nộp bài tập về nhà",["hand_in_homework"],"hand in homework","nộp bài tập về nhà"),
   T("sci","Explore globe or microscope","Khám phá địa cầu / kính hiển vi",["spin_the_globe","find_country_on_globe","look_through_microscope"],"through the microscope","qua kính hiển vi"),
   T("lib","Borrow an English storybook","Mượn sách truyện tiếng Anh",["borrow_storybook"],"may I borrow","em có thể mượn")]},

 {id:"school_all_round_communicator",icon:"🌟",title_en:"All-Round Classroom Communicator",title_vi:"Giao tiếp toàn diện tại trường học",
  goal_vi:"Cập nhật thời tiết, hỏi thăm sức khỏe/tập mắt, luyện phát âm trên máy tính, thuyết trình với máy chiếu và đọc truyện trên thảm.",minutes:7,
  requires:["go_school"],tasks:[
   T("weather","Describe today's weather","Miêu tả thời tiết hôm nay",["update_daily_weather_chart","describe_sunny_sky_outside","open_window_fresh_air"],"pleasantly warm and sunny","ấm áp dễ chịu và có nắng",{free:true}),
   T("health","Practice school health & hygiene","Thực hành sức khỏe học đường",["rest_tired_eyes_exercise","apply_hand_sanitizer_school","ask_nurse_pass_headache"],"rest tired eyes","thư giãn mắt mỏi",{free:true}),
   T("comp","Practice on computer station","Luyện tập trên máy tính",["log_into_school_computer","practice_pronunciation_headset","take_vocabulary_quiz_online"],"repeat into the microphone","đọc lặp lại vào micrô"),
   T("proj","Present with smart projector","Thuyết trình với máy chiếu",["turn_on_smart_projector","present_group_slides","point_at_projected_map"],"as you can see","như các bạn có thể thấy"),
   T("art","Create art or music in English","Sáng tạo mỹ thuật / âm nhạc",["paint_colorful_poster","sing_pronunciation_song","read_english_song_lyrics"],"speak with confidence","nói một cách tự tin"),
   T("rug","Read aloud on the reading rug","Đọc truyện trên thảm đọc sách",["sit_on_cozy_reading_rug","read_aloud_story_circle","share_favorite_book_character"],"read aloud with expression","đọc to diễn cảm"),
   T("snack","Enjoy a healthy break snack","Thưởng thức bữa phụ lành mạnh",["check_healthy_lunchbox","eat_fresh_apple_snack","share_granola_bar_friend"],"an apple a day","mỗi ngày một quả táo"),
   T("eco","Sort recycling & set a goal","Phân loại rác & đặt mục tiêu",["sort_scrap_paper_recycle","recycle_empty_plastic_bottle","set_personal_study_goal"],"speak English fluently","nói tiếng Anh lưu loát")]},

 {id:"school_stem_and_library_pro",icon:"🔬",title_en:"STEM, Geography & Library Pro",title_vi:"Chuyên gia Khoa học, Địa lý & Thư viện",
  goal_vi:"Tra từ điển, nhờ thầy Leo gợi ý sách, so sánh múi giờ trên địa cầu, pha màu thí nghiệm và trả sách đúng hạn.",minutes:6,
  requires:["go_school"],tasks:[
   T("dict","Look up a word in dictionary","Tra từ trong từ điển",["look_up_word_in_dictionary","ask_librarian_for_recommendation"],"look up the meaning","tra cứu ý nghĩa",{free:true}),
   T("globe_tz","Compare world time zones","So sánh múi giờ quốc tế",["trace_equator_on_globe","compare_time_zones_globe","quiz_classmate_capitals"],"along the equator","dọc theo đường xích đạo",{free:true}),
   T("lab","Conduct science observation","Quan sát thí nghiệm khoa học",["measure_plant_growth","mix_color_beakers","write_lab_observation"],"detailed observation","quan sát chi tiết"),
   T("borrow_ret","Borrow and return storybook","Mượn và trả sách truyện",["borrow_storybook","return_library_book"],"return on time","trả đúng hạn"),
   T("trophy","Admire the Spelling Bee trophy","Chiêm ngưỡng cúp Đánh vần",["admire_spelling_bee_trophy","read_student_of_month_plaque"],"annual Spelling Bee","cuộc thi Đánh vần thường niên")]}
];

const VOCAB_PACK=Object.entries(SCV).slice(0,24).map(([k,[ipa,vi]])=>({id:"sc_"+k,en:k.replace(/_/g," "),ipa,vi,cat:"school",room:"school"}));

const school={
 id:"school",name:"Classroom",nameVi:"Lớp học",topic:"school",
 entry:{x:118,y:495,d:1},
 shellSvg:SC_SHELL,worldSvg:SC_WORLD,css:SC_CSS,
 spots:SC_SPOTS,objects:SC_OBJECTS,actions:ACTIONS,
 props:SC_PROPS,W0:SC_W0,applyState:applySchool,
 catalog:VOCAB_PACK,
 obstacles:[{x1:390,x2:550,y1:455,y2:495}]
};
window.ELW_ROOMS=window.ELW_ROOMS||{};
window.ELW_ROOMS.school=school;
window.ELW_SCHOOL={topic:"school",rooms:["school"],id:"school",npcs:NPCS,reply,missions:MISSIONS,challenges:CHALLENGES,vocab:VOCAB_PACK,lines:LINES,room:school};
})();
