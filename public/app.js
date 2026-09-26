/**
 * RecipePocket AI - Main Application Logic
 * YouTube Recipe Extractor & Smart Supermarket Shopping Organizer
 */

// Preset Sample Recipes for instant testing without URL input
const SAMPLE_RECIPES = {
  butajiru: {
    title: "至高の豚汁（コク旨・隠し味仕込み）",
    servings: 2,
    summary: "ごま油で香ばしく炒めた具材と、生姜・にんにくの隠し味が効いた至高の豚汁。",
    prepTime: "10分",
    cookTime: "15分",
    thumbnail: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=2r1y_h6yB-Q",
    ingredients: [
      { name: "豚バラ肉", amount: "150g", numericAmount: 150, unit: "g", category: "meat_fish", defaultSub: "豚こま肉、鶏もも肉" },
      { name: "大根", amount: "1/4本 (約200g)", numericAmount: 200, unit: "g", category: "vegetable", defaultSub: "かぶ、れんこん" },
      { name: "ごぼう", amount: "1/2本", numericAmount: 0.5, unit: "本", category: "vegetable", defaultSub: "里芋、きのこ類" },
      { name: "にんじん", amount: "1/2本", numericAmount: 0.5, unit: "本", category: "vegetable", defaultSub: "かぼちゃ、さつまいも" },
      { name: "こんにゃく", amount: "1/2枚", numericAmount: 0.5, unit: "枚", category: "pantry_other", defaultSub: "厚揚げ、ちくわ" },
      { name: "長ネギ", amount: "1/2本", numericAmount: 0.5, unit: "本", category: "vegetable", defaultSub: "玉ねぎ、青ネギ" },
      { name: "木綿豆腐", amount: "1/2丁 (150g)", numericAmount: 150, unit: "g", category: "dairy_egg", defaultSub: "絹豆腐、厚揚げ" }
    ],
    seasonings: [
      { name: "ごま油", amount: "大さじ1", numericAmount: 1, unit: "大さじ", category: "seasoning", defaultSub: "サラダ油＋すりごま" },
      { name: "味噌", amount: "大さじ3", numericAmount: 3, unit: "大さじ", category: "seasoning", defaultSub: "合わせ味噌、赤味噌" },
      { name: "みりん", amount: "大さじ1", numericAmount: 1, unit: "大さじ", category: "seasoning", defaultSub: "酒 大さじ1 ＋ 砂糖 小さじ1" },
      { name: "和風顆粒だし", amount: "小さじ1", numericAmount: 1, unit: "小さじ", category: "seasoning", defaultSub: "昆布茶、出汁パック" },
      { name: "おろし生姜", amount: "小さじ1/2", numericAmount: 0.5, unit: "小さじ", category: "seasoning", defaultSub: "チューブ生姜、スライス生姜" },
      { name: "水", amount: "600ml", numericAmount: 600, unit: "ml", category: "seasoning", defaultSub: "水" }
    ],
    steps: [
      { step: 1, instruction: "大根・にんじんは厚めのいちょう切り、ごぼうは斜め薄切り、豚肉とこんにゃくは一口大に切る。", timerSeconds: 0 },
      { step: 2, instruction: "深めの鍋にごま油を中火で熱し、豚肉を炒める。色が変わったら大根、にんじん、ごぼう、こんにゃくを加えて3分しっかり炒める。", timerSeconds: 180 },
      { step: 3, instruction: "水600ml、和風だし、みりんを加えて煮立たせ、アクを取り除いて蓋をし、弱中火で約10分野菜が柔らかくなるまで煮る。", timerSeconds: 600 },
      { step: 4, instruction: "手でちぎった豆腐と長ネギ、おろし生姜を加え、火を弱めて味噌を溶き入れ、ひと煮立ち直前に火を止める。", timerSeconds: 60 }
    ],
    proTips: "野菜をごま油で最初にしっかり炒めることで表面がコーティングされ、旨味と香ばしさが倍増します。おろし生姜は最後に入れると爽やかな風味が際立ちます。"
  },
  carbonara: {
    title: "本場ローマ風 極上濃厚カルボナーラ",
    servings: 2,
    summary: "生クリーム不使用！卵黄と粉チーズの乳化だけで仕上げる本格濃厚パスタ。",
    prepTime: "5分",
    cookTime: "12分",
    thumbnail: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=wNlQp2G59x8",
    ingredients: [
      { name: "パスタ (1.8mm前後)", amount: "200g", numericAmount: 200, unit: "g", category: "pantry_other", defaultSub: "フェットチーネ、スパゲッティ" },
      { name: "ブロックベーコン (またはパンチェッタ)", amount: "80g", numericAmount: 80, unit: "g", category: "meat_fish", defaultSub: "ハーフベーコン、ウインナー" },
      { name: "卵黄", amount: "3個分", numericAmount: 3, unit: "個", category: "dairy_egg", defaultSub: "全卵2個でも代用可" },
      { name: "全卵", amount: "1個", numericAmount: 1, unit: "個", category: "dairy_egg", defaultSub: "卵黄のみでも濃厚" }
    ],
    seasonings: [
      { name: "粉チーズ (パルメザン)", amount: "大さじ4 (約30g)", numericAmount: 30, unit: "g", category: "dairy_egg", defaultSub: "ピザ用チーズを細かく刻む" },
      { name: "黒胡椒 (粗挽き)", amount: "小さじ1 (たっぷり)", numericAmount: 1, unit: "小さじ", category: "seasoning", defaultSub: "ブラックペッパー" },
      { name: "オリーブオイル", amount: "小さじ1", numericAmount: 1, unit: "小さじ", category: "seasoning", defaultSub: "サラダ油" },
      { name: "茹で塩", amount: "大さじ1 (湯1Lに対して1%)", numericAmount: 1, unit: "大さじ", category: "seasoning", defaultSub: "塩" }
    ],
    steps: [
      { step: 1, instruction: "ボウルに卵黄3個、全卵1個、粉チーズ、粗挽き黒胡椒を入れてよく混ぜ合わせて卵液を作っておく。", timerSeconds: 0 },
      { step: 2, instruction: "ベーコンを1cm幅の短冊切りにし、冷たいフライパンにオリーブオイルと共に入れて弱火でじっくり脂を引き出すようにカリッと炒める。", timerSeconds: 300 },
      { step: 3, instruction: "たっぷりのお湯に1%の塩を入れ、パスタを表示時間より1分短めに茹でる。", timerSeconds: 480 },
      { step: 4, instruction: "フライパンの火を完全に止め、茹で汁大さじ2と茹で上がったパスタを加えてベーコンの脂と絡める。粗熱が少し取れたら卵液を投入し、余熱で手早く混ぜてとろみをつける。", timerSeconds: 60 }
    ],
    proTips: "卵がダマ（炒り卵）にならない最大の秘訣は、パスタをフライパンに入れたら必ず【火を完全に消してから】卵液を投入することです。"
  },
  chicken_nanban: {
    title: "フライパン一つで！絶品ワンパンチキン南蛮",
    servings: 2,
    summary: "揚げずにカリッと香ばしく、特製甘酢ダレとごろごろ卵タルタルが絡む王道チキン南蛮。",
    prepTime: "10分",
    cookTime: "15分",
    thumbnail: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=sample-chicken",
    ingredients: [
      { name: "鶏もも肉 (またはむね肉)", amount: "300g (1枚)", numericAmount: 300, unit: "g", category: "meat_fish", defaultSub: "鶏むね肉、ささみ" },
      { name: "ゆで卵", amount: "2個", numericAmount: 2, unit: "個", category: "dairy_egg", defaultSub: "スクランブルエッグ" },
      { name: "玉ねぎ", amount: "1/4個", numericAmount: 0.25, unit: "個", category: "vegetable", defaultSub: "らっきょう、ピクルス" }
    ],
    seasonings: [
      { name: "醤油 (甘酢用)", amount: "大さじ2", numericAmount: 2, unit: "大さじ", category: "seasoning", defaultSub: "めんつゆ" },
      { name: "酢 (甘酢用)", amount: "大さじ2", numericAmount: 2, unit: "大さじ", category: "seasoning", defaultSub: "黒酢、レモン汁" },
      { name: "砂糖 (甘酢用)", amount: "大さじ2", numericAmount: 2, unit: "大さじ", category: "seasoning", defaultSub: "はちみつ" },
      { name: "マヨネーズ (タルタル用)", amount: "大さじ4", numericAmount: 4, unit: "大さじ", category: "seasoning", defaultSub: "ヨーグルト＋オリーブ油" },
      { name: "片栗粉 (肉まぶし用)", amount: "大さじ2", numericAmount: 2, unit: "大さじ", category: "pantry_other", defaultSub: "小麦粉" }
    ],
    steps: [
      { step: 1, instruction: "ゆで卵を粗く潰し、みじん切りにして水にさらした玉ねぎ、マヨネーズ、塩胡椒、砂糖小さじ1/2を混ぜてタルタルソースを作る。", timerSeconds: 0 },
      { step: 2, instruction: "鶏肉は一口大の削ぎ切りにして塩胡椒少々を振り、片栗粉を全体に薄くまぶす。", timerSeconds: 0 },
      { step: 3, instruction: "フライパンに油大さじ2を熱し、鶏肉を皮目から中火で焼き、両面こんがりきつね色になるまで火を通す。", timerSeconds: 360 },
      { step: 4, instruction: "余分な油をペーパーで拭き取り、醤油・酢・砂糖を合わせた甘酢ダレを回し入れ、強火でタレがとろっと絡むまで煮詰める。", timerSeconds: 90 }
    ],
    proTips: "タレを入れる前にフライパンの余分な油をキッチンペーパーでしっかり拭き取ることで、タレが油っぽくならずしっかりお肉に絡みます。"
  },
  mapo_tofu: {
    title: "痺れる辛さ！本格四川麻婆豆腐",
    servings: 2,
    summary: "花椒の香りと豆板醤のコクが豆腐に染み渡る、ご飯が止まらない本格麻婆。",
    prepTime: "10分",
    cookTime: "12分",
    thumbnail: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=sample-mapo",
    ingredients: [
      { name: "木綿豆腐", amount: "1丁 (350g)", numericAmount: 350, unit: "g", category: "dairy_egg", defaultSub: "絹豆腐でも可（湯通し必須）" },
      { name: "豚ひき肉", amount: "120g", numericAmount: 120, unit: "g", category: "meat_fish", defaultSub: "合い挽き肉、鶏ひき肉" },
      { name: "長ネギ", amount: "1/2本 (みじん切り)", numericAmount: 0.5, unit: "本", category: "vegetable", defaultSub: "万能ねぎ、玉ねぎ" },
      { name: "にんにく・生姜", amount: "各1かけ (みじん切り)", numericAmount: 1, unit: "かけ", category: "vegetable", defaultSub: "チューブ各小さじ1" }
    ],
    seasonings: [
      { name: "豆板醤 (トウバンジャン)", amount: "大さじ1", numericAmount: 1, unit: "大さじ", category: "seasoning", defaultSub: "味噌 大さじ1 ＋ 一味唐辛子 小さじ1/2" },
      { name: "甜麺醤 (テンメンジャン)", amount: "大さじ1", numericAmount: 1, unit: "大さじ", category: "seasoning", defaultSub: "味噌 大さじ1 ＋ 砂糖 小さじ1 ＋ 醤油 少々" },
      { name: "鶏ガラスープの素", amount: "小さじ1 (水150mlで溶かす)", numericAmount: 1, unit: "小さじ", category: "seasoning", defaultSub: "味覇、中華だし" },
      { name: "花椒粉 (ホワジャオ)", amount: "小さじ1/2 (お好みで)", numericAmount: 0.5, unit: "小さじ", category: "seasoning", defaultSub: "山椒粉、黒胡椒" },
      { name: "水溶き片栗粉", amount: "片栗粉大さじ1＋水大さじ2", numericAmount: 1, unit: "組", category: "pantry_other", defaultSub: "片栗粉" }
    ],
    steps: [
      { step: 1, instruction: "豆腐は2cm角に切り、塩少々を入れたお湯で2分下茹でしてザルにあげて水気を切っておく（崩れ防止＆プルプル食感）。", timerSeconds: 120 },
      { step: 2, instruction: "フライパンに油を熱し、弱火でひき肉をポロポロになるまでじっくり炒め、脂が透き通ったら豆板醤・甜麺醤・にんにく・生姜を加えて香りを出す。", timerSeconds: 180 },
      { step: 3, instruction: "スープ（水150ml＋鶏ガラ）と醤油小さじ1、酒大さじ1を加え、沸騰したら豆腐を入れて中火で2分煮込む。", timerSeconds: 120 },
      { step: 4, instruction: "長ネギを加え、火を弱めて水溶き片栗粉を回し入れる。強火にしてグツグツさせとろみを焼き固め、仕上げにごま油と花椒粉を振る。", timerSeconds: 60 }
    ],
    proTips: "豆腐を塩入りのお湯で事前にサッと下茹ですることで、余分な水分が抜けて味が染み込みやすくなり、炒めても崩れなくなります！"
  }
};

