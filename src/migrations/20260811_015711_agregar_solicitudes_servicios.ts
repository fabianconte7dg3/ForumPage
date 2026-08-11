import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_solicitudes_servicios_canal" AS ENUM('whatsapp', 'carta');
  CREATE TYPE "public"."enum_solicitudes_servicios_tipo_servicio" AS ENUM('impresion_copia', 'materiales_compras', 'ambos');
  CREATE TYPE "public"."enum_solicitudes_servicios_estado" AS ENUM('recibida', 'en_preparacion', 'lista_para_retirar', 'entregada', 'cancelada');
  CREATE TABLE "solicitudes_servicios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"solicitante" varchar NOT NULL,
  	"comunidad_id" integer,
  	"canal" "enum_solicitudes_servicios_canal" DEFAULT 'whatsapp' NOT NULL,
  	"tipo_servicio" "enum_solicitudes_servicios_tipo_servicio" DEFAULT 'impresion_copia' NOT NULL,
  	"descripcion" varchar NOT NULL,
  	"cantidad_hojas" numeric,
  	"documento_solicitud_id" integer,
  	"lugar_retiro" varchar DEFAULT 'Auditorio' NOT NULL,
  	"estado" "enum_solicitudes_servicios_estado" DEFAULT 'recibida' NOT NULL,
  	"fecha_solicitud" timestamp(3) with time zone NOT NULL,
  	"fecha_entrega" timestamp(3) with time zone,
  	"recibido_por" varchar,
  	"comprobante_entrega_id" integer,
  	"observaciones" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "solicitudes_servicios_id" integer;
  ALTER TABLE "solicitudes_servicios" ADD CONSTRAINT "solicitudes_servicios_comunidad_id_comunidades_id_fk" FOREIGN KEY ("comunidad_id") REFERENCES "public"."comunidades"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solicitudes_servicios" ADD CONSTRAINT "solicitudes_servicios_documento_solicitud_id_media_id_fk" FOREIGN KEY ("documento_solicitud_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solicitudes_servicios" ADD CONSTRAINT "solicitudes_servicios_comprobante_entrega_id_media_id_fk" FOREIGN KEY ("comprobante_entrega_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "solicitudes_servicios_comunidad_idx" ON "solicitudes_servicios" USING btree ("comunidad_id");
  CREATE INDEX "solicitudes_servicios_documento_solicitud_idx" ON "solicitudes_servicios" USING btree ("documento_solicitud_id");
  CREATE INDEX "solicitudes_servicios_comprobante_entrega_idx" ON "solicitudes_servicios" USING btree ("comprobante_entrega_id");
  CREATE INDEX "solicitudes_servicios_updated_at_idx" ON "solicitudes_servicios" USING btree ("updated_at");
  CREATE INDEX "solicitudes_servicios_created_at_idx" ON "solicitudes_servicios" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_solicitudes_servicios_fk" FOREIGN KEY ("solicitudes_servicios_id") REFERENCES "public"."solicitudes_servicios"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_solicitudes_servicios_id_idx" ON "payload_locked_documents_rels" USING btree ("solicitudes_servicios_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE IF EXISTS "solicitudes_servicios" DISABLE ROW LEVEL SECURITY;
  DROP TABLE IF EXISTS "solicitudes_servicios" CASCADE;
  ALTER TABLE IF EXISTS "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_solicitudes_servicios_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_solicitudes_servicios_id_idx";
  ALTER TABLE IF EXISTS "payload_locked_documents_rels" DROP COLUMN IF EXISTS "solicitudes_servicios_id";
  DROP TYPE IF EXISTS "public"."enum_solicitudes_servicios_canal";
  DROP TYPE IF EXISTS "public"."enum_solicitudes_servicios_tipo_servicio";
  DROP TYPE IF EXISTS "public"."enum_solicitudes_servicios_estado";`)
}
