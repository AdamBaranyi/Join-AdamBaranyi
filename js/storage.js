const STORAGE_TOKEN = 'YOUR_TOKEN'; 
const STORAGE_URL = 'YOUR_URL';

const BASE_URL = "https://join-app-adambaranyi-default-rtdb.europe-west1.firebasedatabase.app"; 

let tasks = [];
let contacts = [];

/**
 * Initializes the storage by loading data from the server.
 */
/**
 * Initializes the storage by loading data from the server.
 */
async function initStorage() {
    let user = sessionStorage.getItem('current_user');
    if (user) {
        let userData = JSON.parse(user);
        if (userData.email === 'guest@join.com') {
            tasks = getDemoTasks();
            contacts = getDemoContacts();
            return;
        }
    }
    await loadData();
}

/* --- DEMO DATA --- */

function getDemoTasks() {
    return [
        {
            id: 101,
            title: "Website redesign",
            description: "Modify structure of sidebar and header",
            category: "Technical Task",
            priority: "urgent",
            dueDate: "2026-03-15",
            status: "todo",
            assignedTo: [ { name: "Anton Mayer", color: "#FF7A00" }, { name: "Anja Schulz", color: "#9327FF" } ],
            subtasks: [ { title: "New Icons", done: false }, { title: "HTML Structure", done: true } ]
        },
        {
            id: 102,
            title: "Call potential clients",
            description: "Make the product presentation to prospective buyers",
            category: "User Story",
            priority: "low",
            dueDate: "2026-04-01",
            status: "inprogress",
            assignedTo: [ { name: "Benedikt Ziegler", color: "#6E52FF" } ],
            subtasks: []
        },
        {
            id: 103,
            title: "Video Cutting",
            description: "Edit the new company video for the homepage",
            category: "Technical Task",
            priority: "medium",
            dueDate: "2026-02-28",
            status: "awaitfeedback",
            assignedTo: [ { name: "David Eisenberg", color: "#FC71FF" }, { name: "Eva Fischer", color: "#FFBB2B" } ],
            subtasks: []
        },
        {
            id: 104,
            title: "Accounting invoices",
            description: "Check pending invoices and send to customers",
            category: "Technical Task",
            priority: "urgent",
            dueDate: "2026-01-30",
            status: "done",
            assignedTo: [ { name: "Marcel Bauer", color: "#462F8A" } ],
            subtasks: []
        },
        {
            id: 105,
            title: "Social Media Campaign",
            description: "Plan content for next month",
            category: "User Story",
            priority: "low",
            dueDate: "2026-05-15",
            status: "todo",
            assignedTo: [ { name: "Tatjana Wolf", color: "#FF4646" }, { name: "Stefan Wallin", color: "#0038FF" } ],
            subtasks: [ { title: "Create visuals", done: false } ]
        }
    ];
}

function getDemoContacts() {
    return [
        { id: 1, name: "Anton Mayer", email: "anton@gmail.com", phone: "+49 1111 111 11 1", color: "#FF7A00" },
        { id: 2, name: "Anja Schulz", email: "schulz@hotmail.com", phone: "+49 1111 111 11 2", color: "#9327FF" },
        { id: 3, name: "Benedikt Ziegler", email: "benedikt@gmail.com", phone: "+49 1111 111 11 3", color: "#6E52FF" },
        { id: 4, name: "David Eisenberg", email: "davidberg@gmail.com", phone: "+49 1111 111 11 4", color: "#FC71FF" },
        { id: 5, name: "Eva Fischer", email: "eva@gmail.com", phone: "+49 1111 111 11 5", color: "#FFBB2B" },
        { id: 6, name: "Emmanuel Mauer", email: "emmanuelMa@gmail.com", phone: "+49 1111 111 11 6", color: "#1FD7C1" },
        { id: 7, name: "Marcel Bauer", email: "bauer@gmail.com", phone: "+49 1111 111 11 7", color: "#462F8A" },
        { id: 8, name: "Tatjana Wolf", email: "wolf@gmail.com", phone: "+49 1111 111 11 8", color: "#FF4646" },
        { id: 9, name: "Stefan Wallin", email: "stefan@gmail.com", phone: "+49 1111 111 11 9", color: "#0038FF" },
        { id: 10, name: "Rainer Zufall", email: "rainer@gmail.com", phone: "+49 1111 111 11 10", color: "#FF7A00" }
    ];
}

/**
 * Loads tasks and contacts from Firebase.
 */
