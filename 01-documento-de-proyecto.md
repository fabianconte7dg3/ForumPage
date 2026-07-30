# Plataforma Digital Forum Foundation
### Documento de Proyecto — Versión 1.0

---

## 1. Resumen ejecutivo

La Forum Foundation, establecida en 2006 por John Keffer, apoya el desarrollo comunitario y educativo en la región montañosa del norte de Coclé, Panamá, mediante becas universitarias, mejoras de infraestructura escolar, tutorías y el sostenimiento de la Academia Forum / Biblioteca John Y. Keffer en El Caimito.

Este proyecto reemplaza el sitio WordPress actual por una plataforma propia con tres funciones: **contar la historia** del trabajo de la fundación, **rendir cuentas** ante sus fundadores en Estados Unidos, y **entregar recursos educativos** utilizables a la comunidad de Coclé norte.

**Definición clave:** la fundación no capta donaciones del público. Se financia mediante el aporte de su fundador. Por lo tanto la plataforma no es una herramienta de recaudación, sino de **evidencia, transparencia y servicio**.

---

## 2. Diagnóstico del sitio actual

Sitio auditado: `forum-foundation.org` — WordPress con tema Astra y constructor Elementor.

**Hallazgo principal:** el contenido más reciente del home es de noviembre de 2023 y el último informe anual publicado es el de 2022. Casi tres años sin publicar, mientras el pie de página muestra "© 2026" porque se actualiza automáticamente. Para un fundador que entra a verificar actividad, la impresión es que la fundación se detuvo.

**Conclusión que gobierna todo el diseño:** el problema no es tecnológico, es de fricción de publicación. Si el nuevo sistema no hace que publicar sea trivial, en tres años estaremos igual.

### Problemas concretos detectados

| Problema | Impacto |
|---|---|
| Sitio íntegramente en inglés | La comunidad servida no puede leer la página de su propia fundación |
| Home como lista plana e infinita, sin fechas ni categorías | Mezcla noticias de 2021–2023 con contenido permanente |
| Elementor guarda contenido en formato propietario | Migración manual página por página; editar intimida al staff |
| Tres logos superpuestos en la cabecera | Error de maquetación responsiva |
| Dos menús distintos (uno incluye "Blog", el otro no) | Navegación inconsistente |
| URLs de artículos cuelgan de la raíz, no de `/blog/` | Requiere redirecciones 301 individuales al migrar |
| Imágenes sin optimizar, nombres tipo `20230907_112830-1` | Carga lenta en conexiones rurales |
| Informes anuales en Google Drive, podcast en Anchor | Dependencias externas frágiles |
| Dos identidades: "Forum Foundation" / "Fundación Academia Forum" | Debe resolverse en el diseño bilingüe |

---

## 3. Audiencias

El diseño se organiza en torno a tres públicos con necesidades opuestas.

**1. Fundadores y directiva (Estados Unidos).** Necesitan evidencia verificable, no marketing: en qué se invirtió, a quién llegó, qué resultó. En inglés, consultable en cualquier momento sin solicitar reportes al staff.

**2. Comunidad y estudiantes (Coclé norte).** Necesitan información práctica y recursos utilizables: requisitos de becas, calendario de tutorías, material de estudio. Teléfonos de gama baja, datos móviles limitados, español.

**3. Staff de la fundación.** Necesitan cargar información sin fricción. **Requisito duro: publicar una actividad debe tomar menos de tres minutos desde un teléfono.**

---

## 4. Alcance funcional

### 4.1 Actividades — mural y blog unificados

El "Tablero de Recuerdos" y el blog **son el mismo módulo**. Un solo tipo de contenido, "Actividad", con fotos, texto, fecha, comunidad y programa etiquetados.

De una sola carga del staff se generan automáticamente:
- Tarjeta en el **mural** (cuadrícula de imágenes; clic abre el artículo completo)
- **Artículo** individual
- Punto en la **línea de tiempo**
- Contenido en el **panel del mapa** de esa comunidad
- Cifras del **panel de impacto**

Se conserva el estilo blog del sitio actual, corrigiendo la falta de fechas, categorías y paginación.

### 4.2 Mapa de Impacto

Herramienta central para presentaciones, reuniones con los fundadores y planificación estratégica. Especificación completa en la sección 6.

### 4.3 Panel de Impacto

**Vista pública:** cifras agregadas — becarios activos, comunidades atendidas, obras completadas, países alcanzados.

