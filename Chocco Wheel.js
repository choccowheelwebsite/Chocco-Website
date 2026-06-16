

// Home 
document.addEventListener('DOMContentLoaded', () => {
    const bgSlider = document.getElementById('bg-slider');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    
    const images = [
        '/Image/Home Background (1).jpg',
        '/Image/Home Background (2).jpg',
        '/Image/Home Background (3).jpg',
        '/Image/Home Background (4).jpg'
    ];
    
    let currentIndex = 0;
    let autoFlipTimer;

    const updateHero = () => {
        if (!bgSlider) return;
        const gradient = "linear-gradient(rgba(20, 20, 20, 0.6), rgba(14, 14, 14, 0.6))";
        bgSlider.style.opacity = '0';
        setTimeout(() => {
            bgSlider.style.backgroundImage = `${gradient}, url('${images[currentIndex]}')`;
            bgSlider.style.opacity = '1';
        }, 400);
    };

    const startTimer = () => {
        autoFlipTimer = setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            updateHero();
        }, 5000);
    };

    const resetTimer = () => { clearInterval(autoFlipTimer); startTimer(); };

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => { currentIndex = (currentIndex + 1) % images.length; updateHero(); resetTimer(); });
        prevBtn.addEventListener('click', () => { currentIndex = (currentIndex - 1 + images.length) % images.length; updateHero(); resetTimer(); });
    }

    if (bgSlider) { updateHero(); startTimer(); }
});

//Find Us

document.addEventListener('DOMContentLoaded', () => {
    const findUsLinks = document.querySelectorAll('.trigger-popup');
    const popup = document.getElementById('popup-box');
    const closeBtn = document.querySelector('.close-popup');
    findUsLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (popup) {
                popup.classList.add('active');
            } else {
                console.error("Popup element (#popup-box) not found!");
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('active');
        });
    }
});

// Products

