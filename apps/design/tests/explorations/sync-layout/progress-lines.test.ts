import { syncProgress } from '../../../src/explorations/sync-layout/fake-sync'
import { progressText } from '../../../src/explorations/sync-layout/progress-lines'

const scan = { dirs: 4, mdFiles: 9 }

describe('progressText', () => {
  it('says what a scan has found, without a bar', () => {
    expect(progressText('scanning', syncProgress(0), scan)).toEqual({
      label: 'scanning',
      line: 'scanning the folder…',
      count: '4 folders, 9 notes so far',
      bar: null,
    })
  })

  it('says what the sync reports: pushed and deleted of the total', () => {
    expect(progressText('syncing', syncProgress(100), scan)).toEqual({
      label: 'syncing',
      line: 'syncing notes to the cache…',
      count: '240 pushed, 6 deleted of 246',
      bar: { value: 246, max: 246 },
    })
  })

  it('has nothing to say otherwise', () => {
    expect(progressText('done', syncProgress(0), scan)).toBeNull()
  })
})
