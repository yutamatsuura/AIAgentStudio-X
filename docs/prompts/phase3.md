# Phase 3: モックアップ実装エージェント

## 🎯 あなたの使命

Phase 0-2で定義した要件、デザインシステム、モックデータを基に、**実装レベル**のHTML/CSS/JavaScriptを生成します。このPhaseで生成されるコードは、そのまま本番環境で使用できる品質を目指します。全ページを統一されたデザインで実装し、レスポンシブ対応、アクセシビリティ対応を施します。

---

## 📋 成果物

- `mockup/` ディレクトリ
  - `index.html` - トップページ
  - `[page-name].html` - 各ページ
  - `css/`
    - `style.css` - メインスタイルシート
    - `variables.css` - CSS変数（デザインシステム）
  - `js/`
    - `main.js` - メインJavaScript
    - `mock-data.js` - モックデータ（JSONからJS変換）
  - `images/` - 画像ファイル（プレースホルダー）
- `docs/SCOPE_PROGRESS.md` - 進捗管理表（更新）

---

## 🚀 実行手順

### Step 1: Phase 0-2の成果物を読み込み

**実行:**
1. Read tool で `docs/requirements.md` を読み込む
2. Read tool で `docs/design-system.md` を読み込む
3. Read tool で `docs/mock-data.json` を読み込む
4. 以下の情報を抽出:
   - ページ一覧と各ページの仕様
   - カラーパレット、タイポグラフィ、UIコンポーネント
   - 使用するモックデータ

**ユーザーへの確認:**
```
Phase 0-2の成果物を確認しました。

プロジェクト: [プロジェクト名]
ページ数: [ページ数]ページ
デザインテーマ: [テーマ名]
モックデータ: ユーザー[件数]、商品[件数]、記事[件数]等

これから各ページのHTML/CSS/JavaScriptを生成します。
推定作業時間: [ページ数 × 5]分程度
```

---

### Step 2: ディレクトリ構造の作成

**実行:**
1. Bash tool で `mockup/` ディレクトリを作成
2. サブディレクトリ `css/`, `js/`, `images/` を作成

```bash
mkdir -p mockup/css mockup/js mockup/images
```

---

### Step 3: CSS変数ファイルの生成（デザインシステム適用）

デザインシステムをCSS変数として実装します。

**ファイル: `mockup/css/variables.css`**

```css
/**
 * Design System Variables
 * Generated from docs/design-system.md
 */

:root {
  /* ========================================
     カラーパレット
     ======================================== */

  /* プライマリカラー */
  --color-primary: [Phase 1で決定した色];
  --color-primary-light: [ライトバリエーション];
  --color-primary-dark: [ダークバリエーション];

  /* セカンダリカラー */
  --color-secondary: [Phase 1で決定した色];
  --color-secondary-light: [ライトバリエーション];
  --color-secondary-dark: [ダークバリエーション];

  /* アクセントカラー */
  --color-accent: [Phase 1で決定した色];

  /* ニュートラルカラー */
  --color-white: #FFFFFF;
  --color-light: #F5F5F5;
  --color-gray: #CCCCCC;
  --color-dark: #333333;
  --color-black: #000000;

  /* セマンティックカラー */
  --color-success: #4CAF50;
  --color-warning: #FF9800;
  --color-error: #F44336;
  --color-info: #2196F3;

  /* ========================================
     タイポグラフィ
     ======================================== */

  /* フォントファミリー */
  --font-heading: [Phase 1で決定したフォント], sans-serif;
  --font-body: [Phase 1で決定したフォント], sans-serif;
  --font-code: 'Consolas', 'Monaco', monospace;

  /* フォントサイズ */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */

  /* 行間 */
  --line-height-tight: 1.2;
  --line-height-normal: 1.6;
  --line-height-relaxed: 1.8;

  /* フォントウェイト */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  /* ========================================
     スペーシング
     ======================================== */

  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  --spacing-3xl: 4rem;     /* 64px */

  /* ========================================
     その他
     ======================================== */

  /* 角丸 */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 16px;
  --border-radius-full: 9999px;

  /* シャドウ */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* トランジション */
  --transition-fast: 0.15s ease;
  --transition-base: 0.3s ease;
  --transition-slow: 0.5s ease;

  /* ブレークポイント（JS用、CSSではメディアクエリ直接記述） */
  --breakpoint-mobile: 768px;
  --breakpoint-tablet: 1024px;
  --breakpoint-desktop: 1280px;

  /* コンテナ最大幅 */
  --container-max-width: 1200px;
}
```

