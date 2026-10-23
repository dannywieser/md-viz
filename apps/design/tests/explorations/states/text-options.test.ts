import { emptyTexts, errorTexts, retryLabels } from '../../../src/explorations/states/text-options'

describe('text options', () => {
  it('are all lowercase', () => {
    for (const text of [...emptyTexts, ...errorTexts, ...retryLabels]) {
      expect(text).toBe(text.toLowerCase())
    }
  })
})