const initMenuApp = (jsonFileName = 'Chocco Wheel.json') => {
    const gallery = document.querySelector('.gallery');
    const searchInput = document.getElementById('search');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox?.querySelector('img');
    const lightboxCaption = lightbox?.querySelector('.lightbox-caption');

    let productsData = [];
    let currentGalleryImages = [];
    let currentProductIdx = 0;
    let allProducts = [];

    async function setupGallery() {
        if (!gallery) return;

        try {
            const response = await fetch('Chocco Wheel.json');
            productsData = await response.json();

            allProducts = productsData;

            gallery.innerHTML = '';

            productsData.forEach((product, index) => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('gallery-item');
                
                if (index >= 8) {
                    itemElement.style.display = 'none';
                    itemElement.classList.add('hidden-item');
                }

                itemElement.dataset.category = product.category || "Household Medicine";
                const primaryImage = product.images && product.images.length > 0 ? product.images[0] : 'Image/placeholder.jpg';

                itemElement.innerHTML = `
                    <div class="gallery-item-inner">
                        <img src="${primaryImage}" alt="${product.name}" loading="lazy">
                        <div class="gallery-item-overlay"><i class="fas fa-search-plus"></i></div>
                    </div>
                    <div class="gallery-item-info">
                        <div class="gi_content">
                            <h3>${product.name.replace(' (', '<br>(')}</h3>
                            <span class="category">${product.category || 'Aman'}</span>
                        </div>
                        ${product.category === 'Customized Cakes' 
                            ? '' 
                            : `<p class="product-price" style="font-weight: bold; margin: 5px 0; font-size: 20px; color: var(--Secondary-color);">Price: ₹${product.price}</p>`
                        }
                        <div class="btn_holder">
                            <button class="gallery_cart"><h1>Cart Now</h1></button>
                            <button class="gallery_buy"><h1>Buy Now</h1></button>
                        </div>
                    </div>
                `;

                itemElement.querySelector('.gallery-item-inner')?.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openLightbox(index); 
                });

                itemElement.querySelector('.gallery_cart')?.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    let shoppingCart = JSON.parse(localStorage.getItem('chocco_cart')) || [];
                    const existingItem = shoppingCart.find(item => item.name === product.name);
                    if (existingItem) {
                        existingItem.qty += 1;
                    } else {
                        shoppingCart.push({ 
                            name: product.name, 
                            price: parseFloat(product.price || 0), 
                            image: primaryImage, 
                            qty: 1 
                        });
                    }

                    localStorage.setItem('chocco_cart', JSON.stringify(shoppingCart));
                    window.dispatchEvent(new Event('storage'));
                    renderCart();
                    document.getElementById('cart-sidebar')?.classList.add('active');
                });

                itemElement.querySelector('.gallery_buy')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const singleProduct = [{ 
                        name: product.name, 
                        price: parseFloat(product.price || 0), 
                        image: primaryImage, 
                        qty: 1 
                    }];
                    openCheckoutModal(singleProduct);
                });

                gallery.appendChild(itemElement);
            });

            const loadMoreBtn = document.getElementById('load-more-btn');
            const filterBtns = document.querySelectorAll('.filter-btn');
            const allItems = document.querySelectorAll('.gallery-item');

            const ITEMS_PER_LOAD = 8;

            let currentCategory = 'all';
            let currentVisible = 0;

            function showItems(category = 'all', reset = true) {

                currentCategory = category;

                const filteredItems = Array.from(allItems).filter(item => {
                    return category === 'all' || item.dataset.category === category;
                });

                if (reset) {
                    currentVisible = ITEMS_PER_LOAD;
                }

                allItems.forEach(item => {
                    item.style.display = 'none';
                    item.classList.add('hidden-item');
                });

                filteredItems.forEach((item, index) => {
                    if (index < currentVisible) {
                        item.style.display = 'block';
                        item.classList.remove('hidden-item');
                    }
                });

                if (currentVisible >= filteredItems.length) {
                    loadMoreBtn.style.display = 'none';
                } else {
                    loadMoreBtn.style.display = 'inline-block';
                }
            }

            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {

                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const category = btn.dataset.category;

                    showItems(category, true);
                });
            });

            loadMoreBtn.addEventListener('click', () => {

                currentVisible += ITEMS_PER_LOAD;

                showItems(currentCategory, false);
            });

            showItems('all');


            filterGallery();

        } catch (error) {
            console.error("Failed to fetch product list:", error);
        }
    }

    function addToCart(product, image) {
        let cart = JSON.parse(localStorage.getItem('user_cart')) || [];
        const existing = cart.find(item => item.id === product.id);
        
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ ...product, qty: 1, image: image });
        }
        
        localStorage.setItem('user_cart', JSON.stringify(cart));
        
        const badge = document.getElementById('cart-badge');
        if (badge) {
            badge.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
            badge.style.display = 'block';
        }
    }

    function openLightbox(productIdx) {
        const lightbox = document.querySelector('.lightbox');
        const lightboxImg = lightbox?.querySelector('img');
        const lightboxCaption = lightbox?.querySelector('.lightbox-caption');

        if (!lightbox || !allProducts[productIdx]) return;

        currentProductIdx = productIdx;
        const product = allProducts[productIdx];

        lightboxImg.src = product.images[0] || 'Image/placeholder.jpg';
        lightboxCaption.textContent = product.name;

        lightbox.classList.add('active');
    }

    lightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => {
    lightbox.classList.remove('active');
    });

    lightbox?.querySelector('.lightbox-next')?.addEventListener('click', () => {
        currentProductIdx = (currentProductIdx + 1) % allProducts.length;
        openLightbox(currentProductIdx);
    });

    lightbox?.querySelector('.lightbox-prev')?.addEventListener('click', () => {
        currentProductIdx = (currentProductIdx - 1 + allProducts.length) % allProducts.length;
        openLightbox(currentProductIdx);
    });

    function filterGallery() {
        const items = document.querySelectorAll('.gallery-item');
        const activeBtn = document.querySelector('.filter-btn.active');
        const filter = activeBtn ? activeBtn.dataset.category : 'all';
        const searchTerm = searchInput.value.toLowerCase();
        const loadMoreBtn = document.getElementById('load-more-btn');
        
        let shownCount = 0;

        items.forEach(item => {
            const matchesCategory = (filter === 'all' || item.dataset.category === filter);
            const productName = item.querySelector('h3').textContent.toLowerCase();
            const matchesSearch = productName.includes(searchTerm);

            if (matchesCategory && matchesSearch) {
                if (shownCount < 8) {
                    item.style.display = 'block';
                    item.classList.remove('hidden-item');
                    shownCount++;
                } else {
                    item.style.display = 'none';
                    item.classList.add('hidden-item');
                }
            } else {
                item.style.display = 'none';
                item.classList.add('hidden-item');
            }
        });

        if (loadMoreBtn) {
            const hasHiddenItems = document.querySelectorAll('.gallery-item.hidden-item').length > 0;
            loadMoreBtn.style.display = (filter === 'all' && searchTerm === '' && hasHiddenItems) ? 'block' : 'none';
        }
    }
    let currentFilter = 'all';

    searchInput?.addEventListener('input', filterGallery);
    filterBtns.forEach(btn => btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterGallery();
    }));

    sortSelect?.addEventListener('change', () => {
        const items = Array.from(document.querySelectorAll('.gallery-item'));
        items.sort((a, b) => {
            const valA = a.querySelector('h3').textContent;
            const valB = b.querySelector('h3').textContent;
            return sortSelect.value === 'name' ? valA.localeCompare(valB) : 0;
        });
        items.forEach(item => gallery.appendChild(item));
    });

    setupGallery();
};

