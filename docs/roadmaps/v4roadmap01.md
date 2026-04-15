# v4roadmap01: Challenge モバイルパズル全ステップ展開

**作成日**: 2026-04-10
**更新日**: 2026-04-14
**前提**: PR #234 で A/B 比較実装完了。B方式（複数ブランク）に統一する方針決定。
**スコープ**: 全40ステップの Challenge パターンに `mobilePuzzle` (type: 'multi') を追加し、モバイルでパズル UI を提供する。

---

## 1. 背景

v3 の Challenge モードはモバイルでフルエディタ + キーボード表示が前提だが、キーボード展開時に CodeToolbar が隠れる UX 問題がある。PR #234 で A方式（単一ブランク）と B方式（複数ブランク）を比較実装し、B方式が優れていると判断した。

**方針**: 全ステップを B方式（`type: 'multi'`）に統一し、A方式（`ChallengePuzzleSimple`）は削除する。

---

## 2. 現状

| コース | ステップ数 | パターン数 | mobilePuzzle 済 |
|--------|-----------|-----------|----------------|
| React基礎 (fundamentals) | 4 | 8 | 4 (50%) |
| React応用 (intermediate) | 4 | 8 | 0 |
| React実践 (advanced) | 4 | 4 | 0 |
| API連携実践 (api-practice) | 8 | 8 | 0 |
| TypeScript基礎 (typescript) | 6 | 12 | 0 |
| TypeScript×React (typescript-react) | 4 | 8 | 0 |
| Reactモダン (react-modern) | 6 | 12 | 0 |
| 実務パターン (react-patterns) | 4 | 8 | 0 |
| **合計** | **40** | **68** | **4 (6%)** |

---

## 3. 設計ルール

### 3.1 codeContext 作成ルール

1. `starterCode` から TODO コメント行を除去
2. 学習者が埋めるべき箇所を `____0`, `____1`, ... に置換
3. import 文・既存の定数定義・JSX の構造骨格はそのまま残す
4. `expectedKeywords` の全キーワードがいずれかのブランクの `correctTokens` に含まれること

### 3.2 ブランク設計ルール

1. **ブランク数**: 2〜4個（目安）。1個でも意味的に妥当なら可
2. **粒度**: 意味的にまとまりのある単位で区切る
   - state 定義一式（`const [x, setX] = useState(...)`）
   - イベントハンドラ設定（`onChange={...}`）
   - 関数本体（function body）
   - JSX 式（`{condition && <Component />}`）
3. **ラベル**: 日本語で機能を表す 2〜6文字（例: "state定義", "条件分岐", "Effect処理"）

### 3.3 トークン分割ルール

1. **分割単位**: キーワード・識別子・演算子・括弧ごとに分割
2. **結合してよいケース**:
   - プロパティアクセス: `e.target.value`, `state.count`
   - 短い文字列リテラル: `'active'`, `"dark"`
   - JSXタグ: `<button>`, `</button>`
3. **分割すべきケース**:
   - 代入: `=` は独立トークン
   - アロー: `=>` は独立トークン
   - 括弧: `(`, `)`, `{`, `}`, `[`, `]` は各独立

### 3.4 distractor 選定ルール

1. **個数**: 3〜7個/ブランク
2. **選定基準**: 同カテゴリの別キーワード
   - Hook: `useState` → distractor: `useEffect`, `useRef`, `useMemo`
   - イベント: `onChange` → distractor: `onClick`, `onSubmit`, `onBlur`
   - メソッド: `map` → distractor: `forEach`, `filter`, `reduce`
   - 演算子: `?` → distractor: `&&`, `||`
3. **トラップ**: expectedKeywords に近いが微妙に違うもの（`setCount` → `getCount`）

---

## 4. マイルストーン

### M0: 基盤整理（A方式削除 + B方式統一）

既存の A方式コードを B方式に変換し、不要コードを削除する。

