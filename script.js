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
            // Вътре в цикъла querySnapshot.forEach((doc) => { ... })
            const productHTML = `
    <div class="card" data-aos="fade-up">
        <div class="img-box" style="background-image: url('${product.image || ''}');"></div>
        <h3>${product.name}</h3>
        <p class="price">${Number(product.price).toFixed(2)} €</p>
        
        <select id="size-${doc.id}" class="input-field" style="margin-bottom: 10px; padding: 5px;">
            <option value="">Избери размер</option>
            <option value="7">Размер 7</option>
            <option value="8">Размер 8</option>
            <option value="9">Размер 9</option>
            <option value="10">Размер 10</option>
            <option value="11">Размер 11</option>
        </select>

        <button class="btn-buy" onclick="addToCartWithSize('${doc.id}', '${product.name}', ${product.price})">Добави в количката</button>
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
        if (!authStatus) return;

        if (user) {
            // АКО ИМА ЛОГНАТ ПОТРЕБИТЕЛ
            const isAdmin = user.email === "твой-админ-имейл@gmail.com";

            authStatus.innerHTML = `
                <div class="user-menu">
                    <a href="#" class="login-btn">👤 Моят Профил</a>
                    <div class="dropdown-content">
                        ${isAdmin ? '<a href="admin.html">Админ Панел</a>' : ''}
                        <a href="orders.html">Моите Поръчки</a>
                        <a href="#" id="logoutBtn">Изход</a>
                    </div>
                </div>
            `;

            // Логика за излизане
            document.getElementById('logoutBtn').addEventListener('click', (e) => {
                e.preventDefault();
                window.fb.logOut(window.auth).then(() => {
                    window.location.href = "index.html";
                });
            });
        } else {
            // АКО НЯМА ЛОГНАТ ПОТРЕБИТЕЛ
            authStatus.innerHTML = `<a href="login.html" class="login-btn">Вход</a>`;
        }
    });
}
// Примерна функция за вход в script.js
window.loginUser = async (email, password) => {
    try {
        await window.fb.signIn(window.auth, email, password);
        // ПРЕНАСОЧВАНЕ КЪМ НАЧАЛНАТА СТРАНИЦА ПРИ УСПЕХ
        window.location.href = "index.html";
    } catch (error) {
        alert("Грешка при вход: " + error.message);
    }
};
ч

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
            9            alert("Възникна грешка: " + error.message);
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

window.addToCartWithSize = function (id, name, price) {
    const sizeElement = document.getElementById(`size-${id}`);
    const selectedSize = sizeElement.value;

    if (!selectedSize) {
        alert("Моля, избери размер преди да добавиш в количката!");
        return;
    }

    const item = {
        id: id,
        name: name,
        price: price,
        size: selectedSize
    };

    cart.push(item);
    updateCartUI(); // Функция, която обновява брояча и списъка в страничния панел
    alert(`Добавихте ${name} (Размер: ${selectedSize}) в количката.`);
};

async function loadUserOrders(user) {
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;

    try {
        // Трябва да имаш query и where експортирани в firebase-config.js
        const q = window.fb.query(
            window.fb.collection(window.db, "orders"),
            window.fb.where("userId", "==", user.uid)
        );

        const querySnapshot = await window.fb.getDocs(q);
        ordersContainer.innerHTML = '';

        if (querySnapshot.empty) {
            ordersContainer.innerHTML = '<p style="text-align:center; opacity:0.5;">Все още нямате направени поръчки.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const order = doc.data();
            const date = order.date ? new Date(order.date.seconds * 1000).toLocaleDateString() : 'Няма дата';

            // Генерираме имената на продуктите (ако са обекти в масива items)
            const itemsSummary = order.items.map(item => `${item.name} (Размер: ${item.size})`).join(', ');

            ordersContainer.innerHTML += `
                <div class="order-card" data-aos="fade-up">
                    <div class="order-info">
                        <h3>Поръчка #${doc.id.substring(0, 6)}</h3>
                        <p>Дата: ${date}</p>
                        <div class="order-items-list">Продукти: ${itemsSummary}</div>
                    </div>
                    <div class="order-status">${order.status || 'В обработка'}</div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Грешка при зареждане на поръчки:", error);
        ordersContainer.innerHTML = '<p>Грешка при зареждане.</p>';
    }
}

// Обнови проверката на състоянието, за да извиква зареждането на поръчки
window.fb.onStateChange(window.auth, (user) => {
    if (user && window.location.pathname.includes('orders.html')) {
        loadUserOrders(user);
    }
});