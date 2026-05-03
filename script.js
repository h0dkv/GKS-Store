// --- 1. ГЛОБАЛНИ НАСТРОЙКИ ---
let cart = [];
const ADMIN_EMAIL = "hristianfortnite@gmail.com"; // Промени го с твоя

function loadCart() {
    try {
        const savedCart = localStorage.getItem('gksCart');
        cart = savedCart ? JSON.parse(savedCart) : [];
    } catch {
        cart = [];
    }
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('gksCart', JSON.stringify(cart));
}

function showToast(message, duration = 2400) {
    let toast = document.getElementById('gks-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'gks-toast';
        toast.className = 'toast-notice';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), duration);
}

function setupProfileMenu() {
    const menu = document.querySelector('.user-menu');
    if (!menu) return;
    const trigger = menu.querySelector('.login-btn');
    const dropdown = menu.querySelector('.dropdown-content');
    if (!trigger || !dropdown) return;

    trigger.onclick = (e) => {
        e.preventDefault();
        menu.classList.toggle('open');
    };

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) {
            menu.classList.remove('open');
        }
    });
}

// --- 2. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАРЕЖДАНЕ ---
window.addEventListener("load", () => {
    // Скриване на Loader-а
    const loader = document.getElementById("loader");
    if (loader) loader.classList.add("loader-hidden");

    // Пускане на анимациите
    AOS.init({ duration: 1000, once: true });

    loadCart();
    // Стартиране на основните функции
    checkLoginStatus();
    loadProducts();
});

// --- 3. ЛОГИКА ЗА ПОТРЕБИТЕЛСКИ СТАТУС ---
async function checkLoginStatus() {
    window.fb.onStateChange(window.auth, async (user) => {
        const authStatus = document.getElementById('auth-status');
        if (!authStatus) return;

        if (user) {
            // Взимаме данните за потребителя от Firestore
            const userDoc = await window.fb.getDoc(window.fb.doc(window.db, "users", user.uid));
            const userData = userDoc.data();
            const isAdmin = userData && userData.role === "admin";

            authStatus.innerHTML = `
                        <div class="user-menu">
                            <a href="#" class="login-btn">👤 ${isAdmin ? 'Админ' : 'Профил'}</a>
                            <div class="dropdown-content">
                                ${isAdmin ? '<a href="admin-users.html">Управление на потребители</a>' : ''}
                                ${isAdmin ? '<a href="admin.html">Добави Продукт</a>' : ''}
                                <a href="orders.html">Моите Поръчки</a>
                                <a href="#" id="logoutBtn" style="color:red">Изход</a>
                            </div>
                        </div>`;

            document.getElementById('logoutBtn').onclick = () => window.fb.logOut(window.auth);
            setupProfileMenu();
        } else {
            authStatus.innerHTML = `<a href="login.html" class="login-btn">Вход</a>`;
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
            showToast("Грешен имейл или парола!");
        }
    });
}

const regForm = document.getElementById('registerForm');
if (regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // ПРОВЕРКА: Изчакай или провери дали window.fb съществува
        if (!window.fb) {
            showToast("Системата зарежда... Моля, опитайте след секунда.");
            return;
        }

        const email = regForm.querySelector('input[type="email"]').value;
        const password = regForm.querySelector('input[type="password"]').value;

        try {
            const userCredential = await window.fb.createUser(window.auth, email, password);
            const user = userCredential.user;

            await window.fb.setDoc(window.fb.doc(window.db, "users", user.uid), {
                email: email,
                role: "user"
            });

            window.location.href = 'index.html';
        } catch (err) {
            showToast("Грешка: " + (err.message || "Моля опитайте отново."));
        }
    });
}

