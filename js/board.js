let currentDraggedElement;


/**
 * Initializes the board.
 */
async function initBoard() {
    await init();
    highlightActiveNav();
    renderTasks();
}


/**
 * Clears all board columns.
 */
function clearBoardColumns() {
    ['todo', 'inprogress', 'awaitfeedback', 'done'].forEach(id => {
        document.getElementById(id).innerHTML = '';
    });
}


/**
 * Renders all tasks to the board, optionally filtered by search.
 * @param {string} searchFilter - The search term
 */
function renderTasks(searchFilter = '') {
    let allTasks = getTasks();
    clearBoardColumns();
    
    allTasks.forEach(task => {
        if (matchesFilter(task, searchFilter)) {
            let content = generateTaskHTML(task);
            document.getElementById(task.status).innerHTML += content;
        }
    });

    checkEmptyColumns();
}


/**
 * Checks if a task matches the search filter.
 * @param {Object} task - The task object
 * @param {string} filter - The search filter
 * @returns {boolean} True if matches
 */
function matchesFilter(task, filter) {
    if (!filter) return true;
    let term = filter.toLowerCase();
    return task.title.toLowerCase().includes(term) || 
           task.description.toLowerCase().includes(term);
}


/**
 * Checks columns for empty state and renders placeholder.
 */
function checkEmptyColumns() {
    let emptyMsg = {
        'todo': 'No tasks To do',
        'inprogress': 'No tasks In progress',
        'awaitfeedback': 'No tasks Await feedback',
        'done': 'No tasks Done'
    };

    ['todo', 'inprogress', 'awaitfeedback', 'done'].forEach(id => {
        let col = document.getElementById(id);
        if(col.innerHTML.trim() === '') {
            col.innerHTML = `<div class="no-tasks">${emptyMsg[id]}</div>`;
        }
    });
}


/**
 * Starts the dragging process.
 * @param {number} id - Task ID
 */
function startDragging(id) {
    currentDraggedElement = id;
}


/**
 * Allows dropping an element.
 * @param {Event} ev - Drag event
 */
function allowDrop(ev) {
    ev.preventDefault();
}


/**
 * Handles the drop event.
 * @param {Event} ev - Drop event
 */
function drop(ev) {
    ev.preventDefault();
    let target = ev.target.closest('.task-list');
    if (!target) return;
    moveTo(currentDraggedElement, target.id);
}


/**
 * Moves a task to a new status.
 * @param {number} taskId - Task ID
 * @param {string} newStatus - New status ID
 */
function moveTo(taskId, newStatus) {
    let task = tasks.find(t => t.id === taskId);
    if(task) {
        task.status = newStatus;
        saveTask(task);
        renderTasks();
        showToast("Task moved to " + newStatus.replace('awaitfeedback', 'Await Feedback').toUpperCase());
    }
}


/**
 * Opens the Add Task Modal.
 * @param {string} status - Pre-selected status (default 'todo')
 */
function openAddTaskModal(status = 'todo') {
    setTargetStatus(status);
    
    // Reset form and UI state to ensure clean slate
    if (typeof clearForm === 'function') clearForm();
    if (typeof resetEditUI === 'function') resetEditUI();
    
    document.getElementById('add-task-modal-overlay').classList.remove('d-none');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Re-initialize add task logic (render contacts, etc.)
    initAddTask(); 
}

/**
 * Closes the Add Task Modal with animation.
 */
function closeAddTaskModal() {
    let modalContent = document.getElementById('add-task-slide-in');
    let modalOverlay = document.getElementById('add-task-modal-overlay');
    
    modalContent.classList.add('slide-out');
    
    // Wait for animation to finish (400ms)
    setTimeout(() => {
        modalOverlay.classList.add('d-none');
        modalContent.classList.remove('slide-out');
        document.body.style.overflow = ''; // Restore scrolling
    }, 400);
}


/**
 * Filters tasks based on search input.
 */
function filterTasks() {
    let search = document.querySelector('.search-bar input').value.toLowerCase();
    renderTasks(search);
}


