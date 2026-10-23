import { latticeSpacing } from '@md-viz/ui'
import type { CSSProperties } from 'react'

export type Mode = 'light' | 'dark'

/** solarized values for a preview, so light and dark can sit side by side whatever the page theme is. */
export const modes: Record<Mode, { background: string; card: string; text: string; dot: string }> =
  {
    light: { background: '#fdf6e3', card: '#ffffff', text: '#586e75', dot: '#93a1a1' },
    dark: { background: '#002b36', card: '#073642', text: '#839496', dot: '#586e75' },
  }

export type VariantInput = {
  mode: Mode
  /** side of a note cell on the densest card (the one with the most notes), in px. */
  cell: number
  /** multiplier on the dot or line opacity. */
  strength: number
}

export type Variant = {
  id: string
  name: string
  description: string
  style: (input: VariantInput) => CSSProperties
}

const BASE = 16

function fade(color: string, percent: number) {
  const clamped = Math.max(0, Math.min(100, percent))
  return `color-mix(in srgb, ${color} ${clamped}%, transparent)`
}

type Layer = { image: string; size: string }

function dots(color: string, spacing: number, radius: number): Layer {
  return {
    image: `radial-gradient(circle at center, ${color} ${radius}px, transparent ${radius + 0.5}px)`,
    size: `${spacing}px ${spacing}px`,
  }
}

function lines(color: string, spacing: number): Layer[] {
  const size = `${spacing}px ${spacing}px`
  return [
    { image: `linear-gradient(${color} 1px, transparent 1px)`, size },
    { image: `linear-gradient(90deg, ${color} 1px, transparent 1px)`, size },
  ]
}

function compose(layers: Layer[]): CSSProperties {
  return {
    backgroundImage: layers.map((layer) => layer.image).join(', '),
    backgroundSize: layers.map((layer) => layer.size).join(', '),
  }
}

export const variants: Variant[] = [
  {
    id: 'current',
    name: 'current grid',
    description: 'the reference: minor lines every 16px, major lines every 5th.',
    style: ({ mode }) => {
      const minor = mode === 'light' ? fade('#93a1a1', 25) : '#073642'
      const major = mode === 'light' ? fade('#93a1a1', 45) : fade('#586e75', 35)
      return compose([...lines(major, BASE * 5), ...lines(minor, BASE)])
    },
  },
  {
    id: 'dots-16',
    name: 'dots 16',
    description: 'a 2px dot every 16px, where the current lines cross.',
    style: ({ mode, strength }) => compose([dots(fade(modes[mode].dot, 55 * strength), BASE, 1)]),
  },
  {
    id: 'dots-16-major',
    name: 'dots 16 with major',
    description: 'small dots every 16px and a larger dot every 5th, keeping the major rhythm.',
    style: ({ mode, strength }) =>
      compose([
        dots(fade(modes[mode].dot, 70 * strength), BASE * 5, 2),
        dots(fade(modes[mode].dot, 40 * strength), BASE, 1),
      ]),
  },
  {
    id: 'dots-32',
    name: 'dots 32',
    description: 'a sparser dot every 32px.',
    style: ({ mode, strength }) =>
      compose([dots(fade(modes[mode].dot, 60 * strength), BASE * 2, 1)]),
  },
  {
    id: 'faint-lines',
    name: 'faint lines',
    description: 'the current lines at a fraction of the contrast.',
    style: ({ mode, strength }) => {
      const dot = modes[mode].dot
      return compose([
        ...lines(fade(dot, 18 * strength), BASE * 5),
        ...lines(fade(dot, 9 * strength), BASE),
      ])
    },
  },
  {
    id: 'flat',
    name: 'flat',
    description: 'no pattern: the baseline.',
    style: () => ({}),
  },
  {
    id: 'dots-scaled',
    name: 'dots scaled to notes',
    description:
      'a dot at every corner of the densest card, so the spacing follows its note cell; other cards use whole multiples of that cell and stay on the dots. small cells use whole multiples of the spacing to keep the dots from getting too dense.',
    style: ({ mode, cell, strength }) => {
      const spacing = latticeSpacing(cell)
      return {
        ...compose([dots(fade(modes[mode].dot, 55 * strength), spacing, 1)]),
        // dots sit on the tile corners so cards placed on the lattice line up with them.
        backgroundPosition: `${spacing / 2}px ${spacing / 2}px`,
      }
    },
  },
]
