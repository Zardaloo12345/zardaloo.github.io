"use strict";

/* =========================================================
   تنظیمات
   ========================================================= */

const SUPABASE_URL =
    "https://YOUR_PROJECT.supabase.co";

const SUPABASE_KEY =
    "YOUR_SUPABASE_ANON_KEY";

const PRODUCTS_URL =
    `${SUPABASE_URL}/rest/v1/products`;

const REPORTS_URL =
    `${SUPABASE_URL}/rest/v1/reports`;

const MESSAGES_URL =
    `${SUPABASE_URL}/rest/v1/messages`;

const PROFILE_KEY =
    "zardaloo_profile";

const CART_KEY =
    "zardaloo_cart";

const OLD_PROFILE_KEYS = [
    "profile",
    "zardalooProfile",
    "userProfile"
];


/* =========================================================
   متغیرهای اصلی
   ========================================================= */

let profile = null;
let products = [];
let cart = [];
let productImageData = "";
let profileImageData = "";
let selectedAvatar = "";
let currentChatNumber = "";
let discountValue = 0;


/* =========================================================
   شروع برنامه
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSavedProfile();
        loadSavedCart();
        setupFilters();
        setupEnterKey();

    }
);


/* =========================================================
   پروفایل
   ========================================================= */

function loadSavedProfile() {

    try {

        const saved =
            localStorage.getItem(
                PROFILE_KEY
            );

        if (saved) {

            profile =
                JSON.parse(saved);

            if (profile) {
                showApp();
                updateProfileUI();
                return;
            }

        }

    } catch (error) {

        console.error(
            "خطا در خواندن پروفایل:",
            error
        );

    }

    showWelcome();
}


function saveProfile() {

    try {

        localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify(profile)
        );

    } catch (error) {

        console.error(
            "خطا در ذخیره پروفایل:",
            error
        );

    }
}


function openProfileFromWelcome() {

    const welcome =
        document.getElementById(
            "welcome-screen"
        );

    const profileScreen =
        document.getElementById(
            "profile-screen"
        );

    const app =
        document.getElementById(
            "app-screen"
        );

    welcome?.classList.add(
        "hidden"
    );

    app?.classList.add(
        "hidden"
    );

    profileScreen?.classList.remove(
        "hidden"
    );

}


function openMarketFromWelcome() {

    if (profile) {

        showApp();
        showPage("market");
        loadProducts();

        return;
    }

    openProfileFromWelcome();

}


function enterZardaloo() {

    const name =
        document.getElementById(
            "profile-name"
        )?.value.trim() || "";

    const phone =
        document.getElementById(
            "profile-phone"
        )?.value.trim() || "";

    const zardalooNumber =
        document.getElementById(
            "profile-zardaloo"
        )?.value.trim() || "";

    const error =
        document.getElementById(
            "profile-error"
        );


    if (!name) {

        setStatus(
            error,
            "نام و نام خانوادگی را وارد کن."
        );

        return;
    }


    if (!phone) {

        setStatus(
            error,
            "شماره تماس را وارد کن."
        );

        return;
    }


    if (!zardalooNumber) {

        setStatus(
            error,
            "شماره زردآلو را وارد کن."
        );

        return;
    }


    profile = {

        name,
        phone,

        zardaloo_number:
            zardalooNumber,

        image:
            profileImageData || "",

        avatar:
            selectedAvatar || "👤"

    };


    saveProfile();

    setStatus(
        error,
        ""
    );

    showApp();
    updateProfileUI();

}


