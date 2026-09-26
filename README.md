# RecipePocket AI (🍳 レシピポケット)

> YouTube動画・料理レシピページから、食材・調味料・調理手順・代用案をAIで一瞬抽出し、スーパーの売り場順に買い出しリスト化するスマートクッキングPWA。

---

## 🌟 主な機能
1. **動画埋め込み即時再生 & バックグラウンドAI抽出**:
   - 動画を即座にインライン再生しつつ、裏側でGemini AIがタイトル・概要欄・字幕音声からレシピを自動解析。
2. **スーパー売り場別・買い出しオーガナイザー**:
   - 野菜・果物 / 肉・魚 / 卵・乳製品 / 調味料 / 乾物・その他に自動仕分け。
   - 人数スケーラー（1人前〜4人前）連動で分量を自動換算。
   - チェック機能、未購入品のみの絞り込み、LINE共有用ワンタップコピー。
3. **調味料スマート代用AI**:
   - 家にない調味料（オイスターソース、甜麺醤、生クリーム等）の即時代用比率の提示。
4. **マイレシピ保存 & クラウドデータベース同期 (Upstash Redis)**:
   - 気に入ったレシピをワンタップ保存。
   - Upstash Redis Cloud REST APIによるサーバーレス永続化 & ローカルファイル（`data/`）フォールバックのデュアル構成。

---

## 🏗️ システム構成 & データベース設計

他のプロジェクト（`flickbrief`, `paddlecraft`）と完全に共通の構成を採用しています。

- **Frontend**: Vanilla ES Modules, Modern CSS (Design System / Dark Glassmorphism, Anti-AI Aesthetic)
- **Backend**: Node.js (v20.18.0) / Express
- **AI Engine**: Google Gemini API (`gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite` 4重フォールバック)
- **Database / Cache**:
  - **Primary**: Upstash Redis Cloud REST API (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
  - **Fallback**: Local JSON files in `data/` (`recipes_cache.json`, `saved_recipes.json`)
  - ゼロ設定でローカル動作可能、環境変数を設定すればRenderクラウド環境でも再起動を跨いでデータが完全に永続化されます。

---

## 🚀 デプロイ (Render Blueprint)

リポジトリ直下の `render.yaml` により、Renderで1クリックデプロイが可能です。

### Render への環境変数設定
- `GEMINI_API_KEY`: Gemini APIキー
- `UPSTASH_REDIS_REST_URL`: Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis REST Token

---

## 💻 ローカル開発

```bash
# 依存関係のインストール
npm install

# サーバー起動 (ポート 5174)
npm start
```
ブラウザで `http://localhost:5174` にアクセスしてください。
