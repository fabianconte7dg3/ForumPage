import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  { ignores: ['.next/**', 'src/payload-types.ts', 'src/migrations/**', 'public/**'] },
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
