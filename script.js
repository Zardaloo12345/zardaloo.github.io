"use strict";

/* =========================================================
   ZARDALOO
   Supabase + Products + Cart + Discount + Passkey Admin
   ========================================================= */


/* ---------------- SUPABASE ---------------- */

const SUPABASE_URL =
    "https://ovqldknqpaiczrddcrxp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_VDZ_tgoMgYRI7K419ieDKw_y29xeXA2";

const PRODUCTS_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/products";


const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            experimental: {
                passkey: true
            }
        }
    }
);


/* =========================================================
   IMPORTANT:
   این ایمیل باید ایمیل حساب مدیر Supabase باشد.
   ========================================================= */

const ADMIN_EMAIL =
    "YOUR_ADMIN_EMAIL@example.com";


/* ---------------- DATA ---------------- */

let products = [];

let cart = loadJSON(
    "zardaloo_cart",
    []
);

let activeDiscount = loadJSON(
    "zardaloo_discount",
    null
);


/* ---------------- DISCOUNTS ---------------- */

const DEFAULT_DISCOUNTS = {
    ZARDALOO10: 10,
    ZARDALOO20: 20
};


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        loadTheme();

        updateCart();

        await loadProducts();

        await checkAdminSession();
    }
);


/* =========================================================
   PAGE SYSTEM
   ========================================================= */

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    const page =
        document.getElementById(pageId);

    if (page) {
        page.classList.add("active");
    }

    if (pageId === "cart") {
        renderCart();
    }

    if (pageId === "market") {
        renderProducts();
    }

    if (pageId === "gifts") {
        renderGifts();
    }

    if (pageId === "management") {
        checkAdminSession();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   THEME
   ========================================================= */

function toggleTheme() {

    document.body.classList.toggle("dark");

    const dark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "zardaloo_theme",
        dark ? "dark" : "light"
    );

    updateThemeButton();
}


function loadTheme() {

    const theme =
        localStorage.getItem("zardaloo_theme");

    if (theme === "dark") {
        document.body.classList.add("dark");
    }

    updateThemeButton();
}


function updateThemeButton() {

    const button =
        document.getElementById("themeButton");

    if (!button) return;

    button.textContent =
        document.body.classList.contains("dark")
            ? "☀️"
            : "🌙";
}


/* =========================================================
   PRODUCTS
   ========================================================= */

async function loadProducts() {

    const container =
        document.getElementById(
            "productsContainer"
        );

    if (container) {
        container.innerHTML =
            `<div class="loading">در حال دریافت کالاها...</div>`;
    }

    try {

        const response =
            await fetch(
                PRODUCTS_FUNCTION_URL
            );

        if (!response.ok) {
            throw new Error(
                "خطا در دریافت کالاها"
            );
        }

        const data =
            await response.json();

        if (Array.isArray(data)) {
            products = data;
        }
        else if (Array.isArray(data.products)) {
            products = data.products;
        }
        else {
            products = [];
        }

    } catch (error) {

        console.error(error);

        products = [];

        if (container) {
            container.innerHTML = `
                <div class="empty">
                    دریافت کالاها با خطا مواجه شد.
                    <br>
                    اتصال Supabase را بررسی کن.
                </div>
            `;
        }

        return;
    }

    renderProducts();
    renderGifts();
    updateAdminStats();
}


/* =========================================================
   PRODUCT NORMALIZATION
   ========================================================= */

function getProductName(product) {

    return (
        product.name ??
        product.product_name ??
        product.title ??
        "کالای بدون نام"
    );
}


function getProductPrice(product) {

    return Number(
        product.price ??
        product.product_price ??
        0
    );
}


function getSellerName(product) {

    return (
        product.seller_name ??
        product.seller ??
        product.vendor_name ??
        "فروشنده"
    );
}


function getSellerPhone(product) {

    return (
        product.seller_phone ??
        product.phone ??
        product.phone_number ??
        "ثبت نشده"
    );
}


