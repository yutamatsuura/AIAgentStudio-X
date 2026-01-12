# MCP Server Tools Definition

**Version**: 1.0.0
**Created**: 2026-01-12
**MCP SDK**: @modelcontextprotocol/sdk v0.5.0+

---

## 目次

1. [概要](#概要)
2. [ツール一覧](#ツール一覧)
3. [ツール詳細仕様](#ツール詳細仕様)
4. [実装例](#実装例)
5. [エラーハンドリング](#エラーハンドリング)

---

## 概要

AIAgentStudio-X MCPサーバーは、Claude Codeとの統合のために以下の4つのツールを提供します。

### ツールの役割

| ツール名 | 用途 | 呼び出し元 |
|----------|------|-----------|
| `inject_phase_prompt` | フェーズプロンプト注入 | Claude Code (自動) |
| `transition_to_next_phase` | フェーズ遷移 | Claude Code (エージェント) |
| `get_phase_context` | コンテキスト取得 | Claude Code (エージェント) |
| `save_phase_result` | 結果保存 | Claude Code (エージェント) |

---

## ツール一覧

### 1. inject_phase_prompt

**説明**: 指定されたフェーズのプロンプトをClaude Codeに注入します。

**呼び出しタイミング**:
- VS Code拡張からフェーズ開始時
- `transition_to_next_phase` 実行後の自動遷移時

**Input Schema**:
```typescript
{
  type: "object",
  properties: {
    phase: {
      type: "string",
      enum: ["phase0", "phase1", "phase2", "phase3", "phase4"],
      description: "注入するフェーズ名"
    },
    context: {
      type: "object",
      description: "フェーズ固有のコンテキスト情報",
      properties: {
        projectPath: {
          type: "string",
          description: "プロジェクトルートパス"
        },
        previousPhaseResults: {
          type: "object",
          description: "前フェーズの実行結果"
        }
      }
    }
  },
  required: ["phase"]
}
```

**Output Format**:
```typescript
{
  content: [
    {
      type: "text",
      text: string // フェーズプロンプトの全文（Markdown）
    }
  ],
  metadata: {
    phase: string,
    version: number,
    fetchedAt: string, // ISO 8601
    cached: boolean
  }
}
```

**Example**:
```typescript
// Request
{
  "name": "inject_phase_prompt",
  "arguments": {
    "phase": "phase0",
    "context": {
      "projectPath": "/Users/user/myproject"
    }
  }
}

// Response
{
  "content": [{
    "type": "text",
    "text": "# Phase 0: 要件定義・技術設計\n\n..."
  }],
  "metadata": {
    "phase": "phase0",
    "version": 3,
    "fetchedAt": "2026-01-12T10:30:00Z",
    "cached": false
  }
}
```

---

### 2. transition_to_next_phase

**説明**: 現在のフェーズを完了し、次のフェーズに遷移します。

**呼び出しタイミング**:
- エージェントがフェーズの全タスクを完了した時
- エージェント自身が次フェーズへの準備が整ったと判断した時

**Input Schema**:
```typescript
{
  type: "object",
  properties: {
    currentPhase: {
      type: "string",
      enum: ["phase0", "phase1", "phase2", "phase3", "phase4"],
      description: "現在のフェーズ名"
    },
    result: {
      type: "object",
      description: "現在フェーズの実行結果",
      properties: {
        status: {
          type: "string",
          enum: ["completed", "partial", "failed"],
          description: "完了ステータス"
        },
        outputFiles: {
          type: "array",
          items: { type: "string" },
          description: "生成されたファイルパスのリスト"
        },
        summary: {
          type: "string",
          description: "実行結果のサマリー"
        }
      },
      required: ["status"]
    }
  },
  required: ["currentPhase", "result"]
}
```

**Output Format**:
```typescript
{
  content: [
    {
      type: "text",
      text: string // 遷移完了メッセージ
    }
  ],
  nextPhase: string | null, // 次のフェーズ名（最終フェーズの場合はnull）
  transitionedAt: string // ISO 8601
}
```

**Example**:
```typescript
// Request
{
  "name": "transition_to_next_phase",
  "arguments": {
    "currentPhase": "phase0",
    "result": {
      "status": "completed",
      "outputFiles": [
        "docs/requirements.md",
        "docs/data-model.md",
        "docs/api-spec.md"
      ],
      "summary": "要件定義・技術設計が完了しました。"
    }
  }
}

// Response
{
  "content": [{
    "type": "text",
    "text": "Phase 0 completed successfully. Transitioning to Phase 1..."
  }],
  "nextPhase": "phase1",
  "transitionedAt": "2026-01-12T11:00:00Z"
}
```

---

### 3. get_phase_context

**説明**: 指定されたフェーズのコンテキスト情報を取得します。

**呼び出しタイミング**:
- エージェントが前フェーズの情報を参照する必要がある時
- プロジェクト状態を確認する時

**Input Schema**:
```typescript
{
  type: "object",
  properties: {
    phase: {
      type: "string",
      enum: ["phase0", "phase1", "phase2", "phase3", "phase4"],
      description: "コンテキストを取得するフェーズ名"
    },
    includeResults: {
      type: "boolean",
      default: true,
      description: "実行結果を含めるかどうか"
    }
  },
  required: ["phase"]
}
```

**Output Format**:
```typescript
{
  content: [
    {
      type: "text",
      text: string // コンテキスト情報（JSON形式のテキスト）
    }
  ],
  context: {
    phase: string,
    status: "pending" | "in_progress" | "completed" | "failed",
    startedAt: string | null,
    completedAt: string | null,
    result: object | null,
    outputFiles: string[]
  }
}
```

**Example**:
```typescript
// Request
{
  "name": "get_phase_context",
  "arguments": {
    "phase": "phase0",
    "includeResults": true
  }
}

// Response
{
  "content": [{
    "type": "text",
    "text": "{\"phase\":\"phase0\",\"status\":\"completed\",...}"
  }],
  "context": {
    "phase": "phase0",
    "status": "completed",
    "startedAt": "2026-01-12T10:00:00Z",
    "completedAt": "2026-01-12T11:00:00Z",
    "result": {
      "status": "completed",
      "outputFiles": ["docs/requirements.md", "docs/data-model.md"],
      "summary": "..."
    },
    "outputFiles": ["docs/requirements.md", "docs/data-model.md", "docs/api-spec.md"]
  }
}
```

---

### 4. save_phase_result

**説明**: フェーズの実行結果を保存します（遷移せずに中間保存）。

**呼び出しタイミング**:
- エージェントが重要なマイルストーンを達成した時
- 長時間実行フェーズで進捗を保存する時

**Input Schema**:
```typescript
{
  type: "object",
  properties: {
    phase: {
      type: "string",
      enum: ["phase0", "phase1", "phase2", "phase3", "phase4"],
      description: "保存対象のフェーズ名"
    },
    result: {
      type: "object",
      description: "保存する実行結果",
      properties: {
        checkpoint: {
          type: "string",
          description: "チェックポイント名"
        },
        data: {
          type: "object",
          description: "保存するデータ"
        }
      },
      required: ["checkpoint", "data"]
    }
  },
  required: ["phase", "result"]
}
```

**Output Format**:
```typescript
{
  content: [
    {
      type: "text",
      text: string // 保存完了メッセージ
    }
  ],
  savedAt: string // ISO 8601
}
```

**Example**:
```typescript
// Request
{
  "name": "save_phase_result",
  "arguments": {
    "phase": "phase3",
    "result": {
      "checkpoint": "html_structure_completed",
      "data": {
        "filesGenerated": 5,
        "remainingTasks": ["css_styling", "js_implementation"]
      }
    }
  }
}

// Response
{
  "content": [{
    "type": "text",
    "text": "Phase 3 progress saved at checkpoint: html_structure_completed"
  }],
  "savedAt": "2026-01-12T12:30:00Z"
}
```

---

## 実装例

### サーバーセットアップ

```typescript
// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new Server(
  {
    name: "aiagentstudio-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ツール登録
import { registerInjectPhasePrompt } from "./tools/injectPhasePrompt.js";
import { registerTransitionToNextPhase } from "./tools/transitionPhase.js";
import { registerGetPhaseContext } from "./tools/getPhaseContext.js";
import { registerSavePhaseResult } from "./tools/savePhaseResult.js";

registerInjectPhasePrompt(server);
registerTransitionToNextPhase(server);
registerGetPhaseContext(server);
registerSavePhaseResult(server);

// 起動
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIAgentStudio-X MCP Server running on stdio");
}

main().catch(console.error);
```

### inject_phase_prompt 実装

```typescript
// src/tools/injectPhasePrompt.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import { CloudApiClient } from "../services/cloudApiClient.js";
import { PromptCache } from "../services/promptCache.js";

const InputSchema = z.object({
  phase: z.enum(["phase0", "phase1", "phase2", "phase3", "phase4"]),
  context: z.object({
    projectPath: z.string().optional(),
    previousPhaseResults: z.record(z.unknown()).optional(),
  }).optional(),
});

export function registerInjectPhasePrompt(server: Server) {
  server.registerTool(
    "inject_phase_prompt",
    {
      description: "指定されたフェーズのプロンプトをClaude Codeに注入",
      inputSchema: InputSchema.shape,
    },
    async (args) => {
      const { phase, context } = InputSchema.parse(args);

      // キャッシュチェック
      const cache = PromptCache.getInstance();
      let prompt = await cache.get(phase);
      let cached = true;

      // キャッシュミスの場合、Cloud APIから取得
      if (!prompt) {
        const apiClient = CloudApiClient.getInstance();
        prompt = await apiClient.getPrompt(phase);
        cache.set(phase, prompt);
        cached = false;
      }

      // コンテキストをプロンプトに埋め込む（オプション）
      let finalPrompt = prompt.content;
      if (context?.projectPath) {
        finalPrompt = `Project Path: ${context.projectPath}\n\n${finalPrompt}`;
      }

      return {
        content: [
          {
            type: "text",
            text: finalPrompt,
          },
        ],
        metadata: {
          phase,
          version: prompt.version,
          fetchedAt: new Date().toISOString(),
          cached,
        },
      };
    }
  );
}
```

### transition_to_next_phase 実装

```typescript
// src/tools/transitionPhase.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import { PhaseManager } from "../services/phaseManager.js";

const InputSchema = z.object({
  currentPhase: z.enum(["phase0", "phase1", "phase2", "phase3", "phase4"]),
  result: z.object({
    status: z.enum(["completed", "partial", "failed"]),
    outputFiles: z.array(z.string()).optional(),
    summary: z.string().optional(),
  }),
});

export function registerTransitionToNextPhase(server: Server) {
  server.registerTool(
    "transition_to_next_phase",
    {
      description: "現在のフェーズを完了し、次のフェーズに遷移",
      inputSchema: InputSchema.shape,
    },
    async (args) => {
      const { currentPhase, result } = InputSchema.parse(args);

      const phaseManager = PhaseManager.getInstance();

      // 現在のフェーズ結果を保存
      await phaseManager.savePhaseResult(currentPhase, result);

      // 次のフェーズを決定
      const nextPhase = phaseManager.getNextPhase(currentPhase);

      let message: string;
      if (nextPhase) {
        message = `Phase ${currentPhase} completed successfully. Transitioning to ${nextPhase}...`;

        // 次のフェーズを開始
        await phaseManager.startPhase(nextPhase);

        // VS Code拡張に通知（イベント発行）
        // （実装方法は別途検討）
      } else {
        message = `Phase ${currentPhase} completed. All phases finished!`;
      }

      return {
        content: [
          {
            type: "text",
            text: message,
          },
        ],
        nextPhase,
        transitionedAt: new Date().toISOString(),
      };
    }
  );
}
```

---

## エラーハンドリング

### エラーコード体系

| エラーコード | 説明 | HTTPステータス相当 |
|--------------|------|------------------|
| `PHASE_NOT_FOUND` | フェーズが存在しない | 404 |
| `PROMPT_NOT_FOUND` | プロンプトが見つからない | 404 |
| `INVALID_PHASE_TRANSITION` | 無効なフェーズ遷移 | 400 |
| `CLOUD_API_ERROR` | Cloud API接続エラー | 502 |
| `VALIDATION_ERROR` | 入力バリデーションエラー | 400 |
| `INTERNAL_ERROR` | 内部エラー | 500 |

### エラーレスポンスフォーマット

```typescript
{
  error: {
    code: string,
    message: string,
    details?: object
  }
}
```

### 実装例

```typescript
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

// プロンプトが見つからない場合
if (!prompt) {
  throw new McpError(
    ErrorCode.InvalidRequest,
    `Prompt not found for phase: ${phase}`,
    { phase, code: "PROMPT_NOT_FOUND" }
  );
}

// Cloud API接続エラー
try {
  prompt = await apiClient.getPrompt(phase);
} catch (error) {
  throw new McpError(
    ErrorCode.InternalError,
    `Failed to fetch prompt from Cloud API: ${error.message}`,
    { phase, code: "CLOUD_API_ERROR", originalError: error }
  );
}
```

---

## ロギング戦略

### ログレベル

```typescript
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}
```

### ロギング実装

```typescript
// src/utils/logger.ts
class Logger {
  private level: LogLevel;

  constructor() {
    this.level = process.env.LOG_LEVEL
      ? parseInt(process.env.LOG_LEVEL)
      : LogLevel.INFO;
  }

  private log(level: LogLevel, message: string, metadata?: object) {
    if (level > this.level) return;

    const log = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      ...metadata,
    };

    // ⚠️ IMPORTANT: stdio serverではconsole.log()を使用禁止
    // 必ずconsole.error()を使用
    console.error(JSON.stringify(log));
  }

  error(message: string, metadata?: object) {
    this.log(LogLevel.ERROR, message, metadata);
  }

  warn(message: string, metadata?: object) {
    this.log(LogLevel.WARN, message, metadata);
  }

  info(message: string, metadata?: object) {
    this.log(LogLevel.INFO, message, metadata);
  }

  debug(message: string, metadata?: object) {
    this.log(LogLevel.DEBUG, message, metadata);
  }
}

export const logger = new Logger();
```

### 使用例

```typescript
import { logger } from "../utils/logger.js";

// ツール実行開始
logger.info("inject_phase_prompt called", { phase, cached });

// エラー
logger.error("Failed to fetch prompt", { phase, error: error.message });

// 警告
logger.warn("Prompt cache expired", { phase, age: cacheAge });

// デバッグ
logger.debug("Cache hit", { phase, version: prompt.version });
```

---

## パフォーマンス最適化

### プロンプトキャッシュ実装

```typescript
// src/services/promptCache.ts
interface CachedPrompt {
  prompt: Prompt;
  timestamp: number;
}

export class PromptCache {
  private static instance: PromptCache;
  private cache: Map<string, CachedPrompt>;
  private ttl: number; // Time to live (ms)

  private constructor() {
    this.cache = new Map();
    this.ttl = parseInt(process.env.CACHE_TTL || "3600000"); // デフォルト1時間
  }

  static getInstance(): PromptCache {
    if (!PromptCache.instance) {
      PromptCache.instance = new PromptCache();
    }
    return PromptCache.instance;
  }

  async get(phase: string): Promise<Prompt | null> {
    const cached = this.cache.get(phase);

    if (!cached) {
      return null;
    }

    // TTLチェック
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(phase);
      return null;
    }

    return cached.prompt;
  }

  set(phase: string, prompt: Prompt): void {
    this.cache.set(phase, {
      prompt,
      timestamp: Date.now(),
    });
  }

  invalidate(phase: string): void {
    this.cache.delete(phase);
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}
```

---

## テスト戦略

### ユニットテスト例

```typescript
// tests/tools/injectPhasePrompt.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { registerInjectPhasePrompt } from "../../src/tools/injectPhasePrompt.js";

describe("inject_phase_prompt", () => {
  let server: Server;

  beforeEach(() => {
    server = new Server({ name: "test", version: "1.0.0" }, { capabilities: { tools: {} } });
    registerInjectPhasePrompt(server);
  });

  it("should inject phase0 prompt successfully", async () => {
    const result = await server.callTool("inject_phase_prompt", {
      phase: "phase0",
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Phase 0");
    expect(result.metadata.phase).toBe("phase0");
  });

  it("should throw error for invalid phase", async () => {
    await expect(
      server.callTool("inject_phase_prompt", {
        phase: "invalid_phase",
      })
    ).rejects.toThrow();
  });
});
```

---

## 次のステップ

- VS Code拡張との統合テスト
- Claude Code CLIとの統合テスト
- パフォーマンスベンチマーク
- 本番環境デプロイ

---

**関連ドキュメント**:
- `architecture.md` - システム全体のアーキテクチャ
- `api-specification.yml` - Cloud API仕様
- `vscode-commands.md` - VS Code拡張コマンド定義
