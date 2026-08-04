# Manual de operaciones — Panel del staff

Guía práctica de cómo usar `/staff` y las páginas relacionadas (`/directiva/*`, `/cuenta/seguridad`). Sin capturas de pantalla — los nombres de botones y campos de acá son exactos, así que sirve para orientarse sobre la pantalla real.

Quién puede entrar a cada sección:

| Sección | Rol necesario |
|---|---|
| `/staff` (todas las pestañas) | `staff`, `admin` |
| `/directiva/necesidades` | `staff`, `directiva`, `admin` (directiva solo mira, no gestiona) |
| `/directiva/auditoria` | `directiva`, `admin` (staff no entra) |
| `/cuenta/seguridad` | cualquier cuenta logueada (becario, staff, directiva, admin) |
| `/admin` | según lo que se necesite tocar — ver "Lo que todavía exige `/admin`" al final |

---

## 1. Becarios (pestaña por defecto de `/staff`)

**Buscador**: filtra por nombre al instante, sin recargar la página.

**+ Registrar Becario**: crea el expediente (nombre, comunidad de origen, universidad, carrera, año, año de inicio de la beca, estado, tipo de estudio nacional/internacional). Si es internacional, el selector "Sugerencia / Destino Frecuente" completa universidad/país/ciudad/coordenadas de un tirón — la lista sale de la colección `Destinos Internacionales` (ver más abajo cómo agregarle uno nuevo), o se puede tipear todo a mano si el destino no está en la lista. El checkbox "Mostrar becario en el Mapa de Impacto" no se puede activar sin marcar antes "Consentimiento de imagen firmado" — es la condición que hace pública su ficha en `/impacto`.

**Importante — esto NO crea el login del becario.** Registrar acá solo crea el *expediente* (comunidad, universidad, etc.). Para que la persona pueda entrar a `/portal`, todavía hay que ir a `/admin` → Users → Create, elegir rol `Becario`, vincular el campo "El registro de becario vinculado a esta cuenta" con el expediente recién creado, y guardar. Eso genera solo un enlace de invitación de un solo uso (campo `enlace_invitacion` en esa misma pantalla de `/admin`) que hay que copiar y mandarle por el canal que sea — nunca se le asigna una contraseña a mano, el enlace es lo único válido y vence en 1 hora.

**Ver expediente** (en cada fila) abre `/staff/[id]` con:
- **Verificación académica**: subir/revisar créditos y boletín, botón "Evaluar y Verificar" — si hay materias reprobadas, el sistema suspende la beca solo.
- **Labor social**: horas reportadas por el becario, pendientes de validación por el coordinador de programa se aprueban/rechazan ahí mismo.
- **Desembolsos**: botón "+ Registrar Pago" → "Registrar Pago Realizado" marca el pago como hecho con la fecha de hoy.
- Editar el expediente completo (mismo formulario que "Registrar Becario", precargado).

---

## 2. Publicaciones

CRUD completo de Actividades (las historias que se ven en `/historias`) sin pasar por `/admin`.

- **Contenido**: el campo de texto principal usa líneas en blanco para separar párrafos — no hay negrita, enlaces ni listas (si hace falta algo más elaborado, esa publicación puntual sí se edita por `/admin`, que trae el editor completo).
- **Portada**: al subir o cambiar la foto aparece una previsualización recortada — hacer clic sobre la imagen fija el punto focal (qué parte de la foto no se recorta en las tarjetas y el encabezado del artículo); "Restablecer centro" lo vuelve a 50/50.
- **Galería**: cada foto ya subida tiene un botón "✕" para sacarla; las nuevas se agregan con el selector de archivos de abajo, se pueden elegir varias a la vez.
- Comunidad, programa y proyecto relacionado son opcionales — si no se conoce, mejor dejarlo así que forzar uno incorrecto.

---

## 3. Comunidades (Mapa)

Tres secciones en la misma pestaña, porque comparten forma (comunidad + coordenadas):

- **Puntos del Mapa & Comunidades**: nombre, distrito, corregimiento, coordenadas, descripción, foto.
- **Sedes**: nombre, tipo (sede principal / biblioteca / centro), comunidad asociada, coordenadas, horario, y el checkbox "destacada" (resalta la Academia Forum en el mapa con otro color). El campo de fotos múltiples de una sede no está en este formulario — para eso hay que ir a `/admin`.
- **Centros Educativos**: escuelas/colegios de la zona, mismo patrón de comunidad + coordenadas.

---

## 4. Proyectos

- **Proyectos de Infraestructura & Programas**: obras con estado, porcentaje de avance, monto, fotos antes/después, comunidad y programa.
- **Programas**: las categorías de inversión (Infraestructura, Becas, etc.) que alimentan el filtro del Mapa de Impacto y el selector de Proyectos/Publicaciones.

---

## 5. Nosotros / Equipo

- **Misión e Historia (`/nosotros`)**: el contenido institucional (misión, historia, foto, logo) — un solo formulario porque es un global, no una lista.
- **Miembros del Equipo**: nombre, cargo, bio, foto, "destacado" (le da la tarjeta grande, pensado para el fundador) y orden de aparición.

