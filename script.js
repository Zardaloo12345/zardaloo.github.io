"use strict";


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://ovqldknqpaiczrddcrxp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_VDZ_tgoMgYRI7K419ieDKw_y29xeXA2";

const PRODUCTS_URL =
    SUPABASE_URL + "/functions/v1/products";

const REPORT_URL =
    SUPABASE_URL + "/functions/v1/report-seller";

const MESSAGES_URL =
    SUPABASE_URL + "/functions/v1/messages";

const ADMIN_REPORTS_URL =
    SUPABASE_URL + "/functions/v1/admin-reports";


/* =========================================================
   LOCAL STORAGE
========================================================= */

const PROFILE_KEY = "zardaloo_profile_v12";
const CART_KEY = "zardaloo_cart_v12";
const DISCOUNT_KEY = "zardaloo_discount_v12";

const OLD_PROFILE_KEYS = [
    "zardaloo_profile_final_v11",
    "zardaloo_profile_final_v10",
    "zardaloo_profile"
];

const OLD_CART_KEYS = [
    "zardaloo_cart_final_v11",
    "zardaloo_cart_final_v10",
    "zardaloo_cart"
];


/* =========================================================
   ADMIN
========================================================= */

const ADMIN_NUMBER = "0994051777";
const ADMIN_PASSWORD = "ERFAN";


/* =========================================================
   VARIABLES
========================================================= */

let profile = null;
let products = [];
let cart = [];

let discountPercent = 0;

let profileImageData = "";
let productImageData = "";

let currentChatNumber = "";
let messageRefreshTimer = null;

let adminLoggedIn = false;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadLocalData();

    setupFilters();

    setupChatInput();

    setupWelcome();

    if (profile) {

        showApp();

        updateProfileUI();

        showPage("home");

    } else {

        showWelcome();

    }

});


/* =========================================================
   HELPERS
========================================================= */

function $(id) {
    return document.getElementById(id);
}


function setStatus(id, message, type = "") {

    const element = $(id);

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = "status " + type;
}


function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
}


function formatPrice(value) {

    const number = Number(value) || 0;

    return number.toLocaleString("fa-IR") + " ریال";
}


function normalizeNumber(value) {

    return String(value ?? "")
        .replace(/[۰-۹]/g, char =>
            "۰۱۲۳۴۵۶۷۸۹".indexOf(char)
        )
        .trim();
}


/* =========================================================
   LOCAL DATA
========================================================= */

function loadLocalData() {

    profile = null;

    const currentProfile =
        localStorage.getItem(PROFILE_KEY);

    if (currentProfile) {

        try {

            profile = JSON.parse(currentProfile);

        } catch (error) {

            profile = null;

        }

    }


    if (!profile) {

        for (const key of OLD_PROFILE_KEYS) {

            const oldData =
                localStorage.getItem(key);

            if (!oldData) {
                continue;
            }

            try {

                profile = JSON.parse(oldData);

                localStorage.setItem(
                    PROFILE_KEY,
                    JSON.stringify(profile)
                );

                break;

            } catch (error) {
                console.warn("Profile migration failed:", error);
            }

        }

    }


    const cartData =
        localStorage.getItem(CART_KEY);

    if (cartData) {

        try {

            cart = JSON.parse(cartData);

        } catch (error) {

            cart = [];

        }

    }


    if (!cart.length) {

        for (const key of OLD_CART_KEYS) {

            const oldCart =
                localStorage.getItem(key);

            if (!oldCart) {
                continue;
            }

            try {

                cart = JSON.parse(oldCart);

                localStorage.setItem(
                    CART_KEY,
                    JSON.stringify(cart)
                );

                break;

            } catch (error) {
                console.warn("Cart migration failed:", error);
            }

        }

    }


    const discountData =
        localStorage.getItem(DISCOUNT_KEY);

    if (discountData) {

        discountPercent =
            Number(discountData) || 0;

    }

}


function saveProfile() {

    localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(profile)
    );

}


function saveCart() {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}


/* =========================================================
   WELCOME
========================================================= */

function setupWelcome() {

    const checkbox = $("welcome-agree");

    if (!checkbox) {
        return;
    }

    checkbox.addEventListener("change", () => {

        const button =
            document.querySelector(
                ".welcome-card .primary-button"
            );

        if (button) {

            button.disabled =
                !checkbox.checked;

        }

    });

}


function showWelcome() {

    const welcome = $("welcome-screen");
    const profileScreen = $("profile-screen");
    const app = $("app-screen");

    if (welcome) {
        welcome.classList.remove("hidden");
    }

    if (profileScreen) {
        profileScreen.classList.add("hidden");
    }

    if (app) {
        app.classList.add("hidden");
    }

}


function openProfileFromWelcome() {

    const checkbox = $("welcome-agree");

    if (
        checkbox &&
        !checkbox.checked
    ) {

        alert(
            "لطفاً ابتدا قوانین و شرایط را بپذیرید."
        );

        return;
    }


    if (profile) {

        showApp();

        showPage("home");

        return;

    }


    const welcome = $("welcome-screen");
    const profileScreen = $("profile-screen");

    if (welcome) {
        welcome.classList.add("hidden");
    }

    if (profileScreen) {
        profileScreen.classList.remove("hidden");
    }

}


