"use strict";

/* =========================================================
   زردآلو | script.js
   Godot / Supabase Web Version
   ========================================================= */

/* =========================
   SUPABASE
   ========================= */

const SUPABASE_URL =
    "https://ovqldknqpaiczrddcrxp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_VDZ_tgoMgYRI7K419ieDKw_y29xeXA2";

const PRODUCTS_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/products";

const ADMIN_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/admin-reports";

const REPORT_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/report-seller";

const MESSAGES_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/messages";

const ADMIN_NUMBER = "0994051777";
const ADMIN_PASSWORD = "ERFAN";


/* =========================
   LOCAL STORAGE KEYS
   ========================= */

const PROFILE_KEY = "zardaloo_profile_v3";
const CART_KEY = "zardaloo_cart_v3";
const DISCOUNT_KEY = "zardaloo_discount_v3";
const THEME_KEY = "zardaloo_theme_v3";
const ADMIN_KEY = "zardaloo_admin_session_v3";


/* =========================
   DATA
   ========================= */

let profile = null;
let products = [];
let cart = [];
let currentDiscount = null;
let adminLoggedIn = false;

let selectedAvatar = "";
let uploadedAvatar = "";

let currentProduct = null;


/* =========================
   DISCOUNT CODES
   ========================= */

const DISCOUNT_CODES = {
    "ZARDALOO10": 10,
    "ZARDALOO20": 20,
    "50": 50,
    "100": 100
};


/* =========================
   BASIC HELPERS
   ========================= */

function $(id) {
    return document.getElementById(id);
}


function safeText(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value);
}


function escapeHTML(value) {
    return safeText(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatPrice(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "۰";
    }

    return number.toLocaleString("fa-IR");
}


function showToast(message) {
    let toast = $("zardalooToast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "zardalooToast";
        toast.className = "zardaloo-toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.__zardalooToastTimer);

    window.__zardalooToastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}


function setLoading(button, loading, normalText) {
    if (!button) {
        return;
    }

    button.disabled = loading;

    if (loading) {
        button.dataset.oldText = button.textContent;
        button.textContent = "در حال انجام...";
    } else {
        button.textContent =
            normalText ||
            button.dataset.oldText ||
            button.textContent;

        delete button.dataset.oldText;
    }
}


/* =========================
   PROFILE
   ========================= */

function loadProfile() {
    try {
        const saved = localStorage.getItem(PROFILE_KEY);

        if (!saved) {
            profile = null;
            return;
        }

        profile = JSON.parse(saved);

        if (!profile || typeof profile !== "object") {
            profile = null;
        }
    } catch (error) {
        console.error("PROFILE LOAD ERROR:", error);
        profile = null;
    }
}


function saveProfile() {
    if (!profile) {
        return false;
    }

    try {
        localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify(profile)
        );

        return true;
    } catch (error) {
        console.error("PROFILE SAVE ERROR:", error);

        showToast(
            "ذخیره پروفایل انجام نشد. ممکن است عکس انتخابی خیلی بزرگ باشد."
        );

        return false;
    }
}


function profileIsComplete() {
    if (!profile) {
        return false;
    }

    const name = safeText(profile.name).trim();
    const phone = safeText(profile.phone).trim();
    const zardalooNumber =
        safeText(profile.zardalooNumber).trim();

    return (
        name !== "" &&
        phone !== "" &&
        zardalooNumber !== ""
    );
}


function getProfileName() {
    return safeText(
        profile?.name ||
        profile?.userName ||
        profile?.fullName
    ).trim();
}


function getProfilePhone() {
    return safeText(
        profile?.phone ||
        profile?.userPhone ||
        profile?.contactPhone
    ).trim();
}


function getProfileZardalooNumber() {
    return safeText(
        profile?.zardalooNumber ||
        profile?.userZardalooNumber ||
        profile?.zardaloo_number
    ).trim();
}


function getProfileAvatar() {
    return (
        profile?.avatar ||
        selectedAvatar ||
        "👤"
    );
}


/* =========================
   AVATAR
   ========================= */

function selectAvatar(avatar) {
    selectedAvatar = avatar;
    uploadedAvatar = "";

    updateAvatarPreview();

    document
        .querySelectorAll(".avatar-option")
        .forEach(option => {
            option.classList.remove("selected");

            if (
                option.dataset.avatar === avatar
            ) {
                option.classList.add("selected");
            }
        });
}


function updateAvatarPreview() {
    const preview = $("profileAvatarPreview");

    if (!preview) {
        return;
    }

    const avatar =
        uploadedAvatar ||
        selectedAvatar ||
        profile?.avatar ||
        "👤";

    if (
        typeof avatar === "string" &&
        avatar.startsWith("data:image/")
    ) {
        preview.innerHTML =
            `<img src="${avatar}" alt="تصویر پروفایل">`;
    } else {
        preview.innerHTML =
            `<span>${escapeHTML(avatar)}</span>`;
    }

    preview.classList.add("avatar-ready");
}


function setupAvatarOptions() {
    document
        .querySelectorAll(".avatar-option")
        .forEach(option => {

            option.addEventListener("click", () => {

                const avatar =
                    option.dataset.avatar || "";

                if (avatar) {
                    selectAvatar(avatar);
                }
            });
        });
}


function resizeImage(file, maxSize = 300) {
    return new Promise((resolve, reject) => {

        if (!file) {
            reject(new Error("No file"));
            return;
        }

        const reader = new FileReader();

        reader.onload = event => {

            const image = new Image();

            image.onload = () => {

                let width = image.width;
                let height = image.height;

                if (
                    width > maxSize ||
                    height > maxSize
                ) {
                    if (width > height) {
                        height =
                            Math.round(
                                height *
                                maxSize /
                                width
                            );

                        width = maxSize;

                    } else {
                        width =
                            Math.round(
                                width *
                                maxSize /
                                height
                            );

                        height = maxSize;
                    }
                }

                const canvas =
                    document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const context =
                    canvas.getContext("2d");

                context.drawImage(
                    image,
                    0,
                    0,
                    width,
                    height
                );

                resolve(
                    canvas.toDataURL(
                        "image/jpeg",
                        0.82
                    )
                );
            };

            image.onerror = () => {
                reject(
                    new Error("Image could not be loaded")
                );
            };

            image.src = event.target.result;
        };

        reader.onerror = () => {
            reject(
                new Error("File could not be read")
            );
        };

        reader.readAsDataURL(file);
    });
}


function setupAvatarUpload() {

    const input = $("profileImage");

    if (!input) {
        return;
    }

    input.addEventListener("change", async event => {

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            showToast("لطفاً یک تصویر انتخاب کنید.");
            return;
        }

        try {

            uploadedAvatar =
                await resizeImage(file);

            selectedAvatar = "";

            updateAvatarPreview();

            document
                .querySelectorAll(".avatar-option")
                .forEach(option => {
                    option.classList.remove("selected");
                });

        } catch (error) {

            console.error(
                "AVATAR ERROR:",
                error
            );

            showToast(
                "خواندن تصویر انجام نشد."
            );
        }
    });
}


