import { syncProgress } from '../../../src/explorations/sync-layout/fake-sync'
import { progressText } from '../../../src/explorations/sync-layout/progress-lines'

const scan = { dirs: 4, mdFiles: 9 }

describe('progressText', () => {
  it('says what a scan has found, without a bar', () => {
    expect(progressText('scanning', 'note', syncProgress(0), scan)).toEqual({
      label: 'scanning',
      line: 'scanning the folder…',
      count: '4 folders, 9 notes so far',
      bar: null,
    })
  })

  it('names the note being pushed', () => {
    const text = progressText('syncing', 'note', syncProgress(50), scan)

    expect(text?.line).toBe(`syncing ${syncProgress(50).title}`)
    expect(text?.bar).toEqual({ value: 120, max: 240 })
  })

  it('names the batch when it only knows batches', () => {
    expect(progressText('syncing', 'batch', syncProgress(50), scan)?.line).toBe(
      'syncing notes 101–150 of 240',
    )
  })

  it('has nothing to say otherwise', () => {
    expect(progressText('done', 'note', syncProgress(0), scan)).toBeNull()
  })
})
