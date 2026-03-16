# Roadmap09: 学習体験ブラッシュアップフェーズ

**作成日**: 2026-03-16
**参照元**: `docs/appreviews/uireview02.md`（UIレビュー 82/100点）
**目的**: 学習ページ（特に ReadMode）の体験品質を飛躍的に向上させ、「楽しく学べるアプリ」としての完成度を 82点 → 95点以上に引き上げる。

---

## 1. 位置づけ

Roadmap08 までで以下が完了済み。

| 区分 | 状況 |
|------|------|
| モバイルナビゲーション | ✅ ハンバーガーメニュー + ドロワー |
| 共通UIコンポーネント | ✅ Spinner / Button / ErrorBanner |
| デザイントークン統一 | ✅ フォーカスリング / ボタン色 / テキスト色 |
| SVGアイコン置換 | ✅ 全絵文字 → lucide-react |
| 認証ページ強化 | ✅ グラデーション背景 + カード化 |
| ステッパーUI | ✅ 学習モードフロー可視化 |
| ページタイトル | ✅ useDocumentTitle |
| コントラスト比修正 | ✅ WCAG AA 準拠 |
| プログレスバー aria | ✅ role + aria-value 属性 |
| 通知自動消去 | ✅ 5秒タイマー |

uireview02（2026-03-16、スコア 82/100）で以下が残存課題:

| カテゴリ | スコア | 主要原因 |
|---------|--------|---------|
| 学習体験・コンテンツ表現 | 72 | ReadMode が教科書的、コードブロック表示品質が低い |
| ユーザビリティ | 75 | モード切替フィードバック不足、達成感演出なし |
| タイポグラフィ・可読性 | 80 | Prism テーマ矛盾、monospace フォント未定義 |
| インタラクション | 78 | モード切替アニメーションなし、祝福演出なし |
| レスポンシブ | 78 | LearningSidebar モバイル問題 |

**重大な発見**: ReadMode で `prose prose-slate prose-lg` クラスを使用しているが、**`@tailwindcss/typography` プラグインが未インストール**。prose クラスが実質的に無効であり、マークダウンの見出し・リスト・段落のスタイルが Tailwind デフォルト（リセット済み）のままになっている可能性が高い。

---

## 2. このRoadmapのスコープ

### 2-1. 含めるもの

**コア改善（学習体験の質的向上）:**
- `@tailwindcss/typography` プラグインの導入と prose カスタマイズ
- Prism.js ダークテーマへの変更（ライト → ダーク背景整合）
- monospace フォントの定義（コードの可読性向上）
- ReadMode のタイポグラフィ・余白・インラインコード・コールアウト強化
- 学習モード別ヘッダーセクションの追加（各モードに個性を付与）
- 「Readを完了」ボタンの下部配置

**インタラクション・フィードバック強化:**
- モード切替時のフェードインアニメーション
- 正解/ステップ完了時の祝福マイクロアニメーション（CSS ベース）
- コピーボタンのインラインフィードバック改善
- Challenge 完了バナーへの自動スクロール

**モバイル・ナビゲーション改善:**
- LearningSidebar のモバイル折りたたみ
- StepPage 上部に全体進捗（Step N / 20）表示
- ステッパーのモバイル表示改善

**仕上げ:**
- DashboardSidebar ラベルサイズ修正
- favicon 設定

### 2-2. 含めないもの
- ダークモード対応 — 全画面への影響が大きいため別 roadmap
- スケルトンUI導入 — 各ページの構造理解が必要で工数M以上
- Practice の選択式変更 — コンテンツ構造の変更を伴い、全20ステップに影響
- OGP / meta タグ — デプロイ環境確定後
- ReadMode 目次（TOC）— M1 の余白・見出し強化で可読性を十分改善した後に検討
- Challenge 要件リアルタイムチェック — M2 以降の効果測定後に検討
- ステップ内進捗の localStorage 永続化 — データ設計の検討が必要

---

## 3. 実行方針

- 方針: **ReadMode コア体験 → インタラクション → モバイル・ナビ → 仕上げ** の順で進める
  - M1 で学習のコア体験（ReadMode の見た目と読みやすさ）を劇的に改善
  - M2 でモード切替・達成感の演出を追加し「楽しさ」を付与
  - M3 でモバイル体験とナビゲーションの改善
  - M4 で細部の仕上げ
- 完了定義:
  - 実装完了
  - `lint` / `typecheck` / `test` / `build` 通過
  - コミット完了
  - タスクPR作成・レビュー・マージ完了
  - マイルストーン最後のタスクは、同ターンでマイルストーンPRのマージ完了まで含む