- [x] usestate-basic の2パターンを `type: 'simple'` → `type: 'multi'` に変換
- [x] `ChallengePuzzleSimple.tsx` を削除
- [x] `ChallengeMobilePuzzleSimple` 型定義を削除
- [x] `ChallengeMode.tsx` から A方式分岐を削除（B方式のみに簡素化）
- [x] テスト更新（A方式テストケース削除・B方式テストケース追加）
- [x] CI 通過確認

### M1: React基礎（fundamentals）残り4パターン

4ステップ・8パターン（4パターンは M0 で対応済み）

- [x] conditional × 2パターンに `mobilePuzzle` 追加
- [x] lists × 2パターンに `mobilePuzzle` 追加
- [x] CI 通過確認
- [ ] Playwright モバイル幅スクリーンショット確認

### M2: React応用（intermediate）8パターン

4ステップ・8パターン

- [x] useeffect × 2パターンに `mobilePuzzle` 追加
- [x] forms × 2パターンに `mobilePuzzle` 追加
- [x] usecontext × 2パターンに `mobilePuzzle` 追加
- [x] usereducer × 2パターンに `mobilePuzzle` 追加
- [x] CI 通過確認

### M3: React実践（advanced）4パターン

4ステップ・4パターン

- [x] custom-hooks × 1パターンに `mobilePuzzle` 追加
- [x] api-fetch × 1パターンに `mobilePuzzle` 追加
- [x] performance × 1パターンに `mobilePuzzle` 追加
- [x] testing × 1パターンに `mobilePuzzle` 追加
- [x] CI 通過確認

### M4: API連携実践（api-practice）8パターン

8ステップ・8パターン

- [x] api-counter-get × 1パターンに `mobilePuzzle` 追加
- [x] api-counter-post × 1パターンに `mobilePuzzle` 追加
- [x] api-tasks-list × 1パターンに `mobilePuzzle` 追加
- [x] api-tasks-create × 1パターンに `mobilePuzzle` 追加
- [x] api-tasks-update × 1パターンに `mobilePuzzle` 追加
- [x] api-tasks-delete × 1パターンに `mobilePuzzle` 追加
- [x] api-custom-hook × 1パターンに `mobilePuzzle` 追加
- [x] api-error-loading × 1パターンに `mobilePuzzle` 追加
- [x] CI 通過確認

### M5: TypeScript基礎（typescript）12パターン

6ステップ・12パターン

- [ ] ts-types × 2パターンに `mobilePuzzle` 追加
- [ ] ts-functions × 2パターンに `mobilePuzzle` 追加
- [ ] ts-objects × 2パターンに `mobilePuzzle` 追加
- [ ] ts-union-narrowing × 2パターンに `mobilePuzzle` 追加
- [ ] ts-generics × 2パターンに `mobilePuzzle` 追加
- [ ] ts-utility-types × 2パターンに `mobilePuzzle` 追加
- [ ] CI 通過確認

### M6: TypeScript×React（typescript-react）8パターン

4ステップ・8パターン

- [ ] ts-react-props × 2パターンに `mobilePuzzle` 追加
- [ ] ts-react-state × 2パターンに `mobilePuzzle` 追加
- [ ] ts-react-hooks × 2パターンに `mobilePuzzle` 追加
- [ ] ts-react-events × 2パターンに `mobilePuzzle` 追加
- [ ] CI 通過確認

### M7: Reactモダン（react-modern）12パターン

6ステップ・12パターン

- [ ] error-boundary × 2パターンに `mobilePuzzle` 追加
- [ ] suspense-lazy × 2パターンに `mobilePuzzle` 追加
- [ ] concurrent-features × 2パターンに `mobilePuzzle` 追加
- [ ] use-optimistic × 2パターンに `mobilePuzzle` 追加
- [ ] portals × 2パターンに `mobilePuzzle` 追加
- [ ] forward-ref × 2パターンに `mobilePuzzle` 追加
- [ ] CI 通過確認