function openMarketFromWelcome() {

    if (!profile) {

        alert(
            "برای ورود به بازار ابتدا اطلاعات خود را وارد کنید."
        );

        openProfileFromWelcome();

        return;

    }

    showApp();

    showPage("market");

}


/* =========================================================
   PROFILE
========================================================= */

function enterZardaloo() {

    const name =
        $("profile-name")?.value.trim() || "";

    const phone =
        normalizeNumber(
            $("profile-phone")?.value
        );

    const zardaloo =
        normalizeNumber(
            $("profile-zardaloo")?.value
        );


    if (!name) {

        setStatus(
            "profile-status",
            "نام خود را وارد کنید.",
            "error"
        );

        return;

    }


    if (!phone) {

        setStatus(
            "profile-status",
            "شماره تماس را وارد کنید.",
            "error"
        );

        return;

    }


    if (!zardaloo) {

        setStatus(
            "profile-status",
            "شماره زردآلو را وارد کنید.",
            "error"
        );

        return;

    }


    profile = {

        name: name,

        phone: phone,

        zardaloo: zardaloo,

        image: profileImageData || ""

    };


    saveProfile();

    updateProfileUI();

    showApp();

    showPage("home");

}


function updateProfileUI() {

    if (!profile) {
        return;
    }


    const homeName =
        $("home-profile-name");

    if (homeName) {
        homeName.textContent =
            profile.name;
    }


    const homeNameDisplay =
        $("home-profile-name-display");

    if (homeNameDisplay) {
        homeNameDisplay.textContent =
            profile.name;
    }


    const homePhone =
        $("home-profile-phone");

    if (homePhone) {
        homePhone.textContent =
            profile.phone;
    }


    const homeZardaloo =
        $("home-profile-zardaloo");

    if (homeZardaloo) {
        homeZardaloo.textContent =
            profile.zardaloo;
    }


    const headerName =
        $("header-user-name");

    if (headerName) {
        headerName.textContent =
            profile.name;
    }


    const profileName =
        $("profile-name");

    if (profileName) {
        profileName.value =
            profile.name || "";
    }


    const profilePhone =
        $("profile-phone");

    if (profilePhone) {
        profilePhone.value =
            profile.phone || "";
    }


    const profileZardaloo =
        $("profile-zardaloo");

    if (profileZardaloo) {
        profileZardaloo.value =
            profile.zardaloo || "";
    }


    const pageName =
        $("profile-page-name");

    if (pageName) {
        pageName.value =
            profile.name || "";
    }


    const pagePhone =
        $("profile-page-phone");

    if (pagePhone) {
        pagePhone.value =
            profile.phone || "";
    }


    const pageZardaloo =
        $("profile-page-zardaloo");

    if (pageZardaloo) {
        pageZardaloo.value =
            profile.zardaloo || "";
    }


    if (profile.image) {

        profileImageData =
            profile.image;

        setProfilePreview(profile.image);

    }

}


/* =========================================================
   PROFILE IMAGE
========================================================= */

function handleProfileImage(event) {

    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }

    const reader =
        new FileReader();

    reader.onload = () => {

        profileImageData =
            reader.result;

        setProfilePreview(
            profileImageData
        );

    };

    reader.readAsDataURL(file);

}


function setProfilePreview(src) {

    const image =
        $("profile-image-preview");

    const fallback =
        $("profile-avatar-fallback");

    if (!image) {
        return;
    }

    image.src = src;
    image.style.display = "block";

    if (fallback) {
        fallback.style.display = "none";
    }

}


/* =========================================================
   APP
========================================================= */

function showApp() {

    const welcome =
        $("welcome-screen");

    const profileScreen =
        $("profile-screen");

    const app =
        $("app-screen");


    if (welcome) {
        welcome.classList.add("hidden");
    }

    if (profileScreen) {
        profileScreen.classList.add("hidden");
    }

    if (app) {
        app.classList.remove("hidden");
    }

    updateProfileUI();

}


function showPage(pageName) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {

        page.classList.add("hidden");

    });


    const target =
        $("page-" + pageName);

    if (!target) {

        console.error(
            "Page not found:",
            "page-" + pageName
        );

        return;

    }

    target.classList.remove("hidden");


    if (pageName !== "messages") {

        stopMessageRefresh();

    }


    if (pageName === "market") {

        loadProducts();

    }


    if (pageName === "cart") {

        renderCart();

    }


    if (pageName === "register") {

        fillSellerInfo();

    }


    if (pageName === "profile") {

        updateProfileUI();

    }


    if (
        pageName === "messages" &&
        currentChatNumber
    ) {

        startMessageRefresh();

    }

}


/* =========================================================
   FILTERS
========================================================= */

