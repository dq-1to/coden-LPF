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
  /** 必須前提コース ID（未完了→コース全体ロック） */
  requiredPrerequisites: string[]
  /** 推奨前提コース ID（未完了→警告のみ） */
  recommendedPrerequisites: string[]
}

export interface CategoryMeta {
  id: string
  title: string
  description: string
  icon: string
  courses: CourseMeta[]
}

// ─────────────────────────────────────────
// CATEGORIES: v2 の3層構造データ
// ─────────────────────────────────────────
export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'react',
    title: 'React',
    description: 'Reactの基礎から実践まで、段階的に学べるコース群',
    icon: 'Atom',
    courses: [
      {
        id: 'react-fundamentals',
        title: 'React基礎',
        level: 'beginner',
        requiredPrerequisites: [],
        recommendedPrerequisites: [],
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
        id: 'react-hooks',
        title: 'React応用',
        level: 'intermediate',
        requiredPrerequisites: ['react-fundamentals'],
        recommendedPrerequisites: [],
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
        id: 'react-advanced',
        title: 'React実践',
        level: 'advanced',
        requiredPrerequisites: ['react-hooks'],
        recommendedPrerequisites: [],
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
        id: 'react-api',
        title: 'API連携実践',
        level: 'intermediate',
        requiredPrerequisites: ['react-fundamentals'],
        recommendedPrerequisites: ['react-hooks'],
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
      {
        id: 'react-modern',
        title: 'React モダン',
        level: 'advanced',
        requiredPrerequisites: ['react-hooks'],
        recommendedPrerequisites: ['react-advanced'],
        steps: [
          {
            id: 'error-boundary',
            order: 31,
            title: 'Error Boundary',
            description: 'クラスコンポーネントを使ったError Boundaryの実装パターン・componentDidCatch・エラー回復UIの設計を学びます。',
            isImplemented: true,
          },
          {
            id: 'suspense-lazy',
            order: 32,
            title: 'Suspense と lazy',
            description: 'React.lazyによるコード分割・Suspenseのfallback・非同期データ読み込みとの連携パターンを学びます。',
            isImplemented: true,
          },
          {
            id: 'concurrent-features',
            order: 33,
            title: 'Concurrent Features',
            description: 'useTransition・useDeferredValue・startTransitionを使い、UIの応答性を保ちながら重い更新を非緊急として処理する方法を学びます。',
            isImplemented: true,
          },
          {
            id: 'use-optimistic',
            order: 34,
            title: 'useOptimistic',
            description: 'useOptimisticを使ってサーバー応答を待たずにUIを先行更新し、非同期処理中も快適な操作感を実現する方法を学びます。',
            isImplemented: true,
          },
          {
            id: 'portals',
            order: 35,
            title: 'Portals',
            description: 'createPortalでDOM階層の外にコンポーネントをレンダリングする方法・モーダルやツールチップへの応用・イベントバブリングの挙動を学びます。',
            isImplemented: true,
          },
          {
            id: 'forward-ref',
            order: 36,
            title: 'forwardRef と useImperativeHandle',
            description: 'forwardRefで親コンポーネントへDOM参照を公開する方法・useImperativeHandleで公開APIをカスタマイズするパターンを学びます。',
            isImplemented: true,
          },
        ],
      },
    ],
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    description: 'TypeScriptの型システムを基礎から学び、React開発に活かす',
    icon: 'FileCode',
    courses: [
      {
        id: 'ts-basics',
        title: 'TypeScript基礎',
        level: 'beginner',
        requiredPrerequisites: [],
        recommendedPrerequisites: [],
        steps: [
          {
            id: 'ts-types',
            order: 21,
            title: '型の基礎',
            description: '型注釈・プリミティブ型・型推論・リテラル型など、TypeScriptの型システムの基本を学びます。',
            isImplemented: true,
          },
          {
            id: 'ts-functions',
            order: 22,
            title: '関数の型',
            description: '引数と戻り値の型注釈・void・オプショナル引数・関数型・rest引数を学びます。',
            isImplemented: true,
          },
          {
            id: 'ts-objects',
            order: 23,
            title: 'オブジェクト型',
            description: 'interface・type alias・readonly・オプショナルプロパティ・Intersection型・タプル型を学びます。',
            isImplemented: true,
          },
          {
            id: 'ts-union-narrowing',
            order: 24,
            title: 'ユニオン型と型ガード',
            description: 'ユニオン型・typeof/in/instanceofガード・判別共用体・never型による網羅性チェックを学びます。',
            isImplemented: true,
          },
          {
            id: 'ts-generics',
            order: 25,
            title: 'ジェネリクス',
            description: '型パラメータ<T>・複数型パラメータ・ジェネリックinterface・型制約extendsを学びます。',
            isImplemented: true,
          },
          {
            id: 'ts-utility-types',
            order: 26,
            title: 'ユーティリティ型',
            description: 'Partial/Required/Readonly/Pick/Omit/Record/ReturnType/Parametersなど組み込みユーティリティ型を学びます。',
            isImplemented: true,
          },
        ],
      },
      {
        id: 'ts-react',
        title: 'TypeScript × React',
        level: 'intermediate',
        requiredPrerequisites: ['ts-basics'],
        recommendedPrerequisites: ['react-fundamentals'],
        steps: [
          {
            id: 'ts-react-props',
            order: 27,
            title: 'Props型定義',
            description: 'interfaceでProps型を定義し、children・オプショナルProps・ComponentProps活用など型安全なコンポーネント設計を学びます。',
            isImplemented: true,
          },
          {
            id: 'ts-react-state',
            order: 28,
            title: 'State型定義',
            description: 'useState<T>の型注釈・null許容状態・useReducerのAction型定義など、型安全な状態管理を学びます。',
            isImplemented: true,
          },
          {
            id: 'ts-react-hooks',
            order: 29,
            title: 'Hooks型定義',
            description: 'useRef<T>のDOM参照・型付きContext・カスタムフックの戻り値型・forwardRefなど、型安全なHooks活用を学びます。',
            isImplemented: true,
          },
          {
            id: 'ts-react-events',
            order: 30,
            title: 'イベント型定義',
            description: 'ChangeEvent・MouseEvent・FormEvent・KeyboardEventなど、Reactイベントハンドラの型定義を学びます。',
            isImplemented: true,
          },
        ],
      },
    ],
  },
]

