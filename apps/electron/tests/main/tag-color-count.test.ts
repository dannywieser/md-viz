import { HUE_COLORS } from '@md-viz/ui/lib/note-colors'
import { TAG_COLOR_COUNT } from '@md-viz/sync'

describe('tag colours', () => {
  it('are handed out over as many colours as the note palette has hues', () => {
    // the sync package has no UI and keeps its own copy of the count
    expect(TAG_COLOR_COUNT).toBe(HUE_COLORS)
  })
})
