"use strict";

/* =========================
   تنظیمات
========================= */

const SUPABASE_URL =
    "https://ovqldknqpaiczrddcrxp.supabase.co";

const PRODUCTS_URL =
    SUPABASE_URL + "/functions/v1/products";

const REPORT_URL =
    SUPABASE_URL + "/functions/v1/report-seller";

const MESSAGES_URL =
    SUPABASE_URL + "/functions/v1/messages";

const SUPABASE_KEY =
    "sb_publishable_VDZ_tgoMgYRI7K419ieDKw_y29xeXA2";

const PROFILE_KEY =
    "zardaloo_profile_final_v9";

const CART_KEY =
    "zardaloo_cart_final_v9";

const DISCOUNT_KEY =
    "zardaloo_discount_final_v9";

const ADMIN_NUMBER =
    "0994051777";

const ADMIN_PASSWORD =
    "ERFAN";


/* =========================
   داده‌های برنامه
========================= */

let products = [];

let cart = [];

let profile = null;

let selectedAvatar = "👤";

let selectedImage = "";

let discountPercent = 0;


/* =========================
   شروع برنامه
========================= */

document.addEventListener("DOMContentLoaded", function () {

    loadLocalData();

    setupFilters();

    if (profile) {
        showApp();
    } else {
        showWelcome();
    }

    renderCart();

});


/* =========================
   اطلاعات محلی
========================= */

function loadLocalData() {

    try {

        const savedProfile =
            localStorage.getItem(PROFILE_KEY);

        if (savedProfile) {
            profile = JSON.parse(savedProfile);
        }

    } catch (error) {

        profile = null;

    }


    try {

        const savedCart =
            localStorage.getItem(CART_KEY);

        if (savedCart) {
            cart = JSON.parse(savedCart);
        }

    } catch (error) {

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

}


/* =========================
   صفحه خوش‌آمدگویی
========================= */

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

    loadProducts();

}


/* =========================
   پروفایل
========================= */

function selectProfile(value) {

    selectedAvatar = value;

    selectedImage = "";

    const preview =
        document.getElementById("profilePreview");

    preview.innerHTML = "";

    preview.textContent = value;

}


function loadProfileImage(event) {

    const file =
        event.target.files &&
        event.target.files[0];

    if (!file) {
        return;
    }

    const reader =
        new FileReader();

    reader.onload = function () {

        selectedImage =
            String(reader.result);

        const preview =
            document.getElementById("profilePreview");

        preview.innerHTML =
            '<img src="' +
            selectedImage +
            '" alt="پروفایل">';

    };

    reader.readAsDataURL(file);

}


function enterZardaloo() {

    const name =
        document.getElementById("firstName").value.trim();

    const phone =
        document.getElementById("firstPhone").value.trim();

    const zardalooNumber =
        document.getElementById("firstZardaloo").value.trim();

    const message =
        document.getElementById("profileMessage");


    if (!name || !phone || !zardalooNumber) {

        message.textContent =
            "لطفاً همه اطلاعات را وارد کنید.";

        message.className =
            "status danger";

        return;

    }


    profile = {

        name: name,

        phone: phone,

        zardaloo_number: zardalooNumber,

        avatar: selectedImage
            ? selectedImage
            : selectedAvatar

    };


    localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(profile)
    );


    showApp();

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


/* =========================
   نمایش پروفایل
========================= */

function updateProfileUI() {

    if (!profile) {
        return;
    }


    document.getElementById("homeName").textContent =
        profile.name || "---";

    document.getElementById("homePhone").textContent =
        profile.phone || "---";

    document.getElementById("homeZardaloo").textContent =
        profile.zardaloo_number || "---";


    setAvatar(
        document.getElementById("headerProfileImage"),
        profile.avatar
    );

    setAvatar(
        document.getElementById("homeProfileImage"),
        profile.avatar
    );

}


