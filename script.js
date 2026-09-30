"use strict";

/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://ovqldknqpaiczrddcrxp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_VDZ_tgoMgYRI7K419ieDKw_y29xeXA2";

const PRODUCTS_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/products";

const ADMIN_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/admin-reports";

const REPORT_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/report-seller";

const MESSAGES_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/messages";

const ADMIN_NUMBER = "0994051777";
const ADMIN_PASSWORD = "ERFAN";


/* =========================================================
   LOCAL STORAGE
========================================================= */

const PROFILE_KEY = "zardaloo_profile_v5";
const CART_KEY = "zardaloo_cart_v5";
const DISCOUNT_KEY = "zardaloo_discount_v5";
const ADMIN_KEY = "zardaloo_admin_v5";


/* =========================================================
   DATA
========================================================= */

let profile = {
    name: "",
    phone: "",
    zardalooNumber: "",
    avatar: "👤"
};

let products = [];
let cart = [];
let discountPercent = 0;
let adminLoggedIn = false;


/* =========================================================
   HELPERS
========================================================= */

function $(id) {
    return document.getElementById(id);
}


function safeText(value) {
    return String(value ?? "");
}


function escapeHTML(value) {

    return safeText(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   PROFILE
========================================================= */

function profileIsComplete() {

    return (
        profile.name.trim() !== "" &&
        profile.phone.trim() !== "" &&
        profile.zardalooNumber.trim() !== ""
    );
}


/* ذخیره واقعی پروفایل */

function saveProfile() {

    try {

        localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify(profile)
        );

        return true;

    } catch (error) {

        console.error(
            "PROFILE SAVE ERROR:",
            error
        );

        return false;
    }
}


/* خواندن واقعی پروفایل */

function loadProfile() {

    try {

        const saved =
            localStorage.getItem(PROFILE_KEY);

        if (!saved) {

            profile = {
                name: "",
                phone: "",
                zardalooNumber: "",
                avatar: "👤"
            };

            return false;
        }

        const data =
            JSON.parse(saved);

        profile = {
            name: safeText(data.name),
            phone: safeText(data.phone),
            zardalooNumber:
                safeText(data.zardalooNumber),
            avatar:
                data.avatar ||
                "👤"
        };

        return profileIsComplete();

    } catch (error) {

        console.error(
            "PROFILE LOAD ERROR:",
            error
        );

        return false;
    }
}


/* =========================================================
   AVATAR
========================================================= */

function selectProfile(avatar) {

    profile.avatar = avatar;

    updateAvatarPreview();

}


function updateAvatarPreview() {

    const preview =
        $("profilePreview");

    if (!preview) {
        return;
    }

    preview.innerHTML = "";

    if (
        typeof profile.avatar === "string" &&
        profile.avatar.startsWith("data:image/")
    ) {

        const img =
            document.createElement("img");

        img.src = profile.avatar;

        preview.appendChild(img);

    } else {

        preview.textContent =
            profile.avatar || "👤";
    }
}


/* انتخاب عکس از گالری */

function loadProfileImage(event) {

    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {

        alert("لطفاً یک عکس انتخاب کن.");
        return;
    }

    const reader =
        new FileReader();

    reader.onload = function () {

        resizeProfileImage(
            reader.result
        );
    };

    reader.readAsDataURL(file);
}


/* کوچک کردن عکس برای اینکه localStorage پر نشود */

function resizeProfileImage(source) {

    const img =
        new Image();

    img.onload = function () {

        const maxSize = 500;

        let width =
            img.width;

        let height =
            img.height;

        if (width > maxSize || height > maxSize) {

            const ratio =
                Math.min(
                    maxSize / width,
                    maxSize / height
                );

            width =
                Math.round(width * ratio);

            height =
                Math.round(height * ratio);
        }

        const canvas =
            document.createElement("canvas");

        canvas.width =
            width;

        canvas.height =
            height;

        const ctx =
            canvas.getContext("2d");

        ctx.drawImage(
            img,
            0,
            0,
            width,
            height
        );

        profile.avatar =
            canvas.toDataURL(
                "image/jpeg",
                0.82
            );

        updateAvatarPreview();
    };

    img.src = source;
}


/* =========================================================
   DISPLAY PROFILE
========================================================= */

function renderAvatar(element) {

    if (!element) {
        return;
    }

    element.innerHTML = "";

    if (
        typeof profile.avatar === "string" &&
        profile.avatar.startsWith("data:image/")
    ) {

        const img =
            document.createElement("img");

        img.src =
            profile.avatar;

        element.appendChild(img);

    } else {

        element.textContent =
            profile.avatar || "👤";
    }
}


function updateProfileUI() {

    const name =
        $("homeName");

    const phone =
        $("homePhone");

    const zardaloo =
        $("homeZardaloo");

    if (name) {
        name.textContent =
            profile.name || "---";
    }

    if (phone) {
        phone.textContent =
            profile.phone || "---";
    }

    if (zardaloo) {
        zardaloo.textContent =
            profile.zardalooNumber || "---";
    }


    renderAvatar(
        $("homeProfileImage")
    );

    renderAvatar(
        $("headerProfileImage")
    );


    /* اطلاعات فروشنده در فرم ثبت کالا */

    const sellerName =
        $("sellerName");

    const sellerPhone =
        $("sellerPhone");

    if (sellerName && !sellerName.value) {

        sellerName.value =
            profile.name;
    }

    if (sellerPhone && !sellerPhone.value) {

        sellerPhone.value =
            profile.phone;
    }
}


/* =========================================================
   ENTER ZARDALOO
========================================================= */

function enterZardaloo() {

    const name =
        $("firstName")?.value.trim();

    const phone =
        $("firstPhone")?.value.trim();

    const zardalooNumber =
        $("firstZardaloo")?.value.trim();


    if (!name) {

        alert("لطفاً نام را وارد کن.");
        return;
    }

    if (!phone) {

        alert("لطفاً شماره تماس را وارد کن.");
        return;
    }

    if (!zardalooNumber) {

        alert("لطفاً شماره زردآلو را وارد کن.");
        return;
    }


    profile.name =
        name;

    profile.phone =
        phone;

    profile.zardalooNumber =
        zardalooNumber;


    if (!profile.avatar) {

        profile.avatar =
            "👤";
    }


    const saved =
        saveProfile();

    if (!saved) {

        alert(
            "ذخیره اطلاعات پروفایل انجام نشد."
        );

        return;
    }


    updateProfileUI();


    $("profileSetup")
        ?.classList.add("hidden");

    $("app")
        ?.classList.remove("hidden");


    showPage("home");

    loadProducts();
}


/* =========================================================
   NAVIGATION
========================================================= */

function showPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active"
            );
        });


    const target =
        $(pageName);

    if (target) {

        target.classList.add(
            "active"
        );
    }


    if (pageName === "market") {

        loadProducts();
    }

    if (pageName === "cart") {

        renderCart();
    }

    if (pageName === "home") {

        updateProfileUI();
    }
}