/* =========================
   PROFILE FORM
   ========================= */

function saveProfileFromForm() {

    const nameInput = $("profileName");
    const phoneInput = $("profilePhone");
    const numberInput =
        $("profileZardalooNumber");

    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    const phone =
        phoneInput
            ? phoneInput.value.trim()
            : "";

    const zardalooNumber =
        numberInput
            ? numberInput.value.trim()
            : "";

    if (!name) {
        showToast("نام خود را وارد کنید.");
        return false;
    }

    if (!phone) {
        showToast("شماره تماس خود را وارد کنید.");
        return false;
    }

    if (!zardalooNumber) {
        showToast("شماره زردآلو را وارد کنید.");
        return false;
    }

    profile = {
        name: name,
        phone: phone,
        zardalooNumber: zardalooNumber,
        avatar:
            uploadedAvatar ||
            selectedAvatar ||
            "👤"
    };

    if (!saveProfile()) {
        return false;
    }

    updateProfileUI();

    showToast(
        "پروفایل شما با موفقیت ذخیره شد."
    );

    showPage("home");

    return true;
}


function fillProfileForm() {

    if (!profile) {
        return;
    }

    if ($("profileName")) {
        $("profileName").value =
            getProfileName();
    }

    if ($("profilePhone")) {
        $("profilePhone").value =
            getProfilePhone();
    }

    if ($("profileZardalooNumber")) {
        $("profileZardalooNumber").value =
            getProfileZardalooNumber();
    }

    selectedAvatar =
        profile.avatar || "";

    uploadedAvatar = "";

    updateAvatarPreview();
}


/* =========================
   PROFILE UI
   ========================= */

function updateProfileUI() {

    const name =
        getProfileName();

    const phone =
        getProfilePhone();

    const number =
        getProfileZardalooNumber();

    const avatar =
        getProfileAvatar();

    document
        .querySelectorAll("[data-profile-name]")
        .forEach(element => {
            element.textContent =
                name || "کاربر زردآلو";
        });

    document
        .querySelectorAll("[data-profile-phone]")
        .forEach(element => {
            element.textContent =
                phone || "—";
        });

    document
        .querySelectorAll("[data-profile-number]")
        .forEach(element => {
            element.textContent =
                number || "—";
        });

    document
        .querySelectorAll("[data-profile-avatar]")
        .forEach(element => {

            if (
                typeof avatar === "string" &&
                avatar.startsWith("data:image/")
            ) {
                element.innerHTML =
                    `<img src="${avatar}" alt="پروفایل">`;
            } else {
                element.textContent =
                    avatar;
            }
        });

    updateAvatarPreview();
}


/* =========================
   ONBOARDING
   ========================= */

function showOnboarding() {

    const onboarding =
        $("onboarding");

    const app =
        $("app");

    if (onboarding) {
        onboarding.classList.remove("hidden");
        onboarding.style.display = "flex";
    }

    if (app) {
        app.classList.add("hidden");
    }

    fillProfileForm();
}


function hideOnboarding() {

    const onboarding =
        $("onboarding");

    const app =
        $("app");

    if (onboarding) {
        onboarding.classList.add("hidden");
        onboarding.style.display = "none";
    }

    if (app) {
        app.classList.remove("hidden");
    }
}


/* =========================
   PAGE NAVIGATION
   ========================= */

function showPage(pageName) {

    if (
        pageName === "admin" &&
        !adminLoggedIn
    ) {
        pageName = "admin-login";
    }

    if (
        pageName === "home" &&
        !profileIsComplete()
    ) {
        showOnboarding();
        return;
    }

    hideOnboarding();

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
            page.style.display = "none";
        });

    const page =
        document.getElementById(
            "page-" + pageName
        );

    if (page) {
        page.classList.add("active");
        page.style.display = "block";
    }

    document
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === pageName
            );
        });

    if (pageName === "market") {
        loadProducts();
    }

    if (pageName === "gifts") {
        loadProducts();
    }

    if (pageName === "cart") {
        renderCart();
    }

    if (pageName === "home") {
        updateProfileUI();
    }

    if (pageName === "register") {
        prepareRegisterForm();
    }

    if (pageName === "admin") {
        loadAdminDashboard();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function setupNavigation() {

    document
        .querySelectorAll("[data-page]")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const page =
                        button.dataset.page;

                    if (page) {
                        showPage(page);
                    }
                }
            );
        });
}


/* =========================
   ENTER ZARDALOO
   ========================= */

function enterZardaloo() {

    if (profileIsComplete()) {
        showPage("home");
    } else {
        showOnboarding();
    }
}


/* =========================
   PRODUCT NORMALIZATION
   ========================= */

function getProductId(product) {

    return (
        product?.id ??
        product?.product_id ??
        product?.uuid ??
        ""
    );
}


function getProductName(product) {

    return (
        product?.name ??
        product?.product_name ??
        ""
    );
}


function getProductPrice(product) {

    return Number(
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
        ""
    );
}


function getSellerPhone(product) {

    return (
        product?.seller_phone ??
        product?.sellerPhone ??
        product?.phone ??
        ""
    );
}


function getSellerNumber(product) {

    return (
        product?.zardaloo_number ??
        product?.seller_zardaloo_number ??
        product?.sellerNumber ??
        ""
    );
}


function getProductDescription(product) {

    return (
        product?.description ??
        product?.product_description ??
        ""
    );
}


function isGiftProduct(product) {

    const value =
        product?.is_gift ??
        product?.isGift ??
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
        "دارد",
        "gift"
    ].includes(
        String(value)
            .trim()
            .toLowerCase()
    );
}


