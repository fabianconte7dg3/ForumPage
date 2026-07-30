# Plan de Ejecución — Plataforma Forum Foundation
### Documento complementario al Proyecto v1.0

---

## Principios de ejecución

**1. El contenido va antes que las funciones lucidoras.**
El mapa es lo más vistoso y lo más tentador para empezar. Sería un error: sin comunidades cargadas, sin actividades migradas y sin becarios registrados, el mapa es una pantalla vacía. Se construye cuando ya tiene qué mostrar.

**2. Lo que depende de terceros arranca el primer día.**
Los consentimientos de imagen, el inventario de artículos y las coordenadas de las comunidades no dependen de código pero sí de personas. Si esperan a la fase que los necesita, la bloquean.

**3. Cada fase termina en algo desplegado y usable.**
Nada de tres meses de desarrollo sin que la fundación vea nada. Al cerrar cada fase hay una URL viva.

**4. El sitio actual no se toca hasta el final.**
WordPress permanece en producción durante todo el desarrollo. El cambio de DNS ocurre una sola vez, al final de la Fase 1, con todo probado.

---

## Definición de "hecho"

Ningún módulo se da por terminado sin cumplir estos seis puntos. Aplica a las tres fases.

- [ ] Funciona en español e inglés, con el selector conduciendo a la página equivalente
- [ ] Se ve y opera correctamente en un teléfono de gama baja
- [ ] El staff puede crear, editar y borrar sus registros desde el panel sin ayuda del mantenedor
- [ ] No supera el presupuesto de 500 KB en primera carga
- [ ] Tiene control de acceso declarado según la matriz de la sección 10 del proyecto
- [ ] Está documentado en el `README` de operaciones

---

## Fase 0 — Preparación

**No requiere código. Bloquea todo lo demás si no se hace.**
*Duración estimada: 2 semanas, en paralelo con el inicio de Fase 1.*

### Levantamiento de información

- [ ] **Inventario completo de artículos** del WordPress actual: título, URL, fecha real de publicación, imágenes asociadas, idioma
- [ ] Marcar cuáles migran, cuáles se archivan y cuáles se reescriben
- [ ] Descargar los informes anuales de Google Drive (2021, 2022 y los que existan)
- [ ] Descargar los episodios del podcast alojados en Anchor, antes de que la plataforma cambie de manos otra vez
- [ ] Exportar la biblioteca de medios de WordPress en su resolución original

### Datos base a recopilar

- [ ] Listado de comunidades de Coclé norte donde opera la fundación, con distrito y corregimiento
- [ ] Coordenadas de cada comunidad *(centroide, no domicilios)*
- [ ] Listado de sedes de la fundación con sus coordenadas
- [ ] Listado de centros educativos apoyados
- [ ] Definición de programas: Becas John Y. Keffer, Infraestructura, INADEH, Biblioteca, Tutorías
- [ ] Padrón de becarios: nombre, comunidad de origen, universidad, carrera, año, país y ciudad de estudio

### Legal y consentimientos

- [ ] Redactar el **formulario de consentimiento de imagen y datos**, bilingüe
- [ ] Validarlo contra la Ley 81 de 2019
- [ ] **Iniciar la recolección de firmas de becarios** — este es el punto crítico de todo el cronograma
- [ ] Definir el procedimiento para consentimiento de acudientes en fotos de menores
- [ ] Auditar el material educativo existente: qué se puede publicar y bajo qué licencia

### Accesos y decisiones

- [ ] Acceso al panel de WordPress y al hosting actual
- [ ] Acceso al registrador del dominio
- [ ] Cuenta de DigitalOcean a nombre de la fundación, no personal
- [ ] Gestor de contraseñas compartido con la fundación creado
- [ ] Canal de YouTube institucional creado o verificado
- [ ] Entrevista con el staff que publicará: qué publican, con qué frecuencia, desde qué dispositivo

**Criterio de cierre de Fase 0:** existe una hoja de cálculo con comunidades y coordenadas, un inventario de artículos, y al menos un consentimiento firmado que sirva de modelo.

---

## Fase 1 — Base pública

*Objetivo: reemplazar el sitio actual con algo que la fundación pueda actualizar, y que sea legible en español.*

### 1.1 Infraestructura

- [ ] Repositorio Git con `README` de despliegue desde el primer commit
- [ ] Droplet 2 vCPU / 4 GB aprovisionado
- [ ] Docker Compose: app Next.js + Payload, PostgreSQL, Caddy
- [ ] HTTPS automático funcionando en un subdominio de pruebas
- [ ] DigitalOcean Spaces configurado como destino de medios
- [ ] `pg_dump` diario programado hacia Spaces
- [ ] **Restauración de respaldo probada en un droplet limpio** — no basta con programarla
- [ ] Secretos fuera del repositorio, en variables de entorno
- [ ] Entorno de staging separado de producción

### 1.2 Colecciones base

*Todo lo demás depende de esto. Se construye primero.*