function setupFilters() {

    const ids = [
        "filter-name",
        "filter-min-price",
        "filter-max-price",
        "filter-seller",
        "filter-gift"
    ];

    ids.forEach(id => {

        const element = $(id);

        if (!element) {
            return;
        }

        element.addEventListener(
            "input",
            renderProducts
        );

        element.addEventListener(
            "change",
            renderProducts
        );

    });

}


/* =========================================================
   PRODUCTS
========================================================= */

async function loadProducts() {

    setStatus(
        "market-status",
        "در حال دریافت کالاها..."
    );


    try {

        const response =
            await fetch(
                PRODUCTS_URL,
                {
                    method: "GET",
                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization":
                            "Bearer " + SUPABASE_KEY
                    }
                }
            );


        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                text || "خطا در دریافت کالاها"
            );

        }


        const data =
            await response.json();


        if (Array.isArray(data)) {

            products = data;

        } else if (
            Array.isArray(data.products)
        ) {

            products = data.products;

        } else if (
            Array.isArray(data.data)
        ) {

            products = data.data;

        } else {

            products = [];

        }


        renderProducts();

        setStatus(
            "market-status",
            products.length +
            " کالا دریافت شد.",
            "success"
        );


    } catch (error) {

        console.error(error);

        setStatus(
            "market-status",
            "دریافت کالاها ناموفق بود.",
            "error"
        );

    }

}


function renderProducts() {

    const grid =
        $("products-grid");

    if (!grid) {
        return;
    }


    const nameFilter =
        ($("filter-name")?.value || "")
            .trim()
            .toLowerCase();


    const minPrice =
        Number(
            $("filter-min-price")?.value || 0
        );


    const maxPrice =
        Number(
            $("filter-max-price")?.value || 0
        );


    const sellerFilter =
        normalizeNumber(
            $("filter-seller")?.value
        );


    const giftFilter =
        $("filter-gift")?.value || "all";


    const filtered =
        products.filter(product => {

            const name =
                String(
                    product.name ||
                    product.product_name ||
                    ""
                ).toLowerCase();


            const price =
                Number(
                    product.price ||
                    product.product_price ||
                    0
                );


            const seller =
                normalizeNumber(
                    product.seller_zardaloo_number ||
                    product.zardaloo_number ||
                    product.owner_zardaloo_number ||
                    ""
                );


            const gift =
                Boolean(
                    product.gift ||
                    product.has_gift
                );


            if (
                nameFilter &&
                !name.includes(nameFilter)
            ) {
                return false;
            }


            if (
                minPrice > 0 &&
                price < minPrice
            ) {
                return false;
            }


            if (
                maxPrice > 0 &&
                price > maxPrice
            ) {
                return false;
            }


            if (
                sellerFilter &&
                seller !== sellerFilter
            ) {
                return false;
            }


            if (
                giftFilter === "yes" &&
                !gift
            ) {
                return false;
            }


            if (
                giftFilter === "no" &&
                gift
            ) {
                return false;
            }


            return true;

        });


    grid.innerHTML = "";


    if (!filtered.length) {

        grid.innerHTML = `
            <div class="admin-item">
                کالایی مطابق جستجوی شما پیدا نشد.
            </div>
        `;

        return;

    }


    filtered.forEach(product => {

        const card =
            document.createElement("article");

        card.className =
            "product-card";


        const name =
            product.name ||
            product.product_name ||
            "کالای بدون نام";


        const price =
            Number(
                product.price ||
                product.product_price ||
                0
            );


        const seller =
            product.seller_name ||
            product.seller ||
            "فروشنده";


        const sellerZardaloo =
            product.seller_zardaloo_number ||
            product.zardaloo_number ||
            product.owner_zardaloo_number ||
            "-";


        const phone =
            product.seller_phone ||
            product.phone ||
            "-";


        const description =
            product.description ||
            "";


        const image =
            product.image_url ||
            product.image ||
            product.photo ||
            "";


        const gift =
            Boolean(
                product.gift ||
                product.has_gift
            );


        const giftDescription =
            product.gift_description ||
            "";


        let imageHTML =
            `<div class="no-image">🛍️</div>`;


        if (image) {

            imageHTML =
                `<img src="${escapeHTML(image)}" alt="${escapeHTML(name)}">`;

        }


        card.innerHTML = `

            <div class="product-card-image">
                ${imageHTML}
            </div>

            <div class="product-card-body">

                <h3>
                    ${escapeHTML(name)}
                </h3>

                <div class="product-price">
                    ${formatPrice(price)}
                </div>

                <div class="product-meta">
                    فروشنده:
                    ${escapeHTML(seller)}
                    <br>

                    شماره زردآلو:
                    ${escapeHTML(String(sellerZardaloo))}
                    <br>

                    تلفن:
                    ${escapeHTML(String(phone))}
                </div>

                ${
                    description
                        ? `
                        <div class="product-description">
                            ${escapeHTML(description)}
                        </div>
                        `
                        : ""
                }

                ${
                    gift
                        ? `
                        <div class="gift">
                            🎁 دارای هدیه
                            ${
                                giftDescription
                                    ? " - " +
                                      escapeHTML(giftDescription)
                                    : ""
                            }
                        </div>
                        `
                        : ""
                }

                <button
                    class="primary-button"
                    onclick='addProductToCart(${JSON.stringify(product).replace(/'/g, "&#39;")})'
                >
                    افزودن به سبد
                </button>

                <button
                    class="secondary-button"
                    onclick="openSellerConversation('${escapeHTML(String(sellerZardaloo))}')"
                >
                    💬 پیام به فروشنده
                </button>

            </div>
        `;


        grid.appendChild(card);

    });

}


