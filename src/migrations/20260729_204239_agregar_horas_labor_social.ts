import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_horas_labor_social_estado" AS ENUM('pendiente', 'aprobada', 'rechazada');
  CREATE TABLE "horas_labor_social" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"becario_id" integer NOT NULL,
  	"fecha" timestamp(3) with time zone NOT NULL,
  	"horas" numeric NOT NULL,
  	"descripcion" varchar,
  	"evidencia_id" integer,
  	"estado" "enum_horas_labor_social_estado" DEFAULT 'pendiente' NOT NULL,
  	"aprobador_id" integer,
  	"comentario" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "horas_labor_social_id" integer;
  ALTER TABLE "horas_labor_social" ADD CONSTRAINT "horas_labor_social_becario_id_becarios_id_fk" FOREIGN KEY ("becario_id") REFERENCES "public"."becarios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "horas_labor_social" ADD CONSTRAINT "horas_labor_social_evidencia_id_media_id_fk" FOREIGN KEY ("evidencia_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "horas_labor_social" ADD CONSTRAINT "horas_labor_social_aprobador_id_users_id_fk" FOREIGN KEY ("aprobador_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "horas_labor_social_becario_idx" ON "horas_labor_social" USING btree ("becario_id");
  CREATE INDEX "horas_labor_social_evidencia_idx" ON "horas_labor_social" USING btree ("evidencia_id");
  CREATE INDEX "horas_labor_social_aprobador_idx" ON "horas_labor_social" USING btree ("aprobador_id");
  CREATE INDEX "horas_labor_social_updated_at_idx" ON "horas_labor_social" USING btree ("updated_at");
  CREATE INDEX "horas_labor_social_created_at_idx" ON "horas_labor_social" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_horas_labor_social_fk" FOREIGN KEY ("horas_labor_social_id") REFERENCES "public"."horas_labor_social"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_horas_labor_social_id_idx" ON "payload_locked_documents_rels" USING btree ("horas_labor_social_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "horas_labor_social" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "horas_labor_social" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_horas_labor_social_fk";
  
  DROP INDEX "payload_locked_documents_rels_horas_labor_social_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "horas_labor_social_id";
  DROP TYPE "public"."enum_horas_labor_social_estado";`)
}