/**
 * Generates HTML for a single task card.
 * @param {Object} task - The task object
 * @returns {string} The HTML string
 */
function generateTaskHTML(task) {
    return `
    <div draggable="true" ondragstart="startDragging(${task.id})" class="task-card" onclick="openTaskDetails(${task.id})">
        <div class="task-category ${getCategoryClass(task.category)}">${task.category}</div>
        <div class="task-title">${task.title}</div>
        <div class="task-description">${task.description}</div>
        ${getProgressBarHTML(task)}
        <div class="task-footer">
            <div class="assigned-users">${getAssignedBadgesHTML(task)}</div>
            <div class="priority-icon"><img src="${getPrioIcon(task.priority)}"></div>
        </div>
    </div>`;
}


/**
 * Returns the CSS class for category.
 * @param {string} category 
 * @returns {string} CSS class
 */
function getCategoryClass(category) {
    return category === 'User Story' ? 'cat-user-story' : 'cat-technical-task';
}


/**
 * Generates the progress bar HTML.
 * @param {Object} task 
 * @returns {string} HTML string
 */
function getProgressBarHTML(task) {
    if (!task.subtasks || task.subtasks.length === 0) return '';
    let completed = task.subtasks.filter(t => t.done).length;
    let total = task.subtasks.length;
    let percent = (completed / total) * 100;
    return `
        <div class="task-progress">
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${percent}%"></div>
            </div>
            <span>${completed}/${total} Subtasks</span>
        </div>`;
}


/**
 * Generates assigned user badges HTML.
 * @param {Object} task 
 * @returns {string} HTML string
 */
function getAssignedBadgesHTML(task) {
    if (!task.assignedTo || task.assignedTo.length === 0) return '';
    return task.assignedTo.map(contact => 
        `<div class="user-badge" style="background:${contact.color || '#0038FF'}">
            ${getInitials(contact.name || contact)}
        </div>`
    ).join('');
}


/**
 * Gets the priority icon path.
 * @param {string} priority 
 * @returns {string} Icon path
 */
function getPrioIcon(priority) {
    if (priority === 'low') return '../assets/img/low-priority-board.svg';
    if (priority === 'medium') return '../assets/img/priority_medium.svg';
    return '../assets/img/urgent-priority-board.svg';
}


/**
 * Gets initials from name.
 * @param {string} name 
 * @returns {string} Initials
 */
