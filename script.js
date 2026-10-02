"use strict";

/* =========================================================
   زردآلو | script.js
   نسخه یک‌دست
   ========================================================= */


/* =========================================================
   Supabase
   ========================================================= */

const SUPABASE_URL =
    "https://ovqldknqpaiczrddcrxp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_VDZ_tgoMgYRI7K419ieDKw_y29xeXA2";


const PRODUCTS_URL =
    SUPABASE_URL +
    "/functions/v1/products";


const REPORT_URL =
    SUPABASE_URL +
    "/functions/v1/report-seller";


const MESSAGES_URL =
    SUPABASE_URL +
    "/functions/v1/messages";


const ADMIN_REPORTS_URL =
    SUPABASE_URL +
    "/functions/v1/admin-reports";


/* =========================================================
   LocalStorage
   ========================================================= */

const PROFILE_KEY =
    "zardaloo_profile_final_v12";


const OLD_PROFILE_KEYS = [
    "zardaloo_profile_final_v11",
    "zardaloo_profile_final_v10"
];


const CART_KEY =
    "zardaloo_cart_final_v12";


const OLD_CART_KEYS = [
    "zardaloo_cart_final_v11",
    "zardaloo_cart_final_v10"
];


const DISCOUNT_KEY =
    "zardaloo_discount_final_v12";


/* =========================================================
   مدیریت
   ========================================================= */

const ADMIN_NUMBER =
    "0994051777";


const ADMIN_PASSWORD =
    "ERFAN";


/* =========================================================
   متغیرها
   ========================================================= */

let profile = null;

let products = [];

let cart = [];

let discountPercent = 0;

let profileImageData = "";

let selectedAvatar = "";

let productImageData = "";

let currentChatNumber = "";

let adminLoggedIn = false;


/* =========================================================
   شروع
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "زردآلو: JavaScript با موفقیت اجرا شد."
        );


        loadLocalData();

        setupFilters();

        setupChatEnter();


        if (profile) {

            showApp();

        } else {

            showWelcome();

        }

    }
);


/* =========================================================
   اطلاعات محلی
   ========================================================= */

function loadLocalData() {

    /*
     * پروفایل جدید
     */

    let savedProfile =
        localStorage.getItem(
            PROFILE_KEY
        );


    /*
     * سازگاری با نسخه‌های قبلی
     */

    if (!savedProfile) {

        for (
            const oldKey
            of OLD_PROFILE_KEYS
        ) {

            savedProfile =
                localStorage.getItem(
                    oldKey
                );

            if (savedProfile) {
                break;
            }

        }

    }


    if (savedProfile) {

        try {

            profile =
                JSON.parse(
                    savedProfile
                );


            if (
                !profile ||
                !profile.name ||
                !profile.zardaloo_number
            ) {

                profile = null;

            }

        } catch (error) {

            console.error(
                "پروفایل خراب است:",
                error
            );

            profile = null;

        }

    }


    /*
     * سبد خرید
     */

    let savedCart =
        localStorage.getItem(
            CART_KEY
        );


    if (!savedCart) {

        for (
            const oldKey
            of OLD_CART_KEYS
        ) {

            savedCart =
                localStorage.getItem(
                    oldKey
                );

            if (savedCart) {
                break;
            }

        }

    }


    if (savedCart) {

        try {

            cart =
                JSON.parse(
                    savedCart
                );


            if (!Array.isArray(cart)) {
                cart = [];
            }

        } catch {

            cart = [];

        }

    }


    /*
     * تخفیف
     */

    const savedDiscount =
        localStorage.getItem(
            DISCOUNT_KEY
        );


    if (savedDiscount) {

        discountPercent =
            Number(
                savedDiscount
            ) || 0;

    }


    /*
     * اطلاعات تصویر
     */

    if (profile) {

        profileImageData =
            profile.profile_image || "";

        selectedAvatar =
            profile.avatar || "";

    }

}


/* =========================================================
   ذخیره پروفایل
   ========================================================= */

function saveProfile() {

    if (!profile) {
        return;
    }


    localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(profile)
    );

}


/* =========================================================
   ورود
   ========================================================= */

