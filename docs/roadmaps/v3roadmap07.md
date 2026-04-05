# v3roadmap07: v3.3 モバイル UX 改善（M1〜M5）

**作成日**: 2026-04-05
**前提**: v3.2（M1〜M4）完了済み。dev ブランチが最新。696+ テスト PASS。
**スコープ**: v3.2 QA のスクリーンショット検証で判明したモバイル UX 問題の改善。

---

## 1. 背景

v3.2 QA のスクリーンショット検証で以下のモバイル UX 問題が判明:

| # | 問題 | 対象 | 影響 |
|---|------|------|------|
| 1 | PracticeModeNav のピルボタンが大きく「リーディング」が3行折り返し | PracticeModeNav | モバイルでダサい |
| 2 | WeeklyStatus の7サークルが 375px/390px で枠から溢れる | WeeklyStatus | レイアウト崩れ |
| 3 | CodeDoctor(30問) / BaseNook(12トピック) がモバイルで全展開 | CodeDoctorPage / BaseNookPage | 果てしないスクロール |
| 4 | BaseNook の目次がなく目的のトピックに辿り着きにくい | BaseNookPage | 情報アクセス性 |

### 対象マイルストーン

| # | マイルストーン | 概要 | 依存 |
|---|-------------|------|------|
| M1 | PracticeModeNav セグメンテッドコントロール化 | ピルボタン → セグメンテッドコントロール | — |
| M2 | WeeklyStatus サークル縮小 | h-10 w-10 → h-8 w-8 | — |
| M3 | Pagination 共通コンポーネント | 9件/ページ、CodeDoctorPage 統合 | — |
| M4 | BaseNook 2カラム化 + サイドバー TOC | サイドバー新規 + Pagination 統合 | M3 |
| M5 | QA | Playwright 検証 + CI 最終確認 | M1-M4 |

### 依存関係図

```
M1 (セグメンテッドコントロール) ──┐
M2 (サークル縮小) ────────────────┼── 独立 ──→ M5 (QA)
M3 (Pagination) ──→ M4 (BaseNook) ┘
```

M1・M2 は独立。M3 → M4 は依存関係あり（Pagination コンポーネントを BaseNook が使用）。

---

## 2. 対象ファイル

| ファイル | 変更種別 |
|---------|---------|
| `apps/web/src/features/daily/components/PracticeModeNav.tsx` (70行) | 改修: セグメンテッドコントロール化 |
| `apps/web/src/features/daily/components/WeeklyStatus.tsx` (46行) | 改修: サークル縮小 |
| `apps/web/src/components/Pagination.tsx` | **新規**: 共通ページネーションコンポーネント |
| `apps/web/src/pages/CodeDoctorPage.tsx` (314行) | 改修: Pagination 統合 |
| `apps/web/src/pages/BaseNookPage.tsx` (113行) | 改修: 2カラム化 + Pagination |
| `apps/web/src/features/base-nook/components/BaseNookSidebar.tsx` | **新規**: 目次サイドバー |

---

## 3. モデル判定基準

| 担当 | 基準 |
|------|------|
| `[Opus]` | 新規コンポーネント設計、複数ファイル連携の統合作業（M1, M3, M4） |
| `[Sonnet]` | CSS 微修正の定型作業（M2, M5） |

---

## 4. M1: PracticeModeNav セグメンテッドコントロール化

### 概要

モバイルの PracticeModeNav をピルボタン群からセグメンテッドコントロールに変更し、折り返し問題を解消する。デスクトップサイドバーは変更なし。

### タスク一覧

| # | タスク | 担当 | 理由 |
|---|--------|------|------|
| T1 | モバイルナビをセグメンテッドコントロールに変更 | `[Opus]` | UI パターン変更 + アクセシビリティ考慮 |
| T2 | M1 CI 確認 | `[Opus]` | 既存テスト PASS |

### T1. モバイルナビをセグメンテッドコントロールに変更 `[Opus]`

