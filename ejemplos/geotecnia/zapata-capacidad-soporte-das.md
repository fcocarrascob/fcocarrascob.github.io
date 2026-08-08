---
titulo: Capacidad de soporte de la zapata B = 3,1 — área efectiva e inclinación (Das)
disciplina: geotecnia
tema: Zapatas
normas: [Das 4.ª ed. Cap. 16, NCh2369:2025]
fecha: 2026-08-08
estado: verificado
veredicto: Sobra por ×4 — FS = 11,5 y 13,0 contra 3, y la S5 de la zapata queda saldada. La inclinación de 11° recorta la capacidad un 31 % (F_γi = 0,40) y aun así no gobierna — el 80 % de área apoyada sigue mandando.
post:
---

# Capacidad de soporte de la zapata B = 3,1 — área efectiva e inclinación (Das)

La deuda S5 del memo de la zapata: capacidad última por el método del área efectiva de
Meyerhof con factores de inclinación, contra las mismas combinaciones al sello.

## Caso

| Dato | Valor |
|---|---|
| Zapata | $B = L = 3{,}1$ m, $D_f = 1{,}80$ m — la del memo de la zapata |
| Suelo | Arena media densa: $\phi' = 30°$, $c' = 0$, $\gamma = 1{,}85$ tonf/m³ |
| Sobrecarga al sello | $q = \gamma D_f = 3{,}33$ tonf/m² |
| Compresión ($D + 0{,}75aL + 0{,}7E$) | $N = 79{,}55$ tonf, $V = 7{,}0$, $e = 0{,}299$ m |
| Levantamiento ($D + 0{,}7E$) | $N = 36{,}05$ tonf, $V = 7{,}0$, $e = 0{,}660$ m |

## Supuestos

1. **S1** — tonf y m (ASD), como toda la cadena de la zapata.
2. **S2** — Cargas al sello heredadas del memo de la zapata ($W = 37{,}05$ tonf incluido).
3. **S3** — $FS \ge 3$ para ambas combinaciones (el del informe, como el post del galpón).
4. **S4** — Nivel freático profundo: sin corrección de §16.5.
5. **S5** — Excentricidad en una sola dirección: $L' = L$.

## 1. Dimensiones efectivas e inclinación

$B' = B - 2e$; $\beta = \arctan(V/N)$ respecto de la vertical.  [Das §16.7, paso 2]  (S2, S5)

$$B'_{comp} = 3{,}1 - 2 \cdot 0{,}299 = 2{,}502\ \text{m} \qquad B'_{lev} = 3{,}1 - 2 \cdot 0{,}660 = 1{,}780\ \text{m}$$

$$\beta_{comp} = \arctan\left(\tfrac{7{,}0}{79{,}55}\right) = 5{,}0° \qquad \beta_{lev} = \arctan\left(\tfrac{7{,}0}{36{,}05}\right) = 11{,}0°$$

## 2. Factores de capacidad de carga

Con $\phi' = 30°$.  [Das Tabla 16.2]

$$N_q = 18{,}40 \qquad N_\gamma = 22{,}40$$

## 3. Factores de forma y profundidad

Forma con $B'/L'$; **profundidad con $B$, no con $B'$** (advertencia expresa del paso 3).  [Das Tabla 16.3 · §16.7]

$$F_{qs} = 1 + \frac{B'}{L'}\tan\phi' = 1{,}466 \;/\; 1{,}332 \qquad F_{\gamma s} = 1 - 0{,}4\frac{B'}{L'} = 0{,}677 \;/\; 0{,}770$$

$$F_{qd} = 1 + 2\tan\phi'\left(1 - \sin\phi'\right)^2 \frac{D_f}{B} = 1 + 0{,}289 \cdot \frac{1{,}80}{3{,}1} = 1{,}168 \qquad F_{\gamma d} = 1$$

## 4. Factores de inclinación

