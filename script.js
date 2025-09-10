// Student identification (as required in first line of JS file)
// Student Name: IT1_Scofield

// Initialize product data
let products = [];

// Current user state
let currentUser = null;

// Initialize on page load
function initializeApp() {
    // Load product list
    renderProducts();
    
    // Check login status
    checkLoginStatus();
    
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        login();
    });
    
    // Register form submission
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        register();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            initializeApp();
        })
        .catch(error => {
            alert('Failed to load product data!');
            console.error('Error loading products.json:', error);
        });
});

// Show different pages
function showPage(page) {
    // Hide all pages
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'none';
    document.getElementById('cart-page').style.display = 'none';
    document.getElementById('orders-page').style.display = 'none';
    
    // Show the requested page
    if (page === 'home') {
        document.getElementById('home-page').style.display = 'block';
    } else if (page === 'login') {
        document.getElementById('login-page').style.display = 'block';
    } else if (page === 'register') {
        document.getElementById('register-page').style.display = 'block';
    } else if (page === 'cart') {
        if (!currentUser) {
            alert('Please login first');
            showPage('login');
            return;
        }
        document.getElementById('cart-page').style.display = 'block';
        renderCart();
    } else if (page === 'orders') {
        if (!currentUser) {
            alert('Please login first');
            showPage('login');
            return;
        }
        document.getElementById('orders-page').style.display = 'block';
        renderOrders();
    }
}

// Render product list with quantity input
function renderProducts() {
    const container = document.getElementById('product-list');
    container.innerHTML = '';

    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}" width="100%">
            <h3>${product.name}</h3>
            <p>Price: $${product.price}</p>
            <input type="number" id="quantity-${product.id}" min="1" value="1" placeholder="Quantity">
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        container.appendChild(productDiv);
    });
}

// Login function
function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    // Simple validation (real apps need more security)
    if (username && password) {
        // Check if user exists
        if (!localStorage.getItem(`user_${username}`)) {
            alert('User does not exist. Please register first.');
            return;
        }
        
        // Get user data and ensure cart exists
        let userData = JSON.parse(localStorage.getItem(`user_${username}`));
        if (!userData.cart) {
            userData.cart = [];
            localStorage.setItem(`user_${username}`, JSON.stringify(userData));
        }
        
        // Save user to sessionStorage
        sessionStorage.setItem('currentUser', username);
        
        currentUser = username;
        checkLoginStatus();
        alert('Login successful');
        showPage('home');
    } else {
        alert('Please enter username and password');
    }
}

// Register function
function register() {
    let username = document.getElementById('register-username').value; // Get username
    let email = document.getElementById('register-email').value;
    let password = document.getElementById('register-password').value;
    let confirmPassword = document.getElementById('confirm-password').value;

    // Simple validation
    if (!username || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Check if user already exists
    if (localStorage.getItem(`user_${username}`)) {
        alert('User already exists. Please login.');
        return;
    }
    
    // Create new user
    localStorage.setItem(`user_${username}`, JSON.stringify({
        email: email,
        cart: [],
        orders: []
    }));
    
    alert('Registration successful. Please login.');
    showPage('login');
}
// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    checkLoginStatus();
    showPage('home');
}

// Check login status
function checkLoginStatus() {
    const user = sessionStorage.getItem('currentUser');
    const usernameDisplay = document.getElementById('username-display');
    
    if (user) {
        currentUser = user;
        document.getElementById('login-link').style.display = 'none';
        document.getElementById('register-link').style.display = 'none';
        document.getElementById('logout-link').style.display = 'inline';
        usernameDisplay.style.display = 'inline';
        usernameDisplay.textContent = `Welcome, ${user}!`;
    } else {
        document.getElementById('login-link').style.display = 'inline';
        document.getElementById('register-link').style.display = 'inline';
        document.getElementById('logout-link').style.display = 'none';
        usernameDisplay.style.display = 'none';
        usernameDisplay.textContent = '';
    }
}

// Add to cart with quantity
function addToCart(productId) {
    if (!currentUser) {
        alert('Please login first');
        showPage('login');
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
        alert('Product not found');
        return;
    }

    try {
        // Get quantity from input
        const quantityInput = document.getElementById(`quantity-${productId}`);
        let quantity = parseInt(quantityInput.value) || 1;

        if (quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        // Get user data from localStorage
        let userData = JSON.parse(localStorage.getItem(`user_${currentUser}`)) || {
            email: '',
            cart: [],
            orders: []
        };

        // Find existing item in cart
        const existingItem = userData.cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            userData.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity,
                addedAt: new Date().toISOString() // Add timestamp for when item was added
            });
        }

        // Save updated cart to localStorage
        localStorage.setItem(`user_${currentUser}`, JSON.stringify(userData));
        
        // Reset quantity input
        quantityInput.value = 1;
        
        alert(`Added ${quantity} ${product.name} to cart`);
        renderCart();
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart. Please try again.');
    }
}

