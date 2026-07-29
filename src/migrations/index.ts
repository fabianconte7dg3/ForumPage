import * as migration_20260729_052636_initial from './20260729_052636_initial';

export const migrations = [
  {
    up: migration_20260729_052636_initial.up,
    down: migration_20260729_052636_initial.down,
    name: '20260729_052636_initial'
  },
];