function getGiftDescription(product) {

    return (
        product?.gift_description ??
        product?.giftDescription ??
        product?.gift_text ??
        ""
    );
}


/* =========================
   API
   ========================= */

async function apiRequest(
    url,
    options = {}
) {

    const headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization":
            "Bearer " + SUPABASE_KEY,
        ...(options.headers || {})
    };

    const response =
        await fetch(url, {
            ...options,
            headers
        });

    const text =
        await response.text();

    let data = null;

    try {
        data = text
            ? JSON.parse(text)
            : null;
    } catch (_) {
        data = text;
    }

    if (!response.ok) {

        const message =
            data?.message ||
            data?.error ||
            data?.detail ||
            text ||
            `HTTP ${response.status}`;

        throw new Error(message);
    }

    return data;
}


/* =========================
   LOAD PRODUCTS
   ========================= */

async function loadProducts() {

    const container =
        $("productsContainer");

    if (container) {
        container.innerHTML =
            `<div class="loading-box">
                در حال دریافت کالاها...
            </div>`;
    }

    try {

        const data =
            await apiRequest(
                PRODUCTS_FUNCTION_URL,
                {
                    method: "GET"
                }
            );

        if (Array.isArray(data)) {
            products = data;
        } else if (
            Array.isArray(data?.products)
        ) {
            products = data.products;
        } else if (
            Array.isArray(data?.data)
        ) {
            products = data.data;
        } else {
            products = [];
        }

        renderProducts();
        renderGifts();

    } catch (error) {

        console.error(
            "LOAD PRODUCTS ERROR:",
            error
        );

        products = [];

        if (container) {
            container.innerHTML = `
                <div class="empty-box">
                    <strong>دریافت کالاها انجام نشد.</strong>
                    <p>${escapeHTML(error.message)}</p>
                    <button
                        type="button"
                        onclick="loadProducts()">
                        تلاش دوباره
                    </button>
                </div>
            `;
        }

        const gifts =
            $("giftsContainer");

        if (gifts) {
            gifts.innerHTML = `
                <div class="empty-box">
                    دریافت اشانتیون‌ها انجام نشد.
                </div>
            `;
        }
    }
}


/* =========================
   PRODUCT CARD
   ========================= */

function createProductCard(product) {

    const id =
        getProductId(product);

    const name =
        getProductName(product);

    const price =
        getProductPrice(product);

    const seller =
        getSellerName(product);

    const sellerNumber =
        getSellerNumber(product);

    const description =
        getProductDescription(product);

    const gift =
        isGiftProduct(product);

    const giftDescription =
        getGiftDescription(product);

    return `
        <article class="product-card">

            <div class="product-card-top">

                <div class="product-icon">
                    ${gift ? "🎁" : "🛍️"}
                </div>

                ${
                    gift
                    ? `<span class="gift-badge">اشانتیون</span>`
                    : ""
                }

            </div>

            <h3>
                ${escapeHTML(name || "بدون نام")}
            </h3>

            <div class="product-price">
                ${formatPrice(price)}
                <small>تومان</small>
            </div>

            <div class="product-seller">
                فروشنده:
                ${escapeHTML(seller || "نامشخص")}
            </div>

            ${
                sellerNumber
                ? `
                    <div class="product-number">
                        شماره زردآلو:
                        ${escapeHTML(sellerNumber)}
                    </div>
                `
                : ""
            }

            ${
                description
                ? `
                    <p class="product-description">
                        ${escapeHTML(description)}
                    </p>
                `
                : ""
            }

            ${
                gift && giftDescription
                ? `
                    <div class="gift-description">
                        🎁
                        ${escapeHTML(giftDescription)}
                    </div>
                `
                : ""
            }

            <div class="product-actions">

                <button
                    type="button"
                    onclick="openProduct(${JSON.stringify(id)})">
                    مشاهده
                </button>

                <button
                    type="button"
                    onclick="addToCart(${JSON.stringify(id)})">
                    افزودن به سبد
                </button>

            </div>

        </article>
    `;
}


/* =========================
   RENDER PRODUCTS
   ========================= */

function renderProducts(list = null) {

    const container =
        $("productsContainer");

    if (!container) {
        return;
    }

    const data =
        Array.isArray(list)
            ? list
            : products;

    if (!data.length) {

        container.innerHTML = `
            <div class="empty-box">
                هنوز کالایی ثبت نشده است.
            </div>
        `;

        return;
    }

    container.innerHTML =
        data
            .map(createProductCard)
            .join("");
}


/* =========================
   RENDER GIFTS
   ========================= */

function renderGifts() {

    const container =
        $("giftsContainer");

    if (!container) {
        return;
    }

    const gifts =
        products.filter(
            product =>
                isGiftProduct(product)
        );

    if (!gifts.length) {

        container.innerHTML = `
            <div class="empty-box">
                در حال حاضر اشانتیونی ثبت نشده است.
            </div>
        `;

        return;
    }

    container.innerHTML =
        gifts
            .map(createProductCard)
            .join("");
}


/* =========================
   MARKET SEARCH
   ========================= */

