import path from 'node:path'
import { app, BrowserWindow } from 'electron'
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../shared/window-size'
import { registerIpc } from './ipc'

// the app icon, drawn from the logo by scripts/make-icon.mjs.
const ICON = path.join(import.meta.dirname, '../../resources/icon.png')

function createWindow(): void {
  const window = new BrowserWindow({
    // a fixed size, just wide enough for the three status columns.
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    useContentSize: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    show: false,
    title: 'md-viz sync',
    // windows and linux take the window icon here; macOS ignores it and uses the dock icon below.
    icon: ICON,
    // no native title bar: the app header is the drag area. macOS keeps its traffic lights, inset
    // to line up with the header; windows and linux draw their window controls over the page.
    titleBarStyle: 'hidden',
    ...(process.platform === 'darwin'
      ? { trafficLightPosition: { x: 30, y: 33 } }
      : { titleBarOverlay: true }),
    webPreferences: {
      preload: path.join(import.meta.dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  window.once('ready-to-show', () => window.show())

  // the app is a single local page: never open or navigate to anything else.
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', (event) => event.preventDefault())

  const devUrl = process.env['ELECTRON_RENDERER_URL']
  if (devUrl) {
    void window.loadURL(devUrl)
  } else {
    void window.loadFile(path.join(import.meta.dirname, '../renderer/index.html'))
  }
}

void app.whenReady().then(() => {
  // until the app is packaged (with an .icns) macOS shows Electron's own dock icon.
  app.dock?.setIcon(ICON)
  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