### M8: 実務パターン（react-patterns）8パターン

4ステップ・8パターン

- [ ] rhf-zod × 2パターンに `mobilePuzzle` 追加
- [ ] pagination × 2パターンに `mobilePuzzle` 追加
- [ ] infinite-scroll × 2パターンに `mobilePuzzle` 追加
- [ ] auth-flow × 2パターンに `mobilePuzzle` 追加
- [ ] CI 通過確認

---

## 5. パターンごとブランク設計メモ

凡例: `blanks: ①ラベル（対象コード概要） | distractor: 方針`

### M0: usestate-basic 変換（simple → multi）

**usestate-like**: blanks: ①state定義（`const [count, setCount] = useState(0)`） ②return文（`return (<button onClick={...}>{count}</button>)`） | distractor: useEffect, useRef, let, -, getCount

**usestate-toggle**: blanks: ①state定義（`const [isOn, setIsOn] = useState(false)`） ②return文（`return (<button onClick={...}>{isOn ? "ON" : "OFF"}</button>)`） | distractor: useEffect, true, getIsOn, &&

### M1: React基礎 残り4パターン

**conditional-login**: blanks: ①条件分岐（`isLoggedIn ? <p>ようこそ！</p> : <button onClick={...}>ログイン</button>`） | distractor: &&, ||, if, isActive

**conditional-badge**: blanks: ①条件付き表示（`hasNewMessage && <span>New!</span>`） | distractor: ||, isRead, ? :

**lists-todo**: blanks: ①リスト描画（`todos.map(todo => <li key={todo.id}>{todo.title}</li>)`） | distractor: forEach, filter, index, todo.name

**lists-filter**: blanks: ①フィルタリング（`.filter(t => t.isCompleted)`） ②リスト描画（`.map(t => <li key={t.id}>{t.title}</li>)`） | distractor: find, some, forEach, index

### M2: React応用 8パターン

**useeffect-timer**: blanks: ①Effect本体（`useEffect(() => { const id = setInterval(...); return () => clearInterval(id); }, [])`） | distractor: setTimeout, useCallback, useMemo, removeInterval

**useeffect-fetch**: blanks: ①state定義（`const [data, setData] = useState("Loading...")`） ②Effect処理（`useEffect(() => { setTimeout(() => setData("Data Loaded!"), 2000) }, [])`） ③表示（`{data}`） | distractor: useRef, clearTimeout, useCallback

**forms-controlled**: blanks: ①state定義（`const [text, setText] = useState('')`） ②制御input（`value={text} onChange={e => setText(e.target.value)}`） ③disabled条件（`disabled={text.length < 5}`） | distractor: useRef, onClick, onBlur, text.size

**forms-multiple**: blanks: ①state定義（`const [name, setName] = useState(''); const [email, setEmail] = useState('')`） ②name input（`value={name} onChange={...}`） ③送信制御（`disabled={!name || !email}`） | distractor: useRef, onBlur, name.length

**usecontext-basic**: blanks: ①Context取得（`const user = useContext(UserContext)`） ②表示（`{user}`） | distractor: createContext, useReducer, useState, props

**usecontext-provider**: blanks: ①Provider設定（`<ThemeContext.Provider value="dark">...<ComponentDeepDown />...</ThemeContext.Provider>`） | distractor: Consumer, useContext, "light", createContext

**usereducer-calc**: blanks: ①caseブロック（`case 'STEP_UP': return { count: state.count + 5 }`） | distractor: INCREMENT, DECREMENT, state.count + 1, state.value

**usereducer-dispatch**: blanks: ①dispatch呼び出し（`onClick={() => dispatch({ type: 'DECREMENT' })}`） | distractor: setState, emit, 'INCREMENT', 'RESET', onChange

### M3: React実践 4パターン

