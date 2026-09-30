"use strict";

/* =========================================================
   ZARDALOO WEB APP
   ========================================================= */

const SUPABASE_URL =
    "https://ovqldknqpaiczrddcrxp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_VDZ_tgoMgYRI7K419ieDKw_y29xeXA2";

const PRODUCTS_URL =
    SUPABASE_URL + "/functions/v1/products";

const ADMIN_URL =
    SUPABASE_URL + "/functions/v1/admin-reports";

const MESSAGES_URL =
    SUPABASE_URL + "/functions/v1/messages";

const REPORTS_URL =
    SUPABASE_URL + "/functions/v1/reports";


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

const PROFILE_KEY = "zardaloo_profile";
const CART_KEY = "zardaloo_cart";
const THEME_KEY = "zardaloo_theme";
const DISCOUNT_KEY = "zardaloo_discount";
const ADMIN_SESSION_KEY = "zardaloo_admin_session";


let products = [];
let filteredProducts = [];
let cart = [];

let selectedProfile = "football";
let uploadedProfileImage = "";

let discountPercent = 0;
let discountCode = "";

let adminToken = "";


/* =========================================================
   HELPERS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


function setMessage(id, text, type = "") {

    const el = $(id);

    if (!el) return;

    el.textContent = text;

    el.className = "message";

    if (type) {
        el.classList.add(type);
    }
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function numberValue(value) {

    const n = Number(
        String(value ?? "")
            .replaceAll(",", "")
            .replaceAll("٬", "")
            .trim()
    );

    return Number.isFinite(n) ? n : 0;
}


function formatPrice(value) {

    return numberValue(value).toLocaleString("fa-IR") + " ریال";
}


function getProfile() {

    try {
        return JSON.parse(
            localStorage.getItem(PROFILE_KEY)
        ) || null;

    } catch {
        return null;
    }
}


function saveProfile(profile) {

    localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(profile)
    );
}


function getCurrentZardalooNumber() {

    const profile = getProfile();

    return profile?.zardalooNumber || "";
}


/* =========================================================
   PROFILE
   ========================================================= */

function selectProfile(name) {

    selectedProfile = name;

    document
        .querySelectorAll(".profile-option")
        .forEach(button => {
            button.classList.toggle(
                "selected",
                button.dataset.profile === name
            );
        });

    uploadedProfileImage = "";

    const preview = $("profilePreview");

    if (!preview) return;

    const icons = {
        football: "⚽",
        volleyball: "🏐",
        coffee: "☕",
        flask: "🧉",
        store: "🏪",
        sandwich: "🥪",
        pizza: "🍕"
    };

    preview.innerHTML =
        icons[name] || "⚪";
}


function loadProfileImage(event) {

    const file =
        event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        setMessage(
            "profileMessage",
            "فقط فایل تصویری انتخاب کنید.",
            "error"
        );

        return;
    }

    const reader =
        new FileReader();

    reader.onload = function () {

        uploadedProfileImage =
            reader.result;

        $("profilePreview").innerHTML =
            `<img src="${uploadedProfileImage}" alt="پروفایل">`;
    };

    reader.readAsDataURL(file);
}


function enterZardaloo() {

    const name =
        $("firstName").value.trim();

    const phone =
        $("firstPhone").value.trim();

    const zardalooNumber =
        $("firstZardaloo").value.trim();

    if (!name || !phone || !zardalooNumber) {

        setMessage(
            "profileMessage",
            "لطفاً نام، شماره تماس و شماره زردآلو را کامل وارد کنید.",
            "error"
        );

        return;
    }

    if (zardalooNumber.length < 3) {

        setMessage(
            "profileMessage",
            "شماره زردآلو معتبر نیست.",
            "error"
        );

        return;
    }


    const profile = {

        name: name,

        phone: phone,

        zardalooNumber: zardalooNumber,

        profileType: selectedProfile,

        profileImage: uploadedProfileImage || ""

    };


    saveProfile(profile);

    initializeApp();

}


function initializeProfile() {

    const profile =
        getProfile();

    /*
     * فقط وقتی پروفایل وجود ندارد،
     * صفحه پروفایل نمایش داده می‌شود.
     */

    if (profile) {

        $("profileSetup")
            ?.classList.add("hidden");

        $("app")
            ?.classList.remove("hidden");

        updateHomeProfile();

    } else {

        $("profileSetup")
            ?.classList.remove("hidden");

        $("app")
            ?.classList.add("hidden");

        selectProfile("football");
    }
}


