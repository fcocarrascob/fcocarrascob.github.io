---
titulo: Columna armada de dos canales con celosía — AISC 360-22 §E6
disciplina: acero
tema: Columnas
normas: [AISC 360-22]
fecha: 2026-08-08
estado: verificado
veredicto: Cierra con φP_n = 1 050 kN (uso 0,81) y sin castigo de esbeltez — la celosía soldada a 60° deja a/r_i = 12,9 ≤ 40 y rige E6-2a. La exención se compra con geometría; al paso máximo legal la penalización sería −12,5 %, y la barra de celosía entera se dimensiona con un corte del 2 % que el análisis no muestra.
post:
---

# Columna armada de dos canales con celosía — AISC 360-22 §E6

Columna de 6 m de dos UPN 200 enfrentados con celosía simple soldada: el conjunto por E6/E3
y la celosía por los requisitos de §E6.2.

## Caso

| Dato | Valor |
|---|---|
| Columna | 2 × UPN 200, A36; $L = 6$ m, $K = 1$; $P_u = 850$ kN |
| Canal (catálogo) | $A = 3\,220$ mm², $I_x = 19{,}1 \cdot 10^6$ mm⁴, $I_y = 1{,}48 \cdot 10^6$ mm⁴, $r_i = 21{,}4$ mm |
| Celosía | Simple, pletinas 50×8 soldadas a 60°, en las dos caras; cara $w = 240$ mm |
| Extremos | Conexiones de extremo soldadas (§E6.1) |

## Supuestos

1. **S1** — Todo en SI; propiedades UPN 200 de catálogo; elementos no esbeltos (B4.1a).
2. **S2** — Separación entre centroides $2c = 148$ mm, elegida para igualar inercias ($r_y \approx r_x$).
3. **S3** — Alas hacia afuera; líneas de soldadura de la celosía a $w = 240$ mm $< 380$: celosía simple admisible.
4. **S4** — El 2 % se reparte entre las dos caras y la barra trabaja a 60° del eje.

## 1. El conjunto equilibrado

Steiner con la separación de S2.  (S1, S2)

$$I_y = 2\left(1{,}48 \cdot 10^6 + 3\,220 \cdot 74^2\right) = 38{,}2 \cdot 10^6\ \text{mm}^4 \approx I_x \qquad r = 77{,}0\ \text{mm}$$

$$\left(\frac{L_c}{r}\right)_o = \frac{6\,000}{77{,}0} = 77{,}9$$

```
        ┌─┐   240   ┌─┐        celosía 50×8 a 60°
   eje ─┤ ├╲╱╲╱╲╱╲╱┤ ├─  w    en ambas caras
        └─┘        └─┘        V = 2 % · φP_n = 21 kN
        UPN200    UPN200      (el análisis muestra 0)
         ├── 148 ──┤
```

## 2. La celosía fija su propio paso

A 60°, el avance por barra es $w/\tan 60°$; el paso entre nudos de un mismo canal es el doble.  [§E6.2(e)]  (S3)

$$a = \frac{2 \cdot 240}{\tan 60°} = 277\ \text{mm} \qquad \frac{a}{r_i} = \frac{277}{21{,}4} = 12{,}9 \le 40 \quad\text{y}\quad \le \tfrac{3}{4} \cdot 77{,}9 = 58{,}4$$

→ conectores soldados con $a/r_i \le 40$: **la esbeltez no se modifica** — rige la Ec. E6-2a,
$(L_c/r)_m = (L_c/r)_o$.

## 3. Compresión del conjunto

Con la esbeltez sin castigo.  [AISC §E3 · Ec. E6-2a]

$$F_e = \frac{\pi^2 E}{77{,}9^2} = 325{,}3\ \text{MPa} \qquad F_n = 0{,}658^{250/325{,}3} \cdot 250 = 181{,}3\ \text{MPa}$$