// Common pantry substitution knowledge base (instant lookup)
const INSTANT_SUBS = {
  "みりん": {
    name: "料理酒 大さじ1 ＋ 砂糖 小さじ1",
    ratio: "みりん大さじ1に対して同量置き換え",
    flavorNote: "自然な甘みとコクが再現できます。照り焼きのツヤは砂糖が補ってくれます。",
    skipAdvice: "煮物やタレの場合、少し甘みを足すために砂糖を増量すれば省略も可能です。"
  },
  "酒": {
    name: "白ワイン または 水 ＋ レモン汁少々",
    ratio: "同量",
    flavorNote: "お肉の臭み消しや柔らかくする効果は白ワインでも十分に代用できます。",
    skipAdvice: "和食の場合は水だけでも代用可能です。"
  },
  "豆板醤": {
    name: "味噌 大さじ1 ＋ 一味唐辛子 小さじ1/2 ＋ 醤油少々",
    ratio: "豆板醤大さじ1に対して",
    flavorNote: "発酵した大豆の旨味とピリッとした辛味を日本の味噌と唐辛子で再現できます。",
    skipAdvice: "辛いものが苦手な場合は、そのまま味噌や醤油だけで作ればマイルドになります。"
  },
  "甜麺醤": {
    name: "赤味噌（または味噌）大さじ1 ＋ 砂糖 小さじ1 ＋ ごま油 少々 ＋ 醤油 少々",
    ratio: "甜麺醤大さじ1に対して",
    flavorNote: "甘みとコクのある中華甘味噌の風味が完璧に再現できます。",
    skipAdvice: "すき焼きのタレや焼き肉のタレでも代用できます。"
  },
  "生クリーム": {
    name: "牛乳 100ml ＋ バター 10〜15g",
    ratio: "生クリーム100mlに対して",
    flavorNote: "乳脂肪分が補われ、パスタやシチューに十分なコクとクリーミーさが出ます。",
    skipAdvice: "さっぱり仕上げたい時は牛乳のみ、または豆乳でも代用可能です。"
  },
  "オイスターソース": {
    name: "醤油 大さじ1 ＋ 砂糖 小さじ1 ＋ 鶏ガラスープの素 少々",
    ratio: "オイスターソース大さじ1に対して",
    flavorNote: "牡蠣のエキスの代わりに鶏ガラと砂糖で濃厚なコクと旨味を補います。",
    skipAdvice: "ウスターソース＋醤油でも近い深みが出せます。"
  },
  "白だし": {
    name: "めんつゆ（3倍濃縮）大さじ1 ＋ 塩 ひとつまみ ＋ 水 大さじ2",
    ratio: "色が濃くなる点以外は風味同等",
    flavorNote: "色は薄くなりませんが、出汁と醤油の旨味はしっかり出ます。",
    skipAdvice: "和風顆粒だし小さじ1＋塩小さじ1/3＋水でもOKです。"
  },
  "バター": {
    name: "オリーブオイル または サラダ油（80%の量）",
    ratio: "バター10gに対して油8g",
    flavorNote: "コクは軽やかになりますが、炒め物や焼き菓子に問題なく使用できます。",
    skipAdvice: "マーガリンがあれば同量で代用可能です。"
  }
};