function applyMarketFilters() {

    const name =
        safeText(
            $("marketSearchName")?.value
        )
            .trim()
            .toLowerCase();

    const min =
        Number(
            $("marketMinPrice")?.value || 0
        );

    const maxInput =
        $("marketMaxPrice")?.value;

    const max =
        maxInput
            ? Number(maxInput)
            : Infinity;

    const seller =
        safeText(
            $("marketSellerName")?.value
        )
            .trim()
            .toLowerCase();

    const giftFilter =
        $("marketGiftFilter")?.value ||
        "all";

    const filtered =
        products.filter(product => {

            const productName =
                getProductName(product)
                    .toLowerCase();

            const sellerName =
                getSellerName(product)
                    .toLowerCase();

            const price =
                getProductPrice(product);

            const gift =
                isGiftProduct(product);

            if (
                name &&
                !productName.includes(name)
            ) {
                return false;
            }

            if (price < min) {
                return false;
            }

            if (
                max !== Infinity &&
                price > max
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

    renderProducts(filtered);
}


/* =========================
   PRODUCT DETAIL
   ========================= */

function openProduct(id) {

    const product =
        products.find(
            item =>
                String(getProductId(item)) ===
                String(id)
        );

    if (!product) {
        showToast("کالا پیدا نشد.");
        return;
    }

    currentProduct = product;

    const container =
        $("productDetailContainer");

    if (!container) {
        showToast("صفحه کالا پیدا نشد.");
        return;
    }

    const productId =
        getProductId(product);

    const sellerNumber =
        getSellerNumber(product);

    const ownProduct =
        String(sellerNumber) ===
        String(getProfileZardalooNumber());

    container.innerHTML = `

        <div class="detail-card">

            <div class="detail-icon">
                ${
                    isGiftProduct(product)
                        ? "🎁"
                        : "🛍️"
                }
            </div>

            <h2>
                ${escapeHTML(
                    getProductName(product)
                )}
            </h2>

            <div class="detail-price">
                ${formatPrice(
                    getProductPrice(product)
                )}
                تومان
            </div>

            <p>
                ${
                    escapeHTML(
                        getProductDescription(product) ||
                        "توضیحی برای این کالا ثبت نشده است."
                    )
                }
            </p>

            <hr>

            <p>
                <strong>فروشنده:</strong>
                ${escapeHTML(
                    getSellerName(product)
                )}
            </p>

            <p>
                <strong>شماره زردآلو:</strong>
                ${escapeHTML(
                    sellerNumber || "—"
                )}
            </p>

            <p>
                <strong>تلفن:</strong>
                ${escapeHTML(
                    getSellerPhone(product) || "—"
                )}
            </p>

            ${
                isGiftProduct(product)
                ? `
                    <div class="gift-description">
                        🎁 اشانتیون:
                        ${escapeHTML(
                            getGiftDescription(product) ||
                            "اشانتیون دارد."
                        )}
                    </div>
                `
                : ""
            }

            <div class="detail-actions">

                <button
                    type="button"
                    onclick="addToCart(${JSON.stringify(productId)})">
                    افزودن به سبد
                </button>

                <button
                    type="button"
                    onclick="startMessage(
                        ${JSON.stringify(sellerNumber)}
                    )">
                    پیام به فروشنده
                </button>

                <button
                    type="button"
                    onclick="openReportPage(
                        ${JSON.stringify(sellerNumber)},
                        ${JSON.stringify(getSellerName(product))}
                    )">
                    گزارش فروشنده
                </button>

                ${
                    ownProduct
                    ? `
                        <button
                            type="button"
                            class="danger-button"
                            onclick="deleteMyProduct(
                                ${JSON.stringify(productId)}
                            )">
                            حذف کالا
                        </button>
                    `
                    : ""
                }

            </div>

        </div>
    `;

    showPage("product");
}


/* =========================
   REGISTER PRODUCT
   ========================= */

function prepareRegisterForm() {

    const sellerName =
        $("sellerName");

    const sellerPhone =
        $("sellerPhone");

    const sellerNumber =
        $("sellerZardalooNumber");

    if (sellerName) {
        sellerName.value =
            getProfileName();

        sellerName.readOnly = true;
    }

    if (sellerPhone) {
        sellerPhone.value =
            getProfilePhone();

        sellerPhone.readOnly = false;
    }

    if (sellerNumber) {
        sellerNumber.value =
            getProfileZardalooNumber();

        sellerNumber.readOnly = true;
    }
}


async function registerProduct() {

    try {

        const nameInput =
            $("productName");

        const priceInput =
            $("productPrice");

        const descriptionInput =
            $("productDescription");

        const giftInput =
            $("isGift");

        const giftDescriptionInput =
            $("giftDescription");

        const submitButton =
            $("registerProductButton");

        const name =
            nameInput
                ? nameInput.value.trim()
                : "";

        const priceText =
            priceInput
                ? priceInput.value.trim()
                : "";

        const description =
            descriptionInput
                ? descriptionInput.value.trim()
                : "";

        const isGift =
            giftInput
                ? giftInput.checked
                : false;

        const giftDescription =
            giftDescriptionInput
                ? giftDescriptionInput.value.trim()
                : "";

        /* فقط این دو مورد برای خود کالا اجباری هستند */

        if (!name) {
            showToast("نام کالا را وارد کنید.");
            return;
        }

        if (!priceText) {
            showToast("قیمت کالا را وارد کنید.");
            return;
        }

        const cleanPrice =
            priceText
                .replace(/,/g, "")
                .replace(/٬/g, "")
                .replace(/\s/g, "");

        const price =
            Number(cleanPrice);

        if (
            !Number.isFinite(price) ||
            price <= 0
        ) {
            showToast("قیمت کالا معتبر نیست.");
            return;
        }

        if (
            isGift &&
            !giftDescription
        ) {
            showToast(
                "توضیحات اشانتیون را وارد کنید."
            );
            return;
        }

        /* اطلاعات فروشنده از پروفایل */

        loadProfile();

        if (!profileIsComplete()) {

            showToast(
                "ابتدا اطلاعات پروفایل خود را کامل کنید."
            );

            showOnboarding();

            return;
        }

        const sellerName =
            getProfileName();

        const sellerPhone =
            getProfilePhone();

        const zardalooNumber =
            getProfileZardalooNumber();

        /* payload */

        const productData = {

            name: name,

            price: price,

            seller_name:
                sellerName,

            seller_phone:
                sellerPhone,

            zardaloo_number:
                zardalooNumber,

            seller_zardaloo_number:
                zardalooNumber,

            owner_zardaloo_number:
                zardalooNumber,

            description:
                description,

            is_gift:
                isGift,

            gift_description:
                isGift
                    ? giftDescription
                    : ""
        };

        console.log(
            "ZARDALOO PRODUCT DATA:",
            productData
        );

        setLoading(
            submitButton,
            true
        );

        const response =
            await fetch(
                PRODUCTS_FUNCTION_URL,
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
                        JSON.stringify(
                            productData
                        )
                }
            );

        const responseText =
            await response.text();

        console.log(
            "PRODUCT STATUS:",
            response.status
        );

        console.log(
            "PRODUCT RESPONSE:",
            responseText
        );

        if (!response.ok) {

            let errorMessage =
                responseText;

            try {

                const errorJSON =
                    JSON.parse(
                        responseText
                    );

                errorMessage =
                    errorJSON.message ||
                    errorJSON.error ||
                    errorJSON.detail ||
                    responseText;

            } catch (_) {
                // JSON نبود
            }

            throw new Error(
                errorMessage ||
                "خطای سرور"
            );
        }

        showToast(
            "کالا با موفقیت ثبت شد."
        );

        /* پاک کردن فرم */

        if (nameInput) {
            nameInput.value = "";
        }

        if (priceInput) {
            priceInput.value = "";
        }

        if (descriptionInput) {
            descriptionInput.value = "";
        }

        if (giftInput) {
            giftInput.checked = false;
        }

        if (giftDescriptionInput) {
            giftDescriptionInput.value = "";
        }

        const giftBox =
            $("giftDescriptionBox");

        if (giftBox) {
            giftBox.style.display =
                "none";
        }

        await loadProducts();

        showPage("market");

    } catch (error) {

        console.error(
            "REGISTER PRODUCT ERROR:",
            error
        );

        showToast(
            "ثبت کالا انجام نشد: " +
            (
                error.message ||
                "خطای نامشخص"
            )
        );

    } finally {

        const submitButton =
            $("registerProductButton");

        setLoading(
            submitButton,
            false,
            "ثبت کالا"
        );
    }
}


/* =========================
   GIFT FORM
   ========================= */

function setupGiftField() {

    const checkbox =
        $("isGift");

    const box =
        $("giftDescriptionBox");

    if (!checkbox || !box) {
        return;
    }

    const update = () => {

        box.style.display =
            checkbox.checked
                ? "block"
                : "none";
    };

    checkbox.addEventListener(
        "change",
        update
    );

    update();
}


/* =========================
   DELETE MY PRODUCT
   ========================= */

async function deleteMyProduct(id) {

    if (!profileIsComplete()) {
        showToast(
            "پروفایل شما کامل نیست."
        );
        return;
    }

    const product =
        products.find(
            item =>
                String(
                    getProductId(item)
                ) === String(id)
        );

    if (!product) {
        showToast("کالا پیدا نشد.");
        return;
    }

    const sellerNumber =
        getSellerNumber(product);

    if (
        String(sellerNumber) !==
        String(
            getProfileZardalooNumber()
        )
    ) {
        showToast(
            "شما اجازه حذف این کالا را ندارید."
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

        const url =
            PRODUCTS_FUNCTION_URL +
            "?id=" +
            encodeURIComponent(id);

        await apiRequest(
            url,
            {
                method: "DELETE"
            }
        );

        showToast(
            "کالا حذف شد."
        );

        await loadProducts();

        showPage("market");

    } catch (error) {

        console.error(
            "DELETE PRODUCT ERROR:",
            error
        );

        showToast(
            "حذف کالا انجام نشد: " +
            error.message
        );
    }
}


/* =========================
   CART
   ========================= */

function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                CART_KEY
            );

        if (!saved) {
            cart = [];
            return;
        }

        const parsed =
            JSON.parse(saved);

        cart =
            Array.isArray(parsed)
                ? parsed
                : [];

    } catch (error) {

        console.error(
            "CART LOAD ERROR:",
            error
        );

        cart = [];
    }
}


