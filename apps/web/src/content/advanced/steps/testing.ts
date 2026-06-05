import type { LearningStepContent } from '@/content/fundamentals/steps'

export const testingStep: LearningStepContent = {
    id: 'testing',
    order: 12,
    title: 'テスト入門',
    summary: 'React Testing Library を使ってコンポーネントの動作をテストし、安心してリファクタリングできる基盤を作る方法を学ぶ。',
    readMarkdown: `# テスト入門：React Testing Library

## なぜテストを書くのか

テストを書く最大の目的は「**安心してコードを変えられる状態にする**」ことです。テストがあれば、リファクタリングや機能追加の際に意図しない壊れが即座に検知できます。

## React Testing Library の基本方針

React Testing Library（RTL）は「**ユーザーが操作する視点**でコンポーネントをテストする」ライブラリです。

- ❌ 実装の詳細（state・class名）をテストしない
- ✅ ユーザーが見える文字・ボタン・入力欄を通じてテストする

## 基本的なテストの書き方

\`\`\`tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

describe('Counter', () => {
  it('初期値0が表示される', () => {
    render(<Counter />);
    expect(screen.getByText('カウント: 0')).toBeInTheDocument();
  });

  it('+ボタンをクリックするとカウントが増える', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await user.click(screen.getByRole('button', { name: '+' }));
    expect(screen.getByText('カウント: 1')).toBeInTheDocument();
  });
});
\`\`\`

## 重要な概念

### render と screen

\`render\` はコンポーネントをJSDomに描画し、\`screen\` はそこから要素を検索します。

\`\`\`tsx
render(<MyComponent />);  // DOMに描画
screen.getByText('テキスト');          // テキストで検索（見つからなければエラー）
screen.queryByText('テキスト');        // 存在確認用（見つからなければnull）
screen.getByRole('button', { name: '送信' }); // role + アクセシブルな名前で検索
\`\`\`

### userEvent — ユーザー操作のシミュレーション

\`\`\`tsx
const user = userEvent.setup();
await user.click(button);           // クリック
await user.type(input, 'Hello');    // 文字入力
await user.clear(input);            // 入力クリア
await user.selectOptions(select, 'option-value'); // セレクト
\`\`\`

### アサーション（jest-dom）

\`\`\`tsx
expect(element).toBeInTheDocument();   // DOMに存在する
expect(element).toBeVisible();          // 表示されている
expect(element).toBeDisabled();         // 無効化されている
expect(element).toHaveValue('text');    // 値が一致する
expect(element).toHaveTextContent('text'); // テキストが含まれる
\`\`\`

## モックの活用

外部APIやサービスはモックで置き換えてテストします。

\`\`\`tsx
import { vi } from 'vitest';

// 関数のモック
const mockOnSave = vi.fn();
render(<Form onSave={mockOnSave} />);
// フォーム送信後
expect(mockOnSave).toHaveBeenCalledWith({ name: 'テスト太郎' });
\`\`\`

## テストの構造（AAA パターン）

\`\`\`tsx
it('テストの説明', async () => {
  // Arrange（準備）
  const user = userEvent.setup();
  render(<LoginForm />);

  // Act（操作）
  await user.type(screen.getByLabelText('メール'), 'test@example.com');
  await user.click(screen.getByRole('button', { name: 'ログイン' }));

  // Assert（検証）
  expect(screen.getByText('ログイン成功')).toBeInTheDocument();
});
\`\`\`

## よくあるミス

| ミス | 修正 |
|------|------|
| \`getByText\` で部分一致が通らない | \`{ exact: false }\` オプションを使う |
| \`user.click\` の前に \`await\` を忘れる | 必ず \`await\` を付ける |
| 実装詳細（class名、state値）をテスト | ユーザー視点の要素（テキスト・role）でテスト |
| 非同期更新を待たずにアサートする | \`waitFor\` や \`findBy*\` を使う |
`,
    practiceQuestions: [
      {
        id: 'testing-q1',
        prompt: 'React Testing Library はどのような視点でテストを書くライブラリですか？',
        answer: 'ユーザーが操作する視点',
        hint: 'RTL は「ユーザーが見る・操作できる要素」を通じてテストします。実装詳細は避けます。',
        explanation: 'ユーザー視点でテストを書くことで、内部実装を変えてもテストが壊れにくくなります。リファクタリングへの安心感が増します。',
        choices: ['ユーザーが操作する視点', '開発者が実装する視点', 'デザイナーが設計する視点', 'QAが検証する視点'],
      },
      {
        id: 'testing-q2',
        prompt: '要素が存在しないことを確認したいとき使うべきメソッドは queryByText と getByText のどちらですか？',
        answer: 'queryByText',
        hint: 'getByText は見つからないとエラーをthrow します。存在確認（null チェック）には queryByText を使います。',
        explanation: 'queryByTextは要素が見つからないときnullを返すため、「要素が存在しないこと」をexpect(element).toBeNull()で検証できます。',
        choices: ['queryByText', 'getByText'],
      },
      {
        id: 'testing-q3',
        prompt: 'userEvent でクリックするとき await が必要な理由は何ですか？',
        answer: 'userEvent の操作は非同期で、await なしだと処理完了前にアサーションが実行されるから',
        hint: 'await を付けないとクリック処理が終わる前に expect() が実行され、テストが不安定になります。',
        explanation: 'userEvent.clickはPromiseを返す非同期関数です。awaitなしだと操作完了前にアサーションが実行され、テストが失敗します。',
        choices: [
          'userEvent の操作は非同期で、await なしだと処理完了前にアサーションが実行されるから',
          'userEvent は同期的だが、Reactの再レンダリングを待つ必要があるから',
          'テストフレームワークが await を要求する仕様だから',
          'ブラウザのイベントループをシミュレートするために必要だから',
        ],
      },
      {
        id: 'testing-q4',
        prompt: 'テストの AAA パターンとは何の略ですか？',
        answer: 'Arrange（準備）・Act（操作）・Assert（検証）',
        hint: 'テストを3段階に整理するパターンです。準備→操作→検証の順で書くと読みやすくなります。',
        explanation: 'Arrange（準備）でコンポーネントをrenderし、Act（操作）でクリックや入力を行い、Assert（検証）で結果をexpectで確認します。',
      },
      {
        id: 'testing-q5',
        prompt: 'vi.fn() で作成したモック関数が特定の引数で呼ばれたことを検証するアサーションは何ですか？',
        answer: 'toHaveBeenCalledWith(args)',
        hint: 'expect(mockFn).toHaveBeenCalledWith(引数) で呼び出し時の引数を検証できます。',
        explanation: 'vi.fn()で作ったモック関数はtoHaveBeenCalledWithで引数を検証できます。プロップに渡した関数が正しく呼ばれたかを確認できます。',
      },
    ],
    testTask: {
      instruction: '「カウント: 0」がDOMに存在することを検証するアサーションの空欄を埋めてください。',
      starterCode: `import { render, screen } from '@testing-library/react';
import { Counter } from './Counter';

it('初期値0が表示される', () => {
  render(<Counter />);
  expect(screen.getByText('カウント: 0')).____();
});`,
      expectedKeywords: ['toBeInTheDocument'],
      explanation: 'toBeInTheDocument() は要素がDOMに存在することを検証するマッチャーです。screen.getByTextで要素を取得し、expectで検証します。',
    },
    challengeTask: {
      patterns: [
        {
          id: 'testing-1',
          prompt: 'バリデーション付きのログインフォームのテストを実装してください。',
          requirements: [
            '初期状態でエラーメッセージが表示されていないことを検証する',
            '空欄のまま送信するとエラーメッセージが表示されることを検証する',
            'メールを入力して送信すると onLogin がそのメールアドレスで呼ばれることを検証する',
          ],
          hints: [
            'queryByText はテキストが存在しない場合に null を返す（否定検証に便利）',
            'vi.fn() でモック関数を作り、toHaveBeenCalledWith で呼び出し引数を検証する',
            'screen.getByLabelText でラベルに関連付けられた入力欄を取得できる',
          ],
          expectedKeywords: ['queryByText', 'vi.fn', 'toHaveBeenCalledWith', 'getByLabelText'],
          starterCode: `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { LoginForm } from './LoginForm';

// LoginForm の仕様:
// - メール入力欄（label: "メールアドレス"）と送信ボタン
// - メール未入力で送信すると「メールアドレスを入力してください」が表示される
// - メール入力済みで送信すると onLogin(email) が呼ばれる

describe('LoginForm', () => {
  it('初期状態でエラーメッセージは表示されない', () => {
    render(<LoginForm onLogin={vi.fn()} />);
    // TODO: エラーメッセージが存在しないことを検証する
  });

  it('空欄のまま送信するとエラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    render(<LoginForm onLogin={vi.fn()} />);
    // TODO: 送信ボタンをクリックしてエラーが出ることを検証する
  });

  it('メールを入力して送信するとonLoginが呼ばれる', async () => {
    const user = userEvent.setup();
    const mockOnLogin = vi.fn();
    render(<LoginForm onLogin={mockOnLogin} />);
    // TODO: メールを入力して送信し、onLogin が正しく呼ばれることを検証する
  });
});`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport { vi } from 'vitest';\nimport { LoginForm } from './LoginForm';\n\ndescribe('LoginForm', () => {\n  it('初期状態でエラーメッセージは表示されない', () => {\n    render(<LoginForm onLogin={vi.fn()} />);\n    ____0\n  });\n\n  it('空欄のまま送信するとエラーメッセージが表示される', async () => {\n    const user = userEvent.setup();\n    render(<LoginForm onLogin={vi.fn()} />);\n    await user.click(screen.getByRole('button', { name: 'ログイン' }));\n    ____1\n  });\n\n  it('メールを入力して送信するとonLoginが呼ばれる', async () => {\n    const user = userEvent.setup();\n    const mockOnLogin = vi.fn();\n    render(<LoginForm onLogin={mockOnLogin} />);\n    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');\n    await user.click(screen.getByRole('button', { name: 'ログイン' }));\n    ____2\n  });\n});`,
            blanks: [
              {
                id: 'initial-check',
                label: '初期検証',
                correctTokens: ['expect', '(', 'screen.queryByText', '(', "'メールアドレスを入力してください'", ')', ')', '.toBeNull', '(', ')'],
                distractorTokens: ['screen.getByTestId', 'screen.findByText', '.toBeFalsy', 'container'],
              },
              {
                id: 'error-check',
                label: 'エラー検証',
                correctTokens: ['expect', '(', 'screen.getByText', '(', "'メールアドレスを入力してください'", ')', ')', '.toBeInTheDocument', '(', ')'],
                distractorTokens: ['screen.getByTestId', 'screen.findByText', '.toBeCalled', 'container'],
              },
              {
                id: 'mock-check',
                label: 'mock検証',
                correctTokens: ['expect', '(', 'mockOnLogin', ')', '.toHaveBeenCalledWith', '(', "'test@example.com'", ')'],
                distractorTokens: ['screen.getByTestId', '.toBeCalled', 'container', 'screen.findByText'],
              },
            ],
          },
        },
      ],
    },
}
