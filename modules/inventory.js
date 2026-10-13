/* ELW_INVENTORY — "Kho đồ" object library panel + quick quiz. No dependencies. */
(function(){
"use strict";
var CAT_VI={furniture:"Nội thất",electronics:"Điện tử",decor:"Trang trí",textiles:"Vải vóc",lighting:"Đèn",items:"Đồ dùng",structure:"Kết cấu",appliances:"Thiết bị"};
var PAGE=24;
function norm(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d").replace(/\s+/g," ").trim();}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

function quiz(catalog,n){
  var pool=[],seen={};
  (catalog||[]).forEach(function(c){var k=norm(c.en);if(c&&c.en&&c.vi&&!seen[k]){seen[k]=1;pool.push(c);}});
  if(pool.length<4)return [];
  return shuffle(pool).slice(0,Math.min(n||5,pool.length)).map(function(it){
    var same=shuffle(pool.filter(function(o){return o!==it&&o.category===it.category;}));
    var other=shuffle(pool.filter(function(o){return o!==it&&o.category!==it.category;}));
    var d=same.concat(other).slice(0,3).map(function(o){return o.en;});
    return {id:it.id,prompt_vi:it.vi,answer_en:it.en,options:shuffle(d.concat([it.en]))};
  });
}

var CSS=[
".inv-card{background:var(--card,#fffdf9);border:1px solid var(--line,#e3d6c3);border-radius:12px;color:var(--ink,#2d2a26);font:inherit;max-width:100%;box-sizing:border-box;overflow:hidden}",
".inv-card *{box-sizing:border-box}",
".inv-head{display:flex;align-items:center;gap:8px;width:100%;padding:12px 14px;background:none;border:0;font:inherit;font-weight:700;font-size:1rem;color:inherit;cursor:pointer;text-align:left;border-radius:12px}",
".inv-head .inv-chev{font-size:1.4rem;line-height:1;margin-left:auto;transition:transform .2s;color:var(--muted,#7a7166)}",
".inv-card.inv-open .inv-chev{transform:rotate(90deg)}",
".inv-body{padding:0 14px 14px}",
".inv-card:not(.inv-open) .inv-body{display:none}",
".inv-tabs{display:flex;gap:6px;margin-bottom:10px}",
".inv-tab{flex:1;padding:7px 10px;border:1px solid var(--line,#e3d6c3);background:#fff;border-radius:10px;font:inherit;font-size:.88rem;cursor:pointer;color:inherit}",
".inv-tab[aria-selected=true]{background:var(--accent,#e8743b);border-color:var(--accent,#e8743b);color:#fff;font-weight:600}",
".inv-search{width:100%;padding:9px 12px;border:1px solid var(--line,#e3d6c3);border-radius:10px;font:inherit;font-size:16px;background:#fff;color:inherit}",
".inv-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}",
".inv-chip{padding:4px 10px;border:1px solid var(--line,#e3d6c3);background:#fff;border-radius:999px;font:inherit;font-size:.8rem;cursor:pointer;color:inherit}",
".inv-chip[aria-pressed=true]{background:#fbe3d4;border-color:var(--accent,#e8743b);color:#a8481a;font-weight:600}",
".inv-meta{font-size:.8rem;color:var(--muted,#7a7166);margin:10px 0 6px}",
".inv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}",
".inv-tile{border:1px solid var(--line,#e3d6c3);border-radius:10px;padding:8px 10px;background:#fff;display:flex;flex-direction:column;gap:2px;min-width:0}",
".inv-tile.inv-learned{background:#f1f8f3;border-color:#bfe0c9}",
".inv-en{font-weight:700;overflow-wrap:anywhere}",
".inv-ipa{font-size:.78rem;color:var(--muted,#7a7166);overflow-wrap:anywhere}",
".inv-vi{font-size:.88rem;overflow-wrap:anywhere}",
".inv-row{display:flex;gap:4px;margin-top:6px;flex-wrap:wrap}",
".inv-btn{border:1px solid var(--line,#e3d6c3);background:#fff;border-radius:10px;padding:3px 8px;font:inherit;font-size:.82rem;cursor:pointer;color:inherit;min-height:30px}",
".inv-btn:hover{border-color:var(--accent,#e8743b)}",
".inv-star[aria-pressed=true]{color:#c98a00;background:#fff6dc;border-color:#ecc96a}",
".inv-go{background:var(--accent,#e8743b);border-color:var(--accent,#e8743b);color:#fff;font-weight:600}",
".inv-more{display:block;margin:10px auto 0;padding:8px 16px}",
".inv-empty{padding:18px 8px;text-align:center;color:var(--muted,#7a7166);font-size:.9rem}",
".inv-card button:focus-visible,.inv-search:focus-visible{outline:3px solid var(--accent,#e8743b);outline-offset:2px}",
".inv-q{text-align:center}",
".inv-qprompt{font-size:1.25rem;font-weight:700;margin:8px 0 12px}",
".inv-qopts{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
".inv-qopt{padding:10px;font-weight:600;min-height:44px}",
".inv-qopt.inv-right{background:#e3f4e8;border-color:var(--ok,#3a9d5d);color:#1f6b3a}",
".inv-qopt.inv-wrong{background:#fde4e0;border-color:#d9534f;color:#9b2c25}",
".inv-qfoot{display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:.88rem;gap:8px;flex-wrap:wrap}",
"@media (max-width:420px){.inv-grid{grid-template-columns:1fr 1fr}.inv-qopts{grid-template-columns:1fr}}"
].join("\n");
function injectCSS(){if(document.getElementById("inv-style"))return;var s=document.createElement("style");s.id="inv-style";s.textContent=CSS;document.head.appendChild(s);}

function mount(container,o){
  injectCSS();o=o||{};
  var getCatalog=o.getCatalog||function(){return [];},rooms=o.rooms||[];
  var curRoom=o.currentRoom||function(){return null;},inter=o.interactiveIds||function(){return new Set();};
  var speak=o.speak||function(){},isLearned=o.isLearned||function(){return false;},toggle=o.toggleLearned||function(){},sel=o.onSelectInteractive||function(){};
  var st={open:false,tab:"list",q:"",room:curRoom()||"all",cat:"all",shown:PAGE,quiz:null};
  var card=document.createElement("section");card.className="inv-card";
  container.appendChild(card);

  function filtered(){
    var q=norm(st.q);
    return getCatalog().filter(function(c){
      if(st.room!=="all"&&c.room!==st.room)return false;
      if(st.cat!=="all"&&c.category!==st.cat)return false;
      if(q&&norm(c.en).indexOf(q)<0&&norm(c.vi).indexOf(q)<0)return false;
      return true;
    });
  }
  function chip(kind,val,label,on){return '<button type="button" class="inv-chip" data-'+kind+'="'+esc(val)+'" aria-pressed="'+on+'">'+esc(label)+'</button>';}
  function listHTML(){
    var all=getCatalog(),ids=inter()||new Set();
    var roomCat=all.filter(function(c){return st.room==="all"||c.room===st.room;});
    var cats=[];roomCat.forEach(function(c){if(cats.indexOf(c.category)<0)cats.push(c.category);});
    if(st.cat!=="all"&&cats.indexOf(st.cat)<0)st.cat="all";
    var res=filtered(),page=res.slice(0,st.shown);
    var h='<input class="inv-search" type="search" placeholder="Tìm đồ vật (Anh hoặc Việt)…" aria-label="Tìm đồ vật" value="'+esc(st.q)+'">';
    h+='<div class="inv-chips" role="group" aria-label="Lọc theo phòng">'+chip("room","all","Tất cả",st.room==="all");
    rooms.forEach(function(r){h+=chip("room",r.id,r.nameVi||r.name,st.room===r.id);});
    h+='</div><div class="inv-chips" role="group" aria-label="Lọc theo loại">'+chip("cat","all","Mọi loại",st.cat==="all");
    cats.forEach(function(c){h+=chip("cat",c,CAT_VI[c]||c,st.cat===c);});
    h+='</div><div class="inv-meta" aria-live="polite">'+res.length+' kết quả</div>';
    if(!res.length)return h+'<div class="inv-empty">Không tìm thấy đồ vật nào. Thử từ khác hoặc chọn “Tất cả”.</div>';
    h+='<div class="inv-grid">';
    page.forEach(function(c){
      var L=!!isLearned(c.id),I=ids.has(c.id);
      h+='<div class="inv-tile'+(L?' inv-learned':'')+'" data-id="'+esc(c.id)+'"><div class="inv-en">'+esc(c.en)+'</div><div class="inv-ipa">'+esc(c.ipa)+'</div><div class="inv-vi">'+esc(c.vi)+'</div><div class="inv-row">'+
        '<button type="button" class="inv-btn inv-say" aria-label="Nghe '+esc(c.en)+'">🔊</button>'+
        '<button type="button" class="inv-btn inv-star" aria-pressed="'+L+'" aria-label="Đã thuộc '+esc(c.en)+'" title="Đã thuộc">★</button>'+
        (I?'<button type="button" class="inv-btn inv-go" aria-label="Xem '+esc(c.en)+' trong phòng">▶ Trong phòng</button>':'')+'</div></div>';
    });
    h+='</div>';
    if(res.length>page.length)h+='<button type="button" class="inv-btn inv-more">Xem thêm ('+(res.length-page.length)+')</button>';
    return h;
  }
  function quizHTML(){
    var z=st.quiz;
    if(!z||!z.items.length)return '<div class="inv-empty">Cần ít nhất 4 đồ vật để chơi đố nhanh.</div>';
    if(z.i>=z.items.length)return '<div class="inv-q"><div class="inv-qprompt">Bạn được '+z.score+'/'+z.items.length+' 🎉</div><button type="button" class="inv-btn inv-qnew">Chơi lại</button></div>';
    var it=z.items[z.i];
    var h='<div class="inv-q"><div class="inv-meta">Chọn từ tiếng Anh cho:</div><div class="inv-qprompt">'+esc(it.prompt_vi)+'</div><div class="inv-qopts">';
    it.options.forEach(function(op,k){
      var cls="";if(z.picked!=null){if(op===it.answer_en)cls=" inv-right";else if(k===z.picked)cls=" inv-wrong";}
      h+='<button type="button" class="inv-btn inv-qopt'+cls+'" data-k="'+k+'"'+(z.picked!=null?' aria-disabled="true"':'')+'>'+esc(op)+'</button>';
    });
    h+='</div><div class="inv-qfoot"><span>Câu '+(z.i+1)+'/'+z.items.length+' · Điểm: <b class="inv-score">'+z.score+'</b></span>';
    if(z.picked!=null)h+='<span><button type="button" class="inv-btn inv-qsay">🔊 '+esc(it.answer_en)+'</button> <button type="button" class="inv-btn inv-go inv-qnext">Tiếp →</button></span>';
    return h+'</div></div>';
  }
  function newQuiz(){var pool=getCatalog().filter(function(c){return st.room==="all"||c.room===st.room;});if(pool.length<4)pool=getCatalog();st.quiz={items:quiz(pool,10),i:0,score:0,picked:null};}
  function render(focusSel){
    var n=getCatalog().length;
    card.className="inv-card"+(st.open?" inv-open":"");
    var h='<button type="button" class="inv-head" aria-expanded="'+st.open+'"><span>🧺 Kho đồ ('+n+' món)</span><span class="inv-chev" aria-hidden="true">›</span></button><div class="inv-body">';
    h+='<div class="inv-tabs" role="tablist"><button type="button" role="tab" class="inv-tab" data-tab="list" aria-selected="'+(st.tab==="list")+'">📋 Danh sách</button><button type="button" role="tab" class="inv-tab" data-tab="quiz" aria-selected="'+(st.tab==="quiz")+'">🎯 Đố nhanh</button></div>';
    h+=(st.tab==="list"?listHTML():quizHTML())+'</div>';
    card.innerHTML=h;
    if(focusSel){var f=card.querySelector(focusSel);if(f){f.focus();if(f.setSelectionRange&&f.value!=null){var l=f.value.length;try{f.setSelectionRange(l,l);}catch(e){}}}}
  }
  function keyOf(el){ // stable selector to restore focus after re-render
    if(el.classList.contains("inv-search"))return ".inv-search";
    if(el.dataset.room)return '[data-room="'+el.dataset.room+'"]';
    if(el.dataset.cat)return '[data-cat="'+el.dataset.cat+'"]';
    if(el.dataset.tab)return '[data-tab="'+el.dataset.tab+'"]';
    var t=el.closest(".inv-tile");if(t)return '.inv-tile[data-id="'+t.dataset.id+'"] .'+el.className.split(" ").filter(function(c){return c!=="inv-btn";})[0];
    return null;
  }
  card.addEventListener("input",function(e){if(e.target.classList.contains("inv-search")){st.q=e.target.value;st.shown=PAGE;render(".inv-search");}});
  card.addEventListener("click",function(e){
    var b=e.target.closest("button");if(!b)return;
    var tile=b.closest(".inv-tile"),id=tile&&tile.dataset.id;
    if(b.classList.contains("inv-head")){st.open=!st.open;render(".inv-head");return;}
    if(b.dataset.tab){st.tab=b.dataset.tab;if(st.tab==="quiz"&&!st.quiz)newQuiz();render(keyOf(b));return;}
    if(b.dataset.room){st.room=b.dataset.room;st.shown=PAGE;render(keyOf(b));return;}
    if(b.dataset.cat){st.cat=b.dataset.cat;st.shown=PAGE;render(keyOf(b));return;}
    if(b.classList.contains("inv-more")){var prev=st.shown;st.shown+=PAGE;render();var t=card.querySelectorAll(".inv-tile")[prev];if(t)t.querySelector("button").focus();return;}
    if(b.classList.contains("inv-say")){var it=getCatalog().find(function(c){return c.id===id;});if(it)speak(it.en);return;}
    if(b.classList.contains("inv-star")){toggle(id);render(keyOf(b));return;}
    if(b.classList.contains("inv-go")&&id){sel(id);return;}
    var z=st.quiz;
    if(b.classList.contains("inv-qopt")&&z&&z.picked==null){var k=+b.dataset.k,q=z.items[z.i];z.picked=k;if(q.options[k]===q.answer_en)z.score++;speak(q.answer_en);render(".inv-qnext");return;}
    if(b.classList.contains("inv-qsay")){speak(z.items[z.i].answer_en);return;}
    if(b.classList.contains("inv-qnext")){z.i++;z.picked=null;render(z.i>=z.items.length?".inv-qnew":".inv-qopt");return;}
    if(b.classList.contains("inv-qnew")){newQuiz();render(".inv-qopt");return;}
  });
  render();
  return {
    refresh:function(){var a=document.activeElement,k=card.contains(a)?keyOf(a):null;render(k);},
    open:function(){st.open=true;render();},
    close:function(){st.open=false;render();},
    setRoom:function(r){st.room=r||"all";st.shown=PAGE;render();}
  };
}
var api={mount:mount,quiz:quiz,normalize:norm};
if(typeof window!=="undefined")window.ELW_INVENTORY=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})();
