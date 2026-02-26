// Инициализация на анимациите
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Пример за обработка на формата за контакти
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Съобщението е изпратено успешно!');
    });
}

// Логика за Регистрация (Симулация)
const regForm = document.getElementById('registerForm');
if (regForm) {
    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = regForm.querySelector('input[type="text"]').value;
        localStorage.setItem('currentUser', username); // Запазва името в браузъра
        alert(`Добре дошъл, ${username}! Акаунтът е създаден.`);
        window.location.href = 'index.html'; // Пренасочва към началната страница
    });
}

// Логика за Вход
const logForm = document.getElementById('loginForm');
if (logForm) {
    logForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Влизане в системата...');
        window.location.href = 'index.html';
    });
}