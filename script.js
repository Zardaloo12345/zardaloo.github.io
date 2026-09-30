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

const ADMIN_NUMBER =
    "0994051777";

const ADMIN_PASSWORD =
    "ERFAN";


/* =========================================================
   LOCAL STORAGE
========================================================= */

const PROFILE_STORAGE_KEY =
    "zardaloo_profile_final";

const CART_STORAGE_KEY =
    "zardaloo_cart_final";

const DISCOUNT_STORAGE_KEY =
    "zardaloo_discount_final";


/* =========================================================
   VARIABLES
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
   SHORTCUT
========================================================= */

function el(id) {
    return document.getElementById(id);
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   PROFILE - SAVE
========================================================= */

function saveProfile() {

    try {

        localStorage.setItem(
            PROFILE_STORAGE_KEY,
            JSON.stringify(profile)
        );

        return true;

    } catch (error) {

        console.error(
            "Profile save error:",
            error
        );

        return false;
    }
}


/* =========================================================
   PROFILE - LOAD
========================================================= */

function loadProfile() {

    try {

        const saved =
            localStorage.getItem(
                PROFILE_STORAGE_KEY
            );

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

            name:
                String(
                    data.name ?? ""
                ),

            phone:
                String(
                    data.phone ?? ""
                ),

            zardalooNumber:
                String(
                    data.zardalooNumber ?? ""
                ),

            avatar:
                data.avatar ||
                "👤"
        };


        return isProfileComplete();

    } catch (error) {

        console.error(
            "Profile load error:",
            error
        );

        return false;
    }
}


/* =========================================================
   PROFILE COMPLETE
========================================================= */

function isProfileComplete() {

    return (
        profile.name.trim() !== "" &&
        profile.phone.trim() !== "" &&
        profile.zardalooNumber.trim() !== ""
    );
}


/* =========================================================
   SELECT EMOJI PROFILE
========================================================= */

function selectProfile(value) {

    profile.avatar =
        value;

    showProfilePreview();
}


/* =========================================================
   PROFILE IMAGE UPLOAD
========================================================= */

function loadProfileImage(event) {

    const file =
        event.target.files &&
        event.target.files[0];


    if (!file) {
        return;
    }


    if (!file.type.startsWith("image/")) {

        alert(
            "لطفاً یک فایل تصویری انتخاب کن."
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload = function(e) {

        resizeAndSaveImage(
            e.target.result
        );
    };


    reader.onerror = function() {

        alert(
            "خواندن عکس انجام نشد."
        );
    };


    reader.readAsDataURL(file);
}


/* =========================================================
   RESIZE IMAGE
========================================================= */

function resizeAndSaveImage(source) {

    const image =
        new Image();


    image.onload = function() {

        const max =
            500;

        let width =
            image.width;

        let height =
            image.height;


        if (
            width > max ||
            height > max
        ) {

            const ratio =
                Math.min(
                    max / width,
                    max / height
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


    image.onerror =
        function() {

            alert(
                "تصویر قابل خواندن نیست."
            );
        };


    image.src =
        source;
}


/* =========================================================
   PROFILE PREVIEW
========================================================= */

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

        image.alt =
            "تصویر پروفایل";


        preview.appendChild(
            image
        );

    } else {

        preview.textContent =
            profile.avatar ||
            "👤";
    }
}


/* =========================================================
   RENDER AVATAR ANYWHERE
========================================================= */

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

        image.alt =
            "تصویر پروفایل";


        container.appendChild(
            image
        );

    } else {

        container.textContent =
            profile.avatar ||
            "👤";
    }
}


/* =========================================================
   UPDATE PROFILE UI
========================================================= */

function updateProfileUI() {

    const homeName =
        el("homeName");

    const homePhone =
        el("homePhone");

    const homeNumber =
        el("homeZardaloo");


    if (homeName) {

        homeName.textContent =
            profile.name ||
            "---";
    }


    if (homePhone) {

        homePhone.textContent =
            profile.phone ||
            "---";
    }


    if (homeNumber) {

        homeNumber.textContent =
            profile.zardalooNumber ||
            "---";
    }


    renderAvatar(
        el("homeProfileImage")
    );

    renderAvatar(
        el("headerProfileImage")
    );


    /* اطلاعات فروشنده */

    const sellerName =
        el("sellerName");

    const sellerPhone =
        el("sellerPhone");


    if (sellerName) {

        sellerName.value =
            profile.name;
    }


    if (sellerPhone) {

        sellerPhone.value =
            profile.phone;
    }
}


/* =========================================================
   ENTER ZARDALOO
========================================================= */

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


    const saved =
        saveProfile();


    if (!saved) {

        alert(
            "ذخیره پروفایل انجام نشد."
        );

        return;
    }


    /*
       اول UI را آپدیت می‌کنیم
    */

    updateProfileUI();


    /*
       بعد صفحه ورود را مخفی می‌کنیم
    */

    const setup =
        el("profileSetup");

    const app =
        el("app");


    if (setup) {

        setup.classList.add(
            "hidden"
        );
    }


    if (app) {

        app.classList.remove(
            "hidden"
        );
    }


    /*
       ورود مستقیم به خانه
    */

    showPage("home");


    /*
       عکس هدر را صریحاً دوباره رندر می‌کنیم
    */

    renderAvatar(
        el("headerProfileImage")
    );

    renderAvatar(
        el("homeProfileImage")
    );


    /*
       فرم ثبت کالا
    */

    updateProfileUI();
}


