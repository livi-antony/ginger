import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { db, getTree, addNode, addTask, addSubtask, renameNode, renameTask, setTaskDone, archiveNode, deleteNode, deleteTask } from './db.js';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle('get-tree', () => getTree());
  ipcMain.handle('add-node', (event, payload) => addNode(payload));
  ipcMain.handle('add-task', (event, payload) => addTask(payload));
  ipcMain.handle('rename-node', (event, { id, name }) => renameNode(id, name));
  ipcMain.handle('rename-task', (event, { id, name }) => renameTask(id, name));
  ipcMain.handle('archive-node', (event, id) => archiveNode(id));
  ipcMain.handle('delete-node', (event, id) => deleteNode(id));
  ipcMain.handle('delete-task', (event, id) => deleteTask(id));
  ipcMain.handle('add-subtask', (event, payload) => addSubtask(payload));
  ipcMain.handle('set-task-done', (event, { id, done }) => setTaskDone(id, done));

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
