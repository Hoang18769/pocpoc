import { useState } from "react"

export function useMinLoading(asyncFn, deps = [], minDuration = 1000) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isCancelled = false

    const delay = (ms) => new Promise((res) => setTimeout(res, ms))

    const run = async () => {
      setLoading(true)
      try {
        const [result] = await Promise.all([
          asyncFn(),
          delay(minDuration),
        ])
        if (!isCancelled) setData(result)
      } catch (err) {
        if (!isCancelled) setError(err)
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    run()
    return () => {
      isCancelled = true
    }
  }, deps)

  return { loading, data, error }
}
