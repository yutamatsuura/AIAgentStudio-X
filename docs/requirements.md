# AIAgentStudio-X - 要件定義書

## 要件定義の作成原則
- **「あったらいいな」は絶対に作らない**
- **拡張可能性のための余分な要素は一切追加しない**
- **将来の「もしかして」のための準備は禁止**
- **今、ここで必要な最小限の要素のみ**

## 1. プロジェクト概要

### 1.1 成果目標
会話型AIで実装レベルのHTML/CSS/JavaScriptモックアップを自動生成するVS Code拡張システムを開発し、商用販売する。BlueLampの5フェーズ構造（Phase 0: 要件定義、Phase 1: デザインシステム、Phase 2: モックデータ、Phase 3: 実装、Phase 4: 品質チェック）を通じて、非エンジニアでも実装可能な高品質モックアップを提供する。

### 1.2 成功指標

#### 定量的指標
- Phase実行成功率: 95%以上
- モックアップ生成時間: Phase 0-4完了まで平均30分以内
- 生成されたコードの品質: ESLint/Prettier基準100%準拠
- ユーザー満足度: NPS 50以上
- システム稼働率: 99%以上

#### 定性的指標
- 非エンジニアでも迷わずPhaseを実行できる直感的なUI
- Claude Codeとのシームレスな連携による自然な会話フロー
- 生成されたモックアップがそのまま実装に使えるレベルの品質
- 管理者がプロンプトを簡単に編集・改善できる管理画面
- エラーが発生した際に適切なガイダンスが表示される

## 2. システム全体像

### 2.1 主要機能一覧
- **VS Code拡張機能**: Phase選択、実行、モックアッププレビュー、ファイルエクスポート
- **MCP Server**: Claude Codeへのプロンプト注入、Phase遷移管理
- **Cloud API**: プロンプト管理、ユーザー管理、同期機能
- **管理画面**: プロンプト編集・バージョン管理、ユーザー管理、システム設定

### 2.2 ユーザーロールと権限

**管理者（1名）**:
- プロンプト管理（作成、編集、削除、バージョン管理）
- ユーザー管理（一般ユーザーの手動登録、削除）
- システム設定（APIキー管理、監査ログ閲覧）

**一般ユーザー（複数）**:
- Phase実行（Phase 0-4）
- モックアッププレビュー
- 成果物のエクスポート
- プロンプト閲覧（同期）
- 実行履歴閲覧（自分のみ）

### 2.3 認証・認可要件

**認証方式**:
- 管理者: メール + パスワード → JWT認証
- 一般ユーザー: メール + パスワード（管理者が手動発行） → JWT認証
- API通信: 共通APIキー（全ユーザー共通） + JWT（2層認証）

**セキュリティレベル**:
- 個人情報を扱う（メールアドレス、パスワードハッシュ）
- ブルートフォース攻撃対策: アカウントロックアウト（5回失敗で15分ロック）
- セッション管理: JWT有効期限24時間、自動更新あり
- HTTPS強制（本番環境）

**管理機能**:
- 必要性: 必須（商用販売のため）
- 具体的な機能:
  - ユーザー手動作成・削除
  - プロンプト編集・バージョン管理
  - 共通APIキーの表示・再発行
  - アクティビティログ閲覧

## 3. ページ詳細仕様

### 3.1 P-001: 管理者ログイン

#### 目的
管理者の認証とセッション確立により、プロンプト・ユーザー管理への安全なアクセスを提供

#### 主要機能
- メール + パスワード認証
- ブルートフォース攻撃対策（5回失敗で15分ロック）
- JWT発行
- セッション永続化（Remember Me）

#### 必要な操作
| 操作種別 | 操作内容 | 必要な入力 | 期待される出力 |
|---------|---------|-----------|---------------|
| 作成 | ログインセッション作成 | email, password | JWT token, user info |
| 取得 | セッション検証 | JWT token | user info |

#### 処理フロー
1. ユーザーがメールアドレスとパスワードを入力
2. バックエンドがパスワードハッシュを検証
3. 認証成功時、JWTトークンを発行
4. フロントエンドがトークンをlocalStorageに保存
5. プロンプト管理画面にリダイレクト

