"use strict";


/* =========================================================
   تنظیمات Supabase
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
   Local Storage
========================================================= */

const PROFILE_KEY =
    "zardaloo_profile_final_v10";

const CART_KEY =
    "zardaloo_cart_final_v10";

const DISCOUNT_KEY =
    "zardaloo_discount_final_v10";


/* =========================================================
   مدیریت
========================================================= */

const ADMIN_NUMBER =
    "0994051777";

const ADMIN_PASSWORD =
    "ERFAN";


/* =========================================================
   متغیرهای برنامه
========================================================= */

let profile = null;

let products = [];

let cart = [];

let discountPercent = 0;

let profileImageData = "";

let selectedAvatar = "👤";

let productImageData = "";

let currentChatNumber = "";

let adminLoggedIn = false;


/* =========================================================
   شروع برنامه
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadLocalData();

    setupFilters();

    if (profile) {
        showApp();
    } else {
        showWelcome();
    }

});


/* =========================================================
   Local Data
========================================================= */

function loadLocalData() {

    try {

        const savedProfile =
            localStorage.getItem(PROFILE_KEY);

        if (savedProfile) {
            profile = JSON.parse(savedProfile);
        }

    } catch (error) {

        console.error(
            "خطا در خواندن پروفایل:",
            error
        );

        profile = null;
    }


    try {

        const savedCart =
            localStorage.getItem(CART_KEY);

        if (savedCart) {
            cart = JSON.parse(savedCart);
        }

    } catch (error) {

        console.error(
            "خطا در خواندن سبد:",
            error
        );

        cart = [];
    }


    try {

        const savedDiscount =
            localStorage.getItem(DISCOUNT_KEY);

        if (savedDiscount) {
            discountPercent =
                Number(savedDiscount) || 0;
        }

    } catch (error) {

        discountPercent = 0;
    }


    if (profile) {

        profileImageData =
            profile.image || "";

        selectedAvatar =
            profile.avatar || "👤";
    }

}


/* =========================================================
   ذخیره اطلاعات
========================================================= */

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


function saveDiscount() {

    localStorage.setItem(
        DISCOUNT_KEY,
        String(discountPercent)
    );

}


/* =========================================================
   صفحات اولیه
========================================================= */

function showWelcome() {

    document
        .getElementById("welcome-screen")
        .classList.remove("hidden");

    document
        .getElementById("profile-screen")
        .classList.add("hidden");

    document
        .getElementById("app-screen")
        .classList.add("hidden");

}


function openProfileFromWelcome() {

    document
        .getElementById("welcome-screen")
        .classList.add("hidden");

    document
        .getElementById("profile-screen")
        .classList.remove("hidden");

}


function openMarketFromWelcome() {

    if (!profile) {

        document
            .getElementById("welcome-screen")
            .classList.add("hidden");

        document
            .getElementById("profile-screen")
            .classList.remove("hidden");

        return;
    }

    showApp();

    showPage("market");

}


/* =========================================================
   پروفایل
========================================================= */

function selectAvatar(avatar) {

    selectedAvatar = avatar;

    profileImageData = "";

    const preview =
        document.getElementById(
            "profile-image-preview"
        );

    preview.innerHTML = "";

    preview.textContent = avatar;

}


function handleProfileImage(event) {

    const file =
        event.target.files &&
        event.target.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {

        document.getElementById(
            "profile-error"
        ).textContent =
            "لطفاً یک فایل تصویری انتخاب کن.";

        return;
    }


    const reader =
        new FileReader();


    reader.onload = function () {

        profileImageData =
            reader.result;

        const preview =
            document.getElementById(
                "profile-image-preview"
            );

        preview.innerHTML =
            `<img src="${profileImageData}" alt="تصویر پروفایل">`;

    };


    reader.readAsDataURL(file);

}


function enterZardaloo() {

    const name =
        document
            .getElementById("profile-name")
            .value
            .trim();

    const phone =
        document
            .getElementById("profile-phone")
            .value
            .trim();

    const zardalooNumber =
        document
            .getElementById("profile-zardaloo")
            .value
            .trim();

    const error =
        document.getElementById(
            "profile-error"
        );


    error.textContent = "";


    if (!name) {

        error.textContent =
            "نامت را وارد کن.";

        return;
    }


    if (!phone) {

        error.textContent =
            "شماره تماست را وارد کن.";

        return;
    }


    if (!zardalooNumber) {

        error.textContent =
            "شماره زردآلو را وارد کن.";

        return;
    }


    profile = {

        name: name,

        phone: phone,

        zardaloo_number:
            zardalooNumber,

        avatar:
            selectedAvatar,

        image:
            profileImageData

    };


    saveProfile();

    showApp();

}


