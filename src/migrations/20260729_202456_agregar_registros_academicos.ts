import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_registros_academicos_estado_verificacion" AS ENUM('pendiente', 'verificado');
  CREATE TABLE "registros_academicos_materias_aprobadas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"calificacion" varchar NOT NULL
  );
  
  CREATE TABLE "registros_academicos_materias_reprobadas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"calificacion" varchar NOT NULL
  );
  
  CREATE TABLE "registros_academicos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"becario_id" integer NOT NULL,
  	"periodo" varchar NOT NULL,
  	"universidad" varchar,
  	"indice" numeric,
  	"documento_id" integer,
  	"estado_verificacion" "enum_registros_academicos_estado_verificacion" DEFAULT 'pendiente' NOT NULL,
  	"verificado_por_id" integer,
  	"fecha_verificacion" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "registros_academicos_id" integer;
  ALTER TABLE "registros_academicos_materias_aprobadas" ADD CONSTRAINT "registros_academicos_materias_aprobadas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."registros_academicos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "registros_academicos_materias_reprobadas" ADD CONSTRAINT "registros_academicos_materias_reprobadas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."registros_academicos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "registros_academicos" ADD CONSTRAINT "registros_academicos_becario_id_becarios_id_fk" FOREIGN KEY ("becario_id") REFERENCES "public"."becarios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "registros_academicos" ADD CONSTRAINT "registros_academicos_documento_id_media_id_fk" FOREIGN KEY ("documento_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "registros_academicos" ADD CONSTRAINT "registros_academicos_verificado_por_id_users_id_fk" FOREIGN KEY ("verificado_por_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "registros_academicos_materias_aprobadas_order_idx" ON "registros_academicos_materias_aprobadas" USING btree ("_order");
  CREATE INDEX "registros_academicos_materias_aprobadas_parent_id_idx" ON "registros_academicos_materias_aprobadas" USING btree ("_parent_id");
  CREATE INDEX "registros_academicos_materias_reprobadas_order_idx" ON "registros_academicos_materias_reprobadas" USING btree ("_order");
  CREATE INDEX "registros_academicos_materias_reprobadas_parent_id_idx" ON "registros_academicos_materias_reprobadas" USING btree ("_parent_id");
  CREATE INDEX "registros_academicos_becario_idx" ON "registros_academicos" USING btree ("becario_id");
  CREATE INDEX "registros_academicos_documento_idx" ON "registros_academicos" USING btree ("documento_id");
  CREATE INDEX "registros_academicos_verificado_por_idx" ON "registros_academicos" USING btree ("verificado_por_id");
  CREATE INDEX "registros_academicos_updated_at_idx" ON "registros_academicos" USING btree ("updated_at");
  CREATE INDEX "registros_academicos_created_at_idx" ON "registros_academicos" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_registros_academicos_fk" FOREIGN KEY ("registros_academicos_id") REFERENCES "public"."registros_academicos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_registros_academicos_id_idx" ON "payload_locked_documents_rels" USING btree ("registros_academicos_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "registros_academicos_materias_aprobadas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "registros_academicos_materias_reprobadas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "registros_academicos" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "registros_academicos_materias_aprobadas" CASCADE;
  DROP TABLE "registros_academicos_materias_reprobadas" CASCADE;
  DROP TABLE "registros_academicos" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_registros_academicos_fk";
  
  DROP INDEX "payload_locked_documents_rels_registros_academicos_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "registros_academicos_id";
  DROP TYPE "public"."enum_registros_academicos_estado_verificacion";`)
}
