// --- 1. ГЛОБАЛНИ НАСТРОЙКИ ---
let cart = [];
const ADMIN_EMAIL = "твой-админ-имейл@gmail.com"; // Промени го с твоя

// --- 2. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАРЕЖДАНЕ ---
window.addEventListener("load", () => {
    // Скриване на Loader-а
    const loader = document.getElementById("loader");
    if (loader) loader.classList.add("loader-hidden");

    // Пускане на анимациите
    AOS.init({ duration: 1000, once: true });

    // Стартиране на основните функции
    checkLoginStatus();
    loadProducts();
});

// --- 3. ЛОГИКА ЗА ПОТРЕБИТЕЛСКИ СТАТУС ---
function checkLoginStatus() {
    window.fb.onStateChange(window.auth, (user) => {
        const authStatus = document.getElementById('auth-status');

        if (user) {
            console.log("Влязъл потребител:", user.email);
            const isAdmin = user.email === ADMIN_EMAIL;

            if (authStatus) {
                authStatus.innerHTML = `
                    <div class="user-menu">
                        <a href="#" class="login-btn">👤 Моят Профил</a>
                        <div class="dropdown-content">
                            ${isAdmin ? '<a href="admin.html">Админ Панел</a>' : ''}
                            <a href="orders.html">Моите Поръчки</a>
                            <a href="#" id="logoutBtn" style="color: #ff4d4d;">Изход</a>
                        </div>
                    </div>
                `;

                document.getElementById('logoutBtn').onclick = (e) => {
                    e.preventDefault();
                    window.fb.logOut(window.auth).then(() => {
                        window.location.href = "index.html";
                    });
                };
            }

            // Ако сме на страницата за поръчки, зареждаме историята
            if (window.location.pathname.includes('orders.html')) {
                loadUserOrders(user);
            }
        } else {
            if (authStatus) {
                authStatus.innerHTML = `<a href="login.html" class="login-btn">Вход</a>`;
            }
        }
    });
}

// --- 4. ВХОД И РЕГИСТРАЦИЯ ---
const logForm = document.getElementById('loginForm');
if (logForm) {
    logForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = logForm.querySelector('input[type="email"]').value;
        const password = logForm.querySelector('input[type="password"]').value;
        try {
            await window.fb.signIn(window.auth, email, password);
            window.location.href = "index.html";
        } catch (err) {
            alert("Грешен имейл или парола!");
        }
    });
}

const regForm = document.getElementById('registerForm');
if (regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = regForm.querySelector('input[type="email"]').value;
        const password = regForm.querySelector('input[type="password"]').value;
        try {
            await window.fb.createUser(window.auth, email, password);
            window.location.href = "index.html";
        } catch (err) {
            alert("Грешка при регистрация: " + err.message);
        }
    });
}

// --- 5. ЗАРЕЖДАНЕ НА КАТАЛОГА ---
async function loadProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    try {
        const querySnapshot = await window.fb.getDocs(window.fb.collection(window.db, "products"));
        container.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const product = doc.data();
            container.innerHTML += `
                <div class="card" data-aos="fade-up">
                    <div class="img-box" style="background-image: url('${product.image || ''}');"></div>
                    <h3>${product.name}</h3>
                    <p class="price">${Number(product.price).toFixed(2)} €</p>
                    <select id="size-${doc.id}" class="input-field" style="margin-bottom: 10px;">
                        <option value="">Избери размер</option>
                        <option value="7">7</option><option value="8">8</option>
                        <option value="9">9</option><option value="10">10</option>
                        <option value="11">11</option>
                    </select>
                    <button class="btn-buy" onclick="addToCartWithSize('${doc.id}', '${product.name}', ${product.price})">Добави в количката</button>
                </div>`;
        });
    } catch (error) {
        console.error("Грешка при продуктите:", error);
    }
}

// --- 6. КОЛИЧКА ---
window.addToCartWithSize = function (id, name, price) {
    const size = document.getElementById(`size-${id}`).value;
    if (!size) {
        alert("Моля, избери размер!");
        return;
    }
    cart.push({ id, name, price, size });
    document.getElementById('cart-count').innerText = cart.length;
    alert(`Добавено: ${name} (Размер ${size})`);
};

// Странично меню за количка
const cIcon = document.getElementById('cart-icon');
const cSide = document.getElementById('cart-sidebar');
const cClose = document.getElementById('close-cart');

if (cIcon) cIcon.onclick = () => cSide.classList.add('active');
if (cClose) cClose.onclick = () => cSide.classList.remove('active');

// --- 7. ПЛАЩАНЕ ---
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.onclick = async () => {
        const user = window.auth.currentUser;
        if (!user) {
            alert("Влезте в акаунта си първо.");
            window.location.href = "login.html";
            return;
        }
        if (cart.length === 0) return alert("Количката е празна.");

        try {
            await window.fb.addDoc(window.fb.collection(window.db, "orders"), {
                userId: user.uid,
                userEmail: user.email,
                items: cart,
                status: "Pending",
                date: new Date()
            });
            alert("Поръчката е приета!");
            cart = [];
            document.getElementById('cart-count').innerText = "0";
            cSide.classList.remove('active');
        } catch (err) {
            alert("Грешка при изпращане.");
        }
    };
}

// --- 8. ИСТОРИЯ НА ПОРЪЧКИТЕ ---
async function loadUserOrders(user) {
    const container = document.getElementById('orders-container');
    if (!container) return;

    try {
        const q = window.fb.query(
            window.fb.collection(window.db, "orders"),
            window.fb.where("userId", "==", user.uid)
        );
        const snapshot = await window.fb.getDocs(q);
        container.innerHTML = snapshot.empty ? '<p>Нямате поръчки.</p>' : '';

        snapshot.forEach(doc => {
            const order = doc.data();
            const items = order.items.map(i => `${i.name} (${i.size})`).join(', ');
            container.innerHTML += `
                <div class="order-card" data-aos="fade-up">
                    <div class="order-info">
                        <h3>Поръчка #${doc.id.substring(0, 6)}</h3>
                        <p>${items}</p>
                    </div>
                    <div class="order-status">${order.status}</div>
                </div>`;
        });
    } catch (e) {
        console.error(e);
    }
}