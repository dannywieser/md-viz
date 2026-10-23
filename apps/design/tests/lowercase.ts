import { expect } from 'vitest'

/** the design board's lowercase text only guideline. */
export function expectLowercase(container: HTMLElement) {
  const text = container.textContent
  expect(text).toBe(text.toLowerCase())
}