function setAvatar(element, value) {

    if (!element) {
        return;
    }

    element.innerHTML = "";

    if (
        typeof value === "string" &&
        value.startsWith("data:image/")
    ) {

        const img =
            document.createElement("img");

        img.src = value;

        img.alt = "پروفایل";

        element.appendChild(img);

    } else {

        element.textContent =
            value || "👤";

    }

}


/* =========================
   صفحات
========================= */

function showPage(pageId) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(function (page) {

        page.classList.remove("active");

    });


    const target =
        document.getElementById(pageId);

    if (!target) {
        return;
    }


    target.classList.add("active");


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


/* =========================
   فیلتر بازار
========================= */

function setupFilters() {

    const ids = [
        "searchName",
        "minPrice",
        "maxPrice",
        "sellerFilter",
        "giftFilter"
    ];

    ids.forEach(function (id) {

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


/* =========================
   دریافت کالاها
========================= */

async function loadProducts() {

    const status =
        document.getElementById("marketStatus");

    if (status) {
        status.textContent =
            "در حال دریافت کالاها...";
        status.className =
            "status";
    }


    try {

        const response =
            await fetch(PRODUCTS_URL, {

                method: "GET",

                headers: {
                    "Authorization":
                        "Bearer " + SUPABASE_KEY,

                    "apikey":
                        SUPABASE_KEY
                }

            });


        if (!response.ok) {
            throw new Error(
                "HTTP " + response.status
            );
        }


        const data =
            await response.json();


        if (Array.isArray(data)) {

            products = data;

        } else if (
            data &&
            Array.isArray(data.products)
        ) {

            products = data.products;

        } else {

            products = [];

        }


        renderProducts();


        if (status) {

            status.textContent =
                products.length +
                " کالا در بازار موجود است.";

            status.className =
                "status success";

        }


    } catch (error) {

        console.error(error);


        if (status) {

            status.textContent =
                "دریافت کالاها از سرور انجام نشد.";

            status.className =
                "status danger";

        }

        renderProducts();

    }

}


/* =========================
   نمایش کالاها
========================= */

function renderProducts() {

    const container =
        document.getElementById("products");

    if (!container) {
        return;
    }


    const search =
        document
            .getElementById("searchName")
            .value
            .trim()
            .toLowerCase();

    const minPrice =
        Number(
            document.getElementById("minPrice").value
        ) || 0;

    const maxInput =
        document.getElementById("maxPrice").value;

    const maxPrice =
        maxInput === ""
            ? Infinity
            : Number(maxInput);


    const seller =
        document
            .getElementById("sellerFilter")
            .value
            .trim()
            .toLowerCase();

    const giftFilter =
        document
            .getElementById("giftFilter")
            .value;


    const filtered =
        products.filter(function (product) {

            const name =
                String(
                    product.name ||
                    product.product_name ||
                    ""
                ).toLowerCase();

            const sellerName =
                String(
                    product.seller_name ||
                    product.seller ||
                    ""
                ).toLowerCase();

            const price =
                Number(
                    product.price ||
                    product.product_price ||
                    0
                );


            const isGift =
                product.is_gift === true ||
                product.isGift === true ||
                product.gift === true;


            if (
                search &&
                !name.includes(search)
            ) {
                return false;
            }


            if (price < minPrice) {
                return false;
            }


            if (price > maxPrice) {
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
                !isGift
            ) {
                return false;
            }


            if (
                giftFilter === "no" &&
                isGift
            ) {
                return false;
            }


            return true;

        });


    container.innerHTML = "";


    if (filtered.length === 0) {

        container.innerHTML =
            '<div class="card">' +
            "کالایی پیدا نشد." +
            "</div>";

        return;

    }


    filtered.forEach(function (product) {

        const card =
            document.createElement("div");

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
            "نامشخص";


        const sellerNumber =
            product.zardaloo_number ||
            product.seller_number ||
            "";


        const description =
            product.description ||
            "";


        const isGift =
            product.is_gift === true ||
            product.isGift === true ||
            product.gift === true;


        card.innerHTML = `

            <h3>${escapeHTML(name)}</h3>

            <div class="product-price">
                ${formatNumber(price)} ریال
            </div>

            <p>
                فروشنده:
                ${escapeHTML(seller)}
            </p>

            ${
                sellerNumber
                ? `<p>شماره زردآلو: ${escapeHTML(String(sellerNumber))}</p>`
                : ""
            }

            ${
                description
                ? `<p>${escapeHTML(description)}</p>`
                : ""
            }

            ${
                isGift
                ? `<p class="gift">🎁 کالا هدیه است</p>`
                : ""
            }

            <button
                class="yellow-button"
                onclick="addToCart('${escapeJS(String(product.id || name))}')">

                افزودن به سبد

            </button>

        `;


        container.appendChild(card);

    });

}


/* =========================
   ثبت کالا
========================= */

async function registerProduct() {

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

    const sellerName =
        document
            .getElementById("sellerName")
            .value
            .trim();

    const sellerPhone =
        document
            .getElementById("sellerPhone")
            .value
            .trim();

    const description =
        document
            .getElementById("productDescription")
            .value
            .trim();

    const isGift =
        document
            .getElementById("isGift")
            .checked;

    const giftDescription =
        document
            .getElementById("giftDescription")
            .value
            .trim();

    const message =
        document
            .getElementById("registerMessage");


    if (!name || !price || price < 0 || !sellerName) {

        message.textContent =
            "نام کالا، قیمت و نام فروشنده را وارد کنید.";

        message.className =
            "status danger";

        return;

    }


    const payload = {

        name: name,

        price: price,

        seller_name: sellerName,

        seller_phone: sellerPhone,

        seller_number:
            profile
                ? profile.zardaloo_number
                : "",

        zardaloo_number:
            profile
                ? profile.zardaloo_number
                : "",

        description: description,

        is_gift: isGift,

        gift_description:
            isGift
                ? giftDescription
                : ""

    };


    message.textContent =
        "در حال ثبت کالا...";

    message.className =
        "status";


    try {

        const response =
            await fetch(PRODUCTS_URL, {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + SUPABASE_KEY,

                    "apikey":
                        SUPABASE_KEY

                },

                body:
                    JSON.stringify(payload)

            });


        if (!response.ok) {
            throw new Error(
                "HTTP " + response.status
            );
        }


        message.textContent =
            "کالا با موفقیت ثبت شد.";

        message.className =
            "status success";


        document
            .getElementById("productName")
            .value = "";

        document
            .getElementById("productPrice")
            .value = "";

        document
            .getElementById("sellerName")
            .value = "";

        document
            .getElementById("sellerPhone")
            .value = "";

        document
            .getElementById("productDescription")
            .value = "";

        document
            .getElementById("isGift")
            .checked = false;

        document
            .getElementById("giftDescription")
            .value = "";

        toggleGiftDescription();

        loadProducts();


    } catch (error) {

        console.error(error);

        message.textContent =
            "ثبت کالا انجام نشد.";

        message.className =
            "status danger";

    }

}


function toggleGiftDescription() {

    const checked =
        document
            .getElementById("isGift")
            .checked;

    document
        .getElementById("giftDescriptionBox")
        .classList.toggle(
            "hidden",
            !checked
        );

}


/* =========================
   سبد خرید
========================= */

function addToCart(productId) {

    const product =
        products.find(function (item) {

            return String(
                item.id ||
                item.name ||
                ""
            ) === String(productId);

        });


    if (!product) {
        return;
    }


    cart.push(product);


    saveCart();

    renderCart();


    alert("کالا به سبد خرید اضافه شد.");

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


function saveCart() {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}


function renderCart() {

    const container =
        document.getElementById("cartItems");

    const summary =
        document.getElementById("cartSummary");


    if (!container || !summary) {
        return;
    }


    container.innerHTML = "";


    let originalTotal = 0;


    cart.forEach(function (product, index) {

        const price =
            Number(
                product.price ||
                product.product_price ||
                0
            );


        originalTotal += price;


        const item =
            document.createElement("div");

        item.className =
            "card cart-item";


        item.innerHTML = `

            <strong>
                ${escapeHTML(
                    product.name ||
                    product.product_name ||
                    "کالا"
                )}
            </strong>

            <p>
                قیمت:
                ${formatNumber(price)}
                ریال
            </p>

            <button
                class="yellow-button"
                onclick="removeFromCart(${index})">

                حذف از سبد

            </button>

        `;


        container.appendChild(item);

    });


    if (cart.length === 0) {

        container.innerHTML =
            '<div class="card">سبد خرید خالی است.</div>';

    }


    const discountAmount =
        Math.round(
            originalTotal *
            discountPercent /
            100
        );


    const finalTotal =
        originalTotal -
        discountAmount;


    summary.innerHTML = `

        <strong>خلاصه سبد خرید</strong>

        <br>

        قیمت اصلی:
        ${formatNumber(originalTotal)}
        ریال

        <br>

        تخفیف:
        ${formatNumber(discountAmount)}
        ریال

        <br>

        <strong>
            قیمت نهایی:
            ${formatNumber(finalTotal)}
            ریال
        </strong>

    `;

}


function applyCartDiscount() {

    const code =
        document
            .getElementById("cartDiscountCode")
            .value
            .trim()
            .toUpperCase();

    const message =
        document
            .getElementById("cartDiscountMessage");


    if (code === "50") {

        discountPercent = 50;

    } else if (code === "100") {

        discountPercent = 100;

    } else if (code === "ZARDALOO10") {

        discountPercent = 10;

    } else if (code === "ZARDALOO20") {

        discountPercent = 20;

    } else {

        discountPercent = 0;

        message.textContent =
            "کد تخفیف معتبر نیست.";

        message.className =
            "status danger";

        renderCart();

        return;

    }


    localStorage.setItem(
        DISCOUNT_KEY,
        String(discountPercent)
    );


    message.textContent =
        "تخفیف " +
        discountPercent +
        "٪ اعمال شد.";

    message.className =
        "status success";


    renderCart();

}


/* =========================
   پیام‌رسان
========================= */

async function sendMessage() {

    const receiver =
        document
            .getElementById("messageReceiver")
            .value
            .trim();

    const text =
        document
            .getElementById("messageText")
            .value
            .trim();

    const status =
        document
            .getElementById("messageSendStatus");


    if (!receiver || !text) {

        status.textContent =
            "شماره گیرنده و پیام را وارد کنید.";

        status.className =
            "status danger";

        return;

    }


    const payload = {

        sender_number:
            profile
                ? profile.zardaloo_number
                : "",

        receiver_number:
            receiver,

        message:
            text

    };


    status.textContent =
        "در حال ارسال...";

    status.className =
        "status";


    try {

        const response =
            await fetch(MESSAGES_URL, {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + SUPABASE_KEY,

                    "apikey":
                        SUPABASE_KEY

                },

                body:
                    JSON.stringify(payload)

            });


        if (!response.ok) {
            throw new Error(
                "HTTP " + response.status
            );
        }


        status.textContent =
            "پیام ارسال شد.";

        status.className =
            "status success";


        document
            .getElementById("messageText")
            .value = "";


        loadMessages();


    } catch (error) {

        console.error(error);

        status.textContent =
            "ارسال پیام انجام نشد.";

        status.className =
            "status danger";

    }

}


async function loadMessages() {

    const container =
        document.getElementById("messageList");

    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (!profile) {
        return;
    }


    try {

        const response =
            await fetch(
                MESSAGES_URL +
                "?zardaloo_number=" +
                encodeURIComponent(
                    profile.zardaloo_number
                ),
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY,

                        "apikey":
                            SUPABASE_KEY

                    }

                }
            );


        if (!response.ok) {
            throw new Error(
                "HTTP " + response.status
            );
        }


        const data =
            await response.json();


        const messages =
            Array.isArray(data)
                ? data
                : data.messages || [];


        if (messages.length === 0) {

            container.innerHTML =
                '<div class="card">پیامی وجود ندارد.</div>';

            return;

        }


        messages.forEach(function (message) {

            const item =
                document.createElement("div");

            item.className =
                "message-item";


            item.innerHTML = `

                <strong>
                    از:
                    ${escapeHTML(
                        String(
                            message.sender_number ||
                            "نامشخص"
                        )
                    )}
                </strong>

                <p>
                    ${escapeHTML(
                        String(
                            message.message ||
                            ""
                        )
                    )}
                </p>

            `;


            container.appendChild(item);

        });


    } catch (error) {

        console.error(error);

        container.innerHTML =
            '<div class="card">پیام‌ها فعلاً قابل دریافت نیستند.</div>';

    }

}


