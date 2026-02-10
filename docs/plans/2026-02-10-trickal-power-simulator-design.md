# トリッカル戦闘力シミュレータ - 設計ドキュメント

**作成日**: 2026-02-10
**ステータス**: 承認済み

## 1. システム概要

### 目的
トリッカルの戦闘力シミュレータ。ユーザーが複数の育成プランを作成し、それぞれのリソース消費量（コイン、マシュマロ、くれよん）と戦闘力の変化を比較できるツール。

### 主要機能
- **リソース配分最適化**: 限られたリソースをどのキャラに使うべきかを計画（Phase 1優先）
- **複数プラン比較**: 異なる育成シナリオを並べて比較
- **戦闘力シミュレーション**: 育成後の戦闘力を予測

### 技術スタック
- **フロントエンド**: Next.js 15 (App Router) + React + TypeScript
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL
- **ORM**: Prisma
- **認証**: NextAuth.js (Discord OAuth)
- **UI**: TanStack Table (スプレッドシート風テーブル)
- **デプロイ**: セルフホスト (Docker Compose)

## 2. アーキテクチャ

```
[ブラウザ]
    ↓
[Next.js App]
    ├─ Pages (SSR/CSR)
    ├─ API Routes
    │   ├─ /api/auth/* (NextAuth)
    │   ├─ /api/characters/* (マスターデータ)
    │   ├─ /api/plans/* (育成プラン)
    │   ├─ /api/user/resources (リソース管理)
    │   └─ /api/simulation/* (戦闘力計算)
    └─ Prisma ORM
         ↓
    [PostgreSQL]
```

## 3. データベーススキーマ

### User（ユーザー）
```prisma
model User {
  id            String          @id @default(cuid())
  email         String          @unique
  name          String?
  image         String?
  createdAt     DateTime        @default(now())
  plans         Plan[]
  resources     UserResource?
}
```

### UserResource（ユーザーの所持リソース）
```prisma
model UserResource {
  id                      String    @id @default(cuid())
  userId                  String    @unique

  // コイン
  coin                    Int       @default(0)

  // マシュマロ（9種類: Guard/Attack/Support × Low/Mid/High）
  marshmallowGuardLow     Int       @default(0)
  marshmallowGuardMid     Int       @default(0)
  marshmallowGuardHigh    Int       @default(0)
  marshmallowAttackLow    Int       @default(0)
  marshmallowAttackMid    Int       @default(0)
  marshmallowAttackHigh   Int       @default(0)
  marshmallowSupportLow   Int       @default(0)
  marshmallowSupportMid   Int       @default(0)
  marshmallowSupportHigh  Int       @default(0)

  // くれよん
  purpleCrayon            Int       @default(0)  // 上級くれよん
  goldCrayon              Int       @default(0)  // 特級くれよん

  updatedAt               DateTime  @updatedAt
  user                    User      @relation(fields: [userId], references: [id])
}
```

**注意**: 使徒証は各キャラ専用で管理が複雑なため、シミュレータでは扱わない。

### BoardTemplate（ボードテンプレート）
```prisma
model BoardTemplate {
  id            String       @id @default(cuid())
  raceType      String       @unique  // "精霊TypeC", "獣人TypeB", etc.
  race          String       // "精霊", "獣人", etc.
  boardType     String       // "HP+攻撃", "会心+HP", "攻撃+防御", "抵抗+会心", "防御+抵抗"

  goldNodes     Json         // 特級マス（金マス）の構成
  // 例: {
  //   "board1": ["全体攻撃", "全体HP"],
  //   "board2": ["全体攻撃", "全体防御", "全体会心抵抗"],
  //   "board3": ["全体攻撃", "全体会心", "全体防御", "全体会心抵抗"]
  // }

  purpleNodes   Json?        // 上級マス（紫マス）の構成（後で追加）

  characters    Character[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}
```

**ボードシステムの理解**:
- raceType（例: 精霊TypeC）ごとにボード配置が統一
- 各ボードに特級マス（金マス）が配置: Board1=2個, Board2=3個, Board3=4個
- 金マス: 全使徒に効果、特級くれよん使用
- 紫マス: 全使徒に効果、上級くれよん使用
- 白マス: そのキャラのみに効果

### Character（キャラクターマスターデータ）
```prisma
model Character {
  id                String          @id @default(cuid())
  gameId            String          @unique
  name              String
  role              String          // Guard/Attacker/Supporter
  personality       String          // 純粋、冷静、狂気、活発、憂鬱
  race              String          // 妖精、獣人、エルフ、精霊、幽霊、竜族、魔女、???
  raceType          String          // "精霊TypeC"など

  boardTemplateId   String
  boardTemplate     BoardTemplate   @relation(fields: [boardTemplateId], references: [id])

  // 基礎ステータス
  baseHp            Int?
  basePhysAtk       Int?
  baseMagicAtk      Int?
  basePhysDef       Int?
  baseMagicDef      Int?

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
}
```