function addProductToCart(product) {

    const item = {

        id:
            product.id ||
            crypto.randomUUID(),

        name:
            product.name ||
            product.product_name ||
            "کالا",

        price:
            Number(
                product.price ||
                product.product_price ||
                0
            ),

        image:
            product.image_url ||
            product.image ||
            "",

        seller_zardaloo_number:
            product.seller_zardaloo_number ||
            product.zardaloo_number ||
            product.owner_zardaloo_number ||
            ""

    };


    cart.push(item);

    saveCart();

    alert("کالا به سبد خرید اضافه شد.");

}


function addToCart(product) {

    addProductToCart(product);

}


/* =========================================================
   REGISTER PRODUCT
========================================================= */

function fillSellerInfo() {

    if (!profile) {
        return;
    }


    const seller =
        $("product-seller");

    const phone =
        $("product-seller-phone");

    const zardaloo =
        $("product-seller-zardaloo");


    if (
        seller &&
        !seller.value
    ) {
        seller.value =
            profile.name || "";
    }


    if (
        phone &&
        !phone.value
    ) {
        phone.value =
            profile.phone || "";
    }


    if (
        zardaloo &&
        !zardaloo.value
    ) {
        zardaloo.value =
            profile.zardaloo || "";
    }

}


function handleProductImage(event) {

    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload = () => {

        productImageData =
            reader.result;


        const preview =
            $("product-image-preview");


        if (!preview) {
            return;
        }


        preview.innerHTML = `

            <img
                src="${productImageData}"
                alt="پیش‌نمایش کالا"
            >

        `;

    };


    reader.readAsDataURL(file);

}


async function registerProduct() {

    if (!profile) {

        setStatus(
            "register-status",
            "ابتدا وارد حساب کاربری شوید.",
            "error"
        );

        return;

    }


    const name =
        $("product-name")?.value.trim() || "";


    const price =
        Number(
            $("product-price")?.value || 0
        );


    const seller =
        $("product-seller")?.value.trim() ||
        profile.name;


    const sellerPhone =
        normalizeNumber(
            $("product-seller-phone")?.value ||
            profile.phone
        );


    const sellerZardaloo =
        normalizeNumber(
            $("product-seller-zardaloo")?.value ||
            profile.zardaloo
        );


    const description =
        $("product-description")?.value.trim() || "";


    const gift =
        $("product-gift")?.checked || false;


    const giftDescription =
        $("product-gift-description")?.value.trim() || "";


    if (!name) {

        setStatus(
            "register-status",
            "نام کالا را وارد کنید.",
            "error"
        );

        return;

    }


    if (price <= 0) {

        setStatus(
            "register-status",
            "قیمت معتبر وارد کنید.",
            "error"
        );

        return;

    }


    if (!sellerZardaloo) {

        setStatus(
            "register-status",
            "شماره زردآلو فروشنده وارد نشده است.",
            "error"
        );

        return;

    }


    const payload = {

        name: name,

        price: price,

        seller_name: seller,

        seller_phone: sellerPhone,

        seller_zardaloo_number:
            sellerZardaloo,

        owner_zardaloo_number:
            profile.zardaloo,

        description: description,

        gift: gift,

        gift_description:
            giftDescription,

        image_url:
            productImageData || ""

    };


    setStatus(
        "register-status",
        "در حال ثبت کالا..."
    );


    try {

        const response =
            await fetch(
                PRODUCTS_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                text || "ثبت کالا ناموفق بود."
            );

        }


        setStatus(
            "register-status",
            "کالا با موفقیت ثبت شد.",
            "success"
        );


        $("product-name").value = "";
        $("product-price").value = "";
        $("product-description").value = "";
        $("product-gift").checked = false;
        $("product-gift-description").value = "";

        productImageData = "";

        $("product-image-preview").innerHTML = "";


        await loadProducts();


    } catch (error) {

        console.error(error);

        setStatus(
            "register-status",
            "ثبت کالا انجام نشد.",
            "error"
        );

    }

}


/* =========================================================
   CART
========================================================= */

