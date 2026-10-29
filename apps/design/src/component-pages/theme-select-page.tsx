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
        description="picks the theme of a whole app. the viewer's header and both apps use it with the theme hook, which applies the choice before paint and remembers it in local storage. the picker below only previews the choice and does not change the page."
      />
      <DemoGroup title="picker">
        <ThemeSelect value={id} themes={themes} onChange={setId} className="w-56" />
      </DemoGroup>
      <DemoGroup title="narrow">
        <ThemeSelect value={id} themes={themes} onChange={setId} className="w-32" />
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
