# Formulario de consentimiento de imagen y datos — Forum Foundation

> Borrador bilingüe para revisión legal. Es el entregable requerido en [01-documento-de-proyecto.md §8](../../01-documento-de-proyecto.md) y el punto crítico del cronograma según [docs/plan.md](../plan.md). **No sustituye asesoría legal panameña** — debe validarse contra la Ley 81 de 2019 antes de imprimirse o firmarse.

Aplica a dos poblaciones distintas, con dos versiones del formulario:

- **A. Becarios** (mayores de edad) — consentimiento propio
- **B. Acudientes de menores** fotografiados en Actividades — consentimiento del adulto responsable

---

## A. Consentimiento del becario (ES)

**Formulario de Consentimiento de Imagen y Datos Personales**
**Forum Foundation**

Yo, _______________________________________________, con cédula/identificación número _______________________, becario(a) del programa Becas John Y. Keffer de Forum Foundation, declaro lo siguiente:

**1. Qué autorizo a publicar**

Marque únicamente lo que autoriza. Cada campo es independiente y puede autorizar unos y otros no.

- [ ] Mi nombre completo
- [ ] Mi fotografía
- [ ] Mi comunidad de origen (Coclé norte)
- [ ] La universidad y carrera que curso
- [ ] Una cita textual mía o un fragmento de mi historia personal

**2. Dónde se publica**

Entiendo que esta información aparecerá en el sitio web público de Forum Foundation (forum-foundation.org), incluyendo el Mapa de Impacto, en español e inglés, visible para cualquier persona con acceso a internet.

**3. Lo que NO se publica nunca, autorice o no**

Entiendo que Forum Foundation nunca hace públicos, bajo ninguna circunstancia: mi condición socioeconómica, mi estado de beca (activo, en pausa, etc.), mi domicilio exacto (solo el centroide de mi comunidad), ni información de contacto personal.

**4. Mi derecho a revocar**

Entiendo que puedo retirar este consentimiento en cualquier momento, sin dar explicación y sin que afecte mi beca, desde mi Portal del Becario o solicitándolo por escrito a Forum Foundation. Al revocarlo, mi información se retira del sitio público en un plazo razonable.

**5. Vigencia**

Este consentimiento es válido desde su firma hasta que yo lo revoque expresamente.

Firma: _________________________ Fecha: _______________

Nombre en letra de molde: _________________________

---

## A. Scholar Consent Form (EN)

**Image and Personal Data Consent Form**
**Forum Foundation**

I, _______________________________________________, ID/passport number _______________________, a scholar in Forum Foundation's John Y. Keffer Scholarship program, declare the following:

**1. What I authorize for publication**

Check only what you authorize. Each item is independent — you may authorize some and not others.

- [ ] My full name
- [ ] My photograph
- [ ] My home community (northern Coclé)
- [ ] The university and program I attend
- [ ] A direct quote from me or an excerpt of my personal story

**2. Where it is published**

I understand this information will appear on Forum Foundation's public website (forum-foundation.org), including the Impact Map, in both Spanish and English, visible to anyone with internet access.

**3. What is never published, regardless of my consent**

I understand Forum Foundation never publishes, under any circumstance: my socioeconomic status, my scholarship status (active, paused, etc.), my exact home address (only my community's centroid), or personal contact information.

**4. My right to withdraw**

I understand I may withdraw this consent at any time, without explanation and without affecting my scholarship, through my Scholar Portal or by written request to Forum Foundation. Upon withdrawal, my information is removed from the public site within a reasonable period.

**5. Duration**

This consent is valid from the date of signature until I expressly revoke it.

Signature: _________________________ Date: _______________

Printed name: _________________________

---

## B. Consentimiento del acudiente para fotografías de menores (ES)

**Formulario de Consentimiento — Fotografías de Menores**
**Forum Foundation**

Yo, _______________________________________________, con cédula número _______________________, en calidad de padre/madre/acudiente legal de _______________________________________________ (menor), autorizo a Forum Foundation a:

- [ ] Tomar fotografías del menor durante actividades de la fundación (tutorías, entregas de infraestructura, eventos comunitarios)
- [ ] Publicar dichas fotografías en el sitio web de Forum Foundation y sus redes sociales, sin incluir el nombre completo del menor

Entiendo que el menor **no aparecerá identificado por nombre**, que puedo revocar esta autorización en cualquier momento por escrito, y que Forum Foundation no recolecta ningún otro dato personal del menor.

Firma del acudiente: _________________________ Fecha: _______________
Nombre en letra de molde: _________________________
Parentesco: _________________________

---

## B. Guardian Consent Form — Photographs of Minors (EN)

**Consent Form — Photographs of Minors**
**Forum Foundation**

I, _______________________________________________, ID number _______________________, as parent/legal guardian of _______________________________________________ (minor), authorize Forum Foundation to:

- [ ] Take photographs of the minor during foundation activities (tutoring, infrastructure handovers, community events)
- [ ] Publish said photographs on Forum Foundation's website and social media, without including the minor's full name

I understand the minor **will not be identified by name**, that I may revoke this authorization in writing at any time, and that Forum Foundation does not collect any other personal data about the minor.

Guardian signature: _________________________ Date: _______________
Printed name: _________________________
Relationship: _________________________

---

## Notas de implementación

- Campo en Payload: `Becarios.consentimiento_firmado` (booleano) + `fecha_consentimiento`. `mostrar_en_mapa` no puede activarse sin este campo en `true` — validación a nivel de esquema, no solo advertencia visual ([03-runbook-tecnico.md §6.5](../../03-runbook-tecnico.md)).
- Campo en Payload: `Media.consentimiento_verificado` + `contiene_menores`. Publicar una foto con `contiene_menores = true` exige `consentimiento_verificado = true`.
- Guardar el documento firmado (foto o escaneo) en el bucket privado `forum-docs`, nunca en `forum-media` ([05-ciberseguridad.md §3.4](../../05-ciberseguridad.md)).
- **Antes de usar este borrador:** validarlo con un abogado panameño familiarizado con la Ley 81 de 2019, especialmente las secciones de revocación y retención de datos.