function updateProfileUI() {

    if (!profile) {
        return;
    }


    const name =
        String(
            profile.name || ""
        );

    const phone =
        String(
            profile.phone || ""
        );

    const zardaloo =
        String(
            profile.zardaloo_number ||
            profile.zardaloo ||
            ""
        );


    const homeName =
        document.getElementById(
            "home-profile-name"
        );

    const homePhone =
        document.getElementById(
            "home-profile-phone"
        );

    const homeZardaloo =
        document.getElementById(
            "home-profile-zardaloo"
        );

    const headerProfile =
        document.getElementById(
            "header-profile"
        );


    if (homeName) {
        homeName.textContent = name || "-";
    }

    if (homePhone) {
        homePhone.textContent = phone || "-";
    }

    if (homeZardaloo) {
        homeZardaloo.textContent =
            zardaloo || "-";
    }


    if (headerProfile) {

        if (profile.image) {

            headerProfile.innerHTML =
                `<img src="${escapeAttribute(
                    profile.image
                )}" alt="پروفایل">`;

        } else {

            headerProfile.textContent =
                profile.avatar || "👤";

        }

    }


    const profileName =
        document.getElementById(
            "profile-name"
        );

    const profilePhone =
        document.getElementById(
            "profile-phone"
        );

    const profileZardaloo =
        document.getElementById(
            "profile-zardaloo"
        );


    if (profileName) {
        profileName.value = name;
    }

    if (profilePhone) {
        profilePhone.value = phone;
    }

    if (profileZardaloo) {
        profileZardaloo.value =
            zardaloo;
    }

}


