# Diseño y Sistema Visual — Plataforma Forum Foundation
*Documento 4 · Complemento del Proyecto v1.0, el Plan de Ejecución y el Runbook Técnico*

## 1. Tesis de diseño

Este sitio es un registro, no un folleto.

Todo el diagnóstico apunta al mismo sitio: el WordPress actual falló porque nadie podía saber si la fundación seguía activa. No había fechas, no había orden, no había prueba. Un fundador entraba y no encontraba evidencia.

Entonces la función del diseño no es verse bonito, es dar testimonio. La estética que corresponde es documental: fotografía primero, fechado, catalogado, con la información de procedencia visible. Un archivo de campo, no una landing de ONG.

De ahí salen dos decisiones que gobiernan todo lo demás:

- **La fecha es contenido, no metadato.** Cada actividad, informe, tutoría y proyecto lleva su fecha en un lugar prominente y en tipografía monoespaciada. No se esconde en letra gris de 11px al pie de la tarjeta. El sitio anterior murió por no fechar nada; este exhibe sus fechas con orgullo o con vergüenza, y ambas son útiles.

- **El arco es la firma.** El mapa dibuja arcos desde las comunidades de Coclé hacia las ciudades donde estudian los becarios. Esa geometría —la trayectoria de la montaña al mundo— es literalmente la tesis de "cambio sostenible" de la fundación. Se convierte en el elemento estructural recurrente del sitio, no en un adorno.

## 2. Identidad

### 2.1 Problema a resolver primero

El sitio actual carga tres archivos de logo distintos superpuestos en la cabecera. Antes de diseñar nada hay que decidir cuál es el logo.

- [ ] Elegir la marca definitiva entre las tres versiones existentes
- [ ] Producir SVG en tres variantes: horizontal, isotipo (para favicon y pines del mapa), monocromo
- [ ] Definir área de resguardo y tamaño mínimo legible
- [ ] Favicon completo y `og:image` por defecto

### 2.2 Nomenclatura

Resuelto en el documento de proyecto: Forum Foundation en ambos idiomas. "Academia Forum" se reserva para el recinto físico en El Caimito y aparece únicamente como nombre de sede en el mapa y en su ficha.

## 3. Sistema de diseño

### 3.1 Paleta

Derivada del entorno real: bosque nublado de la cordillera, la luz de la estación seca, el azul de los uniformes escolares panameños.

| Token | Hex | Uso |
| --- | --- | --- |
| `montana` | `#17423B` | Primario. Cabecera, botones, capa de sedes en el mapa |
| `tinta` | `#101C2B` | Todo el texto de lectura |
| `cosecha` | `#C08A1E` | Acento. Arcos del mapa, estados destacados, subrayados |
| `rio` | `#2F7D8C` | Interacción: enlaces, foco, hover |
| `piedra` | `#6B7770` | Texto secundario, bordes hairline, metadatos |
| `niebla` | `#F2F4F1` | Fondo de página |

**Por qué no crema.** El blanco roto de este sitio es de tinte frío (`#F2F4F1`), no cálido. El papel crema con serif de alto contraste y acento terracota es el look por defecto de cualquier sitio de fundación de los últimos tres años. Un verde profundo sobre papel frío se parece al lugar del que habla el sitio y no se parece a los demás.

**Colores funcionales — derivados, no inventados:** estados de proyecto (propuesto, aprobado, en ejecución, completado) usan una rampa de piedra a montana. El rojo se reserva exclusivamente para errores de formulario. Nunca para "suspendido": un becario suspendido no es un error.

### 3.2 Tipografía

Tres roles, tres funciones distintas. Todas variables, todas subconjunto latino.

| Rol | Familia | Uso |
| --- | --- | --- |
| Display | Archivo Expanded 600–700 | Titulares, títulos de sección. Ancha, institucional, sin florituras |
| Lectura | Source Serif 4 400/600 | Cuerpo de artículos, descripciones. Excelentes diacríticos en español |
| Datos | IBM Plex Mono 400/500 | Fechas, cifras, coordenadas, etiquetas, contadores |