// Supermarket Aisle Definition
const CATEGORY_MAP = {
  vegetable: { name: "野菜・きのこ・果物", badgeClass: "vegetable", icon: "🥬" },
  meat_fish: { name: "お肉・お魚・海鮮", badgeClass: "meat_fish", icon: "🥩" },
  dairy_egg: { name: "卵・乳製品・豆腐・納豆", badgeClass: "dairy_egg", icon: "🧀" },
  seasoning: { name: "調味料・油・スパイス", badgeClass: "seasoning", icon: "🧂" },
  pantry_other: { name: "乾物・麺・お米・その他", badgeClass: "pantry_other", icon: "🥫" }
};

// State Store
class AppState {
  constructor() {
    this.currentRecipe = null;
    this.baseServings = 2;
    this.selectedServings = 2;
    this.shoppingChecked = {}; // { [itemName]: boolean }
    this.filterUnboughtOnly = false;
    this.savedRecipes = this.loadSavedRecipes();
  }

  loadSavedRecipes() {
    try {
      const data = localStorage.getItem('recipe_pocket_saved_v1');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveSavedRecipes() {
    try {
      localStorage.setItem('recipe_pocket_saved_v1', JSON.stringify(this.savedRecipes));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  async syncWithServer() {
    try {
      const res = await fetch('/api/saved-recipes');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.recipes)) {
          const map = new Map();
          // First add server recipes
          data.recipes.forEach(r => {
            if (r.title) map.set(r.title, r);
          });
          // Then merge local recipes if not present
          this.savedRecipes.forEach(r => {
            if (r.title && !map.has(r.title)) {
              map.set(r.title, r);
              // Sync local item to server in background
              fetch('/api/saved-recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipe: r })
              }).catch(() => {});
            }
          });
          this.savedRecipes = Array.from(map.values());
          this.saveSavedRecipes();
          if (typeof updateSavedBadge === 'function') updateSavedBadge();
          if (typeof updateBookmarkButton === 'function') updateBookmarkButton();
        }
      }
    } catch (e) {
      console.warn('[Sync] Server DB sync warning:', e.message);
    }
  }

  isRecipeBookmarked(title) {
    if (!title) return false;
    return this.savedRecipes.some(r => r.title === title);
  }

  toggleBookmark(recipe) {
    if (!recipe || !recipe.title) return false;
    const idx = this.savedRecipes.findIndex(r => r.title === recipe.title);
    if (idx >= 0) {
      const removed = this.savedRecipes.splice(idx, 1)[0];
      this.saveSavedRecipes();
      if (typeof updateSavedBadge === 'function') updateSavedBadge();
      // Server sync delete
      const idOrTitle = removed.id || removed.title;
      fetch(`/api/saved-recipes/${encodeURIComponent(idOrTitle)}`, { method: 'DELETE' }).catch(() => {});
      return false;
    } else {
      const newEntry = {
        ...recipe,
        id: recipe.id || `recipe-${Date.now()}`,
        savedAt: new Date().toISOString()
      };
      this.savedRecipes.unshift(newEntry);
      this.saveSavedRecipes();
      if (typeof updateSavedBadge === 'function') updateSavedBadge();
      // Server sync save
      fetch('/api/saved-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe: newEntry })
      }).catch(() => {});
      return true;
    }
  }

  deleteSavedRecipe(index) {
    if (index >= 0 && index < this.savedRecipes.length) {
      const removed = this.savedRecipes.splice(index, 1)[0];
      this.saveSavedRecipes();
      if (typeof updateSavedBadge === 'function') updateSavedBadge();
      const idOrTitle = removed.id || removed.title;
      fetch(`/api/saved-recipes/${encodeURIComponent(idOrTitle)}`, { method: 'DELETE' }).catch(() => {});
    }
  }
}

const state = new AppState();

// DOM Selectors
const el = {
  urlForm: document.getElementById('url-form'),
  recipeUrl: document.getElementById('recipe-url'),
  btnPasteClipboard: document.getElementById('btn-paste-clipboard'),
  btnExtract: document.getElementById('btn-extract'),
  btnExtractText: document.getElementById('btn-extract-text'),
  btnSearchYt: document.getElementById('btn-search-yt'),
  btnToggleManual: document.getElementById('btn-toggle-manual'),
  manualPanel: document.getElementById('manual-input-panel'),
  manualRecipeText: document.getElementById('manual-recipe-text'),
  btnExtractManual: document.getElementById('btn-extract-manual'),

  // YouTube In-App Search Results Section
  searchResultsSection: document.getElementById('search-results-section'),
  searchResultsTitle: document.getElementById('search-results-title'),
  searchResultsGrid: document.getElementById('search-results-grid'),
  btnCloseSearch: document.getElementById('btn-close-search'),
  backToSearchBar: document.getElementById('back-to-search-bar'),
  btnBackToSearch: document.getElementById('btn-back-to-search'),
  backToSearchText: document.getElementById('back-to-search-text'),

  loadingState: document.getElementById('loading-state'),
  loadingMessage: document.getElementById('loading-message'),
  recipeDisplay: document.getElementById('recipe-display'),
  emptyState: document.getElementById('empty-state'),

  // Recipe Hero & Player
  recipeThumbBox: document.getElementById('recipe-thumb-container'),
  recipeThumbWrapper: document.getElementById('recipe-thumb-wrapper'),
  recipeThumbImg: document.getElementById('recipe-thumb-img'),
  btnPlayInline: document.getElementById('btn-play-inline'),
  recipePlayerWrapper: document.getElementById('recipe-player-wrapper'),
  youtubePlayerIframe: document.getElementById('youtube-player-iframe'),
  btnFloatPlayer: document.getElementById('btn-float-player'),
  btnPlayerBackSearch: document.getElementById('btn-player-back-search'),
  btnOpenYoutubeExternal: document.getElementById('btn-open-youtube-external'),
  btnClosePlayer: document.getElementById('btn-close-player'),
  recipePrepTime: document.getElementById('recipe-prep-time'),
  recipeCookTime: document.getElementById('recipe-cook-time'),
  recipeSourceBadge: document.getElementById('recipe-source-badge'),
  btnBookmark: document.getElementById('btn-bookmark-recipe'),
  btnBookmarkLabel: document.getElementById('btn-bookmark-label'),
  recipeTitle: document.getElementById('recipe-title'),
  recipeSummary: document.getElementById('recipe-summary'),

  // Servings
  servingBtns: document.querySelectorAll('.serving-btn'),

  // Tabs
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabPanels: document.querySelectorAll('.tab-panel'),
  shoppingCounter: document.getElementById('shopping-counter'),

  // Tab 1: Shopping
  shoppingCategoriesContainer: document.getElementById('shopping-categories-container'),
  shoppingRemainText: document.getElementById('shopping-remain-text'),
  btnCopyShopping: document.getElementById('btn-copy-shopping'),
  btnToggleUnbought: document.getElementById('btn-toggle-unbought'),
  btnResetShopping: document.getElementById('btn-reset-shopping'),

  // Tab 2: Ingredients
  ingredientsList: document.getElementById('ingredients-list'),
  seasoningsList: document.getElementById('seasonings-list'),
  recipeProtipsContainer: document.getElementById('recipe-protips-container'),
  recipeProtipsText: document.getElementById('recipe-protips-text'),

  // Tab 3: Steps
  stepsTimeline: document.getElementById('steps-timeline'),

  // Tab 4: Substitute
  substituteTagsCloud: document.getElementById('substitute-tags-cloud'),
  substituteResultCard: document.getElementById('substitute-result-card'),
  subTargetName: document.getElementById('sub-target-name'),
  subOptionsList: document.getElementById('sub-options-list'),
  subSkipAdvice: document.getElementById('sub-skip-advice'),
  aiChatInput: document.getElementById('ai-chat-input'),
  btnSendAiChat: document.getElementById('btn-send-ai-chat'),
  aiChatResponse: document.getElementById('ai-chat-response'),

  // Modals
  btnOpenSaved: document.getElementById('btn-open-saved'),
  savedCountBadge: document.getElementById('saved-count-badge'),
  modalSaved: document.getElementById('modal-saved'),
  btnCloseSaved: document.getElementById('btn-close-saved'),
  savedRecipesList: document.getElementById('saved-recipes-list'),

  modalSubQuick: document.getElementById('modal-substitute-quick'),
  btnCloseSubModal: document.getElementById('btn-close-sub-modal'),
  modalSubTitle: document.getElementById('modal-sub-title'),
  modalSubContent: document.getElementById('modal-sub-content'),

  btnSettings: document.getElementById('btn-settings'),
  modalSettings: document.getElementById('modal-settings'),
  btnCloseSettings: document.getElementById('btn-close-settings'),
  customApiKey: document.getElementById('custom-api-key'),
  btnSaveKey: document.getElementById('btn-save-key'),
  btnClearAllData: document.getElementById('btn-clear-all-data'),

  toastContainer: document.getElementById('toast-container')
};

