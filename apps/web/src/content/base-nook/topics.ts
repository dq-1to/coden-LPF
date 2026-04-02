import type { BaseNookTopic } from './types'

export const BASE_NOOK_TOPICS: BaseNookTopic[] = [
  // ── 1. JavaScript ──────────────────────────────
  {
    id: 'javascript',
    title: 'JavaScriptって何？',
    summary: 'ブラウザで動くプログラミング言語',
    icon: 'FileCode',
    article: `## ひとことで言うと

JavaScriptは、**Webページに動きをつけるためのプログラミング言語**です。ボタンをクリックしたらメニューが開く、入力内容をリアルタイムにチェックするーーそうした「操作に反応する仕組み」はほぼすべてJavaScriptで作られています。

## もう少し詳しく

Webページは3つの技術で成り立っています。

- **HTML** — ページの「構造」を作る（見出し・段落・画像など）
- **CSS** — ページの「見た目」を整える（色・レイアウトなど）
- **JavaScript** — ページに「動き」を加える（操作への反応・データの取得など）

たとえるなら、HTMLが建物の骨組み、CSSが内装や外装、JavaScriptが電気や水道のような「動く仕組み」です。

JavaScriptはブラウザに最初から組み込まれているため、特別なソフトをインストールしなくても動きます。Chrome、Firefox、Safari、Edgeなど、すべての主要ブラウザがJavaScriptを実行できます。

## コードで見てみよう

\`\`\`js
// ボタンがクリックされたら「こんにちは！」と表示する
const button = document.querySelector("button");

button.addEventListener("click", () => {
  alert("こんにちは！");
});
\`\`\`

\`document.querySelector\` でHTMLのボタン要素を取得し、\`addEventListener\` でクリックイベントを監視しています。ユーザーがボタンを押すと、関数が実行されてアラートが表示されます。

## まとめ

- JavaScriptは **Webページに動きをつける** プログラミング言語
- HTML（構造）・CSS（見た目）と組み合わせて使う
- **ブラウザに組み込まれている** ので、すぐに動かせる`,
    questions: [
      {
        id: 'javascript-q01',
        text: 'JavaScriptの主な役割はどれですか？',
        choices: [
          { label: 'ページの構造（見出しや段落）を作る' },
          { label: 'ページの見た目（色やレイアウト）を整える' },
          { label: 'ページに動き（操作への反応など）をつける' },
          { label: 'ページの画像を圧縮する' },
        ],
        correctIndex: 2,
        explanation:
          'JavaScriptはWebページに「動き」を加える言語です。構造はHTML、見た目はCSSが担当します。',
      },
      {
        id: 'javascript-q02',
        text: 'Webページを構成する3つの技術の組み合わせとして正しいのはどれですか？',
        choices: [
          { label: 'HTML・CSS・Python' },
          { label: 'HTML・CSS・JavaScript' },
          { label: 'React・CSS・JavaScript' },
          { label: 'HTML・Sass・TypeScript' },
        ],
        correctIndex: 1,
        explanation:
          'Webページの基本はHTML（構造）・CSS（見た目）・JavaScript（動き）の3つです。',
      },
      {
        id: 'javascript-q03',
        text: 'JavaScriptを動かすために必要なものはどれですか？',
        choices: [
          { label: '専用のコンパイラソフト' },
          { label: 'Node.jsのインストール' },
          { label: 'Webブラウザ' },
          { label: '有料のライセンスキー' },
        ],
        correctIndex: 2,
        explanation:
          'JavaScriptはブラウザに組み込まれているため、ブラウザさえあれば動かせます。Node.jsはサーバー側の実行環境であり、ブラウザ上の実行には不要です。',
      },
      {
        id: 'javascript-q04',
        text: '「HTMLは建物の骨組み、CSSは内装」とたとえた場合、JavaScriptに最も近いのはどれですか？',
        choices: [
          { label: '建物の設計図' },
          { label: '建物の壁紙や照明の色' },
          { label: '電気や水道のような動く仕組み' },
          { label: '建物の住所' },
        ],
        correctIndex: 2,
        explanation:
          'JavaScriptは「動く仕組み」を担当します。ボタンを押して何かが起きる、データを取得して表示するなどの動的な処理です。',
      },
      {
        id: 'javascript-q05',
        text: 'document.querySelector("button") は何をしていますか？',
        choices: [
          { label: '新しいボタンを作成している' },
          { label: 'HTMLからボタン要素を取得している' },
          { label: 'ボタンを削除している' },
          { label: 'ボタンの色を変更している' },
        ],
        correctIndex: 1,
        explanation:
          'querySelector はHTML内から指定した要素を探して取得するメソッドです。ここでは <button> 要素を取得しています。',
      },
      {
        id: 'javascript-q06',
        text: 'addEventListener("click", ...) は何をしていますか？',
        choices: [
          { label: 'クリックイベントを削除している' },
          { label: '要素がクリックされたときに関数を実行する設定をしている' },
          { label: 'クリック回数をカウントしている' },
          { label: '要素を非表示にしている' },
        ],
        correctIndex: 1,
        explanation:
          'addEventListener はイベント（ここではクリック）が発生したときに、指定した関数を実行するよう登録するメソッドです。',
      },
      {
        id: 'javascript-q07',
        text: '次のうち、JavaScriptでできないことはどれですか？',
        choices: [
          { label: 'ボタンクリックに反応して表示を変える' },
          { label: 'サーバーからデータを取得して画面に表示する' },
          { label: 'HTMLファイル自体を直接書き換えてサーバーに保存する' },
          { label: 'フォームの入力内容をリアルタイムにチェックする' },
        ],
        correctIndex: 2,
        explanation:
          'ブラウザ上のJavaScriptはページの表示を操作できますが、サーバー上のHTMLファイル自体を直接書き換えることはできません。',
      },
      {
        id: 'javascript-q08',
        text: 'JavaScriptが動く環境として正しいのはどれですか？',
        choices: [
          { label: 'Chromeでのみ動く' },
          { label: 'Chrome・Firefox・Safari・Edgeなど主要ブラウザで動く' },
          { label: 'Safariでは動かない' },
          { label: 'Internet Explorerでのみ動く' },
        ],
        correctIndex: 1,
        explanation:
          'JavaScriptはすべての主要ブラウザ（Chrome、Firefox、Safari、Edge）で動作します。',
      },
      {
        id: 'javascript-q09',
        text: '次のうち、JavaScriptの特徴として正しいのはどれですか？',
        choices: [
          { label: 'コンパイルしてから実行する必要がある' },
          { label: 'ブラウザ上でリアルタイムに実行される' },
          { label: 'HTMLの中に書くことはできない' },
          { label: 'サーバー上でしか動かない' },
        ],
        correctIndex: 1,
        explanation:
          'JavaScriptはブラウザのJavaScriptエンジンがリアルタイムに解釈して実行します。事前のコンパイル作業は不要です。',
      },
      {
        id: 'javascript-q10',
        text: 'CSSが担当するのはどれですか？',
        choices: [
          { label: 'ページの構造を定義する' },
          { label: 'ページの見た目を整える' },
          { label: 'ページに動きをつける' },
          { label: 'データベースと通信する' },
        ],
        correctIndex: 1,
        explanation:
          'CSS（Cascading Style Sheets）はページの見た目（色・フォント・レイアウトなど）を担当します。構造はHTML、動きはJavaScriptです。',
      },
      {
        id: 'javascript-q11',
        text: 'alert("こんにちは！") を実行すると何が起きますか？',
        choices: [
          { label: 'コンソールにメッセージが表示される' },
          { label: 'ダイアログボックスにメッセージが表示される' },
          { label: 'ページ上にテキストが追加される' },
          { label: 'メールが送信される' },
        ],
        correctIndex: 1,
        explanation:
          'alert() はブラウザにダイアログボックス（ポップアップ）を表示する関数です。',
      },
      {
        id: 'javascript-q12',
        text: 'HTMLの役割として正しいのはどれですか？',
        choices: [
          { label: 'ページにアニメーションをつける' },
          { label: 'ページの構造（見出し・段落・リストなど）を定義する' },
          { label: 'ページの色やフォントを指定する' },
          { label: 'サーバーと通信する' },
        ],
        correctIndex: 1,
        explanation:
          'HTML（HyperText Markup Language）はページの構造を定義する言語です。見出し、段落、画像、リンクなどの要素を記述します。',
      },
    ],
  },

  // ── 2. JSX ─────────────────────────────────────
  {
    id: 'jsx',
    title: 'JSXって何？',
    summary: 'ReactでHTMLのようにUIを書く構文',
    icon: 'Code',
    article: `## ひとことで言うと

JSXは、**JavaScriptの中にHTMLのような記法でUIを書ける構文拡張**です。Reactでコンポーネントを作るときに使います。

## もう少し詳しく

従来のWeb開発では、HTMLファイルとJavaScriptファイルを分けて書くのが一般的でした。しかしWebが複雑になるにつれて、「このボタンの見た目」と「このボタンの動作」を別々のファイルで管理するのが大変になってきました。

Reactでは、**UIの見た目（マークアップ）とロジック（JavaScript）を同じ場所に書く**という考え方を採用しています。そのために使うのがJSXです。

JSXは見た目がHTMLに似ていますが、いくつかの重要なルールがあります。

- **1つの親要素で囲む** — 複数の要素を返すときは \`<div>\` や \`<>\`（フラグメント）で囲む
- **すべてのタグを閉じる** — \`<br />\`、\`<img />\` のように自己閉じタグにする
- **属性名はキャメルケース** — \`class\` → \`className\`、\`onclick\` → \`onClick\`

## コードで見てみよう

\`\`\`jsx
function Greeting() {
  const name = "太郎";

  return (
    <div>
      <h1>こんにちは、{name}さん！</h1>
      <p>今日も学習を頑張りましょう。</p>
    </div>
  );
}
\`\`\`

\`{name}\` のように**波括弧で囲む**と、JavaScript の値をJSXの中に埋め込めます。HTMLにはこの機能がないため、JSXならではの特徴です。

## まとめ

- JSXは **JavaScriptの中にHTMLのようにUIを書ける** 構文拡張
- Reactでは **UIの見た目とロジックを同じ場所** に書く
- **タグの閉じ忘れ禁止・キャメルケース属性** など、HTMLより厳格なルールがある`,
    questions: [
      {
        id: 'jsx-q01',
        text: 'JSXとは何ですか？',
        choices: [
          { label: 'HTMLの新しいバージョン' },
          { label: 'JavaScriptの中にHTMLのようにUIを書ける構文拡張' },
          { label: 'CSSをJavaScriptで記述する仕組み' },
          { label: 'サーバーサイドのテンプレートエンジン' },
        ],
        correctIndex: 1,
        explanation:
          'JSXはJavaScriptの構文拡張で、HTMLに似た記法でUIを記述できます。HTMLそのものではありません。',
      },
      {
        id: 'jsx-q02',
        text: 'ReactがJSXを採用している理由に最も近いのはどれですか？',
        choices: [
          { label: 'HTMLより処理速度が速いから' },
          { label: 'UIの見た目とロジックを同じ場所に書けるから' },
          { label: 'CSSを書く必要がなくなるから' },
          { label: 'ブラウザがJSXを直接解釈できるから' },
        ],
        correctIndex: 1,
        explanation:
          'Reactでは「UIの見た目（マークアップ）とロジック（JavaScript）を同じ場所に書く」考え方を採用しています。JSXはそれを実現するための構文です。',
      },
      {
        id: 'jsx-q03',
        text: 'JSXで複数の要素を返すときに正しい書き方はどれですか？',
        choices: [
          { label: 'そのまま並べて返す' },
          { label: '<div> や <> で1つの親要素にまとめて返す' },
          { label: '配列に入れて返す' },
          { label: 'return を複数回書く' },
        ],
        correctIndex: 1,
        explanation:
          'JSXでは1つのルート要素しか返せません。複数の要素がある場合は <div> や <>（フラグメント）で囲みます。',
      },
      {
        id: 'jsx-q04',
        text: 'HTMLの class 属性は、JSXではどう書きますか？',
        choices: [
          { label: 'class' },
          { label: 'className' },
          { label: 'cssClass' },
          { label: 'htmlClass' },
        ],
        correctIndex: 1,
        explanation:
          'JSXではJavaScriptの予約語との衝突を避けるため、class の代わりに className を使います。',
      },
      {
        id: 'jsx-q05',
        text: 'JSXの中でJavaScriptの値を表示するにはどうしますか？',
        choices: [
          { label: '{{value}} のように二重波括弧で囲む' },
          { label: '{value} のように波括弧で囲む' },
          { label: '${value} のようにドル記号と波括弧で囲む' },
          { label: 'そのまま変数名を書く' },
        ],
        correctIndex: 1,
        explanation:
          'JSXでは {式} の形で波括弧を使うと、JavaScriptの値や式を埋め込めます。テンプレートリテラルの ${} とは異なります。',
      },
      {
        id: 'jsx-q06',
        text: 'JSXで <img> タグを書くときの正しい形式はどれですか？',
        choices: [
          { label: '<img src="a.png">' },
          { label: '<img src="a.png" />' },
          { label: '<img src="a.png"></img>' },
          { label: '<image src="a.png" />' },
        ],
        correctIndex: 1,
        explanation:
          'JSXではすべてのタグを閉じる必要があります。<img> のような自己閉じタグは <img /> の形式で書きます。',
      },
      {
        id: 'jsx-q07',
        text: '次のJSXコードの問題点はどれですか？\n\nreturn (\n  <h1>タイトル</h1>\n  <p>本文</p>\n)',
        choices: [
          { label: 'タグが閉じられていない' },
          { label: '複数の要素が親要素で囲まれていない' },
          { label: '属性がキャメルケースになっていない' },
          { label: '波括弧が足りない' },
        ],
        correctIndex: 1,
        explanation:
          'JSXでは1つのルート要素しか返せません。<h1> と <p> を <div> や <> で囲む必要があります。',
      },
      {
        id: 'jsx-q08',
        text: 'JSXの <>...</> は何と呼ばれますか？',
        choices: [
          { label: 'テンプレート' },
          { label: 'フラグメント（Fragment）' },
          { label: 'ラッパー' },
          { label: 'コンテナ' },
        ],
        correctIndex: 1,
        explanation:
          '<>...</> はフラグメント（Fragment）と呼ばれ、余分なDOM要素を追加せずに複数の要素をグループ化できます。',
      },
      {
        id: 'jsx-q09',
        text: 'JSXが最終的に変換されるのは何ですか？',
        choices: [
          { label: 'HTML文字列' },
          { label: 'CSSスタイルシート' },
          { label: 'JavaScript の関数呼び出し' },
          { label: 'XMLドキュメント' },
        ],
        correctIndex: 2,
        explanation:
          'JSXはビルド時にJavaScriptの関数呼び出し（React.createElementなど）に変換されます。ブラウザはJSXを直接理解できません。',
      },
      {
        id: 'jsx-q10',
        text: 'JSXとHTMLの違いとして正しいのはどれですか？',
        choices: [
          { label: 'JSXではタグを閉じなくてもよい' },
          { label: 'JSXでは属性名にキャメルケースを使う' },
          { label: 'JSXではCSSを直接書ける' },
          { label: 'JSXではJavaScriptを使えない' },
        ],
        correctIndex: 1,
        explanation:
          'JSXでは onclick → onClick、class → className のように、属性名をキャメルケースで書きます。HTMLよりも厳格なルールがあります。',
      },
      {
        id: 'jsx-q11',
        text: 'HTMLの onclick 属性は、JSXではどう書きますか？',
        choices: [
          { label: 'onclick' },
          { label: 'on-click' },
          { label: 'onClick' },
          { label: 'ONCLICK' },
        ],
        correctIndex: 2,
        explanation:
          'JSXではイベント属性もキャメルケースで書きます。onclick → onClick が正しい形式です。',
      },
      {
        id: 'jsx-q12',
        text: '次のJSXで {user.name} はどうなりますか？\n\n<p>こんにちは、{user.name}さん</p>',
        choices: [
          { label: '文字列 "{user.name}" がそのまま表示される' },
          { label: 'user オブジェクトの name プロパティの値が表示される' },
          { label: 'エラーになる' },
          { label: '何も表示されない' },
        ],
        correctIndex: 1,
        explanation:
          'JSXの波括弧 {} 内はJavaScript式として評価されます。user.name の値（例: "太郎"）が表示されます。',
      },
    ],
  },
]
