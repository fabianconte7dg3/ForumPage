import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "dosfa_habilitado" boolean DEFAULT false;
  ALTER TABLE "users" ADD COLUMN "dosfa_secreto" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "dosfa_habilitado";
  ALTER TABLE "users" DROP COLUMN "dosfa_secreto";`)
}
