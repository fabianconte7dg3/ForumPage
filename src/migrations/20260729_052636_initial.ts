import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('es', 'en');
  CREATE TYPE "public"."enum_users_rol" AS ENUM('admin', 'staff', 'directiva', 'becario');
  CREATE TYPE "public"."enum_sedes_tipo" AS ENUM('sede_principal', 'biblioteca', 'centro');
  CREATE TYPE "public"."enum_proyectos_estado" AS ENUM('propuesto', 'aprobado', 'en_ejecucion', 'completado');
  CREATE TYPE "public"."enum_recursos_tipo" AS ENUM('pdf_propio', 'enlace_externo', 'video_youtube', 'practica');
  CREATE TYPE "public"."enum_recursos_idioma" AS ENUM('es', 'en');
  CREATE TYPE "public"."enum_practicas_modalidad" AS ENUM('descargable', 'quiz_autocorregido', 'quiz_con_progreso');
  CREATE TYPE "public"."enum_tutorias_recurrencia" AS ENUM('ninguna', 'semanal', 'quincenal', 'mensual');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"rol" "enum_users_rol" DEFAULT 'staff' NOT NULL,
  	"activo" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"consentimiento_verificado" boolean DEFAULT false,
  	"contiene_menores" boolean DEFAULT false,
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
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "auditoria" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"actor_id" integer NOT NULL,
  	"accion" varchar NOT NULL,
  	"coleccion" varchar NOT NULL,
  	"documento_id" varchar NOT NULL,
  	"valor_anterior" jsonb,
  	"valor_nuevo" jsonb,
  	"fecha" timestamp(3) with time zone NOT NULL,
  	"ip" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "comunidades" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"distrito" varchar NOT NULL,
  	"corregimiento" varchar,
  	"coordenadas_lat" numeric NOT NULL,
  	"coordenadas_lng" numeric NOT NULL,
  	"foto_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "comunidades_locales" (
  	"nombre" varchar NOT NULL,
  	"descripcion" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "sedes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tipo" "enum_sedes_tipo" NOT NULL,
  	"comunidad_id" integer NOT NULL,
  	"coordenadas_lat" numeric NOT NULL,
  	"coordenadas_lng" numeric NOT NULL,
  	"destacada" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sedes_locales" (
  	"nombre" varchar NOT NULL,
  	"horario" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "sedes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "centros_educativos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"comunidad_id" integer NOT NULL,
  	"coordenadas_lat" numeric NOT NULL,
  	"coordenadas_lng" numeric NOT NULL,
  	"matricula_aproximada" numeric,
  	"contacto" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "centros_educativos_locales" (
  	"nombre" varchar NOT NULL,
  	"niveles_atendidos" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "programas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"color" varchar NOT NULL,
  	"icono" varchar,
  	"activo" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "programas_locales" (
  	"nombre" varchar NOT NULL,
  	"descripcion" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "proyectos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"programa_id" integer,
  	"comunidad_id" integer NOT NULL,
  	"centro_educativo_id" integer,
  	"estado" "enum_proyectos_estado" DEFAULT 'propuesto' NOT NULL,
  	"fecha_inicio" timestamp(3) with time zone,
  	"fecha_fin" timestamp(3) with time zone,
  	"monto" numeric,
  	"avance" numeric DEFAULT 0,
  	"foto_antes_id" integer,
  	"foto_despues_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "proyectos_locales" (
  	"titulo" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "actividades" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"fecha_publicacion" timestamp(3) with time zone NOT NULL,
  	"portada_id" integer,
  	"comunidad_id" integer NOT NULL,
  	"programa_id" integer,
  	"proyecto_id" integer,
  	"destacada" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "actividades_locales" (
  	"titulo" varchar NOT NULL,
  	"extracto" varchar,
  	"contenido" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "actividades_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "niveles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "niveles_locales" (
  	"nombre" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "materias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "materias_locales" (
  	"nombre" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "recursos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tipo" "enum_recursos_tipo" NOT NULL,
  	"nivel_id" integer,
  	"materia_id" integer,
  	"idioma" "enum_recursos_idioma" DEFAULT 'es' NOT NULL,
  	"archivo_id" integer,
  	"url" varchar,
  	"fuente_y_licencia" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "recursos_locales" (
  	"titulo" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "practicas_preguntas_opciones" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "practicas_preguntas_opciones_locales" (
  	"texto" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "practicas_preguntas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"respuesta_correcta" numeric
  );
  
  CREATE TABLE "practicas_preguntas_locales" (
  	"enunciado" varchar,
  	"retroalimentacion" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "practicas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nivel_id" integer,
  	"materia_id" integer,
  	"modalidad" "enum_practicas_modalidad" NOT NULL,
  	"archivo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "practicas_locales" (
  	"titulo" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "tutorias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"materia_id" integer NOT NULL,
  	"nivel_id" integer,
  	"sede_id" integer NOT NULL,
  	"fecha_hora" timestamp(3) with time zone NOT NULL,
  	"cupo" numeric,
  	"responsable" varchar,
  	"recurrencia" "enum_tutorias_recurrencia" DEFAULT 'ninguna',
  	"notas" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"auditoria_id" integer,
  	"comunidades_id" integer,
  	"sedes_id" integer,
  	"centros_educativos_id" integer,
  	"programas_id" integer,
  	"proyectos_id" integer,
  	"actividades_id" integer,
  	"niveles_id" integer,
  	"materias_id" integer,
  	"recursos_id" integer,
  	"practicas_id" integer,
  	"tutorias_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "configuracion_calificaciones_reprobatorias" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"calificacion" varchar NOT NULL
  );
  
  CREATE TABLE "configuracion" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"meta_horas_labor_social" numeric DEFAULT 40 NOT NULL,
  	"contacto_institucional_email" varchar,
  	"contacto_institucional_telefono" varchar,
  	"fecha_actualizacion_impacto" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "configuracion_locales" (
  	"texto_aviso_suspension" varchar,
  	"contacto_institucional_direccion" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comunidades" ADD CONSTRAINT "comunidades_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comunidades_locales" ADD CONSTRAINT "comunidades_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."comunidades"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sedes" ADD CONSTRAINT "sedes_comunidad_id_comunidades_id_fk" FOREIGN KEY ("comunidad_id") REFERENCES "public"."comunidades"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sedes_locales" ADD CONSTRAINT "sedes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sedes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sedes_rels" ADD CONSTRAINT "sedes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sedes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sedes_rels" ADD CONSTRAINT "sedes_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "centros_educativos" ADD CONSTRAINT "centros_educativos_comunidad_id_comunidades_id_fk" FOREIGN KEY ("comunidad_id") REFERENCES "public"."comunidades"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "centros_educativos_locales" ADD CONSTRAINT "centros_educativos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."centros_educativos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programas_locales" ADD CONSTRAINT "programas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_programa_id_programas_id_fk" FOREIGN KEY ("programa_id") REFERENCES "public"."programas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_comunidad_id_comunidades_id_fk" FOREIGN KEY ("comunidad_id") REFERENCES "public"."comunidades"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_centro_educativo_id_centros_educativos_id_fk" FOREIGN KEY ("centro_educativo_id") REFERENCES "public"."centros_educativos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_foto_antes_id_media_id_fk" FOREIGN KEY ("foto_antes_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_foto_despues_id_media_id_fk" FOREIGN KEY ("foto_despues_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "proyectos_locales" ADD CONSTRAINT "proyectos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."proyectos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "actividades" ADD CONSTRAINT "actividades_portada_id_media_id_fk" FOREIGN KEY ("portada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "actividades" ADD CONSTRAINT "actividades_comunidad_id_comunidades_id_fk" FOREIGN KEY ("comunidad_id") REFERENCES "public"."comunidades"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "actividades" ADD CONSTRAINT "actividades_programa_id_programas_id_fk" FOREIGN KEY ("programa_id") REFERENCES "public"."programas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "actividades" ADD CONSTRAINT "actividades_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "actividades_locales" ADD CONSTRAINT "actividades_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."actividades"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "actividades_rels" ADD CONSTRAINT "actividades_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."actividades"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "actividades_rels" ADD CONSTRAINT "actividades_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "niveles_locales" ADD CONSTRAINT "niveles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."niveles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materias_locales" ADD CONSTRAINT "materias_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recursos" ADD CONSTRAINT "recursos_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recursos" ADD CONSTRAINT "recursos_materia_id_materias_id_fk" FOREIGN KEY ("materia_id") REFERENCES "public"."materias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recursos" ADD CONSTRAINT "recursos_archivo_id_media_id_fk" FOREIGN KEY ("archivo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recursos_locales" ADD CONSTRAINT "recursos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recursos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "practicas_preguntas_opciones" ADD CONSTRAINT "practicas_preguntas_opciones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."practicas_preguntas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "practicas_preguntas_opciones_locales" ADD CONSTRAINT "practicas_preguntas_opciones_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."practicas_preguntas_opciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "practicas_preguntas" ADD CONSTRAINT "practicas_preguntas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."practicas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "practicas_preguntas_locales" ADD CONSTRAINT "practicas_preguntas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."practicas_preguntas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "practicas" ADD CONSTRAINT "practicas_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "practicas" ADD CONSTRAINT "practicas_materia_id_materias_id_fk" FOREIGN KEY ("materia_id") REFERENCES "public"."materias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "practicas" ADD CONSTRAINT "practicas_archivo_id_media_id_fk" FOREIGN KEY ("archivo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "practicas_locales" ADD CONSTRAINT "practicas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."practicas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tutorias" ADD CONSTRAINT "tutorias_materia_id_materias_id_fk" FOREIGN KEY ("materia_id") REFERENCES "public"."materias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tutorias" ADD CONSTRAINT "tutorias_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tutorias" ADD CONSTRAINT "tutorias_sede_id_sedes_id_fk" FOREIGN KEY ("sede_id") REFERENCES "public"."sedes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_auditoria_fk" FOREIGN KEY ("auditoria_id") REFERENCES "public"."auditoria"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_comunidades_fk" FOREIGN KEY ("comunidades_id") REFERENCES "public"."comunidades"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sedes_fk" FOREIGN KEY ("sedes_id") REFERENCES "public"."sedes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_centros_educativos_fk" FOREIGN KEY ("centros_educativos_id") REFERENCES "public"."centros_educativos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_programas_fk" FOREIGN KEY ("programas_id") REFERENCES "public"."programas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_proyectos_fk" FOREIGN KEY ("proyectos_id") REFERENCES "public"."proyectos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_actividades_fk" FOREIGN KEY ("actividades_id") REFERENCES "public"."actividades"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_niveles_fk" FOREIGN KEY ("niveles_id") REFERENCES "public"."niveles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_materias_fk" FOREIGN KEY ("materias_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_recursos_fk" FOREIGN KEY ("recursos_id") REFERENCES "public"."recursos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_practicas_fk" FOREIGN KEY ("practicas_id") REFERENCES "public"."practicas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tutorias_fk" FOREIGN KEY ("tutorias_id") REFERENCES "public"."tutorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configuracion_calificaciones_reprobatorias" ADD CONSTRAINT "configuracion_calificaciones_reprobatorias_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configuracion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configuracion_locales" ADD CONSTRAINT "configuracion_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configuracion"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "auditoria_actor_idx" ON "auditoria" USING btree ("actor_id");
  CREATE INDEX "auditoria_updated_at_idx" ON "auditoria" USING btree ("updated_at");
  CREATE INDEX "auditoria_created_at_idx" ON "auditoria" USING btree ("created_at");
  CREATE UNIQUE INDEX "comunidades_slug_idx" ON "comunidades" USING btree ("slug");
  CREATE INDEX "comunidades_foto_idx" ON "comunidades" USING btree ("foto_id");
  CREATE INDEX "comunidades_updated_at_idx" ON "comunidades" USING btree ("updated_at");
  CREATE INDEX "comunidades_created_at_idx" ON "comunidades" USING btree ("created_at");
  CREATE UNIQUE INDEX "comunidades_locales_locale_parent_id_unique" ON "comunidades_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sedes_comunidad_idx" ON "sedes" USING btree ("comunidad_id");
  CREATE INDEX "sedes_updated_at_idx" ON "sedes" USING btree ("updated_at");
  CREATE INDEX "sedes_created_at_idx" ON "sedes" USING btree ("created_at");
  CREATE UNIQUE INDEX "sedes_locales_locale_parent_id_unique" ON "sedes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sedes_rels_order_idx" ON "sedes_rels" USING btree ("order");
  CREATE INDEX "sedes_rels_parent_idx" ON "sedes_rels" USING btree ("parent_id");
  CREATE INDEX "sedes_rels_path_idx" ON "sedes_rels" USING btree ("path");
  CREATE INDEX "sedes_rels_media_id_idx" ON "sedes_rels" USING btree ("media_id");
  CREATE INDEX "centros_educativos_comunidad_idx" ON "centros_educativos" USING btree ("comunidad_id");
  CREATE INDEX "centros_educativos_updated_at_idx" ON "centros_educativos" USING btree ("updated_at");
  CREATE INDEX "centros_educativos_created_at_idx" ON "centros_educativos" USING btree ("created_at");
  CREATE UNIQUE INDEX "centros_educativos_locales_locale_parent_id_unique" ON "centros_educativos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programas_updated_at_idx" ON "programas" USING btree ("updated_at");
  CREATE INDEX "programas_created_at_idx" ON "programas" USING btree ("created_at");
  CREATE UNIQUE INDEX "programas_locales_locale_parent_id_unique" ON "programas_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "proyectos_slug_idx" ON "proyectos" USING btree ("slug");
  CREATE INDEX "proyectos_programa_idx" ON "proyectos" USING btree ("programa_id");
  CREATE INDEX "proyectos_comunidad_idx" ON "proyectos" USING btree ("comunidad_id");
  CREATE INDEX "proyectos_centro_educativo_idx" ON "proyectos" USING btree ("centro_educativo_id");
  CREATE INDEX "proyectos_foto_antes_idx" ON "proyectos" USING btree ("foto_antes_id");
  CREATE INDEX "proyectos_foto_despues_idx" ON "proyectos" USING btree ("foto_despues_id");
  CREATE INDEX "proyectos_updated_at_idx" ON "proyectos" USING btree ("updated_at");
  CREATE INDEX "proyectos_created_at_idx" ON "proyectos" USING btree ("created_at");
  CREATE UNIQUE INDEX "proyectos_locales_locale_parent_id_unique" ON "proyectos_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "actividades_slug_idx" ON "actividades" USING btree ("slug");
  CREATE INDEX "actividades_portada_idx" ON "actividades" USING btree ("portada_id");
  CREATE INDEX "actividades_comunidad_idx" ON "actividades" USING btree ("comunidad_id");
  CREATE INDEX "actividades_programa_idx" ON "actividades" USING btree ("programa_id");
  CREATE INDEX "actividades_proyecto_idx" ON "actividades" USING btree ("proyecto_id");
  CREATE INDEX "actividades_updated_at_idx" ON "actividades" USING btree ("updated_at");
  CREATE INDEX "actividades_created_at_idx" ON "actividades" USING btree ("created_at");
  CREATE UNIQUE INDEX "actividades_locales_locale_parent_id_unique" ON "actividades_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "actividades_rels_order_idx" ON "actividades_rels" USING btree ("order");
  CREATE INDEX "actividades_rels_parent_idx" ON "actividades_rels" USING btree ("parent_id");
  CREATE INDEX "actividades_rels_path_idx" ON "actividades_rels" USING btree ("path");
  CREATE INDEX "actividades_rels_media_id_idx" ON "actividades_rels" USING btree ("media_id");
  CREATE INDEX "niveles_updated_at_idx" ON "niveles" USING btree ("updated_at");
  CREATE INDEX "niveles_created_at_idx" ON "niveles" USING btree ("created_at");
  CREATE UNIQUE INDEX "niveles_locales_locale_parent_id_unique" ON "niveles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "materias_updated_at_idx" ON "materias" USING btree ("updated_at");
  CREATE INDEX "materias_created_at_idx" ON "materias" USING btree ("created_at");
  CREATE UNIQUE INDEX "materias_locales_locale_parent_id_unique" ON "materias_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "recursos_nivel_idx" ON "recursos" USING btree ("nivel_id");
  CREATE INDEX "recursos_materia_idx" ON "recursos" USING btree ("materia_id");
  CREATE INDEX "recursos_archivo_idx" ON "recursos" USING btree ("archivo_id");
  CREATE INDEX "recursos_updated_at_idx" ON "recursos" USING btree ("updated_at");
  CREATE INDEX "recursos_created_at_idx" ON "recursos" USING btree ("created_at");
  CREATE UNIQUE INDEX "recursos_locales_locale_parent_id_unique" ON "recursos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "practicas_preguntas_opciones_order_idx" ON "practicas_preguntas_opciones" USING btree ("_order");
  CREATE INDEX "practicas_preguntas_opciones_parent_id_idx" ON "practicas_preguntas_opciones" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "practicas_preguntas_opciones_locales_locale_parent_id_unique" ON "practicas_preguntas_opciones_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "practicas_preguntas_order_idx" ON "practicas_preguntas" USING btree ("_order");
  CREATE INDEX "practicas_preguntas_parent_id_idx" ON "practicas_preguntas" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "practicas_preguntas_locales_locale_parent_id_unique" ON "practicas_preguntas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "practicas_nivel_idx" ON "practicas" USING btree ("nivel_id");
  CREATE INDEX "practicas_materia_idx" ON "practicas" USING btree ("materia_id");
  CREATE INDEX "practicas_archivo_idx" ON "practicas" USING btree ("archivo_id");
  CREATE INDEX "practicas_updated_at_idx" ON "practicas" USING btree ("updated_at");
  CREATE INDEX "practicas_created_at_idx" ON "practicas" USING btree ("created_at");
  CREATE UNIQUE INDEX "practicas_locales_locale_parent_id_unique" ON "practicas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tutorias_materia_idx" ON "tutorias" USING btree ("materia_id");
  CREATE INDEX "tutorias_nivel_idx" ON "tutorias" USING btree ("nivel_id");
  CREATE INDEX "tutorias_sede_idx" ON "tutorias" USING btree ("sede_id");
  CREATE INDEX "tutorias_updated_at_idx" ON "tutorias" USING btree ("updated_at");
  CREATE INDEX "tutorias_created_at_idx" ON "tutorias" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_auditoria_id_idx" ON "payload_locked_documents_rels" USING btree ("auditoria_id");
  CREATE INDEX "payload_locked_documents_rels_comunidades_id_idx" ON "payload_locked_documents_rels" USING btree ("comunidades_id");
  CREATE INDEX "payload_locked_documents_rels_sedes_id_idx" ON "payload_locked_documents_rels" USING btree ("sedes_id");
  CREATE INDEX "payload_locked_documents_rels_centros_educativos_id_idx" ON "payload_locked_documents_rels" USING btree ("centros_educativos_id");
  CREATE INDEX "payload_locked_documents_rels_programas_id_idx" ON "payload_locked_documents_rels" USING btree ("programas_id");
  CREATE INDEX "payload_locked_documents_rels_proyectos_id_idx" ON "payload_locked_documents_rels" USING btree ("proyectos_id");
  CREATE INDEX "payload_locked_documents_rels_actividades_id_idx" ON "payload_locked_documents_rels" USING btree ("actividades_id");
  CREATE INDEX "payload_locked_documents_rels_niveles_id_idx" ON "payload_locked_documents_rels" USING btree ("niveles_id");
  CREATE INDEX "payload_locked_documents_rels_materias_id_idx" ON "payload_locked_documents_rels" USING btree ("materias_id");
  CREATE INDEX "payload_locked_documents_rels_recursos_id_idx" ON "payload_locked_documents_rels" USING btree ("recursos_id");
  CREATE INDEX "payload_locked_documents_rels_practicas_id_idx" ON "payload_locked_documents_rels" USING btree ("practicas_id");
  CREATE INDEX "payload_locked_documents_rels_tutorias_id_idx" ON "payload_locked_documents_rels" USING btree ("tutorias_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "configuracion_calificaciones_reprobatorias_order_idx" ON "configuracion_calificaciones_reprobatorias" USING btree ("_order");
  CREATE INDEX "configuracion_calificaciones_reprobatorias_parent_id_idx" ON "configuracion_calificaciones_reprobatorias" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "configuracion_locales_locale_parent_id_unique" ON "configuracion_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "auditoria" CASCADE;
  DROP TABLE "comunidades" CASCADE;
  DROP TABLE "comunidades_locales" CASCADE;
  DROP TABLE "sedes" CASCADE;
  DROP TABLE "sedes_locales" CASCADE;
  DROP TABLE "sedes_rels" CASCADE;
  DROP TABLE "centros_educativos" CASCADE;
  DROP TABLE "centros_educativos_locales" CASCADE;
  DROP TABLE "programas" CASCADE;
  DROP TABLE "programas_locales" CASCADE;
  DROP TABLE "proyectos" CASCADE;
  DROP TABLE "proyectos_locales" CASCADE;
  DROP TABLE "actividades" CASCADE;
  DROP TABLE "actividades_locales" CASCADE;
  DROP TABLE "actividades_rels" CASCADE;
  DROP TABLE "niveles" CASCADE;
  DROP TABLE "niveles_locales" CASCADE;
  DROP TABLE "materias" CASCADE;
  DROP TABLE "materias_locales" CASCADE;
  DROP TABLE "recursos" CASCADE;
  DROP TABLE "recursos_locales" CASCADE;
  DROP TABLE "practicas_preguntas_opciones" CASCADE;
  DROP TABLE "practicas_preguntas_opciones_locales" CASCADE;
  DROP TABLE "practicas_preguntas" CASCADE;
  DROP TABLE "practicas_preguntas_locales" CASCADE;
  DROP TABLE "practicas" CASCADE;
  DROP TABLE "practicas_locales" CASCADE;
  DROP TABLE "tutorias" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "configuracion_calificaciones_reprobatorias" CASCADE;
  DROP TABLE "configuracion" CASCADE;
  DROP TABLE "configuracion_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_rol";
  DROP TYPE "public"."enum_sedes_tipo";
  DROP TYPE "public"."enum_proyectos_estado";
  DROP TYPE "public"."enum_recursos_tipo";
  DROP TYPE "public"."enum_recursos_idioma";
  DROP TYPE "public"."enum_practicas_modalidad";
  DROP TYPE "public"."enum_tutorias_recurrencia";`)
}
