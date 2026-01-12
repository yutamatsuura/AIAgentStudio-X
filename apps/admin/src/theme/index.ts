import { createTheme } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';
import { components } from './components';

/**
 * AIAgentStudio-X 管理画面テーマ
 *
 * テーマの特徴:
 * - モダンSaaS型デザイン
 * - 折りたたみ可能サイドバー
 * - テーブルビュー（情報密度が高い）
 * - フラットデザイン + シャドウ
 * - ビジネスユース向け
 * - 効率重視
 *
 * MUI v6準拠
 * Emotion使用
 * TypeScript実装
 * ライトモードのみ
 */

const theme = createTheme({
  // カラーパレット
  palette,

  // タイポグラフィ
  typography,

  // コンポーネントカスタマイズ
  components,

  // スペーシング（8pxベース）
  spacing: 8,

  // ブレークポイント（レスポンシブ対応）
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },

  // シャドウのカスタマイズ
  shadows: [
    'none',
    '0 2px 4px rgba(0, 0, 0, 0.06)',
    '0 2px 8px rgba(0, 0, 0, 0.08)',
    '0 4px 12px rgba(0, 0, 0, 0.1)',
    '0 4px 16px rgba(0, 0, 0, 0.12)',
    '0 6px 20px rgba(0, 0, 0, 0.14)',
    '0 8px 24px rgba(0, 0, 0, 0.16)',
    '0 8px 32px rgba(0, 0, 0, 0.18)',
    '0 12px 40px rgba(0, 0, 0, 0.2)',
    '0 16px 48px rgba(0, 0, 0, 0.22)',
    '0 20px 56px rgba(0, 0, 0, 0.24)',
    '0 24px 64px rgba(0, 0, 0, 0.26)',
    '0 28px 72px rgba(0, 0, 0, 0.28)',
    '0 32px 80px rgba(0, 0, 0, 0.3)',
    '0 36px 88px rgba(0, 0, 0, 0.32)',
    '0 40px 96px rgba(0, 0, 0, 0.34)',
    '0 44px 104px rgba(0, 0, 0, 0.36)',
    '0 48px 112px rgba(0, 0, 0, 0.38)',
    '0 52px 120px rgba(0, 0, 0, 0.4)',
    '0 56px 128px rgba(0, 0, 0, 0.42)',
    '0 60px 136px rgba(0, 0, 0, 0.44)',
    '0 64px 144px rgba(0, 0, 0, 0.46)',
    '0 68px 152px rgba(0, 0, 0, 0.48)',
    '0 72px 160px rgba(0, 0, 0, 0.5)',
    '0 76px 168px rgba(0, 0, 0, 0.52)',
  ],

  // 図形の角丸
  shape: {
    borderRadius: 6,
  },

  // トランジション（アニメーション速度）
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },

  // z-indexの階層定義
  zIndex: {
    mobileStepper: 1000,
    fab: 1050,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
});

export default theme;