// Toast Notifications Helper
function showToast(message, icon = '✨') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  el.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 260);
  }, 2800);
}

// Format Quantity based on serving multiplier
function formatScaledAmount(item, multiplier) {
  if (!item.numericAmount || multiplier === 1) {
    return item.amount;
  }
  const scaledNum = Math.round(item.numericAmount * multiplier * 10) / 10;
  // If original string has parenthetical notes like "(150g)"
  if (item.unit) {
    return `${scaledNum}${item.unit}`;
  }
  return `${scaledNum}`;
}

// Helper to extract YouTube video ID
function extractYouTubeId(url) {
  if (!url) return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|feature=player_embedded&v=))([^#&?]*)/;
  const match = url.match(regExp);
  return (match && match[1].length === 11) ? match[1] : null;
}

// Embedded YouTube Player Controls
function playEmbeddedVideo(videoId) {
  if (!videoId) return;
  const targetSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
  if (el.youtubePlayerIframe.src !== targetSrc) {
    el.youtubePlayerIframe.src = targetSrc;
  }
  el.recipeThumbWrapper.style.display = 'none';
  el.recipePlayerWrapper.style.display = 'flex';
  showToast('動画の再生を開始しました', '▶️');
}

function closeEmbeddedVideo() {
  if (el.youtubePlayerIframe) {
    el.youtubePlayerIframe.src = '';
  }
  if (el.recipePlayerWrapper) {
    el.recipePlayerWrapper.classList.remove('floating-mini');
    el.recipePlayerWrapper.style.display = 'none';
  }
  if (el.recipeThumbWrapper) {
    el.recipeThumbWrapper.style.display = 'block';
  }
}

function toggleFloatingPlayer() {
  const isFloating = el.recipePlayerWrapper.classList.toggle('floating-mini');
  showToast(isFloating ? 'ミニプレイヤーで画面右下に固定しました' : '通常表示に戻しました', '📌');
}

// Render Inline Extracting Skeleton in Shopping & Ingredients Tabs
function renderExtractingSkeleton() {
  if (el.shoppingCounter) {
    el.shoppingCounter.textContent = '...';
  }
  if (el.shoppingRemainText) {
    el.shoppingRemainText.textContent = 'AI抽出中...';
  }
  if (el.shoppingCategoriesContainer) {
    el.shoppingCategoriesContainer.innerHTML = `
      <div class="ai-skeleton-card">
        <div class="ai-skeleton-header">
          <div class="loading-spinner-sm"></div>
          <div>
            <div class="ai-skeleton-title">AIが動画を見ながら食材・調味料を抽出中...</div>
            <div class="ai-skeleton-subtitle">動画はそのまま再生されます。スーパーの売り場別に自動仕分けしてここに表示します。</div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
          <div class="skeleton-shimmer-box" style="height: 48px;"></div>
          <div class="skeleton-shimmer-box" style="height: 48px;"></div>
          <div class="skeleton-shimmer-box" style="height: 48px;"></div>
        </div>
      </div>
    `;
  }
  if (el.ingredientsList) {
    el.ingredientsList.innerHTML = `
      <div class="skeleton-shimmer-box" style="height: 36px; margin-bottom: 8px;"></div>
      <div class="skeleton-shimmer-box" style="height: 36px; margin-bottom: 8px;"></div>
      <div class="skeleton-shimmer-box" style="height: 36px;"></div>
    `;
  }
}

// Render Recipe to UI
function renderRecipe(recipe, keepPlayerRunning = false) {
  state.currentRecipe = recipe;
  state.baseServings = recipe.servings || 2;
  state.selectedServings = state.baseServings;
  state.shoppingChecked = {};

  // Update Hero Card
  el.recipeTitle.textContent = recipe.title;
  el.recipeSummary.textContent = recipe.summary || '美味しい家庭料理レシピ';
  el.recipePrepTime.textContent = `⏱️ 下準備 ${recipe.prepTime || '10分'}`;
  el.recipeCookTime.textContent = `🍳 調理 ${recipe.cookTime || '15分'}`;

  // Source Badge (Audio subtitles vs External link vs Description)
  if (el.recipeSourceBadge) {
    if (recipe.sourceInfo) {
      el.recipeSourceBadge.textContent = `✨ ${recipe.sourceInfo}`;
      el.recipeSourceBadge.style.display = 'inline-flex';
    } else {
      el.recipeSourceBadge.style.display = 'none';
    }
  }

  const videoId = extractYouTubeId(recipe.videoUrl);

  // Reset and setup player only if NOT already actively playing
  if (!keepPlayerRunning) {
    closeEmbeddedVideo();
    if (recipe.thumbnail) {
      el.recipeThumbImg.src = recipe.thumbnail;
      el.recipeThumbBox.style.display = 'block';
      el.recipeThumbWrapper.style.display = 'block';
    } else {
      el.recipeThumbBox.style.display = 'none';
    }
  } else {
    // Keep player actively visible and thumb wrapper hidden
    if (el.recipePlayerWrapper) el.recipePlayerWrapper.style.display = 'flex';
    if (el.recipeThumbWrapper) el.recipeThumbWrapper.style.display = 'none';
  }

  // Setup inline play button
  if (videoId) {
    el.btnPlayInline.style.display = 'flex';
    el.btnPlayInline.onclick = (e) => {
      e.stopPropagation();
      playEmbeddedVideo(videoId);
    };
    el.recipeThumbWrapper.onclick = () => {
      playEmbeddedVideo(videoId);
    };
  } else {
    el.btnPlayInline.style.display = 'none';
    el.recipeThumbWrapper.onclick = null;
  }

  // Update Bookmark Button state
  updateBookmarkButton();

  // Update Servings Buttons
  updateServingsUI();

  // Render Tabs
  renderShoppingList();
  renderIngredientsTab();
  renderStepsTab();
  renderSubstituteTab();

  // Show Recipe Display, Hide Loading & Empty
  el.loadingState.style.display = 'none';
  el.emptyState.style.display = 'none';
  el.recipeDisplay.style.display = 'flex';

  // Smooth scroll to recipe card only if not already watching
  if (!keepPlayerRunning) {
    el.recipeDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Update Servings UI State
function updateServingsUI() {
  el.servingBtns.forEach(btn => {
    const s = parseInt(btn.getAttribute('data-servings'), 10);
    btn.classList.toggle('active', s === state.selectedServings);
  });
}

// Render Shopping Mode (Grouped by Supermarket Aisle)
function renderShoppingList() {
  if (!state.currentRecipe) return;

  const multiplier = state.selectedServings / state.baseServings;
  const allItems = [
    ...(state.currentRecipe.ingredients || []).map(i => ({ ...i, isSeasoning: false })),
    ...(state.currentRecipe.seasonings || []).map(s => ({ ...s, isSeasoning: true }))
  ];

  // Group by category
  const groups = {
    vegetable: [],
    meat_fish: [],
    dairy_egg: [],
    seasoning: [],
    pantry_other: []
  };

  allItems.forEach(item => {
    let cat = item.category || (item.isSeasoning ? 'seasoning' : 'pantry_other');
    if (!groups[cat]) cat = 'pantry_other';
    groups[cat].push(item);
  });

  el.shoppingCategoriesContainer.innerHTML = '';
  let totalCount = 0;
  let remainCount = 0;

  Object.entries(groups).forEach(([catKey, items]) => {
    if (items.length === 0) return;

    const catMeta = CATEGORY_MAP[catKey] || CATEGORY_MAP.pantry_other;
    const aisleCard = document.createElement('div');
    aisleCard.className = 'aisle-card';

    const unboughtItems = items.filter(it => !state.shoppingChecked[it.name]);
    if (state.filterUnboughtOnly && unboughtItems.length === 0) {
      return; // Hide empty aisle if filtering
    }

    aisleCard.innerHTML = `
      <div class="aisle-header">
        <div class="aisle-title-group">
          <span class="aisle-badge ${catMeta.badgeClass}">${catMeta.icon} ${catMeta.name}</span>
        </div>
        <span class="aisle-count">${items.length}品</span>
      </div>
      <div class="aisle-items-list" id="aisle-items-${catKey}"></div>
    `;

    const itemsContainer = aisleCard.querySelector(`#aisle-items-${catKey}`);

    items.forEach(item => {
      totalCount++;
      const isChecked = Boolean(state.shoppingChecked[item.name]);
      if (!isChecked) remainCount++;

      if (state.filterUnboughtOnly && isChecked) return;

      const scaledAmt = formatScaledAmount(item, multiplier);

      const row = document.createElement('div');
      row.className = `shopping-item-row ${isChecked ? 'checked' : ''}`;
      row.setAttribute('data-name', item.name);

      row.innerHTML = `
        <div class="custom-checkbox">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="item-details">
          <span class="item-name">${item.name}</span>
          <span class="item-amount">${scaledAmt}</span>
        </div>
        <button type="button" class="btn-sub-trigger" title="代用を調べる" data-sub="${item.name}">
          💡 代用
        </button>
      `;

      // Toggle check on row click (excluding the sub button)
      row.addEventListener('click', (e) => {
        if (e.target.closest('.btn-sub-trigger')) return;
        state.shoppingChecked[item.name] = !state.shoppingChecked[item.name];
        renderShoppingList();
      });

      // Quick sub button click
      const subBtn = row.querySelector('.btn-sub-trigger');
      subBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerQuickSubstitute(item.name);
      });

      itemsContainer.appendChild(row);
    });

    el.shoppingCategoriesContainer.appendChild(aisleCard);
  });

  // Update Counters
  el.shoppingCounter.textContent = remainCount;
  el.shoppingRemainText.textContent = `残り ${remainCount} / ${totalCount} 点`;
}

// Render Ingredients Tab
function renderIngredientsTab() {
  if (!state.currentRecipe) return;

  const multiplier = state.selectedServings / state.baseServings;

  // Render Main Ingredients
  el.ingredientsList.innerHTML = '';
  (state.currentRecipe.ingredients || []).forEach(item => {
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    const scaledAmt = formatScaledAmount(item, multiplier);
    row.innerHTML = `
      <div class="ing-name-group">
        <span class="item-name">${item.name}</span>
      </div>
      <div class="ing-amount-group">
        <span class="item-amount">${scaledAmt}</span>
        <button type="button" class="btn-sub-trigger" data-sub="${item.name}">💡 代用</button>
      </div>
    `;
    row.querySelector('.btn-sub-trigger').addEventListener('click', () => {
      triggerQuickSubstitute(item.name);
    });
    el.ingredientsList.appendChild(row);
  });

  // Render Seasonings
  el.seasoningsList.innerHTML = '';
  (state.currentRecipe.seasonings || []).forEach(item => {
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    const scaledAmt = formatScaledAmount(item, multiplier);
    row.innerHTML = `
      <div class="ing-name-group">
        <span class="item-name">${item.name}</span>
      </div>
      <div class="ing-amount-group">
        <span class="item-amount">${scaledAmt}</span>
        <button type="button" class="btn-sub-trigger" data-sub="${item.name}">💡 代用</button>
      </div>
    `;
    row.querySelector('.btn-sub-trigger').addEventListener('click', () => {
      triggerQuickSubstitute(item.name);
    });
    el.seasoningsList.appendChild(row);
  });

  // Pro Tips
  if (state.currentRecipe.proTips) {
    el.recipeProtipsText.textContent = state.currentRecipe.proTips;
    el.recipeProtipsContainer.style.display = 'block';
  } else {
    el.recipeProtipsContainer.style.display = 'none';
  }
}

// Render Cooking Steps Tab
function renderStepsTab() {
  if (!state.currentRecipe) return;

  el.stepsTimeline.innerHTML = '';
  (state.currentRecipe.steps || []).forEach(step => {
    const card = document.createElement('div');
    card.className = 'step-card';
    
    let timerBtnHtml = '';
    if (step.timerSeconds && step.timerSeconds > 0) {
      const mins = Math.floor(step.timerSeconds / 60);
      const secs = step.timerSeconds % 60;
      const label = mins > 0 ? `${mins}分${secs > 0 ? secs + '秒' : ''}` : `${secs}秒`;
      timerBtnHtml = `
        <button class="step-timer-btn" data-seconds="${step.timerSeconds}">
          ⏱️ タイマー ${label}
        </button>
      `;
    }

    card.innerHTML = `
      <div class="step-number">${step.step}</div>
      <div class="step-body">
        <p class="step-text">${step.instruction}</p>
        ${timerBtnHtml}
      </div>
    `;

    const timerBtn = card.querySelector('.step-timer-btn');
    if (timerBtn) {
      timerBtn.addEventListener('click', () => {
        startStepTimer(timerBtn, step.timerSeconds);
      });
    }

    el.stepsTimeline.appendChild(card);
  });
}

// Simple In-App Step Timer
function startStepTimer(btn, duration) {
  let remaining = duration;
  btn.disabled = true;
  btn.style.background = 'rgba(245, 158, 11, 0.2)';
  btn.style.color = '#fbbf24';

  const interval = setInterval(() => {
    remaining--;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    btn.innerHTML = `⏳ ${mins}:${secs < 10 ? '0' : ''}${secs}`;

    if (remaining <= 0) {
      clearInterval(interval);
      btn.innerHTML = `🔔 時間になりました！`;
      btn.style.background = 'rgba(16, 185, 129, 0.3)';
      btn.style.color = '#10b981';
      showToast('タイマーが鳴りました！次の手順へ進みましょう 🍳', '⏰');
      // Beep audio if supported
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {
        console.warn('AudioContext not supported');
      }
    }
  }, 1000);
}

// Render AI Substitute Tab
function renderSubstituteTab() {
  if (!state.currentRecipe) return;

  el.substituteTagsCloud.innerHTML = '';
  const allItems = [
    ...(state.currentRecipe.ingredients || []),
    ...(state.currentRecipe.seasonings || [])
  ];

  allItems.forEach(item => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'sub-tag-chip';
    chip.textContent = item.name;
    chip.addEventListener('click', () => {
      fetchOrShowSubstitute(item.name);
    });
    el.substituteTagsCloud.appendChild(chip);
  });
}

