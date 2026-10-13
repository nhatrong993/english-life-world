// node modules/grammar.test.js
const { ELW_GRAMMAR: G, ELW_MISTAKES: M } = require("./grammar.js");
let pass = 0, fail = 0; const fails = [];
function ok(cond, name, info) { if (cond) pass++; else { fail++; fails.push(name + (info ? "\n    " + info : "")); } }

// [input, expected corrected, expected issue type (or rule id)]
const ERR = [
  ["I has drink milk yesterday", "I drank milk yesterday.", "tense"],
  ["He don't like coffee.", "He doesn't like coffee.", "agreement"],
  ["I want go to the kitchen.", "I want to go to the kitchen.", "grammar"],
  ["I has a cat.", "I have a cat.", "agreement"],
  ["She have a dog.", "She has a dog.", "agreement"],
  ["My mom have two cats.", "My mom has two cats.", "agreement"],
  ["He like coffee.", "He likes coffee.", "agreement"],
  ["She watch TV every night.", "She watches TV every night.", "agreement"],
  ["My brother study English.", "My brother studies English.", "agreement"],
  ["The cat sleep on the sofa.", "The cat sleeps on the sofa.", "agreement"],
  ["I likes milk.", "I like milk.", "agreement"],
  ["They plays football.", "They play football.", "agreement"],
  ["We doesn't have milk.", "We don't have milk.", "agreement"],
  ["She don't eat meat.", "She doesn't eat meat.", "agreement"],
  ["I is hungry.", "I am hungry.", "agreement"],
  ["They is my friends.", "They are my friends.", "agreement"],
  ["He are tired.", "He is tired.", "agreement"],
  ["You was late.", "You were late.", "agreement"],
  ["She were at home.", "She was at home.", "agreement"],
  ["People is friendly here.", "People are friendly here.", "agreement"],
  ["Everybody are happy.", "Everybody is happy.", "agreement"],
  ["I watching TV.", "I am watching TV.", "grammar"],
  ["She cooking dinner.", "She is cooking dinner.", "grammar"],
  ["We eating breakfast.", "We are eating breakfast.", "grammar"],
  ["I am watch TV.", "I am watching TV.", "grammar"],
  ["She is cook dinner.", "She is cooking dinner.", "grammar"],
  ["I'm drink milk.", "I'm drinking milk.", "grammar"],
  ["I am agree with you.", "I agree with you.", "grammar"],
  ["She is agree.", "She agrees.", "grammar"],
  ["I eat rice yesterday.", "I ate rice yesterday.", "tense"],
  ["I go to school yesterday.", "I went to school yesterday.", "tense"],
  ["She buy a new cup last week.", "She bought a new cup last week.", "tense"],
  ["I see my friend two days ago.", "I saw my friend two days ago.", "tense"],
  ["I sleep late last night.", "I slept late last night.", "tense"],
  ["He take the bus yesterday.", "He took the bus yesterday.", "tense"],
  ["We make a cake last weekend.", "We made a cake last weekend.", "tense"],
  ["I clean my room yesterday.", "I cleaned my room yesterday.", "tense"],
  ["I am tired yesterday.", "I was tired yesterday.", "tense"],
  ["They are at home last night.", "They were at home last night.", "tense"],
  ["I don't go out yesterday.", "I didn't go out yesterday.", "tense"],
  ["I have breakfast at 7 yesterday.", "I had breakfast at 7 yesterday.", "tense"],
  ["She has drink her milk.", "She has drunk her milk.", "tense"],
  ["I have eat breakfast.", "I have eaten breakfast.", "tense"],
  ["We have finish our homework.", "We have finished our homework.", "tense"],
  ["I didn't went out.", "I didn't go out.", "grammar"],
  ["Did you ate breakfast?", "Did you eat breakfast?", "grammar"],
  ["Does she likes milk?", "Does she like milk?", "grammar"],
  ["I can to swim.", "I can swim.", "grammar"],
  ["She can swims.", "She can swim.", "grammar"],
  ["You must to go now.", "You must go now.", "grammar"],
  ["He will goes home.", "He will go home.", "grammar"],
  ["Can I watching more five minute?", "Can I watch five more minutes?", "grammar"],
  ["I need go home.", "I need to go home.", "grammar"],
  ["She wants eat an apple.", "She wants to eat an apple.", "grammar"],
  ["I like read books.", "I like to read books.", "grammar"],
  ["I go to home at five.", "I go home at five.", "preposition"],
  ["I listen music every day.", "I listen to music every day.", "preposition"],
  ["I very like milk.", "I really like milk.", "naturalness"],
  ["I very hungry.", "I am very hungry.", "grammar"],
  ["She tired.", "She is tired.", "grammar"],
  ["This tea is more better.", "This tea is better.", "grammar"],
  ["I eat a apple.", "I eat an apple.", "article"],
  ["She studies at an university.", "She studies at a university.", "article"],
  ["I waited for a hour.", "I waited for an hour.", "article"],
  ["I open fridge.", "I open the fridge.", "article"],
  ["The cup is on table.", "The cup is on the table.", "article"],
  ["I'm going to kitchen.", "I'm going to the kitchen.", "article"],
  ["I feed cat every morning.", "I feed the cat every morning.", "article"],
  ["I have two cup.", "I have two cups.", "plural"],
  ["There are three child in the room.", "There are three children in the room.", "plural"],
  ["I drink two milks.", "I drink two milk.", "plural"],
  ["We bought new furnitures.", "We bought new furniture.", "plural"],
  ["I need some informations.", "I need some information.", "plural"],
  ["Let's discuss about the plan.", "Let's discuss the plan.", "preposition"],
  ["I return back home.", "I return home.", "naturalness"],
  ["Please explain me this word.", "Please explain to me this word.", "preposition"],
  ["She is married with a doctor.", "She is married to a doctor.", "preposition"],
  ["I drink milk at the morning.", "I drink milk in the morning.", "preposition"],
  ["I clean the house in Sunday.", "I clean the house on Sunday.", "preposition"],
  ["I get up on 7 o'clock.", "I get up at 7 o'clock.", "preposition"],
  ["What you are doing?", "What are you doing?", "word-order"],
  ["Where she is?", "Where is she?", "word-order"],
  ["What you want?", "What do you want?", "word-order"],
  ["What you doing?", "What are you doing?", "word-order"],
  ["I don't want nothing.", "I don't want anything.", "grammar"],
  ["I didn't see nobody.", "I didn't see anybody.", "grammar"],
  ["This is the my cup.", "This is my cup.", "article"],
  ["i like tea.", "I like tea.", "punctuation"],
  ["my cat is sleeping.", "My cat is sleeping.", "punctuation"],
  ["I am hungry", "I am hungry.", "punctuation"],
  ["Are you hungry", "Are you hungry?", "punctuation"],
  ["I open the light.", "I turn on the light.", "word-choice"],
  ["Please close the TV.", "Please turn off the TV.", "word-choice"],
  ["Say me your name.", "Tell me your name.", "word-choice"],
  ["I make homework every day.", "I do homework every day.", "word-choice"],
  ["I have lived here since 3 years.", "I have lived here for 3 years.", "preposition"],
  ["I read at in the night.", "I read at at night.", "preposition"],
];
ERR.pop(); // (placeholder removed)
for (const [inp, exp, type] of ERR) {
  const r = G.check(inp);
  ok(r.corrected === exp, `ERR "${inp}"`, `got "${r.corrected}" expected "${exp}" issues=${r.issues.map(i => i.id).join(",")}`);
  ok(r.issues.some(i => i.type === type || i.id === type), `TYPE "${inp}" has ${type}`, r.issues.map(i => i.type + ":" + i.id).join(","));
  ok(r.score < 100, `SCORE "${inp}"`);
}

