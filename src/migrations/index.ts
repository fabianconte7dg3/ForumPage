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
import * as migration_20260801_190433 from './20260801_190433';
import * as migration_20260801_193645_evidencia_recuperaciones_privada from './20260801_193645_evidencia_recuperaciones_privada';
import * as migration_20260804_165434_agregar_destinos_internacionales from './20260804_165434_agregar_destinos_internacionales';
import * as migration_20260804_171527_agregar_fotos_becarios from './20260804_171527_agregar_fotos_becarios';
import * as migration_20260806_043317_agregar_resumen_nosotros from './20260806_043317_agregar_resumen_nosotros';
import * as migration_20260806_060854_reemplazar_resumen_por_secciones from './20260806_060854_reemplazar_resumen_por_secciones';
import * as migration_20260810_010852_agregar_asistencia_tutorias from './20260810_010852_agregar_asistencia_tutorias';
import * as migration_20260810_013450_agregar_cursos_talleres_giras_donaciones from './20260810_013450_agregar_cursos_talleres_giras_donaciones';
import * as migration_20260811_015711_agregar_solicitudes_servicios from './20260811_015711_agregar_solicitudes_servicios';

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
    name: '20260730_170617_agregar_fotos_nosotros',
  },
  {
    up: migration_20260801_190433.up,
    down: migration_20260801_190433.down,
    name: '20260801_190433',
  },
  {
    up: migration_20260801_193645_evidencia_recuperaciones_privada.up,
    down: migration_20260801_193645_evidencia_recuperaciones_privada.down,
    name: '20260801_193645_evidencia_recuperaciones_privada',
  },
  {
    up: migration_20260804_165434_agregar_destinos_internacionales.up,
    down: migration_20260804_165434_agregar_destinos_internacionales.down,
    name: '20260804_165434_agregar_destinos_internacionales',
  },
  {
    up: migration_20260804_171527_agregar_fotos_becarios.up,
    down: migration_20260804_171527_agregar_fotos_becarios.down,
    name: '20260804_171527_agregar_fotos_becarios',
  },
  {
    up: migration_20260806_043317_agregar_resumen_nosotros.up,
    down: migration_20260806_043317_agregar_resumen_nosotros.down,
    name: '20260806_043317_agregar_resumen_nosotros',
  },
  {
    up: migration_20260806_060854_reemplazar_resumen_por_secciones.up,
    down: migration_20260806_060854_reemplazar_resumen_por_secciones.down,
    name: '20260806_060854_reemplazar_resumen_por_secciones',
  },
  {
    up: migration_20260810_010852_agregar_asistencia_tutorias.up,
    down: migration_20260810_010852_agregar_asistencia_tutorias.down,
    name: '20260810_010852_agregar_asistencia_tutorias',
  },
  {
    up: migration_20260810_013450_agregar_cursos_talleres_giras_donaciones.up,
    down: migration_20260810_013450_agregar_cursos_talleres_giras_donaciones.down,
    name: '20260810_013450_agregar_cursos_talleres_giras_donaciones',
  },
  {
    up: migration_20260811_015711_agregar_solicitudes_servicios.up,
    down: migration_20260811_015711_agregar_solicitudes_servicios.down,
    name: '20260811_015711_agregar_solicitudes_servicios'
  },
];
