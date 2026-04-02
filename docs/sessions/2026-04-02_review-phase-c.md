# 2026-04-02: コードレビュー Phase C（MEDIUM 12件）

## 実施内容

### PR #176: fix/review-phase-c → dev

Phase C の MEDIUM 12タスクを全件対応。

#### Sonnet サブエージェント（2並列）
- **T4-2**: AchievementContext からトースト UI を AchievementToast に分離
- **T4-4**: isStepCompleted の重複排除（progressService に一本化）
- **T4-5**: クライアントサイドタイムスタンプ（updated_at）を削除
- **T4-7**: バッジ解除を Promise.allSettled で並列化
- **T4-9**: updateModeCompletion を exhaustive switch に変更
- **T4-11**: aria-pressed → role="radio" + aria-checked、ヒートマップ aria-label
- **T4-12**: Node.js 22 統一（.nvmrc / engines / CI）

#### Opus 直接作業
- **T4-1**: useLearningStep → useStepNavigation / useStepProgress / useStepNotification に分割（ファサード維持）
- **T4-3**: JudgmentResult / useJudgmentAction / useStepReset 共通化、PracticeMode・TestMode・ChallengeMode に適用
- **T4-6**: recordStudyActivity を FOR UPDATE 付き RPC に移行（010_record_study_activity_rpc.sql）
- **T4-8**: shared/validation.ts 作成 + pointService / profileService / challengeSubmissionService にバリデーション追加
- **T4-10**: validation / pointService / profileService のテスト追加（+34件）

### 品質ゲート
- typecheck: PASS
- lint: PASS
- test: 30 files, 527 tests PASS（493 → 527、+34件）
- build: PASS

## 発見・ハマり

- `recordStudyActivity` の userId パラメータ: RPC 化で不要になったが、ESLint が `_userId` プレフィックスを許可しない設定。パラメータ自体を削除してカラー側も修正
- post-edit-lint hook: Phase A から継続してブロッキング（stderr なし）。実害なし
- ChallengeMode の useStepReset 適用: useEffect が `[stepId, task]` に依存しており、useStepReset は stepId のみ監視。意味的な差異があるため ChallengeMode は JudgmentResult のみ適用

## コミット
- `f844a55` refactor: トーストUI分離・重複排除・並列化・exhaustive switch (T4-2/4-4/4-5/4-7/4-9)
- `cf545f4` fix: アクセシビリティ修正と Node.js バージョン統一 (T4-11/T4-12)
- `ad8c385` refactor: God Hook分割・コード重複解消・バリデーション・RPC・テスト追加 (T4-1/4-3/4-6/4-8/4-10)

## 残課題
- Phase D（LOW 10件）は未着手
