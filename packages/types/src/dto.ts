// ─────────────────────────────────────────────────────────────
// API DTOs — Request/Response shapes for the REST API
// ─────────────────────────────────────────────────────────────

import type {
  UserRole,
  ItemType,
  PaymentMethod,
  Country,
} from "./enums";
import type {
  Company,
  Location,
  User,
  Item,
  ItemModifier,
  Order,
  OrderItem,
  Payment,
  AuditLogEntry,
} from "./entities";

// ── Company ──────────────────────────────────────────────────

export interface CreateCompanyDto {
  name: string;
  country: Country;
  taxId?: string;
}

export interface UpdateCompanyDto {
  name?: string;
  taxId?: string;
}

// ── Location ─────────────────────────────────────────────────

export interface CreateLocationDto {
  name: string;
  address?: string;
  phone?: string;
  timezone?: string;
}

export interface UpdateLocationDto {
  name?: string;
  address?: string;
  phone?: string;
  timezone?: string;
  isActive?: boolean;
}

// ── User ─────────────────────────────────────────────────────

export interface InviteUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  locationId?: string;
}

export interface UpdateUserDto {
  role?: UserRole;
  locationId?: string | null;
  isActive?: boolean;
}

// ── Item ─────────────────────────────────────────────────────

export interface CreateItemDto {
  type: ItemType;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  taxRate?: number;

  // Product-specific
  trackStock?: boolean;
  currentStock?: number;

  // Service-specific
  durationMinutes?: number;

  // Menu item modifiers
  modifiers?: CreateModifierDto[];

  // Service staff assignments
  staffUserIds?: string[];
}

export interface UpdateItemDto {
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  taxRate?: number;
  isActive?: boolean;
  trackStock?: boolean;
  currentStock?: number;
  durationMinutes?: number;
}

export interface CreateModifierDto {
  name: string;
  priceAdjustment: number;
  isRequired?: boolean;
}

// ── Order ────────────────────────────────────────────────────

export interface CreateOrderDto {
  locationId: string;
  notes?: string;
}

export interface AddOrderItemDto {
  itemId: string;
  quantity: number;
  modifiers?: Record<string, unknown>;
  discountAmount?: number;
  discountReason?: string;
}

export interface CompleteOrderDto {
  payments: CreatePaymentDto[];
}

export interface CreatePaymentDto {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface VoidOrderDto {
  reason: string;
}

// ── Reports ──────────────────────────────────────────────────

export interface EmployeeActivityReport {
  userId: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  discountsApplied: number;
  totalDiscountAmount: number;
  voidedOrders: number;
  sessionHours: number;
}

export interface DashboardSummary {
  todaySales: number;
  todayRevenue: number;
  todayAverageTicket: number;
  todayVoids: number;
  activeEmployees: number;
  topSellingItems: Array<{ itemId: string; itemName: string; quantity: number }>;
}

// ── API Response Wrappers ────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// ── Pagination ───────────────────────────────────────────────

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ── Detailed response types (with nested data) ──────────────

export interface OrderWithItems extends Order {
  items: (OrderItem & { itemName: string })[];
  payments: Payment[];
}

export interface ItemWithModifiers extends Item {
  modifiers: ItemModifier[];
}

export interface CompanyWithLocations extends Company {
  locations: Location[];
}

export interface UserWithActivity extends User {
  activity: EmployeeActivityReport;
}
