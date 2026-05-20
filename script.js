let cart = loadCartFromStorage();
let selectedCategory = "all";
let searchTerm = "";
let checkoutStep = 1;
let checkoutInfo = { name: "", email: "", phone: "", address: "", payment: "Chuyển khoản", note: "" };

// `products` và `newsItems` mặc định lấy từ products.js / news.js (dữ liệu seed).
// Khi backend hoạt động, hai biến này sẽ được thay thế bằng dữ liệu mới nhất từ API.
let appProducts = Array.isArray(window.products) ? [...window.products] : [];
let appNews = Array.isArray(window.newsItems) ? [...window.newsItems] : [];
const hasAPI = typeof window.HappyKitchenAPI !== "undefined";

function formatCurrency(value) {
  return value.toLocaleString("vi-VN") + " ₫";
}

function normalizeText(value) {
  return value.toString().trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function loadCartFromStorage() {
  try {
    const stored = localStorage.getItem("happyKitchenCart");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveCartToStorage() {
  localStorage.setItem("happyKitchenCart", JSON.stringify(cart));
}

function getCategoryLabel(category) {
  const labels = {
    "all": "Tất cả",
    "bep-dien-tu": "Bếp điện từ",
    "may-hut-mui": "Máy hút mùi",
    "may-rua-bat": "Máy rửa bát",
    "chau-voi": "Chậu - vòi",
    "may-loc-nuoc": "Máy lọc nước",
    "bo-noi": "Bộ nồi"
  };
  return labels[category] || category.replace(/-/g, " ");
}

function getFilteredProducts() {
  const normalizedSearch = normalizeText(searchTerm);
  return appProducts.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = !normalizedSearch || [
      product.name,
      product.brand,
      product.category,
      product.sku,
      product.description
    ].some(value => normalizeText(value).includes(normalizedSearch));
    return matchesCategory && matchesSearch;
  });
}

function getProductCardHtml(product) {
  return `
    <div class="product">
      <span class="sale">-${product.sale}%</span>
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <button class="detail-overlay" onclick="openProductDetail('${product.id}')">CHI TIẾT</button>
      </div>
      <div class="product-content">
        <span class="category-label">${getCategoryLabel(product.category)}</span>
        <h3>${product.name}</h3>
        <div class="price-row">
          <div>
            <div class="old-price">${formatCurrency(product.oldPrice)}</div>
            <div class="price">${formatCurrency(product.price)}</div>
          </div>
        </div>
        <div class="product-actions">
          <button onclick="addToCart('${product.id}')">Thêm vào giỏ</button>
          <button class="buy-now" onclick="buyNow('${product.id}')">Mua ngay</button>
        </div>
      </div>
    </div>
  `;
}

function renderProducts(list, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!list.length) {
    container.innerHTML = `<div class="no-results">Không tìm thấy sản phẩm phù hợp.</div>`;
    return;
  }
  container.innerHTML = list.map(getProductCardHtml).join("");
}

let activeDetailId = null;
let activeDetailTab = 'product-info';