Meyerhof (1963), Hanna y Meyerhof (1981).  [Das Tabla 16.3]

$$F_{qi} = \left(1 - \frac{\beta°}{90°}\right)^2 = 0{,}891 \;/\; 0{,}771 \qquad F_{\gamma i} = \left(1 - \frac{\beta}{\phi'}\right)^2 = 0{,}693 \;/\; 0{,}402$$

## 5. Capacidad última

Con $c' = 0$ quedan dos términos; el de peso usa $B'$.  [Das Ecs. (16.23), (16.24)]

$$q'_u = q\,N_q F_{qs} F_{qd} F_{qi} + \tfrac{1}{2}\gamma B' N_\gamma F_{\gamma s} F_{\gamma d} F_{\gamma i}$$

$$q'_{u,comp} = 93{,}5 + 24{,}3 = 117{,}8\ \text{tonf/m}^2 \qquad q'_{u,lev} = 73{,}4 + 11{,}4 = 84{,}8\ \text{tonf/m}^2$$

$$Q_{\text{últ},comp} = 117{,}8 \cdot 2{,}502 \cdot 3{,}1 = 914\ \text{tonf} \qquad Q_{\text{últ},lev} = 84{,}8 \cdot 1{,}780 \cdot 3{,}1 = 468\ \text{tonf}$$

## 6. Factor de seguridad

$FS = Q_{\text{últ}}/Q$ contra 3.  [Das Ec. (16.25)]  (S3)

$$FS_{comp} = \frac{914}{79{,}55} = 11{,}5 \qquad FS_{lev} = \frac{468}{36{,}05} = 13{,}0$$

→ usos 0,26 y 0,23 ✓. Sin inclinación, $q'_{u,lev}$ sería 123,7: los factores de $\beta = 11°$
recortan **31 %** de la capacidad — y ni así se acercan a gobernar.

## Resumen

| Verificación | Ref. | Demanda | Capacidad ($FS=3$) | Uso | |
|---|---|---:|---:|---:|:--:|
| Soporte, compresión | Das (16.23)–(16.25) | 79,55 tonf | 305 tonf | 0,26 | ✓ |
| Soporte, levantamiento | Das (16.23)–(16.25) | 36,05 tonf | 156 tonf | 0,23 | ✓ |
| Efecto de la inclinación | Das Tabla 16.3 | $\beta = 11°$ | −31 % de $q'_u$ | — | no gobierna |
| Contra el informe | — | $q'_{u,lev}$ = 84,8 tonf/m² | $q_{adm}$ sísmica 30 | $FS$ implícito 2,8 | consistente |

## Veredicto

La capacidad sobra por un factor 4 respecto del $FS = 3$, y la afirmación que la zapata dejó
sin mostrar queda mostrada: con $\beta = 11°$ los factores de inclinación evaporan el 60 % del
término de peso ($F_{\gamma i} = 0{,}40$) y el 31 % de la capacidad total, pero el diseño ni se
entera — el 80 % de área apoyada (uso 0,93) sigue siendo el único número que dimensiona $B$.
El $q_{adm}$ sísmico del informe (3,0 kgf/cm²) resulta consistente con la última calculada.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| Das | Das, *Fundamentos de Ing. Geotécnica*, 4.ª ed. | §16.7 ($B' = B - 2e$, pasos 1–5); Ecs. (16.23)–(16.25); Tablas 16.2 y 16.3 | 2026-08-08 (rasterizadas, pp. impresas 484–486, 491–492) |
| NCh | NCh2369:2025 | §10.1.4 (combinaciones y cargas al sello) | heredada del memo de la zapata (2026-08-08) |

## Para promover a post

- No urge: el post del galpón ya publica este método con su tesis (los factores de inclinación
  valen un 142 %). Este memo es la aplicación a la zapata del cuarteto — vale como contraste.
- Si la cadena del resorte se promueve completa, este es el primer eslabón del capítulo suelo.
