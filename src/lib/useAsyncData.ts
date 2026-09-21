import { useCallback, useEffect, useMemo, useState, type DependencyList } from 'react'

/**
 * Async state as a closed set, so "not loaded yet" can never be confused with
 * "loaded and empty". Surfaces branch on `status`, never on `data.length`.
 */
export type AsyncStatus = 'loading' | 'ready' | 'error'

export type AsyncState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'ready'; data: T; error: null }
  | { status: 'error'; data: null; error: string }

export type AsyncResult<T> = AsyncState<T> & { retry: () => void }

function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : error ? String(error) : fallback
}

/** Single-source loader for a surface whose whole view comes from one fetch. */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: DependencyList = [],
  fallbackError = 'Something went wrong.',
): AsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', data: null, error: null })
    loader()
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data, error: null })
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: 'error', data: null, error: toMessage(error, fallbackError) })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, ...deps])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return useMemo(() => ({ ...state, retry }), [state, retry])
}

export type LoadPhase = {
  status: AsyncStatus
  error: string | null
  /** True until the first attempt settles — the gate for empty-state copy. */
  isFirstLoad: boolean
  run: (action: () => Promise<void>) => Promise<boolean>
  retry: () => void
  clearError: () => void
}

/**
 * Load controller for surfaces that own a multi-source `refresh()`. Keeps the
 * page's existing fetch shape while making the first-load gate explicit.
 */
export function useLoadPhase(refresh: () => Promise<void>, fallbackError = 'Could not load.'): LoadPhase {
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [settledOnce, setSettledOnce] = useState(false)

  const run = useCallback(
    async (action: () => Promise<void>) => {
      setStatus('loading')
      setError(null)
      try {
        await action()
        setStatus('ready')
        return true
      } catch (e: unknown) {
        setStatus('error')
        setError(toMessage(e, fallbackError))
        return false
      } finally {
        setSettledOnce(true)
      }
    },
    [fallbackError],
  )

  useEffect(() => {
    void run(refresh)
  }, [run, refresh])

  const retry = useCallback(() => {
    void run(refresh)
  }, [run, refresh])

  return {
    status,
    error,
    isFirstLoad: !settledOnce,
    run,
    retry,
    clearError: useCallback(() => setError(null), []),
  }
}

export type SettledLoaders<T extends Record<string, () => Promise<unknown>>> = {
  values: { [K in keyof T]: Awaited<ReturnType<T[K]>> | undefined }
  failed: (keyof T & string)[]
}

/**
 * Runs every loader and reports which ones failed, so an aggregate surface can
 * show what loaded while still admitting the parts that did not.
 */
export async function settleAll<T extends Record<string, () => Promise<unknown>>>(
  loaders: T,
): Promise<SettledLoaders<T>> {
  const keys = Object.keys(loaders) as (keyof T & string)[]
  const values = {} as SettledLoaders<T>['values']

  const run = async (batch: (keyof T & string)[]) => {
    const settled = await Promise.allSettled(batch.map((key) => loaders[key]()))
    const failed: (keyof T & string)[] = []
    batch.forEach((key, i) => {
      const result = settled[i]
      if (result.status === 'fulfilled') {
        values[key] = result.value as Awaited<ReturnType<T[typeof key]>>
      } else {
        values[key] = undefined
        failed.push(key)
      }
    })
    return failed
  }

  let failed = await run(keys)
  if (failed.length) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    failed = await run(failed)
  }

  return { values, failed }
}
