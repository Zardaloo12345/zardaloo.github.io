const SUPABASE_URL =
    "https://ovqldknqpaiczrddcrxp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_VDZ_tgoMgYRI7K419ieDKw_y29xeXA2";

const PRODUCTS_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/products";

const CART_KEY =
    "zardaloo_cart";

const THEME_KEY =
    "zardaloo_theme";

const DISCOUNT_KEY =
    "zardaloo_discounts";

const ADMIN_PASSWORD =
    "ZardalooAdmin2026";


let products = [];

let cart =
    loadCart();

let discounts =
    loadDiscounts();

let activeDiscount =
    null;


/* =========================
   PAGE NAVIGATION
========================= */

function showPage(pageId) {

    document.querySelectorAll(".page")
        .forEach(page => {

            page.classList.add("hidden");

        });


    const page =
        document.getElementById(pageId);


    if (page) {

        page.classList.remove("hidden");

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (pageId === "cart") {

        renderCart();

    }


    if (pageId === "management") {

        refreshAdmin();

    }
}


/* =========================
   HTML SECURITY
========================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   PRODUCT HELPERS
========================= */

function isGift(product) {

    return (
        product?.is_gift === true ||
        product?.is_gift === "true" ||
        product?.is_gift === 1 ||
        product?.is_gift === "1"
    );
}


function productName(product) {

    return (
        product?.name ??
        product?.title ??
        product?.product_name ??
        "کالای بدون نام"
    );
}


function productId(product) {

    return (
        product?.id ??
        product?.product_id ??
        productName(product)
    );
}


function productPrice(product) {

    const value =
        product?.price ??
        product?.unit_price ??
        0;


    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : 0;
}


/* =========================
   SELLER
========================= */

function sellerName(product) {

    return (
        product?.seller_name ??
        product?.sellerName ??
        product?.seller ??
        product?.vendor_name ??
        product?.vendor ??
        "ثبت نشده"
    );
}


function sellerPhone(product) {

    return (
        product?.seller_phone ??
        product?.sellerPhone ??
        product?.phone ??
        product?.seller_phone_number ??
        product?.contact_phone ??
        "ثبت نشده"
    );
}


/* =========================
   PRICE
========================= */

function formatPrice(value) {

    return (
        Number(value || 0)
            .toLocaleString("fa-IR")
        + " تومان"
    );
}


/* =========================
   PRODUCT CARD
========================= */

function productCard(product) {

    const id =
        String(productId(product));

    const name =
        productName(product);

    const price =
        productPrice(product);

    const seller =
        sellerName(product);

    const phone =
        sellerPhone(product);


    return `

        <article class="product">

            ${
                isGift(product)
                    ? `
                        <span class="gift-badge">
                            🎁 اشانتیون
                        </span>
                    `
                    : ""
            }


            <h3>
                ${escapeHtml(name)}
            </h3>


            <p>
                ${escapeHtml(
                    product?.description ||
                    product?.details ||
                    "کالای موجود در بازار زردآلو"
                )}
            </p>


            <p class="product-price">
                💰 ${formatPrice(price)}
            </p>


            <div class="seller-info">

                <div class="seller-name">

                    👤 فروشنده:

                    <strong>
                        ${escapeHtml(seller)}
                    </strong>

                </div>


                <div class="seller-phone">

                    📞 شماره تماس:

                    <strong>
                        ${escapeHtml(phone)}
                    </strong>

                </div>

            </div>


            <button
                onclick='addToCart(${JSON.stringify(id)})'
            >
                🛒 افزودن به سبد
            </button>

        </article>

    `;
}


/* =========================
   PRODUCTS
========================= */

function renderProducts(list) {

    const container =
        document.getElementById("products");


    if (!container) {
        return;
    }


    if (!list.length) {

        container.innerHTML = `
            <div class="empty">
                کالایی پیدا نشد.
            </div>
        `;

        return;
    }


    container.innerHTML =
        list.map(productCard).join("");
}


function renderGifts(list) {

    const container =
        document.getElementById("giftProducts");


    if (!container) {
        return;
    }


    const gifts =
        list.filter(isGift);


    if (!gifts.length) {

        container.innerHTML = `
            <div class="empty">
                فعلاً کالای دارای اشانتیون
                وجود ندارد.
            </div>
        `;

        return;
    }


    container.innerHTML =
        gifts.map(productCard).join("");
}


/* =========================
   SEARCH
========================= */

function filterProducts() {

    const input =
        document.getElementById("searchInput");


    const query =
        input?.value
            ?.trim()
            ?.toLowerCase() || "";


    if (!query) {

        renderProducts(products);

        return;
    }


    const filtered =
        products.filter(product => {

            const name =
                productName(product)
                    .toLowerCase();


            const description =
                String(
                    product?.description ||
                    product?.details ||
                    ""
                ).toLowerCase();


            const seller =
                String(
                    sellerName(product)
                ).toLowerCase();


            return (
                name.includes(query) ||
                description.includes(query) ||
                seller.includes(query)
            );

        });


    renderProducts(filtered);
}


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

    const productsContainer =
        document.getElementById("products");


    const giftsContainer =
        document.getElementById("giftProducts");


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


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        if (Array.isArray(data)) {

            products = data;

        }

        else if (
            Array.isArray(data?.products)
        ) {

            products =
                data.products;

        }

        else if (
            Array.isArray(data?.data)
        ) {

            products =
                data.data;

        }

        else {

            products = [];

        }


        renderProducts(products);

        renderGifts(products);


    }

    catch (error) {

        console.error(
            "خطا در دریافت کالاها:",
            error
        );


        const message = `
            <div class="empty">
                دریافت کالاها با مشکل مواجه شد.
                <br>
                لطفاً دوباره تلاش کنید.
            </div>
        `;


        if (productsContainer) {

            productsContainer.innerHTML =
                message;

        }


        if (giftsContainer) {

            giftsContainer.innerHTML =
                message;

        }

    }
}


