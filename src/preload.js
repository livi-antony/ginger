import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ginger', {
  getTree: () => ipcRenderer.invoke('get-tree'),
  addNode: (payload) => ipcRenderer.invoke('add-node', payload),
  addTask: (payload) => ipcRenderer.invoke('add-task', payload),
  renameNode: (id, name) => ipcRenderer.invoke('rename-node', { id, name }),
  renameTask: (id, name) => ipcRenderer.invoke('rename-task', { id, name }),
});