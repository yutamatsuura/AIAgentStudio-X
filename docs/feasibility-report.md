# AIAgentStudio-X 実現可能性調査レポート

**作成日**: 2026-01-12
**調査範囲**: VS Code拡張 + MCPサーバー + クラウドAPI

---

## エグゼクティブサマリー

AIAgentStudio-Xの技術的実現可能性を調査した結果、**全コンポーネントにおいて実装可能**と判断しました。

**主要な判定結果**:
- ✅ VS Code拡張開発: **実現可能**（成熟したAPI、豊富なドキュメント）
- ✅ MCPサーバー開発: **実現可能**（公式TypeScript SDK、BlueLamp実装例あり）
- ✅ クラウドAPI開発: **実現可能**（Node.js + PostgreSQLの実績豊富）
- ✅ 外部サービス: **最小限で実現可能**（標準的なホスティングサービスのみ）

---

## 1. VS Code拡張開発の実現可能性

### 1.1 技術スタック

**コア技術**:
- TypeScript
- VS Code Extension API v1.108+
- Webview API
- Node.js child_process

### 1.2 主要機能の実現性

#### 1.2.1 Webview UI（一般ユーザー向けインターフェース）

**実現方法**: `vscode.window.createWebviewPanel()`

**機能**:
- ✅ フェーズボタンの表示
- ✅ 進捗表示
- ✅ プレビュー表示
- ✅ 双方向メッセージング（`webview.postMessage()`）

**制約事項**:
- Webview UI Toolkit は2025年1月1日に非推奨化
  - **対策**: プレーンHTML/CSS/JSで実装（影響なし）
- Content Security Policyの厳格な実装が必要
  - **対策**: CSPヘッダーの適切な設定（標準的な手法）

#### 1.2.2 管理画面（プロンプト編集UI）

**実現方法**: 別のWebviewパネルまたは専用エディタ

**機能**:
- ✅ プロンプトのCRUD操作
- ✅ シンタックスハイライト（Monaco Editorの活用可能）
- ✅ クラウドAPIとの同期

**技術的課題**: なし

#### 1.2.3 Claude Code CLI起動

**実現方法**: `child_process.spawn()`

```typescript
const claude = spawn('claude', [
  '--prompt', initialPrompt,
  '--mcp-config', mcpConfigPath
]);
```

**既知の問題と対策**:
- ❌ stdout/stderrの出力が途切れる可能性
  - ✅ **対策**: データバッファリング処理を実装
- ❌ GUIプログラムの起動に失敗する場合がある
  - ✅ **対策**: Claude Codeはnon-GUIなので影響なし

### 1.3 開発要件

**必須スキル**:
- TypeScript
- VS Code Extension API
- Node.js

**開発環境**:
- Node.js 18+
- VS Code Insiders（開発時の推奨）
- yo code（拡張機能ジェネレーター）

**開発期間見積もり**: 2-3週間

### 1.4 リスク評価

| リスク | 影響度 | 発生確率 | 対策 |
|--------|--------|----------|------|
| Webview API変更 | 中 | 低 | 公式ドキュメント監視、安定版APIの使用 |
| Claude Code CLI変更 | 高 | 中 | MCPサーバー経由の抽象化層実装 |
| メモリ消費 | 中 | 中 | retainContextWhenHidden無効化、状態の最小化 |

**総合評価**: ✅ **実現可能（リスク低）**

---

## 2. MCPサーバー開発の実現可能性

### 2.1 技術スタック

**SDK**: `@modelcontextprotocol/sdk` v0.5.0+

**言語**: TypeScript + Node.js 18+

**トランスポート**: StdioServerTransport

### 2.2 主要機能の実現性

#### 2.2.1 プロンプト注入機能

**実現方法**: `inject_knowledge` ツール

**BlueLamp実装例** (/Users/lennon/.bluelamp/mcp-server/src/index.ts:140-165):
```typescript
private async injectKnowledge(args: any) {
  const knowledgeBase: Record<string, any> = {
    "AIエージェント1": {
      content: [{
        type: "text",
        text: "# MCP導入エージェント\n\n..."
      }],
      success: true
    }
  };

  const result = knowledgeBase[args.keyword];
  return {
    success: result.success,
    result: result,
    keyword: args.keyword,
    cached: false,
    source: "api"
  };
}
```

**AIAgentStudio-X実装案**:
```typescript
server.registerTool(
  "inject_phase_prompt",
  {
    description: "Inject phase-specific prompt",
    inputSchema: {
      type: "object",
      properties: {
        phase: { type: "string" },
        context: { type: "object" }
      },
      required: ["phase"]
    }
  },
  async (args) => {
    // クラウドAPIからプロンプト取得
    const prompt = await fetchPromptFromAPI(args.phase);

    return {
      content: [{
        type: "text",
        text: prompt.content
      }]
    };
  }
);
```

