import type { LearningStepContent } from '@/content/fundamentals/steps'

export const tsObjectsStep: LearningStepContent = {
  id: 'ts-objects',
  order: 23,
  title: 'オブジェクト型',
  summary: 'interface・type alias・readonly・オプショナルプロパティ・Intersection型・タプル型を学ぶ。',
  readMarkdown: `# TypeScriptのオブジェクト型定義

## interface：オブジェクトの形を定義する

\`interface\` はオブジェクトが持つプロパティの名前と型を定義します。

\`\`\`ts
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
};
\`\`\`

## type alias：型に名前を付ける

\`type\` キーワードでも同様にオブジェクト型を定義できます。

\`\`\`ts
type Point = {
  x: number;
  y: number;
};

const origin: Point = { x: 0, y: 0 };
\`\`\`

## interface vs type：使い分けの基準

| 特徴 | interface | type |
|------|-----------|------|
| 拡張（継承） | \`extends\` で可能 | \`&\` で可能 |
| 宣言マージ | ✅ 可能 | ❌ 不可 |
| プリミティブ型の別名 | ❌ 不可 | ✅ 可能 |
| ユニオン型 | ❌ 不可 | ✅ 可能 |

**実務の指針**: オブジェクト型には \`interface\` を優先し、ユニオン型や複雑な型操作には \`type\` を使う。

## readonly：変更不可プロパティ

\`readonly\` を付けると、そのプロパティへの再代入を禁止できます。

\`\`\`ts
interface Config {
  readonly apiUrl: string;
  timeout: number;
}

const config: Config = { apiUrl: "https://api.example.com", timeout: 5000 };
config.timeout = 10000;    // OK
config.apiUrl = "other";   // エラー！readonly なので変更不可
\`\`\`

## オプショナルプロパティ（?）

\`?\` を付けたプロパティは省略可能です。型は \`型 | undefined\` になります。

\`\`\`ts
interface Post {
  id: number;
  title: string;
  content: string;
  publishedAt?: Date;  // 省略可能
}

const draft: Post = { id: 1, title: "下書き", content: "..." };
// publishedAt は省略してもOK
\`\`\`

## interface の extends（拡張）

既存の interface を継承して新しい型を作れます。

\`\`\`ts
interface Animal {
  name: string;
  age: number;
}

interface Dog extends Animal {
  breed: string;
}

const dog: Dog = { name: "ポチ", age: 3, breed: "柴犬" };
\`\`\`

## Intersection 型（&）

複数の型を結合して、すべてのプロパティを持つ型を作ります。

\`\`\`ts
type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type UserWithTimestamp = User & Timestamped;
// id, name, email, createdAt, updatedAt をすべて持つ
\`\`\`

## タプル型

要素数と各要素の型が固定された配列です。

\`\`\`ts
type StringNumberPair = [string, number];

const pair: StringNumberPair = ["Alice", 30];
const [name, age] = pair;  // 分割代入でも型が保たれる

// 配列との違い
const arr: string[] = ["a", "b", "c"];    // 要素数不定、全要素が string
const tuple: [string, number] = ["x", 1]; // 2要素固定、型が異なる
\`\`\`
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '`interface Animal { name: string }` を継承して `breed: string` を追加する Dog interface の書き方は？',
      answer: 'interface Dog extends Animal { breed: string }',
      hint: '`extends` キーワードを使います。',
      explanation: 'interfaceはextendsで別のinterfaceを継承できます。継承した型のプロパティをすべて引き継ぎます。',
    },
    {
      id: 'q2',
      prompt: '`interface Config { ____ apiUrl: string }` — 再代入を禁止するキーワードは？',
      answer: 'readonly',
      hint: '「読み取り専用」を意味する英単語です。',
      explanation: 'readonlyを付けると、そのプロパティへの代入をコンパイル時に禁止できます。',
      choices: ['readonly', 'const', 'final', 'immutable'],
    },
    {
      id: 'q3',
      prompt: '`interface Post { publishedAt____ : Date }` — プロパティを省略可能にする記号は？',
      answer: '?',
      hint: '関数のオプショナル引数と同じ記号です。',
      explanation: 'プロパティ名の後に?を付けるとオプショナルプロパティになります。型はDate | undefinedになります。',
      choices: ['?', '!', '*', '~'],
    },
    {
      id: 'q4',
      prompt: '`type AB = TypeA ____ TypeB` — 2つの型のすべてのプロパティを持つ型を作るIntersection演算子は？',
      answer: '&',
      hint: '論理AND演算子に使われる記号です。',
      explanation: '& (Intersection型) は2つの型のすべてのプロパティを持つ新しい型を作ります。',
      choices: ['&', '|', '+', ','],
    },
    {
      id: 'q5',
      prompt: '`type Pair = [string, number]` のように要素数と各要素の型が固定された配列型を何と呼ぶ？',
      answer: 'タプル型',
      hint: '固定長の順序付きコレクションを表す型です。',
      explanation: 'タプル型は要素数と各位置の型が決まっている配列です。string[]のような通常の配列型と違い、各要素の型が個別に決まります。',
      choices: ['タプル型', '配列型', 'ユニオン型', '固定型'],
    },
  ],
  testTask: {
    instruction: '`User` interface を定義してください。`readonly id: number` と `name: string` を持ちます。',
    starterCode: `interface User {
  ____ id: number;
  name: string;
}

const user: User = { id: 1, name: "Alice" };
// user.id = 2; // これがコンパイルエラーになることを確認`,
    expectedKeywords: ['readonly'],
    explanation: 'readonlyを付けることで、一度設定したidを後から変更できなくなります。これはデータの不変性を保証するために使われます。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'ts-objects-1',
        prompt: 'ブログ記事を表す interface を設計してください。',
        requirements: [
          '`Article` interface を定義する: `readonly id: number`, `title: string`, `content: string`, `tags: string[]`, `publishedAt?: Date`',
          '`createDraft(title: string, content: string): Article` 関数を実装する',
          'id は Date.now() で生成、tags は空配列、publishedAt は省略',
        ],
        hints: [
          'readonlyプロパティは初期化時のみ設定できます',
          'オプショナルプロパティは返り値オブジェクトに含めなくてもOKです',
        ],
        expectedKeywords: ['Article', 'readonly', 'id', 'title', 'content', 'tags', 'createDraft'],
        starterCode: `// TODO: Article interface を定義してください

// TODO: createDraft 関数を実装してください
function createDraft(title: string, content: string): Article {
  // TODO: 実装
}

const draft = createDraft("TypeScriptの学習", "TypeScriptは型安全なJavaScriptです。");
console.log(draft.title);       // "TypeScriptの学習"
console.log(draft.tags);        // []
console.log(draft.publishedAt); // undefined`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `____0\n\nfunction createDraft(title: string, content: string): Article {\n  ____1\n}\n\nconst draft = createDraft("TypeScriptの学習", "TypeScriptは型安全なJavaScriptです。");\nconsole.log(draft.title);\nconsole.log(draft.tags);\nconsole.log(draft.publishedAt);`,
            blanks: [
              {
                id: 'article-interface',
                label: 'Article定義',
                correctTokens: ['interface', 'Article', '{', 'readonly', 'id', ':', 'number', ';', 'title', ':', 'string', ';', 'content', ':', 'string', ';', 'tags', ':', 'string[]', ';', 'publishedAt?', ':', 'Date', '}'],
                distractorTokens: ['type', 'class', 'const', 'mutable'],
              },
              {
                id: 'create-draft',
                label: 'createDraft',
                correctTokens: ['return', '{', 'id', ':', 'Date.now()', ',', 'title', ',', 'content', ',', 'tags', ':', '[', ']', '}'],
                distractorTokens: ['new Article()', 'Object.create', 'publishedAt', 'new Date()'],
              },
            ],
          },
      },
      {
        id: 'ts-objects-2',
        prompt: '`extends` を使って AdminUser 型を設計してください。',
        requirements: [
          '`id: number`, `name: string`, `email: string` を持つ `User` interface を定義する',
          '`User` を extends した `AdminUser` interface に `role: "admin"`, `permissions: string[]` を追加する',
          '`isAdmin(user: User | AdminUser): user is AdminUser` 型ガード関数を実装する（"role" in user で判定）',
        ],
        hints: [
          'interface AdminUser extends User { ... } で継承できます',
          '`"role" in user` で user に role プロパティがあるか判定できます',
          '戻り値型 `user is AdminUser` は型ガード（Type Predicate）と呼ばれます',
        ],
        expectedKeywords: ['User', 'AdminUser', 'extends', 'permissions', 'isAdmin'],
        starterCode: `// TODO: User interface を定義してください

// TODO: AdminUser interface を User から extends して定義してください

// TODO: isAdmin 型ガード関数を実装してください
function isAdmin(user: User | AdminUser): user is AdminUser {
  // TODO: "role" in user で判定
}

const regular: User = { id: 1, name: "Bob", email: "bob@example.com" };
const admin: AdminUser = { id: 2, name: "Alice", email: "alice@example.com", role: "admin", permissions: ["read", "write"] };

console.log(isAdmin(regular)); // false
console.log(isAdmin(admin));   // true`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\n____0\n\nfunction isAdmin(user: User | AdminUser): user is AdminUser {\n  ____1\n}\n\nconst regular: User = { id: 1, name: "Bob", email: "bob@example.com" };\nconst admin: AdminUser = { id: 2, name: "Alice", email: "alice@example.com", role: "admin", permissions: ["read", "write"] };\nconsole.log(isAdmin(regular));\nconsole.log(isAdmin(admin));`,
            blanks: [
              {
                id: 'admin-extends',
                label: 'AdminUser',
                correctTokens: ['interface', 'AdminUser', 'extends', 'User', '{', 'role', ':', "'admin'", ';', 'permissions', ':', 'string[]', '}'],
                distractorTokens: ['implements', 'typeof', 'instanceof', 'as'],
              },
              {
                id: 'is-admin',
                label: '型ガード',
                correctTokens: ['return', "'role'", 'in', 'user'],
                distractorTokens: ['typeof', 'instanceof', 'user.role', 'user as AdminUser'],
              },
            ],
          },
      },
    ],
  },
}
