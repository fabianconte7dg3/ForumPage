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
   - Mantenimiento sincrónico de `docs/plan.md`, `docs/spec.md` y la bóveda `obsidian/`.
   - Ediciones por parches selectivos (evitar regenerar archivos enteros).

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
