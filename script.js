"use strict";

/* =========================
   SUPABASE
========================= */

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


/* =========================
   ADMIN
========================= */

const ADMIN_NUMBER =
    "0994051777";

const ADMIN_PASSWORD =
    "ERFAN";


/* =========================
   STORAGE
========================= */

const PROFILE_KEY =
    "zardaloo_profile_final_v8";

const CART_KEY =
    "zardaloo_cart_final_v8";

const DISCOUNT_KEY =
    "zardaloo_discount_final_v8";


/* =========================
   DATA
========================= */

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


/* =========================
   HELPER
========================= */

function el(id) {
    return document.getElementById(id);
}


/* =========================
   ESCAPE
========================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================
   PROFILE SAVE
========================= */

function saveProfile() {

    try {

        localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify(profile)
        );

        return true;

    } catch (error) {

        console.error(error);

        return false;
    }
}


/* =========================
   PROFILE LOAD
========================= */

function loadProfile() {

    try {

        let saved =
            localStorage.getItem(
                PROFILE_KEY
            );


        /*
           پشتیبانی از نسخه‌های قبلی
        */

        if (!saved) {

            const oldKeys = [
                "zardaloo_profile_v5",
                "zardaloo_profile_v3",
                "zardaloo_profile_final_v2"
            ];

            for (
                const key of oldKeys
            ) {

                const oldData =
                    localStorage.getItem(
                        key
                    );

                if (oldData) {

                    saved =
                        oldData;

                    break;
                }
            }
        }


        if (!saved) {
            return false;
        }


        const data =
            JSON.parse(saved);


        profile = {

            name:
                String(
                    data.name ?? ""
                ).trim(),

            phone:
                String(
                    data.phone ?? ""
                ).trim(),

            zardalooNumber:
                String(
                    data.zardalooNumber ??
                    data.zardaloo_number ??
                    ""
                ).trim(),

            avatar:
                data.avatar ||
                "👤"
        };


        return (
            profile.name !== "" &&
            profile.phone !== "" &&
            profile.zardalooNumber !== ""
        );


    } catch (error) {

        console.error(error);

        return false;
    }
}


/* =========================
   AVATAR EMOJI
========================= */

function selectProfile(avatar) {

    profile.avatar =
        avatar;

    showProfilePreview();
}


/* =========================
   IMAGE UPLOAD
========================= */