function handleProfileImage(event) {

    const file =
        event?.target?.files?.[0];

    if (!file) {
        return;
    }


    if (!file.type.startsWith("image/")) {

        alert(
            "فقط فایل تصویری انتخاب کن."
        );

        return;
    }


    if (file.size > 5 * 1024 * 1024) {

        alert(
            "حجم تصویر نباید بیشتر از ۵ مگابایت باشد."
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload = function () {

        profileImageData =
            reader.result || "";


        const preview =
            document.getElementById(
                "profile-image-preview"
            );


        if (preview) {

            preview.innerHTML =
                `<img src="${escapeAttribute(
                    profileImageData
                )}" alt="تصویر پروفایل">`;

        }

    };


    reader.readAsDataURL(file);

}


function selectAvatar(avatar) {

    selectedAvatar =
        String(avatar || "👤");


    const preview =
        document.getElementById(
            "profile-image-preview"
        );


    if (preview) {

        preview.textContent =
            selectedAvatar;

    }

}


function chooseAvatar(avatar) {

    selectAvatar(avatar);

}


/* =========================================================
   صفحات
   ========================================================= */

function showWelcome() {

    document
        .getElementById("welcome-screen")
        ?.classList.remove("hidden");

    document
        .getElementById("profile-screen")
        ?.classList.add("hidden");

    document
        .getElementById("app-screen")
        ?.classList.add("hidden");

}


function showApp() {

    document
        .getElementById("welcome-screen")
        ?.classList.add("hidden");

    document
        .getElementById("profile-screen")
        ?.classList.add("hidden");

    document
        .getElementById("app-screen")
        ?.classList.remove("hidden");


    updateProfileUI();
    showPage("home");

}


function showPage(pageName) {

    const pages =
        document.querySelectorAll(
            "#app-screen .page"
        );


    pages.forEach(
        page => {

            page.classList.add(
                "hidden"
            );

        }
    );


    const target =
        document.getElementById(
            `page-${pageName}`
        );


    if (!target) {
        return;
    }


    target.classList.remove(
        "hidden"
    );


    if (pageName === "cart") {
        renderCart();
    }


    if (pageName === "market") {
        loadProducts();
    }


    if (pageName === "messages") {
        loadMessages();
    }

}


function openPage(pageName) {

    showPage(pageName);

}


/* =========================================================
   ثبت تصویر کالا
   ========================================================= */

function handleProductImage(event) {

    const file =
        event?.target?.files?.[0];

    if (!file) {

        productImageData = "";

        return;
    }


    if (!file.type.startsWith("image/")) {

        setStatus(
            document.getElementById(
                "register-status"
            ),
            "فقط فایل تصویری انتخاب کن."
        );

        event.target.value = "";

        return;
    }


    if (file.size > 5 * 1024 * 1024) {

        setStatus(
            document.getElementById(
                "register-status"
            ),
            "حجم تصویر نباید بیشتر از ۵ مگابایت باشد."
        );

        event.target.value = "";

        return;
    }


    const reader =
        new FileReader();


    reader.onload = function () {

        productImageData =
            reader.result || "";


        const preview =
            document.getElementById(
                "product-image-preview"
            );


        if (preview) {

            preview.innerHTML =
                `<img src="${escapeAttribute(
                    productImageData
                )}" alt="تصویر کالا">`;

        }

    };


    reader.onerror = function () {

        productImageData = "";

        setStatus(
            document.getElementById(
                "register-status"
            ),
            "خواندن تصویر با خطا مواجه شد."
        );

    };


    reader.readAsDataURL(file);

}


/* =========================================================
   ثبت کالا - نسخه اصلاح‌شده
   ========================================================= */

async function registerProduct() {

    const status =
        document.getElementById(
            "register-status"
        );


    const button =
        document.querySelector(
            '#page-register button[onclick="registerProduct()"]'
        );


    if (!profile) {

        setStatus(
            status,
            "ابتدا وارد زردآلو شو."
        );

        return;
    }


    const getValue =
        id =>
            document
                .getElementById(id)
                ?.value
                ?.trim() || "";


    const name =
        getValue(
            "product-name"
        );


    const priceText =
        getValue(
            "product-price"
        );


    const seller =
        getValue(
            "product-seller"
        ) ||
        String(
            profile.name || ""
        ).trim();


    const sellerPhone =
        getValue(
            "product-seller-phone"
        ) ||
        String(
            profile.phone || ""
        ).trim();


    const sellerZardaloo =
        getValue(
            "product-seller-zardaloo"
        ) ||
        String(
            profile.zardaloo_number || ""
        ).trim();


    const description =
        getValue(
            "product-description"
        );


    const gift =
        document.getElementById(
            "product-gift"
        )?.checked === true;


    const giftDescription =
        getValue(
            "product-gift-description"
        );


    const price =
        Number(
            priceText
        );


    if (!name) {

        setStatus(
            status,
            "نام کالا را وارد کن."
        );

        document
            .getElementById(
                "product-name"
            )
            ?.focus();

        return;
    }


    if (
        !priceText ||
        !Number.isFinite(price) ||
        price <= 0
    ) {

        setStatus(
            status,
            "قیمت معتبر و بیشتر از صفر وارد کن."
        );

        document
            .getElementById(
                "product-price"
            )
            ?.focus();

        return;
    }


    if (!seller) {

        setStatus(
            status,
            "نام فروشنده را وارد کن."
        );

        return;
    }


    if (!sellerPhone) {

        setStatus(
            status,
            "شماره تماس فروشنده را وارد کن."
        );

        return;
    }


    if (!sellerZardaloo) {

        setStatus(
            status,
            "شماره زردآلو فروشنده را وارد کن."
        );

        return;
    }


    if (
        gift &&
        !giftDescription
    ) {

        setStatus(
            status,
            "توضیح هدیه را وارد کن."
        );

        document
            .getElementById(
                "product-gift-description"
            )
            ?.focus();

        return;
    }


    try {

        if (button) {
            button.disabled = true;
        }


        setStatus(
            status,
            "در حال ثبت کالا..."
        );


        /*
         * فقط فیلدهای اصلی ارسال می‌شوند.
         *
         * owner_zardaloo_number و gift_description
         * عمداً حذف شده‌اند تا اگر این ستون‌ها
         * در جدول Supabase وجود نداشتند، ثبت کالا
         * به خاطر ستون ناشناخته شکست نخورد.
         */

        const payload = {

            name:
                name,

            price:
                Math.round(price),

            seller:
                seller,

            seller_phone:
                sellerPhone,

            seller_number:
                sellerZardaloo,

            seller_zardaloo_number:
                sellerZardaloo,

            description:
                description,

            gift:
                gift,

            image_url:
                productImageData || ""

        };


        const response =
            await fetch(
                PRODUCTS_URL,
                {
                    method: "POST",

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
            "کالا با موفقیت ثبت شد:",
            data
        );


        setStatus(
            status,
            "کالا با موفقیت ثبت شد."
        );


        clearProductForm();


        await loadProducts();


        setTimeout(
            () => {
                showPage("market");
            },
            700
        );


    } catch (error) {

        console.error(
            "خطای ثبت کالا:",
            error
        );


        setStatus(
            status,
            error.message ||
            "ثبت کالا انجام نشد."
        );


    } finally {

        if (button) {
            button.disabled = false;
        }

    }

}


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


    ids.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );

            if (element) {
                element.value = "";
            }

        }
    );


    const gift =
        document.getElementById(
            "product-gift"
        );

    if (gift) {
        gift.checked = false;
    }


    const imageInput =
        document.getElementById(
            "product-image-input"
        );

    if (imageInput) {
        imageInput.value = "";
    }


    const preview =
        document.getElementById(
            "product-image-preview"
        );

    if (preview) {
        preview.textContent =
            "تصویر کالا";
    }


    productImageData = "";

}