/* =========================================================
   PRODUCTS
========================================================= */

function getProductId(product) {

    return (
        product?.id ??
        product?.product_id ??
        product?.uuid ??
        ""
    );
}


function getProductName(product) {

    return (
        product?.name ??
        product?.product_name ??
        ""
    );
}


function getProductPrice(product) {

    return Number(
        product?.price ??
        product?.product_price ??
        0
    );
}


function getSellerName(product) {

    return (
        product?.seller ??
        product?.seller_name ??
        product?.sellerName ??
        ""
    );
}


function getSellerPhone(product) {

    return (
        product?.phone ??
        product?.seller_phone ??
        product?.sellerPhone ??
        ""
    );
}


function getSellerNumber(product) {

    return (
        product?.zardaloo_number ??
        product?.seller_zardaloo_number ??
        ""
    );
}


function isGiftProduct(product) {

    const value =
        product?.is_gift ??
        product?.isGift ??
        false;

    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number") {
        return value === 1;
    }

    return [
        "true",
        "1",
        "yes",
        "دارد",
        "gift"
    ].includes(
        String(value)
            .trim()
            .toLowerCase()
    );
}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    const container =
        $("products");

    const status =
        $("marketStatus");


    if (status) {

        status.textContent =
            "در حال دریافت کالاها...";
    }


    try {

        const response =
            await fetch(
                PRODUCTS_FUNCTION_URL,
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


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "دریافت کالاها انجام نشد."
            );
        }


        products =
            Array.isArray(data.products)
                ? data.products
                : [];


        renderProducts();


        if (status) {

            status.textContent =
                products.length
                    ? `${products.length} کالا پیدا شد.`
                    : "هنوز کالایی ثبت نشده است.";
        }

    } catch (error) {

        console.error(
            "LOAD PRODUCTS ERROR:",
            error
        );


        if (status) {

            status.textContent =
                "دریافت کالاها انجام نشد: " +
                error.message;
        }
    }
}


