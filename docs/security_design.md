# AstraNova eスポーツチーム公式サイト - セキュリティ設計書

本ドキュメントは、AstraNova公式サイトにおける包括的なセキュリティ設計についてまとめたものです。Vercelでのホスティングを前提とし、フロントエンドとサーバーレス関数の双方で安全な設計を担保します。

---

## 1. HTTPレスポンスヘッダ設計 (vercel.json)

クリックジャッキング、XSS、MIMEタイプのスニッフィングなどを防ぐため、`vercel.json` にて強力なHTTPヘッダを設定します。

### 1.1. 設定ヘッダ一覧
* **Content-Security-Policy (CSP)**:
  - リソースの取得元を信頼できるオリジンのみに制限し、不正な外部スクリプトの実行（XSS）を防ぎます。
  - 設計ポリシー:
    - `default-src 'self';` (基本は同一オリジンのみ許可)
    - `script-src 'self' https://challenges.cloudflare.com;` (自身のJSと、Cloudflare Turnstile検証スクリプトのみ許可。インラインJavaScript `'unsafe-inline'` は厳格に禁止)
    - `frame-src 'self' https://challenges.cloudflare.com;` (Turnstileの検証用インフレームを許可)
    - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;` (外部Google Fontsスタイルシートと、トランジション等のインラインCSSを許可)
    - `font-src 'self' https://fonts.gstatic.com;` (Google Fontsのフォントファイルを許可)
    - `img-src 'self' data: https:;` (ローカル画像とHTTPS経由の外部画像、およびインラインプレビュー用のデータURIを許可)
    - `connect-src 'self' https://challenges.cloudflare.com;` (自身のAPIエンドポイントおよびTurnstileへの接続を許可)
* **Strict-Transport-Security (HSTS)**:
  - `max-age=63072000; includeSubDomains; preload`
  - ブラウザに対して常にHTTPSで通信を行うよう強制し、中間者攻撃（MITM）やSSL剥ぎ取り（SSL Stripping）を防ぎます。
* **X-Frame-Options**:
  - `DENY`
  - 外部サイトの `<iframe>` 内に本サイトが埋め込まれるのを防ぎ、クリックジャッキング攻撃を完全に遮断します。
* **X-Content-Type-Options**:
  - `nosniff`
  - ブラウザによるMIMEタイプのスニッフィング（自動解釈）を無効化し、スタイルシートやスクリプトとして不適切なファイルを読み込ませる攻撃を防ぎます。
* **Referrer-Policy**:
  - `strict-origin-when-cross-origin`
  - 外部サイトへリンクする際、機密情報を含む可能性のあるパス情報などを除外し、オリジン情報のみを送信します。
* **Permissions-Policy**:
  - `camera=(), microphone=(), geolocation=(), interest-cohort=()`
  - サイト内で使用しない不要なブラウザ機能（カメラ、マイク、GPS等）へのアクセスを制限します。

---

## 2. アプリケーション層セキュリティ

### 2.1. 機密情報（APIキー・秘密鍵）の隠蔽
* **環境変数による管理**:
  - Resend APIキー (`RESEND_API_KEY`) および Turnstileシークレットキー (`TURNSTILE_SECRET_KEY`) は、絶対にフロントエンドに露出させません。
  - フロントエンドに公開されるのは、Turnstileのクライアント用サイトキー (`TURNSTILE_SITE_KEY`) のみです。
  - すべての認証・送信処理はサーバーサイド (`api/contact.js`) で完結させ、クライアントからのリクエストを中継します。

### 2.2. XSS（クロスサイトスクリプティング）対策
* **DOM操作時のエスケープ**:
  - JavaScriptでユーザー入力データを扱う際、`innerHTML` は一切使用しません。すべて安全な `textContent` もしくは `innerText` を使用してDOMへ挿入します。
* **HTMLエスケープ (サーバーサイド)**:
  - メール送信前に、本文内のHTMLタグ（`<`, `>`, `&`, `"`, `'`）をHTMLエンティティに変換（エスケープ）し、HTMLメールとして受信側のブラウザでスクリプトが誤発火するリスクを排除します。

```javascript
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

### 2.3. スパム・Bot対策 (Cloudflare Turnstile)
* Google reCAPTCHAに比べ、Turnstileはパッシブ（ユーザー体験を邪魔しない）であり、かつ強力なプライバシー保護とBot防御力を提供します。
* クライアント側で検証に合格したトークンを、サーバーサイドAPIでCloudflareの検証用URL（`https://challenges.cloudflare.com/turnstile/v0/siteverify`）へ送信。APIキーと突き合わせて最終的な信頼性を検証し、承認されたリクエストのみメール転送処理へ移行します。

---

## 3. インフラ・運用セキュリティ

* **Vercel Serverless Function のサンドボックス**:
  - 各送信リクエストは独立した一時的コンテナで実行されるため、サーバーの持続的侵害（ハッキングによる永続化）のリスクが極めて低いです。
* **CORS（オリジン間リソース共有）制限**:
  - `api/contact.js` は、外部の他サイトからの悪意ある直接コールを防ぐため、自ドメイン以外からの `POST` 通信を受け付けない制限を実施します。
