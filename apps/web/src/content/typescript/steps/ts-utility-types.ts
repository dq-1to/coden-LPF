import type { LearningStepContent } from '@/content/fundamentals/steps'

export const tsUtilityTypesStep: LearningStepContent = {
  id: 'ts-utility-types',
  order: 26,
  title: 'ユーティリティ型',
  summary: 'Partial/Required/Readonly/Pick/Omit/Record/ReturnType/Parameters など、TypeScript組み込みのユーティリティ型を学ぶ。',
  readMarkdown: `# ユーティリティ型：既存の型を変換する

TypeScriptには型を変換・加工するための組み込みユーティリティ型が揃っています。

## Partial<T>：全プロパティを省略可能に

\`\`\`ts
interface User {
  id: number;
  name: string;
  email: string;
}

type UserUpdate = Partial<User>;
// { id?: number; name?: string; email?: string }

function updateUser(id: number, updates: Partial<User>) {
  // updates には User の一部のプロパティだけ渡せる
}
updateUser(1, { name: "Bob" }); // OK（idもemailも省略可能）
\`\`\`

## Required<T>：全プロパティを必須に

Partial の逆で、すべての ? を除去します。

\`\`\`ts
interface Config {
  host?: string;
  port?: number;
}

type StrictConfig = Required<Config>;
// { host: string; port: number } — 必須になる
\`\`\`

## Readonly<T>：全プロパティを読み取り専用に

\`\`\`ts
type ReadonlyUser = Readonly<User>;
// { readonly id: number; readonly name: string; readonly email: string }

const user: ReadonlyUser = { id: 1, name: "Alice", email: "alice@example.com" };
user.name = "Bob"; // エラー！
\`\`\`

## Pick<T, K>：指定プロパティだけを抽出

\`\`\`ts
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string }

// Omit と使い分け: 残す数が少ない → Pick、削る数が少ない → Omit
\`\`\`

## Omit<T, K>：指定プロパティを除外

\`\`\`ts
type PublicUser = Omit<User, "email">;
// { id: number; name: string } — email が除外される

type NewUser = Omit<User, "id">;
// { name: string; email: string } — id を除外（新規作成時に使う）
\`\`\`

## Record<K, V>：キーと値の型を指定したオブジェクト型

\`\`\`ts
type Role = "admin" | "editor" | "viewer";
type Permission = "read" | "write" | "delete";

type RolePermissions = Record<Role, Permission[]>;
// { admin: Permission[]; editor: Permission[]; viewer: Permission[] }

const permissions: RolePermissions = {
  admin:  ["read", "write", "delete"],
  editor: ["read", "write"],
  viewer: ["read"],
};
\`\`\`

## ReturnType<T>：関数の戻り値型を取得

\`\`\`ts
function getUser() {
  return { id: 1, name: "Alice" };
}

type UserShape = ReturnType<typeof getUser>;
// { id: number; name: string }

// 関数の戻り値型を別の場所で再利用したい場合に便利
\`\`\`

## Parameters<T>：関数の引数型をタプルで取得

\`\`\`ts
function createPost(title: string, content: string, tags: string[]) { /* ... */ }

type CreatePostArgs = Parameters<typeof createPost>;
// [string, string, string[]]

type FirstArg = Parameters<typeof createPost>[0];
// string （title の型）
\`\`\`

## 組み合わせて使う

\`\`\`ts
// フォームの入力状態: 全フィールドを省略可能＋読み取り専用
type FormState = Readonly<Partial<User>>;

// DBに保存済みのユーザー: id は必須、他は Partial
type StoredUser = Required<Pick<User, "id">> & Partial<Omit<User, "id">>;
\`\`\`
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: 'フォームの更新処理で「User の一部のフィールドだけ受け取りたい」場合、使うべきユーティリティ型は？',
      answer: 'Partial',
      hint: '「部分的な」を意味する英単語です。',
      explanation: 'Partial<T>はすべてのプロパティを省略可能（?）にします。フォーム更新やオプション引数に便利です。',
      choices: ['Partial', 'Required', 'Pick', 'Omit'],
    },
    {
      id: 'q2',
      prompt: '`Pick<User, "id" | "name">` の結果として得られる型のプロパティは？',
      answer: 'id と name',
      hint: '第2引数で指定したプロパティ名が残ります。',
      explanation: 'Pick<T, K>はTの中からKで指定したプロパティだけを抽出した型を作ります。',
      choices: ['id と name', 'id と email', 'name と email', 'id のみ'],
    },
    {
      id: 'q3',
      prompt: '`Record<"admin" | "user", string[]>` はどのような型になる？',
      answer: '{ admin: string[]; user: string[] }',
      hint: 'Record<K, V> はキーがK、値がVのオブジェクト型です。',
      explanation: 'Record<K, V>はキーの型KとバリューのVを組み合わせたオブジェクト型を作ります。',
      choices: [
        '{ admin: string[]; user: string[] }',
        'string[][]',
        'Map<string, string[]>',
        '{ [key: string]: string[] }',
      ],
    },
    {
      id: 'q4',
      prompt: '`ReturnType<typeof someFunc>` が有用なのは、どのような場面？',
      answer: '関数の戻り値型を別の場所で再利用したいとき',
      hint: '関数の実装を変えたとき、それに依存する型が自動で更新される利点があります。',
      explanation: 'ReturnType<T>は関数の戻り値型を取得します。関数の実装が変わると型も自動的に更新されるため、型の二重管理を避けられます。',
      choices: [
        '関数の戻り値型を別の場所で再利用したいとき',
        '関数の引数を省略可能にしたいとき',
        '非同期関数の型を定義したいとき',
        '関数をオーバーロードしたいとき',
      ],
    },
    {
      id: 'q5',
      prompt: '`Omit<User, "password">` が有用なのは、どのような場面？',
      answer: '機密情報を除いた公開用の型を作るとき',
      hint: 'セキュリティ上、外部に見せてはいけないフィールドを除外します。',
      explanation: 'Omit<T, K>はTからKを除外した型を作ります。パスワードなどの機密フィールドを除いたPublicUser型を作る際によく使われます。',
      choices: [
        '機密情報を除いた公開用の型を作るとき',
        'フィールドを追加するとき',
        'すべてのフィールドを必須にするとき',
        'ユニオン型を作るとき',
      ],
    },
  ],
  testTask: {
    instruction: '`UpdateUser` 型を定義してください。`User` の全プロパティを省略可能にするユーティリティ型を使います。',
    starterCode: `interface User {
  id: number;
  name: string;
  email: string;
}

type UpdateUser = ____<User>`,
    expectedKeywords: ['Partial'],
    explanation: 'Partial<User>はUserの全プロパティをオプショナル（?付き）にした型を作ります。これでフォーム更新時に一部フィールドだけ渡せるようになります。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'ts-utility-types-1',
        prompt: '`Omit` を使ってプロフィール公開用の型を設計してください。',
        requirements: [
          '`id: number`, `name: string`, `email: string`, `passwordHash: string`, `role: "admin" | "user"` を持つ `UserRecord` を定義する',
          '`Omit` で `passwordHash` を除いた `PublicProfile` 型を定義する',
          '`toPublicProfile(user: UserRecord): PublicProfile` 関数を実装する',
        ],
        hints: [
          'Omit<UserRecord, "passwordHash"> で passwordHash を除外できます',
          'toPublicProfile は UserRecord から passwordHash を除いたオブジェクトを返します',
          '`const { passwordHash: _, ...rest } = user` でスプレッドを使って除外できます',
        ],
        expectedKeywords: ['UserRecord', 'PublicProfile', 'Omit', 'passwordHash', 'toPublicProfile'],
        starterCode: `// TODO: UserRecord 型を定義してください

// TODO: Omit を使って PublicProfile 型を定義してください

// TODO: toPublicProfile 関数を実装してください
function toPublicProfile(user: UserRecord): PublicProfile {
  // TODO: passwordHash を除いたオブジェクトを返す
}

const user: UserRecord = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  passwordHash: "hash_secret",
  role: "user",
};
const profile = toPublicProfile(user);
console.log(profile); // { id: 1, name: "Alice", email: "alice@example.com", role: "user" }`,
      },
      {
        id: 'ts-utility-types-2',
        prompt: '`Record` を使ってロール別権限マップを設計してください。',
        requirements: [
          '`"admin" | "editor" | "viewer"` のユニオン型 `Role` を定義する',
          '`"read" | "write" | "delete"` のユニオン型 `Permission` を定義する',
          '`Record<Role, Permission[]>` 型の `rolePermissions` オブジェクトを定義する',
          '`hasPermission(role: Role, perm: Permission): boolean` 関数を実装する',
        ],
        hints: [
          'rolePermissions の値は admin: ["read","write","delete"], editor: ["read","write"], viewer: ["read"] とする',
          'hasPermission は rolePermissions[role].includes(perm) で判定できます',
        ],
        expectedKeywords: ['Role', 'Permission', 'Record', 'rolePermissions', 'hasPermission'],
        starterCode: `// TODO: Role と Permission 型を定義してください

// TODO: Record<Role, Permission[]> 型の rolePermissions を定義してください

// TODO: hasPermission 関数を実装してください
function hasPermission(role: Role, perm: Permission): boolean {
  // TODO: 実装
}

console.log(hasPermission("admin", "delete"));  // true
console.log(hasPermission("viewer", "write"));  // false
console.log(hasPermission("editor", "read"));   // true`,
      },
    ],
  },
}
