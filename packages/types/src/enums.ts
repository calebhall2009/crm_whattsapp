// ─────────────────────────────────────────────────────────────
// Enums — Shared across frontend and backend
// ─────────────────────────────────────────────────────────────

export enum UserRole {
  OWNER = "owner",
  ADMIN = "admin",
  MANAGER = "manager",
  CASHIER = "cashier",
}

export enum ItemType {
  PRODUCT = "product",
  MENU_ITEM = "menu_item",
  SERVICE = "service",
}

export enum OrderStatus {
  OPEN = "open",
  COMPLETED = "completed",
  VOIDED = "voided",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  CASH = "cash",
  CARD = "card",
  TRANSFER = "transfer",
  OTHER = "other",
}

export enum FiscalStatus {
  PENDING = "pending",
  SENT = "sent",
  AUTHORIZED = "authorized",
  REJECTED = "rejected",
  VOIDED = "voided",
}

export enum FiscalDocumentType {
  INVOICE = "invoice",
  RECEIPT = "receipt",
  CREDIT_NOTE = "credit_note",
}

export enum Country {
  EC = "EC", // Ecuador
}

export enum Currency {
  USD = "USD", // Ecuador (dólar)
}

export enum SubscriptionStatus {
  TRIALING = "trialing",
  ACTIVE = "active",
  PAST_DUE = "past_due",
  CANCELED = "canceled",
  UNPAID = "unpaid",
}

export enum AuditAction {
  // Auth
  LOGIN = "login",
  LOGOUT = "logout",

  // Items
  ITEM_CREATED = "item.created",
  ITEM_UPDATED = "item.updated",
  ITEM_DELETED = "item.deleted",

  // Orders
  ORDER_CREATED = "order.created",
  ORDER_COMPLETED = "order.completed",
  ORDER_VOIDED = "order.voided",
  ORDER_REFUNDED = "order.refunded",

  // Payments
  PAYMENT_RECORDED = "payment.recorded",

  // Discounts
  DISCOUNT_APPLIED = "discount.applied",

  // Users
  USER_INVITED = "user.invited",
  USER_ROLE_CHANGED = "user.role_changed",
  USER_DEACTIVATED = "user.deactivated",

  // Fiscal
  FISCAL_DOCUMENT_SENT = "fiscal.sent",
  FISCAL_DOCUMENT_AUTHORIZED = "fiscal.authorized",
  FISCAL_DOCUMENT_REJECTED = "fiscal.rejected",
}

/** Maps Country to its default Currency */
export const COUNTRY_CURRENCY: Record<Country, Currency> = {
  [Country.EC]: Currency.USD,
};
