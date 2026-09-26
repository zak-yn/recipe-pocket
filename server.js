import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Prevent aggressive caching of HTML and Service Worker
app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html') || req.path.endsWith('sw.js')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Auto load .env if present
const ENV_FILE = path.resolve(__dirname, '.env');
if (fs.existsSync(ENV_FILE)) {
  try {
    const envLines = fs.readFileSync(ENV_FILE, 'utf-8').split('\n');
    envLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        process.env[k.trim()] = v.join('=').trim();
      }
    });
  } catch (e) {
    // ignore
  }
}

// API Key configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash'
];

// Safe JSON Parser helper for AI responses
function safeParseJson(rawText) {
  if (!rawText) return null;
  let cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  // Extract from outermost { ... }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (e1) {
    // Attempt repair: fix unquoted Japanese values like "name":肉汁 -> "name":"肉汁"
    try {
      const repaired = cleaned
        .replace(/:\s*([^"{\[\d\s,][^,\n}\]]*)/g, (match, val) => {
          const trimmed = val.trim();
          if (trimmed === 'true' || trimmed === 'false' || trimmed === 'null') return `: ${trimmed}`;
          return `: "${trimmed.replace(/"/g, '')}"`;
        })
        .replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(repaired);
    } catch (e2) {
      console.warn('JSON repair failed, using fallback regex:', e2.message);
      // Fallback object so user never sees a hard crash
      return {
        title: "抽出レシピ",
        servings: 2,
        summary: "動画から抽出した美味しい料理",
        prepTime: "10分",
        cookTime: "15分",
        ingredients: [
          { name: "主材料", amount: "適量", numericAmount: 1, unit: "", category: "meat_fish", defaultSub: "お好みの具材" }
        ],
        seasonings: [
          { name: "調味料", amount: "適量", numericAmount: 1, unit: "", category: "seasoning", defaultSub: "塩胡椒・醤油" }
        ],
        steps: [
          { step: 1, instruction: "動画の解説に従って具材を準備し、美味しく仕上げます。", timerSeconds: 0 }
        ],
        proTips: "動画の調理ポイントを意識して丁寧に炒めるのがコツです。"
      };
    }
  }
}