function renderCart() {

    const container =
        $("cart-items");

    const summary =
        $("cart-summary");


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!cart.length) {

        container.innerHTML = `
            <div class="admin-item">
                سبد خرید شما خالی است.
            </div>
        `;

        if (summary) {
            summary.innerHTML = "";
        }

        return;

    }


    let originalTotal = 0;


    cart.forEach((item, index) => {

        const price =
            Number(item.price) || 0;

        originalTotal += price;


        const div =
            document.createElement("div");

        div.className =
            "cart-item";


        div.innerHTML = `

            <div class="cart-item-top">

                <div>

                    <h3>
                        ${escapeHTML(item.name)}
                    </h3>

                    <div class="cart-price">
                        قیمت:
                        ${formatPrice(price)}
                    </div>

                </div>

                <button
                    class="danger-button"
                    style="width:auto;margin-top:0"
                    onclick="removeFromCart(${index})"
                >
                    حذف
                </button>

            </div>

        `;


        container.appendChild(div);

    });


    const discountAmount =
        Math.round(
            originalTotal *
            discountPercent /
            100
        );


    const finalTotal =
        originalTotal -
        discountAmount;


    if (summary) {

        summary.innerHTML = `

            <div class="summary-line">

                <span>
                    قیمت اصلی:
                </span>

                <strong>
                    ${formatPrice(originalTotal)}
                </strong>

            </div>


            <div class="summary-line">

                <span>
                    تخفیف:
                    ${discountPercent}٪
                </span>

                <strong>
                    ${formatPrice(discountAmount)}
                </strong>

            </div>


            <div class="summary-line">

                <span>
                    قیمت با تخفیف:
                </span>

                <strong>
                    ${formatPrice(finalTotal)}
                </strong>

            </div>


            <div class="summary-line summary-final">

                <span>
                    مبلغ نهایی:
                </span>

                <strong>
                    ${formatPrice(finalTotal)}
                </strong>

            </div>

        `;

    }

}


function removeFromCart(index) {

    if (
        index < 0 ||
        index >= cart.length
    ) {
        return;
    }


    cart.splice(index, 1);

    saveCart();

    renderCart();

}


function applyDiscount() {

    const code =
        normalizeNumber(
            $("discount-code")?.value
        );


    if (code === "50") {

        discountPercent = 50;

    } else if (code === "100") {

        discountPercent = 100;

    } else if (!code) {

        discountPercent = 0;

    } else {

        alert("کد تخفیف معتبر نیست.");

        return;

    }


    localStorage.setItem(
        DISCOUNT_KEY,
        String(discountPercent)
    );


    renderCart();


    if (discountPercent === 100) {

        alert(
            "تخفیف ۱۰۰ درصد اعمال شد."
        );

    } else if (discountPercent === 50) {

        alert(
            "تخفیف ۵۰ درصد اعمال شد."
        );

    }

}


/* =========================================================
   MESSENGER
========================================================= */

