import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { locations, withTenantTransaction } from "@pos/database";
import { eq } from "drizzle-orm";

@Injectable()
export class LocationsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findAll(companyId: string) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      return tx.select().from(locations);
    });
  }

  async findById(companyId: string, id: string) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [loc] = await tx.select().from(locations).where(eq(locations.id, id)).limit(1);
      if (!loc) throw new NotFoundException("Location not found");
      return loc;
    });
  }

  async create(companyId: string, data: {
    name: string;
    address?: string;
    phone?: string;
    timezone?: string;
  }) {
    const [loc] = await this.db
      .insert(locations)
      .values({ companyId, ...data } as any)
      .returning();
    return loc;
  }

  async update(companyId: string, id: string, data: {
    name?: string;
    address?: string;
    phone?: string;
    timezone?: string;
    isActive?: boolean;
  }) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [loc] = await tx
        .update(locations)
        .set(data as any)
        .where(eq(locations.id, id))
        .returning();
      if (!loc) throw new NotFoundException("Location not found");
      return loc;
    });
  }
}