function getDescription(product) {

    return (
        product.description ??
        product.details ??
        ""
    );
}


function isGiftProduct(product) {

    return (
        product.is_gift === true ||
        product.gift === true
    );
}


/* =========================================================
   FORMAT PRICE
   ========================================================= */

function formatPrice(value) {

    return Number(value || 0)
        .toLocaleString("fa-IR") + " تومان";
}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts() {

    const container =
        document.getElementById(
            "productsContainer"
        );

    if (!container) return;

    const search =
        (
            document.getElementById(
                "searchInput"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const filtered =
        products.filter(product => {

            const text = (
                getProductName(product) +
                " " +
                getSellerName(product) +
                " " +
                getDescription(product)
            ).toLowerCase();

            return text.includes(search);
        });


    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="empty">
                کالایی پیدا نشد.
            </div>
        `;

        return;
    }


    container.innerHTML =
        filtered.map(
            createProductCard
        ).join("");
}


/* =========================================================
   PRODUCT CARD
   ========================================================= */

function createProductCard(product) {

    const name =
        escapeHTML(
            getProductName(product)
        );

    const price =
        formatPrice(
            getProductPrice(product)
        );

    const seller =
        escapeHTML(
            getSellerName(product)
        );

    const phone =
        escapeHTML(
            getSellerPhone(product)
        );

    const description =
        escapeHTML(
            getDescription(product)
        );

    const gift =
        isGiftProduct(product);


    const productId =
        String(
            product.id ??
            product.product_id ??
            crypto.randomUUID()
        );


    return `
        <article class="product-card">

            ${
                gift
                    ? `<span class="gift-badge">🎁 اشانتیون</span>`
                    : ""
            }

            <h3>${name}</h3>

            ${
                description
                    ? `<div class="product-description">${description}</div>`
                    : ""
            }

            <div class="price">
                ${price}
            </div>

            <div class="seller">
                👤 ${seller}
                <br>
                📞 ${phone}
            </div>

            <div class="card-actions">

                <button
                    onclick='addToCart(${JSON.stringify(
                        product
                    )})'
                >
                    🛒 افزودن
                </button>

            </div>

        </article>
    `;
}


/* =========================================================
   GIFTS
   ========================================================= */

function renderGifts() {

    const container =
        document.getElementById(
            "giftsContainer"
        );

    if (!container) return;


    const gifts =
        products.filter(
            isGiftProduct
        );


    if (gifts.length === 0) {

        container.innerHTML = `
            <div class="empty">
                هنوز کالای اشانتیون‌دار ثبت نشده است.
            </div>
        `;

        return;
    }


    container.innerHTML =
        gifts.map(
            createProductCard
        ).join("");
}


/* =========================================================
   REGISTER PRODUCT
   ========================================================= */

document
    .getElementById("productForm")
    ?.addEventListener(
        "submit",
        registerProduct
    );


async function registerProduct(event) {

    event.preventDefault();


    const message =
        document.getElementById(
            "registerMessage"
        );


    const payload = {

        name:
            document.getElementById(
                "productName"
            ).value.trim(),

        price:
            Number(
                document.getElementById(
                    "productPrice"
                ).value
            ),

        seller_name:
            document.getElementById(
                "sellerName"
            ).value.trim(),

        seller_phone:
            document.getElementById(
                "sellerPhone"
            ).value.trim(),

        description:
            document.getElementById(
                "productDescription"
            ).value.trim(),

        is_gift:
            document.getElementById(
                "isGift"
            ).checked

    };


    if (
        !payload.name ||
        !payload.seller_name ||
        !payload.seller_phone ||
        !Number.isFinite(payload.price)
    ) {

        setMessage(
            message,
            "لطفاً اطلاعات لازم را کامل کن.",
            "error"
        );

        return;
    }


    setMessage(
        message,
        "در حال ثبت کالا...",
        ""
    );


    try {

        const response =
            await fetch(
                PRODUCTS_FUNCTION_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const text =
            await response.text();


        if (!response.ok) {

            throw new Error(
                text ||
                "ثبت کالا انجام نشد."
            );
        }


        setMessage(
            message,
            "✅ کالا با موفقیت ثبت شد.",
            "success"
        );


        document
            .getElementById(
                "productForm"
            )
            .reset();


        await loadProducts();


        showToast(
            "کالا ثبت شد 🍑"
        );


    } catch (error) {

        console.error(error);

        setMessage(
            message,
            "❌ ثبت کالا انجام نشد. تابع products در Supabase را بررسی کن.",
            "error"
        );
    }
}


/* =========================================================
   CART
   ========================================================= */

function addToCart(product) {

    const id =
        String(
            product.id ??
            product.product_id ??
            getProductName(product)
        );


    const existing =
        cart.find(
            item =>
                String(item.id) === id
        );


    if (existing) {

        existing.quantity += 1;

    } else {

        cart.push({

            id: id,

            name:
                getProductName(product),

            price:
                getProductPrice(product),

            seller:
                getSellerName(product),

            phone:
                getSellerPhone(product),

            quantity: 1

        });
    }


    saveCart();

    updateCart();

    showToast(
        "به سبد خرید اضافه شد 🛒"
    );
}


function increaseCart(id) {

    const item =
        cart.find(
            x =>
                String(x.id) ===
                String(id)
        );

    if (item) {
        item.quantity++;
    }

    saveCart();
    renderCart();
    updateCart();
}


function decreaseCart(id) {

    const item =
        cart.find(
            x =>
                String(x.id) ===
                String(id)
        );

    if (!item) return;


    item.quantity--;


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                x =>
                    String(x.id) !==
                    String(id)
            );
    }


    saveCart();
    renderCart();
    updateCart();
}


function clearCart() {

    cart = [];

    saveCart();

    updateCart();

    renderCart();

    showToast(
        "سبد خرید خالی شد."
    );
}


function renderCart() {

    const container =
        document.getElementById(
            "cartContainer"
        );

    if (!container) return;


    if (cart.length === 0) {

        container.innerHTML = `
            <div class="empty">
                سبد خرید خالی است.
            </div>
        `;

        return;
    }


    let subtotal = 0;


    const html =
        cart.map(item => {

            const total =
                item.price *
                item.quantity;

            subtotal += total;


            return `
                <div class="cart-item">

                    <div>
                        <strong>
                            ${escapeHTML(item.name)}
                        </strong>

                        <br>

                        <small>
                            قیمت واحد:
                            ${formatPrice(item.price)}
                        </small>

                        <br>

                        <small>
                            فروشنده:
                            ${escapeHTML(item.seller)}
                        </small>
                    </div>

                    <div class="cart-controls">

                        <button
                            onclick="increaseCart('${escapeAttribute(item.id)}')"
                        >
                            +
                        </button>

                        <strong>
                            ${item.quantity}
                        </strong>

                        <button
                            onclick="decreaseCart('${escapeAttribute(item.id)}')"
                        >
                            −
                        </button>

                    </div>

                    <strong>
                        ${formatPrice(total)}
                    </strong>

                </div>
            `;

        }).join("");


    const discountPercent =
        activeDiscount?.percent || 0;


    const discountAmount =
        Math.round(
            subtotal *
            discountPercent /
            100
        );


    const finalPrice =
        subtotal -
        discountAmount;


    container.innerHTML = `

        ${html}

        <div class="cart-summary">

            <div>
                مبلغ اولیه:
                <strong>
                    ${formatPrice(subtotal)}
                </strong>
            </div>

            <div>
                تخفیف:
                <strong>
                    ${discountPercent}٪
                </strong>
            </div>

            <div>
                مبلغ تخفیف:
                <strong>
                    ${formatPrice(discountAmount)}
                </strong>
            </div>

            <hr>

            <div>
                مبلغ نهایی:
                <strong>
                    ${formatPrice(finalPrice)}
                </strong>
            </div>

        </div>
    `;
}


function updateCart() {

    const count =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    document
        .querySelectorAll(
            "[data-cart-count]"
        )
        .forEach(el => {
            el.textContent = count;
        });


    updateAdminStats();
}


/* =========================================================
   DISCOUNT
   ========================================================= */

function applyDiscount() {

    const input =
        document.getElementById(
            "discountInput"
        );

    const message =
        document.getElementById(
            "discountMessage"
        );


    const code =
        input.value
            .trim()
            .toUpperCase();


    const percent =
        DEFAULT_DISCOUNTS[code];


    if (!percent) {

        activeDiscount = null;

        localStorage.removeItem(
            "zardaloo_discount"
        );


        setMessage(
            message,
            "❌ این کد تخفیف معتبر نیست.",
            "error"
        );

        renderCart();

        return;
    }


    activeDiscount = {

        code: code,

        percent: percent
    };


    localStorage.setItem(
        "zardaloo_discount",
        JSON.stringify(
            activeDiscount
        )
    );


    setMessage(
        message,
        `✅ کد ${code} اعمال شد؛ ${percent}٪ تخفیف.`,
        "success"
    );


    renderCart();
}


/* =========================================================
   ADMIN / PASSKEY
   ========================================================= */

/*
    Passkey در Supabase:

    1. حساب مدیر باید قبلاً در Supabase Auth وجود داشته باشد.
    2. یک بار با ایمیل/رمز وارد می‌شوی.
    3. Passkey ثبت می‌شود.
    4. دفعات بعد ورود می‌تواند بدون رمز و با
       اثر انگشت / Face ID / Windows Hello انجام شود.
*/


async function loginWithPasskey() {

    const message =
        document.getElementById(
            "adminLoginMessage"
        );


    try {

        if (
            !window.PublicKeyCredential
        ) {

            throw new Error(
                "مرورگر شما WebAuthn/Passkey را پشتیبانی نمی‌کند."
            );
        }


        if (
            typeof supabaseClient.auth
                .signInWithPasskey !==
            "function"
        ) {

            throw new Error(
                "نسخه Supabase JS یا قابلیت Passkey فعال نیست."
            );
        }


        setMessage(
            message,
            "👆 منتظر تأیید Passkey دستگاه باش...",
            ""
        );


        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPasskey();


        if (error) {
            throw error;
        }


        await verifyAdminUser(
            data?.user
        );


    } catch (error) {

        console.error(error);

        setMessage(
            message,
            "❌ ورود با Passkey انجام نشد: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   ADMIN SETUP
   ========================================================= */

function showAdminSetup() {

    document
        .getElementById(
            "adminLoginBox"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "adminSetupBox"
        )
        .classList.remove("hidden");
}


function hideAdminSetup() {

    document
        .getElementById(
            "adminSetupBox"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "adminLoginBox"
        )
        .classList.remove("hidden");
}


async function loginAdminForSetup() {

    const email =
        document
            .getElementById(
                "adminEmail"
            )
            .value
            .trim();

    const password =
        document
            .getElementById(
                "adminPassword"
            )
            .value;


    const message =
        document.getElementById(
            "setupMessage"
        );


    if (!email || !password) {

        setMessage(
            message,
            "ایمیل و رمز را وارد کن.",
            "error"
        );

        return;
    }


    try {

        setMessage(
            message,
            "در حال ورود...",
            ""
        );


        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({

                    email,
                    password

                });


        if (error) {
            throw error;
        }


        if (
            !isAdminEmail(
                data.user
            )
        ) {

            await supabaseClient
                .auth
                .signOut();

            throw new Error(
                "این حساب اجازه مدیریت ندارد."
            );
        }


        await registerPasskey();


    } catch (error) {

        console.error(error);

        setMessage(
            message,
            "❌ " + error.message,
            "error"
        );
    }
}


/* =========================================================
   REGISTER PASSKEY
   ========================================================= */

async function registerPasskey() {

    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient
                .auth
                .getUser();


        if (!user) {

            throw new Error(
                "ابتدا وارد حساب مدیر شو."
            );
        }


        if (
            !isAdminEmail(user)
        ) {

            throw new Error(
                "این حساب مدیر نیست."
            );
        }


        if (
            typeof supabaseClient
                .auth
                .registerPasskey !==
            "function"
        ) {

            throw new Error(
                "registerPasskey در نسخه فعلی Supabase JS موجود نیست."
            );
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .registerPasskey();


        if (error) {
            throw error;
        }


        showToast(
            "✅ Passkey با موفقیت ثبت شد!"
        );


        hideAdminSetup();

        await showAdminPanel(
            user
        );


    } catch (error) {

        console.error(error);

        const message =
            document.getElementById(
                "setupMessage"
            );


        setMessage(
            message,
            "❌ ثبت Passkey انجام نشد: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   CHECK ADMIN SESSION
   ========================================================= */

async function checkAdminSession() {

    try {

        const {
            data
        } =
            await supabaseClient
                .auth
                .getSession();


        const session =
            data?.session;


        if (!session) {

            showAdminLogin();

            return;
        }


        const {
            data: {
                user
            }
        } =
            await supabaseClient
                .auth
                .getUser();


        if (
            !isAdminEmail(user)
        ) {

            await supabaseClient
                .auth
                .signOut();

            showAdminLogin();

            return;
        }


        await showAdminPanel(
            user
        );


    } catch (error) {

        console.error(error);

        showAdminLogin();
    }
}


/* =========================================================
   VERIFY ADMIN
   ========================================================= */

async function verifyAdminUser(user) {

    if (!user) {

        throw new Error(
            "کاربر احراز هویت نشد."
        );
    }


    if (
        !isAdminEmail(user)
    ) {

        await supabaseClient
            .auth
            .signOut();

        throw new Error(
            "این حساب اجازه ورود به مدیریت را ندارد."
        );
    }


    await showAdminPanel(
        user
    );
}


/* =========================================================
   ADMIN EMAIL CHECK
   ========================================================= */

function isAdminEmail(user) {

    if (!user) {
        return false;
    }


    const configuredEmail =
        ADMIN_EMAIL
            .trim()
            .toLowerCase();


    if (
        !configuredEmail ||
        configuredEmail ===
        "your_admin_email@example.com"
    ) {

        console.warn(
            "ADMIN_EMAIL هنوز تنظیم نشده است."
        );

        return false;
    }


    return (
        String(
            user.email || ""
        )
        .toLowerCase() ===
        configuredEmail
    );
}


/* =========================================================
   SHOW ADMIN PANEL
   ========================================================= */

async function showAdminPanel(user) {

    document
        .getElementById(
            "adminLoginBox"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "adminSetupBox"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "adminPanel"
        )
        .classList.remove("hidden");


    document
        .getElementById(
            "adminUserText"
        )
        .textContent =
            "وارد شده با: " +
            (user.email || "مدیر");


    updateAdminStats();

    renderAdminProducts();

    await loadPasskeys();
}


/* =========================================================
   SHOW LOGIN
   ========================================================= */

function showAdminLogin() {

    document
        .getElementById(
            "adminLoginBox"
        )
        .classList.remove("hidden");


    document
        .getElementById(
            "adminSetupBox"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "adminPanel"
        )
        .classList.add("hidden");
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logoutAdmin() {

    await supabaseClient
        .auth
        .signOut();


    showAdminLogin();

    showToast(
        "از مدیریت خارج شدی."
    );
}


/* =========================================================
   PASSKEY LIST
   ========================================================= */

async function loadPasskeys() {

    const container =
        document.getElementById(
            "passkeysList"
        );

    if (!container) return;


    if (
        !supabaseClient.auth.passkey ||
        typeof supabaseClient
            .auth
            .passkey
            .list !== "function"
    ) {

        container.innerHTML = `
            <p class="muted">
                مدیریت Passkey در این نسخه در دسترس نیست.
            </p>
        `;

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .passkey
                .list();


        if (error) {
            throw error;
        }


        const passkeys =
            data || [];


        if (passkeys.length === 0) {

            container.innerHTML = `
                <p class="muted">
                    هنوز Passkey ثبت نشده است.
                </p>
            `;

            return;
        }


        container.innerHTML =
            passkeys.map(
                passkey => `

                    <div class="passkey-item">

                        <strong>
                            👆 ${
                                escapeHTML(
                                    passkey.friendly_name ||
                                    "Passkey دستگاه"
                                )
                            }
                        </strong>

                        <br>

                        <small>
                            ثبت:
                            ${
                                formatDate(
                                    passkey.created_at
                                )
                            }
                        </small>

                    </div>

                `
            ).join("");


    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <p class="muted">
                دریافت Passkeyها ممکن نشد.
            </p>
        `;
    }
}