**custom-hooks-1**: blanks: ①遅延初期化（`useState(() => { ... localStorage.getItem(key) ... })`） ②setValue実装（`const setValue = (val) => { setStoredValue(val); localStorage.setItem(key, JSON.stringify(val)) }`） ③return文（`return { value, setValue }`） | distractor: useEffect, sessionStorage, useRef, getItem

**api-fetch-1**: blanks: ①state定義（`data, isLoading, error の3つの useState`） ②fetch処理（`fetch(url, { signal }) + try/catch/finally`） ③cleanup（`return () => controller.abort()`） | distractor: useCallback, XMLHttpRequest, controller.cancel, useMemo

**performance-1**: blanks: ①memo wrap（`memo(({ onClick, label }) => ...)`） ②useCallback定義（`const handleIncrement = useCallback(() => setCount(c => c + 1), [])`） | distractor: useMemo, useRef, React.lazy, forwardRef

**testing-1**: blanks: ①初期検証（`expect(screen.queryByText('...')).toBeNull()`） ②空欄送信テスト（`await user.click(...); expect(screen.getByText('メールアドレスを...'))`） ③正常送信テスト（`await user.type(...); await user.click(...); expect(mockOnLogin).toHaveBeenCalledWith(...)`） | distractor: getByTestId, findByText, toBeCalled, container

### M4: API連携 8パターン

**api-counter-get (c1)**: blanks: ①loadCounter関数（`async function loadCounter() { ... fetch ... setValue(data.value) }`） ②再読み込みボタン（`<button onClick={loadCounter}>再読み込み</button>`） | distractor: axios, XMLHttpRequest, useCallback, data.count

**api-counter-post (c1)**: blanks: ①sendValue関数（`async function sendValue(n) { await fetch('/counter', { method: 'PUT', ... }) }`） ②3ボタン（`<button onClick={() => sendValue(value+1)}>+1</button> ...`） | distractor: POST, PATCH, axios, data.value

**api-tasks-list (c1)**: blanks: ①loadTasks+useEffect（`async function loadTasks() {...} useEffect(() => { loadTasks() }, [])`） ②completed表示（`task.completed ? '✓' : '○'`） | distractor: axios, useMemo, task.done, forEach

**api-tasks-create (c1)**: blanks: ①handleSubmit本体（`trim()チェック → fetch POST → setTasks(prev => [...prev, newTask])`） | distractor: PUT, PATCH, unshift, push, axios

**api-tasks-update (c1)**: blanks: ①楽観的更新（`setTasks(prev => prev.map(...))`） ②PATCH呼び出し+ロールバック（`try { fetch PATCH } catch { setTasks(prev) }`） | distractor: PUT, POST, filter, forEach, splice

**api-tasks-delete (c1)**: blanks: ①confirm+DELETE（`if (!confirm('...')) return; await fetch(..., { method: 'DELETE' })`） ②リスト更新（`setTasks(prev => prev.filter(t => t.id !== task.id))`） | distractor: POST, splice, remove, map, prompt

**api-custom-hook (c1)**: blanks: ①fetchTasks実装（`useCallback(async () => { fetch GET → setTasks }, [])`） ②createTask実装（`useCallback(async (title) => { fetch POST → fetchTasks }, [fetchTasks])`） ③deleteTask実装（`useCallback(async (id) => { fetch DELETE → setTasks filter }, [])`） | distractor: useMemo, useRef, axios, PUT

**api-error-loading (c1)**: blanks: ①load関数（`dispatch FETCH_START → fetch → dispatch FETCH_SUCCESS/ERROR`） ②状態別UI（`status === 'loading' ? skeleton : status === 'error' ? errorUI : listUI`） | distractor: setState, FETCH_RESET, useCallback, useState

### M5: TypeScript基礎 12パターン

**ts-types-1**: blanks: ①Product型定義（`type Product = { name: string; price: number; inStock: boolean }`） ②formatProduct関数body（`return ...inStock ? '在庫あり' : '在庫なし'`） | distractor: interface, any, object, Array