El mono no es decorativo. Marca lo que es dato verificable: la fecha de una actividad, el avance de una obra, el número de becarios, las coordenadas de una comunidad. Es lo que distingue visualmente la evidencia de la narrativa.

Escala (móvil / escritorio):

```text
display-1   32 / 52 px   Archivo Expanded 700, tracking -0.02em
display-2   24 / 36 px   Archivo Expanded 600
titulo      19 / 22 px   Archivo Expanded 600
cuerpo      17 / 18 px   Source Serif 4 400, interlínea 1.65
apoyo       15 / 15 px   Source Serif 4 400
dato        13 / 13 px   IBM Plex Mono 500, tracking 0.04em, versalitas
```

Cuerpo a 17px en móvil, no 16. La audiencia lee en pantallas pequeñas, a veces con luz solar directa, a veces con vista cansada. Un punto extra cuesta cero.

Costo: tres familias variables subconjunto latino pesan unos 70–90 KB. Cabe en el presupuesto, pero si aprieta, el primer recorte es Source Serif 4 y el cuerpo pasa a la pila del sistema. El display y el mono se conservan: son los que cargan la personalidad.

### 3.3 Geometría y superficie

- **Radio:** 4px en tarjetas y botones, 2px en etiquetas, 0 en imágenes. Ni esquinas vivas ni píldoras.
- **Bordes:** hairline de 1px en piedra al 25%. Sin sombras en ningún componente. La separación se hace con borde y espacio, no con elevación falsa.
- **Rejilla:** 12 columnas en escritorio, 4 en móvil. Espaciado en múltiplos de 4px.
- **Ancho de lectura:** máximo 68 caracteres en artículos.

### 3.4 El arco

El elemento de firma, en tres apariciones y ninguna más:

1. **Divisor de sección** — un arco de 1px en cosecha, muy tendido, reemplaza la regla horizontal recta. Sutil, casi imperceptible, pero presente en todo el sitio.
2. **Insignia de comunidad** — una comunidad que tiene al menos un becario estudiando en el exterior lleva un arco pequeño junto a su nombre. Encoda información real, no decora.
3. **Hero del home** — el arco se traza una vez al cargar, en unos 1200 ms, saliendo de Coclé. Solo la primera visita de la sesión.

Regla de restricción: si el arco aparece en un cuarto lugar, se quita de ahí. La firma funciona porque es escasa.

### 3.5 Movimiento

Presupuesto deliberadamente pobre. Transiciones de 150–200 ms en hover y foco, ease-out. El trazado del arco en el hero y en el mapa. Nada más: sin paralaje, sin revelados al hacer scroll, sin contadores animados.

`prefers-reduced-motion: reduce` desactiva el trazado de arcos y los deja dibujados desde el inicio.

### 3.6 Fotografía

Es el material principal del sitio y hoy es su punto más débil: volcados de cámara sin criterio, nombres como `20230907_112830-1`.

- Relación 4:3 en tarjetas de actividad, 16:9 en portadas de artículo, 1:1 en retratos de becario
- Sin filtros ni tratamientos de color; el registro documental no se estiliza
- `alt` obligatorio y en ambos idiomas, escrito por el staff
- Marcador de posición: bloque en niebla con el isotipo al 10%, nunca un ícono genérico de imagen rota

## 4. Accesibilidad — piso no negociable

- [ ] Contraste AA en todo: tinta sobre niebla da 14:1; verificar cosecha sobre niebla, que probablemente exija oscurecerse para texto
- [ ] Foco visible en todos los elementos interactivos: contorno de 2px en rio con offset de 2px. Nunca `outline: none`
- [ ] Toda la navegación operable por teclado, incluidos el mapa y los quizzes
- [ ] Objetivos táctiles de 44×44px mínimo
- [ ] Jerarquía de encabezados correcta, un solo `h1` por página
- [ ] `lang` correcto en `<html>` y en fragmentos del idioma opuesto — importante en el Centro de Aprendizaje, donde conviven ambos idiomas en la misma página
- [ ] El mapa tiene alternativa: toda la información también existe como listas navegables en las fichas de comunidad

