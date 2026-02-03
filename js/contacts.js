/**
 * Initializes the contacts page.
 */
function initContacts() {
    init();
    renderContactList();
}


/**
 * Renders the list of contacts with alphabetical grouping.
 */
function renderContactList() {
    let list = document.getElementById('contactList');
    list.innerHTML = '';
    
    contacts.sort((a,b) => a.name.localeCompare(b.name));
    renderContactGroups(list);
}


/**
 * Renders grouped contacts to the list.
 * @param {HTMLElement} listContainer 
 */
function renderContactGroups(listContainer) {
    let currentLetter = '';
    contacts.forEach(contact => {
        let firstLetter = contact.name.charAt(0).toUpperCase();
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            listContainer.innerHTML += `<div class="contact-group-letter">${currentLetter}</div>`;
        }
        listContainer.innerHTML += generateContactHTML(contact);
    });
}


/**
 * Generates HTML for a contact item.
 * @param {Object} contact 
 * @returns {string} HTML
 */
function generateContactHTML(contact) {
    return `
    <div class="contact-item" onclick="showContactDetails('${contact.email}')">
        <div class="contact-initials" style="background-color: ${contact.color};">${contact.initials}</div>
        <div class="contact-name-mail">
            <span class="contact-name">${contact.name}</span>
            <span class="contact-email">${contact.email}</span>
        </div>
    </div>`;
}


/**
 * Display the details of a specific contact.
 * @param {string} email 
 */
function showContactDetails(email) {
    let contact = contacts.find(c => c.email === email);
    if (!contact) return;

    renderDetailContent(contact);
    highlightActiveContact(email);
    
    document.getElementById('contactDetail').style.display = 'block'; 
}


/**
 * Renders the inner HTML of the detail view.
 * @param {Object} contact 
 */
function renderDetailContent(contact) {
    let content = document.getElementById('contactDetailContent');
    content.innerHTML = `
        ${getDetailHeaderHTML(contact)}
        <div class="contact-info-header">Contact Information</div>
        ${getDetailBodyHTML(contact)}
    `;
}


/**
 * Returns header HTML for contact detail.
 * @param {Object} contact 
 * @returns {string} HTML
 */
function getDetailHeaderHTML(contact) {
    return `
    <div class="contact-header">
        <div class="contact-big-initials" style="background-color: ${contact.color};">${contact.initials}</div>
        <div class="contact-name-section">
            <h2>${contact.name}</h2>
            <div class="contact-actions">
                <a href="#" onclick="editContact('${contact.email}')"><img class="action-icon" src="../assets/img/edit (1).png" alt="Edit">Edit</a>
                <a href="#" onclick="deleteContact('${contact.email}')"><img class="action-icon" src="../assets/img/delete.svg" alt="Delete">Delete</a>
            </div>
        </div>
    </div>`;
}


/**
 * Returns body HTML for contact detail.
 * @param {Object} contact 
 * @returns {string} HTML
 */
function getDetailBodyHTML(contact) {
    return `
    <div class="contact-info-item">
        <span class="label">Email</span>
        <a href="mailto:${contact.email}" class="email-link">${contact.email}</a>
    </div>
    <div class="contact-info-item">
        <span class="label">Phone</span>
        <span>${contact.phone}</span>
    </div>`;
}


/**
 * Highlights the active contact in the sidebar.
 * @param {string} email 
 */
function highlightActiveContact(email) {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('active');
        if(item.querySelector('.contact-email').innerText === email) {
            item.classList.add('active');
        }
    });
}


/**
 * Opens the contact modal for adding a new contact.
 */
function openAddContact() {
    document.getElementById('modal-title').innerText = 'Add contact';
    document.getElementById('modal-subtitle').innerText = 'Tasks are better with a team!';
    document.getElementById('contact-modal-overlay').classList.remove('d-none');
    
    // Reset form
    let form = document.getElementById('contactForm');
    form.reset();
    form.onsubmit = (e) => handleContactSubmit(e, 'create');
}


/**
 * Opens the edit contact modal.
 * @param {string} email - Email of the contact to edit
 */
function editContact(email) {
    let contact = contacts.find(c => c.email === email);
    if(!contact) return;

    document.getElementById('modal-title').innerText = 'Edit contact';
    document.getElementById('modal-subtitle').innerText = '';
    
    document.getElementById('contactName').value = contact.name;
    document.getElementById('contactEmail').value = contact.email;
    document.getElementById('contactPhone').value = contact.phone;

    document.getElementById('contact-modal-overlay').classList.remove('d-none');
    
    let form = document.getElementById('contactForm');
    form.onsubmit = (e) => handleContactSubmit(e, 'edit', email);
}


/**
 * Closes the contact modal.
 */
function closeContactModal() {
    document.getElementById('contact-modal-overlay').classList.add('d-none');
}


/**
 * Handles contact form submission.
 * @param {Event} event 
 * @param {string} mode - 'create' or 'edit'
 * @param {string} oldEmail - The original email (if editing)
 */
function handleContactSubmit(event, mode, oldEmail = null) {
    event.preventDefault();
    let name = document.getElementById('contactName').value;
    let email = document.getElementById('contactEmail').value;
    let phone = document.getElementById('contactPhone').value;

    if (mode === 'create') {
        createContact(name, email, phone);
    } else {
        updateContact(oldEmail, name, email, phone);
    }
    
    closeContactModal();
    renderContactList();
}


/**
 * Creates a new contact.
 * @param {string} name 
 * @param {string} email 
 * @param {string} phone 
 */
function createContact(name, email, phone) {
    let newContact = {
        id: new Date().getTime(), // Ensure ID is generated here
        name: name,
        email: email,
        phone: phone,
        color: getRandomColor(),
        initials: getInitials(name)
    };
    saveContactData(newContact); // Use storage sync
    showToast("Contact successfully created");
    showContactDetails(email);
}


/**
 * Updates an existing contact.
 * @param {string} oldEmail 
 * @param {string} name 
 * @param {string} email 
 * @param {string} phone 
 */
function updateContact(oldEmail, name, email, phone) {
    let contact = contacts.find(c => c.email === oldEmail);
    if(contact) {
        contact.name = name;
        contact.email = email;
        contact.phone = phone;
        contact.initials = getInitials(name);
        saveContactData(contact); // Sync update
        showToast("Contact updated");
        showContactDetails(email);
    }
}


/**
 * Deletes a contact.
 * @param {string} email - Email of the contact to delete
 */
function deleteContact(email) {
    let contact = contacts.find(c => c.email === email);
    if(contact) {
        deleteContactData(contact.id); // Sync delete
        renderContactList();
        document.getElementById('contactDetail').style.display = 'none';
        showToast("Contact deleted");
    }
}


/**
 * Generates a random color for the contact badge.
 * @returns {string} Hex color
 */
function getRandomColor() {
    const colors = ['#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'];
    return colors[Math.floor(Math.random() * colors.length)];
}


/**
 * Gets initials from name.
 * @param {string} name 
 * @returns {string} Initials
 */
function getInitials(name) {
    return name.match(/(\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase();
}