function initializeApp() {

    $("profileSetup")
        ?.classList.add("hidden");

    $("app")
        ?.classList.remove("hidden");

    updateHomeProfile();

    loadCart();

    loadProducts();

    loadTheme();

    showPage("home");
}


function updateHomeProfile() {

    const profile =
        getProfile();

    if (!profile) return;

    $("homeName").textContent =
        profile.name;

    $("homePhone").textContent =
        profile.phone;

    $("homeZardaloo").textContent =
        profile.zardalooNumber;


    const image =
        $("homeProfileImage");

    if (!image) return;


    if (profile.profileImage) {

        image.innerHTML =
            `<img src="${profile.profileImage}" alt="پروفایل">`;

        return;
    }


    const icons = {

        football: "⚽",

        volleyball: "🏐",

        coffee: "☕",

        flask: "🧉",

        store: "🏪",

        sandwich: "🥪",

        pizza: "🍕"

    };


    image.textContent =
        icons[profile.profileType] || "👤";
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });


    const page =
        $(pageName);

    if (!page) return;

    page.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (pageName === "cart") {
        renderCart();
    }

    if (pageName === "gifts") {
        renderGifts();
    }

    if (pageName === "messages") {
        loadMessages();
    }
}


/* =========================================================
   API
   ========================================================= */

async function apiFetch(
    url,
    options = {}
) {

    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => controller.abort(),
            15000
        );


    const headers = {

        "apikey": SUPABASE_KEY,

        "Authorization":
            "Bearer " + SUPABASE_KEY,

        "Content-Type":
            "application/json",

        ...(options.headers || {})

    };


    try {

        const response =
            await fetch(url, {
                ...options,
                headers,
                signal: controller.signal
            });


        const text =
            await response.text();


        let data = null;

        if (text) {

            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }

        }


        if (!response.ok) {

            const errorText =
                typeof data === "string"
                    ? data
                    : data?.error ||
                      data?.message ||
                      `HTTP ${response.status}`;

            throw new Error(errorText);
        }


        return data;

    } catch (error) {

        if (error.name === "AbortError") {

            throw new Error(
                "ارتباط با سرور بیش از حد طول کشید."
            );
        }

        throw error;

    } finally {

        clearTimeout(timeout);
    }
}


/* =========================================================
   PRODUCTS
   ========================================================= */

function normalizeProducts(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.products)) {
        return data.products;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    return [];
}


function isGiftProduct(product) {

    const value =
        product?.is_gift ??
        product?.isGift ??
        product?.gift ??
        false;


    if (typeof value === "boolean") {
        return value;
    }


    if (typeof value === "number") {
        return value === 1;
    }


    return [
        "true",
        "1",
        "yes",
        "gift",
        "دارد"
    ].includes(
        String(value)
            .trim()
            .toLowerCase()
    );
}


function getProductName(product) {

    return (
        product?.name ??
        product?.product_name ??
        product?.title ??
        "کالای بدون نام"
    );
}


function getProductPrice(product) {

    return numberValue(
        product?.price ??
        product?.product_price ??
        0
    );
}


function getSellerName(product) {

    return (
        product?.seller_name ??
        product?.sellerName ??
        product?.seller ??
        "فروشنده"
    );
}


function getSellerPhone(product) {

    return (
        product?.seller_phone ??
        product?.sellerPhone ??
        product?.phone ??
        "-"
    );
}


function getSellerNumber(product) {

    return (
        product?.zardaloo_number ??
        product?.zardalooNumber ??
        product?.seller_zardaloo_number ??
        product?.seller_number ??
        "-"
    );
}


function getProductId(product) {

    return (
        product?.id ??
        product?.product_id ??
        product?.uuid ??
        ""
    );
}


