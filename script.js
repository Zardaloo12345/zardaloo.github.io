"use strict";

/* =========================================================
   زردآلو | script.js
   نسخه یکپارچه
========================================================= */


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


const ADMIN_NUMBER =
    "0994051777";

const ADMIN_PASSWORD =
    "ERFAN";


/* =========================================================
   LOCAL STORAGE
========================================================= */

const PROFILE_KEY =
    "zardaloo_profile_final_v1";

const CART_KEY =
    "zardaloo_cart_final_v1";

const DISCOUNT_KEY =
    "zardaloo_discount_final_v1";

const THEME_KEY =
    "zardaloo_theme_final_v1";

const ADMIN_KEY =
    "zardaloo_admin_final_v1";


/* =========================================================
   STATE
========================================================= */

let profile = null;

let products = [];

let cart = [];

let currentDiscount = null;

let adminLoggedIn = false;

let currentProduct = null;

let currentChatNumber = "";

let selectedAvatar = "";

let uploadedAvatar = "";


/* =========================================================
   DISCOUNT CODES
========================================================= */

const DISCOUNT_CODES = {
    "ZARDALOO10": 10,
    "ZARDALOO20": 20,
    "50": 50,
    "100": 100
};


/* =========================================================
   HELPERS
========================================================= */

function $(id) {
    return document.getElementById(id);
}


function safeText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value);
}


function escapeHTML(value) {

    return safeText(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatPrice(value) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return "۰";
    }

    return number.toLocaleString(
        "fa-IR"
    );
}


function showToast(message) {

    let toast =
        $("zardalooToast");

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id =
            "zardalooToast";

        toast.className =
            "zardaloo-toast";

        document.body.appendChild(toast);
    }

    toast.textContent =
        safeText(message);

    toast.classList.add("show");

    clearTimeout(
        window.__zardalooToastTimer
    );

    window.__zardalooToastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 4500);
}


function setLoading(
    button,
    loading,
    normalText = "ثبت کالا"
) {

    if (!button) {
        return;
    }

    if (loading) {

        button.disabled = true;

        button.dataset.oldText =
            button.textContent;

        button.textContent =
            "در حال ثبت...";

    } else {

        button.disabled = false;

        button.textContent =
            normalText;

        delete button.dataset.oldText;
    }
}


/* =========================================================
   PROFILE
========================================================= */

function loadProfile() {

    try {

        const saved =
            localStorage.getItem(
                PROFILE_KEY
            );

        if (!saved) {

            profile = null;

            return;
        }

        const parsed =
            JSON.parse(saved);

        if (
            parsed &&
            typeof parsed === "object"
        ) {

            profile = parsed;

        } else {

            profile = null;
        }

    } catch (error) {

        console.error(
            "PROFILE LOAD ERROR:",
            error
        );

        profile = null;
    }
}


function saveProfile() {

    if (!profile) {
        return false;
    }

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

        showToast(
            "ذخیره پروفایل انجام نشد."
        );

        return false;
    }
}


function profileIsComplete() {

    if (!profile) {
        return false;
    }

    return (
        getProfileName() !== "" &&
        getProfilePhone() !== "" &&
        getProfileZardalooNumber() !== ""
    );
}


function getProfileName() {

    return safeText(
        profile?.name
    ).trim();
}


function getProfilePhone() {

    return safeText(
        profile?.phone
    ).trim();
}


function getProfileZardalooNumber() {

    return safeText(
        profile?.zardalooNumber
    ).trim();
}


function getProfileAvatar() {

    return (
        profile?.avatar ||
        "👤"
    );
}


/* =========================================================
   PROFILE AVATAR
========================================================= */

function selectAvatar(avatar) {

    selectedAvatar =
        safeText(avatar);

    uploadedAvatar = "";

    updateAvatarPreview();

    document
        .querySelectorAll(".avatar-option")
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.dataset.avatar ===
                selectedAvatar
            );
        });
}


function updateAvatarPreview() {

    const preview =
        $("profileAvatarPreview");

    if (!preview) {
        return;
    }

    const avatar =
        uploadedAvatar ||
        selectedAvatar ||
        profile?.avatar ||
        "👤";

    if (
        typeof avatar === "string" &&
        avatar.startsWith("data:image/")
    ) {

        preview.innerHTML =
            `<img src="${avatar}" alt="پروفایل">`;

    } else {

        preview.innerHTML =
            escapeHTML(avatar);
    }
}


function resizeImage(
    file,
    maxSize = 300
) {

    return new Promise(
        (resolve, reject) => {

            if (!file) {

                reject(
                    new Error(
                        "تصویری انتخاب نشده است."
                    )
                );

                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                event => {

                    const image =
                        new Image();

                    image.onload =
                        () => {

                            let width =
                                image.width;

                            let height =
                                image.height;


                            if (
                                width > maxSize ||
                                height > maxSize
                            ) {

                                if (
                                    width > height
                                ) {

                                    height =
                                        Math.round(
                                            height *
                                            maxSize /
                                            width
                                        );

                                    width =
                                        maxSize;

                                } else {

                                    width =
                                        Math.round(
                                            width *
                                            maxSize /
                                            height
                                        );

                                    height =
                                        maxSize;
                                }
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


                            resolve(
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.82
                                )
                            );
                        };


                    image.onerror =
                        () => {

                            reject(
                                new Error(
                                    "خواندن تصویر انجام نشد."
                                )
                            );
                        };


                    image.src =
                        event.target.result;
                };


            reader.onerror =
                () => {

                    reject(
                        new Error(
                            "خواندن فایل انجام نشد."
                        )
                    );
                };


            reader.readAsDataURL(file);
        }
    );
}


function setupAvatarUpload() {

    const input =
        $("profileImage");

    if (!input) {
        return;
    }

    input.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files?.[0];

            if (!file) {
                return;
            }

            if (
                !file.type.startsWith("image/")
            ) {

                showToast(
                    "لطفاً یک تصویر انتخاب کنید."
                );

                return;
            }

            try {

                uploadedAvatar =
                    await resizeImage(file);

                selectedAvatar = "";

                document
                    .querySelectorAll(
                        ".avatar-option"
                    )
                    .forEach(button => {
                        button.classList.remove(
                            "selected"
                        );
                    });

                updateAvatarPreview();

            } catch (error) {

                console.error(
                    "AVATAR ERROR:",
                    error
                );

                showToast(
                    error.message
                );
            }
        }
    );
}