// Render shopping cart
function renderCart() {
    if (!currentUser) return;
    
    const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    
    if (userData.cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        updateCartSummary(0, 0);
        return;
    }
    
    let subtotal = 0;
    userData.cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div class="cart-item-details">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <p>Price: $${item.price}</p>
                    <div class="quantity-controls">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
            </div>
            <div class="cart-item-total">
                <p>$${itemTotal}</p>
                <button onclick="removeFromCart(${item.id})" class="btn-danger">Remove</button>
            </div>
        `;
        container.appendChild(itemDiv);
    });
    
    updateCartSummary(subtotal);
}

// Update cart summary
function updateCartSummary(subtotal) {
    const shipping = subtotal > 0 ? 10 : 0;
    const total = subtotal + shipping;
    
    document.getElementById('cart-subtotal').innerHTML = `
        <p>Subtotal: <span>$${subtotal}</span></p>
    `;
    document.getElementById('cart-shipping').innerHTML = `
        <p>Shipping: <span>$${shipping}</span></p>
    `;
    document.getElementById('cart-total').innerHTML = `
        <p>Total: <span>$${total}</span></p>
    `;
}

// Update quantity
function updateQuantity(productId, newQuantity) {
    if (!currentUser) return;
    if (newQuantity < 1) return;

    const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
    const item = userData.cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem(`user_${currentUser}`, JSON.stringify(userData));
        renderCart();
    }
}

// Remove from cart
function removeFromCart(productId) {
    if (!currentUser) return;
    
    const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
    userData.cart = userData.cart.filter(item => item.id !== productId);
    localStorage.setItem(`user_${currentUser}`, JSON.stringify(userData));
    renderCart();
}

// Clear cart
function clearCart() {
    if (!currentUser) return;
    
    if (confirm('Are you sure you want to clear your cart?')) {
        const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
        userData.cart = [];
        localStorage.setItem(`user_${currentUser}`, JSON.stringify(userData));
        renderCart();
    }
}

// Checkout function
function checkout() {
    if (!currentUser) return;
    
    const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
    if (userData.cart.length === 0) {
        alert('Your cart is empty');
        return;
    }

    // Calculate total
    const total = userData.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create new order
    const newOrder = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        items: [...userData.cart],
        total: total,
        status: 'Pending'
    };

    // Save order and clear cart
    userData.orders.push(newOrder);
    userData.cart = [];
    localStorage.setItem(`user_${currentUser}`, JSON.stringify(userData));

    alert('Order placed successfully');
    renderOrders();
}

// Render orders
function renderOrders() {
    if (!currentUser) return;
    
    const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
    const container = document.getElementById('order-list');
    container.innerHTML = '';
    
    if (userData.orders.length === 0) {
        container.innerHTML = '<p>No orders yet</p>';
        return;
    }
    
    userData.orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order';
        orderDiv.innerHTML = `
            <h3>Order #${order.id}</h3>
            <p>Date: ${order.date}</p>
            <p>Status: ${order.status}</p>
            <p>Total: $${order.total}</p>
            <button onclick="downloadSingleOrder(${order.id})">Download This Order</button>
            <hr>
        `;
        container.appendChild(orderDiv);
    });
}

// Download all orders
function downloadOrder() {
    if (!currentUser) return;
    
    const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
    if (userData.orders.length === 0) {
        alert('No orders to download');
        return;
    }
       
 const content = userData.orders.map(order => 
        `Order #${order.id}\nDate: ${order.date}\nStatus: ${order.status}\nTotal: $${order.total}\n\n`
    ).join('\n');
    
    downloadFile('My_Orders.txt', content);
}

// Download single order
function downloadSingleOrder(orderId) {
    if (!currentUser) return;
    
    const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
    const order = userData.orders.find(o => o.id === orderId);
    if (!order) return;
    
    let content = `Order #${order.id}\nDate: ${order.date}\nStatus: ${order.status}\nTotal: $${order.total}\n\n`;
    content += "Items:\n";
    order.items.forEach(item => {
        content += `${item.name} × ${item.quantity} - $${item.price * item.quantity}\n`;
    });
    
    downloadFile(`Order_${order.id}.txt`, content);
}

// File download helper
function downloadFile(filename, content) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
