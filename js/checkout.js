
// AFTERHOURS — DEMO CHECKOUT

const form = document.querySelector("#checkoutForm");
const errorMessage = document.querySelector("#checkoutError");
const itemsContainer = document.querySelector("#checkoutItems");
const subtotalElement = document.querySelector("#checkoutSubtotal");
const shippingElement = document.querySelector("#checkoutShipping");
const totalElement = document.querySelector("#checkoutTotal");
const successSection = document.querySelector("#orderSuccess");
const referenceElement = document.querySelector("#orderReference");
const successTotalElement = document.querySelector("#successTotal");

function readCart() {
    try {
        const data = JSON.parse(
            localStorage.getItem("afterhours-cart") || "[]"
        );

        if (!Array.isArray(data)) return [];

        return data.filter(item =>
            item &&
            typeof item.name === "string" &&
            typeof item.image === "string" &&
            Number.isFinite(Number(item.price)) &&
            Number(item.price) >= 0 &&
            Number.isInteger(Number(item.quantity)) &&
            Number(item.quantity) > 0
        ).map(item => ({
            ...item,
            price: Number(item.price),
            quantity: Math.floor(Number(item.quantity))
        }));
    } catch {
        return [];
    }
}

function money(value) {
    return `€ ${value.toFixed(2)}`;
}

function getShipping() {
    const selected = document.querySelector(
        'input[name="shipping"]:checked'
    );

    return selected?.value === "express" ? 25 : 10;
}

function renderSummary() {
    const cart = readCart();

    itemsContainer.innerHTML = "";

    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "checkout-item";

        const image = document.createElement("img");
        image.src = item.image;
        image.alt = item.name;

        const details = document.createElement("div");

        const name = document.createElement("p");
        name.className = "checkout-item-name";
        name.textContent = item.name;

        const meta = document.createElement("p");
        meta.className = "checkout-item-meta";
        meta.textContent =
    `SIZE: ${["S", "M", "L", "XL"].includes(String(item.size).toUpperCase())
        ? item.size
        : `EU ${item.size}`} · QTY: ${item.quantity}`;

        details.append(name, meta);

        const price = document.createElement("strong");
        price.className = "checkout-item-price";
        price.textContent = money(item.price * item.quantity);

        row.append(image, details, price);
        itemsContainer.appendChild(row);
    });

    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const shipping = getShipping();

    subtotalElement.textContent = money(subtotal);
    shippingElement.textContent = money(shipping);
    totalElement.textContent = money(subtotal + shipping);

    return { cart, subtotal, shipping, total: subtotal + shipping };
}

document.querySelectorAll('input[name="shipping"]').forEach(input => {
    input.addEventListener("change", renderSummary);
});

form.addEventListener("submit", event => {
    event.preventDefault();
    const submitButton = form.querySelector('[type="submit"]');
    if (submitButton.disabled) return;
    errorMessage.textContent = "";

    const order = renderSummary();

    if (order.cart.length === 0) {
        errorMessage.textContent =
            "Your bag is empty. Add a product before placing an order.";
        return;
    }

    if (!form.reportValidity()) return;

    const reference =
        "AH-" + Date.now().toString().slice(-8);

    referenceElement.textContent = reference;
    successTotalElement.textContent =
        `Demo order total: ${money(order.total)}. No payment was taken.`;
submitButton.disabled = true;
submitButton.textContent = "ORDER CONFIRMED";
    form.hidden = true;
    document.querySelector(".checkout-summary").hidden = true;
    document.querySelector(".checkout-heading").hidden = true;
    successSection.hidden = false;

    // Save demo order history locally
const savedOrders = JSON.parse(
    localStorage.getItem("afterhours-orders") || "[]"
);

const selectedShipping = document.querySelector(
    'input[name="shipping"]:checked'
);

const completedOrder = {
    reference,
    createdAt: new Date().toISOString(),

    status: "confirmed",

    customer: {
        email: form.email.value.trim(),
        firstName: form.firstName.value.trim(),
        lastName: form.lastName.value.trim(),
        phone: form.phone.value.trim(),
        country: form.country.value,
        address: form.address.value.trim(),
        city: form.city.value.trim(),
        postalCode: form.postalCode.value.trim()
    },

    items: order.cart,

    shippingMethod: selectedShipping?.value || "standard",
    shipping: order.shipping,
    subtotal: order.subtotal,
    total: order.total,

    paymentStatus: "not_paid"
};

savedOrders.push(completedOrder);

localStorage.setItem(
    "afterhours-orders",
    JSON.stringify(savedOrders)
);

localStorage.setItem(
    "afterhours-last-demo-order",
    JSON.stringify(completedOrder)
);

localStorage.removeItem("afterhours-cart");
});
renderSummary();