/* =========================================================
   PROFILE SAVE
========================================================= */

function saveProfileFromForm() {

    const name =
        safeText(
            $("profileName")?.value
        ).trim();

    const phone =
        safeText(
            $("profilePhone")?.value
        ).trim();

    const zardalooNumber =
        safeText(
            $("profileZardalooNumber")?.value
        ).trim();


    if (!name) {

        showToast(
            "نام و نام خانوادگی را وارد کنید."
        );

        return false;
    }


    if (!phone) {

        showToast(
            "شماره تماس را وارد کنید."
        );

        return false;
    }


    if (!zardalooNumber) {

        showToast(
            "شماره زردآلو را وارد کنید."
        );

        return false;
    }


    profile = {

        name:
            name,

        phone:
            phone,

        zardalooNumber:
            zardalooNumber,

        avatar:
            uploadedAvatar ||
            selectedAvatar ||
            "👤"
    };


    if (!saveProfile()) {
        return false;
    }


    updateProfileUI();

    hideOnboarding();

    showPage("home");

    showToast(
        "پروفایل با موفقیت ذخیره شد."
    );

    return true;
}


/* =========================================================
   PROFILE UI
========================================================= */

function setAvatarElement(
    element,
    avatar
) {

    if (!element) {
        return;
    }

    if (
        typeof avatar === "string" &&
        avatar.startsWith("data:image/")
    ) {

        element.innerHTML =
            `<img src="${avatar}" alt="پروفایل">`;

    } else {

        element.textContent =
            avatar || "👤";
    }
}


function updateProfileUI() {

    const name =
        getProfileName() ||
        "کاربر زردآلو";

    const phone =
        getProfilePhone() ||
        "—";

    const number =
        getProfileZardalooNumber() ||
        "—";

    const avatar =
        getProfileAvatar();


    const homeName =
        $("homeName");

    if (homeName) {
        homeName.textContent =
            name;
    }


    const homePhone =
        $("homePhone");

    if (homePhone) {
        homePhone.textContent =
            phone;
    }


    const homeNumber =
        $("homeZardaloo");

    if (homeNumber) {
        homeNumber.textContent =
            number;
    }


    setAvatarElement(
        $("homeProfileImage"),
        avatar
    );


    setAvatarElement(
        $("headerProfileImage"),
        avatar
    );


    updateAvatarPreview();


    const sellerName =
        $("sellerName");

    if (sellerName) {

        sellerName.value =
            getProfileName();
    }


    const sellerPhone =
        $("sellerPhone");

    if (sellerPhone) {

        sellerPhone.value =
            getProfilePhone();
    }


    const sellerNumber =
        $("sellerZardalooNumber");

    if (sellerNumber) {

        sellerNumber.value =
            getProfileZardalooNumber();
    }
}


/* =========================================================
   ONBOARDING
========================================================= */

function showOnboarding() {

    const onboarding =
        $("onboarding");

    const app =
        $("app");

    if (onboarding) {

        onboarding.classList.remove(
            "hidden"
        );

        onboarding.style.display =
            "flex";
    }

    if (app) {

        app.classList.add(
            "hidden"
        );
    }
}


function hideOnboarding() {

    const onboarding =
        $("onboarding");

    const app =
        $("app");

    if (onboarding) {

        onboarding.classList.add(
            "hidden"
        );

        onboarding.style.display =
            "none";
    }

    if (app) {

        app.classList.remove(
            "hidden"
        );
    }
}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(pageName) {

    if (
        pageName !== "admin" &&
        !profileIsComplete()
    ) {

        showOnboarding();

        return;
    }


    if (
        pageName === "admin" &&
        !adminLoggedIn
    ) {

        pageName = "admin";
    }


    hideOnboarding();


    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active"
            );

            page.style.display =
                "none";
        });


    const page =
        $("page-" + pageName);


    if (!page) {

        console.warn(
            "PAGE NOT FOUND:",
            pageName
        );

        return;
    }


    page.classList.add(
        "active"
    );

    page.style.display =
        "block";


    if (pageName === "home") {

        updateProfileUI();
    }


    if (pageName === "market") {

        loadProducts();
    }


    if (pageName === "gifts") {

        loadProducts();
    }


    if (pageName === "register") {

        prepareRegisterForm();
    }


    if (pageName === "cart") {

        renderCart();
    }


    if (pageName === "messages") {

        loadMessages();
    }


    if (pageName === "admin") {

        updateAdminVisibility();

        if (adminLoggedIn) {
            loadAdminDashboard();
        }
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   PRODUCT NORMALIZATION
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
        product?.seller_name ??
        product?.sellerName ??
        product?.seller ??
        ""
    );
}


function getSellerPhone(product) {

    return (
        product?.seller_phone ??
        product?.sellerPhone ??
        product?.phone ??
        ""
    );
}


function getSellerNumber(product) {

    return (
        product?.zardaloo_number ??
        product?.seller_zardaloo_number ??
        product?.owner_zardaloo_number ??
        product?.sellerNumber ??
        ""
    );
}


function getProductDescription(product) {

    return (
        product?.description ??
        product?.product_description ??
        ""
    );
}


