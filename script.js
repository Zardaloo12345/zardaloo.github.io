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

const ADMIN_NUMBER = "0994051777";
const ADMIN_PASSWORD = "ERFAN";

const PROFILE_KEY = "zardaloo_profile_final_v9";
const CART_KEY = "zardaloo_cart_final_v9";
const DISCOUNT_KEY = "zardaloo_discount_final_v9";

let profile = null;
let products = [];
let cart = [];
let selectedAvatar = "👤";
let selectedImage = "";
let discountPercent = 0;

document.addEventListener("DOMContentLoaded", () => {

    loadProfile();
    loadCart();
    loadDiscount();

    document
        .getElementById("searchName")
        ?.addEventListener("input", renderProducts);

    document
        .getElementById("minPrice")
        ?.addEventListener("input", renderProducts);

    document
        .getElementById("maxPrice")
        ?.addEventListener("input", renderProducts);

    document
        .getElementById("sellerFilter")
        ?.addEventListener("input", renderProducts);

    document
        .getElementById("giftFilter")
        ?.addEventListener("change", renderProducts);
});


/* =========================================
   صفحه اول
========================================= */

function openProfileFromWelcome() {

    document
        .getElementById("welcomeScreen")
        .classList.add("hidden");

    document
        .getElementById("profileSetup")
        .classList.remove("hidden");
}


function openMarketFromWelcome() {

    const savedProfile =
        localStorage.getItem(PROFILE_KEY);

    if (!savedProfile) {

        document
            .getElementById("welcomeScreen")
            .classList.add("hidden");

        document
            .getElementById("profileSetup")
            .classList.remove("hidden");

        return;
    }

    try {

        profile = JSON.parse(savedProfile);

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
        showPage("market");
        loadProducts();

    } catch (error) {

        console.error(error);

        openProfileFromWelcome();
    }
}


/* =========================================
   پروفایل
========================================= */

function selectProfile(value) {

    selectedAvatar = value;
    selectedImage = "";

    const preview =
        document.getElementById("profilePreview");

    preview.innerHTML = value;
}


function loadProfileImage(event) {

    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {

        selectedImage =
            String(e.target.result);

        selectedAvatar = "";

        const preview =
            document.getElementById("profilePreview");

        preview.innerHTML = "";

        const img =
            document.createElement("img");

        img.src = selectedImage;

        preview.appendChild(img);
    };

    reader.readAsDataURL(file);
}


function enterZardaloo() {

    const name =
        document.getElementById("firstName")
            .value
            .trim();

    const phone =
        document.getElementById("firstPhone")
            .value
            .trim();

    const zardalooNumber =
        document.getElementById("firstZardaloo")
            .value
            .trim();

    if (!name || !phone || !zardalooNumber) {

        alert(
            "لطفاً نام، شماره تماس و شماره زردآلو را وارد کنید."
        );

        return;
    }

    profile = {
        name: name,
        phone: phone,
        zardaloo_number: zardalooNumber,
        avatar: selectedAvatar,
        image: selectedImage
    };

    localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(profile)
    );

    document
        .getElementById("profileSetup")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");

    updateProfileUI();

    showPage("home");
}


function loadProfile() {

    const saved =
        localStorage.getItem(PROFILE_KEY);

    if (!saved) {
        return;
    }

    try {

        profile = JSON.parse(saved);

        selectedAvatar =
            profile.avatar || "👤";

        selectedImage =
            profile.image || "";

    } catch (error) {

        console.error(
            "PROFILE LOAD ERROR:",
            error
        );

        profile = null;
    }
}


function updateProfileUI() {

    if (!profile) {
        return;
    }

    const homeName =
        document.getElementById("homeName");

    const homePhone =
        document.getElementById("homePhone");

    const homeZardaloo =
        document.getElementById("homeZardaloo");

    if (homeName) {
        homeName.textContent =
            profile.name || "---";
    }

    if (homePhone) {
        homePhone.textContent =
            profile.phone || "---";
    }

    if (homeZardaloo) {
        homeZardaloo.textContent =
            profile.zardaloo_number || "---";
    }

    renderAvatar(
        document.getElementById("headerProfileImage")
    );

    renderAvatar(
        document.getElementById("homeProfileImage")
    );
}


function renderAvatar(element) {

    if (!element || !profile) {
        return;
    }

    element.innerHTML = "";

    if (profile.image) {

        const img =
            document.createElement("img");

        img.src = profile.image;

        element.appendChild(img);

        return;
    }

    element.textContent =
        profile.avatar || "👤";
}


