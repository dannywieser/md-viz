import { adapterFor, sources } from '../../src/sources'
import { bearSource } from '../../src/sources/bear'
import { fileSource } from '../../src/sources/file'

describe('sources', () => {
  it('registers the file and Bear sources under their names', () => {
    expect(sources).toEqual({ file: fileSource, bear: bearSource })
  })

  it.each([
    [{ source: 'file', folder: '/notes' } as const, fileSource],
    [{ source: 'bear' } as const, bearSource],
  ])('adapterFor picks the adapter of the target source', (target, adapter) => {
    expect(adapterFor(target)).toBe(adapter)
  })
})