#### データ構造（概念）
```yaml
User:
  識別子: id (UUID)
  基本情報:
    - email（必須、ユニーク）
    - passwordHash（必須、bcrypt）
    - role（必須、デフォルト: "admin"）
    - apiKey（任意、ユニーク）
  メタ情報:
    - createdAt
    - lastLoginAt
  関連:
    - Session（1対多）
```

---

### 3.2 P-002: プロンプト管理統合画面

#### 目的
Phase 0-4の全プロンプトを一元管理し、編集・バージョン管理・プレビューを統合的に実施

#### 主要機能
- プロンプト一覧表示（Phase 0-4の5つ）
- インライン編集（Markdownエディタ）
- バージョン履歴の閲覧・比較・復元
- メタデータ編集（タグ、推定時間等）
- リアルタイムプレビュー

#### 必要な操作
| 操作種別 | 操作内容 | 必要な入力 | 期待される出力 |
|---------|---------|-----------|---------------|
| 取得 | 全プロンプト一覧取得 | なし | prompts[] |
| 取得 | 特定プロンプト詳細取得 | promptId | prompt, versions[] |
| 更新 | プロンプト内容更新 | promptId, content, metadata | updated prompt, new version created |
| 取得 | バージョン履歴取得 | promptId | versions[] |
| 更新 | バージョン復元 | promptId, versionId | restored prompt, new version created |

#### 処理フロー
1. 管理者がプロンプト管理画面にアクセス
2. 5つのPhaseプロンプトが一覧表示される
3. 管理者が編集したいプロンプトを選択
4. Markdownエディタとプレビューが左右に表示
5. 編集内容を保存
6. バックエンドが新バージョンを自動作成
7. version番号が自動インクリメント
8. 成功メッセージ表示

#### データ構造（概念）
```yaml
Prompt:
  識別子: id (UUID)
  基本情報:
    - phase（必須、ユニーク、例: "phase0"）
    - title（必須）
    - content（必須、Markdown）
    - metadata（任意、JSONB）
    - version（必須、自動インクリメント）
    - isActive（必須、デフォルト: true）
  メタ情報:
    - createdAt
    - updatedAt
    - createdBy
  関連:
    - PromptVersion（1対多）

PromptVersion:
  識別子: id (UUID)
  基本情報:
    - promptId（必須）
    - version（必須）
    - content（必須）
    - metadata（任意）
  メタ情報:
    - createdAt
    - createdBy
  関連:
    - Prompt（多対1）
```

---

### 3.3 P-003: プロンプトプレビュー画面

#### 目的
編集中のプロンプトがユーザーにどう表示されるかを事前確認し、品質を保証

#### 主要機能
- Markdownレンダリングプレビュー
- VS Code拡張での表示シミュレーション
- プロンプト長の確認
- 構文ハイライト確認

#### 必要な操作
| 操作種別 | 操作内容 | 必要な入力 | 期待される出力 |
|---------|---------|-----------|---------------|
| 取得 | プロンプトプレビュー取得 | promptId | rendered HTML |

#### 処理フロー
1. 管理者がプレビューボタンをクリック
2. Markdownがレンダリングされる
3. VS Code拡張の表示形式でシミュレーション
4. 問題があれば編集画面に戻る

#### データ構造（概念）
```yaml
（P-002と同じPromptエンティティを参照）
```

---

### 3.4 P-004: ユーザー管理統合画面

#### 目的
一般ユーザーの手動作成・管理・削除を効率的に実施

#### 主要機能
- ユーザー一覧表示・検索・フィルタ
- 新規ユーザー作成（メール + パスワード自動生成）
- ユーザー編集（パスワードリセット、メール変更）
- ユーザー削除
- アクティビティログ閲覧（ユーザーごと）

#### 必要な操作
| 操作種別 | 操作内容 | 必要な入力 | 期待される出力 |
|---------|---------|-----------|---------------|
| 取得 | ユーザー一覧取得 | page, limit, search | users[], total |
| 作成 | 新規ユーザー作成 | email | user, generated password |
| 更新 | ユーザー情報更新 | userId, email | updated user |
| 更新 | パスワードリセット | userId | new password |
| 削除 | ユーザー削除 | userId | success |
| 取得 | ユーザー別アクティビティログ | userId | activityLogs[] |

