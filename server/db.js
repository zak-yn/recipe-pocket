/**
 * RecipePocket Database & Storage Layer
 * Supports Upstash Redis REST API (Serverless Cloud Persistence)
 * with graceful Local File Fallback (data/ directory) - Same architecture as FlickBrief & PaddleCraft
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CACHE_FILE = path.join(DATA_DIR, 'recipes_cache.json');
const SAVED_FILE = path.join(DATA_DIR, 'saved_recipes.json');

// Upstash Redis Cloud Configuration (Free Serverless Persistence)
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const HAS_UPSTASH = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

const REDIS_KEY_CACHE = 'recipe_pocket_cache';
const REDIS_KEY_SAVED = 'recipe_pocket_saved';

class DatabaseService {
  constructor() {
    this.hasUpstash = HAS_UPSTASH;
    this.cache = new Map();
    this.savedRecipes = [];
    this.init();
  }

  async init() {
    // 1. Load local file fallback first
    this.loadFromLocal();

    // 2. If Upstash is configured, sync from cloud
    if (this.hasUpstash) {
      console.log('⚡ [DB] Connecting to Upstash Redis Cloud...');
      await this.syncFromUpstash();
    } else {
      console.log('📁 [DB] Running with local file storage fallback (data/ directory)');
    }
  }

  loadFromLocal() {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data && typeof data === 'object') {
          Object.entries(data).forEach(([k, v]) => this.cache.set(k, v));
        }
      }
      if (fs.existsSync(SAVED_FILE)) {
        const raw = fs.readFileSync(SAVED_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          this.savedRecipes = data;
        }
      }
    } catch (e) {
      console.warn('[DB] Local load error:', e.message);
    }
  }

  saveToLocal() {
    try {
      const cacheObj = Object.fromEntries(this.cache);
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheObj, null, 2), 'utf-8');
      fs.writeFileSync(SAVED_FILE, JSON.stringify(this.savedRecipes, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[DB] Local save error:', e.message);
    }
  }

  async fetchFromUpstash(key) {
    if (!this.hasUpstash) return null;
    const baseUrl = UPSTASH_URL.replace(/\/$/, '');
    try {
      const resp = await fetch(`${baseUrl}/get/${key}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
        signal: AbortSignal.timeout(5000)
      });
      if (!resp.ok) {
        console.warn(`[Upstash] Read /get/${key} returned HTTP ${resp.status}`);
        return null;
      }
      const data = await resp.json();
      if (data && data.result !== undefined && data.result !== null) {
        let parsed = data.result;
        while (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
          } catch {
            break;
          }
        }
        return parsed;
      }
    } catch (err) {
      console.warn(`[Upstash] Read ${key} error:`, err.message);
    }
    return null;
  }

  async saveToUpstash(key, data) {
    if (!this.hasUpstash) return false;
    const baseUrl = UPSTASH_URL.replace(/\/$/, '');
    const payload = JSON.stringify(data);

    // Method 1: Standard Upstash Redis Command API (POST / with ["SET", key, val])
    try {
      const resp = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['SET', key, payload]),
        signal: AbortSignal.timeout(5000)
      });
      if (resp.ok) {
        const resJson = await resp.json().catch(() => ({}));
        if (resJson && (resJson.result === 'OK' || resJson.result === true)) {
          return true;
        }
      }
    } catch (err) {
      console.warn(`[Upstash] Method 1 save warning for ${key}:`, err.message);
    }

    // Method 2: REST fallback: POST /set/{key} with raw payload
    try {
      const resp2 = await fetch(`${baseUrl}/set/${key}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: payload,
        signal: AbortSignal.timeout(5000)
      });
      if (resp2.ok) {
        return true;
      }
    } catch (err2) {
      console.error(`[Upstash] Method 2 save error for ${key}:`, err2.message);
    }

    return false;
  }

  async syncFromUpstash() {
    try {
      // 1. Sync recipe cache
      const cloudCache = await this.fetchFromUpstash(REDIS_KEY_CACHE);
      if (cloudCache && typeof cloudCache === 'object') {
        Object.entries(cloudCache).forEach(([k, v]) => this.cache.set(k, v));
        console.log(`⚡ [DB] Synced ${this.cache.size} cached recipes from Upstash!`);
      } else if (this.cache.size > 0) {
        // Bootstrap cloud if cloud is empty
        await this.saveCacheToUpstash();
      }

      // 2. Sync saved recipes
      const cloudSaved = await this.fetchFromUpstash(REDIS_KEY_SAVED);
      if (Array.isArray(cloudSaved) && cloudSaved.length > 0) {
        this.savedRecipes = cloudSaved;
        console.log(`⚡ [DB] Synced ${this.savedRecipes.length} saved recipes from Upstash!`);
      } else if (this.savedRecipes.length > 0) {
        // Bootstrap cloud if cloud is empty
        await this.saveSavedToUpstash();
      }

      this.saveToLocal();
    } catch (err) {
      console.warn('[DB] Upstash initial sync warning:', err.message);
    }
  }

  async saveCacheToUpstash() {
    if (!this.hasUpstash) return;
    const cacheObj = Object.fromEntries(this.cache);
    await this.saveToUpstash(REDIS_KEY_CACHE, cacheObj);
  }

  async saveSavedToUpstash() {
    if (!this.hasUpstash) return;
    await this.saveToUpstash(REDIS_KEY_SAVED, this.savedRecipes);
  }

  // --- Public API ---
  getRecipe(key) {
    if (!key) return null;
    return this.cache.get(key) || null;
  }

  setRecipe(key, recipe) {
    if (!key || !recipe) return;
    this.cache.set(key, recipe);
    this.saveToLocal();
    this.saveCacheToUpstash().catch(() => {});
  }

  getSavedRecipes() {
    return this.savedRecipes;
  }

  saveRecipe(recipe) {
    if (!recipe || !recipe.title) return false;
    const existingIndex = this.savedRecipes.findIndex(r => r.title === recipe.title);
    if (existingIndex >= 0) {
      this.savedRecipes[existingIndex] = { ...this.savedRecipes[existingIndex], ...recipe, updatedAt: new Date().toISOString() };
    } else {
      this.savedRecipes.unshift({
        ...recipe,
        id: recipe.id || `recipe-${Date.now()}`,
        savedAt: new Date().toISOString()
      });
    }
    this.saveToLocal();
    this.saveSavedToUpstash().catch(() => {});
    return true;
  }

  deleteSavedRecipe(idOrTitle) {
    const beforeCount = this.savedRecipes.length;
    this.savedRecipes = this.savedRecipes.filter(r => r.id !== idOrTitle && r.title !== idOrTitle);
    const changed = this.savedRecipes.length !== beforeCount;
    if (changed) {
      this.saveToLocal();
      this.saveSavedToUpstash().catch(() => {});
    }
    return changed;
  }
}

export const db = new DatabaseService();
