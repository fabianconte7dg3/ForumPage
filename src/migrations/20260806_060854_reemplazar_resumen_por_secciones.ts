import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "nosotros_secciones_resumen" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"imagen_id" integer
  );
  
  CREATE TABLE "nosotros_secciones_resumen_locales" (
  	"titulo" varchar NOT NULL,
  	"texto" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "nosotros_secciones_resumen" ADD CONSTRAINT "nosotros_secciones_resumen_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "nosotros_secciones_resumen" ADD CONSTRAINT "nosotros_secciones_resumen_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."nosotros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "nosotros_secciones_resumen_locales" ADD CONSTRAINT "nosotros_secciones_resumen_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."nosotros_secciones_resumen"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "nosotros_secciones_resumen_order_idx" ON "nosotros_secciones_resumen" USING btree ("_order");
  CREATE INDEX "nosotros_secciones_resumen_parent_id_idx" ON "nosotros_secciones_resumen" USING btree ("_parent_id");
  CREATE INDEX "nosotros_secciones_resumen_imagen_idx" ON "nosotros_secciones_resumen" USING btree ("imagen_id");
  CREATE UNIQUE INDEX "nosotros_secciones_resumen_locales_locale_parent_id_unique" ON "nosotros_secciones_resumen_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "nosotros_locales" DROP COLUMN "resumen";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "nosotros_secciones_resumen" CASCADE;
  DROP TABLE "nosotros_secciones_resumen_locales" CASCADE;
  ALTER TABLE "nosotros_locales" ADD COLUMN "resumen" jsonb;`)
}
