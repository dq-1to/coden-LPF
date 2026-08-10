import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { EXEC_PREVIEW_BUNDLER_ORIGIN } from '../execPreviewBundler'

/**
 * Sandpack の bundler origin と vercel.json の CSP frame-src がずれると、
 * ローカルでは動くのに Vercel 上だけプレビューが起動しなくなる。
 * 依存更新などで片方だけ変わった場合にここで落とす。
 */
function readCsp(): string {
  const here = dirname(fileURLToPath(import.meta.url))
  const vercelJsonPath = resolve(here, '../../../../../../../vercel.json')
  const config = JSON.parse(readFileSync(vercelJsonPath, 'utf8')) as {
    headers: { headers: { key: string; value: string }[] }[]
  }

  const csp = config.headers
    .flatMap((entry) => entry.headers)
    .find((header) => header.key === 'Content-Security-Policy')

  if (!csp) {
    throw new Error('vercel.json に Content-Security-Policy がありません')
  }

  return csp.value
}

function getDirective(csp: string, name: string): string | undefined {
  return csp
    .split(';')
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith(`${name} `))
}

function getInstalledSandpackClientVersion(): string {
  const require = createRequire(import.meta.url)
  const entrypoint = require.resolve('@codesandbox/sandpack-client')
  const packageJsonPath = resolve(dirname(dirname(entrypoint)), 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { version: string }

  return packageJson.version
}

describe('vercel.json の CSP', () => {
  it('bundler origin はインストール済み sandpack-client のバージョンと一致する', () => {
    const version = getInstalledSandpackClientVersion()
    const expectedOrigin = `https://${version.replace(/\./g, '-')}-sandpack.codesandbox.io`

    expect(EXEC_PREVIEW_BUNDLER_ORIGIN).toBe(expectedOrigin)
  })

  it('frame-src が Sandpack の bundler origin を許可している', () => {
    const frameSrc = getDirective(readCsp(), 'frame-src')

    expect(frameSrc).toBeDefined()
    expect(frameSrc).toContain(EXEC_PREVIEW_BUNDLER_ORIGIN)
  })

  it('frame-src はワイルドカードで外部全体を許可しない', () => {
    const frameSrc = getDirective(readCsp(), 'frame-src') ?? ''

    expect(frameSrc).not.toContain('https: ')
    expect(frameSrc.split(/\s+/)).not.toContain('*')
  })

  it('frame-ancestors none を維持している', () => {
    expect(getDirective(readCsp(), 'frame-ancestors')).toBe("frame-ancestors 'none'")
  })
})
