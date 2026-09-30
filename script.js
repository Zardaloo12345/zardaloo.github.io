"use strict";

/* =========================================================
   ZARDALOO CONFIG
========================================================= */

const SUPABASE_URL =
    "https://ovqldknqpaiczrddcrxp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_VDZ_tgoMgYRI7K419ieDKw_y29xeXA2";

const PRODUCTS_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/products";

const ADMIN_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/admin-reports";


/* =========================================================
   ADMIN
========================================================= */

const ADMIN_NUMBER = "0994051777";
const ADMIN_PASSWORD = "ERFAN";


/* =========================================================
   STORAGE
========================================================= */

const CART_KEY = "zardaloo_cart";
const USER_KEY = "zardaloo_user";
const THEME_KEY = "zardaloo_theme";
const DISCOUNT_KEY = "zardaloo_discount";
const ADMIN_SESSION_KEY = "zardaloo_admin";
const ADMIN_TOKEN_KEY = "zardaloo_admin_token";


/* =========================================================
   DATA
========================================================= */

let products = [];
let cart = loadCart();
let activeDiscount = loadDiscount();

let selectedProfile = "👤";
let profileImageData = "";


/* =========================================================
   START
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadTheme();

    loadSavedUser();

    renderCart();

    loadProducts();

    updateDateTime();

    setInterval(updateDateTime, 1000);

    if (
        sessionStorage.getItem(ADMIN_SESSION_KEY) === "1" &&
        sessionStorage.getItem(ADMIN_TOKEN_KEY)
    ) {
        showAdminPanel();
    }

});


/* =========================================================
   PAGE
========================================================= */

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

        if (
            sessionStorage.getItem(ADMIN_SESSION_KEY) === "1" &&
            sessionStorage.getItem(ADMIN_TOKEN_KEY)
        ) {
            showAdminPanel();
        } else {
            showAdminLogin();
        }

    }

}


/* =========================================================
   THEME
========================================================= */

function toggleTheme() {

    document.body.classList.toggle("dark");

    localStorage.setItem(
        THEME_KEY,
        document.body.classList.contains("dark")
            ? "dark"
            : "light"
    );

}


function loadTheme() {

    if (
        localStorage.getItem(THEME_KEY) === "dark"
    ) {
        document.body.classList.add("dark");
    }

}


/* =========================================================
   USER PROFILE
========================================================= */

function loadSavedUser() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(USER_KEY) || "null"
            );

        if (!saved) {
            return;
        }

        document.getElementById("userName").value =
            saved.name || "";

        document.getElementById("userPhone").value =
            saved.phone || "";

        document.getElementById("userZardalooNumber").value =
            saved.zardaloo_number || "";

        selectedProfile =
            saved.profile || "👤";

        profileImageData =
            saved.image || "";

        renderProfilePreview();

    } catch (error) {
        console.error(error);
    }

}


function saveUserProfile() {

    const name =
        document.getElementById("userName").value.trim();

    const phone =
        document.getElementById("userPhone").value.trim();

    const zardalooNumber =
        document.getElementById(
            "userZardalooNumber"
        ).value.trim();

    const message =
        document.getElementById("profileMessage");


    if (!name || !phone || !zardalooNumber) {

        message.textContent =
            "لطفاً نام، شماره تماس و شماره زردآلو را وارد کنید.";

        return;
    }


    localStorage.setItem(
        USER_KEY,
        JSON.stringify({
            name: name,
            phone: phone,
            zardaloo_number: zardalooNumber,
            profile: selectedProfile,
            image: profileImageData
        })
    );


    message.textContent =
        "✅ اطلاعات شما ذخیره شد.";

}


function chooseSuggestedProfile(profile) {

    selectedProfile = profile;

    profileImageData = "";

    renderProfilePreview();

}


function previewProfileImage(event) {

    const file =
        event.target.files &&
        event.target.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {

        profileImageData =
            reader.result;

        selectedProfile = "";

        renderProfilePreview();

    };

    reader.readAsDataURL(file);

}


function renderProfilePreview() {

    const preview =
        document.getElementById("profilePreview");

    if (!preview) {
        return;
    }

    if (profileImageData) {

        preview.innerHTML =
            `<img src="${profileImageData}" alt="پروفایل">`;

    } else {

        preview.textContent =
            selectedProfile || "👤";

    }

}