function getGiftDescription(product) {

    return (
        product?.gift_description ??
        product?.giftDescription ??
        product?.gift_text ??
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
   API REQUEST
========================================================= */

async function apiRequest(
    url,
    options = {}
) {

    const headers = {

        "Content-Type":
            "application/json",

        "apikey":
            SUPABASE_KEY,

        "Authorization":
            "Bearer " +
            SUPABASE_KEY,

        ...(options.headers || {})
    };


    let response;

    try {

        response =
            await fetch(
                url,
                {
                    ...options,
                    headers
                }
            );

    } catch (networkError) {

        throw new Error(
            "ارتباط با سرور برقرار نشد. اینترنت و آدرس Supabase را بررسی کنید."
        );
    }


    const text =
        await response.text();


    let data = null;


    try {

        data =
            text
                ? JSON.parse(text)
                : null;

    } catch (_) {

        data = text;
    }


    if (!response.ok) {

        let message =
            "";


        if (
            data &&
            typeof data === "object"
        ) {

            message =
                data.message ||
                data.error ||
                data.detail ||
                data.msg ||
                "";

        } else {

            message =
                safeText(data);
        }


        if (!message) {

            message =
                `HTTP ${response.status}`;
        }


        throw new Error(
            message
        );
    }


    return data;
}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    const container =
        $("productsContainer");

    const gifts =
        $("giftsContainer");


    if (container) {

        container.innerHTML = `
            <div class="loading-box">
                در حال دریافت کالاها...
            </div>
        `;
    }


    if (gifts) {

        gifts.innerHTML = `
            <div class="loading-box">
                در حال دریافت اشانتیون‌ها...
            </div>
        `;
    }


    try {

        const data =
            await apiRequest(
                PRODUCTS_FUNCTION_URL,
                {
                    method: "GET"
                }
            );


        if (
            Array.isArray(data)
        ) {

            products =
                data;

        } else if (
            Array.isArray(
                data?.products
            )
        ) {

            products =
                data.products;

        } else if (
            Array.isArray(
                data?.data
            )
        ) {

            products =
                data.data;

        } else {

            products =
                [];
        }


        renderProducts();

        renderGifts();

    } catch (error) {

        console.error(
            "LOAD PRODUCTS ERROR:",
            error
        );


        products =
            [];


        if (container) {

            container.innerHTML = `
                <div class="empty-box">

                    <strong>
                        دریافت کالاها انجام نشد.
                    </strong>

                    <p>
                        ${escapeHTML(error.message)}
                    </p>

                    <br>

                    <button
                        class="secondary-button"
                        onclick="loadProducts()">
                        تلاش دوباره
                    </button>

                </div>
            `;
        }


        if (gifts) {

            gifts.innerHTML = `
                <div class="empty-box">
                    دریافت اشانتیون‌ها انجام نشد.
                </div>
            `;
        }
    }
}


/* =========================================================
   PRODUCT CARD
========================================================= */

function createProductCard(product) {

    const id =
        getProductId(product);

    const name =
        getProductName(product);

    const price =
        getProductPrice(product);

    const seller =
        getSellerName(product);

    const sellerNumber =
        getSellerNumber(product);

    const description =
        getProductDescription(product);

    const gift =
        isGiftProduct(product);

    const giftDescription =
        getGiftDescription(product);


    return `
        <article class="product-card">

            <div class="product-card-top">

                <div class="product-icon">
                    ${gift ? "🎁" : "🛍️"}
                </div>

                ${
                    gift
                    ? `
                        <span class="gift-badge">
                            اشانتیون
                        </span>
                    `
                    : ""
                }

            </div>


            <h3>
                ${escapeHTML(
                    name || "بدون نام"
                )}
            </h3>


            <div class="product-price">

                ${formatPrice(price)}

                <small>
                    تومان
                </small>

            </div>


            <div class="product-seller">

                فروشنده:
                ${escapeHTML(
                    seller || "نامشخص"
                )}

            </div>


            ${
                sellerNumber
                ? `
                    <div class="product-number">
                        شماره زردآلو:
                        ${escapeHTML(
                            sellerNumber
                        )}
                    </div>
                `
                : ""
            }


            ${
                description
                ? `
                    <p class="product-description">
                        ${escapeHTML(
                            description
                        )}
                    </p>
                `
                : ""
            }


            ${
                gift && giftDescription
                ? `
                    <div class="gift-description">
                        🎁
                        ${escapeHTML(
                            giftDescription
                        )}
                    </div>
                `
                : ""
            }


            <div class="product-actions">

                <button
                    type="button"
                    onclick='openProduct(${JSON.stringify(String(id))})'>
                    مشاهده
                </button>

                <button
                    type="button"
                    onclick='addToCart(${JSON.stringify(String(id))})'>
                    افزودن به سبد
                </button>

            </div>

        </article>
    `;
}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts(
    list = products
) {

    const container =
        $("productsContainer");

    if (!container) {
        return;
    }


    if (
        !Array.isArray(list) ||
        !list.length
    ) {

        container.innerHTML = `
            <div class="empty-box">
                هنوز کالایی ثبت نشده است.
            </div>
        `;

        return;
    }


    container.innerHTML =
        list
            .map(createProductCard)
            .join("");
}


function renderGifts() {

    const container =
        $("giftsContainer");

    if (!container) {
        return;
    }


    const gifts =
        products.filter(
            product =>
                isGiftProduct(product)
        );


    if (!gifts.length) {

        container.innerHTML = `
            <div class="empty-box">
                در حال حاضر اشانتیونی ثبت نشده است.
            </div>
        `;

        return;
    }


    container.innerHTML =
        gifts
            .map(createProductCard)
            .join("");
}


/* =========================================================
   MARKET FILTER
========================================================= */

function applyMarketFilters() {

    const name =
        safeText(
            $("marketSearchName")?.value
        )
            .trim()
            .toLowerCase();


    const min =
        Number(
            $("marketMinPrice")?.value ||
            0
        );


    const maxValue =
        safeText(
            $("marketMaxPrice")?.value
        ).trim();


    const max =
        maxValue
            ? Number(maxValue)
            : Infinity;


    const seller =
        safeText(
            $("marketSellerName")?.value
        )
            .trim()
            .toLowerCase();


    const giftFilter =
        $("marketGiftFilter")?.value ||
        "all";


    const filtered =
        products.filter(
            product => {

                const productName =
                    getProductName(product)
                        .toLowerCase();

                const sellerName =
                    getSellerName(product)
                        .toLowerCase();

                const price =
                    getProductPrice(product);

                const gift =
                    isGiftProduct(product);


                if (
                    name &&
                    !productName.includes(name)
                ) {
                    return false;
                }


                if (
                    Number.isFinite(min) &&
                    price < min
                ) {
                    return false;
                }


                if (
                    max !== Infinity &&
                    Number.isFinite(max) &&
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
            }
        );


    renderProducts(
        filtered
    );
}


/* =========================================================
   PRODUCT DETAIL
========================================================= */

function openProduct(id) {

    const product =
        products.find(
            item =>
                String(
                    getProductId(item)
                ) ===
                String(id)
        );


    if (!product) {

        showToast(
            "کالا پیدا نشد."
        );

        return;
    }


    currentProduct =
        product;


    const container =
        $("productDetailContainer");


    if (!container) {
        return;
    }


    const productId =
        getProductId(product);

    const sellerNumber =
        getSellerNumber(product);


    const ownProduct =
        String(sellerNumber) ===
        String(
            getProfileZardalooNumber()
        );


    container.innerHTML = `

        <div class="detail-card">

            <div class="detail-icon">
                ${
                    isGiftProduct(product)
                        ? "🎁"
                        : "🛍️"
                }
            </div>


            <h2>
                ${escapeHTML(
                    getProductName(product)
                )}
            </h2>


            <div class="detail-price">

                ${formatPrice(
                    getProductPrice(product)
                )}

                تومان

            </div>


            <p>
                ${escapeHTML(
                    getProductDescription(product) ||
                    "توضیحی برای این کالا ثبت نشده است."
                )}
            </p>


            <hr>


            <p>
                <strong>
                    فروشنده:
                </strong>

                ${escapeHTML(
                    getSellerName(product) ||
                    "—"
                )}
            </p>


            <p>
                <strong>
                    شماره زردآلو:
                </strong>

                ${escapeHTML(
                    sellerNumber ||
                    "—"
                )}
            </p>


            <p>
                <strong>
                    تلفن:
                </strong>

                ${escapeHTML(
                    getSellerPhone(product) ||
                    "—"
                )}
            </p>


            ${
                isGiftProduct(product)
                ? `
                    <div class="gift-description">

                        🎁 اشانتیون:

                        ${escapeHTML(
                            getGiftDescription(product) ||
                            "اشانتیون دارد."
                        )}

                    </div>
                `
                : ""
            }


            <div class="detail-actions">

                <button
                    type="button"
                    onclick='addToCart(${JSON.stringify(String(productId))})'>
                    افزودن به سبد
                </button>


                ${
                    sellerNumber
                    ? `
                        <button
                            type="button"
                            onclick='startMessage(${JSON.stringify(String(sellerNumber))})'>
                            پیام به فروشنده
                        </button>
                    `
                    : ""
                }


                <button
                    type="button"
                    onclick='openReportPage(
                        ${JSON.stringify(String(sellerNumber))},
                        ${JSON.stringify(String(getSellerName(product)))}
                    )'>
                    گزارش فروشنده
                </button>


                ${
                    ownProduct
                    ? `
                        <button
                            type="button"
                            class="danger-button"
                            onclick='deleteMyProduct(${JSON.stringify(String(productId))})'>
                            حذف کالا
                        </button>
                    `
                    : ""
                }

            </div>

        </div>
    `;


    showPage("product");
}


/* =========================================================
   REGISTER FORM
========================================================= */

function prepareRegisterForm() {

    const sellerName =
        $("sellerName");

    const sellerPhone =
        $("sellerPhone");

    const sellerNumber =
        $("sellerZardalooNumber");


    if (sellerName) {

        sellerName.value =
            getProfileName();

        sellerName.readOnly =
            true;
    }


    if (sellerPhone) {

        sellerPhone.value =
            getProfilePhone();

        sellerPhone.readOnly =
            false;
    }


    if (sellerNumber) {

        sellerNumber.value =
            getProfileZardalooNumber();

        sellerNumber.readOnly =
            true;
    }
}


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


    if (!checkbox.checked) {

        const input =
            $("giftDescription");

        if (input) {
            input.value = "";
        }
    }
}


/* =========================================================
   REGISTER PRODUCT
========================================================= */

async function registerProduct() {

    const button =
        $("registerProductButton");


    try {

        loadProfile();


        if (!profileIsComplete()) {

            showToast(
                "ابتدا اطلاعات پروفایل خود را کامل کنید."
            );

            showOnboarding();

            return;
        }


        const name =
            safeText(
                $("productName")?.value
            ).trim();


        const rawPrice =
            safeText(
                $("productPrice")?.value
            ).trim();


        const description =
            safeText(
                $("productDescription")?.value
            ).trim();


        const isGift =
            Boolean(
                $("isGift")?.checked
            );


        const giftDescription =
            safeText(
                $("giftDescription")?.value
            ).trim();


        /* ---------------------------------------------
           اعتبارسنجی
        --------------------------------------------- */


        if (!name) {

            showToast(
                "نام کالا را وارد کنید."
            );

            return;
        }


        if (!rawPrice) {

            showToast(
                "قیمت کالا را وارد کنید."
            );

            return;
        }


        const cleanPrice =
            rawPrice
                .replace(/,/g, "")
                .replace(/٬/g, "")
                .replace(/\s/g, "");


        const price =
            Number(cleanPrice);


        if (
            !Number.isFinite(price) ||
            price <= 0
        ) {

            showToast(
                "قیمت کالا معتبر نیست."
            );

            return;
        }


        if (
            isGift &&
            !giftDescription
        ) {

            showToast(
                "توضیحات اشانتیون را وارد کنید."
            );

            return;
        }


        /* ---------------------------------------------
           اطلاعات فروشنده
        --------------------------------------------- */

        const sellerName =
            getProfileName();

        const sellerPhone =
            getProfilePhone();

        const zardalooNumber =
            getProfileZardalooNumber();


        /* ---------------------------------------------
           PAYLOAD
        --------------------------------------------- */

        const productData = {

            name:
                name,

            product_name:
                name,

            price:
                price,

            product_price:
                price,

            seller_name:
                sellerName,

            seller_phone:
                sellerPhone,

            phone:
                sellerPhone,

            zardaloo_number:
                zardalooNumber,

            seller_zardaloo_number:
                zardalooNumber,

            owner_zardaloo_number:
                zardalooNumber,

            seller_number:
                zardalooNumber,

            description:
                description,

            product_description:
                description,

            is_gift:
                isGift,

            isGift:
                isGift,

            gift_description:
                isGift
                    ? giftDescription
                    : "",

            giftDescription:
                isGift
                    ? giftDescription
                    : ""
        };


        console.log(
            "ZARDALOO PRODUCT PAYLOAD:",
            productData
        );


        setLoading(
            button,
            true
        );


        /* ---------------------------------------------
           SEND
        --------------------------------------------- */

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


        const responseText =
            await response.text();


        console.log(
            "PRODUCT HTTP STATUS:",
            response.status
        );

        console.log(
            "PRODUCT SERVER RESPONSE:",
            responseText
        );


        let responseData =
            null;


        try {

            responseData =
                responseText
                    ? JSON.parse(
                        responseText
                    )
                    : null;

        } catch (_) {

            responseData =
                null;
        }


        if (!response.ok) {

            const serverMessage =
                responseData?.message ||
                responseData?.error ||
                responseData?.detail ||
                responseData?.msg ||
                responseText ||
                `HTTP ${response.status}`;


            throw new Error(
                serverMessage
            );
        }


        /* ---------------------------------------------
           موفقیت
        --------------------------------------------- */

        showToast(
            "✅ کالا با موفقیت ثبت شد."
        );


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


        showPage(
            "market"
        );


    } catch (error) {

        console.error(
            "REGISTER PRODUCT ERROR:",
            error
        );


        showToast(
            "ثبت کالا انجام نشد: " +
            (
                error?.message ||
                "خطای نامشخص"
            )
        );


    } finally {

        setLoading(
            button,
            false,
            "ثبت کالا"
        );
    }
}


/* =========================================================
   CART
========================================================= */

function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                CART_KEY
            );


        if (!saved) {

            cart = [];

            return;
        }


        const parsed =
            JSON.parse(saved);


        cart =
            Array.isArray(parsed)
                ? parsed
                : [];


    } catch (error) {

        console.error(
            "CART LOAD ERROR:",
            error
        );

        cart = [];
    }
}