## 5. Inventario de componentes

### Estructura
- Cabecera con navegación de seis entradas, selector ES/EN y botón Portal
- Navegación móvil desplegable
- Pie con contacto, redes, aviso legal y política de privacidad
- Divisor de arco
- Migas de pan (fichas de comunidad y proyecto)

### Contenido
- Tarjeta de actividad — imagen 4:3, fecha en mono, título, etiqueta de comunidad, etiqueta de programa
- Cuerpo de artículo con galería
- Ficha de comunidad
- Tarjeta de proyecto con barra de avance
- Deslizador antes/después
- Línea de tiempo
- Tarjeta de informe anual (PDF, con año e idioma)

### Datos
- Contador — cifra grande en mono, etiqueta pequeña, y fecha de última actualización siempre visible
- Rejilla de cifras clave del home
- Barra de progreso (avance de obra, horas de labor social, estado de necesidad)
- Tarjeta de necesidad con su estado

### Mapa
- Contenedor con controles de zoom accesibles
- Panel lateral de becario
- Panel lateral de comunidad
- Panel lateral de proyecto
- Barra de filtros por programa, país y estado
- Leyenda

### Aprendizaje
- Tarjeta de recurso, con tipo, nivel, materia y licencia visible
- Filtros de biblioteca
- Incrustación diferida de YouTube (miniatura estática hasta el clic)
- Tarjeta de tutoría con fecha, sede, cupo y responsable
- Pregunta de quiz con retroalimentación
- Indicador de progreso local, con aviso de que se guarda en el dispositivo

### Portal
- Formulario de acceso
- Aviso de suspensión — el componente más delicado del sistema
- Tabla de registros académicos con estados
- Formulario de carga de horas con evidencia
- Tabla de desembolsos
- Anillo de progreso de labor social

### Sistema
- Estado vacío
- Estado de carga (esqueleto, no ruleta)
- Mensaje de error
- Notificación de confirmación

## 6. Estados vacíos, error y carga

Una pantalla vacía es una invitación a actuar, no un mensaje de disculpa.

Al lanzar, muchas secciones no van a tener contenido. Cada estado vacío se escribe una vez y se escribe bien:

| Contexto | Texto |
| --- | --- |
| Mural sin resultados con filtro | "No hay actividades en El Caimito para este programa. Ver todas las actividades." |
| Comunidad sin proyectos | "Todavía no hay obras registradas en esta comunidad." |
| Biblioteca sin resultados | "Ningún recurso coincide. Prueba con otro nivel o materia." |
| Sin tutorías próximas | "No hay tutorías programadas esta semana. Escríbenos para solicitar una." |
| Becario sin registros | "Aún no has cargado ningún período académico. Cargar mi historial." |

Reglas de escritura: el error dice qué pasó y cómo se arregla. No se disculpa. No dice "Ups". Los botones se nombran por lo que hacen y mantienen el mismo verbo en toda la secuencia — el botón "Publicar" produce el mensaje "Publicado".

### 6.1 El aviso de suspensión

Este componente merece su propia decisión de diseño porque una persona real lo va a leer sobre su propia beca.

No usa rojo. No usa ícono de advertencia. No dice "suspendido" como titular.

Estructura: encabezado neutro con el estado, la materia pendiente identificada con claridad, el paso concreto para volver, y el botón de acción. En piedra y cosecha, con el mismo peso visual que cualquier otro aviso informativo.

> **Tu beca está en pausa**
> 
> Materia pendiente: Cálculo II · período 2026-1
> 
> Para reactivar el apoyo, aprueba la materia y sube el comprobante. El staff lo verifica y los pagos programados se liberan.
> 
> `[ Subir comprobante ]`

Un estado de suspensión sin explicación se vive como castigo arbitrario. Con explicación, es lo que realmente es: una pausa con camino de regreso.

## 7. Diseño página por página

### 7.1 Home

Seis bloques, en este orden, y nada más:

```text
┌──────────────────────────────────────────┐
│ CABECERA                     ES|EN  Portal│
├──────────────────────────────────────────┤
│                                          │
│  HERO                                    │
│  Titular de cambio sostenible            │
│  ~~~~~~ arco trazándose ~~~~~~           │
│                                          │
├──────────────────────────────────────────┤
│  CIFRAS      [23]    [14]    [6]   [31] │
│           becarios comunid. países obras │
│           Actualizado 12 de julio de 2026│
├──────────────────────────────────────────┤
│  MAPA en vista reducida                  │
│                     [ Ver mapa completo ]│
├──────────────────────────────────────────┤
│  ACTIVIDADES RECIENTES                   │
│  ┌────┐  ┌────┐  ┌────┐                 │
│  │ 4:3│  │ 4:3│  │ 4:3│   cada una con  │
│  └────┘  └────┘  └────┘   fecha visible │
├──────────────────────────────────────────┤
│  APRENDE — acceso + próximas tutorías    │
├──────────────────────────────────────────┤
│  INFORME ANUAL MÁS RECIENTE              │
└──────────────────────────────────────────┘
```

La fecha de última actualización bajo las cifras es incómoda a propósito. Si dice "hace once meses", eso es información valiosa para todos, empezando por la fundación.

El hero no lleva una foto de fondo con texto encima. Lleva el titular en Archivo Expanded sobre niebla, con el arco trazándose debajo. La primera cosa que se ve es la tesis, no un banco de imágenes.

### 7.2 Impacto — mapa completo

Mapa a pantalla casi completa, filtros arriba, contador sobre el mapa, panel lateral que entra desde la derecha en escritorio y desde abajo en móvil. En móvil el mapa ocupa 60% de la altura y el panel es una hoja deslizable.

### 7.3 Historias — el mural

Rejilla estricta de tres columnas en escritorio, dos en tableta, una en móvil. Sin masonry: alturas irregulares se ven peor en pantallas pequeñas y complican la carga progresiva.

Cada tarjeta: imagen 4:3, fecha en mono arriba del título, título en display, etiquetas de comunidad y programa abajo.

Filtros por comunidad y programa. Paginación numerada, no scroll infinito — el scroll infinito impide volver a un artículo y castiga las conexiones lentas.

### 7.4 Artículo

Columna única, 68 caracteres, sin barra lateral. Encabezado con fecha, comunidad y programa. Galería al pie. Enlaces al final hacia la comunidad y el proyecto relacionados.

### 7.5 Ficha de comunidad

Es el nodo del sistema. Nombre, distrito, corregimiento, coordenadas en mono, mapa pequeño, y luego: becarios (según consentimiento), proyectos, actividades y necesidades pendientes.

### 7.6 Aprende

Tres accesos —Biblioteca, Tutorías, Prácticas— y debajo las próximas tutorías con fecha y sede. La biblioteca filtra por nivel y materia sin recargar la página. Cada recurso muestra su licencia en la tarjeta, no oculta en el detalle.

### 7.7 Portal

Deliberadamente sobrio. Al iniciar sesión: estado de la beca, próximo desembolso, progreso de labor social, y avisos pendientes. Sin gráficos innecesarios.

## 8. Diseño del panel de administración

Aquí se gana o se pierde el proyecto. El requisito de publicar en menos de tres minutos no se cumple en el sitio público: se cumple en este formulario. Payload permite configurar el panel casi por completo, y no hacerlo es desperdiciar la mitad de la herramienta.

### 8.1 El formulario de Actividad

El orden de los campos importa porque el staff llega desde la galería del teléfono, con las fotos ya tomadas.

1. **Fotos** ← primero, es de donde viene el usuario
2. **Título**
3. **Comunidad** ← selector, no texto libre
4. **Programa** ← predeterminado al último usado
5. **Fecha** ← predeterminada a hoy
6. **Texto**
---
*▸ Avanzado (plegado): slug, extracto, SEO, destacada, proyecto*

Presupuesto de los tres minutos:

```text
Subir 3 fotos desde el teléfono      ~60 s
Escribir el título                   ~20 s
Comunidad y programa                 ~15 s
Fecha (ya viene puesta)                0 s
Escribir dos párrafos                ~70 s
Publicar                              ~5 s
                                    ─────
                                     ~170 s
```

El margen es de diez segundos. Cualquier campo obligatorio adicional lo rompe.

### 8.2 Reglas del panel

- Interfaz en español; inglés disponible en el selector
- Etiquetas escritas para el staff, no para el programador: "Comunidad donde ocurrió", no `community_id`
- `admin.description` en todo campo que no sea evidente
- `admin.useAsTitle` y `admin.defaultColumns` en cada colección, para que los listados sean legibles
- Colecciones agrupadas en el menú lateral: Contenido · Territorio · Aprendizaje · Becarios · Sistema
- Campos técnicos (slug, SEO, orden) plegados o en la barra lateral, nunca en el flujo principal
- Valores por defecto en todo lo que se pueda predecir
- Vista previa en vivo activada para Actividades
- Panel probado en un teléfono real, no en el emulador del navegador

### 8.3 Componente de inicio del panel

Un `beforeDashboard` propio con exactamente dos elementos:

```text
┌────────────────────────────────────────┐
│  Última publicación: hace 4 días       │
│                                        │
│         [ Publicar actividad ]         │
└────────────────────────────────────────┘
```

El contador de días desde la última publicación es la métrica que predice si esta plataforma sobrevive. Ponerla donde el staff la ve cada vez que entra es la intervención de diseño más barata y más efectiva de todo el proyecto.

## 9. Responsive

Móvil primero, sin excepción. El staff publica desde el teléfono y la comunidad lee desde el teléfono.

| Punto de quiebre | Ancho | Cambio |
| --- | --- | --- |
| Base | 360px | Una columna, navegación desplegable |
| sm | 640px | Dos columnas en el mural |
| lg | 1024px | Tres columnas, navegación horizontal, panel del mapa lateral |
| xl | 1280px | Ancho máximo del contenedor: 1200px |

- [ ] Probado a 360px de ancho, que es donde vive la audiencia real
- [ ] Probado en conexión móvil de Coclé, no en simulación de red

## 10. Entregables e implementación

### Diseño
- [ ] Logo en SVG, tres variantes, más favicon y `og:image`
- [ ] Tokens definidos como variables CSS en un solo archivo
- [ ] Los 38 componentes construidos y documentados
- [ ] Textos de estados vacíos y errores redactados en ambos idiomas antes de programarlos

### Implementación
- [ ] Tailwind configurado con los tokens; ningún color escrito a mano en un componente
- [ ] Fuentes por `next/font`, subconjunto latino, `display: swap`
- [ ] Verificación de contraste automatizada en CI
- [ ] `prefers-reduced-motion` respetado en el mapa y el hero

### Validación
- [ ] Prueba con un miembro real del staff publicando desde su propio teléfono, cronometrada
- [ ] Prueba con un estudiante buscando un recurso de su nivel
- [ ] Lighthouse móvil ≥ 90 en rendimiento y accesibilidad

## 11. Autocrítica

Tres cosas que este documento decidió y que conviene poder defender:

1. **Tres familias tipográficas es una de más para un presupuesto de 500 KB.** Se sostiene porque el mono cumple una función semántica —marcar el dato verificable— y no decorativa. Si en la medición real no cabe, cae Source Serif 4 y el cuerpo pasa a la pila del sistema.

2. **Sin sombras y con radio de 4px roza el minimalismo genérico.** Se compensa con el arco y con el peso de la fotografía documental. Si al construirlo se siente plano, el ajuste correcto es dar más aire y más tamaño a las imágenes, no agregar elevación.

3. **El arco puede volverse un tic.** Por eso está limitado a tres apariciones por escrito. Vale la pena releer esta regla cuando se esté construyendo, porque la tentación de repetirlo va a aparecer.

*Documento de diseño — sujeto a revisión durante la construcción.*
