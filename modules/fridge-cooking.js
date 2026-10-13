/* English Life World — fridge-cooking.js
   Agent 3: Tủ lạnh có thực phẩm thật & Nấu ăn cần nguyên liệu (Fridge & Cooking)
   Tracks real food inventory inside the fridge and enforces ingredient requirements for cooking. */
(function (root) {
  "use strict";

  const DEFAULT_FRIDGE = {
    egg: { id: "egg", en: "Fresh Egg", vi: "Trứng gà tươi", qty: 4, icon: "🥚", category: "dairy" },
    milk: { id: "milk", en: "Cold Milk Carton", vi: "Hộp sữa tươi lạnh", qty: 2, icon: "🥛", category: "dairy" },
    bread: { id: "bread", en: "Sliced Bread", vi: "Bánh mì lát", qty: 6, icon: "🍞", category: "bakery" },
    butter: { id: "butter", en: "Creamy Butter", vi: "Bơ thực vật", qty: 2, icon: "🧈", category: "dairy" },
    cheese: { id: "cheese", en: "Cheddar Cheese", vi: "Phô mai lát", qty: 4, icon: "🧀", category: "dairy" },
    apple: { id: "apple", en: "Crisp Red Apple", vi: "Táo đỏ giòn", qty: 3, icon: "🍎", category: "fruit" },
    rice_pack: { id: "rice_pack", en: "White Rice Bag", vi: "Túi gạo trắng", qty: 2, icon: "🌾", category: "grain" },
    coffee_beans: { id: "coffee_beans", en: "Roasted Coffee", vi: "Cà phê rang", qty: 2, icon: "☕", category: "pantry" },
    vegetables: { id: "vegetables", en: "Fresh Greens", vi: "Rau xanh tươi", qty: 3, icon: "🥬", category: "produce" },
    sausage: { id: "sausage", en: "Smoked Sausage", vi: "Xúc xích hun khói", qty: 3, icon: "🌭", category: "meat" }
  };

  const RECIPES = {
    fry_egg: {
      id: "fry_egg",
      name: "Sunny-Side Fried Egg",
      nameVi: "Trứng ốp la",
      ingredients: [{ id: "egg", qty: 1 }],
      result: "fried_egg",
      resultVi: "Đĩa trứng ốp la thơm lừng",
      actionId: "fry_egg"
    },
    k_fry_egg: {
      id: "k_fry_egg",
      name: "Sunny-Side Fried Egg",
      nameVi: "Trứng ốp la",
      ingredients: [{ id: "egg", qty: 1 }],
      result: "fried_egg",
      resultVi: "Đĩa trứng ốp la thơm lừng",
      actionId: "k_fry_egg"
    },
    k_make_toast: {
      id: "k_make_toast",
      name: "Golden Toast",
      nameVi: "Bánh mì nướng giòn",
      ingredients: [{ id: "bread", qty: 1 }],
      result: "toast",
      resultVi: "Lát bánh mì nướng vàng thơm",
      actionId: "k_make_toast"
    },
    k_cook_rice: {
      id: "k_cook_rice",
      name: "Steamed Fragrant Rice",
      nameVi: "Cơm trắng thơm dẻo",
      ingredients: [{ id: "rice_pack", qty: 1 }],
      result: "steamed_rice",
      resultVi: "Nồi cơm trắng nghi ngút khói",
      actionId: "k_cook_rice"
    },
    k_make_coffee: {
      id: "k_make_coffee",
      name: "Hot Drip Coffee",
      nameVi: "Cà phê pha phin",
      ingredients: [{ id: "coffee_beans", qty: 1 }],
      result: "coffee_cup",
      resultVi: "Tách cà phê phin đậm đà",
      actionId: "k_make_coffee"
    },
    make_sandwich: {
      id: "make_sandwich",
      name: "Ham & Cheese Sandwich",
      nameVi: "Bánh mì kẹp xúc xích phô mai",
      ingredients: [{ id: "bread", qty: 2 }, { id: "cheese", qty: 1 }, { id: "sausage", qty: 1 }],
      result: "sandwich",
      resultVi: "Chiếc bánh mì kẹp thịnh soạn",
      actionId: "make_sandwich"
    },
    make_salad: {
      id: "make_salad",
      name: "Green Apple Salad",
      nameVi: "Salad rau củ quả tươi",
      ingredients: [{ id: "vegetables", qty: 1 }, { id: "apple", qty: 1 }],
      result: "salad",
      resultVi: "Đĩa salad xanh giòn mát lành",
      actionId: "make_salad"
    }
  };

  const css = `
.fc-card{background:#fdfcf7;border:2px solid #5d4037;border-radius:12px;padding:12px 14px;box-shadow:0 3px 10px rgba(93,64,55,.15);box-sizing:border-box}
.fc-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;border-bottom:1px solid #d7ccc8;padding-bottom:6px}
.fc-badge{font-weight:700;font-size:13px;color:#4e342e;background:#efebe9;padding:3px 8px;border-radius:999px;border:1px solid #d7ccc8}
.fc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-bottom:12px}
.fc-item{background:#fff;border:1px solid #d7ccc8;border-radius:8px;padding:8px;text-align:center;transition:transform .2s,box-shadow .2s}
.fc-item:hover{transform:translateY(-2px);box-shadow:0 3px 8px rgba(0,0,0,.08)}
.fc-icon{font-size:26px;display:block;margin-bottom:4px}
.fc-name{font-weight:700;font-size:12px;color:#3e2723}
.fc-name .vi{font-size:11px;color:#795548;display:block}
.fc-qty{font-size:11px;color:#5d4037;margin:4px 0 6px;font-weight:600}
.fc-act{display:flex;gap:4px;justify-content:center}
.fc-btn{border:0;background:#6d4c41;color:#fff;font-size:11px;padding:3px 7px;border-radius:4px;cursor:pointer}
.fc-btn:hover{background:#4e342e}
.fc-recipes{background:#efebe9;border-radius:8px;padding:8px 10px;margin-top:8px}
.fc-rec-title{font-size:13px;font-weight:700;color:#3e2723;margin-bottom:6px}
.fc-rec-item{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:12px;padding:4px 0;border-bottom:1px dashed #d7ccc8}
`;

  let fridgeItems = JSON.parse(JSON.stringify(DEFAULT_FRIDGE));
  let playerPantry = {}; // items taken into inventory/hand: { itemId: count }
  let listeners = [];

  function subscribe(fn) {
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }
  function notify() {
    for (const l of listeners) {
      try { l({ fridge: fridgeItems, player: playerPantry }); } catch (e) { console.error(e); }
    }
  }

  function getFridgeItems() {
    return Object.values(fridgeItems).filter(item => item.qty > 0);
  }

  function getItem(id) {
    return fridgeItems[id] || null;
  }

  function takeItem(id, count = 1) {
    const item = fridgeItems[id];
    if (!item || item.qty <= 0) return false;
    const takeCount = Math.min(item.qty, count);
    item.qty -= takeCount;
    playerPantry[id] = (playerPantry[id] || 0) + takeCount;
    notify();
    return { item: { ...item }, count: takeCount };
  }

  function putItem(id, count = 1) {
    if (!playerPantry[id] || playerPantry[id] <= 0) return false;
    const putCount = Math.min(playerPantry[id], count);
    playerPantry[id] -= putCount;
    if (fridgeItems[id]) {
      fridgeItems[id].qty += putCount;
    }
    notify();
    return true;
  }

  function hasIngredient(id, requiredQty = 1) {
    const inFridge = (fridgeItems[id] && fridgeItems[id].qty) || 0;
    const inPantry = playerPantry[id] || 0;
    return (inFridge + inPantry) >= requiredQty;
  }

  function checkRecipeRequirements(actionId) {
    const recipe = RECIPES[actionId];
    if (!recipe) return null; // No special ingredient constraint
    for (const ing of recipe.ingredients) {
      if (!hasIngredient(ing.id, ing.qty)) {
        const itemDef = DEFAULT_FRIDGE[ing.id] || { en: ing.id, vi: ing.id };
        return {
          allowed: false,
          missing: ing.id,
          messageEn: `Need ${ing.qty} ${itemDef.en} to prepare ${recipe.name}! Check the fridge.`,
          messageVi: `Cần có ${ing.qty} ${itemDef.vi} (${itemDef.en}) trong tủ lạnh để làm ${recipe.nameVi}!`
        };
      }
    }
    return { allowed: true, recipe };
  }

  function consumeIngredientsFor(actionId) {
    const recipe = RECIPES[actionId];
    if (!recipe) return null;
    for (const ing of recipe.ingredients) {
      let needed = ing.qty;
      // Consume from player pantry first, then fridge
      if (playerPantry[ing.id] && playerPantry[ing.id] > 0) {
        const fromPantry = Math.min(needed, playerPantry[ing.id]);
        playerPantry[ing.id] -= fromPantry;
        needed -= fromPantry;
      }
      if (needed > 0 && fridgeItems[ing.id]) {
        fridgeItems[ing.id].qty = Math.max(0, fridgeItems[ing.id].qty - needed);
      }
    }
    notify();
    return recipe;
  }

  function onAction(actionId, worldState) {
    if (RECIPES[actionId]) {
      return consumeIngredientsFor(actionId);
    }
    return null;
  }

  function mountHud(container, callbacks = {}) {
    if (!container || typeof document === "undefined") return;
    if (!document.getElementById("fc-css")) {
      const st = document.createElement("style");
      st.id = "fc-css";
      st.textContent = css;
      document.head.appendChild(st);
    }

    function render() {
      const items = getFridgeItems();
      container.innerHTML = `
<div class="fc-card">
  <div class="fc-head">
    <span class="fc-badge">❄️ TỦ LẠNH THỰC PHẨM · FRESH FRIDGE</span>
    <span style="font-size:12px;color:#795548;font-weight:600">${items.reduce((s,i)=>s+i.qty,0)} món sẵn có</span>
  </div>
  <div class="fc-grid">
    ${items.map(it => `
      <div class="fc-item">
        <span class="fc-icon">${it.icon}</span>
        <div class="fc-name">${it.en}<span class="vi">${it.vi}</span></div>
        <div class="fc-qty">Còn: ${it.qty}</div>
        <div class="fc-act">
          <button class="fc-btn" data-take="${it.id}">Lấy ra</button>
        </div>
      </div>`).join("")}
  </div>
  <div class="fc-recipes">
    <div class="fc-rec-title">🍳 Công thức nấu ăn (Cần nguyên liệu thật):</div>
    ${Object.values(RECIPES).map(r => {
      const check = checkRecipeRequirements(r.actionId);
      return `
        <div class="fc-rec-item">
          <div>
            <b>${r.nameVi} (${r.name}):</b> ${r.ingredients.map(i => `${i.qty} ${(DEFAULT_FRIDGE[i.id]||{}).vi}`).join(", ")}
          </div>
          <div>
            ${check && check.allowed ? '<span style="color:#2e7d32;font-weight:700">✓ Đủ</span>' : '<span style="color:#d32f2f;font-weight:700">✗ Thiếu</span>'}
          </div>
        </div>`;
    }).join("")}
  </div>
</div>`;

      container.querySelectorAll("[data-take]").forEach(b => {
        b.onclick = () => {
          takeItem(b.dataset.take, 1);
        };
      });
    }

    render();
    return subscribe(render);
  }

  const API = {
    RECIPES,
    DEFAULT_FRIDGE,
    css,
    getFridgeItems,
    getItem,
    takeItem,
    putItem,
    hasIngredient,
    checkRecipeRequirements,
    consumeIngredientsFor,
    onAction,
    mountHud,
    subscribe,
    pantry: () => ({ ...playerPantry }),
    reset: () => {
      fridgeItems = JSON.parse(JSON.stringify(DEFAULT_FRIDGE));
      playerPantry = {};
      notify();
    }
  };

  root.ELW_FRIDGE = API;
  root.ELW_COOKING = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