### Plan（育成プラン）
```prisma
model Plan {
  id            String          @id @default(cuid())
  userId        String
  name          String          // "プランA：火力特化"
  description   String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  user          User            @relation(fields: [userId], references: [id])
  characters    PlanCharacter[]
}
```

### PlanCharacter（プラン内のキャラクター育成状況）
```prisma
model PlanCharacter {
  id                    String    @id @default(cuid())
  planId                String
  characterId           String

  // レベル・ランク・スキル・星
  currentLevel          Int       @default(1)
  targetLevel           Int
  currentEquipRank      Int       @default(1)
  targetEquipRank       Int
  currentSkillLevel     Int       @default(1)
  targetSkillLevel      Int
  currentStar           Int
  targetStar            Int

  // 特級マス（金マス）の進捗
  currentGoldProgress   Json
  targetGoldProgress    Json
  // 例: {"board1": {"全体攻撃": 2, "全体HP": 1}, "board2": {...}, "board3": {...}}

  // 上級マス（紫マス）の進捗
  currentPurpleProgress Json?
  targetPurpleProgress  Json?

  plan                  Plan      @relation(fields: [planId], references: [id])
}
```

## 4. 認証

### NextAuth.js (Discord OAuth)
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { PrismaAdapter } from "@next-auth/prisma-adapter"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
}
```

### 必要な環境変数
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

### 初回ログイン時の処理
1. ユーザーがDiscordでログイン
2. UserResourceを自動作成（所持リソース初期値：0）
3. ダッシュボードにリダイレクト

## 5. API設計

### キャラクターマスターデータ
```
GET  /api/characters              # 全キャラクター一覧取得
GET  /api/characters/:id          # 特定キャラ詳細取得
POST /api/characters              # キャラ追加（管理者用）
```

### ユーザーリソース管理
```
GET  /api/user/resources          # 自分の所持リソース取得
PUT  /api/user/resources          # リソース更新
```

### 育成プラン管理
```
GET  /api/plans                   # 自分の全プラン取得
POST /api/plans                   # 新規プラン作成
GET  /api/plans/:id               # 特定プラン詳細取得
PUT  /api/plans/:id               # プラン更新（名前・説明）
DELETE /api/plans/:id             # プラン削除
POST /api/plans/:id/duplicate     # プラン複製

# プラン内のキャラクター管理
POST /api/plans/:id/characters                # プランにキャラ追加
PUT  /api/plans/:id/characters/:charId        # キャラ育成計画更新
DELETE /api/plans/:id/characters/:charId      # プランからキャラ削除
```

### 戦闘力計算・シミュレーション
```
POST /api/simulation/calculate    # 戦闘力計算
  Body: { planId, characterUpdates }
  Response: {
    totalPower: number,
    resourceCosts: {...},
    characterPowers: [{charId, currentPower, targetPower}]
  }

GET /api/simulation/compare       # 複数プラン比較
  Query: planIds[]
  Response: {
    plans: [{id, name, totalPower, resourceCosts}]
  }
```

**認証**: すべてのAPIは認証必須（NextAuth session check）

## 6. UI/UX設計

### メイン画面構成（スプレッドシート方式）

**1. ヘッダー**
- ログインユーザー情報
- 所持リソース表示
  - コイン
  - マシュマロ（Guard/Attack/Support × 下級/中級/上級）= 9種類
  - 紫くれよん、金くれよん

**2. プラン管理エリア**
- プラン選択ドロップダウン
- 「新規プラン作成」ボタン
- 「プラン削除」「プラン複製」ボタン

**3. キャラクター一覧テーブル（TanStack Table使用）**
- カラム: キャラ名、現在Lv、目標Lv、現在装備ランク、目標装備ランク、現在スキル、目標スキル、現在星、目標星、ボード進捗...
- セルをクリックで編集可能
- 「キャラ追加」ボタンでプランにキャラを追加

**4. リソース消費サマリー（画面下部）**
- 必要なマシュマロ、くれよん の合計
- 所持リソースとの差分表示（足りない場合は赤字）
- 合計戦闘力の変化（現在 → 目標）

## 7. 戦闘力計算ロジック

### ステータス計算の基本式（wikiより）
```
最終ステータス = (基礎値 + 装備値 + ボード値 + ランク全体効果) × (金くれよん効果)
```

### 計算の流れ
1. **基礎ステータス計算**: レベル・星による成長
2. **装備ランク効果**: 全使徒に影響（約1.43倍/ランク、乗算）
3. **ボード効果**:
   - 白マス: 該当キャラのみ
   - 紫マス: 全使徒に加算
   - 金マス: 全使徒にパーセンテージ（3-5%）
4. **スキルレベル**: スキル倍率の向上

### 戦闘力換算（簡易計算式）
```typescript
power = HP * 0.5 +
        (physAtk + magicAtk) * 10 +
        (physDef + magicDef) * 5 +
        critRate * 100 +
        critDmg * 50
