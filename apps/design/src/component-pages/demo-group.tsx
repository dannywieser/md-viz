import type { ReactNode } from 'react'

/** one demo: a small heading and what it shows. */
export function DemoGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-bold">{title}</h3>
      {children}
    </section>
  )
}
