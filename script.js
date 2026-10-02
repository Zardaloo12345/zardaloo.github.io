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

const PROFILE_KEY =
    "zardaloo_profile_final_v10";

const CART_KEY =
    "zardaloo_cart_final_v10";

const DISCOUNT_KEY =
    "zardaloo_discount_final_v10";


/* =========================================================
   مدیریت
========================================================= */

const ADMIN_NUMBER = "0994051777";
const ADMIN_PASSWORD = "ERFAN";


/* =========================================================
   متغیرها
========================================================= */

let profile = null;

let products = [];

let cart = [];

let discountPercent = 0;

let profileImageData = "";

let selectedAvatar = "👤";

let productImageData = "";


/* =========================================================
   شروع برنامه
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadLocalData();

    setupFilters();

    if (profile) {

        showApp();

    } else {

        showWelcome();

    }

});


/* =========================================================
   اطلاعات محلی
========================================================= */

function loadLocalData() {

    try {

        profile =
            JSON.parse(
                localStorage.getItem(PROFILE_KEY)
            );

    } catch {

        profile = null;

    }


    try {

        cart =
            JSON.parse(
                localStorage.getItem(CART_KEY)
            ) || [];

    } catch {

        cart = [];

    }


    discountPercent =
        Number(
            localStorage.getItem(DISCOUNT_KEY)
        ) || 0;


    if (profile) {

        profileImageData =
            profile.image || "";

        selectedAvatar =
            profile.avatar || "👤";

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
   صفحه اول
========================================================= */

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

}


function openMarketFromWelcome() {

    if (!profile) {

        openProfileFromWelcome();

        return;

    }


    showApp();

    showPage("market");

}


/* =========================================================
   پروفایل
========================================================= */

function selectProfile(avatar) {

    selectedAvatar = avatar;

    profileImageData = "";

    const preview =
        document.getElementById(
            "profilePreview"
        );

    preview.innerHTML =
        avatar;

}


function loadProfileImage(event) {

    const file =
        event.target.files &&
        event.target.files[0];


    if (!file) return;


    if (!file.type.startsWith("image/")) {

        alert("لطفاً یک عکس انتخاب کنید.");

        return;

    }


    const reader =
        new FileReader();


    reader.onload = function (e) {

        profileImageData =
            e.target.result;

        selectedAvatar = "";


        document
            .getElementById(
                "profilePreview"
            )
            .innerHTML = `
                <img
                    src="${escapeAttribute(profileImageData)}"
                    alt="عکس پروفایل">
            `;

    };


    reader.readAsDataURL(file);

}


function enterZardaloo() {

    const name =
        document
            .getElementById("firstName")
            .value
            .trim();

    const phone =
        document
            .getElementById("firstPhone")
            .value
            .trim();

    const zardaloo =
        document
            .getElementById("firstZardaloo")
            .value
            .trim();


    if (!name || !phone || !zardaloo) {

        alert(
            "لطفاً نام، شماره تماس و شماره زردآلو را وارد کنید."
        );

        return;

    }


    profile = {

        name: name,

        phone: phone,

        zardaloo_number: zardaloo,

        image: profileImageData,

        avatar: selectedAvatar || "👤"

    };


    saveProfile();

    showApp();

}


/* =========================================================
   نمایش برنامه
========================================================= */

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

    loadProducts();

    renderCart();

}


/* =========================================================
   پروفایل در صفحه اصلی
========================================================= */

function updateProfileUI() {

    if (!profile) return;


    document
        .getElementById("homeName")
        .textContent =
        profile.name || "---";


    document
        .getElementById("homePhone")
        .textContent =
        profile.phone || "---";


    document
        .getElementById("homeZardaloo")
        .textContent =
        profile.zardaloo_number || "---";


    setAvatarElement(
        document.getElementById(
            "homeProfileImage"
        )
    );


    setAvatarElement(
        document.getElementById(
            "headerProfileImage"
        )
    );


    const sellerName =
        document.getElementById(
            "sellerName"
        );

    if (sellerName) {

        sellerName.value =
            profile.name || "";

    }


    const sellerPhone =
        document.getElementById(
            "sellerPhone"
        );

    if (sellerPhone) {

        sellerPhone.value =
            profile.phone || "";

    }

}


