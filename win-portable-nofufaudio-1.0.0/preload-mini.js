const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('miniPlayerAPI', {
  onPlayerState: (cb) => {
    const listener = (_e, state) => cb(state);
    ipcRenderer.on('player-state', listener);
    return () => ipcRenderer.removeListener('player-state', listener);
  },
  cmd: (cmd, value) => {
    ipcRenderer.send('mini-cmd', { cmd, value });
  },
  pin:      (pinned) => ipcRenderer.send('mini-window-pin', pinned),
  minimize: ()       => ipcRenderer.send('mini-window-minimize'),
  close:    ()       => ipcRenderer.send('mini-window-close'),
  quitAll:  ()       => ipcRenderer.send('mini-window-quit-all'),
});