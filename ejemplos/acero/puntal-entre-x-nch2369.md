---
titulo: Puntal entre paños en X — NCh2369 §8.6.7
disciplina: acero
tema: Arriostramientos
normas: [NCh2369:2025, AISC 360-22]
fecha: 2026-08-08
estado: verificado
veredicto: Cierra con HSS 150×150×8 (0,89) para un elemento que el análisis mostraba descargado — el equilibrio post-pandeo le pone 519 kN de compresión. Y el cruce que salva la diagonal (sin él, KL/r = 148 > 133) le sube la residual ×2,8 al puntal.
post:
---

# Puntal entre paños en X — NCh2369 §8.6.7

Puntal horizontal de una cepa con X apiladas, por equilibrio post-pandeo: diagonal traccionada
en su capacidad esperada con techo, comprimida en la residual.

## Caso

| Dato | Valor |
|---|---|
| Cepa | 2 niveles con X apiladas; paños de 6 m × 4 m; diagonales de 7 211 mm |
| Diagonales | HSS 125×125×6, A36: $A = 2\,856$ mm², $r = 48{,}6$ mm; cruce conectado (§8.6.4) |
| Puntal | HSS 150×150×8, A36: $A = 4\,544$ mm², $r = 58{,}1$ mm; largo 6 m |
| Corte sísmico de la línea (4.5) | $V_u = 400$ kN por nivel; $R_1 = 5$ |
| Material esperado | $R_y = 1{,}3$ (C8.3.3); $F_{ye} = 325$ MPa |

## Supuestos

1. **S1** — Todo en SI; propiedades HSS con esquinas rectas (aprox. de catálogo).
2. **S2** — Capacidades del fusible heredadas del memo de la diagonal de esta misma cepa: $T_{ye} = 928{,}2$, $P_{ne} = 724{,}6$, $0{,}3P_{ne} = 217{,}4$ kN, y techo de la tracción $T = 0{,}7R_1 P_u = 841{,}3$ kN.
3. **S3** — Ambos niveles en el mismo estado post-pandeo: al puntal llega una diagonal traccionada y una comprimida; $\cos\theta = 0{,}832$.
4. **S4** — Punto de cruce fijo fuera del plano: la contraparte está traccionada y una diagonal es continua (§8.6.4); $KL = L/2 = 3\,606$ mm.
5. **S5** — Puntal puro, sin carga gravitacional (no es viga de plataforma); $K = 1{,}0$, $L = 6$ m.
6. **S6** — Las componentes verticales del nudo van al pilar (§8.3.4, memo propio).
7. **S7** — La Tabla 9 no aplica al puntal: no es diagonal (§8.6.3) y se diseña para permanecer elástico.

## 1. El cruce, que la diagonal necesita y el puntal paga

Sin conectar el cruce, la longitud de pandeo de la diagonal es $L$ entero.  [NCh2369 §8.6.4 · §8.6.3]  (S2, S4)

$$\frac{KL}{r} = \frac{7\,211}{48{,}6} = 148{,}4 > 133{,}3 \qquad \text{contra} \qquad \frac{3\,606}{48{,}6} = 74{,}1 \le 133{,}3$$

→ sin cruce la diagonal **ni cumple** §8.6.3. Y el cruce obligado sube su residual de 76,9 a
217,4 kN: **×2,8 sobre el puntal**, que es quien la equilibra.

## 2. Equilibrio del nudo intermedio

Traccionada en el techo $T$, comprimida en su residual; la diferencia horizontal entra al puntal.  [NCh2369 §8.6.7]  (S2, S3, S6)

```
  sismo →              desde la X superior
          T (techo) ╱ 841,3          ╲ 0,3·P_ne 217,4     (kN)
                ╱                    ╲
   ●━━━━━━━━━ puntal: 519,1 kN (compresión) ━━━━━━━━━●
                ╲                    ╱
       0,3·P_ne ╲ 217,4           ╱ 841,3 (techo) T
                       desde la X inferior
```

$$F_{puntal} = \left(T - 0{,}3P_{ne}\right)\cos\theta = \left(841{,}3 - 217{,}4\right) \cdot 0{,}832 = 519{,}1\ \text{kN de compresión}$$

→ C8.6.7: si el puntal falla en compresión, la X degenera en una **K**, prohibida (§8.6.5).

## 3. El contraste con el análisis

En la X simétrica las componentes horizontales elásticas se cancelan en el nivel intermedio:
el modelo muestra el puntal **casi descargado** — el estado que lo dimensiona solo existe
después del pandeo.  (S3)

## 4. Compresión del puntal

HSS 150×8: $KL/r = 6\,000/58{,}1 = 103{,}3$.  [AISC 360-22 §E3]  (S5)

$$F_e = 184{,}9\ \text{MPa} \qquad F_n = 0{,}658^{250/184{,}9} \cdot 250 = 141{,}9\ \text{MPa} \quad \text{[Ec. E3-2]}$$

$$\phi_c P_n = 0{,}9 \cdot 141{,}9 \cdot 4\,544 = 580{,}5\ \text{kN} \qquad \frac{519{,}1}{580{,}5} = 0{,}89 \;✓$$

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| Esbeltez diagonal con cruce | NCh §8.6.4/§8.6.3 | 74,1 | 133,3 | 0,56 | ✓ |
| Esbeltez diagonal sin cruce | NCh §8.6.3 | 148,4 | 133,3 | 1,11 | ✗ |
| Fusible heredado (S2) | NCh §8.6.7/§8.6.8 | $T$ = 841,3 kN | $0{,}3P_{ne}$ = 217,4 kN | — | del memo de la diagonal |
| **Compresión del puntal** | AISC §E3 | 519,1 kN | 580,5 kN | **0,89** | ✓ |
| Puntal según análisis elástico | — | ≈ 0 kN | — | — | (S3) |

## Veredicto

Cierra con HSS 150×150×8, y el número que enseña es el contraste: el análisis muestra el
puntal descargado y el equilibrio post-pandeo le pone 519 kN. El encadenado fino: el cruce es
obligatorio para la esbeltez de la diagonal, y ese mismo cruce casi triplica la residual que
el puntal equilibra — mejorar la diagonal carga al puntal.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| NCh | NCh2369:2025 | §8.6.3 (esbeltez); §8.6.4 (cruce); §8.6.7 + C8.6.7 (equilibrio y techo) | 2026-08-08 (rasterizada, pp. impresas 87, 89) |
| NCh-cap | NCh2369:2025 | §8.3.1 — $T_{ye}$, $P_{ne}$, $0{,}3P_{ne}$ (S2) | heredada del memo de la diagonal (2026-08-08) |
| AISC | ANSI/AISC 360-22 | §E3, Ecs. E3-1 a E3-4 | 2026-08-08 (rasterizada, pp. 16.1-40/41) |

## Para promover a post

- Tesis candidata: el puntal descargado es el que sostiene la X — cierra el hueco que el paso 13
  de `ejemplo-diagonal-hss-traccion` declara, junto a la viga del chevron (§8.6.6).
- Figura: la cepa con la X pandeada (T y $0{,}3P_{ne}$) y el flujo horizontal entrando al puntal.
- El pilar (§8.3.4) tiene memo propio, y ahí el estado que dimensiona este puntal deja de gobernar.
  Queda por profundizar el caso asimétrico, donde el puntal además arrastra la diferencia de cortes
  entre niveles.