- ルール:
  - Tailwind CSS v3 のみ使用（CSS Modules 禁止）
  - 新規パッケージの追加は最小限に留める（`@tailwindcss/typography` は必須）
  - 既存テストが壊れないことを各タスクで確認
  - アニメーションは CSS ベースを優先し、外部ライブラリは避ける

---

## 4. マイルストーン計画と進捗

### Milestone 1 (M1): ReadMode コア体験の改善
**目的**: 学習アプリの最も重要な画面である ReadMode のコンテンツ表示品質を飛躍的に向上させる。全ユーザーが必ず通過する画面であり、ここの印象がアプリ全体の評価を左右する。

- ~~**タスク1: @tailwindcss/typography 導入と prose カスタマイズ**~~ ✅ PR #110
  - [x] `@tailwindcss/typography` をインストール
  - [x] `tailwind.config.js` の `plugins` に追加
  - [x] prose のカスタマイズを `tailwind.config.js` の `extend.typography` に定義:
    - H2 に左ボーダー（`border-l-4 border-primary-mint pl-3`）+ 余白拡大（`mt-10 mb-4`）
    - H3 の余白調整
    - コードブロック前後の余白拡大（`my-6`）
    - `strong` タグに `text-primary-dark` アクセントカラー
    - リンク色を `text-primary-dark` に統一（hover時 `primary-mint`）
  - [x] ReadMode の既存 `prose prose-slate prose-lg` クラスが正しく機能することを確認
  - [x] テスト通過を確認

- ~~**タスク2: Prism.js ダークテーマ適用と monospace フォント定義**~~ ✅ PR #111
  - [x] `ReadMode.tsx` の Prism テーマを `prism.css`（ライト）→ `prism-okaidia.css`（ダーク）に変更
  - [x] `tailwind.config.js` の `fontFamily.mono` を定義: `['Fira Code', 'JetBrains Mono', 'Consolas', 'ui-monospace', 'SFMono-Regular', 'monospace']`
  - [x] 軽量化のためシステムフォントのみとした（Google Fonts 追加なし）
  - [x] ReadMode のコードブロック内に `font-mono` クラスを適用
  - [x] TestMode は既に `font-mono` 適用済み、ChallengeMode は Monaco Editor が独自フォント管理のため対象外
  - [x] テスト通過を確認（220テスト全通過）

- **タスク3: インラインコード・コールアウト・Read完了ボタン改善**
  - [ ] ReadMode のインラインコードスタイルを強化:
    - `bg-slate-200 px-1 py-0.5 text-sm text-slate-800` → `bg-primary-mint/10 px-1.5 py-0.5 text-sm font-semibold text-primary-dark font-mono rounded-md`
  - [ ] ReactMarkdown の `blockquote` コンポーネントをカスタマイズ:
    - ブロック引用を「ポイント」カード（`rounded-lg border-l-4 border-primary-mint bg-secondary-bg px-4 py-3`）に変換
    - アイコン（lucide-react の `Lightbulb` 等）を左に配置
  - [ ] 「Readを完了」ボタンを記事の下部にも配置（上部と下部の2箇所）
  - [ ] コピーボタンのフィードバックを改善:
    - `copyMessage` をコードブロック直下ではなく、ボタン自体のテキスト変化（「コピーしました ✓」→ 2秒後に「コードをコピー」に戻る）に変更
  - [ ] テスト通過を確認

---

### Milestone 2 (M2): インタラクション・フィードバック強化
**目的**: モード切替・正解・完了時のフィードバックを充実させ、「学びたい・続けたい」というモチベーションに繋がる体験を提供する。

- **タスク1: 学習モード別ヘッダーセクションと切替アニメーション**
  - [ ] 各学習モードの冒頭に個性あるヘッダーセクションを追加:
    - Read: `BookOpen` アイコン + 「読んで理解しよう」+ 薄い mint 背景バンド
    - Practice: `PenLine` アイコン + 「問題に答えよう」+ 薄い amber 背景バンド
    - Test: `Code2` アイコン + 「コードを完成させよう」+ 薄い sky 背景バンド
    - Challenge: `Trophy` アイコン + 「チャレンジに挑戦しよう」+ 薄い violet 背景バンド
  - [ ] `globals.css` に `@keyframes fadeIn` を定義:
    ```css
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn { animation: fadeIn 300ms ease-out; }
    ```
  - [ ] 各モードコンポーネントのルート要素に `animate-fadeIn` を適用
  - [ ] テスト通過を確認

