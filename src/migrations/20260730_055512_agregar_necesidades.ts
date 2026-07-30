import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_necesidades_prioridad" AS ENUM('baja', 'media', 'alta');
  CREATE TYPE "public"."enum_necesidades_estado" AS ENUM('recibida', 'en_evaluacion', 'aprobada', 'en_ejecucion', 'completada');
  CREATE TABLE "necesidades" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"comunidad_id" integer NOT NULL,
  	"solicitante" varchar,
  	"prioridad" "enum_necesidades_prioridad" DEFAULT 'media' NOT NULL,
  	"costo_estimado" numeric,
  	"estado" "enum_necesidades_estado" DEFAULT 'recibida' NOT NULL,
  	"proyecto_resultante_id" integer,
  	"visible_publicamente" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "necesidades_locales" (
  	"titulo" varchar NOT NULL,
  	"descripcion" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "necesidades_id" integer;
  ALTER TABLE "necesidades" ADD CONSTRAINT "necesidades_comunidad_id_comunidades_id_fk" FOREIGN KEY ("comunidad_id") REFERENCES "public"."comunidades"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "necesidades" ADD CONSTRAINT "necesidades_proyecto_resultante_id_proyectos_id_fk" FOREIGN KEY ("proyecto_resultante_id") REFERENCES "public"."proyectos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "necesidades_locales" ADD CONSTRAINT "necesidades_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."necesidades"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "necesidades_comunidad_idx" ON "necesidades" USING btree ("comunidad_id");
  CREATE INDEX "necesidades_proyecto_resultante_idx" ON "necesidades" USING btree ("proyecto_resultante_id");
  CREATE INDEX "necesidades_updated_at_idx" ON "necesidades" USING btree ("updated_at");
  CREATE INDEX "necesidades_created_at_idx" ON "necesidades" USING btree ("created_at");
  CREATE UNIQUE INDEX "necesidades_locales_locale_parent_id_unique" ON "necesidades_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_necesidades_fk" FOREIGN KEY ("necesidades_id") REFERENCES "public"."necesidades"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_necesidades_id_idx" ON "payload_locked_documents_rels" USING btree ("necesidades_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "necesidades" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "necesidades_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "necesidades" CASCADE;
  DROP TABLE "necesidades_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_necesidades_fk";
  
  DROP INDEX "payload_locked_documents_rels_necesidades_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "necesidades_id";
  DROP TYPE "public"."enum_necesidades_prioridad";
  DROP TYPE "public"."enum_necesidades_estado";`)
}
