---
titulo: El espesor de la placa base — los 25 mm del corpus piden 52 (DG1 §4.3.1 y §4.3.7)
disciplina: acero
tema: Placas base
normas: [AISC Design Guide 1 3.ª ed., NCh2369:2025]
fecha: 2026-08-09
estado: verificado
veredicto: Los 25 mm que seis memos usan como dato piden 52,0. Y no los fija el momento — la interfaz comprimida da lo mismo en los dos niveles (análisis y piso de §8.5.2), porque con el bloque en f_p(max) el espesor solo depende del voladizo y de f'c. Lo que gobierna es n = 105 mm, el voladizo transversal, que es mayor que m = 82,5 porque la placa es cuadrada sobre una columna cuadrada; la interfaz traccionada, la que uno esperaría que mande con 635 kN en los pernos, llega a 29,4 y nunca gobierna. Y no se puede equilibrar m con n: bajar B a 405 dejaría 27,5 mm de borde para un perno de 1″.
post:
---

# El espesor de la placa base — los 25 mm del corpus piden 52 (DG1 §4.3.1 y §4.3.7)

Los tres modelos de espesor de la DG1 sobre la misma placa del cuarteto: compresión concéntrica
(§4.3.1) y, con momento, las interfaces de aplastamiento y de tracción (§4.3.7).

## Caso

| Dato | Valor |
|---|---|
| Columna | HEB 300: $d = 300$, $b_f = 300$, $t_f = 19$ mm (catálogo) |
| Placa | $N \times B = 450 \times 450$ mm, A36 ($F_y = 250$ MPa); pernos a $f = 175$ mm |
| Aplastamiento | $f_{p(\text{máx})} = 27{,}6$ MPa, $q_{\text{máx}} = 12{,}43$ kN/mm (pedestal 1100) |
| Nivel 1 (análisis) | $M_r = 110\ \text{kN}\cdot\text{m}$, $P_r = 250$ kN |
| Nivel 2 (piso §8.5.2) | $M_r = 278{,}6\ \text{kN}\cdot\text{m}$, $P_r = 250$ kN |
| Compresión máxima | $P_u = 400$ kN (sismo × $0{,}7R_1$) |

## Supuestos

1. **S1** — Geometría, cargas, $f_{p(\text{máx})}$ y $q_{\text{máx}}$ heredados del memo de la base empotrada;
   la raíz $\sqrt{A_2/A_1}$ está saturada en 2 con el pedestal de 1100 [Ec. 4-2].
2. **S2** — LRFD: $\phi_c = 0{,}65$ [Ec. 4-3a] y $\phi_b = 0{,}90$.
3. **S3** — El corte lo toma la llave, no la placa: no participa del espesor (memo de la llave).
4. **S4** — Los dos niveles son «momento grande» ($e > e_{crit}$), así que el bloque está en
   $f_{p(\text{máx})}$ y rigen las Ecs. 4-51/4-52, no el caso de momento pequeño.
5. **S5** — Placa sin atiesadores ni cartelas: el modelo de voladizo de la Fig. 4-1 es el que aplica.

## 1. Los tres voladizos, y cuál es el crítico

$\ell$ es el mayor de $m$, $n$ y $\lambda n'$.  [Ecs. 4-10 a 4-14a · Fig. 4-1(b)]  (S1)

$$m = \frac{N - 0{,}95d}{2} = 82{,}5 \qquad n = \frac{B - 0{,}8b_f}{2} = 105{,}0 \qquad n' = \frac{\sqrt{d\,b_f}}{4} = 75{,}0\ \text{mm}$$

$$X = \left[\frac{4d\,b_f}{(d+b_f)^2}\right]\frac{P_u}{\phi_c P_p} = 1{,}00 \cdot \frac{400}{5\,589} = 0{,}0715 \;\Rightarrow\; \lambda = \frac{2\sqrt{X}}{1+\sqrt{1-X}} = 0{,}272 \;\Rightarrow\; \lambda n' = 20{,}4$$

→ **manda $n$**, el voladizo transversal, y por un margen de 27 %. La placa es cuadrada sobre una
columna cuadrada, y $0{,}8b_f < 0{,}95d$: el ala «tapa» menos placa que el alma.

