"use strict";


/* =========================================================
   تنظیمات
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


const PROFILE_KEY =
    "zardaloo_profile_final_v9";

const CART_KEY =
    "zardaloo_cart_final_v9";

const DISCOUNT_KEY =
    "zardaloo_discount_final_v9";


const ADMIN_NUMBER = "0994051777";
const ADMIN_PASSWORD = "ERFAN";


let profile = null;
let products = [];
let cart = [];
let discountPercent = 0;

let currentChatNumber = "";
let productImageData = "";


/* =========================================================
   شروع
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadLocalData();

    if (profile) {
        showApp();
    } else {
        showWelcome();
    }

});


/* =========================================================
   ذخیره / دریافت اطلاعات محلی
========================================================= */

function loadLocalData() {

    try {
        profile =
            JSON.parse(localStorage.getItem(PROFILE_KEY)) || null;
    } catch {
        profile = null;
    }

    try {
        cart =
            JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        cart = [];
    }

    discountPercent =
        Number(localStorage.getItem(DISCOUNT_KEY)) || 0;
}


function saveCart() {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );
}


function saveProfileData() {

    localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(profile)
    );
}


/* =========================================================
   صفحه اول
========================================================= */

function showWelcome() {

    document
        .getElementById("welcomeScreen")
        .classList.add("active");

    document
        .getElementById("profileSetup")
        .classList.remove("active");

    document
        .getElementById("app")
        .classList.add("hidden");
}


function openProfileFromWelcome() {

    document
        .getElementById("welcomeScreen")
        .classList.remove("active");

    document
        .getElementById("profileSetup")
        .classList.add("active");
}


function openMarketFromWelcome() {

    if (!profile) {

        document
            .getElementById("welcomeScreen")
            .classList.remove("active");

        document
            .getElementById("profileSetup")
            .classList.add("active");

        return;
    }

    showApp();

    showPage("marketPage");

}


/* =========================================================
   پروفایل
========================================================= */

function saveProfile() {

    const name =
        document
            .getElementById("profileName")
            .value
            .trim();

    const phone =
        document
            .getElementById("profilePhone")
            .value
            .trim();

    const zardalooNumber =
        document
            .getElementById("profileZardalooNumber")
            .value
            .trim();


    if (!name || !phone || !zardalooNumber) {

        alert("لطفاً همه اطلاعات را وارد کنید.");

        return;
    }


    profile = {
        name: name,
        phone: phone,
        zardaloo_number: zardalooNumber
    };


    saveProfileData();

    showApp();
}


/* =========================================================
   نمایش برنامه
========================================================= */

function showApp() {

    document
        .getElementById("welcomeScreen")
        .classList.remove("active");

    document
        .getElementById("profileSetup")
        .classList.remove("active");

    document
        .getElementById("app")
        .classList.remove("hidden");


    showPage("homePage");

    loadProducts();
    renderCart();
}


/* =========================================================
   منو
========================================================= */

function toggleMenu() {

    document
        .getElementById("mainNav")
        .classList.toggle("open");
}


function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active-page");

        });


    const page =
        document.getElementById(pageId);

    if (page) {
        page.classList.add("active-page");
    }


    document
        .getElementById("mainNav")
        .classList.remove("open");


    if (pageId === "marketPage") {
        loadProducts();
    }

    if (pageId === "cartPage") {
        renderCart();
    }

    if (pageId === "messagesPage") {
        loadMessages();
    }
}


/* =========================================================
   هدرهای Supabase
========================================================= */

function supabaseHeaders() {

    return {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
    };
}


/* =========================================================
   محصولات
========================================================= */

