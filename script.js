"use strict";


/* =====================================================
   SUPABASE
===================================================== */

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


/* =====================================================
   ADMIN
===================================================== */

const ADMIN_NUMBER = "0994051777";
const ADMIN_PASSWORD = "ERFAN";


/* =====================================================
   LOCAL STORAGE
===================================================== */

const PROFILE_KEY =
    "zardaloo_profile_final_v9";

const CART_KEY =
    "zardaloo_cart_final_v9";

const DISCOUNT_KEY =
    "zardaloo_discount_final_v9";


/* =====================================================
   VARIABLES
===================================================== */

let profile = null;
let cart = [];
let products = [];

let selectedAvatar = "👤";
let profileImageData = "";
let productImageData = "";

let discountPercent = 0;
let currentChatNumber = "";

let adminLoggedIn = false;


/* =====================================================
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadLocalData();
        setupFilters();

        if (profile) {
            showApp();
        } else {
            showWelcome();
        }

        renderCart();
    }
);


/* =====================================================
   LOCAL DATA
===================================================== */

function loadLocalData() {

    try {

        const saved =
            localStorage.getItem(PROFILE_KEY);

        if (saved) {
            profile = JSON.parse(saved);
        }

    } catch (error) {
        console.error(error);
        profile = null;
    }


    try {

        const saved =
            localStorage.getItem(CART_KEY);

        if (saved) {

            cart = JSON.parse(saved);

            if (!Array.isArray(cart)) {
                cart = [];
            }
        }

    } catch (error) {

        console.error(error);
        cart = [];
    }


    try {

        const saved =
            localStorage.getItem(DISCOUNT_KEY);

        if (saved) {
            discountPercent =
                Number(saved) || 0;
        }

    } catch (error) {

        discountPercent = 0;
    }


    updateProfileUI();
}


function saveCart() {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );
}


/* =====================================================
   NAVIGATION
===================================================== */

function showWelcome() {

    document
        .getElementById("welcomeScreen")
        .classList.remove("hidden");

    document
        .getElementById("profileSetup")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.add("hidden");
}


function openProfileFromWelcome() {

    document
        .getElementById("welcomeScreen")
        .classList.add("hidden");

    document
        .getElementById("profileSetup")
        .classList.remove("hidden");

    document
        .getElementById("app")
        .classList.add("hidden");
}


function openMarketFromWelcome() {

    document
        .getElementById("welcomeScreen")
        .classList.add("hidden");

    document
        .getElementById("profileSetup")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");

    showPage("market");
}


function showApp() {

    document
        .getElementById("welcomeScreen")
        .classList.add("hidden");

    document
        .getElementById("profileSetup")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");

    updateProfileUI();

    showPage("home");
}


function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(
            page =>
                page.classList.remove("active")
        );


    const page =
        document.getElementById(pageId);

    if (!page) return;

    page.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (pageId === "market") {
        loadProducts();
    }

    if (pageId === "cart") {
        renderCart();
    }

    if (pageId === "messages") {
        loadMessages();
    }
}


/* =====================================================
   PROFILE
===================================================== */

function selectAvatar(avatar) {

    selectedAvatar = avatar;

    document
        .getElementById("profilePreview")
        .innerHTML = avatar;
}


function previewProfileImage(event) {

    const file =
        event.target.files?.[0];

    if (!file) return;


    const reader =
        new FileReader();


    reader.onload = () => {

        profileImageData =
            reader.result;

        document
            .getElementById("profilePreview")
            .innerHTML =
                `<img src="${profileImageData}"
                      alt="پروفایل">`;
    };


    reader.readAsDataURL(file);
}


function enterZardaloo() {

    const name =
        document
            .getElementById("userName")
            .value
            .trim();

    const phone =
        document
            .getElementById("userPhone")
            .value
            .trim();

    const number =
        document
            .getElementById("userZardalooNumber")
            .value
            .trim();


    if (!name) {
        alert("نام خود را وارد کنید.");
        return;
    }

    if (!phone) {
        alert("شماره تماس خود را وارد کنید.");
        return;
    }

    if (!number) {
        alert("شماره زردآلو خود را وارد کنید.");
        return;
    }


    profile = {
        name: name,
        phone: phone,
        zardaloo_number: number,
        avatar: selectedAvatar,
        image: profileImageData
    };


    localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(profile)
    );


    updateProfileUI();
    showApp();
}