function saveCart() {

    try {

        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );

    } catch (error) {

        console.error(
            "CART SAVE ERROR:",
            error
        );
    }
}


function addToCart(productId) {

    const product =
        products.find(
            item =>
                String(
                    getProductId(item)
                ) === String(productId)
        );

    if (!product) {
        showToast("کالا پیدا نشد.");
        return;
    }

    const id =
        String(getProductId(product));

    const existing =
        cart.find(
            item =>
                String(item.id) === id
        );

    if (existing) {
        existing.quantity =
            Number(existing.quantity || 1) + 1;
    } else {

        cart.push({
            id: id,
            name: getProductName(product),
            price: getProductPrice(product),
            seller_name:
                getSellerName(product),
            seller_phone:
                getSellerPhone(product),
            seller_zardaloo_number:
                getSellerNumber(product),
            quantity: 1
        });
    }

    saveCart();

    updateCartCount();

    showToast(
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

    updateCartCount();
}


function changeCartQuantity(id, amount) {

    const item =
        cart.find(
            product =>
                String(product.id) ===
                String(id)
        );

    if (!item) {
        return;
    }

    item.quantity =
        Number(item.quantity || 1) +
        Number(amount);

    if (item.quantity <= 0) {
        removeFromCart(id);
        return;
    }

    saveCart();

    renderCart();

    updateCartCount();
}


function getCartSubtotal() {

    return cart.reduce(
        (total, item) => {

            const price =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 1;

            return total +
                price * quantity;

        },
        0
    );
}


/* =========================
   DISCOUNT
   ========================= */

function loadDiscount() {

    try {

        const saved =
            localStorage.getItem(
                DISCOUNT_KEY
            );

        if (!saved) {
            currentDiscount = null;
            return;
        }

        currentDiscount =
            JSON.parse(saved);

    } catch (error) {

        console.error(
            "DISCOUNT LOAD ERROR:",
            error
        );

        currentDiscount = null;
    }
}


function saveDiscount() {

    if (!currentDiscount) {

        localStorage.removeItem(
            DISCOUNT_KEY
        );

        return;
    }

    localStorage.setItem(
        DISCOUNT_KEY,
        JSON.stringify(
            currentDiscount
        )
    );
}


function applyDiscountCode() {

    const input =
        $("cartDiscountCode") ||
        $("discountCodeInput");

    if (!input) {
        return;
    }

    const code =
        input.value
            .trim()
            .toUpperCase();

    if (!code) {
        showToast(
            "کد تخفیف را وارد کنید."
        );
        return;
    }

    const percent =
        DISCOUNT_CODES[code];

    if (percent === undefined) {

        showToast(
            "کد تخفیف معتبر نیست."
        );

        return;
    }

    currentDiscount = {
        code: code,
        percent: percent
    };

    saveDiscount();

    renderCart();

    showToast(
        `کد ${code} با ${percent}٪ تخفیف اعمال شد.`
    );
}


function removeDiscount() {

    currentDiscount = null;

    saveDiscount();

    renderCart();

    showToast(
        "کد تخفیف حذف شد."
    );
}


function calculateCartTotals() {

    const subtotal =
        getCartSubtotal();

    const percent =
        Number(
            currentDiscount?.percent || 0
        );

    const discountAmount =
        Math.floor(
            subtotal *
            percent /
            100
        );

    const finalAmount =
        Math.max(
            0,
            subtotal -
            discountAmount
        );

    return {
        subtotal,
        percent,
        discountAmount,
        finalAmount
    };
}


/* =========================
   RENDER CART
   ========================= */

function renderCart() {

    const container =
        $("cartContainer");

    if (!container) {
        return;
    }

    if (!cart.length) {

        container.innerHTML = `
            <div class="empty-box">
                سبد خرید شما خالی است.
            </div>
        `;

        return;
    }

    const totals =
        calculateCartTotals();

    let html = `
        <div class="cart-items">
    `;

    cart.forEach(item => {

        const price =
            Number(item.price) || 0;

        const quantity =
            Number(item.quantity) || 1;

        const total =
            price * quantity;

        html += `
            <div class="cart-item">

                <div>
                    <h3>
                        ${escapeHTML(
                            item.name
                        )}
                    </h3>

                    <p>
                        قیمت واحد:
                        ${formatPrice(price)}
                        تومان
                    </p>

                    <p>
                        تعداد:
                        ${quantity}
                    </p>

                    <p>
                        مجموع:
                        ${formatPrice(total)}
                        تومان
                    </p>
                </div>

                <div class="cart-controls">

                    <button
                        type="button"
                        onclick="changeCartQuantity(
                            ${JSON.stringify(item.id)},
                            1
                        )">
                        +
                    </button>

                    <button
                        type="button"
                        onclick="changeCartQuantity(
                            ${JSON.stringify(item.id)},
                            -1
                        )">
                        −
                    </button>

                    <button
                        type="button"
                        class="danger-button"
                        onclick="removeFromCart(
                            ${JSON.stringify(item.id)}
                        )">
                        حذف
                    </button>

                </div>

            </div>
        `;
    });

    html += `
        </div>

        <div class="cart-summary">

            <h2>خلاصه سبد خرید</h2>

            <div class="summary-row">
                <span>قیمت اصلی</span>
                <strong>
                    ${formatPrice(
                        totals.subtotal
                    )}
                    تومان
                </strong>
            </div>

            <div class="summary-row">
                <span>درصد تخفیف</span>
                <strong>
                    ${totals.percent}٪
                </strong>
            </div>

            <div class="summary-row">
                <span>مبلغ تخفیف</span>
                <strong>
                    ${formatPrice(
                        totals.discountAmount
                    )}
                    تومان
                </strong>
            </div>

            <div class="summary-row final">
                <span>قیمت بعد تخفیف</span>
                <strong>
                    ${formatPrice(
                        totals.finalAmount
                    )}
                    تومان
                </strong>
            </div>

            <div class="discount-box">

                <input
                    id="cartDiscountCode"
                    type="text"
                    placeholder="کد تخفیف"
                    value="${
                        currentDiscount?.code || ""
                    }"
                >

                <button
                    type="button"
                    onclick="applyDiscountCode()">
                    اعمال کد
                </button>

                ${
                    currentDiscount
                    ? `
                        <button
                            type="button"
                            onclick="removeDiscount()">
                            حذف تخفیف
                        </button>
                    `
                    : ""
                }

            </div>

        </div>
    `;

    container.innerHTML = html;
}


function updateCartCount() {

    const count =
        cart.reduce(
            (sum, item) =>
                sum +
                Number(item.quantity || 1),
            0
        );

    document
        .querySelectorAll(
            "[data-cart-count]"
        )
        .forEach(element => {
            element.textContent =
                count.toLocaleString("fa-IR");
        });
}


/* =========================
   MESSAGES
   ========================= */

let currentChatNumber = "";


function startMessage(number) {

    if (!number) {
        showToast(
            "شماره زردآلو فروشنده موجود نیست."
        );
        return;
    }

    currentChatNumber =
        String(number);

    if ($("messageTargetNumber")) {
        $("messageTargetNumber").value =
            currentChatNumber;
    }

    showPage("messages");
}


async function sendMessage() {

    const input =
        $("messageInput");

    const numberInput =
        $("messageTargetNumber");

    if (!input) {
        return;
    }

    const text =
        input.value.trim();

    const targetNumber =
        numberInput?.value.trim() ||
        currentChatNumber;

    if (!targetNumber) {
        showToast(
            "شماره زردآلو گیرنده را وارد کنید."
        );
        return;
    }

    if (!text) {
        showToast(
            "پیام را وارد کنید."
        );
        return;
    }

    if (!profileIsComplete()) {
        showToast(
            "ابتدا پروفایل خود را کامل کنید."
        );
        return;
    }

    const data = {
        sender_name:
            getProfileName(),

        sender_zardaloo_number:
            getProfileZardalooNumber(),

        receiver_zardaloo_number:
            targetNumber,

        message:
            text
    };

    try {

        await apiRequest(
            MESSAGES_FUNCTION_URL,
            {
                method: "POST",
                body:
                    JSON.stringify(data)
            }
        );

        input.value = "";

        showToast(
            "پیام ارسال شد."
        );

        loadMessages();

    } catch (error) {

        console.error(
            "SEND MESSAGE ERROR:",
            error
        );

        showToast(
            "ارسال پیام انجام نشد: " +
            error.message
        );
    }
}


async function loadMessages() {

    const container =
        $("messagesContainer");

    if (!container) {
        return;
    }

    if (!profileIsComplete()) {
        return;
    }

    try {

        const number =
            encodeURIComponent(
                getProfileZardalooNumber()
            );

        const data =
            await apiRequest(
                MESSAGES_FUNCTION_URL +
                "?zardaloo_number=" +
                number,
                {
                    method: "GET"
                }
            );

        const messages =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(data?.messages)
                        ? data.messages
                        : []
                );

        if (!messages.length) {

            container.innerHTML = `
                <div class="empty-box">
                    هنوز پیامی ندارید.
                </div>
            `;

            return;
        }

        container.innerHTML =
            messages
                .map(message => {

                    return `
                        <div class="message-card">

                            <strong>
                                ${escapeHTML(
                                    message.sender_zardaloo_number ||
                                    message.sender_number ||
                                    "کاربر"
                                )}
                            </strong>

                            <p>
                                ${escapeHTML(
                                    message.message ||
                                    ""
                                )}
                            </p>

                        </div>
                    `;
                })
                .join("");

    } catch (error) {

        console.error(
            "LOAD MESSAGES ERROR:",
            error
        );

        container.innerHTML = `
            <div class="empty-box">
                دریافت پیام‌ها انجام نشد.
            </div>
        `;
    }
}