#### 処理フロー
1. 管理者がユーザー管理画面にアクセス
2. 一般ユーザーの一覧が表示される
3. 「新規ユーザー作成」ボタンをクリック
4. メールアドレスを入力
5. バックエンドが自動でランダムパスワード生成
6. ユーザーアカウント作成
7. 管理者に生成されたパスワードを表示
8. 管理者が顧客にメール + パスワードを送信（手動）

#### データ構造（概念）
```yaml
User:
  識別子: id (UUID)
  基本情報:
    - email（必須、ユニーク）
    - passwordHash（必須）
    - role（必須、デフォルト: "user"）
  メタ情報:
    - createdAt
    - lastLoginAt
  関連:
    - Session（1対多）
```

---

### 3.5 P-005: システム設定統合画面

#### 目的
共通APIキー管理と監査ログ閲覧によりシステムの安全な運用を保証

#### 主要機能
- 共通APIキーの表示・再発行
- アクティビティログ閲覧（全ユーザー）
- システム統計（ユーザー数、同期状況）

#### 必要な操作
| 操作種別 | 操作内容 | 必要な入力 | 期待される出力 |
|---------|---------|-----------|---------------|
| 取得 | 共通APIキー取得 | なし | apiKey（マスク表示） |
| 更新 | APIキー再発行 | なし | new apiKey |
| 取得 | アクティビティログ取得 | page, limit, filter | activityLogs[], total |
| 取得 | システム統計取得 | なし | userCount, syncStats |

#### 処理フロー
1. 管理者がシステム設定画面にアクセス
2. 共通APIキーが一部マスクされて表示される
3. 「再発行」ボタンで新しいAPIキーを生成
4. アクティビティログで操作履歴を確認
5. システム統計で全体の状況を把握

#### データ構造（概念）
```yaml
User:
  識別子: id (UUID)
  基本情報:
    - apiKey（任意、ユニーク）

ActivityLog:
  識別子: id (UUID)
  基本情報:
    - action（必須、例: "prompt.updated"）
    - actor（必須、メールアドレス）
    - resourceType（任意、例: "prompt"）
    - resourceId（任意）
    - details（任意、JSONB）
    - ipAddress（任意）
    - userAgent（任意）
  メタ情報:
    - timestamp
```

---

### 3.6 E-001: 拡張機能ログイン・設定統合画面

#### 目的
一般ユーザーの認証と拡張機能の初期設定を統合的に実施

#### 主要機能
- ログインフォーム（メール + パスワード）
- JWTトークン保存
- APIエンドポイント設定
- 自動同期設定（ON/OFF）
- ログレベル設定

#### 必要な操作
| 操作種別 | 操作内容 | 必要な入力 | 期待される出力 |
|---------|---------|-----------|---------------|
| 作成 | ログインセッション作成 | email, password, apiKey | JWT token, user info |
| 取得 | 設定情報取得 | なし | config |
| 更新 | 設定情報更新 | config | updated config |

#### 処理フロー
1. ユーザーがVS Code拡張を初回起動
2. ログイン画面が表示される
3. メールアドレスとパスワードを入力
4. 共通APIキー + JWT認証で認証
5. トークンをExtension Contextに保存
6. 設定タブでAPIエンドポイント等を設定
7. Phase選択画面に遷移

#### データ構造（概念）
```yaml
ExtensionConfig:
  識別子: なし（ローカル保存）
  基本情報:
    - apiEndpoint（必須）
    - jwtToken（必須）
    - autoSync（必須、デフォルト: true）
    - logLevel（必須、デフォルト: "info"）
```

---

### 3.7 E-002: Phase選択・実行統合画面

#### 目的
Phase 0-4の選択から実行、進捗管理までを一元化し、スムーズなモックアップ生成を実現

#### 主要機能
- Phase 0-4の選択（カード形式）
- 進捗状況表示（各Phaseの完了状態）
- 現在のPhaseコンテキスト表示
- Claude Code実行状態モニタリング
- 実行履歴の簡易表示（直近5件）
- エラー時のガイダンス表示

#### 必要な操作
| 操作種別 | 操作内容 | 必要な入力 | 期待される出力 |
|---------|---------|-----------|---------------|
| 取得 | 全Phaseプロンプト同期 | apiKey, JWT | prompts[] |
| 作成 | Phase実行開始 | phase | prompt injected to Claude Code |
| 取得 | Phase進捗状況取得 | なし | phaseProgress[] |
| 取得 | 実行履歴取得 | limit | executionHistory[] |