function updateProfileUI() {

    if (!profile) return;


    const name =
        document.getElementById("headerName");

    const avatar =
        document.getElementById("headerAvatar");


    if (name) {
        name.textContent =
            profile.name || "کاربر";
    }


    if (avatar) {

        if (profile.image) {

            avatar.innerHTML =
                `<img
                    src="${profile.image}"
                    style="
                        width:30px;
                        height:30px;
                        border-radius:50%;
                        object-fit:cover;
                    "
                >`;

        } else {

            avatar.textContent =
                profile.avatar || "👤";
        }
    }
}


/* =====================================================
   PRODUCT IMAGE
===================================================== */

function previewProductImage(event) {

    const file =
        event.target.files?.[0];

    if (!file) return;


    const reader =
        new FileReader();


    reader.onload = () => {

        productImageData =
            reader.result;

        document
            .getElementById("productImagePreview")
            .innerHTML =
                `<img
                    src="${productImageData}"
                    alt="تصویر کالا"
                >`;
    };


    reader.readAsDataURL(file);
}


/* =====================================================
   PRODUCTS
===================================================== */

async function loadProducts() {

    const container =
        document.getElementById(
            "productsContainer"
        );

    if (!container) return;


    container.innerHTML =
        `<div class="loading">
            در حال دریافت کالاها...
        </div>`;


    try {

        const response =
            await fetch(
                PRODUCTS_URL,
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


        const text =
            await response.text();


        let result = {};

        try {
            result = text
                ? JSON.parse(text)
                : {};
        } catch {
            result = {
                message: text
            };
        }


        if (!response.ok) {

            throw new Error(
                result.error ||
                result.message ||
                "دریافت کالاها انجام نشد."
            );
        }


        if (Array.isArray(result)) {
            products = result;
        } else if (
            Array.isArray(result.products)
        ) {
            products = result.products;
        } else if (
            Array.isArray(result.data)
        ) {
            products = result.data;
        } else {
            products = [];
        }


        renderProducts();


    } catch (error) {

        console.error(error);

        container.innerHTML =
            `<div class="loading">
                دریافت کالاها انجام نشد.
                <br>
                ${escapeHtml(
                    error.message || ""
                )}
            </div>`;
    }
}


function renderProducts() {

    const container =
        document.getElementById(
            "productsContainer"
        );

    if (!container) return;


    const search =
        (
            document
                .getElementById("marketSearch")
                ?.value || ""
        )
        .trim()
        .toLowerCase();


    const sort =
        document
            .getElementById("marketSort")
            ?.value || "new";


    let list =
        products.filter(
            product => {

                const name =
                    String(
                        product.name ??
                        product.title ??
                        ""
                    )
                    .toLowerCase();

                return name.includes(search);
            }
        );


    list.sort(
        (a, b) => {

            const pa =
                Number(a.price || 0);

            const pb =
                Number(b.price || 0);


            if (sort === "low") {
                return pa - pb;
            }

            if (sort === "high") {
                return pb - pa;
            }


            return (
                new Date(
                    b.created_at || 0
                ) -
                new Date(
                    a.created_at || 0
                )
            );
        }
    );


    if (list.length === 0) {

        container.innerHTML =
            `<div class="loading">
                کالایی پیدا نشد.
            </div>`;

        return;
    }


    container.innerHTML = "";


    list.forEach(product => {

        const name =
            product.name ??
            product.title ??
            "کالا";

        const price =
            Number(product.price || 0);

        const image =
            product.image_url ??
            product.image ??
            "";

        const seller =
            product.zardaloo_number ??
            product.seller_number ??
            "نامشخص";


        const card =
            document.createElement("article");

        card.className =
            "product-card";


        card.innerHTML = `

            <div class="product-photo">

                ${
                    image
                    ?
                    `<img
                        src="${escapeAttribute(image)}"
                        alt="${escapeAttribute(name)}"
                    >`
                    :
                    "📦"
                }

            </div>

            <div class="product-info">

                <h3>
                    ${escapeHtml(name)}
                </h3>

                <div class="product-price">
                    ${formatPrice(price)} ریال
                </div>

                <div class="product-seller">
                    شماره زردآلو فروشنده:
                    ${escapeHtml(seller)}
                </div>

                <div class="product-actions">

                    <button
                        type="button"
                        onclick="addToCart('${escapeAttribute(
                            String(product.id || "")
                        )}')"
                    >
                        افزودن به سبد
                    </button>

                    ${
                        profile &&
                        String(seller) ===
                        String(profile.zardaloo_number)
                        ?
                        `<button
                            type="button"
                            onclick="deleteProduct('${escapeAttribute(
                                String(product.id || "")
                            )}')"
                        >
                            حذف
                        </button>`
                        :
                        ""
                    }

                </div>

            </div>
        `;


        container.appendChild(card);
    });
}


