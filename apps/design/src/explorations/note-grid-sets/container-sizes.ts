export type Container = 'wide' | 'square' | 'tall'

export const CONTAINERS: { value: Container; label: string }[] = [
  { value: 'wide', label: 'wide' },
  { value: 'square', label: 'square' },
  { value: 'tall', label: 'tall' },
]

/** the box each container shape may fill, px. */
export const CONTAINER_SIZES: Record<Container, { width: number; height: number }> = {
  wide: { width: 720, height: 320 },
  square: { width: 440, height: 440 },
  tall: { width: 320, height: 560 },
}
