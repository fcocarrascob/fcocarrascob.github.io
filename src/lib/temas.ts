// Los chips de la barra de filtro (src/components/ui/TemaFilter.astro): el
// vocabulario no se declara en ninguna lista fija, se deduce de lo publicado.
// Así un tema nuevo aparece solo con el primer post que lo declara, y desaparece
// cuando el último se va — que es lo que hace que la sección escale sin tocar
// código.
//
// `Otros` es la bolsa de los posts que no declararon tema, y va al final aunque
// alfabéticamente cayera al medio: no es un tema, es lo que sobra.
export function contarTemas(temas: string[]) {
  return [...new Set(temas)]
    .sort((a, b) => {
      if (a === 'Otros') return 1;
      if (b === 'Otros') return -1;
      return a.localeCompare(b, 'es');
    })
    .map((name) => ({ name, count: temas.filter((t) => t === name).length }));
}
