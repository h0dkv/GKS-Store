// 1. Управление на Loader-а
window.addEventListener("load", function () {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.classList.add("loader-hidden");
    }
    checkLoginStatus(); // Проверяваме дали потребителят е влязъл при зареждане
});

// 2. Инициализация на AOS анимации
AOS.init({
    duration: 1000,
    once: true
});

// 3. Проверка на Логин Статус
function checkLoginStatus() {
    const authStatus = document.getElementById('auth-status');
    const user = localStorage.getItem('currentUser');

    if (user && authStatus) {
        // Ако има влязъл потребител, показваме името му и бутон за Изход
        authStatus.innerHTML = `
            <span style="color: var(--cyan); margin-right: 15px;">Здравей, ${user}</span>
            <a href="#" id="logoutBtn" style="color: #ff4444; font-size: 12px;">[Изход]</a>
        `;

        // Логика за Изход
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            location.reload(); // Презареждаме, за да се върне бутона за Вход
        });
    }
}

// Проверка на статус в реално време
window.fbMethods.onAuthStateChanged(window.auth, (user) => {
    const authStatus = document.getElementById('auth-status');
    if (user && authStatus) {
        authStatus.innerHTML = `
            <span style="color: var(--cyan); margin-right: 15px;">${user.email}</span>
            <a href="#" id="logoutBtn" style="color: #ff4444; font-size: 12px;">[Изход]</a>
        `;
        document.getElementById('logoutBtn').addEventListener('click', () => {
            window.fbMethods.signOut(window.auth);
            location.reload();
        });
    }
});

// Регистрация с Firebase
const regForm = document.getElementById('registerForm');
if (regForm) {
    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = regForm.querySelector('input[type="email"]').value;
        const password = regForm.querySelector('input[type="password"]').value;

        window.fbMethods.createUserWithEmailAndPassword(window.auth, email, password)
            .then(() => {
                alert("Успешна регистрация!");
                window.location.href = 'index.html';
            })
            .catch((error) => alert("Грешка: " + error.message));
    });
}

// Вход с Firebase
const logForm = document.getElementById('loginForm');
if (logForm) {
    logForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = logForm.querySelector('input[type="email"]').value;
        const password = logForm.querySelector('input[type="password"]').value;

        window.fbMethods.signInWithEmailAndPassword(window.auth, email, password)
            .then(() => {
                window.location.href = 'index.html';
            })
            .catch((error) => alert("Грешка: " + error.message));
    });
}