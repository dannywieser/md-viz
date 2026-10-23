import { background } from '../src/explorations/background'
import { resolveRoute } from '../src/route'

describe('resolveRoute', () => {
  it('is the board at the root and for any other path', () => {
    expect(resolveRoute('/')).toEqual({ page: 'board' })
    expect(resolveRoute('/anything')).toEqual({ page: 'board' })
    expect(resolveRoute('/background')).toEqual({ page: 'board' })
  })

  it('is the index at /explorations, with or without a trailing slash', () => {
    expect(resolveRoute('/explorations')).toEqual({ page: 'index' })
    expect(resolveRoute('/explorations/')).toEqual({ page: 'index' })
  })

  it('finds an exploration by its slug', () => {
    expect(resolveRoute('/explorations/background')).toEqual({
      page: 'exploration',
      exploration: background,
    })
    expect(resolveRoute('/explorations/background/')).toMatchObject({ page: 'exploration' })
  })

  it('is missing for an unknown slug', () => {
    expect(resolveRoute('/explorations/nope')).toEqual({ page: 'missing' })
  })
})
