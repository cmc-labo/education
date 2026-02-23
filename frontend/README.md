# Study Buddy AI - Frontend

数学・理科の問題を撮影してAIに解いてもらうアプリのフロントエンドです。

## 技術スタック

- Vite + React + TypeScript
- shadcn-ui
- Tailwind CSS

## 開発

```sh
npm install
npm run dev
```

開発時は `/api` へのリクエストが `http://localhost:8000` にプロキシされます（`vite.config.ts`）。

## ビルド

```sh
npm run build
```

ビルド成果物は `dist/` に出力されます。バックエンド（`../backend/`）が静的ファイルとして配信します。