// Quick Substitute Modal Trigger
function triggerQuickSubstitute(ingredientName) {
  el.modalSubTitle.textContent = `「${ingredientName}」の代用アイデア`;
  el.modalSubContent.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div class="loading-spinner" style="margin: 0 auto 10px;"></div>
      <p style="font-size: 13px; color: var(--text-secondary);">最適な配合比率と代替品を調査中...</p>
    </div>
  `;
  el.modalSubQuick.style.display = 'flex';

  fetchSubstitutionData(ingredientName).then(data => {
    renderSubstituteModalContent(data);
  }).catch(err => {
    el.modalSubContent.innerHTML = `<p style="color: var(--accent-rose); font-size: 13px;">代用情報の取得に失敗しました: ${err.message}</p>`;
  });
}

// Tab 4 Substitute Fetch
function fetchOrShowSubstitute(ingredientName) {
  el.subTargetName.textContent = ingredientName;
  el.subOptionsList.innerHTML = `<div class="loading-spinner" style="margin: 20px auto;"></div>`;
  el.subSkipAdvice.textContent = '';
  el.substituteResultCard.style.display = 'block';
  el.substituteResultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  fetchSubstitutionData(ingredientName).then(data => {
    el.subOptionsList.innerHTML = '';
    (data.substitutes || []).forEach(sub => {
      const item = document.createElement('div');
      item.className = 'sub-option-item';
      item.innerHTML = `
        <div class="sub-opt-name">${sub.name}</div>
        <div class="sub-opt-ratio">比率: ${sub.ratio}</div>
        <div class="sub-opt-note">${sub.flavorNote || ''} ${sub.bestFor ? `(向いている調理: ${sub.bestFor})` : ''}</div>
      `;
      el.subOptionsList.appendChild(item);
    });
    el.subSkipAdvice.textContent = data.skipAdvice ? `💡 ${data.skipAdvice}` : '入れなくてもベースの味付けがしっかりしていれば美味しく仕上がります。';
  }).catch(err => {
    el.subOptionsList.innerHTML = `<p style="color: var(--accent-rose); font-size: 13px;">取得失敗: ${err.message}</p>`;
  });
}

// Fetch substitute data from instant dict or server API
async function fetchSubstitutionData(ingredientName) {
  // Check instant dict first
  for (const [key, val] of Object.entries(INSTANT_SUBS)) {
    if (ingredientName.includes(key)) {
      return {
        ingredient: ingredientName,
        substitutes: [{
          name: val.name,
          ratio: val.ratio,
          flavorNote: val.flavorNote,
          bestFor: "家庭料理全般"
        }],
        skipAdvice: val.skipAdvice
      };
    }
  }

  // Call API for dynamic AI generation
  const customKey = localStorage.getItem('recipe_pocket_custom_gemini_key') || '';
  const response = await fetch('/api/ai-substitute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ingredientName,
      dishContext: state.currentRecipe?.title || '家庭料理',
      customApiKey: customKey
    })
  });

  if (!response.ok) {
    throw new Error('サーバー通信エラー');
  }

  const resJson = await response.json();
  return resJson.data;
}

function renderSubstituteModalContent(data) {
  el.modalSubContent.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'sub-options-list';

  (data.substitutes || []).forEach(sub => {
    const item = document.createElement('div');
    item.className = 'sub-option-item';
    item.innerHTML = `
      <div class="sub-opt-name">${sub.name}</div>
      <div class="sub-opt-ratio">比率: ${sub.ratio}</div>
      <div class="sub-opt-note">${sub.flavorNote || ''}</div>
    `;
    list.appendChild(item);
  });

  if (data.skipAdvice) {
    const skipBox = document.createElement('div');
    skipBox.className = 'sub-skip-box';
    skipBox.textContent = `💡 ${data.skipAdvice}`;
    list.appendChild(skipBox);
  }

  el.modalSubContent.appendChild(list);
}

// Update Bookmark Button state
function updateBookmarkButton() {
  if (!state.currentRecipe) return;
  const isBookmarked = state.isRecipeBookmarked(state.currentRecipe.title);
  el.btnBookmark.classList.toggle('bookmarked', isBookmarked);
  el.btnBookmarkLabel.textContent = isBookmarked ? '保存済み' : '保存';
  updateSavedBadge();
}

function updateSavedBadge() {
  if (!el.savedCountBadge) return;
  const count = state.savedRecipes.length;
  if (count > 0) {
    el.savedCountBadge.textContent = count > 99 ? '99+' : count;
    el.savedCountBadge.style.display = 'inline-flex';
  } else {
    el.savedCountBadge.style.display = 'none';
  }
}

// Render Saved Recipes in Modal
function renderSavedRecipesList() {
  el.savedRecipesList.innerHTML = '';
  if (state.savedRecipes.length === 0) {
    el.savedRecipesList.innerHTML = `
      <p style="text-align: center; color: var(--text-muted); padding: 30px 10px; font-size: 14px;">
        保存されたレシピはまだありません。<br>「保存」ボタンを押すとここに登録されます。
      </p>
    `;
    return;
  }

  state.savedRecipes.forEach((recipe, idx) => {
    const item = document.createElement('div');
    item.className = 'saved-recipe-item';
    const thumb = recipe.thumbnail || 'https://images.unsplash.com/photo-1547592180-85f173990554?w=200&auto=format&fit=crop&q=80';
    
    item.innerHTML = `
      <img src="${thumb}" alt="${recipe.title}" class="saved-thumb" />
      <div class="saved-info">
        <span class="saved-title">${recipe.title}</span>
        <span class="saved-date">${recipe.savedAt ? new Date(recipe.savedAt).toLocaleDateString('ja-JP') : '登録済み'} · ${recipe.ingredients?.length || 0}品</span>
      </div>
      <button class="btn-delete-saved" title="削除" data-index="${idx}">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;

    item.addEventListener('click', (e) => {
      if (e.target.closest('.btn-delete-saved')) return;
      renderRecipe(recipe);
      el.modalSaved.style.display = 'none';
      showToast(`「${recipe.title}」を読み込みました`);
    });

    const delBtn = item.querySelector('.btn-delete-saved');
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.deleteSavedRecipe(idx);
      renderSavedRecipesList();
      updateBookmarkButton();
      showToast('レシピを削除しました', '🗑️');
    });

    el.savedRecipesList.appendChild(item);
  });
}