/* =========================================================
   دریافت کالاها
   ========================================================= */

async function loadProducts() {

    const status =
        document.getElementById(
            "market-status"
        );


    try {

        setStatus(
            status,
            "در حال دریافت کالاها..."
        );


        const response =
            await fetch(
                `${PRODUCTS_URL}?select=*&order=id.desc`,
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
                : Array.isArray(data.data)
                    ? data.data
                    : Array.isArray(data.products)
                        ? data.products
                        : [];


        renderProducts(
            products
        );


        setStatus(
            status,
            `${products.length} کالا دریافت شد.`
        );


    } catch (error) {

        console.error(
            "خطای دریافت کالاها:",
            error
        );


        products = [];


        renderProducts(
            []
        );


        setStatus(
            status,
            error.message ||
            "دریافت کالاها انجام نشد."
        );

    }

}


/* =========================================================
   نمایش کالاها
   ========================================================= */

function renderProducts(list) {

    const grid =
        document.getElementById(
            "products-grid"
        );


    if (!grid) {
        return;
    }


    if (!Array.isArray(list) || !list.length) {

        grid.innerHTML =
            `
            <div class="empty-state">
                کالایی پیدا نشد.
            </div>
            `;

        return;
    }


    grid.innerHTML =
        list
            .map(
                product => {

                    const id =
                        product.id ??
                        product.product_id ??
                        "";


                    const name =
                        product.name ||
                        "بدون نام";


                    const price =
                        Number(
                            product.price || 0
                        );


                    const seller =
                        product.seller ||
                        "نامشخص";


                    const phone =
                        product.seller_phone ||
                        "";


                    const sellerNumber =
                        product.seller_zardaloo_number ||
                        product.seller_number ||
                        "";


                    const description =
                        product.description ||
                        "";


                    const image =
                        product.image_url ||
                        product.image ||
                        "";


                    const hasGift =
                        product.gift === true ||
                        product.gift === "true" ||
                        product.gift === "yes";


                    return `
                        <article
                            class="product-card"
                        >

                            <div class="product-image">

                                ${
                                    image
                                    ?
                                    `<img
                                        src="${escapeAttribute(
                                            image
                                        )}"
                                        alt="${escapeAttribute(
                                            name
                                        )}"
                                    >`
                                    :
                                    `<span>📦</span>`
                                }

                            </div>

                            <div class="product-info">

                                <h3>
                                    ${escapeHtml(name)}
                                </h3>

                                <strong>
                                    ${formatPrice(price)}
                                    ریال
                                </strong>

                                <p>
                                    فروشنده:
                                    ${escapeHtml(seller)}
                                </p>

                                ${
                                    sellerNumber
                                    ?
                                    `<p>
                                        شماره زردآلو:
                                        ${escapeHtml(
                                            sellerNumber
                                        )}
                                    </p>`
                                    :
                                    ""
                                }

                                ${
                                    phone
                                    ?
                                    `<p>
                                        تماس:
                                        ${escapeHtml(
                                            phone
                                        )}
                                    </p>`
                                    :
                                    ""
                                }

                                ${
                                    description
                                    ?
                                    `<p>
                                        ${escapeHtml(
                                            description
                                        )}
                                    </p>`
                                    :
                                    ""
                                }

                                ${
                                    hasGift
                                    ?
                                    `<div class="gift-badge">
                                        🎁 دارای هدیه
                                    </div>`
                                    :
                                    ""
                                }

                                <button
                                    type="button"
                                    class="primary-button"
                                    onclick="addToCart('${escapeAttribute(
                                        String(id)
                                    )}')"
                                >
                                    افزودن به سبد
                                </button>

                            </div>

                        </article>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   سبد خرید
   ========================================================= */

function loadSavedCart() {

    try {

        const saved =
            localStorage.getItem(
                CART_KEY
            );


        if (saved) {

            const data =
                JSON.parse(
                    saved
                );


            if (Array.isArray(data)) {
                cart = data;
            }

        }

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
            item =>
                String(
                    item.id ??
                    item.product_id
                ) === String(id)
        );


    if (!product) {

        alert(
            "این کالا پیدا نشد."
        );

        return;
    }


    const exists =
        cart.some(
            item =>
                String(
                    item.id ??
                    item.product_id
                ) === String(id)
        );


    if (exists) {

        alert(
            "این کالا قبلاً در سبد خرید است."
        );

        return;
    }


    cart.push(
        product
    );


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
                String(
                    item.id ??
                    item.product_id
                ) !== String(id)
        );


    saveCart();
    renderCart();

}


function renderCart() {

    const container =
        document.getElementById(
            "cart-items"
        );


    const summary =
        document.getElementById(
            "cart-summary"
        );


    if (!container) {
        return;
    }


    if (!cart.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                سبد خرید خالی است.
            </div>
            `;


        if (summary) {
            summary.innerHTML = "";
        }


        return;
    }


    container.innerHTML =
        cart
            .map(
                product => {

                    const id =
                        product.id ??
                        product.product_id;


                    const name =
                        product.name ||
                        "بدون نام";


                    const price =
                        Number(
                            product.price || 0
                        );


                    return `
                        <div
                            class="cart-item"
                        >

                            <div>

                                <strong>
                                    ${escapeHtml(
                                        name
                                    )}
                                </strong>

                                <p>
                                    ${formatPrice(
                                        price
                                    )}
                                    ریال
                                </p>

                            </div>

                            <button
                                type="button"
                                class="danger-button"
                                onclick="removeFromCart('${escapeAttribute(
                                    String(id)
                                )}')"
                            >
                                حذف
                            </button>

                        </div>
                    `;

                }
            )
            .join("");


    const subtotal =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.price || 0
                ),
            0
        );


    const finalPrice =
        Math.max(
            0,
            subtotal -
            discountValue
        );


    if (summary) {

        summary.innerHTML =
            `
            <div>
                مبلغ کالاها:
                <strong>
                    ${formatPrice(
                        subtotal
                    )}
                    ریال
                </strong>
            </div>

            <div>
                تخفیف:
                <strong>
                    ${formatPrice(
                        discountValue
                    )}
                    ریال
                </strong>
            </div>

            <div>
                مبلغ نهایی:
                <strong>
                    ${formatPrice(
                        finalPrice
                    )}
                    ریال
                </strong>
            </div>
            `;

    }

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
        input?.value.trim() || "";


    if (code === "50") {

        discountValue = 50000;


        setStatus(
            status,
            "کد تخفیف ۵۰٬۰۰۰ ریالی اعمال شد."
        );


    } else if (code === "100") {

        discountValue = 100000;


        setStatus(
            status,
            "کد تخفیف ۱۰۰٬۰۰۰ ریالی اعمال شد."
        );


    } else {

        discountValue = 0;


        setStatus(
            status,
            "کد تخفیف معتبر نیست."
        );

    }


    renderCart();

}


