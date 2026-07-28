# Guion de entrevista al staff — Fase 0

Insumo requerido en [02-plan-de-ejecucion.md](../../02-plan-de-ejecucion.md): "Entrevista con el staff que publicará: qué publican, con qué frecuencia, desde qué dispositivo". Define el diseño del formulario de Actividad y el presupuesto de 3 minutos ([04-diseno-y-sistema-visual.md §8.1](../../04-diseno-y-sistema-visual.md)).

**Duración sugerida:** 30-40 min. Idealmente con la persona que efectivamente va a publicar día a día, no solo con la directiva.

## 1. Dispositivo y contexto real

1. ¿Desde qué dispositivo publicarías normalmente — teléfono, computadora, ambos? ¿Qué modelo/gama de teléfono usas?
2. ¿Tienes conexión estable donde trabajas, o es intermitente?
3. ¿Cuándo tomas las fotos — el mismo día del evento o después? ¿Las editas antes de subirlas?

## 2. Frecuencia y contenido real

4. En un mes típico, ¿cuántas actividades/eventos crees que valdría la pena publicar?
5. ¿Qué tipo de contenido publicarías más seguido: entregas de infraestructura, tutorías, visitas, becarios, otros?
6. Del sitio actual (WordPress), ¿qué artículos recuerdas que costó mucho publicar? ¿Por qué?

## 3. El flujo de publicación

7. Camina conmigo paso a paso: si hoy tuvieras que subir una actividad con 3 fotos, ¿qué información tendrías lista de inmediato y qué tendrías que ir a buscar?
8. ¿Sabrías de inmediato en qué comunidad y programa clasificar la actividad, o tendrías que preguntar?
9. ¿Escribes fácil en español? ¿Necesitarías ayuda para el texto en inglés, o eso lo resuelve otra persona?

## 4. Fricciones anteriores (WordPress/Elementor)

10. ¿Qué fue lo que hizo que se dejara de publicar en el sitio actual? (sin culpar a nadie — es diagnóstico, no evaluación)
11. ¿Hubo algún paso del proceso anterior que directamente evitabas o pedías que otra persona hiciera?

## 5. Expectativas sobre el panel nuevo

12. Si pudieras pedir una sola cosa para que publicar sea más fácil, ¿cuál sería?
13. ¿Prefieres que los campos avanzados (SEO, slug, destacada) estén siempre visibles o escondidos hasta que los necesites?
14. ¿Quién más en la fundación publicaría contenido? ¿Todos con el mismo nivel de comodidad tecnológica?

## 6. Cierre

15. ¿Hay algo de este proceso que no te haya preguntado y que creas importante?

---

## Qué hacer con las respuestas

- Ajustar el orden de campos del formulario de Actividad en `04-diseno-y-sistema-visual.md §8.1` si el flujo real difiere del asumido (fotos → título → comunidad → programa → fecha → texto).
- Si el presupuesto de 3 minutos no es realista para esta persona en particular, es una señal temprana — mejor saberlo en Fase 0 que después del lanzamiento.
- Documentar aquí mismo, debajo de esta línea, un resumen de la entrevista real una vez realizada.

## Resumen de la entrevista (realizada)

**Dispositivo y contexto:** teléfonos de gama media y computadoras de oficina de buen rendimiento; conexión a Internet estable en el lugar de trabajo. Fotos tomadas el mismo día del evento, revisadas antes de publicar.

**Volumen real:** ~20 actividades/mes (entregas de infraestructura, tutorías, visitas, becarios, otras iniciativas). Es un volumen sostenido, no esporádico — confirma que paginación y filtros del mural ([04-diseno-y-sistema-visual.md §7.3](../../04-diseno-y-sistema-visual.md)) son necesarios desde el lanzamiento, no una optimización futura.

**Flujo de publicación:** la información (fotos + descripción) suele estar lista de inmediato; identifican sin dificultad la comunidad y el programa de cada actividad. Cómodos redactando en español; **necesitan apoyo para inglés** — confirma el nivel "opcional, con traducción asistida revisada por el staff" para noticias del día a día ([01-documento-de-proyecto.md §11](../../01-documento-de-proyecto.md)).

**Por qué dejó de publicarse el sitio actual — hallazgo clave:** no fue solo fricción de UI. **Solo el creador original de WordPress tenía conocimiento y control del sitio**, y al dejar de estar activo en la organización, publicar dependió por completo de una sola persona ajena al staff. Esto es evidencia real, no hipotética, de exactamente el riesgo que el proyecto ya identificó como "mantenedor único" ([01-documento-de-proyecto.md §14](../../01-documento-de-proyecto.md)) y como amenaza humana en [05-ciberseguridad.md §10](../../05-ciberseguridad.md) ("ex miembro del staff, cuenta activa después de irse"). Refuerza por qué el modelo de IAM da CRUD de contenido a **cualquier staff**, no a un admin único, y por qué ninguna cuenta debe ser personal ([docs/fase-0/accesos.md](accesos.md)).

**Otros publicadores:** varios miembros del staff publicarán, todos con nivel de comodidad tecnológica similar — no hay un usuario "avanzado" ni uno que necesite una versión simplificada aparte.

## ⚠️ Tensión de diseño detectada: campos avanzados

El staff pidió explícitamente que **los campos avanzados permanezcan siempre visibles** para tener "mayor control y visibilidad durante la edición" — lo opuesto a lo que definía [04-diseno-y-sistema-visual.md §8.1](../../04-diseno-y-sistema-visual.md), donde slug, extracto, SEO, `destacada` y proyecto quedaban plegados bajo "▸ Avanzado".

**Resolución aplicada** (ver diff en el documento 04): se separan dos grupos dentro de "avanzado" en lugar de tratarlo como un bloque único:

- **Siempre visibles** (el staff los usa para decidir, no son técnicos): `destacada`, `proyecto`, `extracto`
- **Siguen plegados** (puramente técnicos, el staff no los mencionó): slug, metadatos SEO

Esto respeta el pedido real de control sin reventar el presupuesto de 3 minutos con campos que nadie va a tocar. Si en la práctica el staff también quiere ver SEO/slug, ajustar de nuevo — es una hipótesis basada en la entrevista, no un hecho verificado con el panel real.
