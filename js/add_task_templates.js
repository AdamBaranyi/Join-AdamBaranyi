/**
 * Generates HTML for a contact option in the dropdown.
 * @param {Object} contact 
 * @param {number} index 
 * @param {boolean} isSelected 
 * @returns {string} HTML string
 */
function getContactOptionHTML(contact, index, isSelected) {
    return `
            <div class="contact-option ${isSelected ? 'selected' : ''}" onclick="toggleContactSelection(${index})">
                <div class="contact-info">
                    <div class="contact-badge-small" style="background-color: ${contact.color};">
                        ${getInitials(contact.name)}
                    </div>
                    <span>${contact.name}</span>
                </div>
                <!-- Checkbox SVG can be swapped with simple unicode or image -->
                <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleContactSelection(${index})">
            </div>
        `;
}

/**
 * Generates HTML for a selected contact badge.
 * @param {Object} contact 
 * @returns {string} HTML string
 */
function getSelectedBadgeHTML(contact) {
    return `
            <div class="contact-badge" style="background-color: ${contact.color};" title="${contact.name}">
                ${getInitials(contact.name)}
            </div>
        `;
}

/**
 * Generates HTML for a subtask list item.
 * @param {Object} st 
 * @param {number} index 
 * @returns {string} HTML string
 */
function getSubtaskHTML(st, index) {
    return `
            <li class="subtask-item" ondblclick="editSubtask(${index})">
                <div class="subtask-text"><span>${st.title}</span></div>
                <div class="subtask-actions">
                    <div onclick="editSubtask(${index})" style="cursor: pointer; display: flex;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="separator-small-vertical"></div>
                    <div onclick="deleteSubtask(${index})" style="cursor: pointer; display: flex;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            </li>`;
}

/**
 * Generates HTML for subtask edit mode.
 * @param {Object} st 
 * @param {number} index 
 * @returns {string} HTML string
 */
function getEditSubtaskHTML(st, index) {
    return `
        <div class="subtask-edit-container">
            <input type="text" class="subtask-edit-input" value="${st.title}" id="editSubtask-${index}" onkeypress="handleEditSubtaskKey(event, ${index})">
            <div class="icon-actions" style="padding-right: 15px;">
                 <div onclick="deleteSubtask(${index})" style="cursor: pointer; padding: 4px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                 </div>
                 <div class="separator-small-vertical"></div>
                 <div onclick="saveSubtaskEdit(${index})" style="cursor: pointer; padding: 4px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                 </div>
            </div>
       </div>`;
}