/* =========================================
   صفحات
========================================= */

function showPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    const page =
        document.getElementById(pageName);

    if (page) {
        page.classList.add("active");
    }

    if (pageName === "market") {
        loadProducts();
    }

    if (pageName === "cart") {
        renderCart();
    }
}


/* =========================================
   کالاها
========================================= */

async function loadProducts() {

    const status =
        document.getElementById("marketStatus");

    if (status) {
        status.textContent =
            "در حال دریافت کالاها...";
    }

    try {

        const response =
            await fetch(PRODUCTS_URL, {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY
                }
            });

        const data =
            await response.json();

        if (!response.ok || !data.ok) {

            throw new Error(
                data.error ||
                "دریافت کالاها ناموفق بود."
            );
        }

        products =
            Array.isArray(data.products)
                ? data.products
                : [];

        renderProducts();

        if (status) {
            status.textContent =
                `${products.length} کالا در بازار وجود دارد.`;
        }

    } catch (error) {

        console.error(error);

        if (status) {
            status.textContent =
                "دریافت کالاها انجام نشد.";
        }
    }
}


function renderProducts() {

    const container =
        document.getElementById("products");

    if (!container) {
        return;
    }

    const search =
        document
            .getElementById("searchName")
            ?.value
            .trim()
            .toLowerCase() || "";

    const minPrice =
        Number(
            document
                .getElementById("minPrice")
                ?.value || 0
        );

    const maxValue =
        document
            .getElementById("maxPrice")
            ?.value;

    const maxPrice =
        maxValue
            ? Number(maxValue)
            : Infinity;

    const seller =
        document
            .getElementById("sellerFilter")
            ?.value
            .trim()
            .toLowerCase() || "";

    const giftFilter =
        document
            .getElementById("giftFilter")
            ?.value || "";

    const filtered =
        products.filter(product => {

            const name =
                String(product.name || "")
                    .toLowerCase();

            const sellerName =
                String(
                    product.seller || ""
                ).toLowerCase();

            const price =
                Number(product.price || 0);

            const isGift =
                product.is_gift === true;

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
            `<div class="card">
                کالایی پیدا نشد.
            </div>`;

        return;
    }

    filtered.forEach(product => {

        const card =
            document.createElement("div");

        card.className =
            "product-card";

        const price =
            Number(product.price || 0)
                .toLocaleString("fa-IR");

        const giftText =
            product.is_gift
                ? `<p class="gift">🎁 کالا هدیه است</p>`
                : "";

        const description =
            product.description
                ? `<p>${escapeHtml(product.description)}</p>`
                : "";

        card.innerHTML = `
            <h3>
                ${escapeHtml(product.name || "بدون نام")}
            </h3>

            <p class="product-price">
                ${price} ریال
            </p>

            <p>
                فروشنده:
                ${escapeHtml(product.seller || "---")}
            </p>

            <p>
                شماره زردآلو:
                ${escapeHtml(
                    product.zardaloo_number || "---"
                )}
            </p>

            ${description}

            ${giftText}

            <button
                class="yellow-button"
                onclick="addToCart(${Number(product.id)})"
            >
                افزودن به سبد خرید
            </button>

            <button
                class="yellow-button"
                onclick="deleteProduct(${Number(product.id)})"
            >
                حذف کالا
            </button>
        `;

        container.appendChild(card);
    });
}


async function registerProduct() {

    if (!profile) {

        alert(
            "ابتدا وارد حساب خود شوید."
        );

        return;
    }

    const name =
        document.getElementById("productName")
            .value
            .trim();

    const price =
        document.getElementById("productPrice")
            .value
            .trim();

    const sellerName =
        document.getElementById("sellerName")
            .value
            .trim();

    const sellerPhone =
        document.getElementById("sellerPhone")
            .value
            .trim();

    const description =
        document.getElementById("productDescription")
            .value
            .trim();

    const isGift =
        document.getElementById("isGift")
            .checked;

    const giftDescription =
        document.getElementById("giftDescription")
            .value
            .trim();

    const message =
        document.getElementById("registerMessage");

    if (
        !name ||
        !price ||
        !sellerName ||
        !sellerPhone
    ) {

        message.textContent =
            "اطلاعات کالا را کامل کنید.";

        return;
    }

    message.textContent =
        "در حال ثبت کالا...";

    try {

        const response =
            await fetch(PRODUCTS_URL, {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                    "apikey":
                        SUPABASE_KEY
                },
                body: JSON.stringify({

                    name: name,
                    price: price,
                    seller: sellerName,
                    zardaloo_number:
                        profile.zardaloo_number,
                    phone: sellerPhone,

                    description:
                        description,

                    is_gift:
                        isGift,

                    gift_description:
                        isGift
                            ? giftDescription
                            : ""
                })
            });

        const data =
            await response.json();

        if (!response.ok || !data.ok) {

            throw new Error(
                data.error ||
                "ثبت کالا انجام نشد."
            );
        }

        message.textContent =
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
            .getElementById("isGift")
            .checked = false;

        document
            .getElementById("giftDescription")
            .value = "";

        toggleGiftDescription();

        await loadProducts();

    } catch (error) {

        console.error(error);

        message.textContent =
            error.message ||
            "خطا در ثبت کالا.";
    }
}