## 2. Compresión concéntrica: 14 mm

Con la axial máxima y presión uniforme.  [Ecs. 4-8a, 4-9a y 4-15a]  (S2)

$$t_{min} = \ell\sqrt{\frac{2P_u}{\phi_b F_y B N}} = 105\sqrt{\frac{2 \cdot 400\,000}{0{,}90 \cdot 250 \cdot 450 \cdot 450}} = 13{,}9\ \text{mm}$$

→ el modelo con que se parte pide poco más de la mitad de los 25 mm. Si la base fuera rotulada,
el dato del corpus sobraría.

## 3. La interfaz de aplastamiento: 52 mm, y no se entera del momento

$e = M_r/P_r$ = 440 y 1 114 mm contra $e_{crit} = N/2 - P_r/2q_{\text{máx}} = 215$: los dos son momento
grande, así que $f_p = f_{p(\text{máx})}$. Y como $n > m$, la nota de §4.3.7 manda sustituir $n$ en la
Ec. 4-51a **en los dos casos**, con $Y \ge m$ o $Y < m$.  [Ecs. 4-39, 4-40, 4-58 · nota p. 44]  (S4)

$$t_{p(req)} = 1{,}49\,n\sqrt{\frac{f_{p(\text{máx})}}{F_y}} = 1{,}49 \cdot 105\sqrt{\frac{27{,}6}{250}} = \mathbf{52{,}0}\ \text{mm}$$

→ el mismo número en los dos niveles: el espesor de esta interfaz **no depende de $M_r$**, solo de
$n$ y de $f_{p(\text{máx})}$. Todo el debate del piso de §8.5.2 —que duplicó el momento y triplicó la
tracción del perno— no mueve el espesor ni un milímetro. Si mandara $m$, la rama $Y < m$ de la
Ec. 4-52a daría 32,4 y 40,5 mm: ahí sí se movería.

## 4. La interfaz traccionada: la que uno esperaría, y nunca gobierna

Voladizo desde el eje del perno hasta el centro del ala.  [Ecs. 4-60a, 4-61 y 4-62a]  (S1)

$$x = f - \frac{d}{2} + \frac{t_f}{2} = 175 - 150 + 9{,}5 = 34{,}5\ \text{mm}$$

$$t_{p(req)} = 2{,}11\sqrt{\frac{T_u\,x}{B\,F_y}} = 2{,}11\sqrt{\frac{150\,500 \cdot 34{,}5}{450 \cdot 250}} = 14{,}3 \qquad \text{y con } T_u = 634{,}6\ \text{kN}: \;\; 29{,}4\ \text{mm}$$

→ los 635 kN del piso de §8.5.2 —que no cerraron el anclaje, con los pernos en 2,79— piden 29,4 mm
de placa: **56 % de lo que pide el lado comprimido**. El brazo $x$ de 34,5 mm es tan corto que la
fuerza grande no alcanza a doblar la placa.

## 5. Por qué no se puede equilibrar m con n

La guía dice que la placa más delgada sale de proporcionar $N \times B$ para que $m \approx n$
(p. 23). Acá $m = n$ pide $B = 2m + 0{,}8b_f = 405$ mm.  [DG1 §4.3.1]  (S5)

$$\text{borde de placa} = \frac{405}{2} - f = 27{,}5\ \text{mm}$$

→ no cabe: el agujero sobredimensionado de un perno de 1″ se come ese borde. **El patrón de pernos
fija $B$, $B$ fija $n$, y $n$ fija el espesor.** A igual área (473 × 428, con $m = n = 94$) el espesor
solo baja a 46,6 mm — la geometría cuadrada no es el problema de fondo, el voladizo lo es.

## 6. Sensibilidad: el pedestal chico adelgaza la placa

Con el pedestal de 600 del memo de la tracción del grupo, $\sqrt{A_2/A_1} = 1{,}33$ y ya no satura:

$$f_{p(\text{máx})} = 0{,}65 \cdot 0{,}85 \cdot 25 \cdot 1{,}33 = 18{,}4\ \text{MPa} \;\Rightarrow\; t_{p(req)} = 1{,}49 \cdot 105\sqrt{\frac{18{,}4}{250}} = 42{,}4\ \text{mm}$$

