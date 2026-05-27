const API_BASE = '/api';

const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = localStorage.getItem('adminToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

// Restaurant API
export const getRestaurantInfo = async () => {
  const response = await fetch(`${API_BASE}/restaurant`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// Queue API
export const joinQueue = async (data) => {
  const response = await fetch(`${API_BASE}/queue/join`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getQueueStatus = async (token) => {
  const response = await fetch(`${API_BASE}/queue/status/${token}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getFullQueue = async () => {
  const response = await fetch(`${API_BASE}/queue/admin/all`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

export const seatCustomer = async (id) => {
  const response = await fetch(`${API_BASE}/queue/admin/${id}/seat`, {
    method: 'PATCH',
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

export const removeCustomer = async (id) => {
  const response = await fetch(`${API_BASE}/queue/admin/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

// Menu API
export const getMenu = async () => {
  const response = await fetch(`${API_BASE}/menu`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getAllMenuItems = async () => {
  const response = await fetch(`${API_BASE}/menu/admin/all`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

export const addMenuItem = async (data) => {
  const response = await fetch(`${API_BASE}/menu`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateMenuItem = async (id, data) => {
  const response = await fetch(`${API_BASE}/menu/${id}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteMenuItem = async (id) => {
  const response = await fetch(`${API_BASE}/menu/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

// Orders API
export const placeOrder = async (data) => {
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getOrders = async () => {
  const response = await fetch(`${API_BASE}/orders/admin`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

export const updateOrderStatus = async (id, status) => {
  const response = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
};

// Auth API
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const verifyToken = async () => {
  const response = await fetch(`${API_BASE}/auth/verify`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

// AI API
export const getWaitPrediction = async () => {
  const response = await fetch(`${API_BASE}/ai/predict-wait`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};
