/** 学習モード（Read/Practice/Test/Challenge）完了時に付与されるポイント */
export const POINTS_PER_MODE_COMPLETE = 10

/** デイリーチャレンジ正解時に付与されるポイント */
export const POINTS_DAILY_CORRECT = 20

/** デイリーチャレンジ7日連続ボーナスポイント */
export const POINTS_DAILY_STREAK_BONUS = 50

/** コードドクター正解時に付与されるポイント */
export const POINTS_CODE_DOCTOR_BEGINNER = 15
export const POINTS_CODE_DOCTOR_INTERMEDIATE = 30
export const POINTS_CODE_DOCTOR_ADVANCED = 50

/** ミニプロジェクト完了時に付与されるポイント */
export const POINTS_MINI_PROJECT_COMPLETE = 100

/** コードリーディング正解時に付与されるポイント */
export const POINTS_CODE_READING_BASIC = 10
export const POINTS_CODE_READING_INTERMEDIATE = 20
export const POINTS_CODE_READING_ADVANCED = 30

/** ポイントバッジの閾値 */
export const BADGE_POINT_THRESHOLD_MID = 500
export const BADGE_POINT_THRESHOLD_HIGH = 1000

/** ストリークバッジの連続日数閾値 */
export const STREAK_THRESHOLD_BRONZE = 3
export const STREAK_THRESHOLD_SILVER = 7
export const STREAK_THRESHOLD_GOLD = 30

/** バッジトースト表示時間（ms） */
export const BADGE_TOAST_DURATION_MS = 4000

/** ステップ完了トースト表示時間（ms） */
export const STEP_TOAST_DURATION_MS = 3500

/** コピー完了フィードバック表示時間（ms） */
export const COPY_FEEDBACK_DURATION_MS = 2000

/** コードエディタ入力の最大文字数 */
export const MAX_CODE_LENGTH = 50_000

/** デイリーチャレンジ回答の最大文字数 */
export const MAX_ANSWER_LENGTH = 500

/** Monaco Editor のデフォルト高さ */
export const MONACO_EDITOR_HEIGHT = '320px'

/** ポイント目標のマイルストーン */
export const POINT_MILESTONES = [500, 1000, 1500, 2000] as const
