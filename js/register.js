/**
 * Handles the signup form submission.
 * @param {Event} event 
 */
async function handleSignup(event) {
    event.preventDefault();
    
    let name = document.getElementById('signupName').value;
    let email = document.getElementById('signupEmail').value;
    let password = document.getElementById('signupPassword').value;
    let confirmPassword = document.getElementById('signupConfirm').value;
    let privacy = document.getElementById('privacyAccept');

    // Basic Client-side Validation
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    if (!privacy.checked) {
        alert("Please accept the privacy policy."); // Should be handled by 'required' attr but good backup
        return;
    }
    
    // Disable button
    let btn = event.target.querySelector('button');
    btn.disabled = true;
    btn.innerText = "Signing up...";

    // Call storage registration
    let result = await registerUser(name, email, password);

    if (result.success) {
        // AUTOMATICALLY CREATE CONTACT FOR USER (User Story 5)
        // We need to access createContact logic. 
        // Since register.js is likely loaded with storage.js, we can use saveContactData directly.
        // But createContact is in contacts.js. 
        // We'll reimplement specific logic here or rely on storage helpers.
        // Better: Use a helper in storage.js or just construct object.
        let newContact = {
            id: new Date().getTime(),
            name: name,
            email: email,
            phone: 'User Profile', // Default or empty?
            color: '#29ABE2', // Default color
            initials: name.match(/(\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase()
        };
        await saveContactData(newContact);
        // -----------------------------------------------------

        // Show success animation or toast
        showSuccessAnimation();
        setTimeout(() => {
            window.location.href = '../index.html?msg=registered';
        }, 1500);
    } else {
        alert("Registration failed: " + result.message);
        btn.disabled = false;
        btn.innerText = "Sign Up";
    }
}


/**
 * Shows a simple success overlay/animation.
 */
function showSuccessAnimation() {
    let overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.backgroundColor = '#2A3647';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.gap = '20px';
    
    overlay.innerHTML = `
        <div style="animation: flyIn 0.5s ease-out;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12L9 16L19 6" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <h2 style="font-family:'Inter', sans-serif; color: white;">You Signed Up successfully</h2>
    `;
    document.body.appendChild(overlay);
}


/* --- Live Validation --- */

document.addEventListener('DOMContentLoaded', () => {
    // Only run on signup page
    if(document.getElementById('signupName')) {
        let inputs = ['signupName', 'signupEmail', 'signupPassword', 'signupConfirm', 'privacyAccept'];
        inputs.forEach(id => {
            let el = document.getElementById(id);
            if(el) {
                el.addEventListener('input', validateSignupForm);
                el.addEventListener('change', validateSignupForm);
            }
        });
        
        // Initial check
        validateSignupForm();
    }
});

/**
 * Checks if all required fields are filled and valid.
 */
function validateSignupForm() {
    let name = document.getElementById('signupName').value.trim();
    let email = document.getElementById('signupEmail').value.trim();
    let pass = document.getElementById('signupPassword').value.trim();
    let confirm = document.getElementById('signupConfirm').value.trim();
    let privacy = document.getElementById('privacyAccept').checked;
    
    let submitBtn = document.querySelector('button[type="submit"]');
    if(!submitBtn) return;

    let isValid = name.length > 0 && 
                  email.length > 0 && 
                  email.includes('@') && // Basic check, HTML5 handles more
                  pass.length > 0 && 
                  confirm.length > 0 &&
                  pass === confirm &&
                  privacy;

    submitBtn.disabled = !isValid;
}
