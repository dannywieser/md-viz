import { render, screen } from '@testing-library/react'
import { loaderFills } from '@md-viz/ui'
import userEvent from '@testing-library/user-event'
import { States } from '../../../src/explorations/states/states'
import { icons } from '../../../src/explorations/states/icon-options'
import { emptyTexts, errorTexts, retryLabels } from '../../../src/explorations/states/text-options'
import { expectLowercase } from '../../lowercase'

describe('States', () => {
  it('shows every loader variant and icon alone and in the grid block', () => {
    const { container } = render(<States />)

    for (const variant of loaderFills) {
      expect(screen.getByRole('heading', { level: 3, name: variant.name })).toBeInTheDocument()
      expect(screen.getByRole('status', { name: `loading, ${variant.name}` })).toBeInTheDocument()
      expect(
        screen.getByRole('status', { name: `loading in block, ${variant.name}` }),
      ).toBeInTheDocument()
    }
    for (const icon of icons) {
      expect(screen.getByRole('heading', { level: 3, name: icon.name })).toBeInTheDocument()
    }
    expect(screen.getByRole('heading', { level: 3, name: 'compact' })).toBeInTheDocument()
    expect(container.querySelectorAll('[data-compact]')).toHaveLength(2)
    expect(screen.getAllByText('alone')).toHaveLength(loaderFills.length + 1 + icons.length + 1)
    expectLowercase(container)
  })

  it('starts with the first empty and error texts and a retry button', () => {
    render(<States />)

    expect(screen.getAllByText(emptyTexts[0], { selector: 'p' })).toHaveLength(4)
    expect(screen.getAllByText(errorTexts[0], { selector: 'p' })).toHaveLength(6)
    expect(screen.getAllByRole('button', { name: retryLabels[0] })).toHaveLength(7)
  })

  it('switches the texts and retry label', async () => {
    render(<States />)

    await userEvent.click(screen.getByRole('button', { name: emptyTexts[1] }))
    await userEvent.click(screen.getByRole('button', { name: errorTexts[1] }))
    await userEvent.click(screen.getByRole('button', { name: retryLabels[1] }))

    expect(screen.getAllByText(emptyTexts[1], { selector: 'p' })).toHaveLength(4)
    expect(screen.getAllByText(errorTexts[1], { selector: 'p' })).toHaveLength(6)
    expect(screen.getAllByRole('button', { name: retryLabels[1] })).toHaveLength(7)
  })

  it('shows a random loader that loads again on demand', async () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0)
    render(<States />)
    expect(screen.getByRole('status', { name: 'loading, random' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'loading in block, random' })).toBeInTheDocument()
    const picks = random.mock.calls.length

    await userEvent.click(screen.getByRole('button', { name: 'load again' }))

    expect(random.mock.calls.length).toBe(picks + 2)
    random.mockRestore()
  })

  it('fills the ghost with the note palette and no other icon', () => {
    render(<States />)
    const ghost = screen.getByRole('heading', { level: 3, name: 'ghost' }).parentElement!
    const emptyBox = screen.getByRole('heading', { level: 3, name: 'empty box' }).parentElement!

    expect(ghost.querySelector('.note-square')).toBeInTheDocument()
    expect(emptyBox.querySelector('.note-square')).not.toBeInTheDocument()
  })

  it('colours the crack of the broken tile with the note palette', () => {
    render(<States />)
    const tile = screen.getByRole('heading', { level: 3, name: 'broken tile' }).parentElement!

    expect(tile.querySelectorAll('.note-square').length).toBeGreaterThan(0)
    expect(tile.querySelectorAll('rect[fill="var(--foreground)"]').length).toBeGreaterThan(0)
  })

  it('hides the retry button when retry is off', async () => {
    render(<States />)

    await userEvent.click(screen.getByRole('button', { name: 'retry shown' }))

    // only the retry label picker is left
    expect(screen.getAllByRole('button', { name: retryLabels[0] })).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'no retry' })).toBeInTheDocument()
  })
})