function openProductDetail(productId) {
  const product = appProducts.find(item => item.id === productId);
  if (!product) return;
  activeDetailId = productId;
  activeDetailTab = 'product-info';
  document.getElementById('detailModal').classList.add('active');
  document.getElementById('detailName').textContent = product.name;
  document.getElementById('detailBrand').textContent = product.brand;
  document.getElementById('detailOrigin').textContent = product.origin;
  document.getElementById('detailSku').textContent = product.sku;
  document.getElementById('detailStatus').textContent = product.status;
  document.getElementById('detailDescription').textContent = product.description;
  document.getElementById('detailMainImage').src = product.image;
  document.getElementById('detailMainImage').alt = product.name;
  document.getElementById('detailPrice').textContent = formatCurrency(product.price);
  document.getElementById('detailOldPrice').textContent = formatCurrency(product.oldPrice);
  document.getElementById('detailSale').textContent = `-${product.sale}%`;

  const thumbnails = document.getElementById('detailThumbnails');
  thumbnails.innerHTML = (product.images || [product.image]).map((src, index) => `
    <button class="detail-thumbnail${index === 0 ? ' active' : ''}" onclick="setDetailImage('${src}', this)">
      <img src="${src}" alt="${product.name} ảnh ${index + 1}" loading="lazy" />
    </button>
  `).join('');

  document.querySelectorAll('.detail-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === 'product-info'));
  renderDetailTab(product, activeDetailTab);
}

function closeProductDetail() {
  document.getElementById('detailModal').classList.remove('active');
  activeDetailId = null;
}

function setDetailImage(src, button) {
  document.getElementById('detailMainImage').src = src;
  document.querySelectorAll('.detail-thumbnail').forEach(item => item.classList.remove('active'));
  if (button) button.classList.add('active');
}

function switchDetailTab(tabName) {
  activeDetailTab = tabName;
  document.querySelectorAll('.detail-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === tabName));
  const product = appProducts.find(item => item.id === activeDetailId);
  if (product) renderDetailTab(product, tabName);
}

function renderDetailTab(product, tabName) {
  const content = document.getElementById('detailTabContent');
  if (!content) return;
  if (tabName === 'specs') {
    const specs = product.specs || {};
    const specEntries = Object.entries(specs);
    content.innerHTML = `
      <h4>Thông số kỹ thuật</h4>
      ${specEntries.length ? `<dl class="detail-specs">
        ${specEntries.map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`).join('')}
      </dl>` : '<p>Thông số kỹ thuật đang được cập nhật cho sản phẩm này.</p>'}
    `;
  } else {
    const features = product.features || [];
    content.innerHTML = `
      <h4>Mô tả chi tiết</h4>
      <p>${product.description}</p>
      ${features.length ? `<ul>${features.map(item => `<li>${item}</li>`).join('')}</ul>` : '<p>Đang cập nhật các tính năng nổi bật của sản phẩm.</p>'}
    `;
  }
}

function renderFeaturedProducts() {
  const featured = appProducts.filter(p => p.is_featured);
  const list = featured.length ? featured : appProducts;
  renderProducts(list.slice(0, 4), "featuredList");
}

function renderNewsItems() {
  const container = document.getElementById('newsList');
  if (!container) return;
  container.innerHTML = appNews.map(item => `
    <article class="news-card">
      <div class="news-card-header">
        <span class="news-card-category">${item.category}</span>
        <span class="news-card-date">${item.date}</span>
      </div>
      <h3>${item.title}</h3>
      <p>${item.excerpt}</p>
      <div class="news-card-actions">
        <button onclick="showNewsDetail('${item.id}')">Đọc thêm</button>
      </div>
    </article>
  `).join('');
}

function showNewsDetail(newsId) {
  const item = appNews.find(news => news.id === newsId);
  if (!item) return;
  showToast(`${item.title} — ${item.excerpt}`);
}

function updatePageProducts() {
  const filtered = getFilteredProducts();
  renderProducts(filtered, "productList");
  const countLabel = document.getElementById("productCount");
  countLabel.textContent = `Hiển thị ${filtered.length} sản phẩm${selectedCategory !== "all" ? ` - ${getCategoryLabel(selectedCategory)}` : ""}`;
}

function setActiveCategoryButton() {
  document.querySelectorAll(".category").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === selectedCategory);
  });
}

function filterCategory(category) {
  selectedCategory = category;
  setActiveCategoryButton();
  updatePageProducts();
  showPage('sanpham');
}

function handleSearch() {
  const inputTop = document.getElementById("searchInput");
  const inputPage = document.getElementById("searchProductInput");
  const topValue = inputTop ? inputTop.value.trim() : "";
  const pageValue = inputPage ? inputPage.value.trim() : "";
  searchTerm = pageValue || topValue;
  if (searchTerm) {
    showPage('sanpham');
    if (inputPage) inputPage.value = searchTerm;
  }
  updatePageProducts();
}

function clearFilters() {
  selectedCategory = "all";
  searchTerm = "";
  const inputTop = document.getElementById("searchInput");
  const inputPage = document.getElementById("searchProductInput");
  if (inputTop) inputTop.value = "";
  if (inputPage) inputPage.value = "";
  setActiveCategoryButton();
  updatePageProducts();
}

function addToCart(productId) {
  const existing = cart[productId];
  const product = appProducts.find(p => p.id === productId);
  if (!product) {
    showToast('Không tìm thấy sản phẩm.');
    return;
  }
  cart[productId] = existing
    ? { ...existing, quantity: existing.quantity + 1 }
    : { ...product, quantity: 1 };
  saveCartToStorage();
  updateCartCount();
  renderCartPage();
  showToast('Đã thêm sản phẩm vào giỏ hàng.');
}

function buyNow(productId) {
  addToCart(productId);
  showPage('giohang');
}

function updateCartCount() {
  const count = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cartCount").textContent = count;
}

function renderCartPage() {
  const container = document.getElementById("cartPageContent");
  const items = Object.values(cart);
  if (!container) return;
  if (!items.length) {
    container.innerHTML = `
      <div class="checkout-card">
        <h3>Giỏ hàng trống</h3>
        <p>Chưa có sản phẩm trong giỏ hàng. Hãy chọn sản phẩm và thêm vào giỏ ngay.</p>
        <button class="button-primary" onclick="showPage('sanpham')">Xem sản phẩm</button>
      </div>
    `;
    updateCheckoutSteps();
    return;
  }

  if (checkoutStep === 1) {
    container.innerHTML = `
      <div class="checkout-card">
        <h3>Giỏ hàng</h3>
        ${items.map(item => `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" />
            <div class="cart-details">
              <h4>${item.name}</h4>
              <p>${getCategoryLabel(item.category)}</p>
              <p class="cart-row-total">${formatCurrency(item.price * item.quantity)}</p>
            </div>
            <div class="cart-actions">
              <button onclick="changeQuantity('${item.id}', -1)">-</button>
              <span>${item.quantity}</span>
              <button onclick="changeQuantity('${item.id}', 1)">+</button>
              <button class="remove-item" onclick="removeCartItem('${item.id}')">Xóa</button>
            </div>
          </div>
        `).join("")}
        <div class="checkout-summary">
          <h3>Tổng đơn hàng</h3>
          <p>${formatCurrency(items.reduce((sum, item) => sum + item.price * item.quantity, 0))}</p>
          <button class="button-primary" onclick="nextCheckoutStep()">Tiếp tục</button>
        </div>
      </div>
    `;
  } else if (checkoutStep === 2) {
    container.innerHTML = `
      <div class="checkout-card">
        <h3>Thông tin khách hàng</h3>
        <p>Vui lòng điền đầy đủ thông tin vào mục có dấu (*)</p>
        <label>Họ tên (*)</label>
        <input type="text" id="checkoutName" value="${checkoutInfo.name}" placeholder="Nguyễn Văn A" />
        <label>Email (*)</label>
        <input type="email" id="checkoutEmail" value="${checkoutInfo.email || ''}" placeholder="Email" />
        <label>Điện thoại (*)</label>
        <input type="text" id="checkoutPhone" value="${checkoutInfo.phone}" placeholder="0824 280 666" />
        <label>Địa chỉ (*)</label>
        <input type="text" id="checkoutAddress" value="${checkoutInfo.address}" placeholder="Số nhà, đường, quận, TP" />
        <label>Hình thức thanh toán (*)</label>
        <select id="checkoutPayment">
          <option value="Chuyển khoản" ${checkoutInfo.payment === 'Chuyển khoản' ? 'selected' : ''}>Thanh toán qua tài khoản ngân hàng</option>
          <option value="Tiền mặt" ${checkoutInfo.payment === 'Tiền mặt' ? 'selected' : ''}>Thanh toán khi nhận hàng</option>
          <option value="Ví điện tử" ${checkoutInfo.payment === 'Ví điện tử' ? 'selected' : ''}>Thanh toán qua ví điện tử</option>
        </select>
        <label>Yêu cầu đặc biệt</label>
        <textarea id="checkoutNote" placeholder="Yêu cầu đặc biệt">${checkoutInfo.note}</textarea>
        <div class="cart-actions">
          <button onclick="prevCheckoutStep()">Quay lại</button>
          <button class="button-primary" onclick="nextCheckoutStep()">Tiếp theo</button>
        </div>
      </div>
      <div class="checkout-summary">
        <h3>Thông tin đơn hàng</h3>
        <p>Số sản phẩm: ${items.reduce((sum, item) => sum + item.quantity, 0)}</p>
        <p>Tổng tiền: ${formatCurrency(items.reduce((sum, item) => sum + item.price * item.quantity, 0))}</p>
      </div>
    `;
  } else {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    container.innerHTML = `
      <div class="checkout-card">
        <h3>Xác nhận đơn hàng</h3>
        <p><strong>Khách hàng:</strong> ${checkoutInfo.name}</p>
        <p><strong>Email:</strong> ${checkoutInfo.email}</p>
        <p><strong>Điện thoại:</strong> ${checkoutInfo.phone}</p>
        <p><strong>Địa chỉ:</strong> ${checkoutInfo.address}</p>
        <p><strong>Hình thức thanh toán:</strong> ${checkoutInfo.payment}</p>
        <p><strong>Ghi chú:</strong> ${checkoutInfo.note || "Không có"}</p>
        <div class="checkout-summary">
          <h3>Chi tiết sản phẩm</h3>
          ${items.map(item => `<p>${item.quantity} x ${item.name} - ${formatCurrency(item.price * item.quantity)}</p>`).join("")}
          <p><strong>Tổng giá:</strong> ${formatCurrency(total)}</p>
          <button class="button-primary" onclick="finishCheckout()">Xác nhận đơn hàng</button>
        </div>
      </div>
    `;
  }

  updateCheckoutSteps();
}

function updateCheckoutSteps() {
  document.querySelectorAll('.checkout-step').forEach((step, index) => {
    step.classList.toggle('active', index === checkoutStep - 1);
  });
}

function changeQuantity(productId, delta) {
  if (!cart[productId]) return;
  cart[productId].quantity += delta;
  if (cart[productId].quantity < 1) delete cart[productId];
  saveCartToStorage();
  updateCartCount();
  renderCartPage();
}

function removeCartItem(productId) {
  delete cart[productId];
  saveCartToStorage();
  updateCartCount();
  renderCartPage();
  showToast('Sản phẩm đã được xóa khỏi giỏ hàng.');
}

function nextCheckoutStep() {
  if (!Object.values(cart).length) {
    alert('Giỏ hàng hiện chưa có sản phẩm.');
    return;
  }
  if (checkoutStep === 1) {
    checkoutStep = 2;
  } else if (checkoutStep === 2) {
    const name = document.getElementById('checkoutName').value.trim();
    const email = document.getElementById('checkoutEmail').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    const address = document.getElementById('checkoutAddress').value.trim();
    const payment = document.getElementById('checkoutPayment').value;
    if (!name || !email || !phone || !address) {
      alert('Vui lòng điền đầy đủ thông tin khách hàng.');
      return;
    }
    checkoutInfo = {
      name,
      email,
      phone,
      address,
      payment,
      note: document.getElementById('checkoutNote').value.trim(),
    };
    checkoutStep = 3;
  }
  renderCartPage();
}

function prevCheckoutStep() {
  if (checkoutStep > 1) {
    checkoutStep -= 1;
    renderCartPage();
  }
}

async function finishCheckout() {
  const items = Object.values(cart);
  if (!items.length) {
    showToast('Giỏ hàng đang trống.');
    return;
  }

  const payload = {
    customer: { ...checkoutInfo },
    items: items.map(it => ({ productId: it.id, quantity: it.quantity })),
  };

  if (hasAPI) {
    try {
      const result = await HappyKitchenAPI.createOrder(payload);
      const code = result?.data?.orderCode;
      showToast(`Đặt hàng thành công! Mã đơn: ${code}`);
    } catch (err) {
      console.warn('Không gửi được đơn hàng tới máy chủ:', err);
      showToast('Không kết nối được máy chủ, đơn hàng sẽ được xử lý thủ công.');
    }
  } else {
    showToast('Cảm ơn! Đơn hàng của bạn đã được tiếp nhận. Chúng tôi sẽ liên hệ lại sớm.');
  }

  cart = {};
  saveCartToStorage();
  updateCartCount();
  checkoutStep = 1;
  checkoutInfo = { name: "", email: "", phone: "", address: "", payment: "Chuyển khoản", note: "" };
  renderCartPage();
  showPage('home');
}

async function submitContact(event) {
  event.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();
  if (!name || !email || !message) {
    alert('Vui lòng điền đầy đủ thông tin liên hệ.');
    return;
  }
  if (hasAPI) {
    try {
      await HappyKitchenAPI.sendContact({ name, email, message });
    } catch (err) {
      console.warn('Không gửi liên hệ tới máy chủ:', err);
    }
  }
  showToast('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
  document.getElementById('contactName').value = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('contactMessage').value = '';
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.main-nav a').forEach(link => link.classList.remove('active-nav'));
  const target = document.getElementById(pageId);
  if (target) target.classList.add('active');
  const activeLink = Array.from(document.querySelectorAll('.main-nav a')).find(link => link.dataset.page === pageId);
  if (activeLink) activeLink.classList.add('active-nav');
  if (pageId === 'sanpham') updatePageProducts();
  if (pageId === 'giohang') renderCartPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

async function bootstrapData() {
  if (!hasAPI) return;
  try {
    const [productsRes, newsRes] = await Promise.all([
      HappyKitchenAPI.listProducts({ limit: 200 }),
      HappyKitchenAPI.listNews(12),
    ]);
    if (Array.isArray(productsRes?.data) && productsRes.data.length) {
      // Chuẩn hóa dữ liệu để khớp với cấu trúc cũ
      appProducts = productsRes.data.map(p => ({
        ...p,
        oldPrice: Number(p.oldPrice) || 0,
        price: Number(p.price) || 0,
        sale: Number(p.sale) || 0,
        images: Array.isArray(p.images) && p.images.length ? p.images : [p.image],
      }));
    }
    if (Array.isArray(newsRes?.data) && newsRes.data.length) {
      appNews = newsRes.data;
    }
    renderFeaturedProducts();
    renderNewsItems();
    updatePageProducts();
  } catch (err) {
    console.warn('Không kết nối được API, dùng dữ liệu local:', err);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  renderFeaturedProducts();
  renderNewsItems();
  updatePageProducts();
  updateCartCount();
  renderCartPage();
  showPage('home');
  bootstrapData();
});