async function loadProducts() {

    setMessage(
        "marketStatus",
        "در حال دریافت کالاها..."
    );


    const container =
        $("products");

    if (container) {

        container.innerHTML =
            `<div class="loading">در حال دریافت کالاها...</div>`;
    }


    try {

        const data =
            await apiFetch(
                PRODUCTS_URL,
                {
                    method: "GET"
                }
            );


        products =
            normalizeProducts(data);


        filteredProducts =
            [...products];


        renderProducts();

        renderGifts();


        setMessage(
            "marketStatus",
            products.length
                ? `${products.length} کالا دریافت شد.`
                : "هنوز کالایی ثبت نشده است.",
            "success"
        );


    } catch (error) {

        console.error(error);


        if (container) {

            container.innerHTML = `
                <div class="form-card">
                    <h3>دریافت کالاها انجام نشد</h3>
                    <p>
                        ${escapeHTML(error.message)}
                    </p>
                    <button
                        class="main-yellow-button"
                        onclick="loadProducts()">
                        تلاش دوباره
                    </button>
                </div>
            `;
        }


        setMessage(
            "marketStatus",
            "ارتباط با سرور برقرار نشد: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   PRODUCT FILTER
   ========================================================= */

function filterProducts() {

    const name =
        $("searchName")
            .value
            .trim()
            .toLowerCase();


    const seller =
        $("sellerFilter")
            .value
            .trim()
            .toLowerCase();


    const min =
        numberValue(
            $("minPrice").value
        );


    const max =
        numberValue(
            $("maxPrice").value
        );


    const gift =
        $("giftFilter").value;


    filteredProducts =
        products.filter(product => {

            const productName =
                getProductName(product)
                    .toLowerCase();


            const sellerName =
                getSellerName(product)
                    .toLowerCase();


            const price =
                getProductPrice(product);


            const giftValue =
                isGiftProduct(product);


            if (
                name &&
                !productName.includes(name)
            ) {
                return false;
            }


            if (
                seller &&
                !sellerName.includes(seller)
            ) {
                return false;
            }


            if (
                min > 0 &&
                price < min
            ) {
                return false;
            }


            if (
                max > 0 &&
                price > max
            ) {
                return false;
            }


            if (
                gift === "yes" &&
                !giftValue
            ) {
                return false;
            }


            if (
                gift === "no" &&
                giftValue
            ) {
                return false;
            }


            return true;
        });


    renderProducts();
}


function productCard(product) {

    const id =
        getProductId(product);

    const name =
        getProductName(product);

    const price =
        getProductPrice(product);

    const seller =
        getSellerName(product);

    const phone =
        getSellerPhone(product);

    const zardaloo =
        getSellerNumber(product);

    const description =
        product?.description ??
        product?.product_description ??
        "";

    const gift =
        isGiftProduct(product);

    const giftDescription =
        product?.gift_description ??
        product?.giftDescription ??
        "";


    const myNumber =
        getCurrentZardalooNumber();


    const isOwner =
        myNumber &&
        zardaloo &&
        String(myNumber) === String(zardaloo);


    return `

        <article class="product-card">

            <div class="product-icon">
                📦
            </div>

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

                شماره تماس:
                ${escapeHTML(phone)}
                <br>

                شماره زردآلو:
                ${escapeHTML(zardaloo)}

            </div>


            ${
                description
                ? `
                    <p class="product-meta">
                        ${escapeHTML(description)}
                    </p>
                `
                : ""
            }


            ${
                gift
                ? `
                    <span class="gift-badge">
                        🎁 اشانتیون دارد
                    </span>

                    ${
                        giftDescription
                        ? `
                            <p class="product-meta">
                                🎁
                                ${escapeHTML(giftDescription)}
                            </p>
                        `
                        : ""
                    }
                `
                : ""
            }


            <div class="product-actions">

                <button
                    class="main-yellow-button"
                    onclick="addToCart('${escapeHTML(String(id))}')">
                    🛒 افزودن
                </button>

                <button
                    class="secondary-button"
                    onclick="openMessageTo('${escapeHTML(String(zardaloo))}')">
                    💬 پیام
                </button>

                ${
                    isOwner
                    ? `
                        <button
                            class="secondary-button"
                            onclick="deleteOwnProduct('${escapeHTML(String(id))}')">
                            🗑️ حذف
                        </button>
                    `
                    : ""
                }

            </div>

        </article>
    `;
}


function renderProducts() {

    const container =
        $("products");

    if (!container) return;


    if (!filteredProducts.length) {

        container.innerHTML =
            `
            <div class="form-card">
                <h3>کالایی پیدا نشد.</h3>
            </div>
            `;

        return;
    }


    container.innerHTML =
        filteredProducts
            .map(productCard)
            .join("");
}


function renderGifts() {

    const container =
        $("giftProducts");

    if (!container) return;


    const gifts =
        products.filter(isGiftProduct);


    if (!gifts.length) {

        container.innerHTML =
            `
            <div class="form-card">
                <h3>
                    هنوز کالای اشانتیونی ثبت نشده است.
                </h3>
            </div>
            `;

        return;
    }


    container.innerHTML =
        gifts.map(productCard).join("");
}


/* =========================================================
   REGISTER PRODUCT
   ========================================================= */

function toggleGiftDescription() {

    const checked =
        $("isGift").checked;

    $("giftDescription")
        .classList.toggle(
            "hidden",
            !checked
        );
}


async function registerProduct() {

    const profile =
        getProfile();


    if (!profile) {

        setMessage(
            "registerMessage",
            "ابتدا وارد زردآلو شوید.",
            "error"
        );

        showPage("home");

        return;
    }


    const name =
        $("productName").value.trim();

    const price =
        numberValue(
            $("productPrice").value
        );

    const sellerName =
        $("sellerName").value.trim();

    const sellerPhone =
        $("sellerPhone").value.trim();

    const description =
        $("productDescription")
            .value
            .trim();

    const isGift =
        $("isGift").checked;

    const giftDescription =
        $("giftDescription")
            .value
            .trim();


    /*
     * نام فروشنده اگر خالی باشد
     * از پروفایل استفاده می‌شود.
     */

    const finalSellerName =
        sellerName || profile.name;


    const finalSellerPhone =
        sellerPhone || profile.phone;


    if (!name || price <= 0) {

        setMessage(
            "registerMessage",
            "نام کالا و قیمت را وارد کنید.",
            "error"
        );

        return;
    }


    if (isGift && !giftDescription) {

        setMessage(
            "registerMessage",
            "برای اشانتیون توضیحات وارد کنید.",
            "error"
        );

        return;
    }


    const payload = {

        name: name,

        price: price,

        seller_name:
            finalSellerName,

        seller_phone:
            finalSellerPhone,

        zardaloo_number:
            profile.zardalooNumber,

        description:
            description,

        is_gift:
            isGift,

        gift_description:
            isGift
                ? giftDescription
                : ""

    };


    setMessage(
        "registerMessage",
        "در حال ثبت کالا..."
    );


    try {

        await apiFetch(
            PRODUCTS_URL,
            {
                method: "POST",
                body: JSON.stringify(payload)
            }
        );


        setMessage(
            "registerMessage",
            "کالا با موفقیت ثبت شد.",
            "success"
        );


        $("productName").value = "";
        $("productPrice").value = "";
        $("productDescription").value = "";
        $("isGift").checked = false;
        $("giftDescription").value = "";

        toggleGiftDescription();


        await loadProducts();


    } catch (error) {

        console.error(error);

        setMessage(
            "registerMessage",
            "ثبت کالا انجام نشد: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   CART
   ========================================================= */

function loadCart() {

    try {

        cart =
            JSON.parse(
                localStorage.getItem(CART_KEY)
            ) || [];

    } catch {

        cart = [];
    }


    const savedDiscount =
        localStorage.getItem(
            DISCOUNT_KEY
        );


    if (savedDiscount) {

        try {

            const parsed =
                JSON.parse(savedDiscount);

            discountCode =
                parsed.code || "";

            discountPercent =
                numberValue(parsed.percent);

        } catch {

            discountCode = "";
            discountPercent = 0;
        }
    }
}


function saveCart() {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );
}


function findProduct(id) {

    return products.find(
        product =>
            String(getProductId(product)) ===
            String(id)
    );
}


function addToCart(id) {

    const product =
        findProduct(id);


    if (!product) {

        alert(
            "این کالا دیگر در بازار موجود نیست."
        );

        return;
    }


    const existing =
        cart.find(
            item =>
                String(item.id) ===
                String(id)
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

            quantity: 1

        });
    }


    saveCart();

    renderCart();


    alert(
        "کالا به سبد خرید اضافه شد."
    );
}


function removeFromCart(id) {

    cart =
        cart.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    saveCart();

    renderCart();
}


function changeQuantity(id, amount) {

    const item =
        cart.find(
            x =>
                String(x.id) ===
                String(id)
        );


    if (!item) return;


    item.quantity += amount;


    if (item.quantity <= 0) {

        removeFromCart(id);

        return;
    }


    saveCart();

    renderCart();
}


function calculateCart() {

    const original =
        cart.reduce(
            (sum, item) =>
                sum +
                numberValue(item.price) *
                numberValue(item.quantity),
            0
        );


    const discount =
        Math.round(
            original *
            (discountPercent / 100)
        );


    const final =
        Math.max(
            0,
            original - discount
        );


    return {
        original,
        discount,
        final
    };
}


function renderCart() {

    const items =
        $("cartItems");

    const summary =
        $("cartSummary");


    if (!items || !summary) return;


    if (!cart.length) {

        items.innerHTML =
            `
            <div class="form-card">
                <h3>
                    سبد خرید خالی است.
                </h3>
            </div>
            `;

        summary.innerHTML = "";

        return;
    }


    items.innerHTML =
        cart.map(item => `

            <div class="cart-item">

                <div>

                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>

                    <p>
                        قیمت:
                        ${formatPrice(item.price)}
                    </p>

                </div>


                <div>

                    <button
                        class="secondary-button"
                        onclick="changeQuantity('${escapeHTML(String(item.id))}', -1)">
                        −
                    </button>

                    <strong>
                        ${item.quantity}
                    </strong>

                    <button
                        class="secondary-button"
                        onclick="changeQuantity('${escapeHTML(String(item.id))}', 1)">
                        +
                    </button>

                </div>


                <button
                    class="secondary-button"
                    onclick="removeFromCart('${escapeHTML(String(item.id))}')">
                    حذف
                </button>

            </div>

        `).join("");


    const totals =
        calculateCart();


    summary.innerHTML = `

        <div class="summary-row">

            <span>
                قیمت کل کالاها
            </span>

            <strong>
                ${formatPrice(totals.original)}
            </strong>

        </div>


        <div class="summary-row">

            <span>
                تخفیف
                ${
                    discountPercent
                    ? `(${discountPercent}%)`
                    : ""
                }
            </span>

            <strong>
                ${formatPrice(totals.discount)}
            </strong>

        </div>


        <div class="summary-row summary-final">

            <span>
                قیمت نهایی
            </span>

            <strong>
                ${formatPrice(totals.final)}
            </strong>

        </div>


        ${
            discountCode
            ? `
                <p>
                    کد اعمال‌شده:
                    <strong>
                        ${escapeHTML(discountCode)}
                    </strong>
                </p>
            `
            : ""
        }

    `;
}


/* =========================================================
   DISCOUNT
   ========================================================= */

const DISCOUNT_CODES = {

    "50": 50,

    "100": 100,

    "ZARDALOO50": 50,

    "ZARDALOO100": 100

};


function applyCartDiscount() {

    const code =
        $("cartDiscountCode")
            .value
            .trim()
            .toUpperCase();


    if (!code) {

        setMessage(
            "cartDiscountMessage",
            "کد تخفیف را وارد کنید.",
            "error"
        );

        return;
    }


    const percent =
        DISCOUNT_CODES[code];


    if (percent === undefined) {

        setMessage(
            "cartDiscountMessage",
            "کد تخفیف معتبر نیست.",
            "error"
        );

        discountCode = "";
        discountPercent = 0;

        localStorage.removeItem(
            DISCOUNT_KEY
        );

        renderCart();

        return;
    }


    discountCode = code;
    discountPercent = percent;


    localStorage.setItem(
        DISCOUNT_KEY,
        JSON.stringify({
            code: code,
            percent: percent
        })
    );


    setMessage(
        "cartDiscountMessage",
        `کد تخفیف ${percent}% اعمال شد.`,
        "success"
    );


    renderCart();
}


/* =========================================================
   DELETE OWN PRODUCT
   ========================================================= */

async function deleteOwnProduct(id) {

    const product =
        findProduct(id);

    if (!product) return;


    const owner =
        getCurrentZardalooNumber();

    const seller =
        getSellerNumber(product);


    if (
        !owner ||
        String(owner) !== String(seller)
    ) {

        alert(
            "فقط سازنده کالا می‌تواند آن را حذف کند."
        );

        return;
    }


    if (
        !confirm(
            "آیا از حذف این کالا مطمئن هستید؟"
        )
    ) {
        return;
    }


    try {

        await apiFetch(
            PRODUCTS_URL +
            "?id=" +
            encodeURIComponent(id),

            {
                method: "DELETE"
            }
        );


        await loadProducts();


    } catch (error) {

        alert(
            "حذف کالا انجام نشد: " +
            error.message
        );
    }
}


/* =========================================================
   MESSAGES
   ========================================================= */

function openMessageTo(number) {

    showPage("messages");

    $("messageReceiver").value =
        number || "";
}


async function sendMessage() {

    const profile =
        getProfile();


    if (!profile) return;


    const receiver =
        $("messageReceiver")
            .value
            .trim();


    const text =
        $("messageText")
            .value
            .trim();


    if (!receiver || !text) {

        setMessage(
            "messageSendStatus",
            "شماره گیرنده و متن پیام را وارد کنید.",
            "error"
        );

        return;
    }


    const payload = {

        sender_zardaloo_number:
            profile.zardalooNumber,

        receiver_zardaloo_number:
            receiver,

        message:
            text

    };


    try {

        await apiFetch(
            MESSAGES_URL,
            {
                method: "POST",
                body: JSON.stringify(payload)
            }
        );


        $("messageText").value = "";


        setMessage(
            "messageSendStatus",
            "پیام ارسال شد.",
            "success"
        );


        loadMessages();


    } catch (error) {

        setMessage(
            "messageSendStatus",
            "ارسال پیام انجام نشد: " +
            error.message,
            "error"
        );
    }
}


async function loadMessages() {

    const profile =
        getProfile();

    const container =
        $("messageList");


    if (!profile || !container) return;


    try {

        const data =
            await apiFetch(
                MESSAGES_URL +
                "?zardaloo_number=" +
                encodeURIComponent(
                    profile.zardalooNumber
                )
            );


        const messages =
            Array.isArray(data)
                ? data
                : data?.messages || [];


        if (!messages.length) {

            container.innerHTML =
                "<p>هنوز پیامی ندارید.</p>";

            return;
        }


        container.innerHTML =
            messages.map(message => `

                <div class="chat-message">

                    <strong>
                        ${escapeHTML(
                            message.sender_zardaloo_number ||
                            message.sender ||
                            "-"
                        )}
                    </strong>

                    <p>
                        ${escapeHTML(
                            message.message ||
                            message.text ||
                            ""
                        )}
                    </p>

                </div>

            `).join("");


    } catch (error) {

        container.innerHTML =
            `
            <p>
                دریافت پیام‌ها انجام نشد.
            </p>
            `;
    }
}


/* =========================================================
   REPORT
   ========================================================= */

async function submitReport() {

    const profile =
        getProfile();


    const seller =
        $("reportSellerNumber")
            .value
            .trim();


    const reason =
        $("reportReason")
            .value;


    const description =
        $("reportDescription")
            .value
            .trim();


    if (!profile) {

        setMessage(
            "reportMessage",
            "ابتدا وارد زردآلو شوید.",
            "error"
        );

        return;
    }


    if (!seller || !reason) {

        setMessage(
            "reportMessage",
            "شماره فروشنده و دلیل گزارش را وارد کنید.",
            "error"
        );

        return;
    }


    try {

        await apiFetch(
            REPORTS_URL,
            {
                method: "POST",

                body: JSON.stringify({

                    reporter_zardaloo_number:
                        profile.zardalooNumber,

                    seller_zardaloo_number:
                        seller,

                    reason:
                        reason,

                    description:
                        description

                })
            }
        );


        setMessage(
            "reportMessage",
            "گزارش با موفقیت ثبت شد.",
            "success"
        );


        $("reportSellerNumber").value = "";
        $("reportDescription").value = "";


    } catch (error) {

        setMessage(
            "reportMessage",
            "ثبت گزارش انجام نشد: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   ADMIN
   ========================================================= */

const ADMIN_NUMBER =
    "0994051777";

const ADMIN_PASSWORD =
    "ERFAN";


function adminLogin() {

    const number =
        $("adminNumber")
            .value
            .trim();

    const password =
        $("adminPassword")
            .value;


    if (
        number !== ADMIN_NUMBER ||
        password !== ADMIN_PASSWORD
    ) {

        setMessage(
            "adminMessage",
            "اطلاعات مدیریت صحیح نیست.",
            "error"
        );

        return;
    }


    adminToken =
        btoa(
            number +
            ":" +
            password
        );


    sessionStorage.setItem(
        ADMIN_SESSION_KEY,
        adminToken
    );


    $("adminLoginBox")
        .classList.add("hidden");

    $("adminPanel")
        .classList.remove("hidden");


    loadAdminProducts();
}


function adminLogout() {

    adminToken = "";

    sessionStorage.removeItem(
        ADMIN_SESSION_KEY
    );


    $("adminPanel")
        .classList.add("hidden");

    $("adminLoginBox")
        .classList.remove("hidden");
}


function adminHeaders() {

    return {

        "X-Admin-Token":
            adminToken

    };
}


async function adminRequest(
    path,
    options = {}
) {

    return apiFetch(
        ADMIN_URL + path,
        {
            ...options,
            headers: {
                ...adminHeaders(),
                ...(options.headers || {})
            }
        }
    );
}


/* ================= ADMIN PRODUCTS ================= */

async function loadAdminProducts() {

    const container =
        $("adminContent");


    try {

        const data =
            await adminRequest(
                "/products"
            );


        const list =
            Array.isArray(data)
                ? data
                : data?.products || [];


        $("adminProductCount")
            .textContent =
            list.length;


        container.innerHTML = `

            <h3>
                کالاهای ثبت‌شده
            </h3>

            <table class="admin-table">

                <thead>

                    <tr>

                        <th>
                            کالا
                        </th>

                        <th>
                            فروشنده
                        </th>

                        <th>
                            قیمت
                        </th>

                        <th>
                            عملیات
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${
                        list.map(product => `

                            <tr>

                                <td>
                                    ${escapeHTML(
                                        getProductName(product)
                                    )}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        getSellerName(product)
                                    )}
                                </td>

                                <td>
                                    ${formatPrice(
                                        getProductPrice(product)
                                    )}
                                </td>

                                <td>

                                    <button
                                        onclick="adminDeleteProduct('${escapeHTML(String(getProductId(product)))}')">
                                        حذف
                                    </button>

                                </td>

                            </tr>

                        `).join("")
                    }

                </tbody>

            </table>
        `;


    } catch (error) {

        container.innerHTML =
            `
            <p>
                دریافت کالاهای مدیریت انجام نشد:
                ${escapeHTML(error.message)}
            </p>
            `;
    }
}


async function adminDeleteProduct(id) {

    if (!confirm("این کالا حذف شود؟")) {
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


        loadAdminProducts();

        loadProducts();


    } catch (error) {

        alert(
            "حذف انجام نشد: " +
            error.message
        );
    }
}


/* ================= ADMIN REPORTS ================= */

async function loadAdminReports() {

    const container =
        $("adminContent");


    try {

        const data =
            await adminRequest(
                "/reports"
            );


        const reports =
            Array.isArray(data)
                ? data
                : data?.reports || [];


        container.innerHTML = `

            <h3>
                گزارش‌ها
            </h3>

            ${
                reports.length
                ? reports.map(report => `

                    <div class="cart-item">

                        <div>

                            <strong>
                                فروشنده:
                                ${escapeHTML(
                                    report.seller_zardaloo_number ||
                                    report.seller_number ||
                                    "-"
                                )}
                            </strong>

                            <p>
                                دلیل:
                                ${escapeHTML(
                                    report.reason || "-"
                                )}
                            </p>

                            <p>
                                ${escapeHTML(
                                    report.description || ""
                                )}
                            </p>

                        </div>

                        <button
                            class="secondary-button"
                            onclick="adminDeleteReport('${escapeHTML(String(report.id))}')">
                            🗑️ حذف گزارش
                        </button>

                    </div>

                `).join("")
                : "<p>گزارشی وجود ندارد.</p>"
            }

        `;


    } catch (error) {

        container.innerHTML =
            `
            <p>
                دریافت گزارش‌ها انجام نشد:
                ${escapeHTML(error.message)}
            </p>
            `;
    }
}


async function adminDeleteReport(id) {

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


        loadAdminReports();


    } catch (error) {

        alert(
            "حذف گزارش انجام نشد: " +
            error.message
        );
    }
}


/* ================= ADMIN CARTS ================= */

async function loadAdminCarts() {

    const container =
        $("adminContent");


    try {

        const data =
            await adminRequest(
                "/carts"
            );


        const carts =
            Array.isArray(data)
                ? data
                : data?.carts || [];


        const groups = {};


        carts.forEach(item => {

            const number =
                item.zardaloo_number ||
                item.user_zardaloo_number ||
                "نامشخص";


            if (!groups[number]) {
                groups[number] = [];
            }


            groups[number].push(item);

        });


        let html =
            "<h3>سبد خرید کاربران</h3>";


        Object.entries(groups)
            .forEach(
                ([number, items]) => {

                    html += `

                        <div class="cart-item">

                            <div>

                                <strong>
                                    شماره زردآلو:
                                    ${escapeHTML(number)}
                                </strong>

                                <p>
                                    تعداد کالا:
                                    ${items.length}
                                </p>

                            </div>

                        </div>
                    `;
                }
            );


        container.innerHTML =
            html;


        $("adminCartCount")
            .textContent =
            carts.length;


    } catch (error) {

        container.innerHTML =
            `
            <p>
                دریافت سبدها انجام نشد:
                ${escapeHTML(error.message)}
            </p>
            `;
    }
}


/* ================= ADMIN USERS ================= */

async function loadAdminUsers() {

    const container =
        $("adminContent");


    try {

        const data =
            await adminRequest(
                "/users"
            );


        const users =
            Array.isArray(data)
                ? data
                : data?.users || [];


        $("adminUserCount")
            .textContent =
            users.length;


        container.innerHTML = `

            <h3>
                کاربران
            </h3>

            ${
                users.length
                ? users.map(user => `

                    <div class="cart-item">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    user.name || "-"
                                )}
                            </strong>

                            <p>
                                شماره زردآلو:
                                ${escapeHTML(
                                    user.zardaloo_number ||
                                    user.zardalooNumber ||
                                    "-"
                                )}
                            </p>

                            <p>
                                شماره تماس:
                                ${escapeHTML(
                                    user.phone || "-"
                                )}
                            </p>

                        </div>

                        <button
                            class="secondary-button"
                            onclick="kickUser('${escapeHTML(
                                String(
                                    user.zardaloo_number ||
                                    user.zardalooNumber ||
                                    ""
                                )
                            )}')">
                            بیرون کردن
                        </button>

                    </div>

                `).join("")
                : "<p>کاربری وجود ندارد.</p>"
            }

        `;


    } catch (error) {

        container.innerHTML =
            `
            <p>
                دریافت کاربران انجام نشد:
                ${escapeHTML(error.message)}
            </p>
            `;
    }
}


