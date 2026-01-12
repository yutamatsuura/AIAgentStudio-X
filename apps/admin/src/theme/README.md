# AIAgentStudio-X 管理画面テーマ

## 概要

モダンSaaS型デザインテーマのMUI v6実装です。

### テーマの特徴
- ✅ 折りたたみ可能サイドバー対応
- ✅ テーブルビュー最適化（情報密度が高い）
- ✅ フラットデザイン + 適度なシャドウ
- ✅ ビジネスユース向けカラースキーム
- ✅ 効率重視のUI/UX
- ✅ レスポンシブデザイン対応

### 技術スタック
- MUI v6
- TypeScript
- Emotion
- ライトモードのみ

## ファイル構成

```
theme/
├── index.ts         # メインテーマファイル（全設定を統合）
├── palette.ts       # カラーパレット定義
├── typography.ts    # タイポグラフィ設定
├── components.ts    # コンポーネントカスタマイズ
└── README.md        # このファイル
```

## 使用方法

### 基本的な使い方

#### 1. main.tsxでThemeProviderを設定

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      {/* CssBaselineでMUIのベーススタイル適用 */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
```

#### 2. コンポーネント内でテーマを使用

```tsx
import { Box, Button, Typography } from '@mui/material';

function MyComponent() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AIAgentStudio-X
      </Typography>
      <Button variant="contained" color="primary">
        開始する
      </Button>
    </Box>
  );
}
```

### カラーパレット

#### プライマリーカラー
- **main**: `#1976D2` - 鮮やかなブルー
- **light**: `#42A5F5` - ホバー時
- **dark**: `#1565C0` - アクティブ時

#### セカンダリーカラー
- **main**: `#DC004E` - アクセントレッド
- **light**: `#F50057` - ホバー時
- **dark**: `#C51162` - アクティブ時

#### 背景色
- **default**: `#F5F7FA` - ページ全体の背景
- **paper**: `#FFFFFF` - カードやテーブルの背景

#### テキストカラー
- **primary**: `#212121` - メインテキスト
- **secondary**: `#757575` - サブテキスト
- **disabled**: `#BDBDBD` - 無効状態

#### 状態カラー
- **success**: `#4CAF50` - 成功
- **error**: `#F44336` - エラー
- **warning**: `#FF9800` - 警告
- **info**: `#2196F3` - 情報

### タイポグラフィ

#### 見出し
- **h1**: 40px, 700 - ページタイトル
- **h2**: 32px, 700 - セクションタイトル
- **h3**: 28px, 600 - サブセクション
- **h4**: 24px, 600 - カードタイトル
- **h5**: 20px, 600 - 小見出し
- **h6**: 16px, 600 - 最小見出し

#### ボディテキスト
- **body1**: 16px, 400 - 標準テキスト
- **body2**: 14px, 400 - 補足テキスト

#### その他
- **button**: 14px, 500 - ボタンテキスト（大文字変換なし）
- **caption**: 12px, 400 - キャプション
- **overline**: 12px, 500, UPPERCASE - オーバーライン

### コンポーネントカスタマイズ

#### ボタン
- 角丸: 6px
- ホバー時に影が濃くなり、わずかに上方移動
- フラットデザイン基調

#### カード
- 角丸: 8px
- 影: `0 2px 8px rgba(0, 0, 0, 0.08)`
- ホバー時: `0 4px 16px rgba(0, 0, 0, 0.12)`

#### テーブル
- ヘッダー背景: `#F5F7FA`
- ヘッダーボーダー: 2px太線
- 行ホバー: `#F5F7FA`
- 選択行: `#E3F2FD`
- セル間隔: コンパクト（12px padding）

#### インプットフィールド
- 角丸: 6px
- ホバー時にボーダーがプライマリーカラーに
- フォーカス時にボーダー太さ2px

#### サイドバー（Drawer）
- ボーダー: 右側に1px線
- 背景: 白
- リストアイテム角丸: 6px
- 選択アイテム: `#E3F2FD`

### レスポンシブブレークポイント

```typescript
breakpoints: {
  xs: 0,      // モバイル
  sm: 600,    // タブレット
  md: 960,    // 小型ラップトップ
  lg: 1280,   // デスクトップ
  xl: 1920,   // 大画面
}
```

### 使用例（レスポンシブ）

```tsx
<Box
  sx={{
    p: { xs: 2, sm: 3, md: 4 },  // 画面サイズに応じてpaddingを変更
    width: { xs: '100%', md: '50%' },
  }}
>
  コンテンツ
</Box>
```

## 設計思想

### フラットデザイン + シャドウ
- 過度な装飾を避け、シンプルさを重視
- 適度なシャドウで要素の階層を表現
- ホバー時の視覚的フィードバック重視

### 情報密度の最適化
- テーブルビューのセル間隔をコンパクトに
- フォントサイズは視認性を保ちつつ最小化
- 画面スペースの効率的な活用

### ビジネスユース
- 落ち着いたブルー系カラースキーム
- 長時間使用でも疲れにくい配色
- プロフェッショナルな印象

### アクセシビリティ
- 高コントラスト比（WCAG AA準拠）
- システムフォント優先（高速レンダリング）
- キーボードナビゲーション対応

## カスタマイズ方法

### カラーの変更

`palette.ts`を編集：

```typescript
export const palette: PaletteOptions = {
  primary: {
    main: '#YOUR_COLOR',  // ここを変更
  },
};
```

### タイポグラフィの変更

`typography.ts`を編集：

```typescript
export const typography: TypographyOptions = {
  fontSize: 16,  // 基本フォントサイズを変更
};
```

### コンポーネントスタイルの変更

`components.ts`を編集：

```typescript
MuiButton: {
  styleOverrides: {
    root: {
      borderRadius: 8,  // 角丸を変更
    },
  },
},
```

## トラブルシューティング

### テーマが適用されない

1. `ThemeProvider`でアプリ全体をラップしているか確認
2. `CssBaseline`を追加しているか確認
3. ブラウザのキャッシュをクリア

### カスタムカラーが反映されない

```tsx
// ❌ 間違い
<Button color="customColor">ボタン</Button>

// ✅ 正しい（sx propを使用）
<Button sx={{ backgroundColor: 'customColor.main' }}>ボタン</Button>
```

### TypeScriptエラーが出る

```bash
# 型定義の再生成
npm install
npx tsc --noEmit
```

## 参考リンク

- [MUI公式ドキュメント](https://mui.com/)
- [Emotionドキュメント](https://emotion.sh/docs/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
