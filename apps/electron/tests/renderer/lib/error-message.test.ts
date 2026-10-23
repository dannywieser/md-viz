import { errorMessage } from '../../../src/renderer/src/lib/error-message'

describe('errorMessage', () => {
  it('uses the message of an error', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom')
  })

  it('turns anything else into a string', () => {
    expect(errorMessage('plain')).toBe('plain')
    expect(errorMessage(42)).toBe('42')
  })
})
