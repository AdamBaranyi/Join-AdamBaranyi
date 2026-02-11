// Contacts are now loaded from storage.js

let selectedContacts = [];
let currentTargetStatus = 'todo';

/**
 * Sets the target status for a new task.
 * @param {string} status 
 */
function setTargetStatus(status) {
    currentTargetStatus = status;
}


/**
 * Initializes the Add Task page.
 */
async function initAddTask() {
    await init();
    renderContactOptions();
    
    document.addEventListener('click', function(e) {
        const container = document.getElementById('assignedToContainer');
        if (container && !container.contains(e.target)) {
            document.getElementById('contactDropdown').classList.add('d-none');
            // Remove active class from trigger
            container.querySelector('.custom-select-trigger').classList.remove('active');
        }
    });
}


/**
 * Toggles the visibility of the contact dropdown.
 */
function toggleContactDropdown() {
    let dropdown = document.getElementById('contactDropdown');
    dropdown.classList.toggle('d-none');
    
    // Toggle active state on trigger for blue border/arrow rotation
    let container = document.getElementById('assignedToContainer');
    container.querySelector('.custom-select-trigger').classList.toggle('active');
}


/**
 * Renders the available contact options in the dropdown.
 */
function renderContactOptions() {
    let container = document.getElementById('contactDropdown');
    container.innerHTML = '';
    
    contacts.forEach((contact, index) => {
        let isSelected = selectedContacts.some(c => c.name === contact.name);
        container.innerHTML += getContactOptionHTML(contact, index, isSelected);
    });
}



/**
 * Toggles the selection state of a contact.
 * @param {number} index - Index of the contact in the global array
 */
function toggleContactSelection(index) {
    let contact = contacts[index];
    let existingIndex = selectedContacts.findIndex(c => c.name === contact.name);
    
    if (existingIndex > -1) {
        selectedContacts.splice(existingIndex, 1);
    } else {
        selectedContacts.push(contact);
    }
    
    renderContactOptions();
    renderSelectedBadges();
}


/**
 * Renders the badges for selected contacts.
 */
function renderSelectedBadges() {
    let container = document.getElementById('selectedContactsContainer');
    container.innerHTML = '';
    
    selectedContacts.forEach(contact => {
        container.innerHTML += getSelectedBadgeHTML(contact);
    });
}


/**
 * Generates initials from a name string.
 * @param {string} name 
 * @returns {string} Initials (e.g. "AB")
 */
function getInitials(name) {
    return name.match(/(\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase();
}


/**
 * Sets the priority for the new task.
 * @param {string} prio - 'urgent', 'medium', or 'low'
 */
function setPrio(prio) {
    currentPrio = prio;
    // Reset classes
    ['urgent', 'medium', 'low'].forEach(p => {
        document.getElementById(`prio-${p}`).classList.remove('selected');
    });
    document.getElementById(`prio-${prio}`).classList.add('selected');
}


/**
 * Activates the subtask input (shows check/cancel icons).
 */
function activateSubtaskInput() {
    document.getElementById('subtaskIconPlus').classList.add('d-none');
    document.getElementById('subtaskIconActions').classList.remove('d-none');
}

/**
 * Deactivates the subtask input (shows plus icon).
 */
function deactivateSubtaskInput() {
    setTimeout(() => {
        let input = document.getElementById('subtaskInput');
        if(document.activeElement !== input) {
            document.getElementById('subtaskIconPlus').classList.remove('d-none');
            document.getElementById('subtaskIconActions').classList.add('d-none');
        }
    }, 100);
}

/**
 * Clears the subtask input.
 */
function clearSubtaskInput() {
    document.getElementById('subtaskInput').value = '';
    deactivateSubtaskInput();
}

/**
 * Adds a new subtask.
 */
function addSubtask() {
    let input = document.getElementById('subtaskInput');
    if (input.value.trim() !== '') {
        subtasks.push({ title: input.value, done: false });
        renderSubtasks();
        input.value = '';
        input.focus();
    }
}

/**
 * Handles key interactions (Enter to add).
 * @param {KeyboardEvent} event 
 */
function handleSubtaskKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addSubtask();
    }
}

/**
 * Renders the list of subtasks.
 */
function renderSubtasks() {
    let list = document.getElementById('subtaskList');
    list.innerHTML = '';
    subtasks.forEach((st, index) => {
        list.innerHTML += getSubtaskHTML(st, index);
    });
}

