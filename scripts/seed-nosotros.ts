// Carga el contenido real de /nosotros extraído del WordPress viejo
// (ForumOldPageInfo/acerca-de-nosotros). Uso único — correr y borrar,
// mismo espíritu que migrate-wordpress.ts.
//
// Uso: pnpm tsx --env-file=.env scripts/seed-nosotros.ts
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import config from '../src/payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const fotosDir = path.resolve(dirname, '../ForumOldPageInfo/acerca-de-nosotros')

function parrafosLexical(parrafos: string[]) {
  return {
    root: {
      type: 'root',
      children: parrafos.map((texto) => ({
        type: 'paragraph',
        children: [{ type: 'text', text: texto, version: 1 }],
        direction: null,
        format: '' as const,
        indent: 0,
        version: 1,
      })),
      direction: null,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

async function subirFoto(payload: Awaited<ReturnType<typeof getPayload>>, archivo: string, altEs: string, altEn: string) {
  const ruta = path.join(fotosDir, archivo)
  const buffer = fs.readFileSync(ruta)
  const mimetype = archivo.endsWith('.png') ? 'image/png' : 'image/jpeg'
  const doc = await payload.create({
    collection: 'media',
    data: { alt: altEs },
    file: { data: buffer, mimetype, name: archivo, size: buffer.length },
    overrideAccess: true,
  })
  await payload.update({ collection: 'media', id: doc.id, data: { alt: altEn }, locale: 'en', overrideAccess: true })
  return doc.id
}

const MISION_ES = [
  'Fundada en 2006 por John Keffer, somos una organización sin fines de lucro dedicada a apoyar el desarrollo comunitario en el norte de Coclé.',
  'Nuestro apoyo ayuda a ampliar el acceso a oportunidades de aprendizaje en la Coclé rural, brindando el respaldo y las herramientas que las comunidades pueden usar para construir un futuro más próspero.',
  'Trabajamos junto a las comunidades para que el cambio sea significativo y sostenible.',
  'Somos una organización neutral, independiente e imparcial, dedicada a brindar apoyo educativo a las comunidades de la Coclé rural.',
  'Promover la alfabetización digital y cultivar el aprendizaje de por vida son fundamentales para el éxito y el cambio sostenible.',
  'El cambio debe ser sostenible.',
]

const MISION_EN = [
  'Established in 2006 by John Keffer, we are a non-profit organization dedicated to supporting community development in Northern Cocle.',
  'Our support helps expand and increase access to learning opportunities in rural Cocle, by providing the support and tools communities can use to build a more prosperous future.',
  'We work together with communities to make change meaningful and sustainable.',
  'We are a neutral, independent, impartial, non-profit organization, providing learning support to the communities of rural Cocle.',
  'Promoting digital literacy and cultivating life-long learning are fundamental for success and sustainable change.',
  'Change should be sustainable.',
]

const HISTORIA_ES = [
  'Forum Foundation fue fundada en 2006 por John Keffer. Desde su creación, ha tenido un impacto significativo gracias a su dedicación a proyectos educativos y al desarrollo comunitario en la provincia central de Coclé, República de Panamá.',
  'La idea de la fundación nació en 1966, cuando John era voluntario del Cuerpo de Paz en El Caimito. Allí desarrolló, junto al profesor Rubén Darío Carles —entonces Ministro de Agricultura, Comercio e Industria—, la primera cooperativa agrícola de propiedad completamente campesina. En sus regresos a la zona, John se convenció de que ese trabajo había insuflado nueva vida a la comunidad, además de un espíritu de confianza propia y determinación para seguir mejorando.',
  'La Fundación empezó trabajando junto a líderes comunitarios en las montañas de Coclé para definir las necesidades centrales de las zonas rurales y desarrollar las formas más prácticas de atenderlas. Entre las principales: la ampliación y mejora de escuelas secundarias y centros de salud pública de la región.',
  'En colaboración con el Ministerio de Educación de Panamá (MEDUCA), se contrataron más maestros, se compraron buses escolares nuevos y se instalaron computadoras. La Fundación también inició cursos de educación para adultos en cada comunidad donde se instalaron computadoras, ayudando a difundir la alfabetización digital.',
  'También se construyeron dormitorios para estudiantes que de otra forma no podrían asistir por la distancia del viaje. A medida que avanzaba el trabajo, la Fundación se acercó a familias y estudiantes que necesitaban apoyo para asistir a la escuela, otorgando becas y ayuda financiera para completar la educación secundaria.',
  'En 2012, la Fundación inició un programa de becas de intercambio con la Hun School de Princeton, Nueva Jersey. El programa dio a los estudiantes la oportunidad de mejorar su inglés, conocer otras culturas y prepararse para la exigencia académica de la universidad.',
  'Tres años después, la Fundación creó la Academia Forum: el primer colegio de Bachillerato Internacional sin fines de lucro y de financiamiento privado, que dio a estudiantes de la región montañosa de Coclé la oportunidad única de recibir educación de clase mundial en sus últimos tres años de secundaria.',
  'Comprometida con el cambio sostenible, la Fundación comenzó a ofrecer ayuda financiera, alojamiento y acompañamiento para que los graduados de la Academia, así como de escuelas locales, continuaran sus estudios en la universidad.',
  'Lamentablemente, la Academia Forum cerró tras la suspensión del año escolar 2020 por la pandemia de COVID-19. Aun así, la esperanza continuó: Forum Foundation trasladó sus operaciones a El Caimito, donde el apoyo de la Fundación sigue ayudando a que más estudiantes terminen la secundaria y la universidad.',
  'En 2018, la Academia Forum y Elvia Martínez fueron nominadas a los premios Héroes por Panamá de TVN. Forum Foundation agradece a Castalia Pascual por su apoyo, así como a TVN y a todos quienes votaron por considerar nuestra pasión por la educación y el cambio sostenible para este reconocimiento.',
]

const HISTORIA_EN = [
  'Forum Foundation was established in 2006 by John Keffer. Since its inception, Forum Foundation has had a significant impact through its dedication to educational projects and community development in the central province of Coclé, in the Republic of Panama.',
  'The idea of the Foundation originated in 1966 when John was a Peace Corps volunteer in Caimito. There he developed, in collaboration with Prof. Ruben Dario Carles, then the Minister of Agriculture, Trade, and Industry, the first agricultural cooperative owned completely by farmers. With return trips to the area, John became convinced that the work had helped breathe new life into the community, as well as instilled a spirit of self-confidence and determination to carry out further improvement.',
  'The Foundation began by working with community leaders in the mountains of Coclé to define the core needs of rural areas and to develop the most practical means of meeting those needs. Paramount among these are the expansion and improvement of secondary schools and public health centers in the region.',
  'Working with Panama’s Ministry of Education (MEDUCA), additional teachers have been hired, new school buses purchased, and computers installed. The Foundation also started adult education courses in every community that computers were installed, helping spread computer literacy skills in the communities.',
  'Dormitories were also built for students who might otherwise not attend because of distant journeys. As the work continued, the Foundation reached out to families and students in need of support to attend school, granting scholarships and financial support for students to complete their secondary education.',
  'In 2012, the Foundation began a study abroad scholarship program with the Hun School of Princeton, New Jersey. The program gave students the opportunity to improve their English, experience world cultures, and prepare for the academic rigor of university.',
  'Three years later the Foundation created the Forum Academy. The first privately funded, non-profit International Baccalaureate school, the Academy gave students from the mountainous region of Cocle the unique opportunity to receive a world-class education for the final three years of high school.',
  'Committed to sustainable change, the Foundation started offering financial assistance, housing, and guidance for graduates from the Academy as well as local schools to continue their education by attending university.',
  'Unfortunately, the Forum Academy closed after the 2020 school year was suspended due to the COVID-19 pandemic. Still hope remained, as Forum Foundation moved operations to Caimito, where Foundation support continues to help maximize the number of students finishing high school and university.',
  'In 2018, Forum Academy and Elvia Martinez were nominated for TVN’s Heroes por Panama Awards. Forum Foundation thanks Castalia Pascual for her support, as well as TVN and all who voted for taking our passion for education and sustainable change into consideration for these awards.',
]

type MiembroSeed = {
  archivo: string
  bioEs: string
  bioEn: string
  cargoEs: string
  cargoEn: string
  destacado?: boolean
  nombre: string
  orden: number
}

const EQUIPO: MiembroSeed[] = [
  {
    archivo: 'JOhn-B-and-W.jpeg',
    nombre: 'John Keffer',
    cargoEs: 'Presidente',
    cargoEn: 'President',
    destacado: true,
    orden: 1,
    bioEs:
      'En 2006, John fundó Forum Foundation, dedicada por completo a proyectos educativos en el interior del país en colaboración con el Ministerio de Educación de Panamá. La idea de la fundación nació en 1966, cuando John era voluntario del Cuerpo de Paz. El trabajo de hoy se apoya en ese mismo espíritu de contribución y determinación por mejorar la comunidad que creció durante esos años.',
    bioEn:
      'In 2006 John established Forum Foundation which, in local collaboration with Panama’s Ministry of Education, is wholly dedicated to educational projects in the central country. The idea for the foundation originated in 1966, when John was a Peace Corps volunteer. Today’s efforts build on the same spirit of contribution and determination to achieve community improvement that grew during those Peace Corps years.',
  },
  {
    archivo: 'Edward2.jpg',
    nombre: 'Janet Robinson',
    cargoEs: 'Vicepresidenta',
    cargoEn: 'Vice President',
    orden: 2,
    bioEs:
      'Janet comenzó a trabajar con John y Forum Foundation en 2008. Su misión fue ayudar a hacer crecer y formalizar el trabajo de la Fundación en Coclé. Junto con Elvia, Omaira y John, creó y puso en marcha los primeros programas de alcance comunitario en el norte de Coclé. Al igual que John, Janet sirvió en el Cuerpo de Paz en Coclé, Panamá, entre 1966 y 1968, tras graduarse de Kansas State University. Tiene una maestría de la Universidad de Arizona y ha trabajado extensamente en administración educativa y temas de la mujer.',
    bioEn:
      'Janet began working with John and Forum Foundation in 2008. Her mission was to help grow and formalize Forum Foundation efforts in Cocle. Working together with Elvia, Omaira and John, they created and launched the first community outreach programs in northern Cocle. Like John, Janet served in the Peace Corps in Coclé, Panama from 1966-1968 after graduating from Kansas State University. Janet holds a masters degree from the University of Arizona and has worked extensively in the fields of education administration and women’s issues.',
  },
  {
    archivo: 'Omaira-B.jpeg',
    nombre: 'Omaira Martínez',
    cargoEs: 'Jefa de Operaciones y Finanzas',
    cargoEn: 'Head of Operations & Finance',
    orden: 3,
    bioEs:
      'Profesora de tiempo completo en la Universidad de Panamá, Omaira dedica su tiempo libre a ser un pilar de las operaciones de Forum Foundation. Su liderazgo ha guiado los programas de la Fundación en las montañas de Coclé desde sus inicios. Su experiencia y criterio ayudan a que los fondos y recursos lleguen al mayor número posible de estudiantes. Su convicción de ayudar a las comunidades a construir un futuro sostenible es inquebrantable.',
    bioEn:
      'A full-time university professor at University of Panama, Omaira spends her free time as a cornerstone of Forum Foundation operations. Her leadership has helped shepherd Forum Foundation programs in the mountains of Cocle since their inception. Omaira’s expertise and guidance help ensure funds and resources are able to help as many students as possible. Her conviction to helping communities build a sustainable future is unwavering no matter what challenges may arise.',
  },
  {
    archivo: 'IMG_10201.jpg',
    nombre: 'Elvia Martínez',
    cargoEs: 'Jefa de Programas',
    cargoEn: 'Head of Programs',
    orden: 4,
    bioEs:
      'Miembro fundadora de la Fundación Academia Forum, Elvia ha sido parte de los programas de Forum Foundation en Coclé desde sus inicios. Su profundo arraigo en la comunidad de El Caimito, donde comenzaron nuestros programas, orienta el trabajo de alcance comunitario. Elvia no solo es un ejemplo a seguir: también es una apasionada del cambio a través del desarrollo comunitario y está dedicada a crear oportunidades educativas para las próximas generaciones.',
    bioEn:
      'A founding member of Fundacion Academia Forum, Elvia has been a part of Forum Foundation programs in Cocle since their inception. Her deep-rooted ties to her community of Caimito, where our programs first started, help guide our community outreach programs. Elvia is not only an excellent example to follow, she is also passionate about exacting change through community development and dedicated to creating educational opportunities for generations to come.',
  },
  {
    archivo: 'Sandra-FF.jpg',
    nombre: 'Sandra Rodríguez',
    cargoEs: 'Coordinadora del Centro Comunitario',
    cargoEn: 'Community Center Coordinator',
    orden: 5,
    bioEs:
      'Sandra se unió a Forum Foundation en 2015. Comenzó apoyando en limpieza y supervisión de estudiantes en la Academia Forum, y recibió un ascenso en 2017. Con su título en Trabajo Social de la Universidad de Panamá en Penonomé y sus vínculos con las comunidades cercanas, Sandra es clave para ayudar a identificar a los estudiantes que reciben apoyo de la Fundación. Aspira a seguir contribuyendo a que los estudiantes tengan los recursos que necesitan para salir adelante.',
    bioEn:
      'Sandra joined the Forum Foundation Family in 2015. After starting out helping with cleaning and supervising students at the Forum Academy, she received a promotion in 2017. Supported by her degree in Social Work from the University of Panama in Penonome and her connections to the surrounding communities, Sandra is fundamental in helping recruit students who receive support from Forum Foundation. As part of the team, she aspires to continue contributing to making the world a better place, helping students with the resources they need to be successful.',
  },
  {
    archivo: 'Iris-Blaitez.jpg',
    nombre: 'Iris Blaitez',
    cargoEs: 'Asistente Administrativa',
    cargoEn: 'Administrative Assistant',
    orden: 6,
    bioEs:
      'Iris se unió a Forum Foundation en 2015 como parte del equipo administrativo de la Academia Forum. Es una pieza clave del equipo: ayuda a gestionar la documentación y los reportes financieros de la Fundación para que los estudiantes reciban el apoyo que necesitan. Más allá de sus tareas iniciales, sigue creciendo como profesional, brindando a los estudiantes el acompañamiento necesario para un mejor futuro.',
    bioEn:
      'Iris joined Forum Foundation in 2015 as part of the Forum Academy administrative team. She is an essential part of the team, helping manage the Foundation’s documentation and financial reports, to ensure students receive the support they need to be successful. Beyond her initial duties as an administrative assistant, Iris continues to grow as a professional, helping provide students with the support and guidance for a brighter future.',
  },
  {
    archivo: 'Berta-Rivera-web-modified-e1658842594470.jpg',
    nombre: 'Berta Rivera',
    cargoEs: 'Oficial de Programa',
    cargoEn: 'Program Officer',
    orden: 7,
    bioEs:
      'Berta se unió por primera vez a Forum Foundation en 2018, ayudando a distribuir fondos de becas a estudiantes universitarios. Luego completó sus estudios en Logística y Transporte Multimodal en la Universidad Tecnológica. Regresó en 2022 como Oficial de Programa, apoyando a los estudiantes con acompañamiento personalizado y en sus solicitudes de becas universitarias. Habiendo sido ella misma becaria, el amor de Berta por aprender es contagioso — un ejemplo inspirador para los jóvenes que apoyamos.',
    bioEn:
      'Berta first joined Forum Foundation in 2018 helping distribute scholarship funds to students enrolled in University. She then went on to complete her studies at the Universidad Tecnologica in Multimodal Logistics and Transportation. Berta returned in 2022, as Program Officer. She helps students with personalized learning support, as well as apply to university scholarships. Having been a scholarship beneficiary herself, Berta’s love of learning is contagious. She is an inspiring example for the young people we support.',
  },
]

async function main() {
  const payload = await getPayload({ config })

  const existente = await payload.findGlobal({ slug: 'nosotros' })
  if (existente.mision) {
    console.log('El global Nosotros ya tiene contenido — no se sobrescribe. Borralo primero si querés re-sembrar.')
  } else {
    await payload.updateGlobal({
      slug: 'nosotros',
      data: { mision: parrafosLexical(MISION_ES), historia: parrafosLexical(HISTORIA_ES) },
      overrideAccess: true,
    })
    await payload.updateGlobal({
      slug: 'nosotros',
      data: { mision: parrafosLexical(MISION_EN), historia: parrafosLexical(HISTORIA_EN) },
      locale: 'en',
      overrideAccess: true,
    })
    console.log('Global Nosotros cargado (es + en).')
  }

  const actual = await payload.findGlobal({ slug: 'nosotros', overrideAccess: true })
  if (!actual.foto || !actual.logo) {
    const fotoId = await subirFoto(payload, 'DSC06238-scaled.jpg', 'Equipo de Forum Foundation', 'Forum Foundation team')
    const logoId = await subirFoto(payload, 'Foundation-Logo-2-2015.png', 'Logo de Forum Foundation', 'Forum Foundation logo')
    await payload.updateGlobal({ slug: 'nosotros', data: { foto: fotoId, logo: logoId }, overrideAccess: true })
    console.log('Fotos de Nosotros cargadas.')
  }

  const yaExisten = await payload.find({ collection: 'equipo', limit: 1, overrideAccess: true })
  if (yaExisten.docs.length > 0) {
    console.log('Ya hay miembros de Equipo cargados — no se duplica. Borralos primero si querés re-sembrar.')
    process.exit(0)
  }

  for (const m of EQUIPO) {
    const fotoId = await subirFoto(payload, m.archivo, `${m.nombre} — Forum Foundation`, `${m.nombre} — Forum Foundation`)
    const doc = await payload.create({
      collection: 'equipo',
      data: { nombre: m.nombre, cargo: m.cargoEs, bio: m.bioEs, foto: fotoId, destacado: m.destacado ?? false, orden: m.orden },
      overrideAccess: true,
    })
    await payload.update({ collection: 'equipo', id: doc.id, data: { cargo: m.cargoEn, bio: m.bioEn }, locale: 'en', overrideAccess: true })
    console.log('Creado:', m.nombre)
  }

  console.log('Listo.')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