function setAvatarElement(element) {

    if (!element) return;


    if (profile.image) {

        element.innerHTML = `
            <img
                src="${escapeAttribute(profile.image)}"
                alt="پروفایل">
        `;

    } else {

        element.textContent =
            profile.avatar || "👤";

    }

}


/* =========================================================
   صفحات
========================================================= */

function showPage(pageId) {

    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(function (page) {

        page.classList.remove("active");

    });


    const target =
        document.getElementById(pageId);


    if (!target) {

        console.error(
            "صفحه پیدا نشد:",
            pageId
        );

        return;

    }


    target.classList.add("active");


    if (pageId === "market") {

        renderProducts();

        loadProducts();

    }


    if (pageId === "cart") {

        renderCart();

    }


    if (pageId === "home") {

        updateProfileUI();

    }

}


/* =========================================================
   فیلترها
========================================================= */

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


        if (element) {

            element.addEventListener(
                "input",
                renderProducts
            );

            element.addEventListener(
                "change",
                renderProducts
            );

        }

    });

}


/* =========================================================
   هدر Supabase
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
   تبدیل پاسخ
========================================================= */

async function readResponse(response) {

    const text =
        await response.text();


    let data = null;


    if (text) {

        try {

            data =
                JSON.parse(text);

        } catch {

            data = text;

        }

    }


    if (!response.ok) {

        let message;


        if (typeof data === "string") {

            message = data;

        } else if (data) {

            message =
                data.error ||
                data.message ||
                data.msg ||
                JSON.stringify(data);

        } else {

            message =
                "HTTP " + response.status;

        }


        throw new Error(
            message
        );

    }


    return data;

}


/* =========================================================
   دریافت کالاها
========================================================= */

async function loadProducts() {

    const status =
        document.getElementById(
            "marketStatus"
        );


    try {

        if (status) {

            status.textContent =
                "در حال دریافت کالاها...";

        }


        const response =
            await fetch(
                PRODUCTS_URL,
                {
                    method: "GET",
                    headers:
                        supabaseHeaders()
                }
            );


        const data =
            await readResponse(
                response
            );


        products =
            Array.isArray(data)
                ? data
                : (
                    data.products ||
                    data.data ||
                    []
                );


        renderProducts();


        if (status) {

            status.textContent =
                products.length +
                " کالا در بازار موجود است.";

        }


    } catch (error) {

        console.error(
            "PRODUCTS ERROR:",
            error
        );


        if (status) {

            status.innerHTML =
                `
                <span class="error">
                    دریافت کالاها انجام نشد:
                    ${escapeHtml(error.message)}
                </span>
                `;

        }

    }

}


/* =========================================================
   نمایش کالاها
========================================================= */

