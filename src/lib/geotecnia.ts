import { getCollection } from 'astro:content';

// A diferencia de hormigón y acero, acá no hay una norma que entregue el número:
// hay teoría, correlaciones y un informe de mecánica de suelos. El campo `norm`
// se usa para declarar la FUENTE (autor + edición), que en geotecnia cumple el
// mismo papel de trazabilidad que la cláusula en ACI o AISC.
export const SUBSECTIONS = {
  fundamentos: {
    label: 'Fundamentos',
    norm: 'Das, 4ª ed.',
    description:
      'De dónde salen los números del informe de mecánica de suelos: los dos criterios que fijan la presión admisible, el principio de tensión efectiva y por qué q_adm no es una propiedad del suelo.',
  },
  'capacidad-soporte': {
    label: 'Capacidad de soporte',
    norm: 'Das, 4ª ed.',
    description:
      'La falla por corte del suelo bajo una fundación: la ecuación de tres términos, los métodos que compiten (Terzaghi, Meyerhof, Vesić), los factores de forma, profundidad e inclinación, el nivel freático y el factor de seguridad.',
  },
  asentamientos: {
    label: 'Asentamientos',
    norm: 'Das, 4ª ed.',
    description:
      'El otro criterio, y a menudo el que gobierna: asentamiento elástico, consolidación primaria y secundaria, la historia de tensiones (OCR) y el tiempo que tarda en ocurrir.',
  },
  'empujes-y-muros': {
    label: 'Empujes y muros',
    norm: 'Das, 4ª ed.',
    description:
      'El suelo visto de costado: cuánto empuja horizontalmente contra una estructura de contención. Los estados activo, en reposo y pasivo, las teorías de Rankine y Coulomb, y las tres verificaciones de un muro.',
  },
  'fundaciones-profundas': {
    label: 'Fundaciones profundas',
    norm: 'Das, 4ª ed.',
    description:
      'Cuando la zapata no alcanza: pilotes y pozos perforados. La capacidad se reparte entre punta y fuste, pero los dos términos no se movilizan al mismo tiempo — y eso cambia el diseño.',
  },
  ejemplos: {
    label: 'Ejemplos de cálculo',
    norm: 'Das, 4ª ed.',
    description:
      'Ejemplos trabajados paso a paso, con la referencia del método en cada ecuación y un análisis de sensibilidad al cierre: en geotecnia el error no está en la fórmula, está en los parámetros de entrada.',
  },
} as const;

export type SubsectionKey = keyof typeof SUBSECTIONS;

export async function getAllGeotecniaPosts() {
  const posts = await getCollection('geotecnia', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getGeotecniaPostsBySubsection(subsection: string) {
  const posts = await getAllGeotecniaPosts();
  return posts.filter((post) => post.data.subsection === subsection);
}
