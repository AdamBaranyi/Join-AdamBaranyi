


/**
 * Initializes the application.
 */
async function init() {
  try {
      checkAuth(); // Protect private pages
      
      // Start loading data and HTML in parallel to speed up UI
      let storagePromise = initStorage(); // Load data from Firebase
      await includeHTML(); // Wait for templates (sidebar, header)
      
      updateHeaderProfile(); // Set user initials in header
      highlightActiveNav();
      injectRotateWarning();
      
      await storagePromise; // Ensure data is ready for page specific logic
  } catch(e) {
      console.warn('Init failed:', e);
  } finally {
      // Always show page content even if errors occur
      document.body.classList.add('show');
  }
}

/**
 * Checks authentication and redirects if necessary.
 */
function checkAuth() {
    let path = window.location.pathname;
    let page = path.split("/").pop();
    
    // Allow access to login, signup, and legal pages
    let publicPages = ['index.html', '', 'signup.html', 'privacy_policy.html', 'legal_notice.html'];
    
    if (publicPages.includes(page)) return;
    
    let user = JSON.parse(sessionStorage.getItem('current_user')) || JSON.parse(localStorage.getItem('current_user'));
    if (!user) {
        window.location.href = '../index.html';
    }
}


/**
 * Injects the rotate warning overlay.
 */
function injectRotateWarning() {
  if (!document.getElementById('rotate-warning')) {
      let warning = document.createElement('div');
      warning.id = 'rotate-warning';
      warning.innerHTML = '<span>Please rotate your device to portrait mode.</span>';
      document.body.appendChild(warning);
  }
}


/**
 * Includes HTML templates into elements with the 'w3-include-html' attribute.
 */
async function includeHTML() {
  let includeElements = document.querySelectorAll("[w3-include-html]");
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    await loadTemplate(element);
  }
}


/**
 * Loads a single template file into an element.
 * @param {HTMLElement} element 
 */
async function loadTemplate(element) {
    const file = element.getAttribute("w3-include-html");
    try {
      let resp = await fetch(file);
      if (resp.ok) {
        element.innerHTML = await resp.text();
      } else {
        element.innerHTML = "Page not found";
      }
    } catch (e) {
      console.error("Error including HTML:", e);
    }
}


/**
 * Highlights the active sidebar navigation item.
 */
function highlightActiveNav() {
    const page = window.location.pathname.split("/").pop();
    const navMap = getNavMap();
    const activeIds = navMap[page];
    
    if (activeIds) {
        activeIds.forEach(activateElement);
    }
}


/**
 * Returns the mapping of pages to nav IDs.
 * @returns {Object} Nav map
 */
function getNavMap() {
    return {
        "summary.html": ["nav-summary", "mobile-nav-summary"],
        "add_task.html": ["nav-add_task", "mobile-nav-add_task"],
        "board.html": ["nav-board", "mobile-nav-board"],
        "contacts.html": ["nav-contacts", "mobile-nav-contacts"],
        "legal_notice.html": ["nav-legal", "mobile-nav-legal"],
        "privacy_policy.html": ["nav-privacy", "mobile-nav-privacy"]
    };
}


/**
 * Activates a navigation element by ID.
 * @param {string} id 
 */
function activateElement(id) {
    const activeEl = document.getElementById(id);
    if (activeEl) {
        activeEl.classList.add("active");
    }
}


/**
 * Toggles the header dropdown menu.
 */
function toggleDropdown() {
    let dropdown = document.getElementById('headerDropdown');
    dropdown.classList.toggle('d-none');
}


/**
 * Logs the user out.
 * @param {Event} event 
 */
function logout(event) {
    event.stopPropagation();
    sessionStorage.removeItem('current_user');
    localStorage.removeItem('current_user');
    window.location.href = '../index.html'; 
}


/**
 * Displays a toast message.
 * @param {string} message 
 */
function showToast(message) {
    let toast = getToastElement();
    updateToastContent(toast, message);
    showToastElement(toast);
}


/**
 * Gets or creates the toast element.
 * @returns {HTMLElement} Toast element
 */
function getToastElement() {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast-message';
        document.body.appendChild(toast);
    }
    return toast;
}


/**
 * Updates toast content.
 * @param {HTMLElement} toast 
 * @param {string} message 
 */
function updateToastContent(toast, message) {
    toast.innerHTML = `<span>${message}</span>`;
}


/**
 * Shows the toast and hides it after delay.
 * @param {HTMLElement} toast 
 */
function showToastElement(toast) {
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Updates the header profile badge with user initials.
 */
function updateHeaderProfile() {
    let user = JSON.parse(sessionStorage.getItem('current_user')) || JSON.parse(localStorage.getItem('current_user'));
    let initials = 'G';
    
    if (user && user.name && user.name !== 'Guest') { 
        let nameParts = user.name.trim().split(' ');
        if (nameParts.length > 1) {
            initials = nameParts[0][0] + nameParts[1][0];
        } else if (nameParts.length === 1 && nameParts[0].length > 0) {
            initials = nameParts[0][0]; 
        }
    }
    
    let avatar = document.querySelector('.user-avatar');
    if (avatar) {
        avatar.textContent = initials.toUpperCase();
    }
}
