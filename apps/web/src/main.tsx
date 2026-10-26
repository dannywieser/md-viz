import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { configureCacheClient } from '@md-viz/api-client/cache'
import { App } from './app'
import { createQueryClient } from './lib/query-client'
import './index.css'

configureCacheClient({ baseUrl: import.meta.env.VITE_CACHE_URL ?? '/api' })
const queryClient = createQueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
