/**
 * Redirects to the board page.
 */
function goToBoard() {
    window.location.href = 'board.html';
}


/**
 * Initializes the summary page.
 */
async function initSummary() {
    // Wait for main init to likely finish or just wait a bit?
    // Better: let's rely on tasks variable exposed by storage.js.
    // If init() in script.js is running, tasks might not be ready.
    // Let's create a listener or just retry.
    // Simple fix: simple timeout or check.
    // Actually, script.js init() awaits initStorage().
    // If we call initSummary after init... 
    // HTML: onload="init(); initSummary()". They run contentiously.
    
    // I will call updateMetrics directly but wrap in checks.
    updateGreeting();
    
    // Safety delay to ensure storage loaded from main init
    setTimeout(updateSummaryMetrics, 500); 
}

/**
 * Updates task metrics on the dashboard.
 */
function updateSummaryMetrics() {
    let allTasks = getTasks(); // from storage.js
    
    let todo = allTasks.filter(t => t.status === 'todo').length;
    let done = allTasks.filter(t => t.status === 'done').length;
    let inProgress = allTasks.filter(t => t.status === 'inprogress').length;
    let awaitFeedback = allTasks.filter(t => t.status === 'awaitfeedback').length;
    let urgent = allTasks.filter(t => t.priority === 'urgent').length;
    let total = allTasks.length;
    
    // Update DOM (Using classes for now, assuming order or unqiue context)
    document.querySelector('.todo-card .number').textContent = todo;
    document.querySelector('.done-card .number').textContent = done;
    
    // Urgent
    document.querySelector('.urgent-card .urgent-left .number').textContent = urgent;
    
    // Urgent Date: Find earliest urgent due date
    let urgentTasks = allTasks.filter(t => t.priority === 'urgent' && t.dueDate);
    let earliestDate = '-';
    if (urgentTasks.length > 0) {
        // Sort by date
        urgentTasks.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
        // Format date: "October 16, 2026"
        let d = new Date(urgentTasks[0].dueDate);
        earliestDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    document.querySelector('.urgent-card .date-bold').textContent = earliestDate;
    
    // Small cards (Indices match layout: Board, Progress, Feedback)
    let smallCards = document.querySelectorAll('.metric-card-small .number');
    if (smallCards.length >= 3) {
        smallCards[0].textContent = total; // Tasks in Board
        smallCards[1].textContent = inProgress; // Tasks in Progress
        smallCards[2].textContent = awaitFeedback; // Awaiting Feedback
    }
}


/**
 * Updates the greeting text based on the time of day.
 */
function updateGreeting() {
    let greetingElement = document.querySelector('.greeting-time');
    let nameElement = document.querySelector('.greeting-name');
    let hour = new Date().getHours();
    let greetingText;

    if (hour < 12) {
        greetingText = 'Good morning,';
    } else if (hour < 18) {
        greetingText = 'Good afternoon,';
    } else {
        greetingText = 'Good evening,';
    }

    if (greetingElement) greetingElement.textContent = greetingText;
    
    // Get user from storage
    let user = JSON.parse(sessionStorage.getItem('current_user')) || JSON.parse(localStorage.getItem('current_user'));
    let userName = 'Guest';
    
    if (user && user.name) {
        userName = user.name;
    }
    
    if (nameElement) nameElement.textContent = userName;
}