function saveCart() {

    try {

        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );

    } catch (error) {

        console.error(
            "CART SAVE ERROR:",
            error
        );
    }
}


function addToCart(productId) {

    const product =
        products.find(
            item =>
                String(
                    getProductId(item)
                ) ===
                String(productId)
        );


    if (!product) {

        showToast(
            "کالا پیدا نشد."
        );

        return;
    }


    const id =
        String(
            getProductId(product)
        );


    const existing =
        cart.find(
            item =>
                String(item.id) ===
                id
        );


    if (existing) {

        existing.quantity =
            Number(
                existing.quantity || 1
            ) + 1;

    } else {

        cart.push({

            id:
                id,

            name:
                getProductName(product),

            price:
                getProductPrice(product),

            seller_name:
                getSellerName(product),

            seller_phone:
                getSellerPhone(product),

            seller_zardaloo_number:
                getSellerNumber(product),

            quantity:
                1
        });
    }


    saveCart();

    updateCartCount();


    showToast(
        "کالا به سبد خرید اضافه شد."
    );
}


function removeFromCart(id) {

    cart =
        cart.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    saveCart();

    renderCart();

    updateCartCount();
}


function changeCartQuantity(
    id,
    amount
) {

    const item =
        cart.find(
            product =>
                String(product.id) ===
                String(id)
        );


    if (!item) {
        return;
    }


    item.quantity =
        Number(
            item.quantity || 1
        ) +
        Number(amount);


    if (
        item.quantity <= 0
    ) {

        removeFromCart(id);

        return;
    }


    saveCart();

    renderCart();

    updateCartCount();
}


