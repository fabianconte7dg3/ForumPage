import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "registros_academicos" DROP CONSTRAINT "registros_academicos_documento_id_documentos_privados_id_fk";
  DROP INDEX "registros_academicos_documento_idx";
  ALTER TABLE "registros_academicos" DROP COLUMN "documento_id";
  ALTER TABLE "registros_academicos" ADD COLUMN "documento_matricula_id" integer;
  ALTER TABLE "registros_academicos" ADD COLUMN "documento_creditos_id" integer;
  ALTER TABLE "registros_academicos" ADD CONSTRAINT "registros_academicos_documento_matricula_id_documentos_privados_id_fk" FOREIGN KEY ("documento_matricula_id") REFERENCES "public"."documentos_privados"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "registros_academicos" ADD CONSTRAINT "registros_academicos_documento_creditos_id_documentos_privados_id_fk" FOREIGN KEY ("documento_creditos_id") REFERENCES "public"."documentos_privados"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "registros_academicos_documento_matricula_idx" ON "registros_academicos" USING btree ("documento_matricula_id");
  CREATE INDEX "registros_academicos_documento_creditos_idx" ON "registros_academicos" USING btree ("documento_creditos_id");

  ALTER TABLE "horas_labor_social" DROP CONSTRAINT "horas_labor_social_evidencia_id_documentos_privados_id_fk";
  DROP INDEX "horas_labor_social_evidencia_idx";
  ALTER TABLE "horas_labor_social" DROP COLUMN "evidencia_id";
  CREATE TABLE "horas_labor_social_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"documentos_privados_id" integer
  );
  ALTER TABLE "horas_labor_social_rels" ADD CONSTRAINT "horas_labor_social_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."horas_labor_social"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "horas_labor_social_rels" ADD CONSTRAINT "horas_labor_social_rels_documentos_privados_fk" FOREIGN KEY ("documentos_privados_id") REFERENCES "public"."documentos_privados"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "horas_labor_social_rels_order_idx" ON "horas_labor_social_rels" USING btree ("order");
  CREATE INDEX "horas_labor_social_rels_parent_idx" ON "horas_labor_social_rels" USING btree ("parent_id");
  CREATE INDEX "horas_labor_social_rels_path_idx" ON "horas_labor_social_rels" USING btree ("path");
  CREATE INDEX "horas_labor_social_rels_documentos_privados_id_idx" ON "horas_labor_social_rels" USING btree ("documentos_privados_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "registros_academicos" DROP CONSTRAINT IF EXISTS "registros_academicos_documento_matricula_id_documentos_privados_id_fk";
  ALTER TABLE "registros_academicos" DROP CONSTRAINT IF EXISTS "registros_academicos_documento_creditos_id_documentos_privados_id_fk";
  DROP INDEX IF EXISTS "registros_academicos_documento_matricula_idx";
  DROP INDEX IF EXISTS "registros_academicos_documento_creditos_idx";
  ALTER TABLE "registros_academicos" DROP COLUMN IF EXISTS "documento_matricula_id";
  ALTER TABLE "registros_academicos" DROP COLUMN IF EXISTS "documento_creditos_id";
  ALTER TABLE "registros_academicos" ADD COLUMN "documento_id" integer;
  ALTER TABLE "registros_academicos" ADD CONSTRAINT "registros_academicos_documento_id_documentos_privados_id_fk" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos_privados"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "registros_academicos_documento_idx" ON "registros_academicos" USING btree ("documento_id");

  DROP TABLE IF EXISTS "horas_labor_social_rels" CASCADE;
  ALTER TABLE "horas_labor_social" ADD COLUMN "evidencia_id" integer;
  ALTER TABLE "horas_labor_social" ADD CONSTRAINT "horas_labor_social_evidencia_id_documentos_privados_id_fk" FOREIGN KEY ("evidencia_id") REFERENCES "public"."documentos_privados"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "horas_labor_social_evidencia_idx" ON "horas_labor_social" USING btree ("evidencia_id");`)
}
