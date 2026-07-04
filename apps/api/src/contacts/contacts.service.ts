// ─────────────────────────────────────────────────────────────
// Contacts Service — CRM lead & client management
// ─────────────────────────────────────────────────────────────

import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { contacts } from "@pos/database";
import { eq, and, ilike, or, desc } from "drizzle-orm";
import { withTenantTransaction } from "@pos/database";

export interface CreateContactDto {
  name: string;
  phone: string;
  email?: string;
  source?: "whatsapp" | "manual" | "import" | "referral" | "web";
  assignedTo?: string;
  tags?: string[];
  notes?: string;
}

export interface UpdateContactDto {
  name?: string;
  email?: string;
  status?: "new" | "contacted" | "qualified" | "proposal" | "closed_won" | "closed_lost";
  assignedTo?: string | null;
  tags?: string[];
  notes?: string;
  nextFollowUpAt?: string;
}

@Injectable()
export class ContactsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findAll(
    companyId: string,
    options?: { search?: string; status?: string; assignedTo?: string }
  ) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const rows = await tx
        .select()
        .from(contacts)
        .where(
          and(
            eq(contacts.companyId, companyId),
            options?.status
              ? eq(contacts.status, options.status as any)
              : undefined,
            options?.assignedTo
              ? eq(contacts.assignedTo, options.assignedTo)
              : undefined,
            options?.search
              ? or(
                  ilike(contacts.name, `%${options.search}%`),
                  ilike(contacts.phone, `%${options.search}%`),
                  ilike(contacts.email, `%${options.search}%`)
                )
              : undefined
          )
        )
        .orderBy(desc(contacts.updatedAt));

      return rows;
    });
  }

  async findById(companyId: string, id: string) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [contact] = await tx
        .select()
        .from(contacts)
        .where(and(eq(contacts.id, id), eq(contacts.companyId, companyId)))
        .limit(1);

      if (!contact) throw new NotFoundException("Contact not found");
      return contact;
    });
  }

  async findByPhone(companyId: string, phone: string) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [contact] = await tx
        .select()
        .from(contacts)
        .where(and(eq(contacts.phone, phone), eq(contacts.companyId, companyId)))
        .limit(1);

      return contact ?? null;
    });
  }

  async create(companyId: string, data: CreateContactDto) {
    // Check for duplicate phone within this company
    const existing = await this.findByPhone(companyId, data.phone);
    if (existing) {
      throw new ConflictException(
        `A contact with phone ${data.phone} already exists`
      );
    }

    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [contact] = await tx
        .insert(contacts)
        .values({
          companyId,
          name: data.name,
          phone: data.phone,
          email: data.email,
          source: data.source ?? "manual",
          assignedTo: data.assignedTo,
          tags: data.tags ?? [],
          notes: data.notes,
        } as any)
        .returning();

      return contact;
    });
  }

  /** Upsert by phone — used by WhatsApp webhook for new leads */
  async upsertByPhone(companyId: string, data: CreateContactDto) {
    const existing = await this.findByPhone(companyId, data.phone);
    if (existing) return existing;
    return this.create(companyId, data);
  }

  async update(companyId: string, id: string, data: UpdateContactDto) {
    await this.findById(companyId, id); // ensure exists and belongs to tenant

    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [updated] = await tx
        .update(contacts)
        .set({
          ...data,
          nextFollowUpAt: data.nextFollowUpAt
            ? new Date(data.nextFollowUpAt)
            : undefined,
          updatedAt: new Date(),
        } as any)
        .where(and(eq(contacts.id, id), eq(contacts.companyId, companyId)))
        .returning();

      return updated;
    });
  }

  async touchLastContacted(companyId: string, id: string) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      await tx
        .update(contacts)
        .set({ lastContactedAt: new Date(), updatedAt: new Date() } as any)
        .where(and(eq(contacts.id, id), eq(contacts.companyId, companyId)));
    });
  }

  async delete(companyId: string, id: string) {
    await this.findById(companyId, id);

    return withTenantTransaction(this.db, companyId, async (tx) => {
      await tx
        .delete(contacts)
        .where(and(eq(contacts.id, id), eq(contacts.companyId, companyId)));
    });
  }
}
