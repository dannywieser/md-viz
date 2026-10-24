import { stat } from 'node:fs/promises'
import path from 'node:path'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import {
  IPC,
  type LastSelection,
  type ScanResult,
  type Source,
  type SyncResult,
  type SyncTarget,
} from '../shared/ipc'
import { loadBearNotes } from './load-bear-notes'
import { loadFileNotes } from './load-file-notes'
import { scanBear } from './scan-bear'
import { scanMarkdown } from './scan'
import { readState, syncKey, updateState, type AppState } from './state'
import { DEFAULT_CACHE_URL, syncNotes } from './sync'

async function assertDirectory(folder: unknown): Promise<string> {
  if (typeof folder !== 'string' || !path.isAbsolute(folder)) {
    throw new Error('expected an absolute folder path')
  }
  if (!(await stat(folder)).isDirectory()) {
    throw new Error('not a directory')
  }
  return folder
}

/** checks what the renderer sent: a source, plus an existing absolute folder for files. */
async function assertTarget(target: unknown): Promise<SyncTarget> {
  const { source, folder } = (target ?? {}) as { source?: unknown; folder?: unknown }
  if (source === 'bear') return { source }
  if (source === 'file') return { source, folder: await assertDirectory(folder) }
  throw new Error('expected a source')
}

function assertSource(source: unknown): Source {
  if (source !== 'file' && source !== 'bear') throw new Error('expected a source')
  return source
}

/** the folder and last sync of `source` as the state file has them. */
async function selectionOf(source: Source, state: AppState): Promise<LastSelection> {
  if (source === 'bear') return { source, folder: null, lastSync: state.syncs['bear'] ?? null }
  let folder: string | null = null
  if (state.lastFolder) {
    try {
      folder = await assertDirectory(state.lastFolder)
    } catch {
      // the folder is gone: show no folder.
    }
  }
  const lastSync = folder ? (state.syncs[syncKey({ source, folder })] ?? null) : null
  return { source, folder, lastSync }
}

export function registerIpc(): void {
  const stateFile = () => path.join(app.getPath('userData'), 'state.json')

  ipcMain.handle(IPC.pickFolder, async (event): Promise<string | null> => {
    const window = BrowserWindow.fromWebContents(event.sender)
    const options = { properties: ['openDirectory' as const] }
    const result = window
      ? await dialog.showOpenDialog(window, options)
      : await dialog.showOpenDialog(options)
    const picked = result.canceled ? null : (result.filePaths[0] ?? null)
    if (picked) {
      await updateState(stateFile(), (state) => {
        state.lastSource = 'file'
        state.lastFolder = picked
      })
    }
    return picked
  })

  ipcMain.handle(IPC.scan, async (event, input: unknown): Promise<ScanResult> => {
    const target = await assertTarget(input)
    if (target.source === 'bear') return scanBear()
    return scanMarkdown(target.folder, (progress) => {
      if (!event.sender.isDestroyed()) event.sender.send(IPC.scanProgress, progress)
    })
  })

  ipcMain.handle(IPC.sync, async (event, input: unknown): Promise<SyncResult> => {
    const target = await assertTarget(input)
    const loaded =
      target.source === 'bear' ? await loadBearNotes() : await loadFileNotes(target.folder)
    const result = await syncNotes(target.source, loaded, {
      baseUrl: process.env['CACHE_URL'] ?? DEFAULT_CACHE_URL,
      onProgress: (progress) => {
        if (!event.sender.isDestroyed()) event.sender.send(IPC.syncProgress, progress)
      },
    })
    const syncedAt = new Date().toISOString()
    await updateState(stateFile(), (state) => {
      state.lastSource = target.source
      if (target.source === 'file') state.lastFolder = target.folder
      state.syncs[syncKey(target)] = { syncedAt, notes: result.notes }
    })
    return result
  })

  ipcMain.handle(IPC.selectSource, async (_event, input: unknown): Promise<LastSelection> => {
    const source = assertSource(input)
    await updateState(stateFile(), (state) => void (state.lastSource = source))
    return selectionOf(source, await readState(stateFile()))
  })

  ipcMain.handle(IPC.loadLast, async (): Promise<LastSelection> => {
    const state = await readState(stateFile())
    return selectionOf(state.lastSource, state)
  })
}