/* =========================================================
   نمایش برنامه
========================================================= */

function showApp() {

    document
        .getElementById("welcome-screen")
        .classList.add("hidden");

    document
        .getElementById("profile-screen")
        .classList.add("hidden");

    document
        .getElementById("app-screen")
        .classList.remove("hidden");


    updateProfileUI();

    showPage("home");

    renderCart();

    loadProducts();

}


/* =========================================================
   پروفایل در UI
========================================================= */

function updateProfileUI() {

    if (!profile) {
        return;
    }


    document.getElementById(
        "home-profile-name"
    ).textContent =
        profile.name || "-";


    document.getElementById(
        "home-profile-phone"
    ).textContent =
        profile.phone || "-";


    document.getElementById(
        "home-profile-zardaloo"
    ).textContent =
        profile.zardaloo_number || "-";


    const headerProfile =
        document.getElementById(
            "header-profile"
        );


    if (profile.image) {

        headerProfile.innerHTML =
            `<img src="${profile.image}" alt="پروفایل">`;

    } else {

        headerProfile.textContent =
            profile.avatar || "👤";
    }

}


/* =========================================================
   نمایش صفحات
========================================================= */

function showPage(pageId) {

    const pages =
        document.querySelectorAll(".page");


    pages.forEach(page => {

        page.classList.add("hidden");

    });


    const selected =
        document.getElementById(
            "page-" + pageId
        );


    if (!selected) {
        return;
    }


    selected.classList.remove("hidden");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (pageId === "market") {

        renderProducts();

        loadProducts();

    }


    if (pageId === "cart") {

        renderCart();

    }


    if (pageId === "messages") {

     async function loadMessages() {
    if (!profile || !profile.zardaloo_number || !currentChatNumber) {
        return;
    }

    const chatBox = document.getElementById("chatBox");

    chatBox.innerHTML = `
        <div class="empty-state">
            در حال دریافت پیام‌ها...
        </div>
    `;

    try {
        const url =
            MESSAGES_URL +
            "?user_zardaloo_number=" +
            encodeURIComponent(profile.zardaloo_number) +
            "&other_zardaloo_number=" +
            encodeURIComponent(currentChatNumber);

        const response = await fetch(url, {
            method: "GET",
            headers: supabaseHeaders()
        });

        const data = await readResponse(response);

        let messages = [];

        if (Array.isArray(data)) {
            messages = data;
        } else if (Array.isArray(data.messages)) {
            messages = data.messages;
        } else if (Array.isArray(data.data)) {
            messages = data.data;
        }

        messages.sort((a, b) => {
            return new Date(a.created_at || 0) -
                   new Date(b.created_at || 0);
        });

        if (messages.length === 0) {
            chatBox.innerHTML = `
                <div class="empty-state">
                    هنوز پیامی در این مکالمه وجود ندارد.
                </div>
            `;
            return;
        }

        chatBox.innerHTML = messages.map(message => {

            const sender =
                String(
                    message.sender_zardaloo_number ||
                    message.sender_number ||
                    ""
                );

            const text =
                message.message ||
                message.text ||
                "";

            const mine =
                sender === String(profile.zardaloo_number);

            return `
                <div class="message-row ${mine ? "mine" : "theirs"}">
                    <div class="message-bubble">
                        ${escapeHtml(text)}
                    </div>
                </div>
            `;
        }).join("");

        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        console.error("خطا در دریافت پیام‌ها:", error);

        chatBox.innerHTML = `
            <div class="empty-state">
                دریافت پیام‌ها ناموفق بود.
                <br>
                ${escapeHtml(error.message)}
            </div>
        `;
    }
}

/* =========================================================
   Supabase Headers
========================================================= */

function supabaseHeaders() {

    return {

        "Content-Type":
            "application/json",

        "apikey":
            SUPABASE_KEY,

        "Authorization":
            "Bearer " + SUPABASE_KEY

    };

}


/* =========================================================
   Response Reader
========================================================= */

async function readResponse(response) {

    const text =
        await response.text();


    let data = null;


    try {

        data =
            text
                ? JSON.parse(text)
                : null;

    } catch {

        data = text;

    }


    if (!response.ok) {

        let message =
            "خطا در ارتباط با سرور";


        if (
            data &&
            typeof data === "object"
        ) {

            message =
                data.error ||
                data.message ||
                data.msg ||
                message;

        } else if (typeof data === "string" && data) {

            message = data;
        }


        throw new Error(message);
    }


    return data;

}


/* =========================================================
   دریافت محصولات
========================================================= */

async function loadProducts() {

    const status =
        document.getElementById(
            "market-status"
        );


    if (status) {

        status.textContent =
            "در حال دریافت کالاها...";

    }


    try {

        const response =
            await fetch(
                PRODUCTS_URL,
                {
                    method: "GET",
                    headers: supabaseHeaders()
                }
            );


        const data =
            await readResponse(response);


        if (Array.isArray(data)) {

            products = data;

        } else if (
            data &&
            Array.isArray(data.products)
        ) {

            products =
                data.products;

        } else if (
            data &&
            Array.isArray(data.data)
        ) {

            products =
                data.data;

        } else {

            products = [];

        }


        renderProducts();


        if (status) {

            status.textContent =
                products.length +
                " کالا در بازار پیدا شد.";

        }

    } catch (error) {

        console.error(error);


        if (status) {

            status.textContent =
                "دریافت کالاها انجام نشد: " +
                error.message;

        }


        renderProducts();

    }

}


/* =========================================================
   فیلترهای بازار
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

        const element =
            document.getElementById(id);

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
   Render Products
========================================================= */

function renderProducts() {

    const container =
        document.getElementById(
            "products-grid"
        );


    if (!container) {
        return;
    }


    const name =
        (
            document.getElementById(
                "filter-name"
            )?.value || ""
        )
            .trim()
            .toLowerCase();


    const minPrice =
        Number(
            document.getElementById(
                "filter-min-price"
            )?.value || 0
        );


    const maxPrice =
        Number(
            document.getElementById(
                "filter-max-price"
            )?.value || 0
        );


    const seller =
        (
            document.getElementById(
                "filter-seller"
            )?.value || ""
        )
            .trim()
            .toLowerCase();


    const gift =
        document.getElementById(
            "filter-gift"
        )?.value || "";


    const filtered =
        products.filter(product => {

            const productName =
                String(
                    product.name ||
                    product.title ||
                    ""
                )
                    .toLowerCase();


            const sellerName =
                String(
                    product.seller_name ||
                    product.seller ||
                    ""
                )
                    .toLowerCase();


            const price =
                Number(
                    product.price || 0
                );


            const hasGift =
                Boolean(
                    product.gift ||
                    product.has_gift
                );


            if (
                name &&
                !productName.includes(name)
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
                seller &&
                !sellerName.includes(seller)
            ) {
                return false;
            }


            if (
                gift === "yes" &&
                !hasGift
            ) {
                return false;
            }


            if (
                gift === "no" &&
                hasGift
            ) {
                return false;
            }


            return true;

        });


    if (!filtered.length) {

        container.innerHTML = `
            <div class="empty-state">
                <strong>کالایی پیدا نشد</strong>
                <span>
                    هنوز کالایی با این مشخصات پیدا نشده است.
                </span>
            </div>
        `;

        return;
    }


    container.innerHTML =
        filtered
            .map(product => {

                return productCard(
                    product
                );

            })
            .join("");

}


/* =========================================================
   Product Card
========================================================= */

function productCard(product) {

    const id =
        product.id ||
        product._id ||
        "";


    const name =
        product.name ||
        product.title ||
        "کالای بدون نام";


    const price =
        Number(
            product.price || 0
        );


    const seller =
        product.seller_name ||
        product.seller ||
        "فروشنده";


    const sellerNumber =
        product.zardaloo_number ||
        product.seller_zardaloo_number ||
        product.seller_number ||
        "-";


    const phone =
        product.seller_phone ||
        product.phone ||
        product.seller_number ||
        "-";


    const description =
        product.description ||
        "";


    const gift =
        Boolean(
            product.gift ||
            product.has_gift
        );


    const giftDescription =
        product.gift_description ||
        "";


    const image =
        product.image_url ||
        product.image ||
        "";


    const safeId =
        escapeAttribute(
            String(id)
        );


    const imageHTML =
        image
            ? `
                <img
                    src="${escapeAttribute(image)}"
                    alt="${escapeAttribute(name)}"
                    onerror="this.parentElement.innerHTML='<div class=\\'product-placeholder\\'>📦</div>';">
              `
            : `
                <div class="product-placeholder">
                    📦
                </div>
              `;


    const giftHTML =
        gift
            ? `
                <span class="gift-label">
                    🎁 هدیه
                    ${escapeHtml(giftDescription)}
                </span>
              `
            : "";


    return `
        <article class="product-card">

            <div class="product-image">
                ${imageHTML}
            </div>

            <div class="product-info">

                <h3>
                    ${escapeHtml(name)}
                </h3>

                <div class="product-price">
                    ${formatPrice(price)}
                    ریال
                </div>

                <div class="product-meta">

                    <div>
                        فروشنده:
                        ${escapeHtml(seller)}
                    </div>

                    <div>
                        شماره زردآلو:
                        ${escapeHtml(sellerNumber)}
                    </div>

                    <div>
                        تلفن:
                        ${escapeHtml(phone)}
                    </div>

                    ${
                        description
                            ? `
                                <div>
                                    ${escapeHtml(description)}
                                </div>
                              `
                            : ""
                    }

                    ${giftHTML}

                </div>

                <div class="product-actions">

                    <button
                        type="button"
                        class="add-cart-button"
                        onclick="addToCartById('${safeId}')">
                        🛒 افزودن به سبد
                    </button>

                    <button
                        type="button"
                        class="report-button"
                        onclick="reportProductSeller('${escapeAttribute(String(sellerNumber))}')">
                        ⚠️ گزارش
                    </button>

                </div>

            </div>

        </article>
    `;

}


/* =========================================================
   افزودن به سبد
========================================================= */

function addToCartById(id) {

    const product =
        products.find(
            item =>
                String(
                    item.id ||
                    item._id ||
                    ""
                ) === String(id)
        );


    if (!product) {

        alert(
            "این کالا پیدا نشد."
        );

        return;
    }


    const productId =
        String(
            product.id ||
            product._id ||
            (
                Date.now() +
                "_" +
                Math.random()
            )
        );


    const exists =
        cart.some(
            item =>
                String(item.id) ===
                productId
        );


    if (exists) {

        alert(
            "این کالا قبلاً در سبد خرید است."
        );

        return;
    }


    cart.push({

        id: productId,

        name:
            product.name ||
            product.title ||
            "کالا",

        price:
            Number(product.price || 0),

        image:
            product.image_url ||
            product.image ||
            "",

        seller:
            product.seller_name ||
            product.seller ||
            "",

        seller_zardaloo_number:
            product.zardaloo_number ||
            product.seller_zardaloo_number ||
            product.seller_number ||
            ""

    });


    saveCart();

    renderCart();


    alert(
        "کالا به سبد خرید اضافه شد."
    );

}


/* =========================================================
   سبد خرید
========================================================= */

function renderCart() {

    const container =
        document.getElementById(
            "cart-items"
        );

    const summary =
        document.getElementById(
            "cart-summary"
        );


    if (!container || !summary) {
        return;
    }


    if (!cart.length) {

        container.innerHTML = `
            <div class="empty-state">
                <strong>سبد خرید خالی است</strong>
                <span>
                    از بازار یک کالا به سبد خرید اضافه کن.
                </span>
            </div>
        `;


        summary.innerHTML = "";

        return;
    }


    let originalTotal = 0;


    container.innerHTML =
        cart
            .map((item, index) => {

                const price =
                    Number(
                        item.price || 0
                    );


                originalTotal += price;


                const discountedPrice =
                    calculateDiscountedPrice(
                        price
                    );


                return `
                    <div class="cart-item">

                        <div class="cart-item-info">

                            <h3>
                                ${escapeHtml(
                                    item.name ||
                                    "کالا"
                                )}
                            </h3>

                            <p>
                                قیمت اصلی:
                                <strong>
                                    ${formatPrice(price)}
                                    ریال
                                </strong>
                            </p>

                            <p>
                                قیمت با تخفیف:
                                <strong>
                                    ${formatPrice(
                                        discountedPrice
                                    )}
                                    ریال
                                </strong>
                            </p>

                            <p>
                                فروشنده:
                                ${escapeHtml(
                                    item.seller ||
                                    "-"
                                )}
                            </p>

                        </div>

                        <button
                            type="button"
                            class="cart-remove"
                            onclick="removeFromCart(${index})">
                            حذف
                        </button>

                    </div>
                `;

            })
            .join("");


    const discountAmount =
        originalTotal -
        calculateDiscountedTotal(
            originalTotal
        );


    const finalTotal =
        calculateDiscountedTotal(
            originalTotal
        );


    summary.innerHTML = `

        <div class="summary-row">

            <span>
                مجموع قیمت اصلی
            </span>

            <strong>
                ${formatPrice(originalTotal)}
                ریال
            </strong>

        </div>


        <div class="summary-row">

            <span>
                درصد تخفیف
            </span>

            <strong>
                ${discountPercent}٪
            </strong>

        </div>


        <div class="summary-row">

            <span>
                مقدار تخفیف
            </span>

            <strong class="discount-value">
                ${formatPrice(discountAmount)}
                ریال
            </strong>

        </div>


        <div class="summary-row">

            <span>
                بعد تخفیف
            </span>

            <strong class="summary-final">
                ${formatPrice(finalTotal)}
                ریال
            </strong>

        </div>
    `;

}


/* =========================================================
   حذف از سبد
========================================================= */

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


/* =========================================================
   تخفیف
========================================================= */

function applyDiscount() {

    const input =
        document.getElementById(
            "discount-code"
        );


    const status =
        document.getElementById(
            "discount-status"
        );


    const code =
        input.value.trim();


    if (code === "50") {

        discountPercent = 50;

        saveDiscount();

        status.textContent =
            "کد تخفیف ۵۰٪ با موفقیت اعمال شد.";

        status.style.color =
            "var(--green)";


        renderCart();

        return;
    }


    if (code === "100") {

        discountPercent = 100;

        saveDiscount();

        status.textContent =
            "کد تخفیف ۱۰۰٪ با موفقیت اعمال شد.";

        status.style.color =
            "var(--green)";


        renderCart();

        return;
    }


    discountPercent = 0;

    saveDiscount();

    status.textContent =
        "کد تخفیف نامعتبر است.";

    status.style.color =
        "var(--red)";


    renderCart();

}


function calculateDiscountedPrice(price) {

    const numericPrice =
        Number(price) || 0;


    const discount =
        Math.min(
            Math.max(
                Number(discountPercent) || 0,
                0
            ),
            100
        );


    return Math.round(
        numericPrice *
        (1 - discount / 100)
    );

}


function calculateDiscountedTotal(total) {

    return calculateDiscountedPrice(
        total
    );

}


/* =========================================================
   ثبت کالا
========================================================= */

function handleProductImage(event) {

    const file =
        event.target.files &&
        event.target.files[0];


    if (!file) {
        return;
    }


    if (!file.type.startsWith("image/")) {

        document.getElementById(
            "register-status"
        ).textContent =
            "فقط فایل تصویری انتخاب کن.";

        return;
    }


    const reader =
        new FileReader();


    reader.onload = function () {

        productImageData =
            reader.result;


        const preview =
            document.getElementById(
                "product-image-preview"
            );


        preview.innerHTML =
            `<img src="${productImageData}" alt="تصویر کالا">`;

    };


    reader.readAsDataURL(file);

}


async function registerProduct() {

    const status =
        document.getElementById(
            "register-status"
        );


    const name =
        document
            .getElementById("product-name")
            .value
            .trim();


    const price =
        Number(
            document
                .getElementById("product-price")
                .value
        );


    const seller =
        document
            .getElementById("product-seller")
            .value
            .trim();


    const sellerPhone =
        document
            .getElementById("product-seller-phone")
            .value
            .trim();


    const sellerZardaloo =
        document
            .getElementById("product-seller-zardaloo")
            .value
            .trim();


    const description =
        document
            .getElementById("product-description")
            .value
            .trim();


    const gift =
        document.getElementById(
            "product-gift"
        ).checked;


    const giftDescription =
        document
            .getElementById(
                "product-gift-description"
            )
            .value
            .trim();


    status.textContent = "";


    if (!name) {

        status.textContent =
            "نام کالا را وارد کن.";

        status.style.color =
            "var(--red)";

        return;
    }


    if (
        !Number.isFinite(price) ||
        price <= 0
    ) {

        status.textContent =
            "قیمت معتبر وارد کن.";

        status.style.color =
            "var(--red)";

        return;
    }


    if (!seller) {

        status.textContent =
            "نام فروشنده را وارد کن.";

        status.style.color =
            "var(--red)";

        return;
    }


    if (!sellerZardaloo) {

        status.textContent =
            "شماره زردآلو فروشنده را وارد کن.";

        status.style.color =
            "var(--red)";

        return;
    }


    if (!profile) {

        status.textContent =
            "ابتدا وارد حساب خودت شو.";

        status.style.color =
            "var(--red)";

        return;
    }


    status.textContent =
        "در حال ثبت کالا...";

    status.style.color =
        "var(--gray)";


    const payload = {

        name: name,

        price: price,

        seller_name: seller,

        seller_phone: sellerPhone,

        seller_number: sellerPhone,

        zardaloo_number:
            sellerZardaloo,

        seller_zardaloo_number:
            sellerZardaloo,

        description:
            description,

        gift:
            gift,

        has_gift:
            gift,

        gift_description:
            giftDescription,

        image_url:
            productImageData,

        reporter_number:
            profile.phone,

        owner_zardaloo_number:
            profile.zardaloo_number

    };


    try {

        const response =
            await fetch(
                PRODUCTS_URL,
                {
                    method: "POST",

                    headers:
                        supabaseHeaders(),

                    body:
                        JSON.stringify(payload)
                }
            );


        await readResponse(response);


        status.textContent =
            "کالا با موفقیت ثبت شد.";

        status.style.color =
            "var(--green)";


        clearProductForm();

        await loadProducts();


    } catch (error) {

        console.error(error);


        status.textContent =
            "ثبت کالا انجام نشد: " +
            error.message;

        status.style.color =
            "var(--red)";

    }

}


/* =========================================================
   پاک کردن فرم کالا
========================================================= */

function clearProductForm() {

    const ids = [

        "product-name",
        "product-price",
        "product-seller",
        "product-seller-phone",
        "product-seller-zardaloo",
        "product-description",
        "product-gift-description"

    ];


    ids.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = "";
        }

    });


    const gift =
        document.getElementById(
            "product-gift"
        );

    if (gift) {
        gift.checked = false;
    }


    productImageData = "";


    const preview =
        document.getElementById(
            "product-image-preview"
        );


    if (preview) {

        preview.innerHTML =
            "تصویر کالا";

    }


    const input =
        document.getElementById(
            "product-image-input"
        );


    if (input) {
        input.value = "";
    }

}