**ts-types-2**: blanks: ①UserStatus型（`type UserStatus = 'pending' | 'active' | 'inactive'`） ②switch文body（`case 'pending': return '保留中' ...`） | distractor: enum, string, boolean, undefined

**ts-functions-1**: blanks: ①ジェネリック関数シグネチャ（`function filterByCondition<T>(...): T[]`） ②実装body（`return arr.filter(predicate)`） | distractor: any[], unknown, map, forEach

**ts-functions-2**: blanks: ①applyTwice型注釈（`function applyTwice(value: number, fn: (n: number) => number): number`） ②実装（`return fn(fn(value))`） | distractor: string, any, void, callback

**ts-objects-1**: blanks: ①Article interface（`interface Article { readonly id: number; title: string; ... }`） ②createDraft関数（`return { id, title, content: '', tags: [] }`） | distractor: type, class, const, mutable

**ts-objects-2**: blanks: ①AdminUser extends（`interface AdminUser extends User { permissions: string[] }`） ②isAdmin型ガード（`function isAdmin(user: User): user is AdminUser`） | distractor: implements, typeof, instanceof, as

**ts-union-narrowing-1**: blanks: ①ApiResponse型定義（`type ApiResponse = { status: 'success'; data: T } | { status: 'error'; message: string }`） ②handleResponse分岐（`if (res.status === 'success') ... else ...`） | distractor: interface, enum, try/catch, typeof

**ts-union-narrowing-2**: blanks: ①Shape型（`type Shape = { kind: 'circle'; radius: number } | { kind: 'rectangle'; ... }`） ②getArea switch（`case 'circle': return Math.PI * s.radius ** 2 ...`） ③assertNever（`function assertNever(x: never): never`） | distractor: typeof, instanceof, enum, any

**ts-generics-1**: blanks: ①Result型定義（`type Result<T> = { ok: true; value: T } | { ok: false; error: string }`） ②succeed/fail関数（`function succeed<T>(value: T): Result<T>`） ③unwrap関数（`if (!result.ok) throw ...; return result.value`） | distractor: any, unknown, void, Promise

**ts-generics-2**: blanks: ①findById制約（`function findById<T extends { id: number }>(items: T[], id: number): T | undefined`） ②groupById実装（`return items.reduce<Record<number, T>>(...)`） | distractor: any, object, Partial, Map

**ts-utility-types-1**: blanks: ①PublicProfile型（`type PublicProfile = Omit<UserRecord, 'passwordHash'>`） ②toPublicProfile関数（`const { passwordHash, ...profile } = user; return profile`） | distractor: Pick, Partial, Exclude, Extract

**ts-utility-types-2**: blanks: ①rolePermissions定義（`const rolePermissions: Record<Role, Permission[]> = { ... }`） ②hasPermission関数（`return rolePermissions[role].includes(permission)`） | distractor: Map, Object, Partial, Required

### M6: TypeScript×React 8パターン

**ts-react-props-1**: blanks: ①CardProps定義（`interface CardProps { title: string; description?: string; children: ReactNode }`） ②Card実装（`function Card({ title, description, children }: CardProps)`） | distractor: any, Element, FC, HTMLElement

**ts-react-props-2**: blanks: ①IconButtonProps定義（`interface IconButtonProps extends ComponentProps<'button'> { icon: ReactNode; label: string }`） ②IconButton実装（`function IconButton({ icon, label, ...rest }: IconButtonProps)`） | distractor: HTMLAttributes, ButtonHTMLAttributes, FC, DetailedHTMLProps

**ts-react-state-1**: blanks: ①User型+useState（`interface User {...}; const [user, setUser] = useState<User | null>(null)`） ②login/logout関数（`setUser({ id, name, email }) / setUser(null)`） | distractor: undefined, any, string, useRef