#### 処理フロー
1. ユーザーがPhase選択画面にアクセス
2. Cloud APIから最新プロンプトを同期
3. Phase 0-4がカード形式で表示される
4. ユーザーがPhase 0をクリック
5. MCP Serverが起動し、Claude Codeにプロンプトを注入
6. Claude Codeとの会話が開始
7. Phase完了後、次のPhaseが選択可能になる
8. 進捗状況がリアルタイムで更新される

#### データ構造（概念）
```yaml
PhaseExecution:
  識別子: id (UUID)
  基本情報:
    - userId（必須）
    - phase（必須）
    - status（必須、例: "in_progress", "completed", "failed"）
    - startedAt（必須）
    - completedAt（任意）
    - result（任意、JSONB）
  メタ情報:
    - createdAt
```

---

### 3.8 E-003: 要件定義書・進捗状況表示画面

#### 目的
Phase実行中に常に要件定義書とプロジェクト進捗状況を確認でき、開発の方向性を見失わない

#### 主要機能
- requirements.mdの表示（Markdownレンダリング）
- SCOPE_PROGRESS.mdの表示（統合ページ管理表含む）
- タブ切り替え（要件定義書 ⇔ 進捗状況）
- 検索機能（ページ内検索）

#### 必要な操作
| 操作種別 | 操作内容 | 必要な入力 | 期待される出力 |
|---------|---------|-----------|---------------|
| 取得 | 要件定義書取得 | なし | requirements.md content |
| 取得 | 進捗状況取得 | なし | SCOPE_PROGRESS.md content |

#### 処理フロー
1. ユーザーが要件定義書タブをクリック
2. ローカルのrequirements.mdを読み込み
3. Markdownがレンダリングされて表示
4. 進捗状況タブに切り替え可能
5. SCOPE_PROGRESS.mdが表示される
6. 統合ページ管理表でチェックボックスの進捗を確認

#### データ構造（概念）
```yaml
（ローカルファイルシステムからの読み込みのみ）
```

---

### 3.9 E-004: 成果物管理統合画面

#### 目的
生成されたモックアップのプレビュー、エクスポート、プロジェクト統合を効率化

#### 主要機能
- HTML/CSS/JSプレビュー（iframe）
- ファイルエクスポート（ZIP形式）
- プロジェクトへの統合（ディレクトリ選択）
- 過去の実行履歴詳細表示

#### 必要な操作
| 操作種別 | 操作内容 | 必要な入力 | 期待される出力 |
|---------|---------|-----------|---------------|
| 取得 | 成果物取得 | executionId | generated files |
| 作成 | ZIPエクスポート | executionId | ZIP file |
| 作成 | プロジェクト統合 | executionId, targetDir | copied files |

#### 処理フロー
1. Phase 4完了後、成果物管理画面に遷移
2. 生成されたHTML/CSS/JSがiframeでプレビュー
3. 「エクスポート」ボタンでZIPファイルダウンロード
4. または「プロジェクトに統合」でディレクトリ選択
5. ファイルがコピーされる
6. 成功メッセージ表示

#### データ構造（概念）
```yaml
PhaseExecution:
  識別子: id (UUID)
  基本情報:
    - result（任意、JSONB）
      - files（配列）
        - path
        - content
        - type
```

---

## 4. データ設計概要

### 4.1 主要エンティティ