// ─────────────────────────────────────────
// ヘルパー関数
// ─────────────────────────────────────────

/** 全カテゴリの全コースをフラットに取得 */
export function getAllCourses(): CourseMeta[] {
  return CATEGORIES.flatMap((cat) => cat.courses)
}

/** 全カテゴリの全ステップをフラットに取得 */
export function getAllSteps(): StepMeta[] {
  return getAllCourses().flatMap((course) => course.steps)
}

/** ステップIDからステップメタを検索 */
export function findStepById(stepId: string): StepMeta | undefined {
  for (const cat of CATEGORIES) {
    for (const course of cat.courses) {
      const step = course.steps.find((s) => s.id === stepId)
      if (step) return step
    }
  }
  return undefined
}

/** コースIDからコースメタを検索 */
export function findCourseById(courseId: string): CourseMeta | undefined {
  for (const cat of CATEGORIES) {
    const course = cat.courses.find((c) => c.id === courseId)
    if (course) return course
  }
  return undefined
}

/** カテゴリIDからカテゴリメタを検索 */
export function findCategoryById(categoryId: string): CategoryMeta | undefined {
  return CATEGORIES.find((cat) => cat.id === categoryId)
}

/** ステップIDが属するコースを検索 */
export function findCourseByStepId(stepId: string): CourseMeta | undefined {
  for (const cat of CATEGORIES) {
    for (const course of cat.courses) {
      if (course.steps.some((s) => s.id === stepId)) return course
    }
  }
  return undefined
}

/** ステップIDが属するカテゴリを検索 */
export function findCategoryByStepId(stepId: string): CategoryMeta | undefined {
  for (const cat of CATEGORIES) {
    for (const course of cat.courses) {
      if (course.steps.some((s) => s.id === stepId)) return cat
    }
  }
  return undefined
}

// ─────────────────────────────────────────
// 派生定数（後方互換）
// ─────────────────────────────────────────

export const TOTAL_STEP_COUNT = getAllSteps().length

export const IMPLEMENTED_STEP_COUNT = getAllSteps().filter((s) => s.isImplemented).length

/** @deprecated findStepById を使用してください */
export const findStepMeta = findStepById

export function getNextStep(currentStepId: string): StepMeta | undefined {
  const allSteps = getAllSteps().sort((a, b) => a.order - b.order)
  const currentIndex = allSteps.findIndex((s) => s.id === currentStepId)
  if (currentIndex === -1) return undefined
  return allSteps[currentIndex + 1]
}

export function getFirstImplementedStep(): StepMeta | undefined {
  return getAllSteps().find((step) => step.isImplemented)
}
