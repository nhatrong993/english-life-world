/* =====================================================================
   TOPIC: AT A RESTAURANT (Quán ăn / Nhà hàng — Saigon Bistro)
   2.5D SVG scene (1000×640) · 20 interactive objects · 104 actions
   2 NPCs (Waiter 🤵 + Chef 👨‍🍳) · 6 missions · 3 challenges · 65+ vocab
   ===================================================================== */
(function(){
"use strict";
const root=typeof window!=="undefined"?window:globalThis;

const RSV={
 restaurant:["/ˈres.trɒnt/","nhà hàng / quán ăn","n"],
 table:["/ˈteɪ.bəl/","bàn ăn","n"],
 window:["/ˈwɪn.dəʊ/","cửa sổ","n"],
 seat:["/siːt/","chỗ ngồi","n"],
 napkin:["/ˈnæp.kɪn/","khăn ăn / khăn giấy","n"],
 lap:["/læp/","đùi (khi ngồi)","n"],
 menu:["/ˈmen.juː/","thực đơn","n"],
 special:["/ˈspeʃ.əl/","món đặc biệt","n"],
 recommend:["/ˌrek.əˈmend/","gợi ý / giới thiệu","v"],
 waiter:["/ˈweɪ.tər/","nhân viên phục vụ","n"],
 beef:["/biːf/","thịt bò","n"],
 noodles:["/ˈnuː.dəlz/","mì / phở","n"],
 soup:["/suːp/","súp / món nước","n"],
 spicy:["/ˈspaɪ.si/","cay","adj"],
 mild:["/maɪld/","ít cay / thanh dịu","adj"],
 iced_tea:["/ˌaɪst ˈtiː/","trà đá","n"],
 lemon:["/ˈlem.ən/","chanh vàng","n"],
 chef:["/ʃef/","đầu bếp","n"],
 broth:["/brɒθ/","nước dùng","n"],
 delicious:["/dɪˈlɪʃ.əs/","ngon miệng","adj"],
 lime:["/laɪm/","chanh xanh","n"],
 squeeze:["/skwiːz/","vắt (chanh)","v"],
 pepper:["/ˈpep.ər/","hạt tiêu","n"],
 pitcher:["/ˈpɪtʃ.ər/","bình rót nước","n"],
 pour:["/pɔːr/","rót (nước)","v"],
 dessert:["/dɪˈzɜːt/","món tráng miệng","n"],
 pudding:["/ˈpʊd.ɪŋ/","bánh flan / pudding","n"],
 bill:["/bɪl/","hoá đơn","n"],
 split:["/splɪt/","chia đôi","v"],
 tip:["/tɪp/","tiền boa (tip)","n"],
 reservation:["/ˌrez.əˈveɪ.ʃən/","đặt bàn trước","n"],
 appetite:["/ˈæp.ə.taɪt/","cảm giác ngon miệng","n"],
 vegetarian:["/ˌvedʒ.ɪˈteə.ri.ən/","thuần chay / ăn chay","adj"],
 allergy:["/ˈæl.ə.dʒi/","dị ứng thực phẩm","n"],
 ingredient:["/ɪnˈɡriː.di.ənt/","nguyên liệu","n"],
 herb:["/hɜːb/","rau thơm / thảo mộc","n"],
 chopsticks:["/ˈtʃɒp.stɪks/","đôi đũa","n"],
 appetizer:["/ˈæp.ə.taɪ.zər/","món khai vị","n"],
 salad:["/ˈsæl.əd/","món rau trộn (salad)","n"],
 dressing:["/ˈdres.ɪŋ/","nước sốt trộn salad","n"],
 crispy:["/ˈkrɪs.pi/","giòn rụm","adj"],
 nutritious:["/njuːˈtrɪʃ.əs/","bổ dưỡng","adj"],
 ginger:["/ˈdʒɪn.dʒər/","gừng tươi","n"],
digest:["/daɪˈdʒest/","tiêu hoá","v"],
 aroma:["/əˈrəʊ.mə/","hương thơm","n"],
 simmer:["/ˈsɪm.ər/","ninh / hầm nhỏ lửa","v"],
 ladle:["/ˈleɪ.dəl/","muôi múc canh","n"],
 smoothie:["/ˈsmuː.ði/","sinh tố trái cây","n"],
 herbal_tea:["/ˌhɜː.bəl ˈtiː/","trà thảo mộc","n"],
 umbrella:["/ʌmˈbrel.ə/","chiếc ô / dù","n"],
 drizzle:["/ˈdrɪz.əl/","mưa phùn nhẹ","n"],
 soap:["/səʊp/","xà phòng rửa tay","n"],
 hygiene:["/ˈhaɪ.dʒiːn/","vệ sinh sạch sẽ","n"],
 melody:["/ˈmel.ə.di/","giai điệu êm dịu","n"],
 acoustic:["/əˈkuː.stɪk/","nhạc mộc (acoustic)","adj"],
 patio:["/ˈpæt.i.əʊ/","sân hiên ngoài trời","n"],
 breeze:["/briːz/","làn gió mát","n"],
 lantern:["/ˈlæn.tən/","đèn lồng trang trí","n"],
 chalkboard:["/ˈtʃɔːk.bɔːd/","bảng phấn","n"],
 combo:["/ˈkɒm.bəʊ/","suất ăn kết hợp","n"],
 takeaway:["/ˈteɪk.ə.weɪ/","đồ ăn mang về","n"],
 container:["/kənˈteɪ.nər/","hộp đựng thức ăn","n"],
 receipt:["/rɪˈsiːt/","biên lai thanh toán","n"],
 review:["/rɪˈvjuː/","đánh giá / nhận xét","n"],
 hospitality:["/ˌhɒs.pɪˈtæl.ə.ti/","sự hiếu khách, chu đáo","n"]
};

const V=(...ks)=>ks.map(k=>[k.replace(/_/g," "),...(RSV[k]?[RSV[k][0],RSV[k][1]]:["",""])]);
const W4=(...ks)=>ks.filter(k=>RSV[k]).map(k=>[k.replace(/_/g," "),RSV[k][0],RSV[k][2]||"n",RSV[k][1]]);
const go=spot=>["walk",spot];
const set=(k,v)=>["set",k,v];
const pose=(p,ms=520)=>["pose",p,ms];
const wait=(ms=280)=>["wait",ms];

const RS_W0={
 rs_table:"none",rs_napkin:"table",rs_menu:"closed",rs_rec:"no",
 rs_noodles:"none",rs_spicy:"normal",rs_tea:"none",rs_extra_napkins:"no",
 rs_water:"empty",rs_lime:"no",rs_pepper:"no",rs_broth:"untasted",
 rs_dessert:"none",rs_bill:"none",rs_split:"no",rs_paid:"no",rs_chef:"none",rs_chef_watched:"no",
 // Expanded state keys for 82 new actions
 rs_reserv:"no",rs_wait_time:"no",rs_coat_check:"no",rs_seating_pref:"no",
 rs_chair_pulled:"no",rs_table_wiped:"no",rs_Silverware:"no",
 rs_allergies:"no",rs_veg_menu:"no",rs_calories:"no",
 rs_soup_Spoon:"no",rs_side_herbs:"no",
 rs_garlic:"no",rs_chili_sauce:"no",rs_fish_sauce:"no",
 rs_garnish:"no",rs_recipe_asked:"no",rs_broth_secret:"no",
 rs_slurp:"no",rs_beef_tender:"no",rs_portion:"no",
 rs_refill_water:"no",rs_warm_water:"no",rs_ice_cubes:"no",
 rs_fruit_tart:"no",rs_low_sugar:"no",rs_pack_dessert:"no",
 rs_check_receipt:"no",rs_wifi_asked:"no",
 rs_salad_plate:"no",rs_salad_greens:"no",rs_salad_tomato:"no",rs_salad_dressing:"no",rs_salad_eaten:"no",
 rs_kettle_lid:"no",rs_kettle_aroma:"no",rs_kettle_ladle:"no",rs_kettle_ginger:"no",rs_kettle_temp:"no",
 rs_juice_menu:"no",rs_orange_juice:"no",rs_herbal_tea:"no",rs_less_ice:"no",rs_smoothie:"no",
 rs_umbrella_dry:"no",rs_hang_raincoat:"no",rs_check_rain:"no",rs_scarf_hook:"no",rs_take_umbrella:"no",
 rs_turn_faucet:"no",rs_soap_wash:"no",rs_rinse_warm:"no",rs_dry_towel:"no",rs_sanitizer:"no",
 rs_listen_guitar:"no",rs_clap_song:"no",rs_request_melody:"no",rs_volume_nice:"no",rs_photo_stage:"no",
 rs_step_patio:"no",rs_evening_breeze:"no",rs_patio_lantern:"no",rs_patio_view:"no",rs_patio_weather:"no",
 rs_read_chalkboard:"no",rs_combo_deal:"no",rs_soup_of_day:"no",rs_weather_drink:"no",rs_local_farm:"no",
 rs_ask_box:"no",rs_pack_leftovers:"no",rs_bag_sauce:"no",rs_check_order_tag:"no",rs_eco_bag:"no",
 rs_rate_five_stars:"no",rs_write_comment:"no",rs_thank_host:"no",rs_take_mint:"no",rs_business_card:"no"
};

function A(id,obj,label,vi,sentence,viSent,words,also,note,chunks,disc,examples,pre,seq,vocab,{sitOk=false,story,done}={},requires=[]){
 const vList=vocab&&vocab.length?vocab:[["restaurant","/ˈres.trɒnt/","nhà hàng"]];
 const wList=vList.map(v=>v.length===4?v:[v[0],v[1],"n",v[2]]);
 const probeW={...RS_W0,sitting:false};
 const initSteps=(typeof seq==="function"?seq(probeW):[])||[];
 const changed=initSteps.filter(s=>Array.isArray(s)&&s[0]==="set"&&RS_W0[s[1]]!==s[2]);
 const lastSet=changed[changed.length-1]||initSteps.filter(s=>Array.isArray(s)&&s[0]==="set").pop();
 const doneFn=done||(lastSet?(W=>W[lastSet[1]]===lastSet[2]):(W=>!!W.sitting));
 const discObj=Array.isArray(disc)?{ans:disc[0],opts:disc}:disc;
 return {
  id,obj,label,labelVi:vi,vi:viSent,sentence,viSent,
  words:wList,keywords:words,key:words,also:also||[],
  note,grammarNote:note,grammar:note,
  chunks,disc:discObj,examples,patterns:examples,
  pre,seq,done:doneFn,vocab:vList,
  room:"restaurant",sitOk,
  story:story||[label.toLowerCase(),label.toLowerCase(),vi.toLowerCase()],
  requires
 };
}

function Q(id,obj,spot,poseName,stateKey,stateVal,label,labelVi,sentence,viSent,keywords,grammarNote,chunks,discOpts,examples,vKeys,storyArr,sitOk=false){
 return A(id,obj,label,labelVi,sentence,viSent,keywords,[],grammarNote,chunks,{ans:discOpts[0],opts:discOpts},examples,
  W=>W[stateKey]===stateVal?`Bạn đã ${labelVi.toLowerCase()} rồi.`:null,
  W=>[...(sitOk?[]:(W.sitting?[["stand"]]:[])),go(spot),pose(poseName,520),set(stateKey,stateVal),wait(260)],
  V(...vKeys),{sitOk,done:W=>W[stateKey]===stateVal,story:storyArr||[label.toLowerCase(),label.toLowerCase(),labelVi.toLowerCase()]});
}

const RS_PROPS={
 menu:`<rect x="-11" y="-14" width="22" height="28" rx="3" fill="#7a2e22" stroke="#3a1610" stroke-width="1.8"/><rect x="-7" y="-9" width="14" height="3" rx="1" fill="#f5d488"/><line x1="-7" y1="-2" x2="7" y2="-2" stroke="#f5d488" stroke-width="1.5"/><line x1="-7" y1="3" x2="5" y2="3" stroke="#f5d488" stroke-width="1.5"/>`,
 chopsticks:`<line x1="-10" y1="10" x2="10" y2="-10" stroke="#8a4b22" stroke-width="2.5" stroke-linecap="round"/><line x1="-7" y1="12" x2="12" y2="-7" stroke="#a65e2e" stroke-width="2.5" stroke-linecap="round"/>`,
 lime:`<circle r="8" fill="#5dbb3c" stroke="#2f6e1c" stroke-width="1.8"/><circle r="5" fill="#b7eb8f"/>`,
 glass:`<path d="M-7 -12 L7 -12 L5 10 L-5 10 Z" fill="#f2b738" opacity=".88" stroke="#7a4b12" stroke-width="1.6"/><circle cx="3" cy="-9" r="4" fill="#ffe45e" stroke="#c49a14" stroke-width="1.2"/>`,
 card:`<rect x="-14" y="-9" width="28" height="18" rx="3" fill="#2e6bc6" stroke="#183b73" stroke-width="1.6"/><rect x="-14" y="-4" width="28" height="4" fill="#182438"/><rect x="-10" y="3" width="8" height="4" rx="1" fill="#f0c850"/>`
};

const RS_SHELL=`
<defs>
 <linearGradient id="rsWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7ebd9"/><stop offset="1" stop-color="#ead4b8"/></linearGradient>
 <linearGradient id="rsFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c99668"/><stop offset="1" stop-color="#9e6d42"/></linearGradient>
 <linearGradient id="rsWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3e66"/><stop offset="1" stop-color="#587099"/></linearGradient>
</defs>
<rect width="1000" height="365" fill="url(#rsWall)"/>
<!-- Wainscoting wood paneling -->
<rect y="255" width="1000" height="110" fill="#7a4b2a"/>
<rect y="252" width="1000" height="8" fill="#59341a"/>
<g fill="#683e21" stroke="#4d2c15" stroke-width="2">
 <rect x="24" y="268" width="95" height="84" rx="4"/><rect x="138" y="268" width="95" height="84" rx="4"/>
 <rect x="252" y="268" width="95" height="84" rx="4"/><rect x="366" y="268" width="95" height="84" rx="4"/>
 <rect x="480" y="268" width="95" height="84" rx="4"/><rect x="594" y="268" width="95" height="84" rx="4"/>
 <rect x="708" y="268" width="95" height="84" rx="4"/><rect x="822" y="268" width="95" height="84" rx="4"/>
</g>
<!-- Evening restaurant window (left) + signboard -->
<g transform="translate(155,44)">
 <rect width="200" height="175" rx="12" fill="url(#rsWin)" stroke="#59341a" stroke-width="7"/>
 <circle cx="46" cy="42" r="16" fill="#fff3b0" opacity=".88"/>
 <circle cx="130" cy="34" r="2.2" fill="#fff"/><circle cx="165" cy="56" r="2" fill="#fff"/><circle cx="95" cy="62" r="1.8" fill="#fff"/>
 <rect x="12" y="110" width="38" height="58" fill="#1e2942"/><rect x="54" y="94" width="46" height="74" fill="#23304c"/>
 <rect x="104" y="118" width="40" height="50" fill="#1b253b"/><rect x="148" y="100" width="42" height="68" fill="#23304c"/>
 <g fill="#ffd875" opacity=".8">
  <rect x="20" y="120" width="7" height="9"/><rect x="33" y="120" width="7" height="9"/><rect x="64" y="106" width="8" height="10"/><rect x="80" y="122" width="8" height="10"/><rect x="158" y="114" width="8" height="10"/>
 </g>
 <line x1="100" y1="0" x2="100" y2="175" stroke="#59341a" stroke-width="5"/>
 <line x1="0" y1="92" x2="200" y2="92" stroke="#59341a" stroke-width="5"/>
</g>
<!-- Warm pendant lamps -->
<g stroke="#3d2312" stroke-width="3">
 <line x1="255" y1="0" x2="255" y2="54"/><path d="M225 54 Q255 26 285 54 Z" fill="#d96b38"/>
 <ellipse cx="255" cy="57" rx="18" ry="6" fill="#ffe799" stroke="none"/>
 <line x1="510" y1="0" x2="510" y2="48"/><path d="M480 48 Q510 20 540 48 Z" fill="#d96b38"/>
 <ellipse cx="510" cy="51" rx="18" ry="6" fill="#ffe799" stroke="none"/>
 <line x1="785" y1="0" x2="785" y2="54"/><path d="M755 54 Q785 26 815 54 Z" fill="#d96b38"/>
 <ellipse cx="785" cy="57" rx="18" ry="6" fill="#ffe799" stroke="none"/>
</g>
<!-- Framed restaurant banner -->
<g transform="translate(382,22)">
 <rect width="215" height="44" rx="10" fill="#7a2318" stroke="#3d1d12" stroke-width="3.5"/>
 <text x="107" y="29" text-anchor="middle" font-size="18" font-weight="900" fill="#ffe599" letter-spacing="1.2">🍜 SAIGON BISTRO</text>
</g>
<!-- Floor with warm tile lines -->
<polygon points="0,365 1000,365 1000,640 0,640" fill="url(#rsFloor)"/>
<g stroke="#8a5a32" stroke-width="1.5" opacity=".42">
 <line x1="0" y1="415" x2="1000" y2="415"/><line x1="0" y1="470" x2="1000" y2="470"/>
 <line x1="0" y1="530" x2="1000" y2="530"/><line x1="0" y1="592" x2="1000" y2="592"/>
 <line x1="160" y1="365" x2="60" y2="640"/><line x1="340" y1="365" x2="270" y2="640"/>
 <line x1="520" y1="365" x2="500" y2="640"/><line x1="700" y1="365" x2="730" y2="640"/>
 <line x1="860" y1="365" x2="940" y2="640"/>
</g>`;

const RS_WORLD=`
<!-- 1. Open kitchen pass & Chef (back center-right) -->
<g class="obj" id="o-kitchenpass" data-obj="kitchenpass" data-base="374">
 <rect class="hit" x="590" y="88" width="235" height="286"/>
 <rect x="598" y="226" width="220" height="142" rx="6" fill="#8b4c2b" stroke="#4a2613" stroke-width="3"/>
 <rect x="592" y="216" width="232" height="16" rx="4" fill="#e6d2b5" stroke="#4a2613" stroke-width="3"/>
 <rect x="610" y="96" width="196" height="120" rx="8" fill="#fff7e8" stroke="#4a2613" stroke-width="4"/>
 <circle cx="645" cy="122" r="13" fill="#c87d4b" stroke="#5a3218" stroke-width="2"/><circle cx="682" cy="120" r="11" fill="#8c9aa8" stroke="#44505c" stroke-width="2"/>
 <g id="rs-chef" transform="translate(730,214)">
  <rect x="-24" y="-56" width="48" height="54" rx="12" fill="#ffffff" stroke="#4a2613" stroke-width="2.5"/>
  <line x1="-8" y1="-46" x2="-8" y2="-10" stroke="#4a2613" stroke-width="2"/><circle cx="-13" cy="-38" r="2" fill="#4a2613"/><circle cx="-13" cy="-24" r="2" fill="#4a2613"/>
  <path d="M-12 -54 L0 -40 L12 -54" fill="#d94136" stroke="#7a1b14" stroke-width="1.8"/>
  <circle cx="0" cy="-76" r="19" fill="#f0c29c" stroke="#4a2613" stroke-width="2.4"/>
  <rect x="-17" y="-98" width="34" height="10" rx="3" fill="#fff" stroke="#4a2613" stroke-width="2.2"/>
  <path d="M-20 -96 Q-24 -122 -6 -118 Q0 -126 8 -118 Q24 -122 20 -96 Z" fill="#fff" stroke="#4a2613" stroke-width="2.2"/>
  <circle cx="-6" cy="-77" r="2.3" fill="#2b1d12"/><circle cx="6" cy="-77" r="2.3" fill="#2b1d12"/>
  <path d="M-6 -68 Q0 -63 6 -68" fill="none" stroke="#6b321c" stroke-width="2" stroke-linecap="round"/>
 </g>
 <g transform="translate(652,212)">
  <path d="M-18 -12 L18 -12 L13 2 L-13 2 Z" fill="#d94b38" stroke="#4a2613" stroke-width="2"/>
  <path class="rs-steam" d="M-6 -16 Q-9 -24 -4 -30 M4 -16 Q1 -24 6 -30" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".75"/>
 </g>
 <g class="rs-chef-thanks" transform="translate(730,86)"><rect x="-38" y="-14" width="76" height="22" rx="11" fill="#e84a5f"/><text y="1" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">♥ Delicious!</text></g>
 <text class="label" x="708" y="82" text-anchor="middle">kitchen counter</text>
</g>

<!-- 2. Dessert display cabinet (back right) -->
<g class="obj" id="o-dessertcart" data-obj="dessertcart" data-base="392">
 <rect class="hit" x="838" y="196" width="142" height="196"/>
 <rect x="846" y="274" width="126" height="110" rx="8" fill="#6b3d20" stroke="#3d200e" stroke-width="3"/>
 <rect x="846" y="206" width="126" height="72" rx="8" fill="#dff3fc" opacity=".88" stroke="#3d200e" stroke-width="3"/>
 <line x1="850" y1="244" x2="968" y2="244" stroke="#6b3d20" stroke-width="2.5"/>
 <g transform="translate(876,238)"><ellipse cx="0" cy="2" rx="13" ry="4" fill="#fff" stroke="#8a7a68" stroke-width="1.5"/><path d="M-9 2 L-6 -7 L6 -7 L9 2 Z" fill="#f7c952"/><path d="M-6 -7 L6 -7 L7 -4 L-7 -4 Z" fill="#8c3d14"/></g>
 <g transform="translate(914,238)"><ellipse cx="0" cy="2" rx="13" ry="4" fill="#fff" stroke="#8a7a68" stroke-width="1.5"/><path d="M-9 2 L-6 -7 L6 -7 L9 2 Z" fill="#f7c952"/><path d="M-6 -7 L6 -7 L7 -4 L-7 -4 Z" fill="#8c3d14"/></g>
 <g transform="translate(946,238)"><ellipse cx="0" cy="2" rx="12" ry="4" fill="#fff" stroke="#8a7a68" stroke-width="1.5"/><circle cx="0" cy="-4" r="6" fill="#e84a5f"/></g>
 <g transform="translate(892,270)"><ellipse cx="0" cy="2" rx="14" ry="4" fill="#fff" stroke="#8a7a68" stroke-width="1.5"/><path d="M-10 2 L-7 -8 L7 -8 L10 2 Z" fill="#f7c952"/><path d="M-7 -8 L7 -8 L8 -5 L-8 -5 Z" fill="#8c3d14"/></g>
 <g transform="translate(934,270)"><ellipse cx="0" cy="2" rx="14" ry="4" fill="#fff" stroke="#8a7a68" stroke-width="1.5"/><path d="M-10 2 L-7 -8 L7 -8 L10 2 Z" fill="#85d17c"/></g>
 <text class="label" x="909" y="196" text-anchor="middle">dessert display</text>
</g>

<!-- 3. Host reception stand (left entrance) -->
<g class="obj" id="o-hoststand" data-obj="hoststand" data-base="445">
 <rect class="hit" x="28" y="255" width="118" height="195"/>
 <ellipse cx="86" cy="442" rx="46" ry="11" fill="#000" opacity=".2"/>
 <rect x="54" y="328" width="64" height="112" rx="6" fill="#6b381d" stroke="#3b1d0c" stroke-width="3"/>
 <polygon points="44,328 128,328 118,302 54,302" fill="#8c4b27" stroke="#3b1d0c" stroke-width="3"/>
 <polygon points="56,322 86,324 86,306 62,304" fill="#fffdf7" stroke="#5a4634" stroke-width="1.5"/>
 <polygon points="86,324 116,322 110,304 86,306" fill="#fffdf7" stroke="#5a4634" stroke-width="1.5"/>
 <g class="rs-reserved-badge" transform="translate(86,280)"><rect x="-44" y="-14" width="88" height="22" rx="11" fill="#2e9e5b"/><text y="1" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">✓ Table for 2</text></g>
 <text class="label" x="86" y="252" text-anchor="middle">host stand</text>
</g>

<!-- 4. Waiter NPC (standing near center-left service station) -->
<g class="obj" id="o-waiter" data-obj="waiter" data-base="432">
 <rect class="hit" x="385" y="244" width="100" height="194"/>
 <ellipse cx="435" cy="428" rx="32" ry="9" fill="#000" opacity=".22"/>
 <g transform="translate(435,424)">
  <rect x="-12" y="-56" width="10" height="54" rx="4" fill="#242933"/>
  <rect x="2" y="-56" width="10" height="54" rx="4" fill="#242933"/>
  <rect x="-18" y="-110" width="36" height="56" rx="10" fill="#ffffff" stroke="#2d241e" stroke-width="2.4"/>
  <path d="M-15 -108 L-4 -78 L4 -78 L15 -108 L15 -56 L-15 -56 Z" fill="#7a2318" stroke="#2d241e" stroke-width="2"/>
  <polygon points="-7,-106 0,-102 -7,-98" fill="#d94136"/><polygon points="7,-106 0,-102 7,-98" fill="#d94136"/>
  <ellipse cx="-28" cy="-84" rx="18" ry="5" fill="#d6dde6" stroke="#5c6773" stroke-width="2"/>
  <rect x="18" y="-92" width="13" height="18" rx="2" fill="#fff7d6" stroke="#5a4328" stroke-width="1.6"/>
  <circle cx="0" cy="-132" r="20" fill="#f0c39b" stroke="#2d241e" stroke-width="2.4"/>
  <path d="M-20 -134 Q-18 -156 0 -155 Q18 -156 20 -134 Q10 -144 -20 -134 Z" fill="#2b1e16"/>
  <circle cx="-6" cy="-132" r="2.3" fill="#2b1e16"/><circle cx="6" cy="-132" r="2.3" fill="#2b1e16"/>
  <path d="M-5 -123 Q0 -118 6 -123" fill="none" stroke="#6b321c" stroke-width="2" stroke-linecap="round"/>
 </g>
 <text class="label" x="435" y="242" text-anchor="middle">waiter</text>
</g>

<!-- 5. Main Dining Table & Booth Chairs (center-left foreground) -->
<g class="obj" id="o-diningtable" data-obj="diningtable" data-base="525">
 <rect class="hit" x="195" y="420" width="310" height="135"/>
 <ellipse cx="350" cy="532" rx="146" ry="20" fill="#000" opacity=".2"/>
 <g fill="#9e2f24" stroke="#4a1812" stroke-width="3">
  <rect x="206" y="422" width="38" height="72" rx="8"/>
  <rect x="206" y="476" width="58" height="18" rx="5"/>
  <line x1="214" y1="494" x2="214" y2="530" stroke="#4a2613" stroke-width="5"/>
  <line x1="256" y1="494" x2="256" y2="530" stroke="#4a2613" stroke-width="5"/>
  <rect x="456" y="422" width="38" height="72" rx="8"/>
  <rect x="436" y="476" width="58" height="18" rx="5"/>
  <line x1="444" y1="494" x2="444" y2="530" stroke="#4a2613" stroke-width="5"/>
  <line x1="486" y1="494" x2="486" y2="530" stroke="#4a2613" stroke-width="5"/>
 </g>
 <rect x="338" y="468" width="24" height="62" fill="#4a2613"/>
 <ellipse cx="350" cy="530" rx="48" ry="10" fill="#3b1d0c"/>
 <rect x="242" y="446" width="216" height="28" rx="8" fill="#8c4b27" stroke="#3b1d0c" stroke-width="3"/>
 <polygon points="270,446 430,446 420,474 280,474" fill="#fff7e6" stroke="#d9c39e" stroke-width="1.8"/>
 <g class="rs-napkin-table" transform="translate(278,443)">
  <polygon points="-12,2 0,-12 12,2" fill="#e85c4a" stroke="#8a261b" stroke-width="1.6"/>
 </g>
 <g class="rs-extra-napkins" transform="translate(418,442)">
  <rect x="-11" y="-8" width="22" height="10" rx="2" fill="#fff" stroke="#b5a590" stroke-width="1.5"/>
  <rect x="-9" y="-12" width="22" height="10" rx="2" fill="#fff" stroke="#b5a590" stroke-width="1.5"/>
 </g>
 <g class="rs-table-dessert" transform="translate(394,440)">
  <ellipse cx="0" cy="3" rx="14" ry="5" fill="#fff" stroke="#7a6855" stroke-width="1.6"/>
  <path class="rs-pudding-body" d="M-9 2 L-6 -8 L6 -8 L9 2 Z" fill="#f7c952" stroke="#b58318" stroke-width="1.2"/>
  <path class="rs-pudding-top" d="M-6 -8 L6 -8 L7 -5 L-7 -5 Z" fill="#7a2e0e"/>
 </g>
 <text class="label" x="350" y="552" text-anchor="middle">dining table</text>
</g>

<!-- 6. Menu stand on table -->
<g class="obj" id="o-menustand" data-obj="menustand" data-base="526">
 <rect class="hit" x="242" y="392" width="54" height="58"/>
 <g transform="translate(266,426)">
  <rect x="-14" y="-26" width="28" height="36" rx="3" fill="#7a2318" stroke="#3b1610" stroke-width="2"/>
  <rect x="-9" y="-20" width="18" height="4" rx="1" fill="#ffe082"/>
  <line x1="-9" y1="-11" x2="9" y2="-11" stroke="#ffe082" stroke-width="1.6"/>
  <line x1="-9" y1="-5" x2="7" y2="-5" stroke="#ffe082" stroke-width="1.6"/>
  <line x1="-9" y1="1" x2="8" y2="1" stroke="#ffe082" stroke-width="1.6"/>
 </g>
 <text class="label" x="266" y="390" text-anchor="middle">menu</text>
</g>

<!-- 7. Bowl of beef noodle soup on table -->
<g class="obj" id="o-noodlebowl" data-obj="noodlebowl" data-base="527">
 <rect class="hit" x="302" y="396" width="68" height="56"/>
 <g class="rs-bowl-group" transform="translate(336,434)">
  <ellipse cx="0" cy="10" rx="26" ry="7" fill="#fff" stroke="#5a3820" stroke-width="2"/>
  <path d="M-24 -6 L24 -6 Q22 12 0 12 Q-22 12 -24 -6 Z" fill="#d94b38" stroke="#4a1d14" stroke-width="2.2"/>
  <ellipse cx="0" cy="-6" rx="24" ry="7" fill="#f5d9a6" stroke="#4a1d14" stroke-width="2"/>
  <ellipse class="rs-broth" cx="0" cy="-6" rx="21" ry="5.5" fill="#d98a36"/>
  <g class="rs-noodles-food">
   <path d="M-12 -6 Q-4 -10 6 -5 Q12 -3 15 -7" fill="none" stroke="#fff3c4" stroke-width="2.4" stroke-linecap="round"/>
   <ellipse cx="-7" cy="-6" rx="6" ry="3" fill="#7a3b24"/><ellipse cx="5" cy="-5" rx="5" ry="2.8" fill="#7a3b24"/>
   <circle cx="-1" cy="-8" r="2.2" fill="#46a844"/><circle cx="10" cy="-7" r="2" fill="#46a844"/>
  </g>
  <line x1="6" y1="-16" x2="26" y2="-4" stroke="#6b3818" stroke-width="2.2" stroke-linecap="round"/>
  <path class="rs-steam" d="M-8 -15 Q-11 -24 -5 -30 M2 -16 Q-1 -25 5 -31 M11 -14 Q8 -22 13 -28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".82"/>
 </g>
 <text class="label" x="336" y="394" text-anchor="middle">bowl of noodles</text>
</g>

<!-- 8. Condiment tray (lime, chili, pepper, fish sauce) -->
<g class="obj" id="o-condiments" data-obj="condiments" data-base="528">
 <rect class="hit" x="366" y="398" width="56" height="52"/>
 <g transform="translate(392,438)">
  <rect x="-20" y="2" width="40" height="7" rx="3" fill="#5a341b"/>
  <rect x="-15" y="-12" width="8" height="14" rx="2" fill="#e03e2d" stroke="#5a1810" stroke-width="1.4"/>
  <rect x="-4" y="-10" width="8" height="12" rx="2" fill="#8c8c8c" stroke="#3b3b3b" stroke-width="1.4"/>
  <circle cx="10" cy="-3" r="5" fill="#68c945" stroke="#2c6b17" stroke-width="1.4"/>
  <circle cx="15" cy="-1" r="4.5" fill="#7ee05a" stroke="#2c6b17" stroke-width="1.4"/>
 </g>
 <text class="label" x="394" y="396" text-anchor="middle">condiment tray</text>
</g>

<!-- 9. Water pitcher & iced tea glasses (side table right of main booth) -->
<g class="obj" id="o-waterpitcher" data-obj="waterpitcher" data-base="515">
 <rect class="hit" x="520" y="395" width="96" height="128"/>
 <ellipse cx="568" cy="512" rx="38" ry="10" fill="#000" opacity=".18"/>
 <rect x="558" y="454" width="20" height="56" fill="#59341a"/>
 <ellipse cx="568" cy="510" rx="28" ry="7" fill="#3b1d0c"/>
 <rect x="528" y="438" width="80" height="16" rx="5" fill="#8c4b27" stroke="#3b1d0c" stroke-width="2.5"/>
 <path d="M540 404 L558 404 L562 438 L536 438 Z" fill="#d4f0ff" stroke="#3e7ea6" stroke-width="2"/>
 <path d="M538 416 L560 416 L561 437 L537 437 Z" fill="#79c8f2" opacity=".75"/>
 <path d="M558 408 Q568 412 566 426 Q565 432 560 432" fill="none" stroke="#3e7ea6" stroke-width="2"/>
 <rect x="568" y="420" width="12" height="18" rx="2" fill="#e3f6ff" stroke="#3e7ea6" stroke-width="1.6"/>
 <rect class="rs-water-fill" x="569" y="426" width="10" height="11" fill="#63b8eb" opacity=".2"/>
 <g class="rs-icedtea-glass" transform="translate(592,424)">
  <path d="M-7 -12 L7 -12 L5 14 L-5 14 Z" fill="#e89a25" stroke="#6e420c" stroke-width="1.6"/>
  <circle cx="6" cy="-12" r="4.5" fill="#ffe359" stroke="#b89214" stroke-width="1.3"/>
  <line x1="-2" y1="-18" x2="2" y2="10" stroke="#d94136" stroke-width="2"/>
 </g>
 <text class="label" x="568" y="392" text-anchor="middle">water pitcher</text>
</g>

<!-- 10. Bill desk & Cashier terminal (right foreground) -->
<g class="obj" id="o-billdesk" data-obj="billdesk" data-base="548">
 <rect class="hit" x="728" y="408" width="176" height="150"/>
 <ellipse cx="816" cy="548" rx="78" ry="14" fill="#000" opacity=".22"/>
 <rect x="742" y="450" width="148" height="96" rx="8" fill="#6b381d" stroke="#3b1d0c" stroke-width="3"/>
 <rect x="734" y="436" width="164" height="18" rx="5" fill="#d9b382" stroke="#3b1d0c" stroke-width="3"/>
 <rect x="756" y="404" width="46" height="32" rx="4" fill="#2b3340" stroke="#161b22" stroke-width="2.5"/>
 <rect x="761" y="409" width="36" height="20" rx="2" fill="#6ad19a"/>
 <rect x="816" y="422" width="24" height="15" rx="3" fill="#3a4759" stroke="#1c2430" stroke-width="2"/>
 <g transform="translate(862,426)">
  <rect x="-14" y="-12" width="28" height="22" rx="3" fill="#3d1e10" stroke="#1f0e06" stroke-width="2"/>
  <rect class="rs-bill-slip" x="-9" y="-16" width="18" height="20" rx="1.5" fill="#fffdf5" stroke="#8a7965" stroke-width="1.2"/>
 </g>
 <g class="rs-paid-badge" transform="translate(816,386)"><rect x="-46" y="-14" width="92" height="22" rx="11" fill="#2e9e5b"/><text y="1" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">✓ Paid &amp; Tipped</text></g>
 <text class="label" x="816" y="568" text-anchor="middle">cashier &amp; bill</text>
</g>

<!-- 11. Fresh Salad Bar (back left-center) -->
<g class="obj" id="o-saladbar" data-obj="saladbar" data-base="382">
 <rect class="hit" x="268" y="242" width="110" height="132"/>
 <rect x="274" y="288" width="98" height="82" rx="6" fill="#5e8c47" stroke="#2f4f22" stroke-width="2.5"/>
 <rect x="270" y="274" width="106" height="16" rx="4" fill="#e8f5e9" stroke="#2f4f22" stroke-width="2"/>
 <ellipse cx="298" cy="274" rx="16" ry="6" fill="#66bb6a" stroke="#2e7d32" stroke-width="1.5"/>
 <ellipse cx="336" cy="274" rx="16" ry="6" fill="#ef5350" stroke="#b71c1c" stroke-width="1.5"/>
 <path d="M272 250 L374 250 L366 266 L280 266 Z" fill="#dff3fc" opacity=".75" stroke="#3e7ea6" stroke-width="1.6"/>
 <text class="label" x="323" y="240" text-anchor="middle">salad bar</text>
</g>

<!-- 12. Hot Soup Kettle Station (center-right) -->
<g class="obj" id="o-soupkettle" data-obj="soupkettle" data-base="388">
 <rect class="hit" x="492" y="248" width="94" height="132"/>
 <rect x="502" y="296" width="74" height="78" rx="6" fill="#7a4b2a" stroke="#3b1d0c" stroke-width="2.5"/>
 <ellipse cx="539" cy="282" rx="26" ry="18" fill="#424242" stroke="#212121" stroke-width="2.2"/>
 <ellipse cx="539" cy="268" rx="24" ry="7" fill="#d98a36" stroke="#212121" stroke-width="1.8"/>
 <line x1="545" y1="266" x2="558" y2="248" stroke="#cfd8dc" stroke-width="3" stroke-linecap="round"/>
 <text class="label" x="539" y="242" text-anchor="middle">soup station</text>
</g>

<!-- 13. Fresh Juice & Herbal Tea Bar (right mid) -->
<g class="obj" id="o-drinkbar" data-obj="drinkbar" data-base="442">
 <rect class="hit" x="628" y="348" width="94" height="106"/>
 <rect x="636" y="388" width="78" height="62" rx="6" fill="#8c4b27" stroke="#3b1d0c" stroke-width="2.4"/>
 <rect x="646" y="356" width="22" height="32" rx="4" fill="#ffb74d" stroke="#e65100" stroke-width="1.8"/>
 <rect x="678" y="356" width="22" height="32" rx="4" fill="#aed581" stroke="#33691e" stroke-width="1.8"/>
 <text class="label" x="675" y="346" text-anchor="middle">juice &amp; tea bar</text>
</g>

<!-- 14. Coat & Umbrella Stand (left wall by entrance) -->
<g class="obj" id="o-coatstand" data-obj="coatstand" data-base="410">
 <rect class="hit" x="12" y="138" width="56" height="128"/>
 <line x1="38" y1="148" x2="38" y2="256" stroke="#4a2613" stroke-width="5" stroke-linecap="round"/>
 <path d="M22 256 L54 256 M26 160 Q38 148 50 160" fill="none" stroke="#4a2613" stroke-width="3.5" stroke-linecap="round"/>
 <path d="M42 198 L48 248" stroke="#2e6bc6" stroke-width="5" stroke-linecap="round"/>
 <text class="label" x="40" y="134" text-anchor="middle">coat &amp; umbrella stand</text>
</g>

<!-- 15. Handwashing Basin (left mid) -->
<g class="obj" id="o-washbasin" data-obj="washbasin" data-base="418">
 <rect class="hit" x="150" y="246" width="92" height="132"/>
 <rect x="160" y="296" width="72" height="76" rx="6" fill="#cfd8dc" stroke="#455a64" stroke-width="2.4"/>
 <ellipse cx="196" cy="296" rx="28" ry="10" fill="#ffffff" stroke="#455a64" stroke-width="2"/>
 <path d="M196 292 L196 274 Q196 266 206 272" fill="none" stroke="#78909c" stroke-width="3" stroke-linecap="round"/>
 <rect x="172" y="278" width="10" height="14" rx="2" fill="#4db6ac"/>
 <text class="label" x="196" y="242" text-anchor="middle">handwashing sink</text>
</g>

<!-- 16. Acoustic Music Corner (top center-left) -->
<g class="obj" id="o-musiccorner" data-obj="musiccorner" data-base="372">
 <rect class="hit" x="372" y="102" width="106" height="136"/>
 <ellipse cx="425" cy="228" rx="44" ry="10" fill="#7a2318" opacity=".45"/>
 <line x1="412" y1="145" x2="442" y2="215" stroke="#5d4037" stroke-width="4" stroke-linecap="round"/>
 <circle cx="434" cy="198" r="16" fill="#d98a36" stroke="#4a2613" stroke-width="2.2"/>
 <circle cx="426" cy="182" r="11" fill="#d98a36" stroke="#4a2613" stroke-width="2.2"/>
 <text class="label" x="425" y="98" text-anchor="middle">acoustic music stage</text>
</g>

<!-- 17. Breezy Patio Table (bottom left foreground) -->
<g class="obj" id="o-patiotable" data-obj="patiotable" data-base="598">
 <rect class="hit" x="28" y="482" width="144" height="132"/>
 <ellipse cx="100" cy="596" rx="58" ry="14" fill="#000" opacity=".2"/>
 <rect x="92" y="536" width="16" height="58" fill="#4a2613"/>
 <ellipse cx="100" cy="534" rx="52" ry="16" fill="#e6be8a" stroke="#59341a" stroke-width="2.6"/>
 <circle cx="100" cy="516" r="9" fill="#ffe082" stroke="#ca8a04" stroke-width="1.8"/>
 <text class="label" x="100" y="622" text-anchor="middle">patio table</text>
</g>

<!-- 18. Daily Specials Chalkboard (upper center-right) -->
<g class="obj" id="o-specialsboard" data-obj="specialsboard" data-base="368">
 <rect class="hit" x="492" y="88" width="92" height="138"/>
 <rect x="500" y="96" width="76" height="112" rx="6" fill="#263238" stroke="#8c4b27" stroke-width="4"/>
 <text x="538" y="120" text-anchor="middle" font-size="10" font-weight="800" fill="#ffe082">TODAY'S SPECIAL</text>
 <line x1="512" y1="134" x2="564" y2="134" stroke="#80cbc4" stroke-width="2"/>
 <line x1="512" y1="150" x2="558" y2="150" stroke="#fff" stroke-width="1.6"/>
 <line x1="512" y1="166" x2="562" y2="166" stroke="#ffab91" stroke-width="1.6"/>
 <text class="label" x="538" y="84" text-anchor="middle">specials board</text>
</g>

<!-- 19. Takeaway & Delivery Counter (bottom center-right) -->
<g class="obj" id="o-takeoutcounter" data-obj="takeoutcounter" data-base="588">
 <rect class="hit" x="562" y="512" width="136" height="106"/>
 <rect x="572" y="542" width="116" height="68" rx="6" fill="#7a4b2a" stroke="#3b1d0c" stroke-width="2.5"/>
 <rect x="588" y="518" width="28" height="24" rx="3" fill="#ffe0b2" stroke="#8d6e63" stroke-width="1.8"/>
 <rect x="626" y="522" width="32" height="20" rx="3" fill="#c8e6c9" stroke="#2e7d32" stroke-width="1.8"/>
 <text class="label" x="630" y="624" text-anchor="middle">takeaway counter</text>
</g>

<!-- 20. Guest Review & Feedback Stand (far right foreground) -->
<g class="obj" id="o-feedbackbox" data-obj="feedbackbox" data-base="582">
 <rect class="hit" x="908" y="438" width="84" height="154"/>
 <rect x="928" y="492" width="44" height="92" rx="5" fill="#6b381d" stroke="#3b1d0c" stroke-width="2.5"/>
 <rect x="920" y="458" width="60" height="36" rx="5" fill="#fff8e1" stroke="#f57f17" stroke-width="2.2"/>
 <text x="950" y="480" text-anchor="middle" font-size="11" font-weight="800" fill="#f57f17">★★★★★</text>
 <text class="label" x="950" y="602" text-anchor="middle">review stand</text>
</g>
`;

const RS_CSS=`
#o-hoststand .rs-reserved-badge,#o-kitchenpass .rs-chef-thanks,#o-diningtable .rs-extra-napkins,#o-diningtable .rs-table-dessert,#o-waterpitcher .rs-icedtea-glass,#o-billdesk .rs-paid-badge{opacity:0;transition:opacity .28s}
#o-hoststand.rs-table-booked .rs-reserved-badge{opacity:1}
#o-kitchenpass.rs-chef-thanked .rs-chef-thanks{opacity:1}
#o-diningtable.rs-napkin-lap .rs-napkin-table{opacity:.18}
#o-diningtable.rs-has-napkins .rs-extra-napkins{opacity:1}
#o-diningtable.rs-has-dessert .rs-table-dessert{opacity:1}
#o-diningtable.rs-eaten-dessert .rs-pudding-body,#o-diningtable.rs-eaten-dessert .rs-pudding-top{opacity:0}
#o-noodlebowl .rs-bowl-group{opacity:.25;transition:opacity .3s,transform .3s}
#o-noodlebowl.rs-has-noodles .rs-bowl-group{opacity:1}
#o-noodlebowl.rs-eaten-noodles .rs-noodles-food,#o-noodlebowl.rs-eaten-noodles .rs-steam{opacity:0}
#o-waterpitcher.rs-water-poured .rs-water-fill{opacity:.95}
#o-waterpitcher.rs-has-tea .rs-icedtea-glass{opacity:1}
#o-billdesk.rs-bill-paid .rs-paid-badge{opacity:1}
@keyframes rsSteam{0%,100%{transform:translateY(0);opacity:.75}50%{transform:translateY(-5px);opacity:.35}}
#o-kitchenpass .rs-steam,#o-noodlebowl .rs-steam{animation:rsSteam 2.2s ease-in-out infinite}
`;

const RS_SPOTS={
 rs_door:{x:90,y:605,d:1},
 rs_host:{x:115,y:462,d:-1},
 rs_table:{x:252,y:545,d:1},
 rs_seat:{x:235,y:472,d:1},
 rs_menu:{x:266,y:542,d:1},
 rs_waiter:{x:435,y:455,d:1},
 rs_kitchen:{x:695,y:405,d:1},
 rs_noodles:{x:330,y:542,d:1},
 rs_condiments:{x:392,y:542,d:-1},
 rs_water:{x:562,y:535,d:1},
 rs_dessert:{x:882,y:418,d:1},
 rs_bill:{x:816,y:568,d:1},
 rs_salad:{x:323,y:402,d:1},
 rs_soup:{x:539,y:408,d:1},
 rs_drinkbar:{x:675,y:455,d:1},
 rs_coat:{x:78,y:398,d:-1},
 rs_sink:{x:196,y:405,d:-1},
 rs_music:{x:425,y:395,d:1},
 rs_patio:{x:135,y:585,d:-1},
 rs_board:{x:538,y:395,d:1},
 rs_takeout:{x:630,y:585,d:1},
 rs_feedback:{x:915,y:575,d:1}
};

const RS_OBJECTS={
 hoststand:{en:"host stand",vi:"quầy lễ tân đón khách",ipa:"/həʊst stænd/",room:"restaurant",
  acts:["ask_for_a_table","check_table_reservation","ask_waiting_time","check_in_with_host","choose_indoor_or_patio"]},
 diningtable:{en:"dining table",vi:"bàn ăn",ipa:"/ˈdaɪ.nɪŋ ˌteɪ.bəl/",room:"restaurant",
  acts:["sit_at_dining_table","put_napkin_on_lap","pull_out_dining_chair","wipe_table_with_tissue","arrange_chopsticks_neatly"]},
 menustand:{en:"menu",vi:"thực đơn",ipa:"/ˈmen.juː/",room:"restaurant",
  acts:["check_the_menu","ask_recommendation","ask_about_food_allergies","check_vegetarian_options","read_dish_ingredients"]},
 waiter:{en:"waiter",vi:"nhân viên phục vụ",ipa:"/ˈweɪ.tər/",room:"restaurant",
  acts:["order_beef_noodles","ask_not_too_spicy","order_iced_tea","ask_for_napkins","ask_for_soup_spoon","order_fresh_side_herbs"]},
 kitchenpass:{en:"kitchen counter",vi:"quầy bếp mở",ipa:"/ˈkɪtʃ.ən ˈkaʊn.tər/",room:"restaurant",
  acts:["watch_the_chef","thank_the_chef","admire_fresh_garnish","ask_chef_about_broth","smell_simmering_spices"]},
 noodlebowl:{en:"bowl of noodles",vi:"tô mì/phở bò",ipa:"/bəʊl əv ˈnuː.dəlz/",room:"restaurant",
  acts:["taste_the_broth","eat_main_course","blow_on_hot_noodles","praise_tender_beef","finish_warm_soup"]},
 condiments:{en:"condiment tray",vi:"khay gia vị",ipa:"/ˈkɒn.dɪ.mənt treɪ/",room:"restaurant",
  acts:["squeeze_some_lime","add_black_pepper","add_pickled_garlic","drizzle_mild_chili_sauce","pass_the_fish_sauce"]},
 waterpitcher:{en:"water pitcher",vi:"bình nước lọc",ipa:"/ˈwɔː.tər ˈpɪtʃ.ər/",room:"restaurant",
  acts:["pour_drinking_water","drink_iced_tea","refill_friend_water_glass","ask_for_warm_water_throat","ask_for_less_ice"]},
 dessertcart:{en:"dessert display",vi:"quầy tráng miệng",ipa:"/dɪˈzɜːt dɪˌspleɪ/",room:"restaurant",
  acts:["order_sweet_dessert","eat_the_dessert","choose_fresh_fruit_tart","ask_low_sugar_dessert","share_dessert_with_friend"]},
 billdesk:{en:"cashier & bill",vi:"quầy thu ngân & hoá đơn",ipa:"/kæˈʃɪər ənd bɪl/",room:"restaurant",
  acts:["ask_for_the_bill","split_the_bill","pay_restaurant_bill","check_itemized_receipt","ask_for_wifi_password"]},
 saladbar:{en:"fresh salad bar",vi:"quầy salad rau tươi",ipa:"/freʃ ˈsæl.əd bɑːr/",room:"restaurant",
  acts:["pick_up_salad_plate","toss_crispy_green_salad","add_cherry_tomatoes","drizzle_olive_oil_dressing","enjoy_nutritious_salad"]},
 soupkettle:{en:"hot soup station",vi:"nồi súp hầm nóng",ipa:"/hɒt suːp ˈsteɪ.ʃən/",room:"restaurant",
  acts:["lift_soup_kettle_lid","smell_savory_herb_aroma","ladle_warm_pumpkin_soup","add_fresh_ginger_slices","check_soup_temperature"]},
 drinkbar:{en:"juice & tea bar",vi:"quầy nước ép & trà thảo mộc",ipa:"/dʒuːs ənd tiː bɑːr/",room:"restaurant",
  acts:["browse_healthy_drinks","order_fresh_orange_juice","choose_warm_ginger_tea","request_no_added_sugar","sip_tropical_mango_smoothie"]},
 coatstand:{en:"coat & umbrella stand",vi:"giá treo áo khoác & ô",ipa:"/kəʊt ənd ʌmˈbrel.ə stænd/",room:"restaurant",
  acts:["shake_off_wet_umbrella","hang_up_light_raincoat","check_evening_drizzle","hang_warm_scarf","retrieve_umbrella_before_leaving"]},
 washbasin:{en:"handwashing sink",vi:"bồn rửa tay khử khuẩn",ipa:"/ˈhænd.wɒʃ.ɪŋ sɪŋk/",room:"restaurant",
  acts:["turn_on_warm_faucet","wash_hands_with_soap","rinse_hands_thoroughly","dry_hands_with_clean_towel","use_herbal_hand_sanitizer"]},
 musiccorner:{en:"acoustic music stage",vi:"góc nhạc acoustic êm dịu",ipa:"/əˈkuː.stɪk ˈmjuː.zɪk steɪdʒ/",room:"restaurant",
  acts:["listen_to_acoustic_guitar","applaud_the_musician","request_a_relaxing_song","comment_on_pleasant_volume","take_photo_of_music_corner"]},
 patiotable:{en:"patio table",vi:"bàn sân hiên thoáng mát",ipa:"/ˈpæt.i.əʊ ˈteɪ.bəl/",room:"restaurant",
  acts:["step_out_to_patio","enjoy_cool_evening_breeze","turn_on_table_lantern","admire_city_lights_view","check_pleasant_night_weather"]},
 specialsboard:{en:"specials board",vi:"bảng món ngon trong ngày",ipa:"/ˈspeʃ.əlz bɔːd/",room:"restaurant",
  acts:["read_daily_chalkboard","check_lunch_combo_price","ask_about_soup_of_the_day","pick_seasonal_weather_drink","read_farm_to_table_note"]},
 takeoutcounter:{en:"takeaway counter",vi:"quầy đóng gói mang về",ipa:"/ˈteɪk.ə.weɪ ˈkaʊn.tər/",room:"restaurant",
  acts:["ask_for_takeaway_container","pack_leftover_noodles","put_sauce_packets_in_bag","verify_takeout_order_name","carry_reusable_food_bag"]},
 feedbackbox:{en:"review stand",vi:"quầy đánh giá & góp ý",ipa:"/rɪˈvjuː stænd/",room:"restaurant",
  acts:["give_five_star_rating","write_kind_review_note","thank_staff_for_hospitality","take_a_peppermint_candy","pick_up_bistro_card"]}
};

function applyRestaurant(W){
 const g=id=>document.getElementById(id);
 const h=g("o-hoststand"),t=g("o-diningtable"),n=g("o-noodlebowl"),w=g("o-waterpitcher"),k=g("o-kitchenpass"),b=g("o-billdesk");
 if(h)h.classList.toggle("rs-table-booked",W.rs_table==="booked");
 if(t){
  t.classList.toggle("rs-napkin-lap",W.rs_napkin==="lap");
  t.classList.toggle("rs-has-napkins",W.rs_extra_napkins==="yes");
  t.classList.toggle("rs-has-dessert",W.rs_dessert==="served"||W.rs_dessert==="eaten");
  t.classList.toggle("rs-eaten-dessert",W.rs_dessert==="eaten");
 }
 if(n){
  n.classList.toggle("rs-has-noodles",W.rs_noodles==="served"||W.rs_noodles==="eaten");
  n.classList.toggle("rs-eaten-noodles",W.rs_noodles==="eaten");
 }
 if(w){
  w.classList.toggle("rs-water-poured",W.rs_water==="poured");
  w.classList.toggle("rs-has-tea",W.rs_tea==="served"||W.rs_tea==="drunk");
 }
 if(k)k.classList.toggle("rs-chef-thanked",W.rs_chef==="thanked");
 if(b)b.classList.toggle("rs-bill-paid",W.rs_paid==="yes");
}

const ACTIONS=[
 // ==================== 1. HOST STAND (1 existing + 4 new = 5) ====================
 A("ask_for_a_table","hoststand","Ask for a table","Xin bàn ăn",
  "Hi! Do you have a table for two near the window?",
  "Chào bạn! Nhà hàng còn bàn cho hai người gần cửa sổ không ạ?",
  ["table","window"],["Table for two, please."],
  "Khi vào nhà hàng, hỏi <b>Do you have a table for two?</b> hoặc ngắn gọn <b>Table for two, please.</b>",
  ["Do you have","a table for two","near the window?"],{ans:"table",opts:["table","cable","label"]},
  ["<b>Table for two</b>, please.","Do you have a <b>table</b> near the window?"],
  W=>W.rs_table==="booked"?"Bạn đã nhận bàn ăn rồi.":null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","rs_host"],["pose","point",450],["set","rs_table","booked"],["wait",300]],
  V("table","window","restaurant"),{done:W=>W.rs_table==="booked",story:["ask for a table for two","asked for a table for two","xin bàn cho hai người"]}),

 Q("check_table_reservation","hoststand","rs_host","read","rs_reserv","checked","Confirm my dinner reservation","Xác nhận đặt bàn trước",
  "Good evening! We have a dinner reservation under the name Minh at seven o'clock.",
  "Chào buổi tối! Chúng tôi đã đặt bàn ăn tối dưới tên Minh lúc bảy giờ ạ.",
  ["evening","reservation","name"],"Cụm <b>have a reservation under the name + [tên]</b> dùng khi xác nhận bàn đã đặt trước.",
  ["We have a dinner reservation","under the name Minh","at seven o'clock."],["reservation","conversation","station"],
  ["Do you have a <b>reservation</b>?","I booked a table <b>under the name</b> Linh."],["reservation","restaurant","table"]),

 Q("ask_waiting_time","hoststand","rs_host","point","rs_wait_time","asked","Ask about the waiting time","Hỏi thời gian chờ bàn",
  "Excuse me, how long is the wait for a quiet booth for two?",
  "Xin lỗi, chúng tôi cần chờ bao lâu để có một bàn ghế đệm yên tĩnh cho hai người ạ?",
  ["how","long","wait","quiet"],"Hỏi thời gian chờ ở quán ăn: <b>How long is the wait (for a table)?</b>",
  ["Excuse me, how long","is the wait","for a quiet booth?"],["wait","weight","white"],
  ["<b>How long is the wait</b> tonight?","It's only a five-minute <b>wait</b>."],["table","seat","waiter"]),

 Q("check_in_with_host","hoststand","rs_host","reach","rs_coat_check","done","Greet the friendly host","Chào lễ tân đón khách",
  "It's a bit breezy outside tonight, so we're happy to step into this warm bistro!",
  "Tối nay bên ngoài trời hơi lộng gió nên chúng tôi rất vui khi bước vào quán ăn ấm cúng này!",
  ["breezy","outside","warm","bistro"],"Tính từ thời tiết <b>breezy</b> (có gió mát/lộng gió) và <b>warm</b> (ấm áp).",
  ["It's a bit breezy outside,","so we're happy to step into","this warm bistro!"],["breezy","busy","freezing"],
  ["The dining room feels <b>warm and cozy</b>.","It is quite <b>breezy</b> this evening."],["breeze","restaurant"]),

 Q("choose_indoor_or_patio","hoststand","rs_host","point","rs_seating_pref","chosen","Choose indoor or patio seating","Chọn ngồi trong nhà hay ngoài sân hiên",
  "Would you prefer sitting indoors or out on our breezy patio tonight?",
  "Tối nay bạn thích ngồi trong nhà hay ngồi ngoài sân hiên thoáng mát của quán ạ?",
  ["prefer","indoors","breezy","patio"],"Cấu trúc hỏi ý thích lịch sự: <b>Would you prefer + V-ing / Noun?</b>",
  ["Would you prefer","sitting indoors","or out on the breezy patio?"],["patio","radio","studio"],
  ["We'd <b>prefer sitting</b> near the window.","The <b>patio</b> is lovely when the weather is mild."],["patio","breeze","seat"]),

 // ==================== 2. DINING TABLE (2 existing + 3 new = 5) ====================
 A("sit_at_dining_table","diningtable","Sit at the table","Ngồi vào bàn ăn",
  "I'm taking a seat at our table.",
  "Tôi đang ngồi vào bàn ăn của chúng tôi.",
  ["taking","seat","table"],["Let's sit down at this table."],
  "<b>take a seat</b> = <b>sit down</b> (ngồi vào chỗ, lịch sự và tự nhiên).",
  ["I'm taking","a seat","at our table."],{ans:"seat",opts:["seat","sheet","sit"]},
  ["Please <b>take a seat</b>.","We sat <b>at our table</b>."],
  W=>W.sitting&&W.room==="restaurant"?"Bạn đang ngồi ở bàn ăn rồi.":null,
  ()=>[["walk","rs_seat"],["sit"],["set","rs_table","booked"],["wait",300]],
  V("seat","table"),{sitOk:true,done:W=>W.rs_table==="booked"||!!W.sitting,story:["take a seat at the table","took a seat at the table","ngồi vào bàn ăn"]}),

 A("put_napkin_on_lap","diningtable","Put the napkin on my lap","Đặt khăn ăn lên đùi",
  "I'm unfolding my napkin and putting it on my lap.",
  "Tôi đang mở khăn ăn ra và đặt lên đùi.",
  ["napkin","lap"],["Put your napkin on your lap."],
  "Phép lịch sự trên bàn ăn: trải khăn ăn lên đùi dùng <b>put the napkin on your lap</b>.",
  ["I'm unfolding my napkin","and putting it","on my lap."],{ans:"napkin",opts:["napkin","pumpkin","cabin"]},
  ["She put her <b>napkin</b> on her <b>lap</b>.","Could I have a clean <b>napkin</b>?"],
  W=>W.rs_napkin==="lap"?"Bạn đã đặt khăn ăn lên đùi rồi.":null,
  W=>[...(W.sitting?[]:[["walk","rs_table"]]),["pose","reach",420],["set","rs_napkin","lap"],["wait",260]],
  V("napkin","lap"),{sitOk:true,done:W=>W.rs_napkin==="lap",story:["put my napkin on my lap","put my napkin on my lap","đặt khăn ăn lên đùi"]}),

 Q("pull_out_dining_chair","diningtable","rs_table","reach","rs_chair_pulled","yes","Pull out the wooden chair","Kéo ghế ăn bằng gỗ ra",
  "Allow me to pull out this comfortable wooden chair for you.",
  "Để tôi kéo chiếc ghế gỗ êm ái này ra giúp bạn nhé.",
  ["pull","comfortable","wooden","chair"],"<b>Allow me to + V</b> = Để tôi làm gì giúp bạn (rất lịch thiệp).",
  ["Allow me to pull out","this comfortable wooden chair","for you."],["chair","share","stair"],
  ["He politely <b>pulled out the chair</b>.","These cushioned seats are very <b>comfortable</b>."],["seat","table"],undefined,true),

 Q("wipe_table_with_tissue","diningtable","rs_table","wipe","rs_table_wiped","yes","Wipe the tabletop clean","Lau sạch mặt bàn ăn",
  "I'm wiping a few water drops off the wooden tabletop with a clean tissue.",
  "Tôi đang dùng khăn giấy sạch lau khô vài giọt nước trên mặt bàn gỗ.",
  ["wiping","drops","wooden","clean"],"<b>wipe + something + off + bề mặt</b> = lau sạch cái gì khỏi bề mặt.",
  ["I'm wiping water drops","off the wooden tabletop","with a clean tissue."],["clean","clear","cream"],
  ["The waiter <b>wiped the table clean</b>.","Keep the dining area <b>spotless</b>."],["table","napkin","hygiene"],undefined,true),

 Q("arrange_chopsticks_neatly","diningtable","rs_table","reach","rs_Silverware","set","Set out chopsticks and spoons","Bày đũa và muỗng ngay ngắn",
  "I'm laying out clean bamboo chopsticks and ceramic spoons for both of us.",
  "Tôi đang bày những đôi đũa tre sạch sẽ và muỗng sứ ra bàn cho cả hai chúng mình.",
  ["laying","clean","chopsticks","spoons"],"Phrasal verb <b>lay out / set out</b> = bày biện dụng cụ ăn uống ra bàn.",
  ["I'm laying out","clean bamboo chopsticks","and ceramic spoons."],["chopsticks","lipsticks","drumsticks"],
  ["Do you know how to use <b>chopsticks</b>?","Set the <b>spoons and chopsticks</b> beside the bowl."],["chopsticks","table"],undefined,true),

 // ==================== 3. MENU STAND (2 existing + 3 new = 5) ====================
 A("check_the_menu","menustand","Check the menu","Xem thực đơn",
  "Let's see what today's specials are on the menu.",
  "Hãy xem hôm nay thực đơn có món đặc biệt gì nhé.",
  ["specials","menu"],["Can I see the menu, please?"],
  "<b>today's specials</b> = các món đặc biệt trong ngày của nhà hàng; <b>on the menu</b> = có trong thực đơn.",
  ["Let's see","what today's specials are","on the menu."],{ans:"menu",opts:["menu","venue","statue"]},
  ["What's <b>on the menu</b> today?","Ask the waiter for <b>today's specials</b>."],
  W=>W.rs_menu==="read"?"Bạn đã xem thực đơn rồi.":null,
  W=>[...(W.sitting?[]:[["walk","rs_menu"]]),["spawn","menu"],["pose","read",550],["set","rs_menu","read"],["despawn"],["wait",240]],
  V("menu","special"),{sitOk:true,done:W=>W.rs_menu==="read",story:["check the menu","checked the menu","xem thực đơn"]}),

 A("ask_recommendation","menustand","Ask for a recommendation","Hỏi món gợi ý",
  "Excuse me, what do you recommend here?",
  "Xin lỗi, ở đây bạn gợi ý món nào ngon ạ?",
  ["recommend"],["What's the house special?"],
  "Khi chưa biết gọi món gì, hỏi nhân viên: <b>What do you recommend?</b> (Bạn gợi ý món nào?).",
  ["Excuse me,","what do you recommend","here?"],{ans:"recommend",opts:["recommend","remember","remind"]},
  ["<b>What do you recommend</b> for dinner?","I highly <b>recommend</b> the beef noodles."],
  W=>W.rs_rec==="asked"?"Bạn đã hỏi món gợi ý rồi.":null,
  W=>[...(W.sitting?[]:[["walk","rs_waiter"]]),["pose","point",450],["set","rs_rec","asked"],["wait",300]],
  V("recommend","special","menu"),{sitOk:true,done:W=>W.rs_rec==="asked",story:["ask the waiter for a recommendation","asked the waiter for a recommendation","hỏi nhân viên món gợi ý"]}),

 Q("ask_about_food_allergies","menustand","rs_menu","point","rs_allergies","asked","Ask about food allergies","Hỏi kỹ về thành phần gây dị ứng",
  "Excuse me, does this sauce contain any peanuts? I have a mild peanut allergy.",
  "Xin lỗi, nước sốt này có chứa đậu phộng không ạ? Tôi bị dị ứng nhẹ với đậu phộng.",
  ["sauce","contain","peanuts","allergy"],"Khi hỏi về sức khoẻ/dị ứng thực phẩm: <b>Does this dish contain...? I have a [food] allergy.</b>",
  ["Does this sauce","contain any peanuts?","I have a mild peanut allergy."],["allergy","energy","apology"],
  ["Always inform the waiter about <b>food allergies</b>.","This broth is completely <b>peanut-free</b>."],["allergy","ingredient","menu"],undefined,true),

 Q("check_vegetarian_options","menustand","rs_menu","read","rs_veg_menu","checked","Check vegetarian dishes","Xem các món chay thanh đạm",
  "There is a whole section of healthy vegetarian dishes on page two of the menu.",
  "Có hẳn một mục các món chay lành mạnh và tốt cho sức khoẻ ở trang hai của thực đơn.",
  ["healthy","vegetarian","dishes","menu"],"Tính từ <b>vegetarian</b> (/ˌvedʒ.ɪˈteə.ri.ən/) = chay; <b>healthy</b> = tốt cho sức khoẻ.",
  ["There is a section","of healthy vegetarian dishes","on page two."],["vegetarian","veterinarian","librarian"],
  ["Do you have any <b>vegetarian options</b>?","Tofu and mushroom soup is very <b>nutritious</b>."],["vegetarian","nutritious","menu"],undefined,true),

 Q("read_dish_ingredients","menustand","rs_menu","read","rs_calories","read","Read the fresh ingredients list","Đọc bảng nguyên liệu tươi",
  "Every bowl is made with organic herbs, slow-cooked broth, and fresh rice noodles.",
  "Mỗi tô mì đều được chế biến từ rau thơm hữu cơ, nước dùng hầm chậm và bánh phở tươi.",
  ["organic","herbs","broth","fresh"],"Cấu trúc bị động chỉ nguyên liệu: <b>be made with + nguyên liệu</b>.",
  ["Every bowl is made with","organic herbs","and fresh rice noodles."],["herbs","verbs","birds"],
  ["This dish is made with <b>fresh local ingredients</b>.","I love the aroma of <b>fresh herbs</b>."],["ingredient","herb","noodles"],undefined,true),

 // ==================== 4. WAITER (4 existing + 2 new = 6) ====================
 A("order_beef_noodles","waiter","Order the beef noodle soup","Gọi món phở/mì bò",
  "I'll have the beef noodle soup, please.",
  "Cho tôi gọi món mì/phở bò nhé.",
  ["have","beef","noodle","soup"],["I'd like the beef noodles, please."],
  "Khi gọi món ở nhà hàng, người bản xứ thường nói <b>I'll have the...</b> hoặc <b>I'd like the...</b> thay vì “I want”.",
  ["I'll have","the beef noodle soup,","please."],{ans:"have",opts:["have","half","save"]},
  ["<b>I'll have</b> the grilled chicken, please.","<b>I'll have</b> a bowl of beef noodle soup."],
  W=>W.rs_noodles==="served"?"Món mì bò đã được mang ra bàn rồi.":null,
  W=>[...(W.sitting?[]:[["walk","rs_waiter"]]),["pose","point",500],["set","rs_noodles","served"],["set","rs_broth","untasted"],["wait",350]],
  V("beef","noodles","soup"),{sitOk:true,done:W=>W.rs_noodles==="served"||W.rs_noodles==="eaten",story:["order the beef noodle soup","ordered the beef noodle soup","gọi món mì bò"]}),

 A("ask_not_too_spicy","waiter","Ask for it not too spicy","Dặn làm ít cay",
  "Could you make it mild, not too spicy, please?",
  "Bạn làm giúp tôi vị dịu nhẹ, đừng cay quá nhé?",
  ["mild","spicy"],["Less spicy, please."],
  "<b>mild</b> = ít cay / dịu nhẹ; <b>not too spicy</b> = đừng cay quá.",
  ["Could you make it mild,","not too spicy,","please?"],{ans:"spicy",opts:["spicy","space","icy"]},
  ["I prefer <b>mild</b> food, <b>not too spicy</b>.","Can you make my soup <b>less spicy</b>?"],
  W=>W.rs_spicy==="mild"?"Bạn đã dặn làm ít cay rồi.":null,
  W=>[...(W.sitting?[]:[["walk","rs_waiter"]]),["pose","point",450],["set","rs_spicy","mild"],["wait",300]],
  V("spicy","mild"),{sitOk:true,done:W=>W.rs_spicy==="mild",story:["ask for it not too spicy","asked for it not too spicy","dặn nhà hàng làm ít cay"]}),

 A("order_iced_tea","waiter","Order lemon iced tea","Gọi trà chanh đá",
  "And I'd like a glass of lemon iced tea, please.",
  "Và cho tôi thêm một ly trà chanh đá nhé.",
  ["glass","lemon","iced","tea"],["Can I get an iced tea?"],
  "Gọi kèm đồ uống: <b>And I'd like a glass of...</b> (Và cho tôi thêm một ly...).",
  ["And I'd like","a glass of lemon iced tea,","please."],{ans:"glass",opts:["glass","grass","class"]},
  ["<b>A glass of lemon iced tea</b>, please.","Would you like some <b>iced tea</b> with your meal?"],
  W=>W.rs_tea==="served"?"Ly trà chanh đá đã có trên bàn rồi.":null,
  W=>[...(W.sitting?[]:[["walk","rs_waiter"]]),["pose","point",450],["set","rs_tea","served"],["wait",300]],
  V("iced_tea","lemon"),{sitOk:true,done:W=>W.rs_tea==="served"||W.rs_tea==="drunk",story:["order a glass of lemon iced tea","ordered a glass of lemon iced tea","gọi một ly trà chanh đá"]}),

 A("ask_for_napkins","waiter","Ask for extra napkins","Xin thêm khăn giấy",
  "Excuse me, could we get some extra napkins, please?",
  "Xin lỗi, cho chúng tôi xin thêm ít khăn giấy được không ạ?",
  ["extra","napkins"],["Can I have some tissues, please?"],
  "<b>extra napkins</b> = thêm khăn ăn / khăn giấy. Dùng <b>Could we get..., please?</b> rất lịch sự.",
  ["Excuse me,","could we get","some extra napkins, please?"],{ans:"napkins",opts:["napkins","nap","necklaces"]},
  ["Could we get some <b>extra napkins</b>?","Here are some clean <b>napkins</b> for you."],
  W=>W.rs_extra_napkins==="yes"?"Trên bàn đã có thêm khăn giấy rồi.":null,
  W=>[...(W.sitting?[]:[["walk","rs_waiter"]]),["pose","reach",420],["set","rs_extra_napkins","yes"],["wait",300]],
  V("napkin","waiter"),{sitOk:true,done:W=>W.rs_extra_napkins==="yes",story:["ask for some extra napkins","asked for some extra napkins","xin thêm khăn giấy"]}),

 Q("ask_for_soup_spoon","waiter","rs_waiter","point","rs_soup_Spoon","asked","Ask for a clean soup spoon","Xin thêm một chiếc muỗng múc súp",
  "Excuse me, could I have a clean ceramic spoon for my soup, please?",
  "Xin lỗi, cho tôi xin một chiếc muỗng sứ sạch để ăn súp được không ạ?",
  ["clean","ceramic","spoon","soup"],"Hỏi xin thêm dụng cụ ăn uống lịch sự: <b>Could I have a clean [spoon / fork], please?</b>",
  ["Could I have","a clean ceramic spoon","for my soup, please?"],["spoon","soon","moon"],
  ["Here is a <b>clean soup spoon</b> for you.","I dropped my fork; could I get <b>a clean one</b>?"],["soup","waiter"],undefined,true),

 Q("order_fresh_side_herbs","waiter","rs_waiter","point","rs_side_herbs","ordered","Order a plate of fresh herbs","Gọi thêm đĩa rau thơm tươi",
  "Could we also get a small plate of fresh basil and bean sprouts on the side?",
  "Cho chúng tôi xin thêm một đĩa nhỏ rau húng quế tươi và giá đỗ để riêng nhé?",
  ["plate","fresh","herbs","side"],"Cụm <b>on the side</b> = để riêng bên ngoài (không bỏ chung sẵn vào tô).",
  ["Could we also get","fresh basil and bean sprouts","on the side?"],["fresh","flash","flesh"],
  ["Can I get the dressing <b>on the side</b>?","Fresh green <b>herbs</b> make the noodle soup fragrant."],["herb","noodles","waiter"],undefined,true),

 // ==================== 5. KITCHEN PASS (2 existing + 3 new = 5) ====================
 A("watch_the_chef","kitchenpass","Watch the chef cook","Xem đầu bếp nấu",
  "I'm watching the chef prepare our hot noodles.",
  "Tôi đang xem đầu bếp chế biến món mì nóng cho chúng tôi.",
  ["watching","chef","noodles"],["The chef is cooking in the kitchen."],
  "Động từ giác quan: <b>watch + someone + V (nguyên mẫu)</b> (xem ai làm gì): <i>watch the chef prepare...</i>",
  ["I'm watching","the chef prepare","our hot noodles."],{ans:"chef",opts:["chef","chief","shelf"]},
  ["We watched the <b>chef</b> cook at the counter.","The head <b>chef</b> makes fresh noodles."],
  W=>W.rs_chef_watched==="yes"?"Bạn đã xem đầu bếp nấu mì rồi.":null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","rs_kitchen"],["pose","point",550],["set","rs_chef_watched","yes"],["wait",300]],
  V("chef","noodles"),{done:W=>W.rs_chef_watched==="yes",story:["watch the chef prepare the noodles","watched the chef prepare the noodles","xem đầu bếp nấu mì"]}),

 A("thank_the_chef","kitchenpass","Compliment the chef","Khen đầu bếp",
  "Thank you, Chef! The food was amazing.",
  "Cảm ơn Đầu bếp! Món ăn thật sự tuyệt vời.",
  ["thank","chef","amazing"],["Compliments to the chef!"],
  "Khi khen đồ ăn ngon sau bữa tối, dùng thì quá khứ <b>The food was amazing / delicious!</b>",
  ["Thank you, Chef!","The food","was amazing."],{ans:"amazing",opts:["amazing","amused","aiming"]},
  ["<b>The food was amazing</b>, thank you!","Send my compliments to the <b>chef</b>."],
  W=>W.rs_chef==="thanked"?"Bạn đã khen ngợi đầu bếp rồi.":null,
  W=>[...(W.sitting?[["stand"]]:[]),["walk","rs_kitchen"],["pose","point",480],["set","rs_chef","thanked"],["wait",300]],
  V("chef","delicious"),{done:W=>W.rs_chef==="thanked",story:["thank the chef for the meal","thanked the chef for the meal","cảm ơn đầu bếp vì bữa ăn ngon"]}),

 Q("admire_fresh_garnish","kitchenpass","rs_kitchen","point","rs_garnish","admired","Admire the colorful plating","Ngắm cách bày trí món ăn đẹp mắt",
  "Look how neatly the chef garnishes each hot bowl with green scallions and cilantro!",
  "Nhìn cách đầu bếp trang trí từng tô mì nóng hổi với hành lá xanh và ngò rí khéo chưa kìa!",
  ["neatly","chef","garnishes","hot"],"Động từ <b>garnish</b> = điểm xuyết, trang trí món ăn bằng rau thơm/gia vị.",
  ["Look how neatly","the chef garnishes","each hot bowl!"],["chef","check","chess"],
  ["The soup is <b>garnished with</b> fresh herbs.","Presentation boosts your <b>appetite</b>."],["chef","herb","appetite"]),

 Q("ask_chef_about_broth","kitchenpass","rs_kitchen","point","rs_broth_secret","asked","Ask the chef about the broth","Hỏi đầu bếp bí quyết hầm nước dùng",
  "Chef, how do you make the beef broth taste so clear, sweet, and aromatic?",
  "Đầu bếp ơi, làm sao đầu bếp ninh được nước dùng bò vừa trong, vừa ngọt thanh lại thơm lừng vậy ạ?",
  ["broth","clear","sweet","aromatic"],"Tính từ miêu tả nước dùng: <b>clear</b> (trong), <b>sweet</b> (ngọt xương), <b>aromatic</b> (thơm nức).",
  ["How do you make","the beef broth taste","so clear and aromatic?"],["broth","cloth","both"],
  ["We <b>simmer</b> beef bones with roasted ginger and cinnamon.","The <b>aroma</b> fills the whole kitchen."],["chef","broth","simmer","aroma"]),

 Q("smell_simmering_spices","kitchenpass","rs_kitchen","bend","rs_recipe_asked","yes","Smell the roasted ginger and spices","Ngửi hương gừng nướng và thảo mộc",
  "The warm aroma of roasted ginger and star anise from the kitchen is making me hungry!",
  "Hương thơm ấm nồng của gừng nướng và hoa hồi tỏa ra từ gian bếp làm tôi thấy đói bụng quá!",
  ["warm","aroma","ginger","hungry"],"Cấu trúc <b>make + tân ngữ + tính từ</b>: <i>making me hungry</i> (làm tôi thấy đói).",
  ["The warm aroma","of roasted ginger","is making me hungry!"],["aroma","agenda","camera"],
  ["Roasted <b>ginger</b> is great for digestion on cold evenings.","That delicious smell gave me a big <b>appetite</b>."],["aroma","ginger","appetite"]),

 // ==================== 6. WATER PITCHER (2 existing + 3 new = 5) ====================
 A("pour_drinking_water","waterpitcher","Pour some water","Rót nước lọc",
  "I'm pouring some cold water into our glasses.",
  "Tôi đang rót một ít nước mát vào ly cho chúng tôi.",
  ["pouring","water","glasses"],["Can I pour you some water?"],
  "<b>pour + chất lỏng + into + vật chứa</b>: rót nước vào ly (<i>pour water into the glass</i>).",
  ["I'm pouring","some cold water","into our glasses."],{ans:"pouring",opts:["pouring","pulling","pointing"]},
  ["She <b>poured water into</b> the glasses.","Would you like me to <b>pour</b> some water?"],
  W=>W.rs_water==="poured"?"Các ly nước đã được rót đầy rồi.":null,
  W=>[...(W.sitting?[]:[["walk","rs_water"]]),["pose","pour",520],["set","rs_water","poured"],["wait",280]],
  V("pour","pitcher"),{sitOk:true,done:W=>W.rs_water==="poured",story:["pour water into our glasses","poured water into our glasses","rót nước lọc vào ly"]}),

 A("drink_iced_tea","waterpitcher","Sip the iced tea","Uống trà chanh đá",
  "I'm taking a refreshing sip of my lemon iced tea.",
  "Tôi đang nhấp một ngụm trà chanh đá mát lạnh.",
  ["refreshing","sip","iced","tea"],["This iced tea is so refreshing."],
  "<b>take a sip of...</b> = nhấp một ngụm đồ uống; <b>refreshing</b> = mát lành, sảng khoái.",
  ["I'm taking","a refreshing sip","of my lemon iced tea."],{ans:"sip",opts:["sip","ship","slip"]},
  ["He took a <b>sip</b> of his lemon <b>iced tea</b>.","Cold lemon tea is very <b>refreshing</b>."],
  W=>W.rs_tea==="drunk"?"Bạn đã uống trà chanh đá rồi.":null,
  W=>[...(W.rs_tea==="none"?[["set","rs_tea","served"]]:[]),...(W.sitting?[]:[["walk","rs_water"]]),["spawn","glass"],["pose","drink",600],["set","rs_tea","drunk"],["despawn"],["wait",250]],
  V("iced_tea","lemon"),{sitOk:true,done:W=>W.rs_tea==="drunk",story:["sip my lemon iced tea","sipped my lemon iced tea","nhấp một ngụm trà chanh đá"]}),

 Q("refill_friend_water_glass","waterpitcher","rs_water","pour","rs_refill_water","yes","Refill my friend's water glass","Rót thêm nước đầy ly cho bạn",
  "Your glass is almost empty—let me refill it with cool filtered water.",
  "Ly của bạn gần cạn rồi—để mình rót thêm nước lọc mát vào cho đầy nhé.",
  ["empty","refill","cool","water"],"Động từ <b>refill A with B</b> = làm đầy lại A bằng B.",
  ["Your glass is almost empty—","let me refill it","with cool water."],["refill","rebuild","repeat"],
  ["Could we get a <b>water refill</b>, please?","Drinking plenty of water keeps you <b>hydrated</b>."],["pour","pitcher"],undefined,true),

 Q("ask_for_warm_water_throat","waterpitcher","rs_water","drink","rs_warm_water","drunk","Drink warm water for a sore throat","Uống nước ấm cho dịu cổ họng",
  "My throat feels a little dry today, so I'm drinking a glass of warm water.",
  "Hôm nay cổ họng tôi hơi khô nên tôi đang uống một ly nước ấm cho dịu họng.",
  ["throat","dry","drinking","warm"],"Câu giao tiếp về sức khoẻ: <b>My throat feels dry / sore</b> (Cổ họng tôi thấy khô / đau rát).",
  ["My throat feels a little dry,","so I'm drinking","a glass of warm water."],["warm","worm","farm"],
  ["Warm water is soothing when you have <b>a sore throat</b>.","I avoid ice when I feel <b>under the weather</b>."],["pitcher","pour"],undefined,true),

 Q("ask_for_less_ice","waterpitcher","rs_water","point","rs_ice_cubes","less","Ask for lemon tea with less ice","Dặn pha trà chanh ít đá",
  "Since the evening air is cool, could I get my lemon tea with very little ice?",
  "Vì không khí buổi tối khá mát mẻ, cho tôi ly trà chanh ít đá thôi được không ạ?",
  ["evening","cool","lemon","ice"],"Cách dặn lượng đá: <b>with less ice / with very little ice / with no ice</b>.",
  ["Since the evening air is cool,","could I get my tea","with very little ice?"],["cool","coal","pool"],
  ["Can I have my drink <b>with less ice</b>?","Too much ice isn't good for a sensitive <b>throat</b>."],["iced_tea","lemon","breeze"],undefined,true),

 // ==================== 7. CONDIMENTS (2 existing + 3 new = 5) ====================
 A("squeeze_some_lime","condiments","Squeeze some fresh lime","Vắt thêm chanh tươi",
  "I'm squeezing a little fresh lime into the broth.",
  "Tôi đang vắt một chút chanh tươi vào nước dùng.",
  ["squeezing","lime","broth"],["Squeeze a wedge of lime over the noodles."],
  "<b>squeeze + lime/lemon + into...</b> = vắt chanh vào món ăn.",
  ["I'm squeezing","a little fresh lime","into the broth."],{ans:"squeezing",opts:["squeezing","freezing","sneezing"]},
  ["<b>Squeeze</b> some fresh <b>lime</b> into your soup.","A little <b>lime</b> makes the broth taste bright."],
  W=>W.rs_lime==="yes"?"Bạn đã vắt chanh vào tô rồi.":null,
  W=>[...(W.rs_noodles==="none"?[["set","rs_noodles","served"]]:[]),...(W.sitting?[]:[["walk","rs_condiments"]]),["spawn","lime"],["pose","pour",480],["set","rs_lime","yes"],["despawn"],["wait",250]],
  V("squeeze","lime","broth"),{sitOk:true,done:W=>W.rs_lime==="yes",story:["squeeze fresh lime into the broth","squeezed fresh lime into the broth","vắt chanh tươi vào nước dùng"]}),

 A("add_black_pepper","condiments","Add a pinch of pepper","Rắc một chút tiêu",
  "I'm adding a pinch of black pepper to my bowl.",
  "Tôi đang rắc một nhúm hạt tiêu đen vào tô của mình.",
  ["pinch","pepper","bowl"],["Pass me the black pepper, please."],
  "<b>a pinch of salt / pepper</b> = một nhúm nhỏ muối / hạt tiêu.",
  ["I'm adding","a pinch of black pepper","to my bowl."],{ans:"pepper",opts:["pepper","paper","pebble"]},
  ["Add <b>a pinch of black pepper</b> for flavor.","Could you pass the salt and <b>pepper</b>?"],
  W=>W.rs_pepper==="yes"?"Bạn đã rắc tiêu vào tô rồi.":null,
  W=>[...(W.rs_noodles==="none"?[["set","rs_noodles","served"]]:[]),...(W.sitting?[]:[["walk","rs_condiments"]]),["pose","pour",460],["set","rs_pepper","yes"],["wait",250]],
  V("pepper","noodles"),{sitOk:true,done:W=>W.rs_pepper==="yes",story:["add a pinch of black pepper","added a pinch of black pepper","rắc thêm một chút tiêu đen"]}),

 Q("add_pickled_garlic","condiments","rs_condiments","pour","rs_garlic","added","Add tangy pickled garlic","Thêm một ít tỏi ngâm chua ngọt",
  "A spoonful of crispy pickled garlic adds a wonderful tangy flavor to the noodles.",
  "Một muỗng tỏi ngâm giòn rụm sẽ tăng thêm hương vị chua dịu tuyệt vời cho tô phở.",
  ["spoonful","crispy","garlic","tangy"],"Tính từ ẩm thực: <b>crispy</b> (giòn) và <b>tangy</b> (chua dịu kích thích vị giác).",
  ["A spoonful of crispy garlic","adds a wonderful tangy flavor","to the noodles."],["crispy","creamy","cloudy"],
  ["Garlic is very good for your <b>immune system</b>.","Try a little <b>pickled garlic</b> with your beef noodles."],["crispy","noodles","ingredient"],undefined,true),

 Q("drizzle_mild_chili_sauce","condiments","rs_condiments","pour","rs_chili_sauce","added","Add a drop of chili sauce","Thêm một giọt tương ớt dịu",
  "I'm adding just a tiny drop of sweet chili sauce to warm up on this cool night.",
  "Tôi chỉ thêm một giọt nhỏ tương ớt ngọt để làm ấm người trong buổi tối mát trời này.",
  ["tiny","drop","chili","warm"],"<b>warm up</b> = làm ấm cơ thể; <b>a tiny drop of...</b> = một giọt nhỏ.",
  ["I'm adding a tiny drop","of sweet chili sauce","to warm up tonight."],["spicy","slice","shiny"],
  ["Be careful, the red <b>chili sauce</b> is quite hot!","A little spice helps you <b>warm up</b>."],["spicy","mild","soup"],undefined,true),

 Q("pass_the_fish_sauce","condiments","rs_condiments","reach","rs_fish_sauce","passed","Pass the condiment bottle","Đưa lọ nước mắm cho bạn cùng bàn",
  "Could you please pass me the small bottle of traditional fish sauce?",
  "Bạn làm ơn đưa giúp mình lọ nước mắm truyền thống nhỏ kia được không?",
  ["pass","small","bottle","sauce"],"Câu nhờ lịch sự trên bàn ăn: <b>Could you please pass me the...?</b>",
  ["Could you please pass me","the small bottle","of traditional fish sauce?"],["pass","past","path"],
  ["<b>Could you pass me</b> the lime wedges, please?","Here you go—be careful, the bottle is full."],["table","condiments","broth"],undefined,true),

 // ==================== 8. NOODLE BOWL (2 existing + 3 new = 5) ====================
 A("taste_the_broth","noodlebowl","Taste the broth","Nếm thử nước dùng",
  "Mmm, the broth is warm, rich, and flavorful!",
  "Ừm, nước dùng ấm nóng, đậm đà và thơm ngon quá!",
  ["broth","warm","rich"],["The soup broth tastes amazing."],
  "Khi miêu tả nước súp/phở ngon đậm đà, dùng tính từ <b>rich</b> (đậm vị, ngọt xương) và <b>flavorful</b> (dậy mùi thơm).",
  ["Mmm, the broth","is warm, rich,","and flavorful!"],{ans:"broth",opts:["broth","cloth","both"]},
  ["This beef <b>broth</b> is so <b>rich</b>.","Taste the <b>broth</b> before adding sauce."],
  W=>W.rs_broth==="tasted"?"Bạn đã nếm thử nước dùng rồi.":W.rs_noodles==="none"?"Bạn hãy gọi món mì bò trước nhé (Order the beef noodle soup).":null,
  W=>[...(W.rs_noodles==="none"?[["set","rs_noodles","served"]]:[]),...(W.sitting?[]:[["walk","rs_noodles"]]),["pose","drink",550],["set","rs_broth","tasted"],["wait",260]],
  V("broth","soup","delicious"),{sitOk:true,done:W=>W.rs_broth==="tasted",story:["taste the warm broth","tasted the warm broth","nếm thử nước dùng"]}),

 A("eat_main_course","noodlebowl","Eat the main course","Ăn món chính",
  "This beef noodle soup is rich and delicious!",
  "Tô mì bò này đậm đà và ngon tuyệt!",
  ["beef","noodle","delicious"],["Enjoy your meal!"],
  "Khen món ăn đang thưởng thức: <b>This + [tên món] + is delicious!</b>",
  ["This beef noodle soup","is rich","and delicious!"],{ans:"delicious",opts:["delicious","delicate","precious"]},
  ["The main course is <b>delicious</b>!","We enjoyed a hot bowl of <b>beef noodle soup</b>."],
  W=>W.rs_noodles==="none"?"Bạn hãy gọi món mì bò trước nhé (Order the beef noodle soup).":W.rs_noodles==="eaten"?"Bạn đã ăn hết tô mì bò rồi.":null,
  W=>[...(W.rs_noodles==="none"?[["set","rs_noodles","served"]]:[]),...(W.sitting?[]:[["walk","rs_noodles"]]),["spawn","chopsticks"],["pose","drink",650],["set","rs_noodles","eaten"],["despawn"],["wait",280]],
  V("beef","noodles","delicious"),{sitOk:true,done:W=>W.rs_noodles==="eaten",story:["eat the delicious beef noodle soup","ate the delicious beef noodle soup","ăn tô mì bò thơm ngon"]}),

 Q("blow_on_hot_noodles","noodlebowl","rs_noodles","drink","rs_slurp","cooled","Blow gently on the steaming noodles","Thổi nhẹ cho mì nóng bớt bỏng",
  "The noodles are piping hot, so I'm blowing gently on them before taking a bite.",
  "Mì đang nóng nghi ngút khói nên tôi thổi nhẹ cho nguội bớt trước khi ăn.",
  ["piping","hot","blowing","bite"],"Thành ngữ <b>piping hot</b> = nóng hổi vừa thổi vừa ăn.",
  ["The noodles are piping hot,","so I'm blowing gently","before taking a bite."],["hot","hat","hit"],
  ["Be careful, the soup is <b>piping hot</b>!","Blow on your spoon so you don't burn your tongue."],["noodles","soup","broth"],undefined,true),

 Q("praise_tender_beef","noodlebowl","rs_noodles","point","rs_beef_tender","praised","Praise the tender beef slices","Khen thịt bò mềm ngọt",
  "These thinly sliced beef pieces are so tender that they melt in my mouth!",
  "Những lát thịt bò thái mỏng này mềm ngọt đến mức như tan ngay trong miệng!",
  ["thinly","sliced","beef","tender"],"Tính từ <b>tender</b> = mềm (dùng cho thịt được nấu khéo, ngược với <i>tough</i>: dai).",
  ["These thinly sliced beef pieces","are so tender","they melt in my mouth!"],["tender","slender","sender"],
  ["The brisket is cooked until <b>soft and tender</b>.","What a <b>delicious and nutritious</b> dinner!"],["beef","delicious","nutritious"],undefined,true),

 Q("finish_warm_soup","noodlebowl","rs_noodles","drink","rs_portion","finished","Enjoy the last spoonful of broth","Thưởng thức muỗng nước súp ấm cuối cùng",
  "A hot bowl of noodle soup makes me feel energized after a long workday.",
  "Một tô phở nóng hổi làm tôi cảm thấy tràn đầy năng lượng sau một ngày làm việc dài.",
  ["hot","noodle","energized","workday"],"Miêu tả sức khoẻ tích cực: <b>feel energized / refreshed</b> (cảm thấy khoẻ khoắn, đầy năng lượng).",
  ["A hot bowl of noodle soup","makes me feel energized","after a long workday."],["soup","soap","group"],
  ["Warm broth is great for your <b>stomach and digestion</b>.","I have a great <b>appetite</b> tonight!"],["soup","broth","appetite"],undefined,true),

 // ==================== 9. DESSERT DISPLAY (2 existing + 3 new = 5) ====================
 A("order_sweet_dessert","dessertcart","Order caramel pudding","Gọi bánh flan tráng miệng",
  "Let's share a caramel pudding for dessert.",
  "Chúng mình cùng gọi chung một phần bánh flan làm món tráng miệng nhé.",
  ["share","pudding","dessert"],["What would you like for dessert?"],
  "<b>for dessert</b> = làm món tráng miệng (chú ý phát âm /dɪˈzɜːt/, nhấn âm 2, khác với <i>desert</i> /ˈdez.ət/ sa mạc).",
  ["Let's share","a caramel pudding","for dessert."],{ans:"dessert",opts:["dessert","desert","insert"]},
  ["What are we having <b>for dessert</b>?","We shared a sweet <b>caramel pudding</b>."],
  W=>W.rs_dessert==="served"?"Món bánh flan tráng miệng đã có trên bàn rồi.":null,
  W=>[...(W.sitting?[]:[["walk","rs_dessert"]]),["pose","point",460],["set","rs_dessert","served"],["wait",300]],
  V("dessert","pudding"),{sitOk:true,done:W=>W.rs_dessert==="served"||W.rs_dessert==="eaten",story:["order caramel pudding for dessert","ordered caramel pudding for dessert","gọi bánh flan tráng miệng"]}),

 A("eat_the_dessert","dessertcart","Eat the dessert","Ăn món tráng miệng",
  "This caramel pudding is so smooth and sweet.",
  "Món bánh flan caramel này vừa mềm mịn vừa ngọt dịu.",
  ["pudding","smooth","sweet"],["Save room for dessert!"],
  "Miêu tả bánh flan / pudding: <b>smooth</b> (mềm mịn) và <b>sweet</b> (ngọt ngào).",
  ["This caramel pudding","is so smooth","and sweet."],{ans:"smooth",opts:["smooth","smoke","small"]},
  ["The custard is <b>smooth and sweet</b>.","I always save room for <b>dessert</b>."],
  W=>W.rs_dessert==="none"?"Bạn hãy gọi món tráng miệng trước nhé (Order caramel pudding).":W.rs_dessert==="eaten"?"Bạn đã ăn hết phần tráng miệng rồi.":null,
  W=>[...(W.rs_dessert==="none"?[["set","rs_dessert","served"]]:[]),...(W.sitting?[]:[["walk","rs_table"]]),["pose","drink",550],["set","rs_dessert","eaten"],["wait",260]],
  V("pudding","dessert"),{sitOk:true,done:W=>W.rs_dessert==="eaten",story:["eat the caramel pudding","ate the caramel pudding","ăn bánh flan tráng miệng"]}),

 Q("choose_fresh_fruit_tart","dessertcart","rs_dessert","point","rs_fruit_tart","chosen","Pick a fresh strawberry tart","Chọn bánh tart dâu tây tươi",
  "The mini fruit tarts topped with fresh strawberries look so colorful and tempting!",
  "Những chiếc bánh tart trái cây nhỏ phủ dâu tây tươi trông thật rực rỡ và hấp dẫn!",
  ["fruit","strawberries","colorful","tempting"],"Tính từ <b>tempting</b> = hấp dẫn, nhìn muốn thử ngay.",
  ["The mini fruit tarts","topped with fresh strawberries","look so tempting!"],["fruit","flute","foot"],
  ["Fresh fruit is a <b>light and healthy</b> dessert.","Would you like a slice of <b>strawberry tart</b>?"],["dessert","delicious"]),

 Q("ask_low_sugar_dessert","dessertcart","rs_dessert","point","rs_low_sugar","asked","Ask for a low-sugar dessert","Hỏi món tráng miệng ít đường tốt cho sức khoẻ",
  "Do you have any low-sugar desserts? I'm trying to cut down on refined sugar.",
  "Quán có món tráng miệng nào ít đường không ạ? Tôi đang cố gắng giảm bớt lượng đường tinh luyện để giữ sức khoẻ.",
  ["low-sugar","desserts","cut","sugar"],"Phrasal verb sức khoẻ: <b>cut down on + danh từ</b> = cắt giảm lượng tiêu thụ (đường, đồ ngọt, cà phê).",
  ["Do you have any low-sugar desserts?","I'm trying to cut down","on refined sugar."],["sugar","super","summer"],
  ["I'm <b>cutting down on sugar</b> for my health.","Our green tea pudding is <b>lightly sweetened</b>."],["dessert","pudding","nutritious"]),

 Q("share_dessert_with_friend","dessertcart","rs_dessert","reach","rs_pack_dessert","shared","Ask for two dessert spoons","Xin hai chiếc muỗng nhỏ ăn tráng miệng",
  "Could we have two small dessert spoons so we can share this pudding?",
  "Cho chúng tôi xin hai chiếc muỗng nhỏ để cùng ăn chung phần bánh flan này nhé?",
  ["two","small","dessert","share"],"Cấu trúc chỉ mục đích: <b>so (that) we can + V</b> (để chúng tôi có thể...).",
  ["Could we have","two small dessert spoons","so we can share?"],["share","care","chair"],
  ["Sharing <b>dessert</b> with a friend is twice as fun!","Here are two clean <b>dessert spoons</b>."],["dessert","pudding"],undefined,true),

 // ==================== 10. BILL DESK (3 existing + 2 new = 5) ====================
 A("ask_for_the_bill","billdesk","Ask for the bill","Xin hoá đơn thanh toán",
  "Excuse me, could we have the bill, please?",
  "Xin lỗi, cho chúng tôi xin hoá đơn thanh toán nhé?",
  ["bill","please"],["Check, please!"],
  "Khi muốn tính tiền ở nhà hàng: dùng <b>Could we have the bill, please?</b> (Anh-Anh) hoặc <b>Check, please!</b> (Anh-Mỹ).",
  ["Excuse me,","could we have","the bill, please?"],{ans:"bill",opts:["bill","bell","pill"]},
  ["<b>Could we have the bill</b>, please?","The waiter brought the <b>bill</b> to our table."],
  W=>W.rs_bill==="ready"?"Hoá đơn đã sẵn sàng để thanh toán rồi.":null,
  W=>[...(W.sitting?[]:[["walk","rs_bill"]]),["pose","point",450],["set","rs_bill","ready"],["wait",280]],
  V("bill","waiter"),{sitOk:true,done:W=>W.rs_bill==="ready",story:["ask for the bill","asked for the bill","xin hoá đơn thanh toán"]}),

 A("split_the_bill","billdesk","Split the bill","Chia đôi hoá đơn",
  "Let's split the bill fifty-fifty.",
  "Chúng mình chia đôi hoá đơn mỗi người một nửa nhé.",
  ["split","bill"],["Shall we go Dutch?"],
  "<b>split the bill</b> (hoặc <b>go Dutch</b>) = chia tiền hoá đơn; <b>fifty-fifty</b> = chia đều 50/50.",
  ["Let's split","the bill","fifty-fifty."],{ans:"split",opts:["split","spill","slip"]},
  ["Do you want to <b>split the bill</b>?","We decided to <b>split the bill fifty-fifty</b>."],
  W=>W.rs_split==="yes"?"Hai bạn đã thống nhất chia đôi hoá đơn rồi.":null,
  W=>[...(W.rs_bill==="none"?[["set","rs_bill","ready"]]:[]),...(W.sitting?[]:[["walk","rs_bill"]]),["pose","point",450],["set","rs_split","yes"],["wait",280]],
  V("split","bill"),{sitOk:true,done:W=>W.rs_split==="yes",story:["split the bill fifty-fifty","split the bill fifty-fifty","chia đôi hoá đơn"]}),

 A("pay_restaurant_bill","billdesk","Pay the bill by card","Thanh toán hoá đơn bằng thẻ",
  "I'm paying the bill by card and leaving a tip.",
  "Tôi đang thanh toán hoá đơn bằng thẻ và gửi lại tiền boa.",
  ["paying","bill","card","tip"],["Keep the change!"],
  "<b>pay the bill by card</b> = trả hoá đơn bằng thẻ; <b>leave a tip</b> = để lại tiền boa cảm ơn phục vụ.",
  ["I'm paying the bill","by card","and leaving a tip."],{ans:"tip",opts:["tip","trip","lip"]},
  ["Can I <b>pay the bill by card</b>?","We left a generous <b>tip</b> for the waiter."],
  W=>W.rs_paid==="yes"?"Hoá đơn đã được thanh toán xong rồi.":null,
  W=>[...(W.rs_bill==="none"?[["set","rs_bill","ready"]]:[]),...(W.sitting?[["stand"]]:[]),["walk","rs_bill"],["spawn","card"],["pose","reach",520],["set","rs_paid","yes"],["despawn"],["wait",280]],
  V("bill","tip","restaurant"),{done:W=>W.rs_paid==="yes",story:["pay the bill and leave a tip","paid the bill by card and left a tip","thanh toán hoá đơn và để lại tiền tip"]}),

 Q("check_itemized_receipt","billdesk","rs_bill","read","rs_check_receipt","checked","Check the itemized receipt","Kiểm tra chi tiết biên lai thanh toán",
  "Let me quickly check the printed receipt—service charge is already included.",
  "Để tôi kiểm tra nhanh tờ biên lai in ra—phí phục vụ đã được tính gộp sẵn ở trong này rồi.",
  ["check","printed","receipt","included"],"<b>receipt</b> (/rɪˈsiːt/, âm <i>p</i> câm) = biên lai sau khi thanh toán; <b>service charge is included</b> = đã bao gồm phí phục vụ.",
  ["Let me check","the printed receipt—","service charge is included."],["receipt","recipe","receive"],
  ["Could I get a <b>printed receipt</b>, please?","Tax and service are <b>already included</b>."],["receipt","bill"]),

 Q("ask_for_wifi_password","billdesk","rs_bill","point","rs_wifi_asked","asked","Ask for the restaurant Wi-Fi","Hỏi mật khẩu Wi-Fi của quán",
  "Excuse me, what is the guest Wi-Fi password here?",
  "Xin lỗi, mật khẩu Wi-Fi dành cho khách của nhà hàng mình là gì vậy ạ?",
  ["what","guest","Wi-Fi","password"],"Câu hỏi thông dụng ở quán ăn/cà phê: <b>What is the Wi-Fi password?</b>",
  ["Excuse me,","what is the guest","Wi-Fi password here?"],["guest","best","rest"],
  ["The <b>Wi-Fi password</b> is written at the bottom of the menu.","Feel free to connect to our <b>guest network</b>."],["waiter","restaurant"]),

 // ==================== 11. FRESH SALAD BAR (5 new) ====================
 Q("pick_up_salad_plate","saladbar","rs_salad","reach","rs_salad_plate","taken","Take a chilled ceramic salad plate","Lấy đĩa sứ mát ở quầy salad",
  "I'm picking up a chilled ceramic plate at the fresh salad bar.",
  "Tôi đang cầm một chiếc đĩa sứ được làm mát sẵn tại quầy salad rau tươi.",
  ["picking","chilled","plate","salad"],"Tính từ <b>chilled</b> = được ướp mát nhẹ để giữ rau giòn tươi.",
  ["I'm picking up","a chilled ceramic plate","at the fresh salad bar."],["salad","solid","valid"],
  ["Help yourself to the <b>fresh salad bar</b>.","The plates are kept <b>nicely chilled</b>."],["salad","appetizer"]),

 Q("toss_crispy_green_salad","saladbar","rs_salad","pour","rs_salad_greens","tossed","Serve crispy lettuce and cucumber","Gắp xà lách giòn và dưa leo tươi",
  "I'm filling my bowl with crispy green lettuce and cool cucumber slices.",
  "Tôi đang gắp đầy bát các lá xà lách xanh giòn rụm và những lát dưa leo tươi mát.",
  ["filling","crispy","lettuce","cucumber"],"Tính từ <b>crispy</b> = giòn tươi; <b>fill A with B</b> = làm đầy A bằng B.",
  ["I'm filling my bowl","with crispy green lettuce","and cool cucumber slices."],["crispy","creamy","chilly"],
  ["Eating green vegetables is great for <b>digestion</b>.","This lettuce is so <b>fresh and crispy</b>!"],["salad","crispy","nutritious"]),

 Q("add_cherry_tomatoes","saladbar","rs_salad","reach","rs_salad_tomato","added","Add sweet cherry tomatoes","Thêm cà chua bi chín mọng",
  "These bright red cherry tomatoes are juicy and packed with vitamins!",
  "Những quả cà chua bi đỏ mọng này rất nhiều nước và giàu vi-ta-min tốt cho sức khoẻ!",
  ["bright","cherry","tomatoes","vitamins"],"Cụm tính từ sức khoẻ: <b>packed with vitamins / nutrients</b> (giàu vitamin / dưỡng chất).",
  ["These bright red cherry tomatoes","are juicy","and packed with vitamins!"],["juicy","noisy","busy"],
  ["Fresh tomatoes are <b>packed with vitamin C</b>.","Add some color to your <b>salad bowl</b>."],["salad","nutritious","ingredient"]),

 Q("drizzle_olive_oil_dressing","saladbar","rs_salad","pour","rs_salad_dressing","drizzled","Drizzle sesame & olive oil dressing","Rưới sốt dầu ô-liu và mè rang",
  "I'm drizzling a light sesame and olive oil dressing over my fresh salad.",
  "Tôi đang rưới một lớp sốt dầu ô-liu và mè rang thanh nhẹ lên đĩa salad tươi của mình.",
  ["drizzling","light","dressing","salad"],"Động từ <b>drizzle</b> = rưới nhẹ thành dòng mảnh; <b>salad dressing</b> = nước sốt trộn salad.",
  ["I'm drizzling","a light olive oil dressing","over my fresh salad."],["dressing","pressing","blessing"],
  ["Would you like <b>sesame dressing</b> or vinaigrette?","Olive oil is a <b>heart-healthy</b> choice."],["dressing","salad","nutritious"]),

 Q("enjoy_nutritious_salad","saladbar","rs_salad","drink","rs_salad_eaten","eaten","Eat the fresh appetizer salad","Thưởng thức đĩa salad khai vị bổ dưỡng",
  "Starting dinner with a crunchy green salad is a great healthy habit!",
  "Bắt đầu bữa tối bằng một đĩa salad rau xanh giòn mát là một thói quen rất tốt cho sức khoẻ!",
  ["starting","crunchy","salad","healthy"],"Danh động từ làm chủ ngữ: <b>Starting dinner with... is...</b>",
  ["Starting dinner","with a crunchy green salad","is a healthy habit!"],["healthy","wealthy","heavy"],
  ["A light <b>appetizer salad</b> wakes up your appetite.","These organic greens taste so <b>fresh</b>."],["salad","appetizer","nutritious"]),

 // ==================== 12. HOT SOUP STATION (5 new) ====================
 Q("lift_soup_kettle_lid","soupkettle","rs_soup","reach","rs_kettle_lid","lifted","Open the soup kettle lid","Mở nắp nồi súp hầm nóng",
  "I'm carefully lifting the lid of the hot soup kettle to see today's starter.",
  "Tôi đang cẩn thận mở nắp nồi súp nóng để xem món khai vị ấm bụng hôm nay.",
  ["carefully","lifting","lid","soup"],"Trạng từ <b>carefully</b> = một cách cẩn thận (tránh hơi nước nóng).",
  ["I'm carefully lifting","the lid","of the hot soup kettle."],["soup","group","soap"],
  ["Watch out for the hot steam when <b>lifting the lid</b>.","What is the <b>soup of the day</b>?"],["soup","ladle","appetizer"]),

 Q("smell_savory_herb_aroma","soupkettle","rs_soup","bend","rs_kettle_aroma","smelled","Smell the savory herbal broth","Thưởng thức hương súp thảo mộc thơm lừng",
  "The rich, savory aroma of mushroom and herb soup smells wonderful on a rainy evening!",
  "Hương thơm đậm đà của nồi súp nấm thảo mộc thật tuyệt vời trong một buổi tối mưa rơi!",
  ["rich","savory","aroma","rainy"],"Tính từ <b>savory</b> = đậm đà, mặn mà thơm ngon (ngược với <i>sweet</i>).",
  ["The rich, savory aroma","of mushroom soup","smells wonderful on a rainy evening!"],["aroma","camera","drama"],
  ["Warm soup is the best comfort food on a <b>rainy evening</b>.","The herbal broth smells <b>so savory</b>."],["aroma","soup","herb"]),

 Q("ladle_warm_pumpkin_soup","soupkettle","rs_soup","pour","rs_kettle_ladle","ladled","Ladle a bowl of creamy pumpkin soup","Múc một chén súp bí đỏ kem mịn",
  "I'm using the silver ladle to scoop a warm bowl of creamy pumpkin soup.",
  "Tôi đang dùng chiếc muôi bạc để múc một chén súp bí đỏ kem mịn và ấm nóng.",
  ["silver","ladle","warm","creamy"],"Từ <b>ladle</b> (/ˈleɪ.dəl/) vừa là danh từ (cái muôi múc canh) vừa là động từ (múc bằng muôi).",
  ["I'm using the silver ladle","to scoop a warm bowl","of creamy pumpkin soup."],["ladle","table","label"],
  ["Scoop a full <b>ladle of hot broth</b>.","This pumpkin soup is <b>smooth and creamy</b>."],["ladle","soup","delicious"]),

 Q("add_fresh_ginger_slices","soupkettle","rs_soup","pour","rs_kettle_ginger","added","Add shredded ginger for warmth","Thêm vài lát gừng tươi giữ ấm cơ thể",
  "Adding fresh ginger slices to hot soup helps keep your stomach warm and aids digestion.",
  "Thêm vài lát gừng tươi vào súp nóng giúp giữ ấm bụng và hỗ trợ tiêu hoá rất tốt.",
  ["fresh","ginger","warm","digestion"],"Cụm từ sức khoẻ: <b>aid / help digestion</b> (hỗ trợ tiêu hoá).",
  ["Adding fresh ginger slices","helps keep your stomach warm","and aids digestion."],["ginger","finger","singer"],
  ["Fresh <b>ginger</b> is a natural remedy for a cold day.","This herbal soup is easy to <b>digest</b>."],["ginger","digest","soup"]),

 Q("check_soup_temperature","soupkettle","rs_soup","read","rs_kettle_temp","checked","Check the soup warmer temperature","Xem nhiệt độ giữ ấm của nồi súp",
  "The digital warmer keeps the broth at a steady, safe temperature all evening.",
  "Nồi giữ nhiệt điện tử giúp nước súp luôn ở mức nhiệt độ ổn định và an toàn suốt buổi tối.",
  ["warmer","keeps","steady","temperature"],"Cấu trúc <b>keep + tân ngữ + at + mức độ</b>: duy trì ở nhiệt độ ổn định.",
  ["The digital warmer","keeps the broth","at a steady, safe temperature."],["steady","ready","heavy"],
  ["Serve the soup while it is <b>warm and fresh</b>.","Good food <b>hygiene</b> starts with proper temperature."],["soup","broth","hygiene"]),

 // ==================== 13. JUICE & TEA BAR (5 new) ====================
 Q("browse_healthy_drinks","drinkbar","rs_drinkbar","read","rs_juice_menu","browsed","Browse the fresh juice & tea menu","Xem bảng đồ uống trái cây & trà thảo mộc",
  "Let's look at the drink bar—they press fresh fruit juices and brew herbal teas to order!",
  "Hãy nhìn quầy đồ uống kìa—họ ép nước trái cây tươi và pha trà thảo mộc ngay khi khách gọi!",
  ["fresh","fruit","juices","herbal"],"Cụm <b>made / brewed to order</b> = pha chế tươi ngay khi khách đặt món.",
  ["They press fresh fruit juices","and brew herbal teas","to order!"],["herbal","verbal","global"],
  ["All our smoothies are <b>made to order</b>.","Which <b>herbal tea</b> do you feel like drinking?"],["herbal_tea","smoothie","menu"]),

 Q("order_fresh_orange_juice","drinkbar","rs_drinkbar","point","rs_orange_juice","ordered","Order freshly squeezed orange juice","Gọi một ly nước cam vắt nguyên chất",
  "Can I get a tall glass of freshly squeezed orange juice to boost my vitamin C?",
  "Cho tôi một ly cao nước cam vắt tươi nguyên chất để bổ sung thêm vi-ta-min C nhé?",
  ["freshly","squeezed","orange","vitamin"],"Cụm <b>freshly squeezed orange juice</b> = nước cam vừa vắt tươi nguyên chất.",
  ["Can I get a tall glass","of freshly squeezed orange juice","to boost my vitamin C?"],["squeezed","freezed","breezed"],
  ["<b>Freshly squeezed juice</b> is much healthier than soda.","Oranges help <b>boost your immune system</b>."],["squeeze","nutritious","smoothie"]),

 Q("choose_warm_ginger_tea","drinkbar","rs_drinkbar","drink","rs_herbal_tea","chosen","Order soothing honey ginger tea","Gọi trà gừng mật ong ấm họng",
  "It's a bit chilly after the rain, so a mug of warm honey ginger tea will feel wonderful.",
  "Trời hơi se lạnh sau cơn mưa nên một cốc trà gừng mật ong ấm nóng sẽ dễ chịu lắm đây.",
  ["chilly","rain","warm","ginger"],"Kết hợp thời tiết & sức khoẻ: <b>chilly after the rain</b> (se lạnh sau cơn mưa) → uống <b>warm honey ginger tea</b>.",
  ["It's a bit chilly after the rain,","so a mug of warm ginger tea","will feel wonderful."],["ginger","winter","dinner"],
  ["Honey and <b>ginger tea</b> soothes a tired voice.","Drink something warm when the weather turns <b>chilly</b>."],["herbal_tea","ginger","drizzle"]),

 Q("request_no_added_sugar","drinkbar","rs_drinkbar","point","rs_less_ice","no_sugar","Ask for 100% pure fruit with no syrup","Dặn làm nước ép nguyên chất không đường",
  "Could you make my juice with no added sugar? The ripe fruit is naturally sweet enough.",
  "Bạn làm giúp tôi nước ép không thêm đường nhé? Trái cây chín vốn đã có vị ngọt tự nhiên rồi.",
  ["no","added","sugar","naturally"],"Cụm dinh dưỡng: <b>no added sugar</b> (không pha thêm đường); <b>naturally sweet</b> (ngọt tự nhiên).",
  ["Could you make my juice","with no added sugar?","The fruit is naturally sweet."],["sweet","street","sheet"],
  ["I always order smoothies with <b>no added sugar</b>.","Ripe mangoes are <b>naturally sweet</b>."],["smoothie","nutritious","ingredient"]),

 Q("sip_tropical_mango_smoothie","drinkbar","rs_drinkbar","drink","rs_smoothie","sipped","Sip a thick mango smoothie","Nhấp thử ly sinh tố xoài sánh mịn",
  "This cold tropical mango smoothie is thick, creamy, and full of fresh fruit flavor!",
  "Ly sinh tố xoài nhiệt đới mát lạnh này vừa sánh đặc, vừa béo mịn lại đậm vị trái cây tươi!",
  ["tropical","mango","smoothie","creamy"],"Tính từ miêu tả sinh tố ngon: <b>thick and creamy</b> (sánh đặc và mịn màng).",
  ["This cold mango smoothie","is thick, creamy,","and full of fruit flavor!"],["smoothie","smoothly","soothing"],
  ["A cold <b>mango smoothie</b> is perfect on a warm day.","Blend ripe mango with yogurt for a <b>creamy</b> drink."],["smoothie","delicious"]),

 // ==================== 14. COAT & UMBRELLA STAND (5 new) ====================
 Q("shake_off_wet_umbrella","coatstand","rs_coat","sweep","rs_umbrella_dry","shaken","Fold my wet umbrella at the door","Gấp gọn chiếc ô ướt ở lối vào",
  "It was drizzling outside, so I'm shaking off my wet umbrella and placing it in the stand.",
  "Bên ngoài trời vừa mưa phùn nhẹ nên tôi đang giũ khô chiếc ô ướt rồi đặt gọn vào giá đựng.",
  ["drizzling","outside","shaking","umbrella"],"<b>shake off</b> = giũ sạch nước mưa; <b>drizzle</b> = mưa phùn lất phất.",
  ["It was drizzling outside,","so I'm shaking off","my wet umbrella."],["umbrella","vanilla","gorilla"],
  ["Leave your <b>wet umbrella</b> in the stand by the door.","It's only <b>drizzling</b> lightly tonight."],["umbrella","drizzle"]),

 Q("hang_up_light_raincoat","coatstand","rs_coat","reach","rs_hang_raincoat","hung","Hang my light jacket on the wooden peg","Treo áo khoác mỏng lên móc gỗ",
  "I'm hanging my light windbreaker on the wooden coat rack so I can dine comfortably.",
  "Tôi đang treo chiếc áo khoác gió mỏng lên giá gỗ để ngồi dùng bữa cho thoải mái.",
  ["hanging","light","coat","comfortably"],"<b>hang up a coat / jacket</b> = treo áo khoác lên móc.",
  ["I'm hanging my light windbreaker","on the wooden coat rack","to dine comfortably."],["coat","boat","goat"],
  ["May I <b>hang up your coat</b> for you?","The dining room is warm, so you don't need a <b>jacket</b>."],["umbrella","restaurant"]),

 Q("check_evening_drizzle","coatstand","rs_coat","read","rs_check_rain","checked","Look through the window at the weather","Nhìn qua cửa kính xem thời tiết ngoài trời",
  "Look out the window—the light rain has stopped and the city streets look clear now!",
  "Nhìn ra ngoài cửa sổ kìa—cơn mưa nhỏ đã tạnh và đường phố giờ đã quang đãng rồi!",
  ["window","light","rain","clear"],"Khi mưa vừa tạnh: <b>The rain has stopped / cleared up</b>.",
  ["Look out the window—","the light rain has stopped","and the streets look clear!"],["clear","clean","close"],
  ["Has the <b>evening drizzle</b> stopped yet?","The sky is <b>clear and starry</b> after the rain."],["window","drizzle","breeze"]),

 Q("hang_warm_scarf","coatstand","rs_coat","reach","rs_scarf_hook","hung","Drape my scarf neatly on the hook","Móc khăn choàng cổ gọn gàng",
  "I always wear a soft scarf on windy evenings to protect my neck and throat.",
  "Tôi luôn quàng một chiếc khăn mềm vào những buổi tối có gió để giữ ấm cổ và họng.",
  ["soft","scarf","windy","protect"],"Câu giao tiếp giữ gìn sức khoẻ theo thời tiết: <b>protect my neck and throat on windy evenings</b>.",
  ["I always wear a soft scarf","on windy evenings","to protect my throat."],["windy","window","winter"],
  ["Keep your neck warm when the weather is <b>windy</b>.","Hang your <b>scarf</b> on the top hook."],["breeze","umbrella"]),

 Q("retrieve_umbrella_before_leaving","coatstand","rs_coat","reach","rs_take_umbrella","taken","Pick up my coat and umbrella before leaving","Lấy lại áo khoác và ô trước khi ra về",
  "Don't forget to grab your umbrella from the stand before we head home!",
  "Đừng quên lấy lại chiếc ô của bạn ở giá đựng trước khi chúng mình đi về nhà nhé!",
  ["forget","grab","umbrella","home"],"Nhắc nhở thân thiện: <b>Don't forget to + V... before we head home!</b>",
  ["Don't forget to grab","your umbrella from the stand","before we head home!"],["grab","crab","cab"],
  ["Did you check that we have our <b>umbrellas</b>?","Have a safe walk <b>home</b>!"],["umbrella","restaurant"]),

 // ==================== 15. HANDWASHING SINK (5 new) ====================
 Q("turn_on_warm_faucet","washbasin","rs_sink","reach","rs_turn_faucet","on","Turn on the warm water tap","Mở vòi nước ấm ở bồn rửa tay",
  "I always wash my hands with warm water before eating a meal at a restaurant.",
  "Tôi luôn rửa tay bằng nước ấm trước khi dùng bữa tại nhà hàng.",
  ["wash","hands","warm","before"],"Thói quen vệ sinh sức khoẻ: <b>wash your hands before eating a meal</b>.",
  ["I always wash my hands","with warm water","before eating a meal."],["wash","watch","wish"],
  ["The sink has both <b>warm and cool water</b>.","Always <b>wash your hands</b> before dinner."],["hygiene","soap"]),

 Q("wash_hands_with_soap","washbasin","rs_sink","wipe","rs_soap_wash","washed","Scrub hands with herbal soap","Rửa tay kỹ với xà phòng thảo mộc",
  "I'm rubbing my hands with fragrant lemongrass soap for twenty seconds for good hygiene.",
  "Tôi đang xoa đều tay với xà phòng hương sả thơm dịu trong hai mươi giây để đảm bảo vệ sinh.",
  ["rubbing","fragrant","soap","hygiene"],"Từ vựng sức khoẻ: <b>good hygiene</b> (/ˈhaɪ.dʒiːn/) = vệ sinh tốt, sạch sẽ phòng bệnh.",
  ["I'm rubbing my hands","with fragrant soap","for good hygiene."],["soap","soup","rope"],
  ["Washing hands with <b>soap</b> keeps germs away.","This lemongrass <b>soap</b> smells so fresh!"],["soap","hygiene","aroma"]),

 Q("rinse_hands_thoroughly","washbasin","rs_sink","water","rs_rinse_warm","rinsed","Rinse soap bubbles off my hands","Tráng sạch bọt xà phòng dưới vòi nước",
  "I'm rinsing all the soap bubbles off my hands under the clean running water.",
  "Tôi đang tráng sạch hết bọt xà phòng trên tay dưới dòng nước sạch đang chảy.",
  ["rinsing","soap","clean","running"],"<b>running water</b> = nước chảy trực tiếp từ vòi; <b>rinse off</b> = tráng sạch.",
  ["I'm rinsing","all the soap bubbles off","under the running water."],["rinse","rice","rise"],
  ["<b>Rinse your hands</b> thoroughly with clean water.","Turn off the tap to <b>save water</b>."],["soap","hygiene"]),

 Q("dry_hands_with_clean_towel","washbasin","rs_sink","wipe","rs_dry_towel","dried","Dry my hands with a paper towel","Lau khô tay bằng khăn giấy sạch",
  "I'm drying my wet hands with a clean paper towel from the dispenser.",
  "Tôi đang lau khô đôi bàn tay ướt bằng một tờ khăn giấy sạch rút từ hộp đựng.",
  ["drying","wet","clean","towel"],"<b>dry your hands with a towel</b> = lau khô tay bằng khăn.",
  ["I'm drying my wet hands","with a clean paper towel","from the dispenser."],["towel","tower","vowel"],
  ["Use a clean <b>paper towel</b> to dry your hands.","Toss the used towel into the <b>pedal bin</b>."],["napkin","hygiene"]),

 Q("use_herbal_hand_sanitizer","washbasin","rs_sink","reach","rs_sanitizer","used","Apply moisturizing hand sanitizer","Dùng thêm gel rửa tay khô dưỡng ẩm",
  "A drop of aloe vera hand sanitizer keeps my hands clean and soft before dinner.",
  "Một giọt gel rửa tay khô lô hội giúp đôi tay tôi vừa sạch khuẩn vừa mềm mại trước bữa tối.",
  ["drop","sanitizer","clean","soft"],"<b>hand sanitizer</b> = dung dịch/gel sát khuẩn tay nhanh.",
  ["A drop of hand sanitizer","keeps my hands","clean and soft."],["clean","lean","mean"],
  ["There is a bottle of <b>hand sanitizer</b> by the counter.","Clean hands mean a <b>healthy meal</b>!"],["hygiene","soap"]),

 // ==================== 16. ACOUSTIC MUSIC STAGE (5 new) ====================
 Q("listen_to_acoustic_guitar","musiccorner","rs_music","read","rs_listen_guitar","listened","Listen to the soft acoustic guitar","Thưởng thức tiếng đàn guitar mộc êm dịu",
  "The gentle acoustic guitar melody creates such a relaxing atmosphere for dinner.",
  "Giai điệu đàn guitar mộc nhẹ nhàng tạo nên một bầu không khí thật thư giãn cho bữa tối.",
  ["gentle","acoustic","melody","relaxing"],"Collocation: <b>create a relaxing / cozy atmosphere</b> (tạo bầu không khí thư thái / ấm cúng).",
  ["The gentle acoustic melody","creates a relaxing atmosphere","for dinner."],["melody","memory","remedy"],
  ["I love dining with live <b>acoustic music</b>.","The soft <b>melody</b> helps me unwind after work."],["acoustic","melody","restaurant"]),

 Q("applaud_the_musician","musiccorner","rs_music","point","rs_clap_song","clapped","Clap for the live guitarist","Vỗ tay tán thưởng nghệ sĩ guitar",
  "That song was beautiful! Let's give the guitarist a warm round of applause.",
  "Bản nhạc vừa rồi hay quá! Hãy dành cho nghệ sĩ guitar một tràng pháo tay thật nồng nhiệt nhé.",
  ["song","beautiful","warm","applause"],"Thành ngữ: <b>give someone a warm round of applause</b> (dành cho ai một tràng pháo tay nồng nhiệt).",
  ["That song was beautiful!","Let's give the guitarist","a warm round of applause."],["song","strong","long"],
  ["Everyone clapped after the <b>acoustic song</b>.","The musician smiled and bowed to the <b>diners</b>."],["acoustic","melody"]),

 Q("request_a_relaxing_song","musiccorner","rs_music","point","rs_request_melody","requested","Request a classic love ballad","Yêu cầu một bản nhạc trữ tình nhẹ nhàng",
  "Excuse me, could you play a classic acoustic ballad for our weekend dinner?",
  "Xin lỗi, bạn có thể đàn một bản ballad mộc cổ điển cho bữa tối cuối tuần của chúng tôi được không?",
  ["play","classic","acoustic","ballad"],"Khi yêu cầu bài hát lịch sự: <b>Could you play [tên bài / thể loại]...?</b>",
  ["Excuse me, could you play","a classic acoustic ballad","for our dinner?"],["play","stay","tray"],
  ["The guitarist played our <b>favorite melody</b>.","Live music makes the evening <b>special</b>."],["acoustic","melody","special"]),

 Q("comment_on_pleasant_volume","musiccorner","rs_music","point","rs_volume_nice","commented","Praise the comfortable music volume","Khen âm lượng nhạc vừa phải dễ trò chuyện",
  "The music volume here is just right—soft enough that we can chat comfortably.",
  "Âm lượng nhạc ở đây vừa vặn thật—đủ êm dịu để chúng mình có thể trò chuyện thoải mái.",
  ["volume","right","soft","chat"],"Cấu trúc <b>Tính từ + enough (that) S + can + V</b>: <i>soft enough that we can chat</i>.",
  ["The music volume is just right—","soft enough","that we can chat comfortably."],["soft","sort","salt"],
  ["I like restaurants where the music isn't <b>too loud</b>.","It's easy to have a <b>quiet conversation</b> here."],["acoustic","melody","table"]),

 Q("take_photo_of_music_corner","musiccorner","rs_music","point","rs_photo_stage","taken","Take a photo by the cozy stage","Chụp ảnh kỷ niệm bên góc nhạc ấm cúng",
  "The warm fairy lights around the acoustic stage look great in our photo!",
  "Ánh đèn vàng ấm áp quanh góc nhạc acoustic lên hình trong bức ảnh của tụi mình đẹp quá!",
  ["warm","lights","acoustic","photo"],"<b>look + tính từ + in a photo</b>: lên ảnh trông rất đẹp.",
  ["The warm fairy lights","around the acoustic stage","look great in our photo!"],["stage","page","cage"],
  ["Let's take a quick photo before our <b>main course</b> arrives.","The bistro has such <b>charming decor</b>."],["acoustic","lantern","restaurant"]),

 // ==================== 17. BREEZY PATIO TABLE (5 new) ====================
 Q("step_out_to_patio","patiotable","rs_patio","point","rs_step_patio","out","Step out to the garden patio","Bước ra khu bàn sân hiên thoáng đãng",
  "Let's step out to the patio table for a moment to get some fresh night air.",
  "Chúng mình bước ra khu bàn sân hiên một lát để hít thở không khí đêm trong lành nhé.",
  ["step","patio","fresh","air"],"<b>get some fresh air</b> = hít thở không khí trong lành, thoáng đãng.",
  ["Let's step out","to the patio table","to get some fresh air."],["fresh","flash","fish"],
  ["The <b>outdoor patio</b> is surrounded by green plants.","Stepping outside for <b>fresh air</b> feels great."],["patio","breeze"]),

 Q("enjoy_cool_evening_breeze","patiotable","rs_patio","reach","rs_evening_breeze","enjoyed","Enjoy the gentle evening breeze","Tận hưởng làn gió tối dịu mát",
  "After a hot afternoon, this gentle evening breeze on the patio feels so refreshing!",
  "Sau một buổi chiều nắng nóng, làn gió tối dịu nhẹ ngoài sân hiên này mới sảng khoái làm sao!",
  ["hot","afternoon","gentle","breeze"],"Miêu tả thời tiết chuyển dịu: <b>After a hot afternoon, this gentle evening breeze feels refreshing!</b>",
  ["After a hot afternoon,","this gentle evening breeze","feels so refreshing!"],["breeze","freeze","trees"],
  ["There is a lovely <b>cool breeze</b> blowing from the river.","Outdoor dining is best on <b>breezy evenings</b>."],["breeze","patio","mild"]),

 Q("turn_on_table_lantern","patiotable","rs_patio","reach","rs_patio_lantern","lit","Turn on the warm table lantern","Bật chiếc đèn lồng ấm áp trên bàn hiên",
  "I'm switching on the little amber lantern on our patio table as dusk falls.",
  "Tôi đang bật chiếc đèn lồng ánh vàng nhỏ xinh trên bàn sân hiên khi hoàng hôn buông xuống.",
  ["switching","lantern","patio","dusk"],"<b>as dusk / evening falls</b> = khi hoàng hôn / màn đêm buông xuống.",
  ["I'm switching on","the little amber lantern","as dusk falls."],["lantern","pattern","modern"],
  ["Every <b>patio table</b> has a solar candle lantern.","The warm glow makes the table look <b>cozy</b>."],["lantern","patio","table"]),

 Q("admire_city_lights_view","patiotable","rs_patio","point","rs_patio_view","admired","Admire the twinkling street lights","Ngắm ánh đèn phố phường lung linh",
  "From this corner patio seat, we have a wonderful view of the twinkling city lights.",
  "Từ chỗ ngồi góc sân hiên này, chúng ta có tầm nhìn tuyệt đẹp ra ánh đèn thành phố lung linh.",
  ["corner","patio","wonderful","view"],"Collocation: <b>have a wonderful / clear view of...</b> (có tầm nhìn tuyệt đẹp ra...).",
  ["From this patio seat,","we have a wonderful view","of the city lights."],["view","few","new"],
  ["We asked for a table with <b>a nice view</b>.","The city lights sparkle under the <b>clear night sky</b>."],["patio","seat","window"]),

 Q("check_pleasant_night_weather","patiotable","rs_patio","read","rs_patio_weather","checked","Chat about the mild night weather","Trò chuyện về thời tiết buổi tối ôn hoà",
  "The humidity dropped tonight—it's twenty-four degrees and dry, ideal for sitting outside!",
  "Độ ẩm tối nay đã giảm xuống—trời 24 độ và khô ráo, cực kỳ lý tưởng để ngồi ngoài trời!",
  ["humidity","degrees","dry","outside"],"Từ vựng thời tiết thực tế: <b>humidity</b> (độ ẩm), <b>dry and mild</b> (khô ráo, dịu mát).",
  ["The humidity dropped tonight—","it's twenty-four degrees,","ideal for sitting outside!"],["mild","wild","child"],
  ["Low <b>humidity</b> makes the evening feel much cooler.","What <b>pleasant weather</b> for dinner!"],["mild","breeze","patio"]),

 // ==================== 18. DAILY SPECIALS CHALKBOARD (5 new) ====================
 Q("read_daily_chalkboard","specialsboard","rs_board","read","rs_read_chalkboard","read","Read the handwritten specials board","Đọc bảng phấn viết tay món ngon hôm nay",
  "The chef wrote three seasonal dishes on the chalkboard using colorful chalk.",
  "Đầu bếp đã viết ba món ăn theo mùa lên tấm bảng đen bằng phấn nhiều màu sắc.",
  ["chef","seasonal","chalkboard","colorful"],"<b>seasonal dishes</b> = các món ăn chế biến theo mùa (nguyên liệu tươi nhất trong mùa).",
  ["The chef wrote","three seasonal dishes","on the chalkboard."],["chalkboard","cardboard","cupboard"],
  ["Always check the <b>specials chalkboard</b> before ordering.","I love trying <b>seasonal dishes</b>."],["chalkboard","special","chef"]),

 Q("check_lunch_combo_price","specialsboard","rs_board","point","rs_combo_deal","checked","Check the dinner set combo deal","Xem giá suất ăn combo tiết kiệm",
  "The dinner combo includes beef noodles, a green salad, and iced tea for a great price!",
  "Suất combo bữa tối bao gồm phở bò, một đĩa salad xanh và trà đá với mức giá rất hợp lý!",
  ["combo","includes","salad","price"],"Động từ <b>include</b> = bao gồm; <b>for a great / reasonable price</b> = với mức giá rất tốt.",
  ["The dinner combo includes","beef noodles, salad, and tea","for a great price!"],["combo","jumbo","bistro"],
  ["Does the <b>combo meal</b> come with a drink?","Ordering a set <b>combo</b> saves money."],["combo","noodles","salad"]),

 Q("ask_about_soup_of_the_day","specialsboard","rs_board","point","rs_soup_of_day","asked","Ask what the soup of the day is","Hỏi món súp đặc biệt trong ngày",
  "Excuse me, what is the homemade soup of the day listed on the board?",
  "Xin lỗi, món súp nhà làm trong ngày ghi trên bảng hôm nay là súp gì vậy ạ?",
  ["what","homemade","soup","board"],"Cụm cố định trong nhà hàng: <b>soup of the day</b> (món súp đặc biệt theo ngày) và <b>homemade</b> (nhà làm).",
  ["Excuse me, what is","the homemade soup of the day","on the board?"],["homemade","handmade","homegrown"],
  ["Today's <b>soup of the day</b> is roasted pumpkin.","Everything in this bistro is <b>freshly homemade</b>."],["soup","chalkboard","special"]),

 Q("pick_seasonal_weather_drink","specialsboard","rs_board","point","rs_weather_drink","picked","Check the weather-special drink","Xem món đồ uống gợi ý theo thời tiết",
  "On cool evenings, the board recommends hot lemongrass ginger tea to boost immunity!",
  "Vào những buổi tối trời mát, bảng thực đơn gợi ý trà gừng sả nóng giúp tăng sức đề kháng!",
  ["cool","evenings","recommends","immunity"],"Từ vựng sức khoẻ: <b>boost immunity / the immune system</b> (tăng cường sức đề kháng).",
  ["On cool evenings,","the board recommends","hot ginger tea to boost immunity!"],["boost","boot","boat"],
  ["Warm herbal drinks help <b>boost your immunity</b>.","That sounds perfect for <b>tonight's cool weather</b>."],["herbal_tea","ginger","recommend"]),

 Q("read_farm_to_table_note","specialsboard","rs_board","read","rs_local_farm","read","Read the local organic farm note","Đọc thông tin rau sạch từ nông trại địa phương",
  "All vegetables and herbs here are delivered fresh every morning from local organic farms.",
  "Tất cả rau củ và rau thơm ở đây đều được giao tươi mới mỗi sáng từ các nông trại hữu cơ địa phương.",
  ["vegetables","herbs","fresh","organic"],"<b>local organic farms</b> = các nông trại hữu cơ địa phương (đảm bảo an toàn thực phẩm).",
  ["All vegetables and herbs","are delivered fresh","from local organic farms."],["fresh","free","first"],
  ["We support <b>local organic farms</b>.","Fresh ingredients make every dish more <b>nutritious</b>."],["ingredient","herb","nutritious"]),

 // ==================== 19. TAKEAWAY COUNTER (5 new) ====================
 Q("ask_for_takeaway_container","takeoutcounter","rs_takeout","point","rs_ask_box","asked","Ask for an eco-friendly takeaway box","Xin hộp giấy sinh học đựng đồ mang về",
  "Excuse me, could I get a biodegradable takeaway container for my extra food?",
  "Xin lỗi, cho tôi xin một chiếc hộp mang về tự phân huỷ sinh học để đựng phần thức ăn còn dư nhé?",
  ["biodegradable","takeaway","container","food"],"<b>takeaway container / to-go box</b> = hộp đựng đồ ăn mang về.",
  ["Could I get","a takeaway container","for my extra food?"],["container","entertainer","commander"],
  ["We use paper <b>takeaway containers</b> instead of plastic.","Can I get this packed <b>to go</b>?"],["takeaway","container"]),

 Q("pack_leftover_noodles","takeoutcounter","rs_takeout","reach","rs_pack_leftovers","packed","Pack the leftover food neatly","Đóng gói phần đồ ăn còn lại gọn gàng",
  "The portion was generous, so I'm packing the leftovers to enjoy for lunch tomorrow.",
  "Khẩu phần ăn rất đầy đặn nên tôi đang đóng gói phần còn lại để trưa mai ăn tiếp, tránh lãng phí.",
  ["portion","generous","packing","leftovers"],"<b>leftovers</b> (luôn số nhiều) = đồ ăn còn dư sau bữa ăn; <b>generous portion</b> = khẩu phần đầy đặn.",
  ["The portion was generous,","so I'm packing the leftovers","for lunch tomorrow."],["generous","general","dangerous"],
  ["Never waste good food—<b>pack the leftovers</b>!","The restaurant serves very <b>generous portions</b>."],["takeaway","container","noodles"]),

 Q("put_sauce_packets_in_bag","takeoutcounter","rs_takeout","reach","rs_bag_sauce","added","Add extra lime and chili packets","Lấy thêm gói sốt ớt và chanh nhỏ mang về",
  "I'm putting two sealed packets of chili sauce and a pair of bamboo chopsticks into the bag.",
  "Tôi đang bỏ hai gói tương ớt đóng kín và một đôi đũa tre vào trong túi mang về.",
  ["putting","packets","chili","chopsticks"],"<b>a pair of chopsticks</b> = một đôi đũa.",
  ["I'm putting two packets","of chili sauce","and chopsticks into the bag."],["bag","back","tag"],
  ["Do you need <b>disposable chopsticks</b> in your takeaway bag?","The lid is sealed tightly so the <b>broth won't spill</b>."],["chopsticks","takeaway","spicy"]),

 Q("verify_takeout_order_name","takeoutcounter","rs_takeout","read","rs_check_order_tag","verified","Check the name on the takeaway receipt","Kiểm tra tên và món trên phiếu mang về",
  "Let me check the printed label on the bag to make sure nothing is missing.",
  "Để tôi kiểm tra nhãn in trên túi xem đã đủ các món chưa, đảm bảo không bị sót món nào.",
  ["check","printed","label","missing"],"<b>make sure (that) nothing is missing</b> = kiểm tra chắc chắn không bị thiếu thứ gì.",
  ["Let me check the label","on the takeaway bag","to make sure nothing is missing."],["label","table","cable"],
  ["Always <b>check your takeaway order</b> before leaving.","Everything on the <b>receipt</b> is packed inside."],["receipt","takeaway"]),

 Q("carry_reusable_food_bag","takeoutcounter","rs_takeout","reach","rs_eco_bag","carried","Place the container in my reusable bag","Đặt hộp thức ăn vào túi vải tái sử dụng",
  "I brought my own reusable cloth bag to carry the warm takeaway boxes home safely.",
  "Tôi có mang theo túi vải tái sử dụng của mình để xách các hộp đồ ăn ấm về nhà an toàn.",
  ["brought","reusable","cloth","safely"],"<b>reusable cloth bag</b> = túi vải tái sử dụng nhiều lần (thân thiện môi trường).",
  ["I brought my own","reusable cloth bag","to carry the boxes home."],["safely","solely","softly"],
  ["Bringing a <b>reusable bag</b> reduces plastic waste.","Hold the bag flat so the <b>container</b> stays upright."],["takeaway","container"]),

 // ==================== 20. GUEST REVIEW STAND (5 new) ====================
 Q("give_five_star_rating","feedbackbox","rs_feedback","point","rs_rate_five_stars","rated","Tap five stars on the review tablet","Bấm chọn 5 sao trên bảng đánh giá",
  "I'm giving Saigon Bistro a five-star rating for its delicious food and spotless hygiene!",
  "Tôi đang chấm 5 sao cho Saigon Bistro vì đồ ăn ngon miệng và không gian vệ sinh sạch bóng!",
  ["giving","five-star","delicious","hygiene"],"<b>give [someone] a five-star rating</b> = đánh giá 5 sao.",
  ["I'm giving Saigon Bistro","a five-star rating","for its delicious food!"],["rating","waiting","skating"],
  ["The bistro has a <b>five-star rating</b> online.","Cleanliness and <b>hygiene</b> deserve five stars."],["review","delicious","hygiene"]),

 Q("write_kind_review_note","feedbackbox","rs_feedback","reach","rs_write_comment","written","Write a kind note in the guestbook","Viết lời khen vào sổ cảm nhận thực khách",
  "I'm writing a short thank-you note in the guestbook to praise the friendly waiter and chef.",
  "Tôi đang viết vài dòng cảm ơn ngắn vào sổ lưu niệm để khen ngợi anh phục vụ và đầu bếp thân thiện.",
  ["writing","thank-you","guestbook","friendly"],"<b>praise someone for...</b> = khen ngợi ai vì điều gì.",
  ["I'm writing a thank-you note","in the guestbook","to praise the friendly staff."],["friendly","freely","freshly"],
  ["Your kind <b>review</b> means a lot to our team.","We loved the <b>warm hospitality</b> here."],["review","hospitality","waiter"]),

 Q("thank_staff_for_hospitality","feedbackbox","rs_feedback","point","rs_thank_host","thanked","Thank the team for their warm hospitality","Cảm ơn nhân viên vì sự phục vụ chu đáo",
  "Thank you for your wonderful hospitality tonight—we'll definitely come back with friends!",
  "Cảm ơn sự đón tiếp nồng hậu và chu đáo của nhà hàng tối nay—chắc chắn chúng tôi sẽ quay lại cùng bạn bè!",
  ["wonderful","hospitality","definitely","friends"],"Danh từ <b>hospitality</b> (/ˌhɒs.pɪˈtæl.ə.ti/) = lòng hiếu khách, sự phục vụ tận tình.",
  ["Thank you for","your wonderful hospitality—","we'll definitely come back!"],["hospitality","hospital","possibility"],
  ["Vietnamese restaurants are famous for their <b>warm hospitality</b>.","We'll <b>definitely recommend</b> this place!"],["hospitality","recommend","restaurant"]),

 Q("take_a_peppermint_candy","feedbackbox","rs_feedback","reach","rs_take_mint","taken","Take a refreshing after-dinner mint","Lấy một viên kẹo bạc hà thơm miệng sau bữa ăn",
  "I'm taking a complimentary peppermint candy from the small glass bowl by the exit.",
  "Tôi đang lấy một viên kẹo bạc hà miễn phí từ chiếc bát thuỷ tinh nhỏ đặt cạnh lối ra.",
  ["taking","complimentary","peppermint","exit"],"Tính từ <b>complimentary</b> = miễn phí (nhà hàng/khách sạn tặng kèm chu đáo cho khách).",
  ["I'm taking","a complimentary peppermint candy","by the exit."],["mint","hint","print"],
  ["Enjoy a <b>complimentary mint</b> after your meal.","Peppermint leaves your breath <b>cool and fresh</b>."],["hospitality","delicious"]),

 Q("pick_up_bistro_card","feedbackbox","rs_feedback","read","rs_business_card","taken","Take a bistro card for delivery orders","Lấy danh thiếp nhà hàng để đặt giao hàng ngày mưa",
  "I'm taking a bistro card with the phone number so I can order hot soup on rainy days!",
  "Tôi đang lấy một tấm danh thiếp có số điện thoại của quán để hôm nào trời mưa có thể đặt súp nóng giao tận nơi!",
  ["taking","card","phone","rainy"],"Liên hệ thời tiết đời thường: giữ số điện thoại quán để đặt món nóng vào những ngày mưa (<b>on rainy days</b>).",
  ["I'm taking a bistro card","so I can order hot soup","on rainy days!"],["rainy","sunny","windy"],
  ["Do you offer home delivery <b>on rainy days</b>?","Call the number on the card to <b>book a table</b>."],["reservation","takeaway","drizzle"])
];

// ===== 2 NPCs: Waiter & Chef — Replies for ALL 104 actions =====
const NPCS={
 waiter:{name:"Waiter",vi:"Nhân viên phục vụ",avatar:"🤵"},
 chef:{name:"Chef",vi:"Đầu bếp",avatar:"👨‍🍳"}
};

const LINES={
 // 1. Host stand
 ask_for_a_table:["waiter","Welcome to Saigon Bistro! Right this way — your window table for two is ready.","Chào mừng đến Saigon Bistro! Mời đi lối này — bàn hai người cạnh cửa sổ đã sẵn sàng ạ."],
 check_table_reservation:["waiter","Good evening, Minh! We have your reserved booth right by the window.","Chào buổi tối bạn Minh! Bàn đặt trước của bạn ở ngay cạnh cửa sổ đây ạ."],
 ask_waiting_time:["waiter","No wait at all tonight! I can seat you at a quiet booth right now.","Tối nay không phải chờ chút nào đâu ạ! Tôi có thể mời bạn vào bàn yên tĩnh ngay bây giờ."],
 check_in_with_host:["waiter","Come on in out of the breeze! Our dining room is nice and warm.","Mời bạn vào trong cho đỡ gió! Phòng ăn của quán ấm áp và dễ chịu lắm ạ."],
 choose_indoor_or_patio:["waiter","Both our cozy indoor booths and our breezy patio tables are open tonight!","Cả bàn đệm ấm cúng bên trong lẫn bàn sân hiên thoáng mát tối nay đều sẵn sàng phục vụ bạn!"],
 // 2. Dining table
 sit_at_dining_table:["waiter","Make yourselves comfortable! Here is today's menu.","Mời hai bạn ngồi tự nhiên nhé! Đây là thực đơn hôm nay ạ."],
 put_napkin_on_lap:["waiter","Here is some chilled water while you get settled at the table.","Gửi bàn mình nước mát trong lúc hai bạn ổn định chỗ ngồi nhé."],
 pull_out_dining_chair:["waiter","How polite! Let me know if the chair height feels comfortable for you.","Lịch thiệp quá! Nếu cần điều chỉnh ghế ngồi cho thoải mái hơn bạn cứ báo tôi nhé."],
 wipe_table_with_tissue:["waiter","Allow me to bring a fresh sanitizing cloth to make your table spotless!","Để tôi mang khăn khử khuẩn sạch ra lau lại mặt bàn cho thật khô ráo nhé!"],
 arrange_chopsticks_neatly:["waiter","Our bamboo chopsticks are sterilized every morning for your hygiene.","Đũa tre của quán đều được tiệt trùng mỗi sáng để đảm bảo vệ sinh tuyệt đối ạ."],
 // 3. Menu stand
 check_the_menu:["waiter","Take your time! Let me know when you're ready to order.","Bạn cứ xem thong thả nhé! Khi nào sẵn sàng gọi món hãy báo tôi."],
 ask_recommendation:["waiter","Our signature beef noodle soup and caramel pudding are the house specials today!","Món phở/mì bò đặc trưng và bánh flan caramel là món đặc sản hôm nay đấy ạ!"],
 ask_about_food_allergies:["waiter","Thank you for letting me know! Our beef broth and soy dipping sauce are 100% peanut-free.","Cảm ơn bạn đã báo trước! Nước dùng bò và nước chấm của quán hoàn toàn không chứa đậu phộng ạ."],
 check_vegetarian_options:["waiter","Our vegetarian mushroom noodle soup and fresh organic salad are super popular!","Món phở nấm chay và salad rau hữu cơ tươi của quán được khách yêu thích lắm đấy ạ!"],
 read_dish_ingredients:["chef","We use only fresh rice noodles and herbs picked from local farms this morning!","Chúng tôi chỉ dùng bánh phở tươi và rau thơm vừa hái từ nông trại địa phương sáng nay thôi!"],
 // 4. Waiter
 order_beef_noodles:["waiter","Great choice! One steaming bowl of beef noodle soup coming right up!","Lựa chọn tuyệt vời! Một tô mì bò nóng hổi sẽ có ngay đây ạ!"],
 ask_not_too_spicy:["waiter","No problem at all — I'll ask the chef to make the broth mild for you.","Dạ được ngay — tôi sẽ báo đầu bếp nấu nước dùng dịu, ít cay cho bạn."],
 order_iced_tea:["waiter","One fresh glass of lemon iced tea — right away!","Một ly trà chanh đá tươi mát — có liền ngay ạ!"],
 ask_for_napkins:["waiter","Of course! Here are some extra clean napkins for your table.","Dạ có ngay! Gửi bàn mình thêm khăn giấy sạch đây ạ."],
 ask_for_soup_spoon:["waiter","Certainly! Here is a warm, clean ceramic spoon for your broth.","Dạ vâng! Gửi bạn một chiếc muỗng sứ sạch để dùng nước súp nhé."],
 order_fresh_side_herbs:["waiter","Right away! I'll bring a crisp plate of Thai basil, cilantro, and bean sprouts.","Có ngay ạ! Tôi sẽ mang ra một đĩa rau quế, ngò rí và giá đỗ tươi giòn cho bàn mình."],
 // 5. Kitchen pass
 watch_the_chef:["chef","Simmering the beef broth for six hours is our secret!","Ninh nước dùng bò suốt 6 tiếng là bí quyết của nhà hàng đấy!"],
 thank_the_chef:["chef","Thank you so much! Hearing that makes my whole evening!","Cảm ơn bạn rất nhiều! Nghe câu đó là tôi vui cả buổi tối luôn!"],
 admire_fresh_garnish:["chef","A sprinkle of green scallions and fresh herbs makes every bowl shine!","Một chút hành lá xanh và rau thơm tươi sẽ làm mỗi tô phở dậy hương sắc ngay!"],
 ask_chef_about_broth:["chef","We char fresh ginger and shallots before slow-simmering the marrow bones!","Chúng tôi nướng thơm gừng tươi và hành tím trước khi ninh nhỏ lửa với xương ống đấy!"],
 smell_simmering_spices:["chef","That's roasted star anise, cinnamon, and ginger—it's wonderful for your digestion!","Đó là hương hoa hồi, quế và gừng nướng—rất tốt cho tiêu hoá và làm ấm bụng đấy!"],
 // 6. Water pitcher
 pour_drinking_water:["waiter","Our filtered water is infused with a hint of mint to keep you refreshed.","Nước lọc của quán có ngâm thêm chút lá bạc hà nhẹ giúp bạn sảng khoái đấy ạ."],
 drink_iced_tea:["waiter","Glad you're enjoying the lemon iced tea! We brew it with fresh organic lemons.","Mừng là bạn thích món trà chanh đá! Quán pha bằng chanh vàng hữu cơ tươi đấy ạ."],
 refill_friend_water_glass:["waiter","Let me bring a fresh pitcher of cool water for your table whenever you need!","Cứ khi nào cần thêm nước mát, để tôi mang bình mới ra cho hai bạn nhé!"],
 ask_for_warm_water_throat:["waiter","Here is a soothing glass of warm water—I can also add a slice of fresh ginger for your throat!","Gửi bạn ly nước ấm dịu cổ họng—tôi có thể thêm một lát gừng tươi giúp bạn ấm họng hơn nhé!"],
 ask_for_less_ice:["waiter","Got it—very little ice so your lemon tea stays cool without hurting your throat!","Dạ rõ rồi ạ—rất ít đá để ly trà chanh vừa mát nhẹ mà không làm lạnh cổ họng bạn!"],
 // 7. Condiments
 squeeze_some_lime:["chef","Fresh lime really brings out the aroma of the herbs!","Chanh tươi sẽ làm dậy lên mùi thơm của các loại rau gia vị đấy!"],
 add_black_pepper:["chef","Freshly ground black pepper adds a lovely warm kick to the broth!","Tiêu đen xay mới sẽ thêm vị cay ấm dịu rất hợp với nước dùng!"],
 add_pickled_garlic:["chef","We pickle that crispy garlic in-house with rice vinegar—it's great for immunity!","Món tỏi ngâm giòn đó quán tự làm bằng giấm gạo—rất tốt để tăng sức đề kháng đấy!"],
 drizzle_mild_chili_sauce:["waiter","Our homemade sweet chili sauce is mild and fragrant, not overwhelming at all.","Tương ớt ngọt nhà làm của quán có vị dịu và thơm, không bị cay gắt chút nào đâu ạ."],
 pass_the_fish_sauce:["waiter","That's traditional first-press fish sauce from Phu Quoc—just a few drops add deep flavor!","Đó là nước mắm nhĩ truyền thống Phú Quốc—chỉ vài giọt thôi là dậy vị đậm đà lắm ạ!"],
 // 8. Noodle bowl
 taste_the_broth:["chef","Glad you like the broth! Enjoy while it's piping hot.","Mừng là bạn hợp vị nước dùng! Chúc bạn ăn ngon khi còn nóng hổi nhé."],
 eat_main_course:["chef","Bon appétit! Nothing beats a hearty bowl of beef noodles.","Chúc ngon miệng nhé! Không gì tuyệt bằng một tô phở bò đầy đặn ấm bụng."],
 blow_on_hot_noodles:["waiter","Careful, the ceramic bowls retain heat very well! Take your time.","Cẩn thận nhé, tô sứ giữ nhiệt lâu lắm! Bạn cứ thổi nhẹ và thưởng thức thong thả ạ."],
 praise_tender_beef:["chef","Thank you! We slice the beef paper-thin and ladle boiling broth right over it!","Cảm ơn bạn! Chúng tôi thái thịt bò mỏng tang rồi chan nước dùng đang sôi lên ngay để giữ độ mềm ngọt!"],
 finish_warm_soup:["chef","Seeing an empty bowl is the best compliment a chef could ever ask for!","Nhìn thấy tô phở được thưởng thức hết sạch chính là lời khen tuyệt nhất cho người đầu bếp!"],
 // 9. Dessert display
 order_sweet_dessert:["waiter","One homemade caramel pudding to share — excellent choice!","Một phần bánh flan nhà làm để ăn chung — lựa chọn tuyệt hảo ạ!"],
 eat_the_dessert:["chef","We bake our caramel pudding in a water bath every morning so it stays silky smooth!","Chúng tôi hấp cách thuỷ bánh flan mỗi sáng để bánh luôn mềm mịn như lụa đấy!"],
 choose_fresh_fruit_tart:["chef","Those ripe strawberries arrived from Da Lat this morning—sweet and full of vitamins!","Những quả dâu tây chín mọng đó vừa chuyển từ Đà Lạt về sáng nay—ngọt thanh và giàu vitamin lắm!"],
 ask_low_sugar_dessert:["waiter","Our chia seed fruit cup and green tea flan are made with 50% less sugar!","Món chén trái cây hạt chia và bánh flan trà xanh của quán giảm 50% lượng đường, rất lành mạnh ạ!"],
 share_dessert_with_friend:["waiter","Here are two chilled dessert spoons for you two to share!","Gửi hai bạn hai chiếc muỗng nhỏ mát lạnh để cùng thưởng thức bánh nhé!"],
 // 10. Bill desk
 ask_for_the_bill:["waiter","Certainly! Here is your bill whenever you're ready.","Dạ vâng! Gửi bạn hoá đơn tại quầy nhé."],
 split_the_bill:["waiter","Sure thing! I can split the payment equally onto two cards.","Dạ được chứ! Tôi có thể chia đều thanh toán cho hai người ạ."],
 pay_restaurant_bill:["waiter","Thank you very much for the tip! Have a wonderful evening!","Cảm ơn bạn rất nhiều vì tiền tip! Chúc bạn một buổi tối tuyệt vời!"],
 check_itemized_receipt:["waiter","Everything is clearly itemized there, and your combo discount has been applied!","Mọi món đều được liệt kê rõ ràng trên biên lai, và ưu đãi combo cũng đã được trừ sẵn rồi ạ!"],
 ask_for_wifi_password:["waiter","Our guest Wi-Fi is 'SaigonBistro5G' and the password is 'freshnoodles'!","Wi-Fi cho khách là 'SaigonBistro5G' và mật khẩu là 'freshnoodles' bạn nhé!"],
 // 11. Salad bar
 pick_up_salad_plate:["waiter","Help yourself to as many fresh greens and toppings as you like at the salad bar!","Mời bạn tự nhiên chọn thật nhiều rau tươi và đồ ăn kèm tuỳ thích ở quầy salad nhé!"],
 toss_crispy_green_salad:["chef","We wash our hydroponic lettuce in chilled filtered water so every leaf stays super crispy!","Rau xà lách thuỷ canh được rửa bằng nước lọc ướp mát nên lá nào cũng giòn rụm!"],
 add_cherry_tomatoes:["chef","Those sweet cherry tomatoes add a burst of freshness to your salad bowl!","Những quả cà chua bi ngọt dịu đó sẽ làm đĩa salad của bạn tươi mát hơn hẳn!"],
 drizzle_olive_oil_dressing:["chef","Our roasted sesame and extra-virgin olive oil dressing is light and heart-healthy!","Sốt mè rang pha dầu ô-liu nguyên chất của quán vừa thanh nhẹ vừa rất tốt cho tim mạch!"],
 enjoy_nutritious_salad:["waiter","Starting with fresh fiber and greens is a wonderful way to balance your meal!","Khai vị bằng rau xanh giàu chất xơ là cách tuyệt vời để cân bằng dinh dưỡng cho bữa ăn đấy ạ!"],
 // 12. Hot soup station
 lift_soup_kettle_lid:["chef","Mind the hot steam! Today's kettle has creamy pumpkin and herbal mushroom soup.","Cẩn thận hơi nước nóng nhé! Nồi súp hôm nay có súp bí đỏ kem mịn và súp nấm thảo mộc."],
 smell_savory_herb_aroma:["chef","There's nothing like a fragrant bowl of hot soup when the evening weather is cool!","Không gì sánh bằng một chén súp nóng thơm lừng khi thời tiết buổi tối se mát thế này!"],
 ladle_warm_pumpkin_soup:["chef","Take a generous scoop—we blended roasted squash with a touch of nutmeg!","Bạn cứ múc một muôi thật đầy nhé—chúng tôi xay bí đỏ nướng cùng một chút nhục đậu khấu thơm dịu đấy!"],
 add_fresh_ginger_slices:["chef","Fresh ginger strips warm your body right up and keep colds away!","Vài sợi gừng tươi sẽ làm ấm cơ thể ngay lập tức và giúp phòng cảm lạnh rất tốt!"],
 check_soup_temperature:["waiter","We keep the soup kettle at 75 degrees Celsius so every bowl is served piping hot.","Quán luôn duy trì nồi súp ở mức 75 độ C để mỗi chén múc ra đều nóng hổi thơm ngon ạ."],
 // 13. Juice & tea bar
 browse_healthy_drinks:["waiter","All our fruit juices are cold-pressed without artificial syrups or preservatives!","Tất cả nước ép trái cây của quán đều là ép lạnh nguyên chất, không dùng si-rô nhân tạo hay chất bảo quản!"],
 order_fresh_orange_juice:["waiter","One glass of 100% freshly squeezed orange juice coming right up!","Một ly nước cam vắt tươi nguyên chất 100% có ngay đây ạ!"],
 choose_warm_ginger_tea:["waiter","Warm honey ginger tea is our best-seller on breezy or rainy evenings!","Trà gừng mật ong ấm là thức uống bán chạy nhất của quán vào những tối trời gió hay mưa đấy ạ!"],
 request_no_added_sugar:["waiter","Noted—zero added sugar, just the natural sweetness of fresh ripe fruit!","Dạ đã ghi nhận—không thêm đường, chỉ giữ vị ngọt tự nhiên của trái cây chín tươi thôi ạ!"],
 sip_tropical_mango_smoothie:["chef","We use sweet Cat Chu mangoes for that rich, velvety smoothie texture!","Chúng tôi dùng xoài Cát Chu chín ngọt để tạo độ sánh mịn tự nhiên cho ly sinh tố đấy!"],
 // 14. Coat & umbrella stand
 shake_off_wet_umbrella:["waiter","Let me take your umbrella—the drip tray at the bottom will catch the rainwater.","Để tôi đỡ chiếc ô giúp bạn—khay hứng nước bên dưới giá sẽ giữ sàn nhà luôn khô ráo ạ."],
 hang_up_light_raincoat:["waiter","Your jacket will stay dry and neat right here on the wooden coat stand.","Áo khoác của bạn treo trên giá gỗ ngay đây sẽ luôn khô ráo và phẳng phiu ạ."],
 check_evening_drizzle:["waiter","Yes, the evening shower just passed! It'll be a crisp, clear walk after dinner.","Vâng, cơn mưa rào buổi tối vừa tạnh rồi! Lát nữa ăn xong đi dạo sẽ mát và quang đãng lắm."],
 hang_warm_scarf:["waiter","Smart idea wearing a scarf—the evening breeze can be chilly on your throat!","Quàng khăn là chuẩn lắm ạ—gió buổi tối đôi khi hơi lạnh dễ làm rát cổ họng!"],
 retrieve_umbrella_before_leaving:["waiter","Here is your umbrella and jacket—thank you so much for dining with us tonight!","Gửi lại bạn chiếc ô và áo khoác—cảm ơn bạn rất nhiều vì đã dùng bữa tại quán tối nay!"],
 // 15. Handwashing sink
 turn_on_warm_faucet:["waiter","The warm water tap heats up in just two seconds—enjoy a comfortable wash!","Vòi nước ấm chỉ mất hai giây là ấm ngay—mời bạn rửa tay thật dễ chịu nhé!"],
 wash_hands_with_soap:["chef","Clean hands are the first rule of food safety and good health!","Đôi tay sạch sẽ chính là nguyên tắc đầu tiên của an toàn thực phẩm và sức khoẻ tốt!"],
 rinse_hands_thoroughly:["waiter","Our sensor faucet makes rinsing easy and hygienic without touching the handle.","Vòi nước cảm ứng của quán giúp bạn tráng tay sạch và hợp vệ sinh mà không cần chạm tay vặn."],
 dry_hands_with_clean_towel:["waiter","Soft recycled paper towels are right there in the wall dispenser.","Khăn giấy mềm tái chế có sẵn ngay trong hộp treo tường bên cạnh đó ạ."],
 use_herbal_hand_sanitizer:["waiter","That sanitizer has natural aloe vera and lemongrass oil so it won't dry your skin!","Gel sát khuẩn đó có tinh chất lô hội và sả tự nhiên nên không làm khô da tay đâu ạ!"],
 // 16. Acoustic music stage
 listen_to_acoustic_guitar:["waiter","Our guitarist plays acoustic melodies every evening from seven to nine.","Nghệ sĩ guitar của quán biểu diễn các giai điệu mộc mỗi tối từ 7 giờ đến 9 giờ đấy ạ."],
 applaud_the_musician:["chef","Even from the kitchen, hearing the live guitar music makes cooking a joy!","Ngay cả khi đứng trong bếp, nghe tiếng đàn guitar mộc cũng làm việc nấu nướng vui hơn hẳn!"],
 request_a_relaxing_song:["waiter","I'll pass your song request to our guitarist right away—he loves classic ballads!","Tôi sẽ chuyển lời yêu cầu bài hát tới nghệ sĩ guitar ngay—anh ấy thích đàn nhạc ballad cổ điển lắm!"],
 comment_on_pleasant_volume:["waiter","Thank you! We tune the sound system carefully so guests can talk effortlessly.","Cảm ơn bạn! Quán luôn chỉnh âm thanh vừa phải để thực khách trò chuyện thoải mái nhất."],
 take_photo_of_music_corner:["waiter","Would you like me to take a photo of both of you with the stage lights behind you?","Hai bạn có muốn tôi chụp giúp một tấm hình chung với ánh đèn sân khấu phía sau không ạ?"],
 // 17. Patio table
 step_out_to_patio:["waiter","The garden patio is so peaceful at this hour—feel free to step out and look around!","Sân hiên vườn cây giờ này yên bình lắm—mời bạn cứ tự nhiên bước ra ngắm cảnh nhé!"],
 enjoy_cool_evening_breeze:["waiter","Isn't the breeze lovely? It cooled down nicely after the sunny afternoon.","Làn gió mát dễ chịu thật phải không ạ? Sau buổi chiều nắng, trời đã dịu mát hẳn."],
 turn_on_table_lantern:["waiter","Those warm amber lanterns make patio dining feel magical at night!","Những chiếc đèn lồng ánh vàng ấm đó làm bàn ăn ngoài sân hiên buổi tối lung linh lắm ạ!"],
 admire_city_lights_view:["waiter","That corner patio table has the best view of the boulevard lights!","Chiếc bàn góc sân hiên đó có tầm nhìn ngắm đèn đại lộ đẹp nhất quán đấy ạ!"],
 check_pleasant_night_weather:["chef","A dry, mild evening like tonight is perfect for enjoying hot noodles and cool tea!","Một buổi tối khô ráo, dịu mát như tối nay thật hoàn hảo để thưởng thức phở nóng và trà mát!"],
 // 18. Daily specials chalkboard
 read_daily_chalkboard:["chef","I handwrite the chalkboard every afternoon with our freshest seasonal dishes!","Chiều nào tôi cũng tự tay viết bảng phấn các món ăn theo mùa tươi ngon nhất của quán!"],
 check_lunch_combo_price:["waiter","Our set combo gives you a full three-course meal with twenty percent savings!","Suất combo của quán mang đến cho bạn bữa ăn trọn vẹn 3 món mà tiết kiệm tới 20% đấy ạ!"],
 ask_about_soup_of_the_day:["chef","Today's soup of the day is velvety roasted pumpkin with a hint of ginger!","Món súp đặc biệt hôm nay là súp bí đỏ nướng sánh mịn điểm chút gừng tươi ấm nồng!"],
 pick_seasonal_weather_drink:["waiter","Great eye! The hot lemongrass ginger tea is our top weather recommendation tonight.","Bạn tinh mắt lắm! Trà gừng sả nóng chính là thức uống gợi ý hàng đầu cho thời tiết tối nay ạ."],
 read_farm_to_table_note:["chef","Farm-to-table freshness is our promise—every herb is chemical-free and crisp!","Tươi sạch từ nông trại đến bàn ăn là cam kết của chúng tôi—mọi cọng rau đều sạch và giòn tươi!"],
 // 19. Takeaway counter
 ask_for_takeaway_container:["waiter","Of course! Here is a leak-proof, eco-friendly paper bowl for your leftovers.","Dạ có ngay! Gửi bạn chiếc hộp giấy sinh học chống tràn để đựng đồ ăn mang về nhé."],
 pack_leftover_noodles:["waiter","I can pack the broth and noodles separately so they stay fresh for tomorrow's lunch!","Tôi có thể đóng gói riêng nước dùng và bánh phở để trưa mai bạn ăn vẫn tươi ngon nhé!"],
 put_sauce_packets_in_bag:["waiter","I've tucked extra lime wedges, chili sauce, and napkins into your takeaway bag.","Tôi đã xếp thêm chanh tươi, gói tương ớt và khăn giấy vào trong túi mang về cho bạn rồi ạ."],
 verify_takeout_order_name:["waiter","Everything is double-checked and labeled with your name and today's date!","Mọi món đều đã được kiểm tra kỹ hai lần và dán nhãn ghi rõ tên bạn cùng ngày hôm nay ạ!"],
 carry_reusable_food_bag:["waiter","Thank you for bringing a reusable bag! We love eco-conscious diners.","Cảm ơn bạn đã mang theo túi vải tái sử dụng! Nhà hàng rất trân trọng những thực khách sống xanh."],
 // 20. Guest review stand
 give_five_star_rating:["waiter","Wow, thank you so much for the five-star rating! You made our whole team smile!","Ôi, cảm ơn bạn rất nhiều vì đánh giá 5 sao! Bạn làm cả đội ngũ nhân viên quán vui lắm đấy ạ!"],
 write_kind_review_note:["chef","Thank you for your kind words in our guestbook—I'll share them with the kitchen crew!","Cảm ơn những lời nhận xét ấm áp của bạn trong sổ lưu niệm—tôi sẽ khoe ngay với cả đội bếp!"],
 thank_staff_for_hospitality:["waiter","It was truly our pleasure serving you tonight. Have a safe and pleasant evening!","Được phục vụ bạn tối nay là niềm vinh hạnh của chúng tôi. Chúc bạn buổi tối thượng lộ bình an!"],
 take_a_peppermint_candy:["waiter","Please take as many peppermint candies as you like—they're refreshing after noodle soup!","Mời bạn cứ tự nhiên lấy kẹo bạc hà nhé—ăn một viên sau bữa phở rất thơm mát đấy ạ!"],
 pick_up_bistro_card:["waiter","We deliver piping-hot noodles right to your door whenever it's raining outside!","Cứ hôm nào trời mưa ngại ra ngoài, bạn gọi số trên danh thiếp là quán giao phở nóng tận cửa ngay!"]
};

function reply(actionId){
 const x=LINES[actionId];
 if(x){
  const n=NPCS[x[0]]||NPCS.waiter;
  return{who:n.name,vi_who:n.vi,avatar:n.avatar,en:x[1],vi:x[2]};
 }
 return{who:NPCS.waiter.name,vi_who:NPCS.waiter.vi,avatar:NPCS.waiter.avatar,en:"Right away! Let me know if you need anything else for your table.",vi:"Dạ có ngay! Nếu bàn mình cần thêm gì bạn cứ báo tôi nhé."};
}

// ===== 6 Nhiệm vụ nhà hàng + 3 Thử thách =====
const WAITER_G={id:"waiter",name:"Waiter",avatar:"🤵",voice:"young_male"};
const CHEF_G={id:"chef",name:"Chef",avatar:"👨‍🍳",voice:"adult_male"};
const st=(n,icon,ten,tvi,actions,done,next,hen,hvi)=>({n,icon,title_en:ten,title_vi:tvi,say_en:ten+".",say_vi:tvi+".",actions,done,next:typeof next==="function"?next:()=>next,hint:{en:hen,vi:hvi}});
function story(log,hEn,hVi,parts,tEn,tVi){
 const did=(log||[]).map(x=>x.id),en=[],vi=[];
 parts.forEach(([id,e,v])=>{if(did.includes(id)){en.push(e);vi.push(v)}});
 const join=(a,and)=>a.length<=1?a.join(""):a.slice(0,-1).join(", ")+" "+and+" "+a[a.length-1];
 return{en:hEn+(en.length?" I "+join(en,"and")+".":""),vi:hVi+(vi.length?" Bạn đã "+join(vi,"và")+".":""),mom_en:tEn,mom_vi:tVi};
}

const MISSIONS=[
 {id:"rest_solo_dinner",title_en:"A warm bowl of noodles",title_vi:"Bữa tối ấm áp với mì bò",room:"restaurant",topic:"restaurant",urgency:"normal",giver:WAITER_G,
  desc_vi:"Xin bàn ăn, xem thực đơn, gọi món mì bò ít cay, thưởng thức bữa tối rồi thanh toán hoá đơn.",
  request:{en:"Welcome in! Let's get you seated for a warm bowl of beef noodles.",vi:"Chào mừng bạn! Hãy nhận bàn và thưởng thức một tô mì bò nóng hổi nhé."},
  steps:[
   st(1,"🪑","Ask for a table or sit down","Xin bàn hoặc ngồi vào bàn",["ask_for_a_table","sit_at_dining_table"],W=>W.rs_table==="booked"||W.sitting,"ask_for_a_table","Talk to the host stand or click the dining table.","Nhấn vào quầy lễ tân hoặc bàn ăn."),
   st(2,"📖","Check the menu","Xem thực đơn",["check_the_menu","ask_recommendation"],W=>W.rs_menu==="read"||W.rs_rec==="asked","check_the_menu","Click the menu on the table.","Nhấn vào quyển thực đơn trên bàn."),
   st(3,"🍜","Order the beef noodle soup","Gọi món mì/phở bò",["order_beef_noodles"],W=>W.rs_noodles==="served"||W.rs_noodles==="eaten","order_beef_noodles","Order from the waiter.","Nhấn vào nhân viên phục vụ để gọi mì bò."),
   st(4,"🌶️","Ask for it not too spicy","Dặn làm ít cay",["ask_not_too_spicy"],W=>W.rs_spicy==="mild","ask_not_too_spicy","Tell the waiter 'not too spicy'.","Dặn nhân viên làm vị dịu, ít cay."),
   st(5,"🥢","Eat the main course","Ăn món chính",["eat_main_course"],W=>W.rs_noodles==="eaten","eat_main_course","Click the steaming bowl on the table.","Nhấn vào tô mì nóng trên bàn để ăn."),
   st(6,"💳","Pay the bill","Thanh toán hoá đơn",["pay_restaurant_bill"],W=>W.rs_paid==="yes","pay_restaurant_bill","Pay at the cashier desk.","Thanh toán tại quầy thu ngân.")
  ],
  result:log=>story(log,"What a delicious noodle dinner!","Bữa tối mì bò thật ngon miệng!",
   [["ask_for_a_table","got a window table","nhận bàn cạnh cửa sổ"],["check_the_menu","checked the menu","xem thực đơn"],["order_beef_noodles","ordered beef noodle soup","gọi mì bò"],["ask_not_too_spicy","asked for it mild","dặn làm ít cay"],["eat_main_course","enjoyed the noodles","ăn hết tô mì"],["pay_restaurant_bill","paid the bill","thanh toán hoá đơn"]],
   "Come back and dine with us again soon!","Hẹn sớm gặp lại bạn tại nhà hàng nhé!")},

 {id:"rest_full_course",title_en:"Three-course treat",title_vi:"Bữa ăn trọn vẹn 3 món",room:"restaurant",topic:"restaurant",urgency:"normal",giver:CHEF_G,
  desc_vi:"Gọi mì bò và trà chanh đá, vắt thêm chanh tươi, ăn món chính rồi tráng miệng bằng bánh flan caramel.",
  request:{en:"Try our full meal today: beef noodles with fresh lime, lemon iced tea, and caramel pudding!",vi:"Hãy thử trọn bộ thực đơn hôm nay: mì bò vắt chanh tươi, trà chanh đá và bánh flan caramel nhé!"},
  steps:[
   st(1,"🍜","Order the beef noodle soup","Gọi món mì bò",["order_beef_noodles"],W=>W.rs_noodles==="served"||W.rs_noodles==="eaten","order_beef_noodles","Order the beef noodles from the waiter.","Gọi món mì bò với phục vụ."),
   st(2,"🍋","Squeeze some fresh lime","Vắt thêm chanh tươi",["squeeze_some_lime"],W=>W.rs_lime==="yes","squeeze_some_lime","Use the condiment tray on the table.","Nhấn vào khay gia vị để vắt chanh."),
   st(3,"🍹","Order lemon iced tea","Gọi trà chanh đá",["order_iced_tea"],W=>W.rs_tea==="served"||W.rs_tea==="drunk","order_iced_tea","Ask the waiter for lemon iced tea.","Gọi thêm ly trà chanh đá."),
   st(4,"🥢","Eat the main course","Ăn món chính",["eat_main_course"],W=>W.rs_noodles==="eaten","eat_main_course","Enjoy your hot noodles.","Thưởng thức tô mì nóng."),
   st(5,"🍮","Order & eat caramel pudding","Gọi & ăn bánh flan tráng miệng",["order_sweet_dessert","eat_the_dessert"],W=>W.rs_dessert==="eaten",W=>W.rs_dessert==="served"?"eat_the_dessert":"order_sweet_dessert","Order caramel pudding from the dessert display and eat it.","Gọi bánh flan ở tủ tráng miệng rồi thưởng thức.")
  ],
  result:log=>story(log,"A complete restaurant feast!","Một bữa ăn nhà hàng trọn vẹn!",
   [["order_beef_noodles","ordered beef noodles","gọi mì bò"],["squeeze_some_lime","squeezed fresh lime","vắt chanh tươi"],["order_iced_tea","had lemon iced tea","gọi trà chanh đá"],["eat_main_course","ate the main course","ăn món chính"],["eat_the_dessert","finished with caramel pudding","tráng miệng bằng bánh flan"]],
   "You have great taste in food!","Gu ẩm thực của bạn tuyệt lắm!")},

 {id:"rest_polite_diner",title_en:"Polite diner manners",title_vi:"Thực khách lịch thiệp",room:"restaurant",topic:"restaurant",urgency:"chill",giver:WAITER_G,
  desc_vi:"Trải khăn ăn lên đùi, hỏi món gợi ý, rót nước lọc, xin thêm khăn giấy và khen ngợi đầu bếp.",
  request:{en:"Practice polite dining English with our staff and chef!",vi:"Cùng luyện các mẫu câu giao tiếp nhà hàng lịch sự với nhân viên và đầu bếp nhé!"},
  steps:[
   st(1,"🧻","Put the napkin on my lap","Đặt khăn ăn lên đùi",["put_napkin_on_lap"],W=>W.rs_napkin==="lap","put_napkin_on_lap","Click the dining table to unfold your napkin.","Nhấn vào bàn ăn để trải khăn ăn lên đùi."),
   st(2,"💬","Ask for a recommendation","Hỏi món gợi ý",["ask_recommendation"],W=>W.rs_rec==="asked","ask_recommendation","Click the menu to ask what we recommend.","Nhấn vào thực đơn để hỏi món gợi ý."),
   st(3,"🫗","Pour some water","Rót nước lọc",["pour_drinking_water"],W=>W.rs_water==="poured","pour_drinking_water","Click the water pitcher on the side table.","Nhấn vào bình nước lọc để rót nước."),
   st(4,"🧻","Ask for extra napkins","Xin thêm khăn giấy",["ask_for_napkins"],W=>W.rs_extra_napkins==="yes","ask_for_napkins","Ask the waiter for extra napkins.","Nhờ nhân viên lấy thêm khăn giấy."),
   st(5,"👨‍🍳","Compliment the chef","Khen đầu bếp",["thank_the_chef"],W=>W.rs_chef==="thanked","thank_the_chef","Walk to the kitchen counter and thank the chef.","Đến quầy bếp mở và cảm ơn đầu bếp.")
  ],
  result:log=>story(log,"Such polite dining manners!","Phong thái thực khách thật lịch thiệp!",
   [["put_napkin_on_lap","put my napkin on my lap","đặt khăn ăn lên đùi"],["ask_recommendation","asked for a recommendation","hỏi món gợi ý"],["pour_drinking_water","poured water","rót nước mời bàn"],["ask_for_napkins","asked for extra napkins","xin thêm khăn giấy"],["thank_the_chef","complimented the chef","khen ngợi đầu bếp"]],
   "Our staff loved serving you today!","Nhân viên nhà hàng rất vui được phục vụ bạn!")},

 {id:"rest_healthy_patio",title_en:"Healthy Diner & Patio Breeze",title_vi:"Bữa tối lành mạnh & Gió mát sân hiên",room:"restaurant",topic:"restaurant",urgency:"normal",giver:CHEF_G,
  desc_vi:"Rửa tay với xà phòng, trộn đĩa salad rau tươi, gọi nước cam vắt nguyên chất và ra bàn sân hiên hóng gió mát.",
  request:{en:"Enjoy a fresh, nutritious evening! Wash your hands, toss a crispy green salad, order fresh orange juice, and relax on the breezy patio!",
           vi:"Hãy tận hưởng buổi tối lành mạnh! Rửa tay sạch, lấy một đĩa salad rau giòn, gọi nước cam vắt nguyên chất và ra bàn sân hiên đón gió mát nhé!"},
  steps:[
   st(1,"🧼","Wash hands with soap","Rửa tay với xà phòng",["wash_hands_with_soap","turn_on_warm_faucet"],W=>W.rs_soap_wash==="washed"||W.rs_turn_faucet==="on","wash_hands_with_soap","Click the handwashing sink on the left.","Nhấn vào bồn rửa tay ở bên trái."),
   st(2,"🥗","Toss a crispy green salad","Lấy salad rau xanh giòn",["toss_crispy_green_salad","enjoy_nutritious_salad"],W=>W.rs_salad_greens==="tossed"||W.rs_salad_eaten==="eaten","toss_crispy_green_salad","Click the fresh salad bar.","Nhấn vào quầy salad rau tươi."),
   st(3,"🍊","Order freshly squeezed orange juice","Gọi nước cam tươi nguyên chất",["order_fresh_orange_juice"],W=>W.rs_orange_juice==="ordered","order_fresh_orange_juice","Click the juice & tea bar.","Nhấn vào quầy nước ép & trà tươi."),
   st(4,"🌿","Enjoy the cool patio breeze","Tận hưởng gió mát ngoài sân hiên",["enjoy_cool_evening_breeze","step_out_to_patio"],W=>W.rs_evening_breeze==="enjoyed"||W.rs_step_patio==="out","enjoy_cool_evening_breeze","Click the patio table in the bottom-left corner.","Nhấn vào bàn sân hiên ở góc dưới bên trái.")
  ],
  result:log=>story(log,"What a refreshing and nutritious dinner!","Một bữa tối thật sảng khoái và bổ dưỡng!",
   [["wash_hands_with_soap","washed my hands with soap","rửa tay sạch với xà phòng"],["toss_crispy_green_salad","tossed a crispy green salad","lấy salad rau xanh giòn"],["order_fresh_orange_juice","ordered freshly squeezed orange juice","gọi nước cam vắt tươi"],["enjoy_cool_evening_breeze","enjoyed the evening breeze on the patio","hóng gió tối ngoài sân hiên"]],
   "Healthy choices make you feel great!","Lựa chọn thực phẩm lành mạnh giúp cơ thể thật khoẻ khoắn!")},

 {id:"rest_rainy_evening_feast",title_en:"Rainy Evening Comfort Soup",title_vi:"Ấm bụng tối mưa phùn",room:"restaurant",topic:"restaurant",urgency:"normal",giver:WAITER_G,
  desc_vi:"Cất ô ướt vào giá, xem bảng món ngon trong ngày, múc súp bí đỏ nóng thêm gừng tươi và uống trà gừng mật ong.",
  request:{en:"It's drizzling outside! Put your umbrella in the stand, check the specials chalkboard, ladle warm soup with ginger, and sip honey ginger tea!",
           vi:"Ngoài trời đang mưa phùn! Hãy cất ô vào giá, xem bảng phấn món ngon, múc súp nóng thêm gừng tươi và thưởng thức trà gừng mật ong nhé!"},
  steps:[
   st(1,"☔","Fold wet umbrella at the stand","Gấp ô ướt đặt vào giá",["shake_off_wet_umbrella","hang_up_light_raincoat"],W=>W.rs_umbrella_dry==="shaken"||W.rs_hang_raincoat==="hung","shake_off_wet_umbrella","Click the coat & umbrella stand near the entrance.","Nhấn vào giá treo áo khoác & ô gần lối vào."),
   st(2,"📋","Read the daily specials board","Đọc bảng món ngon trong ngày",["read_daily_chalkboard","ask_about_soup_of_the_day"],W=>W.rs_read_chalkboard==="read"||W.rs_soup_of_day==="asked","read_daily_chalkboard","Click the specials chalkboard on the back wall.","Nhấn vào bảng phấn món đặc biệt trên tường."),
   st(3,"🍲","Ladle warm soup with ginger","Múc súp nóng & thêm gừng",["ladle_warm_pumpkin_soup","add_fresh_ginger_slices"],W=>W.rs_kettle_ladle==="ladled"||W.rs_kettle_ginger==="added","ladle_warm_pumpkin_soup","Click the hot soup station.","Nhấn vào quầy nồi súp hầm nóng."),
   st(4,"🍵","Drink warm honey ginger tea","Uống trà gừng mật ong ấm họng",["choose_warm_ginger_tea"],W=>W.rs_herbal_tea==="chosen","choose_warm_ginger_tea","Click the juice & tea bar to order warm ginger tea.","Nhấn vào quầy đồ uống để gọi trà gừng mật ong.")
  ],
  result:log=>story(log,"A cozy and warming meal on a rainy night!","Một bữa ăn ấm áp và dịu họng trong tối mưa phùn!",
   [["shake_off_wet_umbrella","placed my umbrella in the stand","cất ô vào giá"],["read_daily_chalkboard","read the daily specials board","đọc bảng món ngon trong ngày"],["ladle_warm_pumpkin_soup","ladled warm pumpkin soup","múc súp bí đỏ nóng"],["choose_warm_ginger_tea","drank soothing honey ginger tea","uống trà gừng mật ong ấm họng"]],
   "Stay warm and dry tonight!","Chúc bạn luôn ấm áp và khoẻ mạnh tối nay!")},

 {id:"rest_takeaway_and_review",title_en:"Music, Takeaway & 5-Star Review",title_vi:"Nghe nhạc, Đóng gói mang về & Đánh giá 5 sao",room:"restaurant",topic:"restaurant",urgency:"chill",giver:WAITER_G,
  desc_vi:"Thưởng thức tiếng đàn guitar acoustic, xin hộp giấy đóng gói đồ ăn mang về và bấm đánh giá 5 sao cho nhà hàng.",
  request:{en:"Listen to our live acoustic guitar, pack your extra food in an eco-friendly container, and leave a five-star review at the stand!",
           vi:"Hãy lắng nghe tiếng đàn guitar mộc, đóng gói phần thức ăn mang về bằng hộp giấy sinh học và chấm 5 sao ở quầy đánh giá nhé!"},
  steps:[
   st(1,"🎸","Listen to the acoustic guitar","Thưởng thức tiếng đàn guitar mộc",["listen_to_acoustic_guitar","applaud_the_musician"],W=>W.rs_listen_guitar==="listened"||W.rs_clap_song==="clapped","listen_to_acoustic_guitar","Click the acoustic music stage.","Nhấn vào góc nhạc acoustic."),
   st(2,"🥡","Pack leftovers at the takeaway counter","Đóng gói đồ ăn tại quầy mang về",["ask_for_takeaway_container","pack_leftover_noodles"],W=>W.rs_ask_box==="asked"||W.rs_pack_leftovers==="packed","ask_for_takeaway_container","Click the takeaway counter in the foreground.","Nhấn vào quầy đóng gói mang về."),
   st(3,"⭐","Give a five-star rating","Đánh giá 5 sao cho nhà hàng",["give_five_star_rating","write_kind_review_note"],W=>W.rs_rate_five_stars==="rated"||W.rs_write_comment==="written","give_five_star_rating","Click the review stand on the far right.","Nhấn vào quầy đánh giá ở góc phải.")
  ],
  result:log=>story(log,"What a memorable evening at Saigon Bistro!","Một buổi tối thật đáng nhớ tại Saigon Bistro!",
   [["listen_to_acoustic_guitar","listened to live acoustic guitar","nghe đàn guitar mộc"],["ask_for_takeaway_container","packed my leftovers in an eco-box","đóng gói đồ ăn mang về"],["give_five_star_rating","gave the bistro a five-star rating","đánh giá 5 sao cho quán"]],
   "Thank you for your five-star review!","Cảm ơn đánh giá 5 sao tuyệt vời của bạn!")}
];

const T=(id,en,vi,anyOf,len,lvi,o)=>Object.assign({id,title_en:en,title_vi:vi,anyOf,learn_en:len,learn_vi:lvi},o||{});
const CHALLENGES=[
 {id:"rest_evening_dinner",icon:"🍜",title_en:"Dinner Night Out",title_vi:"Bữa tối ngoài hàng",
  goal_vi:"Xin bàn ăn cho 2 người, gọi mì bò, vắt chanh, thưởng thức bữa tối và thanh toán hoá đơn.",minutes:7,
  requires:["go_restaurant","order_beef_noodles","pay_restaurant_bill"],tasks:[
   T("table","Ask for a table for two","Xin bàn cho 2 người",["ask_for_a_table"],"table for two","bàn cho hai người",{free:true}),
   T("sit","Sit at the dining table","Ngồi vào bàn ăn",["sit_at_dining_table"],"take a seat","ngồi vào chỗ",{free:true}),
   T("menu","Check the menu","Xem thực đơn",["check_the_menu"],"on the menu","trên thực đơn"),
   T("order","Order beef noodle soup","Gọi món mì bò",["order_beef_noodles"],"I'll have","tôi xin gọi"),
   T("lime","Squeeze fresh lime","Vắt chanh tươi",["squeeze_some_lime"],"squeeze","vắt chanh"),
   T("taste","Taste the broth","Nếm nước dùng",["taste_the_broth"],"broth","nước dùng"),
   T("eat","Eat the main course","Ăn món chính",["eat_main_course"],"main course","món chính"),
   T("dessert","Order & eat caramel pudding","Gọi & ăn bánh flan",["order_sweet_dessert","eat_the_dessert"],"for dessert","tráng miệng"),
   T("bill","Ask for the bill","Xin hoá đơn",["ask_for_the_bill"],"Could we have the bill","cho xin hoá đơn"),
   T("pay","Pay the restaurant bill","Thanh toán hoá đơn",["pay_restaurant_bill","split_the_bill"],"pay the bill","thanh toán")]},

 {id:"rest_healthy_gourmet",icon:"🥗",title_en:"Healthy Gourmet Evening",title_vi:"Thực khách Sành ăn & Sống khoẻ",
  goal_vi:"Rửa tay sạch, hỏi thông tin dị ứng, ăn salad tươi, múc súp bí đỏ gừng ấm và uống trà thảo mộc không đường.",minutes:7,
  requires:["go_restaurant","wash_hands_with_soap","toss_crispy_green_salad"],tasks:[
   T("wash","Wash hands with soap","Rửa tay với xà phòng",["wash_hands_with_soap","turn_on_warm_faucet"],"good hygiene","vệ sinh tốt",{free:true}),
   T("allergy","Ask about food allergies","Hỏi về dị ứng thực phẩm",["ask_about_food_allergies","check_vegetarian_options"],"peanut allergy","dị ứng đậu phộng",{free:true}),
   T("salad","Toss a crispy green salad","Trộn salad rau tươi",["toss_crispy_green_salad","enjoy_nutritious_salad"],"crispy green salad","salad rau giòn"),
   T("soup","Ladle warm pumpkin soup","Múc súp bí đỏ ấm",["ladle_warm_pumpkin_soup","add_fresh_ginger_slices"],"aids digestion","hỗ trợ tiêu hoá"),
   T("drink","Order warm ginger tea or orange juice","Gọi trà gừng ấm hoặc nước cam",["choose_warm_ginger_tea","order_fresh_orange_juice"],"freshly squeezed","vắt tươi nguyên chất"),
   T("patio","Enjoy the evening breeze on the patio","Hóng gió tối ngoài sân hiên",["enjoy_cool_evening_breeze","step_out_to_patio"],"evening breeze","làn gió buổi tối"),
   T("music","Listen to acoustic guitar","Nghe đàn guitar acoustic",["listen_to_acoustic_guitar","applaud_the_musician"],"relaxing atmosphere","không khí thư giãn"),
   T("review","Give a five-star rating","Chấm 5 sao cho quán",["give_five_star_rating","thank_staff_for_hospitality"],"five-star rating","đánh giá 5 sao")]},

 {id:"rest_weekend_gathering",icon:"🎸",title_en:"Cozy Rainy-Night Bistro",title_vi:"Đêm mưa ấm cúng tại Bistro",
  goal_vi:"Cất ô ướt, xem bảng món ngon theo mùa, thưởng thức mì bò nóng, đóng gói phần mang về và lấy danh thiếp quán.",minutes:7,
  requires:["go_restaurant","shake_off_wet_umbrella","ask_for_takeaway_container"],tasks:[
   T("umb","Put wet umbrella in the stand","Cất ô ướt vào giá",["shake_off_wet_umbrella","hang_up_light_raincoat"],"drizzling outside","ngoài trời mưa phùn",{free:true}),
   T("board","Read the specials chalkboard","Xem bảng phấn món ngon",["read_daily_chalkboard","check_lunch_combo_price"],"seasonal dishes","món ăn theo mùa",{free:true}),
   T("chef","Ask the chef about the broth","Hỏi đầu bếp bí quyết nước dùng",["ask_chef_about_broth","smell_simmering_spices"],"slow-simmering","ninh nhỏ lửa"),
   T("noodle","Order & eat beef noodles","Gọi & ăn mì bò",["order_beef_noodles","eat_main_course"],"piping hot","nóng hổi"),
   T("box","Pack leftovers at takeaway counter","Đóng gói đồ mang về",["ask_for_takeaway_container","pack_leftover_noodles"],"takeaway container","hộp mang về"),
   T("card","Take a bistro delivery card","Lấy danh thiếp đặt món ngày mưa",["pick_up_bistro_card","take_a_peppermint_candy"],"on rainy days","vào những ngày mưa")]}
];

const VOCAB_PACK=Object.entries(RSV).map(([k,[ipa,vi]])=>({id:"rs_"+k,en:k.replace(/_/g," "),ipa,vi,cat:"restaurant",room:"restaurant"}));

const restaurant={
 id:"restaurant",name:"Restaurant",nameVi:"Nhà hàng",topic:"restaurant",
 entry:{x:110,y:585,d:1},
 shellSvg:RS_SHELL,worldSvg:RS_WORLD,css:RS_CSS,
 spots:RS_SPOTS,objects:RS_OBJECTS,actions:ACTIONS,
 props:RS_PROPS,W0:RS_W0,applyState:applyRestaurant,
 catalog:VOCAB_PACK,
 obstacles:[{x1:205,x2:495,y1:435,y2:520}]
};
root.ELW_ROOMS=root.ELW_ROOMS||{};
root.ELW_ROOMS.restaurant=restaurant;
root.ELW_RESTAURANT={topic:"restaurant",rooms:["restaurant"],id:"restaurant",npcs:NPCS,reply,missions:MISSIONS,challenges:CHALLENGES,vocab:VOCAB_PACK,lines:LINES,room:restaurant,objects:RS_OBJECTS,actions:ACTIONS,W0:RS_W0,worldSvg:RS_WORLD};
if(typeof module!=="undefined"&&module.exports)module.exports=root.ELW_RESTAURANT;
})();