function setupFilters() {

    const search =
        document.getElementById(
            "marketSearch"
        );

    const sort =
        document.getElementById(
            "marketSort"
        );


    if (search) {
        search.addEventListener(
            "input",
            renderProducts
        );
    }

    if (sort) {
        sort.addEventListener(
            "change",
            renderProducts
        );
    }
}


/* =====================================================
   REGISTER PRODUCT
===================================================== */

async function registerProduct() {

    if (!profile) {
        alert("ابتدا وارد حساب شوید.");
        return;
    }


    const name =
        document
            .getElementById("productName")
            .value
            .trim();

    const price =
        Number(
            document
                .getElementById("productPrice")
                .value
        );

    const description =
        document
            .getElementById("productDescription")
            .value
            .trim();

    const status =
        document.getElementById(
            "registerStatus"
        );


    if (!name) {
        status.textContent =
            "نام کالا را وارد کنید.";
        return;
    }

    if (!Number.isFinite(price) || price < 0) {
        status.textContent =
            "قیمت معتبر وارد کنید.";
        return;
    }


    status.textContent =
        "در حال ثبت کالا...";


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

                    body: JSON.stringify({

                        name: name,

                        price: price,

                        description:
                            description,

                        image_url:
                            productImageData,

                        zardaloo_number:
                            profile.zardaloo_number,

                        seller_number:
                            profile.zardaloo_number,

                        seller_name:
                            profile.name
                    })
                }
            );


        const text =
            await response.text();

        let result = {};

        try {
            result = text
                ? JSON.parse(text)
                : {};
        } catch {
            result = { message: text };
        }


        if (!response.ok) {

            throw new Error(
                result.error ||
                result.message ||
                "ثبت کالا انجام نشد."
            );
        }


        status.textContent =
            "کالا با موفقیت ثبت شد. ✅";


        document.getElementById(
            "productName"
        ).value = "";

        document.getElementById(
            "productPrice"
        ).value = "";

        document.getElementById(
            "productDescription"
        ).value = "";


        productImageData = "";


        document.getElementById(
            "productImagePreview"
        ).textContent =
            "تصویر کالا";


        await loadProducts();


    } catch (error) {

        console.error(error);

        status.textContent =
            error.message ||
            "ثبت کالا انجام نشد.";
    }
}


/* =====================================================
   DELETE PRODUCT
===================================================== */

async function deleteProduct(id) {

    if (!id || !profile) return;


    if (!confirm(
        "آیا از حذف این کالا مطمئن هستید؟"
    )) {
        return;
    }


    try {

        const response =
            await fetch(
                PRODUCTS_URL,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY
                    },

                    body: JSON.stringify({

                        id: id,

                        zardaloo_number:
                            profile.zardaloo_number,

                        seller_number:
                            profile.zardaloo_number
                    })
                }
            );


        const text =
            await response.text();

        let result = {};

        try {
            result = text
                ? JSON.parse(text)
                : {};
        } catch {
            result = { message: text };
        }


        if (!response.ok) {

            throw new Error(
                result.error ||
                result.message ||
                "حذف کالا انجام نشد."
            );
        }


        alert("کالا حذف شد. ✅");

        await loadProducts();


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "حذف کالا انجام نشد."
        );
    }
}


/* =====================================================
   CART
===================================================== */

