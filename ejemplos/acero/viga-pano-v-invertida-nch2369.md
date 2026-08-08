---
titulo: Viga del paño en V invertida — NCh2369 §8.6.6
disciplina: acero
tema: Arriostramientos
normas: [NCh2369:2025, AISC 360-22]
fecha: 2026-08-08
estado: verificado
veredicto: Cierra con HEB 500 (H1 = 0,88), pero la gravedad pedía Z_x = 340 cm³ y el equilibrio post-pandeo pide 4 100 — el pandeo de la diagonal multiplica la viga por 12.
post:
---

# Viga del paño en V invertida — NCh2369 §8.6.6

La viga del paño del memo de la diagonal, diseñada por equilibrio post-pandeo: comprimida en
$0{,}3P_{ne}$, traccionada en su capacidad esperada con techo, y la gravedad sin apoyo vertical.

## Caso

| Dato | Valor |
|---|---|
| Paño | El del memo de la diagonal: 6 × 4 m, V invertida, $R_1 = 5$ |
| Diagonal | HSS 125×125×6, $A = 2\,856$ mm², $KL/r = 102{,}8$; $P_u = 245$ kN (4.5) |
| Viga | HEB 500, A36: $A = 23\,860$ mm², $Z_x = 4\,815$ cm³, $Z_y = 1\,292$ cm³, $r_y = 72{,}7$ mm |
| Gravitacional mayorada | $q_u = 17$ kN/m concurrente, luz 6 m |
| Material esperado | $R_y = 1{,}3$ (C8.3.3); $F_{ye} = 325$ MPa |

## Supuestos

1. **S1** — Todo en SI; viga y diagonal con propiedades de catálogo (esquinas rectas el HSS).
2. **S2** — Viga simplemente apoyada entre columnas (conexiones de corte) y continua sobre el nudo de las diagonales, como exige §8.6.6.
3. **S3** — $q_u$ es la gravitacional de las combinaciones 4.5, **sin** contar las diagonales como apoyo (§8.6.6).
4. **S4** — Ala comprimida arriostrada por la plataforma: $M_n = M_p$ (§F2.2(a), $L_b \le L_p$); longitud de pandeo axial 3 m.
5. **S5** — Excentricidad de puntos de trabajo nula ($\le 2h$ admitida por §8.6.6).
6. **S6** — El componente horizontal del nudo se reparte simétrico: axial de viga $= H/2$.

## 1. Capacidades esperadas de la diagonal

Con $F_{ye}$ en vez de $F_y$; $F_e = 186{,}8$ MPa del memo de la diagonal.  [NCh2369 §8.3.1]  (S1)

$$T_{ye} = F_{ye}\,A_g = 325 \cdot 2\,856 = 928{,}2\ \text{kN}$$

$$F_{cre} = 0{,}658^{F_{ye}/F_e}\,F_{ye} = 0{,}658^{1{,}74} \cdot 325 = 156{,}9\ \text{MPa} \qquad \left(\tfrac{F_{ye}}{F_e} = 1{,}74 \le 2{,}25\right)$$

$$P_{ne} = 1{,}14\,F_{cre}\,A_g = 1{,}14 \cdot 156{,}9 \cdot 2\,856 = 510{,}9\ \text{kN} \qquad 0{,}3P_{ne} = 153{,}3\ \text{kN}$$

## 2. El techo de la tracción

La tracción no necesita superar la de 4.5 con el sísmico ×$0{,}7R_1$.  [NCh2369 §8.6.6]

$$T = \min\left(T_{ye};\ P_u \cdot 0{,}7R_1\right) = \min\left(928{,}2;\ 245 \cdot 3{,}5\right) = 857{,}5\ \text{kN}$$

→ el techo rige por poco: la diagonal casi alcanza a fluir antes de que el sistema se lo permita.

## 3. Desbalance vertical en el nudo

Traccionada en $T$, comprimida en su residual; $\sin\theta = 0{,}8$.  [NCh2369 §8.6.6]

```
        q_u = 17 kN/m — las diagonales no son apoyo
   ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼
   ●━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━●
                     ╱   ╲       F_v = 563,4 kN ↓
         T = 857,5 ╱       ╲ 0,3·P_ne = 153,3   (kN)
                 ╱           ╲
               ●               ●
```