async function kickUser(number) {

    if (!number) return;


    if (!confirm(
        "این کاربر از سیستم خارج شود؟"
    )) {
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


        loadAdminUsers();


    } catch (error) {

        alert(
            "خروج کاربر انجام نشد: " +
            error.message
        );
    }
}


/* ================= CLEAR CART ================= */

async function clearAllCart() {

    if (!confirm(
        "سبد خرید همه کاربران خالی شود؟"
    )) {
        return;
    }


    try {

        await adminRequest(
            "/carts",
            {
                method: "DELETE"
            }
        );


        loadAdminCarts();


    } catch (error) {

        alert(
            "خالی کردن سبدها انجام نشد: " +
            error.message
        );
    }
}


/* =========================================================
   THEME
   ========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    localStorage.setItem(
        THEME_KEY,
        document.body.classList.contains("dark")
            ? "dark"
            : "light"
    );
}


function loadTheme() {

    if (
        localStorage.getItem(
            THEME_KEY
        ) === "dark"
    ) {

        document.body.classList.add(
            "dark"
        );
    }
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * این قسمت کلیدی است:
         *
         * اگر پروفایل قبلاً ذخیره شده باشد،
         * صفحه پروفایل دیگر نمایش داده نمی‌شود.
         *
         * اگر ذخیره نشده باشد،
         * فقط همان بار اول صفحه پروفایل می‌آید.
         */

        initializeProfile();


        const adminSaved =
            sessionStorage.getItem(
                ADMIN_SESSION_KEY
            );


        if (adminSaved) {

            adminToken =
                adminSaved;

            $("adminLoginBox")
                ?.classList.add("hidden");

            $("adminPanel")
                ?.classList.remove("hidden");
        }

    }
);
