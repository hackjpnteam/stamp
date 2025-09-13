# Vercel本番環境デプロイ設定

## 必要な環境変数（Vercelダッシュボードで設定）

### 1. NEXTAUTH_URL（オプション - 自動設定可能）
```
# Vercelは自動的にVERCEL_URLを提供するため、明示的な設定は不要
# カスタムドメインを使用する場合のみ設定:
NEXTAUTH_URL=https://your-custom-domain.com
```

### 2. NEXTAUTH_SECRET
```
NEXTAUTH_SECRET=your_strong_random_secret_32_chars_or_more
```

### 3. MongoDB接続
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### 4. LINE OAuth設定
```
LINE_CLIENT_ID=your_line_channel_id
LINE_CLIENT_SECRET=your_line_channel_secret
```

## LINE Developer Console設定

### Callback URL設定
LINE Developer Consoleで以下のCallback URLを設定：
```
https://your-app-name.vercel.app/api/auth/callback/line
```

### Channel設定
- Channel Type: LINE Login
- App Type: Web app

## デプロイ後の確認事項

1. ✅ 環境変数がすべて設定されている
2. ✅ LINE OAuth Callback URLが正しい
3. ✅ MongoDB Atlasのネットワークアクセスが0.0.0.0/0（全て許可）
4. ✅ アプリケーションURLでアクセス可能

## トラブルシューティング

### ログインできない場合
1. Vercelの環境変数を再確認
2. LINE Developer ConsoleのCallback URL確認
3. ブラウザのデベロッパーツールでエラー確認
4. Vercelのfunction logsでエラー確認

### 署名検証エラー
- NEXTAUTH_SECREが正しく設定されているか確認
- 32文字以上のランダム文字列を使用

### MongoDB接続エラー
- MONGODB_URIが正しいか確認
- MongoDB AtlasのIP許可設定確認