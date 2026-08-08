---
titulo: La zapata B = 3,1 contra Das — capacidad de soporte y asentamiento
disciplina: geotecnia
tema: Zapatas
normas: [Das 4.ª ed. Caps. 16 y 17, NCh2369:2025]
fecha: 2026-08-08
estado: verificado
veredicto: Los dos estados límite que NCh2369 no cubre sobran por mucho: FS = 11,5 y 13,0 contra 3, y 2,2 mm contra 25. La inclinación de 11° recorta la capacidad un 31 % y ni así gobierna — el 80 % de área apoyada sigue siendo lo único que dimensiona B. Y el k_v del informe es rigidez sísmica: subestima el asentamiento estático ×3.
post:
---

# La zapata B = 3,1 contra Das — capacidad de soporte y asentamiento

Lo que el informe de mecánica de suelos pide y NCh2369 Cap. 10 no verifica, sobre la misma zapata:
capacidad última por área efectiva de Meyerhof, y asentamiento inmediato por balasto y por
elasticidad. Salda la deuda S5 del memo de la zapata.

## Caso

| Dato | Valor |
|---|---|
| Zapata | $B = L = 3{,}1$ m, $D_f = 1{,}80$ m, **rígida** (Ec. 25 del memo de la zapata) |
| Suelo | Arena media densa: $\phi' = 30°$, $c' = 0$, $\gamma = 1{,}85$ tonf/m³, $D_R \approx 65$ % |
| Sobrecarga al sello | $q = \gamma D_f = 3{,}33$ tonf/m² |
| Compresión ($D + 0{,}75aL + 0{,}7E$) | $N = 79{,}55$ tonf, $V = 7{,}0$, $e = 0{,}299$ m |
| Levantamiento ($D + 0{,}7E$) | $N = 36{,}05$ tonf, $V = 7{,}0$, $e = 0{,}660$ m |
| Carga sostenida ($D + L$) | $N = 65{,}05$ tonf al sello |
| Informe / elasticidad | $k_v = 5\,000$ tonf/m³ (vertical **sísmica**); $E_s = 30$ MN/m², $\mu_s = 0{,}3$ (Tabla 17.6) |

## Supuestos

1. **S1** — tonf y m (ASD), como toda la cadena de la zapata; cargas al sello heredadas del memo de la zapata ($W = 37{,}05$ tonf incluido).
2. **S2** — $FS \ge 3$ para ambas combinaciones (el del informe, como el post del galpón).
3. **S3** — Nivel freático profundo: sin corrección de §16.5. Excentricidad en una sola dirección ($L' = L$).
4. **S4** — El asentamiento se evalúa con la carga sostenida $D+L$; el sísmico instantáneo no se evalúa acá.
5. **S5** — $E_s$ y $\mu_s$ adoptados del rango de la Tabla 17.6; sensibilidad en el paso 6.
6. **S6** — $E_s$ constante hasta $z = 4B$ (estrato homogéneo): $n' = H/(B/2) = 8$.
7. **S7** — Tolerancia de referencia: 25 mm (usual para zapatas aisladas; el informe no fija otra).

## 1. Dimensiones efectivas e inclinación

$B' = B - 2e$; $\beta = \arctan(V/N)$ respecto de la vertical.  [Das §16.7, paso 2]  (S1, S3)

$$B'_{comp} = 3{,}1 - 2 \cdot 0{,}299 = 2{,}502\ \text{m} \qquad B'_{lev} = 3{,}1 - 2 \cdot 0{,}660 = 1{,}780\ \text{m}$$

$$\beta_{comp} = \arctan\left(\tfrac{7{,}0}{79{,}55}\right) = 5{,}0° \qquad \beta_{lev} = \arctan\left(\tfrac{7{,}0}{36{,}05}\right) = 11{,}0°$$

## 2. Los cuatro juegos de factores

Capacidad de carga con $\phi' = 30°$; forma con $B'/L'$ pero **profundidad con $B$, no con $B'$**
(advertencia expresa del paso 3); inclinación por Meyerhof (1963) y Hanna y Meyerhof (1981).
[Das Tablas 16.2 y 16.3 · §16.7]

$$N_q = 18{,}40 \qquad N_\gamma = 22{,}40 \qquad F_{qd} = 1 + 2\tan\phi'(1 - \sin\phi')^2 \frac{D_f}{B} = 1{,}168 \qquad F_{\gamma d} = 1$$

