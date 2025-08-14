// --- Your actual files in posters/ (spaces OK) ---
const files = [
  "azlaan bhai pfp.jpg",
  "dune spice lord.jpg",
  "ferrari x anime.jpg",
  "guy who kinda looks like me.jpg",
  "intersteller .jpg",
  "jocker.jpg",
  "johnwick4.jpg",
  "naruto someone.jpg",
  "pirate king wannabe.jpg",
  "race flipped.jpg",
  "race.jpg",
  "samurai trooper.jpg",
  "sasuke weeb.jpg",
  "spiderman old.jpg",
  "spiderman retro.jpg",
  "spiderman.jpg",
  "star wars void.jpg",
  "unreleased rogue.jpg"
];

// Basic price map (edit as you like). If a file not in map → default 199.
const priceMap = {
  "johnwick4.jpg": 249,
  "spiderman.jpg": 229,
  "spiderman retro.jpg": 239,
  "spiderman old.jpg": 219,
  "ferrari x anime.jpg": 249,
  "star wars void.jpg": 259
};
const DEFAULT_PRICE = 199;

// Build product objects
const products = files.map((f, i) => ({
  id: i + 1,
  file: f,
  url: `posters/${encodeURI(f)}`,
  title: prettify(f),
  price: priceMap[f] ?? DEFAULT_PRICE,
  dims: null // filled after image load
}));

// --- Elements ---
const grid = document.getElementById("grid");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalFilename = document.getElementById("modalFilename");
const modalPrice = document.getElementById("modalPrice");
const modalDims = document.getElementById("modalDims");
const closeModalBtn = document.getElementById("closeModal");
const addToCartBtn = document.getElementById("addToCart");
const viewCartBtn = document.getElementById("viewCart");

const drawer = document.getElementById("cart");
const openCartBtn = document.getElementById("openCart");
const closeCartBtn = document.getElementById("closeCart");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartCountEl = document.getElementById("cartCount");
const backdrop = document.getElementById("backdrop");
const checkoutBtn = document.getElementById("checkout");

// --- Render grid ---
products.forEach(p => {
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <img class="card__img" loading="lazy" src="${p.url}" alt="${p.title}">
    <div class="card__title" title="${p.title}">${p.title}</div>
  `;
  card.addEventListener("click", () => openModal(p));
  grid.appendChild(card);

  // Preload to get dimensions once
  const img = new Image();
  img.src = p.url;
  img.onload = () => {
    p.dims = `${img.naturalWidth} × ${img.naturalHeight}px`;
    // If this product is currently in the modal, update text
    if (modal.hasAttribute("open") && modalTitle.textContent === p.title) {
      modalDims.textContent = p.dims;
    }
  };
  img.onerror = () => {
    p.dims = "Unknown";
  };
});

// --- Modal logic ---
let currentProduct = null;

function openModal(p){
  currentProduct = p;
  modalImg.src = p.url;
  modalImg.alt = p.title;
  modalTitle.textContent = p.title;
  modalFilename.textContent = p.file;
  modalPrice.textContent = p.price;
  modalDims.textContent = p.dims ?? "Loading…";

  modal.setAttribute("open", "");
  modal.style.display = "grid";
}
function closeModal(){
  modal.removeAttribute("open");
  modal.style.display = "none";
  currentProduct = null;
}
closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e)=>{
  if (e.key === "Escape") {
    if (modal.hasAttribute("open")) closeModal();
    if (drawer.hasAttribute("open")) closeCart();
  }
});

// --- Cart state ---
let cart = []; // [{id, qty}]
restoreCart();
updateCartBadge();

// Add to cart only from modal
addToCartBtn.addEventListener("click", () => {
  if (!currentProduct) return;
  const found = cart.find(c => c.id === currentProduct.id);
  if (found) found.qty += 1;
  else cart.push({ id: currentProduct.id, qty: 1 });
  persistCart();
  updateCartBadge();
  // Small feedback
  addToCartBtn.textContent = "Added!";
  setTimeout(()=> addToCartBtn.textContent = "Add to Cart", 800);
});

viewCartBtn.addEventListener("click", () => { openCart(); });

// --- Cart drawer ---
openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);

function openCart(){
  renderCart();
  drawer.setAttribute("open", "");
  backdrop.setAttribute("open", "");
}
function closeCart(){
  drawer.removeAttribute("open");
  backdrop.removeAttribute("open");
}

function renderCart(){
  cartItemsEl.innerHTML = "";
  let total = 0;

  if (cart.length === 0){
    cartItemsEl.innerHTML = `<li class="muted" style="padding:10px;">Cart is empty.</li>`;
  } else {
    cart.forEach(item => {
      const p = products.find(x => x.id === item.id);
      const line = p.price * item.qty;
      total += line;

      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <img src="${p.url}" alt="${p.title}">
        <div>
          <div class="title">${p.title}</div>
          <div class="muted">₹${p.price} each</div>
        </div>
        <div class="qty">
          <button aria-label="Decrease">−</button>
          <span>${item.qty}</span>
          <button aria-label="Increase">+</button>
        </div>
      `;
      const [decBtn, , incBtn] = li.querySelectorAll(".qty button, .qty span, .qty button");
      incBtn.addEventListener("click", ()=> changeQty(item.id, +1));
      decBtn.addEventListener("click", ()=> changeQty(item.id, -1));

      cartItemsEl.appendChild(li);
    });
  }

  cartTotalEl.textContent = total.toString();
}

function changeQty(id, delta){
  const row = cart.find(c => c.id === id);
  if (!row) return;
  row.qty += delta;
  if (row.qty <= 0){
    cart = cart.filter(c => c.id !== id);
  }
  persistCart();
  updateCartBadge();
  renderCart();
}

function updateCartBadge(){
  const count = cart.reduce((n, c) => n + c.qty, 0);
  cartCountEl.textContent = count.toString();
}

function persistCart(){
  localStorage.setItem("poster_cart", JSON.stringify(cart));
}
function restoreCart(){
  try{
    const raw = localStorage.getItem("poster_cart");
    cart = raw ? JSON.parse(raw) : [];
  }catch{ cart = []; }
}


checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  // Prompt for customer details
  const customerName = prompt("Enter your full name:");
  const address = prompt("Enter your delivery address:");

  if (!customerName || !address) {
    alert("Name and address are required to place an order.");
    return;
  }

  // Build order summary
  let orderDetails = "";
  let total = 0;
  cart.forEach(c => {
    const p = products.find(x => x.id === c.id);
    const lineTotal = p.price * c.qty;
    total += lineTotal;
    orderDetails += `${p.title} × ${c.qty} - ₹${lineTotal}\n`;
  });

  // Warning + formatted message
  const emailBody = 
`⚠ DO NOT edit the contents of this email. It contains encrypted order data. Just press SEND to confirm your order. ⚠

Customer Name: ${customerName}

Bought Items:
${orderDetails}

Total Price: ₹${total}

Address:
${address}

Payment Method: Pay on Delivery`;

  // Encode for mailto
  const encodedBody = encodeURIComponent(emailBody);
  const mailtoLink = `mailto:prasparadise@gmail.com?subject=Poster Order&body=${encodedBody}`;

  // Open email client
  window.location.href = mailtoLink;

  // Optional: clear cart after checkout
  cart = [];
  persistCart();
  updateCartBadge();
  renderCart();
});


// --- Helpers ---
function prettify(fileName){
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, m => m.toUpperCase())
    .trim();
}