/* =========================
   گزارش فروشنده
========================= */

async function submitReport() {

    const seller =
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

    const message =
        document
            .getElementById("reportMessage");


    if (!seller) {

        message.textContent =
            "شماره زردآلو فروشنده را وارد کنید.";

        message.className =
            "status danger";

        return;

    }


    const payload = {

        reporter_number:
            profile
                ? profile.zardaloo_number
                : "",

        seller_number:
            seller,

        reason:
            reason,

        description:
            description

    };


    message.textContent =
        "در حال ارسال گزارش...";

    message.className =
        "status";


    try {

        const response =
            await fetch(REPORT_URL, {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + SUPABASE_KEY,

                    "apikey":
                        SUPABASE_KEY

                },

                body:
                    JSON.stringify(payload)

            });


        if (!response.ok) {
            throw new Error(
                "HTTP " + response.status
            );
        }


        message.textContent =
            "گزارش با موفقیت ارسال شد.";

        message.className =
            "status success";


        document
            .getElementById("reportSellerNumber")
            .value = "";

        document
            .getElementById("reportDescription")
            .value = "";


    } catch (error) {

        console.error(error);

        message.textContent =
            "ارسال گزارش انجام نشد.";

        message.className =
            "status danger";

    }

}


/* =========================
   مدیریت
========================= */