function loadProfileImage(event) {

    const file =
        event.target.files?.[0];


    if (!file) {
        return;
    }


    if (
        !file.type.startsWith("image/")
    ) {

        alert(
            "لطفاً یک عکس انتخاب کن."
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        function(e) {

            compressImage(
                e.target.result
            );
        };


    reader.readAsDataURL(file);
}


/* =========================
   COMPRESS IMAGE
========================= */

function compressImage(source) {

    const image =
        new Image();


    image.onload =
        function() {

            const maxSize =
                500;

            let width =
                image.width;

            let height =
                image.height;


            if (
                width > maxSize ||
                height > maxSize
            ) {

                const ratio =
                    Math.min(
                        maxSize / width,
                        maxSize / height
                    );

                width =
                    Math.round(
                        width * ratio
                    );

                height =
                    Math.round(
                        height * ratio
                    );
            }


            const canvas =
                document.createElement(
                    "canvas"
                );


            canvas.width =
                width;

            canvas.height =
                height;


            const context =
                canvas.getContext(
                    "2d"
                );


            context.drawImage(
                image,
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


            showProfilePreview();
        };


    image.src =
        source;
}


/* =========================
   PROFILE PREVIEW
========================= */

function showProfilePreview() {

    const preview =
        el("profilePreview");


    if (!preview) {
        return;
    }


    preview.innerHTML =
        "";


    if (
        typeof profile.avatar === "string" &&
        profile.avatar.startsWith(
            "data:image/"
        )
    ) {

        const image =
            document.createElement(
                "img"
            );

        image.src =
            profile.avatar;

        preview.appendChild(
            image
        );

    } else {

        preview.textContent =
            profile.avatar ||
            "👤";
    }
}


/* =========================
   AVATAR RENDER
========================= */

function renderAvatar(container) {

    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (
        typeof profile.avatar === "string" &&
        profile.avatar.startsWith(
            "data:image/"
        )
    ) {

        const image =
            document.createElement(
                "img"
            );

        image.src =
            profile.avatar;

        container.appendChild(
            image
        );

    } else {

        container.textContent =
            profile.avatar ||
            "👤";
    }
}


/* =========================
   UPDATE PROFILE UI
========================= */

function updateProfileUI() {

    if (el("accountName")) {

        el("accountName")
            .textContent =
            profile.name || "---";
    }


    if (el("accountPhone")) {

        el("accountPhone")
            .textContent =
            profile.phone || "---";
    }


    if (el("accountZardaloo")) {

        el("accountZardaloo")
            .textContent =
            profile.zardalooNumber || "---";
    }


    renderAvatar(
        el("headerProfileImage")
    );


    renderAvatar(
        el("accountProfileImage")
    );


    /*
       فرم ثبت کالا
    */

    if (el("sellerName")) {

        el("sellerName").value =
            profile.name;
    }


    if (el("sellerPhone")) {

        el("sellerPhone").value =
            profile.phone;
    }
}


/* =========================
   ENTER
========================= */

function enterZardaloo() {

    const name =
        el("firstName")
            ?.value
            .trim() || "";


    const phone =
        el("firstPhone")
            ?.value
            .trim() || "";


    const zardalooNumber =
        el("firstZardaloo")
            ?.value
            .trim() || "";


    if (!name) {

        alert(
            "لطفاً نام را وارد کن."
        );

        return;
    }


    if (!phone) {

        alert(
            "لطفاً شماره تماس را وارد کن."
        );

        return;
    }


    if (!zardalooNumber) {

        alert(
            "لطفاً شماره زردآلو را وارد کن."
        );

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


    if (!saveProfile()) {

        alert(
            "ذخیره اطلاعات انجام نشد."
        );

        return;
    }


    /*
       مخفی کردن ورود
    */

    const setup =
        el("profileSetup");

    const app =
        el("app");


    setup.style.display =
        "none";

    app.style.display =
        "block";


    updateProfileUI();

    showPage("home");
}


/* =========================
   PAGE
========================= */

function showPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(
            function(page) {

                page.classList.remove(
                    "active"
                );
            }
        );


    const page =
        el(pageName);


    if (!page) {
        return;
    }


    page.classList.add(
        "active"
    );


    if (
        pageName === "account"
    ) {

        updateProfileUI();
    }


    if (
        pageName === "market"
    ) {

        loadProducts();
    }


    if (
        pageName === "cart"
    ) {

        renderCart();
    }
}


/* =========================
   PRODUCT HELPERS
========================= */

function productId(product) {

    return (
        product?.id ??
        product?.product_id ??
        ""
    );
}


function productName(product) {

    return (
        product?.name ??
        ""
    );
}


function productPrice(product) {

    return Number(
        product?.price ??
        0
    );
}


function sellerName(product) {

    return (
        product?.seller ??
        ""
    );
}


function sellerPhone(product) {

    return (
        product?.phone ??
        ""
    );
}


function sellerNumber(product) {

    return (
        product?.zardaloo_number ??
        ""
    );
}


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

    const status =
        el("marketStatus");


    if (status) {

        status.textContent =
            "در حال دریافت کالاها...";
    }


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


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "دریافت کالاها انجام نشد."
            );
        }


        products =
            Array.isArray(
                data.products
            )
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

        console.error(error);


        if (status) {

            status.textContent =
                "خطا در دریافت کالاها: " +
                error.message;
        }
    }
}


/* =========================
   FILTER
========================= */

function filteredProducts() {

    const search =
        el("searchName")
            ?.value
            .trim()
            .toLowerCase() || "";


    const min =
        Number(
            el("minPrice")
                ?.value || 0
        );


    const max =
        Number(
            el("maxPrice")
                ?.value || 0
        );


    const seller =
        el("sellerFilter")
            ?.value
            .trim()
            .toLowerCase() || "";


    const gift =
        el("giftFilter")
            ?.value || "";


    return products.filter(
        function(product) {

            const name =
                productName(product)
                    .toLowerCase();


            const price =
                productPrice(product);


            const sellerText =
                sellerName(product)
                    .toLowerCase();


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
                !sellerText.includes(
                    seller
                )
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
        }
    );
}


/* =========================
   RENDER PRODUCTS
========================= */