function getCartSubtotal() {

    return cart.reduce(
        (total, item) => {

            const price =
                Number(item.price) ||
                0;

            const quantity =
                Number(item.quantity) ||
                1;

            return (
                total +
                price * quantity
            );

        },
        0
    );
}


/* =========================================================
   DISCOUNT
========================================================= */

function loadDiscount() {

    try {

        const saved =
            localStorage.getItem(
                DISCOUNT_KEY
            );


        if (!saved) {

            currentDiscount =
                null;

            return;
        }


        currentDiscount =
            JSON.parse(saved);

    } catch (error) {

        currentDiscount =
            null;
    }
}


function saveDiscount() {

    if (!currentDiscount) {

        localStorage.removeItem(
            DISCOUNT_KEY
        );

        return;
    }


    localStorage.setItem(
        DISCOUNT_KEY,
        JSON.stringify(
            currentDiscount
        )
    );
}


function applyDiscountCode() {

    const input =
        $("cartDiscountCode");


    if (!input) {
        return;
    }


    const code =
        input.value
            .trim()
            .toUpperCase();


    if (!code) {

        showToast(
            "کد تخفیف را وارد کنید."
        );

        return;
    }


    const percent =
        DISCOUNT_CODES[code];


    if (
        percent === undefined
    ) {

        showToast(
            "کد تخفیف معتبر نیست."
        );

        return;
    }


    currentDiscount = {

        code:
            code,

        percent:
            percent
    };


    saveDiscount();

    renderCart();


    showToast(
        `کد ${code} با ${percent}٪ تخفیف اعمال شد.`
    );
}


function removeDiscount() {

    currentDiscount =
        null;

    saveDiscount();

    renderCart();


    showToast(
        "تخفیف حذف شد."
    );
}


function calculateCartTotals() {

    const subtotal =
        getCartSubtotal();


    const percent =
        Number(
            currentDiscount?.percent ||
            0
        );


    const discountAmount =
        Math.floor(
            subtotal *
            percent /
            100
        );


    const finalAmount =
        Math.max(
            0,
            subtotal -
            discountAmount
        );


    return {

        subtotal:
            subtotal,

        percent:
            percent,

        discountAmount:
            discountAmount,

        finalAmount:
            finalAmount
    };
}


