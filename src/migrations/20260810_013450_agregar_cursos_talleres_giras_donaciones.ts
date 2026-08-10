import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_becarios_tipo_apoyo" AS ENUM('hospedaje', 'transporte', 'alimento');
  CREATE TYPE "public"."enum_becarios_nivel_educativo" AS ENUM('primaria', 'premedia', 'media', 'universidad');
  CREATE TYPE "public"."enum_cursos_tipo" AS ENUM('estudiantes', 'adultos');
  CREATE TYPE "public"."enum_talleres_tipo" AS ENUM('estudiantes', 'adultos');
  CREATE TYPE "public"."enum_donaciones_tipo_institucion" AS ENUM('escuela', 'universidad', 'centro_salud', 'iglesia', 'otro');
  CREATE TABLE "becarios_tipo_apoyo" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_becarios_tipo_apoyo",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cursos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tipo" "enum_cursos_tipo" DEFAULT 'estudiantes' NOT NULL,
  	"sede_id" integer,
  	"fecha_inicio" timestamp(3) with time zone,
  	"responsable" varchar,
  	"realizada" boolean DEFAULT false,
  	"participantes" numeric,
  	"notas" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cursos_locales" (
  	"nombre" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "talleres" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tipo" "enum_talleres_tipo" DEFAULT 'estudiantes' NOT NULL,
  	"sede_id" integer,
  	"fecha" timestamp(3) with time zone,
  	"responsable" varchar,
  	"realizada" boolean DEFAULT false,
  	"participantes" numeric,
  	"notas" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "talleres_locales" (
  	"nombre" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "giras_educativas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"escuela_id" integer NOT NULL,
  	"nivel_id" integer,
  	"fecha" timestamp(3) with time zone,
  	"realizada" boolean DEFAULT false,
  	"participantes" numeric,
  	"notas" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "giras_educativas_locales" (
  	"destino" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "donaciones" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"institucion" varchar NOT NULL,
  	"tipo_institucion" "enum_donaciones_tipo_institucion" DEFAULT 'escuela',
  	"comunidad_id" integer,
  	"fecha" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "donaciones_locales" (
  	"descripcion" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "becarios" ADD COLUMN "nivel_educativo" "enum_becarios_nivel_educativo" DEFAULT 'universidad' NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cursos_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "talleres_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "giras_educativas_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "donaciones_id" integer;
  ALTER TABLE "becarios_tipo_apoyo" ADD CONSTRAINT "becarios_tipo_apoyo_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."becarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cursos" ADD CONSTRAINT "cursos_sede_id_sedes_id_fk" FOREIGN KEY ("sede_id") REFERENCES "public"."sedes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cursos_locales" ADD CONSTRAINT "cursos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cursos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "talleres" ADD CONSTRAINT "talleres_sede_id_sedes_id_fk" FOREIGN KEY ("sede_id") REFERENCES "public"."sedes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "talleres_locales" ADD CONSTRAINT "talleres_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."talleres"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "giras_educativas" ADD CONSTRAINT "giras_educativas_escuela_id_centros_educativos_id_fk" FOREIGN KEY ("escuela_id") REFERENCES "public"."centros_educativos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "giras_educativas" ADD CONSTRAINT "giras_educativas_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "giras_educativas_locales" ADD CONSTRAINT "giras_educativas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."giras_educativas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_comunidad_id_comunidades_id_fk" FOREIGN KEY ("comunidad_id") REFERENCES "public"."comunidades"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "donaciones_locales" ADD CONSTRAINT "donaciones_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."donaciones"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "becarios_tipo_apoyo_order_idx" ON "becarios_tipo_apoyo" USING btree ("order");
  CREATE INDEX "becarios_tipo_apoyo_parent_idx" ON "becarios_tipo_apoyo" USING btree ("parent_id");
  CREATE INDEX "cursos_sede_idx" ON "cursos" USING btree ("sede_id");
  CREATE INDEX "cursos_updated_at_idx" ON "cursos" USING btree ("updated_at");
  CREATE INDEX "cursos_created_at_idx" ON "cursos" USING btree ("created_at");
  CREATE UNIQUE INDEX "cursos_locales_locale_parent_id_unique" ON "cursos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "talleres_sede_idx" ON "talleres" USING btree ("sede_id");
  CREATE INDEX "talleres_updated_at_idx" ON "talleres" USING btree ("updated_at");
  CREATE INDEX "talleres_created_at_idx" ON "talleres" USING btree ("created_at");
  CREATE UNIQUE INDEX "talleres_locales_locale_parent_id_unique" ON "talleres_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "giras_educativas_escuela_idx" ON "giras_educativas" USING btree ("escuela_id");
  CREATE INDEX "giras_educativas_nivel_idx" ON "giras_educativas" USING btree ("nivel_id");
  CREATE INDEX "giras_educativas_updated_at_idx" ON "giras_educativas" USING btree ("updated_at");
  CREATE INDEX "giras_educativas_created_at_idx" ON "giras_educativas" USING btree ("created_at");
  CREATE UNIQUE INDEX "giras_educativas_locales_locale_parent_id_unique" ON "giras_educativas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "donaciones_comunidad_idx" ON "donaciones" USING btree ("comunidad_id");
  CREATE INDEX "donaciones_updated_at_idx" ON "donaciones" USING btree ("updated_at");
  CREATE INDEX "donaciones_created_at_idx" ON "donaciones" USING btree ("created_at");
  CREATE UNIQUE INDEX "donaciones_locales_locale_parent_id_unique" ON "donaciones_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cursos_fk" FOREIGN KEY ("cursos_id") REFERENCES "public"."cursos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_talleres_fk" FOREIGN KEY ("talleres_id") REFERENCES "public"."talleres"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_giras_educativas_fk" FOREIGN KEY ("giras_educativas_id") REFERENCES "public"."giras_educativas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_donaciones_fk" FOREIGN KEY ("donaciones_id") REFERENCES "public"."donaciones"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_cursos_id_idx" ON "payload_locked_documents_rels" USING btree ("cursos_id");
  CREATE INDEX "payload_locked_documents_rels_talleres_id_idx" ON "payload_locked_documents_rels" USING btree ("talleres_id");
  CREATE INDEX "payload_locked_documents_rels_giras_educativas_id_idx" ON "payload_locked_documents_rels" USING btree ("giras_educativas_id");
  CREATE INDEX "payload_locked_documents_rels_donaciones_id_idx" ON "payload_locked_documents_rels" USING btree ("donaciones_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "becarios_tipo_apoyo" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cursos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cursos_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "talleres" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "talleres_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "giras_educativas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "giras_educativas_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "donaciones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "donaciones_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "becarios_tipo_apoyo" CASCADE;
  DROP TABLE "cursos" CASCADE;
  DROP TABLE "cursos_locales" CASCADE;
  DROP TABLE "talleres" CASCADE;
  DROP TABLE "talleres_locales" CASCADE;
  DROP TABLE "giras_educativas" CASCADE;
  DROP TABLE "giras_educativas_locales" CASCADE;
  DROP TABLE "donaciones" CASCADE;
  DROP TABLE "donaciones_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_cursos_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_talleres_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_giras_educativas_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_donaciones_fk";

  DROP INDEX IF EXISTS "payload_locked_documents_rels_cursos_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_talleres_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_giras_educativas_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_donaciones_id_idx";
  ALTER TABLE "becarios" DROP COLUMN "nivel_educativo";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cursos_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "talleres_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "giras_educativas_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "donaciones_id";
  DROP TYPE "public"."enum_becarios_tipo_apoyo";
  DROP TYPE "public"."enum_becarios_nivel_educativo";
  DROP TYPE "public"."enum_cursos_tipo";
  DROP TYPE "public"."enum_talleres_tipo";
  DROP TYPE "public"."enum_donaciones_tipo_institucion";`)
}