/* =========================
   REPORT SELLER
   ========================= */

function openReportPage(
    sellerNumber = "",
    sellerName = ""
) {

    if ($("reportSellerNumber")) {
        $("reportSellerNumber").value =
            sellerNumber;
    }

    if ($("reportSellerName")) {
        $("reportSellerName").value =
            sellerName;
    }

    showPage("report");
}


async function submitReport() {

    const sellerNumber =
        $("reportSellerNumber")
            ?.value.trim() || "";

    const sellerName =
        $("reportSellerName")
            ?.value.trim() || "";

    const reason =
        $("reportReason")
            ?.value.trim() || "";

    const description =
        $("reportDescription")
            ?.value.trim() || "";

    if (!sellerNumber) {
        showToast(
            "شماره زردآلو فروشنده را وارد کنید."
        );
        return;
    }

    if (!reason) {
        showToast(
            "دلیل گزارش را انتخاب کنید."
        );
        return;
    }

    if (!profileIsComplete()) {
        showToast(
            "ابتدا پروفایل خود را کامل کنید."
        );
        return;
    }

    const data = {

        reporter_name:
            getProfileName(),

        reporter_phone:
            getProfilePhone(),

        reporter_zardaloo_number:
            getProfileZardalooNumber(),

        seller_name:
            sellerName,

        seller_zardaloo_number:
            sellerNumber,

        reason:
            reason,

        description:
            description
    };

    try {

        await apiRequest(
            REPORT_FUNCTION_URL,
            {
                method: "POST",
                body:
                    JSON.stringify(data)
            }
        );

        showToast(
            "گزارش با موفقیت ارسال شد."
        );

        if ($("reportDescription")) {
            $("reportDescription").value =
                "";
        }

        showPage("home");

    } catch (error) {

        console.error(
            "REPORT ERROR:",
            error
        );

        showToast(
            "ارسال گزارش انجام نشد: " +
            error.message
        );
    }
}


