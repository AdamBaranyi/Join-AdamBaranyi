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
