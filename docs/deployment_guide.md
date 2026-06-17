# AstraNova eスポーツチーム公式サイト - デプロイ手順書

本サイトをローカル環境で起動・テストし、Vercelへ本番デプロイするための全手順を解説します。

---

## 1. 外部サービスの初期設定

お問い合わせフォームを稼働させるために、**Resend** と **Cloudflare Turnstile** のアカウント登録が必要です（すべて無料プランで作成可能です）。

### 1.1. Resend のセットアップ（メール配信用）
1. [Resend 公式サイト](https://resend.com) にアクセスし、アカウントを登録します。
2. 管理画面の左メニューから **API Keys** を選択し、**Create API Key** をクリックします。
3. キー名（例: `AstraNova-Contact-Key`）を設定し、Permissionを `Full Access` にして作成します。
4. 発行された `re_xxxxxxxxxxx` のAPIキーをコピーし、安全に保存しておきます（一度画面を閉じると再表示できません）。
5. *(任意/推奨)* 独自ドメインから送信する場合は、**Domains** からドメインを追加し、DNSレコード（MX/TXT）を登録してDKIM/SPF認証を行います。デフォルトでは `onboarding@resend.dev` から送信されます。

### 1.2. Cloudflare Turnstile のセットアップ（スパム対策）
1. [Cloudflare 管理画面](https://dash.cloudflare.com) にログインします。
2. 左ナビゲーションから **Turnstile** を選択し、**Add Site** をクリックします。
3. 以下の項目を設定します:
   - **Site name**: `AstraNova公式サイト`
   - **Domain**: ローカル検証用に `localhost` を追加し、本番公開時のVercelドメイン（例: `astranova-esports.vercel.app`）も追加します。
   - **Widget Type**: `Managed` (セキュリティレベルが最も高く推奨されるタイプ)
4. 作成後、以下の2つのキーが発行されます:
   - **Site Key (サイトキー)**: フロントエンド HTML/JS で使用する公開キー。
   - **Secret Key (シークレットキー)**: サーバーサイド `api/contact.js` で使用する非公開の認証キー。

---

## 2. ローカル開発環境の準備

Vercel Serverless Function をローカルで実行・デバッグするには、**Vercel CLI** の使用が最も簡単です。

### 2.1. Vercel CLI のインストール
ターミナルを開き、以下のコマンドを実行します。
```bash
npm install -g vercel
```

### 2.2. 環境変数の設定
プロジェクトのルートディレクトリに `.env` ファイルを作成し、取得したキーを設定します。

```env
# Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxx

# Cloudflare Turnstile Key
TURNSTILE_SECRET_KEY=0x4AAAAAA...xxxxxxxxx
```
> [!WARNING]
> `.env` ファイルには本番用の秘密鍵が含まれるため、絶対に Git などのバージョン管理システムにコミットしないでください（`.gitignore` に自動追加される必要があります）。

### 2.3. ローカルサーバーの起動
以下のコマンドを実行して、ローカル開発サーバー（APIエミュレータを含む）を立ち上げます。
```bash
vercel dev
```
起動後、ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスします。フォームの送信時にローカル環境からResend APIが呼び出され、実際にメールが送信されます。

---

## 3. Vercel 本番デプロイ

### 3.1. コマンドラインからのデプロイ
1. プロジェクトのルートで以下のコマンドを実行し、Vercelアカウントにログインしてプロジェクトを接続します。
   ```bash
   vercel
   ```
2. 設定プロンプト（Project Name, Root Directory等）が表示されるので、すべてデフォルト（Enter）で進行します。
3. 初回デプロイが完了し、開発用のプレビューURLが発行されます。

### 3.2. 環境変数の Vercel 登録
本番環境でメール送信とTurnstileを動作させるために、Vercelのダッシュボードで環境変数を登録します。

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセスし、作成されたプロジェクトを選択します。
2. **Settings** タブから **Environment Variables** を開きます。
3. 以下のキーと値を登録します:
   - Key: `RESEND_API_KEY` / Value: `re_xxxxxxxxxxx`
   - Key: `TURNSTILE_SECRET_KEY` / Value: `0x4AAAAAA...`
4. **Save** をクリックします。

### 3.3. 本番公開デプロイ
環境変数を反映させるため、再度ローカルから以下のコマンドで製品ビルド・本番公開を行います。
```bash
vercel --prod
```
発行された本番用URL（`https://[プロジェクト名].vercel.app`）にアクセスし、本番環境で正常にお問い合わせが完了することを確認してください。
