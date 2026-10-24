import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import {
  IPC,
  type Api,
  type LastSelection,
  type ScanProgress,
  type ScanResult,
  type SyncProgress,
  type SyncResult,
} from '../shared/ipc'

const api: Api = {
  pickFolder: () => ipcRenderer.invoke(IPC.pickFolder) as Promise<string | null>,
  scan: (target) => ipcRenderer.invoke(IPC.scan, target) as Promise<ScanResult>,
  sync: (target) => ipcRenderer.invoke(IPC.sync, target) as Promise<SyncResult>,
  selectSource: (source) => ipcRenderer.invoke(IPC.selectSource, source) as Promise<LastSelection>,
  loadLast: () => ipcRenderer.invoke(IPC.loadLast) as Promise<LastSelection>,
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
