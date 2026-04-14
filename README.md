# my-touring-links

My Touring Links

## Environmet

`.env.example` ファイルをコピーしてい  `.env.local` ファイルを作成します

設定したあとで `npm run build` しておくこと。

## Developing

Once you've created a project and installed dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

### Firesore Emulator を起動

```
npm run firestore
```

Firestore Emulator の起動に JDK 21+ が必要になるので、OpenJDK とかインストールしておくこと

## デプロイ

### 事前準備

[ソースコードからのデプロイ](https://cloud.google.com/run/docs/deploying-source-code?hl=ja)

### 環境変数

`.env` ファイルを生成する

```ini
PUBLIC_GMAP_API_KEY= "Google Map のAPIキーを指定する"
GOOGLE_CLIENT_ID="OAuth 2.0 クライアントのクライアントIDを指定する"
GOOGLE_CLIENT_SECRET="OAuth 2.0 クライアントのクライアントシークレットを指定する"
AUTH_SECRET="Auth.js用のシークレット値を指定する。参考: https://authjs.dev/reference/core/errors#missingsecret"
AUTH_TRUST_HOST="true"
DATASTORE_PROJECT_ID="Google CloudのプロジェクトIDを指定する"
```

### コマンド

```
gcloud run deploy my-touring-links --source . \
--project my-touring-links-app \
--allow-unauthenticated \
--region asia-northeast1 \
--timeout 3600 \
--max-instances 5
```
