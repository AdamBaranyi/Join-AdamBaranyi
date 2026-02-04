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
 * @param {DragEvent} ev - Drag event
 * @param {number} id - Task ID
 */
function startDragging(ev, id) {
    currentDraggedElement = id;
    // Essential: Set data to ensure browser treats this as a valid drag-drop operation
    ev.dataTransfer.effectAllowed = "move";
    ev.dataTransfer.setData("text/plain", String(id));

    // Visual feedback: Rotate card (async to allow drag to start)
    setTimeout(() => {
        let card = document.getElementById(`task-${id}`);
        if (card) card.classList.add('dragging');
    }, 10);
}

/**
 * Stops the dragging process and cleans up.
 * @param {number} id - Task ID
 */
function stopDragging(id) {
    let card = document.getElementById(`task-${id}`);
    if (card) card.classList.remove('dragging');
}


let lastHighlighted = null;

/**
 * Allows dropping an element.
 * @param {Event} ev - Drag event
 */
function allowDrop(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
    
    let target = ev.target.closest('.task-list');
    /* Optimize: only update if changed to avoid flickering */
    if (target && target.id !== lastHighlighted) {
        highlight(target.id);
    }
}

/**
 * Highlights a column when dragging over it.
 * @param {string} id - Column ID
 */
function highlight(id) {
    // Clear previous highlight if exists
    if (lastHighlighted && lastHighlighted !== id) {
        let prev = document.getElementById(lastHighlighted);
        if (prev) prev.classList.remove('drag-area-highlight');
    }

    lastHighlighted = id;
    
    let col = document.getElementById(id);
    if (col) col.classList.add('drag-area-highlight');
}

/**
 * Removes highlight from a column.
 * @param {string} id - Column ID
 */
function removeHighlight(id) {
    let col = document.getElementById(id);
    if (col) col.classList.remove('drag-area-highlight');
    if (lastHighlighted === id) lastHighlighted = null;
}


/**
 * Handles the drop event.
 * @param {Event} ev - Drop event
 */
function drop(ev) {
    ev.preventDefault();
    let target = ev.target.closest('.task-list');
    
    // Remove rotation
    if (currentDraggedElement) {
        let card = document.getElementById(`task-${currentDraggedElement}`);
        if(card) card.classList.remove('dragging');
    }
    
    // Clear highlights
    if (lastHighlighted) {
        removeHighlight(lastHighlighted);
    }
    // Deep clean to be safe
    ['todo', 'inprogress', 'awaitfeedback', 'done'].forEach(id => {
        let el = document.getElementById(id);
        if(el) el.classList.remove('drag-area-highlight');
    });
    lastHighlighted = null;
    
    if (!target) return;

    moveTo(currentDraggedElement, target.id);
}


/**
 * Moves a task to a new status.
 * @param {number} taskId - Task ID
 * @param {string} newStatus - New status ID
 */
function moveTo(taskId, newStatus) {
    console.log("Moving task", taskId, "to", newStatus); // Debug
    let task = tasks.find(t => t.id === taskId);
    if(task) {
        task.status = newStatus;
        saveTask(task);
        renderTasks();
        showToast("Task moved to " + newStatus.replace('awaitfeedback', 'Await Feedback').toUpperCase());
    } else {
        console.warn("Task not found:", taskId);
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
    <div draggable="true" ondragstart="startDragging(event, ${task.id})" ondragend="stopDragging(${task.id})" class="task-card" id="task-${task.id}" onclick="openTaskDetails(${task.id})">
        
        <!-- Mobile Move Menu Button -->
        <div class="mobile-move-btn" onclick="toggleMoveMenu(event, ${task.id})">
            <!-- Simple Arrow Up/Down/Move Icon -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 9l7-7 7 7"></path>
                <path d="M5 15l7 7 7-7"></path>
            </svg>
        </div>
        
        <!-- Mobile Popup Menu -->
        <div id="move-menu-${task.id}" class="move-menu d-none" onclick="event.stopPropagation()">
            <div class="move-menu-item" onclick="moveToFromMenu(${task.id}, 'todo')">To Do</div>
            <div class="move-menu-item" onclick="moveToFromMenu(${task.id}, 'inprogress')">In Progress</div>
            <div class="move-menu-item" onclick="moveToFromMenu(${task.id}, 'awaitfeedback')">Await Feedback</div>
            <div class="move-menu-item" onclick="moveToFromMenu(${task.id}, 'done')">Done</div>
        </div>

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

/* --- Mobile Menu Logic --- */

/**
 * Toggles the mobile move menu.
 * @param {Event} event 
 * @param {number} taskId 
 */
function toggleMoveMenu(event, taskId) {
    event.stopPropagation();
    
    // Close all other menus first
    document.querySelectorAll('.move-menu').forEach(el => el.classList.add('d-none'));
    
    let menu = document.getElementById(`move-menu-${taskId}`);
    if (menu) {
        menu.classList.toggle('d-none');
    }
}

/**
 * Moves task from menu and closes menu.
 * @param {number} taskId 
 * @param {string} status 
 */
function moveToFromMenu(taskId, status) {
    moveTo(taskId, status);
    // Menu auto-closes because renderTasks() rebuilds DOM
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
    let subtask = task.subtasks[subtaskIndex];
    subtask.done = !subtask.done;
    
    // Save to server
    await saveTask(task);
    
    // Re-render board (to update progress bar on card)
    renderTasks();
    
    // Re-render modal list to reflect correct state (and visual checkbox)?
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
