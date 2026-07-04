// ─────────────────────────────────────────────────────────────
// Entity interfaces — Core data models
// ─────────────────────────────────────────────────────────────

import type {
  UserRole,
  ItemType,
  OrderStatus,
  PaymentMethod,
  FiscalStatus,
  FiscalDocumentType,
  Country,
  Currency,
  SubscriptionStatus,
  AuditAction,
} from "./enums";

// ── Company (Tenant) ─────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  slug: string;
  country: Country;
  currency: Currency;
  taxId: string | null;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId: string | null;
  trialEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Location (Branch / Sucursal) ─────────────────────────────

export interface Location {
  id: string;
  companyId: string;
  name: string;
  address: string | null;
  phone: string | null;
  timezone: string;
  isActive: boolean;
  createdAt: string;
}

// ── User ─────────────────────────────────────────────────────

export interface User {
  id: string;
  companyId: string;
  clerkUserId: string;
  role: UserRole;
  locationId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

// ── Item (Product | Menu Item | Service) ─────────────────────

export interface Item {
  id: string;
  companyId: string;
  type: ItemType;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  taxRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Product-specific
  trackStock: boolean | null;
  currentStock: number | null;

  // Service-specific
  durationMinutes: number | null;
}

export interface ItemModifier {
  id: string;
  itemId: string;
  companyId: string;
  name: string;
  priceAdjustment: number;
  isRequired: boolean;
}

export interface ItemStaffAssignment {
  id: string;
  itemId: string;
  userId: string;
  companyId: string;
}

// ── Order ────────────────────────────────────────────────────

export interface Order {
  id: string;
  companyId: string;
  locationId: string;
  cashierId: string;
  orderNumber: number;
  status: OrderStatus;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  notes: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemId: string;
  companyId: string;
  quantity: number;
  unitPrice: number;
  modifiersJson: Record<string, unknown> | null;
  discountAmount: number;
  discountReason: string | null;
  lineTotal: number;
}

// ── Payment ──────────────────────────────────────────────────

export interface Payment {
  id: string;
  orderId: string;
  companyId: string;
  method: PaymentMethod;
  amount: number;
  reference: string | null;
  createdAt: string;
}

// ── Fiscal Document ──────────────────────────────────────────

export interface FiscalDocument {
  id: string;
  orderId: string;
  companyId: string;
  country: Country;
  documentType: FiscalDocumentType;
  providerDocumentId: string | null;
  status: FiscalStatus;
  xmlPayload: string | null;
  errorMessage: string | null;
  attempts: number;
  lastAttemptAt: string | null;
  createdAt: string;
  authorizedAt: string | null;
}

// ── Audit Log ────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  companyId: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}