async function loadData() {
    try {
        let [tasksResponse, contactsResponse] = await Promise.all([
            fetch(BASE_URL + "/tasks.json"),
            fetch(BASE_URL + "/contacts.json")
        ]);

        let tasksData = await tasksResponse.json();
        let contactsData = await contactsResponse.json();

        // Convert object to array (Firebase returns objects with IDs as keys)
        tasks = tasksData ? Object.values(tasksData) : [];
        contacts = contactsData ? Object.values(contactsData) : [];
        
    } catch (error) {
        console.error("Error loading data:", error);
    }
}


/**
 * Returns the current list of tasks.
 * @returns {Array} List of task objects
 */
function getTasks() {
    return tasks;
}


/**
 * Saves a new task to the store and server.
 * @param {Object} task - The task to save
 */
async function saveTask(task) {
    // Update local state immediately for UI responsiveness
    let existingIndex = tasks.findIndex(t => t.id === task.id);
    if (existingIndex > -1) {
        tasks[existingIndex] = task;
    } else {
        tasks.push(task);
    }
    
    // Check Guest
    let user = sessionStorage.getItem('current_user');
    if (user && JSON.parse(user).email === 'guest@join.com') {
        // Guest mode: Local only
        return; 
    }

    // Sync with server
    try {
        let response = await fetch(`${BASE_URL}/tasks/${task.id}.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task)
        });
        if(!response.ok) {
            console.error("Server Error:", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Error saving task:", error);
    }
}


/**
 * Deletes a task from store and server.
 * @param {number} taskId 
 */
async function deleteTaskData(taskId) {
    let index = tasks.findIndex(t => t.id === taskId);
    if (index > -1) {
        tasks.splice(index, 1);
        
        // Check Guest
        let user = sessionStorage.getItem('current_user');
        if (user && JSON.parse(user).email === 'guest@join.com') return;

        try {
            await fetch(`${BASE_URL}/tasks/${taskId}.json`, { method: "DELETE" });
        } catch (e) { console.error(e); }
    }
}


/**
 * Returns the current list of contacts.
 * @returns {Array} List of contact objects
 */
function getContacts() {
    return contacts;
}


/**
 * Save or update a contact.
 * @param {Object} contact 
 */
async function saveContactData(contact) {
    // Generate a simple ID if not present (email based or timestamp)
    if (!contact.id) contact.id = new Date().getTime();

    let existingIndex = contacts.findIndex(c => c.id === contact.id);
    if (existingIndex > -1) {
        contacts[existingIndex] = contact;
    } else {
        contacts.push(contact);
    }

    // Check Guest
    let user = sessionStorage.getItem('current_user');
    if (user && JSON.parse(user).email === 'guest@join.com') return;

    try {
        let response = await fetch(`${BASE_URL}/contacts/${contact.id}.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contact)
        });
        if(!response.ok) {
            console.error("Server Error saving Contact:", response.status, response.statusText);
            alert("Fehler beim Speichern: " + response.status + " " + response.statusText);
        } else {
            console.log("Contact saved to Firebase:", contact);
        }
    } catch (e) { 
        console.error("Network Error:", e);
        alert("Netzwerkfehler: " + e.message);
    }
}


/**
 * Deletes a contact.
 * @param {number} contactId 
 */
async function deleteContactData(contactId) {
    let index = contacts.findIndex(c => c.id === contactId);
    if (index > -1) {
        contacts.splice(index, 1);
        
        // Check Guest
        let user = sessionStorage.getItem('current_user');
        if (user && JSON.parse(user).email === 'guest@join.com') return;

        try {
            await fetch(`${BASE_URL}/contacts/${contactId}.json`, { method: "DELETE" });
        } catch (e) { console.error(e); }
    }
}


/* --- USER AUTHENTICATION (Simulated) --- */

let users = [];

/**
 * Loads users from Firebase.
 */
async function loadUsers() {
    try {
        let response = await fetch(BASE_URL + "/users.json");
        let usersData = await response.json();
        users = usersData ? Object.values(usersData) : [];
    } catch (e) {
        console.error("Error loading users:", e);
    }
}


/**
 * Registers a new user.
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<boolean>} True if successful
 */
async function registerUser(name, email, password) {
    await loadUsers(); // Ensure we have latest data
    
    // Check if email exists
    if (users.some(u => u.email === email)) {
        return { success: false, message: "Email already exists" };
    }

    let newUser = {
        id: new Date().getTime(),
        name: name,
        email: email,
        password: password
    };

    try {
        let response = await fetch(`${BASE_URL}/users/${newUser.id}.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser)
        });
        
        if (response.ok) {
            users.push(newUser);
            return { success: true };
        } else {
            return { success: false, message: "Server error" };
        }
    } catch (e) {
        return { success: false, message: "Network error" };
    }
}
