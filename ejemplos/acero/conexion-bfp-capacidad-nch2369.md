---
titulo: La conexión BFP re-verificada por capacidad — NCh2369 §8.7.5
disciplina: acero
tema: Conexiones
normas: [NCh2369:2025, AISC 341-22, AISC 360-22]
fecha: 2026-08-08
estado: verificado
veredicto: Con el tope de §8.7.5 (41,6 tonf·m) la conexión pasa al filo (0,99) y la columna queda en 1,86/1,45/1,38. Los PL 100×12 no cumplen §8.7.6 (pide 20 mm) y la viga perforada rompe a 0,81·M_pe — el fusible dúctil no existe.
post:
---

# La conexión BFP re-verificada por capacidad — NCh2369 §8.7.5

Una conexión de placas de ala (BFP) dimensionada por resistencia según AISC 360-22, sometida a la
demanda de capacidad de NCh2369 §8.7.5.

## Caso

| Dato | Valor |
|---|---|
| Viga | W460×74 A992 ($F_y = 3\,520$ kgf/cm², $Z_x = 1\,655$ cm³, $S_x = 1\,457$ cm³) |
| Columna | W310×97 A992, $P_u = 200$ tonf, $H = 3{,}5$ m |
| Conexión | placas de ala $200 \times 20$ A36 (CJP a columna), 6 × Ø24 A490-N por placa; brazo $d + t_p = 0{,}477$ m |
| Solicitación (análisis) | $M_u = 32\ \text{tonf}\cdot\text{m}$ = 8 (gravitacional) + 24 (sismo); $R_1 = 2{,}0$ |
| Ala perforada | $A_{fg} = 27{,}55$ cm², $A_{fn} = 19{,}43$ cm², $F_u = 4\,570$ kgf/cm² |
| Catálogo (para las capacidades) | W310×97: $t_w = 9{,}9$, $t_f = 15{,}4$, $d_c = 308$, $b_{cf} = 305$ mm, $k_{des} = 30{,}5$ mm, $A_g = 123$ cm² · W460×74: $d_b = 457$ mm |

## Supuestos

1. **S1** — tonf y kgf/cm², como el caso original.
2. **S2** — Reparto $M_{grav} = 8$ y $M_E = 24\ \text{tonf}\cdot\text{m}$, y $R_1 = 2{,}0$: datos del análisis.
3. **S3** — Capacidades $\phi R_n$ del lado AISC calculadas con las Ecs. citadas y la geometría de catálogo; $l_b = t_p = 20$ mm y $Q_f = 1$ (perfil W). Entre el caso por resistencia y este, solo cambia la demanda.
4. **S4** — $R_y = R_t = 1{,}1$ para A992 (Tabla A3.2).
5. **S5** — El corte asociado $V_e = 2M_{pe}/L_h$ va a la plancha de corte, fuera de alcance.

## 1. Candidato 1: la capacidad esperada de la viga

Conexión, atiesadores y zona panel se diseñan para la capacidad esperada en flexión de la viga.
[NCh2369 §8.7.5 · §8.3.1]  (S4)

$$M_{pe} = R_y F_y Z_x = 1{,}1 \cdot 3\,520 \cdot 1\,655 = 64{,}1\ \text{tonf}\cdot\text{m}$$

→ el doble exacto del $M_u = 32$ del análisis.

## 2. Candidato 2: el tope de las combinaciones amplificadas

La resistencia requerida no necesita superar la de las combinaciones de 4.5 con el sismo
amplificado por $0{,}7R_1 \ge 1{,}0$.  [NCh2369 §8.7.5]  (S2)

$$M_{dis} = M_{grav} + 0{,}7R_1\,M_E = 8 + 1{,}4 \cdot 24 = 41{,}6\ \text{tonf}\cdot\text{m}$$

→ $41{,}6 < 64{,}1$: **manda el tope**, +30 % sobre el análisis en vez de +100 %.

## 3. Candidato 3: el tope físico que nadie calcula

Con el ala perforada, F13.1 **en propiedades esperadas** también controla por rotura
($R_t F_u A_{fn} = 97\,674 < R_y F_y A_{fg} = 106\,674$ kgf):

$$M_{ne} = \frac{R_t F_u A_{fn}}{A_{fg}}\,S_x = \frac{97\,674}{27{,}55} \cdot 1\,457 = 51{,}7\ \text{tonf}\cdot\text{m} = 0{,}81\,M_{pe}$$

→ la viga **rompe el ala antes de plastificar**: el fusible dúctil que §8.7.5 presupone no
existe.  [AISC §F13.1 · Tabla A3.2]  (S3, S4)

## 4. La conexión con la demanda de capacidad

$F_f = M_{dis}/(d + t_p) = 41{,}6/0{,}477 = 87{,}2$ tonf (+30 %). Pernos por $R_n = F_n A_b$ con
$F_{nv} = 68$ ksi [Ec. J3-1 · Tabla J3.2]; placa por $F_y A_g$ y $F_u A_e$ [Ecs. J4-1 y J4-2].  (S3)

$$6\left(0{,}75 \cdot 4\,780 \cdot 4{,}52\right) = 97{,}2 \qquad 0{,}90 \cdot 2\,530 \cdot 40 = 91{,}1 \qquad 0{,}75 \cdot 4\,080 \cdot 28{,}8 = 88{,}1\ \text{tonf}$$

$$\frac{87{,}2}{97{,}2} = 0{,}90 \quad \text{(pernos)} \qquad \frac{87{,}2}{91{,}1} = 0{,}96 \quad \text{(fluencia)} \qquad \frac{87{,}2}{88{,}1} = 0{,}99 \quad \text{(rotura)}$$

