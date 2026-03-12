// ═══════════════════════════════════════════
// main.js – VERSION COMPLÈTE AVEC IPC
// Le patron qui gère tout : fenêtre, fichiers, communication
// ═══════════════════════════════════════════


const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')


// ── Où sauvegarder les tâches ──
// __dirname = le dossier où se trouve main.js
const DATA_FILE = path.join(__dirname, 'tasks.json')


// ── Fonctions pour lire/écrire les tâches ──


function loadTasks () {
  if (!fs.existsSync(DATA_FILE)) return []
  const data = fs.readFileSync(DATA_FILE, 'utf-8').trim()
  if (!data) return []
  try { return JSON.parse(data) } catch { return [] }
}


function saveTasks (tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2))
}


// ── Créer la fenêtre ──


function createWindow () {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })


  win.loadFile('index.html')


  // Ouvrir les DevTools pour débugger
  // (ENLÈVE cette ligne pour la version finale !)
  //win.webContents.openDevTools()
}


// ── Démarrage ──


app.whenReady().then(createWindow)


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


// ═══════════════════════════════════════════
// IPC HANDLERS = Les services du patron
// Le Renderer (HTML) envoie des demandes,
// le Main (ici) les traite et renvoie le résultat
// ═══════════════════════════════════════════


// 1. Récupérer toutes les tâches
ipcMain.handle('get-tasks', () => {
  return loadTasks()
})


// 2. Ajouter une tâche
ipcMain.handle('add-task', (event, taskData) => {
  const tasks = loadTasks()
  const newTask = {
    id: Date.now(),
    title: taskData.title,
    description: taskData.description || '',
    done: false,
    createdAt: new Date().toLocaleDateString('fr-FR'),
  }
  tasks.push(newTask)
  saveTasks(tasks)
  return tasks
})


// 3. Supprimer une tâche
ipcMain.handle('delete-task', (event, taskId) => {
  const tasks = loadTasks().filter(t => t.id !== taskId)
  saveTasks(tasks)
  return tasks
})


// 4. Cocher/décocher une tâche
ipcMain.handle('toggle-task', (event, taskId) => {
  const tasks = loadTasks()
  const task = tasks.find(t => t.id === taskId)
  if (task) task.done = !task.done
  saveTasks(tasks)
  return tasks
})

ipcMain.handle('update-task', (event, taskData) => {
  const tasks = loadTasks()
  if (!taskData) return tasks
  if (!Number.isFinite(taskData.id)) return tasks
  const task = tasks.find(t => t.id === taskData.id)
  if (!task) return tasks
  if (typeof taskData.title === 'string') task.title = taskData.title
  if (typeof taskData.description === 'string') task.description = taskData.description
  saveTasks(tasks)
  return tasks
})

