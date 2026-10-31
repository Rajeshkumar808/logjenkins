const authView = document.getElementById("authView");
const welcomeView = document.getElementById("welcomeView");
const authForm = document.getElementById("authForm");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const submitButton = document.getElementById("submitButton");
const switchPrompt = document.getElementById("switchPrompt");
const switchButton = document.getElementById("switchButton");
const message = document.getElementById("message");
const welcomeHeading = document.getElementById("welcomeHeading");
const logoutButton = document.getElementById("logoutButton");

let isRegistering = false;

function showMessage(text, isError = true) {
    message.textContent = text;
    message.style.color = isError ? "#c62828" : "#168348";
}

function setFormMode(registerMode) {
    isRegistering = registerMode;
    authForm.reset();
    showMessage("");

    formTitle.textContent = registerMode
        ? "Create account"
        : "Welcome back";

    formSubtitle.textContent = registerMode
        ? "Register a new account"
        : "Login to your account";

    submitButton.textContent = registerMode ? "Register" : "Login";

    switchPrompt.textContent = registerMode
        ? "Already have an account?"
        : "Don't have an account?";

    switchButton.textContent = registerMode ? "Login" : "Register";

    passwordInput.autocomplete = registerMode
        ? "new-password"
        : "current-password";
}

switchButton.addEventListener("click", () => {
    setFormMode(!isRegistering);
});

authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage("");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
        showMessage(
            "Username must be 3-30 characters using letters, numbers, and underscores."
        );
        return;
    }

    if (
        password.length < 8 ||
        new TextEncoder().encode(password).length > 72
    ) {
        showMessage("Password must be at least 8 characters and no more than 72 bytes.");
        return;
    }

    const registeringAtSubmit = isRegistering;
    const endpoint = registeringAtSubmit
        ? "/api/register"
        : "/api/login";

    submitButton.disabled = true;
    submitButton.textContent = registeringAtSubmit
        ? "Registering..."
        : "Logging in...";

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            showMessage(data.message || "Request failed.");
            return;
        }

        if (registeringAtSubmit) {
            setFormMode(false);
            usernameInput.value = username;
            showMessage(
                "Registration successful! Please log in.",
                false
            );
            return;
        }

        welcomeHeading.textContent = "Hello @" + data.user.username;
        authView.hidden = true;
        welcomeView.hidden = false;

    } catch (error) {
        console.error(error);
        showMessage(
            "Cannot connect to the server. Check that Node.js and MongoDB are running."
        );
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = isRegistering ? "Register" : "Login";
    }
});

logoutButton.addEventListener("click", () => {
    welcomeView.hidden = true;
    authView.hidden = false;
    setFormMode(false);
});
