// ========================================
// LOGIN & REGISTER MODAL SYSTEM
// ========================================

const loginModal = `
<!-- Login Modal -->
<div id="loginModal" class="modal">
  <div class="modal-content">
    <span class="close-login">&times;</span>
    <h2>Login</h2>
    <input type="email" id="loginEmail" placeholder="Email">
    <input type="password" id="loginPassword" placeholder="Password">
    <button id="submitLogin">Masuk</button>
    <p id="loginError" class="error-message"></p>
    <p class="modal-footer">
      Belum punya akun? <a href="#" id="switchToRegister">Daftar di sini</a>
    </p>
  </div>
</div>
`;

const registerModal = `
<!-- Register Modal -->
<div id="registerModal" class="modal">
  <div class="modal-content">
    <span class="close-register">&times;</span>
    <h2>Register</h2>
    <input type="text" id="username" placeholder="Username">
    <input type="email" id="email" placeholder="Email">
    <input type="password" id="password" placeholder="Password">
    <input type="password" id="confirmPassword" placeholder="Confirm Password">
    <button id="submitRegister">Daftar</button>
    <p id="registerError" class="error-message"></p>
    <p class="modal-footer">
      Sudah punya akun? <a href="#" id="switchToLogin">Login di sini</a>
    </p>
  </div>
</div>
`;

// ========================================
// INJECT MODALS KE BODY
// ========================================

function initModals() {
    const body = document.querySelector("body");
    
    // Inject kedua modal ke body
    body.insertAdjacentHTML("beforeend", loginModal);
    body.insertAdjacentHTML("beforeend", registerModal);
    
    // Setup event listeners
    setupModalEvents();
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupModalEvents() {
    // Get modal elements
    const loginModalEl = document.getElementById("loginModal");
    const registerModalEl = document.getElementById("registerModal");
    
    // Get buttons
    const loginBtn = document.querySelector(".login");
    const closeLoginBtn = document.querySelector(".close-login");
    const closeRegisterBtn = document.querySelector(".close-register");
    
    const switchToRegisterLink = document.getElementById("switchToRegister");
    const switchToLoginLink = document.getElementById("switchToLogin");
    
    const submitLoginBtn = document.getElementById("submitLogin");
    const submitRegisterBtn = document.getElementById("submitRegister");
    
    // ===== OPEN MODALS =====
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            loginModalEl.style.display = "flex";
        });
    }
    
    // ===== CLOSE MODALS =====
    closeLoginBtn.addEventListener("click", () => {
        loginModalEl.style.display = "none";
    });
    
    closeRegisterBtn.addEventListener("click", () => {
        registerModalEl.style.display = "none";
    });
    
    // Close when clicking outside modal
    window.addEventListener("click", (e) => {
        if (e.target === loginModalEl) {
            loginModalEl.style.display = "none";
        }
        if (e.target === registerModalEl) {
            registerModalEl.style.display = "none";
        }
    });
    
    // ===== SWITCH BETWEEN MODALS =====
    switchToRegisterLink.addEventListener("click", (e) => {
        e.preventDefault();
        loginModalEl.style.display = "none";
        registerModalEl.style.display = "flex";
    });
    
    switchToLoginLink.addEventListener("click", (e) => {
        e.preventDefault();
        registerModalEl.style.display = "none";
        loginModalEl.style.display = "flex";
    });
    
    // ===== SUBMIT HANDLERS =====
    submitLoginBtn.addEventListener("click", handleLogin);
    submitRegisterBtn.addEventListener("click", handleRegister);
    
    // Enter key support
    document.getElementById("loginPassword").addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleLogin();
    });
    
    document.getElementById("confirmPassword").addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleRegister();
    });
}

// ========================================
// LOGIN HANDLER
// ========================================

async function handleLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errorEl = document.getElementById("loginError");
    
    // Validation
    if (!email || !password) {
        errorEl.textContent = "⚠️ Email dan password harus diisi!";
        return;
    }
    
    try {
        // TODO: Replace dengan Supabase auth
        const response = await fetch("api/login.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            errorEl.textContent = "";
            alert("✅ Login berhasil!");
            document.getElementById("loginModal").style.display = "none";
            
            // Save session
            localStorage.setItem("user", JSON.stringify(data.user));
            
            // Reload or redirect
            window.location.reload();
        } else {
            errorEl.textContent = "❌ " + (data.message || "Login gagal!");
        }
        
    } catch (error) {
        console.error("Login error:", error);
        errorEl.textContent = "❌ Terjadi kesalahan. Coba lagi.";
    }
}

// ========================================
// REGISTER HANDLER
// ========================================

async function handleRegister() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorEl = document.getElementById("registerError");
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
        errorEl.textContent = "⚠️ Semua field harus diisi!";
        return;
    }
    
    if (password !== confirmPassword) {
        errorEl.textContent = "⚠️ Password tidak cocok!";
        return;
    }
    
    if (password.length < 6) {
        errorEl.textContent = "⚠️ Password minimal 6 karakter!";
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorEl.textContent = "⚠️ Email tidak valid!";
        return;
    }
    
    try {
        // TODO: Replace dengan Supabase auth
        const response = await fetch("api/register.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            errorEl.textContent = "";
            alert("✅ Registrasi berhasil! Silakan login.");
            
            // Switch to login modal
            document.getElementById("registerModal").style.display = "none";
            document.getElementById("loginModal").style.display = "flex";
            
            // Pre-fill email
            document.getElementById("loginEmail").value = email;
        } else {
            errorEl.textContent = "❌ " + (data.message || "Registrasi gagal!");
        }
        
    } catch (error) {
        console.error("Register error:", error);
        errorEl.textContent = "❌ Terjadi kesalahan. Coba lagi.";
    }
}

// ========================================
// INITIALIZE
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    initModals();
});