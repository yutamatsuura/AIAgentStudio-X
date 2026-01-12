# Error Handling Strategy

**Version**: 1.0.0
**Created**: 2026-01-12

---

## 目次

1. [エラー分類体系](#エラー分類体系)
2. [エラーコード設計](#エラーコード設計)
3. [レイヤー別エラーハンドリング](#レイヤー別エラーハンドリング)
4. [ユーザー向けエラーメッセージ](#ユーザー向けエラーメッセージ)
5. [リトライ戦略](#リトライ戦略)
6. [エラーログ戦略](#エラーログ戦略)

---

## エラー分類体系

### 1. エラー種別

| 種別 | 説明 | 例 | 対応方法 |
|------|------|-----|----------|
| **User Error** | ユーザー操作によるエラー | 無効な入力、認証失敗 | ユーザーに修正を促す |
| **System Error** | システム内部エラー | 設定ミス、リソース不足 | システム管理者に通知 |
| **External Error** | 外部サービスエラー | Cloud API障害、ネットワーク断 | リトライ、フォールバック |
| **Validation Error** | データ検証エラー | スキーマ違反、型不一致 | 詳細なバリデーションメッセージ |
| **Runtime Error** | 実行時エラー | Null参照、未定義変数 | スタックトレース記録、フォールバック |

### 2. 重大度レベル

| Level | 名称 | 影響範囲 | 対応優先度 | ユーザー通知 |
|-------|------|---------|-----------|-------------|
| **CRITICAL** | 致命的 | システム全体停止 | 即時 | 必須 |
| **ERROR** | エラー | 機能不全 | 高 | 必須 |
| **WARNING** | 警告 | 機能制限 | 中 | 推奨 |
| **INFO** | 情報 | 情報提供のみ | 低 | 任意 |
| **DEBUG** | デバッグ | 開発時のみ | - | 不要 |

---

## エラーコード設計

### コード体系

```
[PREFIX]-[COMPONENT]-[NUMBER]

例:
- EXT-PHASE-001: Extension - Phase Management - Error 001
- MCP-TOOL-002: MCP Server - Tool - Error 002
- API-AUTH-001: Cloud API - Authentication - Error 001
```

### VS Code Extension エラーコード

| Code | Description | Severity | Recovery |
|------|-------------|----------|----------|
| `EXT-PHASE-001` | Phase already running | ERROR | Stop current phase first |
| `EXT-PHASE-002` | Claude Code CLI not found | CRITICAL | Install Claude Code |
| `EXT-PHASE-003` | Invalid phase transition | ERROR | Check phase order |
| `EXT-PHASE-004` | Phase execution timeout | ERROR | Retry or cancel |
| `EXT-WEBVIEW-001` | Webview creation failed | ERROR | Restart VS Code |
| `EXT-WEBVIEW-002` | Webview message error | WARNING | Refresh webview |
| `EXT-FILE-001` | File watcher error | WARNING | Manual refresh |
| `EXT-FILE-002` | File read/write error | ERROR | Check permissions |
| `EXT-AUTH-001` | Login failed | ERROR | Check credentials |
| `EXT-AUTH-002` | Session expired | WARNING | Re-login required |
| `EXT-SYNC-001` | Sync failed | ERROR | Retry sync |
| `EXT-CONFIG-001` | Invalid configuration | CRITICAL | Fix config file |

### MCP Server エラーコード

| Code | Description | Severity | Recovery |
|------|-------------|----------|----------|
| `MCP-TOOL-001` | Tool not found | ERROR | Check tool name |
| `MCP-TOOL-002` | Invalid tool arguments | ERROR | Fix arguments |
| `MCP-PROMPT-001` | Prompt not found | ERROR | Check phase name |
| `MCP-PROMPT-002` | Prompt fetch failed | ERROR | Retry or use cache |
| `MCP-CACHE-001` | Cache read error | WARNING | Bypass cache |
| `MCP-CACHE-002` | Cache write error | INFO | Continue without cache |
| `MCP-API-001` | Cloud API connection failed | ERROR | Retry with backoff |
| `MCP-API-002` | Cloud API timeout | ERROR | Retry |
| `MCP-API-003` | Cloud API rate limit | WARNING | Wait and retry |
| `MCP-VALIDATION-001` | Input validation failed | ERROR | Fix input schema |

### Cloud API エラーコード

| Code | Description | HTTP Status | Recovery |
|------|-------------|-------------|----------|
| `API-AUTH-001` | Invalid credentials | 401 | Re-enter credentials |
| `API-AUTH-002` | JWT expired | 401 | Refresh token |
| `API-AUTH-003` | API key invalid | 401 | Check API key |
| `API-PERM-001` | Insufficient permissions | 403 | Contact admin |
| `API-PROMPT-001` | Prompt not found | 404 | Create prompt |
| `API-PROMPT-002` | Duplicate phase | 409 | Update existing |
| `API-PROMPT-003` | Version conflict | 409 | Resolve conflict |
| `API-VALID-001` | Validation error | 400 | Fix request data |
| `API-DB-001` | Database connection error | 500 | Retry |
| `API-DB-002` | Query execution error | 500 | Check query |
| `API-RATE-001` | Rate limit exceeded | 429 | Wait and retry |

---

## レイヤー別エラーハンドリング

### 1. VS Code Extension Layer

#### PhaseManager

```typescript
class PhaseManager {
  async startPhase(phase: string): Promise<void> {
    try {
      // 実行中チェック
      if (this.isRunning()) {
        throw new ExtensionError(
          'EXT-PHASE-001',
          'Another phase is already running',
          ErrorSeverity.ERROR,
          { currentPhase: this.currentPhase }
        );
      }

      // Claude Code CLI存在チェック
      if (!await this.claudeCodeExists()) {
        throw new ExtensionError(
          'EXT-PHASE-002',
          'Claude Code CLI not found',
          ErrorSeverity.CRITICAL,
          {
            suggestion: 'Please install Claude Code: npm install -g @anthropics/claude-code'
          }
        );
      }

      // プロンプト取得
      const prompt = await this.cloudApiClient.getPrompt(phase);

      // Claude Code起動
      await this.claudeCodeLauncher.launch(prompt);

      // 成功
      this.currentPhase = phase;
      this.notifyWebview('phaseStarted', { phase });

    } catch (error) {
      // エラーハンドリング
      this.handlePhaseError(error, phase);
      throw error;
    }
  }

  private handlePhaseError(error: Error, phase: string): void {
    if (error instanceof ExtensionError) {
      // 拡張機能エラー
      logger.error(`Phase start failed: ${error.code}`, {
        code: error.code,
        phase,
        message: error.message,
        metadata: error.metadata
      });

      // ユーザー通知
      vscode.window.showErrorMessage(
        `Failed to start ${phase}: ${error.userMessage}`,
        ...error.actions
      );

    } else if (error instanceof CloudApiError) {
      // Cloud APIエラー
      logger.error('Cloud API error', {
        phase,
        statusCode: error.statusCode,
        message: error.message
      });

      vscode.window.showErrorMessage(
        `Cloud API error: ${error.message}`,
        'Retry'
      ).then((action) => {
        if (action === 'Retry') {
          this.startPhase(phase);
        }
      });

    } else {
      // 予期しないエラー
      logger.error('Unexpected error', {
        phase,
        error: error.message,
        stack: error.stack
      });

      vscode.window.showErrorMessage(
        'An unexpected error occurred. Please check the logs.',
        'Open Logs'
      ).then((action) => {
        if (action === 'Open Logs') {
          vscode.commands.executeCommand('workbench.action.showLogs');
        }
      });
    }

    // Webviewにエラー通知
    this.notifyWebview('error', {
      code: error.code || 'UNKNOWN',
      message: error.message,
      phase
    });
  }
}
```

#### カスタムErrorクラス

```typescript
enum ErrorSeverity {
  CRITICAL = 'CRITICAL',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO'
}

class ExtensionError extends Error {
  constructor(
    public code: string,
    message: string,
    public severity: ErrorSeverity,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'ExtensionError';
  }

  get userMessage(): string {
    // ユーザー向けメッセージ生成
    return ERROR_MESSAGES[this.code] || this.message;
  }

  get actions(): string[] {
    // 推奨アクション
    return ERROR_ACTIONS[this.code] || [];
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  'EXT-PHASE-001': 'Another phase is currently running. Please stop it first.',
  'EXT-PHASE-002': 'Claude Code CLI is not installed on your system.',
  'EXT-PHASE-003': 'Invalid phase transition. Please follow the phase order.',
  // ...
};

const ERROR_ACTIONS: Record<string, string[]> = {
  'EXT-PHASE-001': ['Stop Current Phase', 'Cancel'],
  'EXT-PHASE-002': ['Install Guide', 'Cancel'],
  'EXT-PHASE-003': ['View Phase Order', 'Cancel'],
  // ...
};
```

---

### 2. MCP Server Layer

#### Tool Handler

```typescript
server.registerTool(
  "inject_phase_prompt",
  { /* schema */ },
  async (args) => {
    try {
      // バリデーション
      const validated = InputSchema.parse(args);

      // プロンプト取得
      const prompt = await getPrompt(validated.phase);

      if (!prompt) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Prompt not found for phase: ${validated.phase}`,
          {
            code: 'MCP-PROMPT-001',
            phase: validated.phase
          }
        );
      }

      return {
        content: [{ type: "text", text: prompt.content }],
        metadata: { /* ... */ }
      };

    } catch (error) {
      // Zodバリデーションエラー
      if (error instanceof z.ZodError) {
        logger.error('Validation error', {
          errors: error.errors,
          input: args
        });

        throw new McpError(
          ErrorCode.InvalidParams,
          'Invalid tool arguments',
          {
            code: 'MCP-VALIDATION-001',
            errors: error.errors
          }
        );
      }

      // Cloud APIエラー
      if (error instanceof CloudApiError) {
        logger.error('Cloud API error in tool', {
          code: error.code,
          statusCode: error.statusCode,
          message: error.message
        });

        // リトライ可能なエラーの場合
        if (error.isRetryable()) {
          // キャッシュフォールバック
          const cached = await promptCache.get(validated.phase);
          if (cached) {
            logger.warn('Using cached prompt due to API error', {
              phase: validated.phase
            });
            return {
              content: [{ type: "text", text: cached.content }],
              metadata: { cached: true, warning: 'API unavailable' }
            };
          }
        }

        throw new McpError(
          ErrorCode.InternalError,
          `Failed to fetch prompt: ${error.message}`,
          {
            code: 'MCP-API-001',
            originalError: error.message
          }
        );
      }

      // 予期しないエラー
      logger.error('Unexpected error in tool', {
        error: error.message,
        stack: error.stack
      });

      throw new McpError(
        ErrorCode.InternalError,
        'Internal server error',
        {
          code: 'MCP-INTERNAL-001',
          message: error.message
        }
      );
    }
  }
);
```

---

### 3. Cloud API Layer

#### NestJS Exception Filter

```typescript
// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let code: string;
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        code = (exceptionResponse as any).code || `API-HTTP-${status}`;
        details = (exceptionResponse as any).details;
      } else {
        message = exceptionResponse;
        code = `API-HTTP-${status}`;
      }

    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      code = 'API-INTERNAL-001';

    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      code = 'API-UNKNOWN-001';
    }

    // ロギング
    this.logger.error(
      `${request.method} ${request.url}`,
      {
        statusCode: status,
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      }
    );

    // レスポンス
    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status],
      code,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