/* =========================================================
   گزارش از داخل بازار
========================================================= */

function reportProductSeller(
    sellerZardaloo
) {

    showPage("report");


    const input =
        document.getElementById(
            "report-seller-zardaloo"
        );


    if (input) {

        input.value =
            sellerZardaloo || "";

    }

}


/* =========================================================
   ارسال گزارش
========================================================= */

async function submitReport() {

    const status =
        document.getElementById(
            "report-status"
        );


    if (!profile) {

        status.textContent =
            "ابتدا وارد حساب خودت شو.";

        status.style.color =
            "var(--red)";

        return;
    }


    const sellerZardaloo =
        document
            .getElementById(
                "report-seller-zardaloo"
            )
            .value
            .trim();


    const reason =
        document
            .getElementById(
                "report-reason"
            )
            .value;


    const description =
        document
            .getElementById(
                "report-description"
            )
            .value
            .trim();


    if (!sellerZardaloo) {

        status.textContent =
            "شماره زردآلو فروشنده را وارد کن.";

        status.style.color =
            "var(--red)";

        return;
    }


    if (!description) {

        status.textContent =
            "توضیحات گزارش را وارد کن.";

        status.style.color =
            "var(--red)";

        return;
    }


    status.textContent =
        "در حال ارسال گزارش...";

    status.style.color =
        "var(--gray)";


    const payload = {

        seller_number:
            sellerZardaloo,

        seller_zardaloo_number:
            sellerZardaloo,

        reporter_number:
            profile.phone,

        reporter_zardaloo_number:
            profile.zardaloo_number,

        reason:
            reason,

        description:
            description

    };


    try {

        const response =
            await fetch(
                REPORT_URL,
                {
                    method: "POST",

                    headers:
                        supabaseHeaders(),

                    body:
                        JSON.stringify(payload)
                }
            );


        await readResponse(response);


        status.textContent =
            "گزارش با موفقیت ارسال شد.";

        status.style.color =
            "var(--green)";


        document.getElementById(
            "report-description"
        ).value = "";


    } catch (error) {

        console.error(error);


        status.textContent =
            "ارسال گزارش انجام نشد: " +
            error.message;

        status.style.color =
            "var(--red)";

    }

}