// --- 5. ЗАРЕЖДАНЕ НА КАТАЛОГА ---
async function loadProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    const querySnapshot = await window.fb.getDocs(window.fb.collection(window.db, "products"));
    container.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const p = doc.data();

        // Логика за размерите
        let sizeOptions = "";
        if (p.category === "clothing") {
            sizeOptions = `
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>`;
        } else {
            // По подразбиране за ръкавици
            sizeOptions = `
                <option value="7">7</option><option value="8">8</option>
                <option value="9">9</option><option value="10">10</option>
                <option value="11">11</option>`;
        }

        container.innerHTML += `
            <div class="card">
                <div class="img-box" style="background-image: url('${p.image}')"></div>
                <h3>${p.name}</h3>
                <p>${p.price.toFixed(2)} €</p>
                <select id="size-${doc.id}" class="input-field">
                    <option value="">Размер</option>
                    ${sizeOptions}
                </select>
                <button class="btn-buy" onclick="addToCartWithSize('${doc.id}', '${p.name}', ${p.price})">Добави</button>
            </div>`;
    });
}

// --- 6. КОЛИЧКА ---
window.addToCartWithSize = function (id, name, price) {
    const size = document.getElementById(`size-${id}`).value;
    if (!size) {
        showToast("Моля, избери размер!");
        return;
    }
    cart.push({ id, name, price, size });
    updateCartUI();
    saveCart();
    showToast(`Добавено: ${name} (Размер ${size})`);
};

function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    const itemsEl = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (countEl) countEl.innerText = cart.length;
    if (itemsEl) {
        itemsEl.innerHTML = cart.map((item, i) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)">
                <div>
                    <p style="font-weight:700">${item.name}</p>
                    <p style="font-size:0.8rem;color:var(--text-gray)">Размер: ${item.size}</p>
                </div>
                <div style="display:flex;align-items:center;gap:10px">
                    <span style="color:var(--cyan);font-weight:700">${item.price.toFixed(2)} €</span>
                    <span onclick="removeFromCart(${i})" style="cursor:pointer;color:#ff4d4d;font-size:1.2rem">&times;</span>
                </div>
            </div>`).join('');
    }
    if (totalEl) {
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        totalEl.innerText = total.toFixed(2);
    }
}

window.removeFromCart = function (index) {
    cart.splice(index, 1);
    updateCartUI();
    saveCart();
    showToast("Продуктът е изтрит от количката.");
};

// Странично меню за количка
const cIcon = document.getElementById('cart-icon');
const cSide = document.getElementById('cart-sidebar');
const cClose = document.getElementById('close-cart');

if (cIcon && cSide) cIcon.onclick = (e) => {
    e.preventDefault();
    cSide.classList.add('active');
};
if (cClose && cSide) cClose.onclick = () => cSide.classList.remove('active');

const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.onclick = () => {
        const isOpen = navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    };
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

// --- 7. ПЛАЩАНЕ ---
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.onclick = async () => {
        const user = window.auth.currentUser;
        if (!user) {
            showToast("Влезте в акаунта си първо.");
            window.location.href = "login.html";
            return;
        }
        if (cart.length === 0) {
            showToast("Количката е празна.");
            return;
        }

        try {
            await window.fb.addDoc(window.fb.collection(window.db, "orders"), {
                userId: user.uid,
                userEmail: user.email,
                items: cart,
                status: "Pending",
                date: new Date()
            });
            showToast("Поръчката е приета!");
            cart = [];
            saveCart();
            updateCartUI();
            if (cSide) cSide.classList.remove('active');
        } catch (err) {
            showToast("Грешка при изпращане.");
        }
    };
}

const addProductForm = document.getElementById('addProductForm');

if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('prodName').value;
        const price = parseFloat(document.getElementById('prodPrice').value);
        const image = document.getElementById('prodImage').value;
        const category = document.getElementById('prodCategory').value;

        if (!name || isNaN(price) || !image || !category) {
            showToast("Моля, попълнете всички полета правилно!");
            return;
        }

        try {
            console.log("Опит за качване на продукт...");

            const docRef = await window.fb.addDoc(window.fb.collection(window.db, "products"), {
                name: name,
                price: price,
                image: image,
                category: category,
                createdAt: new Date()
            });

            console.log("Продуктът е качен с ID: ", docRef.id);
            showToast("✅ Продуктът е добавен успешно!");
            addProductForm.reset();

        } catch (error) {
            console.error("Грешка при добавяне:", error);
            showToast("Грешка при качване: " + (error.message || "Моля опитайте отново."));
        }
    });
}
