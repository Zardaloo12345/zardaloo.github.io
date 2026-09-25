"use strict";

/* ==================================================
   ZARDALOO CONFIG
================================================== */

const SUPABASE_URL =
    "https://ovqldknqpaiczrddcrxp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_VDZ_tgoMgYRI7K419ieDKw_y29xeXA2";

const PRODUCTS_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/products";

const ADMIN_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/admin-reports";


/* ==================================================
   ADMIN LOGIN
================================================== */

const ADMIN_NUMBER = "0994051777";
const ADMIN_PASSWORD = "ERFAN";


/* ==================================================
   STORAGE
================================================== */

const CART_KEY = "zardaloo_cart";
const THEME_KEY = "zardaloo_theme";
const DISCOUNT_KEY = "zardaloo_discount";
const ADMIN_SESSION_KEY = "zardaloo_admin";
const ADMIN_TOKEN_KEY = "zardaloo_admin_token";


/* ==================================================
   GLOBAL DATA
================================================== */

let products = [];
let cart = loadCart();
let activeDiscount = loadDiscount();


/* ==================================================
   START
================================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadTheme();

    renderCart();

    loadProducts();

    const loggedIn =
        sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";

    const token =
        sessionStorage.getItem(ADMIN_TOKEN_KEY);

    if (loggedIn && token) {
        showAdminPanel();
    }

});


/* ==================================================
   PAGE SYSTEM
================================================== */

function showPage(pageName) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page =
        document.getElementById(pageName);

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

        const loggedIn =
            sessionStorage.getItem(
                ADMIN_SESSION_KEY
            ) === "1";

        const token =
            sessionStorage.getItem(
                ADMIN_TOKEN_KEY
            );

        if (loggedIn && token) {
            showAdminPanel();
        } else {
            showAdminLogin();
        }

    }

}


/* ==================================================
   THEME
================================================== */

function toggleTheme() {

    document.body.classList.toggle("dark");

    const theme =
        document.body.classList.contains("dark")
            ? "dark"
            : "light";

    localStorage.setItem(
        THEME_KEY,
        theme
    );

}


function loadTheme() {

    const theme =
        localStorage.getItem(THEME_KEY);

    if (theme === "dark") {
        document.body.classList.add("dark");
    }

}


/* ==================================================
   PRODUCTS
================================================== */

