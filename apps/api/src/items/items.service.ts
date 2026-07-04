import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { items, itemModifiers, itemStaffAssignments, withTenantTransaction } from "@pos/database";
import { eq, and } from "drizzle-orm";

@Injectable()
export class ItemsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findAll(companyId: string, type?: string) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      if (type) {
        return tx.select().from(items).where(eq(items.type, type as any));
      }
      return tx.select().from(items);
    });
  }

  async findById(companyId: string, id: string) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [item] = await tx.select().from(items).where(eq(items.id, id)).limit(1);
      if (!item) throw new NotFoundException("Item not found");

      // Load modifiers for menu items
      let modifiers: any[] = [];
      if (item.type === "menu_item") {
        modifiers = await tx
          .select()
          .from(itemModifiers)
          .where(eq(itemModifiers.itemId, id));
      }

      // Load staff assignments for services
      let staffAssignments: any[] = [];
      if (item.type === "service") {
        staffAssignments = await tx
          .select()
          .from(itemStaffAssignments)
          .where(eq(itemStaffAssignments.itemId, id));
      }

      return { ...item, modifiers, staffAssignments };
    });
  }

  async create(companyId: string, data: {
    type: string;
    name: string;
    description?: string;
    sku?: string;
    price: number;
    taxRate?: number;
    trackStock?: boolean;
    currentStock?: number;
    durationMinutes?: number;
    modifiers?: Array<{ name: string; priceAdjustment: number; isRequired?: boolean }>;
    staffUserIds?: string[];
  }) {
    const { modifiers: modifierData, staffUserIds, ...itemData } = data;

    const [item] = await this.db
      .insert(items)
      .values({
        companyId,
        ...itemData,
        price: String(itemData.price),
        taxRate: String(itemData.taxRate || 0),
      } as any)
      .returning();

    // Insert modifiers for menu items
    if (modifierData?.length && data.type === "menu_item") {
      await this.db.insert(itemModifiers).values(
        modifierData.map((m) => ({
          itemId: item.id,
          companyId,
          name: m.name,
          priceAdjustment: String(m.priceAdjustment),
          isRequired: m.isRequired ?? false,
        }))
      );
    }

    // Insert staff assignments for services
    if (staffUserIds?.length && data.type === "service") {
      await this.db.insert(itemStaffAssignments).values(
        staffUserIds.map((userId) => ({
          itemId: item.id,
          userId,
          companyId,
        }))
      );
    }

    return item;
  }

  async update(companyId: string, id: string, data: {
    name?: string;
    description?: string;
    sku?: string;
    price?: number;
    taxRate?: number;
    isActive?: boolean;
    trackStock?: boolean;
    currentStock?: number;
    durationMinutes?: number;
  }) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const updateData: any = { ...data, updatedAt: new Date() };
      if (data.price !== undefined) updateData.price = String(data.price);
      if (data.taxRate !== undefined) updateData.taxRate = String(data.taxRate);

      const [item] = await tx
        .update(items)
        .set(updateData as any)
        .where(eq(items.id, id))
        .returning();

      if (!item) throw new NotFoundException("Item not found");
      return item;
    });
  }

  async adjustStock(companyId: string, itemId: string, delta: number) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [item] = await tx
        .select()
        .from(items)
        .where(eq(items.id, itemId))
        .limit(1);

      if (!item) throw new NotFoundException("Item not found");
      if (!item.trackStock) return item;

      const newStock = (item.currentStock || 0) + delta;

      const [updated] = await tx
        .update(items)
        .set({ currentStock: Math.max(0, newStock), updatedAt: new Date() } as any)
        .where(eq(items.id, itemId))
        .returning();

      return updated;
    });
  }
}
