import * as migration_20260729_052636_initial from './20260729_052636_initial';
import * as migration_20260729_201249_agregar_becarios from './20260729_201249_agregar_becarios';
import * as migration_20260729_202456_agregar_registros_academicos from './20260729_202456_agregar_registros_academicos';
import * as migration_20260729_203156_agregar_recuperaciones from './20260729_203156_agregar_recuperaciones';
import * as migration_20260729_204239_agregar_horas_labor_social from './20260729_204239_agregar_horas_labor_social';
import * as migration_20260729_210041_agregar_desembolsos from './20260729_210041_agregar_desembolsos';
import * as migration_20260729_210606_agregar_campos_privacidad from './20260729_210606_agregar_campos_privacidad';
import * as migration_20260729_234324_agregar_activo_login from './20260729_234324_agregar_activo_login';
import * as migration_20260730_000008_agregar_dos_fa from './20260730_000008_agregar_dos_fa';
import * as migration_20260730_002624_agregar_invitacion from './20260730_002624_agregar_invitacion';
import * as migration_20260730_051309_agregar_fecha_reactivacion from './20260730_051309_agregar_fecha_reactivacion';
import * as migration_20260730_055512_agregar_necesidades from './20260730_055512_agregar_necesidades';
import * as migration_20260730_062005_agregar_prioridad_orden from './20260730_062005_agregar_prioridad_orden';
import * as migration_20260730_165012_agregar_nosotros_equipo from './20260730_165012_agregar_nosotros_equipo';
import * as migration_20260730_170617_agregar_fotos_nosotros from './20260730_170617_agregar_fotos_nosotros';

export const migrations = [
  {
    up: migration_20260729_052636_initial.up,
    down: migration_20260729_052636_initial.down,
    name: '20260729_052636_initial',
  },
  {
    up: migration_20260729_201249_agregar_becarios.up,
    down: migration_20260729_201249_agregar_becarios.down,
    name: '20260729_201249_agregar_becarios',
  },
  {
    up: migration_20260729_202456_agregar_registros_academicos.up,
    down: migration_20260729_202456_agregar_registros_academicos.down,
    name: '20260729_202456_agregar_registros_academicos',
  },
  {
    up: migration_20260729_203156_agregar_recuperaciones.up,
    down: migration_20260729_203156_agregar_recuperaciones.down,
    name: '20260729_203156_agregar_recuperaciones',
  },
  {
    up: migration_20260729_204239_agregar_horas_labor_social.up,
    down: migration_20260729_204239_agregar_horas_labor_social.down,
    name: '20260729_204239_agregar_horas_labor_social',
  },
  {
    up: migration_20260729_210041_agregar_desembolsos.up,
    down: migration_20260729_210041_agregar_desembolsos.down,
    name: '20260729_210041_agregar_desembolsos',
  },
  {
    up: migration_20260729_210606_agregar_campos_privacidad.up,
    down: migration_20260729_210606_agregar_campos_privacidad.down,
    name: '20260729_210606_agregar_campos_privacidad',
  },
  {
    up: migration_20260729_234324_agregar_activo_login.up,
    down: migration_20260729_234324_agregar_activo_login.down,
    name: '20260729_234324_agregar_activo_login',
  },
  {
    up: migration_20260730_000008_agregar_dos_fa.up,
    down: migration_20260730_000008_agregar_dos_fa.down,
    name: '20260730_000008_agregar_dos_fa',
  },
  {
    up: migration_20260730_002624_agregar_invitacion.up,
    down: migration_20260730_002624_agregar_invitacion.down,
    name: '20260730_002624_agregar_invitacion',
  },
  {
    up: migration_20260730_051309_agregar_fecha_reactivacion.up,
    down: migration_20260730_051309_agregar_fecha_reactivacion.down,
    name: '20260730_051309_agregar_fecha_reactivacion',
  },
  {
    up: migration_20260730_055512_agregar_necesidades.up,
    down: migration_20260730_055512_agregar_necesidades.down,
    name: '20260730_055512_agregar_necesidades',
  },
  {
    up: migration_20260730_062005_agregar_prioridad_orden.up,
    down: migration_20260730_062005_agregar_prioridad_orden.down,
    name: '20260730_062005_agregar_prioridad_orden',
  },
  {
    up: migration_20260730_165012_agregar_nosotros_equipo.up,
    down: migration_20260730_165012_agregar_nosotros_equipo.down,
    name: '20260730_165012_agregar_nosotros_equipo',
  },
  {
    up: migration_20260730_170617_agregar_fotos_nosotros.up,
    down: migration_20260730_170617_agregar_fotos_nosotros.down,
    name: '20260730_170617_agregar_fotos_nosotros'
  },
];