async function loadProducts() {

    const container =
        document.getElementById("products");

    if (!container) {
        return;
    }

    container.innerHTML =
        `<div class="loading">
            در حال دریافت کالاها...
        </div>`;


    try {

        const response =
            await fetch(
                PRODUCTS_FUNCTION_URL,
                {
                    method: "GET",

                    headers: {
                        "apikey":
                            SUPABASE_KEY
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
                "دریافت کالاها ناموفق بود."
            );

        }


        if (Array.isArray(data)) {

            products = data;

        } else if (
            Array.isArray(data.products)
        ) {

            products = data.products;

        } else {

            products = [];

        }


        renderProducts(products);

        renderGifts();

        updateAdminStats();


    } catch (error) {

        console.error(
            "LOAD PRODUCTS ERROR:",
            error
        );

        container.innerHTML = `
            <div class="error">
                دریافت کالاها انجام نشد.
                <br>
                ${escapeHTML(error.message)}
            </div>
        `;

    }

}


/* ==================================================
   PRODUCT RENDER
================================================== */

function renderProducts(list) {

    const container =
        document.getElementById("products");

    if (!container) {
        return;
    }


    if (!Array.isArray(list) || !list.length) {

        container.innerHTML =
            `<div class="empty">
                کالایی پیدا نشد.
            </div>`;

        return;
    }


    container.innerHTML =
        list.map(productCard).join("");

}


/* ==================================================
   GIFTS
================================================== */

function renderGifts() {

    const container =
        document.getElementById(
            "giftProducts"
        );

    if (!container) {
        return;
    }


    const gifts =
        products.filter(product => {

            return Boolean(
                product.is_gift ??
                product.isGift
            );

        });


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


/* ==================================================
   PRODUCT CARD
================================================== */

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
                ${escapeHTML(
                    String(description)
                )}
            </p>

            <div class="price">
                ${formatPrice(price)}
                تومان
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
                    ? `
                        <div class="gift-badge">
                            🎁 اشانتیون
                        </div>
                    `
                    : ""
            }

            <button
                class="primary"
                onclick="addToCart(
                    '${escapeAttribute(String(id))}'
                )"
            >
                افزودن به سبد
            </button>

        </article>
    `;

}


/* ==================================================
   SEARCH
================================================== */

function searchProducts() {

    const input =
        document.getElementById(
            "searchInput"
        );

    if (!input) {
        return;
    }


    const query =
        input.value
            .trim()
            .toLowerCase();


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


/* ==================================================
   CART
================================================== */

function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                CART_KEY
            );

        if (!saved) {
            return [];
        }

        const parsed =
            JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [];

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


/* ==================================================
   ADD TO CART
================================================== */

function addToCart(id) {

    const product =
        products.find(product => {

            const productId =
                product.id ??
                product.product_id;

            return String(productId) ===
                String(id);

        });


    if (!product) {

        alert(
            "کالا پیدا نشد."
        );

        return;
    }


    const existing =
        cart.find(item => {

            return String(item.id) ===
                String(id);

        });


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
                Number(
                    product.price ??
                    0
                ),

            quantity: 1

        });

    }


    saveCart();

    renderCart();

    alert(
        "کالا به سبد خرید اضافه شد."
    );

}


/* ==================================================
   REMOVE FROM CART
================================================== */

function removeFromCart(id) {

    cart =
        cart.filter(item => {

            return String(item.id) !==
                String(id);

        });


    saveCart();

    renderCart();

}


/* ==================================================
   QUANTITY
================================================== */

function changeQuantity(
    id,
    amount
) {

    const item =
        cart.find(item => {

            return String(item.id) ===
                String(id);

        });


    if (!item) {
        return;
    }


    item.quantity += amount;


    if (item.quantity <= 0) {

        cart =
            cart.filter(cartItem => {

                return String(
                    cartItem.id
                ) !== String(id);

            });

    }


    saveCart();

    renderCart();

}


/* ==================================================
   CLEAR CART
================================================== */

function clearCart() {

    cart = [];

    saveCart();

    renderCart();

}


/* ==================================================
   CART RENDER
================================================== */

function renderCart() {

    const container =
        document.getElementById(
            "cartItems"
        );

    const summary =
        document.getElementById(
            "cartSummary"
        );


    if (!container || !summary) {
        return;
    }


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
                Number(item.price || 0) *
                Number(item.quantity || 0);


            return `
                <div class="cart-item">

                    <div>

                        <strong>
                            ${escapeHTML(
                                item.name
                            )}
                        </strong>

                        <div>
                            قیمت واحد:
                            ${formatPrice(
                                item.price
                            )}
                            تومان
                        </div>

                        <div>
                            مجموع:
                            ${formatPrice(
                                total
                            )}
                            تومان
                        </div>

                    </div>


                    <div class="quantity">

                        <button
                            onclick="changeQuantity(
                                '${escapeAttribute(item.id)}',
                                1
                            )"
                        >
                            +
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            onclick="changeQuantity(
                                '${escapeAttribute(item.id)}',
                                -1
                            )"
                        >
                            -
                        </button>

                    </div>


                    <button
                        class="danger"
                        onclick="removeFromCart(
                            '${escapeAttribute(item.id)}'
                        )"
                    >
                        حذف
                    </button>

                </div>
            `;

        }).join("");


    const subtotal =
        cart.reduce(
            (sum, item) => {

                return sum +
                    Number(item.price || 0) *
                    Number(item.quantity || 0);

            },
            0
        );


    let discountAmount = 0;


    if (activeDiscount) {

        discountAmount =
            subtotal *
            Number(activeDiscount.percent) /
            100;

    }


    const finalPrice =
        subtotal -
        discountAmount;


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
                        کد
                        ${escapeHTML(
                            activeDiscount.code
                        )}
                        با
                        ${activeDiscount.percent}%
                        تخفیف فعال است.
                    </div>
                `
                : ""
        }

    `;


    updateAdminStats();

}


/* ==================================================
   DISCOUNTS
================================================== */

const discountCodes = {

    ZARDALOO10: 10,

    ZARDALOO20: 20

};


function loadDiscount() {

    try {

        const saved =
            localStorage.getItem(
                DISCOUNT_KEY
            );

        if (!saved) {
            return null;
        }

        return JSON.parse(saved);

    } catch {

        return null;

    }

}


function applyDiscountCode() {

    const input =
        document.getElementById(
            "discountInput"
        );

    const message =
        document.getElementById(
            "discountMessage"
        );


    if (!input || !message) {
        return;
    }


    const code =
        input.value
            .trim()
            .toUpperCase();


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
        JSON.stringify(
            activeDiscount
        )
    );


    message.textContent =
        `${percent}% تخفیف اعمال شد.`;

    renderCart();

}


/* ==================================================
   REGISTER PRODUCT
================================================== */

async function registerProduct() {

    const nameInput =
        document.getElementById(
            "productName"
        );

    const priceInput =
        document.getElementById(
            "productPrice"
        );

    const sellerNameInput =
        document.getElementById(
            "sellerName"
        );

    const sellerPhoneInput =
        document.getElementById(
            "sellerPhone"
        );

    const descriptionInput =
        document.getElementById(
            "productDescription"
        );

    const giftInput =
        document.getElementById(
            "isGift"
        );

    const message =
        document.getElementById(
            "registerMessage"
        );


    if (
        !nameInput ||
        !priceInput ||
        !sellerNameInput ||
        !sellerPhoneInput ||
        !descriptionInput ||
        !giftInput ||
        !message
    ) {

        return;
    }


    const name =
        nameInput.value.trim();


    const price =
        Number(
            priceInput.value
        );


    const sellerName =
        sellerNameInput.value.trim();


    const sellerPhone =
        sellerPhoneInput.value.trim();


    const description =
        descriptionInput.value.trim();


    const isGift =
        giftInput.checked;


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

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY

                    },

                    body:
                        JSON.stringify(
                            payload
                        )
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


        nameInput.value = "";

        priceInput.value = "";

        sellerNameInput.value = "";

        sellerPhoneInput.value = "";

        descriptionInput.value = "";

        giftInput.checked = false;


        await loadProducts();


    } catch (error) {

        console.error(
            "REGISTER PRODUCT ERROR:",
            error
        );

        message.textContent =
            "❌ " + error.message;

    }

}


/* ==================================================
   ADMIN LOGIN PAGE
================================================== */

function showAdminLogin() {

    const login =
        document.getElementById(
            "adminLoginBox"
        );

    const panel =
        document.getElementById(
            "adminPanel"
        );


    if (login) {
        login.classList.remove(
            "hidden"
        );
    }


    if (panel) {
        panel.classList.add(
            "hidden"
        );
    }

}


/* ==================================================
   ADMIN LOGIN
================================================== */

async function adminLogin() {

    const numberInput =
        document.getElementById(
            "adminNumber"
        );

    const passwordInput =
        document.getElementById(
            "adminPassword"
        );

    const message =
        document.getElementById(
            "adminMessage"
        );


    if (
        !numberInput ||
        !passwordInput ||
        !message
    ) {

        return;
    }


    const number =
        numberInput.value.trim();


    const password =
        passwordInput.value;


    if (!number || !password) {

        message.textContent =
            "شماره مدیریت و رمز عبور را وارد کنید.";

        return;
    }


    /*
       اول بررسی محلی
       تا اطلاعات اشتباه
       بیهوده به سرور ارسال نشود.
    */

    if (
        number !== ADMIN_NUMBER ||
        password !== ADMIN_PASSWORD
    ) {

        message.textContent =
            "❌ شماره مدیریت یا رمز عبور اشتباه است.";

        return;
    }


    message.textContent =
        "در حال ورود به مدیریت...";


    try {

        const response =
            await fetch(
                ADMIN_FUNCTION_URL +
                "/login",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY

                    },

                    body:
                        JSON.stringify({

                            number:
                                number,

                            password:
                                password

                        })

                }
            );


        const data =
            await response.json().catch(
                () => ({})
            );


        if (
            !response.ok ||
            !data.ok
        ) {

            throw new Error(
                data.error ||
                "ورود به مدیریت ناموفق بود."
            );

        }


        const token =
            String(
                data.token ||
                data.admin_token ||
                data.adminToken ||
                ""
            ).trim();


        if (!token) {

            throw new Error(
                "سرور توکن مدیریت ارسال نکرد."
            );

        }


        sessionStorage.setItem(
            ADMIN_SESSION_KEY,
            "1"
        );


        sessionStorage.setItem(
            ADMIN_TOKEN_KEY,
            token
        );


        message.textContent =
            "✅ ورود موفق بود.";


        passwordInput.value = "";


        showAdminPanel();


    } catch (error) {

        console.error(
            "ADMIN LOGIN ERROR:",
            error
        );


        message.textContent =
            "❌ " +
            error.message;

    }

}


/* ==================================================
   ADMIN PANEL
================================================== */

function showAdminPanel() {

    const login =
        document.getElementById(
            "adminLoginBox"
        );

    const panel =
        document.getElementById(
            "adminPanel"
        );


    if (login) {
        login.classList.add(
            "hidden"
        );
    }


    if (panel) {
        panel.classList.remove(
            "hidden"
        );
    }


    updateAdminStats();

}


/* ==================================================
   ADMIN LOGOUT
================================================== */

function adminLogout() {

    sessionStorage.removeItem(
        ADMIN_SESSION_KEY
    );

    sessionStorage.removeItem(
        ADMIN_TOKEN_KEY
    );


    const content =
        document.getElementById(
            "adminContent"
        );


    if (content) {
        content.innerHTML = "";
    }


    showAdminLogin();

}


/* ==================================================
   ADMIN STATS
================================================== */

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
                (sum, item) => {

                    return sum +
                        Number(
                            item.quantity || 0
                        );

                },
                0
            );

    }


    if (cartTotal) {

        const total =
            cart.reduce(
                (sum, item) => {

                    return sum +
                        Number(
                            item.price || 0
                        ) *
                        Number(
                            item.quantity || 0
                        );

                },
                0
            );


        cartTotal.textContent =
            formatPrice(total);

    }

}


/* ==================================================
   ADMIN REQUEST
================================================== */

async function adminRequest(
    path,
    options = {}
) {

    const loggedIn =
        sessionStorage.getItem(
            ADMIN_SESSION_KEY
        ) === "1";


    if (!loggedIn) {

        throw new Error(
            "ابتدا وارد مدیریت شوید."
        );

    }


    const adminToken =
        sessionStorage.getItem(
            ADMIN_TOKEN_KEY
        ) || "";


    if (!adminToken) {

        sessionStorage.removeItem(
            ADMIN_SESSION_KEY
        );


        throw new Error(
            "توکن مدیریت پیدا نشد. دوباره وارد شوید."
        );

    }


    const headers = {

        "Content-Type":
            "application/json",

        "apikey":
            SUPABASE_KEY,

        "x-admin-token":
            adminToken

    };


    if (
        options.headers
    ) {

        Object.assign(
            headers,
            options.headers
        );

    }


    const response =
        await fetch(
            ADMIN_FUNCTION_URL + path,
            {
                ...options,
                headers: headers
            }
        );


    const data =
        await response.json().catch(
            () => ({})
        );


    if (!response.ok) {

        if (
            response.status === 401
        ) {

            sessionStorage.removeItem(
                ADMIN_SESSION_KEY
            );

            sessionStorage.removeItem(
                ADMIN_TOKEN_KEY
            );

        }


        throw new Error(
            data.error ||
            data.message ||
            "درخواست مدیریت ناموفق بود."
        );

    }


    return data;

}


/* ==================================================
   ADMIN DASHBOARD
================================================== */

async function loadAdminDashboard() {

    const content =
        document.getElementById(
            "adminContent"
        );


    if (!content) {
        return;
    }


    content.innerHTML =
        `<div class="loading">
            در حال دریافت اطلاعات مدیریت...
        </div>`;


    try {

        const data =
            await adminRequest(
                "/dashboard"
            );


        content.innerHTML = `

            <div class="admin-dashboard">

                <div class="admin-card">

                    <h3>
                        📦 تعداد کالاها
                    </h3>

                    <strong>
                        ${formatPrice(
                            data.products_count || 0
                        )}
                    </strong>

                </div>


                <div class="admin-card">

                    <h3>
                        📊 تعداد گزارش‌ها
                    </h3>

                    <strong>
                        ${formatPrice(
                            data.reports_count || 0
                        )}
                    </strong>

                </div>

            </div>

        `;


    } catch (error) {

        content.innerHTML =
            `<div class="error">
                ${escapeHTML(
                    error.message
                )}
            </div>`;

    }

}


/* ==================================================
   ADMIN PRODUCTS
================================================== */

async function loadAdminProducts() {

    const content =
        document.getElementById(
            "adminContent"
        );


    if (!content) {
        return;
    }


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
                : (
                    Array.isArray(
                        data.products
                    )
                        ? data.products
                        : []
                );


        if (!list.length) {

            content.innerHTML =
                `<div class="empty">
                    کالایی وجود ندارد.
                </div>`;

            return;
        }


        content.innerHTML = `

            <div class="admin-products">

                ${list.map(
                    product => {

                        const id =
                            product.id ??
                            product.product_id ??
                            "";


                        const name =
                            product.name ??
                            product.product_name ??
                            "کالا";


                        const price =
                            Number(
                                product.price ??
                                0
                            );


                        return `

                            <div class="admin-product">

                                <strong>
                                    ${escapeHTML(
                                        String(name)
                                    )}
                                </strong>

                                <span>
                                    ${formatPrice(
                                        price
                                    )}
                                    تومان
                                </span>

                                <button
                                    class="danger"
                                    onclick="deleteAdminProduct(
                                        '${escapeAttribute(
                                            String(id)
                                        )}'
                                    )"
                                >
                                    حذف
                                </button>

                            </div>

                        `;

                    }
                ).join("")}

            </div>

        `;


    } catch (error) {

        content.innerHTML =
            `<div class="error">
                ${escapeHTML(
                    error.message
                )}
            </div>`;

    }

}


/* ==================================================
   DELETE ADMIN PRODUCT
================================================== */

async function deleteAdminProduct(id) {

    if (!id) {
        return;
    }


    const confirmed =
        confirm(
            "آیا از حذف این کالا مطمئن هستید؟"
        );


    if (!confirmed) {
        return;
    }


    try {

        await adminRequest(
            "/products?id=" +
            encodeURIComponent(id),
            {
                method: "DELETE"
            }
        );


        alert(
            "✅ کالا حذف شد."
        );


        await loadProducts();

        await loadAdminProducts();


    } catch (error) {

        alert(
            error.message
        );

    }

}


/* ==================================================
   ADMIN REPORTS
================================================== */

async function loadAdminReports() {

    const content =
        document.getElementById(
            "adminContent"
        );


    if (!content) {
        return;
    }


    content.innerHTML =
        `<div class="loading">
            در حال دریافت گزارش‌ها...
        </div>`;


    try {

        const data =
            await adminRequest(
                "/reports"
            );


        const reports =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(
                        data.reports
                    )
                        ? data.reports
                        : []
                );


        if (!reports.length) {

            content.innerHTML =
                `<div class="empty">
                    گزارشی وجود ندارد.
                </div>`;

            return;
        }


        content.innerHTML = `

            <div class="admin-reports">

                ${reports.map(
                    report => {

                        const id =
                            report.id ??
                            "";


                        const number =
                            report.zardaloo_number ??
                            "بدون شماره";


                        const reason =
                            report.reason ??
                            "بدون دلیل";


                        const details =
                            report.details ??
                            "";


                        const phone =
                            report.phone ??
                            "ثبت نشده";


                        return `

                            <div class="report-card">

                                <h3>
                                    📋 گزارش
                                </h3>

                                <p>
                                    <strong>
                                        شماره کالا:
                                    </strong>

                                    ${escapeHTML(
                                        String(number)
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        دلیل:
                                    </strong>

                                    ${escapeHTML(
                                        String(reason)
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        توضیحات:
                                    </strong>

                                    ${escapeHTML(
                                        String(details)
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        شماره تماس:
                                    </strong>

                                    ${escapeHTML(
                                        String(phone)
                                    )}
                                </p>

                                <div class="admin-report-actions">

                                    <button
                                        class="primary"
                                        onclick="updateReportStatus(
                                            '${escapeAttribute(
                                                String(id)
                                            )}',
                                            'reviewed'
                                        )"
                                    >
                                        تأیید گزارش
                                    </button>

                                    <button
                                        class="danger"
                                        onclick="updateReportStatus(
                                            '${escapeAttribute(
                                                String(id)
                                            )}',
                                            'rejected'
                                        )"
                                    >
                                        رد گزارش
                                    </button>

                                </div>

                            </div>

                        `;

                    }
                ).join("")}

            </div>

        `;


    } catch (error) {

        content.innerHTML =
            `<div class="error">
                ${escapeHTML(
                    error.message
                )}
            </div>`;

    }

}


/* ==================================================
   UPDATE REPORT
================================================== */

async function updateReportStatus(
    id,
    action
) {

    if (!id) {
        return;
    }


    try {

        await adminRequest(
            "/report",
            {
                method: "PATCH",

                body:
                    JSON.stringify({

                        id: id,

                        action: action

                    })
            }
        );


        alert(
            "✅ گزارش با موفقیت پردازش شد."
        );


        await loadAdminReports();


    } catch (error) {

        alert(
            error.message
        );

    }

}


/* ==================================================
   FORMAT PRICE
================================================== */

function formatPrice(number) {

    return Number(
        number || 0
    ).toLocaleString(
        "fa-IR"
    );

}


/* ==================================================
   ESCAPE HTML
================================================== */

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* ==================================================
   ESCAPE ATTRIBUTE
================================================== */

function escapeAttribute(value) {

    return String(value)

        .replaceAll(
            "\\",
            "\\\\"
        )

        .replaceAll(
            "'",
            "\\'"
        );

}
