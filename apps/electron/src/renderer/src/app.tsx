import { useEffect, useState } from 'react'
import { AppHeader, Button, ErrorState, StateBlock, ThemeSelect, useTheme } from '@md-viz/ui'
import type { LastSelection, Source, SyncNotes, SyncTarget, TagColors } from '../../shared/ipc'
import { FolderCard } from './components/folder-card'
import { SourceSelect } from './components/source-select'
import { SyncGrids } from './components/sync-grids'
import { SyncOverlay } from './components/sync-overlay'
import { useScan } from './hooks/use-scan'
import { useSync } from './hooks/use-sync'
import { errorMessage } from './lib/error-message'

// room in the header for the window controls drawn over it: the macOS traffic lights on the left,
// the windows and linux buttons on the right.
const headerClearance = navigator.userAgent.includes('Macintosh') ? 'pl-24' : 'pr-40'

/** the grids before anything has been synced. */
const NO_NOTES: SyncNotes = { updated: [], deleted: [], unchanged: [] }
const NO_TAG_COLORS: TagColors = {}

export function App() {
  const { theme, themes, setTheme } = useTheme()
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<Source>('file')
  const scan = useScan(setError)
  const sync = useSync(scan.target, setError)

  const choose = async (target: SyncTarget, saved: LastSelection['lastSync'] = null) => {
    sync.reset(saved)
    await scan.scan(target)
  }

  // show a source as saved: Bear and a file source with a folder are scanned, a file source
  // without one waits for the user to choose a folder.
  const open = async (selection: LastSelection) => {
    setSource(selection.source)
    if (selection.source === 'bear') {
      await choose({ source: 'bear' }, selection.lastSync)
    } else if (selection.folder) {
      await choose({ source: 'file', folder: selection.folder }, selection.lastSync)
    } else {
      sync.reset(null)
      scan.clear()
    }
  }

  const changeSource = async (next: Source) => {
    try {
      await open(await window.api.selectSource(next))
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const chooseFolder = async () => {
    const picked = await window.api.pickFolder()
    if (picked) await choose({ source: 'file', folder: picked })
  }

  // reopen the source from the previous run, with its last sync.
  useEffect(() => {
    void window.api.loadLast().then(open)
    // runs once, on launch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const busy = scan.scanning || sync.syncing

  return (
    <div className="flex h-screen flex-col">
      <AppHeader title="md-viz sync" subtitle="sync" className={headerClearance}>
        <ThemeSelect value={theme.id} themes={themes} onChange={setTheme} />
        <SourceSelect value={source} onChange={(next) => void changeSource(next)} disabled={busy} />
        {source === 'file' && (
          <Button onClick={() => void chooseFolder()} disabled={busy}>
            choose folder
          </Button>
        )}
        <Button onClick={() => void sync.sync()} disabled={busy || !scan.target}>
          sync
        </Button>
      </AppHeader>
      <main className="flex min-h-0 flex-1 flex-col gap-4 p-4">
        {scan.target && (
          <FolderCard target={scan.target} lastSync={sync.lastSync} count={scan.count} />
        )}
        <div className="relative min-h-0 flex-1">
          {error ? (
            <StateBlock fill>
              <ErrorState detail={error} />
            </StateBlock>
          ) : (
            scan.target && (
              <SyncGrids
                notes={sync.lastSync?.notes ?? NO_NOTES}
                tagColors={sync.lastSync?.tagColors ?? NO_TAG_COLORS}
              />
            )
          )}
          <SyncOverlay
            scanning={scan.scanning}
            scanProgress={scan.progress}
            syncing={sync.syncing}
            syncProgress={sync.progress}
          />
        </div>
      </main>
    </div>
  )
}