/* =========================================================
   PRODUCTS
========================================================= */

async function loadProducts() {

    const container =
        document.getElementById("products");

    if (!container) {
        return;
    }

    container.innerHTML =
        `<div class="loading">در حال دریافت کالاها...</div>`;


    try {

        const response =
            await fetch(
                PRODUCTS_FUNCTION_URL,
                {
                    method: "GET",
                    headers: {
                        "apikey": SUPABASE_KEY
                    }
                }
            );


        const data =
            await response.json().catch(() => ({}));


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

        updateAdminStats();


    } catch (error) {

        console.error(error);

        container.innerHTML =
            `<div class="error">
                دریافت کالاها انجام نشد.
                <br>
                ${escapeHTML(error.message)}
            </div>`;

    }

}


/* =========================================================
   FILTER
========================================================= */

function filterProducts() {

    const name =
        document.getElementById("searchName")
            .value
            .trim()
            .toLowerCase();

    const seller =
        document.getElementById("searchSeller")
            .value
            .trim()
            .toLowerCase();

    const from =
        Number(
            document.getElementById("priceFrom").value
        ) || 0;

    const to =
        Number(
            document.getElementById("priceTo").value
        ) || Infinity;

    const gift =
        document.querySelector(
            'input[name="giftFilter"]:checked'
        )?.value || "all";


    const result =
        products.filter(product => {

            const productName =
                String(
                    product.name ??
                    product.product_name ??
                    ""
                ).toLowerCase();

            const productSeller =
                String(
                    product.seller_name ??
                    product.sellerName ??
                    ""
                ).toLowerCase();

            const price =
                Number(product.price || 0);

            const isGift =
                Boolean(
                    product.is_gift ??
                    product.isGift
                );


            if (
                name &&
                !productName.includes(name)
            ) {
                return false;
            }

            if (
                seller &&
                !productSeller.includes(seller)
            ) {
                return false;
            }

            if (
                price < from ||
                price > to
            ) {
                return false;
            }

            if (
                gift === "yes" &&
                !isGift
            ) {
                return false;
            }

            if (
                gift === "no" &&
                isGift
            ) {
                return false;
            }

            return true;

        });


    renderProducts(result);

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts(list) {

    const container =
        document.getElementById("products");

    if (!container) {
        return;
    }

    if (!list.length) {

        container.innerHTML =
            `<div class="empty">
                کالایی پیدا نشد.
            </div>`;

        return;
    }

    container.innerHTML =
        list.map(productCard).join("");

}


function renderGifts() {

    const container =
        document.getElementById("giftProducts");

    if (!container) {
        return;
    }


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
        "";


    const name =
        product.name ??
        product.product_name ??
        "کالای بدون نام";


    const price =
        Number(product.price || 0);


    const seller =
        product.seller_name ??
        product.sellerName ??
        "فروشنده";


    const phone =
        product.seller_phone ??
        product.sellerPhone ??
        product.phone ??
        "ثبت نشده";


    const description =
        product.description ?? "";


    const gift =
        Boolean(
            product.is_gift ??
            product.isGift
        );


    const giftDescription =
        product.gift_description ??
        product.giftDescription ??
        "";


    const currentUser =
        getCurrentUser();


    const canDelete =
        currentUser &&
        (
            String(
                product.zardaloo_number ??
                product.seller_zardaloo_number ??
                product.seller_number ??
                ""
            ) ===
            String(
                currentUser.zardaloo_number
            )
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

                    ${
                        giftDescription
                        ? `
                            <div class="gift-description">
                                ${escapeHTML(
                                    String(giftDescription)
                                )}
                            </div>
                        `
                        : ""
                    }
                `
                : ""
            }


            <button
                class="primary"
                onclick="addToCart('${escapeAttribute(String(id))}')"
            >
                افزودن به سبد
            </button>


            <button
                onclick="openReportForSeller('${escapeAttribute(
                    String(
                        product.seller_zardaloo_number ??
                        product.seller_number ??
                        ""
                    )
                )}')"
            >
                🚨 گزارش فروشنده
            </button>


            ${
                canDelete
                ? `
                    <button
                        class="danger"
                        onclick="deleteOwnProduct('${escapeAttribute(
                            String(id)
                        )}')"
                    >
                        🗑️ حذف کالای من
                    </button>
                `
                : ""
            }

        </article>
    `;

}


