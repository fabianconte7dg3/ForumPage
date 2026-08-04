import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "fotos_becarios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"publica" boolean DEFAULT false,
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
  
  CREATE TABLE "fotos_becarios_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "becarios" DROP CONSTRAINT "becarios_foto_id_media_id_fk";

  -- COPIA DE DATOS MIGRACIÓN (añadido manualmente, mismo patrón que
  -- 20260801_190433 para documentos_privados). El id se preserva a propósito:
  -- es lo que mantiene válida la FK de becarios.foto_id sin remapear nada.
  -- La columna publica se calcula acá mismo a partir del mostrar_en_mapa
  -- vigente del becario dueño, para no dejar todo en false hasta el próximo save.
  INSERT INTO "fotos_becarios" (id, publica, url, filename, mime_type, filesize, width, height, focal_x, focal_y, sizes_thumbnail_url, sizes_thumbnail_width, sizes_thumbnail_height, sizes_thumbnail_mime_type, sizes_thumbnail_filesize, sizes_thumbnail_filename, created_at, updated_at)
  SELECT m.id,
    COALESCE((SELECT b.mostrar_en_mapa FROM becarios b WHERE b.foto_id = m.id), false),
    m.url, m.filename, m.mime_type, m.filesize, m.width, m.height, m.focal_x, m.focal_y,
    m.sizes_thumbnail_url, m.sizes_thumbnail_width, m.sizes_thumbnail_height, m.sizes_thumbnail_mime_type, m.sizes_thumbnail_filesize, m.sizes_thumbnail_filename,
    m.created_at, m.updated_at
  FROM "media" m
  WHERE m.id IN (SELECT foto_id FROM becarios WHERE foto_id IS NOT NULL)
  ON CONFLICT DO NOTHING;

  INSERT INTO "fotos_becarios_locales" (id, alt, _locale, _parent_id)
  SELECT ml.id, ml.alt, ml._locale, ml._parent_id
  FROM "media_locales" ml
  WHERE ml._parent_id IN (SELECT id FROM "fotos_becarios")
  ON CONFLICT DO NOTHING;

  SELECT setval('fotos_becarios_id_seq', COALESCE((SELECT MAX(id)+1 FROM fotos_becarios), 1), false);
  SELECT setval('fotos_becarios_locales_id_seq', COALESCE((SELECT MAX(id)+1 FROM fotos_becarios_locales), 1), false);

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "fotos_becarios_id" integer;
  ALTER TABLE "fotos_becarios_locales" ADD CONSTRAINT "fotos_becarios_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fotos_becarios"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "fotos_becarios_updated_at_idx" ON "fotos_becarios" USING btree ("updated_at");
  CREATE INDEX "fotos_becarios_created_at_idx" ON "fotos_becarios" USING btree ("created_at");
  CREATE UNIQUE INDEX "fotos_becarios_filename_idx" ON "fotos_becarios" USING btree ("filename");
  CREATE INDEX "fotos_becarios_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "fotos_becarios" USING btree ("sizes_thumbnail_filename");
  CREATE UNIQUE INDEX "fotos_becarios_locales_locale_parent_id_unique" ON "fotos_becarios_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "becarios" ADD CONSTRAINT "becarios_foto_id_fotos_becarios_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."fotos_becarios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fotos_becarios_fk" FOREIGN KEY ("fotos_becarios_id") REFERENCES "public"."fotos_becarios"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_fotos_becarios_id_idx" ON "payload_locked_documents_rels" USING btree ("fotos_becarios_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "fotos_becarios" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fotos_becarios_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "fotos_becarios" CASCADE;
  DROP TABLE "fotos_becarios_locales" CASCADE;
  ALTER TABLE "becarios" DROP CONSTRAINT IF EXISTS "becarios_foto_id_fotos_becarios_id_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_fotos_becarios_fk";

  DROP INDEX IF EXISTS "payload_locked_documents_rels_fotos_becarios_id_idx";
  ALTER TABLE "becarios" ADD CONSTRAINT "becarios_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "fotos_becarios_id";`)
}
