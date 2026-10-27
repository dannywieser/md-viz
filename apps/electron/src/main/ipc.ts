import path from 'node:path'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import {
  DEFAULT_CACHE_URL,
  loadLastSelection,
  rememberFolder,
  scanTarget,
  selectSource,
  syncTarget,
} from '@md-viz/sync'
import { IPC, type LastSelection, type ScanResult, type SyncResult } from '../shared/ipc'

export function registerIpc(): void {
  const stateFile = () => path.join(app.getPath('userData'), 'state.json')

  ipcMain.handle(IPC.pickFolder, async (event): Promise<string | null> => {
    const window = BrowserWindow.fromWebContents(event.sender)
    const options = { properties: ['openDirectory' as const] }
    const result = window
      ? await dialog.showOpenDialog(window, options)
      : await dialog.showOpenDialog(options)
    const picked = result.canceled ? null : (result.filePaths[0] ?? null)
    if (picked) await rememberFolder(stateFile(), picked)
    return picked
  })

  ipcMain.handle(IPC.scan, (event, input: unknown): Promise<ScanResult> => {
    return scanTarget(input, (progress) => {
      if (!event.sender.isDestroyed()) event.sender.send(IPC.scanProgress, progress)
    })
  })

  ipcMain.handle(IPC.sync, (event, input: unknown): Promise<SyncResult> => {
    return syncTarget(input, {
      stateFile: stateFile(),
      cacheUrl: process.env['CACHE_URL'] ?? DEFAULT_CACHE_URL,
      onProgress: (progress) => {
        if (!event.sender.isDestroyed()) event.sender.send(IPC.syncProgress, progress)
      },
    })
  })

  ipcMain.handle(IPC.selectSource, (_event, input: unknown): Promise<LastSelection> => {
    return selectSource(input, stateFile())
  })

  ipcMain.handle(IPC.loadLast, (): Promise<LastSelection> => loadLastSelection(stateFile()))
}