/* =========================
   PRODUCT REGISTRATION
========================= */

async function registerProduct(event) {

    event.preventDefault();


    const message =
        document.getElementById(
            "productFormMessage"
        );


    const product = {

        name:
            document.getElementById(
                "productName"
            ).value.trim(),

        description:
            document.getElementById(
                "productDescription"
            ).value.trim(),

        price:
            Number(
                document.getElementById(
                    "productPrice"
                ).value
            ),

        seller_name:
            document.getElementById(
                "sellerName"
            ).value.trim(),

        seller_phone:
            document.getElementById(
                "sellerPhone"
            ).value.trim(),

        is_gift:
            document.getElementById(
                "isGift"
            ).checked
    };


    if (
        !product.name ||
        !product.description ||
        !product.seller_name ||
        !product.seller_phone ||
        !Number.isFinite(product.price)
    ) {

        message.textContent =
            "لطفاً همه اطلاعات را کامل وارد کنید.";

        return;
    }


    message.textContent =
        "در حال ثبت کالا...";


    try {

        const response =
            await fetch(
                PRODUCTS_FUNCTION_URL,
                {
                    method: "POST",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(product)
                }
            );


        const data =
            await response.json()
                .catch(() => null);


        if (!response.ok) {

            throw new Error(
                data?.error ||
                data?.message ||
                "خطا در ثبت کالا"
            );

        }


        message.textContent =
            "✅ کالا با موفقیت ارسال شد.";


        document
            .getElementById("productForm")
            .reset();


        await loadProducts();


    }

    catch (error) {

        console.error(error);


        message.textContent =
            "❌ ثبت کالا انجام نشد: " +
            error.message;
    }
}


/* =========================
   CART
========================= */

function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                CART_KEY
            );


        if (!saved) {
            return [];
        }


        const parsed =
            JSON.parse(saved);


        return Array.isArray(parsed)
            ? parsed
            : [];

    }

    catch {

        return [];
    }
}


function saveCart() {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );
}


function addToCart(id) {

    const stringId =
        String(id);


    const product =
        products.find(
            item =>
                String(
                    productId(item)
                ) === stringId
        );


    if (!product) {

        alert(
            "کالا پیدا نشد."
        );

        return;
    }


    const existing =
        cart.find(
            item =>
                String(item.id) ===
                stringId
        );


    if (existing) {

        existing.quantity += 1;

    }

    else {

        cart.push({

            id:
                stringId,

            name:
                productName(product),

            price:
                productPrice(product),

            quantity:
                1

        });

    }


    saveCart();


    alert(
        "کالا به سبد خرید اضافه شد! 🛒"
    );


    renderCart();
}