/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

    const container =
        $("cartContainer");


    if (!container) {
        return;
    }


    if (!cart.length) {

        container.innerHTML = `
            <div class="empty-box">
                سبد خرید شما خالی است.
            </div>
        `;

        return;
    }


    const totals =
        calculateCartTotals();


    let html = `
        <div class="cart-items">
    `;


    cart.forEach(item => {

        const price =
            Number(item.price) ||
            0;


        const quantity =
            Number(item.quantity) ||
            1;


        const total =
            price * quantity;


        html += `

            <div class="cart-item">

                <div>

                    <h3>
                        ${escapeHTML(
                            item.name
                        )}
                    </h3>

                    <p>
                        قیمت واحد:
                        ${formatPrice(price)}
                        تومان
                    </p>

                    <p>
                        تعداد:
                        ${quantity}
                    </p>

                    <p>
                        مجموع:
                        ${formatPrice(total)}
                        تومان
                    </p>

                </div>


                <div class="cart-controls">

                    <button
                        type="button"
                        onclick='changeCartQuantity(
                            ${JSON.stringify(String(item.id))},
                            1
                        )'>
                        +
                    </button>


                    <button
                        type="button"
                        onclick='changeCartQuantity(
                            ${JSON.stringify(String(item.id))},
                            -1
                        )'>
                        −
                    </button>


                    <button
                        type="button"
                        class="danger-button"
                        onclick='removeFromCart(
                            ${JSON.stringify(String(item.id))}
                        )'>
                        حذف
                    </button>

                </div>

            </div>
        `;
    });


    html += `

        </div>


        <div class="cart-summary">

            <h2>
                خلاصه سبد خرید
            </h2>


            <div class="summary-row">

                <span>
                    قیمت اصلی
                </span>

                <strong>
                    ${formatPrice(
                        totals.subtotal
                    )}
                    تومان
                </strong>

            </div>


            <div class="summary-row">

                <span>
                    درصد تخفیف
                </span>

                <strong>
                    ${totals.percent}٪
                </strong>

            </div>


            <div class="summary-row">

                <span>
                    مبلغ تخفیف
                </span>

                <strong>
                    ${formatPrice(
                        totals.discountAmount
                    )}
                    تومان
                </strong>

            </div>


            <div class="summary-row final">

                <span>
                    قیمت بعد تخفیف
                </span>

                <strong>
                    ${formatPrice(
                        totals.finalAmount
                    )}
                    تومان
                </strong>

            </div>


            <div class="discount-box">

                <input
                    id="cartDiscountCode"
                    type="text"
                    placeholder="کد تخفیف"
                    value="${
                        escapeHTML(
                            currentDiscount?.code ||
                            ""
                        )
                    }"
                >


                <button
                    type="button"
                    class="main-yellow-button"
                    onclick="applyDiscountCode()">
                    اعمال کد
                </button>


                ${
                    currentDiscount
                    ? `
                        <button
                            type="button"
                            class="secondary-button"
                            onclick="removeDiscount()">
                            حذف تخفیف
                        </button>
                    `
                    : ""
                }

            </div>

        </div>
    `;


    container.innerHTML =
        html;
}


function updateCartCount() {

    const count =
        cart.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.quantity || 1
                ),
            0
        );


    document
        .querySelectorAll(
            "[data-cart-count]"
        )
        .forEach(element => {

            element.textContent =
                count.toLocaleString(
                    "fa-IR"
                );
        });
}


/* =========================================================
   MESSAGES
========================================================= */

function startMessage(number) {

    if (!number) {

        showToast(
            "شماره زردآلو فروشنده موجود نیست."
        );

        return;
    }


    currentChatNumber =
        String(number);


    const target =
        $("messageTargetNumber");


    if (target) {

        target.value =
            currentChatNumber;
    }


    showPage(
        "messages"
    );
}


async function sendMessage() {

    const input =
        $("messageInput");


    const target =
        $("messageTargetNumber");


    const text =
        safeText(
            input?.value
        ).trim();


    const receiver =
        safeText(
            target?.value
        ).trim() ||
        currentChatNumber;


    if (!receiver) {

        showToast(
            "شماره زردآلو گیرنده را وارد کنید."
        );

        return;
    }


    if (!text) {

        showToast(
            "پیام را وارد کنید."
        );

        return;
    }


    if (!profileIsComplete()) {

        showToast(
            "ابتدا پروفایل خود را کامل کنید."
        );

        return;
    }


    const data = {

        sender_name:
            getProfileName(),

        sender_zardaloo_number:
            getProfileZardalooNumber(),

        receiver_zardaloo_number:
            receiver,

        message:
            text
    };


    try {

        await apiRequest(
            MESSAGES_FUNCTION_URL,
            {
                method: "POST",

                body:
                    JSON.stringify(data)
            }
        );


        if (input) {
            input.value = "";
        }


        showToast(
            "پیام ارسال شد."
        );


        await loadMessages();

    } catch (error) {

        showToast(
            "ارسال پیام انجام نشد: " +
            error.message
        );
    }
}


async function loadMessages() {

    const container =
        $("messagesContainer");


    if (!container) {
        return;
    }


    if (!profileIsComplete()) {
        return;
    }


    try {

        const number =
            encodeURIComponent(
                getProfileZardalooNumber()
            );


        const data =
            await apiRequest(
                MESSAGES_FUNCTION_URL +
                "?zardaloo_number=" +
                number,
                {
                    method: "GET"
                }
            );


        const messages =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(
                        data?.messages
                    )
                    ? data.messages
                    : []
                );


        if (!messages.length) {

            container.innerHTML = `
                <div class="empty-box">
                    هنوز پیامی ندارید.
                </div>
            `;

            return;
        }


        container.innerHTML =
            messages
                .map(
                    message => `

                        <div class="message-card">

                            <strong>
                                ${escapeHTML(
                                    message.sender_zardaloo_number ||
                                    message.sender_number ||
                                    "کاربر"
                                )}
                            </strong>

                            <p>
                                ${escapeHTML(
                                    message.message ||
                                    ""
                                )}
                            </p>

                        </div>
                    `
                )
                .join("");

    } catch (error) {

        container.innerHTML = `
            <div class="empty-box">
                دریافت پیام‌ها انجام نشد.
            </div>
        `;
    }
}


/* =========================================================
   REPORT
========================================================= */

function openReportPage(
    sellerNumber = "",
    sellerName = ""
) {

    const number =
        $("reportSellerNumber");

    const name =
        $("reportSellerName");


    if (number) {
        number.value =
            sellerNumber;
    }


    if (name) {
        name.value =
            sellerName;
    }


    showPage(
        "report"
    );
}