function setupChatInput() {

    const input =
        $("chat-input");

    if (!input) {
        return;
    }


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


function startConversation() {

    const input =
        $("message-receiver");


    /*
       مهم:
       اینجا دقیقاً همان ID موجود در HTML خوانده می‌شود:
       message-receiver
    */

    if (!input) {

        setStatus(
            "message-status",
            "فیلد شماره گیرنده پیدا نشد.",
            "error"
        );

        return;

    }


    const receiver =
        normalizeNumber(
            input.value
        );


    if (!receiver) {

        setStatus(
            "message-status",
            "شماره گیرنده وارد نشده است.",
            "error"
        );

        input.focus();

        return;

    }


    if (!profile) {

        setStatus(
            "message-status",
            "ابتدا وارد حساب کاربری شوید.",
            "error"
        );

        return;

    }


    const me =
        normalizeNumber(
            profile.zardaloo
        );


    if (!me) {

        setStatus(
            "message-status",
            "شماره زردآلوی شما ثبت نشده است.",
            "error"
        );

        return;

    }


    if (receiver === me) {

        setStatus(
            "message-status",
            "نمی‌توانید با شماره زردآلوی خودتان گفتگو کنید.",
            "error"
        );

        return;

    }


    currentChatNumber =
        receiver;


    const title =
        $("chat-title");

    if (title) {

        title.textContent =
            "مکالمه با شماره زردآلو: " +
            receiver;

    }


    const area =
        $("chat-area");

    if (area) {

        area.classList.remove("hidden");

    }


    setStatus(
        "message-status",
        "مکالمه آماده است.",
        "success"
    );


    loadMessages();

    startMessageRefresh();

}


function startConversationWith(number) {

    const input =
        $("message-receiver");

    if (!input) {
        return;
    }


    input.value =
        normalizeNumber(number);


    showPage("messages");

    startConversation();

}


function openSellerConversation(number) {

    startConversationWith(number);

}


function closeChat() {

    currentChatNumber = "";

    stopMessageRefresh();


    const area =
        $("chat-area");

    if (area) {
        area.classList.add("hidden");
    }


    const box =
        $("chat-box");

    if (box) {
        box.innerHTML = "";
    }

}


function startMessageRefresh() {

    stopMessageRefresh();


    if (!currentChatNumber) {
        return;
    }


    messageRefreshTimer =
        setInterval(
            () => {

                if (
                    !$("page-messages") ||
                    $("page-messages").classList.contains("hidden")
                ) {
                    return;
                }

                loadMessages(true);

            },
            5000
        );

}


function stopMessageRefresh() {

    if (messageRefreshTimer) {

        clearInterval(
            messageRefreshTimer
        );

        messageRefreshTimer = null;

    }

}


/* =========================================================
   MESSAGE FIELD NORMALIZATION
========================================================= */

function getMessageSender(message) {

    return normalizeNumber(
        message.sender_zardaloo_number ||
        message.senderZardalooNumber ||
        message.sender ||
        message.from_zardaloo_number ||
        message.from ||
        ""
    );

}


function getMessageReceiver(message) {

    return normalizeNumber(
        message.receiver_zardaloo_number ||
        message.receiverZardalooNumber ||
        message.receiver ||
        message.to_zardaloo_number ||
        message.to ||
        ""
    );

}


function getMessageText(message) {

    return String(
        message.message ||
        message.text ||
        message.content ||
        ""
    );

}


function getMessageTime(message) {

    return (
        message.created_at ||
        message.createdAt ||
        message.timestamp ||
        ""
    );

}


/* =========================================================
   LOAD MESSAGES
========================================================= */

async function loadMessages(silent = false) {

    if (!profile) {
        return;
    }


    if (!currentChatNumber) {
        return;
    }


    const me =
        normalizeNumber(
            profile.zardaloo
        );


    const other =
        normalizeNumber(
            currentChatNumber
        );


    if (!silent) {

        setStatus(
            "message-status",
            "در حال دریافت پیام‌ها..."
        );

    }


    try {

        /*
         * درخواست اصلی:
         * دریافت کل مکالمه بین دو شماره.
         */

        const url =
            MESSAGES_URL +
            "?user_zardaloo_number=" +
            encodeURIComponent(me) +
            "&other_zardaloo_number=" +
            encodeURIComponent(other);


        let response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY
                    }
                }
            );


        /*
         * اگر API فعلی چنین پارامترهایی را قبول نکند،
         * یک درخواست جایگزین برای پیام‌های کاربر می‌زنیم.
         */

        if (!response.ok) {

            const fallbackUrl =
                MESSAGES_URL +
                "?zardaloo_number=" +
                encodeURIComponent(me);


            response =
                await fetch(
                    fallbackUrl,
                    {
                        method: "GET",

                        headers: {
                            "apikey":
                                SUPABASE_KEY,

                            "Authorization":
                                "Bearer " +
                                SUPABASE_KEY
                        }
                    }
                );

        }


        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                text || "دریافت پیام‌ها ناموفق بود."
            );

        }


        const data =
            await response.json();


        let messages = [];


        if (Array.isArray(data)) {

            messages = data;

        } else if (
            Array.isArray(data.messages)
        ) {

            messages =
                data.messages;

        } else if (
            Array.isArray(data.data)
        ) {

            messages =
                data.data;

        }


        /*
         * فقط پیام‌هایی را نگه می‌داریم که بین
         * همین دو نفر رد و بدل شده‌اند.
         *
         * بنابراین:
         *
         * من -> فروشنده
         * فروشنده -> من
         *
         * هر دو نمایش داده می‌شوند.
         */

        messages =
            messages.filter(message => {

                const sender =
                    getMessageSender(message);

                const receiver =
                    getMessageReceiver(message);


                if (
                    sender &&
                    receiver
                ) {

                    return (
                        (
                            sender === me &&
                            receiver === other
                        )
                        ||
                        (
                            sender === other &&
                            receiver === me
                        )
                    );

                }


                /*
                 * اگر بک‌اند receiver را نفرستاده باشد،
                 * فعلاً پیام را نگه می‌داریم تا حذف نشود.
                 */

                return true;

            });


        messages.sort(
            (a, b) => {

                const ta =
                    new Date(
                        getMessageTime(a) || 0
                    ).getTime();

                const tb =
                    new Date(
                        getMessageTime(b) || 0
                    ).getTime();

                return ta - tb;

            }
        );


        renderMessages(messages);


        if (!silent) {

            setStatus(
                "message-status",
                "پیام‌ها به‌روز شدند.",
                "success"
            );

        }


    } catch (error) {

        console.error(
            "Messages error:",
            error
        );


        if (!silent) {

            setStatus(
                "message-status",
                "دریافت پیام‌ها انجام نشد.",
                "error"
            );

        }

    }

}


/* =========================================================
   RENDER MESSAGES
========================================================= */

