-- AlterTable
ALTER TABLE "providers" ADD COLUMN "is_postpaid" BOOLEAN NOT NULL DEFAULT false;

-- Existing invoice-billed providers: balance is amount owed / credit, not prepaid funds.
UPDATE "providers" SET "is_postpaid" = true WHERE "kind" IN ('linode', 'vultr');