function addToCart(id) {

    const product =
        products.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!product) {
        alert("کالا پیدا نشد.");
        return;
    }


    const existing =
        cart.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (existing) {

        existing.quantity =
            Number(existing.quantity || 1) + 1;

    } else {

        cart.push({

            id: product.id,

            name:
                product.name ??
                product.title ??
                "کالا",

            price:
                Number(product.price || 0),

            quantity: 1
        });
    }


    saveCart();
    renderCart();

    alert(
        "کالا به سبد خرید اضافه شد. 🛒"
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


function clearCart() {

    if (!cart.length) return;


    if (!confirm(
        "سبد خرید خالی شود؟"
    )) {
        return;
    }


    cart = [];

    saveCart();

    renderCart();
}


function renderCart() {

    const container =
        document.getElementById(
            "cartContainer"
        );

    const summary =
        document.getElementById(
            "cartSummary"
        );


    if (!container || !summary) return;


    if (!cart.length) {

        container.innerHTML =
            `<div class="empty-cart">
                سبد خرید شما خالی است.
            </div>`;

        summary.innerHTML = "";

        return;
    }


    let originalTotal = 0;
    let finalTotal = 0;


    container.innerHTML = "";


    cart.forEach(item => {

        const price =
            Number(item.price || 0);

        const quantity =
            Number(item.quantity || 1);


        const original =
            price * quantity;

        const final =
            calculateDiscountedPrice(
                original
            );


        originalTotal += original;
        finalTotal += final;


        const box =
            document.createElement("div");

        box.className =
            "cart-item";


        box.innerHTML = `

            <div>

                <h3>
                    ${escapeHtml(item.name)}
                </h3>

                <div>
                    قیمت:
                    ${formatPrice(price)}
                    ریال
                </div>

                <div>
                    تعداد:
                    ${quantity}
                </div>

                <div class="cart-discounted">
                    قیمت بعد تخفیف:
                    ${formatPrice(
                        final / quantity
                    )}
                    ریال
                </div>

            </div>

            <button
                type="button"
                onclick="removeFromCart('${escapeAttribute(
                    String(item.id)
                )}')"
            >
                حذف
            </button>
        `;


        container.appendChild(box);
    });


    const discountAmount =
        originalTotal - finalTotal;


    summary.innerHTML = `

        <div>
            مجموع قیمت:
            <strong>
                ${formatPrice(originalTotal)}
                ریال
            </strong>
        </div>

        <div>
            مقدار تخفیف:
            <strong>
                ${formatPrice(discountAmount)}
                ریال
            </strong>
        </div>

        <div>
            مبلغ نهایی:
            <strong>
                ${formatPrice(finalTotal)}
                ریال
            </strong>
        </div>

        <div>
            درصد تخفیف:
            <strong>
                ${discountPercent}٪
            </strong>
        </div>
    `;
}


function calculateDiscountedPrice(price) {

    if (discountPercent >= 100) {
        return 0;
    }

    if (discountPercent <= 0) {
        return price;
    }

    return Math.round(
        price *
        (1 - discountPercent / 100)
    );
}


function applyDiscount() {

    const code =
        document
            .getElementById("discountCode")
            .value
            .trim();

    const status =
        document.getElementById(
            "discountStatus"
        );


    if (code === "50") {

        discountPercent = 50;

        localStorage.setItem(
            DISCOUNT_KEY,
            "50"
        );

        status.textContent =
            "کد تخفیف ۵۰٪ اعمال شد. ✅";

        renderCart();

        return;
    }


    if (code === "100") {

        discountPercent = 100;

        localStorage.setItem(
            DISCOUNT_KEY,
            "100"
        );

        status.textContent =
            "کد تخفیف ۱۰۰٪ اعمال شد. ✅";

        renderCart();

        return;
    }


    discountPercent = 0;

    localStorage.removeItem(
        DISCOUNT_KEY
    );

    status.textContent =
        "کد تخفیف معتبر نیست.";
}


/* =====================================================
   MESSENGER
===================================================== */

function startConversation() {

    const number =
        document
            .getElementById(
                "messageReceiver"
            )
            .value
            .trim();


    if (!number) {

        alert(
            "ابتدا شماره زردآلو را وارد کنید."
        );

        return;
    }


    currentChatNumber = number;

    loadMessages();
}


async function sendMessage() {

    if (!profile) {

        alert(
            "ابتدا وارد حساب کاربری شوید."
        );

        return;
    }


    const receiver =
        (
            currentChatNumber ||
            document
                .getElementById(
                    "messageReceiver"
                )
                .value
        )
        .trim();


    const message =
        document
            .getElementById(
                "messageText"
            )
            .value
            .trim();


    if (!receiver) {

        alert(
            "شماره گیرنده را وارد کنید."
        );

        return;
    }


    if (!message) {

        alert(
            "متن پیام را وارد کنید."
        );

        return;
    }


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

                    body: JSON.stringify({

                        sender_number:
                            profile.zardaloo_number,

                        receiver_number:
                            receiver,

                        message:
                            message
                    })
                }
            );


        const text =
            await response.text();

        let result = {};

        try {
            result = text
                ? JSON.parse(text)
                : {};
        } catch {
            result = { message: text };
        }


        if (!response.ok) {

            throw new Error(
                result.error ||
                result.message ||
                "ارسال پیام انجام نشد."
            );
        }


        document
            .getElementById(
                "messageText"
            )
            .value = "";


        await loadMessages();


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "ارسال پیام انجام نشد."
        );
    }
}