/* =========================================================
   SHOW PAGE
========================================================= */

function showPage(name) {

    document
        .querySelectorAll(".page")
        .forEach(function(page) {

            page.classList.remove(
                "active"
            );
        });


    const page =
        el(name);


    if (!page) {
        return;
    }


    page.classList.add(
        "active"
    );


    if (name === "home") {

        updateProfileUI();
    }


    if (name === "market") {

        loadProducts();
    }


    if (name === "cart") {

        renderCart();
    }
}


/* =========================================================
   PRODUCT HELPERS
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
        ""
    );
}


function getSellerPhone(product) {

    return (
        product?.phone ??
        product?.seller_phone ??
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


    if (
        typeof value ===
        "boolean"
    ) {

        return value;
    }


    if (
        typeof value ===
        "number"
    ) {

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

        console.error(
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
   FILTER PRODUCTS
========================================================= */

function getFilteredProducts() {

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
                getProductName(product)
                    .toLowerCase();


            const price =
                getProductPrice(product);


            const sellerName =
                getSellerName(product)
                    .toLowerCase();


            const isGift =
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
                !sellerName.includes(
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


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    const container =
        el("products");


    if (!container) {
        return;
    }


    const list =
        getFilteredProducts();


    container.innerHTML =
        "";


    if (list.length === 0) {

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
                getProductId(product);


            const name =
                getProductName(product);


            const price =
                getProductPrice(product);


            const seller =
                getSellerName(product);


            const phone =
                getSellerPhone(product);


            const number =
                getSellerNumber(product);


            const gift =
                isGiftProduct(product);


            card.innerHTML = `

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
                    ${escapeHTML(number)}
                </p>

                <p>
                    تلفن:
                    ${escapeHTML(phone)}
                </p>

                ${
                    gift
                    ? `
                        <p class="gift">
                            🎁 هدیه
                        </p>

                        <p>
                            ${escapeHTML(
                                product.gift_description ||
                                ""
                            )}
                        </p>
                    `
                    : ""
                }

                <button
                    class="yellow-button"
                    onclick="addToCart('${escapeHTML(String(id))}')"
                >
                    افزودن به سبد
                </button>

            `;


            if (
                String(number) ===
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


/* =========================================================
   REGISTER PRODUCT
========================================================= */

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


    const description =
        el("productDescription")
            ?.value
            .trim() || "";


    const gift =
        el("isGift")
            ?.checked || false;


    const giftDescription =
        el("giftDescription")
            ?.value
            .trim() || "";


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
            "شماره زردآلو مشخص نیست.";

        return;
    }


    if (
        gift &&
        !giftDescription
    ) {

        message.textContent =
            "توضیحات هدیه را وارد کن.";

        return;
    }


    const button =
        el("registerProductButton");


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "در حال ثبت...";
    }


    /*
       دقیقاً مطابق Edge Function
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
            gift,

        gift_description:
            gift
                ? giftDescription
                : ""
    };


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

        el("isGift").checked =
            false;

        el("giftDescription").value =
            "";


        toggleGiftDescription();


        await loadProducts();


        setTimeout(
            function() {

                showPage("market");

            },
            500
        );


    } catch (error) {

        console.error(
            "REGISTER ERROR:",
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


/* =========================================================
   CART
========================================================= */

function saveCart() {

    localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
    );
}


function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                CART_STORAGE_KEY
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
                    getProductId(item)
                ) === String(id);
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
                getProductPrice(product);


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
                        getProductName(product)
                    )}
                </h3>

                <p>
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


    if (summary) {

        summary.innerHTML = `

            <p>
                قیمت کل:
                ${total.toLocaleString("fa-IR")}
                ریال
            </p>

            <p>
                تخفیف:
                ${discountPercent.toLocaleString("fa-IR")}٪
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
}


/* =========================================================
   DISCOUNT
========================================================= */

function applyCartDiscount() {

    const input =
        el("cartDiscountCode");

    const message =
        el("cartDiscountMessage");


    const code =
        input
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
            DISCOUNT_STORAGE_KEY,
            String(
                discountPercent
            )
        );


        message.textContent =
            `تخفیف ${discountPercent}٪ اعمال شد.`;

    } else {

        discountPercent =
            0;


        localStorage.setItem(
            DISCOUNT_STORAGE_KEY,
            "0"
        );


        message.textContent =
            "کد تخفیف نامعتبر است.";
    }


    renderCart();
}


function loadDiscount() {

    discountPercent =
        Number(
            localStorage.getItem(
                DISCOUNT_STORAGE_KEY
            ) || 0
        );


    if (
        !Number.isFinite(
            discountPercent
        )
    ) {

        discountPercent =
            0;
    }
}


/* =========================================================
   MESSAGES
========================================================= */

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


    if (!receiver) {

        status.textContent =
            "شماره گیرنده را وارد کن.";

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


/* =========================================================
   REPORT
========================================================= */

async function submitReport() {

    const sellerNumber =
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


    if (!sellerNumber) {

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
        el("adminNumber")
            ?.value
            .trim() || "";


    const password =
        el("adminPassword")
            ?.value || "";


    const message =
        el("adminMessage");


    if (
        number === ADMIN_NUMBER &&
        password === ADMIN_PASSWORD
    ) {

        adminLoggedIn =
            true;


        el("adminPanel")
            ?.classList.remove(
                "hidden"
            );


        message.textContent =
            "ورود مدیریت موفق بود. ✅";


        loadAdminProducts();

    } else {

        message.textContent =
            "شماره یا رمز اشتباه است.";
    }
}


function loadAdminProducts() {

    if (!adminLoggedIn) {
        return;
    }


    const content =
        el("adminContent");


    if (!content) {
        return;
    }


    content.innerHTML =
        "";


    el("adminProductCount")
        .textContent =
        String(
            products.length
        );


    products.forEach(
        function(product) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "card";


            item.innerHTML = `

                <strong>
                    ${escapeHTML(
                        getProductName(product)
                    )}
                </strong>

                <p>
                    فروشنده:
                    ${escapeHTML(
                        getSellerName(product)
                    )}
                </p>

                <p>
                    قیمت:
                    ${getProductPrice(product).toLocaleString("fa-IR")}
                    ریال
                </p>
            `;


            content.appendChild(
                item
            );
        }
    );
}


function loadAdminReports() {

    if (!adminLoggedIn) {
        return;
    }


    el("adminContent").innerHTML =
        "<p>گزارش‌های مدیریت از Edge Function مربوط به گزارش‌ها دریافت می‌شوند.</p>";
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
    ].forEach(
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


/* =========================================================
   START APP
========================================================= */

function initializeApp() {

    /*
       اول پروفایل را بخوان
    */

    const hasProfile =
        loadProfile();


    /*
       اطلاعات دیگر
    */

    loadCart();

    loadDiscount();


    /*
       آواتار اولیه
    */

    showProfilePreview();


    /*
       اگر پروفایل قبلاً کامل است:
       مستقیم وارد برنامه شو
    */

    if (hasProfile) {

        el("profileSetup")
            ?.classList.add(
                "hidden"
            );


        el("app")
            ?.classList.remove(
                "hidden"
            );


        updateProfileUI();


        showPage("home");


    } else {

        /*
           اولین ورود
        */

        el("profileSetup")
            ?.classList.remove(
                "hidden"
            );


        el("app")
            ?.classList.add(
                "hidden"
            );
    }


    setupFilters();

    toggleGiftDescription();
}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

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
    loadAdminProducts;

window.loadAdminReports =
    loadAdminReports;