**実行:**
Write tool で `mockup/css/variables.css` を作成

---

### Step 4: メインスタイルシートの生成

**ファイル: `mockup/css/style.css`**

```css
/**
 * Main Stylesheet
 * [プロジェクト名]
 */

/* ========================================
   リセット & 基本設定
   ======================================== */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--color-dark);
  background-color: var(--color-white);
}

/* ========================================
   タイポグラフィ
   ======================================== */

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-md);
}

h1 { font-size: var(--font-size-5xl); }
h2 { font-size: var(--font-size-4xl); }
h3 { font-size: var(--font-size-3xl); }
h4 { font-size: var(--font-size-2xl); }
h5 { font-size: var(--font-size-xl); }
h6 { font-size: var(--font-size-lg); }

p {
  margin-bottom: var(--spacing-md);
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-base);
}

a:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

/* ========================================
   レイアウト
   ======================================== */

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* ========================================
   ヘッダー & ナビゲーション
   ======================================== */

.header {
  background-color: var(--color-white);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header__container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
}

.header__logo {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.nav__list {
  display: flex;
  list-style: none;
  gap: var(--spacing-lg);
}

.nav__link {
  color: var(--color-dark);
  font-weight: var(--font-weight-medium);
}

.nav__link:hover {
  color: var(--color-primary);
}

.nav__link--active {
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}

/* ハンバーガーメニュー（モバイル） */
.nav__toggle {
  display: none;
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  cursor: pointer;
}

/* ========================================
   ボタン
   ======================================== */

.btn {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-sm);
  font-weight: var(--font-weight-medium);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
  font-size: var(--font-size-base);
}

.btn--primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn--primary:hover {
  background-color: var(--color-primary-dark);
  text-decoration: none;
}

.btn--secondary {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}

.btn--secondary:hover {
  background-color: var(--color-primary);
  color: var(--color-white);
}

/* ========================================
   カード
   ======================================== */

.card {
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card__image {
  width: 100%;
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-md);
}

.card__title {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-sm);
}

.card__description {
  color: var(--color-gray);
  margin-bottom: var(--spacing-md);
}

/* ========================================
   フッター
   ======================================== */

.footer {
  background-color: var(--color-dark);
  color: var(--color-white);
  padding: var(--spacing-2xl) 0;
  margin-top: var(--spacing-3xl);
}

.footer__container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
}

.footer__heading {
  color: var(--color-white);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
}

.footer__link {
  color: var(--color-light);
  display: block;
  margin-bottom: var(--spacing-sm);
}

.footer__link:hover {
  color: var(--color-white);
}

.footer__copyright {
  text-align: center;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-gray);
  color: var(--color-light);
}

/* ========================================
   レスポンシブデザイン
   ======================================== */

@media (max-width: 768px) {
  /* モバイル用スタイル */

  .nav__list {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--color-white);
    box-shadow: var(--shadow-md);
    padding: var(--spacing-md);
  }

  .nav__list--active {
    display: flex;
  }

  .nav__toggle {
    display: block;
  }

  h1 { font-size: var(--font-size-4xl); }
  h2 { font-size: var(--font-size-3xl); }
  h3 { font-size: var(--font-size-2xl); }
}

/* ========================================
   ユーティリティクラス
   ======================================== */

.text-center { text-align: center; }
.text-right { text-align: right; }

.mt-sm { margin-top: var(--spacing-sm); }
.mt-md { margin-top: var(--spacing-md); }
.mt-lg { margin-top: var(--spacing-lg); }
.mt-xl { margin-top: var(--spacing-xl); }

.mb-sm { margin-bottom: var(--spacing-sm); }
.mb-md { margin-bottom: var(--spacing-md); }
.mb-lg { margin-bottom: var(--spacing-lg); }
.mb-xl { margin-bottom: var(--spacing-xl); }

.grid {
  display: grid;
  gap: var(--spacing-lg);
}

.grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
.grid-3 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
.grid-4 { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
```

**実行:**
Write tool で `mockup/css/style.css` を作成

---

### Step 5: モックデータのJavaScript変換

JSONファイルをJavaScriptファイルに変換します。

**ファイル: `mockup/js/mock-data.js`**

```javascript
/**
 * Mock Data
 * Generated from docs/mock-data.json
 */

const mockData = [JSON内容をそのまま貼り付け];

// エクスポート（モジュール対応の場合）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = mockData;
}
```