/* =========================================================
   ADMIN STATS
   ========================================================= */

function updateAdminStats() {

    const productCount =
        document.getElementById(
            "productCount"
        );

    const giftCount =
        document.getElementById(
            "giftCount"
        );

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (productCount) {

        productCount.textContent =
            products.length;
    }


    if (giftCount) {

        giftCount.textContent =
            products.filter(
                isGiftProduct
            ).length;
    }


    if (cartCount) {

        cartCount.textContent =
            cart.reduce(
                (sum, item) =>
                    sum + item.quantity,
                0
            );
    }


    renderAdminProducts();
}


/* =========================================================
   ADMIN PRODUCTS
   ========================================================= */

function renderAdminProducts() {

    const container =
        document.getElementById(
            "adminProducts"
        );

    if (!container) return;


    if (products.length === 0) {

        container.innerHTML = `
            <p class="muted">
                کالایی وجود ندارد.
            </p>
        `;

        return;
    }


    container.innerHTML =
        products.map(
            product => {

                const name =
                    escapeHTML(
                        getProductName(product)
                    );

                const seller =
                    escapeHTML(
                        getSellerName(product)
                    );

                const price =
                    formatPrice(
                        getProductPrice(product)
                    );


                return `

                    <div class="admin-product">

                        <div>

                            <strong>
                                ${name}
                            </strong>

                            <br>

                            <small>
                                ${seller}
                                — ${price}
                            </small>

                        </div>

                        ${
                            isGiftProduct(product)
                                ? "<span>🎁</span>"
                                : ""
                        }

                    </div>

                `;

            }
        ).join("");
}