function enterZardaloo() {

    const nameInput =
        document.getElementById(
            "profile-name"
        );


    const phoneInput =
        document.getElementById(
            "profile-phone"
        );


    const numberInput =
        document.getElementById(
            "profile-zardaloo"
        );


    const errorBox =
        document.getElementById(
            "profile-error"
        );


    if (
        !nameInput ||
        !phoneInput ||
        !numberInput
    ) {

        console.error(
            "فیلدهای ورود پیدا نشدند."
        );


        if (errorBox) {

            errorBox.textContent =
                "خطا در فرم ورود. صفحه را دوباره بارگذاری کن.";

        }

        return;

    }


    const name =
        nameInput.value.trim();


    const phone =
        phoneInput.value.trim();


    const zardalooNumber =
        numberInput.value.trim();


    if (!name) {

        errorBox.textContent =
            "لطفاً نام و نام خانوادگی را وارد کن.";

        nameInput.focus();

        return;

    }


    if (!phone) {

        errorBox.textContent =
            "لطفاً شماره تماس را وارد کن.";

        phoneInput.focus();

        return;

    }


    if (!zardalooNumber) {

        errorBox.textContent =
            "لطفاً شماره زردآلو را وارد کن.";

        numberInput.focus();

        return;

    }


    /*
     * ساخت پروفایل
     */

    profile = {

        name:
            name,

        phone:
            phone,

        zardaloo_number:
            zardalooNumber,

        profile_image:
            profileImageData || "",

        avatar:
            selectedAvatar || ""

    };


    saveProfile();


    errorBox.textContent = "";


    showApp();

}


/* =========================================================
   خوش‌آمدگویی
   ========================================================= */