**Vista de directiva:** desglose por proyecto, montos, avance y evidencia fotográfica vinculada.

Actualización manual del staff. **No se promete "tiempo real"** — se etiqueta con fecha de última actualización.

### 4.4 Pipeline de Necesidades

Sustituye al micro-crowdfunding de la propuesta original, que no aplica al no haber captación pública de fondos.

Flujo: una comunidad o escuela reporta una necesidad → el staff la evalúa → la directiva ve la cola priorizada → se aprueba o descarta → se ejecuta → se documenta como Actividad y Proyecto.

La barra de progreso mide **estado del caso**, no dinero recaudado. Da a la comunidad un canal formal de solicitud y a la directiva visibilidad sobre lo que se está dejando de atender.

### 4.5 Centro de Aprendizaje — abierto, sin cuenta

Deliberadamente **sin registro**. Exigir login mataría el uso; un estudiante de 12 años no creará una cuenta para descargar una guía.

- **Biblioteca**: material de acceso abierto, enlaces curados y contenido propio de la fundación. Organizada por nivel y materia.
- **Videos**: alojados en YouTube (canal de la fundación) e incrustados. Calidad adaptativa gratuita, funciona en 3G, el staff sube desde el teléfono. **No se aloja video propio** — costoso y lento en conexión rural.
- **Tutorías**: calendario con materia, sede, fecha, cupo y responsable. Vista de "próximas tutorías".
- **Prácticas**: tres modalidades a elección del staff en un mismo formulario — descargable, quiz autocorregido, o quiz con progreso.

**Progreso guardado en el dispositivo del estudiante**, no en el servidor. El estudiante retoma donde quedó; la fundación no almacena ningún dato de menores. Se pierde al cambiar de teléfono, a cambio de eliminar todo riesgo legal y toda fricción de registro.

**Restricción legal:** no se pueden subir libros de texto escaneados. El campo `fuente_y_licencia` es obligatorio en cada recurso.

### 4.6 Portal del Becario — privado, autenticado

Las becas son exclusivamente universitarias, por lo que **todos los titulares de cuenta son mayores de edad**. Esto elimina el problema legal más pesado del planteamiento original.

#### Reglamento de la beca

**Requisitos de ingreso**
1. Persona de escasos recursos
2. Residente de Coclé norte

**Requisito de permanencia**
No reprobar ninguna materia. Calificaciones A, B o C mantienen el beneficio activo.

**Consecuencia de reprobar**
El apoyo **se suspende, no se cancela**. El becario recupera la materia y al aprobarla vuelve a optar por el beneficio.

> Esta distinción es crítica para el diseño: la suspensión es un **estado reversible**, no una baja. El sistema debe conservar el historial completo y permitir la reactivación sin volver a crear el expediente.

#### Ciclo de vida del becario

```text
        ┌──────────────────────────────────────┐
        │                                      │
   ACTIVO ──── reprueba materia ────► SUSPENDIDO
        │                                      │
        │         ◄──── recupera materia ──────┘
        │
        ├──── completa carrera ────► GRADUADO
        │
        └──── abandona ────────────► RETIRADO
```

El paso de ACTIVO a SUSPENDIDO se dispara **automáticamente** cuando el staff verifica un registro académico con al menos una materia reprobada. No depende de que alguien recuerde hacerlo.

#### Módulos

- **Registros académicos**: el becario carga su historial por período. El staff lo verifica y registra materias aprobadas y reprobadas. Si hay reprobadas, el sistema suspende y retiene los desembolsos programados.
- **Recuperación**: el becario suspendido carga evidencia de haber aprobado la materia pendiente. El staff verifica y reactiva. Queda registrado quién reactivó y cuándo.
- **Horas de labor social**: autorreporte con evidencia, aprobación del staff, barra hacia la meta. **Meta única para todos, definida en configuración y editable por el staff** sin tocar código; admite excepción individual cuando la universidad exige un mínimo distinto.
- **Desembolsos**: calendario de pagos programados, historial y estado del próximo.
- **Recordatorios**: aviso dentro del sitio, muy visible al iniciar sesión.

#### Transparencia hacia el becario

El portal debe explicarle al becario suspendido **por qué lo está y qué necesita hacer para volver**, con la materia pendiente identificada y el mecanismo de recuperación visible. Un estado de suspensión sin explicación se vive como castigo arbitrario; con explicación, funciona como lo que es — una pausa con camino de regreso.