#### Custom Business Exceptions

```typescript
// src/common/exceptions/business.exception.ts
export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    public code: string,
    public details?: any
  ) {
    super(
      {
        statusCode,
        message,
        code,
        details,
      },
      statusCode
    );
  }
}

// 使用例
export class PromptNotFoundException extends BusinessException {
  constructor(phase: string) {
    super(
      `Prompt not found for phase: ${phase}`,
      HttpStatus.NOT_FOUND,
      'API-PROMPT-001',
      { phase }
    );
  }
}

export class PromptVersionConflictException extends BusinessException {
  constructor(promptId: string, currentVersion: number, providedVersion: number) {
    super(
      'Version conflict detected',
      HttpStatus.CONFLICT,
      'API-PROMPT-003',
      {
        promptId,
        currentVersion,
        providedVersion,
        suggestion: 'Fetch the latest version and try again'
      }
    );
  }
}
```

---

## ユーザー向けエラーメッセージ

### メッセージ設計原則

1. **明確性**: エラーの原因を明確に伝える
2. **アクション可能性**: 次に何をすべきかを示す
3. **丁寧さ**: 非難せず、サポートする態度
4. **簡潔性**: 専門用語を避け、シンプルに

### メッセージテンプレート

```typescript
const USER_ERROR_MESSAGES = {
  'EXT-PHASE-001': {
    title: 'Phase Already Running',
    message: 'Another phase is currently in progress. Would you like to stop it and start a new one?',
    actions: ['Stop and Start New', 'Cancel'],
    severity: 'warning'
  },

  'EXT-PHASE-002': {
    title: 'Claude Code Not Found',
    message: 'Claude Code CLI is not installed. Please install it to use AIAgentStudio-X.',
    actions: ['Installation Guide', 'Cancel'],
    severity: 'error',
    helpUrl: 'https://docs.aiagentstudio.com/setup/install-claude-code'
  },

  'EXT-AUTH-001': {
    title: 'Login Failed',
    message: 'Unable to log in with the provided credentials. Please check your email and password.',
    actions: ['Try Again', 'Reset Password', 'Cancel'],
    severity: 'error'
  },

  'MCP-API-001': {
    title: 'Connection Error',
    message: 'Unable to connect to the Cloud API. Please check your internet connection.',
    actions: ['Retry', 'Use Cached Data', 'Cancel'],
    severity: 'error'
  }
};
```