/* =========================
   ADMIN
   ========================= */

function loadAdminSession() {

    adminLoggedIn =
        localStorage.getItem(
            ADMIN_KEY
        ) === "true";
}


function saveAdminSession(value) {

    adminLoggedIn = Boolean(value);

    if (adminLoggedIn) {

        localStorage.setItem(
            ADMIN_KEY,
            "true"
        );

    } else {

        localStorage.removeItem(
            ADMIN_KEY
        );
    }
}


async function adminLogin() {

    const number =
        $("adminNumber")
            ?.value.trim() || "";

    const password =
        $("adminPassword")
            ?.value || "";

    if (
        number !== ADMIN_NUMBER ||
        password !== ADMIN_PASSWORD
    ) {

        showToast(
            "شماره یا رمز مدیریت اشتباه است."
        );

        return;
    }

    saveAdminSession(true);

    showToast(
        "ورود مدیریت موفق بود."
    );

    showPage("admin");

    await loadAdminDashboard();
}


function adminLogout() {

    saveAdminSession(false);

    showToast(
        "از مدیریت خارج شدید."
    );

    showPage("home");
}


async function loadAdminDashboard() {

    if (!adminLoggedIn) {
        return;
    }

    await Promise.allSettled([
        loadAdminProducts(),
        loadAdminReports()
    ]);
}


async function loadAdminProducts() {

    const container =
        $("adminProductsContainer");

    if (!container) {
        return;
    }

    try {

        const data =
            await apiRequest(
                ADMIN_FUNCTION_URL +
                "/products",
                {
                    method: "GET"
                }
            );

        const list =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(data?.products)
                        ? data.products
                        : []
                );

        if (!list.length) {

            container.innerHTML = `
                <div class="empty-box">
                    کالایی وجود ندارد.
                </div>
            `;

            return;
        }

        container.innerHTML =
            list.map(product => {

                const id =
                    getProductId(product);

                return `
                    <div class="admin-item">

                        <div>
                            <strong>
                                ${escapeHTML(
                                    getProductName(product)
                                )}
                            </strong>

                            <p>
                                ${formatPrice(
                                    getProductPrice(product)
                                )}
                                تومان
                            </p>

                            <p>
                                فروشنده:
                                ${escapeHTML(
                                    getSellerName(product)
                                )}
                            </p>
                        </div>

                        <button
                            type="button"
                            class="danger-button"
                            onclick="adminDeleteProduct(
                                ${JSON.stringify(id)}
                            )">
                            حذف
                        </button>

                    </div>
                `;
            }).join("");

    } catch (error) {

        console.error(
            "ADMIN PRODUCTS ERROR:",
            error
        );

        container.innerHTML = `
            <div class="empty-box">
                دریافت کالاهای مدیریت انجام نشد.
            </div>
        `;
    }
}


async function adminDeleteProduct(id) {

    if (!adminLoggedIn) {
        showToast(
            "دسترسی غیرمجاز."
        );
        return;
    }

    if (
        !confirm(
            "این کالا حذف شود؟"
        )
    ) {
        return;
    }

    try {

        await apiRequest(
            ADMIN_FUNCTION_URL +
            "/products?id=" +
            encodeURIComponent(id),
            {
                method: "DELETE"
            }
        );

        showToast(
            "کالا حذف شد."
        );

        await loadAdminProducts();
        await loadProducts();

    } catch (error) {

        console.error(
            "ADMIN DELETE ERROR:",
            error
        );

        showToast(
            "حذف کالا انجام نشد: " +
            error.message
        );
    }
}


/* =========================
   ADMIN REPORTS
   ========================= */

