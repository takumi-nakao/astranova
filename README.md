# AstraNova | E-sports Team Official Website

AstraNova（ネクシス）は、Web制作における高度なUI/UXデザイン、アニメーション技術、およびサーバーレス・セキュリティの実践を示すために構築された、プロフェッショナルeスポーツチームの公式サイト（デモ）です。

本プロジェクトは、jQuery等のレガシーなライブラリやフレームワークに依存せず、**Pure HTML5 / CSS3 / Vanilla JavaScript**のみで実装されています。また、Vercel Serverless Functionsを用いたセキュアなコンタクトフォームシステムとCloudflare TurnstileによるBot防御を内包しています。

---

## 🚀 主な機能と特徴

### 1. 圧倒的なブランド表現力とUI/UX
* **フルスクリーンヒーロービュー**: 迫力あるタイポグラフィとグリッドオーバーレイによる近未来デザイン。
* **カスタム・マウスカーソル (PC)**: マウス座標の移動量に対し、線形補間（Lerp）による滑らかなイージングで追従するシアンリング。インタラクティブ要素へのホバーで拡大。
* **イントローダ画面**: ロードの進行度を `00%` から `100%` まで滑らかにトラッキングし、SVGロゴの描画演出と同時にフェードアウト。
* **スクロール連動演出**: `IntersectionObserver` を使用し、要素が画面に入るタイミングで滑らかな浮き上がり（スライドアップ）アニメーションを発火。
* **進行度インジケーター**: 画面最上部に配置され、現在のスクロール深度をリアルタイムに視覚化。
* **レスポンシブデザイン**: モバイル・タブレット・PC（高解像度）の全デバイスで完璧に機能するレスポンシブ設計（`Media Queries`）。

### 2. セキュリティとスパム対策（ポートフォリオの信頼性）
* **Cloudflare Turnstile の導入**: Google reCAPTCHAに代わるパッシブでユーザー体験を妨げない強力なスパム防止システム。
* **Resend API によるメール配送**: フロントエンドから直接APIキーを叩くことなく、Vercelのバックエンド経由で安全にメールを配信。
* **セキュアHTTPヘッダの強制 (`vercel.json`)**:
  - `Content-Security-Policy (CSP)` によるXSS防御。
  - `Strict-Transport-Security (HSTS)` による常時暗号化。
  - `X-Frame-Options: DENY` によるクリックジャッキング防止。
  - `X-Content-Type-Options: nosniff` によるMIMEスニッフィング遮断。
* **サニタイズ / エスケープ**: サーバーサイド (`api/contact.js`) でのHTMLエスケープ処理による、受信側メールクライアントでのスクリプトインジェクション（XSS）の完全防止。

---

## 📂 ディレクトリ構成

```text
astranova-esports/
├── public/
│   └── assets/           # ビジュアル素材（チームロゴ、選手カード用グラフィック）
├── api/
│   └── contact.js        # サーバーサイドお問い合わせ送信・セキュリティAPI (Vercel)
├── docs/
│   ├── requirements_definition.md  # 要件定義書
│   ├── basic_design.md             # 基本設計書
│   ├── detailed_design.md          # 詳細設計書
│   ├── api_design.md               # API設計書
│   ├── security_design.md          # セキュリティ設計書
│   ├── test_specification.md       # テスト仕様書
│   ├── deployment_guide.md         # デプロイ手順書
│   └── maintenance_guide.md        # 運用保守手順書
├── index.html            # メインマークアップ
├── style.css             # 全体のスタイリングとアニメーション
├── script.js             # 各種インタラクションおよびAPI連携ロジック
├── vercel.json           # ルーティングおよびセキュアレスポンスヘッダ設定
├── README.md             # 本ドキュメント
└── .env.example          # 環境変数テンプレート
```

---

## 🛠️ クイックスタート (ローカル開発環境)

### 1. リポジトリの準備
本フォルダをエディタで開き、環境設定ファイルを作成します。

```bash
cp .env.example .env
```
作成した `.env` ファイルに、自身の **Resend API Key** および **Cloudflare Turnstile Secret Key** を設定します。（※設定手順の詳細は `docs/deployment_guide.md` を参照）

### 2. Vercel CLI を用いたローカルエミュレート
Vercel Serverless Function をローカルで動作させつつ、ホットリロード対応の開発サーバーを起動します。

```bash
# Vercel CLI が未インストールの場合はインストール
npm install -g vercel

# ログインとプロジェクト接続 (初回のみ)
vercel login
vercel link

# 開発サーバー起動 (APIとフロントエンドが連動して立ち上がります)
vercel dev
```
ブラウザで [http://localhost:3000](http://localhost:3000) を開き、動作確認を行います。

---

## 💡 Web制作者様への解説（ポートフォリオのアピールポイント）

本サイトは、クライアントが「この制作者に任せれば、自社の製品やチームの価値が高まり、技術的にも安心である」と確信できるよう設計されています。

1. **インラインスクリプトの完全排除**:
   HTMLソースコード内には一切の `<script>...</script>`（インラインJS）や、タグ内の `onclick="..."` などのハンドラは記述されていません。すべてのイベントは `script.js` にて `addEventListener` 経由でクリーンに制御されており、強力なCSPポリシーを通過します。
2. **パフォーマンス・Web Vitals**:
   jQueryや重いアニメーションライブラリを使わず、CSS3の3Dトランスフォームやイージング、`requestAnimationFrame` を効果的に用いることで、スムーズで60FPSに近い描写を維持しつつ、Lighthouseのハイスコアを達成しやすい軽量構造を実現しています。
3. **安全なDOM複製**:
   ギャラリー拡大時のモーダル生成等において、`innerHTML` による動的なマークアップ追加は行っていません。`cloneNode(true)` を使用して安全なノード複製を行うなど、フロントエンド脆弱性の予防策を徹底しています。