async function loadMessages() {

    const box =
        document.getElementById(
            "chatBox"
        );


    if (!box || !profile) return;


    box.innerHTML =
        "<p>در حال دریافت پیام‌ها...</p>";


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

                    headers: {
                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY
                    }
                }
            );


        const text =
            await response.text();

        let result = {};

        try {
            result = text
                ? JSON.parse(text)
                : {};
        } catch {
            result = { message: text };
        }


        if (!response.ok) {

            throw new Error(
                result.error ||
                result.message ||
                "دریافت پیام‌ها انجام نشد."
            );
        }


        const messages =
            Array.isArray(result)
                ? result
                : Array.isArray(result.messages)
                    ? result.messages
                    : Array.isArray(result.data)
                        ? result.data
                        : [];


        if (!messages.length) {

            box.innerHTML =
                "<p>هنوز پیامی وجود ندارد.</p>";

            return;
        }


        box.innerHTML = "";


        messages.forEach(item => {

            const div =
                document.createElement("div");

            div.className =
                "message-item";


            const mine =
                String(
                    item.sender_number
                ) ===
                String(
                    profile.zardaloo_number
                );


            if (mine) {
                div.classList.add(
                    "my-message"
                );
            } else {
                div.classList.add(
                    "other-message"
                );
            }


            div.innerHTML = `

                <strong>
                    ${mine
                        ? "شما"
                        : escapeHtml(
                            item.sender_number || ""
                        )}
                </strong>

                <p>
                    ${escapeHtml(
                        item.message || ""
                    )}
                </p>

                <small>
                    ${
                        item.created_at
                        ?
                        new Date(
                            item.created_at
                        ).toLocaleString("fa-IR")
                        :
                        ""
                    }
                </small>
            `;


            box.appendChild(div);
        });


    } catch (error) {

        console.error(error);

        box.innerHTML =
            `<p>
                دریافت پیام‌ها انجام نشد.
                <br>
                ${escapeHtml(
                    error.message || ""
                )}
            </p>`;
    }
}


/* =====================================================
   گزارش فروشنده - نسخه اصلاح‌شده
===================================================== */