/* =========================================================
   پیام‌رسان
========================================================= */

function startConversation() {

    const input =
        document.getElementById(
            "message-receiver"
        );


    const number =
        input.value.trim();


    const status =
        document.getElementById(
            "message-status"
        );


    if (!number) {

        status.textContent =
            "شماره زردآلو را وارد کن.";

        status.style.color =
            "var(--red)";

        return;
    }


    if (
        profile &&
        number ===
        profile.zardaloo_number
    ) {

        status.textContent =
            "نمی‌توانی با خودت مکالمه ایجاد کنی.";

        status.style.color =
            "var(--red)";

        return;
    }


    currentChatNumber =
        number;


    document
        .getElementById(
            "chat-area"
        )
        .classList.remove("hidden");


    document.getElementById(
        "chat-title"
    ).textContent =
        "مکالمه با شماره زردآلو: " +
        number;


    status.textContent = "";

    loadMessages();

}


/* =========================================================
   دریافت پیام‌ها
========================================================= */

async function loadMessages() {

    const chatBox =
        document.getElementById(
            "chat-box"
        );


    if (!chatBox || !profile) {
        return;
    }


    if (!currentChatNumber) {

        chatBox.innerHTML = `
            <div class="empty-state">
                ابتدا شماره زردآلو را وارد کن.
            </div>
        `;

        return;
    }


    try {

        const url =
            MESSAGES_URL +
            "?zardaloo_number=" +
            encodeURIComponent(
                profile.zardaloo_number
            );


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    headers: supabaseHeaders()
                }
            );


        const data =
            await readResponse(response);


        let messages = [];


        if (Array.isArray(data)) {

            messages = data;

        } else if (
            data &&
            Array.isArray(data.messages)
        ) {

            messages =
                data.messages;

        } else if (
            data &&
            Array.isArray(data.data)
        ) {

            messages =
                data.data;

        }


        const conversation =
            messages.filter(message => {

                const sender =
                    String(
                        message.sender_number ||
                        message.sender_zardaloo_number ||
                        ""
                    );


                const receiver =
                    String(
                        message.receiver_number ||
                        message.receiver_zardaloo_number ||
                        ""
                    );


                return (

                    (
                        sender ===
                        String(
                            profile.zardaloo_number
                        ) &&
                        receiver ===
                        String(
                            currentChatNumber
                        )
                    )

                    ||

                    (
                        sender ===
                        String(
                            currentChatNumber
                        ) &&
                        receiver ===
                        String(
                            profile.zardaloo_number
                        )
                    )

                );

            });


        if (!conversation.length) {

            chatBox.innerHTML = `
                <div class="empty-state">
                    هنوز پیامی در این مکالمه وجود ندارد.
                </div>
            `;

            return;
        }


        chatBox.innerHTML =
            conversation
                .map(message => {

                    const sender =
                        String(
                            message.sender_number ||
                            message.sender_zardaloo_number ||
                            ""
                        );


                    const mine =
                        sender ===
                        String(
                            profile.zardaloo_number
                        );


                    return `
                        <div class="chat-message ${
                            mine
                                ? "mine"
                                : "theirs"
                        }">

                            ${escapeHtml(
                                message.message ||
                                message.text ||
                                ""
                            )}

                        </div>
                    `;

                })
                .join("");


        chatBox.scrollTop =
            chatBox.scrollHeight;


    } catch (error) {

        console.error(error);


        chatBox.innerHTML = `
            <div class="empty-state">
                دریافت پیام‌ها انجام نشد.
                <br>
                ${escapeHtml(error.message)}
            </div>
        `;

    }

}


