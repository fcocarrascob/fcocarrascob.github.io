# Verificador de secciones de acero (AISC 360-22 + 341 / NCh2369)

*2026-08-04*

## Problema

Las cuatro planillas de acero publicadas (`viga-ltb`, `columna-galpon-compresion`,
`viga-columna`, `diagonal-hss-traccion`) resuelven **casos concretos**: sus números están
cerrados contra el post con filas *assert* y no se re-parametrizan sin reescribirlas.

Falta la pregunta inversa, que es la que uno se hace primero: *dado este perfil y estas
demandas, ¿pasa? y si no, ¿cuál es el más liviano que sí?*

## Qué hace la herramienta

1. **Capacidad** — perfil + material + longitudes → φPn, φMnx, φMny, φVn, con clasificación
   B4.1 y el estado límite que gobierna cada una.
2. **Demanda** — agrega Pu/Mux/Muy/Vu → usos y H1-1.
3. **Comparador** — corre lo anterior sobre todo el catálogo y lista, ordenados por peso, los
   perfiles que pasan.
4. **Memoria** — arma la hoja de respaldo en `/herramientas/canvas`.

Los tres modos son **el mismo motor**: capacidad es demanda con las demandas en cero y la
interacción oculta.

## Alcance

| | |
|---|---|
| Material | Solo acero. |
| Familias | I doblemente simétrico (laminado + armado), HSS rectangular y circular. |
| Sección | Catálogo + armado libre. |
| Método | LRFD. |
| Sísmico | AISC 341-22 Tabla D1.1 + NCh2369:2025 8.3.1 / 8.6.3 (Tabla 9). |

**Fuera:** hormigón, canales C, ángulos L, secciones monosimétricas o compuestas, ASD,
servicio/deflexiones, diseño de conexiones. `C_b` y `B₁` entran como dato con default
conservador y warning — derivarlos exige el diagrama de momentos, que es del análisis.

## La idea que sostiene el diseño: doble entrada contra las planillas

Las planillas **son el oráculo**. Sus filas `abs(x - valor) < tol` ya fijan las cadenas
E3/E4/E7, F2/F3 y H1-1 a precisión completa. El motor TS se verifica reproduciéndolas, no
inventando casos de prueba:

| Caso | Perfil | Anclas |
|---|---|---|
| `columna-galpon-compresion` | W250×73, A992 | λx=136, F_ex=1083, F_nx=950, **φPn=79,3 tonf**; λy=58, F_ny=2751, 229,7 tonf; F_ez=8100, 245 tonf; J=53,5 cm⁴; λ_rf=13,5, λ_rw=35,9 |
| `viga-ltb` | W460×74 | L_p=177,5 cm, L_r=516 cm, M_p=58,3 tonf·m, C_b=1,136, F_cr=1453, **φMn=19,1 tonf·m**; C_b=1,299 → 50,9 tonf·m |
| `viga-columna` | W250×58 | L_p=2,13 m, L_r=7,38 m, φPn=164,9 tonf, φMn=24,3 tonf·m, B₁=1,34, **H1-1a u=0,94** |
| `diagonal-hss-traccion` | HSS 4×4×¼ | λ_c=58,6, F_e=5864, F_n=2738, **φPn=53,5 tonf**; λ_w=14,2, λ_r=33,7; F_ye=R_y·F_y=4576, λ_md=16,05 |

Y en la otra dirección: la **memoria generada** se escribe a `.json` y se pasa por
`npm run verify:planilla`. Si el motor TS y el motor mathjs discrepan, esa corrida lo grita.

**Consecuencia de orden:** el motor entero se construye y se verifica **sin catálogo**, porque
los cuatro casos declaran sus propiedades tal como hacen los posts. El catálogo es una capa
separable.

## Arquitectura

Motor puro en `src/lib/`, componente tonto en `src/components/` — como `placaBaseChecks.ts` /
`PlacaBaseTool.tsx`. Unidades internas **kgf y cm**; display en tonf y tonf·m.

`CheckResult` sale de `placaBaseChecks.ts` a `src/lib/checks.ts` (re-exportada desde su origen
para no romper `PlacaBaseTool.tsx` ni `placaBaseSweep.ts`), con un campo nuevo `ref?: string`
— el slug del apunte que respalda el estado límite, que la tabla convierte en link a
`/acero/<slug>`.

### `src/lib/acero/`

