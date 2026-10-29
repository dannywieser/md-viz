import { useState } from 'react'
import { findTheme, noteColors, ThemeSelect, themes } from '@md-viz/ui'
import { DemoGroup } from './demo-group'
import { PageHeading } from './page-heading'

/** the picker for the theme of a whole app; the header of this viewer uses the same one. */
export function ThemeSelectPage() {
  const [id, setId] = useState(themes[0].id)
  const chosen = findTheme(id)

  return (
    <>
      <PageHeading
        title="theme select"
        description="picks the theme of a whole app. closed, it is a pixel square of the theme (its eight hues around the neutral grey) with the name as its tooltip; open, the list shows each theme with its name. the viewer's header and both apps use it with the theme hook, which applies the choice before paint and remembers it in local storage. the picker below only previews the choice and does not change the page."
      />
      <DemoGroup title="picker">
        <ThemeSelect value={id} themes={themes} onChange={setId} />
      </DemoGroup>
      <DemoGroup title="the chosen theme">
        <div className="space-y-2 border bg-card p-4">
          <p className="text-sm font-bold">{chosen.name}</p>
          <ol className="flex flex-wrap gap-0.5" aria-label="note colors">
            {noteColors(chosen).map((color, index) => (
              <li key={index} className="size-4" style={{ background: color }} />
            ))}
          </ol>
        </div>
      </DemoGroup>
    </>
  )
}