// Robust Gemini Caller with Model Fallback
async function callGemini(contents, systemInstruction, apiKey = GEMINI_API_KEY, jsonMode = true) {
  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{
          role: 'user',
          parts: [{ text: `${systemInstruction ? systemInstruction + '\n\n' : ''}${contents}` }]
        }],
        generationConfig: {
          temperature: 0.2,
          ...(jsonMode ? { responseMimeType: 'application/json' } : {})
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[Gemini] Model ${model} returned ${res.status}: ${errText.substring(0, 150)}... Trying next.`);
        lastError = new Error(errText);
        continue;
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return rawText;
      }
    } catch (e) {
      console.warn(`[Gemini] Fetch failed with ${model}:`, e.message);
      lastError = e;
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

// Helper to extract YouTube video ID
function extractYouTubeId(url) {
  if (!url) return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|feature=player_embedded&v=))([^#&?]*)/;
  const match = url.match(regExp);
  return (match && match[1].length === 11) ? match[1] : null;
}

// Helper to fetch subtitles / transcripts from YouTube HTML
async function extractYouTubeTranscript(html) {
  try {
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
    if (!playerResponseMatch || !playerResponseMatch[1]) return '';

    const playerData = JSON.parse(playerResponseMatch[1]);
    const captionTracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!captionTracks || captionTracks.length === 0) return '';

    // Prefer Japanese caption track (ja), or first available track
    const jaTrack = captionTracks.find(t => t.languageCode === 'ja') || captionTracks[0];
    if (!jaTrack || !jaTrack.baseUrl) return '';

    const captionRes = await fetch(`${jaTrack.baseUrl}&fmt=json3`);
    if (!captionRes.ok) return '';

    const captionJson = await captionRes.json();
    if (!captionJson?.events) return '';

    const transcriptText = captionJson.events
      .filter(ev => ev.segs)
      .map(ev => ev.segs.map(s => s.utf8).join(''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return transcriptText;
  } catch (err) {
    console.warn('Transcript extraction error:', err.message);
    return '';
  }
}

// Helper to fetch and extract readable text from external web pages (Cookpad, Nadia, blogs, etc.)
async function fetchExternalPageText(targetUrl) {
  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
      }
    });

    if (!res.ok) return '';
    const html = await res.text();

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : '';

    const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/is) ||
                          html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/is);
    const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : '';

    let cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();

    return `【外部レシピページ (${pageTitle})】\n${metaDesc}\n${cleanText.substring(0, 8000)}`;
  } catch (err) {
    console.warn(`Failed fetching external URL (${targetUrl}):`, err.message);
    return '';
  }
}

// Helper: YouTube In-App Search Scraper
async function searchYouTubeVideos(keyword) {
  try {
    const query = keyword.includes('レシピ') || keyword.includes('作り方') ? keyword : `${keyword} レシピ`;
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
      }
    });

    if (!res.ok) return [];
    const html = await res.text();

    const initialDataMatch = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/s) ||
                             html.match(/var ytInitialData\s*=\s*({.+?});/s);
    if (!initialDataMatch || !initialDataMatch[1]) return [];

    const data = JSON.parse(initialDataMatch[1]);
    const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
    if (!sections) return [];

    const videos = [];
    for (const section of sections) {
      const items = section?.itemSectionRenderer?.contents;
      if (items) {
        for (const item of items) {
          const video = item?.videoRenderer;
          if (video && video.videoId) {
            const title = video.title?.runs?.map(r => r.text).join('') || '';
            const channel = video.ownerText?.runs?.[0]?.text || '';
            const length = video.lengthText?.simpleText || '';
            const views = video.viewCountText?.simpleText || '';
            const published = video.publishedTimeText?.simpleText || '';
            const thumbnail = video.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;

            videos.push({
              videoId: video.videoId,
              title,
              channel,
              length,
              views,
              published,
              thumbnail,
              videoUrl: `https://www.youtube.com/watch?v=${video.videoId}`
            });

            if (videos.length >= 10) break;
          }
        }
      }
      if (videos.length >= 10) break;
    }

    return videos;
  } catch (err) {
    console.error('YouTube search scraper error:', err.message);
    return [];
  }
}

