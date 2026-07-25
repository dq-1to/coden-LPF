/**
 * Sandpack の bundler iframe を読み込む origin。
 *
 * @codesandbox/sandpack-client は既定で
 * `https://<client version をハイフン化>-sandpack.codesandbox.io/` を組み立てるため、
 * 依存更新のたびに iframe の origin が黙って変わる。origin が変わると
 * vercel.json の CSP `frame-src` から外れ、本番だけプレビューが起動しなくなる。
 *
 * そのため bundlerURL を明示的に固定し、CSP の許可先と 1 対 1 で対応させる。
 * ここを変更したら vercel.json の frame-src も必ず合わせる（cspFrameSrc.test.ts が検証する）。
 */
export const EXEC_PREVIEW_BUNDLER_ORIGIN = 'https://2-19-8-sandpack.codesandbox.io'

export const EXEC_PREVIEW_BUNDLER_URL = `${EXEC_PREVIEW_BUNDLER_ORIGIN}/`