function toggleGiftDescription() {

    const checkbox =
        document.getElementById("isGift");

    const box =
        document.getElementById(
            "giftDescriptionBox"
        );

    if (!checkbox || !box) {
        return;
    }

    box.classList.toggle(
        "hidden",
        !checkbox.checked
    );
}


async function deleteProduct(id) {

    if (!profile) {
        return;
    }

    const product =
        products.find(
            p => Number(p.id) === Number(id)
        );

    if (!product) {
        return;
    }

    if (
        String(
            product.zardaloo_number || ""
        ) !==
        String(
            profile.zardaloo_number || ""
        )
    ) {

        alert(
            "فقط صاحب کالا می‌تواند آن را حذف کند."
        );

        return;
    }

    try {

        const response =
            await fetch(
                PRODUCTS_URL +
                "?id=" +
                encodeURIComponent(id),
                {
                    method: "DELETE",
                    headers: {
                        "apikey":
                            SUPABASE_KEY
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.ok) {

            throw new Error(
                data.error ||
                "حذف کالا انجام نشد."
            );
        }

        await loadProducts();

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "حذف کالا انجام نشد."
        );
    }
}


/* =========================================
   سبد خرید
========================================= */

function loadCart() {

    try {

        const saved =
            localStorage.getItem(CART_KEY);

        cart =
            saved
                ? JSON.parse(saved)
                : [];

    } catch (error) {

        cart = [];
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
        products.find(
            p => Number(p.id) === Number(id)
        );

    if (!product) {
        return;
    }

    cart.push(product);

    saveCart();

    alert(
        "کالا به سبد خرید اضافه شد."
    );

    renderCart();
}


function removeFromCart(index) {

    cart.splice(index, 1);

    saveCart();

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

    container.innerHTML = "";

    if (cart.length === 0) {

        container.innerHTML =
            `<div class="card">
                سبد خرید خالی است.
            </div>`;

        summary.innerHTML =
            "مجموع: ۰ ریال";

        return;
    }

    let originalTotal = 0;

    cart.forEach((product, index) => {

        const price =
            Number(product.price || 0);

        originalTotal += price;

        const item =
            document.createElement("div");

        item.className =
            "cart-item";

        item.innerHTML = `
            <strong>
                ${escapeHtml(product.name || "کالا")}
            </strong>

            <br>

            قیمت اصلی:
            ${price.toLocaleString("fa-IR")} ریال

            <br>

            <button
                class="red-button"
                onclick="removeFromCart(${index})"
            >
                حذف
            </button>
        `;

        container.appendChild(item);
    });

    const discountAmount =
        Math.floor(
            originalTotal *
            discountPercent /
            100
        );

    const finalTotal =
        originalTotal -
        discountAmount;

    summary.innerHTML = `
        <strong>مجموع قیمت اصلی:</strong>
        ${originalTotal.toLocaleString("fa-IR")} ریال
        <br>

        <strong>درصد تخفیف:</strong>
        ${discountPercent}٪
        <br>

        <strong>مبلغ تخفیف:</strong>
        ${discountAmount.toLocaleString("fa-IR")} ریال
        <br>

        <strong>قیمت نهایی:</strong>
        ${finalTotal.toLocaleString("fa-IR")} ریال
    `;
}


function loadDiscount() {

    const saved =
        localStorage.getItem(DISCOUNT_KEY);

    discountPercent =
        saved
            ? Number(saved)
            : 0;
}


function applyCartDiscount() {

    const code =
        document
            .getElementById("cartDiscountCode")
            .value
            .trim();

    const message =
        document.getElementById(
            "cartDiscountMessage"
        );

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
            "کد تخفیف نامعتبر است.";

        localStorage.setItem(
            DISCOUNT_KEY,
            "0"
        );

        renderCart();

        return;
    }

    localStorage.setItem(
        DISCOUNT_KEY,
        String(discountPercent)
    );

    message.textContent =
        `تخفیف ${discountPercent}٪ اعمال شد.`;

    renderCart();
}


/* =========================================
   پیام‌رسان
========================================= */

async function sendMessage() {

    if (!profile) {
        return;
    }

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
        document.getElementById(
            "messageSendStatus"
        );

    if (!receiver || !text) {

        status.textContent =
            "شماره گیرنده و پیام را وارد کنید.";

        return;
    }

    status.textContent =
        "در حال ارسال...";

    try {

        const response =
            await fetch(MESSAGES_URL, {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                    "apikey":
                        SUPABASE_KEY
                },
                body: JSON.stringify({

                    sender:
                        profile.zardaloo_number,

                    receiver:
                        receiver,

                    message:
                        text
                })
            });

        const data =
            await response.json();

        if (!response.ok || data.ok === false) {

            throw new Error(
                data.error ||
                "ارسال پیام انجام نشد."
            );
        }

        status.textContent =
            "پیام ارسال شد.";

        document
            .getElementById("messageText")
            .value = "";

    } catch (error) {

        console.error(error);

        status.textContent =
            error.message ||
            "ارسال پیام انجام نشد.";
    }
}


