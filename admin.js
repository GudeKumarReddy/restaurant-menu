let adminPassword = "";

let state = null;


const $ = id =>
    document.getElementById(id);


/* API */

async function api(
    action,
    payload = {}
) {

    const body =
        new URLSearchParams({

            action,

            password:
                adminPassword,

            ...payload

        });


    const response =
        await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded;charset=UTF-8"
                },

                body
            }
        );


    if (!response.ok) {

        throw new Error(
            "Server request failed."
        );
    }


    const result =
        await response.json();


    if (!result.success) {

        throw new Error(
            result.error ||
            "Request failed."
        );
    }


    return result.data;
}


/* LOGIN */

async function login() {

    adminPassword =
        $("password").value;


    $("loginMessage")
        .textContent = "";


    try {

        state =
            await api(
                "admin_data"
            );


        $("loginCard")
            .classList
            .add("hidden");


        $("dashboard")
            .classList
            .remove("hidden");


        renderAll();


    } catch (error) {

        adminPassword = "";


        $("loginMessage")
            .textContent =
            error.message;
    }
}


/* RENDER */

function renderAll() {

    renderSettings();

    renderCategories();

    renderCategorySelect();

    renderItems();
}


/* SETTINGS */

function renderSettings() {

    const restaurant =
        state.restaurant || {};


    $("restaurant_name").value =
        restaurant.restaurant_name ||
        "";


    $("location").value =
        restaurant.location ||
        "";


    $("phone").value =
        restaurant.phone ||
        "";


    $("description").value =
        restaurant.description ||
        "";
}


async function saveSettings() {

    try {

        state =
            await api(
                "save_settings",
                {

                    restaurant_name:
                        $("restaurant_name")
                            .value
                            .trim(),

                    location:
                        $("location")
                            .value
                            .trim(),

                    phone:
                        $("phone")
                            .value
                            .trim(),

                    description:
                        $("description")
                            .value
                            .trim()
                }
            );


        $("settingsMessage")
            .textContent =
            "Settings saved.";

        $("settingsMessage")
            .className =
            "success";


        renderAll();


    } catch (error) {

        $("settingsMessage")
            .textContent =
            error.message;

        $("settingsMessage")
            .className =
            "error";
    }
}


/* CATEGORIES */

function renderCategories() {

    const box =
        $("categoryList");


    box.innerHTML = "";


    state.categories.forEach(
        category => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "row";


            row.innerHTML = `

                <div class="row-info">

                    <strong>
                        ${escapeHtml(
                            category.name
                        )}
                    </strong>

                    <div class="small">

                        Order:
                        ${category.sort_order}

                        |

                        ${
                            category.active
                                ? "Active"
                                : "Hidden"
                        }

                    </div>

                </div>


                <div>

                    <button
                        onclick="editCategory(
                            ${category.id}
                        )"
                    >
                        Edit
                    </button>


                    <button
                        class="secondary"
                        onclick="deleteCategory(
                            ${category.id}
                        )"
                    >
                        Delete
                    </button>

                </div>
            `;


            box.appendChild(row);
        }
    );
}


function renderCategorySelect() {

    const select =
        $("itemCategory");


    select.innerHTML = "";


    state.categories
        .filter(
            category =>
                category.active
        )
        .forEach(
            category => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    category.id;


                option.textContent =
                    category.name;


                select.appendChild(
                    option
                );
            }
        );
}


function editCategory(id) {

    const category =
        state.categories.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!category) {

        return;
    }


    $("categoryId").value =
        category.id;


    $("categoryName").value =
        category.name;


    $("categoryOrder").value =
        category.sort_order;


    $("categoryActive").checked =
        category.active;


    $("cancelCategory")
        .classList
        .remove("hidden");
}


async function saveCategory(
    event
) {

    event.preventDefault();


    try {

        state =
            await api(
                "save_category",
                {

                    id:
                        $("categoryId")
                            .value,

                    name:
                        $("categoryName")
                            .value
                            .trim(),

                    sort_order:
                        $("categoryOrder")
                            .value,

                    active:
                        $("categoryActive")
                            .checked
                            ? "TRUE"
                            : "FALSE"
                }
            );


        resetCategory();

        renderAll();


    } catch (error) {

        alert(error.message);
    }
}


async function deleteCategory(
    id
) {

    if (
        !confirm(
            "Delete this category?"
        )
    ) {

        return;
    }


    try {

        state =
            await api(
                "delete_category",
                { id }
            );


        renderAll();


    } catch (error) {

        alert(error.message);
    }
}


function resetCategory() {

    $("categoryId").value =
        "";


    $("categoryName").value =
        "";


    $("categoryOrder").value =
        Math.max(
            1,
            state.categories.length + 1
        );


    $("categoryActive").checked =
        true;


    $("cancelCategory")
        .classList
        .add("hidden");
}


/* ITEMS */

