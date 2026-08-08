---
titulo: El resorte completo — β_footing por balasto y la serie con la conexión (Ec. C-1)
disciplina: geotecnia
tema: Zapatas
normas: [NCh2369:2025, AISC Design Guide 1 3.ª ed.]
fecha: 2026-08-08
estado: verificado
veredicto: β_footing = 377 000 kN·m/rad — 19 veces la conexión. La serie da β_base = 18 480, el 55 % del 4EI/L de la columna — el suelo denso solo descuenta un 5 %. El resorte blando del «empotramiento» son los pernos y la placa, no la fundación.
post:
---

# El resorte completo — β_footing por balasto y la serie con la conexión (Ec. C-1)

La otra mitad del resorte del memo de rigidez rotacional: β_footing de la zapata rígida sobre
balasto, y la serie C-1.

## Caso

| Dato | Valor |
|---|---|
| Zapata | $B = L = 3{,}1$ m, **rígida** (Ec. 25, memo de la zapata): contacto plano |
| Suelo | $k_v = 5\,000$ tonf/m³ — la rigidez **sísmica** del informe (memo de asentamiento) |
| Conexión | $\beta_{connection} = 19\,430\ \text{kN}\cdot\text{m/rad}$ al momento del análisis (memo DG1 Ap. C) |
| Columna | HEB 300 de 6 m: $4EI/L = 33\,560\ \text{kN}\cdot\text{m/rad}$ (mismo contraste de la serie) |

## Supuestos

1. **S1** — Zapata rígida sobre cama de resortes $k_v$ uniforme (el contacto plano de §10.1.4).
2. **S2** — Contacto pleno: $\beta_{footing}$ es **cota superior** — con despegue (86 % apoyado en la sísmica) la rigidez cae.
3. **S3** — $k_v$ sísmico del informe (el memo de asentamiento mostró que el estático es ~⅓).
4. **S4** — Rotaciones aditivas: serie de la Ec. C-1 (la conexión y la fundación giran en serie).

## 1. β_footing, derivada por estática

Zapata rígida girada $\theta$ sobre la cama: $q(x) = k_v\,\theta\,x$, y el momento resultante
integra $x^2$ — la inercia del sello. Derivada, no recordada.  (S1, S2)

$$M = \int_A k_v\,\theta\,x^2\,dA = k_v\,\theta\,I \qquad\Rightarrow\qquad \beta_{footing} = k_v\,I = k_v\,\frac{B^4}{12}$$

## 2. El número

Con el $k_v$ sísmico del informe.  (S3)

$$\beta_{footing} = 5\,000 \cdot \frac{3{,}1^4}{12} = 38\,480\ \text{tonf}\cdot\text{m/rad} = 377\,360\ \text{kN}\cdot\text{m/rad}$$

## 3. La serie de la Ec. C-1

Las rotaciones se suman; las rigideces van en serie.  [DG1 Ap. C, Ec. C-1]  (S4)

$$\beta_{base} = \frac{\beta_{connection}\,\beta_{footing}}{\beta_{connection} + \beta_{footing}} = \frac{19\,430 \cdot 377\,360}{19\,430 + 377\,360} = 18\,480\ \text{kN}\cdot\text{m/rad}$$

```
      columna 4EI/L = 33 560
           │
   ╭───────┴───────╮
   │ β_connection  │ 19 430  ←── el resorte blando (pernos + placa + pedestal)
   ╰───────┬───────╯
   ╭───────┴───────╮
   │ β_footing     │ 377 360 ←── 19× más rígida (zapata B = 3,1 sobre k_v)
   ╰───────┬───────╯
   ═══════════════════  β_base = 18 480 kN·m/rad = 0,55·(4EI/L)
```

## 4. El contraste final de la serie

Contra la rigidez de la propia columna, como en el memo de la conexión.  (S4)

$$\frac{\beta_{base}}{4EI/L} = \frac{18\,480}{33\,560} = 0{,}55 \qquad \text{(conexión sola: } 0{,}58\text{)}$$

→ el suelo denso descuenta **5 %**: la fundación aporta 19 veces la rigidez de la conexión.

## 5. Sensibilidad: la arena suelta

Con $k_v = 1\,000$ tonf/m³ (S3):

$$\beta_{footing} = 75\,470 \qquad \beta_{base} = \frac{19\,430 \cdot 75\,470}{94\,900} = 15\,450\ \text{kN}\cdot\text{m/rad} \;\Rightarrow\; 0{,}46\,\frac{4EI}{L}$$

→ ni en suelo 5 veces más blando la fundación pasa a gobernar: la conexión sigue siendo el
resorte débil.

## Resumen

| Magnitud | Ref. | Valor | β/(4EI/L) |
|---|---|---:|---:|
| $\beta_{connection}$ (memo DG1 Ap. C) | Ecs. C-2 a C-12 | 19 430 kN·m/rad | 0,58 |
| $\beta_{footing}$ ($k_v$ = 5 000) | estática + S1 | 377 360 kN·m/rad | 11,2 |
| **$\beta_{base}$ (serie C-1)** | Ec. C-1 | **18 480 kN·m/rad** | **0,55** |
| $\beta_{base}$ con arena suelta | sensibilidad | 15 450 kN·m/rad | 0,46 |

## Veredicto

El resorte completo vale 0,55 del $4EI/L$ de su columna — la cadena entera cabe en ese número.
Y reparte la culpa: la fundación es 19 veces más rígida que la conexión, así que el
«empotramiento parcial» vive en los pernos, la placa y el aplastamiento. Modelar el resorte
del suelo y empotrar la conexión es afinar el resorte equivocado.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| DG1-C | AISC Design Guide 1, 3.ª ed. | Ap. C, Ec. C-1 (serie) | 2026-08-08 (rasterizada, p. impresa 189) |
| NCh | NCh2369:2025 | §10.1.4 — rigidez Ec. (25) y contacto plano | heredada del memo de la zapata (2026-08-08) |
| — | $\beta_{footing} = k_v B^4/12$ | derivación por estática (paso 1) | no aplica |

## Para promover a post

- Tesis candidata: el resorte equivocado — la base tiene dos resortes en serie y el blando no
  es el que todos modelan. Cierra la trilogía rigidez (DG1 Ap. C) + asentamiento + zapata.
- Con despegue (S2) la secante cae: la curva M–θ con área decreciente es desarrollo del post.
- El puente al Cap. 6 de la DG1 (base débil) queda tendido: β_base ya es número.
