/* =========================================================
   PROFILE STORAGE
========================================================= */

const PROFILE_KEY = "zardaloo_profile_final_v2";

let profile = null;
let selectedAvatar = "";
let uploadedAvatar = "";


/* =========================================================
   LOAD PROFILE
========================================================= */

function loadProfile() {
    try {
        const saved = localStorage.getItem(PROFILE_KEY);

        if (!saved) {
            profile = null;
            return;
        }

        const data = JSON.parse(saved);

        if (
            data &&
            typeof data === "object"
        ) {
            profile = data;
        } else {
            profile = null;
        }

    } catch (error) {

        console.error(
            "Profile load error:",
            error
        );

        profile = null;
    }
}


/* =========================================================
   SAVE PROFILE
========================================================= */

function saveProfile() {

    if (!profile) {
        return false;
    }

    try {

        localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify(profile)
        );

        console.log(
            "PROFILE SAVED:",
            profile
        );

        return true;

    } catch (error) {

        console.error(
            "Profile save error:",
            error
        );

        showToast(
            "ذخیره پروفایل انجام نشد."
        );

        return false;
    }
}


/* =========================================================
   PROFILE DATA
========================================================= */

function getProfileName() {

    return String(
        profile?.name || ""
    ).trim();
}


function getProfilePhone() {

    return String(
        profile?.phone || ""
    ).trim();
}


function getProfileZardalooNumber() {

    return String(
        profile?.zardalooNumber || ""
    ).trim();
}


function getProfileAvatar() {

    return (
        profile?.avatar ||
        "👤"
    );
}


function profileIsComplete() {

    return (
        getProfileName() !== "" &&
        getProfilePhone() !== "" &&
        getProfileZardalooNumber() !== ""
    );
}


/* =========================================================
   SAVE PROFILE FROM FORM
========================================================= */

function saveProfileFromForm() {

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


    const name =
        String(
            nameInput?.value || ""
        ).trim();


    const phone =
        String(
            phoneInput?.value || ""
        ).trim();


    const zardalooNumber =
        String(
            numberInput?.value || ""
        ).trim();


    if (!name) {

        showToast(
            "نام خود را وارد کنید."
        );

        return;
    }


    if (!phone) {

        showToast(
            "شماره تماس خود را وارد کنید."
        );

        return;
    }


    if (!zardalooNumber) {

        showToast(
            "شماره زردآلو خود را وارد کنید."
        );

        return;
    }


    /*
       اگر عکس گالری انتخاب شده باشد،
       همان عکس ذخیره می‌شود.
       در غیر این صورت آواتار انتخابی.
    */

    const avatar =
        uploadedAvatar ||
        selectedAvatar ||
        profile?.avatar ||
        "👤";


    profile = {

        name: name,

        phone: phone,

        zardalooNumber:
            zardalooNumber,

        avatar: avatar
    };


    const saved =
        saveProfile();


    if (!saved) {
        return;
    }


    /*
       فرم را هم بلافاصله به‌روزرسانی کن
    */

    fillProfileForm();

    updateProfileUI();

    hideOnboarding();

    showPage("home");


    showToast(
        "✅ اطلاعات پروفایل ذخیره شد."
    );
}


/* =========================================================
   FILL PROFILE FORM
========================================================= */

function fillProfileForm() {

    if (!profile) {
        return;
    }


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


    if (nameInput) {

        nameInput.value =
            getProfileName();
    }


    if (phoneInput) {

        phoneInput.value =
            getProfilePhone();
    }


    if (numberInput) {

        numberInput.value =
            getProfileZardalooNumber();
    }


    selectedAvatar =
        profile.avatar || "👤";


    uploadedAvatar =
        (
            typeof profile.avatar === "string" &&
            profile.avatar.startsWith(
                "data:image/"
            )
        )
        ? profile.avatar
        : "";


    updateAvatarPreview();
}


/* =========================================================
   AVATAR PREVIEW
========================================================= */

function updateAvatarPreview() {

    const preview =
        document.getElementById(
            "profileAvatarPreview"
        );


    if (!preview) {
        return;
    }


    const avatar =
        profile?.avatar ||
        uploadedAvatar ||
        selectedAvatar ||
        "👤";


    if (
        typeof avatar === "string" &&
        avatar.startsWith("data:image/")
    ) {

        preview.innerHTML = `
            <img
                src="${avatar}"
                alt="تصویر پروفایل"
            >
        `;

    } else {

        preview.textContent =
            avatar;
    }


    /*
       مشخص کردن آواتار انتخاب‌شده
    */

    document
        .querySelectorAll(
            ".avatar-option"
        )
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.dataset.avatar === avatar
            );
        });
}


/* =========================================================
   SELECT EMOJI AVATAR
========================================================= */

function selectAvatar(avatar) {

    selectedAvatar =
        String(avatar);

    uploadedAvatar = "";

    if (!profile) {
        profile = {};
    }

    profile.avatar =
        selectedAvatar;

    updateAvatarPreview();
}