> **Limitación reconocida:** el aviso dentro del sitio solo funciona si el becario entra. La arquitectura deja preparada la incorporación posterior de correo o WhatsApp Business sin rediseño.

---

## 5. Mapa del sitio y navegación

Problema a resolver: el sitio actual tiene dos menús distintos y un home que es una lista cronológica sin jerarquía. La nueva estructura debe acomodar tres audiencias con intenciones muy diferentes en una sola navegación.

### Navegación principal

**Inicio · Nosotros · Impacto · Aprende · Historias · Contacto**

Un solo menú, idéntico en escritorio y móvil. Separados visualmente a la derecha: **selector ES/EN** y botón **Portal**.

> El orden es deliberado. *Aprende* e *Impacto* preceden a *Historias* porque son las dos razones por las que alguien vuelve al sitio: el estudiante que busca una tutoría y el fundador que quiere ver evidencia. Las historias se leen una vez.

### Estructura de URLs

```text
/es/  ·  /en/

/nosotros                     Historia, John Keffer, equipo
  /nosotros/programas         Becas, Infraestructura, INADEH, Biblioteca
  /nosotros/informes          Informes anuales

/impacto                      Mapa de Impacto + cifras clave
  /impacto/comunidades/[slug]
  /impacto/proyectos/[slug]
  /impacto/necesidades

/aprende                      Centro de Aprendizaje
  /aprende/biblioteca
  /aprende/tutorias
  /aprende/practicas

/historias                    El mural
  /historias/[slug]           Artículo completo
  /historias/becarios/[slug]  Perfil de becario

/contacto

/portal                       Acceso
  /portal/expediente
  /portal/labor-social
  /portal/pagos
```

**Los informes anuales migran de Google Drive al sitio.** Es el documento que más le importa a la directiva y hoy vive en una carpeta ajena que puede romperse o cambiar de permisos.

### Estructura del home

Deja de ser un vertedero cronológico. Seis bloques:

1. **Hero** con el mensaje de cambio sostenible
2. **Cifras clave** — becarios activos, comunidades, países, obras completadas
3. **Mapa** en vista reducida, con enlace a la versión completa
4. **Tres actividades recientes** del mural, con fecha visible
5. **Acceso al Centro de Aprendizaje**, incluyendo próximas tutorías
6. **Informe anual más reciente**

Nada más. Todo lo demás queda a un clic.

### Selector de idioma

Debe conducir a la **página equivalente**, nunca al home. Si un fundador está leyendo la ficha de una comunidad en inglés y cambia a español, debe permanecer en esa comunidad. Es un error frecuente en sitios bilingües y arruina la experiencia.

### Mapa de redirecciones

El sitio actual está en inglés sin prefijo de idioma, por lo que todo el posicionamiento acumulado vive en URLs de raíz.

**Regla: conservar los slugs originales** y redirigir con 301 hacia la versión `/en/`. Los slugs de artículos se mantienen intactos aunque sean largos o contengan erratas — cambiarlos no aporta y arriesga tráfico.

| URL actual | Nueva URL |
|---|---|
| `/about` | `/en/about` |
| `/programs` | `/en/about/programs` |
| `/learning-resources` | `/en/learn` |
| `/stories` | `/en/stories` |
| `/blog` | `/en/stories` |
| `/contact` | `/en/contact` |
| `/john-keffer-sustainable-change` | `/en/about/john-keffer-sustainable-change` |
| `/the-value-of-a-visit` | `/en/stories/the-value-of-a-visit` |
| *(resto de artículos)* | `/en/stories/[slug-original]` |

---

## 6. Arquitectura técnica

### Stack seleccionado

| Capa | Tecnología |
|---|---|
| Framework | Next.js (App Router) |
| CMS y panel admin | Payload CMS 3 — corre dentro de la misma app Next.js |
| Base de datos | PostgreSQL |
| Mapa | MapLibre GL JS + teselas MapTiler o Protomaps |
| Proxy y TLS | Caddy (HTTPS automático) |
| Orquestación | Docker Compose |

### Por qué Payload

Next.js no provee panel administrativo. Construirlo a mano consumiría ~200 horas y produciría algo peor que WordPress, hundiendo el requisito más importante del proyecto. Payload lo genera desde definiciones en TypeScript y resuelve directamente cuatro requisitos:

- **Localización a nivel de campo** — el staff ve un selector ES/EN dentro de cada entrada; nunca duplica registros
- **Compresión y variantes de imagen automáticas** al subir — era un módulo entero de la propuesta original, aquí es configuración
- **Autenticación y control de acceso por colección** — base del portal de becarios
- **Todo administrable** — comunidades, programas, niveles, materias, actividades y tutorías son colecciones editables; nada codificado

### Principio de diseño

**Nada hardcodeado.** El staff nunca debe pedirle al mantenedor que agregue una comunidad, un programa, un nivel o una actividad. Esto encarece el desarrollo inicial y es lo que mantiene la plataforma viva a tres años.

### Rendimiento

El sitio público debe permanecer bajo **500 KB en la primera carga**. Los módulos pesados (mapa, gráficos) se cargan bajo demanda, nunca en el bundle inicial. El Centro de Aprendizaje debe funcionar con conexión intermitente.

---

## 7. Mapa de Impacto — especificación

### Propósito narrativo

Contar cómo estudiantes de zonas rurales de Coclé llegaron a cumplir sus metas dentro y fuera del país. Los arcos se dibujan progresivamente al cargar, saliendo desde Coclé: en una reunión con los fundadores, eso convierte el mapa en una historia y no en un tablero.

### Capas

| Capa | Contenido |
|---|---|
| Sedes | Instalaciones de la fundación. La **Academia Forum / Auditorio John Y. Keffer** en El Caimito destaca visualmente como ancla geográfica |
| Centros educativos | Escuelas apoyadas pero no operadas por la fundación |
| Proyectos | Obras de infraestructura, con estado y avance |
| Becarios internacionales | Pin en ciudad de destino + **arco hacia su comunidad de origen** |
| Becarios nacionales | Conteo agregado en el pin de su comunidad; opcionalmente pin en su universidad panameña. Sin arco: no hay distancia que narrar |
| Retornados | Becarios formados fuera que regresaron a ejercer en Coclé. **Arco en sentido inverso.** Cierra el círculo del "cambio sostenible" — narrativamente, lo más potente del mapa |

### Interacción

- **Clic en pin de becario o arco** → panel lateral: foto, nombre, comunidad de origen, universidad, carrera, año, cita personal y enlaces a las Actividades del blog donde aparece
- **Clic en comunidad** → becas activas, proyectos, actividades, necesidades pendientes
- **Clic en proyecto** → estado, avance, deslizador antes/después
- **Filtros** por programa, país y estado del becario
- **Contador** en cabecera: "23 becarios en 6 países"

### Escala y decisiones técnicas

Volumen estimado: **~400 becarios totales, ~100 internacionales.**

- 400 pines concentrados en Coclé requieren **agrupamiento por zoom (clustering)**; se despliegan individualmente al acercar
- 100 arcos simultáneos saturan visualmente: por defecto se muestran **agrupados por país**, expandiéndose a arcos individuales al filtrar o hacer clic
- Los datos del mapa se sirven **precalculados como GeoJSON estático**, regenerado al publicar cambios — evita consultar la base en cada visita

### Precisión geográfica

Los becarios se ubican en el **centroide de su comunidad de origen**, nunca en su domicilio. Los destinos de estudio, en el centroide de la ciudad. Suficiente para la narrativa, sin exposición.

---

## 8. Privacidad y protección de datos

Marco aplicable: **Ley 81 de 2019** de Protección de Datos Personales de la República de Panamá.

### Becarios (adultos)

Al existir un solo modo de mapa público, la protección no proviene de ocultar datos sino del **consentimiento explícito**.

- Campo `mostrar_en_mapa` que **solo se activa con consentimiento firmado archivado**
- El consentimiento especifica exactamente qué se publica: nombre, foto, comunidad de origen, universidad e historia
- Sin documento, el becario no aparece — y puede negarse sin consecuencias

**Entregable requerido:** formulario de consentimiento de imagen y datos, bilingüe, en versión digital y física.

### Datos sensibles del expediente

Dos categorías requieren tratamiento estricto y **nunca se exponen públicamente**, ni siquiera de forma agregada de manera que permita identificar a alguien:

- **Condición socioeconómica.** Es un requisito de elegibilidad, pero solo debe registrarse como verificación cumplida y su documentación de respaldo permanece de acceso restringido al staff evaluador. No es un campo de perfil.
- **Estado de suspensión.** Un becario suspendido sigue siendo becario. El mapa público y las cifras agregadas no distinguen entre activo y suspendido; publicar esa condición equivaldría a exponer un fracaso académico ante su comunidad.

