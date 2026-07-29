import * as migration_20260729_052636_initial from './20260729_052636_initial';
import * as migration_20260729_201249_agregar_becarios from './20260729_201249_agregar_becarios';
import * as migration_20260729_202456_agregar_registros_academicos from './20260729_202456_agregar_registros_academicos';

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
    name: '20260729_202456_agregar_registros_academicos'
  },
];
