import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "nosotros" ADD COLUMN "foto_id" integer;
  ALTER TABLE "nosotros" ADD COLUMN "logo_id" integer;
  ALTER TABLE "nosotros" ADD CONSTRAINT "nosotros_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "nosotros" ADD CONSTRAINT "nosotros_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "nosotros_foto_idx" ON "nosotros" USING btree ("foto_id");
  CREATE INDEX "nosotros_logo_idx" ON "nosotros" USING btree ("logo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "nosotros" DROP CONSTRAINT "nosotros_foto_id_media_id_fk";
  
  ALTER TABLE "nosotros" DROP CONSTRAINT "nosotros_logo_id_media_id_fk";
  
  DROP INDEX "nosotros_foto_idx";
  DROP INDEX "nosotros_logo_idx";
  ALTER TABLE "nosotros" DROP COLUMN "foto_id";
  ALTER TABLE "nosotros" DROP COLUMN "logo_id";`)
}
