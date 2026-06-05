# Coden コンテンツ追加・レビュー基準

**目的**: Coden の学習コンテンツを追加・修正するときに、到達目標、難易度、4モードのつながり、Base Nook との接続を一定品質で保つ。

このドキュメントは公開しても問題ない運用基準として扱う。個別ユーザー情報、未公開の事業判断、APIキー、認証情報、個人メモは書かない。

---

## 1. 対象

主な対象ファイル:

- `apps/web/src/content/courseData.ts`
- `apps/web/src/content/*/steps/*.ts`
- `apps/web/src/content/*/steps/index.ts`
- `apps/web/src/content/stepLearningGoals.ts`
- `apps/web/src/content/base-nook/topics.ts`
- `apps/web/src/content/base-nook/stepLinks.ts`
- `apps/web/src/content/__tests__/stepWalkthrough.test.ts`

対象コンテンツ:

- Step の Read / Practice / Test / Challenge
- Step メタ情報: `learningGoal`, `prerequisites`, `commonMistakes`, `relatedBaseNook`
- Base Nook トピックと Step の相互リンク
- Daily / Code Doctor / Mini Projects / Code Reading など、Step と関連する補助教材

---

## 2. Step 追加時の必須項目

新しい Step を追加するときは、最低限以下をそろえる。

| 項目 | 基準 |
|---|---|
| `id` | URLやDBに残るため、短く安定した kebab-case にする |
| `order` | `courseData.ts` と content 側で一致させる |
| `title` / `summary` | 学習者が内容をすぐ想像できる文言にする |
| `learningGoal` | そのStep後に「何ができるようになるか」を1文で書く |
| `readMarkdown` | 100文字以上。概念だけでなく、なぜ必要かを説明する |
| `practiceQuestions` | 1問以上。各問に `prompt`, `answer`, `hint` を持たせる |
| `testTask` | Readで学んだ内容を短く確認する。`expectedKeywords` を設定する |
| `challengeTask` | 実装寄りの課題を1パターン以上用意する |

`prerequisites`, `commonMistakes`, `relatedBaseNook` は段階適用のため optional だが、主要Stepでは付与を推奨する。

---

## 3. 学習メタ情報の書き方

### 3.1 learningGoal

良い `learningGoal` は、学習者が「このStepで何を得るか」を具体的に判断できる。

良い例:

```ts
learningGoal: '配列データをmapでJSXに変換し、安定したkeyを付けてリストUIを描画できるようになる。'
```

避ける例:

```ts
learningGoal: 'リストについて理解する。'
```

チェック観点:

- 「理解する」だけで終わらず、説明・実装・判断などの行動が見える
- 1文で読み切れる
- Step の Read / Practice / Test / Challenge と対応している
- 前後Stepの難易度と飛びすぎていない

### 3.2 prerequisites

`prerequisites` は、このStepに入る前に確認しておく概念を書く。

基準:

- 2〜4項目を目安にする
- 「Reactが完璧に分かること」のような広すぎる条件にしない
- Base Nook で補える概念がある場合は `relatedBaseNook` と合わせる
- 未習得でも進められる軽い前提は、ロック条件ではなく学習補助として書く

### 3.3 commonMistakes

`commonMistakes` は、初学者がつまずきやすい点を責めない表現で書く。

良い例:

```ts
commonMistakes: [
  'mapの戻り値を書き忘れて、何も表示されない',
  'keyに配列indexを安易に使い、並び替えや削除で表示がずれる',
]
```

避ける表現:

- 「基本を理解していない」
- 「間違った書き方」
- 「ちゃんと考えていない」

チェック観点:

- 現象と確認ポイントが分かる
- Practice / Test の不正解時補足に使っても自然
- 1項目が長すぎない

### 3.4 relatedBaseNook

`relatedBaseNook` は、Step の補習に役立つ Base Nook topic ID を指定する。

基準:

- topic ID は `BASE_NOOK_TOPICS` に存在するものだけを使う
- 主学習の代替ではなく、前提概念の補助として使う
- 関連が弱い topic を増やしすぎない
- 追加・変更時は `apps/web/src/content/base-nook/__tests__/stepLinks.test.ts` と `stepWalkthrough.test.ts` の観点を確認する

---

## 4. 4モードの対応基準

Coden の Step は Read → Practice → Test → Challenge の順で、理解から実装へ進む。

| モード | 役割 | レビュー観点 |
|---|---|---|
| Read | 概念理解 | なぜ必要か、どう使うか、落とし穴が説明されている |
| Practice | 小さな確認 | Readの内容を直接使う。答えが暗記だけになりすぎない |
| Test | 短い判定 | 1つの要点を確認する。`expectedKeywords` が過不足ない |
| Challenge | 実装練習 | 実務に近い文脈で、複数要件を満たす課題にする |

レビュー時は、各モードが別々の教材になっていないかを見る。Readで説明していない概念をTestやChallengeで突然要求しない。

---

## 5. 難易度設計

難易度は前後Stepとコース内の位置で判断する。

| レベル | 目安 |
|---|---|
| beginner | 1つの概念を小さく試す。構文・用語の説明を省略しない |
| intermediate | 複数の概念を組み合わせる。状態管理やAPIなど、実装の流れを扱う |
| advanced | 設計判断を含める。失敗時・境界条件・実務文脈を扱う |

急に難しくなる兆候:

- ReadにないAPIや型をChallengeで要求している
- starterCode の TODO が多すぎる
- `expectedKeywords` が多すぎて、何を見たい判定か分からない
- 1つのStepで複数の新概念を初登場させている

---

## 6. レビュー前チェックリスト

コンテンツPRを出す前に確認する。

- [ ] `courseData.ts` と content 側の `id` / `order` が一致している
- [ ] `learningGoal` が定義されている
- [ ] 主要Stepでは `prerequisites` / `commonMistakes` / `relatedBaseNook` が定義されている
- [ ] Readで説明した内容がPractice / Test / Challengeに反映されている
- [ ] Practiceの `choices` がある場合、`answer` が choices に含まれている
- [ ] Test / Challenge の `expectedKeywords` が判定目的に合っている
- [ ] モバイルパズルがある場合、空欄とトークンが過不足ない
- [ ] Base Nook topic ID が存在する
- [ ] `cmd /c npm run typecheck`
- [ ] `cmd /c npm run lint`
- [ ] `cmd /c npm run test`
- [ ] `cmd /c npm run build`

---

## 7. 既存コンテンツ修正時の注意

既存Stepの `id` は、URL、進捗、復習、提出履歴と結びつく。基本的に変更しない。

変更してよいもの:

- 表現の改善
- `learningGoal` などのメタ情報
- 説明の補足
- Practice / Test / Challenge の明らかな誤り修正
- `expectedKeywords` の過不足修正

慎重に扱うもの:

- Step ID
- `order`
- Challenge の判定条件
- Supabase に保存される値と対応する識別子

---

## 8. PR本文に書くこと

コンテンツPRでは、最低限以下を書く。

```md
## Summary
- 追加・修正したStep
- learningGoal / prerequisites / commonMistakes / relatedBaseNook の追加範囲
- Read / Practice / Test / Challenge の主な変更点

## Test plan
- cmd /c npm run typecheck
- cmd /c npm run lint
- cmd /c npm run test
- cmd /c npm run build
```

スクリーンショット確認をユーザー側で行う場合は、その前提も明記する。
