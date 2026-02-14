const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs/promises');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In development, we might want to load from localhost
  // But for this simple conversion, we will assume we build the renderer first
  // and then load the file.
  // However, to support 'npm run electron:dev', we should check for an env var.
  
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // In production, load the built index.html
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null); // Completely remove the menu
  createWindow();

  ipcMain.handle('open-file-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    
    if (canceled) return { canceled: true };
    
    const filePath = filePaths[0];
    const content = await fs.readFile(filePath, 'utf-8');
    return { canceled: false, filePath, content };
  });

  ipcMain.handle('save-file', async (event, { filePath, content }) => {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  });

  ipcMain.handle('save-file-dialog', async (event, content) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });

    if (canceled || !filePath) return { canceled: true };

    await fs.writeFile(filePath, content, 'utf-8');
    return { canceled: false, filePath };
  });

  // Settings Handlers
  ipcMain.handle('get-settings', async () => {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');
    try {
      const data = await fs.readFile(settingsPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Return default settings or null if file doesn't exist
      return null;
    }
  });

  ipcMain.handle('save-settings', async (event, settings) => {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');
    try {
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('Failed to save settings:', error);
      return { success: false, error: error.message };
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