→ la conexión que sobraba (0,69–0,76) queda **al filo, pero pasa**. La viga por F13.1:
$41{,}6/42{,}3 = 0{,}98$ ✓.

## 5. La columna, que ya fallaba, queda lejos

Con $V_{col} = M_{dis}/H = 11{,}9$ tonf, el panel recibe $V_{pz} = 87{,}2 - 11{,}9 = 75{,}3$ tonf. Y
$\alpha P_r/P_y = 200/432{,}7 = 0{,}46 > 0{,}4$: la zona panel va por J10-10, no por J10-9.  (S3)

$$\frac{87{,}2}{47{,}0} = 1{,}86 \quad \text{(J10-1)} \qquad \frac{87{,}2}{60{,}1} = 1{,}45 \quad \text{(J10-2)} \qquad \frac{87{,}2}{68{,}4} = 1{,}27 \quad \text{(J10-4)} \qquad \frac{75{,}3}{54{,}4} = 1{,}38 \quad \text{(J10-10)}$$

→ cae hasta el aplastamiento que por resistencia se salvaba (0,98). Un doubler de 6 mm
sigue alcanzando: $75{,}3/87{,}3 = 0{,}86$ ✓.

## 6. Atiesadores de continuidad: obligatorios y con mínimos

§8.7.6 los exige **a todo evento**, con ancho atiesado ≥ ancho del ala de la viga más ancha **o
de la placa que entrega la carga**, y espesor ≥ el mayor de esos espesores.  [NCh2369 §8.7.6]

$$2 \cdot 100 + 9{,}9 = 209{,}9 \ge 200\ \text{mm} \qquad t_{st} = 12 < \max(14{,}5;\ 20) = 20\ \text{mm}$$

→ ancho ✓, espesor ✗: **manda la placa de 20, no el ala de 14,5** → PL 100×20.

## Resumen

| Verificación | Ref. | Uso por resistencia ($M_u$ 32) | Uso por §8.7.5 (41,6) | |
|---|---|---:|---:|:--:|
| Pernos — grupo J3.7 | AISC §J3.7 | 0,69 | 0,90 | ✓ |
| Placa de ala — fluencia | Ec. J4-1 | 0,74 | 0,96 | ✓ |
| Placa de ala — rotura | Ec. J4-2 | 0,76 | 0,99 | ✓ |
| Viga — ala perforada | Ec. F13-1 | 0,76 | 0,98 | ✓ |
| Columna — aplastamiento alma | Ec. J10-4 | 0,98 | 1,27 | ✗ |
| Columna — zona panel | Ec. J10-10 | 1,07 | 1,38 | ✗ |
| Columna — fluencia local alma | Ec. J10-2 | 1,12 | 1,45 | ✗ |
| Columna — flexión local ala | Ec. J10-1 | 1,43 | 1,86 | ✗ |
| Atiesador — espesor mínimo | NCh §8.7.6 | no exigido | 12 vs. 20 mm | ✗ |

## Veredicto

El tope de §8.7.5 salva la conexión (0,99, sin margen) pero no la columna: cuatro estados límite
entre 1,27 y 1,86. Cierra con doubler de 6 mm y atiesadores PL 100×**20** (§8.7.6: manda la
placa), que además resuelven J10-1/J10-2. El hallazgo de fondo es el candidato 3: la BFP apernada
rompe el ala a $0{,}81\,M_{pe}$ — el mecanismo dúctil no se forma, y §8.7.4 (hoy recomendación)
ni alcanzaría a actuar.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| NCh | NCh2369:2025 | §8.7.4 + C8.7.4; §8.7.5 + C8.7.5 ($V_e = 2M_{pe}/L_h$, tope); §8.7.6 + C8.7.6, Fig. C-3; §8.3.1 | 2026-08-08 |
| AISC341 | ANSI/AISC 341-22 | Tabla A3.2 — A992: $R_y = R_t = 1{,}1$ | 2026-08-08 |
| AISC-J | ANSI/AISC 360-22 | §J3.7 Ec. J3-1 + Tabla J3.2; §J4.1 Ecs. J4-1 y J4-2 | 2026-08-08 (rasterizadas, pp. 16.1-137, -141, -145) |
| AISC-J10 | ANSI/AISC 360-22 | §J10.1 Ec. J10-1; §J10.2 Ec. J10-2; §J10.3 Ec. J10-4; §J10.6 Ec. J10-10 | 2026-08-08 (rasterizadas, pp. 16.1-150, -151, -154) |
| AISC-F | ANSI/AISC 360-22 | §F13.1 Ec. F13-1 y su criterio (a)/(b) | 2026-08-08 (rasterizada, p. 16.1-72) |

## Para promover a post

- Tesis candidata: el tope de 0,7$R_1$ es la válvula que hace pagable el diseño por capacidad —
  pero la columna no se salva ni con válvula, y el fusible dúctil de la BFP apernada es un
  supuesto, no un hecho.
- Contraste normativo listo: §8.7.4 como recomendación vs. AISC 341 §E3 obligatorio, y §8.7.6
  dimensionando el atiesador por la placa, no por el ala.
- Gotcha de edición para el libro mayor: en 360-22 el §J3.7 es *Tensile and Shear Strength of Bolts
  and Threaded Parts* (Ec. J3-1) y el caso combinado se corrió a §J3.8 (Ecs. J3-2, J3-3a/b). En
  360-16 el combinado era J3.7 — citar «J3.7» sin edición apunta a dos cláusulas distintas.
- Figura: las barras de resistencia y de capacidad lado a lado, con el tope 41,6 entre 32 y
  64,1; el ala perforada rompiendo a 0,81·$M_{pe}$.
