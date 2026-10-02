"use strict";

/* =========================================================
   زردآلو
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
   حافظه محلی
   ========================================================= */

const PROFILE_KEY =
    "zardaloo_profile_final_v11";

const OLD_PROFILE_KEY =
    "zardaloo_profile_final_v10";

const CART_KEY =
    "zardaloo_cart_final_v11";

const OLD_CART_KEY =
    "zardaloo_cart_final_v10";

const DISCOUNT_KEY =
    "zardaloo_discount_final_v11";


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
            "زردآلو: JavaScript اجرا شد."
        );

        loadLocalData();

        setupFilters();

        if (profile) {

            showApp();

        } else {

            showWelcome();

        }

    }
);


/* =========================================================
   خواندن اطلاعات قبلی
   ========================================================= */

function loadLocalData() {

    /*
     * اول نسخه جدید
     */
    let savedProfile =
        localStorage.getItem(
            PROFILE_KEY
        );


    /*
     * اگر نبود، نسخه قبلی
     */
    if (!savedProfile) {

        savedProfile =
            localStorage.getItem(
                OLD_PROFILE_KEY
            );

    }


    if (savedProfile) {

        try {

            profile =
                JSON.parse(
                    savedProfile
                );

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

        savedCart =
            localStorage.getItem(
                OLD_CART_KEY
            );

    }


    if (savedCart) {

        try {

            cart =
                JSON.parse(
                    savedCart
                );

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
   ورود کاربر
   ========================================================= */

function enterZardaloo() {

    console.log(
        "دکمه ورود زردآلو زده شد."
    );


    const nameInput =
        document.getElementById(
            "profileName"
        );

    const phoneInput =
        document.getElementById(
            "profilePhone"
        );

    const numberInput =
        document.getElementById(
            "profileZardalooNumber"
        );


    /*
     * اگر HTML از ID متفاوت استفاده کرده باشد،
     * فعلاً پیام واضح نشان می‌دهیم.
     */

    if (
        !nameInput ||
        !phoneInput ||
        !numberInput
    ) {

        console.error(
            "یکی از فیلدهای ورود در HTML پیدا نشد.",
            {
                profileName: !!nameInput,
                profilePhone: !!phoneInput,
                profileZardalooNumber:
                    !!numberInput
            }
        );


        alert(
            "خطا در فرم ورود: فیلدهای فرم با JavaScript هماهنگ نیستند."
        );

        return;
    }


    const name =
        nameInput.value.trim();

    const phone =
        phoneInput.value.trim();

    const zardalooNumber =
        numberInput.value.trim();


    if (!name) {

        alert(
            "لطفاً نام خود را وارد کنید."
        );

        nameInput.focus();

        return;
    }


    if (!phone) {

        alert(
            "لطفاً شماره تماس خود را وارد کنید."
        );

        phoneInput.focus();

        return;
    }


    if (!zardalooNumber) {

        alert(
            "لطفاً شماره زردآلو را وارد کنید."
        );

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


    /*
     * ذخیره
     */

    saveProfile();


    /*
     * ورود
     */

    showApp();


    console.log(
        "ورود موفق:",
        profile
    );

}


/* =========================================================
   صفحه خوش‌آمدگویی
   ========================================================= */

function showWelcome() {

    const welcome =
        document.getElementById(
            "welcomeScreen"
        );

    const profileScreen =
        document.getElementById(
            "profileScreen"
        );

    const app =
        document.getElementById(
            "app"
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
            "welcomeScreen"
        );

    const profileScreen =
        document.getElementById(
            "profileScreen"
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

}


/* =========================================================
   ورود مستقیم به بازار
   ========================================================= */

function openMarketFromWelcome() {

    if (!profile) {

        openProfileFromWelcome();

        return;
    }


    showApp();

    openPage(
        "market"
    );

}


/* =========================================================
   نمایش برنامه
   ========================================================= */

function showApp() {

    const welcome =
        document.getElementById(
            "welcomeScreen"
        );

    const profileScreen =
        document.getElementById(
            "profileScreen"
        );

    const app =
        document.getElementById(
            "app"
        );


    if (!app) {

        console.error(
            "عنصر #app در index.html پیدا نشد."
        );

        alert(
            "خطا: بخش اصلی برنامه (#app) در HTML پیدا نشد."
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

    openPage(
        "home"
    );


    /*
     * دریافت کالاها بدون اینکه
     * ورود کاربر خراب شود.
     */

    loadProducts();

}


/* =========================================================
   اطلاعات کاربر
   ========================================================= */

function updateProfileUI() {

    if (!profile) {
        return;
    }


    document
        .querySelectorAll(
            "[data-profile-name]"
        )
        .forEach(
            element => {

                element.textContent =
                    profile.name || "";

            }
        );


    document
        .querySelectorAll(
            "[data-profile-number]"
        )
        .forEach(
            element => {

                element.textContent =
                    profile.zardaloo_number || "";

            }
        );


    document
        .querySelectorAll(
            "[data-profile-phone]"
        )
        .forEach(
            element => {

                element.textContent =
                    profile.phone || "";

            }
        );


    const image =
        document.getElementById(
            "profileImagePreview"
        );


    if (
        image &&
        profile.profile_image
    ) {

        image.src =
            profile.profile_image;

    }

}


/* =========================================================
   تغییر صفحه
   ========================================================= */

function openPage(pageName) {

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
            pageName
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


    document
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );


                if (
                    button.dataset.page ===
                    pageName
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            }
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

            loadMessages();

        }

    }

}


/* =========================================================
   انتخاب تصویر پروفایل
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
                    "profileImagePreview"
                );


            if (preview) {

                preview.src =
                    profileImageData;

            }

        };


    reader.readAsDataURL(
        file
    );

}


/* =========================================================
   آواتار
   ========================================================= */

function chooseAvatar(avatar) {

    selectedAvatar =
        avatar;

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
                    "productImagePreview"
                );


            if (preview) {

                preview.src =
                    productImageData;

                preview.classList.remove(
                    "hidden"
                );

            }

        };


    reader.readAsDataURL(
        file
    );

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


    cart.push(product);

    saveCart();

    renderCart();

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


/* =========================================================
   سبد
   ========================================================= */

function renderCart() {

    const container =
        document.getElementById(
            "cartItems"
        );


    if (!container) {
        return;
    }


    if (!cart.length) {

        container.innerHTML = `
            <div class="empty-state">
                سبد خرید شما خالی است.
            </div>
        `;

        updateCartSummary();

        return;
    }


    container.innerHTML =
        cart.map(
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
                                ${formatPrice(price)}
                                ریال
                            </p>

                            <p>
                                قیمت با تخفیف:
                                ${formatPrice(discounted)}
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
            (sum, item) =>
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


    const original =
        document.getElementById(
            "cartOriginalTotal"
        );

    const discount =
        document.getElementById(
            "cartDiscountAmount"
        );

    const final =
        document.getElementById(
            "cartFinalTotal"
        );

    const percent =
        document.getElementById(
            "cartDiscountPercent"
        );


    if (original) {

        original.textContent =
            formatPrice(
                originalTotal
            ) + " ریال";

    }


    if (discount) {

        discount.textContent =
            formatPrice(
                discountAmount
            ) + " ریال";

    }


    if (final) {

        final.textContent =
            formatPrice(
                finalTotal
            ) + " ریال";

    }


    if (percent) {

        percent.textContent =
            discountPercent + "%";

    }

}


/* =========================================================
   تخفیف
   ========================================================= */

function applyDiscountCode() {

    const input =
        document.getElementById(
            "discountCode"
        );


    const code =
        input?.value.trim() || "";


    if (code === "50") {

        discountPercent = 50;

    } else if (
        code === "100"
    ) {

        discountPercent = 100;

    } else {

        discountPercent = 0;

        alert(
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


/* =========================================================
   کالاها
   ========================================================= */

async function loadProducts() {

    try {

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


        if (Array.isArray(data)) {

            products =
                data;

        } else if (
            Array.isArray(
                data.products
            )
        ) {

            products =
                data.products;

        } else if (
            Array.isArray(
                data.data
            )
        ) {

            products =
                data.data;

        } else {

            products = [];

        }


        renderProducts(
            products
        );


    } catch (error) {

        console.error(
            "خطای کالاها:",
            error
        );

    }

}


function renderProducts(list) {

    const container =
        document.getElementById(
            "productsGrid"
        );


    if (!container) {
        return;
    }


    if (!list.length) {

        container.innerHTML = `
            <div class="empty-state">
                هنوز کالایی ثبت نشده است.
            </div>
        `;

        return;
    }


    container.innerHTML =
        list.map(
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


                return `
                    <article class="product-card">

                        ${
                            product.image_url
                            ?
                            `<img
                                src="${escapeAttribute(
                                    product.image_url
                                )}"
                                class="product-image"
                                alt="${escapeAttribute(
                                    name
                                )}"
                            >`
                            :
                            `<div class="product-image">
                                بدون تصویر
                            </div>`
                        }

                        <div class="product-info">

                            <h3>
                                ${escapeHtml(
                                    name
                                )}
                            </h3>

                            <div class="product-price">
                                ${formatPrice(
                                    price
                                )}
                                ریال
                            </div>

                            <div class="product-meta">

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

                            <div class="product-actions">

                                <button
                                    class="add-cart-button"
                                    onclick="addToCart('${escapeAttribute(id)}')"
                                >
                                    افزودن به سبد
                                </button>

                                <button
                                    class="secondary-button"
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


    if (
        other ===
        String(
            profile.zardaloo_number
        ).trim()
    ) {

        alert(
            "نمی‌توانید با خودتان مکالمه کنید."
        );

        return;
    }


    currentChatNumber =
        other;


    const input =
        document.getElementById(
            "receiverZardalooNumber"
        );


    if (input) {

        input.value =
            other;

    }


    openPage(
        "messages"
    );


    loadMessages();

}


function startConversation() {

    if (!profile) {

        alert(
            "ابتدا وارد حساب خود شوید."
        );

        return;
    }


    const input =
        document.getElementById(
            "receiverZardalooNumber"
        );


    const number =
        input?.value.trim() ||
        "";


    if (!number) {

        alert(
            "شماره زردآلو طرف مقابل را وارد کنید."
        );

        return;
    }


    startConversationWith(
        number
    );

}


/* =========================================================
   پیام‌ها
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
            "chatBox"
        );


    if (!chatBox) {
        return;
    }


    const me =
        String(
            profile.zardaloo_number
        ).trim();


    const other =
        String(
            currentChatNumber
        ).trim();


    chatBox.innerHTML = `
        <div class="empty-state">
            در حال دریافت پیام‌ها...
        </div>
    `;


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


        let messages = [];


        if (Array.isArray(data)) {

            messages =
                data;

        } else if (
            Array.isArray(
                data.messages
            )
        ) {

            messages =
                data.messages;

        } else if (
            Array.isArray(
                data.data
            )
        ) {

            messages =
                data.data;

        }


        messages.sort(
            (a, b) =>
                new Date(
                    a.created_at || 0
                ) -
                new Date(
                    b.created_at || 0
                )
        );


        if (!messages.length) {

            chatBox.innerHTML = `
                <div class="empty-state">
                    هنوز پیامی وجود ندارد.
                </div>
            `;

            return;
        }


        chatBox.innerHTML =
            messages.map(
                message => {

                    const sender =
                        String(
                            message.sender_zardaloo_number ||
                            message.sender_number ||
                            ""
                        ).trim();


                    const text =
                        message.message ||
                        message.text ||
                        "";


                    const mine =
                        sender === me;


                    return `
                        <div class="chat-message ${
                            mine
                            ? "mine"
                            : "theirs"
                        }">

                            ${escapeHtml(
                                text
                            )}

                        </div>
                    `;

                }
            ).join("");


        chatBox.scrollTop =
            chatBox.scrollHeight;


    } catch (error) {

        console.error(
            "خطای پیام‌رسان:",
            error
        );


        chatBox.innerHTML = `
            <div class="empty-state">
                خطا در دریافت پیام‌ها.
                <br><br>
                ${escapeHtml(
                    error.message
                )}
            </div>
        `;

    }

}


async function sendMessage() {

    if (
        !profile ||
        !currentChatNumber
    ) {

        alert(
            "ابتدا یک مکالمه انتخاب کنید."
        );

        return;
    }


    const input =
        document.getElementById(
            "chatInput"
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
            profile.zardaloo_number
        ).trim();


    const receiver =
        String(
            currentChatNumber
        ).trim();


    try {

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
            "خطای ارسال:",
            error
        );


        alert(
            "ارسال پیام انجام نشد:\n" +
            error.message
        );

    }

}


/* =========================================================
   فیلترها
   ========================================================= */

function setupFilters() {

    const ids = [
        "marketSearch",
        "minPrice",
        "maxPrice",
        "sellerFilter",
        "giftFilter"
    ];


    const elements =
        ids
            .map(
                id =>
                    document.getElementById(id)
            )
            .filter(Boolean);


    function applyFilters() {

        const search =
            document
                .getElementById(
                    "marketSearch"
                )
                ?.value
                .trim()
                .toLowerCase() ||
            "";


        const min =
            Number(
                document
                    .getElementById(
                        "minPrice"
                    )
                    ?.value || 0
            );


        const max =
            Number(
                document
                    .getElementById(
                        "maxPrice"
                    )
                    ?.value || 0
            );


        const seller =
            document
                .getElementById(
                    "sellerFilter"
                )
                ?.value
                .trim()
                .toLowerCase() ||
            "";


        const gift =
            document
                .getElementById(
                    "giftFilter"
                )
                ?.checked ||
            false;


        const filtered =
            products.filter(
                product => {

                    const name =
                        String(
                            product.name || ""
                        ).toLowerCase();


                    const sellerName =
                        String(
                            product.seller || ""
                        ).toLowerCase();


                    const price =
                        Number(
                            product.price || 0
                        );


                    if (
                        search &&
                        !name.includes(
                            search
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


                    if (
                        gift &&
                        !product.gift
                    ) {
                        return false;
                    }


                    return true;

                }
            );


        renderProducts(
            filtered
        );

    }


    elements.forEach(
        element => {

            element.addEventListener(
                "input",
                applyFilters
            );

            element.addEventListener(
                "change",
                applyFilters
            );

        }
    );

}


/* =========================================================
   ابزارها
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


async function readResponse(response) {

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

    localStorage.removeItem(
        PROFILE_KEY
    );

    localStorage.removeItem(
        OLD_PROFILE_KEY
    );

    showWelcome();

}


/* =========================================================
   اتصال به HTML
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

window.openPage =
    openPage;

window.handleProfileImage =
    handleProfileImage;

window.chooseAvatar =
    chooseAvatar;

window.handleProductImage =
    handleProductImage;

window.loadProducts =
    loadProducts;

window.addToCart =
    addToCart;

window.removeFromCart =
    removeFromCart;

window.applyDiscountCode =
    applyDiscountCode;

window.startConversation =
    startConversation;

window.startConversationWith =
    startConversationWith;

window.loadMessages =
    loadMessages;

window.sendMessage =
    sendMessage;

window.logoutZardaloo =
    logoutZardaloo;
