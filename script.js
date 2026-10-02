"use strict";

/* =========================================================
   زردآلو | script.js
   سیستم پیام‌رسان دوطرفه
   ========================================================= */


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
   LocalStorage
   ========================================================= */

const PROFILE_KEY =
    "zardaloo_profile_final_v11";

const CART_KEY =
    "zardaloo_cart_final_v11";

const DISCOUNT_KEY =
    "zardaloo_discount_final_v11";


/* =========================================================
   مدیریت
   ========================================================= */

const ADMIN_NUMBER = "0994051777";
const ADMIN_PASSWORD = "ERFAN";


/* =========================================================
   متغیرهای اصلی
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
   شروع برنامه
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    loadLocalData();

    setupFilters();

    if (profile) {
        showApp();
    } else {
        showWelcome();
    }

});


/* =========================================================
   LocalStorage
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
            "خطا در خواندن سبد خرید:",
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
   هدرهای Supabase
   ========================================================= */

function supabaseHeaders() {

    return {

        "Content-Type": "application/json",

        "apikey":
            SUPABASE_KEY,

        "Authorization":
            "Bearer " + SUPABASE_KEY

    };

}


/* =========================================================
   خواندن پاسخ API
   ========================================================= */

async function readResponse(response) {

    const text =
        await response.text();

    let data = {};

    try {

        data =
            text ? JSON.parse(text) : {};

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
   نمایش صفحه خوش‌آمدگویی
   ========================================================= */

function showWelcome() {

    const welcome =
        document.getElementById("welcomeScreen");

    const profileScreen =
        document.getElementById("profileScreen");

    const app =
        document.getElementById("app");

    if (welcome) {
        welcome.classList.remove("hidden");
    }

    if (profileScreen) {
        profileScreen.classList.add("hidden");
    }

    if (app) {
        app.classList.add("hidden");
    }

}


/* =========================================================
   باز کردن فرم پروفایل
   ========================================================= */

function openProfileFromWelcome() {

    const welcome =
        document.getElementById("welcomeScreen");

    const profileScreen =
        document.getElementById("profileScreen");

    if (welcome) {
        welcome.classList.add("hidden");
    }

    if (profileScreen) {
        profileScreen.classList.remove("hidden");
    }

}


/* =========================================================
   ورود به بازار از صفحه اول
   ========================================================= */

function openMarketFromWelcome() {

    if (!profile) {

        openProfileFromWelcome();

        return;
    }

    showApp();

    openPage("market");

}


/* =========================================================
   ورود کاربر
   ========================================================= */

function enterZardaloo() {

    const nameInput =
        document.getElementById("profileName");

    const phoneInput =
        document.getElementById("profilePhone");

    const numberInput =
        document.getElementById("profileZardalooNumber");


    const name =
        nameInput ?
        nameInput.value.trim() :
        "";

    const phone =
        phoneInput ?
        phoneInput.value.trim() :
        "";

    const zardalooNumber =
        numberInput ?
        numberInput.value.trim() :
        "";


    if (!name) {

        alert("لطفاً نام خود را وارد کنید.");

        return;
    }


    if (!phone) {

        alert(
            "لطفاً شماره تماس خود را وارد کنید."
        );

        return;
    }


    if (!zardalooNumber) {

        alert(
            "لطفاً شماره زردآلو را وارد کنید."
        );

        return;
    }


    profile = {

        name: name,

        phone: phone,

        zardaloo_number:
            zardalooNumber,

        profile_image:
            profileImageData || "",

        avatar:
            selectedAvatar || ""

    };


    saveProfile();

    showApp();

}


/* =========================================================
   نمایش برنامه
   ========================================================= */

function showApp() {

    const welcome =
        document.getElementById("welcomeScreen");

    const profileScreen =
        document.getElementById("profileScreen");

    const app =
        document.getElementById("app");


    if (welcome) {
        welcome.classList.add("hidden");
    }

    if (profileScreen) {
        profileScreen.classList.add("hidden");
    }

    if (app) {
        app.classList.remove("hidden");
    }


    updateProfileUI();

    renderCart();

    openPage("home");

    loadProducts();

}


/* =========================================================
   نمایش اطلاعات کاربر
   ========================================================= */

function updateProfileUI() {

    if (!profile) {
        return;
    }


    const nameElements =
        document.querySelectorAll(
            "[data-profile-name]"
        );

    nameElements.forEach(element => {

        element.textContent =
            profile.name || "";

    });


    const numberElements =
        document.querySelectorAll(
            "[data-profile-number]"
        );

    numberElements.forEach(element => {

        element.textContent =
            profile.zardaloo_number || "";

    });


    const phoneElements =
        document.querySelectorAll(
            "[data-profile-phone]"
        );

    phoneElements.forEach(element => {

        element.textContent =
            profile.phone || "";

    });


    const profileImage =
        document.getElementById(
            "profileImagePreview"
        );

    if (
        profileImage &&
        profile.profile_image
    ) {

        profileImage.src =
            profile.profile_image;

    }

}


/* =========================================================
   تغییر صفحه
   ========================================================= */

function openPage(pageName) {

    const pages =
        document.querySelectorAll(
            ".page"
        );

    pages.forEach(page => {

        page.classList.add("hidden");

    });


    const target =
        document.getElementById(
            pageName
        );

    if (target) {

        target.classList.remove("hidden");

    }


    const navButtons =
        document.querySelectorAll(
            "[data-page]"
        );

    navButtons.forEach(button => {

        button.classList.remove("active");

        if (
            button.dataset.page ===
            pageName
        ) {

            button.classList.add("active");

        }

    });


    if (pageName === "market") {

        renderProducts(products);

    }


    if (pageName === "cart") {

        renderCart();

    }


    if (pageName === "messages") {

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
        event.target.files?.[0];

    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload = function () {

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


    reader.readAsDataURL(file);

}


/* =========================================================
   انتخاب آواتار
   ========================================================= */

function chooseAvatar(avatar) {

    selectedAvatar = avatar;

}


/* =========================================================
   انتخاب تصویر کالا
   ========================================================= */

function handleProductImage(event) {

    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload = function () {

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


    reader.readAsDataURL(file);

}


/* =========================================================
   ثبت کالا
   ========================================================= */

async function registerProduct() {

    if (!profile) {

        alert(
            "ابتدا وارد حساب خود شوید."
        );

        return;
    }


    const nameInput =
        document.getElementById(
            "productName"
        );

    const priceInput =
        document.getElementById(
            "productPrice"
        );

    const sellerInput =
        document.getElementById(
            "productSeller"
        );

    const phoneInput =
        document.getElementById(
            "productSellerPhone"
        );

    const zardalooInput =
        document.getElementById(
            "productSellerZardaloo"
        );

    const descriptionInput =
        document.getElementById(
            "productDescription"
        );

    const giftInput =
        document.getElementById(
            "productGift"
        );


    const name =
        nameInput?.value.trim() || "";

    const price =
        Number(
            priceInput?.value || 0
        );

    const seller =
        sellerInput?.value.trim() ||
        profile.name;

    const sellerPhone =
        phoneInput?.value.trim() ||
        profile.phone;

    const sellerZardaloo =
        zardalooInput?.value.trim() ||
        profile.zardaloo_number;

    const description =
        descriptionInput?.value.trim() ||
        "";

    const gift =
        giftInput?.checked ||
        false;


    if (!name) {

        alert(
            "نام کالا را وارد کنید."
        );

        return;
    }


    if (!price || price < 0) {

        alert(
            "قیمت کالا را درست وارد کنید."
        );

        return;
    }


    try {

        const payload = {

            name: name,

            price: price,

            seller: seller,

            seller_phone:
                sellerPhone,

            seller_number:
                sellerZardaloo,

            seller_zardaloo_number:
                sellerZardaloo,

            description:
                description,

            gift: gift,

            image_url:
                productImageData || "",

            owner_zardaloo_number:
                profile.zardaloo_number

        };


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


        alert(
            "کالا با موفقیت ثبت شد. ✅"
        );


        productImageData = "";


        if (nameInput) {
            nameInput.value = "";
        }

        if (priceInput) {
            priceInput.value = "";
        }

        if (descriptionInput) {
            descriptionInput.value = "";
        }


        await loadProducts();

        openPage("market");


    } catch (error) {

        console.error(error);

        alert(
            "ثبت کالا انجام نشد:\n" +
            error.message
        );

    }

}


/* =========================================================
   دریافت کالاها
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
            await readResponse(response);


        if (Array.isArray(data)) {

            products = data;

        } else if (
            Array.isArray(data.products)
        ) {

            products =
                data.products;

        } else if (
            Array.isArray(data.data)
        ) {

            products =
                data.data;

        } else {

            products = [];

        }


        renderProducts(products);


    } catch (error) {

        console.error(
            "خطا در دریافت کالاها:",
            error
        );

    }

}


/* =========================================================
   نمایش کالاها
   ========================================================= */

function renderProducts(list) {

    const container =
        document.getElementById(
            "productsGrid"
        );

    if (!container) {
        return;
    }


    if (!list || list.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                هنوز کالایی ثبت نشده است.
            </div>
        `;

        return;
    }


    container.innerHTML =
        list.map(product => {

            const id =
                product.id || "";

            const name =
                product.name || "بدون نام";

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

            const phone =
                product.seller_phone ||
                "";

            const description =
                product.description ||
                "";

            const image =
                product.image_url ||
                "";


            return `
                <article class="product-card">

                    ${
                        image
                        ?
                        `<img
                            src="${escapeAttribute(image)}"
                            alt="${escapeAttribute(name)}"
                            class="product-image"
                        >`
                        :
                        `<div class="product-image empty-image">
                            بدون تصویر
                        </div>`
                    }

                    <div class="product-content">

                        <h3>
                            ${escapeHtml(name)}
                        </h3>

                        <div class="product-price">
                            ${formatPrice(price)} ریال
                        </div>

                        <div>
                            فروشنده:
                            ${escapeHtml(seller)}
                        </div>

                        <div>
                            شماره زردآلو:
                            ${escapeHtml(sellerNumber)}
                        </div>

                        ${
                            phone
                            ?
                            `<div>
                                تلفن:
                                ${escapeHtml(phone)}
                            </div>`
                            :
                            ""
                        }

                        ${
                            description
                            ?
                            `<p>
                                ${escapeHtml(description)}
                            </p>`
                            :
                            ""
                        }

                        <div class="product-actions">

                            <button
                                type="button"
                                onclick="addToCart('${escapeAttribute(id)}')"
                            >
                                افزودن به سبد
                            </button>

                            <button
                                type="button"
                                onclick="startConversationWith('${escapeAttribute(sellerNumber)}')"
                            >
                                پیام به فروشنده
                            </button>

                        </div>

                    </div>

                </article>
            `;

        }).join("");

}


/* =========================================================
   سبد خرید
   ========================================================= */

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


    alert(
        "کالا به سبد خرید اضافه شد. 🛒"
    );

}


/* =========================================================
   ذخیره سبد
   ========================================================= */

function saveCart() {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}


/* =========================================================
   حذف از سبد
   ========================================================= */

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
   اعمال کد تخفیف
   ========================================================= */

function applyDiscountCode() {

    const input =
        document.getElementById(
            "discountCode"
        );


    const code =
        input?.value.trim() ||
        "";


    if (code === "50") {

        discountPercent = 50;

    } else if (code === "100") {

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
        String(discountPercent)
    );


    renderCart();


    alert(
        `تخفیف ${discountPercent}% اعمال شد. 🎉`
    );

}


/* =========================================================
   نمایش سبد
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
        cart.map(item => {

            const price =
                Number(
                    item.price || 0
                );


            const discounted =
                Math.round(
                    price *
                    (1 -
                    discountPercent / 100)
                );


            return `
                <div class="cart-item">

                    <div>

                        <strong>
                            ${escapeHtml(
                                item.name || "کالا"
                            )}
                        </strong>

                        <div>
                            قیمت اصلی:
                            ${formatPrice(price)}
                            ریال
                        </div>

                        <div>
                            قیمت با تخفیف:
                            ${formatPrice(discounted)}
                            ریال
                        </div>

                    </div>

                    <button
                        type="button"
                        onclick="removeFromCart('${escapeAttribute(item.id)}')"
                    >
                        حذف
                    </button>

                </div>
            `;

        }).join("");


    updateCartSummary();

}


/* =========================================================
   محاسبه سبد
   ========================================================= */

function updateCartSummary() {

    const originalTotal =
        cart.reduce(
            (sum, item) =>
                sum +
                Number(item.price || 0),
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


    const originalElement =
        document.getElementById(
            "cartOriginalTotal"
        );

    const discountElement =
        document.getElementById(
            "cartDiscountAmount"
        );

    const finalElement =
        document.getElementById(
            "cartFinalTotal"
        );

    const percentElement =
        document.getElementById(
            "cartDiscountPercent"
        );


    if (originalElement) {

        originalElement.textContent =
            formatPrice(originalTotal) +
            " ریال";

    }


    if (discountElement) {

        discountElement.textContent =
            formatPrice(discountAmount) +
            " ریال";

    }


    if (finalElement) {

        finalElement.textContent =
            formatPrice(finalTotal) +
            " ریال";

    }


    if (percentElement) {

        percentElement.textContent =
            discountPercent + "%";

    }

}


/* =========================================================
   شروع مکالمه با شماره مشخص
   ========================================================= */

function startConversationWith(number) {

    if (!profile) {

        alert(
            "ابتدا وارد حساب خود شوید."
        );

        return;
    }


    if (!number) {

        alert(
            "شماره زردآلو فروشنده موجود نیست."
        );

        return;
    }


    if (
        String(number) ===
        String(profile.zardaloo_number)
    ) {

        alert(
            "نمی‌توانید با خودتان مکالمه ایجاد کنید."
        );

        return;
    }


    currentChatNumber =
        String(number).trim();


    const receiverInput =
        document.getElementById(
            "receiverZardalooNumber"
        );


    if (receiverInput) {

        receiverInput.value =
            currentChatNumber;

    }


    openPage("messages");

    loadMessages();

}


/* =========================================================
   دکمه «مکالمه جدید»
   فقط شماره را می‌گیرد
   ========================================================= */

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
            "ابتدا شماره زردآلو طرف مقابل را وارد کنید."
        );

        return;
    }


    if (
        number ===
        String(profile.zardaloo_number)
    ) {

        alert(
            "نمی‌توانید با خودتان مکالمه ایجاد کنید."
        );

        return;
    }


    currentChatNumber =
        number;


    loadMessages();

}


/* =========================================================
   دریافت پیام‌های یک مکالمه
   =========================================================

   مهم:
   پیام‌ها فقط متعلق به یک طرف نیستند.

   حالت اول:
   من → طرف مقابل

   حالت دوم:
   طرف مقابل → من

   هر دو باید نمایش داده شوند.
   ========================================================= */

async function loadMessages() {

    if (
        !profile ||
        !profile.zardaloo_number ||
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


    chatBox.innerHTML = `
        <div class="empty-state">
            در حال دریافت پیام‌ها...
        </div>
    `;


    try {

        /*
         * شماره کاربر فعلی
         */
        const myNumber =
            String(
                profile.zardaloo_number
            ).trim();


        /*
         * شماره طرف مقابل
         */
        const otherNumber =
            String(
                currentChatNumber
            ).trim();


        /*
         * درخواست به Edge Function
         *
         * هر دو شماره ارسال می‌شوند
         * تا بک‌اند بتواند کل مکالمه را
         * در هر دو جهت پیدا کند.
         */

        const url =
            MESSAGES_URL +
            "?user_zardaloo_number=" +
            encodeURIComponent(myNumber) +
            "&other_zardaloo_number=" +
            encodeURIComponent(otherNumber);


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
            await readResponse(response);


        let messages = [];


        if (Array.isArray(data)) {

            messages =
                data;

        } else if (
            Array.isArray(data.messages)
        ) {

            messages =
                data.messages;

        } else if (
            Array.isArray(data.data)
        ) {

            messages =
                data.data;

        }


        /*
         * مرتب‌سازی از قدیمی به جدید
         */

        messages.sort(
            (a, b) => {

                return (
                    new Date(
                        a.created_at || 0
                    ).getTime()
                    -
                    new Date(
                        b.created_at || 0
                    ).getTime()
                );

            }
        );


        if (!messages.length) {

            chatBox.innerHTML = `
                <div class="empty-state">
                    هنوز پیامی در این مکالمه وجود ندارد.
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


                    /*
                     * اگر فرستنده خودمان باشد،
                     * پیام سمت خودمان نمایش داده می‌شود.
                     */

                    const mine =
                        sender === myNumber;


                    return `
                        <div
                            class="message-row ${
                                mine
                                ? "mine"
                                : "theirs"
                            }"
                        >

                            <div class="message-bubble">

                                ${escapeHtml(text)}

                            </div>

                        </div>
                    `;

                }
            ).join("");


        /*
         * اسکرول به آخر مکالمه
         */

        chatBox.scrollTop =
            chatBox.scrollHeight;


    } catch (error) {

        console.error(
            "خطا در دریافت پیام‌ها:",
            error
        );


        chatBox.innerHTML = `
            <div class="empty-state">
                دریافت پیام‌ها ناموفق بود.
                <br><br>
                ${escapeHtml(
                    error.message
                )}
            </div>
        `;

    }

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


    const senderNumber =
        String(
            profile.zardaloo_number
        ).trim();


    const receiverNumber =
        String(
            currentChatNumber
        ).trim();


    if (
        senderNumber ===
        receiverNumber
    ) {

        alert(
            "نمی‌توانید به خودتان پیام بفرستید."
        );

        return;
    }


    try {

        const payload = {

            sender_zardaloo_number:
                senderNumber,

            receiver_zardaloo_number:
                receiverNumber,

            sender_number:
                profile.phone || "",

            receiver_number:
                "",

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
                        JSON.stringify(payload)

                }
            );


        await readResponse(response);


        input.value = "";


        /*
         * بعد از ارسال، کل مکالمه
         * دوباره از سرور خوانده می‌شود.
         */

        await loadMessages();


    } catch (error) {

        console.error(
            "خطا در ارسال پیام:",
            error
        );


        alert(
            "ارسال پیام انجام نشد:\n" +
            error.message
        );

    }

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


    const sellerInput =
        document.getElementById(
            "reportSellerNumber"
        );

    const reasonInput =
        document.getElementById(
            "reportReason"
        );

    const descriptionInput =
        document.getElementById(
            "reportDescription"
        );


    const sellerNumber =
        sellerInput?.value.trim() ||
        "";

    const reason =
        reasonInput?.value.trim() ||
        "";

    const description =
        descriptionInput?.value.trim() ||
        "";


    if (!sellerNumber) {

        alert(
            "شماره زردآلو فروشنده را وارد کنید."
        );

        return;
    }


    if (!reason) {

        alert(
            "دلیل گزارش را انتخاب کنید."
        );

        return;
    }


    try {

        const payload = {

            seller_number:
                sellerNumber,

            seller_zardaloo_number:
                sellerNumber,

            reporter_number:
                profile.phone || "",

            reporter_zardaloo_number:
                profile.zardaloo_number,

            reason:
                reason,

            description:
                description

        };


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


        alert(
            "گزارش با موفقیت ثبت شد. ✅"
        );


        if (sellerInput) {
            sellerInput.value = "";
        }

        if (descriptionInput) {
            descriptionInput.value = "";
        }


    } catch (error) {

        console.error(error);

        alert(
            "ثبت گزارش انجام نشد:\n" +
            error.message
        );

    }

}


/* =========================================================
   مدیریت
   ========================================================= */

function adminLogin() {

    const numberInput =
        document.getElementById(
            "adminNumber"
        );

    const passwordInput =
        document.getElementById(
            "adminPassword"
        );


    const number =
        numberInput?.value.trim() ||
        "";

    const password =
        passwordInput?.value ||
        "";


    if (
        number === ADMIN_NUMBER &&
        password === ADMIN_PASSWORD
    ) {

        adminLoggedIn = true;

        alert(
            "ورود مدیر موفق بود. ✅"
        );

        loadAdminData();

    } else {

        alert(
            "شماره یا رمز مدیریت اشتباه است."
        );

    }

}


/* =========================================================
   دریافت اطلاعات مدیریت
   ========================================================= */

async function loadAdminData() {

    if (!adminLoggedIn) {
        return;
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
            await readResponse(response);


        console.log(
            "اطلاعات مدیریت:",
            data
        );


    } catch (error) {

        console.error(
            "خطای مدیریت:",
            error
        );

    }

}


/* =========================================================
   فیلترهای بازار
   ========================================================= */

function setupFilters() {

    const nameFilter =
        document.getElementById(
            "marketSearch"
        );

    const minFilter =
        document.getElementById(
            "minPrice"
        );

    const maxFilter =
        document.getElementById(
            "maxPrice"
        );

    const sellerFilter =
        document.getElementById(
            "sellerFilter"
        );

    const giftFilter =
        document.getElementById(
            "giftFilter"
        );


    const apply =
        () => {

            const name =
                nameFilter?.value
                    .trim()
                    .toLowerCase() ||
                "";

            const min =
                Number(
                    minFilter?.value || 0
                );

            const max =
                Number(
                    maxFilter?.value || 0
                );

            const seller =
                sellerFilter?.value
                    .trim()
                    .toLowerCase() ||
                "";

            const gift =
                giftFilter?.checked ||
                false;


            const filtered =
                products.filter(
                    product => {

                        const productName =
                            String(
                                product.name || ""
                            ).toLowerCase();


                        const productSeller =
                            String(
                                product.seller || ""
                            ).toLowerCase();


                        const price =
                            Number(
                                product.price || 0
                            );


                        const productGift =
                            Boolean(
                                product.gift
                            );


                        if (
                            name &&
                            !productName.includes(name)
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
                            !productSeller.includes(
                                seller
                            )
                        ) {

                            return false;

                        }


                        if (
                            gift &&
                            !productGift
                        ) {

                            return false;

                        }


                        return true;

                    }
                );


            renderProducts(filtered);

        };


    [
        nameFilter,
        minFilter,
        maxFilter,
        sellerFilter,
        giftFilter
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
   فرمت قیمت
   ========================================================= */

function formatPrice(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "fa-IR"
    );

}


/* =========================================================
   جلوگیری از HTML Injection
   ========================================================= */

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


/* =========================================================
   جلوگیری از خراب شدن attribute
   ========================================================= */

function escapeAttribute(value) {

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    );

}


/* =========================================================
   پاک کردن حساب
   ========================================================= */

function logoutZardaloo() {

    profile = null;

    currentChatNumber = "";

    localStorage.removeItem(
        PROFILE_KEY
    );

    showWelcome();

}


/* =========================================================
   قرار دادن توابع در window
   تا HTML بتواند آن‌ها را صدا بزند
   ========================================================= */

window.openProfileFromWelcome =
    openProfileFromWelcome;

window.openMarketFromWelcome =
    openMarketFromWelcome;

window.enterZardaloo =
    enterZardaloo;

window.openPage =
    openPage;

window.handleProfileImage =
    handleProfileImage;

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

window.submitReport =
    submitReport;

window.adminLogin =
    adminLogin;

window.logoutZardaloo =
    logoutZardaloo;
