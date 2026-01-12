/**
 * 型定義
 *
 * プロジェクト全体で使用する型を定義
 */

/**
 * ユーザーロール
 */
export type UserRole = 'admin' | 'user';

/**
 * ユーザー情報
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt?: string;
}

/**
 * ログイン資格情報
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * 認証レスポンス
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * 認証状態
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * APIエラーレスポンス
 */
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * ストレージキー
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'aiagent_studio_x_token',
  USER_DATA: 'aiagent_studio_x_user',
  REMEMBER_ME: 'aiagent_studio_x_remember',
} as const;
