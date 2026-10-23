import { render, screen } from '@testing-library/react'
import { Board } from '../src/board'

const sections = ['Components', 'Grid', 'Guidelines', 'Palette', 'Spacing', 'Typography']
vi.mock('../src/sections/components', () => ({ Components: () => <p>components section</p> }))
vi.mock('../src/sections/grid', () => ({ Grid: () => <p>grid section</p> }))
vi.mock('../src/sections/guidelines', () => ({ Guidelines: () => <p>guidelines section</p> }))
vi.mock('../src/sections/logo', () => ({ LogoSection: () => <p>logo section</p> }))
vi.mock('../src/sections/note-grid-demo', () => ({ NoteGridDemo: () => <p>note grid section</p> }))
vi.mock('../src/sections/palette', () => ({ Palette: () => <p>palette section</p> }))
vi.mock('../src/sections/spacing', () => ({ Spacing: () => <p>spacing section</p> }))
vi.mock('../src/sections/typography', () => ({ Typography: () => <p>typography section</p> }))

describe('Board', () => {
  it('lists every section in order', () => {
    render(<Board />)

    const text = screen.getAllByText(/ section$/).map((element) => element.textContent)
    expect(text).toEqual([
      'guidelines section',
      'logo section',
      'palette section',
      'typography section',
      'spacing section',
      'grid section',
      'components section',
      'note grid section',
    ])
    expect(sections).toHaveLength(6)
  })
})
