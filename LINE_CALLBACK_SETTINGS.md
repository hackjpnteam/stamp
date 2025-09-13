# LINE Developer Console Callback URL設定

## 重要：以下のURLを全て登録してください

LINE Developer Console → Channel設定 → LINE Login設定 → Callback URL

以下の3つのURLをすべて追加してください：

1. **本番URL（メイン）**
```
https://stamp-omega.vercel.app/api/auth/callback/line
```

2. **本番URL（代替）**
```
https://stamp-omega.vercel.app/api/auth/callback/line/
```
（末尾にスラッシュあり）

3. **ローカル開発用**
```
http://localhost:3001/api/auth/callback/line
```

## 設定手順：

1. [LINE Developer Console](https://developers.line.biz/console/)にログイン
2. Channel ID: `2008102833` を選択
3. 「LINE Login設定」タブをクリック
4. 「Callback URL」セクションで「+ Add」をクリック
5. 上記の3つのURLを1つずつ追加
6. 「Update」ボタンをクリックして保存

## 確認項目：

- [ ] 3つのCallback URLがすべて登録されている
- [ ] Channel statusが「Published」になっている
- [ ] Channel IDが `2008102833` で正しい
- [ ] Channel secretが正しく設定されている

## トラブルシューティング：

もしログイン後にエラーが表示される場合：
1. ブラウザのデベロッパーツール（F12）を開く
2. Consoleタブでエラーメッセージを確認
3. NetworkタブでCallbackリクエストの状態を確認