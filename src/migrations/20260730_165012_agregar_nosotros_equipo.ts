import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "equipo" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"foto_id" integer,
  	"destacado" boolean DEFAULT false,
  	"orden" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "equipo_locales" (
  	"cargo" varchar NOT NULL,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "nosotros" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "nosotros_locales" (
  	"mision" jsonb,
  	"historia" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "equipo_id" integer;
  ALTER TABLE "equipo" ADD CONSTRAINT "equipo_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "equipo_locales" ADD CONSTRAINT "equipo_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."equipo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "nosotros_locales" ADD CONSTRAINT "nosotros_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."nosotros"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "equipo_foto_idx" ON "equipo" USING btree ("foto_id");
  CREATE INDEX "equipo_updated_at_idx" ON "equipo" USING btree ("updated_at");
  CREATE INDEX "equipo_created_at_idx" ON "equipo" USING btree ("created_at");
  CREATE UNIQUE INDEX "equipo_locales_locale_parent_id_unique" ON "equipo_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "nosotros_locales_locale_parent_id_unique" ON "nosotros_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_equipo_fk" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipo"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_equipo_id_idx" ON "payload_locked_documents_rels" USING btree ("equipo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "equipo" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "equipo_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "nosotros" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "nosotros_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "equipo" CASCADE;
  DROP TABLE "equipo_locales" CASCADE;
  DROP TABLE "nosotros" CASCADE;
  DROP TABLE "nosotros_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_equipo_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_equipo_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "equipo_id";`)
}
