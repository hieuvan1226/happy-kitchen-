/**
 * Lớp client gọi REST API của Happy Kitchen.
 * Nếu API không có (mở file tĩnh trực tiếp), các hàm sẽ ném lỗi để
 * `script.js` fallback sang dữ liệu trong `products.js` / `news.js`.
 */
(function (global) {
  'use strict';

  // Tự suy luận BASE URL: nếu mở qua server (http/https) thì dùng cùng origin.
  // Nếu mở file tĩnh (file://), thử localhost:3000.
  const isHttp = /^https?:$/.test(location.protocol);
  const API_BASE = isHttp ? `${location.origin}/api` : 'http://localhost:3000/api';

  async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) {
      const error = new Error(json.error || `HTTP ${res.status}`);
      error.status = res.status;
      throw error;
    }
    return json;
  }

  const HappyKitchenAPI = {
    base: API_BASE,
    health: () => request('/health'),
    listProducts: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/products${query ? `?${query}` : ''}`);
    },
    getProduct: (id) => request(`/products/${encodeURIComponent(id)}`),
    listCategories: () => request('/categories'),
    listNews: (limit = 12) => request(`/news?limit=${limit}`),
    createOrder: (payload) =>
      request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
    sendContact: (payload) =>
      request('/contacts', { method: 'POST', body: JSON.stringify(payload) }),
  };

  global.HappyKitchenAPI = HappyKitchenAPI;
})(window);
