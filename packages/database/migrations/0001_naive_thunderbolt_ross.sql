ALTER TABLE "companies" ADD COLUMN "domain" varchar(255);--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_domain_unique" UNIQUE("domain");