import { stat } from 'node:fs/promises'
import path from 'node:path'
import { BrowserWindow, dialog, ipcMain } from 'electron'
import { IPC, type ScanResult, type SyncResult } from '../shared/ipc'
import { scanMarkdown } from './scan'
import { DEFAULT_CACHE_URL, syncFolder } from './sync'

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
  ipcMain.handle(IPC.pickFolder, async (event): Promise<string | null> => {
    const window = BrowserWindow.fromWebContents(event.sender)
    const options = { properties: ['openDirectory' as const] }
    const result = window
      ? await dialog.showOpenDialog(window, options)
      : await dialog.showOpenDialog(options)
    return result.canceled ? null : (result.filePaths[0] ?? null)
  })

  ipcMain.handle(IPC.scanFolder, async (event, folder: unknown): Promise<ScanResult> => {
    const root = await assertDirectory(folder)
    return scanMarkdown(root, (progress) => {
      if (!event.sender.isDestroyed()) event.sender.send(IPC.scanProgress, progress)
    })
  })

  ipcMain.handle(IPC.syncFolder, async (event, folder: unknown): Promise<SyncResult> => {
    const root = await assertDirectory(folder)
    return syncFolder(root, {
      baseUrl: process.env['CACHE_URL'] ?? DEFAULT_CACHE_URL,
      onProgress: (progress) => {
        if (!event.sender.isDestroyed()) event.sender.send(IPC.syncProgress, progress)
      },
    })
  })
}
