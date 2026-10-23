import { QueryClient } from '@tanstack/react-query'
import { createQueryClient } from '../../src/lib/query-client'

describe('createQueryClient', () => {
  it('creates a fresh client each time', () => {
    const first = createQueryClient()

    expect(first).toBeInstanceOf(QueryClient)
    expect(createQueryClient()).not.toBe(first)
  })
})
