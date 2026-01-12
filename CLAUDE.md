# プロジェクト設定

## 基本設定
```yaml
プロジェクト名: AIAgentStudio-X
開始日: 2026-01-12
技術スタック:
  frontend:
    - 管理画面: React 18 + TypeScript 5 + MUI v6 + Vite 5
    - VS Code拡張: TypeScript 5 + React 18 + VS Code Extension API
  backend:
    - API: NestJS 10 + TypeScript 5 + Prisma 5
    - MCP Server: TypeScript 5 + @modelcontextprotocol/sdk
  database: PostgreSQL 14+ (Neon)
  インフラ:
    - 管理画面: Vercel
    - バックエンド: Google Cloud Run
    - VS Code拡張: VS Code Marketplace
```

## 開発環境
```yaml
ポート設定:
  # 複数プロジェクト並行開発のため、一般的でないポートを使用
  frontend: 3574  # 管理画面開発サーバー
  backend: 8629   # NestJS APIサーバー
  database: 5437  # PostgreSQLローカル開発用

環境変数:
  設定ファイル: .env.local（ルートディレクトリ）
  必須項目:
    - DATABASE_URL: "postgresql://user:password@localhost:5437/aiagent_studio_x_dev"
    - JWT_SECRET: "開発用ランダム文字列"
    - API_KEY: "共通APIキー（開発用）"
    - NODE_ENV: "development"
```

## テスト認証情報
```yaml
開発用アカウント:
  管理者:
    email: admin@aiagent-studio-x.local
    password: DevAdmin2026!

  一般ユーザー:
    email: testuser@aiagent-studio-x.local
    password: TestUser2026!

外部サービス:
  Neon PostgreSQL: 開発用データベース（無料枠）
  Claude Code Pro: エンドユーザーが各自契約（月額$20〜）
```

## コーディング規約

### 命名規則
```yaml
ファイル名:
  - コンポーネント: PascalCase.tsx (例: UserProfile.tsx)
  - ユーティリティ: camelCase.ts (例: formatDate.ts)
  - 定数: UPPER_SNAKE_CASE.ts (例: API_ENDPOINTS.ts)
  - API Controller: kebab-case.controller.ts (例: prompt-management.controller.ts)
  - API Service: kebab-case.service.ts (例: user-management.service.ts)

変数・関数:
  - 変数: camelCase (例: userName, isActive)
  - 関数: camelCase (例: getUserById, validateEmail)
  - 定数: UPPER_SNAKE_CASE (例: MAX_RETRY_COUNT, API_BASE_URL)
  - 型/インターフェース: PascalCase (例: UserProfile, ApiResponse)
  - Enum: PascalCase (例: UserRole, PhaseStatus)
```

### コード品質
```yaml
必須ルール:
  - TypeScript: strictモード有効
  - 未使用の変数/import禁止
  - console.log本番環境禁止（console.warn, console.errorは許可）
  - エラーハンドリング必須（try-catch、エラーバウンダリ）
  - 関数行数: 100行以下（96.7%カバー）
  - ファイル行数: 700行以下（96.9%カバー）
  - 複雑度: 10以下（循環的複雑度）
  - 行長: 120文字

フォーマット:
  - インデント: スペース2つ
  - セミコロン: あり
  - クォート: シングル（JSX内はダブル）
  - トレイリングカンマ: ES5準拠
```

## プロジェクト固有ルール

### APIエンドポイント
```yaml
命名規則:
  - RESTful形式を厳守
  - 複数形を使用 (/prompts, /users)
  - ケバブケース使用 (/prompt-versions)
  - バージョニング不要（初期リリース）

認証:
  - 管理画面: Bearer Token（JWT）
  - VS Code拡張: API Key + Bearer Token（2層認証）

例:
  - GET /api/prompts
  - POST /api/prompts/:id
  - GET /api/users
  - POST /api/auth/login
```

### 型定義
```yaml
配置:
  - フロントエンド共通: packages/types/src/index.ts
  - バックエンド: apps/api/src/types/index.ts
  - VS Code拡張: apps/extension/src/types/index.ts

同期ルール:
  - API型定義（Request/Response）は packages/types で一元管理
  - バックエンドとフロントエンドで同一の型を使用
  - 片方を更新したら即座にもう片方も更新
  - Prisma生成型は @prisma/client から直接インポート
```

