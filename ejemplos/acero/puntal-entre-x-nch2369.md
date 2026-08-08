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
2. **S2** — Ambos niveles en el mismo estado post-pandeo: al puntal llega una diagonal traccionada y una comprimida; $\cos\theta = 0{,}832$.
3. **S3** — Punto de cruce fijo fuera del plano: la contraparte está traccionada y una diagonal es continua (§8.6.4); $KL = L/2 = 3\,606$ mm.
4. **S4** — Puntal puro, sin carga gravitacional (no es viga de plataforma); $K = 1{,}0$, $L = 6$ m.
5. **S5** — Las componentes verticales del nudo van al pilar (§8.3.4, fuera de este memo).
6. **S6** — La Tabla 9 no aplica al puntal: no es diagonal (§8.6.3) y se diseña para permanecer elástico.

## 1. Capacidades esperadas de la diagonal, con el cruce

$F_{cre}$ es $F_{cr}$ evaluada con $F_{ye}$; $KL/r = 3\,606/48{,}6 = 74{,}1$.  [NCh2369 §8.3.1 · §8.6.4]  (S1, S3)

$$F_e = \frac{\pi^2 E}{74{,}1^2} = 359{,}3\ \text{MPa} \qquad F_{cre} = 0{,}658^{325/359{,}3} \cdot 325 = 222{,}6\ \text{MPa}$$

$$T_{ye} = 325 \cdot 2\,856 = 928{,}2\ \text{kN} \qquad P_{ne} = 1{,}14 \cdot 222{,}6 \cdot 2\,856 = 724{,}6\ \text{kN} \qquad 0{,}3P_{ne} = 217{,}4\ \text{kN}$$

→ sin el cruce, $KL/r = 148{,}2 > 133{,}3$: la diagonal ni cumple §8.6.3. Y el cruce obligado
sube la residual de 76,9 a 217,4 kN — **×2,8 sobre el puntal**.

## 2. El techo de la tracción

La tracción no necesita superar la de 4.5 con el sísmico ×$0{,}7R_1$.  [NCh2369 §8.6.7]  (S2)

$$P_u = \frac{V_u}{2\cos\theta} = \frac{400}{2 \cdot 0{,}832} = 240{,}4\ \text{kN} \qquad T = \min\left(928{,}2;\ 240{,}4 \cdot 3{,}5\right) = 841{,}3\ \text{kN}$$

## 3. Equilibrio del nudo intermedio

Traccionada en $T$, comprimida en su residual; la diferencia horizontal entra al puntal.  [NCh2369 §8.6.7]  (S2, S5)

```
  sismo →              desde la X superior
            T_ye ╱ 841,3            ╲ 0,3·P_ne 217,4     (kN)
                ╱                    ╲
   ●━━━━━━━━━ puntal: 519,1 kN (compresión) ━━━━━━━━━●
                ╲                    ╱
       0,3·P_ne ╲ 217,4             ╱ T_ye 841,3
                       desde la X inferior
```

$$F_{puntal} = \left(T - 0{,}3P_{ne}\right)\cos\theta = \left(841{,}3 - 217{,}4\right) \cdot 0{,}832 = 519{,}1\ \text{kN de compresión}$$

→ C8.6.7: si el puntal falla en compresión, la X degenera en una **K**, prohibida (§8.6.5).

## 4. El contraste con el análisis

En la X simétrica las componentes horizontales elásticas se cancelan en el nivel intermedio:
el modelo muestra el puntal **casi descargado** — el estado que lo dimensiona solo existe
después del pandeo.  (S2)

## 5. Compresión del puntal

HSS 150×8: $KL/r = 6\,000/58{,}1 = 103{,}3$.  [AISC 360-22 §E3]  (S4)

$$F_e = 184{,}9\ \text{MPa} \qquad F_n = 0{,}658^{250/184{,}9} \cdot 250 = 141{,}9\ \text{MPa} \quad \text{[Ec. E3-2]}$$

$$\phi_c P_n = 0{,}9 \cdot 141{,}9 \cdot 4\,544 = 580{,}5\ \text{kN} \qquad \frac{519{,}1}{580{,}5} = 0{,}89 \;✓$$

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| Esbeltez diagonal con cruce | NCh §8.6.4/§8.6.3 | 74,1 | 133,3 | 0,56 | ✓ |
| Esbeltez diagonal sin cruce | NCh §8.6.3 | 148,2 | 133,3 | 1,11 | ✗ |
| Techo de la tracción | NCh §8.6.7 | $T_{ye}$ = 928,2 kN | techo 841,3 kN | — | techo rige |
| **Compresión del puntal** | AISC §E3 | 519,1 kN | 580,5 kN | **0,89** | ✓ |
| Puntal según análisis elástico | — | ≈ 0 kN | — | — | (S2) |

## Veredicto

Cierra con HSS 150×150×8, y el número que enseña es el contraste: el análisis muestra el
puntal descargado y el equilibrio post-pandeo le pone 519 kN. El encadenado fino: el cruce es
obligatorio para la esbeltez de la diagonal, y ese mismo cruce casi triplica la residual que
el puntal equilibra — mejorar la diagonal carga al puntal.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| NCh | NCh2369:2025 | §8.3.1 (capacidades esperadas); §8.6.4 (cruce); §8.6.7 + C8.6.7 (equilibrio y techo) | 2026-08-08 (rasterizada, pp. impresas 79, 87, 89) |
| AISC | ANSI/AISC 360-22 | §E3, Ecs. E3-1 a E3-4 | 2026-08-08 (rasterizada, pp. 16.1-40/41) |

## Para promover a post

- Tesis candidata: el puntal descargado es el que sostiene la X — cierra el hueco que el paso 13
  de `ejemplo-diagonal-hss-traccion` declara, junto a la viga del chevron (§8.6.6).
- Figura: la cepa con la X pandeada (T y $0{,}3P_{ne}$) y el flujo horizontal entrando al puntal.
- El pilar (§8.3.4) tiene memo propio, y ahí el estado que dimensiona este puntal deja de gobernar.
  Queda por profundizar el caso asimétrico, donde el puntal además arrastra la diferencia de cortes
  entre niveles.