/* =========================================================
   FILTER
========================================================= */

function filterProducts() {

    const search =
        $("searchName")
            ?.value
            .trim()
            .toLowerCase() || "";

    const min =
        Number(
            $("minPrice")
                ?.value || 0
        );

    const max =
        Number(
            $("maxPrice")
                ?.value || 0
        );

    const seller =
        $("sellerFilter")
            ?.value
            .trim()
            .toLowerCase() || "";

    const giftFilter =
        $("giftFilter")
            ?.value || "";


    return products.filter(product => {

        const name =
            getProductName(product)
                .toLowerCase();

        const price =
            getProductPrice(product);

        const sellerName =
            getSellerName(product)
                .toLowerCase();

        const gift =
            isGiftProduct(product);


        if (
            search &&
            !name.includes(search)
        ) {
            return false;
        }

        if (
            min > 0 &&
            price < min
        ) {
            return false;
        }

        if (
            max > 0 &&
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
            giftFilter === "yes" &&
            !gift
        ) {
            return false;
        }

        if (
            giftFilter === "no" &&
            gift
        ) {
            return false;
        }

        return true;
    });
}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    const container =
        $("products");

    if (!container) {
        return;
    }


    const filtered =
        filterProducts();


    container.innerHTML = "";


    if (filtered.length === 0) {

        container.innerHTML =
            `<div class="card">
                کالایی پیدا نشد.
            </div>`;

        return;
    }


    filtered.forEach(product => {

        const name =
            getProductName(product);

        const price =
            getProductPrice(product);

        const seller =
            getSellerName(product);

        const sellerPhone =
            getSellerPhone(product);

        const sellerNumber =
            getSellerNumber(product);

        const gift =
            isGiftProduct(product);


        const card =
            document.createElement(
                "div"
            );

        card.className =
            "product-card";


        let html = `

            <h3>
                ${escapeHTML(name)}
            </h3>

            <p class="product-price">
                ${price.toLocaleString("fa-IR")}
                ریال
            </p>

            <p>
                فروشنده:
                ${escapeHTML(seller)}
            </p>

            <p>
                شماره زردآلو:
                ${escapeHTML(sellerNumber)}
            </p>

            <p>
                تلفن:
                ${escapeHTML(sellerPhone)}
            </p>
        `;


        if (gift) {

            html += `

                <p class="gift-label">
                    🎁 هدیه
                </p>

                <p>
                    ${escapeHTML(
                        product.gift_description ||
                        ""
                    )}
                </p>
            `;
        }


        const productId =
            getProductId(product);


        html += `

            <button
                class="yellow-btn"
                onclick="addToCart('${escapeHTML(String(productId))}')"
            >
                افزودن به سبد
            </button>
        `;


        if (
            String(
                sellerNumber
            ) ===
            String(
                profile.zardalooNumber
            )
        ) {

            html += `

                <button
                    class="danger-btn"
                    onclick="deleteProduct('${escapeHTML(String(productId))}')"
                >
                    حذف کالا
                </button>
            `;
        }


        card.innerHTML =
            html;

        container.appendChild(
            card
        );
    });
}


/* =========================================================
   REGISTER PRODUCT
========================================================= */

function toggleGiftDescription() {

    const checkbox =
        $("isGift");

    const box =
        $("giftDescriptionBox");


    if (!checkbox || !box) {
        return;
    }


    box.classList.toggle(
        "hidden",
        !checkbox.checked
    );
}