/* =========================================================
   IMAGE FROM GALLERY
========================================================= */

async function setupAvatarUpload() {

    const input =
        document.getElementById(
            "profileImage"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "change",
        async function(event) {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showToast(
                    "فقط فایل تصویری انتخاب کنید."
                );

                return;
            }


            try {

                const imageData =
                    await resizeImage(
                        file,
                        400
                    );


                uploadedAvatar =
                    imageData;

                selectedAvatar = "";


                if (!profile) {
                    profile = {};
                }


                profile.avatar =
                    imageData;


                updateAvatarPreview();


                /*
                   عکس را همان لحظه ذخیره کن
                   تا با رفرش هم باقی بماند.
                */

                if (
                    profile.name &&
                    profile.phone &&
                    profile.zardalooNumber
                ) {

                    saveProfile();
                }


                showToast(
                    "🖼️ تصویر پروفایل ذخیره شد."
                );

            } catch (error) {

                console.error(
                    error
                );

                showToast(
                    "ذخیره تصویر انجام نشد."
                );
            }
        }
    );
}


/* =========================================================
   RESIZE IMAGE
========================================================= */

function resizeImage(
    file,
    maxSize = 400
) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    const image =
                        new Image();


                    image.onload =
                        function() {

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
                        function() {

                            reject(
                                new Error(
                                    "خطا در خواندن تصویر"
                                )
                            );
                        };


                    image.src =
                        event.target.result;
                };


            reader.onerror =
                function() {

                    reject(
                        new Error(
                            "خطا در خواندن فایل"
                        )
                    );
                };


            reader.readAsDataURL(file);
        }
    );
}


/* =========================================================
   UPDATE ALL PROFILE UI
========================================================= */

function updateProfileUI() {

    const name =
        getProfileName();

    const phone =
        getProfilePhone();

    const number =
        getProfileZardalooNumber();

    const avatar =
        getProfileAvatar();


    /* ---------- HOME ---------- */

    const homeName =
        document.getElementById(
            "homeName"
        );

    const homePhone =
        document.getElementById(
            "homePhone"
        );

    const homeNumber =
        document.getElementById(
            "homeZardaloo"
        );


    if (homeName) {
        homeName.textContent =
            name || "کاربر زردآلو";
    }


    if (homePhone) {
        homePhone.textContent =
            phone || "—";
    }


    if (homeNumber) {
        homeNumber.textContent =
            number || "—";
    }


    /* ---------- HOME IMAGE ---------- */

    setAvatarElement(
        document.getElementById(
            "homeProfileImage"
        ),
        avatar
    );


    /* ---------- HEADER IMAGE ---------- */

    setAvatarElement(
        document.getElementById(
            "headerProfileImage"
        ),
        avatar
    );


    /* ---------- REGISTER ---------- */

    const sellerName =
        document.getElementById(
            "sellerName"
        );

    const sellerPhone =
        document.getElementById(
            "sellerPhone"
        );

    const sellerNumber =
        document.getElementById(
            "sellerZardalooNumber"
        );


    if (sellerName) {
        sellerName.value =
            name;
    }


    if (sellerPhone) {
        sellerPhone.value =
            phone;
    }


    if (sellerNumber) {
        sellerNumber.value =
            number;
    }


    updateAvatarPreview();
}


/* =========================================================
   AVATAR ELEMENT
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
        avatar.startsWith(
            "data:image/"
        )
    ) {

        element.innerHTML = `
            <img
                src="${avatar}"
                alt="تصویر پروفایل"
            >
        `;

    } else {

        element.textContent =
            avatar || "👤";
    }
}


/* =========================================================
   ONBOARDING
========================================================= */

function showOnboarding() {

    const onboarding =
        document.getElementById(
            "onboarding"
        );

    const app =
        document.getElementById(
            "app"
        );


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


    /*
       اگر اطلاعات قبلاً ذخیره شده،
       داخل فرم هم نشان بده.
    */

    fillProfileForm();
}


function hideOnboarding() {

    const onboarding =
        document.getElementById(
            "onboarding"
        );

    const app =
        document.getElementById(
            "app"
        );


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
   START
========================================================= */

function initProfileSystem() {

    loadProfile();

    setupAvatarUpload();

    fillProfileForm();

    updateProfileUI();


    if (
        profileIsComplete()
    ) {

        hideOnboarding();

    } else {

        showOnboarding();
    }
}


/* =========================================================
   GLOBAL
========================================================= */

window.saveProfileFromForm =
    saveProfileFromForm;

window.selectAvatar =
    selectAvatar;

window.loadProfile =
    loadProfile;

window.updateProfileUI =
    updateProfileUI;


/* =========================================================
   START AFTER HTML
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initProfileSystem
    );

} else {

    initProfileSystem();
}