function removeFromCart(id) {

    const stringId =
        String(id);


    cart =
        cart.filter(
            item =>
                String(item.id) !==
                stringId
        );


    saveCart();

    renderCart();
}


/* =========================
   DISCOUNTS
========================= */

function loadDiscounts() {

    try {

        const saved =
            localStorage.getItem(
                DISCOUNT_KEY
            );


        if (!saved) {

            return [
                {
                    code: "ZARDALOO10",
                    percent: 10,
                    active: true
                },

                {
                    code: "ZARDALOO20",
                    percent: 20,
                    active: true
                }
            ];

        }


        const parsed =
            JSON.parse(saved);


        return Array.isArray(parsed)
            ? parsed
            : [];

    }

    catch {

        return [];
    }
}


function saveDiscounts() {

    localStorage.setItem(
        DISCOUNT_KEY,
        JSON.stringify(discounts)
    );
}


function findDiscount(code) {

    const normalized =
        String(code || "")
            .trim()
            .toUpperCase();


    return discounts.find(
        discount =>
            String(
                discount.code
            ).toUpperCase() ===
            normalized &&
            discount.active !== false
    );
}


function applyDiscount() {

    const input =
        document.getElementById(
            "discountInput"
        );


    const message =
        document.getElementById(
            "discountMessage"
        );


    const discount =
        findDiscount(
            input.value
        );


    if (!discount) {

        message.textContent =
            "❌ کد تخفیف معتبر نیست.";

        return;
    }


    activeDiscount =
        discount;


    message.textContent =
        "✅ کد تخفیف " +
        discount.percent +
        "٪ اعمال شد.";

}


function applyCartDiscount() {

    const input =
        document.getElementById(
            "cartDiscountInput"
        );


    const result =
        document.getElementById(
            "discountResult"
        );


    const discount =
        findDiscount(
            input.value
        );


    if (!discount) {

        activeDiscount =
            null;


        result.textContent =
            "❌ کد تخفیف معتبر نیست.";


        renderCart();

        return;
    }


    activeDiscount =
        discount;


    result.textContent =
        "✅ " +
        discount.percent +
        "٪ تخفیف اعمال شد.";


    renderCart();
}


/* =========================
   CART RENDER
========================= */

function renderCart() {

    const container =
        document.getElementById(
            "cartItems"
        );


    const totalElement =
        document.getElementById(
            "cartTotal"
        );


    if (
        !container ||
        !totalElement
    ) {

        return;
    }


    if (!cart.length) {

        container.innerHTML = `
            <div class="empty">
                سبد خرید خالی است.
            </div>
        `;


        totalElement.textContent =
            "مجموع: ۰ تومان";


        return;
    }


    let subtotal =
        0;


    container.innerHTML =
        cart.map(item => {

            const itemTotal =
                Number(item.price || 0) *
                Number(item.quantity || 0);


            subtotal +=
                itemTotal;


            return `

                <div class="cart-item">

                    <div>

                        <strong>
                            ${escapeHtml(
                                item.name
                            )}
                        </strong>

                        <div>
                            تعداد:
                            ${
                                Number(
                                    item.quantity
                                ).toLocaleString(
                                    "fa-IR"
                                )
                            }
                        </div>

                        <div>
                            قیمت واحد:
                            ${formatPrice(
                                item.price
                            )}
                        </div>

                        <div>
                            جمع کالا:
                            ${formatPrice(
                                itemTotal
                            )}
                        </div>

                    </div>


                    <button
                        onclick='removeFromCart(${JSON.stringify(item.id)})'
                    >
                        حذف
                    </button>

                </div>

            `;

        }).join("");


    let discountAmount =
        0;


    if (activeDiscount) {

        discountAmount =
            Math.round(
                subtotal *
                Number(
                    activeDiscount.percent
                ) /
                100
            );

    }


    const finalTotal =
        Math.max(
            0,
            subtotal -
            discountAmount
        );


    totalElement.innerHTML = `

        <div>
            مبلغ کالاها:
            ${formatPrice(subtotal)}
        </div>

        ${
            discountAmount > 0
                ? `
                    <div>
                        تخفیف:
                        ${formatPrice(
                            discountAmount
                        )}
                    </div>
                `
                : ""
        }

        <div>
            مبلغ نهایی:
            ${formatPrice(finalTotal)}
        </div>

    `;
}


