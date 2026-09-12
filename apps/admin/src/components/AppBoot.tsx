import { useEffect, useState, Suspense, type ReactNode } from 'react'

export function AppBoot({ ready, children }: { ready: Promise<void>; children: ReactNode }) {
  // Admin app has no splash - just wait for ready
  return (
    <Suspense fallback={null}>
      <Awaiter ready={ready}>{children}</Awaiter>
    </Suspense>
  )
}

function Awaiter({ ready, children }: { ready: Promise<void>; children: ReactNode }) {
  return (
    <AwaiterImpl ready={ready} children={children} />
  )
}

function AwaiterImpl({ ready, children }: { ready: Promise<void>; children: ReactNode }) {
  const [readyState, setReadyState] = useState(false)

  useEffect(() => {
    ready.then(() => setReadyState(true)).catch(() => setReadyState(true))
  }, [ready])

  if (!readyState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}