const cartElement = document.querySelector('[data-cart]');
const drawerElement = document.getElementById('drawer');
const searchElement = document.querySelector('[data-search]');
const loadingElement = `<div style="border: 2px solid #f3f3f3; border-top: 2px solid #064E3B; border-radius: 50%; width: 20px; height: 20px; animation: spin 350ms linear infinite; margin: auto;"></div>`;
let timer = undefined;

window.getProductByHandle = function (handle) {
    return products.find(product => product.handle === handle);
}

window.getAllCartItem = function () {
    return JSON.parse(localStorage.getItem('cartItems')) || [];
}

window.getAllCartItemHTML = function () {
    let cartItemsHTML = '';

    window.getAllCartItem().forEach(cartItem => {
        cartItemsHTML += `
            <div class="bg-white w-full rounded-lg shadow-lg p-2 md:p-4 flex gap-4 relative">
                <button class="text-xl text-gray-400 absolute top-1 right-3 hover:text-gray-600" type="button" data-handle="${cartItem.handle}" onclick="window.removeCartItem(this)">
                    &times;
                </button>
            
                <figure class="shrink-0">
                    <img src="${cartItem.image_url}" alt="Image" width="80" height="80" class="rounded">
                </figure>
            
                <div class="w-full mt-1.5">
                    <div class="font-medium text-emerald-900 text-sm md:text-base">
                        ${cartItem.title}
                    </div>
                    <div class="flex items-center gap-x-1">
                        <span class="text-sm md:text-base font-medium">
                            ₹${cartItem.price}
                        </span>
                    </div>
                    <div class="text-xs md:text-sm font-medium">
                        ${cartItem.variant_title === "Default Title" ? '' : cartItem.variant_title}
                    </div>
                    <div class="mt-2 flex justify-end">
                        <div class="w-[100px] inline-flex gap-x-2 items-center justify-between border border-gray-600 rounded-lg">
                            <button class="text-2xl px-2" type="button" data-handle="${cartItem.handle}" onclick="decrementCartItemQuantity(this)">
                                &minus;
                            </button>
                            <div>
                                ${cartItem.quantity}
                            </div>
                            <button class="text-2xl px-2" type="button" data-handle="${cartItem.handle}" onclick="incrementCartItemQuantity(this)">
                                &plus;
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    return cartItemsHTML;
}

window.getSearchHTML = function (products) {
    let itemsHTML = '';

    if (products.length === 0) {
        itemsHTML += `
            <div class="bg-white w-full rounded-lg shadow-lg p-2">
                <div class="text-sm md:text-base text-center">
                    <span>
                        No results found!
                    </span>
                    <a class="text-emerald-900 underline" href="/">
                        Explore our collections
                    </a>
                </div>
            </div>
        `;
    }

    products.forEach(product => {
        itemsHTML += `
            <a href="/products/${product.handle}" class="bg-white w-full rounded-lg shadow p-2 flex gap-x-4 gap-y-2 relative border border-transparent hover:border-emerald-800">
                <figure class="shrink-0">
                    <img src="${product.image_url === null ? './img-placeholder.webp' : product.image_url}" alt="Image" width="60" height="60" class="rounded">
                </figure>

                <div class="w-full flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <div class="font-medium text-emerald-900 text-sm md:text-base line-clamp-2">
                        ${product.title}
                    </div>
                    <div class="flex items-center gap-x-1">
                        <span class="text-base md:text-lg font-semibold">
                            ₹${product.variant.price}
                        </span>
                        <del class="text-xs md:text-sm text-yellow-900">
                            ${product.variant.compare_at_price === null ? '' : '₹' + product.variant.compare_at_price}
                        </del>
                    </div>
                </div>
            </a>
        `;
    });

    return itemsHTML;
}

window.incrementCartItemQuantity = function (element) {
    if (!element.dataset.handle) {
        throw new Error(`The element must have a 'data-handle' attribute.`);
    }

    const product = window.getProductByHandle(element.dataset.handle);

    window.setCartItem({ ...product, quantity: 1 });

    window.refreshDrawer();
}

window.decrementCartItemQuantity = function (element) {
    if (!element.dataset.handle) {
        throw new Error(`The element must have a 'data-handle' attribute.`);
    }

    const product = window.getProductByHandle(element.dataset.handle);

    window.setCartItem({ ...product, quantity: -1 });

    window.refreshDrawer();
}

window.setCartItem = function (cartItem) {
    let cartItems = window.getAllCartItem();

    let filteredCartItem = cartItems.find(obj => obj.handle === cartItem.handle);

    if (filteredCartItem) {
        filteredCartItem.quantity = filteredCartItem.quantity + cartItem.quantity;

        if (filteredCartItem.quantity < 1) {
            return;
        }

        cartItems = [...cartItems.filter(obj => obj.handle !== cartItem.handle), { ...filteredCartItem, line_price: filteredCartItem.price * filteredCartItem.quantity }]
    } else {
        cartItems.push({ ...cartItem, line_price: cartItem.price * cartItem.quantity });
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

window.removeCartItem = function (element) {
    if (!element.dataset.handle) {
        throw new Error(`The element must have a 'data-handle' attribute.`);
    }

    localStorage.setItem('cartItems', JSON.stringify(window.getAllCartItem().filter(obj => obj.handle !== element.dataset.handle)));

    window.refreshDrawer();
}

window.getCartSubtotalPrice = function () {
    return window.getAllCartItem().reduce((accumulator, currentValue) => {
        return accumulator + currentValue.line_price;
    }, 0);
}

window.refreshCart = function () {
    if (!cartElement) return;

    cartElement.innerHTML = `
        <div class="relative">
            <svg class="text-emerald-900 hover:scale-110" aria-hidden="true" focusable="false" role="presentation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
                <path fill="currentColor" fill-rule="evenodd" d="M20.5 6.5a4.75 4.75 0 00-4.75 4.75v.56h-3.16l-.77 11.6a5 5 0 004.99 5.34h7.38a5 5 0 004.99-5.33l-.77-11.6h-3.16v-.57A4.75 4.75 0 0020.5 6.5zm3.75 5.31v-.56a3.75 3.75 0 10-7.5 0v.56h7.5zm-7.5 1h7.5v.56a3.75 3.75 0 11-7.5 0v-.56zm-1 0v.56a4.75 4.75 0 109.5 0v-.56h2.22l.71 10.67a4 4 0 01-3.99 4.27h-7.38a4 4 0 01-4-4.27l.72-10.67h2.22z"></path>
            </svg>
            <div class="absolute bottom-[6px] right-[6px] text-[10px] bg-emerald-800 rounded-full text-white w-[18px] h-[18px] grid place-items-center">
                ${window.getAllCartItem().length}
            </div>
        </div>
    `;
}

window.addToCart = function (element) {
    if (!element.dataset.handle) {
        throw new Error(`The element must have a 'data-handle' attribute.`);
    }

    element.disabled = true;

    element.innerHTML = loadingElement;

    const product = window.getProductByHandle(element.dataset.handle);

    window.setCartItem({ ...product, quantity: 1 });

    window.refreshCart();

    element.disabled = false;

    element.innerHTML = "Added";
    element.classList.add('bg-gray-800');
    element.classList.add('hover:bg-gray-800');

    setTimeout(() => {
        element.innerHTML = "Add to Cart";
        element.classList.remove('bg-gray-800');
        element.classList.remove('hover:bg-gray-800');
    }, 1000);
}

window.closeDrawer = function () {
    if (drawerElement) {
        document.body.style.overflow = 'auto';

        drawerElement.close();
    }
}

window.openDrawer = function () {
    if (drawerElement) {
        window.refreshDrawer();

        document.body.style.overflow = 'hidden';

        drawerElement.showModal();
    }
}

window.refreshDrawer = function () {
    if (drawerElement) {
        window.refreshCart();

        if (window.getAllCartItem().length === 0) {
            drawerElement.innerHTML = `
                <div class="flex flex-col fixed min-h-svh h-full bg-gray-200 shadow top-0 right-0 w-full lg:max-w-[385px] z-30 overflow-y-auto">
                    <div class="py-3 px-4 text-right">
                        <button type="button" onclick="window.closeDrawer()" class="text-2xl">
                            &times;
                        </button>
                    </div>
                    <div class="space-y-16 mt-12">
                        <div class="text-center">
                            <div class="text-xl md:text-2xl text-center text-emerald-900 font-semibold mb-8">
                                Your cart is empty
                            </div>
                            <a href="/"
                                class="text-sm md:text-base text-center bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg mx-auto px-6 py-1.5 md:py-2 font-medium h-[40px]">
                                Continue shopping
                            </a>
                        </div>
                        <div>
                            <div class="text-xl md:text-2xl text-center text-emerald-900 font-semibold mb-3">
                                Have an account?
                            </div>
                            <div class="text-center">
                                <a href="/login" class="underline">Log in</a>
                                <span class="text-emerald-900">
                                    to check out faster.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            return;
        }

        drawerElement.innerHTML = `
            <div class="flex flex-col fixed min-h-svh h-full bg-gray-200 shadow top-0 right-0 w-full lg:max-w-[385px] z-30 overflow-y-auto">
                <div class="bg-emerald-800 py-3 px-4 flex justify-between items-center gap-4">
                    <div class="text-white text-lg font-medium">
                        Shopping Cart
                    </div>
                    <button type="button" onclick="window.closeDrawer()" class="text-2xl text-white">
                        &times;
                    </button>
                </div>
            
                <div class="space-y-3 px-2 py-3">
                    ${window.getAllCartItemHTML()}
                </div>
            
                <div class="bg-white w-full p-2 md:p-4 border-t border-gray-300 mt-auto">
                    <div class="flex justify-between gap-x-4 mb-2">
                        <div class="text-base md:text-lg font-semibold">
                            Subtotal
                        </div>
                        <div class="text-base md:text-lg font-semibold text-emerald-800">
                            ₹${window.getCartSubtotalPrice()}
                        </div>
                    </div>
            
                    <button type="button" class="active:scale-95 text-sm md:text-base block text-center bg-emerald-900 hover:bg-emerald-800 text-white w-full rounded-lg py-1.5 md:py-2 font-medium h-[40px] disabled:bg-gray-300 disabled:cursor-not-allowed">
                        Checkout
                    </button>
                </div>
            </div>
        `;
    }
}