/* =========================================================
   REGISTER
========================================================= */

function toggleGiftDescription() {

    const checkbox =
        document.getElementById("isGift");

    const description =
        document.getElementById("giftDescription");


    if (checkbox.checked) {

        description.classList.remove("hidden");

    } else {

        description.classList.add("hidden");

        description.value = "";

    }

}


async function registerProduct() {

    const name =
        document.getElementById("productName")
            .value.trim();

    const price =
        Number(
            document.getElementById("productPrice")
                .value
        );

    const sellerName =
        document.getElementById("sellerName")
            .value.trim();

    const sellerPhone =
        document.getElementById("sellerPhone")
            .value.trim();

    const description =
        document.getElementById("productDescription")
            .value.trim();

    const isGift =
        document.getElementById("isGift").checked;

    const giftDescription =
        document.getElementById("giftDescription")
            .value.trim();

    const message =
        document.getElementById("registerMessage");


    const user =
        getCurrentUser();


    if (!name) {
        message.textContent = "نام کالا را وارد کنید.";
        return;
    }

    if (!price || price <= 0) {
        message.textContent = "قیمت کالا صحیح نیست.";
        return;
    }

    if (!sellerName) {
        message.textContent = "نام فروشنده را وارد کنید.";
        return;
    }

    if (!sellerPhone) {
        message.textContent = "شماره فروشنده را وارد کنید.";
        return;
    }

    if (!user) {
        message.textContent =
            "ابتدا اطلاعات کاربری خود را در صفحه اصلی ثبت کنید.";
        return;
    }


    const payload = {

        name: name,

        price: price,

        seller_name: sellerName,

        seller_phone: sellerPhone,

        seller_zardaloo_number:
            user.zardaloo_number,

        zardaloo_number:
            user.zardaloo_number,

        description: description,

        is_gift: isGift,

        gift_description:
            isGift
            ? giftDescription
            : ""

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
                        JSON.stringify(payload)
                }
            );


        const data =
            await response.json().catch(() => ({}));


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "ثبت کالا ناموفق بود."
            );

        }


        message.textContent =
            "✅ کالا با موفقیت ثبت شد.";


        document.getElementById("productName").value = "";
        document.getElementById("productPrice").value = "";
        document.getElementById("sellerName").value = "";
        document.getElementById("sellerPhone").value = "";
        document.getElementById("productDescription").value = "";
        document.getElementById("giftDescription").value = "";
        document.getElementById("isGift").checked = false;

        toggleGiftDescription();

        await loadProducts();


    } catch (error) {

        console.error(error);

        message.textContent =
            "❌ " + error.message;

    }

}


/* =========================================================
   CART
========================================================= */

function loadCart() {

    try {

        const saved =
            localStorage.getItem(CART_KEY);

        if (!saved) {
            return [];
        }

        const data =
            JSON.parse(saved);

        return Array.isArray(data)
            ? data
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
                Number(product.price || 0),

            quantity: 1

        });

    }


    saveCart();

    renderCart();

    alert("کالا به سبد خرید اضافه شد.");

}


function changeQuantity(id, amount) {

    const item =
        cart.find(item =>
            String(item.id) === String(id)
        );


    if (!item) {
        return;
    }


    item.quantity += amount;


    if (item.quantity <= 0) {

        cart =
            cart.filter(item =>
                String(item.id) !== String(id)
            );

    }


    saveCart();

    renderCart();

}


function removeFromCart(id) {

    cart =
        cart.filter(item =>
            String(item.id) !== String(id)
        );

    saveCart();

    renderCart();

}


function clearCart() {

    cart = [];

    saveCart();

    renderCart();

}


/* =========================================================
   DISCOUNT
========================================================= */

const discountCodes = {

    ZARDALOO10: 10,

    ZARDALOO20: 20,

    ZARDALOO50: 50,

    ZARDALOO100: 100

};


function loadDiscount() {

    try {

        return JSON.parse(
            localStorage.getItem(DISCOUNT_KEY) || "null"
        );

    } catch {

        return null;

    }

}


