const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  addTask: (task) => ipcRenderer.invoke('add-task', task),
  deleteTask: (id) => ipcRenderer.invoke('delete-task', id),
  toggleTask: (id) => ipcRenderer.invoke('toggle-task', id),
  updateTask: (task) => ipcRenderer.invoke('update-task', task)
})