---
titulo: Asentamiento de la zapata B = 3,1 — balasto contra elasticidad (Das §17.3)
disciplina: geotecnia
tema: Zapatas
normas: [Das 4.ª ed. Cap. 17]
fecha: 2026-08-08
estado: verificado
veredicto: 0,69 mm por balasto contra 2,2 mm por elasticidad — el k_v del informe es rigidez sísmica y subestima el asentamiento estático ×3. Ambos son minúsculos contra 25 mm; la respuesta vive en E_s (el rango de la Tabla 17.6 mueve el resultado ×3,7).
post:
---

# Asentamiento de la zapata B = 3,1 — balasto contra elasticidad (Das §17.3)

La misma zapata por los dos métodos de asentamiento inmediato: la constante de balasto del
informe y la teoría de la elasticidad. El contraste entre ambos es el caso.

## Caso

| Dato | Valor |
|---|---|
| Zapata | $B = L = 3{,}1$ m, $D_f = 1{,}80$ m, **rígida** (Ec. 25 del memo de la zapata) |
| Suelo | Arena media densa ($D_R \approx 65$ %), $\gamma = 1{,}85$ tonf/m³ |
| Informe | $k_v = 5\,000$ tonf/m³ (rigidez vertical **sísmica**) |
| Elasticidad | $E_s = 30$ MN/m² y $\mu_s = 0{,}3$ (Tabla 17.6, arena semi-densa a densa) |
| Carga sostenida | $D + L$ al sello: $N = 65{,}05$ tonf |

## Supuestos

1. **S1** — tonf y m; carga sostenida $D+L$ (el asentamiento sísmico instantáneo no se evalúa acá).
2. **S2** — $E_s$ y $\mu_s$ adoptados del rango de la Tabla 17.6; sensibilidad en el paso 5.
3. **S3** — $E_s$ constante hasta $z = 4B$ (estrato homogéneo): $n' = H/(B/2) = 8$.
4. **S4** — Tolerancia de referencia: 25 mm (usual para zapatas aisladas; el informe no fija otra).

## 1. Presión neta

Neta: lo aplicado menos lo excavado.  [Das §17.3]  (S1)

$$q_o = \frac{65{,}05}{3{,}1^2} - \gamma D_f = 6{,}77 - 3{,}33 = 3{,}44\ \text{tonf/m}^2$$

## 2. Por balasto

Con el $k_v$ del informe, directo.  (S1)

$$s = \frac{q_o}{k_v} = \frac{3{,}44}{5\,000} = 0{,}69\ \text{mm}$$

## 3. Los factores elásticos

Formas cerradas de Steinbrenner con $m' = 1$, $n' = 8$; $F_1$ validada contra la Tabla 17.3
(0,482).  [Das Ecs. (17.3)–(17.8) · Tabla 17.3]  (S3)

$$F_1 = \frac{A_0 + A_1}{\pi} = 0{,}482 \qquad F_2 = \frac{n'}{2\pi}\arctan A_2 = 0{,}020$$

$$I_s = F_1 + \frac{1 - 2\mu_s}{1 - \mu_s}F_2 = 0{,}482 + 0{,}571 \cdot 0{,}020 = 0{,}494 \qquad I_f = 0{,}747 \quad \text{[Tabla 17.5]}$$

## 4. Asentamiento elástico

Centro con $\alpha = 4$, $B' = B/2$; rígida = 0,93 × flexible.  [Das Ecs. (17.2), (17.10)]  (S2)

$$S_e = q_o\,(\alpha B')\,\frac{1 - \mu_s^2}{E_s}\,I_s I_f = 3{,}44 \cdot 6{,}2 \cdot \frac{0{,}91}{3\,059} \cdot 0{,}494 \cdot 0{,}747 = 2{,}34\ \text{mm}$$

$$S_{e,\text{rígida}} = 0{,}93 \cdot 2{,}34 = 2{,}2\ \text{mm}$$

## 5. La lectura cruzada

El $k_v$ estático implícito en la elasticidad, y la sensibilidad a $E_s$.  (S2)

$$k_v^{est} = \frac{q_o}{S_e} = \frac{3{,}44}{0{,}0022} \approx 1\,600\ \text{tonf/m}^3 \qquad \text{contra } 5\,000 \text{ del informe}$$

→ con el rango completo de la Tabla 17.6: $E_s = 15 \to 4{,}4$ mm; $E_s = 55 \to 1{,}2$ mm.

## Resumen

| Verificación | Ref. | Resultado | Límite | Uso | |
|---|---|---:|---:|---:|:--:|
| Balasto ($k_v$ sísmico) | informe | 0,69 mm | 25 mm | 0,03 | ✓ |
| Elástico rígida | Das (17.2), (17.10) | 2,2 mm | 25 mm | 0,09 | ✓ |
| Rango por $E_s$ | Das Tabla 17.6 | 1,2–4,4 mm | 25 mm | ≤ 0,18 | ✓ |
| $k_v$ estático implícito | — | ≈ 1 600 tonf/m³ | 5 000 (sísmico) | ×3 | ⚠ |

## Veredicto

Asentar, no asienta: hasta el extremo blando del rango queda 6 veces bajo la tolerancia. Lo
que el memo enseña es el ⚠: el $k_v = 5\,000$ del informe es rigidez **sísmica** — usarlo para
el asentamiento estático lo subestima ×3, porque la rigidez dinámica del suelo es mayor que la
estática. Y la elasticidad no es más «exacta»: su resultado viaja ×3,7 con el $E_s$ elegido
en la Tabla 17.6. Para el memo del resorte rotacional, la consecuencia es directa: la rigidez
que corresponde a $\beta_{footing}$ sísmica es la del informe.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| Das | Das, *Fundamentos de Ing. Geotécnica*, 4.ª ed. | §17.3: Ecs. (17.2)–(17.10); Tablas 17.3, 17.5, 17.6 | 2026-08-08 (rasterizadas, pp. impresas 515–517, 520–521, 523) |
| Zap | Memo de la zapata (cargas y rigidez Ec. 25) | — | heredada (2026-08-08) |

## Para promover a post

- La ficha de la wiki tenía la Ec. (17.3) mal transcrita — $(2-\mu_s)$ en vez de $(1-2\mu_s)$,
  un factor 4 en el término $F_2$ — detectada hoy contra la página rasterizada y corregida.
  Esa historia es material del post (la regla «manda el PDF» funcionando).
- Citar C10.1.2 (asentamientos instantáneos por constantes de balasto) releyéndolo en el PDF.
- El sitio ya tiene el post del $E_s$ dominante; este memo sería su gemelo numérico.