$$F_{qs} = 1{,}466 \;/\; 1{,}332 \qquad F_{\gamma s} = 0{,}677 \;/\; 0{,}770 \qquad F_{qi} = \left(1 - \tfrac{\beta°}{90°}\right)^2 = 0{,}891 \;/\; 0{,}771 \qquad F_{\gamma i} = \left(1 - \tfrac{\beta}{\phi'}\right)^2 = 0{,}693 \;/\; 0{,}402$$

## 3. Capacidad última y factor de seguridad

Con $c' = 0$ quedan dos términos; el de peso usa $B'$.  [Das Ecs. (16.23) a (16.25)]  (S2)

$$q'_u = q\,N_q F_{qs} F_{qd} F_{qi} + \tfrac{1}{2}\gamma B' N_\gamma F_{\gamma s} F_{\gamma d} F_{\gamma i} = 117{,}8 \;/\; 84{,}8\ \text{tonf/m}^2$$

$$Q_{\text{últ}} = q'_u\,B'L = 914 \;/\; 468\ \text{tonf} \qquad FS = \frac{914}{79{,}55} = 11{,}5 \qquad \frac{468}{36{,}05} = 13{,}0$$

→ usos 0,26 y 0,23 ✓. Sin inclinación, $q'_{u,lev}$ sería 123,7: los factores de $\beta = 11°$
recortan **31 %** de la capacidad — y ni así se acercan a gobernar.

## 4. Presión neta y asentamiento por balasto

Neta: lo aplicado menos lo excavado; con el $k_v$ del informe, directo.  [Das §17.3]  (S4)

$$q_o = \frac{65{,}05}{3{,}1^2} - \gamma D_f = 6{,}77 - 3{,}33 = 3{,}44\ \text{tonf/m}^2 \qquad s = \frac{q_o}{k_v} = \frac{3{,}44}{5\,000} = 0{,}69\ \text{mm}$$

## 5. Asentamiento elástico

Formas cerradas de Steinbrenner con $m' = 1$, $n' = 8$; $F_1$ validada contra la Tabla 17.3.
Centro con $\alpha = 4$, $B' = B/2$; rígida = 0,93 × flexible.  [Das Ecs. (17.2) a (17.10) · Tablas 17.3 y 17.5]  (S5, S6)

$$I_s = F_1 + \frac{1 - 2\mu_s}{1 - \mu_s}F_2 = 0{,}482 + 0{,}571 \cdot 0{,}020 = 0{,}494 \qquad I_f = 0{,}747$$

$$S_e = q_o\,(\alpha B')\,\frac{1 - \mu_s^2}{E_s}\,I_s I_f = 3{,}44 \cdot 6{,}2 \cdot \frac{0{,}91}{3\,059} \cdot 0{,}494 \cdot 0{,}747 = 2{,}34\ \text{mm} \;\Rightarrow\; S_{e,\text{rígida}} = 2{,}2\ \text{mm}$$

## 6. La lectura cruzada

El $k_v$ estático implícito en la elasticidad, y la sensibilidad a $E_s$.  (S5)

$$k_v^{est} = \frac{q_o}{S_e} = \frac{3{,}44}{0{,}0022} \approx 1\,600\ \text{tonf/m}^3 \qquad \text{contra } 5\,000 \text{ del informe}$$

→ con el rango completo de la Tabla 17.6: $E_s = 15 \to 4{,}4$ mm; $E_s = 55 \to 1{,}2$ mm.

## Resumen

| Verificación | Ref. | Demanda | Capacidad / límite | Uso | |
|---|---|---|---|---:|:--:|
| Soporte, compresión | Das (16.23)–(16.25) | 79,55 tonf | 305 tonf ($FS=3$) | 0,26 | ✓ |
| Soporte, levantamiento | Das (16.23)–(16.25) | 36,05 tonf | 156 tonf ($FS=3$) | 0,23 | ✓ |
| Efecto de la inclinación | Das Tabla 16.3 | $\beta = 11°$ | −31 % de $q'_u$ | — | no gobierna |
| Contra el informe | — | $q'_{u,lev}$ = 84,8 tonf/m² | $q_{adm}$ sísmica 30 | $FS$ implícito 2,8 | consistente |
| Asentamiento, balasto | informe | 0,69 mm | 25 mm | 0,03 | ✓ |
| Asentamiento, elástico rígida | Das (17.2), (17.10) | 2,2 mm | 25 mm | 0,09 | ✓ |
| Rango por $E_s$ | Das Tabla 17.6 | 1,2–4,4 mm | 25 mm | ≤ 0,18 | ✓ |
| $k_v$ estático implícito | — | ≈ 1 600 tonf/m³ | 5 000 (sísmico) | ×3 | ⚠ |

## Veredicto

Los dos estados límite del informe sobran, y por márgenes que no se parecen a los de NCh2369: la
capacidad por factor 4 sobre el $FS = 3$, el asentamiento por factor 11 bajo la tolerancia. Con
$\beta = 11°$ los factores de inclinación evaporan el 60 % del término de peso ($F_{\gamma i} =
0{,}40$) y el 31 % de la capacidad total, y el diseño ni se entera: el 80 % de área apoyada
(uso 0,93) sigue siendo el único número que dimensiona $B$. El ⚠ está en el $k_v$: los 5 000 del
informe son rigidez **sísmica**, y usarlos para el asentamiento estático lo subestima ×3. La
elasticidad tampoco es «exacta» — su resultado viaja ×3,7 con el $E_s$ elegido en la Tabla 17.6.
Para el memo del resorte rotacional la consecuencia es directa: la rigidez que corresponde a
$\beta_{footing}$ sísmica es la del informe.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| Das-16 | Das, *Fundamentos de Ing. Geotécnica*, 4.ª ed. | §16.7 ($B' = B - 2e$, pasos 1–5); Ecs. (16.23)–(16.25); Tablas 16.2 y 16.3 | 2026-08-08 (rasterizadas, pp. impresas 484–486, 491–492) |
| Das-17 | Das, *Fundamentos de Ing. Geotécnica*, 4.ª ed. | §17.3: Ecs. (17.2)–(17.10); Tablas 17.3, 17.5, 17.6 | 2026-08-08 (rasterizadas, pp. impresas 515–517, 520–521, 523) |
| NCh | NCh2369:2025 | §10.1.4 (combinaciones, cargas al sello y rigidez Ec. 25) | heredada del memo de la zapata (2026-08-08) |

## Para promover a post

- La ficha de la wiki tenía la Ec. (17.3) mal transcrita — $(2-\mu_s)$ en vez de $(1-2\mu_s)$, un
  factor 4 en el término $F_2$ — detectada contra la página rasterizada y corregida. Esa historia
  es material del post (la regla «manda el PDF» funcionando).
- No urge la mitad de capacidad: el post del galpón ya publica ese método con su tesis (los
  factores de inclinación valen un 142 %). Acá vale como contraste con el 80 % de área.
- Citar C10.1.2 (asentamientos instantáneos por constantes de balasto) releyéndolo en el PDF.
- El sitio ya tiene el post del $E_s$ dominante; este memo sería su gemelo numérico.