- [ ] Configuración de localización ES/EN a nivel de campo
- [ ] Colección **Media** con variantes automáticas, `alt`, `consentimiento_verificado`, `contiene_menores`
- [ ] Colección **Comunidades**
- [ ] Colección **Programas** con color e ícono
- [ ] Colección **Sedes** con el campo `destacada`
- [ ] Colección **Centros Educativos**
- [ ] Colección **Usuarios** con los cuatro roles
- [ ] Colección **Auditoría**, solo escritura
- [ ] Colección **Configuración** global
- [ ] Carga de los datos recopilados en Fase 0

### 1.3 Actividades y migración

- [ ] Colección **Actividades** con todos sus campos y relaciones
- [ ] Colección **Proyectos** con `foto_antes` y `foto_despues`
- [ ] Script de extracción de contenido desde Elementor
- [ ] Migración de artículos, con revisión manual de cada uno
- [ ] Reasignación de fechas reales de publicación
- [ ] Reetiquetado de imágenes migradas con nombres descriptivos
- [ ] Traducción al español de los artículos que se conservan

### 1.4 Sitio público

- [ ] Maquetación base, tipografía e identidad visual
- [ ] Navegación de seis entradas + selector de idioma + botón Portal
- [ ] Enrutamiento `/es/` y `/en/` con equivalencia de páginas
- [ ] Home con sus seis bloques
- [ ] **Mural** de actividades: cuadrícula de imágenes, con fecha, filtros por comunidad y programa, y paginación
- [ ] Artículo individual
- [ ] Fichas de comunidad
- [ ] Fichas de proyecto con deslizador antes/después
- [ ] Páginas institucionales: Nosotros, Programas, Contacto
- [ ] Informes anuales alojados en el sitio
- [ ] Línea de tiempo

### 1.5 Mapa de Impacto

*Se construye cuando ya hay comunidades, sedes, proyectos y becarios cargados.*

- [ ] Colección **Becarios** con `mostrar_en_mapa` y consentimiento
- [ ] Generación de GeoJSON estático, regenerado al publicar
- [ ] MapLibre con capa de sedes, con la Academia Forum destacada
- [ ] Capa de centros educativos
- [ ] Capa de proyectos con estado y avance
- [ ] Agrupamiento por zoom para los ~400 pines de Coclé
- [ ] Arcos de becarios internacionales hacia su comunidad de origen
- [ ] Agrupación de arcos por país, expandible al filtrar
- [ ] Animación progresiva de trazado al cargar
- [ ] Panel lateral al hacer clic en pin o arco
- [ ] Filtros por programa, país y estado
- [ ] Contador en cabecera
- [ ] Carga diferida: el mapa no entra en el bundle inicial

### 1.6 Tutorías y panel de impacto

- [ ] Colecciones **Niveles** y **Materias**
- [ ] Colección **Tutorías**
- [ ] Vista de próximas tutorías
- [ ] Panel de Impacto público con cifras agregadas y fecha de última actualización

### 1.7 Lanzamiento

- [ ] Mapa completo de redirecciones 301, artículo por artículo
- [ ] Verificación de que ninguna URL antigua devuelve 404
- [ ] `sitemap.xml` y `robots.txt` con `hreflang` correcto
- [ ] Metadatos y previsualizaciones para redes
- [ ] Analítica respetuosa de privacidad instalada
- [ ] Página 404 útil
- [ ] Prueba de carga real en conexión móvil de Coclé, no en simulador
- [ ] **Capacitación del staff, grabada en video**
- [ ] Manual de publicación de una página, en español
- [ ] Cambio de DNS
- [ ] WordPress conservado 30 días en modo lectura, por si algo falta

### Criterios de aceptación — Fase 1

| Criterio | Medición |
|---|---|
| Publicación sin fricción | Un miembro del staff publica una actividad con 3 fotos desde su teléfono en **menos de 3 minutos**, cronometrado, sin ayuda |
| Rendimiento | Primera carga bajo 500 KB; home utilizable en 3G |
| Migración sin pérdida | 100% de las URLs anteriores responden 301 a su equivalente |
| Bilingüe | Toda página institucional existe en ambos idiomas y el selector mantiene el contexto |
| Mapa | Muestra sedes, proyectos y arcos internacionales con datos reales, no de prueba |
| Respaldo | Restauración completa verificada en entorno limpio |

---

## Fase 2 — Centro de Aprendizaje

*Objetivo: que la comunidad tenga algo utilizable, no solo algo que leer.*

- [ ] Colección **Recursos** con `fuente_y_licencia` obligatorio
- [ ] Colección **Prácticas** con sus tres modalidades
- [ ] Biblioteca navegable por nivel y materia
- [ ] Buscador con filtros, sin recarga de página
- [ ] Incrustación de videos de YouTube con carga diferida
- [ ] Motor de quiz autocorregido
- [ ] Progreso guardado en el dispositivo del estudiante
- [ ] Descarga de materiales para uso sin conexión
- [ ] Vista de tutorías integrada al centro
- [ ] Sección de inglés con enfoque pedagógico, no de traducción
- [ ] Formulario del staff para crear una práctica sin tocar código

### Criterios de aceptación — Fase 2