#### 2.2.2 フェーズ遷移管理

**実現方法**:
1. VS Code拡張からMCP経由でフェーズ情報を注入
2. Claude Codeが完了を通知
3. 次のフェーズをトリガー

**技術的課題**: なし（BlueLampで実証済み）

### 2.3 重要な制約事項

#### ⚠️ Stdioサーバーのロギング制約

**絶対禁止**: `console.log()` の使用
- 理由: stdoutへの書き込みがJSON-RPCメッセージを破壊する

**正しい方法**:
```typescript
// ❌ NG: console.log("Debug info");
// ✅ OK: console.error("Debug info");  // stderrに出力
```

#### ⚠️ 本番環境での推奨事項

- Stdioトランスポートはローカルサーバー専用
- 本番環境ではHTTPトランスポートを推奨
- **AIAgentStudio-Xの場合**: ローカル実行のみなのでstdioで問題なし

### 2.4 開発要件

**必須スキル**:
- TypeScript
- MCP仕様の理解
- 非同期処理

**開発環境**:
- Node.js 18+
- Zod v3.25+（スキーマ検証）

**開発期間見積もり**: 1-2週間

### 2.5 リスク評価

| リスク | 影響度 | 発生確率 | 対策 |
|--------|--------|----------|------|
| MCP仕様変更 | 高 | 低 | 公式SDKの使用、バージョン固定 |
| Claude Code統合エラー | 高 | 中 | エラーハンドリング強化、ログ記録 |
| パフォーマンス | 低 | 低 | プロンプトキャッシュ実装 |

**総合評価**: ✅ **実現可能（リスク低、BlueLamp実装例あり）**

---

## 3. クラウドAPI開発の実現可能性

### 3.1 技術スタック推奨

#### 3.1.1 バックエンドフレームワーク

**推奨**: **NestJS** (TypeScript-first)

**理由**:
- 構造化されたアーキテクチャ（大規模化に対応）
- TypeScriptネイティブサポート
- 依存性注入、モジュールシステム
- REST API、WebSocket対応

**代替案**: Express.js（シンプルなMVP向け）

#### 3.1.2 データベース

**推奨**: **PostgreSQL + Prisma ORM**

**理由**:
1. **PostgreSQLの優位性**（LLM/プロンプト管理向け）:
   - ✅ JSONB型によるプロンプトの柔軟な保存
   - ✅ ACID準拠による整合性保証
   - ✅ バージョニング機能（タイムスタンプ、履歴管理）
   - ✅ 全文検索機能（プロンプト検索）
   - ✅ pgvector拡張（将来的なベクトル検索）

2. **研究結果** (Medium記事より):
   > "When it comes to storing and managing LLM prompts, completions, feedback, context, and memory, Postgres is not just good enough — it's surprisingly robust, flexible, and production-ready."

3. **Prisma ORMの利点**:
   - TypeScript完全対応
   - 型安全なクエリ
   - マイグレーション管理
   - スキーマファーストな開発

**MongoDBとの比較**:
| 項目 | PostgreSQL | MongoDB |
|------|-----------|---------|
| プロンプト保存 | ✅ JSONB型 | ✅ BSON型 |
| トランザクション | ✅ ACID完全準拠 | △ 限定的 |
| バージョニング | ✅ 容易 | △ アプリ層で実装 |
| 型安全性 | ✅ スキーマ強制 | ❌ スキーマレス |
| プロンプト検索 | ✅ 全文検索組込 | ✅ テキストインデックス |

**結論**: PostgreSQLが最適

#### 3.1.3 認証・認可

**推奨**: **JWT + API Key**

**実装パターン**:
```typescript
// 管理者認証: JWT
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// VS Code拡張認証: API Key
X-API-Key: cli_mk8n3p_a302ae96bc54d1789ef23456
```

**セキュリティ対策**:
- HTTPS必須
- API Keyのローテーション機能
- Rate limiting（DDoS対策）

### 3.2 APIエンドポイント設計

#### 3.2.1 プロンプト管理API

```
GET    /api/v1/prompts                  # プロンプト一覧取得
GET    /api/v1/prompts/:phase            # フェーズ別プロンプト取得
POST   /api/v1/prompts                   # プロンプト作成（管理者のみ）
PUT    /api/v1/prompts/:id               # プロンプト更新（管理者のみ）
DELETE /api/v1/prompts/:id               # プロンプト削除（管理者のみ）
GET    /api/v1/prompts/:id/versions      # バージョン履歴取得
```

#### 3.2.2 同期API