function getInitials(name) {
    return name.match(/(\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase();
}


/* --- MODAL LOGIC --- */

let currentOpenedTaskId = null;

/**
 * Opens the task detail modal.
 * @param {number} taskId 
 */
function openTaskDetails(taskId) {
    currentOpenedTaskId = taskId;
    let task = tasks.find(t => t.id === taskId);
    if (!task) return;

    renderModalBasicInfo(task);
    renderModalPriority(task);
    renderModalAssignedList(task);
    renderModalSubtasksList(task);
    
    document.getElementById('task-modal-overlay').classList.remove('d-none');
}


/**
 * Renders basic text info in modal.
 * @param {Object} task 
 */
function renderModalBasicInfo(task) {
    let catEl = document.getElementById('modal-category');
    catEl.innerText = task.category;
    catEl.className = `modal-category ${getCategoryClass(task.category)}`;
    document.getElementById('modal-title').innerText = task.title;
    document.getElementById('modal-description').innerText = task.description;
    document.getElementById('modal-date').innerText = task.dueDate;
}


/**
 * Renders priority info in modal.
 * @param {Object} task 
 */
function renderModalPriority(task) {
    document.getElementById('modal-priority-text').innerText = task.priority;
    document.getElementById('modal-priority-icon').src = getPrioIcon(task.priority);
}


/**
 * Renders assigned users list in modal.
 * @param {Object} task 
 */
function renderModalAssignedList(task) {
    let list = document.getElementById('modal-assigned-list');
    list.innerHTML = '';
    if (task.assignedTo) {
        task.assignedTo.forEach(contact => {
            let name = contact.name || contact;
            let color = contact.color || '#CCCCCC';
            let initial = getInitials(name);
            list.innerHTML += getModalUserRowHTML(name, color, initial);
        });
    }
}


/**
 * Generates HTML for a user row in modal.
 * @param {string} name 
 * @param {string} color 
 * @param {string} initial 
 * @returns {string} HTML
 */
function getModalUserRowHTML(name, color, initial) {
    return `
        <div class="assigned-user-row">
            <div class="user-badge search-item-badge" style="background:${color}; width: 40px; height: 40px; font-size: 16px;">
                ${initial}
            </div>
            <span style="font-size: 19px; color: black; margin-left: 10px;">${name}</span> 
        </div>`;
}


/**
 * Renders subtasks in modal.
 * @param {Object} task 
 */
function renderModalSubtasksList(task) {
    let list = document.getElementById('modal-subtasks');
    list.innerHTML = '';
    if (task.subtasks) {
        task.subtasks.forEach((st, index) => {
            let checked = st.done ? 'checked' : '';
            // Using onchange safely implies interaction
            list.innerHTML += `
                <div class="subtask-row" onclick="toggleSubtask(${task.id}, ${index})">
                    <input type="checkbox" class="subtask-checkbox" ${checked} onchange="toggleSubtask(${task.id}, ${index}); event.stopPropagation()">
                    <span>${st.title}</span>
                </div>`;
        });
    }
}

/**
 * Toggles a subtask's done status.
 * @param {number} taskId 
 * @param {number} subtaskIndex 
 */
async function toggleSubtask(taskId, subtaskIndex) {
    let task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) return;

    // Toggle status
    // Note: If called from div click, check if event target was checkbox to avoid double toggle?
    // Actually simplicity: if I click row, I toggle. If I click checkbox, it toggles natively then I update state.
    // Better logic:
    // Make only the checkbox control it, OR make the whole row control it and handle UI sync.
    // Let's rely on the task state.
    // If I clicked the div, I manually flip the checkbox and the state.
    // If I clicked the checkbox, I just update state.
    
    // Simplest approach: Update state based on current value? No, simplest is just invert boolean.
    // But we need to distinguish clicks.
    // Let's assume the function is called.
    
    // To avoid complexity, let's just make the whole row clickable and handle the logic carefully.
    // But onclick on div AND onchange on input might conflict if bubbling.
    // Let's prevent bubbling on checkbox.
    
    // Wait, simpler: just update state.
    let subtask = task.subtasks[subtaskIndex];
    subtask.done = !subtask.done;
    
    // Save to server
    await saveTask(task);
    
    // Re-render board (to update progress bar on card)
    renderTasks();
    
    // Re-render modal list to reflect correct state (and visual checkbox)?
    // Or just let it be. If I re-render, focus might be lost.
    // If I don't re-render, the checkbox visually toggles fine (native behavior).
    // EXCEPT if I click the text/div, I need to toggle the checkbox visually too.
    
    // Re-rendering is safest for syncing state but might flicker.
    renderModalSubtasksList(task);
}

/**
 * Closes the task modal.
 */
function closeTaskModal() {
    document.getElementById('task-modal-overlay').classList.add('d-none');
}

/**
 * Deletes the currently opened task.
 */
async function deleteTask() {
    if (!currentOpenedTaskId) return;
    
    // Optional: Confirm dialog? User didn't ask, but good practice.
    // Let's just delete for speed as requested "muss funktionieren".
    
    await deleteTaskData(currentOpenedTaskId);
    closeTaskModal();
    renderTasks();
    showToast("Task deleted");
}

/**
 * Opens the Edit Task view.
 */
function editTask() {
    closeTaskModal(); // Close detail view
    
    // Open Add Task Modal structure
    document.getElementById('add-task-modal-overlay').classList.remove('d-none');
    document.body.style.overflow = 'hidden';
    
    // Initialize standard add task stuff first (contacts etc)
    initAddTask();
    
    // Call function in add_task.js to fill data and switch mode
    loadTaskForEdit(currentOpenedTaskId);
}
