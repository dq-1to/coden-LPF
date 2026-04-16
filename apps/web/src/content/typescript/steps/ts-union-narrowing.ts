import type { LearningStepContent } from '@/content/fundamentals/steps'

export const tsUnionNarrowingStep: LearningStepContent = {
  id: 'ts-union-narrowing',
  order: 24,
  title: 'ユニオン型と型ガード',
  summary: 'ユニオン型・型ガード（typeof/in/instanceof）・判別共用体・never型による網羅性チェックを学ぶ。',
  readMarkdown: `# ユニオン型と型ガード

## ユニオン型：複数の型を受け入れる

\`|\` を使って「この型またはあの型」を表現できます。

\`\`\`ts
function formatId(id: string | number): string {
  return String(id);
}

formatId("abc-123"); // OK
formatId(42);        // OK
formatId(true);      // エラー！boolean はユニオンにない
\`\`\`

## なぜ型ガードが必要か？

ユニオン型の変数には、共通するメソッドしか呼べません。

\`\`\`ts
function process(value: string | number) {
  value.toUpperCase(); // エラー！number に toUpperCase はない
  value.toFixed(2);    // エラー！string に toFixed はない
}
\`\`\`

型ガードで型を絞り込む（narrow）ことで、安全にメソッドを呼べます。

## typeof ガード

プリミティブ型の絞り込みに使います。

\`\`\`ts
function process(value: string | number): string {
  if (typeof value === "string") {
    return value.toUpperCase(); // ここでは string 確定
  }
  return value.toFixed(2); // ここでは number 確定
}
\`\`\`

## truthiness ガード

null / undefined を除外できます。

\`\`\`ts
function greet(name: string | null): string {
  if (name) {
    return \`Hello, \${name}!\`; // name は string 確定
  }
  return "Hello, Guest!";
}
\`\`\`

## in ガード

オブジェクト型のプロパティ存在チェックに使います。

\`\`\`ts
interface Cat { meow(): void }
interface Dog { bark(): void }

function makeSound(animal: Cat | Dog): void {
  if ("meow" in animal) {
    animal.meow(); // Cat 確定
  } else {
    animal.bark(); // Dog 確定
  }
}
\`\`\`

## instanceof ガード

クラスのインスタンス確認に使います。

\`\`\`ts
function formatError(error: Error | string): string {
  if (error instanceof Error) {
    return error.message; // Error 確定
  }
  return error; // string 確定
}
\`\`\`

## 判別共用体（Discriminated Union）

共通の**リテラル型プロパティ**を持つユニオン型です。switch 文と組み合わせると強力です。

\`\`\`ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2; // radius が使える
    case "rectangle":
      return shape.width * shape.height;  // width/height が使える
  }
}
\`\`\`

## never 型と網羅性チェック

\`never\` は「到達不能」を表す型です。判別共用体の switch 文でケース漏れを検出できます。

\`\`\`ts
function assertNever(x: never): never {
  throw new Error(\`Unexpected value: \${JSON.stringify(x)}\`);
}

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":    return Math.PI * shape.radius ** 2;
    case "rectangle": return shape.width * shape.height;
    default:          return assertNever(shape); // ケース漏れがあるとコンパイルエラー
  }
}
\`\`\`
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '`function f(v: string | number)` 内で `v.toUpperCase()` を呼ぶとエラーになる。正しく呼ぶには `if (____ v === "string")` のように型ガードが必要。空欄は？',
      answer: 'typeof',
      hint: 'プリミティブ型を判定するJavaScriptの演算子です。',
      explanation: 'typeofはプリミティブ型（string/number/boolean等）を実行時に確認する演算子です。TypeScriptはtypeofの結果を使って型を絞り込みます。',
      choices: ['typeof', 'instanceof', 'in', 'is'],
    },
    {
      id: 'q2',
      prompt: 'オブジェクトにプロパティが存在するか確認する型ガードの構文は `"propName" ____ obj` の形。空欄は？',
      answer: 'in',
      hint: '「〜の中に」を意味する2文字の英単語です。',
      explanation: '`"propName" in obj` はオブジェクトに指定したプロパティが存在するかチェックします。TypeScriptはこの結果で型を絞り込みます。',
      choices: ['in', 'of', 'has', 'instanceof'],
    },
    {
      id: 'q3',
      prompt: '判別共用体で各型を区別するための「共通のリテラル型プロパティ」を一般的に何と呼ぶ？',
      answer: 'タグ',
      hint: '「種類」「識別子」を意味する、kind や type という名前がよく使われます。',
      explanation: '判別共用体では kind, type, tag などの共通プロパティにリテラル型を使い、switch文でそれぞれを区別します。このプロパティを「タグ（discriminant）」と呼びます。',
      choices: ['タグ', 'キー', 'ラベル', 'フラグ'],
    },
    {
      id: 'q4',
      prompt: '`never` 型を使った `assertNever(x: never)` 関数をswitch のdefaultケースに置くと、何を防げる？',
      answer: 'ケース漏れ',
      hint: '新しい型のバリアントを追加したとき、対応を忘れると困るのは？',
      explanation: 'assertNeverをdefaultに置くと、新しいケース（例: triangle）を追加してswitch文を更新し忘れた場合にコンパイルエラーが発生します。これを「網羅性チェック（exhaustive check）」と呼びます。',
      choices: ['ケース漏れ', '型の変換', 'null参照', 'スタックオーバーフロー'],
    },
    {
      id: 'q5',
      prompt: '`if (error instanceof Error)` の型ガードで絞り込める型は？',
      answer: 'Error',
      hint: '`instanceof` は何のインスタンスかを確認します。',
      explanation: 'instanceofはクラスのインスタンスかどうかを確認します。trueのブランチではそのクラスの型として扱われます。',
      choices: ['Error', 'string', 'object', 'unknown'],
    },
  ],
  testTask: {
    instruction: '`processValue` 関数内で `typeof` を使って型ガードを追加し、string の場合は大文字に変換してください。',
    starterCode: `function processValue(value: string | number): string {
  if (____ value === 'string') {
    return value.toUpperCase();
  }
  return String(value);
}`,
    expectedKeywords: ['typeof'],
    explanation: '`typeof value === "string"` で型ガードを適用すると、if ブロック内では value が string 型として扱われ、.toUpperCase() を安全に呼び出せます。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'ts-union-narrowing-1',
        prompt: 'APIレスポンスを表す判別共用体を設計してください。',
        requirements: [
          '`{ status: "success"; data: string }` と `{ status: "error"; message: string }` のユニオン型 `ApiResponse` を定義する',
          '`handleResponse(res: ApiResponse): string` 関数を実装する',
          'status で分岐し、success なら `"データ: " + res.data`、error なら `"エラー: " + res.message` を返す',
        ],
        hints: [
          '判別共用体は共通のリテラル型プロパティ（ここでは status）で型を絞り込みます',
          'switch (res.status) または if (res.status === "success") で分岐できます',
        ],
        expectedKeywords: ['ApiResponse', 'success', 'error', 'handleResponse'],
        starterCode: `// TODO: ApiResponse 型を定義してください

// TODO: handleResponse 関数を実装してください
function handleResponse(res: ApiResponse): string {
  // TODO: status で分岐して実装
}

const ok: ApiResponse = { status: "success", data: "ユーザー情報" };
const ng: ApiResponse = { status: "error", message: "認証エラー" };
console.log(handleResponse(ok)); // "データ: ユーザー情報"
console.log(handleResponse(ng)); // "エラー: 認証エラー"`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `____0\n\nfunction handleResponse(res: ApiResponse): string {\n  ____1\n}\n\nconst ok: ApiResponse = { status: "success", data: "ユーザー情報" };\nconst ng: ApiResponse = { status: "error", message: "認証エラー" };\nconsole.log(handleResponse(ok));\nconsole.log(handleResponse(ng));`,
            blanks: [
              {
                id: 'api-response',
                label: 'ApiResponse型',
                correctTokens: ['type', 'ApiResponse', '=', '{', 'status', ':', "'success'", ';', 'data', ':', 'string', '}', '|', '{', 'status', ':', "'error'", ';', 'message', ':', 'string', '}'],
                distractorTokens: ['interface', 'enum', 'class', 'typeof'],
              },
              {
                id: 'handle-body',
                label: '分岐処理',
                correctTokens: ['if', '(', 'res.status', '===', "'success'", ')', '{', 'return', "'データ: '", '+', 'res.data', '}', 'return', "'エラー: '", '+', 'res.message'],
                distractorTokens: ['try', 'catch', 'switch', 'res.type'],
              },
            ],
          },
      },
      {
        id: 'ts-union-narrowing-2',
        prompt: '図形の面積を計算する関数を、網羅性チェック付きで実装してください。',
        requirements: [
          '`{ kind: "circle"; radius: number }` と `{ kind: "rectangle"; width: number; height: number }` のユニオン型 `Shape` を定義する',
          '`getArea(shape: Shape): number` を switch 文で実装する',
          'default ケースに `assertNever(shape)` を置いて網羅性チェックをする',
          '`function assertNever(x: never): never { throw new Error(...) }` を実装する',
        ],
        hints: [
          'circle の面積: Math.PI * radius ** 2',
          'rectangle の面積: width * height',
          'assertNever の引数に never 型を指定することで、ケース漏れをコンパイル時に検出できます',
        ],
        expectedKeywords: ['Shape', 'circle', 'rectangle', 'getArea', 'assertNever', 'never'],
        starterCode: `// TODO: Shape 型を定義してください

// TODO: assertNever 関数を実装してください
function assertNever(x: never): never {
  throw new Error(\`Unexpected shape: \${JSON.stringify(x)}\`);
}

// TODO: getArea 関数を switch 文で実装してください
function getArea(shape: Shape): number {
  switch (shape.kind) {
    // TODO: circle, rectangle のケースを実装
    default:
      return assertNever(shape);
  }
}

console.log(getArea({ kind: "circle", radius: 5 }));               // ~78.54
console.log(getArea({ kind: "rectangle", width: 4, height: 6 }));  // 24`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `____0\n\n____1\n\nfunction getArea(shape: Shape): number {\n  switch (shape.kind) {\n    ____2\n    default:\n      return assertNever(shape);\n  }\n}\n\nconsole.log(getArea({ kind: "circle", radius: 5 }));\nconsole.log(getArea({ kind: "rectangle", width: 4, height: 6 }));`,
            blanks: [
              {
                id: 'shape-type',
                label: 'Shape型',
                correctTokens: ['type', 'Shape', '=', '{', 'kind', ':', "'circle'", ';', 'radius', ':', 'number', '}', '|', '{', 'kind', ':', "'rectangle'", ';', 'width', ':', 'number', ';', 'height', ':', 'number', '}'],
                distractorTokens: ['typeof', 'instanceof', 'enum', 'any'],
              },
              {
                id: 'assert-never',
                label: 'assertNever',
                correctTokens: ['function', 'assertNever', '(', 'x', ':', 'never', ')', ':', 'never', '{', 'throw', 'new', 'Error', '(', '`Unexpected: ${x}`', ')', '}'],
                distractorTokens: ['void', 'undefined', 'unknown', 'any'],
              },
              {
                id: 'switch-cases',
                label: 'caseブロック',
                correctTokens: ['case', "'circle'", ':', 'return', 'Math.PI', '*', 'shape.radius', '**', '2', 'case', "'rectangle'", ':', 'return', 'shape.width', '*', 'shape.height'],
                distractorTokens: ['shape.size', 'shape.area', 'Math.sqrt', 'shape.length'],
              },
            ],
          },
      },
    ],
  },
}
