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
 * Returns the CSS class for category.
 * @param {string} category 
 * @returns {string} CSS class
 */
function getCategoryClass(category) {
    return category === 'User Story' ? 'cat-user-story' : 'cat-technical-task';
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