/* =========================================
   گزارش
========================================= */

async function submitReport() {

    if (!profile) {
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
            .getElementById("reportReason")
            .value;

    const description =
        document
            .getElementById(
                "reportDescription"
            )
            .value
            .trim();

    const message =
        document.getElementById(
            "reportMessage"
        );

    if (!sellerNumber) {

        message.textContent =
            "شماره زردآلو فروشنده را وارد کنید.";

        return;
    }

    try {

        const response =
            await fetch(REPORT_URL, {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                    "apikey":
                        SUPABASE_KEY
                },
                body: JSON.stringify({

                    reporter:
                        profile.zardaloo_number,

                    seller:
                        sellerNumber,

                    reason:
                        reason,

                    description:
                        description
                })
            });

        const data =
            await response.json();

        if (!response.ok || data.ok === false) {

            throw new Error(
                data.error ||
                "گزارش ارسال نشد."
            );
        }

        message.textContent =
            "گزارش با موفقیت ارسال شد.";

        document
            .getElementById(
                "reportDescription"
            )
            .value = "";

    } catch (error) {

        console.error(error);

        message.textContent =
            error.message ||
            "ارسال گزارش انجام نشد.";
    }
}


/* =========================================
   مدیریت
========================================= */

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
        document.getElementById(
            "adminMessage"
        );

    if (
        number !== ADMIN_NUMBER ||
        password !== ADMIN_PASSWORD
    ) {

        message.textContent =
            "شماره یا رمز مدیریت اشتباه است.";

        return;
    }

    message.textContent =
        "ورود موفق بود.";

    document
        .getElementById("adminPanel")
        .classList.remove("hidden");

    document
        .getElementById("adminProductCount")
        .textContent =
        products.length;
}


function loadAdminProducts() {

    const content =
        document.getElementById(
            "adminContent"
        );

    content.innerHTML = "";

    products.forEach(product => {

        const div =
            document.createElement("div");

        div.className =
            "card";

        div.innerHTML = `
            <strong>
                ${escapeHtml(product.name || "")}
            </strong>
            <br>
            قیمت:
            ${Number(product.price || 0)
                .toLocaleString("fa-IR")}
            ریال
            <br>
            فروشنده:
            ${escapeHtml(product.seller || "")}
            <br>
            شماره زردآلو:
            ${escapeHtml(
                product.zardaloo_number || ""
            )}
        `;

        content.appendChild(div);
    });
}


async function loadAdminReports() {

    const content =
        document.getElementById(
            "adminContent"
        );

    content.innerHTML =
        "<p>برای نمایش گزارش‌ها باید تابع admin-reports در Supabase فعال باشد.</p>";
}


/* =========================================
   ابزار
========================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
