import { stat } from 'node:fs/promises'
import path from 'node:path'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { IPC, type LastFolder, type ScanResult, type SyncResult } from '../shared/ipc'
import { loadFileNotes } from './load-file-notes'
import { scanMarkdown } from './scan'
import { readState, updateState } from './state'
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

export function registerIpc(): void {
  const stateFile = () => path.join(app.getPath('userData'), 'state.json')

  ipcMain.handle(IPC.pickFolder, async (event): Promise<string | null> => {
    const window = BrowserWindow.fromWebContents(event.sender)
    const options = { properties: ['openDirectory' as const] }
    const result = window
      ? await dialog.showOpenDialog(window, options)
      : await dialog.showOpenDialog(options)
    const picked = result.canceled ? null : (result.filePaths[0] ?? null)
    if (picked) await updateState(stateFile(), (state) => void (state.lastFolder = picked))
    return picked
  })

  ipcMain.handle(IPC.scanFolder, async (event, folder: unknown): Promise<ScanResult> => {
    const root = await assertDirectory(folder)
    return scanMarkdown(root, (progress) => {
      if (!event.sender.isDestroyed()) event.sender.send(IPC.scanProgress, progress)
    })
  })

  ipcMain.handle(IPC.syncFolder, async (event, folder: unknown): Promise<SyncResult> => {
    const root = await assertDirectory(folder)
    const result = await syncNotes('file', await loadFileNotes(root), {
      baseUrl: process.env['CACHE_URL'] ?? DEFAULT_CACHE_URL,
      onProgress: (progress) => {
        if (!event.sender.isDestroyed()) event.sender.send(IPC.syncProgress, progress)
      },
    })
    const syncedAt = new Date().toISOString()
    await updateState(stateFile(), (state) => {
      state.lastFolder = root
      state.syncs[root] = { syncedAt, notes: result.notes }
    })
    return result
  })

  ipcMain.handle(IPC.loadLast, async (): Promise<LastFolder | null> => {
    const state = await readState(stateFile())
    if (!state.lastFolder) return null
    try {
      await assertDirectory(state.lastFolder)
    } catch {
      return null
    }
    return { folder: state.lastFolder, lastSync: state.syncs[state.lastFolder] ?? null }
  })
}