function showWelcome() {

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


    if (welcome) {

        welcome.classList.remove(
            "hidden"
        );

    }


    if (profileScreen) {

        profileScreen.classList.add(
            "hidden"
        );

    }


    if (app) {

        app.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   فرم ورود
   ========================================================= */

function openProfileFromWelcome() {

    const welcome =
        document.getElementById(
            "welcome-screen"
        );


    const profileScreen =
        document.getElementById(
            "profile-screen"
        );


    if (welcome) {

        welcome.classList.add(
            "hidden"
        );

    }


    if (profileScreen) {

        profileScreen.classList.remove(
            "hidden"
        );

    }


    /*
     * اگر پروفایل قبلاً وجود داشته،
     * اطلاعات قبلی داخل فرم نمایش داده شود.
     */

    if (profile) {

        const nameInput =
            document.getElementById(
                "profile-name"
            );


        const phoneInput =
            document.getElementById(
                "profile-phone"
            );


        const numberInput =
            document.getElementById(
                "profile-zardaloo"
            );


        if (nameInput) {

            nameInput.value =
                profile.name || "";

        }


        if (phoneInput) {

            phoneInput.value =
                profile.phone || "";

        }


        if (numberInput) {

            numberInput.value =
                profile.zardaloo_number || "";

        }

    }

}


/* =========================================================
   بازار از صفحه اول
   ========================================================= */

function openMarketFromWelcome() {

    if (!profile) {

        openProfileFromWelcome();

        return;

    }


    showApp();

    showPage("market");

}


/* =========================================================
   نمایش برنامه
   ========================================================= */

function showApp() {

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


    if (!app) {

        console.error(
            "app-screen در HTML پیدا نشد."
        );

        alert(
            "خطا: بخش اصلی برنامه پیدا نشد."
        );

        return;

    }


    if (welcome) {

        welcome.classList.add(
            "hidden"
        );

    }


    if (profileScreen) {

        profileScreen.classList.add(
            "hidden"
        );

    }


    app.classList.remove(
        "hidden"
    );


    updateProfileUI();

    renderCart();

    showPage("home");

    loadProducts();

}


/* =========================================================
   پروفایل در خانه
   ========================================================= */

function updateProfileUI() {

    if (!profile) {
        return;
    }


    const name =
        document.getElementById(
            "home-profile-name"
        );


    const phone =
        document.getElementById(
            "home-profile-phone"
        );


    const zardaloo =
        document.getElementById(
            "home-profile-zardaloo"
        );


    if (name) {

        name.textContent =
            profile.name || "-";

    }


    if (phone) {

        phone.textContent =
            profile.phone || "-";

    }


    if (zardaloo) {

        zardaloo.textContent =
            profile.zardaloo_number || "-";

    }


    const headerProfile =
        document.getElementById(
            "header-profile"
        );


    if (!headerProfile) {
        return;
    }


    if (profile.profile_image) {

        headerProfile.innerHTML =
            `<img
                src="${escapeAttribute(
                    profile.profile_image
                )}"
                alt="پروفایل"
            >`;

    } else if (profile.avatar) {

        headerProfile.textContent =
            profile.avatar;

    } else {

        headerProfile.textContent =
            "👤";

    }

}


/* =========================================================
   تغییر صفحه
   ========================================================= */

function showPage(pageName) {

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
            page => {

                page.classList.add(
                    "hidden"
                );

            }
        );


    const target =
        document.getElementById(
            "page-" + pageName
        );


    if (!target) {

        console.warn(
            "صفحه پیدا نشد:",
            pageName
        );

        return;

    }


    target.classList.remove(
        "hidden"
    );


    if (
        pageName ===
        "market"
    ) {

        renderProducts(
            products
        );

    }


    if (
        pageName ===
        "cart"
    ) {

        renderCart();

    }


    if (
        pageName ===
        "messages"
    ) {

        if (currentChatNumber) {

            openChatArea();

            loadMessages();

        }

    }


    if (
        pageName ===
        "home"
    ) {

        updateProfileUI();

    }

}


/*
 * نام قدیمی برای سازگاری
 */

function openPage(pageName) {

    showPage(pageName);

}


/* =========================================================
   تصویر پروفایل
   ========================================================= */

function handleProfileImage(event) {

    const file =
        event.target.files &&
        event.target.files[0];


    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        function () {

            profileImageData =
                reader.result;


            const preview =
                document.getElementById(
                    "profile-image-preview"
                );


            if (preview) {

                preview.innerHTML =
                    `<img
                        src="${escapeAttribute(
                            profileImageData
                        )}"
                        alt="تصویر پروفایل"
                    >`;

            }

        };


    reader.readAsDataURL(
        file
    );

}


/* =========================================================
   آواتار
   ========================================================= */

function selectAvatar(avatar) {

    selectedAvatar =
        avatar;


    profileImageData =
        "";


    const preview =
        document.getElementById(
            "profile-image-preview"
        );


    if (preview) {

        preview.textContent =
            avatar;

    }

}


/*
 * سازگاری با نسخه قبلی
 */

function chooseAvatar(avatar) {

    selectAvatar(avatar);

}


/* =========================================================
   تصویر کالا
   ========================================================= */

function handleProductImage(event) {

    const file =
        event.target.files &&
        event.target.files[0];


    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        function () {

            productImageData =
                reader.result;


            const preview =
                document.getElementById(
                    "product-image-preview"
                );


            if (preview) {

                preview.innerHTML =
                    `<img
                        src="${escapeAttribute(
                            productImageData
                        )}"
                        alt="تصویر کالا"
                    >`;

            }

        };


    reader.readAsDataURL(
        file
    );

}


/* =========================================================
   ثبت کالا
   ========================================================= */

async function registerProduct() {

    if (!profile) {

        alert(
            "ابتدا وارد زردآلو شو."
        );

        return;

    }


    const name =
        document.getElementById(
            "product-name"
        )?.value.trim() || "";


    const price =
        Number(
            document.getElementById(
                "product-price"
            )?.value || 0
        );


    const seller =
        document.getElementById(
            "product-seller"
        )?.value.trim()
        ||
        profile.name;


    const sellerPhone =
        document.getElementById(
            "product-seller-phone"
        )?.value.trim()
        ||
        profile.phone;


    const sellerZardaloo =
        document.getElementById(
            "product-seller-zardaloo"
        )?.value.trim()
        ||
        profile.zardaloo_number;


    const description =
        document.getElementById(
            "product-description"
        )?.value.trim() || "";


    const gift =
        document.getElementById(
            "product-gift"
        )?.checked || false;


    const giftDescription =
        document.getElementById(
            "product-gift-description"
        )?.value.trim() || "";


    const status =
        document.getElementById(
            "register-status"
        );


    if (!name) {

        setStatus(
            status,
            "نام کالا را وارد کن."
        );

        return;

    }


    if (
        !Number.isFinite(price) ||
        price < 0
    ) {

        setStatus(
            status,
            "قیمت معتبر وارد کن."
        );

        return;

    }


    try {

        setStatus(
            status,
            "در حال ثبت کالا..."
        );


        const response =
            await fetch(
                PRODUCTS_URL,
                {

                    method: "POST",

                    headers:
                        supabaseHeaders(),

                    body:
                        JSON.stringify({

                            name:
                                name,

                            price:
                                price,

                            seller:
                                seller,

                            seller_phone:
                                sellerPhone,

                            seller_number:
                                sellerZardaloo,

                            seller_zardaloo_number:
                                sellerZardaloo,

                            owner_zardaloo_number:
                                profile.zardaloo_number,

                            description:
                                description,

                            gift:
                                gift,

                            gift_description:
                                giftDescription,

                            image_url:
                                productImageData || ""

                        })

                }
            );


        await readResponse(
            response
        );


        setStatus(
            status,
            "کالا با موفقیت ثبت شد."
        );


        document.getElementById(
            "product-name"
        ).value = "";


        document.getElementById(
            "product-price"
        ).value = "";


        document.getElementById(
            "product-seller"
        ).value = "";


        document.getElementById(
            "product-seller-phone"
        ).value = "";


        document.getElementById(
            "product-seller-zardaloo"
        ).value = "";


        document.getElementById(
            "product-description"
        ).value = "";


        document.getElementById(
            "product-gift"
        ).checked = false;


        document.getElementById(
            "product-gift-description"
        ).value = "";


        productImageData = "";


        const preview =
            document.getElementById(
                "product-image-preview"
            );


        if (preview) {

            preview.innerHTML =
                "تصویر کالا";

        }


        await loadProducts();


    } catch (error) {

        console.error(
            "خطای ثبت کالا:",
            error
        );


        setStatus(
            status,
            "ثبت کالا انجام نشد: " +
            error.message
        );

    }

}


/* =========================================================
   سبد خرید
   ========================================================= */

function saveCart() {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}


function addToCart(productId) {

    const product =
        products.find(
            item =>
                String(item.id) ===
                String(productId)
        );


    if (!product) {

        alert(
            "کالا پیدا نشد."
        );

        return;

    }


    const exists =
        cart.some(
            item =>
                String(item.id) ===
                String(product.id)
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


function removeFromCart(productId) {

    cart =
        cart.filter(
            item =>
                String(item.id) !==
                String(productId)
        );


    saveCart();

    renderCart();

}


function renderCart() {

    const container =
        document.getElementById(
            "cart-items"
        );


    if (!container) {
        return;
    }


    if (!cart.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                سبد خرید شما خالی است.
            </div>
            `;


        updateCartSummary();

        return;

    }


    container.innerHTML =
        cart
        .map(
            item => {

                const price =
                    Number(
                        item.price || 0
                    );


                const discounted =
                    Math.round(
                        price *
                        (
                            1 -
                            discountPercent /
                            100
                        )
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
                                ${formatPrice(
                                    price
                                )}
                                ریال
                            </p>

                            <p>
                                قیمت با تخفیف:
                                ${formatPrice(
                                    discounted
                                )}
                                ریال
                            </p>

                        </div>

                        <button
                            class="cart-remove"
                            type="button"
                            onclick="removeFromCart('${escapeAttribute(item.id)}')"
                        >
                            حذف
                        </button>

                    </div>
                `;

            }
        )
        .join("");


    updateCartSummary();

}


function updateCartSummary() {

    const originalTotal =
        cart.reduce(
            (
                sum,
                item
            ) =>
                sum +
                Number(
                    item.price || 0
                ),
            0
        );


    const discountAmount =
        Math.round(
            originalTotal *
            discountPercent /
            100
        );


    const finalTotal =
        originalTotal -
        discountAmount;


    const summary =
        document.getElementById(
            "cart-summary"
        );


    if (!summary) {
        return;
    }


    summary.innerHTML =
        `
        <div class="summary-row">

            <span>
                مجموع قیمت اصلی
            </span>

            <strong>
                ${formatPrice(
                    originalTotal
                )}
                ریال
            </strong>

        </div>


        <div class="summary-row">

            <span>
                مقدار تخفیف
            </span>

            <strong>
                ${formatPrice(
                    discountAmount
                )}
                ریال
            </strong>

        </div>


        <div class="summary-row total">

            <span>
                مبلغ نهایی
            </span>

            <strong>
                ${formatPrice(
                    finalTotal
                )}
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
        `;

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

        discountPercent = 50;


        setStatus(
            status,
            "تخفیف ۵۰٪ اعمال شد."
        );

    } else if (
        code === "100"
    ) {

        discountPercent = 100;


        setStatus(
            status,
            "تخفیف ۱۰۰٪ اعمال شد."
        );

    } else {

        discountPercent = 0;


        setStatus(
            status,
            "کد تخفیف نامعتبر است."
        );


        return;

    }


    localStorage.setItem(
        DISCOUNT_KEY,
        String(
            discountPercent
        )
    );


    renderCart();

}


/*
 * سازگاری
 */

function applyDiscountCode() {

    applyDiscount();

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
            extractProducts(
                data
            );


        renderProducts(
            products
        );


        setStatus(
            status,
            `${products.length} کالا دریافت شد.`
        );


    } catch (error) {

        console.error(
            "خطای کالاها:",
            error
        );


        setStatus(
            status,
            "دریافت کالاها انجام نشد: " +
            error.message
        );

    }

}