async function loadProducts() {

    const container =
        document.getElementById("productsContainer");

    if (!container) return;


    container.innerHTML =
        `<p class="loading">در حال دریافت کالاها...</p>`;


    try {

        const response =
            await fetch(PRODUCTS_URL, {
                method: "GET",
                headers: supabaseHeaders()
            });


        const text =
            await response.text();


        let data;

        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }


        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : JSON.stringify(data)
            );
        }


        products =
            Array.isArray(data)
                ? data
                : (data.products || data.data || []);


        renderProducts();

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <p class="status">
                دریافت کالاها انجام نشد.<br>
                ${escapeHtml(error.message)}
            </p>
        `;
    }
}


function renderProducts() {

    const container =
        document.getElementById("productsContainer");

    if (!container) return;


    if (!products.length) {

        container.innerHTML =
            `<p class="loading">
                هنوز کالایی ثبت نشده است.
            </p>`;

        return;
    }


    container.innerHTML =
        products.map(product => {

            const image =
                product.image_url ||
                product.image ||
                "";


            const price =
                Number(product.price || 0);


            const name =
                product.name ||
                "کالای بدون نام";


            const seller =
                product.zardaloo_number ||
                product.seller_number ||
                "نامشخص";


            return `
                <article class="product-card">

                    ${
                        image
                        ? `
                            <img
                                class="product-image"
                                src="${escapeAttribute(image)}"
                                alt="${escapeAttribute(name)}">
                          `
                        : `
                            <div class="product-image"></div>
                          `
                    }

                    <div class="product-body">

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

                        <button
                            onclick="addToCart('${escapeAttribute(product.id || "")}')">
                            افزودن به سبد
                        </button>

                        <button
                            onclick="openReportForSeller('${escapeAttribute(seller)}')">
                            گزارش فروشنده
                        </button>

                    </div>

                </article>
            `;

        }).join("");
}


/* =========================================================
   ثبت کالا
========================================================= */

function previewProductImage(event) {

    const file =
        event.target.files &&
        event.target.files[0];


    if (!file) return;


    const reader =
        new FileReader();


    reader.onload = function(e) {

        productImageData =
            e.target.result;


        document
            .getElementById("imagePreview")
            .innerHTML = `
                <img src="${escapeAttribute(productImageData)}"
                     alt="پیش‌نمایش کالا">
            `;
    };


    reader.readAsDataURL(file);
}


async function registerProduct() {

    const name =
        document
            .getElementById("productName")
            .value
            .trim();

    const priceText =
        document
            .getElementById("productPrice")
            .value
            .trim();

    const description =
        document
            .getElementById("productDescription")
            .value
            .trim();

    const status =
        document
            .getElementById("registerStatus");


    if (!profile) {

        status.textContent =
            "ابتدا وارد حساب خود شوید.";

        return;
    }


    if (!name || !priceText) {

        status.textContent =
            "نام و قیمت کالا را وارد کنید.";

        return;
    }


    if (!/^\d+$/.test(priceText)) {

        status.textContent =
            "قیمت فقط باید شامل عدد باشد.";

        return;
    }


    const product = {

        name: name,

        price: Number(priceText),

        description: description,

        image_url: productImageData,

        zardaloo_number:
            profile.zardaloo_number,

        seller_number:
            profile.zardaloo_number,

        seller_name:
            profile.name

    };


    status.textContent =
        "در حال ثبت کالا...";


    try {

        const response =
            await fetch(PRODUCTS_URL, {

                method: "POST",

                headers:
                    supabaseHeaders(),

                body:
                    JSON.stringify(product)

            });


        const text =
            await response.text();


        let data;

        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }


        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : JSON.stringify(data)
            );
        }


        status.textContent =
            "کالا با موفقیت ثبت شد.";


        document
            .getElementById("productName")
            .value = "";

        document
            .getElementById("productPrice")
            .value = "";

        document
            .getElementById("productDescription")
            .value = "";

        document
            .getElementById("productImage")
            .value = "";

        document
            .getElementById("imagePreview")
            .innerHTML = "";

        productImageData = "";


        loadProducts();

    } catch (error) {

        console.error(error);

        status.textContent =
            "ثبت کالا انجام نشد: " +
            error.message;
    }
}


/* =========================================================
   سبد خرید
========================================================= */

function addToCart(productId) {

    const product =
        products.find(
            p => String(p.id) === String(productId)
        );


    if (!product) {

        alert("کالا پیدا نشد.");

        return;
    }


    cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price || 0)
    });


    saveCart();

    renderCart();

    alert("کالا به سبد خرید اضافه شد.");
}


function removeFromCart(index) {

    cart.splice(index, 1);

    saveCart();

    renderCart();
}


function applyDiscount() {

    const input =
        document.getElementById("discountCode");


    if (!input) return;


    const code =
        input.value.trim();


    if (code === "50") {

        discountPercent = 50;

    } else if (code === "100") {

        discountPercent = 100;

    } else {

        discountPercent = 0;

        alert("کد تخفیف نامعتبر است.");

        return;
    }


    localStorage.setItem(
        DISCOUNT_KEY,
        String(discountPercent)
    );


    renderCart();
}


function renderCart() {

    const container =
        document.getElementById("cartContainer");

    if (!container) return;


    if (!cart.length) {

        container.innerHTML =
            `<p class="loading">
                سبد خرید شما خالی است.
            </p>`;

        return;
    }


    let totalOriginal = 0;


    const itemsHtml =
        cart.map((item, index) => {

            const original =
                Number(item.price || 0);

            const discounted =
                Math.round(
                    original *
                    (1 - discountPercent / 100)
                );


            totalOriginal += original;


            return `
                <div class="cart-item">

                    <h3>
                        ${escapeHtml(item.name)}
                    </h3>

                    <p>
                        قیمت اصلی:
                        ${formatPrice(original)}
                        ریال
                    </p>

                    <p>
                        قیمت با تخفیف:
                        ${formatPrice(discounted)}
                        ریال
                    </p>

                    <button
                        onclick="removeFromCart(${index})">
                        حذف از سبد
                    </button>

                </div>
            `;

        }).join("");


    const discountAmount =
        Math.round(
            totalOriginal *
            discountPercent / 100
        );


    const finalAmount =
        totalOriginal -
        discountAmount;


    container.innerHTML = `

        ${itemsHtml}

        <div class="cart-summary">

            <p>
                مجموع قیمت اصلی:
                <strong>
                    ${formatPrice(totalOriginal)}
                    ریال
                </strong>
            </p>

            <p>
                میزان تخفیف:
                <strong>
                    ${formatPrice(discountAmount)}
                    ریال
                </strong>
            </p>

            <p>
                مبلغ نهایی:
                <strong>
                    ${formatPrice(finalAmount)}
                    ریال
                </strong>
            </p>

            <div class="discount-box">

                <input
                    id="discountCode"
                    type="text"
                    placeholder="کد تخفیف: 50 یا 100">

                <button onclick="applyDiscount()">
                    اعمال تخفیف
                </button>

            </div>

        </div>
    `;
}


/* =========================================================
   پیام‌رسان
========================================================= */

function startChat() {

    const number =
        document
            .getElementById("chatNumber")
            .value
            .trim();


    if (!number) {

        alert("شماره زردآلو را وارد کنید.");

        return;
    }


    currentChatNumber = number;


    document
        .getElementById("chatArea")
        .classList.remove("hidden");


    loadMessages();
}


async function loadMessages() {

    if (!profile) return;

    if (!currentChatNumber) return;


    const container =
        document.getElementById("chatMessages");

    if (!container) return;


    try {

        const url =
            MESSAGES_URL +
            "?zardaloo_number=" +
            encodeURIComponent(
                profile.zardaloo_number
            );


        const response =
            await fetch(url, {

                method: "GET",

                headers:
                    supabaseHeaders()

            });


        const text =
            await response.text();


        let data;

        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }


        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : JSON.stringify(data)
            );
        }


        const messages =
            Array.isArray(data)
                ? data
                : (data.messages || data.data || []);


        renderMessages(messages);


    } catch (error) {

        console.error(error);

        const status =
            document.getElementById(
                "messageStatus"
            );

        if (status) {

            status.textContent =
                "دریافت پیام‌ها انجام نشد: " +
                error.message;
        }
    }
}


function renderMessages(messages) {

    const container =
        document.getElementById("chatMessages");


    if (!container) return;


    const filtered =
        messages.filter(message => {

            const sender =
                String(
                    message.sender_number || ""
                );

            const receiver =
                String(
                    message.receiver_number || ""
                );


            const me =
                String(
                    profile.zardaloo_number
                );

            const other =
                String(currentChatNumber);


            return (
                (sender === me &&
                 receiver === other) ||

                (sender === other &&
                 receiver === me)
            );

        });


    if (!filtered.length) {

        container.innerHTML =
            `<p class="loading">
                هنوز پیامی در این مکالمه وجود ندارد.
            </p>`;

        return;
    }


    container.innerHTML =
        filtered.map(message => {

            const mine =
                String(message.sender_number) ===
                String(profile.zardaloo_number);


            return `
                <div class="message ${
                    mine ? "mine" : "other"
                }">

                    ${escapeHtml(
                        message.message || ""
                    )}

                </div>
            `;

        }).join("");


    container.scrollTop =
        container.scrollHeight;
}


async function sendMessage() {

    if (!profile) return;


    const input =
        document.getElementById("chatInput");


    const message =
        input.value.trim();


    if (!currentChatNumber) {

        alert("ابتدا مکالمه جدید ایجاد کنید.");

        return;
    }


    if (!message) return;


    const status =
        document.getElementById(
            "messageStatus"
        );


    try {

        const response =
            await fetch(MESSAGES_URL, {

                method: "POST",

                headers:
                    supabaseHeaders(),

                body:
                    JSON.stringify({

                        sender_number:
                            profile.zardaloo_number,

                        receiver_number:
                            currentChatNumber,

                        message:
                            message

                    })

            });


        const text =
            await response.text();


        let data;

        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }


        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : JSON.stringify(data)
            );
        }


        input.value = "";

        status.textContent =
            "پیام ارسال شد.";


        loadMessages();


    } catch (error) {

        console.error(error);

        status.textContent =
            "ارسال پیام انجام نشد: " +
            error.message;
    }
}


/* =========================================================
   گزارش فروشنده
========================================================= */

function openReportForSeller(number) {

    showPage("reportPage");

    document
        .getElementById("reportSellerNumber")
        .value = number;
}


async function submitReport() {

    if (!profile) {

        alert("ابتدا وارد حساب شوید.");

        return;
    }


    const sellerNumber =
        document
            .getElementById("reportSellerNumber")
            .value
            .trim();


    const reason =
        document
            .getElementById("reportReason")
            .value;


    const description =
        document
            .getElementById("reportDescription")
            .value
            .trim();


    const status =
        document
            .getElementById("reportStatus");


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


    status.textContent =
        "در حال ارسال گزارش...";


    try {

        const response =
            await fetch(REPORT_URL, {

                method: "POST",

                mode: "cors",

                headers: {
                    "Content-Type":
                        "application/json",

                    "apikey":
                        SUPABASE_KEY,

                    "Authorization":
                        "Bearer " + SUPABASE_KEY
                },

                body:
                    JSON.stringify(reportData)

            });


        const text =
            await response.text();


        let data;

        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }


        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : JSON.stringify(data)
            );
        }


        status.textContent =
            "گزارش با موفقیت ارسال شد.";


        document
            .getElementById("reportDescription")
            .value = "";


    } catch (error) {

        console.error(
            "REPORT ERROR:",
            error
        );


        status.textContent =
            "گزارش ارسال نشد: " +
            error.message;
    }
}


/* =========================================================
   مدیریت
========================================================= */

async function adminLogin() {

    const number =
        document
            .getElementById("adminNumber")
            .value
            .trim();


    const password =
        document
            .getElementById("adminPassword")
            .value;


    const status =
        document.getElementById(
            "adminStatus"
        );


    if (
        number !== ADMIN_NUMBER ||
        password !== ADMIN_PASSWORD
    ) {

        status.textContent =
            "شماره یا رمز مدیریت اشتباه است.";

        return;
    }


    status.textContent =
        "ورود موفق بود.";


    document
        .getElementById("adminReports")
        .classList.remove("hidden");


    await loadAdminReports();
}


async function loadAdminReports() {

    const container =
        document.getElementById(
            "adminReports"
        );


    try {

        const response =
            await fetch(
                ADMIN_REPORTS_URL,
                {
                    method: "GET",
                    headers:
                        supabaseHeaders()
                }
            );


        const text =
            await response.text();


        let data;

        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }


        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : JSON.stringify(data)
            );
        }


        const reports =
            Array.isArray(data)
                ? data
                : (data.reports || data.data || []);


        if (!reports.length) {

            container.innerHTML =
                "<p>گزارشی ثبت نشده است.</p>";

            return;
        }


        container.innerHTML =
            reports.map(report => `

                <div class="cart-item">

                    <strong>
                        فروشنده:
                    </strong>

                    ${escapeHtml(
                        report.seller_number || ""
                    )}

                    <br>

                    <strong>
                        گزارش‌دهنده:
                    </strong>

                    ${escapeHtml(
                        report.reporter_number || ""
                    )}

                    <br>

                    <strong>
                        دلیل:
                    </strong>

                    ${escapeHtml(
                        report.reason || ""
                    )}

                    <br>

                    <strong>
                        توضیحات:
                    </strong>

                    ${escapeHtml(
                        report.description || ""
                    )}

                </div>

            `).join("");


    } catch (error) {

        container.innerHTML =
            `
            <p class="status">
                دریافت گزارش‌ها انجام نشد:<br>
                ${escapeHtml(error.message)}
            </p>
            `;
    }
}


/* =========================================================
   ابزارها
========================================================= */

function formatPrice(number) {

    return Number(number || 0)
        .toLocaleString("fa-IR");
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

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}
