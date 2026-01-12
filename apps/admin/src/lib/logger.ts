/**
 * Logger utility for environment-aware logging
 * 環境別ログ制御ユーティリティ
 */

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isE2EMode = import.meta.env.VITE_E2E_MODE === 'true';

  /**
   * デバッグログ（開発環境のみ出力）
   */
  debug(...args: unknown[]): void {
    if (this.isDevelopment && !this.isE2EMode) {
      // eslint-disable-next-line no-console
      console.log('[DEBUG]', ...args);
    }
  }

  /**
   * 情報ログ（開発環境のみ出力）
   */
  info(...args: unknown[]): void {
    if (this.isDevelopment && !this.isE2EMode) {
      // eslint-disable-next-line no-console
      console.log('[INFO]', ...args);
    }
  }

  /**
   * 警告ログ（全環境で出力）
   */
  warn(...args: unknown[]): void {
    if (!this.isE2EMode) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * エラーログ（全環境で出力）
   */
  error(...args: unknown[]): void {
    if (!this.isE2EMode) {
      console.error('[ERROR]', ...args);
    }
  }
}

export const logger = new Logger();
