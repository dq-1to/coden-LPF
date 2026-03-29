import type { LearningStepContent } from '@/content/fundamentals/steps'

export const tsTypesStep: LearningStepContent = {
  id: 'ts-types',
  order: 21,
  title: '型の基礎',
  summary: 'TypeScriptの型注釈・プリミティブ型・型推論・リテラル型を学び、型安全なコードの書き方を理解する。',
  readMarkdown: `# TypeScriptの型システム入門

## TypeScriptとは？

TypeScriptは、JavaScriptに**型システム**を追加した言語です。型を明示することで、コードを書いている段階でバグを検出できます。

\`\`\`ts
// JavaScript（エラーは実行時に発生）
function greet(name) {
  return "Hello, " + name.toUpperCase();
}
greet(42); // 実行時エラー: name.toUpperCase is not a function

// TypeScript（エラーをコンパイル時に検出）
function greet(name: string) {
  return "Hello, " + name.toUpperCase();
}
greet(42); // コンパイルエラー: Argument of type 'number' is not assignable to parameter of type 'string'
\`\`\`

## プリミティブ型

TypeScriptには3つの基本型があります。

\`\`\`ts
let name: string = "Alice";      // 文字列
let age: number = 30;            // 数値（整数・小数どちらも）
let isActive: boolean = true;    // 真偽値
\`\`\`

## 型推論：書かなくていい場合

変数に初期値を代入すると、TypeScriptは型を自動で推論します。

\`\`\`ts
let name = "Alice";   // TypeScript が string と推論
let age = 30;         // number と推論
let flag = true;      // boolean と推論

name = 42;            // エラー！string 型に number は代入できない
\`\`\`

型推論が働く場合は型注釈を省略できます。ただし、関数の引数には明示が必要です。

## 配列型

\`\`\`ts
let names: string[] = ["Alice", "Bob", "Carol"];
let scores: number[] = [90, 85, 78];

// または Array<T> 記法
let ids: Array<number> = [1, 2, 3];
\`\`\`

## any 型の危険性

\`any\` は型チェックを無効化するエスケープハッチです。使用は最小限にしてください。

\`\`\`ts
let value: any = "hello";
value = 42;           // OK（型チェックなし）
value.toUpperCase();  // コンパイルは通るが実行時エラーの可能性

// ✅ unknown を使えばより安全
let input: unknown = getUserInput();
if (typeof input === "string") {
  console.log(input.toUpperCase()); // 型ガード後は安全
}
\`\`\`

## リテラル型

具体的な値そのものを型として使えます。

\`\`\`ts
let direction: "left" | "right" | "up" | "down";
direction = "left";   // OK
direction = "left";   // OK
direction = "diagonal"; // エラー！型に含まれない値

type Status = "pending" | "active" | "inactive";
let userStatus: Status = "active";
\`\`\`

リテラル型は後で学ぶ**ユニオン型**と組み合わせて、取りうる値を制限するのに役立ちます。
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '`let name: ____ = "Alice"` の空欄に入る型名は？',
      answer: 'string',
      hint: 'ダブルクォートで囲まれた値の型です。',
      explanation: 'ダブルクォートまたはシングルクォートで囲まれた値はstring型です。',
      choices: ['string', 'number', 'boolean', 'text'],
    },
    {
      id: 'q2',
      prompt: '`let count = 0` と書いた場合、TypeScriptが推論する型は？',
      answer: 'number',
      hint: '初期値から型が自動的に決まります。',
      explanation: '初期値が数値リテラルなので、TypeScriptはnumber型と推論します。',
      choices: ['number', 'string', 'any', 'integer'],
    },
    {
      id: 'q3',
      prompt: '`string[]` と同じ意味を持つ別の配列型の書き方は？',
      answer: 'Array<string>',
      hint: 'ジェネリクス記法を使います。Array<型> の形です。',
      explanation: 'string[] と Array<string> は完全に同じ意味です。どちらを使っても構いません。',
      choices: ['Array<string>', 'String[]', 'string()', '[string]'],
    },
    {
      id: 'q4',
      prompt: '型チェックを無効化する「エスケープハッチ」として機能する型名は？ただし使用は非推奨です。',
      answer: 'any',
      hint: '「どんな型でもOK」という意味の3文字の型名です。',
      explanation: 'any型はすべての型チェックを無効化します。使用するとTypeScriptの型安全性のメリットが失われます。',
      choices: ['any', 'unknown', 'never', 'void'],
    },
    {
      id: 'q5',
      prompt: '`type Direction = "left" | "right"` のように、具体的な値そのものを型として使う型を何と呼ぶ？',
      answer: 'リテラル型',
      hint: '「文字そのまま」という意味の言葉です。',
      explanation: 'リテラル型は具体的な値（"left"、42、trueなど）を型として使います。ユニオン型と組み合わせて取りうる値を制限できます。',
      choices: ['リテラル型', 'ユニオン型', '文字列型', 'プリミティブ型'],
    },
  ],
  testTask: {
    instruction: '`greet` 関数の引数と戻り値に型注釈を追加してください。`name` は文字列を受け取り、文字列を返します。',
    starterCode: `function greet(name: ____): ____ {
  return "Hello, " + name;
}`,
    expectedKeywords: ['string'],
    explanation: '引数 name は string 型、戻り値も string 型です。戻り値型は推論に任せることもできますが、明示することで意図が明確になります。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'ts-types-1',
        prompt: '商品データを表す型と、それを使った関数を定義してください。',
        requirements: [
          'name(string), price(number), inStock(boolean) を持つ Product 型を定義する',
          '`formatProduct(product: Product): string` 関数を実装する',
          '戻り値は `"商品名: xxx, 価格: ¥yyy"` の形式にする',
          '在庫がない場合は末尾に `" (在庫なし)"` を追加する',
        ],
        hints: [
          'type または interface で Product を定義できます',
          'テンプレートリテラル（バッククォート）を使うと文字列の組み立てが便利です',
          'inStock が false の場合の条件分岐を忘れずに',
        ],
        expectedKeywords: ['Product', 'string', 'number', 'boolean', 'formatProduct'],
        starterCode: `// TODO: Product 型を定義してください

// TODO: formatProduct 関数を実装してください
function formatProduct(product: Product): string {
  // TODO: 実装
}

// 動作確認
const apple: Product = { name: "りんご", price: 150, inStock: true };
const soldOut: Product = { name: "みかん", price: 100, inStock: false };
console.log(formatProduct(apple));   // "商品名: りんご, 価格: ¥150"
console.log(formatProduct(soldOut)); // "商品名: みかん, 価格: ¥100 (在庫なし)"`,
      },
      {
        id: 'ts-types-2',
        prompt: 'リテラル型ユニオンを使ったステータス管理関数を実装してください。',
        requirements: [
          '`"pending" | "active" | "inactive"` のユニオンリテラル型 `UserStatus` を定義する',
          '`getStatusLabel(status: UserStatus): string` 関数を実装する',
          'pending → "審査中"、active → "有効"、inactive → "無効" を返す',
        ],
        hints: [
          'type UserStatus = ... でリテラル型ユニオンを定義します',
          'switch文またはオブジェクトマップで分岐できます',
        ],
        expectedKeywords: ['UserStatus', 'pending', 'active', 'inactive', 'getStatusLabel'],
        starterCode: `// TODO: UserStatus 型を定義してください

// TODO: getStatusLabel 関数を実装してください
function getStatusLabel(status: UserStatus): string {
  // TODO: 実装
}

console.log(getStatusLabel("pending"));  // "審査中"
console.log(getStatusLabel("active"));   // "有効"
console.log(getStatusLabel("inactive")); // "無効"`,
      },
    ],
  },
}
