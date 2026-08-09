---
titulo: Base empotrada — los pernos pagan la mitad de M_pe (NCh2369 §8.5.2)
disciplina: acero
tema: Placas base
normas: [NCh2369:2025, AISC Design Guide 1 3.ª ed., AISC 360-22]
fecha: 2026-08-08
estado: verificado
veredicto: No cierra — el piso de 0,5·M_pe* (279 kN·m) es 2,5 veces el momento del análisis y deja los pernos en 2,79. Sincerar la rigidez de la base o pagar el anclaje completo.
post:
---

# Base empotrada — los pernos pagan la mitad de M_pe (NCh2369 §8.5.2)

Pernos de anclaje de una base de columna **modelada como empotrada**: el momento de diseño tiene
el piso del 50 % de la capacidad flexural esperada (§8.5.2), resuelto con el bloque de la DG1.

## Caso

| Dato | Valor |
|---|---|
| Columna | HEB 300, A36 ($F_y = 250$ MPa); $A_g = 14\,910$ mm², $Z_x = 1\,869\,000$ mm³ (catálogo) |
| Placa / pedestal | $450 \times 450 \times 25$ mm; pedestal $1100 \times 1100$ mm, $f'_c = 25$ MPa |
| Pernos | 4 × 1″ F1554 gr. 36, patrón cuadrado $s = 350$ mm ($f = 175$ mm) |
| Cargas (análisis, LRFD 4.5) | $M_E = 110\ \text{kN}\cdot\text{m}$; $P_u = 250$ kN mínima concurrente |
| Axial máxima (sismo ×0,7$R_1$) | $P_{\text{máx}} = 400$ kN |

## Supuestos

1. **S1** — Todo en SI (N, mm, MPa); propiedades del HEB 300 tomadas de catálogo.
2. **S2** — $M_E$, $P_u$ y $P_{\text{máx}}$ son datos del análisis global con las combinaciones de 4.5.
3. **S3** — $q_{\text{máx}} = 12{,}43$ kN/mm heredado del memo de la llave de corte: $f_{p,\text{máx}} = 27{,}6$ MPa con $\sqrt{A_2/A_1}$ saturado en 2.
4. **S4** — 2 pernos en la fila traccionada.
5. **S5** — El anclaje al hormigón (breakout del grupo traccionado, ACI Cap. 17) queda fuera de alcance: lo cubre el memo de la tracción del grupo.
6. **S6** — $R_y = 1{,}3$ por C8.3.3 (A36 nacional, U. de Chile), en vez de la Tabla A3.1 de AISC 341-16.
7. **S7** — La placa de 25 mm es la del cuarteto y **no cumple**: el memo del espesor pide 52 mm. No
   afecta a este memo —el bloque de la DG1 no depende de $t_p$—, pero sí a la rigidez de la base.

## 1. Capacidad flexural esperada de la columna

$F_{ye} = R_y F_y = 1{,}3 \cdot 250 = 325$ MPa.  [NCh2369 §8.3.1 · §8.3.3]  (S6)

$$M_{pe} = F_{ye}\,Z_x = 325 \cdot 1\,869\,000 = 607{,}4\ \text{kN}\cdot\text{m}$$

## 2. Reducción por carga axial

Con la axial máxima de las combinaciones de 4.5 amplificadas por $0{,}7R_1 \ge 1{,}0$.  [NCh2369 §8.3.1]  (S2)

$$T_{ye} = F_{ye}\,A_g = 325 \cdot 14\,910 = 4\,846\ \text{kN}$$

$$M_{pe}^{*} = M_{pe}\left(1 - \frac{|P|}{T_{ye}}\right) = 607{,}4 \cdot \left(1 - \frac{400}{4\,846}\right) = 557{,}3\ \text{kN}\cdot\text{m}$$

## 3. El piso de la base empotrada

Los pernos se diseñan con las combinaciones de 4.5, con el momento de empotramiento **no menor
que el 50 % de la capacidad flexural esperada**.  [NCh2369 §8.5.2]

$$M_u = \max\left(M_E;\ 0{,}5\,M_{pe}^{*}\right) = \max\left(110;\ 278{,}6\right) = 278{,}6\ \text{kN}\cdot\text{m}$$

→ el piso manda por **×2,5**: el análisis pedía 110.

## 4. Régimen de excentricidad

$e = M_u/P_u$ [Ec. 4-39] contra $e_{crit}$ [Ec. 4-40], con $P_u$ mínima concurrente.  [DG1 §4.3.7]  (S3)

$$e = \frac{278{,}6 \cdot 10^6}{250\,000} = 1\,114\ \text{mm} \qquad e_{crit} = \frac{N}{2} - \frac{P_u}{2\,q_{\text{máx}}} = 225 - \frac{250}{2 \cdot 12{,}43} = 215\ \text{mm}$$