---

## リトライ戦略

### Exponential Backoff

```typescript
class RetryStrategy {
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number;
      initialDelay?: number;
      maxDelay?: number;
      backoffMultiplier?: number;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      initialDelay = 1000,
      maxDelay = 30000,
      backoffMultiplier = 2
    } = options;

    let lastError: Error;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // リトライ不可能なエラーの場合は即座に失敗
        if (!this.isRetryable(error)) {
          throw error;
        }

        // 最後の試行の場合はリトライしない
        if (attempt === maxRetries) {
          break;
        }

        // 待機
        logger.warn(`Retry attempt ${attempt + 1}/${maxRetries}`, {
          delay,
          error: error.message
        });

        await this.sleep(delay);

        // 次の遅延時間を計算
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }

    throw lastError;
  }

  private isRetryable(error: Error): boolean {
    // リトライ可能なエラーかどうかを判定
    if (error instanceof CloudApiError) {
      return error.statusCode >= 500 || error.statusCode === 429;
    }

    if (error instanceof ExtensionError) {
      return ['EXT-SYNC-001', 'MCP-API-001'].includes(error.code);
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 使用例

```typescript
const retryStrategy = new RetryStrategy();

const prompt = await retryStrategy.executeWithRetry(
  () => cloudApiClient.getPrompt(phase),
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  }
);
```

---

## エラーログ戦略

### ログフォーマット

```typescript
interface ErrorLog {
  timestamp: string;
  level: 'ERROR' | 'WARNING';
  component: string;
  code: string;
  message: string;
  metadata?: {
    userId?: string;
    requestId?: string;
    stackTrace?: string;
    [key: string]: any;
  };
}
```

### ログ実装

```typescript
class ErrorLogger {
  log(error: Error, context: {
    component: string;
    userId?: string;
    requestId?: string;
  }): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      level: this.getLevel(error),
      component: context.component,
      code: this.getCode(error),
      message: error.message,
      metadata: {
        userId: context.userId,
        requestId: context.requestId,
        stackTrace: error.stack,
        ...this.getMetadata(error)
      }
    };

    // ファイルログ出力
    this.writeToFile(errorLog);

    // コンソール出力（開発環境）
    if (process.env.NODE_ENV === 'development') {
      console.error(JSON.stringify(errorLog, null, 2));
    }

    // エラートラッキングサービス（本番環境）
    if (process.env.NODE_ENV === 'production') {
      this.sendToSentry(errorLog);
    }
  }

  private getLevel(error: Error): 'ERROR' | 'WARNING' {
    if (error instanceof ExtensionError) {
      return error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.ERROR
        ? 'ERROR'
        : 'WARNING';
    }
    return 'ERROR';
  }

  private getCode(error: Error): string {
    if (error instanceof ExtensionError || error instanceof BusinessException) {
      return error.code;
    }
    return 'UNKNOWN';
  }

  private getMetadata(error: Error): Record<string, any> {
    if (error instanceof ExtensionError || error instanceof BusinessException) {
      return error.metadata || {};
    }
    return {};
  }
}
```

---

## エラー通知戦略

### 通知チャネル

| Severity | VS Code通知 | Webview通知 | ログ出力 | 外部通知 |
|----------|-----------|------------|---------|---------|
| CRITICAL | モーダルエラー | 赤色バナー | ERROR | Sentry |
| ERROR | エラー通知 | オレンジバナー | ERROR | - |
| WARNING | 警告通知 | 黄色バナー | WARN | - |
| INFO | 情報通知 | 青色バナー | INFO | - |

---

**関連ドキュメント**:
- `architecture.md` - システムアーキテクチャ
- `mcp-tools.md` - MCPツール定義
- `vscode-commands.md` - VS Code拡張コマンド
- `security-design.md` - セキュリティ設計
