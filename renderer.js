const titleInput = document.getElementById('title');
const descInput = document.getElementById('desc');
const btnAdd = document.getElementById('btn-add');
const taskList = document.getElementById('task-list');
const counter = document.getElementById('counter');


// ── Afficher les tâches ──
async function displayTasks() {
    const tasks = await window.api.getTasks();
    taskList.innerHTML = '';

    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty">Aucune tâche pour le moment ✌️</div>';
        counter.textContent = '0 tâche';
        return;
    }

    tasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = `task ${task.done ? 'done' : ''}`;

        taskEl.innerHTML = `
            <input type="checkbox" ${task.done ? 'checked' : ''} data-id="${task.id}">
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
                <div class="task-date">${task.createdAt}</div>
            </div>
            <button class="btn-update" data-id="${task.id}">Modifier</button>
            <button class="btn-delete" data-id="${task.id}">Supprimer</button>
        `;
        taskList.appendChild(taskEl);
    });

    counter.textContent = `${tasks.length} tâche${tasks.length > 1 ? 's' : ''}`;
}

async function ShowUpdateForm(taskElement,id){
    const existing = document.querySelector('.updateForm');
    if (existing) existing.remove();
    const titleEl = taskElement.querySelector('.task-title');
    const descEl = taskElement.querySelector('.task-desc');
    const title = titleEl ? titleEl.textContent : '';
    const desc = descEl ? descEl.textContent : '';
    const updateForm = document.createElement('div');
    updateForm.className = 'updateForm';
    updateForm.innerHTML = `
        <input type="text" id="titleUpdate" placeholder="Titre de la tâche" autofocus value="${title}">
        <input type="text" id="descUpdate" placeholder="Description (optionnel)" value="${desc}">
        <button class="btn-update-commit" data-id="${id}">Confirmer La Modification</button>
        <button class="btn-update-cancel">Annuler</button>
    `;
    taskElement.insertAdjacentElement('afterend', updateForm);
}


// ── Ajouter une tâche ──
async function addTaskFromInput() {
    const title = titleInput.value.trim();
    if (!title) return;

    await window.api.addTask({ title, description: descInput.value });
    titleInput.value = '';
    descInput.value = '';
    titleInput.focus();
    displayTasks();
}


// ── Événements ──
btnAdd.addEventListener('click', addTaskFromInput);
titleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTaskFromInput();
});

taskList.addEventListener('click', async (e) => {
    const target = e.target;
    if (!target) return;

    if (target.classList.contains('btn-update-commit')) {
        const id = Number(target.dataset.id);
        if (!id) return;
        const form = target.closest('.updateForm');
        if (!form) return;
        const titleUpdate = form.querySelector('#titleUpdate');
        const descUpdate = form.querySelector('#descUpdate');
        if (!titleUpdate || !descUpdate) return;
        const title = titleUpdate.value.trim();
        if (!title) return;
        await window.api.updateTask({ id, title, description: descUpdate.value });
        displayTasks();
        return;
    }

    if (target.classList.contains('btn-update-cancel')) {
        const form = target.closest('.updateForm');
        if (!form) return;
        form.remove();
        return;
    }

    const id = Number(target.dataset.id);
    if (!id) return;

    if (target.type === 'checkbox') {
        await window.api.toggleTask(id);
        displayTasks();
        return;
    }
    if (target.classList.contains('btn-delete')) {
        await window.api.deleteTask(id);
        displayTasks();
        return;
    }

    if (target.classList.contains('btn-update')) {
        const taskElement = target.closest('.task');
        if (!taskElement) return;
        ShowUpdateForm(taskElement,id);
    }
});


// ── Au démarrage ──
displayTasks();