$$F_v = \left(T - 0{,}3P_{ne}\right)\sin\theta = \left(857{,}5 - 153{,}3\right) \cdot 0{,}8 = 563{,}4\ \text{kN}$$

## 4. Flexión de la viga

Gravedad sin apoyo más el desbalance puntual al centro.  [NCh2369 §8.6.6]  (S2, S3)

$$M_u = \frac{q_u L^2}{8} + \frac{F_v L}{4} = \frac{17 \cdot 6^2}{8} + \frac{563{,}4 \cdot 6}{4} = 76{,}5 + 845{,}1 = 921{,}6\ \text{kN}\cdot\text{m}$$

## 5. Axial de puntal

Componentes horizontales del nudo, repartidas simétricas.  [NCh2369 §8.6.6]  (S6)

$$H = \left(T + 0{,}3P_{ne}\right)\cos\theta = 1\,010{,}8 \cdot 0{,}6 = 606{,}5\ \text{kN} \qquad P_u^{viga} = 303{,}2\ \text{kN}$$

## 6. Flexo-compresión del HEB 500

$\phi_b M_n = 0{,}9\,F_y Z_x = 1\,083{,}4$ kN·m [Ec. F2-1] (S4); $KL/r_y = 41{,}3$ →
$F_n = 228{,}4$ MPa, $\phi_c P_n = 4\,905$ kN [§E3].  [AISC 360-22 §H1]

$$\frac{P_r}{P_c} = \frac{303{,}2}{4\,905} = 0{,}06 < 0{,}2 \;\Rightarrow\; \frac{P_r}{2P_c} + \frac{M_{rx}}{M_{cx}} = 0{,}03 + \frac{921{,}6}{1\,083{,}4} = 0{,}88 \le 1{,}0 \;✓ \quad \text{[Ec. H1-1b]}$$

## 7. La carga transversal del 2 %

Fuera del plano, en el punto de la diagonal comprimida.  [NCh2369 §8.6.6]

$$F_t = 0{,}02\,P_{ne} = 10{,}2\ \text{kN} \qquad M_y = \frac{10{,}2 \cdot 6}{4} = 15{,}3\ \text{kN}\cdot\text{m} \qquad \frac{15{,}3}{0{,}9 \cdot 250 \cdot Z_y} = 0{,}05 \;✓$$

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| Techo de la tracción | NCh §8.6.6 | $T_{ye}$ = 928,2 kN | techo 857,5 kN | — | techo rige |
| **Flexión + axial (H1-1b)** | AISC §H1 | 921,6 kN·m + 303,2 kN | 1 083,4 kN·m + 4 905 kN | **0,88** | ✓ |
| Solo gravedad (referencia) | — | 76,5 kN·m | — | $Z_x$ = 340 cm³ | — |
| Transversal 2 % | NCh §8.6.6 | 15,3 kN·m | 290,7 kN·m | 0,05 | ✓ |

## Veredicto

Cierra con HEB 500 y el número que importa es la comparación: la gravedad sola pedía
$Z_x = 340$ cm³ (un IPE 270); el equilibrio post-pandeo pide 4 096 — **doce veces más viga**
por un paño cuya diagonal es un HSS de 125. El desbalance $(T - 0{,}3P_{ne})$ no se puede
reducir eligiendo diagonal más chica sin perder el paño, y el techo de $0{,}7R_1$ ya está
aplicado: la viga del paño en V es el precio estructural de la configuración.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| NCh | NCh2369:2025 | §8.3.1 (capacidades esperadas); §8.6.6 (equilibrio, techo, 2 %, excentricidad) | 2026-08-08 (rasterizada, pp. impresas 79, 88–89) |
| AISC | ANSI/AISC 360-22 | §E3 (Ecs. E3-2, E3-4); Ec. F2-1; §H1 (Ec. H1-1b) | 2026-08-08 (rasterizada, pp. 16.1-40/41, -53, -82) |

## Para promover a post

- **No se promueve**: `src/content/acero/ejemplo-chevron-nch2369.mdx` ya publica esta tesis y
  la desarrolla más (techo de $0{,}7R_1$, Tabla 2.1.1 del ICHA, «engrosar la diagonal aliviana
  la viga»). Este memo queda como re-derivación compacta con otro caso, útil de contraste.
- Sí quedó fuera del post y de este memo: la conexión viga-columna para la condición que
  controla (§8.6.6) y el caso sin plataforma, donde el 2 % deja de ser trivial (C8.6.6).
