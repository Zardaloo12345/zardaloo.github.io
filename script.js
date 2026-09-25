const SUPABASE_URL =
    "https://ovqldknqpaiczrddcrxp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_VDZ_tgoMgYRI7K419ieDKw_y29xeXA2";

const PRODUCTS_FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/products";

const CART_KEY =
    "zardaloo_cart";

let products = [];
let cart = loadCart();


/* =========================
   PAGE NAVIGATION
========================= */

function showPage(pageId) {

    document.querySelectorAll(".page").forEach(page => {
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
}


/* =========================
   SAFE HTML
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

    if (!Number.isFinite(number)) {
        return 0;
    }

    return number;
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
   RENDER PRODUCTS
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


/* =========================
   RENDER GIFTS
========================= */

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
            .toLowerCase() || "";


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

                دریافت کالاها با مشکل
                مواجه شد.

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
   CART
========================= */

function loadCart() {

    try {

        const saved =
            localStorage.getItem(CART_KEY);


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

            id: stringId,

            name:
                productName(product),

            price:
                productPrice(product),

            quantity: 1
        });
    }


    saveCart();


    alert(
        "کالا به سبد خرید اضافه شد! 🛒"
    );
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


    let total = 0;


    container.innerHTML =
        cart.map(item => {

            const itemTotal =
                Number(item.price || 0) *
                Number(item.quantity || 0);


            total += itemTotal;


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
                            ${formatPrice(
                                item.price
                            )}
                        </div>

                        <div>
                            جمع این کالا:
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


    totalElement.textContent =
        "مجموع: " +
        formatPrice(total);
}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        showPage("home");

        loadProducts();

        renderCart();

    }
);