async function submitReport() {

    const sellerNumber =
        safeText(
            $("reportSellerNumber")?.value
        ).trim();


    const sellerName =
        safeText(
            $("reportSellerName")?.value
        ).trim();


    const reason =
        safeText(
            $("reportReason")?.value
        ).trim();


    const description =
        safeText(
            $("reportDescription")?.value
        ).trim();


    if (!sellerNumber) {

        showToast(
            "شماره زردآلو فروشنده را وارد کنید."
        );

        return;
    }


    if (!reason) {

        showToast(
            "دلیل گزارش را انتخاب کنید."
        );

        return;
    }


    if (!profileIsComplete()) {

        showToast(
            "ابتدا پروفایل خود را کامل کنید."
        );

        return;
    }


    const data = {

        reporter_name:
            getProfileName(),

        reporter_phone:
            getProfilePhone(),

        reporter_zardaloo_number:
            getProfileZardalooNumber(),

        seller_name:
            sellerName,

        seller_zardaloo_number:
            sellerNumber,

        reason:
            reason,

        description:
            description
    };


    try {

        await apiRequest(
            REPORT_FUNCTION_URL,
            {
                method: "POST",

                body:
                    JSON.stringify(data)
            }
        );


        showToast(
            "گزارش با موفقیت ارسال شد."
        );


        if ($("reportDescription")) {
            $("reportDescription").value =
                "";
        }


        showPage(
            "home"
        );

    } catch (error) {

        showToast(
            "ارسال گزارش انجام نشد: " +
            error.message
        );
    }
}


/* =========================================================
   ADMIN
========================================================= */

function loadAdminSession() {

    adminLoggedIn =
        localStorage.getItem(
            ADMIN_KEY
        ) === "true";
}


function saveAdminSession(value) {

    adminLoggedIn =
        Boolean(value);


    if (adminLoggedIn) {

        localStorage.setItem(
            ADMIN_KEY,
            "true"
        );

    } else {

        localStorage.removeItem(
            ADMIN_KEY
        );
    }


    updateAdminVisibility();
}


function updateAdminVisibility() {

    const loginBox =
        $("adminLoginBox");

    const panel =
        $("adminPanel");


    if (!loginBox || !panel) {
        return;
    }


    if (adminLoggedIn) {

        loginBox.classList.add(
            "hidden"
        );

        panel.classList.remove(
            "hidden"
        );

    } else {

        loginBox.classList.remove(
            "hidden"
        );

        panel.classList.add(
            "hidden"
        );
    }
}


async function adminLogin() {

    const number =
        safeText(
            $("adminNumber")?.value
        ).trim();


    const password =
        safeText(
            $("adminPassword")?.value
        );


    if (
        number !== ADMIN_NUMBER ||
        password !== ADMIN_PASSWORD
    ) {

        showToast(
            "شماره یا رمز مدیریت اشتباه است."
        );

        return;
    }


    saveAdminSession(
        true
    );


    showToast(
        "ورود مدیریت موفق بود."
    );


    await loadAdminDashboard();
}


function adminLogout() {

    saveAdminSession(
        false
    );


    showToast(
        "از مدیریت خارج شدید."
    );


    showPage(
        "home"
    );
}


async function loadAdminDashboard() {

    if (!adminLoggedIn) {
        return;
    }


    await Promise.allSettled([
        loadAdminProducts(),
        loadAdminReports()
    ]);
}


async function loadAdminProducts() {

    const container =
        $("adminProductsContainer");


    if (!container) {
        return;
    }


    container.innerHTML =
        `<div class="loading-box">
            در حال دریافت کالاها...
        </div>`;


    try {

        const data =
            await apiRequest(
                ADMIN_FUNCTION_URL +
                "/products",
                {
                    method: "GET"
                }
            );


        const list =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(
                        data?.products
                    )
                    ? data.products
                    : []
                );


        $("adminProductCount").textContent =
            list.length.toLocaleString(
                "fa-IR"
            );


        if (!list.length) {

            container.innerHTML = `
                <div class="empty-box">
                    کالایی وجود ندارد.
                </div>
            `;

            return;
        }


        container.innerHTML =
            list
                .map(
                    product => {

                        const id =
                            getProductId(
                                product
                            );


                        return `

                            <div class="admin-item">

                                <div>

                                    <strong>
                                        ${escapeHTML(
                                            getProductName(
                                                product
                                            )
                                        )}
                                    </strong>

                                    <p>
                                        ${formatPrice(
                                            getProductPrice(
                                                product
                                            )
                                        )}
                                        تومان
                                    </p>

                                    <p>
                                        فروشنده:
                                        ${escapeHTML(
                                            getSellerName(
                                                product
                                            )
                                        )}
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    class="danger-button"
                                    onclick='adminDeleteProduct(
                                        ${JSON.stringify(
                                            String(id)
                                        )}
                                    )'>
                                    حذف
                                </button>

                            </div>
                        `;
                    }
                )
                .join("");

    } catch (error) {

        container.innerHTML = `
            <div class="empty-box">
                دریافت کالاهای مدیریت انجام نشد.
                <br><br>
                ${escapeHTML(
                    error.message
                )}
            </div>
        `;
    }
}


async function adminDeleteProduct(id) {

    if (!adminLoggedIn) {

        showToast(
            "دسترسی غیرمجاز."
        );

        return;
    }


    if (
        !confirm(
            "این کالا حذف شود؟"
        )
    ) {
        return;
    }


    try {

        await apiRequest(
            ADMIN_FUNCTION_URL +
            "/products?id=" +
            encodeURIComponent(id),
            {
                method: "DELETE"
            }
        );


        showToast(
            "کالا حذف شد."
        );


        await loadAdminProducts();

        await loadProducts();

    } catch (error) {

        showToast(
            "حذف کالا انجام نشد: " +
            error.message
        );
    }
}


/* =========================================================
   ADMIN REPORTS
========================================================= */

async function loadAdminReports() {

    const container =
        $("adminReportsContainer");


    if (!container) {
        return;
    }


    try {

        const data =
            await apiRequest(
                ADMIN_FUNCTION_URL +
                "/reports",
                {
                    method: "GET"
                }
            );


        const reports =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(
                        data?.reports
                    )
                    ? data.reports
                    : []
                );


        if (!reports.length) {

            container.innerHTML = `
                <div class="empty-box">
                    گزارشی وجود ندارد.
                </div>
            `;

            return;
        }


        container.innerHTML =
            reports
                .map(
                    report => `

                        <div class="admin-item">

                            <div>

                                <strong>
                                    🚨 گزارش فروشنده
                                </strong>

                                <p>
                                    فروشنده:
                                    ${escapeHTML(
                                        report.seller_name ||
                                        ""
                                    )}
                                </p>

                                <p>
                                    شماره زردآلو:
                                    ${escapeHTML(
                                        report.seller_zardaloo_number ||
                                        ""
                                    )}
                                </p>

                                <p>
                                    دلیل:
                                    ${escapeHTML(
                                        report.reason ||
                                        ""
                                    )}
                                </p>

                                <p>
                                    ${escapeHTML(
                                        report.description ||
                                        ""
                                    )}
                                </p>

                            </div>


                            <button
                                type="button"
                                class="danger-button"
                                onclick='deleteAdminReport(
                                    ${JSON.stringify(
                                        String(
                                            report.id ||
                                            ""
                                        )
                                    )}
                                )'>
                                حذف گزارش
                            </button>

                        </div>
                    `
                )
                .join("");

    } catch (error) {

        container.innerHTML = `
            <div class="empty-box">
                دریافت گزارش‌ها انجام نشد.
                <br><br>
                ${escapeHTML(
                    error.message
                )}
            </div>
        `;
    }
}


