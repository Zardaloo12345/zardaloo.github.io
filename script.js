"use strict";

/* ==============================
   ZARDALOO CONFIG
================================ */

const SUPABASE_URL =
    "https://ovqldknqpaiczrddcrxp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_VDZ_tgoMgYRI7K419ieDKw_y29xeXA2";

const PRODUCTS_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/products";

const ADMIN_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/admin-reports";


/* ==============================
   ADMIN PASSWORDS
================================ */

const ADMIN_NUMBER = "0994051777";
const ADMIN_PASSWORD = "ERFAN";


/* ==============================
   STORAGE
================================ */

const CART_KEY = "zardaloo_cart";
const THEME_KEY = "zardaloo_theme";
const DISCOUNT_KEY = "zardaloo_discount";


let products = [];
let cart = loadCart();
let activeDiscount = loadDiscount();


/* ==============================
   START
================================ */

document.addEventListener("DOMContentLoaded", () => {

    loadTheme();

    renderCart();

    loadProducts();

    if (sessionStorage.getItem("zardaloo_admin") === "1") {
        showAdminPanel();
    }

});


/* ==============================
   PAGE SYSTEM
================================ */

function showPage(pageName) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page = document.getElementById(pageName);

    if (page) {
        page.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (pageName === "market") {
        loadProducts();
    }

    if (pageName === "gifts") {
        renderGifts();
    }

    if (pageName === "cart") {
        renderCart();
    }

    if (pageName === "admin") {

        if (sessionStorage.getItem("zardaloo_admin") === "1") {
            showAdminPanel();
        } else {
            showAdminLogin();
        }

    }

}


/* ==============================
   THEME
================================ */

function toggleTheme() {

    document.body.classList.toggle("dark");

    const theme =
        document.body.classList.contains("dark")
            ? "dark"
            : "light";

    localStorage.setItem(THEME_KEY, theme);
}


function loadTheme() {

    const theme = localStorage.getItem(THEME_KEY);

    if (theme === "dark") {
        document.body.classList.add("dark");
    }

}


/* ==============================
   PRODUCTS
================================ */

