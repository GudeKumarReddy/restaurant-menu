async function loadMenu() {

    try {

        const response = await fetch(
            `${API_URL}?action=menu&_=${Date.now()}`
        );


        if (!response.ok) {

            throw new Error(
                "Unable to connect to menu server."
            );
        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.error ||
                "Unable to load menu."
            );
        }


        renderRestaurant(
            result.data.restaurant
        );


        renderCategories(
            result.data.categories
        );


        renderMenu(
            result.data.categories,
            result.data.menu
        );


        document
            .getElementById("loading")
            .classList
            .add("hidden");


    } catch (error) {

        console.error(error);


        document
            .getElementById("loading")
            .classList
            .add("hidden");


        const errorBox =
            document.getElementById("error");


        errorBox.textContent =
            error.message;


        errorBox.classList
            .remove("hidden");
    }
}


/* RESTAURANT */

function renderRestaurant(
    restaurant
) {

    document
        .getElementById("restaurantName")
        .textContent =
        restaurant.restaurant_name ||
        "Restaurant";


    document
        .getElementById("restaurantLocation")
        .textContent =
        restaurant.location
            ? `📍 ${restaurant.location}`
            : "";


    document
        .getElementById(
            "restaurantDescription"
        )
        .textContent =
        restaurant.description || "";
}


/* CATEGORIES */

function renderCategories(
    categories
) {

    const container =
        document.getElementById(
            "categories"
        );


    container.innerHTML = "";


    categories.forEach(
        (category, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "category-button";


            button.textContent =
                category.name;


            if (index === 0) {

                button.classList
                    .add("active");
            }


            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".category-button"
                        )
                        .forEach(
                            item =>
                                item.classList
                                    .remove(
                                        "active"
                                    )
                        );


                    button.classList
                        .add("active");


                    const section =
                        document.getElementById(
                            `category-${category.id}`
                        );


                    if (section) {

                        section.scrollIntoView({
                            behavior:
                                "smooth",

                            block:
                                "start"
                        });
                    }
                }
            );


            container.appendChild(button);
        }
    );
}


/* MENU */

function renderMenu(
    categories,
    menu
) {

    const container =
        document.getElementById(
            "menu"
        );


    container.innerHTML = "";


    categories.forEach(
        category => {

            const items =
                menu
                    .filter(
                        item =>
                            Number(
                                item.category_id
                            ) ===
                            Number(
                                category.id
                            )
                    )
                    .sort(
                        (a, b) =>
                            Number(
                                a.sort_order
                            ) -
                            Number(
                                b.sort_order
                            )
                    );


            if (!items.length) {

                return;
            }


            const section =
                document.createElement(
                    "section"
                );


            section.className =
                "category-section";


            section.id =
                `category-${category.id}`;


            const heading =
                document.createElement(
                    "h2"
                );


            heading.className =
                "category-title";


            heading.textContent =
                category.name;


            section.appendChild(
                heading
            );


            items.forEach(
                item => {

                    section.appendChild(
                        createMenuItem(item)
                    );
                }
            );


            container.appendChild(
                section
            );
        }
    );
}


/* MENU ITEM */

function createMenuItem(item) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "menu-item";


    if (item.image_url) {

        const image =
            document.createElement(
                "img"
            );


        image.className =
            "menu-image";


        image.src =
            convertDriveUrl(
                item.image_url
            );


        image.alt =
            item.name;


        image.loading =
            "lazy";


        image.onerror = () => {

            image.remove();
        };


        card.appendChild(
            image
        );
    }


    const info =
        document.createElement(
            "div"
        );


    info.className =
        "menu-info";


    const name =
        document.createElement(
            "div"
        );


    name.className =
        "menu-name";


    name.textContent =
        item.name;


    const description =
        document.createElement(
            "div"
        );


    description.className =
        "menu-description";


    description.textContent =
        item.description || "";


    const price =
        document.createElement(
            "div"
        );


    price.className =
        "menu-price";


    price.textContent =
        `₹${Number(item.price || 0).toFixed(0)}`;


    info.appendChild(name);

    info.appendChild(
        description
    );

    info.appendChild(price);


    card.appendChild(info);


    return card;
}


/* GOOGLE DRIVE IMAGE */

function convertDriveUrl(url) {

    if (!url) {

        return "";
    }


    const match =
        url.match(
            /\/d\/([^/]+)/
        );


    if (match) {

        return (
            "https://drive.google.com/thumbnail?id=" +
            match[1] +
            "&sz=w800"
        );
    }


    return url;
}


loadMenu();
