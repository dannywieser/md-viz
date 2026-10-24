import '@testing-library/jest-dom/vitest'

// jsdom lacks the pointer and scroll APIs the radix select uses.
if (typeof Element !== 'undefined') {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => undefined
  Element.prototype.releasePointerCapture = () => undefined
  Element.prototype.scrollIntoView = () => undefined
}
