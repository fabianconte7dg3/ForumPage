# AGENTS.md — Reglas y Directivas del Agente en Forum Foundation

Este archivo define las directivas de comportamiento y el mapeo de habilidades para agentes en la plataforma **Forum Foundation**.

---

## 📌 Principios de Desarrollo

1. **Regla Rector**: Todo cambio en el panel admin o en las interfaces debe evaluarse contra la premisa: *"¿Esto permite publicar una actividad en menos de 3 minutos desde un teléfono?"*
2. **Filosofía Ponytail (El código más limpio es el que no se escribe)**:
   - 1. ¿Necesita existir? Omítelo si es YAGNI.
   - 2. ¿Ya existe en el repo? Reutiliza patrones, helpers (`materiasPendientes`, `registrarAuditoria`, `idDeRelacion`) y componentes.
   - 3. ¿La plataforma lo resuelve? Usa funciones nativas antes de agregar bibliotecas.
   - 4. ¿Mínimo posible? Realiza cambios quirúrgicos por parches.

---

## 🔄 Ciclo Obligatorio de Trabajo por Paso

1. **Ejecutar y Verificar**: Implementar y probar la funcionalidad en runtime (`tsc --noEmit`, build o HTTP).
2. **Actualizar `docs/plan.md`**: Explicar el Paso, cómo se probó y qué queda pendiente.
3. **Marcar `02-plan-de-ejecucion.md`**: Actualizar los checkboxes (`[x]`) con referencia al Paso.
4. **Sincronizar Bóveda `obsidian/`**: Crear/actualizar las notas de la bóveda de Obsidian y vincular en el MOC.
5. **Commit Atómico**: Realizar el commit unificando el código con su documentación sincronizada.

---

## ⛔ No-Negociables

   - Cero contenido o taxonomías hardcodeadas (siempre colecciones Payload CMS 3).
   - Presupuesto de 500 KB en primera carga pública (`pnpm check:budget`).
   - Localización a nivel de campo desde el esquema (`locales: ['es', 'en']`).
   - Privacidad absoluta del estado `suspendido` de becarios y notas de evaluación internas.
   - Control de acceso explícito en cada colección (probar siempre contra `/api/`).
   - **Verificación Estricta Pre-Push**: NUNCA hacer un commit o push a la rama principal sin haber ejecutado exitosamente `pnpm typecheck` y `pnpm lint` para asegurar que no se rompa la integración continua (CI).
   - **Confirmación Obligatoria de Obsidian y Git**: Al final de cada respuesta que involucre cambios de código o arquitectura, se DEBE incluir de forma explícita la confirmación de que las notas de la bóveda `obsidian/` fueron actualizadas y sincronizadas junto con el commit de Git (incluyendo su hash).

---

## 🚨 Errores ya cometidos en este repo — no repetirlos

Cada regla salió de un defecto real que llegó a `main` y hubo que corregir después. No son buenas prácticas genéricas: son las nueve formas concretas en que este proyecto ya se rompió.

1. **Cambiar un campo obliga a cambiar todo lo que lo escribe y lo lee.** Antes de tocar un `relationTo`, un `type` o el nombre de un campo: `grep -rn "<nombre_del_campo>" src/ scripts/`. Las server actions y los scripts de seed también escriben ese campo y el compilador no los revisa. *(`reportar-horas.ts` siguió subiendo evidencia a `media` mucho después de que `HorasLaborSocial.evidencia` apuntara a `documentos-privados`: el id iba contra una FK de otra tabla y el reporte de horas reventaba.)*

2. **Si el patrón aparece N veces, se arregla N veces.** Antes de dar por cerrado un cambio de forma, buscar todas sus ocurrencias — `grep -rn "relationTo: 'media'"`. *(Se movieron 3 de 4 campos a la colección privada. El que quedó afuera, `Recuperaciones.evidencia`, era el más delicado de los cuatro.)*

3. **Nunca callar al compilador con un cast.** `(x as Media).url` no arregla nada: hace que `tsc` pase mientras el tipo real es otro. Si `tsc` se queja después de cambiar un esquema, el cambio está incompleto — arreglar el origen, no el síntoma.

4. **Colección de uploads nueva ⇒ su carpeta al `.gitignore` en el mismo commit,** antes del primer `git add`. *(44 documentos privados quedaron versionados por el propio commit que se llamaba "feat(security)".)*

5. **Un script que borra o mueve datos se prueba con datos que tiene que tocar.** Correrlo y leer "0 afectados, sin errores" no es verificación: puede ser un no-op por construcción. Armar el caso que *debe* ser afectado y confirmar que lo fue. *(El script de purga se declaraba a sí mismo que todo seguía referenciado y borraba 0 siempre.)*

6. **Una migración generada es una migración sin probar.** Payload escribe el `up()` y un `down()` que suele venir roto (`DROP TABLE … CASCADE` y después un `DROP CONSTRAINT` de algo que el CASCADE ya se llevó). Contra un Postgres vacío descartable, correr la cadena entera **arriba y abajo** antes de commitear. *(8 migraciones tenían el `down()` roto; el rollback moría en la 15 de 17.)*

7. **Si la migración copia datos, probarla con una fila real.** Contra una base vacía toda copia de datos es no-op y pasa siempre.

8. **Verificar contra `/api/` con un GET sin sesión, nunca contra la interfaz.** Que el panel no muestre algo no significa que la API no lo entregue.

9. **`push: false` en el adaptador de Postgres no se saca.** Cambiar el esquema exige `pnpm payload migrate:create <nombre>` + `pnpm payload migrate`. Con auto-push la base de dev diverge en silencio y ninguna migración se ejercita nunca — así fue como el `down()` roto pasó meses invisible.

---

## 🎨 Sistema Visual

- Paleta: `montana` (#2c3e35), `cosecha` (#d97706), `rio` (#0284c7), `tinta` (#1c1917), `piedra` (#78716c), `niebla` (#f5f5f4).
- Tipografía: Titulares (*Archivo Expanded*), Cuerpo (*Source Serif 4*), Datos/Métricas (*IBM Plex Mono*).
- Geometría: `4px` en botones/tarjetas, `2px` badges, `0px` imágenes. **Cero sombras**.

---

## 🛠️ Skills Recomendadas por Dominio

- **Frontend & UI**: `frontend-design`, `web-design-guidelines`
- **Backend & Schemas**: `backend-development`, `senior-backend`
- **Documentación & Grafos**: `obsidian-markdown`
- **Minimalismo & Eficiencia**: Mentalidad `ponytail`