function renderProducts() {

    const container =
        el("products");


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const list =
        filteredProducts();


    if (!list.length) {

        container.innerHTML =
            `<div class="card">
                کالایی پیدا نشد.
            </div>`;

        return;
    }


    list.forEach(
        function(product) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "product-card";


            const id =
                productId(product);


            const price =
                productPrice(product);


            card.innerHTML = `

                <h3>
                    ${escapeHTML(
                        productName(product)
                    )}
                </h3>

                <p class="product-price">
                    ${price.toLocaleString("fa-IR")}
                    ریال
                </p>

                <p>
                    فروشنده:
                    ${escapeHTML(
                        sellerName(product)
                    )}
                </p>

                <p>
                    شماره زردآلو:
                    ${escapeHTML(
                        sellerNumber(product)
                    )}
                </p>

                <p>
                    تلفن:
                    ${escapeHTML(
                        sellerPhone(product)
                    )}
                </p>

                ${
                    product.is_gift
                    ? `
                        <p class="gift">
                            🎁 هدیه
                        </p>
                    `
                    : ""
                }

                <button
                    class="yellow-button"
                    onclick="addToCart('${String(id)}')"
                >
                    افزودن به سبد
                </button>
            `;


            if (
                String(
                    sellerNumber(product)
                ) ===
                String(
                    profile.zardalooNumber
                )
            ) {

                const deleteButton =
                    document.createElement(
                        "button"
                    );


                deleteButton.className =
                    "red-button";


                deleteButton.textContent =
                    "حذف کالا";


                deleteButton.onclick =
                    function() {

                        deleteProduct(
                            id
                        );
                    };


                card.appendChild(
                    deleteButton
                );
            }


            container.appendChild(
                card
            );
        }
    );
}


/* =========================
   REGISTER PRODUCT
========================= */

function toggleGiftDescription() {

    const checkbox =
        el("isGift");

    const box =
        el("giftDescriptionBox");


    if (!checkbox || !box) {
        return;
    }


    box.classList.toggle(
        "hidden",
        !checkbox.checked
    );
}


async function registerProduct() {

    const message =
        el("registerMessage");


    const name =
        el("productName")
            ?.value
            .trim() || "";


    const price =
        el("productPrice")
            ?.value
            .trim() || "";


    const seller =
        el("sellerName")
            ?.value
            .trim() ||
        profile.name;


    const phone =
        el("sellerPhone")
            ?.value
            .trim() ||
        profile.phone;


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


    if (!seller || !phone) {

        message.textContent =
            "اطلاعات فروشنده کامل نیست.";

        return;
    }


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

                    body:
                        JSON.stringify({

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
                                el("productDescription")
                                    ?.value
                                    .trim() || "",

                            is_gift:
                                el("isGift")
                                    ?.checked || false,

                            gift_description:
                                el("giftDescription")
                                    ?.value
                                    .trim() || ""
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "ثبت کالا انجام نشد."
            );
        }


        message.textContent =
            "کالا با موفقیت ثبت شد. ✅";


        el("productName").value =
            "";

        el("productPrice").value =
            "";

        el("productDescription").value =
            "";

        el("giftDescription").value =
            "";

        el("isGift").checked =
            false;


        toggleGiftDescription();


    } catch (error) {

        message.textContent =
            "ثبت کالا انجام نشد: " +
            error.message;
    }
}


/* =========================
   DELETE
========================= */

async function deleteProduct(id) {

    if (!id) {
        return;
    }


    if (
        !confirm(
            "آیا از حذف این کالا مطمئنی؟"
        )
    ) {

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


/* =========================
   CART
========================= */

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
            function(item) {

                return String(
                    productId(item)
                ) ===
                String(id);
            }
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


function removeFromCart(index) {

    cart.splice(
        index,
        1
    );

    saveCart();

    renderCart();
}


function renderCart() {

    const container =
        el("cartItems");

    const summary =
        el("cartSummary");


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    let total =
        0;


    cart.forEach(
        function(product, index) {

            const price =
                productPrice(product);


            total +=
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
                        productName(product)
                    )}
                </h3>

                <p>
                    قیمت:
                    ${price.toLocaleString("fa-IR")}
                    ریال
                </p>

                <button
                    class="red-button"
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
            total *
            discountPercent /
            100
        );


    const finalPrice =
        total -
        discountAmount;


    summary.innerHTML = `

        <p>
            قیمت کل:
            ${total.toLocaleString("fa-IR")}
            ریال
        </p>

        <p>
            تخفیف:
            ${discountPercent}٪
        </p>

        <p>
            مبلغ تخفیف:
            ${discountAmount.toLocaleString("fa-IR")}
            ریال
        </p>

        <p>
            قیمت نهایی:
            <strong>
                ${finalPrice.toLocaleString("fa-IR")}
                ریال
            </strong>
        </p>
    `;
}


/* =========================
   DISCOUNT
========================= */

function applyCartDiscount() {

    const code =
        el("cartDiscountCode")
            ?.value
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
            String(
                discountPercent
            )
        );


        el("cartDiscountMessage")
            .textContent =
            `تخفیف ${discountPercent}٪ اعمال شد.`;

    } else {

        discountPercent =
            0;


        el("cartDiscountMessage")
            .textContent =
            "کد تخفیف نامعتبر است.";
    }


    renderCart();
}