**変更ファイル**: `apps/web/src/features/daily/components/PracticeModeNav.tsx`

**Before** (L46-66): `flex flex-wrap gap-2` + 個別 `rounded-full` ピル
**After**: 1つの外枠コンテナ + 内部セグメント

```tsx
{/* モバイル: セグメンテッドコントロール */}
<nav className="mb-2 flex rounded-lg border border-slate-200 bg-white p-0.5 lg:hidden" aria-label="練習モード">
  {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
    const isActive = pathname === path || pathname.startsWith(path + '/')
    return (
      <Link
        key={path}
        to={path}
        className={[
          'flex flex-1 items-center justify-center gap-1 rounded-md px-1 py-2 text-xs font-medium transition-colors',
          isActive
            ? 'bg-amber-500 text-white shadow-sm'
            : 'text-text-muted hover:text-amber-600',
        ].join(' ')}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon size={13} aria-hidden="true" />
        {label}
      </Link>
    )
  })}
</nav>
```

設計ポイント:
- 外枠: `rounded-lg border border-slate-200 bg-white p-0.5`（1つの統一コンテナ）
- 各セグメント: `flex-1 rounded-md text-xs`（等幅、折り返し防止）
- アクティブ: `bg-amber-500 text-white shadow-sm`（内側の角丸で浮き出る）
- アイコン: `size={13}`（14→13に縮小）、`gap-1`（1.5→1に縮小）
- デスクトップサイドバーは変更なし

**検証**: `npm run typecheck && npm run test`

---

### T2. M1 CI 確認 `[Opus]`

**CI**:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

---

## 5. M2: WeeklyStatus サークル縮小

### 概要

WeeklyStatus の7日サークルを縮小し、375px/390px で枠内に収める。

計算: 7×32px + 6×6px(gap) = **260px**（375px - 24px padding - 32px card padding = 319px に収まる）

### タスク一覧

| # | タスク | 担当 | 理由 |
|---|--------|------|------|
| T3 | ~~サークルサイズを h-8 w-8 に変更~~ | `[Sonnet]` | [x] CSS クラス変更のみ |
| T4 | ~~M2 CI 確認~~ | `[Sonnet]` | [x] 既存テスト PASS |

### T3. サークルサイズを h-8 w-8 に変更 `[Sonnet]`

**変更ファイル**: `apps/web/src/features/daily/components/WeeklyStatus.tsx`

**変更内容**:

L29: `h-10 w-10` → `h-8 w-8`、`sm:h-11 sm:w-11` → `sm:h-10 sm:w-10`

**検証**: `npm run typecheck && npm run test`

---

### T4. M2 CI 確認 `[Sonnet]`

**CI**:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

---

## 6. M3: Pagination 共通コンポーネント

### 概要

共通 Pagination コンポーネントを新規作成し、CodeDoctorPage に統合する。9件/ページ。

### タスク一覧

| # | タスク | 担当 | 理由 |
|---|--------|------|------|
| T5 | ~~Pagination コンポーネント新規作成~~ | `[Opus]` | [x] 新規共通コンポーネント設計 |
| T6 | ~~CodeDoctorPage に Pagination 統合~~ | `[Opus]` | [x] state 追加 + スライシング + UI 配置 |
| T7 | ~~M3 CI 確認~~ | `[Opus]` | [x] 既存テスト PASS |

### T5. Pagination コンポーネント新規作成 `[Opus]`

**新規ファイル**: `apps/web/src/components/Pagination.tsx`

```tsx
interface PaginationProps {
  currentPage: number      // 1-based
  totalPages: number
  onPageChange: (page: number) => void
}
```

UI 仕様:
- `< 1 2 3 ... N >` 形式（前後ボタン + ページ番号）
- 5ページ以下: 全ページ番号表示
- 6ページ以上: `1 2 ... N-1 N` のように省略
- 各ボタン `min-h-[44px]`（タップターゲット確保）
- `totalPages <= 1` のとき非表示（MiniProjects/CodeReading は自動的に非表示）

