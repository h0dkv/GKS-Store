// 1. Управление на Loader-а
window.addEventListener("load", function () {
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
window.addToCart = function (productId) {
    console.log("Добавен продукт с ID: " + productId);
    alert("Продуктът е добавен в количката!");
};

// Логика за добавяне на продукти (Админ Панел)
const addProductForm = document.getElementById('addProductForm');

if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Взимаме данните от полетата
        const name = document.getElementById('prodName').value;
        const price = parseFloat(document.getElementById('prodPrice').value);
        const image = document.getElementById('prodImage').value;

        try {
            // Записваме в Firestore колекция "products"
            await window.fb.addDoc(window.fb.collection(window.db, "products"), {
                name: name,
                price: price,
                image: image,
                createdAt: new Date() // Добавяме и дата на създаване
            });

            alert("Продуктът е добавен успешно в €!");
            addProductForm.reset(); // Изчистваме формата
        } catch (error) {
            console.error("Грешка при добавяне:", error);
            alert("Възникна грешка: " + error.message);
        }
    });
}

let cart = [];

// Отваряне/Затваряне на количката
const cartIcon = document.getElementById('cart-icon');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCart = document.getElementById('close-cart');

if (cartIcon) cartIcon.onclick = () => cartSidebar.classList.add('active');
if (closeCart) closeCart.onclick = () => cartSidebar.classList.remove('active');

// Функция за добавяне в количката (Обновена)
window.addToCart = function (productId) {
    // В реална ситуация тук ще вземем данните от Firestore
    // За момента симулираме добавяне за бързина на интерфейса
    // Но най-добре е да подадем обекта:
    alert("Продуктът е добавен!");
    updateCart(productId);
};

function updateCart(id) {
    cart.push(id);
    document.getElementById('cart-count').innerText = cart.length;
    // Тук може да се добави по-сложна логика за визуализация на имената
}

// БУТОН ПЛАЩАНЕ
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
        const user = window.auth.currentUser;

        if (!user) {
            alert("Моля, влезте в акаунта си, за да направите поръчка!");
            window.location.href = 'login.html';
            return;
        }

        if (cart.length === 0) {
            alert("Количката е празна!");
            return;
        }

        try {
            // Записваме поръчката в нова колекция "orders"
            await window.fb.addDoc(window.fb.collection(window.db, "orders"), {
                userEmail: user.email,
                userId: user.uid,
                items: cart,
                status: "Pending",
                date: new Date()
            });

            alert("Поръчката е изпратена успешно! Ще се свържем с вас.");
            cart = []; // Нулираме количката
            document.getElementById('cart-count').innerText = "0";
            cartSidebar.classList.remove('active');

        } catch (error) {
            console.error("Грешка при поръчка:", error);
            alert("Грешка при плащането.");
        }
    });
}