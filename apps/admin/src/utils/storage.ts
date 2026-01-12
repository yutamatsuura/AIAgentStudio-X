/**
 * ストレージ管理ユーティリティ
 *
 * localStorage と sessionStorage を安全に扱う
 */

import { logger } from '../lib/logger';

/**
 * ストレージタイプ
 */
type StorageType = 'local' | 'session';

/**
 * ストレージ操作クラス
 */
class StorageManager {
  /**
   * ストレージインスタンスを取得
   */
  private getStorage(type: StorageType): Storage {
    return type === 'local' ? localStorage : sessionStorage;
  }

  /**
   * アイテムを保存
   */
  setItem<T>(key: string, value: T, type: StorageType = 'local'): void {
    try {
      const storage = this.getStorage(type);
      const serialized = JSON.stringify(value);
      storage.setItem(key, serialized);
    } catch (error) {
      logger.error('Storage setItem error', { key, error });
    }
  }

  /**
   * アイテムを取得
   */
  getItem<T>(key: string, type: StorageType = 'local'): T | null {
    try {
      const storage = this.getStorage(type);
      const serialized = storage.getItem(key);
      if (serialized === null) {
        return null;
      }
      return JSON.parse(serialized) as T;
    } catch (error) {
      logger.error('Storage getItem error', { key, error });
      return null;
    }
  }

  /**
   * アイテムを削除
   */
  removeItem(key: string, type: StorageType = 'local'): void {
    try {
      const storage = this.getStorage(type);
      storage.removeItem(key);
    } catch (error) {
      logger.error('Storage removeItem error', { key, error });
    }
  }

  /**
   * 全アイテムをクリア
   */
  clear(type: StorageType = 'local'): void {
    try {
      const storage = this.getStorage(type);
      storage.clear();
    } catch (error) {
      logger.error('Storage clear error', { error });
    }
  }
}

export const storage = new StorageManager();