function applyDiscountCode() {

    applyDiscount();

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
        input?.value.trim() || "";


    const status =
        document.getElementById(
            "message-status"
        );


    if (!number) {

        setStatus(
            status,
            "شماره زردآلو را وارد کن."
        );

        return;
    }


    currentChatNumber =
        number;


    const chatArea =
        document.getElementById(
            "chat-area"
        );


    const title =
        document.getElementById(
            "chat-title"
        );


    if (title) {

        title.textContent =
            `گفتگو با ${number}`;

    }


    chatArea?.classList.remove(
        "hidden"
    );


    loadMessages();

}


function startConversationWith(
    number
) {

    const input =
        document.getElementById(
            "message-receiver"
        );


    if (input) {
        input.value =
            number || "";
    }


    startConversation();

}


async function loadMessages() {

    const box =
        document.getElementById(
            "chat-box"
        );


    if (!box || !currentChatNumber) {
        return;
    }


    if (!profile) {
        return;
    }


    try {

        const myNumber =
            String(
                profile.zardaloo_number ||
                ""
            );


        const url =
            `${MESSAGES_URL}?select=*&or=(and(sender_zardaloo_number.eq.${encodeURIComponent(
                myNumber
            )},receiver_zardaloo_number.eq.${encodeURIComponent(
                currentChatNumber
            )}),and(sender_zardaloo_number.eq.${encodeURIComponent(
                currentChatNumber
            )},receiver_zardaloo_number.eq.${encodeURIComponent(
                myNumber
            )}))&order=id.asc`;


        const response =
            await fetch(
                url,
                {
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
                : [];


        if (!messages.length) {

            box.innerHTML =
                `
                <div class="empty-state">
                    هنوز پیامی وجود ندارد.
                </div>
                `;

            return;
        }


        box.innerHTML =
            messages
                .map(
                    message => {

                        const mine =
                            String(
                                message.sender_zardaloo_number
                            ) ===
                            String(
                                myNumber
                            );


                        return `
                            <div
                                class="message ${
                                    mine
                                    ? "message-mine"
                                    : "message-other"
                                }"
                            >
                                ${escapeHtml(
                                    message.message ||
                                    ""
                                )}
                            </div>
                        `;

                    }
                )
                .join("");


        box.scrollTop =
            box.scrollHeight;


    } catch (error) {

        console.error(
            "خطای دریافت پیام‌ها:",
            error
        );

    }

}


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
        input?.value.trim() || "";


    if (!profile) {

        setStatus(
            status,
            "ابتدا وارد حساب شو."
        );

        return;
    }


    if (!currentChatNumber) {

        setStatus(
            status,
            "ابتدا یک گفتگو انتخاب کن."
        );

        return;
    }


    if (!message) {

        setStatus(
            status,
            "پیام را بنویس."
        );

        return;
    }


    try {

        const payload = {

            sender_zardaloo_number:
                String(
                    profile.zardaloo_number ||
                    ""
                ),

            receiver_zardaloo_number:
                String(
                    currentChatNumber
                ),

            message:
                message

        };


        const response =
            await fetch(
                MESSAGES_URL,
                {
                    method: "POST",

                    headers:
                        supabaseHeaders(),

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        await readResponse(
            response
        );


        input.value = "";

        setStatus(
            status,
            "پیام ارسال شد."
        );


        await loadMessages();


    } catch (error) {

        console.error(
            "خطای ارسال پیام:",
            error
        );


        setStatus(
            status,
            error.message ||
            "ارسال پیام انجام نشد."
        );

    }

}


/* =========================================================
   گزارش فروشنده
   ========================================================= */

async function submitReport() {

    const sellerNumber =
        document
            .getElementById(
                "report-seller-zardaloo"
            )
            ?.value
            .trim() || "";


    const reason =
        document
            .getElementById(
                "report-reason"
            )
            ?.value || "";


    const description =
        document
            .getElementById(
                "report-description"
            )
            ?.value
            .trim() || "";


    const status =
        document.getElementById(
            "report-status"
        );


    if (!profile) {

        setStatus(
            status,
            "ابتدا وارد حساب شو."
        );

        return;
    }


    if (!sellerNumber) {

        setStatus(
            status,
            "شماره زردآلو فروشنده را وارد کن."
        );

        return;
    }


    if (!description) {

        setStatus(
            status,
            "توضیحات گزارش را وارد کن."
        );

        return;
    }


    try {

        const payload = {

            seller_zardaloo_number:
                sellerNumber,

            reason:
                reason,

            description:
                description,

            reporter_zardaloo_number:
                String(
                    profile.zardaloo_number ||
                    ""
                ),

            reporter_name:
                String(
                    profile.name ||
                    ""
                )

        };


        const response =
            await fetch(
                REPORTS_URL,
                {
                    method: "POST",

                    headers:
                        supabaseHeaders(),

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        await readResponse(
            response
        );


        setStatus(
            status,
            "گزارش با موفقیت ارسال شد."
        );


        document
            .getElementById(
                "report-seller-zardaloo"
            )
            .value = "";


        document
            .getElementById(
                "report-description"
            )
            .value = "";


    } catch (error) {

        console.error(
            "خطای ارسال گزارش:",
            error
        );


        setStatus(
            status,
            error.message ||
            "ارسال گزارش انجام نشد."
        );

    }

}


/* =========================================================
   مدیریت
   ========================================================= */

async function adminLogin() {

    const password =
        document
            .getElementById(
                "admin-password"
            )
            ?.value || "";


    const status =
        document.getElementById(
            "admin-status"
        );


    /*
     * رمز مدیریت را در پروژه واقعی
     * داخل فرانت‌اند قرار نده.
     * احراز هویت مدیریت باید سمت سرور انجام شود.
     */

    if (!password) {

        setStatus(
            status,
            "رمز مدیریت را وارد کن."
        );

        return;
    }


    if (password !== "1234") {

        setStatus(
            status,
            "رمز مدیریت اشتباه است."
        );

        return;
    }


    setStatus(
        status,
        "ورود موفق بود."
    );


    document
        .getElementById(
            "admin-panel"
        )
        ?.classList.remove(
            "hidden"
        );


    await loadAdminData();

}


async function loadAdminData() {

    await loadAdminProducts();
    await loadAdminReports();

}


async function loadAdminProducts() {

    try {

        const response =
            await fetch(
                `${PRODUCTS_URL}?select=*`,
                {
                    headers:
                        supabaseHeaders()
                }
            );


        const data =
            await readResponse(
                response
            );


        const list =
            Array.isArray(data)
                ? data
                : [];


        const count =
            document.getElementById(
                "admin-product-count"
            );


        const box =
            document.getElementById(
                "admin-products"
            );


        if (count) {
            count.textContent =
                list.length;
        }


        if (box) {

            box.innerHTML =
                list.length
                ?
                list
                    .map(
                        product => `
                            <div class="admin-item">

                                <strong>
                                    ${escapeHtml(
                                        product.name ||
                                        ""
                                    )}
                                </strong>

                                <span>
                                    ${formatPrice(
                                        product.price
                                    )}
                                    ریال
                                </span>

                                <span>
                                    فروشنده:
                                    ${escapeHtml(
                                        product.seller ||
                                        ""
                                    )}
                                </span>

                            </div>
                        `
                    )
                    .join("")
                :
                `
                    <div class="empty-state">
                        کالایی وجود ندارد.
                    </div>
                `;

        }


    } catch (error) {

        console.error(
            "خطای دریافت کالاهای مدیریت:",
            error
        );

    }

}


async function loadAdminReports() {

    try {

        const response =
            await fetch(
                `${REPORTS_URL}?select=*&order=id.desc`,
                {
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
                : Array.isArray(data.reports)
                    ? data.reports
                    : Array.isArray(data.data)
                        ? data.data
                        : [];


        const reportCount =
            document.getElementById(
                "admin-report-count"
            );


        const reportBox =
            document.getElementById(
                "admin-reports"
            );


        if (reportCount) {

            reportCount.textContent =
                reports.length;

        }


        if (reportBox) {

            if (!reports.length) {

                reportBox.innerHTML =
                    `
                    <div class="empty-state">
                        گزارشی وجود ندارد.
                    </div>
                    `;

            } else {

                reportBox.innerHTML =
                    reports
                        .map(
                            report => `

                                <div
                                    class="admin-item"
                                >

                                    <strong>
                                        گزارش:
                                        ${escapeHtml(
                                            report.seller_zardaloo_number ||
                                            ""
                                        )}
                                    </strong>

                                    <span>
                                        ${escapeHtml(
                                            report.reason ||
                                            ""
                                        )}
                                    </span>

                                    <p>
                                        ${escapeHtml(
                                            report.description ||
                                            ""
                                        )}
                                    </p>

                                </div>

                            `
                        )
                        .join("");

            }

        }


    } catch (error) {

        console.error(
            "خطای دریافت گزارش‌ها:",
            error
        );

    }

}


/* =========================================================
   فیلترهای بازار
   ========================================================= */

function setupFilters() {

    const nameInput =
        document.getElementById(
            "filter-name"
        );


    const minInput =
        document.getElementById(
            "filter-min-price"
        );


    const maxInput =
        document.getElementById(
            "filter-max-price"
        );


    const sellerInput =
        document.getElementById(
            "filter-seller"
        );


    const giftSelect =
        document.getElementById(
            "filter-gift"
        );


    const apply =
        () => {

            const name =
                nameInput?.value
                    .trim()
                    .toLowerCase() ||
                "";


            const min =
                Number(
                    minInput?.value || 0
                );


            const max =
                Number(
                    maxInput?.value || 0
                );


            const seller =
                sellerInput?.value
                    .trim()
                    .toLowerCase() ||
                "";


            const gift =
                giftSelect?.value ||
                "";


            const filtered =
                products.filter(
                    product => {

                        const productName =
                            String(
                                product.name ||
                                ""
                            ).toLowerCase();


                        const sellerName =
                            String(
                                product.seller ||
                                ""
                            ).toLowerCase();


                        const price =
                            Number(
                                product.price ||
                                0
                            );


                        if (
                            name &&
                            !productName.includes(
                                name
                            )
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
                            !sellerName.includes(
                                seller
                            )
                        ) {

                            return false;

                        }


                        const hasGift =
                            product.gift === true ||
                            product.gift === "true" ||
                            product.gift === "yes";


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

                    }
                );


            renderProducts(
                filtered
            );

        };


    [
        nameInput,
        minInput,
        maxInput,
        sellerInput,
        giftSelect
    ]
    .filter(Boolean)
    .forEach(
        element => {

            element.addEventListener(
                "input",
                apply
            );


            element.addEventListener(
                "change",
                apply
            );

        }
    );

}


/* =========================================================
   هدرهای Supabase
   ========================================================= */

function supabaseHeaders() {

    return {

        "Content-Type":
            "application/json",

        "apikey":
            SUPABASE_KEY,

        "Authorization":
            "Bearer " +
            SUPABASE_KEY,

        "Prefer":
            "return=representation"

    };

}


/* =========================================================
   پاسخ سرور
   ========================================================= */

async function readResponse(
    response
) {

    const text =
        await response.text();


    let data = {};


    try {

        data =
            text
            ? JSON.parse(text)
            : {};

    } catch {

        data = {
            message: text
        };

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            data.details ||
            data.hint ||
            `خطای سرور: ${response.status}`
        );

    }


    return data;

}


/* =========================================================
   ابزارهای عمومی
   ========================================================= */

function setStatus(
    element,
    text
) {

    if (element) {

        element.textContent =
            text;

    }

}


function formatPrice(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "fa-IR"
    );

}


function escapeHtml(value) {

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}


function escapeAttribute(value) {

    return escapeHtml(
        value
    );

}


function setupEnterKey() {

    const input =
        document.getElementById(
            "chat-input"
        );


    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

    }

}


/* =========================================================
   خروج
   ========================================================= */

function logoutZardaloo() {

    profile = null;

    currentChatNumber = "";

    profileImageData = "";

    selectedAvatar = "";

    products = [];

    cart = [];

    discountValue = 0;


    localStorage.removeItem(
        PROFILE_KEY
    );


    localStorage.removeItem(
        CART_KEY
    );


    OLD_PROFILE_KEYS.forEach(
        key => {

            localStorage.removeItem(
                key
            );

        }
    );


    showWelcome();

}


/* =========================================================
   اتصال توابع به HTML
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

window.openPage =
    openPage;

window.handleProfileImage =
    handleProfileImage;

window.selectAvatar =
    selectAvatar;

window.chooseAvatar =
    chooseAvatar;

window.handleProductImage =
    handleProductImage;

window.registerProduct =
    registerProduct;

window.loadProducts =
    loadProducts;

window.addToCart =
    addToCart;

window.removeFromCart =
    removeFromCart;

window.applyDiscount =
    applyDiscount;

window.applyDiscountCode =
    applyDiscount;

window.startConversation =
    startConversation;

window.startConversationWith =
    startConversationWith;

window.loadMessages =
    loadMessages;

window.sendMessage =
    sendMessage;

window.submitReport =
    submitReport;

window.adminLogin =
    adminLogin;

window.logoutZardaloo =
    logoutZardaloo;
