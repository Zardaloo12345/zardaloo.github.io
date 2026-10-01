```javascript
const STORAGE_KEY = "zardaloo_profile";

document.addEventListener("DOMContentLoaded", function () {
    checkSavedProfile();
});

function checkSavedProfile() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
        try {
            const profile = JSON.parse(saved);

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
            console.error("خطا در خواندن اطلاعات کاربر:", error);
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    showLogin();
}

function saveProfile() {
    const name = document.getElementById("userName").value.trim();
    const phone = document.getElementById("userPhone").value.trim();
    const zardalooNumber =
        document.getElementById("zardalooNumber").value.trim();

    if (!name) {
        alert("لطفاً نام خود را وارد کنید.");
        return;
    }

    if (!phone) {
        alert("لطفاً شماره تماس خود را وارد کنید.");
        return;
    }

    if (!zardalooNumber) {
        alert("لطفاً شماره زردآلو خود را وارد کنید.");
        return;
    }

    const profile = {
        name: name,
        phone: phone,
        zardalooNumber: zardalooNumber
    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(profile)
    );

    enterApp(profile);
}

function enterApp(profile) {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    updateAccount(profile);

    showPage("home");
}

function showLogin() {
    document.getElementById("loginPage").classList.remove("hidden");
    document.getElementById("app").classList.add("hidden");
}

function updateAccount(profile) {
    const nameElement = document.getElementById("accountName");
    const phoneElement = document.getElementById("accountPhone");
    const numberElement = document.getElementById("accountNumber");

    if (nameElement) {
        nameElement.textContent = profile.name;
    }

    if (phoneElement) {
        phoneElement.textContent =
            "شماره تماس: " + profile.phone;
    }

    if (numberElement) {
        numberElement.textContent =
            "شماره زردآلو: " + profile.zardalooNumber;
    }
}

function showPage(pageName) {
    const pages = document.querySelectorAll(".page");

    pages.forEach(function (page) {
        page.classList.remove("active");
    });

    const target = document.getElementById(pageName);

    if (target) {
        target.classList.add("active");
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}

function logout() {
    const confirmed = confirm(
        "آیا مطمئن هستید که می‌خواهید از حساب خارج شوید؟"
    );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(STORAGE_KEY);

    document.getElementById("userName").value = "";
    document.getElementById("userPhone").value = "";
    document.getElementById("zardalooNumber").value = "";

    showLogin();
}
```
