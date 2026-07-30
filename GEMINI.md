# Forum Foundation — Directivas de Agente Antigravity / Gemini

Reemplazo del WordPress legacy de Forum Foundation (ONG educativa en Coclé norte, Panamá). No capta donaciones — la financia su fundador. Tres funciones centrales: contar la historia comunitaria, rendir cuentas a los fundadores/directiva en EE.UU. y entregar recursos educativos a las comunidades rurales.

---

## 📌 Documentos de Referencia Obligatorios

Antes de ejecutar cualquier tarea en este repositorio, inspecciona:
- [docs/spec.md](docs/spec.md) — Arquitectura, stack, modelo de datos, IAM, ciberseguridad, diseño.
- [docs/plan.md](docs/plan.md) — Estado vivo del progreso por fases (Fases 0, 1, 2 y 3 completadas).
- [obsidian/00 - MOC/🗺️ Home - Forum Foundation.md](obsidian/00%20-%20MOC/🗺️%20Home%20-%20Forum%20Foundation.md) — Bóveda de conocimiento interconectada.

---

## ⚡ Regla Rector de todo el Proyecto

El sitio anterior murió porque publicar era difícil para el staff, no por falta de tecnología.  
**Toda decisión técnica o de interfaz se evalúa contra:**  
> *"¿Esto hace que publicar una actividad tome menos de 3 minutos desde un teléfono móvil por el staff?"*  
Si una función complica el panel del staff, se recorta o se pliega en "avanzado".

---

## 👴 Filosofía "Ponytail" (Senior Pragmático / Pereza Inteligente)

Adoptamos la mentalidad de **Ponytail** (*"El mejor código es el que nunca se escribió"*):

```
1. ¿Esto realmente necesita existir?   → No: omítelo (YAGNI).
2. ¿Ya existe en este codebase?        → Reutilízalo (ej. idDeRelacion, materiasPendientes, registrarAuditoria).
3. ¿La plataforma / stdlib lo incluye? → Úsalo (ej. <input type="date">, crypto stdlib).
4. ¿Dependencia ya instalada?          → Reutilízala antes de meter un paquete nuevo.
5. ¿Se resuelve en 1 línea?            → Escribe 1 línea.
6. Solo entonces: escribe el mínimo código limpio que funcione.
```

> [!note] Perezoso para codificar de más, riguroso para leer y proteger
> Jamás recortar seguridad, validación de datos, privacidad de becarios o accesibilidad por pereza. Lee todo el contexto antes de actuar, pero escribe la menor cantidad de líneas posible.

---

## 🔄 Ciclo Obligatorio de Trabajo por Paso

Para garantizar continuidad total y evitar pérdida de contexto:
1. **Ejecutar y Verificar**: Implementar la funcionalidad y comprobarla en runtime (`tsc --noEmit`, build o verificación HTTP/browser).
2. **Actualizar `docs/plan.md`**: Explicar qué se hizo en el Paso, cómo se probó y qué queda pendiente.
3. **Marcar `02-plan-de-ejecucion.md`**: Marcar el checkbox correspondiente (`[x]`) agregando la referencia al Paso.
4. **Sincronizar Bóveda `obsidian/`**: Crear/actualizar las notas de la bóveda de Obsidian y vincularlas en el MOC.
5. **Commit Atómico**: Realizar el commit unificando el código con su documentación sincronizada.

---

## ⛔ No-Negociables Técnicos & de Proceso

1. **Nada hardcodeado**: Comunidades, sedes, programas, materias, becarios, necesidades: siempre colecciones editables por el staff en Payload CMS, nunca fijas en código.
2. **Presupuesto de 500 KB**: En la primera carga del sitio público. Falla el build en CI (`pnpm check:budget`) si se excede (actualmente en ~162 KB).
3. **Localización a nivel de campo (i18n)**: Payload `localization` configurada desde `payload.config.ts` (`es`/`en`).
4. **Privacidad de Becarios**: El estado `suspendido` de un becario NUNCA se expone al público ni de forma agregada (`soloPropioOStaffField`). Es reversible, no una baja. `nota_interna_evaluacion` y `documentacion_socioeconomica` son de lectura restringida a Staff/Admin.
5. **Control de Acceso Explícito**: Declarado en cada colección de Payload. La API expone únicamente lo que `access` permita; se prueba contra `/api/`, no contra la interfaz. La directiva tiene solo lectura (HTTP 200 en lectura, HTTP 403 en escritura en las 20 colecciones + 1 global).
6. **Buckets Separados**: Medios públicos (CDN), documentos de becarios privados (URLs firmadas con expiración), respaldos de BD (sin permiso de borrado WORM).
7. **Documentación Viva**: Mantener `docs/plan.md`, `docs/spec.md` y la bóveda `obsidian/` actualizados en el mismo commit que modifica la funcionalidad.
8. **Edición con Parches Selectivos**: Reemplazar únicamente las líneas afectadas en lugar de regenerar archivos enteros para optimizar consumo de tokens.
9. **Tareas Atómicas (1 a 10 archivos)**: Dividir desarrollos grandes en pasos verificables (`schema + migración` → `backend/hook` → `frontend UI` → `verificación HTTP`).

---

## 🎨 Reglas de Diseño Visual (`user_global`)

- **Estética Documental**: Registro/archivo, no folleto de ventas. Cero paletas genéricas de IA.
- **Paleta Canónica**: `montana` (`#2c3e35`), `cosecha` (`#d97706`), `rio` (`#0284c7`), `tinta` (`#1c1917`), `piedra` (`#78716c`), `niebla` (`#f5f5f4`).
- **Tipografía Semántica**:
  - Titulares: *Archivo Expanded* (mayúsculas, ancha).
  - Cuerpo de texto: *Source Serif 4* (serifa editorial).
  - Datos Verificables: *IBM Plex Mono* (exclusivo para fechas, coordenadas lat/lng, montos numéricos y métricas de impacto).
- **Geometría**: `border-radius: 4px` en botones/tarjetas, `2px` en badges, `0px` en imágenes. **Cero sombras** (`box-shadow`). Bordes hairline (`1px border-piedra/25`).

---

## 🛠️ Mapeo de Skills Disponibles

Al abordar tareas en este proyecto, activa las siguientes habilidades de acuerdo con el dominio:

- `frontend-design` / `web-design-guidelines`: Desarrollo del sitio público, componentes React, Tailwind CSS v4 y UI del panel de Payload.
- `backend-development` / `senior-backend`: Colecciones de Payload, hooks de ciclo de vida (`beforeChange`, `afterChange`, `beforeLogin`, `afterLogin`), funciones de `access` y migraciones PostgreSQL.
- `obsidian-markdown`: Mantenimiento y actualización de la bóveda de notas enlazadas por grafos en `obsidian/`.
- `security-auditor`: Verificación de control de acceso por campo, sanitización Lexical y protección de datos sensibles.
- `ponytail` (Mentalidad): Minimizar líneas de código nuevas, reutilizar patrones existentes y evitar sobre-construcción.

---

## 📊 Estado Actual

Fases 0, 1, 2 y 3 **100% Completadas**. El núcleo de backend, IAM, portal de becarios, necesidades y mapa de impacto están listos e interconectados.