function adminLogin() {

    const number =
        document
            .getElementById("adminNumber")
            .value
            .trim();

    const password =
        document
            .getElementById("adminPassword")
            .value;

    const message =
        document
            .getElementById("adminMessage");


    if (
        number === ADMIN_NUMBER &&
        password === ADMIN_PASSWORD
    ) {

        document
            .getElementById("adminPanel")
            .classList.remove("hidden");

        message.textContent =
            "ورود مدیریت موفق بود.";

        message.className =
            "status success";

        document
            .getElementById("adminProductCount")
            .textContent =
            products.length;

    } else {

        document
            .getElementById("adminPanel")
            .classList.add("hidden");

        message.textContent =
            "شماره مدیریت یا رمز اشتباه است.";

        message.className =
            "status danger";

    }

}


function loadAdminProducts() {

    const content =
        document.getElementById("adminContent");

    if (!content) {
        return;
    }


    content.innerHTML = "";


    if (products.length === 0) {

        content.innerHTML =
            "<p>کالایی وجود ندارد.</p>";

        return;

    }


    products.forEach(function (product) {

        const item =
            document.createElement("div");

        item.className =
            "card";


        item.innerHTML = `

            <strong>
                ${escapeHTML(
                    product.name ||
                    product.product_name ||
                    "کالا"
                )}
            </strong>

            <br>

            قیمت:
            ${formatNumber(
                Number(
                    product.price ||
                    product.product_price ||
                    0
                )
            )}
            ریال

            <br>

            فروشنده:
            ${escapeHTML(
                product.seller_name ||
                "نامشخص"
            )}

        `;


        content.appendChild(item);

    });

}


function loadAdminReports() {

    const content =
        document.getElementById("adminContent");

    if (!content) {
        return;
    }


    content.innerHTML =
        "<p>برای مشاهده گزارش‌های واقعی، اتصال تابع مدیریت Supabase باید فعال باشد.</p>";

}


/* =========================
   ابزارها
========================= */

function formatNumber(number) {

    return Number(number || 0)
        .toLocaleString("fa-IR");

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeJS(value) {

    return String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'")
        .replaceAll("\n", "\\n")
        .replaceAll("\r", "\\r");

}
