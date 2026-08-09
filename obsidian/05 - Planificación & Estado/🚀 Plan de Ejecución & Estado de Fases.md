---
title: "Plan de Ejecución & Estado de Fases"
tags:
  - plan
  - ejecucion
  - fases
  - estado
aliases:
  - Plan de Ejecución
  - Estado de Fases
  - Fases
date: 2026-07-30
status: activo
---

# 🚀 Plan de Ejecución & Estado de Fases — Forum Foundation

> [!flag] Estado General del Proyecto
> Seguimiento vivo del progreso de desarrollo. Fuente original: [docs/plan.md](file:///home/fabianc/Documentos/ForumPage/docs/plan.md).
> **Última actualización:** 2026-08-09 — Bug real reportado por el usuario probando en producción: la galería de fotos de una Publicación nunca se guardaba. Causa raíz encontrada (cierre obsoleto sobre `e.target.files` en el input de galería de `FormularioActividadModal.tsx`, vaciado por `e.target.value = ''` antes de que React leyera el archivo) y corregida, más `bodySizeLimit` de Server Actions subido de 1MB a 20MB como defensivo. Verificado contra una instancia temporal conectada a la base de producción real (nunca contra el sitio público), con 12 fotos reales de celular.
> **Última actualización anterior:** 2026-08-04 — Tres pendientes de deuda técnica cerrados a pedido del usuario ("arregla todo, dejalo listo"): destinos internacionales frecuentes ya no hardcodeados, visor de Auditoría en `/directiva/auditoria`, y `Becarios.foto` ya no queda pública para siempre tras revocar consentimiento.

---

## 📊 Progreso por Fases

```mermaid
gantt
    title Cronograma de Ejecución de Fases
    dateFormat  YYYY-MM-DD
    section Fase 0
    Preparación Documental y CSVs     :done, f0, 2026-01-01, 2026-02-01
    section Fase 1
    Base Pública & Mapa de Impacto    :done, f1, 2026-02-01, 2026-05-01
    section Fase 2
    Centro de Aprendizaje             :done, f2, 2026-05-01, 2026-06-15
    section Fase 3
    Portal del Becario, IAM & Cierre  :done, f3, 2026-06-15, 2026-07-30
    section Adicionales
    Página Institucional Nosotros     :done, f4, 2026-07-30, 2026-07-30
    Auditoría Antigravity & Seguridad Docs :active, f5, 2026-08-01, 2026-08-03
    Centro de Aprendizaje en /staff & Pulido UI :done, f6, 2026-08-03, 2026-08-03
    Cobertura /staff vs /admin — 5 gaps cerrados :done, f7, 2026-08-03, 2026-08-03
    Publicaciones/Actividades al panel de staff :done, f8, 2026-08-03, 2026-08-03
    Página Seguridad de mi cuenta (2FA)          :done, f9, 2026-08-04, 2026-08-04
    Cambio de password, sesiones & fix incidente 2FA :done, f10, 2026-08-04, 2026-08-04
    Deuda técnica: destinos, auditoría, foto privada :done, f11, 2026-08-04, 2026-08-04
```

---

## 📋 Resumen Detallado de Fases

### Fase 0 — Preparación (100% Completada)
- [x] Borrador bilingüe de formulario de consentimiento.
- [x] CSVs de plantillas para comunidades, sedes, programas y becarios.
- [x] Inventario de 70 artículos extraídos de WordPress y script de migración.

### Fase 1 — Base Pública (100% Completada)
- [x] Payload CMS 3 + PostgreSQL configurados con i18n (`es`/`en`).
- [x] Colecciones base (`Comunidades`, `Sedes`, `Proyectos`, `Actividades`).
- [x] Frontend localizado con Next.js 16 App Router.
- [x] [[🗺️ Mapa de Impacto & MapLibre|Mapa de Impacto]] en `/impacto` con MapLibre GL JS y fix de workers localizados.
- [x] Docker Compose (app, db, Caddy) + GitHub Actions CI (con presupuesto de 500 KB).

### Fase 2 — Centro de Aprendizaje (100% Completada)
- [x] [[📚 Centro de Aprendizaje & Quizzes|Biblioteca de Recursos]] con descarga física de PDFs.
- [x] Videos de YouTube diferidos con `youtube-nocookie`.
- [x] Quizzes interactivos calificados mediante Server Actions (`calificarPractica`).

### Fase 3 — Portal del Becario, Necesidades & Cierre (100% COMPLETADA — Pasos A al R)
- [x] [[🗄️ Modelo de Datos y Colecciones|Colecciones Creadas]]: `Becarios`, `RegistrosAcademicos`, `Recuperaciones`, `HorasLaborSocial`, `Desembolsos`, `Necesidades`.
- [x] [[🔄 Automatismos de Negocio|Automatismos Implementados]]: Suspensión por reprobación, retención/liberación de pagos, reactivación por recuperaciones.
- [x] [[🛡️ Ciberseguridad & No-Negociables|Campos Privados de Evaluación]]: `nota_interna_evaluacion` y `documentacion_socioeconomica` restringidos a Staff/Admin.
- [x] [[🔐 Matriz IAM y Permisos|Paso G — Bloqueo de Cuentas Inactivas]]: `beforeLogin` rechaza acceso si `activo = false`; `afterLogin` registra `ultimo_acceso`.
- [x] [[🔐 Matriz IAM y Permisos|Paso H — 2FA TOTP Opcional]]: Endpoints `/2fa/generar`, `/2fa/confirmar` y `/2fa/desactivar`. 2FA opcional para todos los roles.
- [x] [[🔐 Matriz IAM y Permisos|Paso I — Alta por Invitación]]: Hook `generarInvitacionAlCrear` invalida contraseña provisional y genera `enlace_invitacion`.
- [x] [[🔐 Matriz IAM y Permisos|Paso J — Reset de Contraseña Seguro]]: Cobertura 2FA en `/api/users/reset-password`, pantallas `/cuenta/recuperar` y `/cuenta/restablecer`.
- [x] [[🔐 Matriz IAM y Permisos|Paso K — Duración de Sesión por Rol]]: 2h staff/admin vs 30d becarios mediante `jwtSign` dinámico.
- [x] [[👨‍🎓 Portal del Becario & Sesiones|Paso L — Panel Principal de Becarios]]: Interfaz `/portal` con barra de progreso de horas de labor social y aviso de suspensión.
- [x] [[👨‍🎓 Portal del Becario & Sesiones|Paso M — Historial de Desembolsos]]: Lista cronológica en `/portal` con estados visualmente codificados por color.
- [x] [[👨‍🎓 Portal del Becario & Sesiones|Paso N — Experiencia de Suspensión & Reactivación]]: Cálculo en vivo con `materiasPendientes()`, timestamp `fecha_reactivacion` y banner de regreso.
- [x] [[📋 Pipeline de Necesidades & Directiva|Paso O — Colección Necesidades]]: Colección 20 de Payload con ordenamiento numérico `prioridad_orden` y privacidad de solicitante.
- [x] [[📋 Pipeline de Necesidades & Directiva|Paso P — Página Pública de Necesidades]]: Cola pública y formulario con filtro anti-spam honeypot en `/impacto/necesidades`.
- [x] [[📋 Pipeline de Necesidades & Directiva|Paso Q — Dashboard de Directiva]]: Cola priorizada agrupada por prioridad (`alta`, `media`, `baja`) en `/directiva/necesidades`.
- [x] [[🔄 Automatismos de Negocio|Paso R — Auditoría Activa & Vista de Directiva]]: Helper `registrarAuditoria` para 7 eventos de negocio y verificación HTTP 200/403 en las 21 colecciones + 2 globales. **¡FASE 3 CERRADA!**

### Adicionales Institucionales (100% Completados)
- [x] [[🏛️ Página Institucional Nosotros|Página /nosotros & Equipo]]: Integración de la vista `/nosotros` con el global `Nosotros` (misión e historia en RichText Lexical) y la colección `Equipo` (21ª colección, miembros del equipo y tarjeta destacada del fundador). Sembrado de datos reales vía `pnpm seed:nosotros`.
- [x] **Herramientas de Operación Integral del Staff en `/staff` (100% Sin pasar por `/admin`)**:
  - Pestaña `BECARIOS`: Modal `+ Registrar Becario` y `✏ Edit Profil` con selector de nivel académico y horas de labor social.
  - Pestaña `PUBLICACIONES`: Redacción de artículos y actividades comunitarias.
  - Pestaña `COMUNIDADES (MAPA)`: Modales `+ Nueva Comunidad` y `✏ Editar Comunidad` para administración de coordenadas GPS.
  - Pestaña `PROYECTOS`: Modal `+ Nuevo Proyecto` y `✏ Editar / Avance` con slider (0-100%) para actualización en vivo del porcentaje de avance en el Mapa de Impacto.
  - Pestaña `NOSOTROS / EQUIPO`: Modales `✏ Editar Misión e Historia` (global `/nosotros`) y `+ Agregar Miembro` / `✏ Editar Miembro` (colección `equipo` con tarjeta destacada para el fundador).
  - Pestaña `CENTRO DE APRENDIZAJE` (2026-08-03): CRUD completo de `Recursos`, `Tutorías` y `Prácticas` vía modales — ver sección dedicada más abajo.
  - Navegación pasó de barra horizontal a panel lateral en desktop (md+) al no entrar ya 6 pestañas en el ancho de pantalla; en mobile sigue horizontal con scroll.
  - Selector de autocompletado de **Destinos Internacionales Frecuentes** (*Bocconi, University of Florida, Navarra, Tec, Zamorano, EARTH*).
  - Tarjeta documental del becario internacional en el mapa con foto, cita inspiradora, insignias de trayectoria e i18n (`es`/`en`).
  - Integración de becarios originarios en la Ficha de la Comunidad (`/impacto/comunidades/[slug]`).

### Auditoría Externa & Remediación de Seguridad (2026-08-01/03 — Parcialmente Pendiente)
- [x] **Auditoría del trabajo de Antigravity** (21 commits directos a `main` — el usuario cambió de programador principal por límite de uso en Claude). Alcance: CRUD completo de staff para Comunidades/Proyectos/Equipo/Nosotros, 16 corregimientos de Penonomé cargados en `Comunidades`, mapa base real (CartoDB/OSM), mini-mapa en el Home, ficha de comunidad con becarios originarios, tarjeta "Becario Destacado" en `/impacto`.
  **Encontrado y corregido:** fuga real de consentimiento — dos páginas públicas (`/impacto/comunidades/[slug]` y `/impacto`) leían becarios con `overrideAccess: true` sin reponer el filtro `mostrar_en_mapa` que la colección aplicaría normalmente, exponiendo (con datos reales) a becarios que hubieran revocado su consentimiento.
  **Encontrado, no corregido:** los "Destinos Internacionales Frecuentes" (Bocconi, University of Florida, etc.) quedaron hardcodeados en dos formularios — viola "nada hardcodeado" en espíritu, no es urgencia de seguridad.
  **Meta-hallazgo:** `docs/plan.md` no se tocó en ninguno de los 21 commits — regla agregada a `.agents/AGENTS.md` para que no se repita.
- [ ] **Remediación de privacidad de documentos — código listo, migración SIN correr en producción.** `Becarios.documentacion_socioeconomica`, `RegistrosAcademicos.documento`, `HorasLaborSocial.evidencia` y `Recuperaciones.evidencia` vivían en `Media` (`read: () => true`, pública) — cualquiera con la URL podía descargar documentación socioeconómica o evidencia de labor social que puede contener menores. Nueva colección `DocumentosPrivados` (solo-staff en las cuatro operaciones — ni siquiera directiva lee, único caso así en todo el sistema, porque ninguna vista del becario ni de directiva renderiza estos archivos).
  Migración en dos mitades: la migración SQL copia las filas de `media` a `documentos_privados` preservando el id (mantiene las FK válidas sin remapear) y reescribe la `url`; `pnpm purgar:media-privada` mueve el archivo físico y borra el original público con `payload.delete`.
  **Postgres estuvo caído durante todo este trabajo — la migración nunca se ejecutó y el script de purga nunca corrió.** Pendiente antes de dar esto por cerrado: `pnpm payload migrate`, luego `pnpm purgar:media-privada` (dry-run, revisar salida) y `pnpm purgar:media-privada --purge`, y confirmar con un GET sin sesión contra `/api/documentos-privados` (no la interfaz) que responde 403/404.

### Centro de Aprendizaje en `/staff` & Pulido de UI Pública (2026-08-03 — Completo)
- [x] **Nueva pestaña Centro de Aprendizaje.** El staff no tenía forma de publicar `Recursos`/`Tutorías`/`Prácticas` sin pasar por `/admin` — justo lo que `/staff` existe para evitar. CRUD completo vía modales para las tres colecciones; `Prácticas` incluye armado de preguntas/opciones en el mismo panel (sin salir a `/admin`), con validación de mínimo 2 opciones completas por pregunta y un índice de respuesta correcta válido. `Recursos.archivo`/`Practicas.archivo` suben a `media` a propósito (material público de la Biblioteca, no expediente privado).
- [x] **Bug real encontrado probando con 20 preguntas reales (a pedido del usuario, no hipotético):** el modal centraba verticalmente con `items-center` — con contenido más alto que la ventana eso atasca el scroll del navegador (bug conocido de Chromium con flexbox centrado + overflow), el título quedaba fuera del viewport sin forma de volver arriba. Corregido a `items-start` en los tres modales nuevos.
- [x] **Las 3 modalidades de Práctica verificadas de punta a punta, no solo compiladas:** autocorregido (20 preguntas reales, `respuesta_correcta`/`retroalimentacion` confirmadas ausentes de `/api/practicas` sin sesión), con progreso (calificado + recarga confirmando "Completado antes: X/Y" desde `localStorage`), descargable (archivo real subido vía `DataTransfer`, descarga confirmada con `curl`). Datos de prueba borrados después en los tres casos.
- [x] **Filtros en `/aprende/practicas`** (modalidad/nivel/materia + paginación), reutilizando [[📚 Centro de Aprendizaje & Quizzes|`FiltrosBiblioteca`]] tal cual, sin duplicar el componente.
- [x] **"Ver" y "Descargar" separados para PDF propio en Biblioteca** — antes un solo botón forzaba descarga siempre; ahora "Ver" abre en pestaña nueva con el visor nativo del navegador y "Descargar" sigue forzando el guardado para uso sin conexión.
- [x] **Selector de idioma con banderas** 🇵🇦/🇺🇸 en vez de texto plano "EN"/"ES" — se veía pegado al logo en mobile, sin contenedor propio.
- [x] **Botón "Portal de equipo" removido de `/impacto`** — Antigravity lo había agregado enlazando a `/portal` (autenticado); un visitante anónimo solo chocaba con un login.
- [x] **Niveles/materias faltantes agregados vía script contra Payload** (Universidad; Química, Física, Biología, Historia, Geografía) — nunca hardcodeados en código.

### Cobertura `/staff` vs. `/admin` — 5 Gaps Cerrados (2026-08-03 — Completo)
> Auditoría a pedido del usuario: qué colecciones seguían exigiendo `/admin` para operarse a diario. Resultado y cierre, en orden de impacto operativo.

- [x] **Pipeline de Necesidades gestionable desde `/directiva/necesidades`.** Antes era 100% de solo lectura para todos los roles — sin un solo botón para cambiar `estado`/`prioridad`/`visible_publicamente` ni vincular un `proyecto_resultante`. Nueva Server Action (`actualizarNecesidad`) + componente `AccionesNecesidad`. Solo staff/admin gestionan (mismo criterio que `Necesidades.access.update = esStaffOSuperior`, sin tocar el `access` de la colección); directiva sigue viendo la cola, sin controles.
- [x] **Sedes y Centros Educativos administrables desde la pestaña Comunidades.** Comparten sección con Comunidades por tener el mismo shape (`comunidad` + `coordenadas`). **Recorte de alcance a propósito:** `Sedes.fotos` (upload `hasMany`) no se expuso en el formulario nuevo — campo opcional de poco uso, no justifica la complejidad de un uploader múltiple ahí (el patrón sí existe si hiciera falta, ver [[🚀 Plan de Ejecución & Estado de Fases#Publicaciones (Actividades) al Panel de Staff (2026-08-03 — Completo)|Publicaciones/Actividades]] más abajo).
- [x] **Programas administrable desde la pestaña Proyectos**, reutilizando el array `programas` que esa pestaña ya cargaba para el dropdown de Proyectos — sin fetch nuevo.
- [x] **Configuración General editable desde la pestaña Becarios** — meta de horas, calificaciones reprobatorias, aviso de suspensión, contacto institucional, fecha de cifras de impacto. `/staff` entero ya es staff/admin-only a nivel de página, no hizo falta gating adicional.
- [x] **Bug propio en el script de QA, no en el código de producción:** restaurar `texto_aviso_suspension` con `undefined` no lo vació (Payload trata `undefined` como "campo omitido" en updates parciales) — el valor de prueba quedó pisando el real hasta que la verificación visual lo detectó. Corregido con `null` explícito. La acción real usa el mismo patrón `?.trim() || undefined` que ya usan `crear-comunidad.ts`/`editar-comunidad.ts` — consistente con el resto del código, pero ese patrón no sirve si algún día hace falta poder vaciar el campo desde el formulario.
- [x] **Verificación de los 5, no solo compilado:** contra Postgres real vía scripts desechables con la API Local de Payload (creado/editado + becario de prueba rechazado con 403 en cada colección, mismo camino que la Server Action) y visualmente en el navegador logueado como staff descartable (nunca la contraseña real del usuario). `tsc --noEmit` limpio bajo `src/` (el proyecto tiene ~1500 errores preexistentes en `node_modules/@maplibre/maplibre-gl-style-spec`, ajenos a este cambio).
- [x] **Gaps dejados fuera a propósito, no son bugs:** Niveles/Materias siguen linkeando a `/admin` (taxonomías de un solo campo); alta de cuentas staff/directiva/admin sigue exigiendo `/admin` (Paso I, deliberado); no hay visor de `Auditoria` en `/staff` todavía.

### Publicaciones (Actividades) al Panel de Staff (2026-08-03 — Completo)
> El usuario probó el link-out a `/admin` que había quedado de la auditoría anterior y lo encontró poco intuitivo — único gap que se había dejado fuera a propósito por su complejidad (rich text + galería multi-archivo), ahora cerrado.

- [x] **Sin editor WYSIWYG completo, a propósito.** El campo `contenido` (Lexical richText) se edita con un `<textarea>` de texto plano donde una línea en blanco separa párrafos — sin negrita/enlaces/listas. Nuevo helper compartido `src/lib/richtext.ts`: `textoAParrafos` arma el JSON mínimo de Lexical, `parrafosATexto` hace el camino inverso para precargar el textarea al editar, preservando los saltos de párrafo (a diferencia del `extractTextFromRichText` que ya usaba `staff/page.tsx` para Nosotros, que junta todo con espacios — ahí no importa porque es texto corto, acá sí porque es de longitud de artículo).
- [x] **Portada y galería con el mismo patrón de subida que `crear-equipo.ts`**, extendido a múltiples archivos (`formData.getAll('files')`, loop de `payload.create({collection:'media'})`). Al editar, cada foto de la galería tiene su botón "✕" para sacarla antes de guardar; las nuevas se agregan aparte. Sin reordenamiento ni metadatos por foto — deliberadamente fuera de alcance.
- [x] **Verificado:** helper de richtext con test de ida y vuelta; creación con portada + 2 fotos de galería y edición que saca una foto, contra Postgres real vía script con la API Local; becario rechazado (403). En el navegador: edición de una publicación real del seed con todo precargado correctamente (contenido con párrafos intactos), remoción de una foto de galería confirmada (cancelado sin guardar, dato real); creación de punta a punta con subida de imagen real vía `DataTransfer`, publicación visible en `/es/historias` con slug autogenerado y párrafos separados. Datos de prueba borrados. `tsc --noEmit` limpio.
- [x] **Punto focal de portada — gap encontrado a partir de una pregunta del usuario, corregido el mismo día.** El sitio ya usaba `Media.focalX`/`focalY` (que Payload agrega solo a cualquier upload) para el hero y la galería de `/historias/[slug]`, con centro (50/50) por defecto. El formulario nuevo subía sin fijar ese punto y sin previsualización — capacidad que el subidor nativo de `/admin` sí traía integrada. **Peor aún, encontrado al revisar:** `ActividadCard.tsx` (la tarjeta de `/historias`, fuera de la publicación) **nunca leía el punto focal, ni antes de esta sesión** — bug preexistente que la pregunta hizo aflorar.
  **Corregido:** una línea en `ActividadCard.tsx` (mismo patrón que hero/galería); previsualización clic-para-fijar-foco en `FormularioActividadModal.tsx` a `aspect-4/3` (el recorte más ajustado), con marcador y "Restablecer centro"; `crear-actividad.ts`/`editar-actividad.ts` guardan el punto al subir, o actualizan el documento de media existente si solo cambió el foco sin resubir la foto.
  **Verificado con una imagen mitad roja/mitad azul** generada con `<canvas>` en el propio navegador (sin archivo externo): clic en la franja roja fijó `(36%, 15%)`; tras publicar, tanto la tarjeta como el hero mostraron ese mismo `object-position` en su `style` computado. De paso confirmó que el arreglo también corrige la vista de tarjeta para posts reales que ya tenían foco seteado desde `/admin` (ej. `46% 62%`) y que hasta ahora se ignoraba ahí.

### Página "Seguridad de mi Cuenta" — Activación de 2FA (2026-08-04 — Completo)
> El usuario preguntó cómo se activa el 2FA que ya existía (Paso H, sesión anterior). La respuesta honesta: no había ninguna pantalla — los tres endpoints estaban probados solo por HTTP directo.

- [x] **Nueva página `/[locale]/cuenta/seguridad`** ([FormularioDosFA.tsx](file:///home/fabianc/Documentos/ForumPage/src/components/FormularioDosFA.tsx)), un solo componente para cualquier rol (los endpoints `/2fa/generar`/`/2fa/confirmar`/`/2fa/desactivar` solo miran `req.user`, no rol) — enlazada desde `/portal` y `/staff`. Sin endpoints nuevos: es UI pura sobre lo que Paso H ya había construido y probado.
- [x] **Anomalía investigada durante la verificación — en su momento no confirmada, causa raíz encontrada después (ver sección siguiente).** Un primer test (activar → cerrar sesión → login) pasó directo sin pedir el código. Aislado con pruebas controladas ese mismo día no se reprodujo, así que se atribuyó a flakeo del navegador de pruebas. **Resultó ser la causa real de un incidente en la cuenta del fundador** — el navegador de pruebas comparte cookies con la sesión real del usuario.
- [x] **Los tres flujos verificados de punta a punta por la UI real**, no solo por API: activar con el código TOTP calculado a partir de la clave mostrada en pantalla (mismo algoritmo RFC 6238 de `src/lib/totp.ts`, replicado aparte solo para la prueba); login en dos pasos completo con sesión emitida; desactivar rechazando contraseña incorrecta y aceptando la correcta. Datos y usuario de prueba borrados.
- [x] **Aparte, a pedido del usuario:** botón "Portal" movido del header público al footer — cambio de diseño, no de seguridad (`/portal` sigue siendo accesible por URL directa).

### Cambio de Contraseña, Sesiones & Fix del Incidente de 2FA (2026-08-04 — Completo)
> El usuario reportó que su cuenta real pedía un código 2FA que nunca configuró, al mismo tiempo que pedía agregar cambio de contraseña a "Seguridad de mi cuenta".

- [x] **`FormularioCambiarPassword.tsx` / `cambiar-password.ts`**: exige la contraseña actual (`payload.login()`, mismo criterio que `desactivarDosFA`) antes de aceptar la nueva (mínimo 8 caracteres). No cierra otras sesiones — acción separada, a propósito.
- [x] **`PanelSesiones.tsx` / `cerrar-todas-sesiones.ts`**: muestra `ultimo_acceso` (campo que ya existía, nunca se mostraba) y cantidad de sesiones activas, con botón para cerrarlas todas — **incluida la propia**, a propósito: más simple y más seguro que preservar solo "esta sesión" (exigiría decodificar el `sid` del JWT actual), y el caso de uso real ("no sé si alguien más entró") se resuelve mejor cerrando todo.
- [x] **Incidente real resuelto: la cuenta del fundador tenía 2FA activado sin haberlo configurado.** Confirmado en la base (`dosFA_habilitado: true` con secreto real) — no era un error de pantalla. Desactivado de inmediato con `overrideAccess` para restaurar el acceso.
- [x] **Causa raíz encontrada al verificar la página nueva con un usuario de prueba**: la pestaña del navegador de pruebas del agente **comparte las cookies de sesión con la sesión real del usuario** — no son navegadores aislados, ni por pestaña (abrir una pestaña nueva tampoco aísla nada, las cookies son por origen). Confirmado navegando a `/api/users/me` en medio de una prueba y encontrando la sesión real del usuario con sesiones creadas en los minutos exactos de las pruebas de 2FA de la sesión anterior.
- [x] **Cambio de método para pruebas autenticadas sensibles**: de acá en adelante, login/2FA/contraseña/sesiones se verifican contra la API Local de Payload o `curl` con un cookie-jar aislado — nunca el navegador de pruebas compartido, que demostró poder interferir con sesiones reales. El navegador de pruebas sigue sirviendo para lo que no arriesga colisión de sesión (páginas públicas, formularios sin datos de otra cuenta).

### Deuda Técnica: Destinos, Auditoría & Foto Privada (2026-08-04 — Completo)
> El usuario pidió "arregla todo, dejalo listo" sobre los pendientes de código que quedaban en `docs/plan.md` — excluyendo Fase 0, que no depende de código. Aplicó la lección de la sección anterior: cada prueba autenticada real se hizo con una cuenta descartable vía script/`curl`, la sesión real del usuario en el navegador compartido solo se usó para observación sin mutar nada.

- [x] **`DestinosInternacionales` (nueva colección)**: los 6 destinos frecuentes de becarios internacionales vivían hardcodeados en un `if/else` duplicado en `FormularioNuevoBecario.tsx`/`FormularioEditarBecario.tsx`. Ahora colección editable por staff (`universidad`/`pais`/`ciudad`/`coordenadas`/`bandera`), sembrada con las mismas 6 universidades reales para no perder el dato. Verificado abriendo el modal real con la sesión del usuario (sin guardar): las 6 opciones vienen de la base con bandera y orden alfabético.
- [x] **Visor de `/directiva/auditoria` (nueva página)** — ver detalle en [[📋 Pipeline de Necesidades & Directiva]]. `Auditoria` ya se poblaba sola desde varios hooks pero nadie sin `/admin` podía leerla.
- [x] **`FotosBecarios` (nueva colección) — cierra el hueco de privacidad de `Becarios.foto`** señalado en la auditoría del 2026-08-01. Ver detalle en [[🛡️ Ciberseguridad & No-Negociables]] y [[🗄️ Modelo de Datos y Colecciones]]. Resuelto con control de acceso condicional, sin esperar a buckets S3.
- [x] **Bugs propios encontrados en el camino:** `.gitignore` no tenía `fotos-becarios/` (agregado antes de que hubiera archivos reales); `documentos-privados/` **tampoco** estaba en los volúmenes de `docker-compose.staging.yml` desde que se creó esa colección — un despliegue real habría perdido esos archivos en cada redeploy. Agregados los tres volúmenes que faltaban.
- [x] **Migraciones verificadas contra Postgres de dev, con `down()` correcto desde el primer intento** (`IF EXISTS` en los `DROP CONSTRAINT`/`DROP INDEX`, la regla ya aprendida del Paso L). Bug de tooling en el camino: un comentario SQL con backticks de Markdown dentro de un template literal de TypeScript cerraba el string antes de tiempo — `esbuild` fallaba al parsear la migración. Corregido quitando los backticks del comentario.
- [x] `tsc --noEmit`, `eslint`, `pnpm build` y `check:budget` (162.2 KB / 500 KB) limpios.

---

## 🔗 Nodos Relacionados
- [[🗺️ Home - Forum Foundation]]
- [[📋 Visión y Documento de Proyecto]]
- [[🏗️ Especificación Técnica (Spec)]]
- [[🗄️ Modelo de Datos y Colecciones]]
- [[🏛️ Página Institucional Nosotros]]
- [[📋 Pipeline de Necesidades & Directiva]]
- [[👨‍🎓 Portal del Becario & Sesiones]]
- [[🛡️ Ciberseguridad & No-Negociables]]
