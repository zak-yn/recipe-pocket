# RecipePocket AI - Single Source of Truth (`AGENTS.md`)

## 1. Project Concept & Objectives
- **Core Mission**: Instant extraction of ingredients, precise quantities, and supermarket aisle-categorized shopping checklists from YouTube cooking videos and URLs.
- **Key Features**:
  - In-app keyword search & YouTube URL auto-detection with 1-tap playback and background AI extraction.
  - PiP floating player mode for cooking while watching.
  - Interactive supermarket checklist with servant scaling (1, 2, 4人前) and copy-to-clipboard.
  - Real-time AI culinary substitution advisor that automatically persists chosen substitutes to ingredients & shopping lists.
  - My Recipes bookmarking with Upstash Redis cloud persistence.
  - PWA standalone mobile home screen support with dedicated vector icons.

## 2. Architecture & Tech Stack
- **Client**: Vanilla ES Modules (`public/app.js`), Vanilla CSS (`public/style.css`), Clean PWA Service Worker (`public/sw.js`).
- **Server**: Node.js, Express (`server.js`), zero unnecessary heavy frameworks.
- **AI Models**: Google Gemini (`gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`).
- **Database**: Upstash Redis REST API (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) with fallback to local `data/*.json`.
- **Deploy Target**: Render Web Service (`https://recipe-pocket.onrender.com/`) auto-deployed from GitHub `zak-yn/recipe-pocket` (`main`).

## 3. Directory Structure & Responsibilities
- `server.js`: Express server, YouTube scraping, Gemini API orchestration, Upstash Redis cache layer, and health endpoints.
- `server/db.js`: Upstash Redis cloud DB wrapper with local JSON file fallback for recipe caching and user saved recipes.
- `public/index.html`: Semantic, responsive HTML structure with PWA manifest, Apple touch icon, and modal sheets.
- `public/style.css`: Clean natural culinary design system (White `#f8f7f4`, Deep Roast Brown `#28211b`, Herb Green `#2d6a4f`).
- `public/app.js`: State management (`AppState`), DOM controllers, video player, substitution persistence, and copy export.
- `public/sw.js`: PWA Service Worker with network-first strategy and auto-cache purging.
- `public/favicon.svg` & `icon-*.png`: PWA and mobile home-screen icons.

## 4. API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Lightweight status check (200 OK, cache size, Upstash status) |
| `POST` | `/api/search-youtube` | Searches YouTube and returns top 10 video items |
| `POST` | `/api/scrape-youtube` | Extracts video subtitles, title, description, and external recipe links |
| `POST` | `/api/extract-recipe` | AI parses text/subtitles into structured recipe JSON with aisle categories |
| `POST` | `/api/ai-substitute` | Suggests culinary substitutes, ratios, and skip advice |
| `POST` | `/api/ai-chat` | Context-aware Q&A consultation regarding current recipe |
| `GET` | `/api/saved-recipes` | Retrieves bookmarked recipes from cloud/local DB |
| `POST` | `/api/saved-recipes` | Saves recipe to bookmarks |
| `DELETE` | `/api/saved-recipes/:id` | Deletes recipe from bookmarks |

## 5. UI & Anti-AI Design Rules
- **Palette**: White/Porcelain (`#f8f7f4`, `#ffffff`), Espresso Brown (`#28211b`, `#5e5246`), Herb Green (`#2d6a4f`, `#eaf4ed`).
- **Iconography**: Clean 1.5px/2px vector SVG icons only. Never use raw OS emojis in chrome/buttons.
- **Geometry**: Architectural restraint with 6px–12px corner radiuses and subtle 1px borders (`#e6e1d7`).
- **Ordered Density**: High utility, instant feedback, no hollow cards or bloated paddings.

## 6. Autonomous Verification Loop
1. **Syntax Check**: `node --check public/app.js; node --check server.js`
2. **Local Dev Server**: Run `node server.js` on port `5174`.
3. **Browser Sensor**: Launch browser subagent at mobile Pixel size (412x915).
   - Verify zero console errors.
   - Verify search, 1-tap playback, ingredients tab, and shopping checklist.
   - Verify substitute persistence under ingredient card.
4. **Deploy**: Commit and push to GitHub `main` (`https://github.com/zak-yn/recipe-pocket.git`).
5. **Production Sensor**: Ping `https://recipe-pocket.onrender.com/api/health` and verify live deployment.

## 7. Changelog
- **2026-09-26**: Clean redesign with White, Espresso Brown, and Fresh Herb Green.
- **2026-09-26**: Removed redundant buttons on search cards and player bar for mobile ergonomics.
- **2026-09-26**: Renamed shopping export to "リストをコピー".
- **2026-09-26**: Generated high-res PWA home-screen icons (`icon-192`, `icon-512`, `apple-touch-icon`).
- **2026-09-26**: Added persistent ingredient substitutions and shopping list annotations.
- **2026-09-26**: Removed arbitrary `AI 2.5` badge from header.
