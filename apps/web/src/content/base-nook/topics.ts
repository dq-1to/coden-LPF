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

  // ── 3. DOM ────────────────────────────────────
  {
    id: 'dom',
    title: 'DOMって何？',
    summary: 'ブラウザがHTMLを理解する仕組み',
    icon: 'TreePine',
    article: `## ひとことで言うと

DOMは、**ブラウザがHTMLを読み取って作る「ツリー構造のデータ」**です。JavaScriptはこのDOMを操作することで、ページの内容を動的に変えられます。

## もう少し詳しく

ブラウザがHTMLファイルを受け取ると、テキストをそのまま表示するのではなく、**まずDOMツリーというデータ構造に変換**します。ツリーの各部品は**ノード**と呼ばれ、要素・テキスト・属性などの種類があります。

たとえるなら、HTMLが「設計書」だとすると、DOMは設計書をもとにブラウザが組み立てた「模型」です。JavaScriptはこの模型に手を加えることで、画面の表示をリアルタイムに書き換えます。

DOMには「親子関係」があります。\`<html>\`が最上位の親で、\`<head>\`と\`<body>\`がその子。\`<body>\`の中の\`<h1>\`や\`<p>\`はさらにその子、という階層構造です。

## コードで見てみよう

\`\`\`js
// <p id="message">こんにちは</p> を取得して中身を書き換える
const el = document.getElementById("message");
el.textContent = "こんばんは";
\`\`\`

\`document.getElementById\` でDOMツリーの中から要素を探し出し、\`textContent\` で中のテキストを書き換えています。HTMLファイル自体は変わりませんが、画面上の表示が変わります。

## まとめ

- DOMは **ブラウザがHTMLから作るツリー構造のデータ**
- JavaScriptはDOMを操作して **画面をリアルタイムに書き換える**
- 要素の取得には \`getElementById\` や \`querySelector\` を使う`,
    questions: [
      {
        id: 'dom-q01',
        text: 'DOMとは何ですか？',
        choices: [
          { label: 'ブラウザのデバッグツール' },
          { label: 'HTMLを表示するためのCSSの仕組み' },
          { label: 'ブラウザがHTMLから作るツリー構造のデータ' },
          { label: 'JavaScriptのフレームワーク' },
        ],
        correctIndex: 2,
        explanation:
          'DOM（Document Object Model）は、ブラウザがHTMLを解析して作成するツリー構造のデータです。',
      },
      {
        id: 'dom-q02',
        text: 'DOMツリーの最上位にある要素はどれですか？',
        choices: [
          { label: '<head>' },
          { label: '<body>' },
          { label: '<html>' },
          { label: '<div>' },
        ],
        correctIndex: 2,
        explanation:
          'DOMツリーでは <html> 要素が最上位（ルート要素）です。その下に <head> と <body> が子要素として配置されます。',
      },
      {
        id: 'dom-q03',
        text: 'DOMツリーの各部品を何と呼びますか？',
        choices: [
          { label: 'タグ' },
          { label: 'ノード' },
          { label: 'ブロック' },
          { label: 'モジュール' },
        ],
        correctIndex: 1,
        explanation:
          'DOMツリーの各部品は「ノード」と呼ばれます。要素ノード、テキストノード、属性ノードなどの種類があります。',
      },
      {
        id: 'dom-q04',
        text: 'document.getElementById("message") は何をしていますか？',
        choices: [
          { label: '新しい要素を作成している' },
          { label: 'id が "message" の要素をDOMツリーから取得している' },
          { label: 'id が "message" の要素を削除している' },
          { label: 'すべての要素を取得している' },
        ],
        correctIndex: 1,
        explanation:
          'getElementById は指定したidを持つ要素をDOMツリーの中から探して返すメソッドです。',
      },
      {
        id: 'dom-q05',
        text: 'el.textContent = "こんばんは" を実行するとどうなりますか？',
        choices: [
          { label: 'HTMLファイルが書き換えられる' },
          { label: '画面上の要素のテキストが変わる' },
          { label: '新しいHTMLファイルが作成される' },
          { label: 'ブラウザがリロードされる' },
        ],
        correctIndex: 1,
        explanation:
          'textContent を変更するとDOM上のデータが書き換わり、画面の表示がリアルタイムに変わります。元のHTMLファイルは変わりません。',
      },
      {
        id: 'dom-q06',
        text: 'HTMLが「設計書」だとすると、DOMは何にたとえられますか？',
        choices: [
          { label: '設計書のコピー' },
          { label: '設計書をもとに組み立てた模型' },
          { label: '設計書を書く道具' },
          { label: '設計書の保管庫' },
        ],
        correctIndex: 1,
        explanation:
          'DOMはHTMLという設計書をもとにブラウザが組み立てた「模型」のようなもので、JavaScriptで操作できます。',
      },
      {
        id: 'dom-q07',
        text: 'DOMの正式名称はどれですか？',
        choices: [
          { label: 'Document Order Model' },
          { label: 'Data Object Manager' },
          { label: 'Document Object Model' },
          { label: 'Dynamic Output Module' },
        ],
        correctIndex: 2,
        explanation:
          'DOMは Document Object Model の略で、ドキュメント（文書）をオブジェクト（データ）として扱うモデル（仕組み）です。',
      },
      {
        id: 'dom-q08',
        text: 'ブラウザがHTMLファイルを受け取ったとき、最初に行うことはどれですか？',
        choices: [
          { label: 'JavaScriptを実行する' },
          { label: 'CSSを適用する' },
          { label: 'HTMLを解析してDOMツリーを構築する' },
          { label: '画面に文字を表示する' },
        ],
        correctIndex: 2,
        explanation:
          'ブラウザはまずHTMLを解析（パース）してDOMツリーを構築します。その後CSSの適用やJavaScriptの実行が行われます。',
      },
      {
        id: 'dom-q09',
        text: 'querySelector と getElementById の違いとして正しいのはどれですか？',
        choices: [
          { label: 'querySelector はCSSセレクタ形式で要素を指定できる' },
          { label: 'getElementById の方が新しいAPIである' },
          { label: 'querySelector は要素を変更できない' },
          { label: '2つは全く同じ機能である' },
        ],
        correctIndex: 0,
        explanation:
          'querySelector はCSSセレクタ（".class" や "#id" など）を使って柔軟に要素を指定できます。getElementById はid名のみで検索します。',
      },
      {
        id: 'dom-q10',
        text: 'Reactを使う場合、直接DOMを操作する頻度はどうなりますか？',
        choices: [
          { label: '頻繁に直接DOMを操作する' },
          { label: 'Reactが仮想DOMを通じてDOM操作を代行するため、直接操作は少なくなる' },
          { label: 'DOMは一切使われなくなる' },
          { label: 'Reactでは getElementById が必須になる' },
        ],
        correctIndex: 1,
        explanation:
          'Reactは仮想DOMという仕組みを使い、効率的にDOMを更新します。開発者が直接 getElementById などを使う場面は大幅に減ります。',
      },
      {
        id: 'dom-q11',
        text: '次のうち、DOMノードの種類として存在しないのはどれですか？',
        choices: [
          { label: '要素ノード（Element）' },
          { label: 'テキストノード（Text）' },
          { label: 'スタイルノード（Style）' },
          { label: '属性ノード（Attribute）' },
        ],
        correctIndex: 2,
        explanation:
          'DOMには要素ノード、テキストノード、属性ノード、コメントノードなどがありますが、「スタイルノード」という種類はありません。',
      },
      {
        id: 'dom-q12',
        text: 'DOMを操作して画面を書き換えた場合、サーバー上のHTMLファイルはどうなりますか？',
        choices: [
          { label: 'サーバー上のHTMLも同時に書き換わる' },
          { label: '一定時間後にサーバー上のHTMLに同期される' },
          { label: 'サーバー上のHTMLは変わらない' },
          { label: '自動的にバックアップが作成される' },
        ],
        correctIndex: 2,
        explanation:
          'DOM操作はブラウザのメモリ上で行われるため、サーバー上のHTMLファイルには影響しません。リロードすると元に戻ります。',
      },
    ],
  },

  // ── 4. コンポーネント ──────────────────────────
  {
    id: 'component',
    title: 'コンポーネントって何？',
    summary: 'UIを再利用できる部品に分ける考え方',
    icon: 'Puzzle',
    article: `## ひとことで言うと

コンポーネントは、**UIを小さな部品に分けて再利用できるようにする仕組み**です。Reactアプリはコンポーネントの組み合わせで作られています。

## もう少し詳しく

Webページが大きくなると、1つのファイルに全部書くのは大変です。たとえるなら、レゴブロックのように**パーツを組み合わせてページを作る**のがコンポーネントの考え方です。

ヘッダー、サイドバー、カード、ボタンーーそれぞれを独立した部品（コンポーネント）として作っておけば、別のページでもそのまま使い回せます。

Reactのコンポーネントは**JavaScriptの関数**です。関数名は**大文字で始める**のがルールで、JSXを返すことでUIを描画します。コンポーネントの中にコンポーネントを入れる「入れ子（ネスト）」もできます。

## コードで見てみよう

\`\`\`jsx
function Button() {
  return <button>クリック</button>;
}

function App() {
  return (
    <div>
      <h1>マイアプリ</h1>
      <Button />
      <Button />
    </div>
  );
}
\`\`\`

\`Button\` コンポーネントを2回使い回しています。\`<Button />\` と書くだけで同じUIが何度でも配置でき、変更したいときは \`Button\` の中身を1箇所直すだけで済みます。

## まとめ

- コンポーネントは **UIの再利用可能な部品**
- Reactのコンポーネントは **大文字で始まるJavaScript関数**
- 部品を組み合わせることで **複雑なUIをシンプルに構築** できる`,
    questions: [
      {
        id: 'component-q01',
        text: 'Reactにおけるコンポーネントとは何ですか？',
        choices: [
          { label: 'CSSのクラス名' },
          { label: 'UIを部品化して再利用できるようにする仕組み' },
          { label: 'HTMLファイルの別名' },
          { label: 'データベースのテーブル' },
        ],
        correctIndex: 1,
        explanation:
          'コンポーネントはUIを小さな部品に分けて再利用できるようにする仕組みです。Reactアプリはコンポーネントの組み合わせで構築されます。',
      },
      {
        id: 'component-q02',
        text: 'Reactのコンポーネント名のルールとして正しいのはどれですか？',
        choices: [
          { label: '小文字で始める' },
          { label: '大文字で始める' },
          { label: 'アンダースコアで始める' },
          { label: '数字で始める' },
        ],
        correctIndex: 1,
        explanation:
          'Reactのコンポーネント名は大文字で始める必要があります。小文字で始まるとHTMLタグとして扱われてしまいます。',
      },
      {
        id: 'component-q03',
        text: 'コンポーネントの考え方をたとえるなら、何に近いですか？',
        choices: [
          { label: '1つの大きな絵を描くこと' },
          { label: 'レゴブロックでパーツを組み合わせること' },
          { label: '1冊の本を最初から最後まで読むこと' },
          { label: '1枚の紙に全部書くこと' },
        ],
        correctIndex: 1,
        explanation:
          'コンポーネントはレゴブロックのように、小さな部品を組み合わせて大きなUIを作る考え方です。',
      },
      {
        id: 'component-q04',
        text: '次のコードで <Button /> を2回書いた場合、画面にはどうなりますか？\n\nfunction Button() {\n  return <button>クリック</button>;\n}',
        choices: [
          { label: 'エラーになる' },
          { label: 'ボタンが1つだけ表示される' },
          { label: 'ボタンが2つ表示される' },
          { label: '何も表示されない' },
        ],
        correctIndex: 2,
        explanation:
          'コンポーネントは何度でも再利用できます。<Button /> を2回書けばボタンが2つ表示されます。',
      },
      {
        id: 'component-q05',
        text: 'Reactのコンポーネントの正体は何ですか？',
        choices: [
          { label: 'HTMLタグ' },
          { label: 'CSSクラス' },
          { label: 'JavaScriptの関数' },
          { label: 'JSONデータ' },
        ],
        correctIndex: 2,
        explanation:
          'Reactのコンポーネントは、JSXを返すJavaScript関数です。関数として定義し、タグのように呼び出せます。',
      },
      {
        id: 'component-q06',
        text: 'コンポーネントを使う最大のメリットはどれですか？',
        choices: [
          { label: 'ページの読み込みが速くなる' },
          { label: 'CSSを書かなくてよくなる' },
          { label: '同じUIを再利用でき、変更も1箇所で済む' },
          { label: 'サーバーが不要になる' },
        ],
        correctIndex: 2,
        explanation:
          'コンポーネントを部品化すると、同じUIを何度でも使い回せます。修正が必要になっても1箇所を直すだけで全体に反映されます。',
      },
      {
        id: 'component-q07',
        text: 'コンポーネントの「ネスト」とは何ですか？',
        choices: [
          { label: 'コンポーネントを削除すること' },
          { label: 'コンポーネントの中に別のコンポーネントを入れること' },
          { label: 'コンポーネントをテストすること' },
          { label: 'コンポーネントの名前を変えること' },
        ],
        correctIndex: 1,
        explanation:
          'ネスト（入れ子）とは、コンポーネントの中に別のコンポーネントを配置することです。これにより階層的なUIを構築できます。',
      },
      {
        id: 'component-q08',
        text: '次のうち、コンポーネントとして分けるのに適しているのはどれですか？',
        choices: [
          { label: 'ページ全体を1つのコンポーネントにする' },
          { label: 'ヘッダー、カード、ボタンなど機能単位で分ける' },
          { label: '1行ごとにコンポーネントに分ける' },
          { label: 'CSSのクラスごとにコンポーネントに分ける' },
        ],
        correctIndex: 1,
        explanation:
          'コンポーネントは「ヘッダー」「カード」「ボタン」のように、UIの機能や役割の単位で分けるのが適切です。',
      },
      {
        id: 'component-q09',
        text: '次のコードで button がHTMLタグとして扱われ、Button がコンポーネントとして扱われる理由は何ですか？',
        choices: [
          { label: 'button は短い名前だから' },
          { label: 'Button は大文字で始まるから' },
          { label: 'Button は import されているから' },
          { label: 'button はブラウザに登録されているから' },
        ],
        correctIndex: 1,
        explanation:
          'Reactは大文字で始まる名前をコンポーネント、小文字で始まる名前をHTMLタグとして区別します。これがコンポーネント名を大文字で始めるルールの理由です。',
      },
      {
        id: 'component-q10',
        text: 'コンポーネントが返す（return する）ものは何ですか？',
        choices: [
          { label: 'CSSスタイル' },
          { label: 'JSONデータ' },
          { label: 'JSX（UIの記述）' },
          { label: 'HTML文字列' },
        ],
        correctIndex: 2,
        explanation:
          'Reactコンポーネントは JSX を返します。JSXはUIを記述するための構文で、最終的にブラウザに表示される要素になります。',
      },
      {
        id: 'component-q11',
        text: 'export default function App() {} の export default は何を意味しますか？',
        choices: [
          { label: '関数を削除する命令' },
          { label: 'この関数を他のファイルから読み込めるようにする指定' },
          { label: '関数を非公開にする指定' },
          { label: '関数を自動実行する指定' },
        ],
        correctIndex: 1,
        explanation:
          'export default はJavaScriptの標準構文で、その関数（コンポーネント）を他のファイルからimportできるようにします。',
      },
      {
        id: 'component-q12',
        text: 'コンポーネントを別ファイルに分ける主な理由はどれですか？',
        choices: [
          { label: 'ブラウザの制限でファイルを分ける必要がある' },
          { label: 'コードの見通しが良くなり、管理しやすくなる' },
          { label: '分けないとエラーになる' },
          { label: 'CSSが適用されなくなる' },
        ],
        correctIndex: 1,
        explanation:
          'ファイルを分けることでコードの見通しが良くなり、チーム開発でも管理しやすくなります。技術的には1ファイルでも動きますが、規模が大きくなると分割が重要です。',
      },
    ],
  },

  // ── 5. props vs state ─────────────────────────
  {
    id: 'props-vs-state',
    title: 'propsとstateの違い',
    summary: 'データの流れ、それぞれの役割',
    icon: 'ArrowLeftRight',
    article: `## ひとことで言うと

**propsは親から子へ渡す「読み取り専用のデータ」**、**stateはコンポーネント自身が持つ「変更できるデータ」**です。

## もう少し詳しく

レストランにたとえると、propsは「お客さんからの注文」です。キッチン（子コンポーネント）は注文の内容を変えることはできず、渡されたとおりに料理を作ります。

一方 state は「キッチンの在庫状況」のようなものです。キッチン自身が管理していて、料理を作れば在庫が減るーーつまりコンポーネント自身が更新できます。

Reactでは、**データは親から子へ一方向に流れる**のが基本です。親コンポーネントがstateを持ち、それをpropsとして子に渡します。子が親のデータを変えたい場合は、親から渡された「更新関数」を呼び出します。

## コードで見てみよう

\`\`\`jsx
function Counter({ label }) {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      {label}: {count}
    </button>
  );
}

// 使い方: <Counter label="クリック数" />
\`\`\`

\`label\` は親から受け取る props（変更不可）、\`count\` はコンポーネント自身の state（クリックで変更可能）です。

## まとめ

- **props** — 親から子へ渡す読み取り専用のデータ
- **state** — コンポーネント自身が管理する変更可能なデータ
- データは **親→子の一方向** に流れるのがReactの基本`,
    questions: [
      {
        id: 'props-vs-state-q01',
        text: 'propsの説明として正しいのはどれですか？',
        choices: [
          { label: 'コンポーネント自身が変更できるデータ' },
          { label: '親コンポーネントから子に渡される読み取り専用のデータ' },
          { label: 'ブラウザに保存されるデータ' },
          { label: 'サーバーから取得するデータ' },
        ],
        correctIndex: 1,
        explanation:
          'propsは親コンポーネントから子コンポーネントに渡されるデータで、子側では変更できません（読み取り専用）。',
      },
      {
        id: 'props-vs-state-q02',
        text: 'stateの説明として正しいのはどれですか？',
        choices: [
          { label: '親から子へ渡されるデータ' },
          { label: 'CSSのスタイル情報' },
          { label: 'コンポーネント自身が管理する変更可能なデータ' },
          { label: 'HTMLの属性' },
        ],
        correctIndex: 2,
        explanation:
          'stateはコンポーネント自身が持つ「記憶」のようなもので、ユーザー操作などに応じて変更できます。',
      },
      {
        id: 'props-vs-state-q03',
        text: 'Reactのデータの流れとして正しいのはどれですか？',
        choices: [
          { label: '子から親へ流れる' },
          { label: '親から子へ一方向に流れる' },
          { label: '双方向に自由に流れる' },
          { label: 'データの流れに決まりはない' },
        ],
        correctIndex: 1,
        explanation:
          'Reactではデータは親から子へ一方向に流れます（単方向データフロー）。子が親のデータを変えたい場合は、親から渡された更新関数を使います。',
      },
      {
        id: 'props-vs-state-q04',
        text: 'レストランのたとえで「propsはお客さんからの注文」とする場合、stateにあたるのはどれですか？',
        choices: [
          { label: 'レストランの看板' },
          { label: 'キッチンの在庫状況' },
          { label: 'お客さんの名前' },
          { label: 'メニュー表' },
        ],
        correctIndex: 1,
        explanation:
          'stateはキッチン（コンポーネント）自身が管理するデータです。料理を作れば在庫が減るように、操作に応じて変化します。',
      },
      {
        id: 'props-vs-state-q05',
        text: '次のコードで label はどちらですか？\n\nfunction Counter({ label }) {\n  const [count, setCount] = useState(0);\n}',
        choices: [
          { label: 'state' },
          { label: 'props' },
          { label: 'イベントハンドラ' },
          { label: 'JSX' },
        ],
        correctIndex: 1,
        explanation:
          '関数の引数として受け取る { label } は、親コンポーネントから渡される props です。',
      },
      {
        id: 'props-vs-state-q06',
        text: '次のコードで count はどちらですか？\n\nconst [count, setCount] = useState(0);',
        choices: [
          { label: 'props' },
          { label: 'state' },
          { label: 'グローバル変数' },
          { label: 'DOM要素' },
        ],
        correctIndex: 1,
        explanation:
          'useState で作成した count はコンポーネント自身が管理する state です。setCount で値を更新できます。',
      },
      {
        id: 'props-vs-state-q07',
        text: '子コンポーネントが親のstateを変更したい場合、どうしますか？',
        choices: [
          { label: '子が直接親のstateを書き換える' },
          { label: '親から渡された更新関数をpropsとして受け取り、それを呼び出す' },
          { label: 'グローバル変数に代入する' },
          { label: 'DOMを直接操作する' },
        ],
        correctIndex: 1,
        explanation:
          'Reactでは子が親のstateを直接変更することはできません。親が更新関数（setStateなど）をpropsとして渡し、子がそれを呼び出す形をとります。',
      },
      {
        id: 'props-vs-state-q08',
        text: 'propsを子コンポーネント内で変更しようとするとどうなりますか？',
        choices: [
          { label: '正常に変更できる' },
          { label: '自動的に親のstateも更新される' },
          { label: 'エラーや意図しない動作になる' },
          { label: '画面がリロードされる' },
        ],
        correctIndex: 2,
        explanation:
          'propsは読み取り専用です。子コンポーネント内で直接変更しようとすると、エラーや意図しない動作の原因になります。',
      },
      {
        id: 'props-vs-state-q09',
        text: 'stateが変更されると何が起きますか？',
        choices: [
          { label: 'ページ全体がリロードされる' },
          { label: '何も起きない' },
          { label: 'そのコンポーネントが再レンダリング（再描画）される' },
          { label: 'サーバーにデータが送信される' },
        ],
        correctIndex: 2,
        explanation:
          'stateが変更されると、Reactはそのコンポーネント（と子コンポーネント）を再レンダリングして、画面の表示を最新の状態に更新します。',
      },
      {
        id: 'props-vs-state-q10',
        text: '次の説明のうち、propsとstateの関係として正しいのはどれですか？',
        choices: [
          { label: 'propsとstateは同じものの別名である' },
          { label: 'propsは不要で、stateだけで十分である' },
          { label: '親がstateを持ち、それをpropsとして子に渡すパターンが一般的' },
          { label: 'stateはpropsの中に含まれる' },
        ],
        correctIndex: 2,
        explanation:
          '親コンポーネントがstateとして管理するデータを、propsとして子に渡すのがReactの基本パターンです。props と state は異なるものですが、連携して動作します。',
      },
      {
        id: 'props-vs-state-q11',
        text: 'useState(0) の 0 は何を意味していますか？',
        choices: [
          { label: 'stateの最大値' },
          { label: 'stateの初期値' },
          { label: 'stateのid' },
          { label: 'stateの型を示す数値' },
        ],
        correctIndex: 1,
        explanation:
          'useState に渡す引数は state の初期値です。useState(0) なら count の初期値が 0 になります。',
      },
      {
        id: 'props-vs-state-q12',
        text: '同じコンポーネントを2回使った場合、それぞれのstateはどうなりますか？',
        choices: [
          { label: '2つのコンポーネントでstateが共有される' },
          { label: 'それぞれが独立したstateを持つ' },
          { label: '最後に作られたコンポーネントのstateだけが有効' },
          { label: 'stateは1つ目のコンポーネントにのみ作られる' },
        ],
        correctIndex: 1,
        explanation:
          '同じコンポーネントを複数回使っても、それぞれが独立した state を持ちます。一方を操作しても他方には影響しません。',
      },
    ],
  },

  // ── 6. JSON ───────────────────────────────────
  {
    id: 'json',
    title: 'JSONって何？',
    summary: 'データをやりとりするための共通フォーマット',
    icon: 'Braces',
    article: `## ひとことで言うと

JSONは、**データを文字列として表現するためのフォーマット（書式）**です。サーバーとブラウザの間でデータをやりとりするときに広く使われています。

## もう少し詳しく

Webアプリではサーバーからデータを受け取って画面に表示する場面が多くあります。そのとき「どんな形式でデータを送るか」を統一する必要があり、最もよく使われるのがJSONです。

JSONは **JavaScript Object Notation** の略で、JavaScriptのオブジェクト記法がもとになっています。ただし、JSON自体は言語に依存しない汎用フォーマットで、Python・Java・PHPなど多くの言語で扱えます。

JSONのルールはシンプルです。

- キーは **ダブルクォートで囲む**（シングルクォート不可）
- 値には文字列・数値・真偽値・配列・オブジェクト・null が使える
- **関数やundefined** は使えない
- 末尾のカンマ（trailing comma）は **許可されない**

## コードで見てみよう

\`\`\`js
// JavaScriptオブジェクト → JSON文字列
const user = { name: "太郎", age: 25 };
const jsonStr = JSON.stringify(user);
// '{"name":"太郎","age":25}'

// JSON文字列 → JavaScriptオブジェクト
const parsed = JSON.parse(jsonStr);
console.log(parsed.name); // "太郎"
\`\`\`

\`JSON.stringify\` でオブジェクトをJSON文字列に変換し、\`JSON.parse\` でJSON文字列をオブジェクトに戻せます。

## まとめ

- JSONは **データを文字列で表現する共通フォーマット**
- サーバーとブラウザのデータ交換に広く使われる
- \`JSON.stringify\` / \`JSON.parse\` で変換できる`,
    questions: [
      {
        id: 'json-q01',
        text: 'JSONとは何ですか？',
        choices: [
          { label: 'JavaScriptのフレームワーク' },
          { label: 'データを文字列で表現するためのフォーマット' },
          { label: 'HTMLのタグの一種' },
          { label: 'CSSのプロパティ' },
        ],
        correctIndex: 1,
        explanation:
          'JSON（JavaScript Object Notation）はデータを文字列として表現するフォーマットです。Web開発でのデータ交換に広く使われています。',
      },
      {
        id: 'json-q02',
        text: 'JSONのキーの書き方として正しいのはどれですか？',
        choices: [
          { label: "{ 'name': '太郎' }" },
          { label: '{ "name": "太郎" }' },
          { label: '{ name: "太郎" }' },
          { label: '{ name = "太郎" }' },
        ],
        correctIndex: 1,
        explanation:
          'JSONではキーをダブルクォート（"）で囲む必要があります。シングルクォートやクォートなしは無効です。',
      },
      {
        id: 'json-q03',
        text: 'JSON.stringify() は何をしますか？',
        choices: [
          { label: 'JSON文字列をオブジェクトに変換する' },
          { label: 'JavaScriptオブジェクトをJSON文字列に変換する' },
          { label: 'JSONファイルを読み込む' },
          { label: 'JSONデータを削除する' },
        ],
        correctIndex: 1,
        explanation:
          'JSON.stringify() はJavaScriptのオブジェクトや配列をJSON形式の文字列に変換するメソッドです。',
      },
      {
        id: 'json-q04',
        text: 'JSON.parse() は何をしますか？',
        choices: [
          { label: 'JavaScriptオブジェクトをJSON文字列に変換する' },
          { label: 'JSONファイルを削除する' },
          { label: 'JSON文字列をJavaScriptオブジェクトに変換する' },
          { label: 'JSONのバリデーションを行う' },
        ],
        correctIndex: 2,
        explanation:
          'JSON.parse() はJSON形式の文字列をJavaScriptのオブジェクトや配列に変換するメソッドです。',
      },
      {
        id: 'json-q05',
        text: 'JSONで使えない値はどれですか？',
        choices: [
          { label: '文字列' },
          { label: '数値' },
          { label: '関数' },
          { label: '配列' },
        ],
        correctIndex: 2,
        explanation:
          'JSONでは文字列・数値・真偽値・配列・オブジェクト・null が使えますが、関数や undefined は使えません。',
      },
      {
        id: 'json-q06',
        text: 'JSONが広く使われている場面はどれですか？',
        choices: [
          { label: 'CSSのスタイル定義' },
          { label: 'サーバーとブラウザ間のデータ交換' },
          { label: 'HTMLの構造定義' },
          { label: '画像の圧縮' },
        ],
        correctIndex: 1,
        explanation:
          'JSONはサーバーとブラウザ間でデータをやりとりするフォーマットとして最も広く使われています。APIのレスポンス形式としても定番です。',
      },
      {
        id: 'json-q07',
        text: 'JSONの正式名称はどれですか？',
        choices: [
          { label: 'JavaScript Object Navigation' },
          { label: 'JavaScript Online Notation' },
          { label: 'JavaScript Object Notation' },
          { label: 'Java Standard Object Notation' },
        ],
        correctIndex: 2,
        explanation:
          'JSONは JavaScript Object Notation の略です。JavaScriptのオブジェクト記法がもとになっています。',
      },
      {
        id: 'json-q08',
        text: 'JSONはJavaScript専用のフォーマットですか？',
        choices: [
          { label: 'はい、JavaScriptでのみ使えます' },
          { label: 'いいえ、Python・Java・PHPなど多くの言語で使えます' },
          { label: 'TypeScriptでも使えますが、他の言語では使えません' },
          { label: 'サーバーサイド言語でのみ使えます' },
        ],
        correctIndex: 1,
        explanation:
          'JSONはJavaScriptのオブジェクト記法がもとですが、言語に依存しない汎用フォーマットです。Python・Java・PHPなど多くの言語で利用できます。',
      },
      {
        id: 'json-q09',
        text: '次のJSONとして正しいのはどれですか？',
        choices: [
          { label: '{ name: "太郎", age: 25 }' },
          { label: '{ "name": "太郎", "age": 25, }' },
          { label: '{ "name": "太郎", "age": 25 }' },
          { label: "{ 'name': '太郎', 'age': 25 }" },
        ],
        correctIndex: 2,
        explanation:
          'JSONではキーをダブルクォートで囲み、末尾のカンマ（trailing comma）は許可されません。',
      },
      {
        id: 'json-q10',
        text: 'JSONで null は使えますか？',
        choices: [
          { label: '使えない' },
          { label: '使える' },
          { label: '文字列 "null" としてのみ使える' },
          { label: '数値 0 に自動変換される' },
        ],
        correctIndex: 1,
        explanation:
          'JSONでは null を値として使えます。「値がない」ことを明示的に表すときに使います。',
      },
      {
        id: 'json-q11',
        text: '不正なJSON文字列を JSON.parse() に渡すとどうなりますか？',
        choices: [
          { label: 'null が返される' },
          { label: '空のオブジェクトが返される' },
          { label: 'エラー（SyntaxError）が発生する' },
          { label: '自動的に修正される' },
        ],
        correctIndex: 2,
        explanation:
          '不正なJSON文字列を JSON.parse() に渡すと SyntaxError が発生します。try-catch で適切にエラーハンドリングすることが重要です。',
      },
      {
        id: 'json-q12',
        text: 'JSONでは真偽値（ブール値）をどう書きますか？',
        choices: [
          { label: 'True / False（先頭大文字）' },
          { label: 'TRUE / FALSE（全大文字）' },
          { label: 'true / false（全小文字）' },
          { label: '"true" / "false"（文字列）' },
        ],
        correctIndex: 2,
        explanation:
          'JSONでは真偽値を true / false（全小文字、クォートなし）で書きます。大文字や文字列にすると意味が変わります。',
      },
    ],
  },

  // ── 7. API ────────────────────────────────────
  {
    id: 'api',
    title: 'APIって何？',
    summary: 'サービス同士をつなぐ窓口の仕組み',
    icon: 'Plug',
    article: `## ひとことで言うと

APIは、**ソフトウェア同士がデータをやりとりするための「窓口」**です。自分のアプリから外部のサービスや機能を利用するときに使います。

## もう少し詳しく

APIは **Application Programming Interface** の略です。レストランにたとえると、APIは「ウェイター」の役割です。お客さん（あなたのアプリ）がキッチン（サーバーや外部サービス）に直接入ることはできませんが、ウェイター（API）を通じて注文（リクエスト）を出し、料理（データ）を受け取ることができます。

Web開発でAPIという言葉は主に2つの意味で使われます。

- **ブラウザAPI** — ブラウザに組み込まれた機能。DOM操作、位置情報取得、音声再生など
- **Web API（サードパーティAPI）** — 外部サービスが提供する窓口。天気データ、地図、決済など

React開発でよく使うのは、サーバーからデータを取得する **Web API** です。ブラウザから特定のURL（エンドポイント）にリクエストを送ると、JSON形式でデータが返ってきます。

## コードで見てみよう

\`\`\`js
// Web APIからデータを取得する例
const response = await fetch("https://api.example.com/users");
const users = await response.json();
console.log(users);
// [{ "name": "太郎", "age": 25 }, ...]
\`\`\`

\`fetch\` を使ってAPIのURL（エンドポイント）にリクエストを送り、返ってきたJSONデータをJavaScriptオブジェクトに変換しています。

## まとめ

- APIは **ソフトウェア同士のデータ交換の窓口**
- **ブラウザAPI** と **Web API** の2種類がある
- Web APIは **URL（エンドポイント）にリクエストを送りJSONで受け取る** のが基本`,
    questions: [
      {
        id: 'api-q01',
        text: 'APIとは何ですか？',
        choices: [
          { label: 'プログラミング言語の名前' },
          { label: 'ソフトウェア同士がデータをやりとりするための窓口' },
          { label: 'Webブラウザの種類' },
          { label: 'データベースの略称' },
        ],
        correctIndex: 1,
        explanation:
          'API（Application Programming Interface）は、ソフトウェア同士がデータをやりとりするための窓口（インターフェース）です。',
      },
      {
        id: 'api-q02',
        text: 'レストランのたとえで、APIの役割に最も近いのはどれですか？',
        choices: [
          { label: 'お客さん' },
          { label: 'キッチン' },
          { label: 'ウェイター' },
          { label: '食材' },
        ],
        correctIndex: 2,
        explanation:
          'APIはウェイターのように、お客さん（アプリ）とキッチン（サーバー）の間を仲介してデータを受け渡す役割を果たします。',
      },
      {
        id: 'api-q03',
        text: 'ブラウザAPIの例として正しいのはどれですか？',
        choices: [
          { label: 'Google Maps API' },
          { label: 'Twitter API' },
          { label: 'DOM操作や位置情報取得' },
          { label: '天気データAPI' },
        ],
        correctIndex: 2,
        explanation:
          'ブラウザAPIはブラウザに組み込まれた機能で、DOM操作・位置情報取得・音声再生などが含まれます。Google Maps等は外部のサードパーティAPIです。',
      },
      {
        id: 'api-q04',
        text: 'Web APIにリクエストを送るとき、一般的に使う形式はどれですか？',
        choices: [
          { label: 'HTML' },
          { label: 'CSS' },
          { label: 'URL（エンドポイント）にHTTPリクエスト' },
          { label: 'SQLクエリ' },
        ],
        correctIndex: 2,
        explanation:
          'Web APIでは、特定のURL（エンドポイント）にHTTPリクエストを送信してデータの取得や操作を行います。',
      },
      {
        id: 'api-q05',
        text: 'Web APIから返ってくるデータの形式として最も一般的なのはどれですか？',
        choices: [
          { label: 'HTML' },
          { label: 'CSV' },
          { label: 'JSON' },
          { label: 'XML' },
        ],
        correctIndex: 2,
        explanation:
          '現代のWeb APIではJSON形式でデータを返すのが最も一般的です。軽量で扱いやすいためです。',
      },
      {
        id: 'api-q06',
        text: 'APIの正式名称はどれですか？',
        choices: [
          { label: 'Application Program Installation' },
          { label: 'Application Programming Interface' },
          { label: 'Advanced Programming Index' },
          { label: 'Automatic Process Integration' },
        ],
        correctIndex: 1,
        explanation:
          'APIは Application Programming Interface の略です。ソフトウェア間のインターフェース（接点）を意味します。',
      },
      {
        id: 'api-q07',
        text: 'エンドポイントとは何ですか？',
        choices: [
          { label: 'プログラムの最終行' },
          { label: 'APIにアクセスするための特定のURL' },
          { label: 'ユーザーのログアウト処理' },
          { label: 'サーバーの電源を切る操作' },
        ],
        correctIndex: 1,
        explanation:
          'エンドポイントはAPIにアクセスするための特定のURLです。例: https://api.example.com/users',
      },
      {
        id: 'api-q08',
        text: 'サードパーティAPIの例はどれですか？',
        choices: [
          { label: 'document.querySelector()' },
          { label: 'console.log()' },
          { label: 'Google Maps API' },
          { label: 'window.alert()' },
        ],
        correctIndex: 2,
        explanation:
          'Google Maps APIは外部企業（Google）が提供するサードパーティAPIです。他の選択肢はブラウザに組み込まれた機能です。',
      },
      {
        id: 'api-q09',
        text: 'fetch() は何をする関数ですか？',
        choices: [
          { label: 'HTMLを作成する' },
          { label: 'CSSを適用する' },
          { label: 'ネットワークリクエストを送ってデータを取得する' },
          { label: 'DOMを削除する' },
        ],
        correctIndex: 2,
        explanation:
          'fetch() はブラウザ組み込みのAPIで、指定したURLにネットワークリクエストを送りレスポンスを受け取る関数です。',
      },
      {
        id: 'api-q10',
        text: 'response.json() は何をしていますか？',
        choices: [
          { label: 'JSONファイルを作成している' },
          { label: 'レスポンスのJSON本体をJavaScriptオブジェクトに変換している' },
          { label: 'レスポンスを画面に表示している' },
          { label: 'レスポンスを削除している' },
        ],
        correctIndex: 1,
        explanation:
          'response.json() はサーバーから返ってきたJSONデータをJavaScriptのオブジェクトに変換（パース）するメソッドです。',
      },
      {
        id: 'api-q11',
        text: 'ブラウザAPIとWeb APIの違いとして正しいのはどれですか？',
        choices: [
          { label: '全く同じものである' },
          { label: 'ブラウザAPIはブラウザに組み込まれ、Web APIは外部サービスが提供する' },
          { label: 'Web APIの方が古い技術である' },
          { label: 'ブラウザAPIはサーバーでのみ動く' },
        ],
        correctIndex: 1,
        explanation:
          'ブラウザAPIはブラウザに最初から組み込まれた機能、Web API（サードパーティAPI）は外部サービスが提供する窓口です。',
      },
      {
        id: 'api-q12',
        text: 'APIを使うメリットとして最も適切なのはどれですか？',
        choices: [
          { label: 'すべての機能を自分で作る必要がなくなる' },
          { label: 'プログラミング言語を学ばなくてよくなる' },
          { label: 'インターネット接続が不要になる' },
          { label: 'コードを書く量がゼロになる' },
        ],
        correctIndex: 0,
        explanation:
          'APIを使えば、天気データや地図表示など、既に誰かが作った機能を自分のアプリから利用でき、すべてを自前で作る必要がなくなります。',
      },
    ],
  },
]
