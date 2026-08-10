import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tutorias" ADD COLUMN "realizada" boolean DEFAULT false;
  ALTER TABLE "tutorias" ADD COLUMN "participantes" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tutorias" DROP COLUMN "realizada";
  ALTER TABLE "tutorias" DROP COLUMN "participantes";`)
}
