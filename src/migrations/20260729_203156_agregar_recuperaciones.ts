import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_recuperaciones_estado" AS ENUM('pendiente', 'verificado');
  CREATE TABLE "recuperaciones" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"becario_id" integer NOT NULL,
  	"materia" varchar NOT NULL,
  	"periodo" varchar,
  	"evidencia_id" integer,
  	"estado" "enum_recuperaciones_estado" DEFAULT 'pendiente' NOT NULL,
  	"verificado_por_id" integer,
  	"fecha" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "recuperaciones_id" integer;
  ALTER TABLE "recuperaciones" ADD CONSTRAINT "recuperaciones_becario_id_becarios_id_fk" FOREIGN KEY ("becario_id") REFERENCES "public"."becarios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recuperaciones" ADD CONSTRAINT "recuperaciones_evidencia_id_media_id_fk" FOREIGN KEY ("evidencia_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recuperaciones" ADD CONSTRAINT "recuperaciones_verificado_por_id_users_id_fk" FOREIGN KEY ("verificado_por_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "recuperaciones_becario_idx" ON "recuperaciones" USING btree ("becario_id");
  CREATE INDEX "recuperaciones_evidencia_idx" ON "recuperaciones" USING btree ("evidencia_id");
  CREATE INDEX "recuperaciones_verificado_por_idx" ON "recuperaciones" USING btree ("verificado_por_id");
  CREATE INDEX "recuperaciones_updated_at_idx" ON "recuperaciones" USING btree ("updated_at");
  CREATE INDEX "recuperaciones_created_at_idx" ON "recuperaciones" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_recuperaciones_fk" FOREIGN KEY ("recuperaciones_id") REFERENCES "public"."recuperaciones"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_recuperaciones_id_idx" ON "payload_locked_documents_rels" USING btree ("recuperaciones_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "recuperaciones" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "recuperaciones" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_recuperaciones_fk";
  
  DROP INDEX "payload_locked_documents_rels_recuperaciones_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "recuperaciones_id";
  DROP TYPE "public"."enum_recuperaciones_estado";`)
}