/* =========================================================
   STORAGE
   ========================================================= */

function saveCart() {

    localStorage.setItem(
        "zardaloo_cart",
        JSON.stringify(cart)
    );
}


function loadJSON(key, fallback) {

    try {

        const raw =
            localStorage.getItem(key);

        if (!raw) {
            return fallback;
        }

        return JSON.parse(raw);

    } catch {

        return fallback;
    }
}


/* =========================================================
   HELPERS
   ========================================================= */

function setMessage(
    element,
    text,
    type
) {

    if (!element) return;

    element.textContent = text;

    element.className =
        "message " +
        (type || "");
}


function showToast(text) {

    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) return;


    toast.textContent = text;

    toast.classList.add("show");


    setTimeout(
        () => {
            toast.classList.remove(
                "show"
            );
        },
        2500
    );
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

    return String(value ?? "")
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'");
}


function formatDate(date) {

    if (!date) {
        return "نامشخص";
    }


    try {

        return new Date(date)
            .toLocaleString(
                "fa-IR"
            );

    } catch {

        return "نامشخص";
    }
}


/* =========================================================
   AUTH STATE
   ========================================================= */

supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

        if (
            event === "SIGNED_OUT"
        ) {

            showAdminLogin();

            return;
        }


        if (
            event === "SIGNED_IN" &&
            session?.user
        ) {

            if (
                isAdminEmail(
                    session.user
                )
            ) {

                await showAdminPanel(
                    session.user
                );

            } else {

                await supabaseClient
                    .auth
                    .signOut();
            }
        }
    }
);
