import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_becarios_tipo_estudio" AS ENUM('nacional', 'internacional');
  CREATE TYPE "public"."enum_becarios_estado" AS ENUM('activo', 'suspendido', 'graduado', 'retornado', 'retirado');
  CREATE TABLE "becarios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"comunidad_id" integer,
  	"universidad" varchar,
  	"anio" numeric,
  	"anio_inicio" numeric,
  	"tipo_estudio" "enum_becarios_tipo_estudio" DEFAULT 'nacional',
  	"pais_estudio" varchar,
  	"ciudad_estudio" varchar,
  	"coordenadas_estudio_lat" numeric,
  	"coordenadas_estudio_lng" numeric,
  	"estado" "enum_becarios_estado" DEFAULT 'activo' NOT NULL,
  	"motivo_suspension" varchar,
  	"fecha_suspension" timestamp(3) with time zone,
  	"meta_horas_personalizada" numeric,
  	"foto_id" integer,
  	"mostrar_en_mapa" boolean DEFAULT false,
  	"consentimiento_firmado" boolean DEFAULT false,
  	"consentimiento_fecha" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "becarios_locales" (
  	"carrera" varchar,
  	"cita" varchar,
  	"historia" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "becario_id" integer;
  ALTER TABLE "practicas" ADD COLUMN "slug" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "becarios_id" integer;
  ALTER TABLE "becarios" ADD CONSTRAINT "becarios_comunidad_id_comunidades_id_fk" FOREIGN KEY ("comunidad_id") REFERENCES "public"."comunidades"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "becarios" ADD CONSTRAINT "becarios_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "becarios_locales" ADD CONSTRAINT "becarios_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."becarios"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "becarios_comunidad_idx" ON "becarios" USING btree ("comunidad_id");
  CREATE INDEX "becarios_foto_idx" ON "becarios" USING btree ("foto_id");
  CREATE INDEX "becarios_updated_at_idx" ON "becarios" USING btree ("updated_at");
  CREATE INDEX "becarios_created_at_idx" ON "becarios" USING btree ("created_at");
  CREATE UNIQUE INDEX "becarios_locales_locale_parent_id_unique" ON "becarios_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "users" ADD CONSTRAINT "users_becario_id_becarios_id_fk" FOREIGN KEY ("becario_id") REFERENCES "public"."becarios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_becarios_fk" FOREIGN KEY ("becarios_id") REFERENCES "public"."becarios"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_becario_idx" ON "users" USING btree ("becario_id");
  CREATE UNIQUE INDEX "practicas_slug_idx" ON "practicas" USING btree ("slug");
  CREATE INDEX "payload_locked_documents_rels_becarios_id_idx" ON "payload_locked_documents_rels" USING btree ("becarios_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "becarios" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "becarios_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "becarios" CASCADE;
  DROP TABLE "becarios_locales" CASCADE;
  ALTER TABLE "users" DROP CONSTRAINT "users_becario_id_becarios_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_becarios_fk";
  
  DROP INDEX "users_becario_idx";
  DROP INDEX "practicas_slug_idx";
  DROP INDEX "payload_locked_documents_rels_becarios_id_idx";
  ALTER TABLE "users" DROP COLUMN "becario_id";
  ALTER TABLE "practicas" DROP COLUMN "slug";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "becarios_id";
  DROP TYPE "public"."enum_becarios_tipo_estudio";
  DROP TYPE "public"."enum_becarios_estado";`)
}
