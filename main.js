// main.js
// run npm run build:css 
// run npm start 

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');

let mainWindow;
let server;
let serverPort;

// Server-side settings
let settings = {
  // Placeholder for future settings.. get panel working for now
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 1000,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), 
      nodeIntegration: false, 
      contextIsolation: true, 
    },
    title: 'ChatterBox a_1.0',
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Once the window finishes loading, send the server port if available
  mainWindow.webContents.once('did-finish-load', () => {
    console.log('Window finished loading');
    if (serverPort) {
      console.log(`Sending server port to renderer: ${serverPort}`);
      mainWindow.webContents.send('server-port', serverPort);
    }
  });
}

function startServer() {
  const appServer = express();

  // Middleware to parse JSON bodies
  appServer.use(express.json());

  // Simple root route
  appServer.get('/', (req, res) => {
    res.send('Hello from Express server!');
  });

  // Route to get current settings
  appServer.get('/settings', (req, res) => {
    res.json(settings);
  });

  // Route to update settings, establishing const values
  appServer.post('/settings', (req, res) => {
    const { activation, brightness, notifications } = req.body;
    if (activation !== undefined) settings.activation = activation;
    if (brightness !== undefined) settings.brightness = brightness;
    if (notifications !== undefined) settings.notifications = notifications;
    console.log('Updated settings:', settings);
    res.json({ status: 'success', settings });
  });

  // Start listening on a random available port
  server = appServer.listen(0, () => {
    serverPort = server.address().port;
    console.log(`Express server listening on http://localhost:${serverPort}`);

    // If the window is already loaded, send the port
    if (mainWindow && mainWindow.webContents && mainWindow.webContents.getURL()) {
      console.log(`Sending server port to renderer: ${serverPort}`);
      mainWindow.webContents.send('server-port', serverPort);
    }
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });
}

app.whenReady().then(() => {
  createWindow();
  startServer();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    if (server) server.close();
    app.quit();
  }
});

// Handle IPC requests from renderer for server settings
ipcMain.handle('get-server-settings', async () => {
  return settings;
});


ipcMain.handle('get-server-port', async () => {
  return serverPort;
});



ipcMain.on('update-activation', (event, activation) => {
  settings.activation = activation;
  console.log('Activation updated to:', activation); //announces via console volume change
});

ipcMain.on('update-brightness', (event, brightness) => {
  settings.brightness = brightness;
  console.log('Brightness updated to:', brightness);
});


