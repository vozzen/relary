import { useState } from 'react'

export function usePlaceholder(initial = 0) {
  const [value, setValue] = useState(initial)
  return { value, increment: () => setValue(v => v + 1) }
}