function extractProducts(data) {

    if (Array.isArray(data)) {
        return data;
    }


    if (
        data &&
        Array.isArray(data.products)
    ) {

        return data.products;

    }


    if (
        data &&
        Array.isArray(data.data)
    ) {

        return data.data;

    }


    return [];

}


/* =========================================================
   نمایش کالاها
   ========================================================= */

function renderProducts(list) {

    const container =
        document.getElementById(
            "products-grid"
        );


    if (!container) {
        return;
    }


    if (!list.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                هنوز کالایی ثبت نشده است.
            </div>
            `;

        return;

    }


    container.innerHTML =
        list
        .map(
            product => {

                const id =
                    product.id || "";


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


                const sellerNumber =
                    product.seller_zardaloo_number ||
                    product.seller_number ||
                    "";


                const image =
                    product.image_url ||
                    "";


                return `
                    <article
                        class="product-card"
                    >

                        ${
                            image
                            ?
                            `
                            <img
                                src="${escapeAttribute(
                                    image
                                )}"
                                class="product-image"
                                alt="${escapeAttribute(
                                    name
                                )}"
                            >
                            `
                            :
                            `
                            <div class="product-image">
                                بدون تصویر
                            </div>
                            `
                        }


                        <div class="product-info">

                            <h3>
                                ${escapeHtml(
                                    name
                                )}
                            </h3>


                            <div
                                class="product-price"
                            >
                                ${formatPrice(
                                    price
                                )}
                                ریال
                            </div>


                            <div
                                class="product-meta"
                            >

                                فروشنده:
                                ${escapeHtml(
                                    seller
                                )}

                                <br>

                                شماره زردآلو:
                                ${escapeHtml(
                                    sellerNumber
                                )}

                            </div>


                            <div
                                class="product-actions"
                            >

                                <button
                                    class="add-cart-button"
                                    type="button"
                                    onclick="addToCart('${escapeAttribute(id)}')"
                                >
                                    افزودن به سبد
                                </button>


                                <button
                                    class="secondary-button"
                                    type="button"
                                    onclick="startConversationWith('${escapeAttribute(sellerNumber)}')"
                                >
                                    پیام
                                </button>

                            </div>

                        </div>

                    </article>
                `;

            }
        )
        .join("");

}


/* =========================================================
   پیام‌رسان
   ========================================================= */

/*
 * شروع مکالمه از بازار
 */

function startConversationWith(number) {

    if (!profile) {

        alert(
            "ابتدا وارد حساب خود شوید."
        );

        return;

    }


    const other =
        String(
            number || ""
        ).trim();


    if (!other) {

        alert(
            "شماره زردآلو فروشنده موجود نیست."
        );

        return;

    }


    const me =
        String(
            profile.zardaloo_number || ""
        ).trim();


    if (other === me) {

        alert(
            "نمی‌توانید با خودتان مکالمه کنید."
        );

        return;

    }


    currentChatNumber =
        other;


    const receiverInput =
        document.getElementById(
            "message-receiver"
        );


    if (receiverInput) {

        receiverInput.value =
            other;

    }


    showPage(
        "messages"
    );


    openChatArea();

    loadMessages();

}


/*
 * مکالمه جدید
 */

function startConversation() {

    if (!profile) {

        alert(
            "ابتدا وارد حساب خود شوید."
        );

        return;

    }


    const input =
        document.getElementById(
            "message-receiver"
        );


    const number =
        input?.value.trim() ||
        "";


    if (!number) {

        alert(
            "شماره زردآلو طرف مقابل را وارد کن."
        );

        input?.focus();

        return;

    }


    startConversationWith(
        number
    );

}


/*
 * باز کردن محیط چت
 */

function openChatArea() {

    const area =
        document.getElementById(
            "chat-area"
        );


    const title =
        document.getElementById(
            "chat-title"
        );


    if (area) {

        area.classList.remove(
            "hidden"
        );

    }


    if (title) {

        title.textContent =
            "گفتگو با شماره زردآلو " +
            currentChatNumber;

    }

}


/* =========================================================
   دریافت پیام‌ها
   ========================================================= */

async function loadMessages() {

    if (
        !profile ||
        !currentChatNumber
    ) {

        return;

    }


    const chatBox =
        document.getElementById(
            "chat-box"
        );


    if (!chatBox) {
        return;
    }


    const me =
        String(
            profile.zardaloo_number || ""
        ).trim();


    const other =
        String(
            currentChatNumber || ""
        ).trim();


    chatBox.innerHTML =
        `
        <div class="empty-state">
            در حال دریافت پیام‌ها...
        </div>
        `;


    try {

        let messages = [];


        /*
         * اول تلاش برای دریافت مستقیم
         * گفتگوی دو نفر
         */

        try {

            const url =
                MESSAGES_URL +
                "?user_zardaloo_number=" +
                encodeURIComponent(me) +
                "&other_zardaloo_number=" +
                encodeURIComponent(other);


            const response =
                await fetch(
                    url,
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


            messages =
                extractMessages(
                    data
                );


        } catch (firstError) {

            console.warn(
                "دریافت مستقیم پیام‌ها ناموفق بود:",
                firstError
            );


            /*
             * روش قدیمی
             */

            const fallbackUrl =
                MESSAGES_URL +
                "?zardaloo_number=" +
                encodeURIComponent(me);


            const fallbackResponse =
                await fetch(
                    fallbackUrl,
                    {

                        method: "GET",

                        headers:
                            supabaseHeaders()

                    }
                );


            const fallbackData =
                await readResponse(
                    fallbackResponse
                );


            messages =
                extractMessages(
                    fallbackData
                );


            /*
             * فقط همین مکالمه
             */

            messages =
                messages.filter(
                    message => {

                        const sender =
                            getSenderNumber(
                                message
                            );


                        const receiver =
                            getReceiverNumber(
                                message
                            );


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
                );

        }


        /*
         * مرتب‌سازی
         */

        messages.sort(
            (
                a,
                b
            ) => {

                const aTime =
                    new Date(
                        a.created_at ||
                        a.createdAt ||
                        0
                    ).getTime();


                const bTime =
                    new Date(
                        b.created_at ||
                        b.createdAt ||
                        0
                    ).getTime();


                return (
                    aTime -
                    bTime
                );

            }
        );


        renderMessages(
            messages,
            me
        );


    } catch (error) {

        console.error(
            "خطای دریافت پیام‌ها:",
            error
        );


        chatBox.innerHTML =
            `
            <div class="empty-state">

                دریافت پیام‌ها انجام نشد.

                <br><br>

                ${escapeHtml(
                    error.message
                )}

            </div>
            `;

    }

}


/* =========================================================
   استخراج پیام‌ها
   ========================================================= */

function extractMessages(data) {

    if (Array.isArray(data)) {
        return data;
    }


    if (
        data &&
        Array.isArray(data.messages)
    ) {

        return data.messages;

    }


    if (
        data &&
        Array.isArray(data.data)
    ) {

        return data.data;

    }


    if (
        data &&
        data.data &&
        Array.isArray(
            data.data.messages
        )
    ) {

        return data.data.messages;

    }


    return [];

}


/* =========================================================
   شماره فرستنده
   ========================================================= */

function getSenderNumber(message) {

    return String(
        message.sender_zardaloo_number ||
        message.sender_number ||
        message.sender ||
        ""
    ).trim();

}


/* =========================================================
   شماره گیرنده
   ========================================================= */

function getReceiverNumber(message) {

    return String(
        message.receiver_zardaloo_number ||
        message.receiver_number ||
        message.receiver ||
        ""
    ).trim();

}


/* =========================================================
   متن پیام
   ========================================================= */

function getMessageText(message) {

    return String(
        message.message ||
        message.text ||
        message.content ||
        ""
    );

}


/* =========================================================
   نمایش پیام
   ========================================================= */

function renderMessages(
    messages,
    me
) {

    const chatBox =
        document.getElementById(
            "chat-box"
        );


    if (!chatBox) {
        return;
    }


    if (!messages.length) {

        chatBox.innerHTML =
            `
            <div class="empty-state">
                هنوز پیامی بین شما وجود ندارد.
            </div>
            `;

        return;

    }


    chatBox.innerHTML =
        messages
        .map(
            message => {

                const sender =
                    getSenderNumber(
                        message
                    );


                const text =
                    getMessageText(
                        message
                    );


                const mine =
                    sender === me;


                const rawTime =
                    message.created_at ||
                    message.createdAt ||
                    "";


                let timeText =
                    "";


                if (rawTime) {

                    const date =
                        new Date(
                            rawTime
                        );


                    if (
                        !Number.isNaN(
                            date.getTime()
                        )
                    ) {

                        timeText =
                            date.toLocaleString(
                                "fa-IR",
                                {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                }
                            );

                    }

                }


                return `
                    <div
                        class="chat-message ${
                            mine
                            ? "mine"
                            : "theirs"
                        }"
                    >

                        <div
                            class="chat-message-text"
                        >
                            ${escapeHtml(
                                text
                            )}
                        </div>


                        ${
                            timeText
                            ?
                            `
                            <div
                                class="chat-message-time"
                            >
                                ${escapeHtml(
                                    timeText
                                )}
                            </div>
                            `
                            :
                            ""
                        }

                    </div>
                `;

            }
        )
        .join("");


    chatBox.scrollTop =
        chatBox.scrollHeight;

}


/* =========================================================
   ارسال پیام
   ========================================================= */

async function sendMessage() {

    if (!profile) {

        alert(
            "ابتدا وارد حساب خود شوید."
        );

        return;

    }


    if (!currentChatNumber) {

        alert(
            "ابتدا یک مکالمه انتخاب کن."
        );

        return;

    }


    const input =
        document.getElementById(
            "chat-input"
        );


    if (!input) {
        return;
    }


    const message =
        input.value.trim();


    if (!message) {
        return;
    }


    const sender =
        String(
            profile.zardaloo_number || ""
        ).trim();


    const receiver =
        String(
            currentChatNumber || ""
        ).trim();


    if (sender === receiver) {

        alert(
            "نمی‌توانید برای خودتان پیام بفرستید."
        );

        return;

    }


    try {

        input.disabled = true;


        const response =
            await fetch(
                MESSAGES_URL,
                {

                    method: "POST",

                    headers:
                        supabaseHeaders(),

                    body:
                        JSON.stringify({

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

                        })

                }
            );


        await readResponse(
            response
        );


        input.value = "";


        await loadMessages();


    } catch (error) {

        console.error(
            "خطای ارسال پیام:",
            error
        );


        alert(
            "ارسال پیام انجام نشد:\n" +
            error.message
        );

    } finally {

        input.disabled = false;

        input.focus();

    }

}


/* =========================================================
   ارسال پیام با Enter
   ========================================================= */

function setupChatEnter() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                event.target?.id ===
                "chat-input"
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


/* =========================================================
   گزارش فروشنده
   ========================================================= */

async function submitReport() {

    if (!profile) {

        alert(
            "ابتدا وارد حساب خود شوید."
        );

        return;

    }


    const sellerNumber =
        document.getElementById(
            "report-seller-zardaloo"
        )?.value.trim() ||
        "";


    const reason =
        document.getElementById(
            "report-reason"
        )?.value ||
        "";


    const description =
        document.getElementById(
            "report-description"
        )?.value.trim() ||
        "";


    const status =
        document.getElementById(
            "report-status"
        );


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

        setStatus(
            status,
            "در حال ارسال گزارش..."
        );


        const response =
            await fetch(
                REPORT_URL,
                {

                    method: "POST",

                    headers:
                        supabaseHeaders(),

                    body:
                        JSON.stringify({

                            reporter_zardaloo_number:
                                profile.zardaloo_number,

                            reporter_name:
                                profile.name,

                            reporter_phone:
                                profile.phone,

                            seller_zardaloo_number:
                                sellerNumber,

                            reason:
                                reason,

                            description:
                                description

                        })

                }
            );


        await readResponse(
            response
        );


        setStatus(
            status,
            "گزارش با موفقیت ارسال شد."
        );


        document.getElementById(
            "report-description"
        ).value = "";


    } catch (error) {

        console.error(
            "خطای گزارش:",
            error
        );


        setStatus(
            status,
            "ارسال گزارش انجام نشد: " +
            error.message
        );

    }

}


/* =========================================================
   مدیریت
   ========================================================= */

async function adminLogin() {

    const number =
        document.getElementById(
            "admin-number"
        )?.value.trim() ||
        "";


    const password =
        document.getElementById(
            "admin-password"
        )?.value ||
        "";


    const status =
        document.getElementById(
            "admin-status"
        );


    if (
        number !== ADMIN_NUMBER ||
        password !== ADMIN_PASSWORD
    ) {

        setStatus(
            status,
            "شماره مدیریت یا رمز اشتباه است."
        );

        return;

    }


    adminLoggedIn = true;


    setStatus(
        status,
        "ورود مدیریت موفق بود."
    );


    const panel =
        document.getElementById(
            "admin-panel"
        );


    if (panel) {

        panel.classList.remove(
            "hidden"
        );

    }


    await loadAdminData();

}


/* =========================================================
   داده‌های مدیریت
   ========================================================= */

async function loadAdminData() {

    const productCount =
        document.getElementById(
            "admin-product-count"
        );


    const productBox =
        document.getElementById(
            "admin-products"
        );


    if (productCount) {

        productCount.textContent =
            products.length;

    }


    if (productBox) {

        if (!products.length) {

            productBox.innerHTML =
                `
                <div class="empty-state">
                    کالایی وجود ندارد.
                </div>
                `;

        } else {

            productBox.innerHTML =
                products
                .map(
                    product => `
                        <div class="admin-item">

                            <strong>
                                ${escapeHtml(
                                    product.name ||
                                    "کالا"
                                )}
                            </strong>

                            <span>
                                ${formatPrice(
                                    Number(
                                        product.price || 0
                                    )
                                )}
                                ریال
                            </span>

                        </div>
                    `
                )
                .join("");

        }

    }


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
            SUPABASE_KEY

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


/* =========================================================
   خروج
   ========================================================= */

function logoutZardaloo() {

    profile = null;

    currentChatNumber = "";

    profileImageData = "";

    selectedAvatar = "";


    localStorage.removeItem(
        PROFILE_KEY
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
