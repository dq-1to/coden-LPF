export const previewByStepId: Record<string, { title: string; description: string }> = {
  'usestate-basic': {
    title: 'Counter Preview',
    description: 'クリックでカウントが増えるUIを確認できる状態です。',
  },
  events: {
    title: 'Event Preview',
    description: 'イベントハンドラが接続された状態です。',
  },
  conditional: {
    title: 'Conditional Preview',
    description: '条件分岐に応じて表示切り替えが動作する状態です。',
  },
  lists: {
    title: 'List Preview',
    description: 'リスト描画とkey設定が有効です。',
  },
  useeffect: {
    title: 'Effect Sync Preview',
    description: '副作用で取得したデータや保存状態が、画面に同期される流れを確認できます。',
  },
  forms: {
    title: 'Form Control Preview',
    description: '入力値の管理とバリデーション結果が、フォームUIに反映される状態を確認できます。',
  },
  usecontext: {
    title: 'Context Sharing Preview',
    description: 'Context 経由で共有された状態が、複数コンポーネントへ同時に届く様子を確認できます。',
  },
  usereducer: {
    title: 'Reducer Flow Preview',
    description: 'dispatch された action に応じて、状態が段階的に更新される流れを確認できます。',
  },
  'custom-hooks': {
    title: 'Custom Hook Preview',
    description: '再利用可能なロジックが Hook に切り出され、画面からシンプルに使われる状態を確認できます。',
  },
  'api-fetch': {
    title: 'Fetch State Preview',
    description: 'API から取得したデータが、ローディングを経て画面へ描画される流れを確認できます。',
  },
  performance: {
    title: 'Performance Preview',
    description: '不要な再計算や再描画を抑えながら、同じUIを保つ最適化の考え方を確認できます。',
  },
  testing: {
    title: 'Testing Result Preview',
    description: 'テストコードで UI の期待動作を固定し、変更時の退行を防ぐ考え方を確認できます。',
  },
  'api-counter-get': {
    title: 'API Counter GET Preview',
    description: 'GET リクエストで取得したカウンター値が、初期表示に反映される状態を確認できます。',
  },
  'api-counter-post': {
    title: 'API Counter POST Preview',
    description: 'POST リクエストで更新した値が、サーバー応答とともに画面へ反映される流れを確認できます。',
  },
  'api-tasks-list': {
    title: 'Task List Preview',
    description: 'API から取得したタスク一覧が、読み込み完了後に画面へ並ぶ状態を確認できます。',
  },
  'api-tasks-create': {
    title: 'Task Create Preview',
    description: 'フォーム送信で作成したタスクが、一覧へ即座に追加される流れを確認できます。',
  },
  'api-tasks-update': {
    title: 'Task Update Preview',
    description: '選択中タスクの変更内容が、更新APIの結果とともに一覧へ反映される状態を確認できます。',
  },
  'api-tasks-delete': {
    title: 'Task Delete Preview',
    description: '削除したタスクが一覧から消え、最新状態へ同期される流れを確認できます。',
  },
  'api-custom-hook': {
    title: 'useTasks Preview',
    description: 'API 操作をカスタム Hook にまとめ、一覧更新と状態管理を一箇所で扱う構成を確認できます。',
  },
  'api-error-loading': {
    title: 'Error Handling Preview',
    description: 'ローディング中とエラー時で表示を切り替え、非同期 UI を安全に扱う状態を確認できます。',
  },
}
