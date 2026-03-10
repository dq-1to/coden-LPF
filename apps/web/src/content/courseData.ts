export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'

export interface StepMeta {
  id: string
  order: number
  title: string
  description: string
  isImplemented: boolean
}

export interface CourseMeta {
  id: string
  title: string
  level: CourseLevel
  steps: StepMeta[]
}

export const COURSES: CourseMeta[] = [
  {
    id: 'course-1',
    title: 'React基礎',
    level: 'beginner',
    steps: [
      {
        id: 'usestate-basic',
        order: 1,
        title: 'useState基礎',
        description: '状態管理の基本を学び、コンポーネントに記憶を持たせる方法を理解します。',
        isImplemented: true,
      },
      {
        id: 'events',
        order: 2,
        title: 'イベント処理',
        description: 'クリックや入力イベントを扱い、ユーザー操作に反応する実装を行います。',
        isImplemented: true,
      },
      {
        id: 'conditional',
        order: 3,
        title: '条件付きレンダリング',
        description: '条件に応じた表示切り替えで、UIの分岐を実装します。',
        isImplemented: true,
      },
      {
        id: 'lists',
        order: 4,
        title: 'リスト表示',
        description: '配列データを効率的に描画し、keyの基本を理解します。',
        isImplemented: true,
      },
    ],
  },
  {
    id: 'course-2',
    title: 'React応用',
    level: 'intermediate',
    steps: [
      {
        id: 'useeffect',
        order: 5,
        title: 'useEffect',
        description: '副作用とライフサイクルを理解し、データ取得や購読処理を実装します。',
        isImplemented: true,
      },
      {
        id: 'forms',
        order: 6,
        title: 'フォーム処理',
        description: '入力値の管理とバリデーションを実装し、実用的なフォームを作ります。',
        isImplemented: true,
      },
      {
        id: 'usecontext',
        order: 7,
        title: 'useContext',
        description: 'コンテキストAPIでグローバル状態を管理し、prop drillingを解消します。',
        isImplemented: true,
      },
      {
        id: 'usereducer',
        order: 8,
        title: 'useReducer',
        description: '複雑な状態ロジックをreducerパターンで整理します。',
        isImplemented: true,
      },
    ],
  },
  {
    id: 'course-3',
    title: 'React実践',
    level: 'advanced',
    steps: [
      {
        id: 'custom-hooks',
        order: 9,
        title: 'カスタムHooks',
        description: '再利用可能なロジックをカスタムHookとして切り出します。',
        isImplemented: true,
      },
      {
        id: 'api-fetch',
        order: 10,
        title: 'API連携',
        description: 'データ取得とローディング状態の管理を実践します。',
        isImplemented: true,
      },
      {
        id: 'performance',
        order: 11,
        title: 'パフォーマンス最適化',
        description: 'useMemo/useCallbackで不要な再レンダリングを防ぎます。',
        isImplemented: true,
      },
      {
        id: 'testing',
        order: 12,
        title: 'テスト入門',
        description: 'React Testing Libraryでコンポーネントのテストを書きます。',
        isImplemented: true,
      },
    ],
  },
  {
    id: 'course-4',
    title: 'API連携実践',
    level: 'intermediate',
    steps: [
      {
        id: 'api-counter-get',
        order: 13,
        title: 'カウンターAPI (GET)',
        description: 'APIからデータを取得し、画面に表示する基本パターンを学びます。',
        isImplemented: true,
      },
      {
        id: 'api-counter-post',
        order: 14,
        title: 'カウンターAPI (POST)',
        description: 'APIにデータを送信し、サーバーの状態を更新します。',
        isImplemented: true,
      },
      {
        id: 'api-tasks-list',
        order: 15,
        title: 'タスク一覧 (GET)',
        description: 'リストデータを取得して一覧表示するパターンを実装します。',
        isImplemented: true,
      },
      {
        id: 'api-tasks-create',
        order: 16,
        title: 'タスク追加 (POST)',
        description: 'フォームからデータを送信し、リストに追加する処理を実装します。',
        isImplemented: true,
      },
      {
        id: 'api-tasks-update',
        order: 17,
        title: 'タスク更新 (PATCH)',
        description: '完了状態の切り替えなど、既存データの更新処理を実装します。',
        isImplemented: true,
      },
      {
        id: 'api-tasks-delete',
        order: 18,
        title: 'タスク削除 (DELETE)',
        description: 'APIで削除処理を行い、リストから即時除去するUIを実装します。',
        isImplemented: true,
      },
      {
        id: 'api-custom-hook',
        order: 19,
        title: 'useTasksフック',
        description: 'API操作をカスタムフックに集約し、コンポーネントをシンプルに保ちます。',
        isImplemented: true,
      },
      {
        id: 'api-error-loading',
        order: 20,
        title: 'エラー/ローディングUI',
        description: 'APIの通信状態に応じたUI表示を実装し、UXを向上させます。',
        isImplemented: true,
      },
    ],
  },
]

export const TOTAL_STEP_COUNT = COURSES.reduce((sum, course) => sum + course.steps.length, 0)

export const IMPLEMENTED_STEP_COUNT = COURSES.reduce(
  (sum, course) => sum + course.steps.filter((s) => s.isImplemented).length,
  0,
)

export function findStepMeta(stepId: string): StepMeta | undefined {
  for (const course of COURSES) {
    const step = course.steps.find((s) => s.id === stepId)
    if (step) return step
  }
  return undefined
}

export function getNextStep(currentStepId: string): StepMeta | undefined {
  const allSteps = COURSES.flatMap((c) => c.steps)
  const currentIndex = allSteps.findIndex((s) => s.id === currentStepId)
  if (currentIndex === -1) return undefined
  return allSteps[currentIndex + 1]
}

export function getFirstImplementedStep(): StepMeta | undefined {
  return COURSES.flatMap((course) => course.steps).find((step) => step.isImplemented)
}
