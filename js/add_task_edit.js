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

    // Fill Basic Fields
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskDueDate').value = task.dueDate;
    document.getElementById('taskCategory').value = task.category;
    
    // Set Priority
    setPrio(task.priority);

    // Set Assigned Contacts
    selectedContacts = task.assignedTo || []; // Copy array
    renderSelectedBadges();
    renderContactOptions(); // Re-render dropdown to show checkboxes

    // Set Subtasks
    subtasks = task.subtasks || []; // Copy array
    renderSubtasks();

    // Update UI for Edit Mode
    document.querySelector('#add-task-slide-in h1').innerText = 'Edit Task';
    
    let submitBtn = document.querySelector('.btn-dark');
    submitBtn.innerHTML = `Ok <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12L9 16L19 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    
    document.querySelector('form').setAttribute('onsubmit', 'saveEditedTask(event)');
    
    // Hide Clear button in edit mode? Optional.
    document.querySelector('.btn-light').style.display = 'none';
    
    // Disable Category (User Story 6 Requirement)
    document.getElementById('taskCategory').disabled = true;
}

/**
 * Saves the edited task.
 * @param {Event} event 
 */
async function saveEditedTask(event) {
    event.preventDefault();
    let title = document.getElementById('taskTitle');
    let date = document.getElementById('taskDueDate');
    let category = document.getElementById('taskCategory');

    resetErrors(title, date, category);
    if (!validateTaskForm(title, date, category)) return;

    // Determine the existing task object to update implies we shouldn't create a NEW object completely, 
    // but preserving ID is key.
    let updatedTask = {
        id: editingTaskId,
        title: title.value,
        description: document.getElementById('taskDescription').value,
        category: category.value,
        dueDate: date.value,
        priority: currentPrio,
        assignedTo: selectedContacts,
        subtasks: subtasks,
        status: tasks.find(t => t.id === editingTaskId).status // Preserve status
    };

    await saveTask(updatedTask);
    
    // Success UI
    handleTaskSuccess(); // This handles closing modal and refreshing board
    
    // Reset UI back to Add Task mode (done in clearForm or handling success?)
    // handleTaskSuccess calls clearForm. We need to reset the UI structure there.
    resetEditUI();
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
