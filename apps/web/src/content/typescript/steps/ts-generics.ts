import type { LearningStepContent } from '@/content/fundamentals/steps'

export const tsGenericsStep: LearningStepContent = {
  id: 'ts-generics',
  order: 25,
  title: 'ジェネリクス',
  summary: '型パラメータ<T>・複数型パラメータ・ジェネリックインターフェース・型制約(extends)を学ぶ。',
  readMarkdown: `# ジェネリクス：再利用可能な型定義

## any との違い

any を使うと型安全性が失われます。ジェネリクスを使うと、型安全性を保ちつつ汎用的な関数を書けます。

\`\`\`ts
// any を使うと戻り値の型情報が失われる
function identity_any(value: any): any {
  return value;
}
const result = identity_any("hello"); // result は any 型

// ジェネリクスなら型情報が保たれる
function identity<T>(value: T): T {
  return value;
}
const result2 = identity("hello"); // result2 は string 型
const result3 = identity(42);      // result3 は number 型
\`\`\`

## 型パラメータ \`<T>\`

\`<T>\` は「型を引数として受け取る」仕組みです。T は慣習的な名前で、任意の名前を使えます。

\`\`\`ts
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

const first1 = getFirst([1, 2, 3]);         // number
const first2 = getFirst(["a", "b", "c"]);   // string

// 型引数を明示することもできる（通常は推論に任せる）
const first3 = getFirst<boolean>([true, false]); // boolean
\`\`\`

## 複数の型パラメータ

\`\`\`ts
function zip<A, B>(arrA: A[], arrB: B[]): [A, B][] {
  return arrA.map((a, i) => [a, arrB[i]]);
}

zip([1, 2, 3], ["a", "b", "c"]);
// [[1, "a"], [2, "b"], [3, "c"]] — 型は [number, string][]
\`\`\`

## ジェネリックインターフェース

\`\`\`ts
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// T に具体的な型を当てはめる
const userResponse: ApiResponse<User> = {
  data: { id: 1, name: "Alice", email: "alice@example.com" },
  status: 200,
  message: "OK",
};

const stringResponse: ApiResponse<string> = {
  data: "hello",
  status: 200,
  message: "OK",
};
\`\`\`

## 型制約（extends）

型パラメータに制約を付けると、特定のプロパティを持つ型のみ受け入れられます。

\`\`\`ts
// T は必ず { length: number } を持つ型に限定
function getLength<T extends { length: number }>(value: T): number {
  return value.length;
}

getLength("hello");        // 5 — string は length を持つ
getLength([1, 2, 3]);      // 3 — 配列は length を持つ
getLength(42);             // エラー！number は length を持たない
\`\`\`

## 型制約と keyof

\`keyof\` と組み合わせると、オブジェクトのプロパティ名に安全にアクセスできます。

\`\`\`ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: "Alice", age: 30 };
getProperty(user, "name"); // "Alice" — string 型
getProperty(user, "id");   // 1 — number 型
getProperty(user, "xyz");  // エラー！user に xyz プロパティはない
\`\`\`
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '`function identity<T>(value: T): T` で T を使う利点は、any を使う場合と比べて何が保たれる？',
      answer: '型情報',
      hint: '関数を呼び出した後、戻り値の型が何型かわかることです。',
      explanation: 'ジェネリクスを使うと、呼び出し時の引数の型が戻り値の型に伝わります。anyでは戻り値がany型になり型安全性が失われます。',
      choices: ['型情報', 'パフォーマンス', 'nullチェック', 'メモリ管理'],
    },
    {
      id: 'q2',
      prompt: '`function getFirst<T>(arr: T[]): ____` — 配列の最初の要素を返す関数の戻り値型は？',
      answer: 'T',
      hint: '配列の要素と同じ型です。',
      explanation: '配列が T[] 型なら、その要素は T 型です。戻り値に T を指定することで、入力の型と出力の型が連動します。',
      choices: ['T', 'T[]', 'any', 'unknown'],
    },
    {
      id: 'q3',
      prompt: '`function getLength<T extends ____ >` — T を「length プロパティを持つ型」に制限する制約は？',
      answer: '{ length: number }',
      hint: '`extends` の後に、T が持つべきプロパティを型として書きます。',
      explanation: 'extends { length: number } と書くと、T は length プロパティを持つ型（string, 配列など）のみに制限されます。',
    },
    {
      id: 'q4',
      prompt: '`getFirst([1, 2, 3])` を呼び出すとき、型引数 T の値をTypeScriptはどのように決定する？',
      answer: '推論',
      hint: '明示しなくても TypeScript が自動で決めてくれます。',
      explanation: 'TypeScriptは引数の型から型引数を自動で推論します。[1, 2, 3]はnumber[]なのでTはnumberと推論されます。明示的に<number>と書く必要はありません。',
      choices: ['推論', '手動指定', 'any変換', 'キャスト'],
    },
    {
      id: 'q5',
      prompt: '`function getProperty<T, K extends keyof T>(obj: T, key: K)` — K に keyof T の制約を付けることで何を防げる？',
      answer: '存在しないプロパティへのアクセス',
      hint: 'obj に存在しないキーを渡したときにコンパイルエラーにできます。',
      explanation: 'K extends keyof T とすることで、key に T のプロパティ名以外を渡すとコンパイルエラーになります。タイポによるバグを防げます。',
      choices: ['存在しないプロパティへのアクセス', 'null参照エラー', '無限ループ', '型の循環参照'],
    },
  ],
  testTask: {
    instruction: '`getFirst` 関数の引数と戻り値に型パラメータ T を使った型注釈を付けてください。',
    starterCode: `function getFirst<T>(arr: ____): ____ {
  return arr[0];
}`,
    expectedKeywords: ['T[]', 'T'],
    explanation: '引数は T[] 型の配列、戻り値は T 型の要素です。これで getFirst([1,2,3]) の戻り値が number と推論されるようになります。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'ts-generics-1',
        prompt: '`Result<T>` 型と、それを返すユーティリティ関数を実装してください。',
        requirements: [
          '`{ ok: true; value: T } | { ok: false; error: string }` のユニオン型 `Result<T>` を定義する',
          '`succeed<T>(value: T): Result<T>` 関数を実装する（ok: true を返す）',
          '`fail<T>(error: string): Result<T>` 関数を実装する（ok: false を返す）',
          '`unwrap<T>(result: Result<T>): T` 関数を実装する（ok が false の場合は Error をスローする）',
        ],
        hints: [
          'Result<T> はジェネリックな判別共用体です',
          'unwrap 内で result.ok が false なら throw new Error(result.error)',
          'ok が true のブランチでは result.value が T 型として使えます',
        ],
        expectedKeywords: ['Result', 'succeed', 'fail', 'unwrap', 'ok'],
        starterCode: `// TODO: Result<T> 型を定義してください

// TODO: succeed, fail, unwrap を実装してください

const r1 = succeed(42);
const r2 = fail<number>("取得に失敗しました");

console.log(unwrap(r1)); // 42
try {
  unwrap(r2);
} catch (e) {
  console.log((e as Error).message); // "取得に失敗しました"
}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `____0\n\n____1\n\n____2\n\nconst r1 = succeed(42);\nconst r2 = fail<number>("取得に失敗しました");\nconsole.log(unwrap(r1));\ntry { unwrap(r2); } catch (e) { console.log((e as Error).message); }`,
            blanks: [
              {
                id: 'result-type',
                label: 'Result型',
                correctTokens: ['type', 'Result', '<T>', '=', '{', 'ok', ':', 'true', ';', 'value', ':', 'T', '}', '|', '{', 'ok', ':', 'false', ';', 'error', ':', 'string', '}'],
                distractorTokens: ['any', 'unknown', 'void', 'Promise'],
              },
              {
                id: 'succeed-fail',
                label: 'succeed/fail',
                correctTokens: ['function', 'succeed', '<T>', '(', 'value', ':', 'T', ')', ':', 'Result<T>', '{', 'return', '{', 'ok', ':', 'true', ',', 'value', '}', '}', 'function', 'fail', '<T>', '(', 'error', ':', 'string', ')', ':', 'Result<T>', '{', 'return', '{', 'ok', ':', 'false', ',', 'error', '}', '}'],
                distractorTokens: ['new Result', 'throw', 'Promise.resolve', 'null'],
              },
              {
                id: 'unwrap',
                label: 'unwrap',
                correctTokens: ['function', 'unwrap', '<T>', '(', 'result', ':', 'Result<T>', ')', ':', 'T', '{', 'if', '(', '!', 'result.ok', ')', 'throw', 'new', 'Error', '(', 'result.error', ')', 'return', 'result.value', '}'],
                distractorTokens: ['result.data', 'result.get', 'JSON.parse', 'result.unwrap'],
              },
            ],
          },
      },
      {
        id: 'ts-generics-2',
        prompt: '`<T extends { id: number }>` 制約を使ったユーティリティ関数を実装してください。',
        requirements: [
          '`findById<T extends { id: number }>(items: T[], id: number): T | undefined` を実装する',
          '`groupById<T extends { id: number }>(items: T[]): Record<number, T>` を実装する',
          '動作確認: ユーザー配列と商品配列でそれぞれ動作することを確認する',
        ],
        hints: [
          '`T extends { id: number }` は id プロパティを持つ任意の型を受け入れます',
          'findById は Array.find を使います',
          'groupById は reduce または forEach でオブジェクトを組み立てます',
        ],
        expectedKeywords: ['findById', 'groupById', 'extends', 'id', 'Record'],
        starterCode: `// TODO: findById を実装してください

// TODO: groupById を実装してください

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];
console.log(findById(users, 1));    // { id: 1, name: "Alice" }
console.log(groupById(users));      // { 1: { id: 1, name: "Alice" }, 2: { id: 2, name: "Bob" } }`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `____0\n\n____1\n\nconst users = [\n  { id: 1, name: "Alice" },\n  { id: 2, name: "Bob" },\n];\nconsole.log(findById(users, 1));\nconsole.log(groupById(users));`,
            blanks: [
              {
                id: 'find-by-id',
                label: 'findById',
                correctTokens: ['function', 'findById', '<T', 'extends', '{', 'id', ':', 'number', '}>', '(', 'items', ':', 'T[]', ',', 'id', ':', 'number', ')', ':', 'T', '|', 'undefined', '{', 'return', 'items.find', '(', 'item', '=>', 'item.id', '===', 'id', ')', '}'],
                distractorTokens: ['any', 'object', 'Partial', 'Map'],
              },
              {
                id: 'group-by-id',
                label: 'groupById',
                correctTokens: ['function', 'groupById', '<T', 'extends', '{', 'id', ':', 'number', '}>', '(', 'items', ':', 'T[]', ')', ':', 'Record<number, T>', '{', 'const', 'map', '=', '{} as Record<number, T>', 'items.forEach', '(', 'item', '=>', '{', 'map[item.id]', '=', 'item', '}', ')', 'return', 'map', '}'],
                distractorTokens: ['Array', 'Set', 'WeakMap', 'JSON.stringify'],
              },
            ],
          },
      },
    ],
  },
}
