# Coden

React / TypeScript を「読める」から「自分で書ける」へ進める学習アプリです。

## App

https://coden-lpf.vercel.app/

## About

Coden は、段階的な学習・復習・実装演習を通じて、React / TypeScript 初学者が実装力を育てるためのアプリです。

Read / Practice / Test / Challenge の4段階で学び、間違えた内容は復習キューや Daily Challenge に戻ってきます。

## Features

- Dashboard: 今やるべき学習や復習が分かるホーム画面
- Learning Flow: Read / Practice / Test / Challenge の4段階で進む学習体験
- Review Queue: 間違えた内容をあとから学び直せる復習機能
- Daily Challenge: 毎日取り組める弱点ベースのチャレンジ問題
- Code Reading: コードを読み解く力を育てる練習
- Code Doctor: バグのあるコードを診断して直す練習
- Mini Projects: 小さなアプリを作りながら学ぶ実践課題
- Base Nook: JavaScript / React / Web の基礎を確認できる補習コンテンツ
- Post: リリース情報や運営からのお知らせを受け取るアプリ内通知
- Admin Dashboard: 学習状況や教材の改善ポイントを確認できる管理画面

## Learning Flow

| モード | 内容 |
|--------|------|
| Read | 解説を読んで概念を理解する |
| Practice | 手を動かして知識を定着させる |
| Test | 理解度を確認する |
| Challenge | 応用課題で実装力を試す |

## Contents

- React 基礎 / 応用 / 実践: hooks、フォーム、API、テストなどを段階的に学ぶ
- API 連携実践: GET / POST / PATCH / DELETE とエラー・ローディング処理を学ぶ
- TypeScript 基礎: 型、関数、オブジェクト、Generics などの基本を学ぶ
- TypeScript x React: props、state、hooks、イベントの型付けを学ぶ
- React モダン: Error Boundary、Suspense、useOptimistic などを学ぶ
- 実務パターン: フォーム、ページネーション、認証フローなどを学ぶ
- Practice Modes: Daily Challenge / Code Reading / Code Doctor / Mini Projects
- Base Nook: つまずいたときに戻れる基礎解説とクイズ

## Tech Stack

| カテゴリ | 技術 |
|----------|------|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Backend | Supabase Auth / PostgreSQL / RLS |
| Editor | Monaco Editor |
| Test | Vitest, Testing Library, Playwright |
| Deploy | Vercel |

## Quality

Coden v1.0 では、以下の確認を実施しています。

- TypeScript typecheck
- ESLint
- Unit / integration test
- Production build
- Playwright E2E
- Supabase SQL / RLS

## Development

このリポジトリは npm workspaces の monorepo です。

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run e2e
```

Supabase SQL の適用手順や運用メモは `docs/supabase-ops.md` を参照してください。

## Release

Coden v1.0 released.

## License

Private