```
POST   /api/v1/sync/pull                 # クラウド→ローカル同期
POST   /api/v1/sync/push                 # ローカル→クラウド同期
GET    /api/v1/sync/status               # 同期状態確認
```

#### 3.2.3 認証API

```
POST   /api/v1/auth/login                # ログイン
POST   /api/v1/auth/refresh              # トークンリフレッシュ
POST   /api/v1/auth/logout               # ログアウト
```

### 3.3 データベーススキーマ

```prisma
model Prompt {
  id          String   @id @default(uuid())
  phase       String   @unique
  title       String
  content     String   @db.Text
  metadata    Json?    @db.JsonB
  version     Int      @default(1)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String

  versions    PromptVersion[]

  @@index([phase])
  @@index([isActive])
}

model PromptVersion {
  id          String   @id @default(uuid())
  promptId    String
  version     Int
  content     String   @db.Text
  metadata    Json?    @db.JsonB
  createdAt   DateTime @default(now())
  createdBy   String

  prompt      Prompt   @relation(fields: [promptId], references: [id])

  @@unique([promptId, version])
  @@index([promptId])
}

model User {
  id          String   @id @default(uuid())
  email       String   @unique
  role        String   @default("admin")
  apiKey      String?  @unique
  createdAt   DateTime @default(now())
  lastLoginAt DateTime?
}
```

### 3.4 ホスティング推奨

**第1候補**: **Railway**
- Node.js最適化
- PostgreSQL組込み
- 開発者フレンドリーなUI
- GitHub連携によるCI/CD
- 無料枠: $5/月クレジット

**第2候補**: **Vercel**
- Serverless Functions
- エッジネットワーク
- Next.jsとの統合（管理画面用）
- PostgreSQL（Vercel Postgres）

**第3候補**: **DigitalOcean App Platform**
- フルコントロール
- 固定料金（$5/月〜）
- マネージドPostgreSQL

### 3.5 開発要件

**必須スキル**:
- Node.js + TypeScript
- NestJS or Express.js
- PostgreSQL + Prisma
- RESTful API設計
- JWT認証

**開発期間見積もり**: 3-4週間

### 3.6 リスク評価

| リスク | 影響度 | 発生確率 | 対策 |
|--------|--------|----------|------|
| スケーラビリティ | 低 | 低 | 単一管理者なので負荷は最小限 |
| データ損失 | 高 | 低 | 定期バックアップ、バージョン履歴 |
| セキュリティ侵害 | 高 | 低 | HTTPS、JWT、Rate limiting |
| ホスティングコスト | 低 | 中 | 無料枠活用、必要に応じてスケール |

**総合評価**: ✅ **実現可能（リスク低、実績豊富な技術スタック）**

---

## 4. 必要な外部サービス・アカウント

### 4.1 必須サービス

| サービス | 用途 | 推奨プロバイダー | 費用 |
|----------|------|------------------|------|
| クラウドホスティング | APIサーバー | Railway / Vercel | $0-5/月（MVP） |
| PostgreSQLデータベース | プロンプト保存 | Railway組込 | ホスティングに含む |
| GitHubアカウント | ソースコード管理 | GitHub | 無料 |
| VS Code Marketplace | 拡張機能公開 | Microsoft | 無料 |

**初期費用**: **$0-5/月** （ほぼ無料で開始可能）

### 4.2 推奨（オプション）サービス

| サービス | 用途 | 推奨プロバイダー | 費用 |
|----------|------|------------------|------|
| エラートラッキング | バグ監視 | Sentry | 無料枠あり |
| CDN | 静的アセット配信 | Cloudflare | 無料 |
| ドメイン | カスタムドメイン | Namecheap | $10/年 |

### 4.3 開発者アカウント要件

**必要なアカウント**:
1. ✅ GitHubアカウント（開発者個人）
2. ✅ Railwayアカウント（GitHubでOAuth可能）
3. ✅ VS Code Marketplace発行者アカウント（Azure ADアカウント必要）

**アカウント作成時間**: 合計30分程度

---

## 5. 総合評価

### 5.1 実現可能性スコア

| コンポーネント | 実現可能性 | 技術的成熟度 | 開発難易度 |
|----------------|-----------|------------|----------|
| VS Code拡張 | ✅ 高 | ⭐⭐⭐⭐⭐ | 中 |
| MCPサーバー | ✅ 高 | ⭐⭐⭐⭐ | 中 |
| クラウドAPI | ✅ 高 | ⭐⭐⭐⭐⭐ | 中 |
| インフラ | ✅ 高 | ⭐⭐⭐⭐⭐ | 低 |

**総合判定**: ✅ **実装可能（すべてのコンポーネントで高い実現可能性）**

### 5.2 開発期間見積もり