// ----------------------------------------------------
// In-App YouTube Recipe Video Search
// ----------------------------------------------------
async function searchYouTube(query) {
  if (!query || !query.trim()) {
    showToast('検索キーワードを入力してください', '🔍');
    return;
  }

  el.loadingState.style.display = 'flex';
  el.loadingMessage.textContent = `YouTubeで「${query}」のレシピ動画を検索中...`;
  el.emptyState.style.display = 'none';

  try {
    const res = await fetch('/api/search-youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.trim() })
    });

    if (!res.ok) {
      throw new Error('動画の検索に失敗しました');
    }

    const data = await res.json();
    el.loadingState.style.display = 'none';

    if (!data.results || data.results.length === 0) {
      showToast('関連するレシピ動画が見つかりませんでした', '⚠️');
      return;
    }

    renderSearchResults(data.results, query);
    showToast(`${data.results.length}件のレシピ動画が見つかりました！`, '🎥');
  } catch (err) {
    el.loadingState.style.display = 'none';
    showToast(`検索エラー: ${err.message}`, '⚠️');
  }
}

function renderSearchResults(videos, query) {
  el.searchResultsTitle.textContent = `「${query}」のYouTubeレシピ動画 (${videos.length}件)`;
  el.searchResultsGrid.innerHTML = '';

  videos.forEach(video => {
    const card = document.createElement('div');
    card.className = 'search-video-card';

    card.innerHTML = `
      <div class="video-thumb-container" title="動画を再生">
        <img src="${video.thumbnail}" alt="${video.title}" class="video-thumb-img" loading="lazy" />
        ${video.length ? `<span class="video-duration-badge">${video.length}</span>` : ''}
      </div>
      <div class="video-meta-col">
        <div class="video-card-title" title="${video.title}">${video.title}</div>
        <div class="video-card-sub">
          <span>${video.channel}</span>
          ${video.views ? `<span>· ${video.views}</span>` : ''}
        </div>
        <div class="video-card-actions">
          <button type="button" class="btn-card-extract" title="この動画から材料と買い出しリストを自動抽出">
            <span>✨ レシピ抽出</span>
          </button>
          <button type="button" class="btn-card-preview" title="動画をプレビュー再生">
            <span>▶️ 再生</span>
          </button>
        </div>
      </div>
    `;

    // All actions on card immediately start video playback & background extraction!
    const handleAction = (e) => {
      e.stopPropagation();
      el.recipeUrl.value = video.videoUrl;
      startInstantVideoPlayAndExtract({
        videoId: video.videoId,
        videoUrl: video.videoUrl,
        title: video.title,
        channel: video.channel,
        thumbnail: video.thumbnail
      });
    };

    const btnExtract = card.querySelector('.btn-card-extract');
    const btnPreview = card.querySelector('.btn-card-preview');
    const thumbBox = card.querySelector('.video-thumb-container');
    const titleBox = card.querySelector('.video-card-title');

    btnExtract.addEventListener('click', handleAction);
    btnPreview.addEventListener('click', handleAction);
    thumbBox.addEventListener('click', handleAction);
    titleBox.addEventListener('click', handleAction);

    el.searchResultsGrid.appendChild(card);
  });

  el.searchResultsSection.style.display = 'flex';
  el.searchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Instant Play & Background Recipe Extraction (Zero Wait Time)
async function startInstantVideoPlayAndExtract({ videoId, videoUrl, title, channel, thumbnail }) {
  if (!videoId && videoUrl) {
    videoId = extractYouTubeId(videoUrl);
  }

  // 1. Hide search results to bring video to top, and show "Back to Search" button
  if (el.searchResultsSection && el.searchResultsSection.style.display !== 'none') {
    el.searchResultsSection.style.display = 'none';
    if (el.backToSearchBar) {
      el.backToSearchBar.style.display = 'flex';
      if (el.backToSearchText) {
        el.backToSearchText.textContent = '検索結果リストに戻る';
      }
    }
    if (el.btnPlayerBackSearch) {
      el.btnPlayerBackSearch.style.display = 'inline-flex';
    }
  }

  // 2. Hide full-screen blocking loading state & empty state completely!
  el.loadingState.style.display = 'none';
  el.emptyState.style.display = 'none';

  // 3. Immediately display the recipe container
  el.recipeDisplay.style.display = 'flex';

  // 4. Update hero metadata with available information immediately
  el.recipeTitle.textContent = title || 'レシピ動画を再生中';
  el.recipeSummary.textContent = channel ? `${channel} のレシピ動画` : 'AIが材料と調味料を解析中...';
  if (thumbnail) {
    el.recipeThumbImg.src = thumbnail;
    el.recipeThumbBox.style.display = 'block';
  }
  if (el.recipeSourceBadge) {
    el.recipeSourceBadge.textContent = '⏳ AI解析中...';
    el.recipeSourceBadge.style.display = 'inline-flex';
  }
  el.recipePrepTime.textContent = '⏱️ 解析中...';
  el.recipeCookTime.textContent = '🍳 解析中...';

  // 5. START PLAYING VIDEO IMMEDIATELY (0ms delay!)
  if (videoId) {
    playEmbeddedVideo(videoId);
  }

  // 6. Scroll smoothly to player
  el.recipeDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // 7. Show inline loading skeleton in tabs
  renderExtractingSkeleton();

  // 8. Run AI extraction in background
  try {
    const customKey = localStorage.getItem('recipe_pocket_custom_gemini_key') || '';

    // Step A: Scrape YouTube
    const scrapeRes = await fetch('/api/scrape-youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: videoUrl })
    });
    if (!scrapeRes.ok) throw new Error('動画情報の取得に失敗しました。');
    const ytData = await scrapeRes.json();

    // Step B: AI Extract
    const aiRes = await fetch('/api/ai-extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: ytData.title || title,
        text: ytData.description,
        customApiKey: customKey
      })
    });
    if (!aiRes.ok) {
      const err = await aiRes.json();
      throw new Error(err.error || 'AI解析に失敗しました。');
    }

    const aiData = await aiRes.json();
    const recipe = aiData.recipe;
    recipe.thumbnail = ytData.thumbnail || thumbnail;
    recipe.videoUrl = videoUrl;
    if (!recipe.sourceInfo && ytData.sourcesDetected && ytData.sourcesDetected.length > 0) {
      recipe.sourceInfo = `${ytData.sourcesDetected.join('・')}から抽出`;
    }

    // 9. Update recipe UI without interrupting the playing video!
    renderRecipe(recipe, true);
    showToast('材料と買い物リストを抽出しました！', '🎉');
  } catch (error) {
    console.error(error);
    showToast(`抽出エラー: ${error.message}`, '⚠️');
    if (el.shoppingCategoriesContainer) {
      el.shoppingCategoriesContainer.innerHTML = `
        <div class="ai-skeleton-card" style="border-color: rgba(244, 63, 94, 0.3);">
          <div style="color: var(--accent-rose); font-weight: 700;">⚠️ レシピの自動抽出に失敗しました</div>
          <div style="font-size: 13px; color: var(--text-muted);">${error.message}</div>
          <button type="button" class="btn-secondary" id="btn-retry-extract" style="margin-top: 8px; width: fit-content;">
            🔄 もう一度抽出を試す
          </button>
        </div>
      `;
      const retryBtn = document.getElementById('btn-retry-extract');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          startInstantVideoPlayAndExtract({ videoId, videoUrl, title, channel, thumbnail });
        });
      }
    }
  }
}
window.startInstantVideoPlayAndExtract = startInstantVideoPlayAndExtract;