- Un estudiante encuentra y descarga un recurso de su nivel en menos de tres toques desde el home
- Ningún recurso publicado carece de licencia declarada
- El staff crea un quiz de cinco preguntas sin asistencia
- El centro funciona con conexión intermitente
- No se recolecta ningún dato personal en todo el módulo

---

## Fase 3 — Portal del Becario

*Objetivo: que el expediente deje de vivir en hojas de cálculo y correos.*

### 3.1 Autenticación

- [x] Login (en dos pasos si hay 2FA) y alta de becarios por invitación con enlace caduco — ver `docs/plan.md` Fase 3 Pasos H e I
- [x] Recuperación de contraseña, en dos pasos si hay 2FA — ver `docs/plan.md` Fase 3 Paso J
- [x] 2FA TOTP disponible para todos los roles, opcional para todos (decisión del fundador, no forzado)
- [x] Matriz de permisos implementada colección por colección (Becarios, RegistrosAcademicos, Recuperaciones, HorasLaborSocial, Desembolsos)
- [x] Reglas a nivel de campo: `motivo_suspension` vs `nota_interna_evaluacion`
- [x] Duración de sesión diferenciada por rol (2h staff/directiva/admin, 30 días becarios) — ver `docs/plan.md` Fase 3 Paso K
- [x] Desactivación de cuentas sin borrado (campo `activo`, bloqueado en login)

### 3.2 Expediente académico

- [ ] Colección **Registros Académicos** con `materias_reprobadas`
- [ ] Carga de documentos por el becario, con validación estricta de archivos
- [ ] Flujo de verificación por el staff, firmado y fechado
- [ ] **Automatismo de suspensión** al verificar un registro con materia reprobada
- [ ] Retención automática de desembolsos programados
- [ ] Colección **Recuperaciones** y flujo de reactivación
- [ ] Liberación de desembolsos retenidos al reactivar
- [ ] Congelamiento de registros ya verificados

### 3.3 Labor social y pagos

- [ ] Colección **Horas de Labor Social** con evidencia
- [ ] Flujo de aprobación y rechazo con comentario
- [ ] Barra de progreso contra la meta configurable
- [ ] Excepción individual por universidad
- [ ] Colección **Desembolsos** con sus cuatro estados
- [ ] Calendario e historial visible para el becario
- [ ] Aviso destacado al iniciar sesión

### 3.4 Experiencia del becario suspendido

- [ ] Mensaje explicando la causa y la materia pendiente
- [ ] Instrucciones visibles del proceso de recuperación
- [ ] Confirmación al reactivarse
- [ ] Verificación de que el estado de suspensión **no aparece** en el mapa ni en cifras públicas

### 3.5 Necesidades y cierre

- [ ] Colección **Necesidades** con su flujo de estados
- [ ] Formulario público de solicitud
- [ ] Cola priorizada para la directiva
- [ ] Vista de directiva de solo lectura sobre todo el sistema
- [ ] Auditoría activa sobre estados, verificaciones, horas, desembolsos y roles

### Criterios de aceptación — Fase 3

| Criterio | Medición |
|---|---|
| Automatismo | Verificar un registro con una materia reprobada suspende al becario y retiene sus desembolsos, sin intervención manual |
| Reversibilidad | Una recuperación verificada devuelve al becario a activo y libera los pagos, conservando todo el historial |
| Aislamiento | Un becario autenticado no puede alcanzar los datos de otro por ningún medio, incluida la API |
| Trazabilidad | Toda suspensión, aprobación y desembolso registra actor y fecha |
| Privacidad | El estado de suspensión no es visible desde ninguna vista pública |
| Claridad | Un becario suspendido entiende, sin preguntarle a nadie, por qué lo está y qué debe hacer |

---

## Post-lanzamiento

- [ ] **Revisión a los 3 meses:** ¿cuántas actividades publicó el staff sin ayuda?
- [ ] **Revisión a los 6 meses:** ¿sigue publicando? Si la respuesta es no, el problema es de diseño, no de disciplina
- [ ] Recapacitación si hubo rotación de personal
- [ ] Revisión anual de dependencias y parches de seguridad
- [ ] Prueba de restauración de respaldo cada seis meses

### Métricas de éxito propuestas

La fundación debería medir estas cinco. Son las que dicen si la plataforma resolvió el problema real.

1. **Actividades publicadas por trimestre.** La métrica madre. El sitio anterior murió en cero.
2. **Días transcurridos desde la última publicación.** Visible en el panel de administración como recordatorio permanente.
3. **Descargas y visitas del Centro de Aprendizaje**, desglosadas por nivel.
4. **Asistencia a tutorías** anunciadas en el sitio.
5. **Porcentaje de becarios con expediente al día** en el portal.

---

## Orden de arranque recomendado

Si mañana empiezas, este es el orden real de las primeras cuatro semanas:

1. Repositorio, Docker Compose, Payload arrancando en local
2. Colecciones base y localización — antes de cualquier interfaz
3. Actividades y el script de extracción de Elementor
4. En paralelo y sin código: inventario de artículos, coordenadas de comunidades y **arranque de la recolección de consentimientos**

El mapa viene después. Es la recompensa, no el punto de partida.
