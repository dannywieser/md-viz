import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { themes, useTheme } from '@md-viz/ui'
import { App } from '../src/app'

vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  useTheme: vi.fn(),
}))
vi.mock('../src/sections/guidelines', () => ({ Guidelines: () => <div>guidelines page</div> }))
vi.mock('../src/sections/logo', () => ({ LogoSection: () => <div>logo page</div> }))
vi.mock('../src/pages/colors-page', () => ({ ColorsPage: () => <div>colors page</div> }))
vi.mock('../src/sections/typography', () => ({ Typography: () => <div>typography page</div> }))
vi.mock('../src/sections/spacing', () => ({ Spacing: () => <div>spacing page</div> }))
vi.mock('../src/sections/grid', () => ({ Grid: () => <div>grid page</div> }))
vi.mock('../src/component-pages/components-layout', async () => {
  const { Outlet } = await import('react-router')
  return { ComponentsLayout: () => <Outlet /> }
})
vi.mock('../src/component-pages/component-route', () => ({
  ComponentRoute: () => <div>component page</div>,
}))
vi.mock('../src/explorations/explorations-index', () => ({
  ExplorationsIndex: () => <div>explorations index</div>,
}))
vi.mock('../src/explorations/exploration-route', () => ({
  ExplorationRoute: () => <div>exploration page</div>,
}))

const setTheme = vi.fn()

function renderAt(path: string) {
  vi.mocked(useTheme).mockReturnValue({ theme: themes[0], themes, setTheme })
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    ['/guidelines', 'guidelines page'],
    ['/logo', 'logo page'],
    ['/colors', 'colors page'],
    ['/typography', 'typography page'],
    ['/spacing', 'spacing page'],
    ['/grid', 'grid page'],
    ['/components/button', 'component page'],
    ['/explorations', 'explorations index'],
    ['/explorations/background', 'exploration page'],
  ])('shows %s', (path, text) => {
    renderAt(path)

    expect(screen.getByText(text)).toBeInTheDocument()
  })

  it('redirects the root to the guidelines and /components to the first component', () => {
    const { unmount } = renderAt('/')
    expect(screen.getByText('guidelines page')).toBeInTheDocument()
    unmount()

    renderAt('/components')
    expect(screen.getByText('component page')).toBeInTheDocument()
  })

  it('says so for an unknown page', () => {
    renderAt('/nope')

    expect(screen.getByRole('alert')).toHaveTextContent('no such page')
  })

  it('passes the theme to the nav and switches it', async () => {
    renderAt('/guidelines')

    await userEvent.click(screen.getByRole('combobox', { name: 'theme' }))
    await userEvent.click(screen.getByRole('option', { name: themes[1].name }))

    expect(setTheme).toHaveBeenCalledWith(themes[1].id)
  })
})
