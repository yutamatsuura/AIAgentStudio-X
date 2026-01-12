/**
 * 認証コンテキスト
 *
 * アプリケーション全体で認証状態を管理
 */

/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, LoginCredentials, AuthState } from '../types';
import { STORAGE_KEYS } from '../types';
import { storage } from '../utils/storage';
import * as authService from '../services/api/authService';
import { logger } from '../lib/logger';

/**
 * 認証コンテキストの値
 */
interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * 認証コンテキスト
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * 認証プロバイダーのプロパティ
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 認証プロバイダー
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 初期化: ストレージからトークンを復元
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
        const savedUser = storage.getItem<User>(STORAGE_KEYS.USER_DATA);

        if (savedToken && savedUser) {
          // トークン検証
          try {
            const verifiedUser = await authService.verifyToken(savedToken);
            setToken(savedToken);
            setUser(verifiedUser);
            logger.info('Auth restored from storage', { userId: verifiedUser.id });
          } catch (error) {
            // トークンが無効な場合はクリア
            logger.warn('Token verification failed, clearing storage', { error });
            storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            storage.removeItem(STORAGE_KEYS.USER_DATA);
          }
        }
      } catch (error) {
        logger.error('Auth initialization error', { error });
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * ログイン処理
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      setToken(response.token);
      setUser(response.user);

      // ストレージに保存
      const storageType = credentials.rememberMe ? 'local' : 'session';
      storage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token, storageType);
      storage.setItem(STORAGE_KEYS.USER_DATA, response.user, storageType);
      storage.setItem(STORAGE_KEYS.REMEMBER_ME, credentials.rememberMe ?? false, 'local');

      logger.info('Login successful', { userId: response.user.id });
    } catch (error) {
      logger.error('Login error', { error });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ログアウト処理
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();

      setToken(null);
      setUser(null);

      // ストレージをクリア
      storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      storage.removeItem(STORAGE_KEYS.USER_DATA);

      logger.info('Logout successful');
    } catch (error) {
      logger.error('Logout error', { error });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ユーザー情報を更新
   */
  const refreshUser = useCallback(async () => {
    try {
      if (!token) {
        return;
      }

      setIsLoading(true);
      const verifiedUser = await authService.verifyToken(token);
      setUser(verifiedUser);

      // ストレージを更新
      const rememberMe = storage.getItem<boolean>(STORAGE_KEYS.REMEMBER_ME) ?? false;
      const storageType = rememberMe ? 'local' : 'session';
      storage.setItem(STORAGE_KEYS.USER_DATA, verifiedUser, storageType);

      logger.info('User refreshed', { userId: verifiedUser.id });
    } catch (error) {
      logger.error('Refresh user error', { error });
      // トークンが無効な場合はログアウト
      await logout();
    } finally {
      setIsLoading(false);
    }
  }, [token, logout]);

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