```yaml
User:
  概要: 管理者および一般ユーザーのアカウント情報
  主要属性:
    - 認証情報: email, passwordHash, role, apiKey
    - メタ情報: createdAt, lastLoginAt
  関連:
    - Session（1対多）

Prompt:
  概要: 各Phaseのマスタープロンプトとアクティブなバージョンを管理
  主要属性:
    - 識別情報: phase（ユニーク）, title
    - コンテンツ: content（Markdown）, metadata（JSONB）
    - バージョン管理: version, isActive
    - メタ情報: createdAt, updatedAt, createdBy
  関連:
    - PromptVersion（1対多）

PromptVersion:
  概要: プロンプトの全変更履歴を保存
  主要属性:
    - バージョン情報: promptId, version
    - コンテンツ: content, metadata
    - メタ情報: createdAt, createdBy
  関連:
    - Prompt（多対1）

Session:
  概要: JWTトークン管理（将来的なトークン無効化に対応）
  主要属性:
    - セッション情報: userId, tokenHash, expiresAt
    - メタ情報: createdAt
  関連:
    - User（多対1）

ActivityLog:
  概要: 管理者操作とAPI使用状況の監査ログ
  主要属性:
    - アクション: action, actor, resourceType, resourceId
    - 詳細: details（JSONB）, ipAddress, userAgent
    - メタ情報: timestamp
  関連:
    - なし（ログのみ）

SyncHistory:
  概要: VS Code拡張とクラウド間の同期履歴
  主要属性:
    - 同期情報: clientId, direction, status
    - 処理情報: itemsProcessed, error
    - メタ情報: startedAt, completedAt
  関連:
    - なし（履歴のみ）
```

### 4.2 エンティティ関係図
```
User ─┬─ Session        （1対多）

Prompt ─── PromptVersion （1対多）

ActivityLog （独立）
SyncHistory （独立）
```

### 4.3 バリデーションルール
```yaml
email:
  - ルール: 有効なメール形式、最大255文字
  - 理由: 認証とアカウント識別のため

password:
  - ルール: 8文字以上、英数字混在
  - 理由: セキュリティ確保のため

phase:
  - ルール: "phase0", "phase1", "phase2", "phase3", "phase4"のいずれか
  - 理由: 5つのPhaseのみ定義されているため

content:
  - ルール: 空文字列不可、Markdown形式
  - 理由: プロンプトの品質保証のため

apiKey:
  - ルール: "cli_" + ランダム文字列（32文字）
  - 理由: セキュリティとAPIキーの識別のため
```

## 5. 制約事項

### 外部API制限
- **Claude Code Pro**: 月額$20/ユーザー（エンドユーザーが契約）
- **Neon PostgreSQL**: 無料枠0.5GB、それ以上は有料（$19/月〜）
- **Google Cloud Run**: 無料枠月200万リクエスト、それ以上は従量課金
- **Vercel**: 無料プランは100GB帯域幅/月

### 技術的制約
- **プロンプト長**: Claude Code APIの最大コンテキスト長（200,000トークン）
- **ファイルサイズ**: 生成されるモックアップファイル合計10MB以内
- **同時実行数**: VS Code拡張は1ユーザーあたり1 Phase実行のみ並列不可
- **データベース接続**: Neon無料枠は最大20接続

## 5.1 セキュリティ要件

### 基本方針
本プロジェクトは **CVSS 3.1（Common Vulnerability Scoring System）** に準拠したセキュリティ要件を満たすこと。

CVSS 3.1の評価観点:
- **機密性（Confidentiality）**: 不正アクセス防止、データ暗号化
- **完全性（Integrity）**: データ改ざん防止、入力検証
- **可用性（Availability）**: DoS対策、冗長化

詳細な診断と改善は、Phase 11（本番運用診断）で @本番運用診断オーケストレーター が実施します。

---

### プロジェクト固有の必須要件

**認証機能（必須）**:
- ✅ ブルートフォース攻撃対策: 5回失敗で15分アカウントロックアウト
- ✅ パスワードポリシー: 8文字以上、英数字混在
- ✅ セッション管理: JWT有効期限24時間、自動更新、CSRF対策
- ✅ パスワードハッシュ: bcrypt（ソルトラウンド10以上）

**その他の一般要件**:
- ✅ HTTPS強制（本番環境）
- ✅ セキュリティヘッダー設定（本番環境）
  - Content-Security-Policy
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
- ✅ 入力値のサニタイゼーション（XSS対策）
- ✅ エラーメッセージでの情報漏洩防止

---

### 運用要件：可用性とヘルスチェック

**ヘルスチェックエンドポイント（必須）**:
- エンドポイント: `/api/health`
- 目的: Cloud Runでのliveness/readinessプローブ
- 要件: データベース接続確認、5秒以内の応答

**グレースフルシャットダウン（必須）**:
- SIGTERMシグナルハンドラーの実装
- 進行中のリクエスト完了まで待機
- タイムアウト: 8秒（Cloud Runの10秒制限に対応）

## 6. 複合API処理（バックエンド内部処理）

