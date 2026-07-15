import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ginger', {
  getTree: () => ipcRenderer.invoke('get-tree'),
  addNode: (payload) => ipcRenderer.invoke('add-node', payload),
  addTask: (payload) => ipcRenderer.invoke('add-task', payload),
});