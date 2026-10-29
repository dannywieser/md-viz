import { AppHeaderPage } from './app-header-page'
import { ButtonPage } from './button-page'
import { CardPage } from './card-page'
import { EmptyStatePage } from './empty-state-page'
import { ErrorStatePage } from './error-state-page'
import { LoaderPage } from './loader-page'
import { NoteGridPage } from './note-grid-page'
import { ProgressBarPage } from './progress-bar-page'
import { SelectPage } from './select-page'
import { StateBlockPage } from './state-block-page'
import { ThemeSelectPage } from './theme-select-page'
import type { ComponentPage } from './types'

/** every shared component, in the order the side nav shows them. add a new one here. */
export const components: ComponentPage[] = [
  { slug: 'theme-select', title: 'theme select', Page: ThemeSelectPage },
  { slug: 'button', title: 'button', Page: ButtonPage },
  { slug: 'select', title: 'select', Page: SelectPage },
  { slug: 'card', title: 'card', Page: CardPage },
  { slug: 'app-header', title: 'app header', Page: AppHeaderPage },
  { slug: 'loader', title: 'loader', Page: LoaderPage },
  { slug: 'empty-state', title: 'empty state', Page: EmptyStatePage },
  { slug: 'error-state', title: 'error state', Page: ErrorStatePage },
  { slug: 'state-block', title: 'state block', Page: StateBlockPage },
  { slug: 'progress-bar', title: 'progress bar', Page: ProgressBarPage },
  { slug: 'note-grid', title: 'note grid', Page: NoteGridPage },
]

export const findComponent = (slug: string) => components.find((entry) => entry.slug === slug)
