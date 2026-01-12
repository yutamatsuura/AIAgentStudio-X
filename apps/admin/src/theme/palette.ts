import type { PaletteOptions } from '@mui/material/styles';

/**
 * モダンSaaS型カラーパレット
 *
 * テーマの特徴:
 * - ビジネスユース向けの落ち着いたカラースキーム
 * - 高いコントラスト比による視認性向上
 * - フラットデザイン + 適度なシャドウ
 * - 情報密度が高いテーブルビューに最適化
 */

export const palette: PaletteOptions = {
  mode: 'light',

  // プライマリーカラー（メインアクション、リンク）
  primary: {
    main: '#1976D2',      // 鮮やかなブルー
    light: '#42A5F5',     // ホバー時
    dark: '#1565C0',      // アクティブ時
    contrastText: '#FFFFFF',
  },

  // セカンダリーカラー（補助アクション）
  secondary: {
    main: '#DC004E',      // アクセントレッド
    light: '#F50057',     // ホバー時
    dark: '#C51162',      // アクティブ時
    contrastText: '#FFFFFF',
  },

  // 背景色
  background: {
    default: '#F5F7FA',   // ページ全体の背景（グレー系）
    paper: '#FFFFFF',     // カードやテーブルの背景
  },

  // テキストカラー
  text: {
    primary: '#212121',   // メインテキスト（高コントラスト）
    secondary: '#757575', // サブテキスト
    disabled: '#BDBDBD',  // 無効状態
  },

  // ディバイダー（境界線）
  divider: '#E0E0E0',

  // 状態カラー
  success: {
    main: '#4CAF50',      // 成功
    light: '#81C784',
    dark: '#388E3C',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#F44336',      // エラー
    light: '#E57373',
    dark: '#D32F2F',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FF9800',      // 警告
    light: '#FFB74D',
    dark: '#F57C00',
    contrastText: '#000000',
  },
  info: {
    main: '#2196F3',      // 情報
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#FFFFFF',
  },

  // グレースケール（カスタム）
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};