→ $e \gg e_{crit}$: **excentricidad grande**. Solución real [Ec. 4-59]: $\left(f + \tfrac{N}{2}\right)^2 = 160\,000 \ge \tfrac{2P_u(e+f)}{q_{\text{máx}}} = 51\,866$ ✓.

## 5. Bloque de compresión y tracción total

Ecs. 4-58 y 4-55, con $f + N/2 = 400$ mm.  [DG1 §4.3.7]  (S4)

$$Y = 400 - \sqrt{160\,000 - 51\,866} = 71{,}2\ \text{mm} \qquad T_u = q_{\text{máx}}\,Y - P_u = 12{,}43 \cdot 71{,}2 - 250 = 635{,}0\ \text{kN}$$

→ **317,5 kN por perno** en la fila traccionada. Pero la fila solo puede entregar
$2T_{ye}^{rod} = 377{,}2$ kN (memo de la silla): con ese tope el bloque cierra en $Y = 50{,}5$ mm y
[Ec. 4-56] la base **desarrolla 191,3 kN·m**, el 69 % del piso que §8.5.2 le exige.

## 6. Perno a tracción

Barra roscada: $F_{nt} = 0{,}75F_u$ [Tabla J3.2] con $F_u = 58$ ksi, y $R_n = F_n A_b$ [Ec. J3-1], $\phi = 0{,}75$.  [AISC 360-22 §J3.7]

$$\phi R_n = 0{,}75\left(0{,}75 \cdot 400\right)507 = 114{,}0\ \text{kN} \qquad \frac{T_u}{\phi R_n} = \frac{317{,}5}{114{,}0} = 2{,}79$$

→ uso **2,79** ✗; ni el gr. 105 salva la pulgada: $114 \cdot 125/58 = 246 < 317{,}5$ kN.

## 7. El contraste: qué pedía el análisis

Mismo bloque con $M_E = 110\ \text{kN}\cdot\text{m}$: $Y = 32{,}2$ mm,
$T_u = 12{,}43 \cdot 32{,}2 - 250 = 150{,}2$ kN → 75,1 kN/perno.

$$\frac{75{,}1}{114} = 0{,}66 \qquad \text{contra} \qquad 2{,}79$$

→ 0,66 ✓ contra 2,79 ✗: el análisis decía que los 4 × 1″ sobraban; la norma multiplica la
tracción por **4,2**.

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| Momento de diseño | NCh §8.5.2 | 110 kN·m | piso 278,6 kN·m | ×2,5 | piso manda |
| Solución real del bloque | DG1 Ec. 4-59 | 51 866 mm² | 160 000 mm² | 0,32 | ✓ |
| **Perno a tracción (piso §8.5.2)** | AISC §J3.7 | 317,5 kN | 114 kN | **2,79** | ✗ |
| Perno a tracción (solo análisis) | AISC §J3.7 | 75,1 kN | 114 kN | 0,66 | ✓ |

## Veredicto

No cierra, y por factor 2,8: el empotramiento declarado convierte 75 kN/perno en 318. Cerrar por
fuerza bruta pide 4 × 1¾″ gr. 36 ($\phi R_n = 349$ kN) y arrastra todo lo demás — largo libre
$\ge 8d = 356$ mm, $h_{ef}$, y un pedestal que ya gobernaba con pernos de 1″ (S5). La otra salida
es no declarar el empotramiento: la base real tiene rigidez intermedia, y modelarla así baja el
momento al del análisis.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| NCh | NCh2369:2025 | §8.5.2 (piso 50 %); §8.3.1 ($M_{pe}$, $M_{pe}^*$, $T_{ye}$); §8.3.3 + C8.3.3 ($R_y$) | 2026-08-08 |
| DG1 | AISC Design Guide 1, 3.ª ed. | §4.3.7, Ecs. 4-37, 4-39, 4-40, 4-55, 4-58, 4-59 | 2026-08-08 |
| DG1-q | AISC Design Guide 1, 3.ª ed. | §4.3.6 — $f_{p,\text{máx}}$ y $q_{\text{máx}}$ (S3) | 2026-08-07 (memo de la llave de corte) |
| AISC | ANSI/AISC 360-22 | §J3.7 Ec. J3-1 ($\phi = 0{,}75$); Tabla J3.2, fila «threaded parts»: $F_{nt} = 0{,}75F_u$ | 2026-08-08 (rasterizadas, pp. 16.1-137 y -141) |

## Para promover a post

- Tesis candidata: «empotrada» no es una condición de borde, es una promesa — y §8.5.2 la cobra
  en pernos que el análisis decía sobrados. El puente con el post de rigidez rotacional es
  directo: la base que no es ni empotrada ni rotulada tampoco debería pagar como empotrada.
- Figura: la tracción por perno del análisis (75) contra la del piso (318) sobre la misma placa.
- Por profundizar al promover: qué pasa con la silla y el pedestal si se paga el piso (C8.5.2
  pide diseñarlos para la fluencia esperada del perno nuevo, no del original).