---

## 6. Centro de Aprendizaje

- **Biblioteca de Recursos**: PDF propio, enlace externo o video de YouTube — el tipo elegido cambia qué campos pide el formulario. `fuente_y_licencia` es obligatorio siempre.
- **Tutorías**: materia, nivel, sede, fecha/hora, cupo.
- **Prácticas**: las tres modalidades (descargable, quiz autocorregido, quiz con progreso). Para los quiz, el formulario deja armar las preguntas y sus opciones ahí mismo — cada pregunta necesita al menos 2 opciones completas y marcar cuál es la correcta antes de poder guardar.
- **Niveles y Materias** (las taxonomías que alimentan los selectores de arriba) siguen sin UI en el panel — se administran desde `/admin` porque son listas de un solo campo, de muy baja frecuencia de cambio.

---

## 7. Configuración General

Al final de la pestaña Becarios: meta de horas de labor social, calificaciones que cuentan como reprobatorias (lista editable, agregar/quitar una por una), texto del aviso que ve un becario suspendido, contacto institucional, y la fecha que se muestra como "última actualización" de las cifras de `/impacto`.

---

## 8. Cola de Necesidades (`/directiva/necesidades`)

No está en la barra de pestañas de `/staff` — es una URL aparte, pensada también para `directiva` (que solo mira, sin poder tocar nada).

- Casos agrupados por prioridad (alta/media/baja), con una sección aparte para los completados.
- `staff`/`admin` ven además los controles para cambiar estado, prioridad, si el caso es visible públicamente en `/impacto/necesidades`, y vincularlo a un proyecto una vez aprobado.
- `directiva` ve la misma cola (incluyendo costo estimado y quién lo reportó) pero sin ningún botón — su rol es de rendición de cuentas, no de operación.
- Desde ahí hay un link a la página de Auditoría (siguiente sección) para quien tenga acceso.

---

## 9. Registro de Auditoría (`/directiva/auditoria`)

Solo `directiva`/`admin` — `staff` no entra acá, a propósito (la colección se lo niega).

Lista, de más reciente a más antiguo, los cambios sensibles que el sistema registra solo: suspensiones automáticas por materias reprobadas, verificaciones académicas, desembolsos, cambios de rol de cuentas, reactivaciones. Cada fila tiene un "Ver valores" que despliega el detalle de qué cambió (antes/después) sin salir de la página.

---

## 10. Seguridad de mi cuenta (`/cuenta/seguridad`)

Disponible para cualquier rol logueado — un solo enlace "Seguridad" en el header de `/portal` y `/staff`.

- **Activar 2FA**: botón "Activar" muestra un código QR + la clave en texto (para cargarla a mano en la app autenticadora si no se puede escanear el QR). El primer código real que se ingresa confirma la activación. Es opcional para todos los roles, nadie está obligado.
- **Desactivar 2FA**: pide reingresar la contraseña actual antes de apagarlo — así una sesión robada no puede desactivarlo por su cuenta.
- **Cambiar contraseña**: pide la contraseña actual, la nueva (mínimo 8 caracteres) y su confirmación. No cierra las demás sesiones — eso es un botón aparte.
- **Sesiones activas**: muestra el último acceso y cuántas sesiones hay abiertas, con un botón "Cerrar todas las sesiones" (incluida la actual, a propósito — si hay duda de que alguien más entró, la forma más simple y segura es cerrar todo y volver a entrar).

---

## Ajustar el recorte de una foto ya publicada ("punto focal")

Si una foto de una publicación se ve mal recortada (corta una cara, un cartel, lo importante de la imagen), no hace falta volver a subirla ni tocar código: en `/admin` → Media → abrir esa foto → botón "Edit Image" → arrastrar el punto sobre lo que importa → "Apply Changes" → guardar el documento. El punto vive en la foto, no en el artículo, así que el ajuste se aplica en cualquier lugar del sitio donde esa misma foto se use (portada, tarjeta, galería). Para portadas nuevas subidas desde "Publicaciones" (sección 2), el mismo ajuste ya se puede hacer sin salir del panel, con la previsualización que trae el formulario.

---

## Lo que todavía exige `/admin`

Documentado a propósito, no es un olvido:

- **Crear el login de un becario** (el paso de invitación descrito en la sección 1) y **crear cuentas de staff/directiva/admin** — decisión deliberada: solo becarios se invitan desde el flujo simplificado, el resto de los roles se da de alta a mano con criterio.
- **Niveles y Materias** (taxonomías de un solo campo, cambian muy poco).
- **Fotos múltiples de una Sede** (`Sedes.fotos`) — campo opcional, poco usado, no justificaba un uploader múltiple extra en el panel.
- Cualquier edición de una publicación que necesite negrita, enlaces o listas en el contenido (el editor del panel es texto plano con párrafos).

---

## Relacionado

- [docs/plan.md](plan.md) — historial completo de cómo se construyó cada sección, con las decisiones y los recortes de alcance explicados.
- [docs/spec.md](spec.md) — modelo de datos y control de acceso de cada colección.
