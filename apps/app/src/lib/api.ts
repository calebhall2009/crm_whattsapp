// ─────────────────────────────────────────────────────────────
// API Client — secure fetch wrapper
//
// - Uses Clerk session token via cookie (same-origin) or
//   Authorization header (cross-origin)
// - NEVER stores tokens in localStorage or sessionStorage
// - NEVER puts tokens in URL query params
// - Supports AbortSignal for cancellation
// ─────────────────────────────────────────────────────────────

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://posapi-production-4969.up.railway.app";


interface FetchOptions extends Omit<RequestInit, "body"> {
  token?: string;
  body?: unknown;
}

class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function parseResponseBody<T>(res: Response): Promise<T> {
  // Si la respuesta no tiene contenido (204/304), devolvemos un objeto vacío
  // en lugar de hacer fallar el parseo con response.json().
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return {} as T;
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  // Fallback a texto para endpoints que no devuelven JSON.
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return { message: text } as unknown as T;
  }
}

async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, body, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(fetchOptions.headers as Record<string, string> | undefined),
  };

  // Solo añadimos Content-Type si hay body y no es FormData
  // (FormData requiere que el browser setee el boundary automáticamente).
  if (body !== undefined && !(body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const init: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: "include", // include cookies
  };
  if (body !== undefined) {
    init.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, init);

  if (!response.ok) {
    const errorBody = await parseResponseBody<{ message?: string; [k: string]: unknown }>(response).catch(
      () => ({ message: response.statusText })
    );
    throw new ApiError(
      errorBody.message || `API Error: ${response.status}`,
      response.status,
      errorBody
    );
  }

  return parseResponseBody<T>(response);
}

// ── Typed API methods ────────────────────────────────────────

export const api = {
  // Companies
  getMyCompany: (token: string) =>
    apiFetch<any>("/companies/me", { token }),

  // Items
  getItems: (token: string, type?: string) =>
    apiFetch<any>(`/items${type ? `?type=${encodeURIComponent(type)}` : ""}`, { token }),
  getItem: (token: string, id: string) =>
    apiFetch<any>(`/items/${encodeURIComponent(id)}`, { token }),
  createItem: (token: string, data: any) =>
    apiFetch<any>("/items", { token, method: "POST", body: data }),
  updateItem: (token: string, id: string, data: any) =>
    apiFetch<any>(`/items/${encodeURIComponent(id)}`, { token, method: "PUT", body: data }),

  // Orders
  getOrders: (token: string) =>
    apiFetch<any>("/orders", { token }),
  getOrder: (token: string, id: string) =>
    apiFetch<any>(`/orders/${encodeURIComponent(id)}`, { token }),
  createOrder: (token: string, data: any) =>
    apiFetch<any>("/orders", { token, method: "POST", body: data }),
  addOrderItem: (token: string, orderId: string, data: any) =>
    apiFetch<any>(`/orders/${encodeURIComponent(orderId)}/items`, { token, method: "POST", body: data }),
  completeOrder: (token: string, orderId: string, data: any) =>
    apiFetch<any>(`/orders/${encodeURIComponent(orderId)}/complete`, { token, method: "POST", body: data }),

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

  // Contacts
  getContacts: (token: string, params?: { search?: string; status?: string }) => {
    const sp = new URLSearchParams();
    if (params?.search) sp.set("search", params.search);
    if (params?.status) sp.set("status", params.status);
    const qs = sp.toString();
    return apiFetch<any>(`/contacts${qs ? `?${qs}` : ""}`, { token });
  },
  createContact: (token: string, data: any) =>
    apiFetch<any>("/contacts", { token, method: "POST", body: data }),

  // Conversations
  getConversations: (token: string) =>
    apiFetch<any>("/conversations", { token }),
  getConversationMessages: (token: string, id: string) =>
    apiFetch<any>(`/conversations/${encodeURIComponent(id)}/messages`, { token }),
  sendMessage: (token: string, id: string, message: string) =>
    apiFetch<any>(`/conversations/${encodeURIComponent(id)}/messages`, {
      token,
      method: "POST",
      body: { message },
    }),
  takeOverConversation: (token: string, id: string) =>
    apiFetch<any>(`/conversations/${encodeURIComponent(id)}/assign`, {
      token,
      method: "POST",
      body: {},
    }),
};

export { ApiError };
