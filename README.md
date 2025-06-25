# my-touring-links

My Touring Links

## Environmet

`.env.local` ファイルを作成して Google Maps Platform APIs の API キーを設定します

```
PUBLIC_GMAP_API_KEY=0987654321
```

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