async function loadProducts() {

    const container =
        document.getElementById("products");

    if (!container) return;

    container.innerHTML =
        `<div class="loading">در حال دریافت کالاها...</div>`;

    try {

        const response = await fetch(
            PRODUCTS_FUNCTION_URL,
            {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                data.message ||
                "دریافت کالاها ناموفق بود."
            );
        }

        if (Array.isArray(data)) {
            products = data;
        } else if (Array.isArray(data.products)) {
            products = data.products;
        } else {
            products = [];
        }

        renderProducts(products);
        renderGifts();

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="error">
                دریافت کالاها انجام نشد.
                <br>
                ${escapeHTML(error.message)}
            </div>
        `;

    }

}


/* ==============================
   PRODUCT RENDER
================================ */

function renderProducts(list) {

    const container =
        document.getElementById("products");

    if (!container) return;

    if (!list.length) {

        container.innerHTML =
            `<div class="empty">کالایی پیدا نشد.</div>`;

        return;
    }

    container.innerHTML =
        list.map(productCard).join("");

}


function renderGifts() {

    const container =
        document.getElementById("giftProducts");

    if (!container) return;

    const gifts =
        products.filter(product =>
            Boolean(
                product.is_gift ??
                product.isGift
            )
        );

    if (!gifts.length) {

        container.innerHTML =
            `<div class="empty">
                فعلاً اشانتیونی ثبت نشده است.
            </div>`;

        return;
    }

    container.innerHTML =
        gifts.map(productCard).join("");

}


function productCard(product) {

    const id =
        product.id ??
        product.product_id ??
        Math.random().toString(36);

    const name =
        product.name ??
        product.product_name ??
        "کالای بدون نام";

    const price =
        Number(
            product.price ??
            product.product_price ??
            0
        );

    const seller =
        product.seller_name ??
        product.sellerName ??
        product.seller ??
        "فروشنده";

    const phone =
        product.seller_phone ??
        product.sellerPhone ??
        product.phone ??
        "ثبت نشده";

    const description =
        product.description ??
        "";

    const gift =
        Boolean(
            product.is_gift ??
            product.isGift
        );

    return `
        <article class="product-card">

            <div class="product-icon">
                ${gift ? "🎁" : "📦"}
            </div>

            <h3>
                ${escapeHTML(String(name))}
            </h3>

            <p class="description">
                ${escapeHTML(String(description))}
            </p>

            <div class="price">
                ${formatPrice(price)} تومان
            </div>

            <div class="seller">
                فروشنده:
                ${escapeHTML(String(seller))}
            </div>

            <div class="seller">
                📞
                ${escapeHTML(String(phone))}
            </div>

            ${
                gift
                    ? `<div class="gift-badge">🎁 اشانتیون</div>`
                    : ""
            }

            <button
                class="primary"
                onclick="addToCart('${escapeAttribute(String(id))}')"
            >
                افزودن به سبد
            </button>

        </article>
    `;
}


/* ==============================
   SEARCH
================================ */

function searchProducts() {

    const input =
        document.getElementById("searchInput");

    if (!input) return;

    const query =
        input.value.trim().toLowerCase();

    if (!query) {
        renderProducts(products);
        return;
    }

    const result =
        products.filter(product => {

            const name =
                String(
                    product.name ??
                    product.product_name ??
                    ""
                ).toLowerCase();

            const description =
                String(
                    product.description ??
                    ""
                ).toLowerCase();

            const seller =
                String(
                    product.seller_name ??
                    product.sellerName ??
                    ""
                ).toLowerCase();

            return (
                name.includes(query) ||
                description.includes(query) ||
                seller.includes(query)
            );

        });

    renderProducts(result);

}


/* ==============================
   CART
================================ */

function loadCart() {

    try {

        return JSON.parse(
            localStorage.getItem(CART_KEY)
        ) || [];

    } catch {

        return [];

    }

}


function saveCart() {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}


function addToCart(id) {

    const product =
        products.find(product =>
            String(
                product.id ??
                product.product_id
            ) === String(id)
        );

    if (!product) {
        alert("کالا پیدا نشد.");
        return;
    }

    const existing =
        cart.find(item =>
            String(item.id) === String(id)
        );

    if (existing) {

        existing.quantity += 1;

    } else {

        cart.push({
            id: String(id),
            name:
                product.name ??
                product.product_name ??
                "کالا",
            price:
                Number(product.price ?? 0),
            quantity: 1
        });

    }

    saveCart();

    renderCart();

    alert("کالا به سبد خرید اضافه شد.");

}


function removeFromCart(id) {

    cart =
        cart.filter(item =>
            String(item.id) !== String(id)
        );

    saveCart();

    renderCart();

}


function changeQuantity(id, amount) {

    const item =
        cart.find(item =>
            String(item.id) === String(id)
        );

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {

        cart =
            cart.filter(cartItem =>
                String(cartItem.id) !== String(id)
            );

    }

    saveCart();

    renderCart();

}


function clearCart() {

    cart = [];

    saveCart();

    renderCart();

}


/* ==============================
   CART RENDER
================================ */

function renderCart() {

    const container =
        document.getElementById("cartItems");

    const summary =
        document.getElementById("cartSummary");

    if (!container || !summary) return;

    if (!cart.length) {

        container.innerHTML =
            `<div class="empty">
                سبد خرید خالی است.
            </div>`;

        summary.innerHTML = "";

        updateAdminStats();

        return;
    }


    container.innerHTML =
        cart.map(item => {

            const total =
                item.price *
                item.quantity;

            return `
                <div class="cart-item">

                    <div>
                        <strong>
                            ${escapeHTML(item.name)}
                        </strong>

                        <div>
                            قیمت واحد:
                            ${formatPrice(item.price)}
                            تومان
                        </div>

                        <div>
                            مجموع:
                            ${formatPrice(total)}
                            تومان
                        </div>
                    </div>

                    <div class="quantity">

                        <button
                            onclick="changeQuantity('${escapeAttribute(item.id)}', 1)"
                        >
                            +
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            onclick="changeQuantity('${escapeAttribute(item.id)}', -1)"
                        >
                            -
                        </button>

                    </div>

                    <button
                        class="danger"
                        onclick="removeFromCart('${escapeAttribute(item.id)}')"
                    >
                        حذف
                    </button>

                </div>
            `;

        }).join("");


    const subtotal =
        cart.reduce(
            (sum, item) =>
                sum + item.price * item.quantity,
            0
        );


    let discountAmount = 0;

    if (activeDiscount) {

        discountAmount =
            subtotal *
            activeDiscount.percent /
            100;

    }


    const finalPrice =
        subtotal - discountAmount;


    summary.innerHTML = `

        <div>
            مبلغ کالاها:
            <strong>
                ${formatPrice(subtotal)}
                تومان
            </strong>
        </div>

        <div>
            تخفیف:
            <strong>
                ${formatPrice(discountAmount)}
                تومان
            </strong>
        </div>

        <hr>

        <div class="final-price">
            مبلغ نهایی:
            ${formatPrice(finalPrice)}
            تومان
        </div>

        ${
            activeDiscount
                ? `
                    <div class="discount-success">
                        کد ${escapeHTML(activeDiscount.code)}
                        با ${activeDiscount.percent}% تخفیف فعال است.
                    </div>
                  `
                : ""
        }

    `;

    updateAdminStats();

}


/* ==============================
   DISCOUNTS
================================ */

const discountCodes = {

    ZARDALOO10: 10,

    ZARDALOO20: 20

};


function loadDiscount() {

    try {

        return JSON.parse(
            localStorage.getItem(DISCOUNT_KEY)
        );

    } catch {

        return null;

    }

}


function applyDiscountCode() {

    const input =
        document.getElementById("discountInput");

    const message =
        document.getElementById("discountMessage");

    if (!input || !message) return;

    const code =
        input.value.trim().toUpperCase();

    if (!code) {

        message.textContent =
            "کد تخفیف را وارد کنید.";

        return;
    }


    const percent =
        discountCodes[code];


    if (!percent) {

        message.textContent =
            "کد تخفیف معتبر نیست.";

        return;
    }


    activeDiscount = {
        code: code,
        percent: percent
    };

    localStorage.setItem(
        DISCOUNT_KEY,
        JSON.stringify(activeDiscount)
    );


    message.textContent =
        `${percent}% تخفیف اعمال شد.`;

    renderCart();

}


/* ==============================
   REGISTER PRODUCT
================================ */

async function registerProduct() {

    const name =
        document.getElementById("productName").value.trim();

    const price =
        Number(
            document.getElementById("productPrice").value
        );

    const sellerName =
        document.getElementById("sellerName").value.trim();

    const sellerPhone =
        document.getElementById("sellerPhone").value.trim();

    const description =
        document.getElementById("productDescription").value.trim();

    const isGift =
        document.getElementById("isGift").checked;

    const message =
        document.getElementById("registerMessage");


    if (!name) {

        message.textContent =
            "نام کالا را وارد کنید.";

        return;
    }


    if (!price || price <= 0) {

        message.textContent =
            "قیمت کالا را صحیح وارد کنید.";

        return;
    }


    if (!sellerName) {

        message.textContent =
            "نام فروشنده را وارد کنید.";

        return;
    }


    if (!sellerPhone) {

        message.textContent =
            "شماره فروشنده را وارد کنید.";

        return;
    }


    const payload = {

        name: name,

        price: price,

        seller_name: sellerName,

        seller_phone: sellerPhone,

        description: description,

        is_gift: isGift

    };


    message.textContent =
        "در حال ثبت کالا...";


    try {

        const response =
            await fetch(
                PRODUCTS_FUNCTION_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "apikey": SUPABASE_KEY
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        const data =
            await response.json().catch(
                () => ({})
            );


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "ثبت کالا ناموفق بود."
            );

        }


        message.textContent =
            "✅ کالا با موفقیت ثبت شد.";

        document.getElementById(
            "productName"
        ).value = "";

        document.getElementById(
            "productPrice"
        ).value = "";

        document.getElementById(
            "sellerName"
        ).value = "";

        document.getElementById(
            "sellerPhone"
        ).value = "";

        document.getElementById(
            "productDescription"
        ).value = "";

        document.getElementById(
            "isGift"
        ).checked = false;


        await loadProducts();


    } catch (error) {

        console.error(error);

        message.textContent =
            "❌ " + error.message;

    }

}


/* ==============================
   ADMIN LOGIN
================================ */

function showAdminLogin() {

    const login =
        document.getElementById("adminLoginBox");

    const panel =
        document.getElementById("adminPanel");

    login.classList.remove("hidden");

    panel.classList.add("hidden");

}


function adminLogin() {

    const number =
        document.getElementById("adminNumber").value.trim();

    const password =
        document.getElementById("adminPassword").value;

    const message =
        document.getElementById("adminMessage");


    if (!number || !password) {

        message.textContent =
            "هر دو رمز را وارد کنید.";

        return;
    }


    if (
        number !== ADMIN_NUMBER ||
        password !== ADMIN_PASSWORD
    ) {

        message.textContent =
            "❌ رمز مدیریت یا پسورد اشتباه است.";

        return;
    }


    sessionStorage.setItem(
        "zardaloo_admin",
        "1"
    );


    message.textContent =
        "✅ ورود موفق بود.";

    showAdminPanel();

}


function showAdminPanel() {

    const login =
        document.getElementById("adminLoginBox");

    const panel =
        document.getElementById("adminPanel");


    login.classList.add("hidden");

    panel.classList.remove("hidden");


    updateAdminStats();

}


/* ==============================
   ADMIN LOGOUT
================================ */

function adminLogout() {

    sessionStorage.removeItem(
        "zardaloo_admin"
    );

    showAdminLogin();

}


/* ==============================
   ADMIN STATS
================================ */

function updateAdminStats() {

    const productCount =
        document.getElementById(
            "adminProductCount"
        );

    const cartCount =
        document.getElementById(
            "adminCartCount"
        );

    const cartTotal =
        document.getElementById(
            "adminCartTotal"
        );


    if (productCount) {
        productCount.textContent =
            products.length;
    }


    if (cartCount) {

        cartCount.textContent =
            cart.reduce(
                (sum, item) =>
                    sum + item.quantity,
                0
            );

    }


    if (cartTotal) {

        const total =
            cart.reduce(
                (sum, item) =>
                    sum +
                    item.price *
                    item.quantity,
                0
            );

        cartTotal.textContent =
            formatPrice(total);

    }

}


/* ==============================
   ADMIN REQUEST
================================ */

async function adminRequest(
    path,
    options = {}
) {

    if (
        sessionStorage.getItem(
            "zardaloo_admin"
        ) !== "1"
    ) {

        throw new Error(
            "ابتدا وارد مدیریت شوید."
        );

    }


    const response =
        await fetch(
            ADMIN_FUNCTION_URL + path,
            {
                ...options,

                headers: {
                    "Content-Type":
                        "application/json",

                    "apikey":
                        SUPABASE_KEY,

                    "Authorization":
                        "Bearer " + SUPABASE_KEY,

                    ...(options.headers || {})
                }
            }
        );


    const data =
        await response.json().catch(
            () => ({})
        );


    if (!response.ok) {

        throw new Error(
            data.error ||
            data.message ||
            "درخواست مدیریت ناموفق بود."
        );

    }


    return data;

}


/* ==============================
   ADMIN PRODUCTS
================================ */

async function loadAdminProducts() {

    const content =
        document.getElementById(
            "adminContent"
        );

    content.innerHTML =
        `<div class="loading">
            در حال دریافت کالاها...
        </div>`;


    try {

        const data =
            await adminRequest(
                "/products"
            );


        const list =
            Array.isArray(data)
                ? data
                : data.products || [];


        if (!list.length) {

            content.innerHTML =
                `<div class="empty">
                    کالایی وجود ندارد.
                </div>`;

            return;
        }


        content.innerHTML = `

            <div class="admin-products">

                ${list.map(product => `

                    <div class="admin-product">

                        <strong>
                            ${escapeHTML(
                                String(
                                    product.name ??
                                    product.product_name ??
                                    "کالا"
                                )
                            )}
                        </strong>

                        <span>
                            ${formatPrice(
                                Number(
                                    product.price ?? 0
                                )
                            )}
                            تومان
                        </span>

                        <button
                            class="danger"
                            onclick="deleteAdminProduct('${escapeAttribute(String(product.id ?? product.product_id ?? ""))}')"
                        >
                            حذف
                        </button>

                    </div>

                `).join("")}

            </div>

        `;


    } catch (error) {

        content.innerHTML =
            `<div class="error">
                ${escapeHTML(error.message)}
            </div>`;

    }

}


/* ==============================
   DELETE PRODUCT
================================ */

async function deleteAdminProduct(id) {

    if (!id) return;


    const confirmed =
        confirm(
            "آیا از حذف این کالا مطمئن هستید؟"
        );


    if (!confirmed) return;


    try {

        await adminRequest(
            "/products?id=" +
            encodeURIComponent(id),
            {
                method: "DELETE"
            }
        );


        alert(
            "کالا حذف شد."
        );


        await loadProducts();

        await loadAdminProducts();


    } catch (error) {

        alert(
            error.message
        );

    }

}


/* ==============================
   ADMIN REPORTS
================================ */

async function loadAdminReports() {

    const content =
        document.getElementById(
            "adminContent"
        );


    content.innerHTML =
        `<div class="loading">
            در حال دریافت گزارش...
        </div>`;


    try {

        const data =
            await adminRequest(
                "/reports"
            );


        content.innerHTML = `

            <div class="report-card">

                <h3>📊 گزارش مدیریت</h3>

                <pre>
${escapeHTML(
    JSON.stringify(
        data,
        null,
        2
    )
)}
                </pre>

            </div>

        `;


    } catch (error) {

        content.innerHTML =
            `<div class="error">
                ${escapeHTML(error.message)}
            </div>`;

    }

}


/* ==============================
   HELPERS
================================ */

function formatPrice(number) {

    return Number(
        number || 0
    ).toLocaleString(
        "fa-IR"
    );

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'");

}
