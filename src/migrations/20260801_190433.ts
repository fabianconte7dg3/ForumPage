import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "documentos_privados" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"uploaded_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar
  );
  
  CREATE TABLE "documentos_privados_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "becarios" DROP CONSTRAINT "becarios_documentacion_socioeconomica_id_media_id_fk";
  
  ALTER TABLE "registros_academicos" DROP CONSTRAINT "registros_academicos_documento_id_media_id_fk";
  
  ALTER TABLE "horas_labor_social" DROP CONSTRAINT "horas_labor_social_evidencia_id_media_id_fk";
  
  -- COPIA DE DATOS MIGRACIÓN (añadido manualmente)
  -- El id se preserva a propósito: es lo que mantiene válidas las FK de
  -- becarios/registros_academicos/horas_labor_social sin remapear nada.
  -- La url se reescribe porque la copiada apunta a la ruta pública de media.
  INSERT INTO "documentos_privados" (id, url, filename, mime_type, filesize, created_at, updated_at)
  SELECT m.id, REPLACE(m.url, '/media/', '/documentos-privados/'), m.filename, m.mime_type, m.filesize, m.created_at, m.updated_at
  FROM "media" m
  WHERE m.id IN (
    SELECT documento_id FROM registros_academicos WHERE documento_id IS NOT NULL
    UNION
    SELECT evidencia_id FROM horas_labor_social WHERE evidencia_id IS NOT NULL
    UNION
    SELECT documentacion_socioeconomica_id FROM becarios WHERE documentacion_socioeconomica_id IS NOT NULL
  ) ON CONFLICT DO NOTHING;

  INSERT INTO "documentos_privados_locales" (id, alt, _locale, _parent_id)
  SELECT ml.id, ml.alt, ml._locale, ml._parent_id
  FROM "media_locales" ml
  WHERE ml._parent_id IN (
    SELECT id FROM "documentos_privados"
  ) ON CONFLICT DO NOTHING;

  -- Ajustar secuencias
  SELECT setval('documentos_privados_id_seq', COALESCE((SELECT MAX(id)+1 FROM documentos_privados), 1), false);
  SELECT setval('documentos_privados_locales_id_seq', COALESCE((SELECT MAX(id)+1 FROM documentos_privados_locales), 1), false);
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "documentos_privados_id" integer;
  ALTER TABLE "documentos_privados" ADD CONSTRAINT "documentos_privados_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documentos_privados_locales" ADD CONSTRAINT "documentos_privados_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."documentos_privados"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "documentos_privados_uploaded_by_idx" ON "documentos_privados" USING btree ("uploaded_by_id");
  CREATE INDEX "documentos_privados_updated_at_idx" ON "documentos_privados" USING btree ("updated_at");
  CREATE INDEX "documentos_privados_created_at_idx" ON "documentos_privados" USING btree ("created_at");
  CREATE UNIQUE INDEX "documentos_privados_filename_idx" ON "documentos_privados" USING btree ("filename");
  CREATE INDEX "documentos_privados_sizes_thumbnail_sizes_thumbnail_file_idx" ON "documentos_privados" USING btree ("sizes_thumbnail_filename");
  CREATE UNIQUE INDEX "documentos_privados_locales_locale_parent_id_unique" ON "documentos_privados_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "becarios" ADD CONSTRAINT "becarios_documentacion_socioeconomica_id_documentos_privados_id_fk" FOREIGN KEY ("documentacion_socioeconomica_id") REFERENCES "public"."documentos_privados"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "registros_academicos" ADD CONSTRAINT "registros_academicos_documento_id_documentos_privados_id_fk" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos_privados"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "horas_labor_social" ADD CONSTRAINT "horas_labor_social_evidencia_id_documentos_privados_id_fk" FOREIGN KEY ("evidencia_id") REFERENCES "public"."documentos_privados"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documentos_privados_fk" FOREIGN KEY ("documentos_privados_id") REFERENCES "public"."documentos_privados"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_documentos_privados_id_idx" ON "payload_locked_documents_rels" USING btree ("documentos_privados_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "documentos_privados" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "documentos_privados_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "documentos_privados" CASCADE;
  DROP TABLE "documentos_privados_locales" CASCADE;
  -- IF EXISTS en los DROP CONSTRAINT (añadido manualmente): el CASCADE de
  -- arriba ya se llevó estas FK, así que el DROP explícito reventaba con
  -- "constraint ... does not exist" y dejaba el rollback a medias. Sin esto
  -- el down() no corre.
  ALTER TABLE "becarios" DROP CONSTRAINT IF EXISTS "becarios_documentacion_socioeconomica_id_documentos_privados_id_fk";

  ALTER TABLE "registros_academicos" DROP CONSTRAINT IF EXISTS "registros_academicos_documento_id_documentos_privados_id_fk";

  ALTER TABLE "horas_labor_social" DROP CONSTRAINT IF EXISTS "horas_labor_social_evidencia_id_documentos_privados_id_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_documentos_privados_fk";

  DROP INDEX IF EXISTS "payload_locked_documents_rels_documentos_privados_id_idx";
  ALTER TABLE "becarios" ADD CONSTRAINT "becarios_documentacion_socioeconomica_id_media_id_fk" FOREIGN KEY ("documentacion_socioeconomica_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "registros_academicos" ADD CONSTRAINT "registros_academicos_documento_id_media_id_fk" FOREIGN KEY ("documento_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "horas_labor_social" ADD CONSTRAINT "horas_labor_social_evidencia_id_media_id_fk" FOREIGN KEY ("evidencia_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "documentos_privados_id";`)
}
