// ─────────────────────────────────────────────────────────────
// API Client — secure fetch wrapper
//
// - Uses Clerk session token via cookie (same-origin) or
//   Authorization header (cross-origin)
// - NEVER stores tokens in localStorage or sessionStorage
// - NEVER puts tokens in URL query params
// ─────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Send token via Authorization header (cross-origin)
  // For same-origin, Clerk's __session cookie is sent automatically
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: "include", // Include cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// ── Typed API methods ────────────────────────────────────────

export const api = {
  // Companies
  getMyCompany: (token: string) =>
    apiFetch<any>("/companies/me", { token }),

  // Items
  getItems: (token: string, type?: string) =>
    apiFetch<any>(`/items${type ? `?type=${type}` : ""}`, { token }),
  getItem: (token: string, id: string) =>
    apiFetch<any>(`/items/${id}`, { token }),
  createItem: (token: string, data: any) =>
    apiFetch<any>("/items", { token, method: "POST", body: JSON.stringify(data) }),
  updateItem: (token: string, id: string, data: any) =>
    apiFetch<any>(`/items/${id}`, { token, method: "PUT", body: JSON.stringify(data) }),

  // Orders
  getOrders: (token: string) =>
    apiFetch<any>("/orders", { token }),
  getOrder: (token: string, id: string) =>
    apiFetch<any>(`/orders/${id}`, { token }),
  createOrder: (token: string, data: any) =>
    apiFetch<any>("/orders", { token, method: "POST", body: JSON.stringify(data) }),
  addOrderItem: (token: string, orderId: string, data: any) =>
    apiFetch<any>(`/orders/${orderId}/items`, { token, method: "POST", body: JSON.stringify(data) }),
  completeOrder: (token: string, orderId: string, data: any) =>
    apiFetch<any>(`/orders/${orderId}/complete`, { token, method: "POST", body: JSON.stringify(data) }),

  // Users
  getUsers: (token: string) =>
    apiFetch<any>("/users", { token }),

  // Reports
  getEmployeeReport: (token: string) =>
    apiFetch<any>("/reports/employees", { token }),
  getDashboard: (token: string) =>
    apiFetch<any>("/reports/dashboard", { token }),

  // Locations
  getLocations: (token: string) =>
    apiFetch<any>("/locations", { token }),
};