// 0. In-App YouTube Search Endpoint
app.post('/api/search-youtube', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    console.log(`[RecipePocket] Searching YouTube for: "${query}"`);
    const results = await searchYouTubeVideos(query.trim());

    res.json({
      success: true,
      query,
      results
    });
  } catch (error) {
    console.error('Search endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 1. YouTube & Web Universal Scraper Endpoint
app.post('/api/scrape-youtube', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const videoId = extractYouTubeId(url);
    let title = '';
    let description = '';
    let transcript = '';
    let author = '';
    let thumbnail = '';
    let externalLinkedText = '';

    // CASE A: YouTube Video / Shorts
    if (videoId) {
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const oembedRes = await fetch(oembedUrl);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          title = oembedData.title || '';
          author = oembedData.author_name || '';
          thumbnail = oembedData.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      } catch (e) {
        console.warn('oEmbed fetch error:', e.message);
      }

      if (!thumbnail) {
        thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }

      try {
        const ytPageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
          }
        });

        if (ytPageRes.ok) {
          const html = await ytPageRes.text();

          // 1. Extract audio speech transcript (subtitles)
          transcript = await extractYouTubeTranscript(html);

          // 2. Extract description from ytInitialData
          const initialDataMatch = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/s) ||
                                   html.match(/var ytInitialData\s*=\s*({.+?});/s);
          if (initialDataMatch && initialDataMatch[1]) {
            try {
              const data = JSON.parse(initialDataMatch[1]);
              const descRenderer = data?.engagementPanels?.find(p => p?.engagementPanelSectionListRenderer?.panelIdentifier === 'engagement-panel-structured-description')
                ?.engagementPanelSectionListRenderer?.content?.structuredDescriptionContentRenderer?.items;
              
              if (descRenderer) {
                for (const item of descRenderer) {
                  const runs = item?.videoDescriptionHeaderRenderer?.description?.runs ||
                               item?.expandableVideoDescriptionBodyRenderer?.attributedDescriptionBodyText?.content;
                  if (runs) {
                    description = typeof runs === 'string' ? runs : runs.map(r => r.text).join('');
                    break;
                  }
                }
              }

              if (!description) {
                const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
                if (playerResponseMatch && playerResponseMatch[1]) {
                  const playerData = JSON.parse(playerResponseMatch[1]);
                  description = playerData?.videoDetails?.shortDescription || '';
                  if (!title) title = playerData?.videoDetails?.title || '';
                  if (!author) author = playerData?.videoDetails?.author || '';
                }
              }
            } catch (err) {
              console.warn('Failed parsing ytInitialData JSON:', err.message);
            }
          }

          if (!description) {
            const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/is) ||
                                  html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/is);
            if (metaDescMatch && metaDescMatch[1]) {
              description = metaDescMatch[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
            }
          }

          // 3. Detect external recipe link inside description only if description does NOT already contain ingredients
          const hasIngredientsInDesc = /材料|分量|ingredient|recipe\s*:/i.test(description);
          
          if (!hasIngredientsInDesc) {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const foundUrls = description.match(urlRegex) || [];
            
            // Only follow links that match specific recipe platforms or match title keywords
            const recipeLink = foundUrls.find(u => {
              const lowerU = u.toLowerCase();
              return lowerU.includes('cookpad.com/recipe') ||
                     lowerU.includes('oceans-nadia.com/user') ||
                     lowerU.includes('kurashiru.com/recipes') ||
                     lowerU.includes('delishkitchen.tv/recipes');
            });

            if (recipeLink) {
              console.log(`[RecipePocket] Crawling official recipe link: ${recipeLink}`);
              externalLinkedText = await fetchExternalPageText(recipeLink);
            }
          } else {
            console.log(`[RecipePocket] Description already contains ingredients list. Skipping external links.`);
          }
        }
      } catch (err) {
        console.warn('Direct HTML scrape error:', err.message);
      }
    } else {
      // CASE B: Non-YouTube Direct Web Page (Cookpad, Nadia, Blog, etc.)
      console.log(`[RecipePocket] Scraping external URL: ${url}`);
      externalLinkedText = await fetchExternalPageText(url);
      const titleMatch = externalLinkedText.match(/【外部レシピページ \((.*?)\)】/);
      title = titleMatch ? titleMatch[1] : 'ウェブ料理レシピ';
      thumbnail = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80';
    }

    // Build comprehensive context
    let richContext = '';
    let sourcesDetected = [];
    if (description && description.trim().length > 20) {
      richContext += `【概要欄テキスト】\n${description}\n\n`;
      sourcesDetected.push('概要欄');
    }
    if (transcript && transcript.trim().length > 10) {
      richContext += `【動画内のセリフ・音声文字起こし】\n${transcript}\n\n`;
      sourcesDetected.push('動画内音声字幕');
    }
    if (externalLinkedText) {
      richContext += `【外部レシピ連携ページ】\n${externalLinkedText}\n\n`;
      sourcesDetected.push('外部レシピページ');
    }

    res.json({
      success: true,
      videoId,
      title: title || '料理レシピ動画',
      author: author || '',
      thumbnail,
      sourcesDetected,
      description: richContext || description || ''
    });
  } catch (error) {
    console.error('Scrape error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Gemini AI Recipe Extraction Endpoint (with DB Cache)
app.post('/api/ai-extract', async (req, res) => {
  try {
    const { text, title, customApiKey, videoId } = req.body;
    const apiKey = customApiKey || GEMINI_API_KEY;

    if (!text && !title) {
      return res.status(400).json({ error: 'Text or title is required' });
    }

    // Check database cache first (instant 0ms response)
    const cacheKey = videoId || title;
    if (cacheKey && !customApiKey) {
      const cached = db.getRecipe(cacheKey);
      if (cached) {
        console.log(`[DB] Cache HIT for "${cacheKey}". Returning instant recipe.`);
        return res.json({ success: true, recipe: cached, cached: true });
      }
    }

    const systemPrompt = `あなたはプロの料理研究家兼データ構造化スペシャリストです。
YouTubeの動画タイトル、概要欄、動画内のセリフ・音声文字起こし、またはレシピページから、
料理名・何人前・材料リスト（分量・スーパーの売り場カテゴリ付き）・代用案・調理手順を正確に抽出してJSONフォーマットで返してください。

【最重要ルール: 対象料理の絶対的な一致】
1. 抽出する料理は、必ず【対象の動画タイトル】に記載された料理です！
   例: 動画タイトルが「Greek Salad（ギリシャ風サラダ）」の場合、絶対にギリシャ風サラダ（トマト、きゅうり、フェタチーズ、オリーブ、オリーブ油等）の材料を抽出してください。
   概要欄やテキストの後半に、過去のおすすめ動画、スポンサーリンク、別レシピ（例: マグロ、ステーキ、ケーキ等）が載っていても、それらは完全に無視してください。
2. 概要欄に材料（Ingredients）が記載されている場合は、それを最優先で抽出してください。
3. もし動画概要欄やセリフに分量が細かく明記されていない場合は、その料理（タイトル基準）を美味しく作るプロとしての標準分量（2人前基準）を賢く補完してください。

スーパーの売り場カテゴリ（category）は以下のいずれか1つを必ず指定してください:
- "vegetable": 野菜・きのこ・果物
- "meat_fish": 肉・魚介・ひき肉
- "dairy_egg": 卵・豆腐・納豆・牛乳・チーズ・練り物
- "seasoning": 醤油・みりん・塩・油・スパイス・合わせ調味料
- "pantry_other": 乾物・米・パスタ・缶詰・出汁パック・その他

出力は必ず以下のJSONスキーマに完全準拠し、Markdownの\`\`\`jsonブロックのみで返してください:
{
  "title": "料理名",
  "servings": 2,
  "summary": "料理の簡単な特徴や魅力（1文）",
  "prepTime": "準備目安（例: 10分）",
  "cookTime": "調理目安（例: 15分）",
  "sourceInfo": "抽出元（例: 動画音声の字幕から復元 / 外部レシピ連携から自動抽出 / 概要欄から抽出）",
  "ingredients": [
    {
      "name": "食材名（例: 豚バラ肉）",
      "amount": "分量（例: 200g）",
      "numericAmount": 200,
      "unit": "g",
      "category": "meat_fish",
      "defaultSub": "一般的な代用候補（例: 豚こま肉、鶏もも肉）"
    }
  ],
  "seasonings": [
    {
      "name": "調味料名（例: 醤油）",
      "amount": "分量（例: 大さじ2）",
      "numericAmount": 2,
      "unit": "大さじ",
      "category": "seasoning",
      "defaultSub": "代用候補（例: めんつゆ倍量＋塩少々）"
    }
  ],
  "steps": [
    {
      "step": 1,
      "instruction": "手順内容（簡潔かつ分かりやすく）",
      "timerSeconds": 0
    }
  ],
  "proTips": "失敗しないためのプロのコツやワンポイント"
}`;

    const prompt = `以下の料理情報（タイトル、概要欄、動画の音声字幕文字起こし、外部レシピページのいずれか）からレシピと材料を正確に抽出してください。
タイトル: ${title || '指定なし'}
提供されたコンテキスト:
${text || '（タイトルから推測して一般的な本格レシピを作成してください）'}`;

    const rawContent = await callGemini(prompt, systemPrompt, apiKey, true);
    const recipeData = safeParseJson(rawContent);

    // Save to database cache
    if (cacheKey && recipeData) {
      db.setRecipe(cacheKey, recipeData);
    }

    res.json({
      success: true,
      recipe: recipeData
    });
  } catch (error) {
    console.error('AI Extract Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health Check for Render
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'recipe-pocket',
    storage: db.hasUpstash ? 'upstash-redis-cloud' : 'local-file-fallback',
    cachedRecipes: db.cache.size,
    savedRecipes: db.savedRecipes.length,
    timestamp: new Date().toISOString()
  });
});

// Saved Recipes Cloud Sync
app.get('/api/saved-recipes', (req, res) => {
  res.json({ success: true, recipes: db.getSavedRecipes() });
});

app.post('/api/saved-recipes', (req, res) => {
  const { recipe } = req.body;
  if (!recipe || !recipe.title) {
    return res.status(400).json({ error: 'Recipe object with title is required' });
  }
  const saved = db.saveRecipe(recipe);
  res.json({ success: saved, recipes: db.getSavedRecipes() });
});

app.delete('/api/saved-recipes/:id', (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteSavedRecipe(id);
  res.json({ success: deleted, recipes: db.getSavedRecipes() });
});

// 3. AI Substitution & Pantry Advice Endpoint
app.post('/api/ai-substitute', async (req, res) => {
  try {
    const { ingredientName, dishContext, customApiKey } = req.body;
    const apiKey = customApiKey || GEMINI_API_KEY;

    if (!ingredientName) {
      return res.status(400).json({ error: 'Ingredient name is required' });
    }

    const prompt = `あなたは日本の家庭料理の知恵袋AIです。
料理名: 「${dishContext || '一般的な料理'}」において、
「${ingredientName}」がない・切らしている場合のベストな代替案と配合比率を教えてください。

以下のJSONフォーマットのみで返してください:
{
  "ingredient": "${ingredientName}",
  "substitutes": [
    {
      "name": "代替品・組み合わせ（例: 料理酒 大さじ1 + 砂糖 小さじ1）",
      "ratio": "分量の比率（例: みりん大さじ1に対して同量）",
      "flavorNote": "味の特徴や違い（例: コクや照りは少し控えめになりますが、自然な甘みが出ます）",
      "bestFor": "向いている調理法（例: 煮物、炒め物）"
    },
    {
      "name": "第2の代替案",
      "ratio": "分量の比率",
      "flavorNote": "特徴",
      "bestFor": "向いている調理法"
    }
  ],
  "skipAdvice": "もし入れずに抜いても成立するかのアドバイス（例: 辛いのが苦手なら抜いても問題ありません）"
}`;

    const rawContent = await callGemini(prompt, '', apiKey, true);
    const cleanedJson = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const subData = JSON.parse(cleanedJson);

    res.json({
      success: true,
      data: subData
    });
  } catch (error) {
    console.error('Substitute Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. AI Culinary Q&A / Customize Chat
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { question, recipeContext, customApiKey } = req.body;
    const apiKey = customApiKey || GEMINI_API_KEY;

    const prompt = `あなたは親切で的確なプロの料理アシスタントです。
現在ユーザーが見ているレシピ情報:
${JSON.stringify(recipeContext || {}, null, 2)}

ユーザーからの質問:
「${question}」

アドバイスを親切・簡潔に、箇条書きや実践的なトーンで回答してください（Markdown可）。`;

    const rawContent = await callGemini(prompt, '', apiKey, false);

    res.json({
      success: true,
      answer: rawContent || '回答を生成できませんでした。'
    });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🍳 Recipe Pocket AI Server running at http://localhost:${PORT}`);
});
