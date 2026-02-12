/* --- EDIT MODE LOGIC --- */

let editingTaskId = null;

/**
 * Loads a task into the form for editing.
 * @param {number} taskId 
 */
function loadTaskForEdit(taskId) {
    let task = tasks.find(t => t.id === taskId);
    if (!task) return;

    editingTaskId = taskId;
    fillEditFormFields(task);
    setEditTaskMetadata(task);
    updateEditModeUI();
}


/**
 * Fills the form fields with task data.
 * @param {Object} task 
 */
function fillEditFormFields(task) {
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskDueDate').value = task.dueDate;
    document.getElementById('taskCategory').value = task.category;
}


/**
 * Sets metadata (priority, contacts, subtasks) for editing.
 * @param {Object} task 
 */
function setEditTaskMetadata(task) {
    setPrio(task.priority);
    selectedContacts = task.assignedTo || [];
    renderSelectedBadges();
    renderContactOptions();
    subtasks = task.subtasks || [];
    renderSubtasks();
}


/**
 * Updates the UI to reflect Edit Mode.
 */
function updateEditModeUI() {
    document.querySelector('#add-task-slide-in h1').innerText = 'Edit Task';
    let submitBtn = document.querySelector('.btn-dark');
    submitBtn.innerHTML = `Ok <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12L9 16L19 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    
    document.querySelector('form').setAttribute('onsubmit', 'saveEditedTask(event)');
    document.querySelector('.btn-light').style.display = 'none';
    document.getElementById('taskCategory').disabled = true;
}


/**
 * Saves the edited task.
 * @param {Event} event 
 */
async function saveEditedTask(event) {
    event.preventDefault();
    let formElements = getFormElements();

    resetErrors(formElements.title, formElements.date, formElements.category);
    if (!validateTaskForm(formElements.title, formElements.date, formElements.category)) return;

    let updatedTask = createUpdatedTaskObject(formElements);
    await saveTask(updatedTask);
    
    handleTaskSuccess();
    resetEditUI();
}


/**
 * Retrieves form elements for validation and creation.
 */
function getFormElements() {
    return {
        title: document.getElementById('taskTitle'),
        date: document.getElementById('taskDueDate'),
        category: document.getElementById('taskCategory'),
        description: document.getElementById('taskDescription')
    };
}


/**
 * Creates the updated task object.
 * @param {Object} elems 
 */
function createUpdatedTaskObject(elems) {
    return {
        id: editingTaskId,
        title: elems.title.value,
        description: elems.description.value,
        category: elems.category.value,
        dueDate: elems.date.value,
        priority: currentPrio,
        assignedTo: selectedContacts,
        subtasks: subtasks,
        status: tasks.find(t => t.id === editingTaskId).status
    };
}

/**
 * Resets the UI back to Add Task mode.
 */
function resetEditUI() {
    editingTaskId = null;
    document.querySelector('#add-task-slide-in h1').innerText = 'Add Task';
    let submitBtn = document.querySelector('.btn-dark');
    submitBtn.innerHTML = `Create Task <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12L9 16L19 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    document.querySelector('form').setAttribute('onsubmit', 'addTask(event)');
    document.querySelector('.btn-light').style.display = 'flex';
    
    // Re-enable Category
    document.getElementById('taskCategory').disabled = false;
}