### Menores

- **No existen cuentas de menores** en la plataforma
- El Centro de Aprendizaje no recolecta ningún dato personal
- Fotografías de menores en Actividades requieren consentimiento del acudiente. La colección Media incluye `consentimiento_verificado` y `contiene_menores` para filtrar antes de publicar

### Seguridad — prioridades reales

La propuesta original enfatizaba aislamiento de red y firewall perimetral. Los vectores reales en un proyecto de este tamaño son otros:

1. Autenticación de dos factores obligatoria para staff y administradores
2. Control de acceso por rol y por colección — un becario alcanza únicamente sus propios registros
3. Validación estricta de archivos subidos (tipo, tamaño, contenido)
4. Registro de auditoría sobre datos académicos y desembolsos
5. Respaldos **probados**, no solo programados
6. Gestión de secretos fuera del repositorio

**Se elimina de la propuesta** la "inyección de esquemas JSON personalizados": ambigua, sin valor para esta organización y con superficie de ataque innecesaria.

---

## 9. Modelo de datos

La **Comunidad** es el eje del sistema. Todo apunta a ella, y por eso el mapa se alimenta solo sin trabajo adicional del staff.

### Núcleo geográfico

**Comunidades** — nombre, distrito, corregimiento, coordenadas, descripción, foto

**Sedes** — nombre, tipo (sede principal / biblioteca / centro), comunidad, coordenadas, `destacada`, horario, fotos

**Centros Educativos** — nombre, comunidad, coordenadas, niveles atendidos, matrícula, contacto

### Programas y obras

**Programas** — nombre, descripción, color, ícono, activo
> El color y el ícono generan automáticamente los filtros del mapa

**Proyectos** — título, programa, comunidad, centro educativo, estado (propuesto / aprobado / en ejecución / completado), fechas, monto, avance, `foto_antes`, `foto_despues`

**Necesidades** — título, comunidad, solicitante, descripción, prioridad, costo estimado, estado (recibida → en evaluación → aprobada → en ejecución → completada), proyecto resultante, `visible_publicamente`

### Contenido

**Actividades** — título, slug, extracto, contenido, fecha, portada, galería, comunidad, programa, proyecto, destacada

**Media** — archivo, texto alternativo, `consentimiento_verificado`, `contiene_menores`

### Centro de Aprendizaje

**Recursos** — título, tipo (PDF propio / enlace externo / video YouTube / práctica), nivel, materia, idioma, archivo o URL, `fuente_y_licencia` *(obligatorio)*

**Prácticas** — título, nivel, materia, modalidad, preguntas (enunciado, opciones, respuesta correcta, retroalimentación)

**Tutorías** — materia, nivel, sede, fecha y hora, cupo, responsable, recurrencia, notas

**Niveles** y **Materias** — taxonomías editables por el staff

### Portal del Becario

**Becarios** — nombre, comunidad de origen, universidad, carrera, año, `tipo_estudio` (nacional / internacional), `pais_estudio`, `ciudad_estudio` + coordenadas, `anio_inicio`, **`estado` (activo / suspendido / graduado / retornado / retirado)**, `motivo_suspension`, `fecha_suspension`, `meta_horas_personalizada` *(opcional, sobrescribe la global)*, foto, cita, historia, `mostrar_en_mapa`, `consentimiento_firmado` + fecha

**Registros Académicos** — becario, período, universidad, `materias_aprobadas`, **`materias_reprobadas`** (arreglo: nombre, calificación), índice, documento adjunto, estado de verificación, verificado por, fecha de verificación
> Al verificarse un registro con `materias_reprobadas` no vacío, el sistema cambia el estado del becario a *suspendido* y pasa sus desembolsos programados a *retenido*.

**Recuperaciones** — becario, materia recuperada, período, evidencia, estado, verificado por, fecha
> Al verificarse, devuelve al becario a *activo* y libera los desembolsos retenidos.

**Horas de Labor Social** — becario, fecha, horas, descripción, evidencia, estado (pendiente / aprobada / rechazada), aprobador, comentario

**Desembolsos** — becario, monto, fecha programada, fecha efectiva, **estado (programado / retenido / pagado / cancelado)**, concepto
> Los desembolsos nunca se eliminan al suspender: pasan a *retenido* para preservar el historial.

