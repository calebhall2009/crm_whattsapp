import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { users, withTenantTransaction } from "@pos/database";
import { eq, and } from "drizzle-orm";

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findAllByCompany(companyId: string) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      return tx.select().from(users);
    });
  }

  async findById(companyId: string, userId: string) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) throw new NotFoundException("User not found");
      return user;
    });
  }

  async create(companyId: string, data: {
    clerkUserId: string;
    role: string;
    locationId?: string;
    firstName: string;
    lastName: string;
    email: string;
  }) {
    const [user] = await this.db
      .insert(users)
      .values({ companyId, ...data } as any)
      .returning();

    return user;
  }

  async update(companyId: string, userId: string, data: {
    role?: string;
    locationId?: string | null;
    isActive?: boolean;
  }) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [user] = await tx
        .update(users)
        .set(data as any)
        .where(eq(users.id, userId))
        .returning();

      if (!user) throw new NotFoundException("User not found");
      return user;
    });
  }

  async findByClerkId(clerkUserId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    return user;
  }

  async updateLastLogin(userId: string) {
    await this.db
      .update(users)
      .set({ lastLoginAt: new Date() } as any)
      .where(eq(users.id, userId));
  }
}
