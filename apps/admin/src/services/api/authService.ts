/**
 * 認証APIサービス
 *
 * モック実装（バックエンド実装後に置き換え）
 */

import type { LoginCredentials, AuthResponse, User } from '../../types';
import { logger } from '../../lib/logger';

/**
 * モックユーザーデータ
 */
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@aiagent-studio-x.local',
    password: 'DevAdmin2026!',
    name: '管理者',
    role: 'admin' as const,
    createdAt: '2026-01-12T00:00:00Z',
  },
  {
    id: '2',
    email: 'testuser@aiagent-studio-x.local',
    password: 'TestUser2026!',
    name: 'テストユーザー',
    role: 'user' as const,
    createdAt: '2026-01-12T00:00:00Z',
  },
];

/**
 * モックトークン生成
 */
const generateMockToken = (userId: string): string => {
  return `mock_token_${userId}_${Date.now()}`;
};

/**
 * 遅延を追加（APIの遅延をシミュレート）
 */
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * ログイン
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  logger.info('Login attempt', { email: credentials.email });

  // API遅延をシミュレート
  await delay(500);

  // ユーザー検証
  const user = MOCK_USERS.find(
    (u) => u.email === credentials.email && u.password === credentials.password
  );

  if (!user) {
    logger.warn('Login failed: Invalid credentials', { email: credentials.email });
    throw new Error('メールアドレスまたはパスワードが正しくありません');
  }

  // パスワードを除外
  const { password, ...userWithoutPassword } = user;
  void password; // 未使用警告を回避

  // トークン生成
  const token = generateMockToken(user.id);

  logger.info('Login successful', { userId: user.id });

  return {
    token,
    user: {
      ...userWithoutPassword,
      lastLoginAt: new Date().toISOString(),
    },
  };
};

/**
 * ログアウト
 */
export const logout = async (): Promise<void> => {
  logger.info('Logout');
  await delay(200);
};

/**
 * トークン検証
 */
export const verifyToken = async (token: string): Promise<User> => {
  logger.info('Verify token');

  await delay(300);

  // トークンからユーザーIDを抽出（モック）
  const match = token.match(/mock_token_(\d+)_/);
  if (!match) {
    logger.warn('Token verification failed: Invalid token format');
    throw new Error('無効なトークンです');
  }

  const userId = match[1];
  const user = MOCK_USERS.find((u) => u.id === userId);

  if (!user) {
    logger.warn('Token verification failed: User not found');
    throw new Error('ユーザーが見つかりません');
  }

  const { password, ...userWithoutPassword } = user;
  void password; // 未使用警告を回避

  logger.info('Token verified', { userId: user.id });

  return {
    ...userWithoutPassword,
    lastLoginAt: new Date().toISOString(),
  };
};