**Usuarios** — nombre, correo, rol (administrador / staff / directiva / becario), becario vinculado *(solo rol becario)*, activo, 2FA habilitado, último acceso
> Detalle completo de permisos en la sección 10.

**Auditoría** — actor, acción, colección, registro afectado, valor anterior, valor nuevo, fecha, IP. **Solo escritura**: no admite edición ni borrado desde el panel.

### Configuración global

**Configuración** *(registro único, editable por el staff)* — `meta_horas_labor_social`, `calificaciones_reprobatorias`, texto del aviso de suspensión, datos de contacto institucional
> Ningún umbral queda escrito en el código. Si mañana la fundación cambia la meta de horas o el criterio de reprobación, lo hace desde el panel.

---

## 10. Identidades y control de acceso (IAM)

En Payload el control de acceso se declara por colección y por campo, por lo que esta definición condiciona la estructura del código. No es una capa que pueda agregarse después.

### Principio

**Cualquier miembro del staff puede verificar registros académicos.** Para una organización de este tamaño, exigir doble aprobación agregaría fricción sin beneficio real. El control no es preventivo sino **trazable**: cada verificación queda firmada con autor y fecha, y toda suspensión es reversible.

### Matriz de permisos

| | Público | Becario | Staff | Directiva | Admin |
|---|---|---|---|---|---|
| Actividades, comunidades, sedes, proyectos, programas | Lectura | Lectura | CRUD | Lectura | CRUD |
| Tutorías, recursos, prácticas, media | Lectura | Lectura | CRUD | Lectura | CRUD |
| Necesidades | Lectura *(si públicas)* | Lectura *(si públicas)* | CRUD | Lectura | CRUD |
| Becarios | Lectura *(solo `mostrar_en_mapa`)* | Su perfil | CRUD | Lectura | CRUD |
| Registros académicos | — | Crea y lee los propios | Verifica | Lectura | CRUD |
| Recuperaciones | — | Crea y lee las propias | Verifica | Lectura | CRUD |
| Horas de labor social | — | Crea y lee las propias | Aprueba | Lectura | CRUD |
| Desembolsos | — | Lee los propios | CRUD | Lectura | CRUD |
| Configuración global | — | — | Edición | Lectura | Edición |
| Usuarios y roles | — | — | — | — | CRUD |
| Auditoría | — | — | — | Lectura | Lectura |

### Reglas por rol

**Becario**
- Edita únicamente lo que está en estado *pendiente*. Una vez verificado o approved, el registro queda congelado.
- Edita libremente su cita, historia, foto y `mostrar_en_mapa` — **puede revocar su consentimiento en cualquier momento**.
- No accede a información de otros becarios.

**Staff**
- Control total sobre contenido y sobre el expediente de becarios.
- No crea usuarios ni modifica roles.

**Directiva**
- Lectura sobre todo el sistema, sin escritura en nada.
- Es el rol de los fundadores. Su valor está en poder verificar directamente, sin depender de que el staff prepare un reporte.

### Reglas a nivel de campo

Dos separaciones que no se resuelven por colección sino por campo:

| Campo | Visibilidad |
|---|---|
| `motivo_suspension` *(el que ve el becario)* | Becario, staff, directiva, admin |
| `nota_interna_evaluacion` | Staff y admin únicamente |
| Documentación socioeconómica | Staff y admin. La directiva ve el requisito como verificado, no el expediente |

> Si el motivo visible y la nota interna fueran el mismo campo, el staff se autocensura o el becario lee algo que no debía.

### Operación

- **2FA disponible para todos los roles, opcional para todos** — decisión del fundador (2026-07-30): no se fuerza en staff/directiva/administrador, cada quien decide activarlo.
- **Auditoría** sobre: cambios de estado del becario, verificaciones académicas, aprobación de horas, desembolsos y cambios de rol.
- **Baja de personal**: la cuenta se desactiva, nunca se elimina. Borrarla rompería la trazabilidad de lo que esa persona verificó.
- **Duración de sesión**: corta para staff y directiva, larga para becarios.
- **Alta de becarios**: creada por el staff mediante invitación por enlace. **No hay autorregistro** — ser becario es una condición otorgada tras evaluación, no solicitada desde el sitio.

---

## 11. Bilingüismo

No responde a la captación de donantes, sino a dos objetivos propios: **transparencia hacia los fundadores angloparlantes** e **integración del inglés en la comunidad**, prioridad declarada de la fundación.

