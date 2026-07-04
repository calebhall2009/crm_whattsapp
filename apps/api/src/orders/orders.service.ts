import { Injectable, Inject, NotFoundException, BadRequestException } from "@nestjs/common";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { orders, orderItems, payments, items, withTenantTransaction } from "@pos/database";
import { eq, and, desc, sql } from "drizzle-orm";
import { ItemsService } from "../items/items.service";

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly itemsService: ItemsService
  ) {}

  async findAll(companyId: string, options?: { status?: string; cashierId?: string }) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      let query = tx.select().from(orders).orderBy(desc(orders.createdAt));
      // Note: additional WHERE conditions would be applied here for filters
      return query;
    });
  }

  async findById(companyId: string, orderId: string) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!order) throw new NotFoundException("Order not found");

      const lineItems = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

      const orderPayments = await tx
        .select()
        .from(payments)
        .where(eq(payments.orderId, orderId));

      return { ...order, items: lineItems, payments: orderPayments };
    });
  }

  async create(companyId: string, data: {
    locationId: string;
    cashierId: string;
    notes?: string;
  }) {
    // Generate next order number for this company
    const result = await this.db.execute(
      sql`SELECT COALESCE(MAX(order_number), 0) + 1 as next_number
          FROM orders WHERE company_id = ${companyId}`
    );
    const rows = result as unknown as any[];
    const nextNumber = rows[0]?.next_number ? Number(rows[0].next_number) : 1;

    const [order] = await this.db
      .insert(orders)
      .values({
        companyId,
        locationId: data.locationId,
        cashierId: data.cashierId,
        orderNumber: nextNumber,
        notes: data.notes,
      } as any)
      .returning();

    return order;
  }

  async addItem(companyId: string, orderId: string, data: {
    itemId: string;
    quantity: number;
    modifiers?: Record<string, unknown>;
    discountAmount?: number;
    discountReason?: string;
  }) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      // Verify order is open
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!order) throw new NotFoundException("Order not found");
      if (order.status !== "open") throw new BadRequestException("Order is not open");

      // Get item price
      const [item] = await tx
        .select()
        .from(items)
        .where(eq(items.id, data.itemId))
        .limit(1);

      if (!item) throw new NotFoundException("Item not found");

      const unitPrice = parseFloat(item.price);
      const discount = data.discountAmount || 0;
      const lineTotal = unitPrice * data.quantity - discount;

      const [orderItem] = await tx
        .insert(orderItems)
        .values({
          orderId,
          itemId: data.itemId,
          companyId,
          quantity: data.quantity,
          unitPrice: String(unitPrice),
          modifiersJson: data.modifiers || null,
          discountAmount: String(discount),
          discountReason: data.discountReason,
          lineTotal: String(lineTotal),
        } as any)
        .returning();

      // Recalculate order totals
      await this.recalculateTotals(tx, orderId);

      return orderItem;
    });
  }

  async complete(companyId: string, orderId: string, paymentData: Array<{
    method: string;
    amount: number;
    reference?: string;
  }>) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!order) throw new NotFoundException("Order not found");
      if (order.status !== "open") throw new BadRequestException("Order is not open");

      // Verify payment covers the total
      const totalPaid = paymentData.reduce((sum, p) => sum + p.amount, 0);
      const orderTotal = parseFloat(order.total);

      if (totalPaid < orderTotal) {
        throw new BadRequestException(
          `Payment insufficient: $${totalPaid.toFixed(2)} < $${orderTotal.toFixed(2)}`
        );
      }

      // Record payments
      for (const payment of paymentData) {
        await tx.insert(payments).values({
          orderId,
          companyId,
          method: payment.method as any,
          amount: String(payment.amount),
          reference: payment.reference,
        } as any);
      }

      // Mark order as completed
      const [completed] = await tx
        .update(orders)
        .set({ status: "completed", completedAt: new Date() } as any)
        .where(eq(orders.id, orderId))
        .returning();

      // Decrement stock for products
      const lineItems = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

      for (const lineItem of lineItems) {
        await this.itemsService.adjustStock(
          companyId,
          lineItem.itemId,
          -lineItem.quantity
        );
      }

      return completed;
    });
  }

  async void(companyId: string, orderId: string, reason: string) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!order) throw new NotFoundException("Order not found");

      const [voided] = await tx
        .update(orders)
        .set({ status: "voided", notes: `VOIDED: ${reason}` } as any)
        .where(eq(orders.id, orderId))
        .returning();

      // Restore stock if order was completed
      if (order.status === "completed") {
        const lineItems = await tx
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, orderId));

        for (const lineItem of lineItems) {
          await this.itemsService.adjustStock(
            companyId,
            lineItem.itemId,
            lineItem.quantity
          );
        }
      }

      return voided;
    });
  }

  private async recalculateTotals(tx: any, orderId: string) {
    const lineItems = await tx
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    let subtotal = 0;
    let discountTotal = 0;

    for (const item of lineItems) {
      subtotal += parseFloat(item.lineTotal) + parseFloat(item.discountAmount);
      discountTotal += parseFloat(item.discountAmount);
    }

    // For v1, tax is calculated at a flat rate from the items
    // This will be refined with per-item tax rates
    const taxTotal = subtotal * 0.12; // 12% IVA for Ecuador default
    const total = subtotal - discountTotal + taxTotal;

    await tx
      .update(orders)
      .set({
        subtotal: String(subtotal.toFixed(2)),
        taxTotal: String(taxTotal.toFixed(2)),
        discountTotal: String(discountTotal.toFixed(2)),
        total: String(total.toFixed(2)),
      })
      .where(eq(orders.id, orderId));
  }
}
