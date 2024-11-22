// preload.js

const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded');

contextBridge.exposeInMainWorld('api', {

  getServerPort: () => {
    console.log('getServerPort called');
    return ipcRenderer.invoke('get-server-port');
  },
  onServerPort: (callback) => {
    console.log('onServerPort setup');
    ipcRenderer.on('server-port', (event, port) => callback(port));
  },
  send: (channel, data) => {
    // List of allowed channels
    const validChannels = ['update-activation', 'update-brightness'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  getSettings: () => {
    return ipcRenderer.invoke('get-server-settings');
  },
  onCleanup: (callback) => {
    ipcRenderer.on('cleanup-audio', callback);
  }


  
});