| Nivel | Alcance |
|---|---|
| Obligatorio | Páginas institucionales, proyectos, reportes de impacto, fichas de comunidad — lo que ve la directiva |
| Opcional | Noticias del día a día, con traducción asistida revisada por el staff |
| Pedagógico | Centro de Aprendizaje, donde el inglés no es traducción sino contenido en sí mismo |

**Se localizan:** títulos, descripciones, contenidos, textos alternativos, nombres de programas, niveles y materias.
**No se localizan:** nombres de personas y comunidades, fechas, montos, coordenadas.

> El idioma debe existir en la estructura de datos desde el primer día. Incorporarlo después obliga a rehacer el modelo completo.

---

## 12. Infraestructura y costos

### Configuración — DigitalOcean

| Componente | Especificación | Costo mensual |
|---|---|---|
| Droplet | 2 vCPU / 4 GB | $24 |
| Spaces + CDN | Almacenamiento de imágenes | $5 |
| Backups automáticos | Snapshot del droplet | ~$5 |
| Dominio | Existente | $15 / año |
| **Total** | | **~$35/mes — ~$420/año** |

Menos de lo que probablemente cuesta hoy el WordPress con Elementor.

### Decisiones de infraestructura

- **Las imágenes nunca se guardan en el disco del droplet.** Van a Spaces. De lo contrario cada respaldo pesa desproporcionadamente y un redespliegue mal ejecutado borra años de fotografías. Spaces incluye CDN, lo que además mejora la carga en zonas rurales.
- `pg_dump` diario hacia Spaces, **con restauraciones verificadas**. Un respaldo nunca restaurado no es un respaldo.
- Postgres administrado (+$15/mes) es opción válida si se prefiere recuperación a un punto en el tiempo sin gestión manual.
- El WordPress actual permanece activo durante todo el desarrollo. El cambio de DNS se realiza al final, con todo probado.

---

## 13. Fases

**Fase 1 — Base pública**
Migración desde WordPress con redirecciones 301 · Actividades (mural + blog) · Comunidades y Sedes · Mapa de Impacto · Panel de Impacto público · Tutorías · Bilingüe

**Fase 2 — Centro de Aprendizaje**
Biblioteca · Recursos · Videos · Prácticas en sus tres modalidades

**Fase 3 — Portal del Becario**
Autenticación · Registros académicos · Horas de labor social · Desembolsos y avisos · Pipeline de Necesidades

### Esfuerzo estimado

| Concepto | Horas |
|---|---|
| Desarrollo total (tres fases) | 400–600 |
| Migración de contenido (formato Elementor) | 20–40 |

---

## 14. Riesgos

| Riesgo | Mitigación |
|---|---|
| **Mantenedor único.** Si el responsable no está, la fundación queda expuesta | `README` de despliegue documentado, credenciales en gestor compartido con la fundación, stack estándar sin dependencias exóticas. **Parte obligatoria de la entrega** |
| **Abandono de publicación**, que es lo que ocurrió con el sitio actual | Meta de publicación menor a 3 minutos desde teléfono; capacitación del staff; revisión a los 3 y 6 meses |
| **Migración desde Elementor** más lenta de lo previsto | Extracción asistida por script + revisión manual; presupuesto holgado |
| **Baja conectividad rural** | Presupuesto de 500 KB en primera carga; carga diferida de módulos pesados; CDN |
| **Consentimientos faltantes** bloquean el mapa | Recolección de consentimientos iniciada en paralelo al desarrollo, no al final |
| **VPS difícil de heredar** | Docker Compose reproducible; documentación de operaciones |

---

## 15. Pendientes por definir

### Resuelto

- ✅ **Criterio académico** — definido en 4.6, con ciclo de suspensión reversible
- ✅ **Meta de labor social** — única, en configuración global, editable por el staff
- ✅ **Becarios retornados** — la funcionalidad se construye; los datos se cargan si el caso existe
- ✅ **Identidad institucional** — el nombre es **Forum Foundation**, en ambos idiomas
- ✅ **Verificación académica** — cualquier miembro del staff, con firma y auditoría (sección 10)
- ✅ **Mapa del sitio y navegación** — definidos en la sección 5, con mapa de redirecciones

> Sugerencia sobre la identidad: conservar "Academia Forum" únicamente como nombre del **recinto físico** en El Caimito, no como nombre de la organización. Así se elimina la ambigüedad sin perder un nombre que la comunidad ya reconoce.