// Extract Recipe from YouTube URL (routes to instant play if YouTube URL)
async function extractFromUrl(url) {
  const videoId = extractYouTubeId(url);
  if (videoId) {
    return startInstantVideoPlayAndExtract({ videoId, videoUrl: url });
  }

  el.loadingState.style.display = 'flex';
  el.recipeDisplay.style.display = 'none';
  el.emptyState.style.display = 'none';
  el.loadingMessage.textContent = '動画・Webページ情報を取得中...';

  try {
    const customKey = localStorage.getItem('recipe_pocket_custom_gemini_key') || '';

    // Step 1: Scrape YouTube
    const scrapeRes = await fetch('/api/scrape-youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!scrapeRes.ok) {
      throw new Error('動画情報の取得に失敗しました。URLをご確認ください。');
    }

    const ytData = await scrapeRes.json();
    
    // Provide smart feedback on what data was detected
    if (ytData.sourcesDetected && ytData.sourcesDetected.length > 0) {
      el.loadingMessage.textContent = `AIが解析中 (${ytData.sourcesDetected.join('＋')}を検出)...`;
    } else {
      el.loadingMessage.textContent = 'Gemini AIが材料と売り場を解析中...';
    }

    // Step 2: AI Extract
    const aiRes = await fetch('/api/ai-extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: ytData.title,
        text: ytData.description,
        customApiKey: customKey
      })
    });

    if (!aiRes.ok) {
      const err = await aiRes.json();
      throw new Error(err.error || 'AI解析に失敗しました。');
    }

    const aiData = await aiRes.json();
    const recipe = aiData.recipe;

    // Attach video metadata and detected source
    recipe.thumbnail = ytData.thumbnail;
    recipe.videoUrl = url;
    if (!recipe.sourceInfo && ytData.sourcesDetected && ytData.sourcesDetected.length > 0) {
      recipe.sourceInfo = `${ytData.sourcesDetected.join('・')}から抽出`;
    }

    renderRecipe(recipe, keepPlayerActive);

    showToast('材料と買い物リストを抽出しました！', '🎉');
  } catch (error) {
    console.error(error);
    el.loadingState.style.display = 'none';
    if (!keepPlayerActive) {
      el.emptyState.style.display = 'block';
    }
    showToast(`抽出エラー: ${error.message}`, '⚠️');
  }
}

// Extract Recipe from Direct Text
async function extractFromText(text) {
  if (!text.trim()) {
    alert('テキストを入力してください');
    return;
  }

  el.loadingState.style.display = 'flex';
  el.recipeDisplay.style.display = 'none';
  el.emptyState.style.display = 'none';
  el.loadingMessage.textContent = 'Gemini AIがテキストから材料を抽出中...';

  try {
    const customKey = localStorage.getItem('recipe_pocket_custom_gemini_key') || '';
    const aiRes = await fetch('/api/ai-extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        title: 'カスタムレシピ',
        customApiKey: customKey
      })
    });

    if (!aiRes.ok) {
      throw new Error('AI解析に失敗しました。');
    }

    const aiData = await aiRes.json();
    renderRecipe(aiData.recipe);
    showToast('レシピを抽出しました！', '✨');
  } catch (error) {
    el.loadingState.style.display = 'none';
    el.emptyState.style.display = 'block';
    alert(`エラー: ${error.message}`);
  }
}

