```javascript
const STORAGE_KEY = "zardaloo_profile";

/* -----------------------------
   شروع برنامه
----------------------------- */

document.addEventListener("DOMContentLoaded", function () {
    loadProfile();
});


/* -----------------------------
   بررسی اطلاعات ذخیره‌شده
----------------------------- */

function loadProfile() {
    const savedProfile = localStorage.getItem(STORAGE_KEY);

    if (savedProfile) {
        try {
            const profile = JSON.parse(savedProfile);

            if (
                profile &&
                profile.name &&
                profile.phone &&
                profile.zardalooNumber
            ) {
                enterApp(profile);
                return;
            }
        } catch (error) {
            console.error("خطا در خواندن پروفایل:", error);
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    showLogin();
}


/* -----------------------------
   ورود کاربر
----------------------------- */

function saveProfile() {
    const nameInput = document.getElementById("userName");
    const phoneInput = document.getElementById("userPhone");
    const numberInput = document.getElementById("zardalooNumber");

    if (!nameInput || !phoneInput || !numberInput) {
        console.error("فیلدهای ورود پیدا نشدند.");
        return;
    }

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const zardalooNumber = numberInput.value.trim();

    if (name === "") {
        alert("لطفاً نام خود را وارد کنید.");
        nameInput.focus();
        return;
    }

    if (phone === "") {
        alert("لطفاً شماره تماس خود را وارد کنید.");
        phoneInput.focus();
        return;
    }

    if (zardalooNumber === "") {
        alert("لطفاً شماره زردآلو خود را وارد کنید.");
        numberInput.focus();
        return;
    }

    const profile = {
        name: name,
        phone: phone,
        zardalooNumber: zardalooNumber
    };

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(profile)
        );
    } catch (error) {
        console.error("خطا در ذخیره اطلاعات:", error);
        alert("ذخیره اطلاعات انجام نشد. لطفاً دوباره تلاش کنید.");
        return;
    }

    enterApp(profile);
}


/* -----------------------------
   ورود واقعی به برنامه
----------------------------- */

function enterApp(profile) {
    const loginPage = document.getElementById("loginPage");
    const app = document.getElementById("app");

    if (!loginPage || !app) {
        console.error("loginPage یا app پیدا نشد.");
        return;
    }

    /* مخفی کردن صفحه ورود */
    loginPage.classList.add("hidden");

    /* نمایش خود برنامه */
    app.classList.remove("hidden");

    /* اطلاعات حساب */
    updateAccount(profile);

    /* صفحه خانه */
    showPage("home");
}


/* -----------------------------
   نمایش صفحه ورود
----------------------------- */

function showLogin() {
    const loginPage = document.getElementById("loginPage");
    const app = document.getElementById("app");

    if (loginPage) {
        loginPage.classList.remove("hidden");
    }

    if (app) {
        app.classList.add("hidden");
    }
}


/* -----------------------------
   نمایش صفحات برنامه
----------------------------- */

function showPage(pageName) {
    const pages = document.querySelectorAll(".page");

    pages.forEach(function (page) {
        page.classList.remove("active");
    });

    const targetPage = document.getElementById(pageName);

    if (!targetPage) {
        console.error("صفحه پیدا نشد:", pageName);
        return;
    }

    targetPage.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* -----------------------------
   نمایش اطلاعات حساب
----------------------------- */

function updateAccount(profile) {
    const accountName = document.getElementById("accountName");
    const accountPhone = document.getElementById("accountPhone");
    const accountNumber = document.getElementById("accountNumber");

    if (accountName) {
        accountName.textContent = profile.name;
    }

    if (accountPhone) {
        accountPhone.textContent =
            "شماره تماس: " + profile.phone;
    }

    if (accountNumber) {
        accountNumber.textContent =
            "شماره زردآلو: " + profile.zardalooNumber;
    }
}


/* -----------------------------
   خروج از حساب
----------------------------- */

function logout() {
    const answer = confirm(
        "آیا مطمئن هستید که می‌خواهید از حساب خارج شوید؟"
    );

    if (!answer) {
        return;
    }

    localStorage.removeItem(STORAGE_KEY);

    const nameInput = document.getElementById("userName");
    const phoneInput = document.getElementById("userPhone");
    const numberInput = document.getElementById("zardalooNumber");

    if (nameInput) {
        nameInput.value = "";
    }

    if (phoneInput) {
        phoneInput.value = "";
    }

    if (numberInput) {
        numberInput.value = "";
    }

    showLogin();
}


/* -----------------------------
   اجازه ورود با Enter
----------------------------- */

document.addEventListener("keydown", function (event) {
    if (event.key !== "Enter") {
        return;
    }

    const loginPage = document.getElementById("loginPage");

    if (
        loginPage &&
        !loginPage.classList.contains("hidden")
    ) {
        saveProfile();
    }
});
```