/**
 * Enables edit mode for a subtask.
 * @param {number} index 
 */
function editSubtask(index) {
    let list = document.getElementById('subtaskList');
    let item = list.children[index];
    item.classList.remove('subtask-item');
    item.style.padding = '0';
    item.innerHTML = getEditSubtaskHTML(subtasks[index], index);
    item.querySelector('input').focus();
}

/**
 * Handles key press in edit mode.
 * @param {KeyboardEvent} event 
 * @param {number} index 
 */
function handleEditSubtaskKey(event, index) {
    if(event.key === 'Enter') {
        saveSubtaskEdit(index);
    }
}

/**
 * Saves the edited subtask.
 * @param {number} index 
 */
function saveSubtaskEdit(index) {
    let input = document.getElementById(`editSubtask-${index}`);
    if(input.value.trim() !== '') {
        subtasks[index].title = input.value;
        renderSubtasks();
    } else {
        deleteSubtask(index);
    }
}

/**
 * Deletes a subtask.
 * @param {number} index 
 */
function deleteSubtask(index) {
    subtasks.splice(index, 1);
    renderSubtasks();
}


/**
 * Clears the form inputs and resets state.
 */
function clearForm() {
    document.querySelector('form').reset();
    subtasks = [];
    renderSubtasks();
    setPrio('medium');
    currentTargetStatus = 'todo';
}

/**
 * Handles the form submission to create a new task.
 * @param {Event} event - The form submission event
 */
async function addTask(event) {
    event.preventDefault();
    let title = document.getElementById('taskTitle');
    let date = document.getElementById('taskDueDate');
    let category = document.getElementById('taskCategory');
    
    resetErrors(title, date, category);

    if (!validateTaskForm(title, date, category)) return;

    disableSubmitButton();
    let newTask = createTaskObject(title, date, category);
    await saveTask(newTask); // Ensure it's saved before redirect
    handleTaskSuccess();
}


/**
 * Resets the error styling on form inputs.
 * @param {...HTMLElement} elements - The input elements to reset
 */
function resetErrors(...elements) {
    elements.forEach(el => el.classList.remove('input-error'));
}


/**
 * Validates the required task fields.
 * @param {HTMLElement} title - Title input
 * @param {HTMLElement} date - Date input
 * @param {HTMLElement} category - Category select
 * @returns {boolean} True if valid
 */
function validateTaskForm(title, date, category) {
    let isValid = true;
    if (!checkInput(title)) isValid = false;
    if (!checkInput(date)) isValid = false;
    if (!checkInput(category, 'change')) isValid = false;
    return isValid;
}


/**
 * Checks a single input and applies error styling if empty.
 * @param {HTMLElement} element - The input to check
 * @param {string} eventType - The event to listen for to clear error (default 'input')
 * @returns {boolean} True if valid
 */
function checkInput(element, eventType = 'input') {
    if (element.value.trim() === '') {
        element.classList.add('input-error');
        element.addEventListener(eventType, () => element.classList.remove('input-error'), {once: true});
        return false;
    }
    return true;
}


/**
 * Disables the submit button to prevent double submission.
 */
function disableSubmitButton() {
    let submitBtn = document.querySelector('button[type="submit"]');
    if(submitBtn) submitBtn.disabled = true;
}


/**
 * Assembles the task object from form data.
 * @param {HTMLElement} title - Title input
 * @param {HTMLElement} date - Date input
 * @param {HTMLElement} category - Category select
 * @returns {Object} The new task object
 */
function createTaskObject(title, date, category) {
    return {
        id: new Date().getTime(),
        title: title.value,
        description: document.getElementById('taskDescription').value,
        category: category.value,
        dueDate: date.value,
        priority: currentPrio,
        assignedTo: selectedContacts,
        subtasks: subtasks,
        status: currentTargetStatus
    };
}




/**
 * Shows success message and redirects to board.
 */
function handleTaskSuccess() {
    let message = editingTaskId ? "Task saved" : "Task added to board";
    showToast(message);
    
    // Check if we are inside the modal on the board
    let modalOverlay = document.getElementById('add-task-modal-overlay');
    
    if (modalOverlay) {
        // We are on the board with modal
        setTimeout(() => {
            closeAddTaskModal();
            renderTasks(); // Refresh board
            clearForm(); // Cleanup
        }, 1000);
    } else {
        // Standard redirect
        setTimeout(() => {
            window.location.href = 'board.html';
        }, 1000);
    }
}