$$\phi_c P_n = 0{,}9 \cdot 181{,}3 \cdot 6\,440 = 1\,050\ \text{kN} \qquad \frac{850}{1\,050} = 0{,}81 \;✓$$

## 4. La barra de celosía, por el 2 %

Corte normal al eje = 2 % de la resistencia disponible; $L/r \le 140$ en celosía simple.  [§E6.2(e)]  (S4)

$$V = 0{,}02 \cdot 1\,050 = 21{,}0\ \text{kN} \qquad P_{barra} = \frac{21{,}0/2}{\sin 60°} = 12{,}1\ \text{kN}$$

$$L_{barra} = \frac{240}{\sin 60°} = 277\ \text{mm} \qquad \frac{L}{r} = \frac{277}{8/\sqrt{12}} = 120 \le 140 \qquad \frac{12{,}1}{41{,}9} = 0{,}29 \;✓$$

## 5. Lo que costaría detallar peor

Mismos canales: apernada *snug-tight* paga la Ec. E6-1 siempre; y con el paso al máximo de la
regla ¾ ($a = 1\,253$ mm, $a/r_i = 58{,}4 > 40$) rige E6-2b con $K_i = 0{,}86$.  [Ecs. E6-1, E6-2b]

$$\text{snug-tight: } \sqrt{77{,}9^2 + 12{,}9^2} = 79{,}0 \;\Rightarrow\; 1\,041\ \text{kN}\ (-1\ \%) \qquad \text{paso 3/4: } 92{,}7 \;\Rightarrow\; 919\ \text{kN}\ (-12{,}5\ \%)$$

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| Paso de celosía $a/r_i$ | §E6.2(e) | 12,9 | 40 / 58,4 | 0,32 | ✓ |
| **Compresión del conjunto** | §E3 + E6-2a | 850 kN | 1 050 kN | **0,81** | ✓ |
| Barra de celosía ($L/r$) | §E6.2(e) | 120 | 140 | 0,86 | ✓ |
| Barra de celosía (2 %) | §E6.2(e) | 12,1 kN | 41,9 kN | 0,29 | ✓ |
| Detalle snug-tight (contraste) | Ec. E6-1 | — | 1 041 kN | −1 % | — |
| Paso ¾ (contraste) | Ec. E6-2b | — | 919 kN | −12,5 % | — |

## Veredicto

Cierra al 0,81 y **sin pagar castigo de esbeltez**: la celosía a 60° deja el paso en
$a/r_i = 12{,}9$, y soldada con eso rige E6-2a — el conjunto rinde la suma completa de sus
canales. La columna armada se diseña de adentro hacia afuera: la geometría de la celosía
(60°, soldada) compra la exención, la barra se dimensiona con un corte del 2 % que ninguna
combinación contiene, y solo al final el conjunto verifica E3. La vieja fórmula del
$0{,}82\,\alpha^2/(1+\alpha^2)$ ya no existe en la 360-22 — deriva de edición cazada al releer.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| AISC | ANSI/AISC 360-22 | §E6.1 (Ecs. E6-1, E6-2a, E6-2b, $K_i$); §E6.2(e) (¾, 2 %, $L/r$, 60°/45°) | 2026-08-08 (rasterizada, pp. 16.1-45 a -48) |
| AISC-E3 | ANSI/AISC 360-22 | §E3 (Ecs. E3-1 a E3-4) | 2026-08-08 (rasterizada, pp. 16.1-40/41) |

## Para promover a post

- Tesis candidata: la columna armada se diseña de adentro hacia afuera — y la exención de
  E6-2a (soldada, $a/r_i \le 40$) es la cláusula que nadie sabe que está usando.
- La deriva de edición del $0{,}82\,\alpha^2/(1+\alpha^2)$ (360-10/16 → 22) merece nota propia:
  es el mismo patrón del F7-12/F7-13.
- Figura: el croquis del paso 1 como SVG con la sección real y el flujo del 2 %.
- Falta el caso de presillas (tie plates, §E6.2(d)) — miembro hermano, memo aparte.