function renderMessages(messages) {

    const box =
        $("chat-box");

    if (!box) {
        return;
    }


    box.innerHTML = "";


    if (!messages.length) {

        box.innerHTML = `

            <div class="admin-item">
                هنوز پیامی در این مکالمه وجود ندارد.
            </div>

        `;

        return;

    }


    const me =
        normalizeNumber(
            profile?.zardaloo
        );


    messages.forEach(message => {

        const sender =
            getMessageSender(message);

        const text =
            getMessageText(message);


        const mine =
            sender === me;


        const div =
            document.createElement("div");


        div.className =
            "chat-message " +
            (
                mine
                    ? "mine"
                    : "theirs"
            );


        const time =
            getMessageTime(message);


        let timeText = "";


        if (time) {

            try {

                timeText =
                    new Date(time)
                        .toLocaleString("fa-IR");

            } catch (error) {

                timeText =
                    String(time);

            }

        }


        div.innerHTML = `

            <div class="chat-sender">

                ${
                    mine
                        ? "شما"
                        : "شماره زردآلو: " +
                          escapeHTML(
                              sender ||
                              currentChatNumber
                          )
                }

            </div>

            <div class="chat-text">
                ${escapeHTML(text)}
            </div>

            ${
                timeText
                    ? `
                        <div class="chat-time">
                            ${escapeHTML(timeText)}
                        </div>
                    `
                    : ""
            }

        `;


        box.appendChild(div);

    });


    box.scrollTop =
        box.scrollHeight;

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (!profile) {

        setStatus(
            "message-status",
            "ابتدا وارد حساب کاربری شوید.",
            "error"
        );

        return;

    }


    const input =
        $("chat-input");


    if (!input) {

        setStatus(
            "message-status",
            "فیلد پیام پیدا نشد.",
            "error"
        );

        return;

    }


    const message =
        input.value.trim();


    if (!message) {

        input.focus();

        return;

    }


    const sender =
        normalizeNumber(
            profile.zardaloo
        );


    const receiver =
        normalizeNumber(
            currentChatNumber
        );


    if (!receiver) {

        setStatus(
            "message-status",
            "شماره گیرنده وارد نشده است.",
            "error"
        );

        return;

    }


    if (sender === receiver) {

        setStatus(
            "message-status",
            "گیرنده نمی‌تواند خودتان باشید.",
            "error"
        );

        return;

    }


    const payload = {

        sender_zardaloo_number:
            sender,

        receiver_zardaloo_number:
            receiver,

        sender_number:
            profile.phone || "",

        receiver_number:
            "",

        message:
            message

    };


    input.disabled = true;


    try {

        const response =
            await fetch(
                MESSAGES_URL,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY

                    },

                    body:
                        JSON.stringify(payload)

                }
            );


        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                text || "ارسال پیام ناموفق بود."
            );

        }


        input.value = "";


        await loadMessages();


    } catch (error) {

        console.error(
            "Send message error:",
            error
        );


        setStatus(
            "message-status",
            "ارسال پیام انجام نشد.",
            "error"
        );


    } finally {

        input.disabled = false;

        input.focus();

    }

}


/* =========================================================
   REPORT
========================================================= */

async function submitReport() {

    if (!profile) {

        setStatus(
            "report-status",
            "ابتدا وارد حساب کاربری شوید.",
            "error"
        );

        return;

    }


    const seller =
        normalizeNumber(
            $("report-seller-zardaloo")?.value
        );


    const reason =
        $("report-reason")?.value || "";


    const description =
        $("report-description")?.value.trim() || "";


    if (!seller) {

        setStatus(
            "report-status",
            "شماره زردآلوی فروشنده را وارد کنید.",
            "error"
        );

        return;

    }


    const payload = {

        reporter_zardaloo_number:
            profile.zardaloo,

        reporter_name:
            profile.name,

        reporter_phone:
            profile.phone,

        seller_zardaloo_number:
            seller,

        reason:
            reason,

        description:
            description

    };


    setStatus(
        "report-status",
        "در حال ارسال گزارش..."
    );


    try {

        const response =
            await fetch(
                REPORT_URL,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY

                    },

                    body:
                        JSON.stringify(payload)

                }
            );


        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                text || "گزارش ارسال نشد."
            );

        }


        setStatus(
            "report-status",
            "گزارش با موفقیت ارسال شد.",
            "success"
        );


        $("report-seller-zardaloo").value = "";
        $("report-description").value = "";


    } catch (error) {

        console.error(error);

        setStatus(
            "report-status",
            "ارسال گزارش انجام نشد.",
            "error"
        );

    }

}


/* =========================================================
   ADMIN
========================================================= */

async function adminLogin() {

    const number =
        normalizeNumber(
            $("admin-number")?.value
        );


    const password =
        $("admin-password")?.value || "";


    if (
        number !== ADMIN_NUMBER ||
        password !== ADMIN_PASSWORD
    ) {

        setStatus(
            "admin-status",
            "شماره مدیر یا رمز عبور اشتباه است.",
            "error"
        );

        return;

    }


    adminLoggedIn = true;


    const panel =
        $("admin-panel");

    if (panel) {
        panel.classList.remove("hidden");
    }


    setStatus(
        "admin-status",
        "ورود مدیریت موفق بود.",
        "success"
    );


    renderAdminProducts();

    await loadAdminReports();

}


function renderAdminProducts() {

    const container =
        $("admin-products");


    const count =
        $("admin-product-count");


    if (count) {

        count.textContent =
            products.length;

    }


    if (!container) {
        return;
    }


    container.innerHTML = "";


    products.forEach(product => {

        const div =
            document.createElement("div");

        div.className =
            "admin-item";


        const name =
            product.name ||
            product.product_name ||
            "بدون نام";


        const price =
            Number(
                product.price ||
                product.product_price ||
                0
            );


        const seller =
            product.seller_zardaloo_number ||
            product.zardaloo_number ||
            "-";


        div.innerHTML = `

            <strong>
                ${escapeHTML(name)}
            </strong>

            <br>

            قیمت:
            ${formatPrice(price)}

            <br>

            شماره زردآلو فروشنده:
            ${escapeHTML(String(seller))}

        `;


        container.appendChild(div);

    });

}