- **タスク2: 正解・完了時の祝福演出**
  - [ ] `globals.css` に祝福用 CSS アニメーションを追加:
    ```css
    @keyframes bounceIn {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-bounceIn { animation: bounceIn 500ms ease-out; }
    ```
  - [ ] Practice/Test/Challenge の正解結果テキストに `animate-bounceIn` を適用
  - [ ] StepPage の Challenge 完了バナーに `scrollIntoView({ behavior: 'smooth' })` を追加
  - [ ] ステッパーの完了ステップ変化時にアクセントカラーのパルスエフェクトを追加:
    - `@keyframes pulse-mint`: ステッパーの丸が一瞬拡大して mint 色にフラッシュ
  - [ ] テスト通過を確認

---

### Milestone 3 (M3): モバイル・ナビゲーション改善
**目的**: モバイルでの学習体験を改善し、ステップ全体の中での現在位置をユーザーに明示する。

- **タスク1: LearningSidebar のモバイル折りたたみ**
  - [ ] `LearningSidebar.tsx` をモバイル（`lg:` 未満）でデフォルト折りたたみに変更
  - [ ] 「コース一覧を見る ▼」トグルボタンを追加（`lg:` 未満で表示）
  - [ ] 折りたたみ時のアニメーション（`max-height` トランジション or `details/summary`）
  - [ ] `lg:` 以上では従来通りサイドバー表示（変更なし）
  - [ ] テスト通過を確認

- **タスク2: StepPage ナビゲーション強化**
  - [ ] StepPage 上部のヘッダーセクションに全体進捗を追加:
    - `Step {step.order} / {TOTAL_STEP_COUNT}` の表示
    - コース名（「React基礎」等）の表示
  - [ ] ステッパーのモバイル表示改善:
    - 番号の `text-[10px]` → `text-xs` に拡大
    - ステッパーボタンのタッチターゲットを拡大（最小 44x44px）
  - [ ] 「ダッシュボードへ戻る」リンクをページ上部に移動（パンくずリスト形式）
  - [ ] テスト通過を確認

---

### Milestone 4 (M4): 仕上げ
**目的**: 細部の品質向上とプロダクション品質の最終調整。

- **タスク1: 細部の品質改善**
  - [ ] DashboardSidebar のラベル `text-[10px]` → `text-xs` に拡大（WCAG 推奨サイズ準拠）
  - [ ] favicon の設定（`coden_logo.png` から favicon を生成し `index.html` に設定）
  - [ ] ReadMode の prose 内リンク色をブランドカラーに統一（`prose-a:text-primary-dark`）
  - [ ] テスト・ビルド通過を確認

---

## 5. 優先度マトリクス

| マイルストーン | 種別 | 優先度 | 判断根拠 |
|--------------|------|--------|---------|
| **M1: ReadMode コア体験** | UI改善 | ★★★ 最優先 | 全ユーザーが通る画面。typography プラグイン未導入の発見により、現状の表示品質が想定以下。P1-1（テーマ変更: XS）だけで劇的改善 |
| **M2: インタラクション強化** | UX改善 | ★★★ 高 | 「楽しさ」の付与。学習アプリとして達成感の演出は必須 |
| **M3: モバイル・ナビ** | UI改善 | ★★☆ 中高 | LearningSidebar のモバイル問題は継続課題。進捗表示は UX 改善効果が高い |
| **M4: 仕上げ** | 品質向上 | ★★☆ 中 | 細部だがプロダクション品質の底上げ |

---

## 6. ブランチ戦略

既存 roadmap と同様に、マイルストーンブランチ + タスクブランチの2層で運用する。

| 対象 | ブランチ名 |
|------|-----------|
| M1 マイルストーン | `feat/m1-readmode-core` |
| M2 マイルストーン | `feat/m2-interaction-feedback` |
| M3 マイルストーン | `feat/m3-mobile-nav-improve` |
| M4 マイルストーン | `feat/m4-finishing-touches` |
| タスクブランチ命名規則 | `{type}/{milestone}_{N}-{slug}` |

具体例:
- `feat/m1-readmode-core_1-1-typography-plugin`
- `feat/m1-readmode-core_1-2-prism-dark-mono`
- `feat/m1-readmode-core_1-3-inline-callout-copy`
- `feat/m2-interaction-feedback_2-1-mode-header-animation`
- `feat/m2-interaction-feedback_2-2-celebration`
- `feat/m3-mobile-nav-improve_3-1-sidebar-collapse`
- `feat/m3-mobile-nav-improve_3-2-step-nav`
- `feat/m4-finishing-touches_4-1-details`

**ルール:**
- M1 は最優先で着手（ReadMode の表示品質がアプリの第一印象を決定する）
- M1-1（typography プラグイン）は M1-2, M1-3 の前提（prose カスタマイズが効くようになる）
- M2 は M1 完了後に着手（ヘッダーセクションが prose の中に配置されるため）
- M3, M4 は M1 完了後であれば並行可能（触るファイルが異なる）
- 完了時は既存運用どおり `lint` / `typecheck` / `test` / `build` を通す