async function loadAdminReports() {

    const container =
        $("adminReportsContainer");

    if (!container) {
        return;
    }

    try {

        const data =
            await apiRequest(
                ADMIN_FUNCTION_URL +
                "/reports",
                {
                    method: "GET"
                }
            );

        const reports =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(data?.reports)
                        ? data.reports
                        : []
                );

        if (!reports.length) {

            container.innerHTML = `
                <div class="empty-box">
                    گزارشی وجود ندارد.
                </div>
            `;

            return;
        }

        container.innerHTML =
            reports.map(report => {

                return `
                    <div class="admin-item">

                        <div>

                            <strong>
                                گزارش فروشنده
                            </strong>

                            <p>
                                فروشنده:
                                ${escapeHTML(
                                    report.seller_name ||
                                    ""
                                )}
                            </p>

                            <p>
                                شماره زردآلو:
                                ${escapeHTML(
                                    report.seller_zardaloo_number ||
                                    ""
                                )}
                            </p>

                            <p>
                                دلیل:
                                ${escapeHTML(
                                    report.reason ||
                                    ""
                                )}
                            </p>

                            <p>
                                ${escapeHTML(
                                    report.description ||
                                    ""
                                )}
                            </p>

                        </div>

                        <button
                            type="button"
                            class="danger-button"
                            onclick="deleteAdminReport(
                                ${JSON.stringify(
                                    report.id
                                )}
                            )">
                            حذف گزارش
                        </button>

                    </div>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "ADMIN REPORT ERROR:",
            error
        );

        container.innerHTML = `
            <div class="empty-box">
                دریافت گزارش‌ها انجام نشد.
            </div>
        `;
    }
}


async function deleteAdminReport(id) {

    if (!adminLoggedIn) {
        showToast(
            "دسترسی غیرمجاز."
        );
        return;
    }

    if (
        !confirm(
            "این گزارش حذف شود؟"
        )
    ) {
        return;
    }

    try {

        await apiRequest(
            ADMIN_FUNCTION_URL +
            "/report?id=" +
            encodeURIComponent(id),
            {
                method: "DELETE"
            }
        );

        showToast(
            "گزارش حذف شد."
        );

        await loadAdminReports();

    } catch (error) {

        console.error(
            "DELETE REPORT ERROR:",
            error
        );

        showToast(
            "حذف گزارش انجام نشد: " +
            error.message
        );
    }
}


/* =========================
   THEME
   ========================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            THEME_KEY
        );

    if (theme === "dark") {
        document.body.classList.add(
            "dark-mode"
        );
    } else {
        document.body.classList.remove(
            "dark-mode"
        );
    }
}


function toggleTheme() {

    const dark =
        document.body.classList.toggle(
            "dark-mode"
        );

    localStorage.setItem(
        THEME_KEY,
        dark ? "dark" : "light"
    );
}


/* =========================
   DATE / TIME
   ========================= */

function updateDateTime() {

    const now =
        new Date();

    const gregorian =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                dateStyle: "full"
            }
        ).format(now);

    const persian =
        new Intl.DateTimeFormat(
            "fa-IR-u-ca-persian",
            {
                dateStyle: "full"
            }
        ).format(now);

    document
        .querySelectorAll(
            "[data-gregorian-date]"
        )
        .forEach(element => {
            element.textContent =
                gregorian;
        });

    document
        .querySelectorAll(
            "[data-persian-date]"
        )
        .forEach(element => {
            element.textContent =
                persian;
        });

    document
        .querySelectorAll(
            "[data-clock]"
        )
        .forEach(element => {

            element.textContent =
                now.toLocaleTimeString(
                    "fa-IR",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    }
                );
        });
}


/* =========================
   FORM EVENTS
   ========================= */

function setupForms() {

    const profileForm =
        $("profileForm");

    if (profileForm) {

        profileForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                saveProfileFromForm();
            }
        );
    }


    const registerForm =
        $("registerProductForm");

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                registerProduct();
            }
        );
    }


    const reportForm =
        $("reportForm");

    if (reportForm) {

        reportForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                submitReport();
            }
        );
    }


    const messageForm =
        $("messageForm");

    if (messageForm) {

        messageForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                sendMessage();
            }
        );
    }


    const adminLoginForm =
        $("adminLoginForm");

    if (adminLoginForm) {

        adminLoginForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                adminLogin();
            }
        );
    }
}


/* =========================
   MARKET FILTER EVENTS
   ========================= */

function setupMarketFilters() {

    [
        "marketSearchName",
        "marketMinPrice",
        "marketMaxPrice",
        "marketSellerName",
        "marketGiftFilter"
    ].forEach(id => {

        const element = $(id);

        if (!element) {
            return;
        }

        element.addEventListener(
            "input",
            applyMarketFilters
        );

        element.addEventListener(
            "change",
            applyMarketFilters
        );
    });
}


/* =========================
   LOGIN BUTTON
   ========================= */

function setupEnterButton() {

    document
        .querySelectorAll(
            "[data-enter-zardaloo]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    enterZardaloo();
                }
            );
        });
}


/* =========================
   GLOBAL WINDOW FUNCTIONS
   ========================= */

window.showPage =
    showPage;

window.enterZardaloo =
    enterZardaloo;

window.selectAvatar =
    selectAvatar;

window.saveProfileFromForm =
    saveProfileFromForm;

window.registerProduct =
    registerProduct;

window.loadProducts =
    loadProducts;

window.openProduct =
    openProduct;

window.addToCart =
    addToCart;

window.removeFromCart =
    removeFromCart;

window.changeCartQuantity =
    changeCartQuantity;

window.applyDiscountCode =
    applyDiscountCode;

window.removeDiscount =
    removeDiscount;

window.startMessage =
    startMessage;

window.sendMessage =
    sendMessage;

window.openReportPage =
    openReportPage;

window.submitReport =
    submitReport;

window.adminLogin =
    adminLogin;

window.adminLogout =
    adminLogout;

window.adminDeleteProduct =
    adminDeleteProduct;

window.deleteAdminReport =
    deleteAdminReport;

window.toggleTheme =
    toggleTheme;

window.deleteMyProduct =
    deleteMyProduct;


/* =========================
   INITIALIZATION
   ========================= */

function initZardaloo() {

    console.log(
        "🍑 Zardaloo Web App started"
    );

    loadProfile();
    loadCart();
    loadDiscount();
    loadAdminSession();
    loadTheme();

    setupNavigation();
    setupForms();
    setupMarketFilters();

    setupAvatarOptions();
    setupAvatarUpload();
    setupGiftField();

    setupEnterButton();

    updateProfileUI();
    updateCartCount();

    updateDateTime();

    setInterval(
        updateDateTime,
        1000
    );

    /*
       اگر پروفایل کامل باشد:
       مستقیماً خانه باز می‌شود.

       اگر کامل نباشد:
       فقط بار اول صفحه پروفایل
       تمام‌صفحه نمایش داده می‌شود.
    */

    if (profileIsComplete()) {

        hideOnboarding();

        showPage("home");

    } else {

        showOnboarding();
    }
}


/* =========================
   START
   ========================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initZardaloo
    );

} else {

    initZardaloo();
}