const CORRECT = [
  "I'm opening the fridge.", "After pouring myself some cold milk, I pick the cup up.", "She has made the bed.", "I've already fed the cat.",
  "You look thirsty. Would you like some milk?", "And could you close the window? It's cold at night.", "Are you making breakfast?",
  "As I get caught up in the show, I occasionally take a sip of milk.", "As I watch the show, I take a sip of milk.", "Can I watch five more minutes?",
  "Could you pick it up and put it on the table?", "Could you turn on the TV?", "Do you want to watch a movie tonight?", "Enjoy the movie!",
  "I am going to eat.", "I can drink it for you.", "I can water it for you.", "I get up at 6 a.m.",
  "I open the fridge and then take the milk out, which is cold, because I am thirsty.", "I see! Tell me a little more about that.",
  "I understand. Why do you feel that way?", "I'm clearing the table.", "I'm closing the curtains.", "I'm setting the table.",
  "I'm boiling some eggs.", "I'm boiling some water.", "I'm brushing my teeth.", "I'm calling my mom.", "I'm charging my phone.",
  "I'm checking my messages.", "I'm cleaning the table.", "I'm closing the microwave door.", "I'm closing the wardrobe.",
  "I'm cooking soup in a pot.", "I'm cooking rice in the rice cooker.", "I'm doing the dishes.", "I'm drinking a glass of water.",
  "I'm drinking from the cup.", "I'm drinking my coffee.", "I'm drying the plates with a towel.", "I'm eating toast.",
  "I'm emptying the laundry basket.", "I'm feeding the cat.", "I'm filling the kettle with water.", "I'm fluffing up the pillow.",
  "I'm folding the blanket.", "I'm frying an egg.", "I'm getting out of bed.", "I'm getting up from the sofa.", "I'm getting up.",
  "I'm giving my mom a cup of tea.", "I'm giving the cat some water.", "I'm going to eat.", "I'm hanging up my shirt.",
  "I'm having breakfast at the table.", "I'm heating up the food in the microwave.", "I'm listening to music.", "I'm looking at my phone.",
  "Good morning! Did you sleep well?", "What did you do last weekend?", "How has your day been so far?", "I went to the park yesterday.",
  "She likes coffee.", "He doesn't like tea.", "I want to go to the kitchen.", "I have a cat.", "I drank milk yesterday.",
  "If I were you, I would go home.", "Let it go.", "I watched the cat play.", "Make it work.", "What are you doing?",
  "What do you want to eat?", "When I wake up, I drink milk.", "My mom waters the plants.", "We have two cats.",
  "There is some milk in the fridge.", "The milk is cold.", "Turn off the light, please.", "I need help.", "We need water.",
  "I go to bed at ten.", "What's on TV?", "She is married to a doctor.", "He went home late last night.", "I have lived here for three years.",
  "I'm a university student.", "It's an hour away.", "They were tired.", "Everybody is here.", "I agree with you."
];
for (const s of CORRECT) {
  const r = G.check(s);
  ok(r.issues.length === 0 && r.corrected === s, `CORRECT "${s}"`, `got "${r.corrected}" ${r.issues.map(i => i.id + ":" + i.from + "→" + i.to).join(" | ")}`);
}
// missing end punctuation on a correct sentence -> only punctuation issues
{ const r = G.check("I'm feeding the cat"); ok(r.issues.length === 1 && r.issues[0].type === "punctuation", "punct-only"); }
// shape
{ const r = G.check("He don't like coffee"); ok(r.original === "He don't like coffee" && Array.isArray(r.issues) && r.issues.every(i => i.id && i.type && i.from != null && i.to != null && i.msg_vi && i.example_en), "issue shape"); }
ok(G.RULES.length >= 35, "≥35 rules (" + G.RULES.length + ")");