---

## 7. 技術的な注意点

### @tailwindcss/typography の導入

```bash
npm install -D @tailwindcss/typography --workspace @coden/web
```

`tailwind.config.js`:
```javascript
plugins: [
  require('@tailwindcss/typography'),
],
```

prose カスタマイズは `extend.typography` で行う:
```javascript
typography: (theme) => ({
  DEFAULT: {
    css: {
      '--tw-prose-links': theme('colors.primary-dark'),
      'h2': {
        borderLeft: `4px solid ${theme('colors.primary-mint')}`,
        paddingLeft: theme('spacing.3'),
        marginTop: theme('spacing.10'),
      },
      'strong': {
        color: theme('colors.primary-dark'),
      },
    },
  },
}),
```

### Prism テーマ変更

ReadMode.tsx で1行変更するだけ:
```diff
- import 'prismjs/themes/prism.css'
+ import 'prismjs/themes/prism-okaidia.css'
```

ビルトインダークテーマの候補:
- `prism-okaidia`: Monokai 風、暖色系でコントラスト良好
- `prism-tomorrow`: Tomorrow Night、クール系
- `prism-twilight`: Twilight、柔らかいダーク

いずれも `bg-slate-900` との相性が良い。追加パッケージ不要。

### CSS アニメーション

外部ライブラリ（Framer Motion 等）は使わず、CSS `@keyframes` + Tailwind ユーティリティで実装する。理由:
- バンドルサイズへの影響が最小
- 学習ページの本質的な体験改善に集中
- 必要十分なアニメーション（フェードイン、バウンスイン、パルス）は CSS で実現可能

---

## 8. roadmap08 との接続

| Roadmap | 位置づけ | Roadmap09 との関係 |
|---------|----------|-------------------|
| roadmap08 | UI品質ブラッシュアップ（基盤） | 共通コンポーネント・デザイントークン・モバイルナビは完了。roadmap09 は「学習体験の深さ」に集中 |
| roadmap07 | MVPリリース前修正 | 機能面の修正は完了済み |
| roadmap05 | 本番リリース計画 | roadmap09 完了後に再開する |

---

## 9. 完了条件

Roadmap09 は、以下を満たした時点で完了とする。

- [ ] `@tailwindcss/typography` が導入され、ReadMode の prose スタイルが正しく機能している
- [ ] コードブロックがダークテーマで表示され、背景色と整合している
- [ ] monospace フォントが定義され、全コードブロックで統一されている
- [ ] ReadMode の見出しにブランドカラーのアクセントがある
- [ ] インラインコードがブランドカラーで強調されている
- [ ] ブロック引用が「ポイント」カードとして視覚的に強調されている
- [ ] 各学習モードにアイコン付きヘッダーセクションがある
- [ ] モード切替時にフェードインアニメーションが適用されている
- [ ] 正解/完了時に祝福アニメーションが表示される
- [ ] LearningSidebar がモバイルでデフォルト折りたたみになっている
- [ ] StepPage 上部に全体進捗（Step N / 20）が表示されている
- [ ] favicon が設定されている
- [ ] `lint` / `typecheck` / `test` / `build` が通る
- [ ] 各タスクがコミット・タスクPRマージまで完了している
- [ ] 各マイルストーン最終タスクでは、マイルストーンPRのマージまで完了している

---

## 10. 期待効果

| カテゴリ | 現在スコア | 目標スコア | 主な改善項目 |
|---------|-----------|-----------|------------|
| 学習体験・コンテンツ表現 | 72 | 92+ | M1: typography + Prism + コールアウト、M2: モードヘッダー |
| タイポグラフィ・可読性 | 80 | 92+ | M1: typography プラグイン + monospace フォント |
| インタラクション・フィードバック | 78 | 90+ | M2: アニメーション + 祝福演出 |
| レスポンシブ・モバイル対応 | 78 | 85+ | M3: サイドバー折りたたみ + ステッパー改善 |
| ビジュアルデザイン・第一印象 | 80 | 90+ | M1: コードブロック改善、M2: モードヘッダー |
| ユーザビリティ・使いやすさ | 75 | 85+ | M3: 進捗表示 + ナビ改善 |
| 仕上げ・プロダクション品質 | 78 | 82+ | M4: favicon |
| **総合** | **82** | **95+** | |

---

## 11. 現在地（2026-03-16 時点）

- Roadmap08: 全マイルストーン完了（82/100点到達）
- **現在地**: **Roadmap09 作成完了、M1 着手前**
