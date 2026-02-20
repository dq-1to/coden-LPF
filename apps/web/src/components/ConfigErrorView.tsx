interface ConfigErrorViewProps {
  message: string
}

export function ConfigErrorView({ message }: ConfigErrorViewProps) {
  return (
    <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
      <h2 className="text-sm font-semibold">設定エラー</h2>
      <p className="mt-1 text-sm">{message}</p>
      <p className="mt-2 text-xs text-red-700">
        `apps/web/.env.local.example` をコピーして `apps/web/.env.local` を作成し、値を設定してください。
      </p>
    </section>
  )
}
