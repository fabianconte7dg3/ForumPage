import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  // `.claude/**` incluye worktrees de agentes anidados en el repo: copias
  // viejas del código que hacían fallar el lint con errores ya corregidos acá.
  { ignores: ['.next/**', 'src/payload-types.ts', 'src/migrations/**', 'public/**', '.claude/**'] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Scripts de un solo uso: arman `data` genéricamente desde CSV/fixtures
    // contra la API de Payload — `any` es deliberado ahí, no en el resto de la app.
    files: ['scripts/**/*.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
];

export default config;
