import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import {
  IPC,
  type Api,
  type LastFolder,
  type ScanProgress,
  type SyncProgress,
  type SyncResult,
} from '../shared/ipc'

const api: Api = {
  pickFolder: () => ipcRenderer.invoke(IPC.pickFolder) as Promise<string | null>,
  scanFolder: (folder) =>
    ipcRenderer.invoke(IPC.scanFolder, folder) as Promise<{ mdCount: number }>,
  syncFolder: (folder) => ipcRenderer.invoke(IPC.syncFolder, folder) as Promise<SyncResult>,
  loadLast: () => ipcRenderer.invoke(IPC.loadLast) as Promise<LastFolder | null>,
  onSyncProgress: (callback) => {
    const listener = (_event: IpcRendererEvent, progress: SyncProgress) => callback(progress)
    ipcRenderer.on(IPC.syncProgress, listener)
    return () => {
      ipcRenderer.removeListener(IPC.syncProgress, listener)
    }
  },
  onScanProgress: (callback) => {
    const listener = (_event: IpcRendererEvent, progress: ScanProgress) => callback(progress)
    ipcRenderer.on(IPC.scanProgress, listener)
    return () => {
      ipcRenderer.removeListener(IPC.scanProgress, listener)
    }
  },
}

contextBridge.exposeInMainWorld('api', api)
