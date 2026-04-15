import type { LearningStepContent } from '@/content/fundamentals/steps'

export const tsFunctionsStep: LearningStepContent = {
  id: 'ts-functions',
  order: 22,
  title: '関数の型',
  summary: '引数・戻り値の型注釈、オプショナル引数、関数型・rest引数など、TypeScriptの関数型定義を学ぶ。',
  readMarkdown: `# TypeScriptの関数型定義

## 引数と戻り値の型注釈

TypeScriptでは、関数の引数と戻り値に型を指定できます。

\`\`\`ts
// 引数: number, 戻り値: number
function double(n: number): number {
  return n * 2;
}

// 引数: string, string, 戻り値: string
function fullName(firstName: string, lastName: string): string {
  return \`\${firstName} \${lastName}\`;
}
\`\`\`

## void 型：値を返さない関数

何も返さない関数の戻り値型は \`void\` です。

\`\`\`ts
function logMessage(message: string): void {
  console.log(message);
  // return がなくてもOK
}
\`\`\`

## オプショナル引数（?）

引数の後に \`?\` を付けると、その引数は省略可能になります。

\`\`\`ts
function greet(name: string, greeting?: string): string {
  const g = greeting ?? "Hello";
  return \`\${g}, \${name}!\`;
}

greet("Alice");            // "Hello, Alice!"
greet("Bob", "Hi");        // "Hi, Bob!"
\`\`\`

オプショナル引数の型は内部的に \`string | undefined\` になります。

## デフォルト引数

\`\`\`ts
function greet(name: string, greeting = "Hello"): string {
  return \`\${greeting}, \${name}!\`;
}
// greeting の型は string と推論される（undefined は渡せない）
\`\`\`

## 関数型（Function Types）

関数を変数に代入したり、引数として渡すときは関数型を使います。

\`\`\`ts
// 関数型の変数
const add: (a: number, b: number) => number = (a, b) => a + b;

// 関数を引数として受け取る（コールバック）
function transform(value: number, fn: (n: number) => number): number {
  return fn(value);
}
transform(5, (n) => n * 2); // 10
\`\`\`

## rest 引数

可変長引数は \`...args\` で受け取り、型は配列型で指定します。

\`\`\`ts
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

sum(1, 2, 3);       // 6
sum(10, 20, 30, 40); // 100
\`\`\`

## 関数のオーバーロード

同じ関数名で異なる引数パターンを持つ宣言ができます。

\`\`\`ts
function formatValue(value: string): string;
function formatValue(value: number): string;
function formatValue(value: string | number): string {
  return typeof value === "string" ? value.toUpperCase() : value.toFixed(2);
}
\`\`\`
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '`function log(msg: string): ____ { console.log(msg) }` — 値を返さない関数の戻り値型は？',
      answer: 'void',
      hint: '「空（くう）」を意味する英単語です。',
      explanation: 'voidは関数が意味のある値を返さないことを示す型です。undefinedと似ていますが、関数の戻り値型として使います。',
      choices: ['void', 'null', 'undefined', 'empty'],
    },
    {
      id: 'q2',
      prompt: '`function greet(name: string, title____: string)` — 引数を省略可能にする記号は？',
      answer: '?',
      hint: '「？」マーク1文字です。',
      explanation: '引数名の後に ? を付けるとオプショナル引数になります。その型は `string | undefined` として扱われます。',
      choices: ['?', '*', '!', '&'],
    },
    {
      id: 'q3',
      prompt: '`const fn: (a: number) => ____` — 数値を受け取り数値を返す関数型の戻り値部分は？',
      answer: 'number',
      hint: '引数の型と同じです。',
      explanation: '関数型は `(引数名: 型) => 戻り値型` と書きます。この場合は数値を返すので number です。',
      choices: ['number', 'string', 'void', 'int'],
    },
    {
      id: 'q4',
      prompt: '可変長引数を受け取るとき `function sum(____numbers: number[])` の空欄に入る記号は？',
      answer: '...',
      hint: 'ドット3つです。スプレッド演算子と同じ記号です。',
      explanation: '`...` (rest parameters) を引数の前に付けると可変長引数になります。型は配列型で指定します。',
      choices: ['...', '**', '++', '??'],
    },
    {
      id: 'q5',
      prompt: 'コールバック関数を受け取る `transform(value: number, fn: ____)` の fn の型として正しいものは？',
      answer: '(n: number) => number',
      hint: '「数値を受け取って数値を返す関数」を型で表現してください。',
      explanation: '関数型は `(引数: 型) => 戻り値型` と書きます。コールバックの引数名は任意です。',
      choices: ['(n: number) => number', 'Function', 'number => number', 'callback<number>'],
    },
  ],
  testTask: {
    instruction: '`calculate` 関数の第3引数 `operation` に型注釈を追加してください。`"add"` または `"sub"` のリテラルユニオン型です。',
    starterCode: `function calculate(a: number, b: number, operation: ____): number {
  if (operation === 'add') return a + b;
  return a - b;
}`,
    expectedKeywords: ['add', 'sub'],
    explanation: '`"add" | "sub"` というリテラルユニオン型を使います。これで operation に無効な文字列を渡すとコンパイルエラーになります。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'ts-functions-1',
        prompt: '配列フィルタリング関数に完全な型注釈を付けてください。',
        requirements: [
          '`filterByCondition<T>(arr: T[], predicate: (item: T) => boolean): T[]` というシグネチャにする',
          '関数本体は `arr.filter(predicate)` を返すだけでよい',
          '動作確認: 数値配列から偶数のみ、文字列配列から5文字以上のものを抽出する',
        ],
        hints: [
          'ジェネリクス <T> を使うと複数の型に対応できます（詳細は後のステップで学びます）',
          'predicate は「条件判定関数」という意味。(item: T) => boolean の型を持ちます',
        ],
        expectedKeywords: ['filterByCondition', 'predicate', 'boolean', 'filter'],
        starterCode: `// TODO: filterByCondition 関数に型注釈を追加して実装してください
function filterByCondition(arr, predicate) {
  return arr.filter(predicate);
}

// 動作確認
const numbers = [1, 2, 3, 4, 5, 6];
const evens = filterByCondition(numbers, (n) => n % 2 === 0);
console.log(evens); // [2, 4, 6]

const words = ["cat", "elephant", "dog", "butterfly", "ant"];
const longWords = filterByCondition(words, (w) => w.length >= 5);
console.log(longWords); // ["elephant", "butterfly"]`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `____0 {\n  ____1\n}\n\nconst numbers = [1, 2, 3, 4, 5, 6];\nconst evens = filterByCondition(numbers, (n) => n % 2 === 0);\nconsole.log(evens);\n\nconst words = ["cat", "elephant", "dog", "butterfly", "ant"];\nconst longWords = filterByCondition(words, (w) => w.length >= 5);\nconsole.log(longWords);`,
            blanks: [
              {
                id: 'signature',
                label: '関数シグネチャ',
                correctTokens: ['function', 'filterByCondition', '<T>', '(', 'arr', ':', 'T[]', ',', 'predicate', ':', '(', 'item', ':', 'T', ')', '=>', 'boolean', ')', ':', 'T[]'],
                distractorTokens: ['any[]', 'unknown', 'void', 'forEach'],
              },
              {
                id: 'body',
                label: '実装body',
                correctTokens: ['return', 'arr.filter', '(', 'predicate', ')'],
                distractorTokens: ['arr.map', 'arr.forEach', 'arr.reduce', 'arr.find'],
              },
            ],
          },
      },
      {
        id: 'ts-functions-2',
        prompt: 'コールバックを受け取る高階関数 `applyTwice` に型注釈を付けてください。',
        requirements: [
          '`applyTwice(value: number, fn: (n: number) => number): number` のシグネチャにする',
          '関数本体は fn を2回適用して返す（fn(fn(value))）',
          '動作確認: `applyTwice(3, (n) => n * 2)` → 12',
        ],
        hints: [
          'コールバックの型は `(n: number) => number` と書きます',
          'fn を2回適用: fn(fn(value)) または const once = fn(value); return fn(once);',
        ],
        expectedKeywords: ['applyTwice', 'number', 'fn'],
        starterCode: `// TODO: applyTwice に型注釈を追加してください
function applyTwice(value, fn) {
  return fn(fn(value));
}

console.log(applyTwice(3, (n) => n * 2));   // 12
console.log(applyTwice(5, (n) => n + 10));  // 25`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `____0 {\n  ____1\n}\n\nconsole.log(applyTwice(3, (n) => n * 2));\nconsole.log(applyTwice(5, (n) => n + 10));`,
            blanks: [
              {
                id: 'signature',
                label: '型注釈',
                correctTokens: ['function', 'applyTwice', '(', 'value', ':', 'number', ',', 'fn', ':', '(', 'n', ':', 'number', ')', '=>', 'number', ')', ':', 'number'],
                distractorTokens: ['string', 'any', 'void', 'callback'],
              },
              {
                id: 'body',
                label: '実装',
                correctTokens: ['return', 'fn', '(', 'fn', '(', 'value', ')', ')'],
                distractorTokens: ['fn.call', 'fn.apply', 'fn.bind', 'value.fn'],
              },
            ],
          },
      },
    ],
  },
}