**検証**: `npm run typecheck && npm run test`

---

### T6. CodeDoctorPage に Pagination 統合 `[Opus]`

**変更ファイル**: `apps/web/src/pages/CodeDoctorPage.tsx`

**変更内容**:
- `useState<number>(1)` で currentPage 管理
- `filteredProblems` を `paginatedProblems` に slicing（`(page-1)*9` 〜 `page*9`）
- フィルター変更時に `setCurrentPage(1)`
- グリッド下部に `<Pagination>` 配置

**検証**: `npm run typecheck && npm run test`

---

### T7. M3 CI 確認 `[Opus]`

**CI**:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

---

## 7. M4: BaseNook 2カラム化 + サイドバー TOC

### 概要

BaseNookPage にサイドバー目次を追加し、2カラムレイアウト + Pagination に変更する。

### タスク一覧

| # | タスク | 担当 | 理由 |
|---|--------|------|------|
| T8 | BaseNookSidebar コンポーネント新規作成 | `[Opus]` | 新規コンポーネント + LearningSidebar パターン踏襲 |
| T9 | BaseNookPage を2カラム + Pagination に変更 | `[Opus]` | レイアウト変更 + Pagination 統合 |
| T10 | M4 CI 確認 | `[Opus]` | 既存テスト PASS |

### T8. BaseNookSidebar コンポーネント新規作成 `[Opus]`

**新規ファイル**: `apps/web/src/features/base-nook/components/BaseNookSidebar.tsx`

LearningSidebar パターンを踏襲:
- PC (`lg:`): 固定サイドバー `w-56`、全トピック一覧
- モバイル: 折りたたみトグルボタン（`lg:hidden`）

```tsx
interface BaseNookSidebarProps {
  topics: BaseNookTopic[]
  progressMap: Map<string, TopicProgressSummary>
}
```

各トピック行:
- アイコン（小）+ タイトル + 進捗インジケーター（✓ / 部分 / 未着手）
- `<Link to={/base-nook/${topic.id}}>` でトピック詳細へナビゲート
- 現在ページではアクティブ表示なし（一覧ページなので）

モバイル折りたたみ:
- デフォルト閉じ（`isCollapsed = true`）
- トグルボタン: 「目次を見る ▼」/ 「目次を閉じる ▲」
- `overflow-hidden transition-[max-height,opacity] duration-300`

**検証**: `npm run typecheck && npm run test`

---

### T9. BaseNookPage を2カラム + Pagination に変更 `[Opus]`

**変更ファイル**: `apps/web/src/pages/BaseNookPage.tsx`

**変更内容**:
- `flex flex-col gap-4 lg:flex-row lg:gap-6` でサイドバー + メインの2カラム
- メインコンテンツに `currentPage` state 追加
- グリッド: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`（CodeDoctor と統一）
- 9件ページネーション（12トピック → 2ページ）
- グリッド下部に `<Pagination>` 配置

**検証**: `npm run typecheck && npm run test`

---

### T10. M4 CI 確認 `[Opus]`

**CI**:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

---

## 8. M5: QA

### 概要

M1〜M4 の全変更を対象とした最終品質確認。

### タスク一覧

| # | タスク | 担当 | 理由 |
|---|--------|------|------|
| T11 | Playwright 検証 | `[Sonnet]` | スクリーンショット取得 + 目視確認 |
| T12 | CI 最終確認 | `[Sonnet]` | 全ゲート通過 |

### T11. Playwright 検証 `[Sonnet]`

**検証デバイス幅**:

```
375px (iPhone SE), 390px (iPhone 14), 768px (iPad Mini), 1280px (PC)
```

**検証ページ一覧**:

| ページ | パス | 検証ポイント |
|-------|------|-------------|
| デイリーチャレンジ | `/daily` | セグメンテッドコントロール表示、WeeklyStatus 枠内収まり |
| コードドクター | `/practice/code-doctor` | セグメンテッドコントロール、ページネーション動作 |
| ミニプロジェクト一覧 | `/practice/mini-projects` | セグメンテッドコントロール（ページネーション不要を確認） |
| ベースヌック | `/base-nook` | サイドバー TOC、2カラム、ページネーション |

各ページで以下を確認:
- モバイルでの折り返し・溢れがないこと
- PC レイアウトに変更がないこと（1280px）
- タップターゲットが確保されていること

**検証**: スクリーンショットを `docs/qa/v3.3/` に保存

---

### T12. CI 最終確認 `[Sonnet]`

**CI**:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

---

## 9. ブランチ戦略

```
dev
 ├── v3.3/m1-segmented-control   ← M1: セグメンテッドコントロール化
 │    → PR → dev
 │
 ├── v3.3/m2-weekly-status       ← M2: サークル縮小（M1と独立）
 │    → PR → dev
 │
 ├── v3.3/m3-pagination          ← M3: Pagination 共通コンポーネント
 │    → PR → dev
 │
 ├── v3.3/m4-base-nook-sidebar   ← M4: BaseNook 2カラム化（M3に依存: Pagination使用）
 │    → PR → dev
 │
 └── v3.3/m5-qa                  ← M5: QA（M1-M4に依存）
      → PR → dev
