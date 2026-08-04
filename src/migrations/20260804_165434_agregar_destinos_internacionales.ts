import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "destinos_internacionales" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"universidad" varchar NOT NULL,
  	"pais" varchar NOT NULL,
  	"ciudad" varchar NOT NULL,
  	"coordenadas_lat" numeric NOT NULL,
  	"coordenadas_lng" numeric NOT NULL,
  	"bandera" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "destinos_internacionales_id" integer;
  CREATE INDEX "destinos_internacionales_updated_at_idx" ON "destinos_internacionales" USING btree ("updated_at");
  CREATE INDEX "destinos_internacionales_created_at_idx" ON "destinos_internacionales" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_destinos_internacionales_fk" FOREIGN KEY ("destinos_internacionales_id") REFERENCES "public"."destinos_internacionales"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_destinos_internacionales_i_idx" ON "payload_locked_documents_rels" USING btree ("destinos_internacionales_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "destinos_internacionales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "destinos_internacionales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_destinos_internacionales_fk";

  DROP INDEX IF EXISTS "payload_locked_documents_rels_destinos_internacionales_i_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "destinos_internacionales_id";`)
}
