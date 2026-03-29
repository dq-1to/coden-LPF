import type { LearningStepContent } from '@/content/fundamentals/steps'

export const rhfZodStep: LearningStepContent = {
  id: 'rhf-zod',
  order: 37,
  title: 'フォームバリデーション',
  summary: 'React Hook Form + Zod の組み合わせによる型安全なフォームバリデーションパターンを学ぶ。',
  readMarkdown: `# フォームバリデーション（React Hook Form + Zod）

## React Hook Form とは

React Hook Form（RHF）は、パフォーマンスに優れたフォーム状態管理ライブラリです。再レンダリングを最小限に抑え、バリデーション・エラー表示・送信処理を簡潔に書けます。

\`\`\`jsx
import { useForm } from 'react-hook-form'

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = (data) => {
    console.log(data) // { email: '...', password: '...' }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      <input {...register('password')} type="password" />
      <button type="submit">ログイン</button>
    </form>
  )
}
\`\`\`

## register — フィールドの登録

\`register\` はフォームフィールドを RHF に登録し、\`ref\`・\`name\`・\`onChange\`・\`onBlur\` を返します。

\`\`\`jsx
// インラインバリデーション（RHF 組み込み）
<input
  {...register('email', {
    required: 'メールアドレスは必須です',
    pattern: { value: /^\\S+@\\S+$/, message: '有効なメールを入力してください' },
  })}
/>
{errors.email && <p>{errors.email.message}</p>}
\`\`\`

## Zod によるスキーマ定義

Zod は TypeScript ファーストのスキーマバリデーションライブラリです。型推論と実行時バリデーションを同時に行えます。

\`\`\`typescript
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上必要です'),
})

// TypeScript 型を自動生成
type LoginFormData = z.infer<typeof loginSchema>
// → { email: string; password: string }
\`\`\`

## RHF + Zod 連携（zodResolver）

\`@hookform/resolvers\` の \`zodResolver\` を使って RHF と Zod を連携させます。

\`\`\`typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上必要です'),
})

type FormData = z.infer<typeof schema>

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="メール" />
      {errors.email && <p>{errors.email.message}</p>}

      <input {...register('password')} type="password" placeholder="パスワード" />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit">ログイン</button>
    </form>
  )
}
\`\`\`

## Controller — 制御コンポーネントの場合

カスタムコンポーネントや UI ライブラリ製のコンポーネントには \`Controller\` を使います。

\`\`\`jsx
import { Controller } from 'react-hook-form'

<Controller
  name="category"
  control={control}
  render={({ field }) => (
    <Select {...field} options={categoryOptions} />
  )}
/>
\`\`\`

## バリデーションタイミングの制御

\`\`\`typescript
useForm({
  resolver: zodResolver(schema),
  mode: 'onChange',    // 入力中にバリデーション
  // mode: 'onBlur',   // フォーカスを外したときにバリデーション（デフォルト）
  // mode: 'onSubmit', // 送信時のみバリデーション
})
\`\`\`

## Zod の主なバリデーション API

| バリデーション | コード例 |
|-------------|---------|
| 必須文字列 | \`z.string().min(1, '必須')\` |
| メール形式 | \`z.string().email()\` |
| URL形式 | \`z.string().url()\` |
| 最小/最大文字数 | \`z.string().min(8).max(100)\` |
| 数値の範囲 | \`z.number().min(0).max(100)\` |
| 選択肢の列挙 | \`z.enum(['a', 'b', 'c'])\` |
| オプショナル | \`z.string().optional()\` |
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: 'React Hook Form でフォームフィールドを登録する関数は？',
      answer: 'register',
      hint: '「登録する」という英単語です。',
      explanation: 'register 関数にフィールド名を渡すと、ref・name・onChange・onBlur を返します。スプレッド構文で input に適用します。',
      choices: ['register', 'connect', 'bind', 'attach'],
    },
    {
      id: 'q2',
      prompt: 'フォーム送信時にバリデーションを実行してから onSubmit を呼ぶ RHF のメソッドは？',
      answer: 'handleSubmit',
      hint: '「送信を処理する」という意味の関数名です。',
      explanation: 'handleSubmit(onSubmit) を form の onSubmit に渡します。バリデーション通過後に onSubmit が呼ばれます。',
      choices: ['handleSubmit', 'onSubmit', 'submitForm', 'formSubmit'],
    },
    {
      id: 'q3',
      prompt: 'Zod でメールアドレス形式を検証するメソッドは？',
      answer: 'z.string().email()',
      hint: 'まず文字列型を宣言してから、メール形式のメソッドをチェーンします。',
      explanation: 'z.string().email() でメール形式を検証します。z.string().email("カスタムメッセージ") でエラーメッセージも指定できます。',
      choices: ['z.string().email()', 'z.email()', 'z.string().isEmail()', 'z.validate().email()'],
    },
    {
      id: 'q4',
      prompt: 'RHF と Zod を連携させる resolver は？',
      answer: 'zodResolver',
      hint: '@hookform/resolvers パッケージからインポートします。',
      explanation: 'zodResolver(schema) を useForm の resolver オプションに渡すことで、Zod のスキーマを RHF のバリデーションとして使用できます。',
      choices: ['zodResolver', 'zodAdapter', 'zodHook', 'zodValidate'],
    },
    {
      id: 'q5',
      prompt: 'Zod のスキーマから TypeScript 型を自動生成するユーティリティ型は？',
      answer: 'z.infer<typeof schema>',
      hint: '「推論する」を意味する型です。',
      explanation: 'z.infer<typeof schema> でスキーマから TypeScript 型を抽出します。これにより、バリデーションスキーマと型定義を一元管理できます。',
      choices: ['z.infer<typeof schema>', 'z.type<typeof schema>', 'z.extract<typeof schema>', 'z.derive<typeof schema>'],
    },
  ],
  testTask: {
    instruction: 'ログインフォームのバリデーションスキーマを Zod で定義してください。email はメール形式、password は8文字以上とします。',
    starterCode: `const loginSchema = z.object({
  email: z.string().____('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上です'),
})`,
    expectedKeywords: ['email'],
    explanation: 'z.string().email() でメール形式のバリデーションを追加します。引数にエラーメッセージを渡すことができます。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'rhf-zod-1',
        prompt: 'React Hook Form + Zod を使ったログインフォームを実装してください。',
        requirements: [
          'Zod で email（メール形式）と password（8文字以上）のスキーマを定義する',
          'z.infer でフォームデータの型を生成する',
          'useForm に zodResolver を設定する',
          'register で各フィールドを登録し、handleSubmit で送信を処理する',
          'errors オブジェクトからエラーメッセージを表示する',
        ],
        hints: [
          'zodResolver は @hookform/resolvers/zod からインポートします',
          'useForm<FormData>({ resolver: zodResolver(schema) }) で型安全なフォームを作成します',
          'errors.email?.message でエラーメッセージにアクセスします',
        ],
        expectedKeywords: ['zodResolver', 'register', 'handleSubmit', 'errors'],
        starterCode: `import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// TODO: バリデーションスキーマを定義
const schema = z.object({
  // ...
})

type FormData = z.infer<typeof schema>

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    // TODO: zodResolver を設定
  })

  const onSubmit = (data: FormData) => {
    console.log('送信:', data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input {...register('email')} placeholder="メールアドレス" />
        {/* TODO: エラーメッセージを表示 */}
      </div>
      <div>
        <input {...register('password')} type="password" placeholder="パスワード" />
        {/* TODO: エラーメッセージを表示 */}
      </div>
      <button type="submit">ログイン</button>
    </form>
  )
}`,
      },
      {
        id: 'rhf-zod-2',
        prompt: 'サインアップフォームのスキーマを Zod で設計してください。パスワード確認フィールドも含めます。',
        requirements: [
          'name（1文字以上）・email（メール形式）・password（8文字以上）・confirmPassword のスキーマを定義する',
          'z.object().refine() を使って password と confirmPassword が一致することを検証する',
          'useForm に zodResolver を設定してフォームを実装する',
          'confirmPassword 不一致のエラーをフォーム全体のエラー（formState.errors.root または path 指定）で表示する',
        ],
        hints: [
          'z.object().refine((data) => data.password === data.confirmPassword, { message: "...", path: ["confirmPassword"] }) で一致検証を追加します',
          'refine の path オプションにエラーを関連付けるフィールド名を指定します',
        ],
        expectedKeywords: ['refine', 'zodResolver', 'confirmPassword'],
        starterCode: `import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// TODO: サインアップスキーマを定義（refine でパスワード一致検証）
const signupSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上です'),
  confirmPassword: z.string(),
}).refine(
  // TODO: パスワード一致チェック
)

type SignupFormData = z.infer<typeof signupSchema>

function SignupForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      {/* TODO: 各フィールドと対応するエラーメッセージを実装 */}
      <button type="submit">登録</button>
    </form>
  )
}`,
      },
    ],
  },
}