/* =========================
   MESSAGES
========================= */

async function sendMessage() {

    const receiver =
        el("messageReceiver")
            ?.value
            .trim() || "";


    const text =
        el("messageText")
            ?.value
            .trim() || "";


    const status =
        el("messageSendStatus");


    if (!receiver || !text) {

        status.textContent =
            "شماره گیرنده و پیام را وارد کن.";

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

        el("messageText").value =
            "";


    } catch (error) {

        status.textContent =
            "ارسال پیام انجام نشد: " +
            error.message;
    }
}


/* =========================
   REPORT
========================= */

async function submitReport() {

    const seller =
        el("reportSellerNumber")
            ?.value
            .trim() || "";


    const reason =
        el("reportReason")
            ?.value || "";


    const description =
        el("reportDescription")
            ?.value
            .trim() || "";


    const message =
        el("reportMessage");


    if (!seller) {

        message.textContent =
            "شماره زردآلو فروشنده را وارد کن.";

        return;
    }


    try {

        const response =
            await fetch(
                REPORT_URL,
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
                                seller,

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


/* =========================
   ADMIN
========================= */

function adminLogin() {

    const number =
        el("adminNumber")
            ?.value
            .trim() || "";


    const password =
        el("adminPassword")
            ?.value || "";


    if (
        number === ADMIN_NUMBER &&
        password === ADMIN_PASSWORD
    ) {

        adminLoggedIn =
            true;


        el("adminPanel")
            .classList.remove(
                "hidden"
            );


        el("adminMessage")
            .textContent =
            "ورود مدیریت موفق بود. ✅";


        loadAdminProducts();

    } else {

        el("adminMessage")
            .textContent =
            "شماره یا رمز مدیریت اشتباه است.";
    }
}


function loadAdminProducts() {

    if (!adminLoggedIn) {
        return;
    }


    el("adminProductCount")
        .textContent =
        String(
            products.length
        );


    const content =
        el("adminContent");


    content.innerHTML =
        "";


    products.forEach(
        function(product) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "card";


            card.innerHTML = `

                <strong>
                    ${escapeHTML(
                        productName(product)
                    )}
                </strong>

                <p>
                    فروشنده:
                    ${escapeHTML(
                        sellerName(product)
                    )}
                </p>

                <p>
                    قیمت:
                    ${productPrice(product).toLocaleString("fa-IR")}
                    ریال
                </p>
            `;


            content.appendChild(
                card
            );
        }
    );
}


function loadAdminReports() {

    if (!adminLoggedIn) {
        return;
    }


    el("adminContent")
        .innerHTML =
        "<p>گزارش‌ها از بخش مدیریت گزارش‌ها دریافت می‌شوند.</p>";
}


/* =========================
   FILTER EVENTS
========================= */

function setupFilters() {

    const ids = [
        "searchName",
        "minPrice",
        "maxPrice",
        "sellerFilter",
        "giftFilter"
    ];


    ids.forEach(
        function(id) {

            const input =
                el(id);


            if (!input) {
                return;
            }


            input.addEventListener(
                "input",
                renderProducts
            );


            input.addEventListener(
                "change",
                renderProducts
            );
        }
    );
}


/* =========================
   START
========================= */

function initializeApp() {

    const hasProfile =
        loadProfile();


    loadCart();


    const savedDiscount =
        Number(
            localStorage.getItem(
                DISCOUNT_KEY
            ) || 0
        );


    discountPercent =
        Number.isFinite(
            savedDiscount
        )
            ? savedDiscount
            : 0;


    showProfilePreview();


    if (hasProfile) {

        el("profileSetup")
            .style.display =
            "none";


        el("app")
            .style.display =
            "block";


        updateProfileUI();

        showPage("home");

    } else {

        el("profileSetup")
            .style.display =
            "flex";


        el("app")
            .style.display =
            "none";
    }


    setupFilters();

    toggleGiftDescription();
}


/* =========================
   DOM READY
========================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


/* =========================
   GLOBAL
========================= */

window.selectProfile =
    selectProfile;

window.loadProfileImage =
    loadProfileImage;

window.enterZardaloo =
    enterZardaloo;

window.showPage =
    showPage;

window.registerProduct =
    registerProduct;

window.toggleGiftDescription =
    toggleGiftDescription;

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
    loadAdminProducts;

window.loadAdminReports =
    loadAdminReports;
