# VS Code Extension Commands Definition

**Version**: 1.0.0
**Created**: 2026-01-12
**Extension ID**: aiagentstudio.aiagent-studio-x

---

## 目次

1. [概要](#概要)
2. [コマンド一覧](#コマンド一覧)
3. [コマンド詳細仕様](#コマンド詳細仕様)
4. [Webview通信プロトコル](#webview通信プロトコル)
5. [実装例](#実装例)

---

## 概要

AIAgentStudio-X VS Code拡張は、以下のコマンドとWebviewを提供します。

### コマンド分類

| 分類 | コマンド数 | 説明 |
|------|-----------|------|
| Phase Management | 6 | フェーズ管理 |
| Admin | 3 | 管理者機能 |
| Preview | 2 | プレビュー機能 |
| Utility | 2 | ユーティリティ |

---

## コマンド一覧

### Phase Management Commands

| Command ID | Title | Keybinding | When |
|-----------|-------|------------|------|
| `aiagent-studio.startPhase0` | Start Phase 0 | - | - |
| `aiagent-studio.startPhase1` | Start Phase 1 | - | - |
| `aiagent-studio.startPhase2` | Start Phase 2 | - | - |
| `aiagent-studio.startPhase3` | Start Phase 3 | - | - |
| `aiagent-studio.startPhase4` | Start Phase 4 | - | - |
| `aiagent-studio.stopPhase` | Stop Current Phase | `Cmd+Shift+S` (Mac)<br>`Ctrl+Shift+S` (Win) | `aiagent-studio.phaseRunning` |

### Admin Commands

| Command ID | Title | Keybinding | When |
|-----------|-------|------------|------|
| `aiagent-studio.openAdminPanel` | Open Admin Panel | - | - |
| `aiagent-studio.syncPrompts` | Sync Prompts with Cloud | - | - |
| `aiagent-studio.logout` | Logout | - | `aiagent-studio.isLoggedIn` |

### Preview Commands

| Command ID | Title | Keybinding | When |
|-----------|-------|------------|------|
| `aiagent-studio.openPreview` | Open Preview | - | - |
| `aiagent-studio.refreshPreview` | Refresh Preview | `Cmd+R` (Mac)<br>`Ctrl+R` (Win) | `aiagent-studio.previewOpen` |

### Utility Commands

| Command ID | Title | Keybinding | When |
|-----------|-------|------------|------|
| `aiagent-studio.openUserPanel` | Open User Panel | `Cmd+Shift+A` (Mac)<br>`Ctrl+Shift+A` (Win) | - |
| `aiagent-studio.showPhaseStatus` | Show Phase Status | - | - |

---

## コマンド詳細仕様

### 1. startPhase0 ~ startPhase4

**Description**: 指定されたフェーズを開始します。

**Implementation**:
```typescript
vscode.commands.registerCommand('aiagent-studio.startPhase0', async () => {
  await phaseManager.startPhase('phase0');
});

vscode.commands.registerCommand('aiagent-studio.startPhase1', async () => {
  await phaseManager.startPhase('phase1');
});

// ... phase2, phase3, phase4 も同様
```

**処理フロー**:
1. 現在のフェーズが実行中かチェック
2. 実行中の場合、確認ダイアログ表示
3. Cloud APIからプロンプト取得
4. Claude Code CLI起動（`spawn()`）
5. Webview UIに開始通知
6. ファイル監視開始

**エラーハンドリング**:
- フェーズ実行中: "Another phase is already running. Stop it first?"
- Claude Code未インストール: "Claude Code CLI not found. Please install it first."
- Cloud API接続エラー: "Failed to connect to Cloud API. Check your connection."

---

### 2. stopPhase

**Description**: 現在実行中のフェーズを停止します。

**Implementation**:
```typescript
vscode.commands.registerCommand('aiagent-studio.stopPhase', async () => {
  const confirm = await vscode.window.showWarningMessage(
    'Are you sure you want to stop the current phase?',
    { modal: true },
    'Yes', 'No'
  );

  if (confirm === 'Yes') {
    await phaseManager.stopCurrentPhase();
    vscode.window.showInformationMessage('Phase stopped successfully');
  }
});
```

**処理フロー**:
1. 確認ダイアログ表示
2. Claude Codeプロセス終了（SIGTERM → SIGKILL）
3. ファイル監視停止
4. Webview UIに停止通知
5. 部分的な結果を保存（オプション）

---

### 3. openAdminPanel

**Description**: 管理者用プロンプト編集パネルを開きます。

**Implementation**:
```typescript
vscode.commands.registerCommand('aiagent-studio.openAdminPanel', async () => {
  // 認証チェック
  if (!authService.isLoggedIn()) {
    const email = await vscode.window.showInputBox({
      prompt: 'Admin Email',
      placeHolder: 'admin@example.com'
    });

    const password = await vscode.window.showInputBox({
      prompt: 'Password',
      password: true
    });

    await authService.login(email, password);
  }

  // Admin Webview表示
  adminView.show();
});
```

**Webview機能**:
- プロンプト一覧表示
- プロンプト編集（Monaco Editor）
- バージョン履歴表示
- ロールバック機能
- プレビュー機能

---

### 4. syncPrompts

**Description**: ローカルとクラウド間でプロンプトを同期します。

**Implementation**:
```typescript
vscode.commands.registerCommand('aiagent-studio.syncPrompts', async () => {
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Syncing prompts...',
      cancellable: false
    },
    async (progress) => {
      progress.report({ increment: 0, message: 'Pulling from cloud...' });
      const pullResult = await syncService.pull();

      progress.report({ increment: 50, message: 'Pushing to cloud...' });
      const pushResult = await syncService.push();

      progress.report({ increment: 100, message: 'Sync completed!' });

      vscode.window.showInformationMessage(
        `Sync completed: ${pullResult.updated} updated, ${pushResult.created} created`
      );
    }
  );
});
```

---

### 5. openPreview

**Description**: 生成されたモックアップのプレビューを表示します。

**Implementation**:
```typescript
vscode.commands.registerCommand('aiagent-studio.openPreview', async (filePath?: string) => {
  if (!filePath) {
    // ファイル選択ダイアログ
    const files = await vscode.workspace.findFiles('mockup/**/*.html');
    if (files.length === 0) {
      vscode.window.showWarningMessage('No mockup files found');
      return;
    }

    const selected = await vscode.window.showQuickPick(
      files.map(f => ({
        label: path.basename(f.fsPath),
        description: f.fsPath
      })),
      { placeHolder: 'Select a mockup file to preview' }
    );

    if (!selected) return;
    filePath = selected.description;
  }

  previewView.show(filePath);
});
```

**Webview機能**:
- HTMLレンダリング
- ライブリロード
- レスポンシブプレビュー（デスクトップ/タブレット/モバイル）
- DevTools連携

---

### 6. openUserPanel

**Description**: 一般ユーザー向けUIパネルを表示します。

**Implementation**:
```typescript
vscode.commands.registerCommand('aiagent-studio.openUserPanel', () => {
  userView.show();
});
```

**Webview機能**:
- フェーズボタン（Phase 0 ~ Phase 4）
- 進捗表示（プログレスバー）
- 現在のフェーズ状態表示
- 生成ファイルリスト
- プレビューボタン

---

### 7. showPhaseStatus

**Description**: 現在のフェーズステータスを表示します。

**Implementation**:
```typescript
vscode.commands.registerCommand('aiagent-studio.showPhaseStatus', () => {
  const status = phaseManager.getStatus();

  const statusText = `
Current Phase: ${status.currentPhase || 'None'}
Status: ${status.status}
Progress: ${status.progress}%
Output Files: ${status.outputFiles.length}
  `.trim();

  vscode.window.showInformationMessage(statusText, { modal: true });
});
```

---

## Webview通信プロトコル

### メッセージフォーマット

```typescript
interface WebviewMessage {
  type: string;
  payload?: any;
}
```

### Extension → Webview メッセージ

#### phaseChanged
```typescript
{
  type: "phaseChanged",
  payload: {
    phase: "phase1",
    status: "in_progress",
    progress: 25,
    startedAt: "2026-01-12T10:00:00Z"
  }
}
```

#### fileGenerated
```typescript
{
  type: "fileGenerated",
  payload: {
    path: "mockup/index.html",
    type: "html",
    size: 1024
  }
}
```

#### error
```typescript
{
  type: "error",
  payload: {
    message: "Failed to start phase",
    code: "PHASE_START_ERROR",
    details: { ... }
  }
}
```

#### phaseCompleted
```typescript
{
  type: "phaseCompleted",
  payload: {
    phase: "phase0",
    completedAt: "2026-01-12T11:00:00Z",
    outputFiles: ["docs/requirements.md", "docs/data-model.md"]
  }
}
```

### Webview → Extension メッセージ

#### startPhase
```typescript
{
  type: "startPhase",
  payload: {
    phase: "phase0"
  }
}
```

#### stopPhase
```typescript
{
  type: "stopPhase",
  payload: {}
}
```

#### openPreview
```typescript
{
  type: "openPreview",
  payload: {
    path: "mockup/index.html"
  }
}
```

#### updatePrompt (Admin UI)
```typescript
{
  type: "updatePrompt",
  payload: {
    id: "uuid",
    title: "Updated Title",
    content: "# Updated content..."
  }
}
```

---

## 実装例

### package.json（コマンド定義）

```json
{
  "contributes": {
    "commands": [
      {
        "command": "aiagent-studio.startPhase0",
        "title": "Start Phase 0",
        "category": "AIAgentStudio"
      },
      {
        "command": "aiagent-studio.startPhase1",
        "title": "Start Phase 1",
        "category": "AIAgentStudio"
      },
      {
        "command": "aiagent-studio.startPhase2",
        "title": "Start Phase 2",
        "category": "AIAgentStudio"
      },
      {
        "command": "aiagent-studio.startPhase3",
        "title": "Start Phase 3",
        "category": "AIAgentStudio"
      },
      {
        "command": "aiagent-studio.startPhase4",
        "title": "Start Phase 4",
        "category": "AIAgentStudio"
      },
      {
        "command": "aiagent-studio.stopPhase",
        "title": "Stop Current Phase",
        "category": "AIAgentStudio",
        "icon": "$(debug-stop)"
      },
      {
        "command": "aiagent-studio.openAdminPanel",
        "title": "Open Admin Panel",
        "category": "AIAgentStudio"
      },
      {
        "command": "aiagent-studio.syncPrompts",
        "title": "Sync Prompts with Cloud",
        "category": "AIAgentStudio"
      },
      {
        "command": "aiagent-studio.openPreview",
        "title": "Open Preview",
        "category": "AIAgentStudio",
        "icon": "$(open-preview)"
      },
      {
        "command": "aiagent-studio.refreshPreview",
        "title": "Refresh Preview",
        "category": "AIAgentStudio",
        "icon": "$(refresh)"
      },
      {
        "command": "aiagent-studio.openUserPanel",
        "title": "Open User Panel",
        "category": "AIAgentStudio"
      },
      {
        "command": "aiagent-studio.showPhaseStatus",
        "title": "Show Phase Status",
        "category": "AIAgentStudio"
      },
      {
        "command": "aiagent-studio.logout",
        "title": "Logout",
        "category": "AIAgentStudio"
      }
    ],
    "keybindings": [
      {
        "command": "aiagent-studio.openUserPanel",
        "key": "cmd+shift+a",
        "mac": "cmd+shift+a",
        "win": "ctrl+shift+a"
      },
      {
        "command": "aiagent-studio.stopPhase",
        "key": "cmd+shift+s",
        "mac": "cmd+shift+s",
        "win": "ctrl+shift+s",
        "when": "aiagent-studio.phaseRunning"
      },
      {
        "command": "aiagent-studio.refreshPreview",
        "key": "cmd+r",
        "mac": "cmd+r",
        "win": "ctrl+r",
        "when": "aiagent-studio.previewOpen"
      }
    ],
    "menus": {
      "commandPalette": [
        {
          "command": "aiagent-studio.stopPhase",
          "when": "aiagent-studio.phaseRunning"
        },
        {
          "command": "aiagent-studio.refreshPreview",
          "when": "aiagent-studio.previewOpen"
        },
        {
          "command": "aiagent-studio.logout",
          "when": "aiagent-studio.isLoggedIn"
        }
      ]
    }
  }
}
```

### extension.ts（エントリーポイント）

```typescript
import * as vscode from 'vscode';
import { PhaseManager } from './services/phaseManager';
import { UserView } from './webview/userView';
import { AdminView } from './webview/adminView';
import { PreviewView } from './webview/previewView';

export function activate(context: vscode.ExtensionContext) {
  // サービス初期化
  const phaseManager = new PhaseManager(context);
  const userView = new UserView(context, phaseManager);
  const adminView = new AdminView(context);
  const previewView = new PreviewView(context);

  // Phase Management Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('aiagent-studio.startPhase0', () =>
      phaseManager.startPhase('phase0')
    ),
    vscode.commands.registerCommand('aiagent-studio.startPhase1', () =>
      phaseManager.startPhase('phase1')
    ),
    vscode.commands.registerCommand('aiagent-studio.startPhase2', () =>
      phaseManager.startPhase('phase2')
    ),
    vscode.commands.registerCommand('aiagent-studio.startPhase3', () =>
      phaseManager.startPhase('phase3')
    ),
    vscode.commands.registerCommand('aiagent-studio.startPhase4', () =>
      phaseManager.startPhase('phase4')
    ),
    vscode.commands.registerCommand('aiagent-studio.stopPhase', async () => {
      const confirm = await vscode.window.showWarningMessage(
        'Are you sure you want to stop the current phase?',
        { modal: true },
        'Yes', 'No'
      );
      if (confirm === 'Yes') {
        await phaseManager.stopCurrentPhase();
      }
    })
  );

  // Admin Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('aiagent-studio.openAdminPanel', () =>
      adminView.show()
    ),
    vscode.commands.registerCommand('aiagent-studio.syncPrompts', async () => {
      // 実装省略
    })
  );

  // Preview Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('aiagent-studio.openPreview', (filePath) =>
      previewView.show(filePath)
    ),
    vscode.commands.registerCommand('aiagent-studio.refreshPreview', () =>
      previewView.refresh()
    )
  );

  // Utility Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('aiagent-studio.openUserPanel', () =>
      userView.show()
    ),
    vscode.commands.registerCommand('aiagent-studio.showPhaseStatus', () => {
      const status = phaseManager.getStatus();
      vscode.window.showInformationMessage(
        `Phase: ${status.currentPhase}, Progress: ${status.progress}%`,
        { modal: true }
      );
    })
  );

  // Context設定
  vscode.commands.executeCommand('setContext', 'aiagent-studio.phaseRunning', false);
  vscode.commands.executeCommand('setContext', 'aiagent-studio.previewOpen', false);
  vscode.commands.executeCommand('setContext', 'aiagent-studio.isLoggedIn', false);
}

export function deactivate() {
  // クリーンアップ処理
}
```

---

## コンテキストキー

VS Code拡張は以下のコンテキストキーを使用します：

| Context Key | Type | Description |
|-------------|------|-------------|
| `aiagent-studio.phaseRunning` | boolean | フェーズ実行中かどうか |
| `aiagent-studio.previewOpen` | boolean | プレビューが開いているか |
| `aiagent-studio.isLoggedIn` | boolean | 管理者ログイン済みか |
| `aiagent-studio.currentPhase` | string | 現在のフェーズ名 |

---

**関連ドキュメント**:
- `architecture.md` - システム全体のアーキテクチャ
- `mcp-tools.md` - MCPサーバーツール定義
- `error-handling.md` - エラーハンドリング戦略
