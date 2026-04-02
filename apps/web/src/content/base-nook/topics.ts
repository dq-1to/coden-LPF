import type { BaseNookTopic } from './types'

export const BASE_NOOK_TOPICS: BaseNookTopic[] = [
  // ── 1. JavaScript ────────────────────────────────
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

  // ── 2. JSX ───────────────────────────────────────
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

  // ── 3. DOM ───────────────────────────────────────
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

  // ── 4. コンポーネント ───────────────────────────────────
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

  // ── 5. props vs state ────────────────────────────
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

  // ── 6. JSON ──────────────────────────────────────
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

  // ── 7. API ───────────────────────────────────────
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

  // ── 8. HTTPメソッド ──────────────────────────────────
  {
    id: 'http-methods',
    title: 'HTTPメソッドって何？',
    summary: 'GET/POST/PUT/DELETE の役割',
    icon: 'Send',
    article: `## ひとことで言うと

HTTPメソッドは、**「サーバーへの操作の種類」を伝える命令**です。データを取得したいのか、新規作成したいのか、更新・削除したいのかをURLとセットで指定します。

## もう少し詳しく

Webアプリでブラウザからサーバーにリクエストを送るとき、URLだけでは「何をしたいのか」が伝わりません。そこで使われるのがHTTPメソッドです。

お店に電話するときのたとえで考えると、URLが「お店の電話番号」だとすると、HTTPメソッドは「電話の用件（注文・確認・キャンセルなど）」にあたります。

よく使われる4つのメソッドには、それぞれ明確な役割があります。

| メソッド | 役割 | 例 |
|----------|------|-----|
| **GET** | データを取得する | 記事の一覧を見る |
| **POST** | 新しいデータを作成する | コメントを投稿する |
| **PUT** | データを丸ごと更新する | プロフィールを書き換える |
| **DELETE** | データを削除する | 記事を削除する |

GETは「読み取り専用」のため、サーバーの状態を変えません（**安全**なメソッド）。一方でPOST・PUT・DELETEはサーバーのデータを変化させます。

また、**冪等性（べきとうせい）** という重要な概念があります。「同じリクエストを何度送っても結果が変わらない」性質のことです。GETとPUTとDELETEは冪等ですが、POSTは冪等ではありません（送るたびに新しいデータが作られる可能性があります）。

## コードで見てみよう

\`\`\`js
// GET: データを取得する（リクエストボディなし）
const res = await fetch("/api/posts");
const posts = await res.json();

// POST: 新しいデータを作成する（リクエストボディあり）
const res2 = await fetch("/api/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "新しい記事", content: "本文" }),
});
\`\`\`

GETはURLを指定するだけでよく、POSTはメソッドと送信するデータ（\`body\`）を指定します。

## まとめ

- HTTPメソッドは **サーバーへの操作の種類を伝える命令**（GET/POST/PUT/DELETE が基本）
- GETは **データの読み取り専用** でサーバーの状態を変えない
- POSTは **新規作成**、PUTは **丸ごと更新**、DELETEは **削除** を担当する`,
    questions: [
      {
        id: 'http-methods-q01',
        text: 'HTTPメソッドの役割として正しいのはどれですか？',
        choices: [
          { label: 'ページのデザインを指定する' },
          { label: 'サーバーへの操作の種類（取得・作成・更新・削除）を伝える' },
          { label: 'ブラウザの種類を識別する' },
          { label: 'URLの文字数を制限する' },
        ],
        correctIndex: 1,
        explanation:
          'HTTPメソッドは、サーバーに「何をしたいのか」を伝えるものです。URLが「どこに」を示すのに対し、メソッドは「何を」の操作種別を示します。',
      },
      {
        id: 'http-methods-q02',
        text: 'GETメソッドの特徴として正しいのはどれですか？',
        choices: [
          { label: '新しいデータを作成する' },
          { label: 'サーバー上のデータを削除する' },
          { label: 'データを取得するだけで、サーバーの状態を変えない' },
          { label: 'リクエストボディが必須である' },
        ],
        correctIndex: 2,
        explanation:
          'GETはデータの取得専用で、サーバーの状態を変えない「安全」なメソッドです。GETリクエストにはリクエストボディを含めません。',
      },
      {
        id: 'http-methods-q03',
        text: '新しいコメントをサーバーに投稿するとき、使うべきメソッドはどれですか？',
        choices: [
          { label: 'GET' },
          { label: 'POST' },
          { label: 'DELETE' },
          { label: 'HEAD' },
        ],
        correctIndex: 1,
        explanation:
          'POSTは新しいデータを作成するためのメソッドです。コメントの投稿・ユーザー登録など「初めて作る」操作に使います。',
      },
      {
        id: 'http-methods-q04',
        text: 'お店への電話にたとえたとき、HTTPメソッドにあたるのはどれですか？',
        choices: [
          { label: 'お店の電話番号' },
          { label: '電話機の種類' },
          { label: '電話の用件（注文・確認・キャンセルなど）' },
          { label: '通話時間' },
        ],
        correctIndex: 2,
        explanation:
          'URLが「どこに（電話番号）」を示すのに対し、HTTPメソッドは「何をしたいか（用件）」を示します。',
      },
      {
        id: 'http-methods-q05',
        text: '「冪等性（べきとうせい）」の説明として正しいのはどれですか？',
        choices: [
          { label: 'リクエストが高速であること' },
          { label: '同じリクエストを何度送っても結果が変わらない性質' },
          { label: 'データを暗号化して送る仕組み' },
          { label: 'サーバーが自動的にデータを圧縮する機能' },
        ],
        correctIndex: 1,
        explanation:
          '冪等性とは「同じ操作を何度繰り返しても同じ結果になる」性質です。GET・PUT・DELETEは冪等ですが、POSTは冪等ではありません。',
      },
      {
        id: 'http-methods-q06',
        text: '次のうち、冪等でない（何度送ると結果が変わる可能性がある）メソッドはどれですか？',
        choices: [
          { label: 'GET' },
          { label: 'PUT' },
          { label: 'DELETE' },
          { label: 'POST' },
        ],
        correctIndex: 3,
        explanation:
          'POSTは冪等ではありません。同じPOSTリクエストを複数回送ると、そのたびに新しいデータが作られる可能性があります。GET・PUT・DELETEは冪等です。',
      },
      {
        id: 'http-methods-q07',
        text: 'PUTメソッドの役割として正しいのはどれですか？',
        choices: [
          { label: '新しいデータを作成する' },
          { label: 'データを丸ごと上書き更新する' },
          { label: 'データを取得する' },
          { label: 'データを部分的に削除する' },
        ],
        correctIndex: 1,
        explanation:
          'PUTはリソース全体を上書き更新するメソッドです。送ったデータでそのリソースが丸ごと置き換わります。部分的な更新はPATCHが担います。',
      },
      {
        id: 'http-methods-q08',
        text: 'fetch() でGETリクエストを送るとき、method の指定はどうなりますか？',
        choices: [
          { label: 'method: "GET" と明示的に書く必要がある' },
          { label: 'fetch() はデフォルトでGETを使うため、省略できる' },
          { label: 'method: "READ" と書く' },
          { label: 'GETはfetch()では使えない' },
        ],
        correctIndex: 1,
        explanation:
          'fetch() のデフォルトメソッドはGETです。GETリクエストを送る場合はURLだけを渡せばよく、method の指定は省略できます。',
      },
      {
        id: 'http-methods-q09',
        text: 'fetch() でPOSTリクエストを送るとき、必要な設定はどれですか？',
        choices: [
          { label: 'URLのみ指定すればよい' },
          { label: 'method: "POST" とbody（送信データ）を指定する' },
          { label: 'ヘッダーは指定できない' },
          { label: 'POSTリクエストにbodyは含められない' },
        ],
        correctIndex: 1,
        explanation:
          'POSTリクエストでは method: "POST" を指定し、body に送信するデータを設定します。JSON形式のデータを送るときは Content-Type ヘッダーも指定します。',
      },
      {
        id: 'http-methods-q10',
        text: 'DELETEメソッドを複数回送った場合、どうなりますか？',
        choices: [
          { label: '毎回新しいデータが削除される' },
          { label: '1回目に削除されてその後は変化なし（冪等）' },
          { label: '削除したデータが復元される' },
          { label: 'エラーが発生してどれも削除されない' },
        ],
        correctIndex: 1,
        explanation:
          'DELETEは冪等なメソッドです。1回目で対象が削除され、2回目以降は「すでに存在しない（または変化なし）」という同じ結果になります。',
      },
      {
        id: 'http-methods-q11',
        text: 'HTMLのフォーム（<form>）がデフォルトで使えるHTTPメソッドはどれですか？',
        choices: [
          { label: 'GET と POST のみ' },
          { label: 'GET・POST・PUT・DELETE すべて' },
          { label: 'POST と DELETE のみ' },
          { label: 'PUT のみ' },
        ],
        correctIndex: 0,
        explanation:
          'HTMLの <form> 要素がネイティブに送信できるメソッドは GET と POST のみです。PUT や DELETE を使うにはJavaScriptのfetch()などを使う必要があります。',
      },
      {
        id: 'http-methods-q12',
        text: 'プロフィール情報（名前・メールアドレス・自己紹介など全項目）を書き換えるとき、最も適切なメソッドはどれですか？',
        choices: [
          { label: 'GET' },
          { label: 'POST' },
          { label: 'PUT' },
          { label: 'DELETE' },
        ],
        correctIndex: 2,
        explanation:
          'リソース全体を丸ごと更新するにはPUTが適切です。POSTは新規作成に使います。なお、一部の項目だけ変更したい場合はPATCHを使います。',
      },
    ],
  },

  // ── 9. fetch ─────────────────────────────────────
  {
    id: 'fetch',
    title: 'fetchって何？',
    summary: 'ブラウザからサーバーへの通信手段',
    icon: 'Download',
    article: `## ひとことで言うと

fetchは、**ブラウザからサーバーにデータを取りに行くための組み込み関数**です。URLを指定するだけで、インターネット越しにデータを取得できます。

## もう少し詳しく

Webアプリでは「商品一覧を取得する」「ユーザー情報を読み込む」など、サーバーからデータを取ってくる場面が頻繁にあります。昔はXMLHttpRequest（XHR）という複雑な書き方が必要でしたが、fetchの登場でずっとシンプルになりました。

郵便にたとえると、fetchは「手紙を送ってデータを請求し、返事を受け取る」プロセスです。サーバーへリクエストを送ると、しばらくして**レスポンス（返事）**が届きます。

ここで大切なポイントが「非同期」です。fetchはすぐに結果を返さず、**Promiseというオブジェクトを返します**。データが届くまでほかの処理を続けられる仕組みです。実際のコードでは \`async/await\` を使うと、非同期の処理を順番どおり読めるすっきりした書き方になります。

また、fetchは**ネットワークエラー以外ではエラーにならない**点も注意が必要です。サーバーが「404（ページなし）」や「500（サーバーエラー）」を返してもPromiseは成功扱いになります。そのため \`response.ok\` を確認するエラー処理が必要です。

## コードで見てみよう

\`\`\`js
async function getUser() {
  try {
    const response = await fetch("https://api.example.com/user/1");

    if (!response.ok) {
      throw new Error(\`エラー: \${response.status}\`);
    }

    const user = await response.json();
    console.log(user.name); // "太郎"
  } catch (error) {
    console.error("取得失敗:", error);
  }
}
\`\`\`

\`await fetch(url)\` でサーバーにリクエストを送り、\`response.ok\` で成功かどうかを確認します。成功なら \`response.json()\` でJSON本体をJavaScriptオブジェクトに変換します。\`try/catch\` でネットワークエラーも捕捉できます。

## まとめ

- fetchは **URLにリクエストを送りデータを取得する** ブラウザ組み込み関数
- \`response.ok\` を確認しないと **4xx/5xxエラーを見逃す** ので注意
- \`async/await\` + \`try/catch\` を組み合わせると **読みやすいエラーハンドリング** ができる`,
    questions: [
      {
        id: 'fetch-q01',
        text: 'fetch() は何をする関数ですか？',
        choices: [
          { label: 'ローカルファイルを読み込む' },
          { label: 'URLにリクエストを送ってサーバーからデータを取得する' },
          { label: 'DOMに要素を追加する' },
          { label: 'JavaScriptファイルを圧縮する' },
        ],
        correctIndex: 1,
        explanation:
          'fetch() はブラウザに組み込まれた関数で、指定したURLにHTTPリクエストを送り、サーバーからデータを取得します。',
      },
      {
        id: 'fetch-q02',
        text: 'fetch() が返すものは何ですか？',
        choices: [
          { label: 'JSONオブジェクト' },
          { label: 'HTML文字列' },
          { label: 'Promise（レスポンスに解決される）' },
          { label: 'undefined' },
        ],
        correctIndex: 2,
        explanation:
          'fetch() はすぐにデータを返すのではなく、Promise を返します。Promise はデータが届いたときに解決（resolve）されます。',
      },
      {
        id: 'fetch-q03',
        text: 'response.json() は何をしていますか？',
        choices: [
          { label: 'レスポンスをJSONファイルに保存する' },
          { label: 'レスポンスのボディをJavaScriptオブジェクトに変換する' },
          { label: 'JSONを文字列に変換する' },
          { label: 'サーバーにJSONを送信する' },
        ],
        correctIndex: 1,
        explanation:
          'response.json() はサーバーから返ってきたJSONテキストをJavaScriptのオブジェクトや配列に変換（パース）するメソッドです。これも Promise を返します。',
      },
      {
        id: 'fetch-q04',
        text: 'response.ok が false になるのはどのような場合ですか？',
        choices: [
          { label: 'インターネットに接続できないとき' },
          { label: 'サーバーが 400〜599 番台のステータスコードを返したとき' },
          { label: 'response.json() を呼ばなかったとき' },
          { label: 'fetchに引数を渡さなかったとき' },
        ],
        correctIndex: 1,
        explanation:
          'response.ok は HTTPステータスコードが 200〜299 のときだけ true になります。404（未検出）や500（サーバーエラー）のときは false になります。',
      },
      {
        id: 'fetch-q05',
        text: 'サーバーが404を返した場合、fetch() はどうなりますか？',
        choices: [
          { label: 'Promiseがrejectされ、エラーがthrowされる' },
          { label: 'Promiseは成功（resolve）するが、response.ok が false になる' },
          { label: '自動的にリトライする' },
          { label: '何も返ってこない' },
        ],
        correctIndex: 1,
        explanation:
          'fetch() はネットワーク障害でない限りPromiseをrejectしません。404や500でも成功扱いになるため、response.ok を自分で確認する必要があります。',
      },
      {
        id: 'fetch-q06',
        text: '次のコードで await が2回使われている理由は何ですか？\n\nconst response = await fetch(url);\nconst data = await response.json();',
        choices: [
          { label: 'コードを長くするため' },
          { label: 'fetch() と response.json() はそれぞれ非同期で動作し、どちらも Promise を返すから' },
          { label: 'response.json() はfetch()より先に実行する必要があるから' },
          { label: 'await は1行に1回しか書けないから' },
        ],
        correctIndex: 1,
        explanation:
          'fetch() とresponse.json() はどちらも Promise を返す非同期操作です。それぞれに await を付けて、完了を待ってから次の行に進みます。',
      },
      {
        id: 'fetch-q07',
        text: 'try/catch を使うのはなぜですか？',
        choices: [
          { label: 'コードを短くするため' },
          { label: 'ネットワークエラーや throw したエラーをまとめて捕捉するため' },
          { label: 'fetchを高速化するため' },
          { label: 'JSONの変換を簡単にするため' },
        ],
        correctIndex: 1,
        explanation:
          'try/catch を使うと、ネットワーク障害など fetch() が reject するエラーや、response.ok が false のときに throw したエラーを1か所でまとめて処理できます。',
      },
      {
        id: 'fetch-q08',
        text: 'fetchを使う前に必要なインストール・設定はありますか？',
        choices: [
          { label: 'npm でインストールする必要がある' },
          { label: '<script> タグで外部ライブラリを読み込む必要がある' },
          { label: 'ブラウザに組み込まれているので、特別な準備は不要' },
          { label: 'Node.jsのインストールが必要' },
        ],
        correctIndex: 2,
        explanation:
          'fetch() はすべての主要モダンブラウザに組み込まれているため、追加のインストールなしにそのまま使えます。',
      },
      {
        id: 'fetch-q09',
        text: 'async 関数の中でしか await は使えません。これが意味することはどれですか？',
        choices: [
          { label: 'fetch は async 関数以外では使えない' },
          { label: 'await fetch() を書く関数には async キーワードが必要' },
          { label: 'async を書くとfetchが自動的に呼ばれる' },
          { label: 'async 関数の中では fetch 以外使えない' },
        ],
        correctIndex: 1,
        explanation:
          'await キーワードは async と宣言された関数の中でのみ使えます。fetch() を await で待つには、その外側の関数を async function として定義する必要があります。',
      },
      {
        id: 'fetch-q10',
        text: 'fetchが登場する以前に使われていたネットワーク通信の仕組みはどれですか？',
        choices: [
          { label: 'JSON.parse()' },
          { label: 'XMLHttpRequest（XHR）' },
          { label: 'document.querySelector()' },
          { label: 'localStorage' },
        ],
        correctIndex: 1,
        explanation:
          'fetch() が登場する前は XMLHttpRequest（XHR）がブラウザ通信の主な手段でしたが、書き方が複雑でした。fetch() によりシンプルに書けるようになりました。',
      },
      {
        id: 'fetch-q11',
        text: 'fetch() でデータを取得するとき、サーバーから返ってくるデータの一般的な形式はどれですか？',
        choices: [
          { label: 'XML' },
          { label: 'CSV' },
          { label: 'JSON' },
          { label: 'HTML' },
        ],
        correctIndex: 2,
        explanation:
          '現代のWeb APIではJSON（JavaScript Object Notation）形式でデータを返すのが一般的です。fetch() で取得後、response.json() でJavaScriptオブジェクトに変換できます。',
      },
      {
        id: 'fetch-q12',
        text: '次のコードの問題点はどれですか？\n\nconst response = await fetch(url);\nconst data = await response.json();\nconsole.log(data);',
        choices: [
          { label: 'await を2回使っているのでエラーになる' },
          { label: 'response.ok のチェックがなく、エラーレスポンスを検知できない' },
          { label: 'response.json() の前に await は不要' },
          { label: 'fetch にはオブジェクト型のURLが必要' },
        ],
        correctIndex: 1,
        explanation:
          'このコードはネットワークエラーは検知できますが、サーバーが404や500を返した場合に気づけません。response.ok を確認して、false なら throw する処理が必要です。',
      },
    ],
  },

  // ── 10. 非同期処理 ─────────────────────────────────────
  {
    id: 'async',
    title: '非同期処理って何？',
    summary: 'Promise、async/await、なぜ必要か',
    icon: 'Clock',
    article: `## ひとことで言うと

非同期処理とは、**時間のかかる作業を「待たずに」次の処理へ進める仕組み**です。Webアプリでサーバーからデータを取得したり、ファイルを読み込んだりする場面で欠かせません。

## もう少し詳しく

まず「同期処理」を理解しましょう。同期処理は料理のレシピのように**1行ずつ順番に実行**します。前の行が終わるまで次には進みません。

非同期処理は「洗濯機を回しながら料理をする」イメージです。洗濯が終わるのを待ちながら何もしないのではなく、洗濯機が動いている間に料理を進めます。Webアプリで「サーバーからデータを取得する」という処理には時間がかかります。もし同期的に処理すると、データが届くまでブラウザ全体が固まってしまいます（UIフリーズ）。非同期処理にすることで、データを待ちながら画面を操作できる状態を保てます。

JavaScriptでは非同期処理を扱う仕組みとして **Promise** があります。Promiseは「いつか結果が届く約束」を表すオブジェクトで、3つの状態を持ちます。

- **pending**（保留中）— まだ結果が出ていない状態
- **fulfilled**（成功）— 処理が完了し値が届いた状態
- **rejected**（失敗）— エラーが発生した状態

Promiseをより読みやすく書けるようにしたのが **async/await** です。\`async\` をつけた関数の中で \`await\` を使うと、Promiseが解決するまで処理を一時停止しながら、見た目は同期処理のように読めるコードが書けます。

## コードで見てみよう

\`\`\`js
// ユーザー情報をAPIから取得する例
async function fetchUser(userId) {
  try {
    const response = await fetch("https://api.example.com/users/" + userId);
    const user = await response.json();
    console.log(user.name); // "太郎"
  } catch (error) {
    console.error("取得失敗:", error);
  }
}

fetchUser(1);
\`\`\`

\`await\` を使うと「fetchが完了するまで待って、それから次へ」という流れを自然に書けます。エラーは \`try...catch\` で受け取れます。

## まとめ

- 非同期処理は **時間のかかる処理を待たずに次へ進む仕組み**（UIフリーズ防止に必須）
- **Promise** は「いつか結果が届く約束」で、pending / fulfilled / rejected の3状態を持つ
- **async/await** はPromiseをより読みやすく書ける構文で、\`try...catch\` でエラーも扱える`,
    questions: [
      {
        id: 'async-q01',
        text: '非同期処理が必要な主な理由はどれですか？',
        choices: [
          { label: 'コードを短く書けるから' },
          { label: '時間のかかる処理中にUIが固まるのを防ぐため' },
          { label: 'ブラウザのメモリ使用量を減らすため' },
          { label: 'HTMLの読み込みを速くするため' },
        ],
        correctIndex: 1,
        explanation:
          'サーバーからのデータ取得など時間のかかる処理を同期的に行うと、完了するまでブラウザ全体が固まります（UIフリーズ）。非同期処理にすることで、処理を待ちながらも画面を操作できる状態を保てます。',
      },
      {
        id: 'async-q02',
        text: '同期処理の特徴として正しいのはどれですか？',
        choices: [
          { label: '複数の処理を同時に実行する' },
          { label: '1行ずつ順番に実行し、前の処理が終わるまで次へ進まない' },
          { label: '処理の順番がランダムに決まる' },
          { label: '時間のかかる処理をスキップする' },
        ],
        correctIndex: 1,
        explanation:
          '同期処理は料理のレシピのように1行ずつ順番に実行されます。前の処理が完全に終わるまで次の処理には進みません。',
      },
      {
        id: 'async-q03',
        text: 'Promiseの状態として存在しないものはどれですか？',
        choices: [
          { label: 'pending（保留中）' },
          { label: 'fulfilled（成功）' },
          { label: 'rejected（失敗）' },
          { label: 'suspended（一時停止）' },
        ],
        correctIndex: 3,
        explanation:
          'Promiseの状態はpending（保留中）・fulfilled（成功）・rejected（失敗）の3つです。「suspended」という状態はPromiseには存在しません。',
      },
      {
        id: 'async-q04',
        text: 'async関数を呼び出すと、戻り値はどうなりますか？',
        choices: [
          { label: '通常の値がそのまま返る' },
          { label: '必ずPromiseが返る' },
          { label: 'undefinedが返る' },
          { label: '配列が返る' },
        ],
        correctIndex: 1,
        explanation:
          'async関数は常にPromiseを返します。returnした値はPromiseのfulfilled値としてラップされます。',
      },
      {
        id: 'async-q05',
        text: 'awaitキーワードの役割はどれですか？',
        choices: [
          { label: 'Promiseをキャンセルする' },
          { label: 'Promiseが解決するまで処理を一時停止して結果を取り出す' },
          { label: 'エラーを無視する' },
          { label: '複数の処理を並列実行する' },
        ],
        correctIndex: 1,
        explanation:
          'awaitはPromiseが解決（fulfilled/rejected）するまで関数の実行を一時停止し、解決した値を取り出します。ただしブラウザ全体を止めるわけではなく、その関数内の実行だけを停止します。',
      },
      {
        id: 'async-q06',
        text: 'awaitはどこで使えますか？',
        choices: [
          { label: 'どこでも使える' },
          { label: 'async関数の中でのみ使える' },
          { label: 'try...catchの中でのみ使える' },
          { label: 'グローバルスコープでのみ使える' },
        ],
        correctIndex: 1,
        explanation:
          'awaitはasync関数（またはモジュールのトップレベル）の中でのみ使えます。通常の関数内で使うとシンタックスエラーになります。',
      },
      {
        id: 'async-q07',
        text: 'async/awaitとPromiseの関係として正しいのはどれですか？',
        choices: [
          { label: 'async/awaitはPromiseとは無関係な別の仕組み' },
          { label: 'async/awaitはPromiseをより読みやすく書くための構文' },
          { label: 'async/awaitはPromiseより古い技術' },
          { label: 'async/awaitを使うとPromiseを使わなくなる' },
        ],
        correctIndex: 1,
        explanation:
          'async/awaitはPromiseの上に作られた構文です。内部ではPromiseが動いており、より読みやすい形でPromiseの処理を書けます。',
      },
      {
        id: 'async-q08',
        text: 'async/awaitでエラーをハンドリングするには何を使いますか？',
        choices: [
          { label: '.catch()メソッドのみ' },
          { label: 'throw文のみ' },
          { label: 'try...catchブロック' },
          { label: 'if文によるエラーチェック' },
        ],
        correctIndex: 2,
        explanation:
          'async/awaitでのエラーハンドリングにはtry...catchを使います。awaitしているPromiseがrejectedになるとcatchブロックが実行されます。',
      },
      {
        id: 'async-q09',
        text: '非同期処理を「洗濯機と料理」にたとえた場合、「洗濯が終わるまで何もしない」のはどちらですか？',
        choices: [
          { label: '非同期処理' },
          { label: '同期処理' },
          { label: 'どちらでもない' },
          { label: 'どちらも同じ' },
        ],
        correctIndex: 1,
        explanation:
          '同期処理は前の処理が終わるまで次へ進まないため、「洗濯が終わるまで何もしない」に相当します。非同期処理は「洗濯中に料理もする」イメージです。',
      },
      {
        id: 'async-q10',
        text: 'fetchでデータを取得した後、JSONデータをJavaScriptオブジェクトに変換するメソッドはどれですか？',
        choices: [
          { label: 'response.text()' },
          { label: 'response.json()' },
          { label: 'JSON.parse(response)' },
          { label: 'response.data()' },
        ],
        correctIndex: 1,
        explanation:
          'fetchのレスポンスからJSONデータを取り出すにはresponse.json()を使います。このメソッドもPromiseを返すため、awaitで結果を受け取ります。',
      },
      {
        id: 'async-q11',
        text: 'Promiseがpending（保留中）の状態とはどういう意味ですか？',
        choices: [
          { label: 'Promiseが失敗した状態' },
          { label: 'Promiseがキャンセルされた状態' },
          { label: 'まだ処理が完了しておらず、成功も失敗もしていない初期状態' },
          { label: 'Promiseが不要になった状態' },
        ],
        correctIndex: 2,
        explanation:
          'pendingはPromiseの初期状態で、処理がまだ完了していないことを示します。処理が完了するとfulfilled（成功）またはrejected（失敗）に移行します。',
      },
      {
        id: 'async-q12',
        text: '次のコードはどのように動作しますか？\n\nasync function getData() {\n  const res = await fetch("/api/data");\n  return res.json();\n}',
        choices: [
          { label: 'fetchを同期的に実行してすぐ結果を返す' },
          { label: 'fetchのPromiseが解決するまで待ち、完了後にres.json()のPromiseを返す' },
          { label: 'fetchが失敗したときにエラーを返す' },
          { label: 'fetchを繰り返し実行する' },
        ],
        correctIndex: 1,
        explanation:
          'awaitによりfetch()のPromiseが解決するまで待ちます。解決後、res.json()（こちらもPromiseを返す）をasync関数のreturnとして返しています。getData()の呼び出し元はawaitまたは.then()で最終的なデータを受け取れます。',
      },
    ],
  },

  // ── 11. npm / パッケージ管理 ─────────────────────────────
  {
    id: 'npm',
    title: 'npm / パッケージ管理って何？',
    summary: 'ライブラリの共有・管理の仕組み',
    icon: 'Package',
    article: `## ひとことで言うと

npmは、**JavaScriptのライブラリ（パッケージ）を簡単に取得・管理できる仕組み**です。世界中の開発者が公開したコードを、コマンド1つで自分のプロジェクトに組み込めます。

## もう少し詳しく

プログラムを作るとき、「日付の計算」「データの検証」「UIコンポーネント」など、よく使う機能を毎回自分で作るのは大変です。npmは、そうした機能を「パッケージ」として共有・再利用できるようにする仕組みです。

たとえるなら、npmはプログラミング用の**アプリストア**です。使いたいライブラリの名前を指定してインストールするだけで、すぐに使えるようになります。

npmの中心には3つの概念があります。

- **npmレジストリ** — パッケージが公開されているデータベース。100万以上のパッケージが登録されています
- **package.json** — プロジェクトの「設定ファイル」。プロジェクト名・バージョン・依存するパッケージの一覧が記録されます
- **node_modules** — インストールしたパッケージが実際に格納されるフォルダ。通常Gitには含めません

\`npm install\` を実行すると、package.json の内容をもとにすべての依存パッケージが自動的にダウンロードされます。誰かと共有するときはpackage.jsonだけ渡せばOKです。

## コードで見てみよう

\`\`\`bash
# プロジェクトを初期化する
npm init --yes

# パッケージをインストールする
npm install react

# 開発時のみ使うパッケージをインストールする
npm install --save-dev vitest

# package.jsonに記録されたパッケージをまとめてインストールする
npm install
\`\`\`

\`npm init --yes\` で package.json が作成され、\`npm install パッケージ名\` でライブラリを追加できます。\`--save-dev\` を付けると「開発時のみ必要なパッケージ」として分類されます。

## まとめ

- npmは **JavaScriptパッケージを取得・管理する仕組み**（Node.jsに同梱）
- **package.json** がプロジェクトの設定とパッケージ一覧を管理する
- \`npm install\` 1つで **全員が同じ環境を再現** できる`,
    questions: [
    {
        id: 'npm-q01',
        text: 'npmの主な役割はどれですか？',
        choices: [
          { label: 'JavaScriptのバグを自動修正する' },
          { label: 'JavaScriptのパッケージを取得・管理する' },
          { label: 'Webページのデザインを整える' },
          { label: 'サーバーのセキュリティを守る' },
      ],
        correctIndex: 1,
        explanation:
          'npm（Node Package Manager）はJavaScriptのライブラリ（パッケージ）をインストール・管理するためのツールです。',
    },
    {
        id: 'npm-q02',
        text: 'package.jsonの役割として正しいのはどれですか？',
        choices: [
          { label: 'インストールされたパッケージの実体を格納するフォルダ' },
          { label: 'プロジェクトの設定と依存パッケージの一覧を記録するファイル' },
          { label: 'JavaScriptのコードを圧縮するファイル' },
          { label: 'ブラウザのキャッシュを管理するファイル' },
      ],
        correctIndex: 1,
        explanation:
          'package.jsonはプロジェクト名・バージョン・依存するパッケージの一覧などを記録する設定ファイルです。',
    },
    {
        id: 'npm-q03',
        text: 'node_modulesフォルダには何が入っていますか？',
        choices: [
          { label: 'プロジェクト独自のソースコード' },
          { label: 'ブラウザのキャッシュデータ' },
          { label: 'npmでインストールしたパッケージの実体' },
          { label: 'package.jsonのバックアップ' },
      ],
        correctIndex: 2,
        explanation:
          'node_modulesフォルダには npm install で取得したパッケージのコードが格納されます。サイズが大きくなるため、通常Gitには含めません。',
    },
    {
        id: 'npm-q04',
        text: 'npm init --yes を実行すると何が起きますか？',
        choices: [
          { label: 'node_modulesフォルダが作成される' },
          { label: 'すべてのパッケージが最新版に更新される' },
          { label: 'デフォルト設定でpackage.jsonが作成される' },
          { label: 'プロジェクトがnpmに公開される' },
      ],
        correctIndex: 2,
        explanation:
          'npm init --yes は質問をスキップしてデフォルト値でpackage.jsonを自動生成するコマンドです。',
    },
    {
        id: 'npm-q05',
        text: '別の開発者からpackage.jsonだけを受け取った場合、同じ環境を再現するにはどうしますか？',
        choices: [
          { label: 'パッケージを1つずつ手動でインストールする' },
          { label: 'npm install を実行する' },
          { label: 'package.jsonを書き直す' },
          { label: 'node_modulesフォルダをコピーしてもらう' },
      ],
        correctIndex: 1,
        explanation:
          'npm install を実行すると、package.jsonに記録された依存パッケージがすべて自動的にダウンロードされます。',
    },
    {
        id: 'npm-q06',
        text: 'dependencies と devDependencies の違いとして正しいのはどれですか？',
        choices: [
          { label: 'dependenciesはバージョン管理用、devDependenciesはデプロイ用' },
          { label: 'dependenciesは本番でも必要、devDependenciesは開発時のみ必要' },
          { label: 'どちらも同じ意味で書き方が異なるだけ' },
          { label: 'devDependenciesの方が優先度が高い' },
      ],
        correctIndex: 1,
        explanation:
          'dependenciesは本番環境でも使うパッケージ（Reactなど）、devDependenciesは開発・テスト時のみ使うパッケージ（VitestやESLintなど）です。',
    },
    {
        id: 'npm-q07',
        text: 'npm install --save-dev vitest を実行すると、vitestはpackage.jsonのどこに記録されますか？',
        choices: [
          { label: 'dependencies' },
          { label: 'devDependencies' },
          { label: 'peerDependencies' },
          { label: 'scripts' },
      ],
        correctIndex: 1,
        explanation:
          '--save-dev オプションを付けてインストールすると、devDependencies に記録されます。テストや開発ツールはこちらに分類します。',
    },
    {
        id: 'npm-q08',
        text: 'npmのたとえとして最も近いのはどれですか？',
        choices: [
          { label: 'コードを書くテキストエディタ' },
          { label: 'プログラミング用のアプリストア' },
          { label: 'Webページを表示するブラウザ' },
          { label: 'コードを実行するサーバー' },
      ],
        correctIndex: 1,
        explanation:
          'npmはアプリストアのように、使いたいパッケージを名前で検索してインストールできます。レジストリには100万以上のパッケージが公開されています。',
    },
    {
        id: 'npm-q09',
        text: 'node_modulesフォルダを通常Gitに含めない理由はどれですか？',
        choices: [
          { label: 'Gitがnode_modulesを認識できないから' },
          { label: 'フォルダが大きく、package.jsonから再現できるから' },
          { label: 'セキュリティ上の問題があるから' },
          { label: 'node_modulesはローカルでしか動かないから' },
      ],
        correctIndex: 1,
        explanation:
          'node_modulesは非常に大きくなることがあります。package.jsonがあれば npm install で再現できるため、Gitには含めないのが一般的です。',
    },
    {
        id: 'npm-q10',
        text: 'npmレジストリとは何ですか？',
        choices: [
          { label: 'ローカルPCに保存されるパッケージのキャッシュ' },
          { label: 'パッケージが公開・配布されているデータベース' },
          { label: 'package.jsonの別名' },
          { label: 'Node.jsのバージョン管理ツール' },
      ],
        correctIndex: 1,
        explanation:
          'npmレジストリはパッケージが公開されているデータベースです。npm install を実行するとここからパッケージがダウンロードされます。',
    },
    {
        id: 'npm-q11',
        text: 'package.jsonの "scripts" フィールドは何のために使いますか？',
        choices: [
          { label: 'インストールするパッケージの一覧を書く' },
          { label: 'よく使うコマンドに短い名前をつけて実行できるようにする' },
          { label: 'プロジェクトのバージョンを管理する' },
          { label: 'CSSのスタイルを定義する' },
      ],
        correctIndex: 1,
        explanation:
          'scriptsフィールドに "start": "node index.js" のように書くと、npm start で実行できるようになります。',
    },
    {
        id: 'npm-q12',
        text: 'npmはどのツールと一緒にインストールされますか？',
        choices: [
          { label: 'React' },
          { label: 'Vite' },
          { label: 'Node.js' },
          { label: 'TypeScript' },
      ],
        correctIndex: 2,
        explanation:
          'npmはNode.jsに同梱されています。Node.jsをインストールすると自動的にnpmも使えるようになります。',
    },
  ],
},

  // ── 12. TypeScript ────────────────────────────────
  {
    id: 'typescript',
    title: 'TypeScriptって何？',
    summary: 'JavaScriptに型を加えた言語',
    icon: 'Shield',
    article: `## ひとことで言うと

TypeScriptは、**JavaScriptに「型」という概念を加えた言語**です。コードを実行する前にミスを発見できるようになり、大きなアプリを安全に開発できます。

## もう少し詳しく

JavaScriptは非常に柔軟な言語ですが、その柔軟さゆえに「数値を渡すつもりの変数に文字列が入っていた」「存在しないプロパティにアクセスしていた」といったミスに、実際にプログラムを動かすまで気づけないことがあります。

TypeScriptはJavaScriptの完全上位互換（スーパーセット）です。つまり、**JavaScriptのコードはそのままTypeScriptとして動きます**。TypeScriptを使うことで、変数や関数に「型注釈」を付けられます。

型注釈とは「この変数には文字列しか入れられない」「この関数は数値を受け取って文字列を返す」といった約束事をコードに書き込むことです。カーナビにたとえるなら、目的地（どんな値を使うか）を事前に設定しておけば、道を外れたとき（型が合わないとき）にすぐ警告が出る仕組みです。

TypeScriptのコードはブラウザで直接動きません。**コンパイル（トランスパイル）** という変換作業でJavaScriptに変換してから実行します。この変換の際に型チェックも行われるため、ミスを実行前に発見できます。

## コードで見てみよう

\`\`\`ts
// 型注釈なし（JavaScript）
function greet(name) {
  return "こんにちは、" + name + "さん！";
}

// 型注釈あり（TypeScript）
function greet(name: string): string {
  return "こんにちは、" + name + "さん！";
}

greet("太郎");   // OK
greet(42);       // エラー: 数値は string ではない
\`\`\`

\`name: string\` が引数の型注釈、\`: string\` が戻り値の型注釈です。\`greet(42)\` のように数値を渡そうとすると、実行前にエラーが報告されます。

## まとめ

- TypeScriptは **JavaScriptに型注釈を加えた言語**（JSの完全上位互換）
- **型注釈**を書くことで、実行前にミスを発見できる
- TypeScriptのコードは **コンパイルでJavaScriptに変換**してから動く`,
    questions: [
      {
        id: 'typescript-q01',
        text: 'TypeScriptとJavaScriptの関係として正しいのはどれですか？',
        choices: [
          { label: 'TypeScriptはJavaScriptとは全く別の言語' },
          { label: 'TypeScriptはJavaScriptの完全上位互換（スーパーセット）' },
          { label: 'JavaScriptはTypeScriptの上位互換' },
          { label: 'TypeScriptはJavaScriptを置き換える予定の言語' },
        ],
        correctIndex: 1,
        explanation:
          'TypeScriptはJavaScriptのスーパーセット（上位互換）です。JavaScriptのコードはそのままTypeScriptとして動きます。TypeScriptはJavaScriptに型システムなどの機能を加えたものです。',
      },
      {
        id: 'typescript-q02',
        text: 'TypeScriptが解決しようとする問題はどれですか？',
        choices: [
          { label: 'JavaScriptの実行速度が遅い問題' },
          { label: 'JavaScriptをブラウザで動かせない問題' },
          { label: '実行するまでミス（型のズレなど）に気づけない問題' },
          { label: 'JavaScriptのコード量が多くなりすぎる問題' },
        ],
        correctIndex: 2,
        explanation:
          'TypeScriptの主な目的は、コードを実行する前に型の不一致などのミスを発見できるようにすることです。JavaScriptでは実行時まで気づけないバグを、TypeScriptでは開発中に検出できます。',
      },
      {
        id: 'typescript-q03',
        text: '「型注釈」とは何ですか？',
        choices: [
          { label: 'コードにコメントを追加すること' },
          { label: '変数や関数に「どんな型の値を扱うか」を明記すること' },
          { label: 'エラーメッセージを日本語化すること' },
          { label: 'コードを自動的に整形すること' },
        ],
        correctIndex: 1,
        explanation:
          '型注釈とは、変数や関数に「この変数には文字列しか入れられない」「この関数は数値を返す」といった型情報をコードに書き込むことです。TypeScriptの型チェックはこの情報をもとに行われます。',
      },
      {
        id: 'typescript-q04',
        text: '次のコードで name: string の意味はどれですか？\n\nfunction greet(name: string): string { ... }',
        choices: [
          { label: 'name という名前の文字列定数を作る' },
          { label: '引数 name は文字列型でなければならないという注釈' },
          { label: 'name を string というオブジェクトに変換する' },
          { label: 'name の文字数を確認する' },
        ],
        correctIndex: 1,
        explanation:
          '関数の引数に付ける name: string は「この引数には string（文字列）型の値を渡す必要がある」という型注釈です。文字列以外を渡すとコンパイル時にエラーになります。',
      },
      {
        id: 'typescript-q05',
        text: 'TypeScriptの基本的な型として存在しないのはどれですか？',
        choices: [
          { label: 'string' },
          { label: 'number' },
          { label: 'boolean' },
          { label: 'integer' },
        ],
        correctIndex: 3,
        explanation:
          'TypeScript（およびJavaScript）の基本型は string・number・boolean などです。integer（整数型）は存在せず、整数も小数も同じ number 型で扱います。',
      },
      {
        id: 'typescript-q06',
        text: '次のコードはTypeScriptでエラーになりますか？\n\nconst age: number = "25";',
        choices: [
          { label: 'エラーにならない。自動変換される' },
          { label: 'エラーになる。number 型に string は代入できない' },
          { label: 'エラーにならない。number と string は互換性がある' },
          { label: '実行してみないとわからない' },
        ],
        correctIndex: 1,
        explanation:
          'age を number 型と宣言しているのに string の "25" を代入しようとしているため、TypeScriptのコンパイル時にエラーになります。これがTypeScriptの型チェックの基本的な働きです。',
      },
      {
        id: 'typescript-q07',
        text: 'TypeScriptのコードをブラウザで動かすには何が必要ですか？',
        choices: [
          { label: '最新のブラウザがあれば直接動く' },
          { label: 'コンパイル（トランスパイル）でJavaScriptに変換する必要がある' },
          { label: 'サーバーサイドでのみ動かせる' },
          { label: '特別なブラウザ拡張機能が必要' },
        ],
        correctIndex: 1,
        explanation:
          'ブラウザはTypeScriptを直接理解できません。TypeScriptのコードはコンパイル（トランスパイル）によってJavaScriptに変換されてから、ブラウザで実行されます。',
      },
      {
        id: 'typescript-q08',
        text: 'TypeScriptでの型チェックはいつ行われますか？',
        choices: [
          { label: 'ブラウザでページを開いたとき' },
          { label: 'コンパイル（変換）のとき' },
          { label: 'ユーザーがボタンを押したとき' },
          { label: 'サーバーにデプロイしたとき' },
        ],
        correctIndex: 1,
        explanation:
          'TypeScriptの型チェックはコンパイル時（JavaScriptへの変換時）に行われます。実行前にミスを発見できるのはこのためです。',
      },
      {
        id: 'typescript-q09',
        text: '関数の戻り値の型注釈はどこに書きますか？',
        choices: [
          { label: '関数名の前' },
          { label: '引数リストの前' },
          { label: '引数リストの閉じ括弧 ) のあと' },
          { label: '関数の中のreturn文の前' },
        ],
        correctIndex: 2,
        explanation:
          '関数の戻り値の型注釈は引数リストの閉じ括弧 ) のあとに書きます。例: function greet(name: string): string { ... } の ): string の部分が戻り値の型注釈です。',
      },
      {
        id: 'typescript-q10',
        text: 'TypeScriptを使うメリットとして最も適切なのはどれですか？',
        choices: [
          { label: 'コードの実行速度が大幅に向上する' },
          { label: 'コードを書く量が大幅に減る' },
          { label: '開発中に型の間違いを発見でき、バグを未然に防げる' },
          { label: 'ブラウザの互換性問題がなくなる' },
        ],
        correctIndex: 2,
        explanation:
          'TypeScriptの最大のメリットは、型チェックによってコードを実行する前にバグを発見できることです。特にアプリが大きくなるほど、このメリットが大きくなります。',
      },
      {
        id: 'typescript-q11',
        text: 'カーナビのたとえでTypeScriptの型チェックに当たるのはどれですか？',
        choices: [
          { label: '目的地に到着したときの音声案内' },
          { label: '道を外れたときに出る警告' },
          { label: '燃料残量のゲージ' },
          { label: 'ルートを検索する機能' },
        ],
        correctIndex: 1,
        explanation:
          'TypeScriptの型チェックは、道（型）を外れたときに警告を出すカーナビの機能に似ています。目的地（どんな値を使うか）を事前に宣言しておくことで、ズレを早期に検知できます。',
      },
      {
        id: 'typescript-q12',
        text: '既存のJavaScriptファイルをTypeScriptプロジェクトに持ち込んだ場合、どうなりますか？',
        choices: [
          { label: '全てのコードを書き直す必要がある' },
          { label: '全てに型注釈を付けないと動かない' },
          { label: 'TypeScriptはJavaScriptの上位互換なので基本的にそのまま動く' },
          { label: '自動的にTypeScriptのコードに変換される' },
        ],
        correctIndex: 2,
        explanation:
          'TypeScriptはJavaScriptの完全上位互換なので、既存のJavaScriptコードはそのままTypeScriptとして動きます。型注釈は少しずつ追加していけばよく、段階的に移行できます。',
      },
    ],
  },
]
