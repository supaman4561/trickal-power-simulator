# トリッカル戦闘力シミュレータ

トリッカルの育成プランとリソース配分を最適化するWebアプリケーション。

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router), React, TypeScript, TailwindCSS
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL + Prisma ORM
- **認証**: NextAuth.js (Discord OAuth)

## 開発環境のセットアップ

### 必要なもの

- Node.js 20+
- Docker & Docker Compose
- Discord Application (OAuth)

### 手順

1. **依存関係のインストール**

```bash
npm install
```

2. **PostgreSQLの起動**

```bash
docker compose up -d
```

3. **環境変数の設定**

`.env`ファイルを作成:

```bash
cp .env.example .env
```

Discord Developer Portal (https://discord.com/developers/applications) でアプリケーションを作成し、Client IDとSecretを`.env`に設定。

4. **データベースマイグレーション**

```bash
npx prisma migrate dev
```

5. **初期データの投入**

```bash
npm run seed
```

6. **開発サーバーの起動**

```bash
npm run dev
```

http://localhost:3000 でアクセス可能。

## API エンドポイント

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/characters | 全キャラクター一覧取得 | No |
| GET | /api/user/resources | 所持リソース取得 | Yes |
| PUT | /api/user/resources | リソース更新 | Yes |

## データベース管理

Prisma Studioでデータを確認:

```bash
npx prisma studio
```
