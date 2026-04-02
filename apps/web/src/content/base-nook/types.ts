/** Base Nook クイズの選択肢 */
export interface QuizChoice {
  label: string
}

/** Base Nook クイズの1問 */
export interface BaseNookQuestion {
  id: string // 'javascript-q01'
  text: string
  choices: QuizChoice[]
  correctIndex: number // 0-based
  explanation: string
}

/** Base Nook トピックの定義 */
export interface BaseNookTopic {
  id: string // 'javascript', 'jsx', ...
  title: string // 「JavaScriptって何？」
  summary: string // カード用の短い説明（1行）
  icon: string // lucide-react アイコン名
  article: string // 解説記事（HTML or Markdown テキスト）
  questions: BaseNookQuestion[]
}

/** DB から取得する進捗サマリー（トピック単位） */
export interface TopicProgressSummary {
  topicId: string
  correctCount: number
}
