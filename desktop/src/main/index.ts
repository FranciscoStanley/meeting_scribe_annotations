import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  Tray,
  nativeImage,
  session,
} from 'electron';
import path from 'path';
import { readConfig } from './config';
import {
  detectActiveTeamsMeetingWindow,
  listTeamsWindows,
  pickBestTeamsMeetingWindow,
} from './teams-window-detector';
import { MeetingAlertsService } from './meeting-alerts.service';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let pendingCaptureSessionId: string | null = null;
let preferDesktopTeamsJoin = true;

const config = readConfig();
const alerts = new MeetingAlertsService(config);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 520,
    height: 720,
    show: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('Meeting Scribe — Teams desktop');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Abrir Meeting Scribe',
        click: () => {
          mainWindow?.show();
          mainWindow?.focus();
        },
      },
      { type: 'separator' },
      { label: 'Sair', click: () => app.quit() },
    ]),
  );
}

function setupDisplayMediaHandler() {
  session.defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
    const detected = await detectActiveTeamsMeetingWindow();
    const teamsWindows = await listTeamsWindows();
    const source =
      detected?.source ?? pickBestTeamsMeetingWindow(teamsWindows) ?? teamsWindows[0];

    if (!source) {
      callback({});
      return;
    }

    callback({
      video: source,
      audio: process.platform === 'win32' ? 'loopback' : 'loopback',
    });
  });
}

function registerIpc() {
  ipcMain.handle('config:get', () => ({
    apiUrl: config.apiUrl,
    wsUrl: config.apiUrl,
    platform: process.platform,
  }));

  ipcMain.handle('teams:list-sources', async () => {
    const windows = await listTeamsWindows();
    return windows.map((w) => ({ id: w.id, name: w.name }));
  });

  ipcMain.handle('teams:detect-meeting', async () => {
    const detected = await detectActiveTeamsMeetingWindow();
    if (!detected) return null;
    return {
      id: detected.source.id,
      name: detected.source.name,
      isLikelyInCall: detected.isLikelyInCall,
    };
  });

  ipcMain.handle(
    'meeting:open-join-url',
    (_event, joinUrl: string, preferDesktop?: boolean) => {
      alerts.openMeetingJoinUrl(joinUrl, preferDesktop ?? preferDesktopTeamsJoin);
    },
  );

  ipcMain.handle('capture:set-pending-session', (_event, sessionId: string) => {
    pendingCaptureSessionId = sessionId;
  });

  ipcMain.handle('capture:consume-pending-session', () => {
    const id = pendingCaptureSessionId;
    pendingCaptureSessionId = null;
    return id;
  });
}

app.whenReady().then(() => {
  setupDisplayMediaHandler();
  registerIpc();
  createWindow();
  createTray();

  alerts.setHandler((payload) => {
    mainWindow?.webContents.send('meeting:alert', payload);
    if (payload.platform === 'TEAMS' && payload.joinUrl) {
      mainWindow?.show();
    }
  });
  alerts.start();

  setInterval(async () => {
    const detected = await detectActiveTeamsMeetingWindow();
    if (detected?.isLikelyInCall) {
      mainWindow?.webContents.send('teams:meeting-window', {
        id: detected.source.id,
        name: detected.source.name,
      });
    }
  }, 20_000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Mantém rodando na bandeja no Windows
  }
});

app.on('before-quit', () => {
  alerts.stop();
});