### ディレクトリ構造
```yaml
AIAgentStudio-X/
├── apps/
│   ├── admin/              # 管理画面（React + Vite）
│   │   ├── src/
│   │   │   ├── components/ # 再利用可能なコンポーネント
│   │   │   ├── pages/      # ページコンポーネント
│   │   │   ├── services/   # API通信ロジック
│   │   │   ├── hooks/      # カスタムフック
│   │   │   └── types/      # フロントエンド固有の型
│   │   └── vite.config.ts
│   │
│   ├── extension/          # VS Code拡張機能
│   │   ├── src/
│   │   │   ├── extension.ts    # 拡張エントリポイント
│   │   │   ├── webview/        # Webview UI（React）
│   │   │   ├── mcp/            # MCP Server
│   │   │   └── services/       # API通信、Claude Code連携
│   │   └── package.json
│   │
│   └── api/                # バックエンドAPI（NestJS）
│       ├── src/
│       │   ├── modules/        # 機能モジュール
│       │   │   ├── auth/
│       │   │   ├── prompts/
│       │   │   └── users/
│       │   ├── prisma/         # Prismaスキーマ
│       │   └── main.ts
│       └── prisma/
│           └── schema.prisma
│
├── packages/
│   └── types/              # 共通型定義
│       └── src/
│           └── index.ts
│
├── docs/                   # ドキュメント
│   ├── requirements.md
│   ├── feasibility-report.md
│   └── SCOPE_PROGRESS.md
│
├── .eslintrc.json
├── .prettierrc
├── CLAUDE.md
└── package.json
```

## 🆕 最新技術情報（知識カットオフ対応）
```yaml
# Web検索で解決した破壊的変更を記録

NestJS 10:
  - @nestjs/jwt v10以降はasync/awaitでのトークン生成を推奨
  - ConfigModuleはグローバル登録を推奨

Prisma 5:
  - クライアント生成時に --no-engine フラグは非推奨
  - interactiveTransactionsがデフォルトで有効

VS Code Extension API:
  - Webview UIでのCSP（Content Security Policy）が厳格化
  - vscode.postMessageはPromiseベースに変更

React 18:
  - Suspenseがプロダクションで安定版に
  - useIdフックが追加（SSR対応）

MUI v6:
  - styled-componentsからemotion完全移行
  - theme.palette.mode推奨（theme.palette.typeは非推奨）
```

## エラーハンドリング
```yaml
原則:
  - すべての非同期処理にtry-catchを必須化
  - APIエラーは統一フォーマットで返却
  - フロントエンドはReact Error Boundaryで全体をラップ
  - VS Code拡張はvscode.window.showErrorMessageで通知

エラーコード体系:
  - EXT-*: VS Code拡張エラー
  - MCP-*: MCP Serverエラー
  - API-*: バックエンドAPIエラー
  - DB-*: データベースエラー
```

## テスト戦略
```yaml
ユニットテスト:
  - フレームワーク: Jest
  - カバレッジ目標: 80%以上
  - 対象: ビジネスロジック、ユーティリティ関数

統合テスト:
  - フレームワーク: Supertest（API）
  - 対象: APIエンドポイント

E2Eテスト:
  - フレームワーク: Playwright
  - 対象: 管理画面の主要フロー

現時点:
  - Phase 1（要件定義）完了時点のためテスト未実装
  - 実装フェーズで段階的に追加
```

## デプロイメント
```yaml
管理画面（Vercel）:
  - main ブランチへのpush時に自動デプロイ
  - プレビューデプロイ: PRごとに自動生成
  - 環境変数: Vercelダッシュボードで管理

バックエンド（Cloud Run）:
  - Dockerコンテナ化
  - GitHub Actionsでビルド・デプロイ
  - 環境変数: Secret Managerで管理

VS Code拡張:
  - vsce packageでVSIXパッケージ作成
  - VS Code Marketplaceに手動公開
  - バージョニング: セマンティックバージョニング
```

## 開発ワークフロー
```yaml
ブランチ戦略:
  - main: 本番環境
  - develop: 開発環境
  - feature/*: 機能開発
  - fix/*: バグ修正

コミットメッセージ:
  - feat: 新機能
  - fix: バグ修正
  - docs: ドキュメント
  - refactor: リファクタリング
  - test: テスト追加
  - chore: その他

例:
  - feat(prompts): プロンプト編集機能を追加
  - fix(auth): ログイン時のJWT検証エラーを修正
```

---

**このCLAUDE.mdは、Claude Codeがプロジェクトを効率的に理解し、一貫性のある開発を進めるためのガイドラインです。**