**フェーズ1: 基盤構築** (2-3週間)
- クラウドAPI開発（NestJS + PostgreSQL + Prisma）
- MCPサーバー開発（TypeScript SDK）
- VS Code拡張の基本構造

**フェーズ2: 統合開発** (2週間)
- VS Code拡張 ↔ MCPサーバー連携
- MCPサーバー ↔ クラウドAPI連携
- プロンプト注入・フェーズ遷移機能

**フェーズ3: UI/UX実装** (1-2週間)
- Webview UI（一般ユーザー向け）
- 管理画面（プロンプト編集）
- プレビュー機能

**フェーズ4: テスト・デバッグ** (1週間)
- 統合テスト
- E2Eテスト
- パフォーマンステスト

**合計開発期間**: **6-8週間**（1.5-2ヶ月）

### 5.3 技術的リスクまとめ

**低リスク要因**:
- ✅ すべての技術が成熟している
- ✅ BlueLampの実装例がある（MCPサーバー）
- ✅ 公式ドキュメント・SDKが充実
- ✅ 開発コミュニティが活発

**中リスク要因**:
- ⚠️ Claude Code CLIの仕様変更可能性
  - 対策: MCPサーバー経由で抽象化
- ⚠️ VS Code Extension APIの非推奨化（Webview UI Toolkit）
  - 対策: プレーンHTML/CSS/JSで実装（影響なし）

**高リスク要因**:
- ❌ なし

### 5.4 コスト見積もり

**初期開発コスト**:
- 開発期間: 6-8週間
- 外部サービス費用: $0-5/月（開発中）

**運用コスト**（月額）:
- ホスティング: $5-20/月（ユーザー数による）
- データベース: ホスティングに含む
- ドメイン: $1/月（年払いの場合）
- **合計**: $6-21/月

**ROI**: 極めて低コストで実現可能

---

## 6. 推奨技術スタック（最終版）

### 6.1 VS Code拡張

```json
{
  "language": "TypeScript",
  "framework": "VS Code Extension API v1.108+",
  "ui": "Webview API (Plain HTML/CSS/JS)",
  "process": "child_process.spawn()",
  "build": "webpack / esbuild"
}
```

### 6.2 MCPサーバー

```json
{
  "language": "TypeScript",
  "sdk": "@modelcontextprotocol/sdk v0.5.0+",
  "transport": "StdioServerTransport",
  "validation": "Zod v3.25+",
  "runtime": "Node.js 18+"
}
```

### 6.3 クラウドAPI

```json
{
  "language": "TypeScript",
  "framework": "NestJS",
  "database": "PostgreSQL 14+",
  "orm": "Prisma 5+",
  "authentication": "JWT + API Key",
  "hosting": "Railway",
  "versioning": "URI Path (/api/v1/...)"
}
```

### 6.4 開発ツール

```json
{
  "versionControl": "Git + GitHub",
  "packageManager": "npm / pnpm",
  "testing": "Jest",
  "linting": "ESLint + Prettier",
  "cicd": "GitHub Actions"
}
```

---

## 7. 次のステップ

### Step #3: アーキテクチャ設計

実現可能性が確認されたため、次は詳細なアーキテクチャ設計を行います。

**設計項目**:
1. システムアーキテクチャ図
2. データフロー設計
3. API仕様書（OpenAPI/Swagger）
4. データベーススキーマ詳細設計
5. MCPサーバーツール定義
6. VS Code拡張コマンド定義
7. エラーハンドリング戦略
8. セキュリティ設計

**成果物**:
- `docs/architecture.md`
- `docs/api-specification.yml`
- `docs/database-schema.prisma`
- `docs/mcp-tools.md`
- `docs/security-design.md`

---

## 付録: 参考リソース

### A. 公式ドキュメント

**VS Code Extension API**:
- https://code.visualstudio.com/api
- https://code.visualstudio.com/api/extension-guides/webview

**Model Context Protocol**:
- https://modelcontextprotocol.io/docs/develop/build-server
- https://github.com/modelcontextprotocol/typescript-sdk

**NestJS**:
- https://docs.nestjs.com/

**Prisma**:
- https://www.prisma.io/docs

### B. BlueLamp参考実装

- MCPサーバー: `/Users/lennon/.bluelamp/mcp-server/src/index.ts`
- 設定ファイル: `/Users/lennon/.bluelamp/config.json`

### C. 研究論文・記事

- "Using PostgreSQL as an LLM Prompt Store — Why It Works Surprisingly Well" (Medium)
- "PostgreSQL vs. MongoDB: Which Is Better for GenAI?" (The New Stack)
- Microsoft Azure API Design Best Practices

---

**レポート作成者**: Claude (Sonnet 4.5)
**レポート承認**: 待機中
**次回アクション**: Step #3 アーキテクチャ設計開始