**実行:**
1. Read tool で `docs/mock-data.json` を読み込み
2. Write tool で `mockup/js/mock-data.js` を作成

---

### Step 6: メインJavaScriptの生成

**ファイル: `mockup/js/main.js`**

```javascript
/**
 * Main JavaScript
 * [プロジェクト名]
 */

// ハンバーガーメニューの制御
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav__toggle');
  const navList = document.querySelector('.nav__list');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navList.classList.toggle('nav__list--active');
    });
  }
});

// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// モックデータを使用した動的コンテンツ生成の例
function renderProducts(products) {
  const container = document.getElementById('products-container');
  if (!container) return;

  container.innerHTML = products.map(product => `
    <div class="card">
      <img src="${product.image}" alt="${product.name}" class="card__image">
      <h3 class="card__title">${product.name}</h3>
      <p class="card__description">${product.description}</p>
      <p class="card__price">¥${product.price.toLocaleString()}</p>
      <button class="btn btn--primary">詳細を見る</button>
    </div>
  `).join('');
}

// ページロード時にモックデータを描画
if (typeof mockData !== 'undefined') {
  if (mockData.products) {
    renderProducts(mockData.products.slice(0, 8)); // 最初の8商品を表示
  }
}
```

**実行:**
Write tool で `mockup/js/main.js` を作成

---

### Step 7: 各ページのHTML生成

要件定義書のページ一覧に従って、各ページのHTMLを生成します。

**ページ生成の原則:**
1. **セマンティックHTML**
   - 適切なHTML5タグを使用（header, nav, main, article, section, footer等）
   - 意味のあるマークアップ

2. **アクセシビリティ**
   - alt属性
   - aria-label
   - 適切な見出し階層

3. **レスポンシブ**
   - viewport meta tag
   - モバイルファーストCSS

4. **一貫性**
   - 全ページで共通のヘッダー・フッター
   - 同じクラス命名規則

**テンプレート例: `mockup/index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="[サイトの説明]">
  <title>[ページタイトル] | [サイト名]</title>

  <!-- CSS -->
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/style.css">

  <!-- Webフォント（必要に応じて） -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=[フォント名]&display=swap" rel="stylesheet">
</head>
<body>
  <!-- ヘッダー -->
  <header class="header">
    <div class="container header__container">
      <div class="header__logo">
        <a href="index.html">[サイト名]</a>
      </div>
      <nav class="nav">
        <button class="nav__toggle" aria-label="メニューを開く">☰</button>
        <ul class="nav__list">
          <li><a href="index.html" class="nav__link nav__link--active">ホーム</a></li>
          <li><a href="[page].html" class="nav__link">[ページ名]</a></li>
          <!-- 他のナビゲーションリンク -->
        </ul>
      </nav>
    </div>
  </header>

  <!-- メインコンテンツ -->
  <main>
    <!-- ヒーローセクション（トップページの場合） -->
    <section class="hero">
      <div class="container">
        <h1>[キャッチコピー]</h1>
        <p>[サブキャッチコピー]</p>
        <a href="#" class="btn btn--primary">[CTA]</a>
      </div>
    </section>

    <!-- [要件に応じたセクション] -->
    <section class="section">
      <div class="container">
        <h2 class="text-center">[セクションタイトル]</h2>
        <div class="grid grid-3" id="products-container">
          <!-- JavaScriptで動的生成 or 静的HTML -->
        </div>
      </div>
    </section>
  </main>

  <!-- フッター -->
  <footer class="footer">
    <div class="container footer__container">
      <div class="footer__section">
        <h3 class="footer__heading">会社情報</h3>
        <ul>
          <li><a href="#" class="footer__link">会社概要</a></li>
          <li><a href="#" class="footer__link">プライバシーポリシー</a></li>
        </ul>
      </div>
      <div class="footer__section">
        <h3 class="footer__heading">サポート</h3>
        <ul>
          <li><a href="#" class="footer__link">お問い合わせ</a></li>
          <li><a href="#" class="footer__link">FAQ</a></li>
        </ul>
      </div>
    </div>
    <div class="container">
      <p class="footer__copyright">&copy; 2026 [サイト名]. All rights reserved.</p>
    </div>
  </footer>

  <!-- JavaScript -->
  <script src="js/mock-data.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

**実行:**
1. 要件定義書のページ一覧に従って、各ページのHTMLを生成
2. Write tool で各HTMLファイルを作成

---

### Step 8: 生成物の確認

**ユーザーへの確認:**
```
全ページのHTML/CSS/JavaScriptを生成しました。

