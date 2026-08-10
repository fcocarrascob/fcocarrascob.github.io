---
titulo: El área neta del tubo ranurado — la ranura que ningún cordón alcanza (AISC 360-22 §D2)
disciplina: acero
tema: Conexiones
normas: [AISC 360-22, NCh2369:2025]
fecha: 2026-08-09
estado: verificado
veredicto: No cierra — con la pared de 6 mm y el cordón de 345 mm del memo del gusset, φR_n = 702 kN contra los 841,3 que §8.6.8 obliga a desarrollar (uso 1,20). Y no hay largo de cordón que lo salve - la ranura deja A_n = 2 688 mm² y harían falta 2 804 aun con U = 1, o sea U = 1,043. Tres salidas: refuerzo de ranura (≥ 533 mm²), pared de 8 mm (0,99, y de paso acorta el cordón 34 %, pero sube P_ne y con él lo que pagan el puntal y la columna), o dos gussets laterales con bisel, que el comentario declara sin reducción de área bruta. De regalo, la Tabla D3.1 no define la b del caso 5 - es B/2, y con ella la ecuación reproduce exactamente el centroide de la media sección.
post:
---

# El área neta del tubo ranurado — la ranura que ningún cordón alcanza (AISC 360-22 §D2)

La otra mitad de la conexión de la diagonal: la rotura del área neta del tubo en la ranura, con el
retraso de cortante del caso 5 de la Tabla D3.1, contra la demanda de §8.6.8.

## Caso

| Dato | Valor |
|---|---|
| Diagonal | HSS 125×125×6, A36: $A_g = 2\,856$ mm² (esquinas rectas), $F_u = 400$ MPa |
| Conexión | tubo ranurado sobre gusset de 12 mm; ranura de 14 mm; $\ell_w = 345$ mm |
| Geometría del caso 5 | $H = 125$ mm (en el plano del gusset), $B = 125$ (a 90°), $t = 6$, $b = B/2$ |
| Demanda | $T = 841{,}3$ kN — el techo de $0{,}7R_1$ de §8.6.8 |

## Supuestos

1. **S1** — Demanda heredada del memo de la diagonal fusible y $\ell_w = 345$ mm del memo del gusset,
   donde el largo lo fija el tope de filete de la pared de 6 mm.
2. **S2** — La Tabla D3.1 **no define** la $b$ del caso 5; la figura la muestra como la mitad de $B$
   (cara exterior al plano del gusset) y el paso 1 lo verifica por integración.
3. **S3** — Ranura de 14 mm = gusset de 12 + 2 de tolerancia; la sección neta se toma **al final de
   la ranura**, según la Fig. C-D3.5.
4. **S4** — Sin soldadura de cierre en el extremo del gusset: la C-D3 permite omitirla, y es
   justamente lo que vuelve crítica a esa sección.
5. **S5** — $A_g$ con esquinas rectas, la misma aproximación del memo de la diagonal.

## 1. La `b` que la tabla no define

Para HSS rectangular con gusset concéntrico por ranuras, el caso 5 da $\bar x$ con una expresión que
usa una $b$ ausente del pie de tabla.  [AISC Tabla D3.1, caso 5]  (S2)

$$\bar x = b - \frac{2b^2 + tH - 2t^2}{2H + 4b - 4t} = 62{,}5 - \frac{7\,812{,}5 + 750 - 72}{250 + 250 - 24} = 44{,}663\ \text{mm}$$

→ control independiente: el centroide de la media sección (un ala completa $H \times t$ más dos
medias almas $t \times (B/2 - t)$) da **44,663 mm**, idéntico. La $b$ es $B/2$ y la ecuación del caso 5
no es una aproximación: **es el centroide exacto de la mitad conectada**.

## 2. El factor de retraso de cortante

$U = 1 - \bar x/\ell$ con $\ell$ = largo del cordón paralelo a la fuerza.  [Ec. D3-1 · Tabla D3.1]  (S1)

$$U = 1 - \frac{44{,}663}{345} = \mathbf{0{,}871}$$

→ y acá no hay piso: el §D3 permite tomar $U \ge$ (área conectada / área bruta) solo en secciones
abiertas — **«this provision does not apply to closed sections, such as HSS»**.

## 3. El área neta, y la rotura

La ranura corta dos paredes; la sección crítica es la del final de la ranura [Fig. C-D3.5]. Y §D2
manda usar el área neta efectiva **a través de la ranura** en la Ec. D2-2.  (S3, S4)

$$A_n = A_g - 2\,w_{ranura}\,t = 2\,856 - 2 \cdot 14 \cdot 6 = 2\,688\ \text{mm}^2$$

$$\phi R_n = 0{,}75\,F_u\,A_n U = 0{,}75 \cdot 400 \cdot 2\,688 \cdot 0{,}871 = 702{,}0\ \text{kN} \;\Rightarrow\; \frac{841{,}3}{702{,}0} = \mathbf{1{,}20}$$

→ **no cierra**, y el memo del gusset había dejado su propio lado en 0,99: la conexión completa la
gobierna el tubo, no la plancha.

## 4. Ningún cordón alcanza

Alargar el cordón sube $U$, pero $U < 1$ siempre. El área neta es el techo duro:

$$A_e^{req} = \frac{841\,300}{0{,}75 \cdot 400} = 2\,804{,}3\ \text{mm}^2 \;>\; A_n = 2\,688\ \text{mm}^2 \;\Rightarrow\; U^{req} = 1{,}043$$