async function submitReport() {

    const status =
        document.getElementById(
            "reportStatus"
        );


    if (!profile) {

        status.textContent =
            "ابتدا وارد حساب کاربری شوید.";

        return;
    }


    const sellerNumber =
        document
            .getElementById(
                "reportSellerNumber"
            )
            .value
            .trim();


    const reason =
        document
            .getElementById(
                "reportReason"
            )
            .value
            .trim();


    const description =
        document
            .getElementById(
                "reportDescription"
            )
            .value
            .trim();


    if (!sellerNumber) {

        status.textContent =
            "شماره زردآلو فروشنده را وارد کنید.";

        return;
    }


    if (!reason) {

        status.textContent =
            "دلیل گزارش را انتخاب کنید.";

        return;
    }


    status.textContent =
        "در حال ارسال گزارش...";


    /*
     * این قسمت مهم است:
     * اطلاعات را با چند نام رایج می‌فرستیم
     * تا Function فعلی راحت‌تر با آن هماهنگ شود.
     */

    const reportData = {

        seller_number:
            sellerNumber,

        seller_zardaloo_number:
            sellerNumber,

        reporter_number:
            profile.zardaloo_number,

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

                    mode: "cors",

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
                            reportData
                        )
                }
            );


        /*
         * قبلاً مستقیماً response.json()
         * انجام می‌شد.
         *
         * اگر Function متن خالی یا متن غیر JSON
         * برگرداند، همان‌جا خطا ایجاد می‌شد.
         *
         * این نسخه اول text می‌گیرد.
         */

        const responseText =
            await response.text();


        let result = {};

        try {

            result =
                responseText
                    ? JSON.parse(
                        responseText
                    )
                    : {};

        } catch {

            result = {
                message:
                    responseText
            };
        }


        console.log(
            "REPORT RESPONSE:",
            response.status,
            result
        );


        if (!response.ok) {

            throw new Error(
                result.error ||
                result.message ||
                result.detail ||
                `خطای سرور: ${response.status}`
            );
        }


        status.textContent =
            "گزارش با موفقیت ارسال شد. ✅";


        document
            .getElementById(
                "reportDescription"
            )
            .value = "";


        document
            .getElementById(
                "reportSellerNumber"
            )
            .value = "";


    } catch (error) {

        console.error(
            "REPORT ERROR:",
            error
        );


        status.innerHTML =
            `ارسال گزارش انجام نشد.<br>
             <small>
             ${escapeHtml(
                 error.message ||
                 "خطای نامشخص"
             )}
             </small>`;
    }
}


/* =====================================================
   ADMIN
===================================================== */

function adminLogin() {

    const number =
        document
            .getElementById(
                "adminNumber"
            )
            .value
            .trim();

    const password =
        document
            .getElementById(
                "adminPassword"
            )
            .value;

    const status =
        document.getElementById(
            "adminStatus"
        );


    if (
        number === ADMIN_NUMBER &&
        password === ADMIN_PASSWORD
    ) {

        adminLoggedIn = true;

        document
            .getElementById(
                "adminPanel"
            )
            .classList.remove(
                "hidden"
            );

        status.textContent =
            "ورود موفق بود. ✅";

    } else {

        status.textContent =
            "شماره یا رمز مدیریت اشتباه است.";
    }
}


async function loadAdminReports() {

    const container =
        document.getElementById(
            "adminReports"
        );


    if (!adminLoggedIn) return;


    container.innerHTML =
        "<p>در حال دریافت گزارش‌ها...</p>";


    try {

        const response =
            await fetch(
                ADMIN_REPORTS_URL,
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


        const text =
            await response.text();

        let result = {};

        try {
            result = text
                ? JSON.parse(text)
                : {};
        } catch {
            result = {
                message: text
            };
        }


        if (!response.ok) {

            throw new Error(
                result.error ||
                result.message ||
                "دریافت گزارش‌ها انجام نشد."
            );
        }


        const reports =
            Array.isArray(result)
                ? result
                : Array.isArray(result.reports)
                    ? result.reports
                    : [];


        if (!reports.length) {

            container.innerHTML =
                "<p>گزارشی وجود ندارد.</p>";

            return;
        }


        container.innerHTML = "";


        reports.forEach(report => {

            const card =
                document.createElement("div");

            card.className =
                "report-card";


            card.innerHTML = `

                <strong>
                    گزارش فروشنده
                </strong>

                <div>
                    فروشنده:
                    ${escapeHtml(
                        report.seller_number ||
                        report.seller_zardaloo_number ||
                        ""
                    )}
                </div>

                <div>
                    گزارش‌دهنده:
                    ${escapeHtml(
                        report.reporter_number ||
                        report.reporter_zardaloo_number ||
                        ""
                    )}
                </div>

                <div>
                    دلیل:
                    ${escapeHtml(
                        report.reason || ""
                    )}
                </div>

                <div>
                    توضیحات:
                    ${escapeHtml(
                        report.description || ""
                    )}
                </div>
            `;


            container.appendChild(card);
        });


    } catch (error) {

        console.error(error);

        container.innerHTML =
            `<p>
                ${escapeHtml(
                    error.message ||
                    "دریافت گزارش‌ها انجام نشد."
                )}
            </p>`;
    }
}


/* =====================================================
   HELPERS
===================================================== */

function formatPrice(value) {

    return Number(
        value || 0
    ).toLocaleString("fa-IR");
}


function escapeHtml(value) {

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
        .replaceAll("'", "\\'")
        .replaceAll('"', "&quot;");
}
