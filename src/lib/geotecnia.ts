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

// Los bloques del arco. La taxonomía de subsecciones es temática y no coincide
// con el orden en que la serie se construye: el bloque 1 atraviesa cuatro
// subsecciones, y `fundamentos` reaparece en el 2. Por eso el recorrido se
// declara acá, y no se deduce ni de la fecha ni de la subsección.
export const BLOQUES = [
  {
    n: 1,
    label: 'La zapata superficial',
    range: [1, 7] as const,
    description:
      'De dónde sale q_adm y por qué son dos criterios y no uno. Cada nota mide cuánto mueve el resultado un parámetro, y la última los cobra todos en un ejemplo completo.',
  },
  {
    n: 2,
    label: 'El origen de los parámetros',
    range: [8, 8] as const,
    description:
      'La vuelta atrás: de dónde salen físicamente los números que el bloque anterior usó como dato. El puente entre el terreno y el cálculo.',
  },
  {
    n: 3,
    label: 'El suelo de costado',
    range: [9, 10] as const,
    description:
      'Hasta acá el suelo sostenía; ahora empuja. Los tres coeficientes según cuánto se mueva la estructura, y el muro que hay que verificar por tres caminos.',
  },
  {
    n: 4,
    label: 'Fundaciones profundas',
    range: [11, 12] as const,
    description:
      'Cuando la zapata no alcanza. La capacidad se reparte entre punta y fuste, y los dos términos no se movilizan al mismo tiempo.',
  },
] as const;

export async function getAllGeotecniaPosts() {
  const posts = await getCollection('geotecnia', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

// El arco de lectura, en el orden en que se construye. Es el que usan las
// páginas de subsección y la ruta de lectura: para una serie didáctica, el
// orden cronológico inverso deja al lector entrando por el final.
export async function getGeotecniaSeries() {
  const posts = await getCollection('geotecnia', ({ data }) => !data.draft);
  return posts.sort(
    (a, b) => (a.data.order ?? Infinity) - (b.data.order ?? Infinity)
  );
}

export async function getGeotecniaPostsBySubsection(subsection: string) {
  const posts = await getGeotecniaSeries();
  return posts.filter((post) => post.data.subsection === subsection);
}
