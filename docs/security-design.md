# Security Design Document

**Version**: 1.0.0
**Created**: 2026-01-12
**Classification**: Internal

---

## 目次

1. [セキュリティ概要](#セキュリティ概要)
2. [認証・認可](#認証・認可)
3. [データ保護](#データ保護)
4. [通信セキュリティ](#通信セキュリティ)
5. [脆弱性対策](#脆弱性対策)
6. [監査・ログ](#監査・ログ)
7. [インシデント対応](#インシデント対応)

---

## セキュリティ概要

### セキュリティ方針

AIAgentStudio-Xは以下のセキュリティ原則に基づいて設計されています：

1. **最小権限の原則**: 必要最小限の権限のみ付与
2. **多層防御**: 複数のセキュリティレイヤーで保護
3. **暗号化**: データの送受信・保存時に暗号化
4. **監査可能性**: すべての重要操作をログ記録
5. **セキュアデフォルト**: デフォルト設定で安全に動作

### 脅威モデル

| 脅威 | リスク | 対策 |
|------|-------|------|
| 不正アクセス | 高 | JWT + API Key認証、RBAC |
| データ漏洩 | 高 | HTTPS、暗号化保存、アクセス制御 |
| MITM攻撃 | 中 | TLS 1.3、証明書ピンニング |
| XSS攻撃 | 中 | CSP、入力サニタイゼーション |
| SQL Injection | 中 | Prisma ORM、パラメータ化クエリ |
| CSRF攻撃 | 低 | SameSite Cookie、CSRFトークン |
| DDoS攻撃 | 中 | Rate limiting、Cloudflare |

---

## 認証・認可

### 1. 管理者認証（JWT）

#### JWT構造

```typescript
interface JWTPayload {
  sub: string;        // User ID
  email: string;      // User email
  role: string;       // User role (admin)
  iat: number;        // Issued at
  exp: number;        // Expiration time
}
```

#### JWT生成・検証

```typescript
// src/auth/jwt.service.ts
import * as jwt from 'jsonwebtoken';

export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET!;
    this.expiresIn = process.env.JWT_EXPIRATION || '7d';

    // Secretの検証
    if (!this.secret || this.secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters');
    }
  }

  sign(payload: JWTPayload): string {
    return jwt.sign(payload, this.secret, {
      algorithm: 'HS256',
      expiresIn: this.expiresIn
    });
  }

  verify(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.secret) as JWTPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
```

#### パスワードハッシュ化

```typescript
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  // 最低8文字、大文字・小文字・数字を含む
  if (!isStrongPassword(password)) {
    throw new Error('Password does not meet security requirements');
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function isStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar
  );
}
```

### 2. API Key認証（VS Code拡張・MCPサーバー）

#### API Key生成

```typescript
import * as crypto from 'crypto';

export function generateApiKey(): string {
  const prefix = 'cli_';
  const random = crypto.randomBytes(16).toString('hex');
  const checksum = crypto.createHash('sha256')
    .update(random)
    .digest('hex')
    .substring(0, 8);

  return `${prefix}${random}_${checksum}`;
}

// 例: cli_mk8n3p12ab34cd56ef78_a302ae96
```

#### API Key検証

```typescript
// src/auth/api-key.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      return false;
    }

    // API Key形式の検証
    if (!apiKey.startsWith('cli_')) {
      return false;
    }

    // データベースで検証
    const user = await this.prisma.user.findUnique({
      where: { apiKey }
    });

    if (!user) {
      return false;
    }

    // requestにユーザー情報を付与
    request.user = user;
    return true;
  }
}
```

### 3. ロールベースアクセス制御（RBAC）

#### ロール定義

```typescript
enum UserRole {
  ADMIN = 'admin',      // 全権限
  VIEWER = 'viewer'     // 読み取りのみ（将来拡張用）
}

const PERMISSIONS = {
  [UserRole.ADMIN]: [
    'prompts:read',
    'prompts:create',
    'prompts:update',
    'prompts:delete',
    'users:read',
    'users:create',
    'sync:read',
    'sync:write'
  ],
  [UserRole.VIEWER]: [
    'prompts:read',
    'sync:read'
  ]
};
```

#### パーミッションガード

```typescript
// src/common/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler()
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    const userPermissions = PERMISSIONS[user.role] || [];

    return requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );
  }
}

// 使用例
@Controller('prompts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PromptsController {
  @Put(':id')
  @Permissions('prompts:update')
  async update(@Param('id') id: string, @Body() dto: UpdatePromptDto) {
    // ...
  }
}
```

---

## データ保護

### 1. データ暗号化

#### 転送時暗号化（TLS）

```typescript
// Cloud API (NestJS main.ts)
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV === 'production') {
    // TLS 1.3設定
    const httpsOptions = {
      key: fs.readFileSync(process.env.TLS_KEY_PATH!),
      cert: fs.readFileSync(process.env.TLS_CERT_PATH!),
      minVersion: 'TLSv1.3',
      ciphers: [
        'TLS_AES_128_GCM_SHA256',
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256'
      ].join(':')
    };

    await app.listen(3000, () => {
      console.log('HTTPS server running on port 3000');
    });
  } else {
    await app.listen(3000);
  }
}
```

#### 保存時暗号化（機密データ）

```typescript
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits

export class EncryptionService {
  private key: Buffer;

  constructor() {
    const keyHex = process.env.ENCRYPTION_KEY!;
    if (!keyHex || keyHex.length !== 64) {
      throw new Error('ENCRYPTION_KEY must be 64 hex characters (256 bits)');
    }
    this.key = Buffer.from(keyHex, 'hex');
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:ciphertext
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(ciphertext: string): string {
    const [ivHex, authTagHex, encrypted] = ciphertext.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

### 2. データアクセス制御

#### Row-Level Security（Prisma Middleware）

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    // RLS Middleware
    this.$use(async (params, next) => {
      const user = getCurrentUser(); // Request contextから取得

      if (!user) {
        throw new UnauthorizedException('No user in context');
      }

      // Promptへのアクセス制御
      if (params.model === 'Prompt') {
        // 読み取りは全ユーザーOK
        if (['findMany', 'findUnique', 'findFirst'].includes(params.action)) {
          params.args.where = {
            ...params.args.where,
            isActive: true
          };
        }

        // 更新・削除は管理者のみ
        if (['update', 'delete', 'create'].includes(params.action)) {
          if (user.role !== 'admin') {
            throw new ForbiddenException('Admin role required');
          }
        }
      }

      return next(params);
    });
  }
}
```

---

## 通信セキュリティ

### 1. HTTPS設定

#### Strict Transport Security

```typescript
// src/main.ts
import helmet from 'helmet';

app.use(helmet.hsts({
  maxAge: 31536000, // 1年
  includeSubDomains: true,
  preload: true
}));
```

### 2. CORS設定

```typescript
// src/main.ts
app.enableCors({
  origin: [
    'vscode-webview://*',
    process.env.ADMIN_UI_URL || 'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
  maxAge: 3600
});
```

### 3. Rate Limiting

```typescript
// src/main.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 最大100リクエスト
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// API Key認証エンドポイント用の厳しい制限
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 15分に5回まで
  skipSuccessfulRequests: true
});

app.use('/api/v1/auth/login', authLimiter);
```

---

## 脆弱性対策

### 1. XSS対策

#### Content Security Policy

```typescript
// VS Code Extension Webview
const csp = [
  "default-src 'none'",
  "img-src ${webview.cspSource} https:",
  "script-src ${webview.cspSource} 'nonce-${nonce}'",
  "style-src ${webview.cspSource} 'unsafe-inline'",
  "font-src ${webview.cspSource}"
].join('; ');

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AIAgentStudio-X</title>
</head>
<body>
  ...
</body>
</html>
`;
```

#### 入力サニタイゼーション

```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title']
  });
}

// Webview UI
const userInput = request.message;
const sanitized = sanitizeHtml(userInput);
element.innerHTML = sanitized;
```

### 2. SQL Injection対策

#### Prisma ORMの使用

```typescript
// ✅ 安全（Prisma使用）
const prompts = await prisma.prompt.findMany({
  where: {
    phase: userInput // 自動的にパラメータ化される
  }
});

// ❌ 危険（生SQL直接実行）
const prompts = await prisma.$queryRaw`
  SELECT * FROM prompts WHERE phase = ${userInput}
`; // 絶対に使用しない
```

#### 入力バリデーション

```typescript
import { z } from 'zod';

const PhaseSchema = z.enum(['phase0', 'phase1', 'phase2', 'phase3', 'phase4']);

function validatePhase(input: unknown): string {
  try {
    return PhaseSchema.parse(input);
  } catch (error) {
    throw new ValidationException('Invalid phase value');
  }
}
```

### 3. CSRF対策

#### SameSite Cookie

```typescript
// src/auth/auth.controller.ts
@Post('login')
async login(@Body() dto: LoginDto, @Res() response: Response) {
  const { accessToken, refreshToken } = await this.authService.login(dto);

  // Refresh tokenはHttpOnly cookieに保存
  response.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7日
  });

  return response.json({ accessToken });
}
```

### 4. Path Traversal対策

```typescript
import * as path from 'path';

export function sanitizePath(userPath: string, baseDir: string): string {
  // 絶対パスに変換
  const absolute = path.resolve(baseDir, userPath);

  // ベースディレクトリ外へのアクセスを防ぐ
  if (!absolute.startsWith(path.resolve(baseDir))) {
    throw new SecurityException('Path traversal detected');
  }

  return absolute;
}

// 使用例
const baseMockupDir = path.join(workspaceRoot, 'mockup');
const requestedFile = req.params.file;
const safePath = sanitizePath(requestedFile, baseMockupDir);
```

---

## 監査・ログ

### 1. 監査ログ記録

```typescript
// src/common/interceptors/audit.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const url = request.url;

    // 監査対象のアクション
    const auditActions = ['POST', 'PUT', 'DELETE'];

    if (!auditActions.includes(method)) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (response) => {
        const duration = Date.now() - startTime;

        await this.prisma.activityLog.create({
          data: {
            action: `${method} ${url}`,
            actor: user?.email || 'anonymous',
            resourceType: this.extractResourceType(url),
            resourceId: this.extractResourceId(url, response),
            details: {
              method,
              url,
              duration,
              statusCode: 200,
              requestBody: this.sanitizeRequestBody(request.body),
              responseBody: this.sanitizeResponseBody(response)
            },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent']
          }
        });
      })
    );
  }

  private extractResourceType(url: string): string | null {
    const match = url.match(/\/api\/v1\/(\w+)/);
    return match ? match[1] : null;
  }

  private extractResourceId(url: string, response: any): string | null {
    // URLまたはレスポンスからリソースIDを抽出
    const urlMatch = url.match(/\/([0-9a-f-]{36})\/?$/i);
    if (urlMatch) return urlMatch[1];

    return response?.id || null;
  }

  private sanitizeRequestBody(body: any): any {
    // パスワードなどの機密情報を除外
    const sanitized = { ...body };
    delete sanitized.password;
    delete sanitized.passwordHash;
    return sanitized;
  }

  private sanitizeResponseBody(body: any): any {
    // レスポンスから機密情報を除外
    const sanitized = { ...body };
    delete sanitized.passwordHash;
    delete sanitized.apiKey;
    return sanitized;
  }
}
```

### 2. セキュリティイベントログ

```typescript
enum SecurityEventType {
  LOGIN_SUCCESS = 'auth.login.success',
  LOGIN_FAILURE = 'auth.login.failure',
  LOGOUT = 'auth.logout',
  TOKEN_REFRESH = 'auth.token.refresh',
  API_KEY_CREATED = 'apikey.created',
  API_KEY_REVOKED = 'apikey.revoked',
  PERMISSION_DENIED = 'permission.denied',
  RATE_LIMIT_EXCEEDED = 'ratelimit.exceeded'
}