/* =========================================================
   ارسال پیام
========================================================= */

async function sendMessage() {

    const input =
        document.getElementById(
            "chat-input"
        );


    const status =
        document.getElementById(
            "message-status"
        );


    const message =
        input.value.trim();


    if (!profile) {

        status.textContent =
            "ابتدا وارد حساب خودت شو.";

        status.style.color =
            "var(--red)";

        return;
    }


    if (!currentChatNumber) {

        status.textContent =
            "ابتدا یک مکالمه جدید ایجاد کن.";

        status.style.color =
            "var(--red)";

        return;
    }


    if (!message) {

        status.textContent =
            "پیام خالی است.";

        status.style.color =
            "var(--red)";

        return;
    }


    status.textContent =
        "در حال ارسال...";

    status.style.color =
        "var(--gray)";


    const payload = {

        sender_number:
            profile.zardaloo_number,

        receiver_number:
            currentChatNumber,

        sender_zardaloo_number:
            profile.zardaloo_number,

        receiver_zardaloo_number:
            currentChatNumber,

        message:
            message

    };


    try {

        const response =
            await fetch(
                MESSAGES_URL,
                {
                    method: "POST",

                    headers:
                        supabaseHeaders(),

                    body:
                        JSON.stringify(payload)
                }
            );


        await readResponse(response);


        input.value = "";

        status.textContent =
            "پیام ارسال شد.";

        status.style.color =
            "var(--green)";


        await loadMessages();


    } catch (error) {

        console.error(error);


        status.textContent =
            "ارسال پیام انجام نشد: " +
            error.message;

        status.style.color =
            "var(--red)";

    }

}