window.closeSearch = function () {
    if (drawerElement) {
        document.body.style.overflow = 'auto';

        drawerElement.close();
    }
}

window.openSearch = function () {
    if (drawerElement) {
        document.body.style.overflow = 'hidden';

        drawerElement.innerHTML = `
            <div class="flex flex-col fixed bg-gray-200 shadow top-0 lg:top-20 xl:top-48 left-0 lg:left-1/2 lg:-translate-x-1/2 w-full lg:max-w-lg z-30 lg:rounded-xl lg:shadow-xl">
                <div class="flex items-center bg-white h-[50px] shadow-lg sticky top-0 z-10 lg:rounded-t-xl">
                    <button type="button" onclick="window.closeSearch()" class="text-2xl shrink-0 px-4">
                        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.5 10a.75.75 0 0 1-.75.75h-9.69l2.72 2.72a.75.75 0 0 1-1.06 1.06l-4-4a.75.75 0 0 1 0-1.06l4-4a.75.75 0 1 1 1.06 1.06l-2.72 2.72h9.69a.75.75 0 0 1 .75.75Z"/></svg>
                    </button>

                    <input autofocus onkeyup="window.refreshSearch(this)" placeholder="Type here to search products" type="search" autocomplete="off" class="w-full bg-transparent mr-4 focus:outline-none focus:ring-0">
                </div>

                <div class="space-y-2 px-2 lg:px-3 pt-3 pb-8 h-[calc(100vh-50px)] lg:h-96 overflow-y-auto" id="search-results"></div>
            </div>
        `;

        drawerElement.showModal();
    }
}

window.initSearch = function () {
    if (!searchElement) return;

    searchElement.innerHTML = `
        <svg class="text-emerald-900 hover:scale-110" aria-hidden="true" focusable="false" role="presentation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 19" fill="none">
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M11.03 11.68A5.784 5.784 0 112.85 3.5a5.784 5.784 0 018.18 8.18zm.26 1.12a6.78 6.78 0 11.72-.7l5.4 5.4a.5.5 0 11-.71.7l-5.41-5.4z"></path>
        </svg>
    `;
}

window.refreshSearch = function (element) {
    clearTimeout(timer);

    if (element.value.length === 0) return;

    if (!drawerElement) return;

    const targetElement = document.getElementById('search-results');

    if (!targetElement) return;

    timer = setTimeout(async () => {
        try {
            targetElement.innerHTML = loadingElement;

            await new Promise((resolve) => setTimeout(() => {
                resolve(true);
            }, 2000));

            const response = await fetch('./products.json');

            const { data } = await response.json();

            targetElement.innerHTML = window.getSearchHTML(data);
        } catch (error) {
            targetElement.innerHTML = '';

            console.error(error);
        }
    }, 300);
}

window.refreshCart();

window.initSearch();