export class SecurityLogger {
  async logSecurityEvent(
    eventType: SecurityEventType,
    details: {
      userId?: string;
      email?: string;
      ipAddress?: string;
      userAgent?: string;
      success: boolean;
      metadata?: any;
    }
  ): Promise<void> {
    await prisma.activityLog.create({
      data: {
        action: eventType,
        actor: details.email || 'anonymous',
        resourceType: 'security',
        details: {
          success: details.success,
          ...details.metadata
        },
        ipAddress: details.ipAddress,
        userAgent: details.userAgent
      }
    });

    // 失敗イベントの場合、アラート送信
    if (!details.success) {
      await this.sendSecurityAlert(eventType, details);
    }
  }

  private async sendSecurityAlert(
    eventType: SecurityEventType,
    details: any
  ): Promise<void> {
    // Slack/Email等への通知
    // 実装省略
  }
}
```

---

## インシデント対応

### 1. インシデント対応フロー

```
1. 検知 → 2. 初動対応 → 3. 原因調査 → 4. 復旧 → 5. 事後分析
```

### 2. セキュリティインシデント分類

| レベル | 説明 | 対応時間 | 対応者 |
|--------|------|---------|--------|
| Critical | データ漏洩、システム侵害 | 即時 | CTO + セキュリティチーム |
| High | 認証バイパス、権限昇格 | 1時間以内 | セキュリティチーム |
| Medium | XSS、CSRF成功 | 4時間以内 | 開発チーム |
| Low | ログイン試行失敗 | 24時間以内 | 開発チーム |

### 3. 緊急対応手順

```typescript
// 緊急時のAPI Key無効化
export async function revokeAllApiKeys(): Promise<void> {
  await prisma.user.updateMany({
    data: {
      apiKey: null
    }
  });

  logger.critical('All API keys have been revoked');
}

// 緊急時のセッション無効化
export async function revokeAllSessions(): Promise<void> {
  await prisma.session.deleteMany({});

  logger.critical('All sessions have been revoked');
}
```

---

## セキュリティチェックリスト

### 開発時チェックリスト

- [ ] すべての入力値をバリデーション
- [ ] パスワードは必ずハッシュ化
- [ ] APIキーは環境変数から読み込み
- [ ] CSPヘッダーを設定
- [ ] Rate limitingを実装
- [ ] HTTPS通信を強制
- [ ] 機密データはログ出力しない
- [ ] エラーメッセージに機密情報を含めない

### デプロイ前チェックリスト

- [ ] 環境変数に本番用の値を設定
- [ ] TLS証明書の有効期限を確認
- [ ] 不要なデバッグログを無効化
- [ ] セキュリティヘッダーを確認
- [ ] 依存パッケージの脆弱性スキャン
- [ ] 監査ログが正常に記録されることを確認

---

**関連ドキュメント**:
- `architecture.md` - システムアーキテクチャ
- `api-specification.yml` - API仕様
- `error-handling.md` - エラーハンドリング戦略