function applyDiscountCode() {

    const input =
        document.getElementById("cartDiscount");

    const message =
        document.getElementById("cartDiscountMessage");


    const code =
        input.value.trim().toUpperCase();


    if (!code) {

        message.textContent =
            "کد تخفیف را وارد کنید.";

        return;

    }


    const percent =
        discountCodes[code];


    if (percent === undefined) {

        message.textContent =
            "❌ کد تخفیف معتبر نیست.";

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
        `✅ ${percent}% تخفیف اعمال شد.`;


    renderCart();

}


function renderCart() {

    const container =
        document.getElementById("cartItems");

    const summary =
        document.getElementById("cartSummary");


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
            (sum,item) =>
                sum +
                Number(item.price || 0) *
                Number(item.quantity || 0),
            0
        );


    const discountAmount =
        activeDiscount
        ? subtotal *
          Number(activeDiscount.percent) /
          100
        : 0;


    const finalPrice =
        Math.max(
            0,
            subtotal - discountAmount
        );


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

        <div class="final-price">
            مبلغ نهایی:
            ${formatPrice(finalPrice)}
            تومان
        </div>


        <div class="discount-box">

            <input
                id="cartDiscount"
                type="text"
                placeholder="کد تخفیف"
            >

            <button
                class="primary"
                onclick="applyDiscountCode()"
            >
                اعمال کد تخفیف
            </button>

            <div
                id="cartDiscountMessage"
                class="message"
            ></div>

        </div>

    `;

    updateAdminStats();

}


/* =========================================================
   MESSAGES
========================================================= */

async function sendMessage() {

    const number =
        document.getElementById("messageNumber")
            .value.trim();

    const text =
        document.getElementById("messageText")
            .value.trim();

    const result =
        document.getElementById("messageResult");

    const user =
        getCurrentUser();


    if (!user) {

        result.textContent =
            "ابتدا اطلاعات کاربری خود را ثبت کنید.";

        return;

    }


    if (!number || !text) {

        result.textContent =
            "شماره زردآلو و متن پیام را وارد کنید.";

        return;

    }


    /*
      نام Edge Function پیام‌ها:
      messages

      ساختار payload برای Supabase:
      sender_zardaloo_number
      receiver_zardaloo_number
      message
    */

    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/functions/v1/messages",
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

                            sender_zardaloo_number:
                                user.zardaloo_number,

                            receiver_zardaloo_number:
                                number,

                            message:
                                text

                        })
                }
            );


        const data =
            await response.json().catch(() => ({}));


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "ارسال پیام ناموفق بود."
            );

        }


        result.textContent =
            "✅ پیام ارسال شد.";

        document.getElementById(
            "messageText"
        ).value = "";


    } catch (error) {

        result.textContent =
            "❌ " + error.message;

    }

}


/* =========================================================
   REPORT
========================================================= */

function openReportForSeller(number) {

    document.getElementById(
        "reportSellerNumber"
    ).value = number || "";

    showPage("report");

}


async function submitReport() {

    const sellerNumber =
        document.getElementById(
            "reportSellerNumber"
        ).value.trim();

    const phone =
        document.getElementById(
            "reportPhone"
        ).value.trim();

    const reason =
        document.getElementById(
            "reportReason"
        ).value;

    const details =
        document.getElementById(
            "reportDetails"
        ).value.trim();

    const message =
        document.getElementById(
            "reportMessage"
        );


    const user =
        getCurrentUser();


    if (!sellerNumber || !reason) {

        message.textContent =
            "شماره فروشنده و دلیل گزارش را وارد کنید.";

        return;

    }


    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/functions/v1/reports",
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

                            zardaloo_number:
                                sellerNumber,

                            phone:
                                phone ||
                                user?.phone ||
                                "",

                            reason:
                                reason,

                            details:
                                details

                        })
                }
            );


        const data =
            await response.json().catch(() => ({}));


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "ثبت گزارش ناموفق بود."
            );

        }


        message.textContent =
            "✅ گزارش برای بررسی مدیر ارسال شد.";

        document.getElementById(
            "reportDetails"
        ).value = "";


    } catch (error) {

        message.textContent =
            "❌ " + error.message;

    }

}


/* =========================================================
   ADMIN LOGIN
========================================================= */

function showAdminLogin() {

    document.getElementById(
        "adminLoginBox"
    ).classList.remove("hidden");

    document.getElementById(
        "adminPanel"
    ).classList.add("hidden");

}


async function adminLogin() {

    const number =
        document.getElementById(
            "adminNumber"
        ).value.trim();

    const password =
        document.getElementById(
            "adminPassword"
        ).value;

    const message =
        document.getElementById(
            "adminMessage"
        );


    if (
        number !== ADMIN_NUMBER ||
        password !== ADMIN_PASSWORD
    ) {

        message.textContent =
            "❌ اطلاعات مدیریت اشتباه است.";

        return;

    }


    message.textContent =
        "در حال ورود...";


    try {

        const response =
            await fetch(
                ADMIN_FUNCTION_URL + "/login",
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
                            number: number,
                            password: password
                        })
                }
            );


        const data =
            await response.json().catch(() => ({}));


        if (!response.ok || !data.ok) {

            throw new Error(
                data.error ||
                "ورود ناموفق بود."
            );

        }


        const token =
            String(
                data.token ||
                data.admin_token ||
                ""
            ).trim();


        if (!token) {

            throw new Error(
                "توکن مدیریت دریافت نشد."
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


        showAdminPanel();


    } catch (error) {

        message.textContent =
            "❌ " + error.message;

    }

}


function showAdminPanel() {

    document.getElementById(
        "adminLoginBox"
    ).classList.add("hidden");

    document.getElementById(
        "adminPanel"
    ).classList.remove("hidden");

    updateAdminStats();

}


function adminLogout() {

    sessionStorage.removeItem(
        ADMIN_SESSION_KEY
    );

    sessionStorage.removeItem(
        ADMIN_TOKEN_KEY
    );

    showAdminLogin();

}


/* =========================================================
   ADMIN REQUEST
========================================================= */

async function adminRequest(path, options = {}) {

    const token =
        sessionStorage.getItem(
            ADMIN_TOKEN_KEY
        );


    if (!token) {

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

                    "x-admin-token":
                        token,

                    ...(options.headers || {})
                }
            }
        );


    const data =
        await response.json().catch(() => ({}));


    if (!response.ok) {

        throw new Error(
            data.error ||
            data.message ||
            "درخواست ناموفق بود."
        );

    }


    return data;

}


/* =========================================================
   ADMIN PRODUCTS
========================================================= */

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
            await adminRequest("/products");


        const list =
            Array.isArray(data)
            ? data
            : data.products || [];


        content.innerHTML =
            list.length
            ? list.map(adminProductCard).join("")
            : `<div class="empty">
                کالایی وجود ندارد.
              </div>`;


    } catch (error) {

        content.innerHTML =
            `<div class="error">
                ${escapeHTML(error.message)}
            </div>`;

    }

}


function adminProductCard(product) {

    const id =
        product.id ??
        product.product_id ??
        "";

    return `
        <div class="admin-product">

            <div>

                <strong>
                    ${escapeHTML(
                        String(
                            product.name ??
                            product.product_name ??
                            "کالا"
                        )
                    )}
                </strong>

                <div>
                    ${formatPrice(
                        Number(product.price || 0)
                    )}
                    تومان
                </div>

            </div>

            <button
                class="danger"
                onclick="deleteAdminProduct('${escapeAttribute(
                    String(id)
                )}')"
            >
                🗑️ حذف
            </button>

        </div>
    `;

}


async function deleteAdminProduct(id) {

    if (!confirm("کالا حذف شود؟")) {
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


        alert("✅ کالا حذف شد.");

        await loadProducts();

        await loadAdminProducts();


    } catch (error) {

        alert(error.message);

    }

}


/* =========================================================
   DELETE ALL PRODUCTS
========================================================= */

async function clearAllProducts() {

    if (
        !confirm(
            "⚠️ تمام کالاها حذف شوند؟"
        )
    ) {
        return;
    }


    try {

        await adminRequest(
            "/products/all",
            {
                method: "DELETE"
            }
        );


        alert(
            "✅ تمام کالاها حذف شدند."
        );


        await loadProducts();

        await loadAdminProducts();


    } catch (error) {

        alert(error.message);

    }

}


/* =========================================================
   ADMIN REPORTS
========================================================= */

async function loadAdminReports() {

    const content =
        document.getElementById(
            "adminContent"
        );


    content.innerHTML =
        `<div class="loading">
            در حال دریافت گزارش‌ها...
        </div>`;


    try {

        const data =
            await adminRequest("/reports");


        const reports =
            Array.isArray(data)
            ? data
            : data.reports || [];


        if (!reports.length) {

            content.innerHTML =
                `<div class="empty">
                    گزارشی وجود ندارد.
                </div>`;

            return;

        }


        content.innerHTML =
            reports.map(report => `

                <div class="report-card">

                    <h3>
                        🚨 گزارش
                    </h3>

                    <p>
                        <strong>
                            شماره زردآلو:
                        </strong>
                        ${escapeHTML(
                            String(
                                report.zardaloo_number ||
                                "ثبت نشده"
                            )
                        )}
                    </p>

                    <p>
                        <strong>
                            دلیل:
                        </strong>
                        ${escapeHTML(
                            String(
                                report.reason ||
                                "ثبت نشده"
                            )
                        )}
                    </p>

                    <p>
                        <strong>
                            توضیحات:
                        </strong>
                        ${escapeHTML(
                            String(
                                report.details ||
                                ""
                            )
                        )}
                    </p>

                    <p>
                        <strong>
                            شماره تماس:
                        </strong>
                        ${escapeHTML(
                            String(
                                report.phone ||
                                "ثبت نشده"
                            )
                        )}
                    </p>

                    <div class="report-actions">

                        <button
                            class="danger"
                            onclick="deleteAdminReport(
                                '${escapeAttribute(
                                    String(report.id || "")
                                )}'
                            )"
                        >
                            🗑️ حذف گزارش
                        </button>

                    </div>

                </div>

            `).join("");


    } catch (error) {

        content.innerHTML =
            `<div class="error">
                ${escapeHTML(error.message)}
            </div>`;

    }

}


/* =========================================================
   DELETE REPORT
========================================================= */

async function deleteAdminReport(id) {

    if (!id) {
        return;
    }


    if (!confirm("این گزارش حذف شود؟")) {
        return;
    }


    try {

        await adminRequest(
            "/report?id=" +
            encodeURIComponent(id),
            {
                method: "DELETE"
            }
        );


        alert(
            "✅ گزارش حذف شد."
        );


        await loadAdminReports();


    } catch (error) {

        alert(error.message);

    }

}


async function clearAllReports() {

    if (
        !confirm(
            "⚠️ تمام گزارش‌ها حذف شوند؟"
        )
    ) {
        return;
    }


    try {

        await adminRequest(
            "/reports/all",
            {
                method: "DELETE"
            }
        );


        alert(
            "✅ تمام گزارش‌ها حذف شدند."
        );


        await loadAdminReports();


    } catch (error) {

        alert(error.message);

    }

}


/* =========================================================
   ADMIN USERS
========================================================= */

async function loadAdminUsers() {

    const content =
        document.getElementById(
            "adminContent"
        );


    content.innerHTML =
        `<div class="loading">
            در حال دریافت کاربران...
        </div>`;


    try {

        const data =
            await adminRequest("/users");


        const users =
            Array.isArray(data)
            ? data
            : data.users || [];


        if (!users.length) {

            content.innerHTML =
                `<div class="empty">
                    کاربری وجود ندارد.
                </div>`;

            return;

        }


        content.innerHTML =
            users.map(user => `

                <div class="admin-user">

                    <div>

                        <strong>
                            ${escapeHTML(
                                String(
                                    user.name ||
                                    "بدون نام"
                                )
                            )}
                        </strong>

                        <div>
                            شماره زردآلو:
                            ${escapeHTML(
                                String(
                                    user.zardaloo_number ||
                                    ""
                                )
                            )}
                        </div>

                        <div>
                            تماس:
                            ${escapeHTML(
                                String(
                                    user.phone ||
                                    ""
                                )
                            )}
                        </div>

                    </div>

                    <button
                        class="danger"
                        onclick="removeUser(
                            '${escapeAttribute(
                                String(
                                    user.zardaloo_number || ""
                                )
                            )}'
                        )"
                    >
                        🚪 بیرون کردن
                    </button>

                </div>

            `).join("");


    } catch (error) {

        content.innerHTML =
            `<div class="error">
                ${escapeHTML(error.message)}
            </div>`;

    }

}


async function removeUser(number) {

    if (
        !confirm(
            "این کاربر از سیستم بیرون شود؟"
        )
    ) {
        return;
    }


    try {

        await adminRequest(
            "/users?zardaloo_number=" +
            encodeURIComponent(number),
            {
                method: "DELETE"
            }
        );


        alert(
            "✅ کاربر بیرون شد."
        );


        await loadAdminUsers();


    } catch (error) {

        alert(error.message);

    }

}


/* =========================================================
   ADMIN CARTS
========================================================= */

async function loadAdminCarts() {

    const content =
        document.getElementById(
            "adminContent"
        );


    content.innerHTML =
        `<div class="loading">
            در حال دریافت سبد خرید کاربران...
        </div>`;


    try {

        const data =
            await adminRequest("/carts");


        const carts =
            Array.isArray(data)
            ? data
            : data.carts || [];


        if (!carts.length) {

            content.innerHTML =
                `<div class="empty">
                    سبد خریدی وجود ندارد.
                </div>`;

            return;

        }


        content.innerHTML =
            carts.map(cartData => `

                <div class="admin-cart">

                    <div>

                        <strong>
                            شماره زردآلو:
                            ${escapeHTML(
                                String(
                                    cartData.zardaloo_number ||
                                    ""
                                )
                            )}
                        </strong>

                        <div>
                            تعداد کالا:
                            ${formatPrice(
                                cartData.count || 0
                            )}
                        </div>

                        <div>
                            مجموع:
                            ${formatPrice(
                                cartData.total || 0
                            )}
                            تومان
                        </div>

                    </div>

                    <button
                        class="danger"
                        onclick="deleteUserCart(
                            '${escapeAttribute(
                                String(
                                    cartData.zardaloo_number || ""
                                )
                            )}'
                        )"
                    >
                        🗑️ حذف سبد
                    </button>

                </div>

            `).join("");


    } catch (error) {

        content.innerHTML =
            `<div class="error">
                ${escapeHTML(error.message)}
            </div>`;

    }

}


async function deleteUserCart(number) {

    if (!confirm("سبد این کاربر حذف شود؟")) {
        return;
    }


    try {

        await adminRequest(
            "/carts?zardaloo_number=" +
            encodeURIComponent(number),
            {
                method: "DELETE"
            }
        );


        alert("✅ سبد حذف شد.");

        await loadAdminCarts();


    } catch (error) {

        alert(error.message);

    }

}


/* =========================================================
   STATS
========================================================= */

function updateAdminStats() {

    const productCount =
        document.getElementById(
            "adminProductCount"
        );

    const cartCount =
        document.getElementById(
            "adminCartCount"
        );


    if (productCount) {
        productCount.textContent =
            products.length;
    }


    if (cartCount) {

        cartCount.textContent =
            cart.reduce(
                (sum,item) =>
                    sum +
                    Number(item.quantity || 0),
                0
            );

    }

}


/* =========================================================
   USER
========================================================= */

function getCurrentUser() {

    try {

        return JSON.parse(
            localStorage.getItem(USER_KEY) || "null"
        );

    } catch {

        return null;

    }

}


/* =========================================================
   DATE / TIME
========================================================= */

function updateDateTime() {

    const element =
        document.getElementById(
            "adminDateTime"
        );

    if (!element) {
        return;
    }


    const now =
        new Date();


    const gregorian =
        now.toLocaleDateString(
            "en-US"
        );


    const time =
        now.toLocaleTimeString(
            "en-US"
        );


    const jalali =
        new Intl.DateTimeFormat(
            "fa-IR-u-ca-persian",
            {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }
        ).format(now);


    element.textContent =
        `میلادی: ${gregorian} | شمسی: ${jalali} | ساعت: ${time}`;

}


/* =========================================================
   FORMAT
========================================================= */

function formatPrice(number) {

    return Number(
        number || 0
    ).toLocaleString("fa-IR");

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}


function escapeAttribute(value) {

    return String(value)
        .replaceAll("\\","\\\\")
        .replaceAll("'","\\'");

}
