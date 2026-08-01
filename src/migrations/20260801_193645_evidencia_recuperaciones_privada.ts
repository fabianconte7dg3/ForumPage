import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "recuperaciones" DROP CONSTRAINT "recuperaciones_evidencia_id_media_id_fk";

  -- COPIA DE DATOS (añadido manualmente) — mismo patrón que 20260801_190433.
  -- Va ANTES de crear la FK nueva: si no, las filas cuya evidencia todavía
  -- solo existe en "media" la harían fallar.
  -- El id se preserva a propósito: es lo que mantiene válida la FK sin
  -- remapear nada. La url se reescribe porque la copiada apunta a la ruta
  -- pública de media.
  INSERT INTO "documentos_privados" (id, url, filename, mime_type, filesize, created_at, updated_at)
  SELECT m.id, REPLACE(m.url, '/media/', '/documentos-privados/'), m.filename, m.mime_type, m.filesize, m.created_at, m.updated_at
  FROM "media" m
  WHERE m.id IN (
    SELECT evidencia_id FROM recuperaciones WHERE evidencia_id IS NOT NULL
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

  ALTER TABLE "recuperaciones" ADD CONSTRAINT "recuperaciones_evidencia_id_documentos_privados_id_fk" FOREIGN KEY ("evidencia_id") REFERENCES "public"."documentos_privados"("id") ON DELETE set null ON UPDATE no action;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "recuperaciones" DROP CONSTRAINT "recuperaciones_evidencia_id_documentos_privados_id_fk";
  
  ALTER TABLE "recuperaciones" ADD CONSTRAINT "recuperaciones_evidencia_id_media_id_fk" FOREIGN KEY ("evidencia_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;`)
}