```

**実装方針**:
- 初期は簡易計算式で実装
- ゲーム内の正確な計算式が判明したら更新
- 相対的な比較ができれば十分

**計算で考慮する要素**:
- ✅ レベル、装備ランク、スキルレベル、星、ボード（金マス）
- ⚠️ 性格シナジー、種族シナジーは後回し（複雑）

## 8. データ投入とバッチ処理

### 初期データ投入（手動）

**1. キャラクターマスターデータ作成**
- `trickal_board.csv` から BoardTemplate と Character データを生成
- スクリプト: `scripts/seed-characters.ts`

```bash
npm run seed:characters   # CSVを読み込んでDB投入
```

**2. データ構造**
- BoardTemplate: raceType別に約25種類
- Character: 主要キャラ10-20体からスタート、段階的に全キャラ追加

### 定期バッチ（将来実装）

**1. cron設定（セルフホスト環境）**
```bash
# 毎日深夜2時にwikiチェック
0 2 * * * /app/scripts/update-characters.sh
```

**2. 更新スクリプト**
- wikiwikiの更新日時をチェック
- 変更があれば新規キャラ・更新キャラをDB反映
- 差分のみ更新（全件洗い替えしない）

**初期段階の方針**: バッチ自動化は後回し（YAGNI）

## 9. デプロイメント（セルフホスト）

### Docker Compose構成

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: trickal
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: trickal_simulator
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  app:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://trickal:${DB_PASSWORD}@db:5432/trickal_simulator
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      DISCORD_CLIENT_ID: ${DISCORD_CLIENT_ID}
      DISCORD_CLIENT_SECRET: ${DISCORD_CLIENT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - db
    restart: unless-stopped

volumes:
  postgres_data:
```

### デプロイ手順
1. `.env`ファイル設定
2. `docker-compose up -d`
3. マイグレーション実行: `docker-compose exec app npx prisma migrate deploy`
4. 初期データ投入: `docker-compose exec app npm run seed:characters`

### リバースプロキシ（オプション）
- Nginx or Caddy でHTTPS化
- Let's Encrypt で証明書取得

## 10. 開発の優先順位とフェーズ

### Phase 1: MVP（最小限の動作確認）
1. プロジェクトセットアップ（Next.js + Prisma + PostgreSQL）
2. 認証実装（Discord OAuth）
3. DBスキーマ作成・マイグレーション
4. 初期データ投入（10-20キャラ）
5. キャラクター一覧表示
6. 基本的なプラン作成・表示

### Phase 2: コア機能実装
1. スプレッドシートUIの実装（TanStack Table）
2. キャラクター育成計画の編集機能
3. リソース管理（所持リソース入力・表示）
4. 簡易戦闘力計算ロジック
5. リソース消費量の計算・表示

### Phase 3: 比較機能
1. 複数プラン保存・切り替え
2. プラン比較ビュー（並べて表示）
3. プラン複製機能

### Phase 4: 拡張機能（後回し）
- 自動最適化（AI提案）
- 性格・種族シナジー考慮
- 戦闘力計算の精度向上
- キャラデータ自動更新バッチ
- エクスポート機能（PDF/画像）

## 11. 技術的な決定事項と理由

### 採用したもの
- **Next.js統合構成**: シンプル、開発速度優先（vs Golang API分離）
- **Discord OAuth のみ**: シンプル、ゲームコミュニティとの親和性
- **使徒証を管理しない**: 各キャラ専用で管理が複雑すぎる

### 不採用としたもの
- **OpenTelemetry**: モノリシック構成では恩恵が限定的（マイクロサービスなら有益）
- **自動スクレイピング**: robots.txt制約、初期は手動でリスク回避

## 12. 参考資料

- [トリッカル Wiki](https://wikiwiki.jp/thetrickal/)
- [キャラクター育成](https://wikiwiki.jp/thetrickal/%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E8%82%B2%E6%88%90)
- [戦闘システム](https://wikiwiki.jp/thetrickal/%E6%88%A6%E9%97%98%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0)
- [ボード（クレヨン）](https://wikiwiki.jp/thetrickal/%E3%83%9C%E3%83%BC%E3%83%89%EF%BC%88%E3%82%AF%E3%83%AC%E3%83%A8%E3%83%B3%EF%BC%89)
- [Loot and Waifus - Boards Guide](https://lootandwaifus.com/guides/boards-tips-tricks-trickcal-revive/)

---

**設計承認日**: 2026-02-10
**次のステップ**: 実装計画の作成 → Phase 1 実装開始
