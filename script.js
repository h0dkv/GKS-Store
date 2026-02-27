// 1. Управление на Loader-а
window.addEventListener("load", function() {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.classList.add("loader-hidden");
    }
    
    // Проверка на статус и зареждане на продукти
    checkLoginStatus();
    loadProducts(); 
});

// 2. Инициализация на анимациите
AOS.init({
    duration: 1000,
    once: true
});

// 3. ФУНКЦИЯ ЗА ЗАРЕЖДАНЕ НА ПРОДУКТИ ОТ FIREBASE
async function loadProducts() {
    const container = document.getElementById('products-container');
    
    // Проверяваме дали сме на страницата с продукти (дали контейнерът съществува)
    if (!container) return; 

    try {
        // Взимаме документите от колекция "products"
        const querySnapshot = await window.fb.getDocs(window.fb.collection(window.db, "products"));
        
        // Чистим контейнера от плейсхолдъри
        container.innerHTML = ""; 

        querySnapshot.forEach((doc) => {
            const product = doc.data();
            
            // Генерираме HTML картата за всеки продукт
            const productHTML = `
                <div class="card" data-aos="fade-up">
                    <div class="img-box" style="background-image: url('${product.image || ''}'); background-size: cover; background-position: center;">
                        ${!product.image ? '<span style="color:#333; display:flex; justify-content:center; align-items:center; height:100%;">Няма снимка</span>' : ''}
                    </div>
                    <h3>${product.name}</h3>
                    <p class="price">${Number(product.price).toFixed(2)} €</p>
                    <button class="btn-buy" onclick="addToCart('${doc.id}')">Купи</button>
                </div>
            `;
            container.innerHTML += productHTML;
        });
    } catch (error) {
        console.error("Грешка при зареждане на продуктите:", error);
        container.innerHTML = "<p>Грешка при зареждане на каталога.</p>";
    }
}

// 4. Проверка на Логин Статус
function checkLoginStatus() {
    window.fb.onStateChange(window.auth, (user) => {
        const authStatus = document.getElementById('auth-status');
        if (user && authStatus) {
            authStatus.innerHTML = `
                <span style="color: var(--cyan); margin-right: 15px;">${user.email}</span>
                <a href="#" id="logoutBtn" style="color: #ff4444; font-size: 12px; cursor:pointer;">[Изход]</a>
            `;
            document.getElementById('logoutBtn').addEventListener('click', (e) => {
                e.preventDefault();
                window.fb.logOut(window.auth).then(() => location.reload());
            });
        }
    });
}

// 5. Логика за Регистрация и Вход
const regForm = document.getElementById('registerForm');
if (regForm) {
    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = regForm.querySelector('input[type="email"]').value;
        const password = regForm.querySelector('input[type="password"]').value;
        window.fb.createUser(window.auth, email, password)
            .then(() => window.location.href = 'index.html')
            .catch((err) => alert("Грешка: " + err.message));
    });
}

const logForm = document.getElementById('loginForm');
if (logForm) {
    logForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = logForm.querySelector('input[type="email"]').value;
        const password = logForm.querySelector('input[type="password"]').value;
        window.fb.signIn(window.auth, email, password)
            .then(() => window.location.href = 'index.html')
            .catch((err) => alert("Грешен имейл или парола!"));
    });
}

// Функция за количка (за момента само лог)
window.addToCart = function(productId) {
    console.log("Добавен продукт с ID: " + productId);
    alert("Продуктът е добавен в количката!");
};