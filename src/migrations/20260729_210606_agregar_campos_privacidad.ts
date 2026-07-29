import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "becarios" ADD COLUMN "condicion_socioeconomica_verificada" boolean DEFAULT false;
  ALTER TABLE "becarios" ADD COLUMN "documentacion_socioeconomica_id" integer;
  ALTER TABLE "registros_academicos" ADD COLUMN "nota_interna_evaluacion" varchar;
  ALTER TABLE "becarios" ADD CONSTRAINT "becarios_documentacion_socioeconomica_id_media_id_fk" FOREIGN KEY ("documentacion_socioeconomica_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "becarios_documentacion_socioeconomica_idx" ON "becarios" USING btree ("documentacion_socioeconomica_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "becarios" DROP CONSTRAINT "becarios_documentacion_socioeconomica_id_media_id_fk";
  
  DROP INDEX "becarios_documentacion_socioeconomica_idx";
  ALTER TABLE "becarios" DROP COLUMN "condicion_socioeconomica_verificada";
  ALTER TABLE "becarios" DROP COLUMN "documentacion_socioeconomica_id";
  ALTER TABLE "registros_academicos" DROP COLUMN "nota_interna_evaluacion";`)
}
