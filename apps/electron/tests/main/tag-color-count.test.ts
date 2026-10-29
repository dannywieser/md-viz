import { topLevelTag as uiTopLevelTag } from '@md-viz/ui/lib/note-tags'
import { HUE_COLORS } from '@md-viz/ui/lib/note-colors'
import { TAG_COLOR_COUNT, topLevelTag } from '@md-viz/sync'

// the sync package has no UI and keeps its own copy of what it shares with it.
describe('what the sync package shares with the UI', () => {
  it('hands tag colours out over as many colours as the note palette has hues', () => {
    expect(TAG_COLOR_COUNT).toBe(HUE_COLORS)
  })

  it.each(['daily/10/28', 'work', '/odd', '/', 'a/b', ''])(
    'finds the same top level tag for %j',
    (tag) => {
      expect(topLevelTag(tag)).toBe(uiTopLevelTag(tag))
    },
  )
})