async function registerProduct() {

    const name =
        $("productName")
            ?.value
            .trim() || "";

    const price =
        $("productPrice")
            ?.value
            .trim() || "";

    const seller =
        $("sellerName")
            ?.value
            .trim() ||
        profile.name;

    const phone =
        $("sellerPhone")
            ?.value
            .trim() ||
        profile.phone;

    const description =
        $("productDescription")
            ?.value
            .trim() || "";

    const isGift =
        $("isGift")
            ?.checked || false;

    const giftDescription =
        $("giftDescription")
            ?.value
            .trim() || "";

    const message =
        $("registerMessage");


    if (!name) {

        message.textContent =
            "نام کالا را وارد کن.";

        return;
    }


    if (
        !price ||
        Number(price) <= 0
    ) {

        message.textContent =
            "قیمت کالا را وارد کن.";

        return;
    }


    if (!seller) {

        message.textContent =
            "نام فروشنده مشخص نیست.";

        return;
    }


    if (!phone) {

        message.textContent =
            "شماره تماس فروشنده مشخص نیست.";

        return;
    }


    if (
        !profile.zardalooNumber
    ) {

        message.textContent =
            "شماره زردآلو پروفایل مشخص نیست.";

        return;
    }


    if (
        isGift &&
        !giftDescription
    ) {

        message.textContent =
            "توضیحات هدیه را وارد کن.";

        return;
    }


    const button =
        $("registerProductButton");

    if (button) {

        button.disabled =
            true;

        button.textContent =
            "در حال ثبت...";
    }


    /*
       این فیلدها دقیقاً با Edge Function
       که فرستادی هماهنگ هستند.
    */

    const productData = {

        name:
            name,

        price:
            price,

        seller:
            seller,

        zardaloo_number:
            profile.zardalooNumber,

        phone:
            phone,

        description:
            description,

        is_gift:
            isGift,

        gift_description:
            isGift
                ? giftDescription
                : ""
    };


    try {

        const response =
            await fetch(
                PRODUCTS_FUNCTION_URL,
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

                    body:
                        JSON.stringify(
                            productData
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "ثبت کالا انجام نشد."
            );
        }


        message.textContent =
            "کالا با موفقیت ثبت شد. ✅";


        $("productName").value =
            "";

        $("productPrice").value =
            "";

        $("productDescription").value =
            "";

        $("isGift").checked =
            false;

        $("giftDescription").value =
            "";

        toggleGiftDescription();


        await loadProducts();


        setTimeout(
            () => {
                showPage("market");
            },
            500
        );


    } catch (error) {

        console.error(
            "REGISTER PRODUCT ERROR:",
            error
        );


        message.textContent =
            "ثبت کالا انجام نشد: " +
            error.message;


    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "ثبت کالا";
        }
    }
}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(id) {

    if (!id) {
        return;
    }


    const confirmed =
        confirm(
            "آیا از حذف این کالا مطمئنی؟"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                PRODUCTS_FUNCTION_URL +
                "?id=" +
                encodeURIComponent(id),

                {
                    method: "DELETE",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "حذف کالا انجام نشد."
            );
        }


        await loadProducts();


    } catch (error) {

        alert(
            "حذف کالا انجام نشد: " +
            error.message
        );
    }
}


/* =========================================================
   CART
========================================================= */

function saveCart() {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );
}


function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                CART_KEY
            );

        cart =
            saved
                ? JSON.parse(saved)
                : [];

        if (!Array.isArray(cart)) {
            cart = [];
        }

    } catch {

        cart = [];
    }
}


function addToCart(id) {

    const product =
        products.find(
            p =>
                String(
                    getProductId(p)
                ) ===
                String(id)
        );


    if (!product) {

        alert(
            "کالا پیدا نشد."
        );

        return;
    }


    cart.push(product);

    saveCart();

    alert(
        "کالا به سبد خرید اضافه شد. 🛒"
    );
}