**ts-react-state-2**: blanks: ①FormAction union型（`type FormAction = { type: 'SET_FIELD'; field: string; value: string } | ...`） ②reducer関数body（`switch(action.type) { case 'SET_FIELD': ... }`） | distractor: useState, setState, enum, any

**ts-react-hooks-1**: blanks: ①ThemeContextType+createContext（`interface ThemeContextType { theme: string; toggleTheme: () => void }`） ②useTheme hook（`const ctx = useContext(ThemeContext); if (!ctx) throw ...; return ctx`） | distractor: useState, useReducer, any, null

**ts-react-hooks-2**: blanks: ①useLocalStorage シグネチャ+useState初期化（`function useLocalStorage<T>(key: string, init: T)`） ②setValue+localStorage同期（`localStorage.setItem(key, JSON.stringify(newVal))`） | distractor: sessionStorage, useRef, useEffect, any

**ts-react-events-1**: blanks: ①FormData型+useState（`interface FormData { name: string; email: string }`） ②ChangeEvent handler（`const handleChange = (e: ChangeEvent<HTMLInputElement>) => ...`） ③FormEvent handler（`const handleSubmit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); ... }`） | distractor: MouseEvent, KeyboardEvent, any, Event

**ts-react-events-2**: blanks: ①ChangeEvent handler（`(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)`） ②KeyboardEvent handler（`(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') ... }`） | distractor: MouseEvent, FocusEvent, onClick, onBlur

### M7: Reactモダン 12パターン

**error-boundary-1**: blanks: ①getDerivedStateFromError（`static getDerivedStateFromError() { return { hasError: true } }`） ②componentDidCatch（`componentDidCatch(error, info) { console.error(error, info) }`） ③handleReset（`this.setState({ hasError: false })`） | distractor: componentDidMount, shouldComponentUpdate, useEffect

**error-boundary-2**: blanks: ①getDerivedStateFromError+render分岐（`if (this.state.hasError) return this.props.fallback ?? <p>Error</p>`） | distractor: componentDidCatch, try/catch, useEffect, Suspense

**suspense-lazy-1**: blanks: ①lazy import（`const Page = lazy(() => import('./Page'))`） ②Suspense wrap（`<Suspense fallback={<Loading />}><Page /></Suspense>`） | distractor: import(), require, useEffect, useState, memo

**suspense-lazy-2**: blanks: ①Header lazy+Suspense（`<Suspense fallback={...}><AppHeader /></Suspense>`） ②Content lazy+Suspense（`<Suspense fallback={...}><MainContent /></Suspense>`） | distractor: import(), require, useEffect, memo

**concurrent-features-1**: blanks: ①useTransition取得（`const [isPending, startTransition] = useTransition()`） ②startTransition使用（`startTransition(() => setFilteredItems(...))`） | distractor: useDeferredValue, useState, useCallback, useMemo

**concurrent-features-2**: blanks: ①useDeferredValue（`const deferredQuery = useDeferredValue(query)`） ②memo wrap（`const SlowList = memo(({ query }) => ...)`） | distractor: useTransition, startTransition, useCallback, useRef

**use-optimistic-1**: blanks: ①useOptimistic（`const [optimisticLikes, addOptimistic] = useOptimistic(likes, (prev, n) => prev + n)`） ②onClick（`addOptimistic(1); await apiLike()`） | distractor: useState, useReducer, setState, dispatch

**use-optimistic-2**: blanks: ①useOptimistic定義（`const [optimisticTodos, addOptimistic] = useOptimistic(todos, (prev, newTodo) => [...prev, {...newTodo, pending: true}])`） ②pending表示（`className={todo.pending ? 'opacity-50' : ''}`） | distractor: useState, useTransition, filter, reduce

**portals-1**: blanks: ①createPortal（`createPortal(<div className="modal-overlay" onClick={onClose}>...</div>, document.body)`） ②stopPropagation（`e.stopPropagation()`） | distractor: render, appendChild, useRef, document.getElementById

