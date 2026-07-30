# ManabiNote

幼児向けのひらがな知育アプリです。表示されたひらがなに合う絵を3つの選択肢から選び、全5問の結果を端末内に記録します。

## 技術構成

- フロントエンド: React + TypeScript + Vite
- 問題データ: JSON（`src/features/question-types/kana-to-picture/data/`）
- 履歴保存: ブラウザの `localStorage`
- オフライン: PWA / Service Worker
- 公開先: Cloudflare Pages
- ソース管理: GitHub

問題形式ごとの実装は `src/features/question-types/<形式名>/` に分離しています。問題形式が増えた場合も、既存形式のデータ・表示・バリデーションと混ざらない構成です。

## 開発

Node.js LTS と npm を使用します。

```bash
npm install
npm run dev
```

主な確認コマンド:

```bash
npm run test
npm run test:coverage
npm run typecheck
npm run build
```

カバレッジの Statements / Branches / Functions / Lines は、それぞれ80%以上をCIで必須にしています。

## Cloudflare Pages

GitHubリポジトリをCloudflare Pagesに接続し、次の設定でデプロイします。

- Build command: `npm run build`
- Build output directory: `dist`
- Framework preset: Vite（利用する場合）
- Environment variables: 不要

PWAのService Workerと問題画像はビルド成果物に含まれます。独自ドメインは使用しません。

## 運用方針

このMVPでは、ログイン、バックエンド、データベース、外部AI APIを使用しません。履歴は利用端末のブラウザ内だけに保存され、別端末とは共有されません。音声問題は将来対応として、問題データの `audioSrc` 拡張余地だけを確保しています。
