import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_desembolsos_estado" AS ENUM('programado', 'retenido', 'pagado', 'cancelado');
  CREATE TABLE "desembolsos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"becario_id" integer NOT NULL,
  	"monto" numeric NOT NULL,
  	"fecha_programada" timestamp(3) with time zone NOT NULL,
  	"fecha_efectiva" timestamp(3) with time zone,
  	"estado" "enum_desembolsos_estado" DEFAULT 'programado' NOT NULL,
  	"concepto" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "desembolsos_id" integer;
  ALTER TABLE "desembolsos" ADD CONSTRAINT "desembolsos_becario_id_becarios_id_fk" FOREIGN KEY ("becario_id") REFERENCES "public"."becarios"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "desembolsos_becario_idx" ON "desembolsos" USING btree ("becario_id");
  CREATE INDEX "desembolsos_updated_at_idx" ON "desembolsos" USING btree ("updated_at");
  CREATE INDEX "desembolsos_created_at_idx" ON "desembolsos" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_desembolsos_fk" FOREIGN KEY ("desembolsos_id") REFERENCES "public"."desembolsos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_desembolsos_id_idx" ON "payload_locked_documents_rels" USING btree ("desembolsos_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "desembolsos" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "desembolsos" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_desembolsos_fk";
  
  DROP INDEX "payload_locked_documents_rels_desembolsos_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "desembolsos_id";
  DROP TYPE "public"."enum_desembolsos_estado";`)
}
