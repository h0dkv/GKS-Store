        // --- 1. ГЛОБАЛНИ НАСТРОЙКИ ---
        let cart = [];
        const ADMIN_EMAIL = "hristianfortnite@gmail.com"; // Промени го с твоя

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
                    // 1. Създаваме акаунта в Auth
                    const userCredential = await window.fb.createUser(window.auth, email, password);
                    const user = userCredential.user;

                    // 2. Записваме ролята в Firestore
                    await window.fb.setDoc(window.fb.doc(window.db, "users", user.uid), {
                        email: email,
                        role: "user" // По подразбиране е обикновен потребител
                    });

                    window.location.href = 'index.html';
                } catch (err) {
                    alert("Грешка: " + err.message);
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

        const addProductForm = document.getElementById('addProductForm');

        if (addProductForm) {
            addProductForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                // 1. Взимаме стойностите
                const name = document.getElementById('prodName').value;
                const price = parseFloat(document.getElementById('prodPrice').value);
                const image = document.getElementById('prodImage').value;

                // Валидация
                if (!name || isNaN(price) || !image) {
                    alert("Моля, попълнете всички полета правилно!");
                    return;
                }

                try {
                    console.log("Опит за качване на продукт...");

                    // 2. Използваме window.fb.addDoc
                    const docRef = await window.fb.addDoc(window.fb.collection(window.db, "products"), {
                        name: name,
                        price: price,
                        image: image,
                        createdAt: new Date()
                    });

                    console.log("Продуктът е качен с ID: ", docRef.id);
                    alert("✅ Продуктът е добавен успешно в Goalkeepers Store!");
                    addProductForm.reset();

                } catch (error) {
                    console.error("Грешка при добавяне:", error);
                    alert("Грешка при качване: " + error.message);
                }
            });
        }