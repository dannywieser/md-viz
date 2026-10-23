import { render, screen } from '@testing-library/react'
import { StateBody } from '../../../src/explorations/states/state-body'

describe('StateBody', () => {
  it('shows the icon, the text and the action', () => {
    const { container } = render(
      <StateBody rows={['#']} text="nothing here" action={<button>again</button>} />,
    )

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByText('nothing here')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'again' })).toBeInTheDocument()
  })

  it('passes the note palette on to the icon', () => {
    const { container } = render(<StateBody rows={['#']} text="nothing here" notePalette="fill" />)

    expect(container.querySelector('.note-square')).toBeInTheDocument()
  })

  it('works without an action', () => {
    render(<StateBody rows={['#']} text="nothing here" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
