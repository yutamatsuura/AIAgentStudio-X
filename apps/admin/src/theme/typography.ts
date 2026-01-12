import type { ThemeOptions } from '@mui/material/styles';

/**
 * モダンSaaS型タイポグラフィ設定
 *
 * 設計方針:
 * - システムフォント優先（高速レンダリング）
 * - ビジネスドキュメントに適した行間
 * - テーブルビュー向けのコンパクトなサイズ設定
 * - 階層的な見出し構造
 */

export const typography: ThemeOptions['typography'] = {
  // フォントファミリー（システムフォント優先）
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),

  // 基本フォントサイズ
  fontSize: 14,

  // フォントウェイト
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,

  // 見出しスタイル
  h1: {
    fontSize: '2.5rem',      // 40px
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontSize: '2rem',        // 32px
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontSize: '1.75rem',     // 28px
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0em',
  },
  h4: {
    fontSize: '1.5rem',      // 24px
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.00735em',
  },
  h5: {
    fontSize: '1.25rem',     // 20px
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0em',
  },
  h6: {
    fontSize: '1rem',        // 16px
    fontWeight: 600,
    lineHeight: 1.6,
    letterSpacing: '0.0075em',
  },

  // ボディテキスト
  body1: {
    fontSize: '1rem',        // 16px
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  body2: {
    fontSize: '0.875rem',    // 14px
    fontWeight: 400,
    lineHeight: 1.43,
    letterSpacing: '0.01071em',
  },

  // サブタイトル
  subtitle1: {
    fontSize: '1rem',        // 16px
    fontWeight: 500,
    lineHeight: 1.75,
    letterSpacing: '0.00938em',
  },
  subtitle2: {
    fontSize: '0.875rem',    // 14px
    fontWeight: 500,
    lineHeight: 1.57,
    letterSpacing: '0.00714em',
  },

  // ボタンテキスト
  button: {
    fontSize: '0.875rem',    // 14px
    fontWeight: 500,
    lineHeight: 1.75,
    letterSpacing: '0.02857em',
    textTransform: 'none',   // 大文字変換なし（日本語対応）
  },

  // キャプション
  caption: {
    fontSize: '0.75rem',     // 12px
    fontWeight: 400,
    lineHeight: 1.66,
    letterSpacing: '0.03333em',
  },

  // オーバーライン（小見出し）
  overline: {
    fontSize: '0.75rem',     // 12px
    fontWeight: 500,
    lineHeight: 2.66,
    letterSpacing: '0.08333em',
    textTransform: 'uppercase',
  },
};