function renderCart() {

    const container =
        $("cartItems");

    const summary =
        $("cartSummary");


    if (!container) {
        return;
    }


    container.innerHTML = "";


    let originalTotal = 0;


    cart.forEach(
        (product, index) => {

            const price =
                getProductPrice(product);

            originalTotal +=
                price;


            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "cart-item";


            item.innerHTML = `

                <h3>
                    ${escapeHTML(
                        getProductName(product)
                    )}
                </h3>

                <p>
                    قیمت:
                    ${price.toLocaleString("fa-IR")}
                    ریال
                </p>

                <button
                    class="danger-btn"
                    onclick="removeFromCart(${index})"
                >
                    حذف
                </button>
            `;


            container.appendChild(
                item
            );
        }
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


    if (summary) {

        summary.innerHTML = `

            <p>
                مجموع قیمت:
                <strong>
                    ${originalTotal.toLocaleString("fa-IR")}
                    ریال
                </strong>
            </p>

            <p>
                درصد تخفیف:
                <strong>
                    ${discountPercent.toLocaleString("fa-IR")}٪
                </strong>
            </p>

            <p>
                مبلغ تخفیف:
                <strong>
                    ${discountAmount.toLocaleString("fa-IR")}
                    ریال
                </strong>
            </p>

            <p>
                مبلغ نهایی:
                <strong>
                    ${finalTotal.toLocaleString("fa-IR")}
                    ریال
                </strong>
            </p>
        `;
    }
}


function removeFromCart(index) {

    cart.splice(
        index,
        1
    );

    saveCart();

    renderCart();
}


/* =========================================================
   DISCOUNT
========================================================= */

function applyCartDiscount() {

    const input =
        $("cartDiscountCode");

    const message =
        $("cartDiscountMessage");


    const code =
        input?.value
            .trim()
            .toUpperCase() || "";


    const codes = {

        "ZARDALOO10": 10,
        "ZARDALOO20": 20,
        "50": 50,
        "100": 100
    };


    if (
        Object.prototype.hasOwnProperty.call(
            codes,
            code
        )
    ) {

        discountPercent =
            codes[code];


        localStorage.setItem(
            DISCOUNT_KEY,
            String(discountPercent)
        );


        if (message) {

            message.textContent =
                `تخفیف ${discountPercent}٪ اعمال شد.`;
        }


        renderCart();

    } else {

        discountPercent =
            0;

        localStorage.setItem(
            DISCOUNT_KEY,
            "0"
        );


        if (message) {

            message.textContent =
                "کد تخفیف نامعتبر است.";
        }


        renderCart();
    }
}


function loadDiscount() {

    const value =
        Number(
            localStorage.getItem(
                DISCOUNT_KEY
            ) || 0
        );

    discountPercent =
        Number.isFinite(value)
            ? value
            : 0;
}


/* =========================================================
   MESSAGES
========================================================= */

async function sendMessage() {

    const receiver =
        $("messageReceiver")
            ?.value
            .trim() || "";

    const text =
        $("messageText")
            ?.value
            .trim() || "";

    const status =
        $("messageSendStatus");


    if (!receiver) {

        status.textContent =
            "شماره زردآلو گیرنده را وارد کن.";

        return;
    }


    if (!text) {

        status.textContent =
            "متن پیام را وارد کن.";

        return;
    }


    try {

        const response =
            await fetch(
                MESSAGES_FUNCTION_URL,
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

                    body:
                        JSON.stringify({

                            sender:
                                profile.zardalooNumber,

                            receiver:
                                receiver,

                            message:
                                text
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "ارسال پیام انجام نشد."
            );
        }


        status.textContent =
            "پیام ارسال شد. ✅";


        $("messageText").value =
            "";


    } catch (error) {

        status.textContent =
            "ارسال پیام انجام نشد: " +
            error.message;
    }
}


/* =========================================================
   REPORT
========================================================= */

async function submitReport() {

    const sellerNumber =
        $("reportSellerNumber")
            ?.value
            .trim() || "";

    const reason =
        $("reportReason")
            ?.value || "";

    const description =
        $("reportDescription")
            ?.value
            .trim() || "";

    const message =
        $("reportMessage");


    if (!sellerNumber) {

        message.textContent =
            "شماره زردآلو فروشنده را وارد کن.";

        return;
    }


    try {

        const response =
            await fetch(
                REPORT_FUNCTION_URL,
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

                    body:
                        JSON.stringify({

                            reporter_zardaloo_number:
                                profile.zardalooNumber,

                            seller_zardaloo_number:
                                sellerNumber,

                            reason:
                                reason,

                            description:
                                description
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "ارسال گزارش انجام نشد."
            );
        }


        message.textContent =
            "گزارش ارسال شد. ✅";


    } catch (error) {

        message.textContent =
            "ارسال گزارش انجام نشد: " +
            error.message;
    }
}


/* =========================================================
   ADMIN
========================================================= */

function adminLogin() {

    const number =
        $("adminNumber")
            ?.value
            .trim() || "";

    const password =
        $("adminPassword")
            ?.value || "";

    const message =
        $("adminMessage");


    if (
        number === ADMIN_NUMBER &&
        password === ADMIN_PASSWORD
    ) {

        adminLoggedIn =
            true;

        localStorage.setItem(
            ADMIN_KEY,
            "true"
        );


        $("adminPanel")
            ?.classList.remove(
                "hidden"
            );


        message.textContent =
            "ورود موفق بود. ✅";


        loadAdminProducts();


    } else {

        message.textContent =
            "شماره یا رمز مدیریت اشتباه است.";
    }
}


function loadAdminProducts() {

    if (!adminLoggedIn) {
        return;
    }


    const content =
        $("adminContent");

    if (!content) {
        return;
    }


    content.innerHTML =
        "<h3>کالاها</h3>";


    products.forEach(product => {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "card";


        div.innerHTML = `

            <strong>
                ${escapeHTML(
                    getProductName(product)
                )}
            </strong>

            <p>
                قیمت:
                ${getProductPrice(product).toLocaleString("fa-IR")}
                ریال
            </p>

            <p>
                فروشنده:
                ${escapeHTML(
                    getSellerName(product)
                )}
            </p>
        `;


        content.appendChild(
            div
        );
    });


    $("adminProductCount")
        .textContent =
        String(products.length);
}


function loadAdminReports() {

    if (!adminLoggedIn) {
        return;
    }

    $("adminContent").innerHTML =
        "<h3>بخش گزارش‌ها</h3><p>برای دریافت گزارش‌ها، Edge Function مدیریت باید پاسخ‌دهی کند.</p>";
}


function loadAdminCarts() {

    if (!adminLoggedIn) {
        return;
    }

    $("adminContent").innerHTML =
        `<h3>سبدهای خرید</h3>
         <p>تعداد کالاهای موجود در سبدهای این مرورگر: ${cart.length}</p>`;
}


function loadAdminUsers() {

    if (!adminLoggedIn) {
        return;
    }

    $("adminContent").innerHTML =
        `<h3>کاربر فعلی</h3>
         <p>نام: ${escapeHTML(profile.name)}</p>
         <p>شماره تماس: ${escapeHTML(profile.phone)}</p>
         <p>شماره زردآلو: ${escapeHTML(profile.zardalooNumber)}</p>`;

    $("adminUserCount")
        .textContent =
        "1";
}


function clearAllCart() {

    if (!adminLoggedIn) {
        return;
    }


    cart = [];

    saveCart();

    renderCart();

    $("adminCartCount")
        .textContent =
        "0";
}


/* =========================================================
   FILTER EVENTS
========================================================= */

function setupFilters() {

    [
        "searchName",
        "minPrice",
        "maxPrice",
        "sellerFilter",
        "giftFilter"
    ].forEach(id => {

        const element =
            $(id);

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
   INITIALIZATION
========================================================= */

function initializeApp() {

    loadProfile();

    loadCart();

    loadDiscount();


    /*
       اگر پروفایل قبلاً ذخیره شده باشد،
       دیگر فرم ثبت‌نام نشان داده نمی‌شود.
    */

    if (profileIsComplete()) {

        $("profileSetup")
            ?.classList.add(
                "hidden"
            );

        $("app")
            ?.classList.remove(
                "hidden"
            );

        updateProfileUI();

        showPage("home");

    } else {

        $("profileSetup")
            ?.classList.remove(
                "hidden"
            );

        $("app")
            ?.classList.add(
                "hidden"
            );

        updateAvatarPreview();
    }


    setupFilters();

    toggleGiftDescription();

    $("adminPanel")
        ?.classList.add(
            "hidden"
        );
}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


/* =========================================================
   GLOBAL FUNCTIONS
   برای onclick های HTML
========================================================= */

window.selectProfile =
    selectProfile;

window.loadProfileImage =
    loadProfileImage;

window.enterZardaloo =
    enterZardaloo;

window.showPage =
    showPage;

window.toggleGiftDescription =
    toggleGiftDescription;

window.registerProduct =
    registerProduct;

window.loadProducts =
    loadProducts;

window.deleteProduct =
    deleteProduct;

window.addToCart =
    addToCart;

window.removeFromCart =
    removeFromCart;

window.applyCartDiscount =
    applyCartDiscount;

window.sendMessage =
    sendMessage;

window.submitReport =
    submitReport;

window.adminLogin =
    adminLogin;

window.loadAdminProducts =
    load