/* =========================
   THEME
========================= */

function loadTheme() {

    const saved =
        localStorage.getItem(
            THEME_KEY
        );


    if (saved === "dark") {

        document.body.classList.add(
            "dark"
        );

    }


    updateThemeButton();
}


function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const isDark =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        THEME_KEY,
        isDark
            ? "dark"
            : "light"
    );


    updateThemeButton();
}


function updateThemeButton() {

    const button =
        document.getElementById(
            "themeButton"
        );


    if (!button) {
        return;
    }


    const isDark =
        document.body.classList.contains(
            "dark"
        );


    button.textContent =
        isDark
            ? "☀️"
            : "🌙";


    button.title =
        isDark
            ? "حالت روشن"
            : "حالت تاریک";
}


/* =========================
   ADMIN
========================= */

function loginAdmin() {

    const input =
        document.getElementById(
            "adminPassword"
        );


    const message =
        document.getElementById(
            "adminMessage"
        );


    if (
        input.value ===
        ADMIN_PASSWORD
    ) {

        sessionStorage.setItem(
            "zardaloo_admin",
            "true"
        );


        document
            .getElementById(
                "adminLogin"
            )
            .classList.add(
                "hidden"
            );


        document
            .getElementById(
                "adminPanel"
            )
            .classList.remove(
                "hidden"
            );


        refreshAdmin();


    }

    else {

        message.textContent =
            "❌ رمز مدیریت اشتباه است.";

    }
}


function logoutAdmin() {

    sessionStorage.removeItem(
        "zardaloo_admin"
    );


    document
        .getElementById(
            "adminLogin"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "adminPanel"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "adminPassword"
        ).value = "";
}


function isAdmin() {

    return (
        sessionStorage.getItem(
            "zardaloo_admin"
        ) === "true"
    );
}


function refreshAdmin() {

    if (!isAdmin()) {

        return;
    }


    document
        .getElementById(
            "adminLogin"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "adminPanel"
        )
        .classList.remove(
            "hidden"
        );


    const productCount =
        products.length;


    const giftCount =
        products.filter(
            isGift
        ).length;


    const cartCount =
        cart.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.quantity || 0
                ),
            0
        );


    document
        .getElementById(
            "adminProductCount"
        )
        .textContent =
        productCount.toLocaleString(
            "fa-IR"
        );


    document
        .getElementById(
            "adminGiftCount"
        )
        .textContent =
        giftCount.toLocaleString(
            "fa-IR"
        );


    document
        .getElementById(
            "adminCartCount"
        )
        .textContent =
        cartCount.toLocaleString(
            "fa-IR"
        );


    document
        .getElementById(
            "adminDiscountCount"
        )
        .textContent =
        discounts.length
            .toLocaleString(
                "fa-IR"
            );


    renderAdminProducts();
}


function renderAdminProducts() {

    const container =
        document.getElementById(
            "adminProductsList"
        );


    if (!container) {
        return;
    }


    if (!products.length) {

        container.innerHTML =
            "<p>کالایی وجود ندارد.</p>";

        return;
    }


    container.innerHTML =
        products.map(product => {

            return `

                <div class="admin-product">

                    <div>

                        <strong>
                            ${escapeHtml(
                                productName(product)
                            )}
                        </strong>

                        <br>

                        فروشنده:
                        ${escapeHtml(
                            sellerName(product)
                        )}

                    </div>


                    <div>

                        ${formatPrice(
                            productPrice(product)
                        )}

                    </div>

                </div>

            `;

        }).join("");
}


/* =========================
   ADMIN CART CLEAR
========================= */

function clearCartFromAdmin() {

    cart = [];

    saveCart();

    activeDiscount = null;

    renderCart();

    refreshAdmin();

    alert(
        "سبد خرید محلی پاک شد."
    );
}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadTheme();

        showPage("home");

        loadProducts();

        renderCart();


        const productForm =
            document.getElementById(
                "productForm"
            );


        if (productForm) {

            productForm.addEventListener(
                "submit",
                registerProduct
            );

        }


        if (isAdmin()) {

            refreshAdmin();

        }

    }
);
