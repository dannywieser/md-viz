import { IPC } from '../../src/shared/ipc'

describe('IPC channels', () => {
  it('gives every channel its own name', () => {
    const names = Object.values(IPC)

    expect(new Set(names).size).toBe(names.length)
  })
})