// Event Listeners Initialization
function initEventListeners() {
  // Form Submit (Smart Route: URL -> Extract, Keyword -> YouTube Search)
  el.urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = el.recipeUrl.value.trim();
    if (!input) {
      showToast('料理名やキーワード、またはURLを入力してください', '🔍');
      return;
    }

    if (input.startsWith('http://') || input.startsWith('https://')) {
      const vId = extractYouTubeId(input);
      if (vId) {
        startInstantVideoPlayAndExtract({ videoId: vId, videoUrl: input });
      } else {
        extractFromUrl(input);
      }
    } else {
      searchYouTube(input);
    }
  });

  // Dedicated YouTube Search Button
  if (el.btnSearchYt) {
    el.btnSearchYt.addEventListener('click', () => {
      const input = el.recipeUrl.value.trim();
      if (!input) {
        showToast('検索したい料理名を入力してください (例: 豚汁、カルボナーラ)', '🔍');
        el.recipeUrl.focus();
        return;
      }
      if (input.startsWith('http://') || input.startsWith('https://')) {
        const vId = extractYouTubeId(input);
        if (vId) {
          startInstantVideoPlayAndExtract({ videoId: vId, videoUrl: input });
        } else {
          extractFromUrl(input);
        }
      } else {
        searchYouTube(input);
      }
    });
  }

  // Close Search Results Section
  if (el.btnCloseSearch) {
    el.btnCloseSearch.addEventListener('click', () => {
      el.searchResultsSection.style.display = 'none';
      if (el.backToSearchBar) el.backToSearchBar.style.display = 'none';
      if (el.btnPlayerBackSearch) el.btnPlayerBackSearch.style.display = 'none';
    });
  }

  // Back to Search Results Buttons (both breadcrumb and player control bar)
  const handleBackToSearch = () => {
    if (el.searchResultsSection) {
      el.searchResultsSection.style.display = 'flex';
      el.searchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (el.btnBackToSearch) {
    el.btnBackToSearch.addEventListener('click', handleBackToSearch);
  }
  if (el.btnPlayerBackSearch) {
    el.btnPlayerBackSearch.addEventListener('click', handleBackToSearch);
  }

  // Search Trend Chips (One-tap YouTube Recipe Search)
  document.querySelectorAll('.search-trend-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      if (query) {
        el.recipeUrl.value = query;
        searchYouTube(query);
      }
    });
  });

  // Paste from Clipboard Button
  el.btnPasteClipboard.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        el.recipeUrl.value = text;
        showToast('URLを貼り付けました', '📋');
        // Auto trigger if it's youtube url
        if (text.includes('youtube.com') || text.includes('youtu.be')) {
          const vId = extractYouTubeId(text);
          if (vId) {
            startInstantVideoPlayAndExtract({ videoId: vId, videoUrl: text });
          } else {
            extractFromUrl(text);
          }
        }
      }
    } catch {
      showToast('クリップボードの読み取り権限がありません。直接入力してください。', '⚠️');
    }
  });

  // Toggle Manual Input Accordion
  el.btnToggleManual.addEventListener('click', () => {
    const isHidden = el.manualPanel.style.display === 'none';
    el.manualPanel.style.display = isHidden ? 'flex' : 'none';
    el.btnToggleManual.classList.toggle('active', isHidden);
  });

  // Manual Extract Button
  el.btnExtractManual.addEventListener('click', () => {
    extractFromText(el.manualRecipeText.value);
  });

  // Quick Preset Sample Chips
  document.querySelectorAll('.sample-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const sampleKey = chip.getAttribute('data-sample');
      const sample = SAMPLE_RECIPES[sampleKey];
      if (sample) {
        renderRecipe(sample);
        showToast(`サンプル「${sample.title}」を展開しました`, '🍲');
      }
    });
  });

  // Serving Scaler Buttons
  el.servingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const count = parseInt(btn.getAttribute('data-servings'), 10);
      state.selectedServings = count;
      updateServingsUI();
      renderShoppingList();
      renderIngredientsTab();
      showToast(`${count}人前の分量に再計算しました`, '⚖️');
    });
  });

  // Tab Navigation Switching
  el.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      el.tabBtns.forEach(b => b.classList.remove('active'));
      el.tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Shopping List Actions
  // 1. Copy to LINE / Notes
  el.btnCopyShopping.addEventListener('click', () => {
    if (!state.currentRecipe) return;
    const multiplier = state.selectedServings / state.baseServings;
    const allItems = [
      ...(state.currentRecipe.ingredients || []),
      ...(state.currentRecipe.seasonings || [])
    ];
    const unbought = allItems.filter(it => !state.shoppingChecked[it.name]);

    if (unbought.length === 0) {
      showToast('すべて購入済みです！買い物完了！🎉', '🛒');
      return;
    }

    let text = `🛒【${state.currentRecipe.title}】買い物リスト (${state.selectedServings}人前)\n`;
    unbought.forEach(it => {
      text += `・${it.name} (${formatScaledAmount(it, multiplier)})\n`;
    });
    text += `\n#RecipePocketAI で抽出`;

    navigator.clipboard.writeText(text).then(() => {
      showToast('未購入リストをクリップボードにコピーしました！LINE等に貼れます', '📋');
    });
  });

  // 2. Toggle Unbought Only
  el.btnToggleUnbought.addEventListener('click', () => {
    state.filterUnboughtOnly = !state.filterUnboughtOnly;
    el.btnToggleUnbought.classList.toggle('active', state.filterUnboughtOnly);
    renderShoppingList();
    showToast(state.filterUnboughtOnly ? '未購入品のみ表示中' : '全品目を表示中');
  });

  // 3. Reset All Checked
  el.btnResetShopping.addEventListener('click', () => {
    if (confirm('チェックをすべてリセットして未購入に戻しますか？')) {
      state.shoppingChecked = {};
      renderShoppingList();
      showToast('チェックをリセットしました', '🔄');
    }
  });

  // Bookmark Recipe Button
  el.btnBookmark.addEventListener('click', () => {
    if (!state.currentRecipe) return;
    const saved = state.toggleBookmark(state.currentRecipe);
    updateBookmarkButton();
    showToast(saved ? 'マイレシピに保存しました！' : 'マイレシピから解除しました', saved ? '⭐' : '🗑️');
  });

  // Modals Open / Close
  el.btnOpenSaved.addEventListener('click', () => {
    renderSavedRecipesList();
    el.modalSaved.style.display = 'flex';
  });

  el.btnCloseSaved.addEventListener('click', () => {
    el.modalSaved.style.display = 'none';
  });

  el.btnCloseSubModal.addEventListener('click', () => {
    el.modalSubQuick.style.display = 'none';
  });

  el.btnSettings.addEventListener('click', () => {
    el.customApiKey.value = localStorage.getItem('recipe_pocket_custom_gemini_key') || '';
    el.modalSettings.style.display = 'flex';
  });

  el.btnCloseSettings.addEventListener('click', () => {
    el.modalSettings.style.display = 'none';
  });

  // Close modals on overlay backdrop click
  [el.modalSaved, el.modalSubQuick, el.modalSettings].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  // Save Custom Gemini Key
  el.btnSaveKey.addEventListener('click', () => {
    const key = el.customApiKey.value.trim();
    if (key) {
      localStorage.setItem('recipe_pocket_custom_gemini_key', key);
      showToast('APIキーを保存しました', '🔑');
    } else {
      localStorage.removeItem('recipe_pocket_custom_gemini_key');
      showToast('内蔵デフォルトキーに戻しました', '🔑');
    }
    el.modalSettings.style.display = 'none';
  });

  // Clear All Data
  el.btnClearAllData.addEventListener('click', () => {
    if (confirm('保存したレシピをすべて削除しますか？この操作は取り消せません。')) {
      state.savedRecipes = [];
      state.saveSavedRecipes();
      renderSavedRecipesList();
      updateBookmarkButton();
      showToast('全データを削除しました', '🧹');
    }
  });

  // AI Chat Consultation
  el.btnSendAiChat.addEventListener('click', async () => {
    const question = el.aiChatInput.value.trim();
    if (!question) return;

    el.aiChatResponse.style.display = 'block';
    el.aiChatResponse.innerHTML = `<div class="loading-spinner" style="width: 24px; height: 24px; margin: 0 auto;"></div>`;

    try {
      const customKey = localStorage.getItem('recipe_pocket_custom_gemini_key') || '';
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          recipeContext: state.currentRecipe,
          customApiKey: customKey
        })
      });

      if (!response.ok) throw new Error('通信エラー');
      const data = await response.json();
      el.aiChatResponse.innerHTML = data.answer.replace(/\n/g, '<br>');
    } catch (err) {
      el.aiChatResponse.innerHTML = `<span style="color: var(--accent-rose);">回答を取得できませんでした: ${err.message}</span>`;
    }
  });

  // Embedded Player Control Buttons
  if (el.btnFloatPlayer) {
    el.btnFloatPlayer.addEventListener('click', () => {
      toggleFloatingPlayer();
    });
  }

  if (el.btnOpenYoutubeExternal) {
    el.btnOpenYoutubeExternal.addEventListener('click', () => {
      if (state.currentRecipe?.videoUrl) {
        window.open(state.currentRecipe.videoUrl, '_blank');
      }
    });
  }

  if (el.btnClosePlayer) {
    el.btnClosePlayer.addEventListener('click', () => {
      closeEmbeddedVideo();
      showToast('動画を閉じました');
    });
  }
}

// App Initialization
window.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  updateSavedBadge();
  state.syncWithServer();

  // Register Service Worker for offline PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration optional:', err.message);
    });
  }

  // If URL has query params or initial test, we can preload
  const urlParams = new URLSearchParams(window.location.search);
  const sampleParam = urlParams.get('sample');
  if (sampleParam && SAMPLE_RECIPES[sampleParam]) {
    renderRecipe(SAMPLE_RECIPES[sampleParam]);
  }
});