```

M1・M2 は独立。M3 → M4 は依存関係あり。マイルストーン単位の PR で運用（タスクブランチ不要）。

---

## 10. 完了条件

### M1: PracticeModeNav セグメンテッドコントロール化

- [x] T1: モバイルナビがセグメンテッドコントロールに変更済み `[Opus]`
- [x] T2: CI 全通過 `[Opus]`

### M2: WeeklyStatus サークル縮小

- [ ] T3: サークルが h-8 w-8 / sm:h-10 sm:w-10 に変更済み `[Sonnet]`
- [ ] T4: CI 全通過 `[Sonnet]`

### M3: Pagination 共通コンポーネント

- [ ] T5: Pagination コンポーネントが新規作成済み `[Opus]`
- [ ] T6: CodeDoctorPage に Pagination 統合済み `[Opus]`
- [ ] T7: CI 全通過 `[Opus]`

### M4: BaseNook 2カラム化 + サイドバー TOC

- [ ] T8: BaseNookSidebar コンポーネントが新規作成済み `[Opus]`
- [ ] T9: BaseNookPage が2カラム + Pagination に変更済み `[Opus]`
- [ ] T10: CI 全通過 `[Opus]`

### M5: QA

- [ ] T11: 全対象ページの Playwright スクリーンショット保存 `[Sonnet]`
- [ ] T12: CI 最終確認 `[Sonnet]`

### 品質ゲート

- [ ] `typecheck` / `lint` / `test` / `build` 全通過（各マイルストーン完了時）
- [ ] 既存テスト全 PASS 維持（696件）
- [ ] Playwright で 375px / 390px / 768px / 1280px のスクリーンショット検証（M5 完了時）
- [ ] PC レイアウトに変更がないことを 1280px で確認

---

## 11. 注意事項

- **PC レイアウトの保護**: モバイル向け変更は `lg:hidden` やブレークポイント付きクラスで既存デスクトップ表示を維持する。
- **PracticeModeNav のデスクトップサイドバー**: M1 ではモバイル表示のみ変更。`lg:` 以上のサイドバー表示は変更しない。
- **Pagination の非表示条件**: `totalPages <= 1` で自動非表示。MiniProjects(8件) / CodeReading(5件) は 9件/ページ未満のため Pagination 不要。
- **BaseNookSidebar の LearningSidebar パターン**: 折りたたみトグルのアニメーション・アクセシビリティは既存の LearningSidebar 実装を参照する。
- **M3 → M4 の依存**: M4 は M3 の Pagination コンポーネントを使用するため、M3 完了後に着手する。

---

*v3roadmap07 により v3.3 のモバイル UX 改善ロードマップが確定。セグメンテッドコントロール化・サークル縮小・ページネーション・サイドバー TOC の4施策でモバイル体験を改善する。*
