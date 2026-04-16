import type { LearningStepContent } from '@/content/fundamentals/steps'

export const performanceStep: LearningStepContent = {
    id: 'performance',
    order: 11,
    title: 'パフォーマンス最適化',
    summary: 'useMemo と useCallback を使い、不要な再レンダリングを防いでアプリを高速化する方法を学ぶ。',
    readMarkdown: `# パフォーマンス最適化：useMemo と useCallback

## なぜ最適化が必要か

Reactはステートが変わるたびにコンポーネントを再レンダリングします。ほとんどの場合これは問題ありませんが、**重い計算**や**子コンポーネントへの関数渡し**が絡む場合、不要な処理が繰り返されてパフォーマンスが低下します。

## useMemo — 計算結果をキャッシュする

\`useMemo\` は「前回と同じ依存値なら再計算しない」ためのフックです。

\`\`\`tsx
import { useState, useMemo } from 'react';

function FilteredList({ items }: { items: string[] }) {
  const [query, setQuery] = useState('');
  const [count, setCount] = useState(0);

  // queryが変わったときだけ再計算される
  const filtered = useMemo(
    () => items.filter(item => item.includes(query)),
    [items, query]
  );

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={() => setCount(c => c + 1)}>カウント: {count}</button>
      <ul>
        {filtered.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
\`\`\`

ポイント: \`count\` が変わっても \`query\` が変わっていなければ \`filtered\` は再計算されません。

## useCallback — 関数をキャッシュする

\`useCallback\` は「前回と同じ依存値なら同一の関数参照を返す」フックです。主に**子コンポーネントへの関数プロップ**と組み合わせます。

\`\`\`tsx
import { useState, useCallback, memo } from 'react';

// memo でラップすると、プロップが変わらない限り再レンダリングしない
const Button = memo(({ onClick, label }: { onClick: () => void; label: string }) => {
  console.log(\`\${label} ボタンを描画\`);
  return <button onClick={onClick}>{label}</button>;
});

function Counter() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState('light');

  // useCallbackなしだと再レンダリングのたびに新しい関数が生成される
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1);
  }, []); // 依存なし → 常に同じ関数参照

  return (
    <div>
      <p>カウント: {count}</p>
      <Button onClick={handleIncrement} label="増やす" />
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        テーマ: {theme}
      </button>
    </div>
  );
}
\`\`\`

\`theme\` が変わっても \`handleIncrement\` の参照が変わらないため、\`Button\` は再レンダリングされません。

## いつ使うべきか

| 状況 | 推奨 |
|------|------|
| 重い計算（フィルタ・ソート・集計） | useMemo |
| memo でラップした子コンポーネントへの関数渡し | useCallback |
| useEffect の依存配列に関数を入れる | useCallback |
| 単純な値や軽い計算 | 不要（過剰最適化になる） |

## 注意点

- **早期最適化は避ける**: まず動かし、プロファイラで問題を確認してから適用する
- **依存配列を正確に書く**: 抜けがあると古い値を参照するバグになる
- \`memo\` なしで \`useCallback\` を使っても効果は薄い（セットで使う）
`,
    practiceQuestions: [
      {
        id: 'performance-q1',
        prompt: 'useMemo はどのような処理に使うフックですか？',
        answer: '重い計算結果をキャッシュする',
        hint: '「依存値が変わらなければ再計算しない」が useMemo の基本動作です。',
        explanation: 'useMemoは計算結果をキャッシュし、依存配列の値が変わったときだけ再計算します。重いフィルタやソート処理の最適化に使います。',
        choices: ['重い計算結果をキャッシュする', '関数の参照をキャッシュする', 'DOMノードを直接操作する', '非同期処理を管理する'],
      },
      {
        id: 'performance-q2',
        prompt: 'useCallback を使うと何がキャッシュされますか？',
        answer: '関数の参照（インスタンス）',
        hint: '同じ関数参照を返すことで、memo でラップした子コンポーネントへの不要な再レンダリングを防げます。',
        explanation: 'useCallbackは関数自体をキャッシュします。依存配列が変わらない限り同じ参照を返すので、memoでラップした子の再レンダリングを防げます。',
        choices: ['関数の参照（インスタンス）', '計算結果の値', 'DOMノードの参照', 'コンポーネントのState'],
      },
      {
        id: 'performance-q3',
        prompt: 'memo(Button) でラップした Button が再レンダリングされる条件は何ですか？',
        answer: 'プロップが前回と異なる参照・値になったとき',
        hint: '`memo` は「プロップが変わらない限り再レンダリングしない」最適化です。',
        explanation: 'memo(Button)でラップしたコンポーネントは、受け取るpropsが前回と同じ参照・値のとき再レンダリングをスキップします。',
        choices: ['プロップが前回と異なる参照・値になったとき', '親コンポーネントが再レンダリングされたとき', 'useEffectが実行されたとき', 'Stateが初期化されたとき'],
      },
      {
        id: 'performance-q4',
        prompt: 'useMemo の依存配列を空配列にした場合、計算はいつ実行されますか？',
        answer: '初回レンダリング時のみ',
        hint: '依存する値がないため変化が発生せず、初回のみ実行されます。',
        explanation: '空配列を依存配列に渡すと変化する値がないため、計算は初回レンダリング時に一度だけ実行されてその後はキャッシュが使われます。',
      },
      {
        id: 'performance-q5',
        prompt: 'useCallback と memo をセットで使わないと効果が薄い理由は何ですか？',
        answer: '子コンポーネントが memo されていないと関数参照が安定しても再レンダリングが起きるから',
        hint: 'useCallback は関数参照を安定させますが、受け取る子が memo されていないと効果がありません。',
        explanation: 'memoなしの子コンポーネントは親が再レンダーするたびに再レンダーされます。useCallbackだけでは子の再レンダーを防げません。',
      },
    ],
    testTask: {
      instruction: 'useMemo を使ってフィルタ計算をメモ化してください。空欄に useMemo の呼び出しを書いてください。',
      starterCode: `const [query, setQuery] = useState('');
const [count, setCount] = useState(0);

const filtered = ____(
  () => items.filter(item => item.includes(query)),
  [items, query]
);`,
      expectedKeywords: ['useMemo'],
      explanation: 'useMemoでフィルタ計算をキャッシュすると、queryやitemsが変わらない限り再計算されません。countの変化による無駄な計算を防げます。',
    },
    challengeTask: {
      patterns: [
        {
          id: 'performance-1',
          prompt: 'useCallback と memo を使って子コンポーネントの不要な再レンダリングを防ぐ OptimizedCounter を実装してください。',
          requirements: [
            'memo でラップした ActionButton コンポーネントを作る（props は onClick: () => void, label: string）',
            '親の OptimizedCounter では useCallback で increment/decrement 関数を作る',
            'カウントの表示・増減・テーマ切り替え（light/dark）の機能を持つ',
            'テーマを切り替えても ActionButton は再レンダリングされない',
          ],
          hints: [
            'console.log を ActionButton 内に入れると再レンダリングを確認できる',
            'useCallback の依存配列を正しく設定しないと古い値を参照するバグになる',
            '関数内で setCount(c => c + 1) のように関数形式を使うと依存配列が空でも安全',
          ],
          expectedKeywords: ['useCallback', 'memo', 'setCount', 'setTheme'],
          starterCode: `import { useState, useCallback, memo } from 'react';

interface ActionButtonProps {
  onClick: () => void;
  label: string;
}

// TODO: memo でラップした ActionButton を実装する
const ActionButton = ({ onClick, label }: ActionButtonProps) => {
  return <button onClick={onClick}>{label}</button>;
};

export function OptimizedCounter() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // TODO: useCallback で increment / decrement を実装する
  const handleIncrement = () => setCount(c => c + 1);
  const handleDecrement = () => setCount(c => c - 1);

  return (
    <div>
      <p>カウント: {count}</p>
      <ActionButton onClick={handleIncrement} label="増やす" />
      <ActionButton onClick={handleDecrement} label="減らす" />
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        テーマ切り替え（{theme}）
      </button>
    </div>
  );
}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { useState, useCallback, memo } from 'react';\n\n____0\n\nexport function OptimizedCounter() {\n  const [count, setCount] = useState(0);\n  const [theme, setTheme] = useState<'light' | 'dark'>('light');\n\n  const handleIncrement = ____1\n  const handleDecrement = useCallback(() => setCount(c => c - 1), []);\n\n  return (\n    <div>\n      <p>カウント: {count}</p>\n      <ActionButton onClick={handleIncrement} label="増やす" />\n      <ActionButton onClick={handleDecrement} label="減らす" />\n      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>\n        テーマ切り替え（{theme}）\n      </button>\n    </div>\n  );\n}`,
            blanks: [
              {
                id: 'memo-component',
                label: 'memoコンポーネント',
                correctTokens: ['const', 'ActionButton', '=', 'memo', '(', '(', '{', 'onClick', ',', 'label', '}', ')', '=>', '{', 'return', '<button onClick={onClick}>', '{label}', '</button>', '}', ')'],
                distractorTokens: ['useMemo', 'forwardRef', 'React.lazy', 'useRef', 'useCallback'],
              },
              {
                id: 'use-callback',
                label: 'useCallback定義',
                correctTokens: ['useCallback', '(', '(', ')', '=>', 'setCount', '(', 'c', '=>', 'c', '+', '1', ')', ',', '[', ']', ')'],
                distractorTokens: ['useMemo', 'useRef', 'React.lazy', 'forwardRef'],
              },
            ],
          },
        },
      ],
    },
}