document.addEventListener('DOMContentLoaded', () => initMenuApp('Chocco Wheel.json'));



// Cart


let shoppingCart = JSON.parse(localStorage.getItem('chocco_cart')) || [];

const cartSidebar = document.getElementById('cart-sidebar');
const cartIcon = document.getElementById('cart-icon');
const cartCloseBtn = document.getElementById('cart-close-btn');
const addToCartBtn = document.getElementById('add-to-cart-btn');
const checkoutBtn = document.getElementById('checkout-btn');

const cartContentContainer = document.getElementById('cart-content');
const cartTotalPriceEl = document.getElementById('cart-total-price');
const cartBadge = document.getElementById('cart-badge');

if (cartContentContainer) {
    renderCart();
}

cartIcon?.addEventListener('click', () => cartSidebar?.classList.add('active'));
cartCloseBtn?.addEventListener('click', () => cartSidebar?.classList.remove('active'));

addToCartBtn?.addEventListener('click', () => {
    const name = document.getElementById('product-name')?.innerText;
    const priceText = document.getElementById('product-price')?.innerText;
    const priceValue = parseFloat(priceText?.replace('$', '')) || 0;
    const imgSrc = document.getElementById('main-img')?.src;
    const quantity = parseInt(document.getElementById('product-qty')?.value) || 1;

    if (!name) return;

    const existingItem = shoppingCart.find(item => item.name === name);
    if (existingItem) {
        return;
    }
    shoppingCart.push({ name, price: priceValue, image: imgSrc, qty: quantity });
    localStorage.setItem('chocco_cart', JSON.stringify(shoppingCart));
    
    renderCart();
    cartSidebar?.classList.add('active'); 
});