async function deleteAdminReport(id) {

    if (!adminLoggedIn) {

        showToast(
            "دسترسی غیرمجاز."
        );

        return;
    }


    if (
        !confirm(
            "این گزارش حذف شود؟"
        )
    ) {
        return;
    }


    try {

        await apiRequest(
            ADMIN_FUNCTION_URL +
            "/report?id=" +
            encodeURIComponent(id),
            {
                method: "DELETE"
            }
        );


        showToast(
            "گزارش حذف شد."
        );


        await loadAdminReports();

    } catch (error) {

        showToast(
            "حذف گزارش انجام نشد: " +
            error.message
        );
    }
}


/* =========================================================
   ADMIN CARTS / USERS
========================================================= */

async function loadAdminCarts() {

    const container =
        $("adminCartsContainer");


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="empty-box">
            اطلاعات سبدها در این نسخه از طریق
            localStorage هر کاربر نگهداری می‌شود.
        </div>
    `;


    const count =
        cart.length;


    const adminCount =
        $("adminCartCount");


    if (adminCount) {

        adminCount.textContent =
            count.toLocaleString(
                "fa-IR"
            );
    }
}


async function loadAdminUsers() {

    const container =
        $("adminUsersContainer");


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="empty-box">
            اطلاعات کاربران عمومی در این نسخه
            مستقیماً از localStorage مرورگر هر کاربر
            قابل جمع‌آوری نیست.
        </div>
    `;


    const count =
        $("adminUserCount");


    if (count) {

        count.textContent =
            "—";
    }
}


function clearAllCart() {

    if (
        !confirm(
            "سبد خرید همین مرورگر پاک شود؟"
        )
    ) {
        return;
    }


    cart = [];

    saveCart();

    updateCartCount();

    renderCart();


    showToast(
        "سبد خرید پاک شد."
    );
}


/* =========================================================
   THEME
========================================================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            THEME_KEY
        );


    document.body.classList.toggle(
        "dark-mode",
        theme === "dark"
    );
}


function toggleTheme() {

    const dark =
        document.body.classList.toggle(
            "dark-mode"
        );


    localStorage.setItem(
        THEME_KEY,
        dark
            ? "dark"
            : "light"
    );
}


/* =========================================================
   DATE / TIME
========================================================= */

function updateDateTime() {

    const now =
        new Date();


    document
        .querySelectorAll(
            "[data-clock]"
        )
        .forEach(element => {

            element.textContent =
                now.toLocaleTimeString(
                    "fa-IR"
                );
        });
}


/* =========================================================
   INITIALIZATION
========================================================= */

function setupMarketFilters() {

    const ids = [

        "marketSearchName",

        "marketMinPrice",

        "marketMaxPrice",

        "marketSellerName",

        "marketGiftFilter"
    ];


    ids.forEach(id => {

        const element =
            $(id);


        if (!element) {
            return;
        }


        element.addEventListener(
            "input",
            applyMarketFilters
        );


        element.addEventListener(
            "change",
            applyMarketFilters
        );
    });
}


function setupProfile() {

    const savedAvatar =
        profile?.avatar;


    if (savedAvatar) {

        selectedAvatar =
            savedAvatar;

        updateAvatarPreview();
    }
}


function setupGift() {

    const checkbox =
        $("isGift");


    if (!checkbox) {
        return;
    }


    checkbox.addEventListener(
        "change",
        toggleGiftDescription
    );


    toggleGiftDescription();
}


function initZardaloo() {

    console.log(
        "🍑 Zardaloo started"
    );


    loadProfile();

    loadCart();

    loadDiscount();

    loadAdminSession();

    loadTheme();


    setupProfile();

    setupAvatarUpload();

    setupMarketFilters();

    setupGift();


    updateProfileUI();

    updateCartCount();

    updateAdminVisibility();

    updateDateTime();


    setInterval(
        updateDateTime,
        1000
    );


    if (
        profileIsComplete()
    ) {

        hideOnboarding();

        showPage(
            "home"
        );

    } else {

        showOnboarding();
    }
}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.showPage =
    showPage;

window.saveProfileFromForm =
    saveProfileFromForm;

window.enterZardaloo =
    saveProfileFromForm;

window.selectAvatar =
    selectAvatar;

window.loadProducts =
    loadProducts;

window.applyMarketFilters =
    applyMarketFilters;

window.registerProduct =
    registerProduct;

window.toggleGiftDescription =
    toggleGiftDescription;

window.openProduct =
    openProduct;

window.addToCart =
    addToCart;

window.removeFromCart =
    removeFromCart;

window.changeCartQuantity =
    changeCartQuantity;

window.applyDiscountCode =
    applyDiscountCode;

window.removeDiscount =
    removeDiscount;

window.startMessage =
    startMessage;

window.sendMessage =
    sendMessage;

window.openReportPage =
    openReportPage;

window.submitReport =
    submitReport;

window.adminLogin =
    adminLogin;

window.adminLogout =
    adminLogout;

window.loadAdminProducts =
    loadAdminProducts;

window.loadAdminReports =
    loadAdminReports;

window.loadAdminCarts =
    loadAdminCarts;

window.loadAdminUsers =
    loadAdminUsers;

window.clearAllCart =
    clearAllCart;

window.adminDeleteProduct =
    adminDeleteProduct;

window.deleteAdminReport =
    deleteAdminReport;

window.toggleTheme =
    toggleTheme;

window.deleteMyProduct =
    deleteMyProduct;


/* =========================================================
   START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initZardaloo
    );

} else {

    initZardaloo();
}