async function loadAdminReports() {

    const container =
        $("admin-reports");


    const count =
        $("admin-report-count");


    if (!container) {
        return;
    }


    container.innerHTML =
        "در حال دریافت گزارش‌ها...";


    try {

        const url =
            ADMIN_REPORTS_URL +
            "?admin_number=" +
            encodeURIComponent(
                ADMIN_NUMBER
            ) +
            "&admin_password=" +
            encodeURIComponent(
                ADMIN_PASSWORD
            );


        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY

                    }

                }
            );


        if (!response.ok) {

            throw new Error(
                "Admin reports request failed"
            );

        }


        const data =
            await response.json();


        let reports = [];


        if (Array.isArray(data)) {

            reports = data;

        } else if (
            Array.isArray(data.reports)
        ) {

            reports =
                data.reports;

        } else if (
            Array.isArray(data.data)
        ) {

            reports =
                data.data;

        }


        if (count) {

            count.textContent =
                reports.length;

        }


        container.innerHTML = "";


        if (!reports.length) {

            container.innerHTML = `
                <div class="admin-item">
                    گزارشی ثبت نشده است.
                </div>
            `;

            return;

        }


        reports.forEach(report => {

            const div =
                document.createElement("div");


            div.className =
                "admin-item";


            div.innerHTML = `

                <strong>
                    گزارش فروشنده
                </strong>

                <br>

                فروشنده:
                ${escapeHTML(
                    String(
                        report.seller_zardaloo_number ||
                        "-"
                    )
                )}

                <br>

                دلیل:
                ${escapeHTML(
                    String(
                        report.reason ||
                        "-"
                    )
                )}

                <br>

                توضیحات:
                ${escapeHTML(
                    String(
                        report.description ||
                        "-"
                    )
                )}

            `;


            container.appendChild(div);

        });


    } catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="admin-item">
                دریافت گزارش‌ها از سرور انجام نشد.
            </div>

        `;


        if (count) {
            count.textContent = "0";
        }

    }

}


/* =========================================================
   PROFILE PAGE
========================================================= */

function saveProfileChanges() {

    if (!profile) {
        return;
    }


    const name =
        $("profile-page-name")?.value.trim() || "";


    const phone =
        normalizeNumber(
            $("profile-page-phone")?.value
        );


    const zardaloo =
        normalizeNumber(
            $("profile-page-zardaloo")?.value
        );


    if (!name) {

        setStatus(
            "profile-page-status",
            "نام را وارد کنید.",
            "error"
        );

        return;

    }


    if (!phone) {

        setStatus(
            "profile-page-status",
            "شماره تماس را وارد کنید.",
            "error"
        );

        return;

    }


    if (!zardaloo) {

        setStatus(
            "profile-page-status",
            "شماره زردآلو را وارد کنید.",
            "error"
        );

        return;

    }


    profile.name =
        name;

    profile.phone =
        phone;

    profile.zardaloo =
        zardaloo;


    saveProfile();

    updateProfileUI();


    setStatus(
        "profile-page-status",
        "اطلاعات با موفقیت ذخیره شد.",
        "success"
    );

}


function logoutZardaloo() {

    const confirmed =
        confirm(
            "آیا مطمئن هستید که می‌خواهید از حساب خارج شوید؟"
        );


    if (!confirmed) {
        return;
    }


    localStorage.removeItem(
        PROFILE_KEY
    );


    profile = null;

    currentChatNumber = "";

    stopMessageRefresh();


    showWelcome();

}


/* =========================================================
   GLOBAL FUNCTIONS
   برای onclickهای HTML
========================================================= */

window.openProfileFromWelcome =
    openProfileFromWelcome;

window.openMarketFromWelcome =
    openMarketFromWelcome;

window.enterZardaloo =
    enterZardaloo;

window.showWelcome =
    showWelcome;

window.showApp =
    showApp;

window.showPage =
    showPage;

window.handleProfileImage =
    handleProfileImage;

window.handleProductImage =
    handleProductImage;

window.loadProducts =
    loadProducts;

window.addToCart =
    addToCart;

window.addProductToCart =
    addProductToCart;

window.removeFromCart =
    removeFromCart;

window.applyDiscount =
    applyDiscount;

window.startConversation =
    startConversation;

window.startConversationWith =
    startConversationWith;

window.openSellerConversation =
    openSellerConversation;

window.closeChat =
    closeChat;

window.sendMessage =
    sendMessage;

window.registerProduct =
    registerProduct;

window.submitReport =
    submitReport;

window.adminLogin =
    adminLogin;

window.saveProfileChanges =
    saveProfileChanges;

window.logoutZardaloo =
    logoutZardaloo;