function renderCart() {
    if (!cartContentContainer) return;
    
    shoppingCart = JSON.parse(localStorage.getItem('chocco_cart')) || [];
    cartContentContainer.innerHTML = '';
    
    shoppingCart.forEach((item, index) => {
        const itemBox = document.createElement('div');
        itemBox.classList.add('cart-item-box');
        itemBox.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${item.qty} x $${item.price.toFixed(2)}</p>
            </div>
            <button class="cart-remove-btn" data-index="${index}">&times;</button>
        `;
        cartContentContainer.appendChild(itemBox);
    });

    document.querySelectorAll('.cart-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const indexToRemove = e.target.getAttribute('data-index');
            shoppingCart.splice(indexToRemove, 1);
            localStorage.setItem('chocco_cart', JSON.stringify(shoppingCart));
            renderCart(); 
        });
    });

    calculateCartTotals();
}

function calculateCartTotals() {
    if (!cartTotalPriceEl) return;
    let totalPrice = 0;
    let totalItemsCount = 0;

    shoppingCart.forEach(item => {
        totalPrice += item.price * item.qty;
        totalItemsCount += item.qty;
    });
    cartTotalPriceEl.innerText = `$${totalPrice.toFixed(2)}`;
    if (cartBadge) {
        cartBadge.innerText = totalItemsCount;
        cartBadge.style.display = totalItemsCount > 0 ? 'block' : 'none';
    }
}

checkoutBtn?.addEventListener('click', () => {
    if (shoppingCart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    openCheckoutModal();
    cartSidebar?.classList.remove('active');
    if (typeof refreshCheckoutTotal === 'function') {
        refreshCheckoutTotal();
    }
});

window.addEventListener('storage', () => {
    shoppingCart = JSON.parse(localStorage.getItem('chocco_cart')) || [];
    renderCart();
});

//Order type

function refreshCheckoutTotal() {
    const sourceElement = document.getElementById('cart-total-price');
    const priceText = sourceElement ? sourceElement.innerText : "0";
    const basePrice = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
    const finalTotal = basePrice; 
    const display = document.getElementById('total-display');
    if (display) display.innerText = `Total: ₹${finalTotal.toFixed(2)}`;
}
document.getElementById('checkout-btn').addEventListener('click', () => {
    setTimeout(refreshCheckoutTotal, 100); 
});
document.querySelectorAll('input[name="order-type"]').forEach(radio => {
    radio.addEventListener('change', refreshCheckoutTotal);
});


//Whats App

function openCheckoutModal(singleProductArray = null) {
    const modal = document.getElementById('checkout-modal');
    const summaryBox = document.getElementById('modal-cart-summary');
    
    const cart = singleProductArray || JSON.parse(localStorage.getItem('chocco_cart')) || [];

    if (cart.length === 0) {
        alert("Your selection is empty!");
        return;
    }
    summaryBox.innerHTML = cart.map(item => `
        <p>${item.name} (x${item.qty}) - ₹${(Number(item.price) * Number(item.qty)).toFixed(2)}</p>
    `).join('');

    summaryBox.style.display = 'none';
    modal.style.display = 'block';
    if (singleProductArray) {
        const total = singleProductArray.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const cartTotalEl = document.getElementById('cart-total-price');
        if (cartTotalEl) cartTotalEl.innerText = `$${total.toFixed(2)}`;
    }

    setTimeout(refreshCheckoutTotal, 100);
}

document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('checkout-modal').style.display = 'none';
});

document.getElementById('final-send-btn').addEventListener('click', () => {
    const name = document.getElementById('user-name').value.trim();
    const phone = document.getElementById('user-phone').value.trim();
    const address = document.getElementById('user-address').value.trim();
    const branch = document.getElementById('add-select').value;
    
    const orderType = document.querySelector('input[name="order-type"]:checked').value;

    const cart = JSON.parse(localStorage.getItem('chocco_cart')) || [];
    const summaryEl = document.getElementById('modal-cart-summary');

    if (!name || !phone || !address || !branch) {
        alert("Please fill in all details!");
        return;
    }

    let whatsappNumber = "";
    if (branch === "mannarkkad") whatsappNumber = "919961563339";
    else if (branch === "kalladikode") whatsappNumber = "919961563338";
    else if (branch === "mundur") whatsappNumber = "919656763337";

    let message = `New Order from: ${name}\n`;
    message += `Phone: ${phone}\n`;
    message += `Address: ${address}\n`;
    message += `Branch: ${branch}\n`;
    message += `Order Type: ${orderType.charAt(0).toUpperCase() + orderType.slice(1)}\n\n`;
    
    message += `Order Items:\n`;
    const summaryText = summaryEl ? summaryEl.innerText.trim() : '';
    if (summaryText) message += `${summaryText}`;
    
    const finalTotal = document.getElementById('total-display').innerText;
    message += `\n\n${finalTotal}`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    localStorage.removeItem('chocco_cart');
    shoppingCart = [];
    renderCart();
    document.getElementById('checkout-modal').style.display = 'none';
});