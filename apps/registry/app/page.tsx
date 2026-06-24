import Link from "next/link"

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-4 inline-block rounded-full bg-btc/10 px-3 py-1 text-xs font-medium text-btc">
        Phase 0 · scaffolding
      </p>
      <h1 className="mb-6 text-5xl font-bold tracking-tight">
        The ShadCN of Bitcoin.
      </h1>
      <p className="mb-8 text-lg text-foreground/70">
        A copy-paste registry of accessible, unstyled, framework-agnostic UI components for building
        Bitcoin and Lightning apps. Headless first, Tailwind reference, BigInt-safe.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/docs"
          className="rounded-md bg-btc px-4 py-2 font-medium text-black hover:opacity-90"
        >
          Documentation
        </Link>
        <Link
          href="/docs/components"
          className="rounded-md border border-foreground/20 px-4 py-2 font-medium hover:bg-foreground/5"
        >
          Browse components
        </Link>
      </div>

      <section className="mt-16 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-2 text-xl font-semibold">Install one component</h2>
          <pre className="rounded-md bg-foreground/5 p-4 font-mono text-sm">
            <code>npx bitcoin-ui@latest add balance</code>
          </pre>
        </div>
        <div>
          <h2 className="mb-2 text-xl font-semibold">Use it</h2>
          <pre className="rounded-md bg-foreground/5 p-4 font-mono text-sm">
            <code>{`<Balance value={50_000n} unit="sat" />`}</code>
          </pre>
        </div>
      </section>
    </main>
  )
}
