/**
 * Initializes the login page (checks for "Remember Me").
 */
async function init() {
    await loadUsers(); // Load users from Firebase
    checkRememberMe();
}

/**
 * Handles the login form submission.
 * @param {Event} event 
 */
async function handleLogin(event) {
    event.preventDefault();
    
    let email = document.getElementById('loginEmail').value;
    let password = document.getElementById('loginPassword').value;
    let rememberMe = document.getElementById('rememberMe').checked;

    let user = users.find(u => u.email === email && u.password === password);

    if (user) {
        if (rememberMe) {
            localStorage.setItem('join_user_email', email);
            localStorage.setItem('join_user_password', password); // In real app: Token!
        } else {
            localStorage.removeItem('join_user_email');
            localStorage.removeItem('join_user_password');
        }
        
        sessionStorage.setItem('current_user', JSON.stringify(user));
        window.location.href = 'html/summary.html';
    } else {
        alert("E-Mail oder Passwort falsch! (Hast du dich registriert?)");
    }
}


/**
 * Pre-fills email if "Remember Me" was used.
 */
function checkRememberMe() {
    let email = localStorage.getItem('join_user_email');
    let password = localStorage.getItem('join_user_password');
    if(email && password) {
        let emailInput = document.getElementById('loginEmail');
        let passInput = document.getElementById('loginPassword');
        let checkbox = document.getElementById('rememberMe');
        
        if(emailInput) emailInput.value = email;
        if(passInput) passInput.value = password;
        if(checkbox) checkbox.checked = true;
    }
}


/**
 * Logs in as a guest.
 */
function guestLogin() {
    sessionStorage.setItem('current_user', JSON.stringify({ name: 'Guest', email: 'guest@join.com' }));
    window.location.href = 'html/summary.html';
}

/**
 * Toggles password visibility.
 */
function togglePasswordVisibility() {
    let input = document.getElementById('loginPassword');
    let icon = document.getElementById('passwordToggle');
    
    if (input.type === 'password') {
        input.type = 'text';
        // Open Eye (Visible)
        icon.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>`;
    } else {
        input.type = 'password';
        // Show "Eye Off" (Slash)
        icon.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>`;
    }
}
