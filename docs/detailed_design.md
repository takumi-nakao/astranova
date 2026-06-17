# AstraNova eスポーツチーム公式サイト - 詳細設計書

本ドキュメントは、AstraNova公式サイトにおけるHTML構造、CSSアニメーションロジック、およびJavaScriptによる各種インタラクションの実装仕様を詳細に定義したものです。

---

## 1. フロントエンド実装仕様

### 1.1. イントローダ (Loader)
* **HTML構造**: 画面最前面を覆う `#loader` コンテナ。中央にSVGチームロゴとプログレス表示用の `#loader-percentage` を配置。
* **動作仕様**:
  1. ページ読み込み開始時に、CSSで `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #000; z-index: 9999;` を指定し、スクロールを一時的に無効化（`body { overflow: hidden; }`）。
  2. JavaScriptの `window.addEventListener('load', ...)` または擬似タイマー（ポートフォリオとしての見栄えを重視したスムーズな0%から100%へのカウントアップ）を用いて値を増加。
  3. 100%に到達後、コンテナにクラス `.loaded` を追加し、CSSの `opacity: 0; visibility: hidden; transition: opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1);` でフェードアウト。
  4. 同時に `body` からスクロール禁止を解除。

### 1.2. インタラクティブカスタムカーソル (Custom Cursor)
* **HTML構造**: `<body>` 直下に `<div id="custom-cursor"></div>` を配置。
* **CSS仕様**:
  - `position: fixed; width: 20px; height: 20px; border: 2px solid var(--accent-cyan); border-radius: 50%; pointer-events: none; transform: translate(-50%, -50%); transition: transform 0.1s ease, width 0.3s ease, height 0.3s ease, background-color 0.3s ease; mix-blend-mode: difference; z-index: 10000;`
* **JS仕様**:
  - マウス移動イベント (`mousemove`) を検知し、マウスの現在座標 `clientX, clientY` を取得。
  - イージング効果（少し遅れてついてくる滑らかな動き）を実現するため、`requestAnimationFrame` を用いて、カーソルの現在位置を目標位置に徐々に近づける補間計算（線形補間: Lerp）を行います。
    $$\text{currentX} = \text{currentX} + (\text{targetX} - \text{currentX}) \times 0.15$$
  - `a`, `button`, `.interactive-element` などにマウスが入った際 (`mouseenter`)、カーソルにクラス `.hovered` を付与し、リングを拡大させ背景色を不透明（または色反転）にします。

### 1.3. スクロール監視とアニメーション (Intersection Observer)
* **HTML/CSS仕様**:
  - アニメーションさせたい要素に `.reveal` クラスと、演出の種類に応じたサブクラス（`.reveal-up`, `.reveal-fade` 等）を付与。
  - 初期状態は `opacity: 0; transform: translateY(30px); transition: opacity 1s cubic-bezier(0.25, 1, 0.5, 1), transform 1s cubic-bezier(0.25, 1, 0.5, 1);`。
* **JS仕様**:
  - `IntersectionObserver` インスタンスを生成。監視閾値（`threshold`）を `0.1`（要素の10%が画面に入った時点）に設定。
  - 交差した要素に対して `.visible` クラスを追加。これにより `opacity: 1; transform: translateY(0);` に遷移。
  - 一度表示されたら監視を解除（`observer.unobserve(entry.target)`）し、不要なブラウザ負荷を軽減。

### 1.4. フルスクリーンハンバーガーメニュー
* **HTML構造**: `#menu-toggle` ボタンと、ナビゲーションリンクを内包する全画面オーバーレイ `#nav-overlay`。
* **アクセシビリティ考慮**:
  - メニュー開閉時に `#menu-toggle` の `aria-expanded` を `true`/`false` に切り替え。
  - スクリーンリーダー対応のため、隠れているナビゲーションには `aria-hidden="true"` または `visibility: hidden;` を適用。
* **動作仕様**:
  - トグルボタンをクリックした際、メニューがスライドインし、各リンク項目が順次（スタッガード）表示されるように `transition-delay` をCSSで制御。

---

## 2. お問い合わせフォーム バリデーション仕様

### 2.1. フロントエンド側バリデーション
送信前に以下のチェックを JavaScript で行います。未入力やエラーがある場合はエラーメッセージを表示し、送信ボタンを非活性化します。

| 項目名 | 検証ルール | エラーメッセージ例 |
| :--- | :--- | :--- |
| お名前 (`name`) | 必須入力、最大100文字 | 「お名前を入力してください。」 |
| メールアドレス (`email`) | 必須入力、RFC準拠の正規表現チェック | 「有効なメールアドレスを入力してください。」 |
| 件名 (`subject`) | 必須入力、最大100文字 | 「件名を入力してください。」 |
| お問い合わせ内容 (`message`) | 必須入力、最大2000文字 | 「本文を入力してください（最大2000文字）。」 |
| Turnstile トークン | チェックボックス完了（トークンが存在すること） | 「セキュリティ検証を完了してください。」 |

---

## 3. 画像モーダル (Lightbox) の詳細動作

* **トリガー**: `.gallery-item` 内の画像をクリック。
* **動作**:
  1. クリックされた画像の `src` および `alt` 属性を取得。
  2. `#lightbox-modal` のイメージタグに複製し、モーダルコンテナを表示状態にする（`.active` クラス付与）。
  3. モーダルの背景には `backdrop-filter: blur(8px) brightness(0.5);` を適用し、高級感を演出。
  4. キーボードの `Esc` キー、または画像外エリア（背景）クリックでモーダルを閉じる。
  5. モーダル展開中は背面ページのスクロールをロック。
