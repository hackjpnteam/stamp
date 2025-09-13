# ラジオ体操スタンプラリー Webアプリ

Next.js (App Router) + TypeScript + Tailwind CSS + NextAuth + MongoDB で構築されたラジオ体操スタンプラリー管理システムです。

## 機能

- 🔐 **LINE認証**: LINEアカウントでのソーシャルログイン
- 📱 **QRコードチェックイン**: 当日のQRコードで簡単出席記録
- 📅 **スタンプカード**: ビジュアルな出席状況表示
- 🎁 **景品申請システム**: 規定スタンプ数での景品交換
- 📊 **統計ダッシュボード**: 出席率・皆勤者数・ランキング表示
- 👨‍💼 **管理機能**: イベント・景品・申請の一元管理

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **認証**: NextAuth.js + LINE Provider
- **データベース**: MongoDB Atlas + Mongoose
- **QRコード**: qrcode
- **日付処理**: date-fns, date-fns-tz

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env` ファイルを作成し、以下の環境変数を設定してください：

```env
# MongoDB Atlas接続文字列
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# NextAuth設定
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000

# LINE Provider設定
LINE_CLIENT_ID=your-line-channel-id
LINE_CLIENT_SECRET=your-line-channel-secret

# QRコード署名用シークレット
QR_SECRET=your-qr-secret-key
```

### 3. データベースの初期化

シードスクリプトを実行して、初期データを投入します：

```bash
npm run seed
```

これにより以下が作成されます：
- 管理者ユーザー (admin@example.com)
- サンプルグループ「夏休みラジオ体操の会」
- 30日間のイベント
- 景品（参加賞、努力賞、皆勤賞）
- サンプルメンバー

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## LINE認証の設定

1. [LINE Developers Console](https://developers.line.biz/) でチャンネルを作成
2. 「LINE Login」を有効化
3. Callback URLに `http://localhost:3000/api/auth/callback/line` を追加（本番環境では適切なURLに変更）
4. Channel ID と Channel Secret を取得し、環境変数に設定

## デプロイ

### Vercel へのデプロイ

1. GitHubリポジトリをVercelに接続
2. 環境変数を設定：
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (本番URLに変更)
   - `LINE_CLIENT_ID`
   - `LINE_CLIENT_SECRET`
   - `QR_SECRET`
3. デプロイを実行

### MongoDB Atlas の設定

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) でクラスターを作成
2. ネットワークアクセスでVercelのIPアドレスを許可（または 0.0.0.0/0 for development）
3. データベースユーザーを作成
4. 接続文字列を取得して環境変数に設定

## 使用方法

### 一般ユーザー

1. トップページからLINEでログイン
2. ダッシュボードで自分のスタンプカードを確認
3. イベント会場でQRコードを読み取ってチェックイン
4. 規定数のスタンプが貯まったら景品申請

### 管理者

1. `/admin` にアクセス（要管理者権限）
2. イベントの作成・管理
3. 景品の設定
4. 申請の承認/却下
5. 統計情報の確認

## API エンドポイント

- `POST /api/auth/[...nextauth]` - 認証処理
- `GET/POST /api/events` - イベント一覧取得/作成
- `GET /api/events/[id]/qr` - QRコード生成
- `POST /api/checkin` - チェックイン処理
- `GET/POST /api/rewards` - 景品一覧取得/作成
- `GET/POST/PATCH /api/redemptions` - 申請管理
- `GET /api/stats` - 統計情報取得
- `GET /api/attendances` - 出席記録取得

## データモデル

- **User**: ユーザー情報（name, email, role, groups）
- **Group**: グループ情報（name, code, owner）
- **Event**: イベント情報（title, dates, time window）
- **Attendance**: 出席記録（user, event, date, method）
- **Reward**: 景品情報（name, requiredStamps, stock）
- **Redemption**: 景品申請（user, reward, status）
- **RuleConfig**: ルール設定（graceMinutes, badges）

## セキュリティ

- NextAuthによるセッション管理
- QRトークンのHMAC-SHA256署名検証
- ロールベースアクセス制御（member/admin/owner）
- 重複チェックイン防止（unique index）
- 時間帯制限（dailyWindow + graceMinutes）

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# リント実行
npm run lint

# シード実行
npm run seed
```

## トラブルシューティング

### LINEログインができない
- LINE Developer Consoleの設定を確認
- Callback URLが正しく設定されているか確認
- 環境変数が正しく設定されているか確認

### MongoDBに接続できない
- MongoDB Atlasのネットワークアクセス設定を確認
- 接続文字列のユーザー名/パスワードを確認
- データベース名が正しいか確認

### QRコードが読み取れない
- QR_SECRETが設定されているか確認
- 日付が正しいか確認（JST基準）
- 受付時間内かどうか確認

## ライセンス

MIT