function renderItems() {

    const box =
        $("itemList");


    box.innerHTML = "";


    state.menu.forEach(
        item => {

            const category =
                state.categories.find(
                    c =>
                        Number(c.id) ===
                        Number(
                            item.category_id
                        )
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "row";


            const image =
                item.image_url
                    ? `
                        <img
                            class="thumb"
                            src="${driveImageUrl(
                                item.image_url
                            )}"
                        >
                    `
                    : "";


            row.innerHTML = `

                <div class="row-info">

                    ${image}

                    <strong>
                        ${escapeHtml(
                            item.name
                        )}
                    </strong>

                    <div class="small">

                        ${
                            category
                                ? escapeHtml(
                                    category.name
                                  )
                                : "Unknown"
                        }

                        ·

                        ₹${Number(
                            item.price
                        ).toFixed(0)}

                        ·

                        ${
                            item.available
                                ? "Available"
                                : "Unavailable"
                        }

                    </div>

                </div>


                <div>

                    <button
                        onclick="editItem(
                            ${item.id}
                        )"
                    >
                        Edit
                    </button>


                    <button
                        class="secondary"
                        onclick="deleteItem(
                            ${item.id}
                        )"
                    >
                        Delete
                    </button>

                </div>
            `;


            box.appendChild(row);
        }
    );
}


function editItem(id) {

    const item =
        state.menu.find(
            x =>
                Number(x.id) ===
                Number(id)
        );


    if (!item) {

        return;
    }


    $("itemId").value =
        item.id;


    $("itemName").value =
        item.name;


    $("itemCategory").value =
        item.category_id;


    $("itemDescription").value =
        item.description || "";


    $("itemPrice").value =
        item.price;


    $("itemOrder").value =
        item.sort_order;


    $("itemAvailable").checked =
        item.available;


    $("itemPhoto").value =
        "";


    $("cancelItem")
        .classList
        .remove("hidden");
}


async function saveItem(
    event
) {

    event.preventDefault();


    $("itemMessage")
        .textContent =
        "Saving...";


    try {

        const file =
            $("itemPhoto")
                .files[0];


        let imageBase64 =
            "";


        let imageName =
            "";


        if (file) {

            if (
                file.size >
                5 * 1024 * 1024
            ) {

                throw new Error(
                    "Photo must be 5 MB or smaller."
                );
            }


            imageBase64 =
                await fileToBase64(
                    file
                );


            imageName =
                file.name;
        }


        state =
            await api(
                "save_item",
                {

                    id:
                        $("itemId")
                            .value,

                    category_id:
                        $("itemCategory")
                            .value,

                    name:
                        $("itemName")
                            .value
                            .trim(),

                    description:
                        $("itemDescription")
                            .value
                            .trim(),

                    price:
                        $("itemPrice")
                            .value,

                    sort_order:
                        $("itemOrder")
                            .value,

                    available:
                        $("itemAvailable")
                            .checked
                            ? "TRUE"
                            : "FALSE",

                    image_base64:
                        imageBase64,

                    image_name:
                        imageName
                }
            );


        $("itemMessage")
            .textContent =
            "Item saved.";

        $("itemMessage")
            .className =
            "success";


        resetItem();

        renderAll();


    } catch (error) {

        $("itemMessage")
            .textContent =
            error.message;

        $("itemMessage")
            .className =
            "error";
    }
}


async function deleteItem(
    id
) {

    if (
        !confirm(
            "Delete this menu item?"
        )
    ) {

        return;
    }


    try {

        state =
            await api(
                "delete_item",
                { id }
            );


        renderAll();


    } catch (error) {

        alert(error.message);
    }
}


function resetItem() {

    $("itemId").value =
        "";


    $("itemName").value =
        "";


    $("itemDescription").value =
        "";


    $("itemPrice").value =
        "";


    $("itemPhoto").value =
        "";


    $("itemOrder").value =
        1;


    $("itemAvailable").checked =
        true;


    $("cancelItem")
        .classList
        .add("hidden");
}


/* UTILITIES */

function fileToBase64(
    file
) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                () => {

                    resolve(
                        reader.result
                            .split(",")[1]
                    );
                };


            reader.onerror =
                reject;


            reader.readAsDataURL(
                file
            );
        }
    );
}


function driveImageUrl(
    url
) {

    const match =
        String(url || "")
            .match(
                /\/d\/([^/]+)/
            );


    if (match) {

        return (
            "https://drive.google.com/thumbnail?id=" +
            match[1] +
            "&sz=w400"
        );
    }


    return url;
}


function escapeHtml(
    value
) {

    return String(
        value ?? ""
    ).replace(
        /[&<>"']/g,
        character => ({

            "&":
                "&amp;",

            "<":
                "&lt;",

            ">":
                "&gt;",

            '"':
                "&quot;",

            "'":
                "&#039;"

        }[character])
    );
}


/* EVENTS */

$("loginBtn")
    .addEventListener(
        "click",
        login
    );


$("password")
    .addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                login();
            }
        }
    );


$("logoutBtn")
    .addEventListener(
        "click",
        () => {

            adminPassword =
                "";

            state =
                null;


            $("dashboard")
                .classList
                .add("hidden");


            $("loginCard")
                .classList
                .remove("hidden");


            $("password").value =
                "";
        }
    );


$("saveSettingsBtn")
    .addEventListener(
        "click",
        saveSettings
    );


$("categoryForm")
    .addEventListener(
        "submit",
        saveCategory
    );


$("cancelCategory")
    .addEventListener(
        "click",
        resetCategory
    );


$("itemForm")
    .addEventListener(
        "submit",
        saveItem
    );


$("cancelItem")
    .addEventListener(
        "click",
        resetItem
    );