// mistakes notebook (in-memory localStorage stub)
const store = {}; globalThis.localStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => delete store[k] };
M.clear();
M.add(G.check("He don't like coffee."), "test");
M.add(G.check("He don't like coffee."), "test");
M.add(G.check("I has a cat."));
M.add(G.check("I want go to the kitchen."));
ok(M.list().length === 3, "notebook dedupe count");
ok(JSON.parse(store.elw_mistakes_v1).v === 1, "versioned storage");
const st = M.stats(); ok(st.byType.agreement === 3 && st.top[0].count === 2 && st.mostType === "agreement", "stats", JSON.stringify(st));
const ex = M.practice(6); ok(ex.length === 6 && ex.every(e => e.prompt_vi && e.answer && e.type), "practice", JSON.stringify(ex, null, 1));
ok(ex.some(e => e.type === "choose-correct" && e.options.includes(e.answer)) && ex.some(e => e.type === "fill-gap") && ex.some(e => e.type === "fix-the-sentence"), "practice types");
ok(M.isCorrect(ex.find(e => e.type === "fix-the-sentence"), ex.find(e => e.type === "fix-the-sentence").answer.toLowerCase().replace(/\.$/, "")), "lenient answer check");
store.elw_mistakes_v1 = "{broken"; ok(Array.isArray(M.list()), "corrupt storage tolerated");
ok(M.remove(M.list()[0].id) && M.list().length === 2, "remove");
M.clear(); ok(M.list().length === 0, "clear");

console.log(`${pass} passed, ${fail} failed  (${ERR.length} error cases, ${CORRECT.length} correct sentences)`);
if (fail) { console.log(fails.join("\n")); process.exit(1); }