/* =========================================================
   مدیریت
========================================================= */

async function adminLogin() {

    const number =
        document
            .getElementById(
                "admin-number"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "admin-password"
            )
            .value;


    const status =
        document.getElementById(
            "admin-status"
        );


    if (
        number !== ADMIN_NUMBER ||
        password !== ADMIN_PASSWORD
    ) {

        status.textContent =
            "شماره یا رمز مدیریت اشتباه است.";

        status.style.color =
            "var(--red)";

        return;
    }


    adminLoggedIn = true;


    status.textContent =
        "ورود به مدیریت موفق بود.";

    status.style.color =
        "var(--green)";


    document
        .getElementById(
            "admin-panel"
        )
        .classList.remove("hidden");


    await loadAdminData();

}


/* =========================================================
   داده‌های مدیریت
========================================================= */

async function loadAdminData() {

    if (!adminLoggedIn) {
        return;
    }


    const productCount =
        document.getElementById(
            "admin-product-count"
        );


    const reportCount =
        document.getElementById(
            "admin-report-count"
        );


    const productsContainer =
        document.getElementById(
            "admin-products"
        );


    const reportsContainer =
        document.getElementById(
            "admin-reports"
        );


    productsContainer.innerHTML =
        "<p>در حال دریافت...</p>";


    reportsContainer.innerHTML =
        "<p>در حال دریافت...</p>";


    try {

        await loadProducts();


        productCount.textContent =
            products.length;


        if (!products.length) {

            productsContainer.innerHTML =
                `
                    <div class="empty-state">
                        محصولی ثبت نشده است.
                    </div>
                `;

        } else {

            productsContainer.innerHTML =
                products
                    .map(product => {

                        return `
                            <div class="admin-item">

                                <strong>
                                    ${escapeHtml(
                                        product.name ||
                                        product.title ||
                                        "کالا"
                                    )}
                                </strong>

                                قیمت:
                                ${formatPrice(
                                    Number(
                                        product.price ||
                                        0
                                    )
                                )}
                                ریال

                                <br>

                                فروشنده:
                                ${escapeHtml(
                                    product.seller_name ||
                                    product.seller ||
                                    "-"
                                )}

                            </div>
                        `;

                    })
                    .join("");

        }


    } catch (error) {

        productsContainer.innerHTML =
            `
                <div class="admin-item">
                    ${escapeHtml(
                        error.message
                    )}
                </div>
            `;

    }


    try {

        const response =
            await fetch(
                ADMIN_REPORTS_URL,
                {
                    method: "GET",
                    headers: supabaseHeaders()
                }
            );


        const data =
            await readResponse(response);


        let reports = [];


        if (Array.isArray(data)) {

            reports = data;

        } else if (
            data &&
            Array.isArray(data.reports)
        ) {

            reports =
                data.reports;

        } else if (
            data &&
            Array.isArray(data.data)
        ) {

            reports =
                data.data;

        }


        reportCount.textContent =
            reports.length;


        if (!reports.length) {

            reportsContainer.innerHTML =
                `
                    <div class="empty-state">
                        گزارشی ثبت نشده است.
                    </div>
                `;

        } else {

            reportsContainer.innerHTML =
                reports
                    .map(report => {

                        return `
                            <div class="admin-item">

                                <strong>
                                    گزارش
                                </strong>

                                فروشنده:
                                ${escapeHtml(
                                    report.seller_zardaloo_number ||
                                    report.seller_number ||
                                    "-"
                                )}

                                <br>

                                دلیل:
                                ${escapeHtml(
                                    report.reason ||
                                    "-"
                                )}

                                <br>

                                توضیحات:
                                ${escapeHtml(
                                    report.description ||
                                    "-"
                                )}

                            </div>
                        `;

                    })
                    .join("");

        }


    } catch (error) {

        reportsContainer.innerHTML =
            `
                <div class="admin-item">
                    دریافت گزارش‌ها انجام نشد:
                    ${escapeHtml(
                        error.message
                    )}
                </div>
            `;

    }

}


/* =========================================================
   Helpers
========================================================= */

function formatPrice(value) {

    const number =
        Number(value) || 0;


    return new Intl.NumberFormat(
        "fa-IR"
    ).format(number);

}


function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHtml(value);

}





