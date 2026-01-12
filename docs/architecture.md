# AIAgentStudio-X システムアーキテクチャ設計書

**バージョン**: 1.0.0
**作成日**: 2026-01-12
**ステータス**: 設計中

---

## 目次

1. [システム概要](#1-システム概要)
2. [アーキテクチャ図](#2-アーキテクチャ図)
3. [コンポーネント詳細](#3-コンポーネント詳細)
4. [データフロー](#4-データフロー)
5. [通信プロトコル](#5-通信プロトコル)
6. [デプロイメント構成](#6-デプロイメント構成)
7. [スケーラビリティ戦略](#7-スケーラビリティ戦略)

---

## 1. システム概要

### 1.1 システム構成

AIAgentStudio-Xは以下の3層アーキテクチャで構成されます：

```
┌─────────────────────────────────────────────────────────────┐
│                    クライアント層                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         VS Code Extension (TypeScript)              │   │
│  │  - Webview UI (一般ユーザー)                          │   │
│  │  - Admin UI (プロンプト編集)                          │   │
│  │  - Claude Code Launcher                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕ (IPC + HTTP)
┌─────────────────────────────────────────────────────────────┐
│                    MCP層（ローカル）                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         MCP Server (TypeScript + Node.js)           │   │
│  │  - Stdio Transport                                  │   │
│  │  - Prompt Injection Tools                           │   │
│  │  - Phase Transition Management                      │   │
│  │  - Cloud API Client                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕ (HTTPS/REST)
┌─────────────────────────────────────────────────────────────┐
│                    クラウド層                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Cloud API (NestJS + TypeScript)             │   │
│  │  - REST API Endpoints                               │   │
│  │  - JWT Authentication                               │   │
│  │  - Prompt Management Service                        │   │
│  │  - Versioning Service                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Database (PostgreSQL + Prisma)              │   │
│  │  - Prompts Table                                    │   │
│  │  - Prompt Versions Table                            │   │
│  │  - Users Table                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技術スタック一覧

| 層 | コンポーネント | 技術 |
|---|---------------|------|
| クライアント | VS Code Extension | TypeScript, VS Code API v1.108+, Webview API |
| クライアント | UI | HTML5, CSS3, Vanilla JavaScript |
| MCP | MCP Server | TypeScript, @modelcontextprotocol/sdk v0.5+, Node.js 18+ |
| MCP | Validation | Zod v3.25+ |
| クラウド | API Server | NestJS v10+, TypeScript |
| クラウド | Database | PostgreSQL 14+, Prisma ORM v5+ |
| クラウド | Authentication | JWT, bcrypt |
| クラウド | Hosting | Railway |
| 共通 | Package Manager | npm / pnpm |
| 共通 | Version Control | Git + GitHub |
| 共通 | CI/CD | GitHub Actions |

---

## 2. アーキテクチャ図

### 2.1 システム全体図

```
┌──────────────────────────────────────────────────────────────────────┐
│                          ユーザー環境（ローカル）                        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      VS Code エディタ                           │ │
│  │                                                                 │ │
│  │  ┌─────────────────────────────────────────────────────────┐   │ │
│  │  │          AIAgentStudio-X Extension                      │   │ │
│  │  │                                                         │   │ │
│  │  │  ┌──────────────┐    ┌──────────────┐                 │   │ │
│  │  │  │ Webview UI   │    │  Admin UI    │                 │   │ │
│  │  │  │ (一般ユーザー) │    │(プロンプト編集)│                 │   │ │
│  │  │  └──────┬───────┘    └──────┬───────┘                 │   │ │
│  │  │         │                    │                         │   │ │
│  │  │         └────────┬───────────┘                         │   │ │
│  │  │                  │                                     │   │ │
│  │  │         ┌────────▼─────────┐                          │   │ │
│  │  │         │  Extension Host  │                          │   │ │
│  │  │         │  (TypeScript)    │                          │   │ │
│  │  │         │                  │                          │   │ │
│  │  │         │  - Phase Manager │                          │   │ │
│  │  │         │  - File Watcher  │                          │   │ │
│  │  │         │  - HTTP Client   │                          │   │ │
│  │  │         └────────┬─────────┘                          │   │ │
│  │  │                  │                                     │   │ │
│  │  │                  │ spawn()                             │   │ │
│  │  │         ┌────────▼─────────┐                          │   │ │
│  │  │         │  Claude Code CLI │                          │   │ │
│  │  │         │  + MCP Config    │                          │   │ │
│  │  │         └────────┬─────────┘                          │   │ │
│  │  └──────────────────┼─────────────────────────────────────┘   │ │
│  └────────────────────┼──────────────────────────────────────────┘ │
│                       │ stdio (JSON-RPC)                           │
│  ┌────────────────────▼──────────────────────────────────────────┐ │
│  │              MCP Server Process                               │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │            MCP Server (Node.js)                         │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌──────────────────┐  ┌──────────────────┐           │ │ │
│  │  │  │ Stdio Transport  │  │  Tool Handlers   │           │ │ │
│  │  │  └──────────────────┘  └──────────────────┘           │ │ │
│  │  │                                                         │ │ │
│  │  │  Tools:                                                │ │ │
│  │  │  - inject_phase_prompt                                 │ │ │
│  │  │  - transition_to_next_phase                            │ │ │
│  │  │  - get_phase_context                                   │ │ │
│  │  │  - save_phase_result                                   │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌──────────────────┐                                  │ │ │
│  │  │  │ Cloud API Client │ ─────────────────┐               │ │ │
│  │  │  └──────────────────┘                  │               │ │ │
│  │  └─────────────────────────────────────────┼───────────────┘ │ │
│  └────────────────────────────────────────────┼─────────────────┘ │
└─────────────────────────────────────────────┼───────────────────────┘
                                              │ HTTPS (REST API)
                                              │
┌─────────────────────────────────────────────▼───────────────────────┐
│                          クラウド環境（Railway）                       │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Cloud API Server (NestJS)                   │ │
│  │                                                                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │ │
│  │  │   Auth      │  │   Prompt    │  │    Sync     │           │ │
│  │  │  Module     │  │   Module    │  │   Module    │           │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘           │ │
│  │                                                                 │ │
│  │  Routes:                                                        │ │
│  │  - POST   /api/v1/auth/login                                   │ │
│  │  - GET    /api/v1/prompts/:phase                               │ │
│  │  - PUT    /api/v1/prompts/:id                                  │ │
│  │  - POST   /api/v1/sync/pull                                    │ │
│  │  - POST   /api/v1/sync/push                                    │ │
│  │                                                                 │ │
│  │  ┌─────────────────────────────────────────────────────────┐   │ │
│  │  │                  Prisma ORM                              │   │ │
│  │  └────────────────────────┬────────────────────────────────┘   │ │
│  └───────────────────────────┼──────────────────────────────────────┘ │
│                              │ SQL                                  │
│  ┌───────────────────────────▼──────────────────────────────────┐ │
│  │              PostgreSQL Database                             │ │
│  │                                                               │ │
│  │  Tables:                                                      │ │
│  │  - prompts (id, phase, title, content, metadata, ...)        │ │
│  │  - prompt_versions (id, promptId, version, content, ...)     │ │
│  │  - users (id, email, role, apiKey, ...)                      │ │
│  └───────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 コンポーネント関係図

```
┌──────────────────┐
│  一般ユーザー      │
└────────┬─────────┘
         │ クリック（フェーズ開始）
         ▼
┌──────────────────┐     spawn()      ┌─────────────────┐
│  VS Code拡張     ├─────────────────►│ Claude Code CLI │
│  (Webview UI)    │                  │  + MCP Config   │
└────────┬─────────┘                  └────────┬────────┘
         │                                     │
         │ postMessage()                       │ stdio (JSON-RPC)
         │                                     │
         ▼                                     ▼
┌──────────────────┐                  ┌─────────────────┐
│  Extension Host  │◄─────────────────┤   MCP Server    │
│  (TypeScript)    │  HTTP (metadata) │   (Node.js)     │
└────────┬─────────┘                  └────────┬────────┘
         │                                     │
         │ HTTPS (REST)                        │ HTTPS (REST)
         │                                     │
         └──────────────┬──────────────────────┘
                        ▼
                ┌─────────────────┐
                │   Cloud API     │
                │   (NestJS)      │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   PostgreSQL    │
                └─────────────────┘


┌──────────────────┐
│   管理者         │
└────────┬─────────┘
         │ プロンプト編集
         ▼
┌──────────────────┐     HTTPS (REST)    ┌─────────────────┐
│  VS Code拡張     ├────────────────────►│   Cloud API     │
│  (Admin UI)      │                     │   (NestJS)      │
└──────────────────┘                     └────────┬────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │   PostgreSQL    │
                                         └─────────────────┘
```

---

## 3. コンポーネント詳細

### 3.1 VS Code Extension

#### 3.1.1 構造

```
aiagent-studio-x/
├── src/
│   ├── extension.ts              # エントリーポイント
│   ├── webview/
│   │   ├── userView.ts           # 一般ユーザー向けWebview
│   │   ├── adminView.ts          # 管理者向けWebview
│   │   └── previewView.ts        # プレビューWebview
│   ├── services/
│   │   ├── phaseManager.ts       # フェーズ管理
│   │   ├── claudeCodeLauncher.ts # Claude Code起動
│   │   ├── fileWatcher.ts        # ファイル監視
│   │   └── cloudApiClient.ts     # クラウドAPI通信
│   ├── commands/
│   │   ├── startPhase.ts         # フェーズ開始コマンド
│   │   ├── openAdmin.ts          # 管理画面を開く
│   │   └── syncPrompts.ts        # プロンプト同期
│   └── types/
│       └── index.ts              # 型定義
├── webview-ui/
│   ├── user/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   └── admin/
│       ├── index.html
│       ├── style.css
│       └── script.js
└── package.json
```

#### 3.1.2 主要クラス

**PhaseManager**
```typescript
class PhaseManager {
  private currentPhase: string | null = null;
  private phaseHistory: PhaseRecord[] = [];

  async startPhase(phase: string, context?: any): Promise<void>
  async transitionToNextPhase(): Promise<void>
  getCurrentPhase(): string | null
  getPhaseHistory(): PhaseRecord[]
  async savePhaseResult(result: any): Promise<void>
}
```

**ClaudeCodeLauncher**
```typescript
class ClaudeCodeLauncher {
  private process: ChildProcess | null = null;

  async launch(initialPrompt: string, mcpConfig: string): Promise<void>
  async terminate(): Promise<void>
  onOutput(callback: (data: string) => void): void
  onError(callback: (error: Error) => void): void
  isRunning(): boolean
}
```

**CloudApiClient**
```typescript
class CloudApiClient {
  private baseUrl: string;
  private apiKey: string;

  async login(email: string, password: string): Promise<AuthResponse>
  async getPrompt(phase: string): Promise<Prompt>
  async updatePrompt(id: string, data: Partial<Prompt>): Promise<Prompt>
  async syncPull(): Promise<SyncResult>
  async syncPush(localData: LocalPrompts): Promise<SyncResult>
}
```

### 3.2 MCP Server

#### 3.2.1 構造

```
mcp-server/
├── src/
│   ├── index.ts                  # エントリーポイント
│   ├── server.ts                 # MCPサーバー本体
│   ├── tools/
│   │   ├── injectPhasePrompt.ts  # プロンプト注入
│   │   ├── transitionPhase.ts    # フェーズ遷移
│   │   ├── getPhaseContext.ts    # コンテキスト取得
│   │   └── savePhaseResult.ts    # 結果保存
│   ├── services/
│   │   ├── promptCache.ts        # プロンプトキャッシュ
│   │   └── cloudApiClient.ts     # クラウドAPI通信
│   └── types/
│       └── index.ts              # 型定義
├── package.json
└── tsconfig.json
```

#### 3.2.2 ツール定義

**inject_phase_prompt**
```typescript
{
  name: "inject_phase_prompt",
  description: "指定されたフェーズのプロンプトをClaude Codeに注入",
  inputSchema: {
    type: "object",
    properties: {
      phase: {
        type: "string",
        enum: ["phase0", "phase1", "phase2", "phase3", "phase4"]
      },
      context: {
        type: "object",
        description: "フェーズ固有のコンテキスト情報"
      }
    },
    required: ["phase"]
  }
}
```

**transition_to_next_phase**
```typescript
{
  name: "transition_to_next_phase",
  description: "次のフェーズに遷移",
  inputSchema: {
    type: "object",
    properties: {
      currentPhase: { type: "string" },
      result: {
        type: "object",
        description: "現在のフェーズの実行結果"
      }
    },
    required: ["currentPhase", "result"]
  }
}
```

**get_phase_context**
```typescript
{
  name: "get_phase_context",
  description: "フェーズのコンテキスト情報を取得",
  inputSchema: {
    type: "object",
    properties: {
      phase: { type: "string" }
    },
    required: ["phase"]
  }
}
```

**save_phase_result**
```typescript
{
  name: "save_phase_result",
  description: "フェーズの実行結果を保存",
  inputSchema: {
    type: "object",
    properties: {
      phase: { type: "string" },
      result: {
        type: "object",
        description: "実行結果データ"
      },
      outputFiles: {
        type: "array",
        items: { type: "string" },
        description: "生成されたファイルのパス"
      }
    },
    required: ["phase", "result"]
  }
}
```

### 3.3 Cloud API

#### 3.3.1 構造（NestJS）

```
cloud-api/
├── src/
│   ├── main.ts                   # エントリーポイント
│   ├── app.module.ts             # ルートモジュール
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   └── api-key.guard.ts
│   ├── prompts/
│   │   ├── prompts.module.ts
│   │   ├── prompts.controller.ts
│   │   ├── prompts.service.ts
│   │   └── dto/
│   │       ├── create-prompt.dto.ts
│   │       └── update-prompt.dto.ts
│   ├── sync/
│   │   ├── sync.module.ts
│   │   ├── sync.controller.ts
│   │   └── sync.service.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── users.repository.ts
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   └── guards/
│   │       └── roles.guard.ts
│   └── prisma/
│       ├── prisma.module.ts
│       └── prisma.service.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── package.json
```

#### 3.3.2 レイヤー構成

```
┌─────────────────────────────────────┐
│         Controller Layer            │  ← HTTP Request/Response
│  - Routing                          │
│  - Validation (DTOs)                │
│  - Response formatting              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          Service Layer              │  ← Business Logic
│  - Prompt management logic          │
│  - Versioning logic                 │
│  - Sync logic                       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Repository Layer             │  ← Data Access
│  - Prisma ORM                       │
│  - Database queries                 │
│  - Transaction management           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Database Layer              │  ← PostgreSQL
│  - Tables                           │
│  - Indexes                          │
│  - Constraints                      │
└─────────────────────────────────────┘
```

### 3.4 Database（PostgreSQL）

詳細は `database-schema.prisma` を参照。

---

## 4. データフロー

### 4.1 フェーズ開始フロー

```
┌──────────┐
│ユーザー   │ 1. フェーズボタンをクリック
└─────┬────┘
      │
      ▼
┌─────────────────┐
│  Webview UI     │ 2. postMessage("startPhase", { phase: "phase0" })
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Extension Host  │ 3. phaseManager.startPhase("phase0")
└─────┬───────────┘
      │
      ├──────────► 4. cloudApiClient.getPrompt("phase0")
      │                     │
      │                     ▼
      │            ┌─────────────────┐
      │            │   Cloud API     │ 5. SELECT * FROM prompts WHERE phase = 'phase0'
      │            └────────┬────────┘
      │                     │
      │            ┌────────▼────────┐
      │            │   PostgreSQL    │
      │            └─────────────────┘
      │                     │
      │◄────────────────────┘ 6. Prompt data
      │
      ▼
┌─────────────────┐
│ Extension Host  │ 7. claudeCodeLauncher.launch(prompt, mcpConfig)
└─────┬───────────┘
      │
      │ spawn()
      ▼
┌─────────────────┐
│ Claude Code CLI │ 8. 起動 + MCP設定読み込み
└─────┬───────────┘
      │
      │ stdio (JSON-RPC)
      ▼
┌─────────────────┐
│   MCP Server    │ 9. inject_phase_prompt ツールを提供
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Claude Code CLI │ 10. MCP経由でプロンプト注入を受ける
│                 │ 11. エージェント実行開始
└─────────────────┘
```

### 4.2 プロンプト編集・同期フロー

```
┌──────────┐
│ 管理者    │ 1. 管理画面を開く
└─────┬────┘
      │
      ▼
┌─────────────────┐
│  Admin UI       │ 2. cloudApiClient.login(email, password)
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│   Cloud API     │ 3. JWT発行
└─────┬───────────┘
      │
      │◄────────────── 4. { token, user }
      │
┌─────▼───────────┐
│  Admin UI       │ 5. プロンプト一覧表示
│                 │ 6. プロンプト編集
│                 │ 7. 保存ボタンクリック
└─────┬───────────┘
      │
      │ PUT /api/v1/prompts/:id
      ▼
┌─────────────────┐
│   Cloud API     │ 8. 認証チェック（JWT）
│                 │ 9. バージョン番号インクリメント
│                 │ 10. prompt_versions テーブルに履歴保存
│                 │ 11. prompts テーブル更新
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│   PostgreSQL    │ 12. トランザクション実行
└─────┬───────────┘
      │
      │◄────────────── 13. 更新完了
      │
┌─────▼───────────┐
│  Admin UI       │ 14. 成功通知表示
└─────────────────┘
      │
      │ バックグラウンドで
      ▼
┌─────────────────┐
│   MCP Server    │ 15. promptCache.invalidate("phase0")
│                 │ 16. 次回アクセス時に最新版を取得
└─────────────────┘
```

### 4.3 フェーズ遷移フロー

```
┌─────────────────┐
│ Claude Code CLI │ 1. Phase 0 完了
│                 │ 2. transition_to_next_phase ツールを呼び出し
└─────┬───────────┘
      │
      │ MCP (JSON-RPC)
      ▼
┌─────────────────┐
│   MCP Server    │ 3. transition_to_next_phase ハンドラー実行
│                 │ 4. 現在のフェーズ結果を保存
└─────┬───────────┘
      │
      │ HTTP POST /api/v1/phases/results
      ▼
┌─────────────────┐
│   Cloud API     │ 5. フェーズ結果をログ保存（オプション）
└─────────────────┘
      │
      │
┌─────▼───────────┐
│   MCP Server    │ 6. 次のフェーズ（Phase 1）のプロンプトを取得
│                 │ 7. inject_phase_prompt("phase1")
└─────┬───────────┘
      │
      │ MCP Response
      ▼
┌─────────────────┐
│ Claude Code CLI │ 8. Phase 1 のプロンプト注入
│                 │ 9. Phase 1 エージェント実行開始
└─────┬───────────┘
      │
      │ Event (phase_changed)
      ▼
┌─────────────────┐
│ Extension Host  │ 10. phaseManager.setCurrentPhase("phase1")
└─────┬───────────┘
      │
      │ postMessage("phaseChanged", { phase: "phase1" })
      ▼
┌─────────────────┐
│  Webview UI     │ 11. UI更新（Phase 1がアクティブに）
└─────────────────┘
```

### 4.4 ファイル生成・プレビューフロー

```
┌─────────────────┐
│ Claude Code CLI │ 1. mockup/index.html を生成
│                 │ 2. ファイル書き込み完了
└─────┬───────────┘
      │
      │ ファイルシステムイベント
      ▼
┌─────────────────┐
│  File Watcher   │ 3. 変更検知（workspace.createFileSystemWatcher）
│  (Extension)    │ 4. onDidChange イベント発火
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Extension Host  │ 5. ファイルパス解析
│                 │ 6. プレビュー更新トリガー
└─────┬───────────┘
      │
      │ postMessage("fileGenerated", { path, type })
      ▼
┌─────────────────┐
│  Webview UI     │ 7. プレビューリスト更新
│                 │ 8. 「プレビュー」ボタン表示
└─────┬───────────┘
      │
      │ ユーザーがプレビューをクリック
      ▼
┌─────────────────┐
│  Webview UI     │ 9. postMessage("openPreview", { path })
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Extension Host  │ 10. previewView.show(filePath)
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│  Preview View   │ 11. HTMLをレンダリング
│  (Webview)      │ 12. CSS/JS読み込み
└─────────────────┘
```

---

## 5. 通信プロトコル

### 5.1 VS Code Extension ↔ Webview (postMessage)

**メッセージフォーマット**:
```typescript
interface WebviewMessage {
  type: string;
  payload?: any;
}
```

**Extension → Webview**:
```typescript
// フェーズ変更通知
{
  type: "phaseChanged",
  payload: {
    phase: "phase1",
    progress: 25
  }
}

// エラー通知
{
  type: "error",
  payload: {
    message: "Failed to start phase",
    code: "PHASE_START_ERROR"
  }
}

// ファイル生成通知
{
  type: "fileGenerated",
  payload: {
    path: "mockup/index.html",
    type: "html"
  }
}
```

**Webview → Extension**:
```typescript
// フェーズ開始リクエスト
{
  type: "startPhase",
  payload: {
    phase: "phase0"
  }
}

// プロンプト更新リクエスト
{
  type: "updatePrompt",
  payload: {
    id: "uuid",
    content: "新しいプロンプト内容"
  }
}

// プレビュー表示リクエスト
{
  type: "openPreview",
  payload: {
    path: "mockup/index.html"
  }
}
```

### 5.2 Claude Code ↔ MCP Server (stdio/JSON-RPC)

**リクエストフォーマット**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "inject_phase_prompt",
    "arguments": {
      "phase": "phase0",
      "context": {
        "projectPath": "/path/to/project"
      }
    }
  }
}
```

**レスポンスフォーマット**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "# Phase 0: 要件定義・技術設計\n\n..."
      }
    ]
  }
}
```

### 5.3 MCP Server ↔ Cloud API (HTTPS/REST)

**認証ヘッダー**:
```
X-API-Key: cli_mk8n3p_a302ae96bc54d1789ef23456
```

**プロンプト取得**:
```http
GET /api/v1/prompts/phase0 HTTP/1.1
Host: api.aiagentstudio.example.com
X-API-Key: cli_mk8n3p_...

Response:
{
  "id": "uuid",
  "phase": "phase0",
  "title": "Phase 0: Requirements & Technical Design",
  "content": "# Phase 0: 要件定義...",
  "version": 3,
  "updatedAt": "2026-01-12T10:30:00Z"
}
```

### 5.4 Admin UI ↔ Cloud API (HTTPS/REST)

**認証ヘッダー**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**プロンプト更新**:
```http
PUT /api/v1/prompts/uuid HTTP/1.1
Host: api.aiagentstudio.example.com
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "title": "Phase 0: Requirements (Updated)",
  "content": "# Updated prompt content..."
}

Response:
{
  "id": "uuid",
  "phase": "phase0",
  "title": "Phase 0: Requirements (Updated)",
  "content": "# Updated prompt content...",
  "version": 4,
  "updatedAt": "2026-01-12T11:00:00Z"
}
```

---

## 6. デプロイメント構成

### 6.1 開発環境

```
┌─────────────────────────────────────────────────────────────┐
│                     開発者マシン                               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  VS Code + AIAgentStudio-X Extension (Development)   │  │
│  │  - npm run dev (watch mode)                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MCP Server (Local)                                  │  │
│  │  - npm run dev (watch mode)                          │  │
│  │  - stdio transport                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cloud API (Local)                                   │  │
│  │  - npm run start:dev (NestJS watch mode)             │  │
│  │  - localhost:3000                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL (Docker)                                 │  │
│  │  - docker-compose up                                 │  │
│  │  - localhost:5432                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 本番環境

```
┌─────────────────────────────────────────────────────────────┐
│                      ユーザーマシン                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  VS Code + AIAgentStudio-X Extension (Published)     │  │
│  │  - VS Code Marketplace からインストール               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MCP Server (npm global install)                     │  │
│  │  - npm install -g @aiagentstudio/mcp-server          │  │
│  │  - ~/.aiagentstudio/mcp-server/                      │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Railway (Cloud)                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cloud API (NestJS)                                  │  │
│  │  - Auto-deploy from GitHub main branch              │  │
│  │  - https://api.aiagentstudio.example.com             │  │
│  │  - Environment variables from Railway                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL (Railway Managed)                        │  │
│  │  - Automatic backups                                 │  │
│  │  - Connection pooling                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 CI/CD パイプライン（GitHub Actions）

```yaml
# .github/workflows/extension.yml
name: VS Code Extension CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    - Checkout
    - Setup Node.js
    - npm install
    - npm run lint
    - npm run test
    - npm run build
    - vsce package

  publish:
    if: github.ref == 'refs/heads/main'
    - vsce publish
```

```yaml
# .github/workflows/cloud-api.yml
name: Cloud API CI/CD

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    - Checkout
    - Setup Node.js
    - npm install
    - npm run test
    - npm run build
    - Deploy to Railway (automatic)
```

---

## 7. スケーラビリティ戦略

### 7.1 現在のスコープ（MVP）

**想定ユーザー数**: 1管理者 + 最大100同時一般ユーザー

**想定負荷**:
- API リクエスト: ~10 req/sec
- データベース: ~1GB
- 同時Claude Codeプロセス: ~10

**現在の構成で十分**:
- Railway Hobby Plan ($5/month)
- PostgreSQL 1GB
- 単一APIサーバーインスタンス

### 7.2 スケールアップ戦略（将来）

**ユーザー数: 1,000+**
- Railway Pro Plan ($20/month)
- PostgreSQL 10GB
- Connection pooling (PgBouncer)
- Redis cache layer追加

**ユーザー数: 10,000+**
- 水平スケーリング（複数APIサーバーインスタンス）
- Load balancer (Railway内蔵)
- PostgreSQL read replica
- CDN (Cloudflare) for static assets

### 7.3 パフォーマンス最適化

**キャッシュ戦略**:
```typescript
// MCP Server側
class PromptCache {
  private cache: Map<string, CachedPrompt> = new Map();
  private ttl: number = 3600000; // 1時間

  async get(phase: string): Promise<Prompt | null> {
    const cached = this.cache.get(phase);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.prompt;
    }
    return null;
  }

  set(phase: string, prompt: Prompt): void {
    this.cache.set(phase, {
      prompt,
      timestamp: Date.now()
    });
  }

  invalidate(phase: string): void {
    this.cache.delete(phase);
  }
}
```

**データベースインデックス**:
```sql
-- prompts テーブル
CREATE INDEX idx_prompts_phase ON prompts(phase);
CREATE INDEX idx_prompts_is_active ON prompts(is_active);

-- prompt_versions テーブル
CREATE INDEX idx_prompt_versions_prompt_id ON prompt_versions(prompt_id);
CREATE UNIQUE INDEX idx_prompt_versions_unique ON prompt_versions(prompt_id, version);
```

**接続プーリング** (Prisma設定):
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 10
}
```

---

## 8. 監視・ロギング戦略

### 8.1 ログレベル

```typescript
enum LogLevel {
  ERROR = 0,   // エラー（必ず記録）
  WARN = 1,    // 警告
  INFO = 2,    // 情報（本番環境デフォルト）
  DEBUG = 3    // デバッグ（開発環境のみ）
}
```

### 8.2 ログフォーマット

```json
{
  "timestamp": "2026-01-12T12:00:00.000Z",
  "level": "INFO",
  "component": "CloudApiClient",
  "message": "Fetched prompt for phase0",
  "metadata": {
    "phase": "phase0",
    "version": 3,
    "duration": 125
  }
}
```

### 8.3 エラートラッキング

**Sentry統合** (将来的):
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

---

## 9. セキュリティアーキテクチャ

詳細は `security-design.md` を参照。

**主要セキュリティ対策**:
- ✅ HTTPS通信（TLS 1.3）
- ✅ JWT認証（管理者）
- ✅ API Key認証（拡張機能）
- ✅ Rate limiting
- ✅ SQL injection防止（Prisma ORM）
- ✅ XSS防止（CSP headers）
- ✅ CSRF防止（SameSite cookies）

---

## 付録

### A. 環境変数一覧

**VS Code Extension**:
```
AIAGENTSTUDIO_API_URL=https://api.aiagentstudio.example.com
AIAGENTSTUDIO_API_KEY=cli_mk8n3p_...
```

**MCP Server**:
```
AIAGENTSTUDIO_API_URL=https://api.aiagentstudio.example.com
AIAGENTSTUDIO_API_KEY=cli_mk8n3p_...
LOG_LEVEL=INFO
```

**Cloud API**:
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=random_secret_key_here
JWT_EXPIRATION=7d
API_KEY_PREFIX=cli_
PORT=3000
NODE_ENV=production
```

### B. ポート番号一覧

| サービス | ポート | 用途 |
|---------|-------|------|
| Cloud API (dev) | 3000 | HTTP API |
| PostgreSQL (dev) | 5432 | Database |
| MCP Server | - | stdio (no port) |

---

**次のドキュメント**: `api-specification.yml`, `database-schema.prisma`, `mcp-tools.md`, `security-design.md`