→ faltan 116 mm² **antes** de aplicar retraso de cortante alguno. El problema no es la soldadura ni
el tamaño del tubo: es que la ranura se llevó el 6 % del área y la demanda de §8.6.8 no deja margen.

## 5. Refuerzo de ranura: un piso, no una respuesta

Para volver al mismo $U$ hay que reponer área neta.  [Ec. D3-1]

$$A_n \ge \frac{2\,804{,}3}{0{,}871} = 3\,221\ \text{mm}^2 \;\Rightarrow\; \Delta A_n \ge \mathbf{533}\ \text{mm}^2$$

→ y hay que rehacer $\bar x$ con la sección reforzada: el refuerzo se aleja del plano del gusset y
**baja** $U$, así que 533 mm² es un piso, no la respuesta.

## 6. Pared de 8 mm, o cambiar el detalle

El memo del gusset mostró que la pared de 8 sube el filete a 6 mm y acorta el cordón a 229 mm.

$$U = 1 - \frac{43{,}943}{229} = 0{,}808 \qquad A_e = 3\,520 \cdot 0{,}808 = 2\,844{,}5 \;\Rightarrow\; \phi R_n = 853{,}4\ \text{kN},\ \mathbf{0{,}99}$$

→ cierra al filo, con menos soldadura y mejor $b/t$ (12,62 contra 17,83). No es gratis: el techo de
tracción sigue en 841,3 pero $P_{ne}$ sube con el área, y eso lo pagan el puntal y la columna, que
compran $0{,}3P_{ne}$. La otra salida es cambiar el detalle: la C-D3 declara que dos gussets
laterales con biseles en J **no reducen el área bruta** — el estado límite desaparece.

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| $\bar x$ del caso 5 contra el centroide | T. D3.1 | 44,663 mm | 44,663 mm | — | ✓ identidad |
| Retraso de cortante ($\ell = 345$) | Ec. D3-1 | — | $U = 0{,}871$ | — | sin piso (HSS) |
| **Rotura del área neta (pared 6)** | Ec. D2-2 | 841,3 kN | 702,0 kN | **1,20** | ✗ |
| Techo con $U = 1$ | Ec. D3-1 | 2 804,3 mm² | $A_n$ = 2 688 mm² | 1,04 | ✗ imposible |
| Refuerzo de ranura necesario | Ec. D2-2 | 533 mm² | a definir | — | piso |
| Rotura con pared de 8 mm ($\ell = 229$) | Ec. D2-2 | 841,3 kN | 853,4 kN | **0,99** | ✓ al filo |
| $b/t$ con pared de 8 | NCh Tabla 9 | 12,62 | 18,85 | 0,67 | ✓ |

## Veredicto

La conexión no cierra por el lado del tubo, y el margen que falta es geométrico: la ranura se lleva
168 mm² y deja el área neta 116 mm² por debajo de lo que §8.6.8 exige desarrollar, **antes** de
descontar retraso de cortante. Por eso alargar el cordón —la reacción instintiva— no sirve: pediría
$U = 1{,}043$. De las tres salidas, la pared de 8 mm es la única que cierra sin agregar piezas, y
cierra al filo (0,99) mientras acorta el cordón un 34 %; el precio no está en el tubo sino aguas
abajo, porque $P_{ne}$ crece y el puntal y la columna compran $0{,}3P_{ne}$ — la misma factura que el
memo de la diagonal fusible ya había advertido. Y una lectura de método: la ecuación del caso 5 usa
una $b$ que el pie de tabla no define, y resulta ser el centroide exacto de la media sección, no una
fórmula empírica; verificarlo por integración cuesta tres líneas y evita adivinar.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| AISC-D | ANSI/AISC 360-22 | §D2 Ec. D2-2 + la regla de ranuras; §D3 Ec. D3-1 y el piso que no aplica a HSS | 2026-08-09 (rasterizadas, pp. 16.1-33) |
| AISC-T | ANSI/AISC 360-22 | Tabla D3.1, casos 1 a 6 + pie de tabla y figura del caso 5 | 2026-08-09 (rasterizada, p. 16.1-34, figura ampliada) |
| AISC-C | ANSI/AISC 360-22 | Comentario D3 + Figs. C-D3.4 y C-D3.5 (sección neta por la ranura; alternativa de dos gussets) | 2026-08-09 (rasterizadas, pp. 16.1-348 y -350) |
| NCh | NCh2369:2025 | §8.6.8 — desarrollar las capacidades esperadas, con el techo de $0{,}7R_1$ | heredada del memo del gusset (2026-08-09) |
| Memos | diagonal fusible; gusset | $T = 841{,}3$ kN; $\ell_w = 345$ y 229 mm; $A_g$, $b/t$ | heredados (verificados) |

## Para promover a post

- Tesis candidata: el estado límite que no se arregla soldando más. Cierra el par con el memo del
  gusset — los dos lados de la misma conexión, y en los dos manda la pared del tubo.
- Hallazgo de método: la $b$ del caso 5 no está definida en el pie de tabla, y la verificación por
  integración la fija sin ambigüedad.
- Por correr: comparar la Ec. del caso 5 contra la edición anterior (la 360-16 no está en disco, así
  que la deriva de edición queda sin confirmar); y rehacer $\bar x$ con la ranura reforzada.
- Figura: la sección neta al final de la ranura con los 168 mm² que se van, y el abanico de $U$
  contra el largo del cordón, con la asíntota en 1,0 que nunca alcanza los 1,043 necesarios.