**該当なし**: 本プロジェクトでは、フロントエンドからの1つのAPI呼び出しに対してバックエンド内部で複数の外部APIを連携する複雑な処理は存在しない。

## 7. 技術スタック

### フロントエンド（管理画面）
```yaml
フレームワーク: React 18（Blue Lamp標準）
言語: TypeScript 5
UIライブラリ: MUI v6
状態管理: Zustand
ルーティング: React Router v6
データフェッチ: TanStack Query v5（React Query）
ビルドツール: Vite 5
```

### VS Code拡張機能
```yaml
言語: TypeScript 5
フレームワーク: VS Code Extension API
Webview UI: React 18
UIライブラリ: VS Code Webview UI Toolkit
状態管理: VS Code Extension Context API
通信: vscode.postMessage API
ビルドツール: esbuild
```

### MCP Server
```yaml
言語: TypeScript 5
フレームワーク: @modelcontextprotocol/sdk
通信: stdio transport
プロセス管理: child_process（Node.js標準）
```

### バックエンド（Cloud API）
```yaml
言語: TypeScript 5
フレームワーク: NestJS 10
ORM: Prisma 5
バリデーション: Zod
認証: JWT（@nestjs/jwt）
APIドキュメント: Swagger（@nestjs/swagger）
```

### データベース
```yaml
メインDB: PostgreSQL 14+
ホスティング: Neon（https://neon.tech）
  - サーバーレスで管理不要
  - 無料枠0.5GB
  - 自動スケーリング
  - ブランチ機能で開発/本番分離
```

### インフラ
```yaml
管理画面ホスティング: Vercel
バックエンドホスティング: Google Cloud Run
VS Code拡張配布: VS Code Marketplace
```

## 8. 必要な外部サービス・アカウント

### 必須サービス
| サービス名 | 用途 | 取得先 | 料金 | 備考 |
|-----------|------|--------|------|------|
| Neon PostgreSQL | データベース（プロンプト・ユーザー管理） | https://neon.tech | 無料〜$19/月 | 開発段階は無料枠で十分 |
| Google Cloud Run | バックエンドAPI（NestJS）ホスティング | https://cloud.google.com/run | 無料枠〜$5/月 | 無料枠: 月200万リクエスト |
| Vercel | 管理画面（React）ホスティング | https://vercel.com | 無料 | 個人・商用利用可能 |
| VS Code Marketplace | VS Code拡張機能の配布 | https://marketplace.visualstudio.com | 無料 | Azure DevOps組織が必要 |
| GitHub | ソースコード管理・バージョン管理 | https://github.com | 無料 | プライベートリポジトリ対応 |

### オプションサービス（将来的に必要な可能性）
| サービス名 | 用途 | 取得先 | 料金 | 備考 |
|-----------|------|--------|------|------|
| SendGrid / Resend | メール送信（パスワードリセット等） | https://sendgrid.com | 無料〜$15/月 | 現時点では不要、管理者が手動でメール送信 |
| Sentry | エラートラッキング・監視 | https://sentry.io | 無料〜$26/月 | 本番運用開始後に検討 |

### エンドユーザー側で必要なもの（システム外）
| サービス名 | 用途 | 取得先 | 備考 |
|-----------|------|--------|------|
| Claude Code Pro以上 | Claude Code CLI実行環境 | https://claude.ai/code | 月額$20〜、AI機能はAnthropicのバックエンドを使用 |
| VS Code | 拡張機能実行環境 | https://code.visualstudio.com | 無料 |

## 9. 今後の拡張予定

**原則**: 拡張予定があっても、必要最小限の実装のみを行う

- 「あったらいいな」は実装しない
- 拡張可能性のための余分な要素は追加しない
- 将来の「もしかして」のための準備は禁止
- 今、ここで必要な最小限の要素のみを実装

拡張が必要になった時点で、Phase 11: 機能拡張オーケストレーターを使用して追加実装を行います。

（拡張候補）
- メール自動送信機能（新規ユーザー作成時の自動通知）
- パスワードリセット機能（ユーザー自身による）
- チーム機能（複数管理者の役割分担）
- プロンプトテンプレート機能（カスタムPhaseの追加）
- AI生成品質の自動評価機能

---

**文書作成日**: 2026-01-12
**作成者**: レコンX（要件定義エージェント）
**バージョン**: 1.0