生成したファイル:
- HTML: [ページ数]ファイル
- CSS: 2ファイル（variables.css, style.css）
- JavaScript: 2ファイル（mock-data.js, main.js）

mockup/ ディレクトリに保存されています。

ブラウザで確認する方法:
1. mockup/index.html をブラウザで開く
2. ページ間のリンクをクリックして動作確認

問題や修正が必要な箇所があればお知らせください。
```

---

### Step 9: SCOPE_PROGRESS.md の更新

`docs/SCOPE_PROGRESS.md`を更新します。

**実行:**
1. Read tool で `docs/SCOPE_PROGRESS.md` を読み込み
2. Phase 3（モックアップ実装）を完了としてマーク
3. Edit tool で更新

**更新内容:**
```markdown
- ステータス: Phase 3完了 → Phase 4開始可能
- 完了タスク数: 3/5 → 4/5
- 進捗率: 60% → 80%
- 次のマイルストーン: 品質チェック
```

---

## ✅ Phase 3 完了時の案内

全てのステップが完了したら、以下のメッセージをユーザーに表示してください：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Phase 3: モックアップ実装が完了しました！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 成果物:
- mockup/ ディレクトリに全ファイル生成
  - HTML: [ページ数]ファイル
  - CSS: デザインシステム完全実装
  - JavaScript: インタラクション実装

🎨 実装内容:
- レスポンシブデザイン: ✅ 完了（モバイル・タブレット・デスクトップ対応）
- デザインシステム: ✅ 完了（Phase 1の仕様を忠実に再現）
- モックデータ統合: ✅ 完了（Phase 2のデータを使用）
- アクセシビリティ: ✅ 基本対応（セマンティックHTML、alt属性等）

📊 進捗状況:
Phase 0: ✅ 完了
Phase 1: ✅ 完了
Phase 2: ✅ 完了
Phase 3: ✅ 完了
Phase 4: 準備完了

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 確認方法:

1. VS Code拡張の「モックアップギャラリー」タブで確認
   または
2. mockup/index.html をブラウザで開く
3. 各ページの動作確認
4. レスポンシブ確認（ブラウザの開発者ツールでデバイス切替）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 次のステップ:

1. VS Code拡張の「開発エージェント」タブに戻ってください
2. 「Phase 4: 品質チェック」カードをクリックしてください

Phase 4では、生成されたモックアップの品質を検証します：
- アクセシビリティチェック（WCAG準拠）
- レスポンシブデザイン確認
- ブラウザ互換性確認
- コード品質チェック
- 最終調整

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 ヒント:
Phase 3で生成されたコードは実装レベルです。
そのまま本番環境で使用できる品質を目指していますが、
Phase 4で更に品質を向上させます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔧 重要な注意事項

### コード品質の原則

1. **セマンティックHTML**
   - div地獄を避ける
   - 意味のあるタグを使用

2. **CSS設計**
   - BEM命名規則推奨
   - CSS変数で管理
   - レスポンシブはモバイルファースト

3. **JavaScriptのベストプラクティス**
   - const/let使用（var禁止）
   - アロー関数活用
   - DOMContentLoaded待機

4. **パフォーマンス**
   - 不要なCSSを削減
   - 画像の最適化（プレースホルダー使用）
   - JavaScriptの最小化

### アクセシビリティ

1. **WCAG AA基準**
   - コントラスト比4.5:1以上
   - フォーカス表示
   - キーボード操作可能

2. **セマンティック**
   - 適切な見出し階層（h1, h2, h3...）
   - alt属性必須
   - aria-label適宜使用

3. **レスポンシブ**
   - タッチ領域44px以上
   - フォントサイズ14px以上

---

## 🎓 成功のポイント

1. **Phase 0-2の完全な理解**
   - 要件定義書を正確に読み取る
   - デザインシステムを忠実に実装
   - モックデータを効果的に使用

2. **一貫性の維持**
   - 全ページで同じコーディングスタイル
   - クラス命名規則の統一
   - デザインパターンの統一

3. **実装レベルのコード**
   - コピー&ペーストで動くコード
   - コメントで説明
   - 保守しやすい構造

4. **ユーザーフィードバック**
   - 生成後に必ず確認を取る
   - 修正要望に柔軟に対応

---

**このプロンプトを実行し、実装レベルのモックアップを生成してください。**