function renderProducts() {

    const container =
        document.getElementById(
            "products"
        );


    if (!container) return;


    let list =
        [...products];


    const search =
        (
            document.getElementById(
                "searchName"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const min =
        Number(
            document.getElementById(
                "minPrice"
            )?.value || 0
        );


    const max =
        Number(
            document.getElementById(
                "maxPrice"
            )?.value || 0
        );


    const seller =
        (
            document.getElementById(
                "sellerFilter"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const gift =
        document.getElementById(
            "giftFilter"
        )?.value || "";


    list =
        list.filter(function (product) {

            const name =
                String(
                    product.name || ""
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


            const isGift =
                Boolean(
                    product.is_gift
                );


            if (
                search &&
                !name.includes(search)
            ) {
                return false;
            }


            if (
                min &&
                price < min
            ) {
                return false;
            }


            if (
                max &&
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


    if (!list.length) {

        container.innerHTML =
            `
            <div class="card">
                هنوز کالایی پیدا نشد.
            </div>
            `;

        return;

    }


    container.innerHTML =
        list.map(function (product) {

            const image =
                product.image_url ||
                product.image ||
                "";


            const price =
                Number(
                    product.price || 0
                );


            const seller =
                product.seller_name ||
                product.seller ||
                "نامشخص";


            const sellerNumber =
                product.zardaloo_number ||
                product.seller_number ||
                "";


            const giftText =
                product.is_gift
                    ? `
                        <p class="gift">
                            🎁 هدیه
                        </p>
                      `
                    : "";


            return `
                <article
                    class="product-card"
                >

                    ${
                        image
                        ? `
                            <img
                                class="product-image"
                                src="${escapeAttribute(image)}"
                                alt="${escapeAttribute(product.name || "کالا")}">
                          `
                        : `
                            <div class="no-image">
                                📦
                            </div>
                          `
                    }

                    <h3>
                        ${escapeHtml(
                            product.name ||
                            "کالای بدون نام"
                        )}
                    </h3>

                    <p class="product-price">
                        ${formatPrice(price)}
                        ریال
                    </p>

                    <p>
                        فروشنده:
                        ${escapeHtml(seller)}
                    </p>

                    ${
                        sellerNumber
                        ? `
                            <p>
                                شماره زردآلو:
                                ${escapeHtml(sellerNumber)}
                            </p>
                          `
                        : ""
                    }

                    ${giftText}

                    <button
                        class="yellow-button"
                        onclick="addToCartById('${escapeAttribute(String(product.id || ""))}')"
                    >
                        افزودن به سبد
                    </button>

                    <button
                        class="yellow-button"
                        onclick="openReport('${escapeAttribute(sellerNumber)}')"
                    >
                        گزارش فروشنده
                    </button>

                </article>
            `;

        }).join("");

}


/* =========================================================
   عکس کالا
========================================================= */

function loadProductImage(event) {

    const file =
        event.target.files &&
        event.target.files[0];


    if (!file) return;


    if (!file.type.startsWith("image/")) {

        alert("فایل انتخابی باید عکس باشد.");

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function (e) {

            productImageData =
                e.target.result;


            document
                .getElementById(
                    "productImagePreview"
                )
                .innerHTML = `
                    <img
                        src="${escapeAttribute(productImageData)}"
                        alt="پیش‌نمایش عکس کالا">
                `;

        };


    reader.readAsDataURL(file);

}


/* =========================================================
   ثبت کالا
========================================================= */

function toggleGiftDescription() {

    const checkbox =
        document.getElementById(
            "isGift"
        );


    const box =
        document.getElementById(
            "giftDescriptionBox"
        );


    if (checkbox.checked) {

        box.classList.remove("hidden");

    } else {

        box.classList.add("hidden");

    }

}


async function registerProduct() {

    if (!profile) {

        alert(
            "ابتدا وارد زردآلو شوید."
        );

        return;

    }


    const name =
        document
            .getElementById(
                "productName"
            )
            .value
            .trim();


    const priceText =
        document
            .getElementById(
                "productPrice"
            )
            .value
            .trim();


    const sellerName =
        document
            .getElementById(
                "sellerName"
            )
            .value
            .trim();


    const sellerPhone =
        document
            .getElementById(
                "sellerPhone"
            )
            .value
            .trim();


    const description =
        document
            .getElementById(
                "productDescription"
            )
            .value
            .trim();


    const isGift =
        document
            .getElementById(
                "isGift"
            )
            .checked;


    const giftDescription =
        document
            .getElementById(
                "giftDescription"
            )
            .value
            .trim();


    const status =
        document.getElementById(
            "registerMessage"
        );


    if (!name || !priceText) {

        status.textContent =
            "نام و قیمت کالا را وارد کنید.";

        return;

    }


    if (!/^\d+$/.test(priceText)) {

        status.textContent =
            "قیمت باید فقط عدد باشد.";

        return;

    }


    const payload = {

        name: name,

        price: Number(priceText),

        seller_name:
            sellerName ||
            profile.name,

        seller_phone:
            sellerPhone ||
            profile.phone,

        description:
            description,

        is_gift:
            isGift,

        gift_description:
            giftDescription,

        image_url:
            productImageData,

        zardaloo_number:
            profile.zardaloo_number,

        seller_number:
            profile.zardaloo_number

    };


    status.textContent =
        "در حال ثبت کالا...";


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


        await readResponse(
            response
        );


        status.innerHTML =
            `
            <span class="success">
                کالا با موفقیت ثبت شد.
            </span>
            `;


        document
            .getElementById(
                "productName"
            )
            .value = "";


        document
            .getElementById(
                "productPrice"
            )
            .value = "";


        document
            .getElementById(
                "productDescription"
            )
            .value = "";


        document
            .getElementById(
                "isGift"
            )
            .checked = false;


        document
            .getElementById(
                "giftDescription"
            )
            .value = "";


        document
            .getElementById(
                "productImageInput"
            )
            .value = "";


        document
            .getElementById(
                "productImagePreview"
            )
            .innerHTML = "";


        productImageData = "";


        loadProducts();


    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );


        status.innerHTML =
            `
            <span class="error">
                ثبت کالا انجام نشد:
                ${escapeHtml(error.message)}
            </span>
            `;

    }

}


/* =========================================================
   سبد خرید
========================================================= */

function addToCartById(id) {

    const product =
        products.find(
            function (item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!product) {

        alert("کالا پیدا نشد.");

        return;

    }


    cart.push({

        id:
            product.id,

        name:
            product.name,

        price:
            Number(product.price || 0)

    });


    saveCart();

    renderCart();

    alert(
        "کالا به سبد خرید اضافه شد."
    );

}


function removeCartItem(index) {

    cart.splice(index, 1);

    saveCart();

    renderCart();

}


function applyCartDiscount() {

    const code =
        document
            .getElementById(
                "cartDiscountCode"
            )
            .value
            .trim();


    const message =
        document.getElementById(
            "cartDiscountMessage"
        );


    if (code === "50") {

        discountPercent = 50;

        message.innerHTML =
            `
            <span class="success">
                تخفیف ۵۰٪ اعمال شد.
            </span>
            `;

    } else if (code === "100") {

        discountPercent = 100;

        message.innerHTML =
            `
            <span class="success">
                تخفیف ۱۰۰٪ اعمال شد.
            </span>
            `;

    } else {

        discountPercent = 0;

        message.innerHTML =
            `
            <span class="error">
                کد تخفیف نامعتبر است.
            </span>
            `;

    }


    localStorage.setItem(
        DISCOUNT_KEY,
        String(discountPercent)
    );


    renderCart();

}


function renderCart() {

    const items =
        document.getElementById(
            "cartItems"
        );


    const summary =
        document.getElementById(
            "cartSummary"
        );


    if (!items || !summary) return;


    if (!cart.length) {

        items.innerHTML =
            `
            <div class="card">
                سبد خرید خالی است.
            </div>
            `;

        summary.innerHTML = "";

        return;

    }


    let totalOriginal = 0;


    items.innerHTML =
        cart.map(
            function (item, index) {

                const price =
                    Number(
                        item.price || 0
                    );


                const discounted =
                    Math.round(
                        price *
                        (
                            1 -
                            discountPercent / 100
                        )
                    );


                totalOriginal +=
                    price;


                return `
                    <div class="card cart-item">

                        <h3>
                            ${escapeHtml(
                                item.name
                            )}
                        </h3>

                        <p>
                            قیمت اصلی:
                            ${formatPrice(price)}
                            ریال
                        </p>

                        <p>
                            قیمت با تخفیف:
                            <strong>
                                ${formatPrice(discounted)}
                                ریال
                            </strong>
                        </p>

                        <button
                            class="red-button"
                            onclick="removeCartItem(${index})"
                        >
                            حذف
                        </button>

                    </div>
                `;

            }
        ).join("");


    const discountAmount =
        Math.round(
            totalOriginal *
            discountPercent / 100
        );


    const finalAmount =
        totalOriginal -
        discountAmount;


    summary.innerHTML = `

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

    `;

}


/* =========================================================
   گزارش فروشنده
========================================================= */

function openReport(number) {

    showPage("report");


    const input =
        document.getElementById(
            "reportSellerNumber"
        );


    if (input) {

        input.value =
            number || "";

    }

}


async function submitReport() {

    const status =
        document.getElementById(
            "reportMessage"
        );


    if (!profile) {

        status.innerHTML =
            `
            <span class="error">
                ابتدا وارد زردآلو شوید.
            </span>
            `;

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
            .value;


    const description =
        document
            .getElementById(
                "reportDescription"
            )
            .value
            .trim();


    if (!sellerNumber) {

        status.innerHTML =
            `
            <span class="error">
                شماره زردآلو فروشنده را وارد کنید.
            </span>
            `;

        return;

    }


    const payload = {

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
            await fetch(
                REPORT_URL,
                {
                    method: "POST",
                    mode: "cors",
                    headers:
                        supabaseHeaders(),
                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const data =
            await readResponse(
                response
            );


        console.log(
            "REPORT RESPONSE:",
            data
        );


        status.innerHTML =
            `
            <span class="success">
                گزارش با موفقیت ارسال شد.
            </span>
            `;


        document
            .getElementById(
                "reportDescription"
            )
            .value = "";


    } catch (error) {

        console.error(
            "REPORT ERROR:",
            error
        );


        status.innerHTML =
            `
            <span class="error">
                گزارش ارسال نشد:
                ${escapeHtml(error.message)}
            </span>
            `;

    }

}


/* =========================================================
   پیام‌رسان
========================================================= */

async function sendMessage() {

    const status =
        document.getElementById(
            "messageSendStatus"
        );


    if (!profile) {

        status.innerHTML =
            `
            <span class="error">
                ابتدا وارد زردآلو شوید.
            </span>
            `;

        return;

    }


    const receiver =
        document
            .getElementById(
                "messageReceiver"
            )
            .value
            .trim();


    const message =
        document
            .getElementById(
                "messageText"
            )
            .value
            .trim();


    if (!receiver) {

        status.innerHTML =
            `
            <span class="error">
                شماره زردآلو گیرنده را وارد کنید.
            </span>
            `;

        return;

    }


    if (!message) {

        status.innerHTML =
            `
            <span class="error">
                متن پیام را وارد کنید.
            </span>
            `;

        return;

    }


    const payload = {

        sender_number:
            profile.zardaloo_number,

        receiver_number:
            receiver,

        message:
            message

    };


    status.textContent =
        "در حال ارسال پیام...";


    try {

        const response =
            await fetch(
                MESSAGES_URL,
                {
                    method: "POST",
                    mode: "cors",
                    headers:
                        supabaseHeaders(),
                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const data =
            await readResponse(
                response
            );


        console.log(
            "MESSAGE RESPONSE:",
            data
        );


        status.innerHTML =
            `
            <span class="success">
                پیام با موفقیت ارسال شد.
            </span>
            `;


        document
            .getElementById(
                "messageText"
            )
            .value = "";


        await loadMessages();


    } catch (error) {

        console.error(
            "MESSAGE ERROR:",
            error
        );


        status.innerHTML =
            `
            <span class="error">
                ارسال پیام انجام نشد:
                ${escapeHtml(error.message)}
            </span>
            `;

    }

}


/* =========================================================
   دریافت پیام‌ها
========================================================= */

async function loadMessages() {

    const list =
        document.getElementById(
            "messageList"
        );


    if (!list || !profile) return;


    list.innerHTML =
        "در حال دریافت پیام‌ها...";


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
                    mode: "cors",
                    headers:
                        supabaseHeaders()
                }
            );


        const data =
            await readResponse(
                response
            );


        const messages =
            Array.isArray(data)
                ? data
                : (
                    data.messages ||
                    data.data ||
                    []
                );


        renderMessages(
            messages
        );


    } catch (error) {

        console.error(
            "MESSAGES GET ERROR:",
            error
        );


        list.innerHTML =
            `
            <div class="card">
                <span class="error">
                    دریافت پیام‌ها انجام نشد:
                    ${escapeHtml(error.message)}
                </span>
            </div>
            `;

    }

}


function renderMessages(messages) {

    const list =
        document.getElementById(
            "messageList"
        );


    if (!list) return;


    if (!messages.length) {

        list.innerHTML =
            `
            <div class="card">
                هنوز پیامی وجود ندارد.
            </div>
            `;

        return;

    }


    list.innerHTML =
        messages.map(
            function (message) {

                const mine =
                    String(
                        message.sender_number
                    ) ===
                    String(
                        profile.zardaloo_number
                    );


                return `
                    <div
                        class="message-item ${
                            mine
                            ? "mine"
                            : ""
                        }"
                    >

                        <div>
                            ${escapeHtml(
                                message.message ||
                                ""
                            )}
                        </div>

                        <div class="message-meta">

                            فرستنده:
                            ${escapeHtml(
                                message.sender_number ||
                                ""
                            )}

                            <br>

                            گیرنده:
                            ${escapeHtml(
                                message.receiver_number ||
                                ""
                            )}

                        </div>

                    </div>
                `;

            }
        ).join("");

}


/* =========================================================
   مدیریت
========================================================= */

async function adminLogin() {

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


    const message =
        document.getElementById(
            "adminMessage"
        );


    if (
        number !== ADMIN_NUMBER ||
        password !== ADMIN_PASSWORD
    ) {

        message.innerHTML =
            `
            <span class="error">
                شماره یا رمز اشتباه است.
            </span>
            `;

        return;

    }


    document
        .getElementById(
            "adminPanel"
        )
        .classList.remove("hidden");


    message.innerHTML =
        `
        <span class="success">
            ورود مدیریت موفق بود.
        </span>
        `;


    document
        .getElementById(
            "adminProductCount"
        )
        .textContent =
        products.length;

}


async function loadAdminProducts() {

    const content =
        document.getElementById(
            "adminContent"
        );


    await loadProducts();


    document
        .getElementById(
            "adminProductCount"
        )
        .textContent =
        products.length;


    if (!products.length) {

        content.innerHTML =
            "کالایی وجود ندارد.";

        return;

    }


    content.innerHTML =
        products.map(
            function (product) {

                return `
                    <div class="card">

                        <strong>
                            ${escapeHtml(
                                product.name || ""
                            )}
                        </strong>

                        <br>

                        قیمت:
                        ${formatPrice(
                            product.price || 0
                        )}
                        ریال

                        <br>

                        فروشنده:
                        ${escapeHtml(
                            product.seller_name || ""
                        )}

                    </div>
                `;

            }
        ).join("");

}


async function loadAdminReports() {

    const content =
        document.getElementById(
            "adminContent"
        );


    content.innerHTML =
        "در حال دریافت گزارش‌ها...";


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


        const data =
            await readResponse(
                response
            );


        const reports =
            Array.isArray(data)
                ? data
                : (
                    data.reports ||
                    data.data ||
                    []
                );


        if (!reports.length) {

            content.innerHTML =
                "گزارشی وجود ندارد.";

            return;

        }


        content.innerHTML =
            reports.map(
                function (report) {

                    return `
                        <div class="card">

                            <strong>
                                گزارش فروشنده
                            </strong>

                            <br><br>

                            فروشنده:
                            ${escapeHtml(
                                report.seller_number ||
                                report.seller_zardaloo_number ||
                                ""
                            )}

                            <br>

                            گزارش‌دهنده:
                            ${escapeHtml(
                                report.reporter_number ||
                                report.reporter_zardaloo_number ||
                                ""
                            )}

                            <br>

                            دلیل:
                            ${escapeHtml(
                                report.reason ||
                                ""
                            )}

                            <br>

                            توضیحات:
                            ${escapeHtml(
                                report.description ||
                                ""
                            )}

                        </div>
                    `;

                }
            ).join("");


    } catch (error) {

        content.innerHTML =
            `
            <span class="error">
                دریافت گزارش‌ها انجام نشد:
                ${escapeHtml(error.message)}
            </span>
            `;

    }

}


/* =========================================================
   ابزارها
========================================================= */

function formatPrice(number) {

    return Number(
        number || 0
    ).toLocaleString("fa-IR");

}


function escapeHtml(value) {

    return String(
        value ?? ""
    )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return String(
        value ?? ""
    )
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

}