| Archivo | Responsabilidad |
|---|---|
| `tipos.ts` | Geometrías, material, estabilidad, demandas, resultados. |
| `propiedades.ts` | Propiedades derivadas de las planchas. Fórmulas copiadas literales de las planillas auditadas. `resolverPropiedades()` fusiona valores declarados sobre los derivados y reporta el contraste. |
| `clasificacion.ts` | Tablas B4.1a (λr, compresión) y B4.1b (λp/λr, flexión). |
| `compresion.ts` | E3, E4, E7. |
| `flexion.ts` | F2, F3, F6, F7, F8. |
| `corte.ts` | G2 (I), G4 (HSS rect). |
| `traccion.ts` | D2-1 y D2-2 (D2-2 solo con `An`/`U` declarados). |
| `interaccion.ts` | H1-1a / H1-1b. |
| `sismico.ts` | AISC 341-22 D1.1 y NCh2369 Tabla 9 / 8.3.1 / 8.6.3. |
| `seccion.ts` | Orquestador `verificarSeccion()`, espeja `runPlaca()`. |
| `comparador.ts` | `barrerCatalogo()`, espeja `placaBaseSweep.ts`. |
| `memoria.ts` | `generarMemoria()` → `Region[]` con el idioma de las planillas. |
| `catalogo.ts` | `fetch('/perfiles/<familia>.json')`. |
| `engine-entry.ts` | Entrada del bundle de Node, espejo de `planilla-engine.ts`. |

### Catálogo

```
data/perfiles/          crudo (AISC Shapes DB v16 .xlsx, tablas ICHA) — no se publica
scripts/build-perfiles.mjs
public/perfiles/*.json  generado, versionado, servido estático
```

Va a `public/` y no al bundle: el comparador necesita el catálogo completo (~300-600 kB) y
`fetch` lo deja cacheado y accesible desde Node. Cada fila lleva `fuente`.
`build-perfiles.mjs` valida recomputando desde las planchas con la tolerancia que los
redondeos explican (~2 % en área, ~1 % en radios).

### UI

`src/pages/herramientas/verificador-secciones.astro` (`client:only="react"`, patrón de
`placa-base.astro`) + `src/components/acero/VerificadorSeccionTool.tsx` (patrón de
`ModeloBaseBuilder.tsx`: un `values`, un `set<K>` genérico, todo aguas abajo en `useMemo`,
errores por lookup) + entrada en el array `tools` de `herramientas/index.astro`.

## Política que este trabajo cambia

`PLANILLAS.md:217-231` documenta que *no hay tabla de perfiles en el repo* y que por eso
A_g, I, r, Z, J, C_w entran como dato declarado. Un catálogo versionado cambia esa premisa y
cierra tres ítems de `AUDIT.md` (:721 A_g del □150×150×8 sin radios, :1675 r del HSS 4×4×¼,
:1828 S_x del W460×74). Es un cambio consciente: la Fase 3 reescribe ese bullet.

## Fases

| | Entrega | Hecho cuando |
|---|---|---|
| 0 | Este spec | commiteado |
| 1 | Motor + `verify-acero.mjs` (sin catálogo, sin UI) | `npm run verify:acero` pasa los 4 casos |
| 2 | Página + isla, modos Capacidad y Demanda, solo armado | el W250×73 a mano da φPn ≈ 79,3 tonf gobernado por el eje fuerte |
| 3 | Catálogo *(requiere archivos crudos)* | «W250×73» del combobox reproduce la Fase 2 |
| 4 | Comparador | con P_u = 65 tonf el W250×73 pasa y los más livianos fallan por E3 |
| 5 | Memoria al canvas | la memoria descargada pasa `verify:planilla` y coincide con el motor TS |

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Fase 3 bloqueada por los archivos crudos | Fases 1, 2 y 5 no dependen del catálogo. |
| Radios de esquina de los HSS (`AUDIT.md:721`) | El catálogo trae el A_g del fabricante; el modo armado usa paredes rectas y **avisa que sobreestima** (para el HSS 4×4×¼ da 22,6 vs 21,7 cm² de tabla, +4 %). |
| Inventar límites de NCh2369 | Se toman de `diagonal-hss-traccion.json`, `chevron-nch2369.json` y los posts. Lo que no esté en una fuente del repo **no se implementa**: se anota. |
| E7 y F3/F7 sin ancla en las planillas (los 4 casos son compactos y no esbeltos) | Se implementan, pero el `CheckResult` declara que no tiene ancla de verificación. |
