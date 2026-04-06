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

/** Base Nook クイズ正答時に付与されるポイント */
export const POINTS_BASE_NOOK_CORRECT = 5

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

// ─── 難易度の表示ラベル・配色（3段階共通） ─────────────────────

/** 3段階難易度の配色クラス（beginner/basic → emerald, intermediate → amber, advanced → rose） */
export const DIFFICULTY_COLOR = {
  beginner: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  basic: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  intermediate: 'text-amber-700 bg-amber-50 border-amber-200',
  advanced: 'text-rose-700 bg-rose-50 border-rose-200',
} as const

/** 3段階難易度の表示ラベル（コードドクター / ミニプロジェクト用） */
export const DIFFICULTY_LABEL_STANDARD: Record<'beginner' | 'intermediate' | 'advanced', string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
} as const

/** 3段階難易度の表示ラベル（コードリーディング用） */
export const DIFFICULTY_LABEL_READING: Record<'basic' | 'intermediate' | 'advanced', string> = {
  basic: '基礎',
  intermediate: '応用',
  advanced: '実践',
} as const

// ─── 練習モードフィルター（共通） ─────────────────────

/** 練習モード共通のフィルター型（'all' + 難易度） */
export type DifficultyFilterValue = 'all' | 'beginner' | 'intermediate' | 'advanced'

/** コードドクター / ミニプロジェクト用フィルター選択肢 */
export const DIFFICULTY_FILTER_OPTIONS: { value: DifficultyFilterValue; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'beginner', label: '初級' },
  { value: 'intermediate', label: '中級' },
  { value: 'advanced', label: '上級' },
]

/** コードリーディング用フィルター型 */
export type ReadingFilterValue = 'all' | 'basic' | 'intermediate' | 'advanced'

/** コードリーディング用フィルター選択肢 */
export const READING_FILTER_OPTIONS: { value: ReadingFilterValue; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'basic', label: '基礎' },
  { value: 'intermediate', label: '応用' },
  { value: 'advanced', label: '実践' },
]

// ─── lucide-react アイコンのインポート（共通定義で使用） ─────────────────────

import { Atom, BookOpen, FileCode, Puzzle, Stethoscope, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ─── カテゴリアイコンマッピング（共通） ─────────────────────

/** CATEGORIES の icon 文字列 → lucide-react コンポーネントのマッピング */
export const CATEGORY_ICONS: Record<string, LucideIcon> = { Atom, FileCode }

// ─── 練習モードカード定義（共通） ─────────────────────

export interface PracticeCard {
  readonly to: string
  readonly icon: LucideIcon
  readonly title: string
  readonly description: string
  readonly color: string
}

/** 練習モードカード一覧（ダッシュボード・カリキュラムで共通） */
export const PRACTICE_MODE_CARDS: readonly PracticeCard[] = [
  {
    to: '/daily',
    icon: Zap,
    title: 'デイリーチャレンジ',
    description: '日替わり1問で知識を定着',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    to: '/practice/code-doctor',
    icon: Stethoscope,
    title: 'コードドクター',
    description: 'バグ入りコードを修正',
    color: 'text-rose-600 bg-rose-50 border-rose-200',
  },
  {
    to: '/practice/mini-projects',
    icon: Puzzle,
    title: 'ミニプロジェクト',
    description: '仕様からゼロ実装',
    color: 'text-violet-600 bg-violet-50 border-violet-200',
  },
  {
    to: '/practice/code-reading',
    icon: BookOpen,
    title: 'コードリーディング',
    description: 'コードを読んで理解度テスト',
    color: 'text-sky-600 bg-sky-50 border-sky-200',
  },
] as const

// ─── パルスアニメーション ─────────────────────

/** ステッパーモード完了時のパルスアニメーション持続時間（ms） */
export const PULSE_ANIMATION_MS = 750
