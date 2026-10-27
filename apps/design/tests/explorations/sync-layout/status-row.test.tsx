import { render, screen } from '@testing-library/react'
import { StatusRow } from '../../../src/explorations/sync-layout/status-row'

describe('StatusRow', () => {
  it('has the source and last synced on one line, then the count', () => {
    render(<StatusRow source="~/notes" lastSynced="yesterday" count={3} />)

    expect(screen.getByLabelText('status')).toHaveTextContent('~/notes · last synced yesterday')
    expect(screen.getByRole('status')).toHaveTextContent('3 notes')
  })

  it('says never synced, counts one note and shows what it is given', () => {
    render(
      <StatusRow source="~/notes" lastSynced={null} count={1}>
        <p>progress</p>
      </StatusRow>,
    )

    expect(screen.getByLabelText('status')).toHaveTextContent('never synced')
    expect(screen.getByRole('status')).toHaveTextContent('1 note')
    expect(screen.getByText('progress')).toBeInTheDocument()
  })

  it('has no count while the notes are being counted', () => {
    render(<StatusRow source="~/notes" lastSynced={null} count={null} />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