→ 10 mm menos de placa, porque el pedestal chico no puede entregar tanta presión. La interfaz
traccionada sube a 30,7 mm ($T_u = 688$ kN con el $q_{\text{máx}}$ menor) y sigue sin gobernar.

## Resumen

| Verificación | Ref. | $\ell$ o brazo | $t_{p(req)}$ | vs. 25 mm | |
|---|---|---:|---:|---:|:--:|
| Voladizo crítico | Ecs. 4-10 a 4-13 | $n = 105$ mm | — | — | manda $n$ |
| Compresión concéntrica (400 kN) | Ec. 4-15a | 105 mm | 13,9 mm | 0,56 | ✓ |
| **Aplastamiento, nivel 1 y nivel 2** | Ec. 4-51a con $n$ | 105 mm | **52,0 mm** | **2,08** | ✗ |
| Ídem si mandara $m$ (referencia) | Ec. 4-52a | 82,5 mm | 32,4 / 40,5 mm | 1,30 / 1,62 | ✗ |
| Tracción, nivel 1 | Ec. 4-62a | $x = 34{,}5$ mm | 14,3 mm | 0,57 | ✓ |
| Tracción, nivel 2 (piso §8.5.2) | Ec. 4-62a | $x = 34{,}5$ mm | 29,4 mm | 1,18 | ✗ |
| Con pedestal de 600 | Ec. 4-51a con $n$ | 105 mm | 42,4 mm | 1,70 | ✗ |

## Veredicto

La placa del cuarteto necesita **52 mm** y lleva 25: los espesores de catálogo que se usan a diario
—25, 32, 38— no cubren el caso, hay que ir a 50 o 55, o atiesar. Y el número no lo pone ninguna de
las dos fuerzas que el memo de la base empotrada discutió: con el bloque saturado en
$f_{p(\text{máx})}$, el espesor del lado comprimido queda fijado por geometría y por $f'_c$, e ignora
tanto el momento del análisis como el piso de §8.5.2. Lo que sí lo mueve es $n$, el voladizo que
nadie mira porque es transversal al plano de flexión, y que solo baja achicando $B$ — cosa que el
patrón de pernos impide. El único camino que abarata de verdad es reducir $f_{p(\text{máx})}$, y ahí
el pedestal chico ayuda: 42,4 mm en vez de 52,0.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| DG1-a | AISC Design Guide 1, 3.ª ed. | §4.3.1 — Ecs. 4-2, 4-3a, 4-8a, 4-9a, 4-10 a 4-15a + Fig. 4-1 y la regla $m \approx n$ | 2026-08-09 (rasterizadas, pp. impresas 21–23) |
| DG1-b | AISC Design Guide 1, 3.ª ed. | §4.3.7 — Ecs. 4-51a, 4-52a, 4-55 a 4-62a + la nota «when $n$ is larger than $m$» | 2026-08-09 (rasterizadas, pp. impresas 44–45) |
| NCh | NCh2369:2025 | §8.5.2 — el piso de $0{,}5M_{pe}$ | heredada del memo de la base empotrada (2026-08-08) |
| Memos | base empotrada, rigidez rotacional, tracción del grupo | $q_{\text{máx}}$, $e_{crit}$, $Y$, $T$, $m$, el pedestal de 600 | heredados (verificados) |

## Para promover a post

- Tesis candidata: el espesor lo fija la geometría, no la carga. Cuarta cara del «dimensionado por
  algo que el análisis no muestra», y la más literal: $n$ es perpendicular al plano de flexión.
- Hallazgo de método: la nota de §4.3.7 que manda sustituir $n$ en la Ec. 4-51a cuando $n > m$ es
  fácil de saltarse —está al pie de las tablas, no en el procedimiento de 8 pasos— y acá vale 20 mm.
- Por correr: la placa atiesada (§4.4 de la guía) como alternativa a los 52 mm; y el efecto de un
  espesor real de 52 sobre $\beta_{connection}$, que el memo de rigidez calculó con 25.
- Figura: los tres voladizos sobre la planta de la placa, con $n$ sombreado y la banda de 0,95$d$
  contra la de 0,8$b_f$.