**portals-2**: blanks: ①useEffect container作成（`const el = document.createElement('div'); document.body.appendChild(el); return () => ...removeChild(el)`） ②createPortal（`createPortal(children, containerRef.current)`） | distractor: useRef, useState, innerHTML, render

**forward-ref-1**: blanks: ①forwardRef wrap（`const Input = forwardRef<HTMLInputElement, Props>((props, ref) => <input ref={ref} {...props} />)`） ②ref.current.focus()（`inputRef.current?.focus()`） | distractor: useRef, createRef, useCallback, memo

**forward-ref-2**: blanks: ①useImperativeHandle（`useImperativeHandle(ref, () => ({ play: ..., pause: ... }))`） ②forwardRef wrap（`forwardRef<VideoHandle, Props>(...)`） | distractor: useRef, createRef, useCallback, useEffect

### M8: 実務パターン 8パターン

**rhf-zod-1**: blanks: ①zodResolver設定（`const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })`） ②register使用（`<input {...register('email')} />`） | distractor: yupResolver, useFormik, Formik, validate

**rhf-zod-2**: blanks: ①refine定義（`z.object({...}).refine(data => data.password === data.confirmPassword, { message: '...' })`） ②エラー表示（`{errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}`） | distractor: validate, yup, superRefine, parse

**pagination-1**: blanks: ①totalPages計算（`const totalPages = Math.ceil(items.length / perPage)`） ②slice表示（`items.slice((page-1)*perPage, page*perPage)`） ③disabled制御（`disabled={page <= 1}`, `disabled={page >= totalPages}`） | distractor: Math.floor, Math.round, splice, filter

**pagination-2**: blanks: ①useSearchParams取得（`const [searchParams, setSearchParams] = useSearchParams()`） ②ページ変更（`setSearchParams({ page: String(newPage) })`） | distractor: useParams, useNavigate, useLocation, window.location

**infinite-scroll-1**: blanks: ①IntersectionObserver設定（`new IntersectionObserver(entries => { if (entries[0].isIntersecting && hasMore) loadMore() })`） ②observe+disconnect（`observer.observe(sentinelRef.current); return () => observer.disconnect()`） | distractor: MutationObserver, addEventListener, scroll, ResizeObserver

**infinite-scroll-2**: blanks: ①isLoading guard（`if (entries[0].isIntersecting && !isLoading && hasMore) loadMore()`） ②rootMargin設定（`{ rootMargin: '0px 0px 200px 0px' }`） | distractor: threshold, root, MutationObserver, scroll

**auth-flow-1**: blanks: ①AuthContext+Provider（`const AuthContext = createContext<AuthContextType | null>(null); function AuthProvider ...`） ②useAuth hook（`const ctx = useContext(AuthContext); if (!ctx) throw ...; return ctx`） | distractor: useReducer, useState, localStorage, useRef

**auth-flow-2**: blanks: ①ProtectedRoute実装（`const { isAuthenticated } = useAuth(); if (!isAuthenticated) return <Navigate to="/login" ... />`） ②LoginPage redirect（`const from = location.state?.from ?? '/'; navigate(from)`） | distractor: useParams, Redirect, history.push, window.location

---

## 6. ブランチ戦略

```
feat/challenge-mobile-puzzle (PR #234) → M0 実装
dev → feat/v4-challenge-puzzle-m{N} → PR → dev（M1〜M8）
```

M0 は既存 PR #234 のブランチで対応。M1 以降はマイルストーンごとに1ブランチ・1PR。

---

## 7. 検証手順（全M共通）

1. `npm run typecheck && npm run lint && npm run test && npm run build`
2. M0: A方式コード削除後に既存テスト全パス確認
3. 各M: Playwright モバイル幅 (375px) で対象ステップの Challenge 画面確認
4. PC幅 (1280px) で従来エディタ UI が壊れていないことを確認
