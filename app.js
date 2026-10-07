let cart = [];


function addToCart(name, price) {

    cart.push({
        name: name,
        price: Number(price)
    });

    updateCart();
}


function removeItem(index) {

    cart.splice(index, 1);

    updateCart();
}


function updateCart() {

    const cartItems =
        document.getElementById("cartItems");

    const totalElement =
        document.getElementById("total");


    if (!cartItems || !totalElement) {
        return;
    }


    if (cart.length === 0) {

        cartItems.innerHTML =
            "<p>Grozs ir tukšs.</p>";

        totalElement.textContent =
            "0.00";

        return;
    }


    let total = 0;


    cartItems.innerHTML =
        cart.map((item, index) => {

            total += Number(item.price);

            return `
                <div class="cart-item">

                    <span>
                        ${item.name}
                        —
                        €${Number(item.price).toFixed(2)}
                    </span>

                    <button
                        onclick="removeItem(${index})"
                    >
                        ✕
                    </button>

                </div>
            `;

        }).join("");


    totalElement.textContent =
        total.toFixed(2);
}


async function placeOrder() {

    if (cart.length === 0) {

        alert("Grozs ir tukšs!");

        return;
    }


    const orderNumber =
        Math.floor(
            100 + Math.random() * 900
        );


    const total =
        cart.reduce(
            (sum, item) =>
                sum + Number(item.price),
            0
        );


    const { error } =
        await supabaseClient
            .from("orders")
            .insert({

                order_number:
                    "#" + orderNumber,

                items:
                    cart,

                total:
                    total,

                status:
                    "Gatavošanā"

            });


    if (error) {

        console.error(error);

        alert(
            "Neizdevās nosūtīt pasūtījumu.\n\n" +
            error.message
        );

        return;
    }


    const orderNumberElement =
        document.getElementById(
            "orderNumber"
        );


    const confirmation =
        document.getElementById(
            "confirmation"
        );


    if (orderNumberElement) {

        orderNumberElement.textContent =
            "#" + orderNumber;
    }


    if (confirmation) {

        confirmation.classList.remove(
            "hidden"
        );
    }


    cart = [];

    updateCart();
}


async function loadOrders() {

    const ordersElement =
        document.getElementById(
            "orders"
        );


    if (!ordersElement) {
        return;
    }


    const { data, error } =
        await supabaseClient
            .from("orders")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        ordersElement.innerHTML = `
            <div class="order">

                <h2>⚠️ Kļūda</h2>

                <p>
                    Neizdevās ielādēt
                    pasūtījumus.
                </p>

                <p>
                    ${error.message}
                </p>

            </div>
        `;

        return;
    }


    if (!data || data.length === 0) {

        ordersElement.innerHTML =
            "<p>Nav pasūtījumu.</p>";

        return;
    }


    ordersElement.innerHTML =
        data.map(order => {

            let itemsHTML = "";


            if (Array.isArray(order.items)) {

                itemsHTML =
                    order.items.map(item => {

                        return `
                            <li>
                                ${item.name}
                                —
                                €${Number(
                                    item.price
                                ).toFixed(2)}
                            </li>
                        `;

                    }).join("");
            }


            let statusHTML = "";


            if (
                order.status ===
                "Gatavošanā"
            ) {

                statusHTML = `
                    <p>
                        Statuss:
                        <strong>
                            🟡 Gatavošanā
                        </strong>
                    </p>

                    <button
                        onclick="markReady('${order.id}')"
                    >
                        🟢 Gatavs
                    </button>
                `;

            } else if (
                order.status ===
                "Gatavs"
            ) {

                statusHTML = `
                    <p>
                        Statuss:
                        <strong>
                            🟢 Gatavs
                        </strong>
                    </p>
                `;

            } else {

                statusHTML = `
                    <p>
                        Statuss:
                        <strong>
                            ${order.status}
                        </strong>
                    </p>
                `;
            }


            return `
                <div class="order">

                    <h2>
                        Pasūtījums
                        ${order.order_number}
                    </h2>

                    <ul>
                        ${itemsHTML}
                    </ul>

                    <h3>
                        Kopā:
                        €${Number(
                            order.total
                        ).toFixed(2)}
                    </h3>

                    ${statusHTML}

                </div>
            `;

        }).join("");
}


async function markReady(id) {

    const { error } =
        await supabaseClient
            .from("orders")
            .update({

                status:
                    "Gatavs"

            })
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(error);

        alert(
            "Neizdevās mainīt statusu.\n\n" +
            error.message
        );

        return;
    }


    loadOrders();
}


updateCart();

loadOrders();


setInterval(
    loadOrders,
    3000
);