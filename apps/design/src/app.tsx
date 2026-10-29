import { Navigate, Route, Routes } from 'react-router'
import { useTheme } from '@md-viz/ui'
import { ComponentRoute } from './component-pages/component-route'
import { ComponentsLayout } from './component-pages/components-layout'
import { components } from './component-pages/registry'
import { ExplorationRoute } from './explorations/exploration-route'
import { ExplorationsIndex } from './explorations/explorations-index'
import { Nav } from './nav'
import { NotFound } from './not-found'
import { PageLayout } from './page-layout'
import { ColorsPage } from './pages/colors-page'
import { Grid } from './sections/grid'
import { Guidelines } from './sections/guidelines'
import { LogoSection } from './sections/logo'
import { Spacing } from './sections/spacing'
import { Typography } from './sections/typography'

export function App() {
  const { theme, themes, setTheme } = useTheme()

  return (
    <div className="flow-root min-h-screen">
      <Nav themeId={theme.id} themes={themes} onThemeChange={setTheme} />
      <Routes>
        <Route element={<PageLayout />}>
          <Route index element={<Navigate to="/guidelines" replace />} />
          <Route path="guidelines" element={<Guidelines />} />
          <Route path="logo" element={<LogoSection />} />
          <Route path="colors" element={<ColorsPage />} />
          <Route path="typography" element={<Typography />} />
          <Route path="spacing" element={<Spacing />} />
          <Route path="grid" element={<Grid />} />
          <Route path="components" element={<ComponentsLayout />}>
            <Route index element={<Navigate to={`/components/${components[0].slug}`} replace />} />
            <Route path=":slug" element={<ComponentRoute />} />
          </Route>
          <Route path="explorations" element={<ExplorationsIndex />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="explorations/:slug" element={<ExplorationRoute />} />
      </Routes>
    </div>
  )
}
