# PLANILLAS — cobertura y estado de las planillas del canvas

Registro vivo de las planillas de `public/planillas/`, que son la **reproducción
independiente** de cada ejemplo de cálculo: mismos datos de entrada declarados, fórmulas
armadas desde la norma, y al final un bloque de **contrastes** que compara cada número
que la planilla calcula contra el número que el post publica. Sirven para dos cosas:

1. **Para el lector**: abrir el ejemplo en `/herramientas/canvas?planilla=<slug>`, variar
   parámetros y ver cómo cambian los números y los veredictos ✓/✗. Por eso los datos de
   entrada van primero y a la vista, nunca incrustados en una fórmula.
2. **Para la auditoría**: `npm run verify:planillas` corre todas con el mismo motor del
   canvas (mismas unidades, mismo chequeo dimensional) y falla si cualquier verificación
   da `false` sin declarar. Un contraste que falla = una discrepancia cálculo↔post.

Este registro es la tabla de estado; los **hallazgos** que salen de los contrastes se
registran donde siempre, en `AUDIT.md`, con sus severidades. Aquí solo se apunta cuántos
hay y hacia dónde mirar.

## Qué reproduce una planilla (y qué no)

La planilla reproduce la cadena normativa del post **a partir de sus datos de entrada
declarados**. No interactúa con modelos externos: un número que viene de un modelo
SAP2000, de un catálogo o de una tabla de norma entra como dato declarado con su cita
("Tabla J3.3M: d_h = 28 mm") y es frontera explícita de lo verificado. Tampoco ve prosa,
figuras ni citas — eso sigue siendo territorio del auditor (`AUDIT.md`).

> **El formato `{version, regions}` lo usa también `struct_llm`**, que genera planillas
> desde el `Resultado` de sus tools. Esas hojas **no viven acá ni entran en las tablas de
> estado de este archivo**: son entregables de ese proyecto, autocontenidos, y su bloque de
> contraste compara contra la tool, no contra un post. El formato es el punto de contacto;
> los repos siguen separados.

## El ciclo, un ejemplo a la vez

Una planilla por vuelta, sin adelantar la siguiente hasta cerrar la anterior:

1. **Construir** la planilla desde la norma y los datos de entrada del post
   (§ Convenciones: independencia). Sale de un agente con el PDF de la norma a
   la vista, nunca de copiar los pasos intermedios del post. Cada **valor de
   tabla** que el post cite se abre en el PDF y se lee en la columna de las
   unidades del cálculo (§ Convenciones: valores de tabla). Es el paso que no
   se puede saltar: un número tabulado mal citado no lo caza ningún recálculo,
   porque la aritmética del post cuadra consigo misma.
2. **Dibujar el esquema paramétrico** en `public/esquemas/<slug>.svg` y colgarlo
   de la región `image` (§ Esquema paramétrico). No es opcional: una planilla
   sin esquema queda incompleta.
3. **Verificar**: `npm run verify:planilla -- public/planillas/<slug>.json`.
   Falla por número que no cuadra, por unidad incoherente y por token de
   esquema que no resuelve. Y con el sitio servido,
   `npm run reflow:planilla -- <slug>` recoloca los bloques para que ninguno
   quede encima de otro (§ Convenciones: disposición de los bloques).
   **Ojo con el servido**: `reflow` y `pdf:planilla` abren la planilla desde el
   sitio, o sea desde `dist/`, y escriben en `public/`. Después de reflow hay
   que rehacer el build (o copiar el `.json` a `dist/planillas/`) antes de
   imprimir, o el PDF sale del layout viejo — y como cuadra consigo mismo, el
   chequeo pasa igual.
4. **Mirar el esquema**: `npm run render:esquema -- public/planillas/<slug>.json`
   resuelve los tokens contra la hoja, rasteriza el SVG con Chromium y deja el
   PNG en un temporal. Que los tokens resuelvan no dice que el dibujo se lea
   (§ Esquema paramétrico: revisión visual). Sin abrir ese PNG el paso no está
   hecho.
5. **Aplicar los fixes mecánicos** al post — redondeos, dígitos, un número mal
   arrastrado. Si un hallazgo toca una **tesis o una decisión de diseño**, ahí
   se para: eso se conversa antes de tocar el post.
6. **Revisar los cortes de página**: con el sitio servido,
   `npm run pdf:planilla -- <slug>` imprime la A4 de verdad y comprueba que el
   corte que el canvas anuncia es el que el PDF tiene. Donde una sección de
   cálculo quede partida a la mala —arranca al pie, o se derrama por dos
   líneas— se pone un salto forzado en su encabezado (§ Convenciones: cortes de
   página). Una sección más larga que una página se parte igual: eso no se
   fuerza, se acepta.
7. **Registrar**: los hallazgos con su severidad en `AUDIT.md`, la fila de este
   registro con pasos, verificaciones, contrastes y fecha de corrida, y la
   sección **`## La planilla`** al cierre del post (§ Convenciones: cómo se
   publica un ejemplo con planilla). El enlace no se escribe: lo pone el layout.
8. **Cerrar**: `npm run verify:planillas` (todas, no solo la nueva), `npm run
   build`, y commit del par planilla + esquema + post corregido.

## Convenciones

- **Independencia**: la planilla se construye desde la norma (verificada en el PDF) y los
  datos de entrada del post — nunca transcribiendo los pasos intermedios del post, que es
  verificar que el post coincide consigo mismo.
- **La planilla es el cálculo, no el relato: cita + regla, en una línea.** Cada paso lleva
  la cláusula que lo autoriza y el enunciado de la regla, y nada más. El **porqué**, las
  decisiones de proyecto y las conclusiones son del post; repetirlos en la hoja la vuelve
  ilegible justo donde tiene que ser operable. Concretamente **no van**: los párrafos que
  explican un fenómeno, las conclusiones («gobierna el detallado, no la resistencia»), la
  narración de un hallazgo de auditoría —eso vive en `AUDIT.md`— y las ramas que existen
  solo como evidencia de un hallazgo ya aplicado. **Sí van**, en una línea: la cita, la
  regla, y toda **hipótesis declarada** (por qué ψ = 1, por qué la fila delantera), porque
  sin ella el número no se puede reconstruir. El indicador es la razón prosa/math: las de
  gusset están en 0,07–0,20 y son el patrón; por encima de 0,45 la hoja se convirtió en
  post. El 2026-08-01 las tres de hormigón estaban en 0,47 / 0,59 / 0,82 y se podaron a
  0,25 / 0,41 / 0,41 sin perder una sola cita.
  **Y por eso la hoja tiene que responder «qué controla»**, que es lo que el lector viene a
  hacer cuando cambia un dato: al final, antes del esquema, van `u_max := max(…)`, una
  región `program` **`gobierna`** que devuelve el nombre del estado límite que manda —una
  cadena de `if/else if`, se recalcula sola y el esquema la puede rotular con `{{gobierna}}`—
  y un único `u_max <= 1`. **No** una batería de booleanos «¿gobierna éste?»: cinco de ellos
  darían `false` por diseño y habría que declararlos en `esperadoFalso`, que es justo lo que
  esa lista no debe contener.
- **Valores de tabla: al PDF, y en la columna de las unidades del cálculo.** Toda constante
  que venga de una tabla de la norma —$F_{nv}$, $F_y$ de un grado, un $\phi$, un coeficiente,
  una dimensión de agujero— se lee en el PDF y se declara en la planilla con su cita
  («Tabla J3.3M: $d_h$ = 24 mm»), aunque el post ya la publique. Los códigos escritos en
  unidades imperiales traen **dos columnas**, y no son la misma: en AISC 360-22 la Tabla J3.2
  tabula 54 ksi **(370 MPa)** para el Grupo 120 con rosca incluida, mientras la conversión
  exacta de las 54 ksi da 372. En un cálculo métrico manda **la columna métrica**; ésa es la
  convención del sitio (370/470 para el Grupo 120, 470/580 para el Grupo 150, 190 para el
  A307).
  **Por qué es un paso propio**: el 2026-08-01, la planilla de la shear tab encontró que el
  post citaba 372 MPa «de la Tabla J3.2». Los 0,5 % de diferencia dieron vuelta el número
  insignia del ejemplo —el perno extremo pasó de uso 0,995 a 1,00— y arrastraban a otros tres
  posts. Ningún recálculo lo habría encontrado: la aritmética publicada era correcta a partir
  del valor equivocado. Solo aparece abriendo la tabla. **Y vuelve a entrar si no se cita**: el
  mismo día, la planilla del empalme apernado encontró los 372 otra vez, en el único post que
  quedaba sin alinear. Por eso el fix no es solo cambiar el número — es dejar escrita la
  procedencia junto a él («Tabla J3.2: 54 ksi = 370 MPa, la columna métrica»), que es lo que
  impide que la próxima vuelta lo reintroduzca.
  **En ACI la trampa no es una columna: es una edición entera.** ACI 318 se publica dos veces
  —inch-pound y SI— y sus coeficientes empíricos **no son conversiones exactas uno del otro**:
  ACI redondea el $2\sqrt{f'_c}$ (psi) del corte a $0{,}17\lambda\sqrt{f'_c}$ (MPa), que en
  kgf/cm² son $0{,}53$ y $0{,}543$. La práctica chilena trabaja en kgf/cm² con la familia
  inch-pound entera (0,53 · 0,8 · 14 · 2,1 · 1,06), así que un post puede citar una tabla de
  la edición SI y calcular con el coeficiente de la otra sin que nada chirríe. El 2026-08-01
  la planilla de la viga a flexión y corte encontró exactamente eso, con una `Note` que además
  afirmaba que «es la misma ecuación; solo cambió el sistema de unidades». **El PDF en disco es
  la edición SI, y ésa es la columna métrica**: se adoptaron 0,543 · 2,108 · 1,054 · 0,265 ·
  3,57, se movieron diez números publicados un 2 % (ninguna conclusión cambió) y la `Note` pasó
  a ser una tabla de dos columnas con la cita de cada una. La defensa permanente es un contraste
  por coeficiente contra el factor exacto $\sqrt{1\,\text{MPa}/1\,\text{kgf/cm}^2} = 3{,}1933$,
  que es lo que impide que la familia vieja vuelva a entrar en las nueve planillas de hormigón
  que faltan.
- **Contrastes**: un booleano por cada número publicado en las tablas del post (más los
  intermedios clave publicados en prosa), con id `c_*`, al final de la hoja bajo el
  encabezado «CONTRASTE CON EL POST». Se omiten los redundantes (un uso que es cociente
  de dos números ya contrastados), salvo el uso que gobierna.
- **Tolerancia**: media unidad del último dígito publicado —
  `abs(Rd_pan - 119.12 tonf) < 0.005 tonf`. El post publica redondeado; la planilla
  calcula a precisión completa.
- **Una columna derivada se recalcula, no se escala.** Cuando el post compara dos
  configuraciones y una es N veces la otra —dos planos de corte en vez de uno, dos
  elementos en vez de uno—, la columna derivada hay que calcularla desde los datos,
  no multiplicando o dividiendo el número **ya redondeado** de la otra. La planilla
  lo hace solo si se le declara el factor (`n_ea := 2`) y se aplica sobre la
  cantidad de precisión completa. **Por qué es su propia regla**: el 2026-08-01 la
  planilla del doble ángulo encontró tres hallazgos y **los tres eran esto** —
  `2 × 10 757 = 21 514` cuando el exacto es 21 513; el uso de bloque publicado como
  0,42 porque es el 0,83 de la shear tab partido por dos, cuando `30/72,311` da
  0,41. Cada paso de redondeo intermedio se acumula, y en un post comparativo la
  columna derivada es justo la que el lector lee para sacar la conclusión.
  **Y no hace falta un factor para caer en lo mismo**: el 2026-08-01 la planilla de la
  viga LTB encontró los otros dos hallazgos de la especie sin que hubiera ningún «×2»
  — el post escribía la Ec. F2-4 como `1,14 · 1279` (los dos operandos ya redondeados,
  1458 en vez de 1453) y la Ec. F2-2 con cuatro operandos redondeados a la vez
  ($C_b$, $M_p$, $M_p - 0{,}7F_yS_x$), que acumularon hasta mover el número insignia
  del caso B, 50,9 publicado como 51,0. El fix es el mismo en los dos: **la ecuación
  exhibe sus operandos con los dígitos que de verdad usa** ($1{,}136$, $58{,}26$,
  $22{,}36$), aunque la sección de más arriba los publique redondeados.
  **Y a veces el operando redondeado es el propio dato de entrada, y ahí el fix va al
  revés**: el 2026-08-01 la planilla de la viga-columna encontró que $M_r = 1{,}34 \cdot 8{,}0$
  arrastraba hasta el número insignia —el uso combinado daba 0,93495, que redondea a 0,93
  y no al 0,94 publicado, a $5\cdot10^{-5}$ de la frontera—, y la raíz no era la ecuación
  sino la tabla del caso: declaraba $w_u = 1{,}3$ tonf/m, de donde $M_u = 7{,}96$ publicado
  como 8,0 y **después usado como operando**. Cuando el dato de entrada ya es de por sí
  un redondeo (una carga de viento, una carga de piso), el arreglo barato es **darle al
  dato los dígitos que la cadena de verdad usa** ($w_u = 1{,}306$) en vez de propagar el
  corrimiento por todo el post: acá dejó los cinco números publicados intactos. Cuál de
  las dos puntas se mueve —el dato o los resultados— es decisión del autor, no de la
  planilla; lo que la planilla aporta es el número que muestra que hay que elegir.
- **Un coeficiente que depende de la configuración se deriva, no se cita.** En los
  ejemplos de miembros hay factores tabulados por caso —el $C_b$ de la Ec. F1-1, un
  $K$, un $C_m$— que es tentador declarar como dato. Si el post **compara dos
  configuraciones**, ese factor cambia entre ellas y suele ser la mitad de la tesis:
  ahí se deriva. La planilla de la viga LTB declara la parábola $M(x) = wx(L-x)/2$
  como función `program` y evalúa los cuartos de **cada segmento no arriostrado**
  (0–8 m y 0–4 m), obteniendo $C_b = 1{,}136$ y $1{,}299$ desde el diagrama de
  momentos. Citar «1,14 y 1,30» habría dado por bueno justamente el paso que el
  ejemplo quiere demostrar —que el tramo corto tiene gradiente más fuerte y por eso
  gana crédito—, y además habría escondido el hallazgo #1.
  **Y también se deriva cuando la norma permite explícitamente no hacerlo.** El
  2026-08-01, en la viga-columna, A-8-3(b) autoriza tomar $C_m = 1{,}0$ «conservadoramente»
  para carga transversal entre apoyos, así que el post lo cita y queda correcto. Pero
  derivarlo cuesta tres líneas y dice algo distinto: el Comentario da $C_m = 1 + \psi\,\alpha
  P_r/P_{e1}$ (C-A-8-2) con $\psi$ de la C-A-8-3, y para apoyos simples con carga **uniforme**
  el $\delta_o = 5wL^4/384EI$ y el $M_o = wL^2/8$ cancelan $EI$, $w$ y $L$, dejando
  $\psi = \pi^2\cdot5/48 - 1 = +0{,}028$ — que es la primera fila de la Tabla C-A-8.1, la que
  tabula $C_m = 1{,}0$. O sea que acá el 1,0 **no es conservador: es el valor exacto**. La
  planilla no cambió ningún número, pero convirtió un permiso de la norma en un resultado,
  que es justo lo que separa «está permitido» de «está bien».
- **Propiedades de perfil: dato declarado, y lo derivable se deriva de las planchas.** Los
  ejemplos de miembros (Cap. E/F/H) se apoyan en tablas de perfiles, que **no son la norma**:
  la *Specification* no tabula perfiles —eso es el *Manual*, que no está en disco— y el
  `Manual_ICHA_2010` no trae perfiles W. Así que $A_g$, $I$, $r$, $Z$, $J$, $C_w$ entran como
  dato declarado con su fuente, igual que un valor de tabla, y son frontera explícita. Pero
  **lo que se pueda derivar, se deriva**: se declaran las cuatro planchas ($d$, $b_f$, $t_f$,
  $t_w$) y de ahí salen área, inercias, radios de giro, $b_f/2t_f$, $h/t_w$, $J$ y $C_w$, que
  se contrastan contra la fila de tabla con **tolerancia declarada** — no a media unidad, porque
  las planchas no llevan los redondeos de unión ala-alma. **Por qué vale la pena**: el 2026-08-01
  la planilla de la columna de galpón validó la fila del W250×73 por dos vías —el ala, que no
  tiene redondeos, dio $b_f/2t_f = 8{,}9437$ contra el 8,94 publicado, exacto, y las diferencias
  del resto (área $-1{,}45\%$, $r_y$ $+0{,}82\%$) son justo las que el fillet explica—, y de paso
  produjo el $J$ y el $C_w$ que el post no publicaba y que hacían falta para poner número al E4.
  Cuando el dato del redondeo falta, conviene buscar la **cota conservadora**: $d - 2t_f$ es cota
  superior de $h$ (B4.1 §1b), y si esa ya pasa el $\lambda_r$, el elemento está demostrado.
- **Sección compuesta: no hay fila contra la cual validar, así que se compone — y se declara
  la hipótesis geométrica.** Cuando el ejemplo suelda dos perfiles (un canal-tapa sobre el ala
  de una W, una platabanda), la sección resultante es monosimétrica y **sus propiedades no las
  tabula nadie**: no hay fila que contrastar. Ahí la planilla compone desde las filas de
  catálogo de las partes —Steiner para el eje fuerte, suma directa donde los centroides ya
  coinciden— y contrasta los compuestos contra lo que el post publica. **Y el paso que no se
  puede saltar es declarar dónde queda el centroide de la pieza agregada**, porque de ahí
  cuelga todo. **Por qué es su propia regla**: el 2026-08-01 la planilla de la viga carrilera
  encontró que el par publicado ($I_x = 169\,300$ / $S_{x,\text{inf}} = 4540$) **no lo
  reproducía ninguna hipótesis limpia** — con el canal sobre su dorso daba 175 148, con los
  talones abajo 189 276, y hasta la idealización de ignorar el $\bar x$ daba 170 407. El par
  publicado implicaba un eje neutro corrido 6,74 cm cuando el físico es 7,19. Se adoptó la
  hipótesis física **y, entre las dos orientaciones planas, la de menor $I_x$**, que es la
  desfavorable para los estados que dependen de él (flecha y fatiga). Costó reescribir la
  tesis de cierre del post: con la sección bien compuesta el rango de tensiones baja un 2 % y
  la fatiga **deja de tomar el control** en servicio severo. Ningún recálculo interno lo
  habría encontrado — el post cuadraba consigo mismo a partir de un par que nadie podía
  reconstruir.
- **En hormigón la frontera se corre: casi todo es derivable, y el que manda es $d$.** El
  equivalente de «las cuatro planchas» acá es la **disposición de barras**. En acero $A_g$, $I$
  y $Z$ entran como fila de catálogo declarada; en hormigón no hay fila que declarar: $A_s$ sale
  de $n\cdot A_{barra}$, la altura útil de $h - \text{rec} - d_e - d_b/2$ y el $b_w d$ es
  geometría. Lo único que queda como frontera es el **área nominal de la barra** y el par
  **$f'_c$ / $f_y$**. Por eso $d$ **se deriva, nunca se declara**: es la variable de la que
  cuelgan $\phi M_n$, $V_c$, $s_{\max}$ y $A_{s,\min}$ a la vez, y un $d$ mal armado no lo caza
  ningún recálculo interno. **Por qué es su propia regla**: el 2026-08-01 la planilla de la viga
  a flexión y corte encontró que el post derivaba bien 53,75 cm y acto seguido lo redondeaba a
  54 — **hacia arriba**, el lado inseguro, y justo en el uso a flexión 0,99 que es su número
  insignia. Derivarlo movió cinco números y le devolvió al ejemplo su margen real.
- **En una región D la frontera no es una barra: es el enrejado, y hay que cerrarlo por
  estática.** El método puntal-tensor no tiene fórmula para el brazo: el ancho del puntal, la
  posición de los nodos y con ellos $jd$ y $\theta$ **los elige el proyectista**. Van declarados
  como hipótesis geométrica —el mismo estatus que el centroide del canal en la viga carrilera—
  y, ya declarados, la planilla tiene que **comprobar que el enrejado cierra**: $\Sigma F = 0$
  en cada nodo y el ángulo contra el mínimo del 23.2.7. **Por qué es su propia regla**: el
  2026-08-01 la planilla de la ménsula encontró que el triángulo publicado **no cierra
  $\Sigma H = 0$** — con $T = 18{,}04$ tonf el nodo A pide 17,27 y sobran 0,78 (4,3 %). No era un
  error: es que $N_{uc}$ actúa 5 cm sobre el tirante y la 16.5.3.1 resuelve esa excentricidad
  metiéndola en $M_u$ en vez de modelarla con un par vertical. El número publicado es el
  conservador y no se movió; lo que cambió es de dónde dice el post que sale. Un contraste de
  equilibrio por nodo es barato y es lo único que separa «el modelo da 18,0» de «el código
  manda 18,0».
- **En anclajes hay una tercera especie de frontera: un dato que el código RECALCULA.** En
  la viga todo colgaba de un $d$ derivado; en la ménsula, de un enrejado declarado. En el
  Cap. 17 el que manda es $h_{ef}$, **y no es el del plano**: la 17.6.2.1.2 dice que si los
  anclajes quedan a menos de $1{,}5h_{ef}$ de **tres o más bordes**, el $h_{ef}$ que entra en
  17.6.2.1 a 17.6.2.4 es $\max(c_{a,\max}/1{,}5;\ s/3)$ — y su gemela en corte, la 17.7.2.1.2,
  hace lo mismo con $c_{a1}$ cuando los $c_{a2}$ **y** el espesor $h_a$ caen bajo $1{,}5c_{a1}$.
  Ninguna de las dos se delata en la aritmética: la cadena publicada cuadra consigo misma a
  partir de un $h_{ef}$ que el código no permite usar. **Contar los bordes influyentes es un
  paso propio de la planilla, antes de escribir la primera fórmula.** El 2026-08-01 la planilla
  del pedestal encontró que los 40 cm de embebido se leen como 16,67 —tres bordes a 25 contra
  $1{,}5h_{ef} = 60$—, y el efecto es contraintuitivo: la capacidad **sube** un 10,5 %, porque
  $h_{ef}$ entra tres veces en la Ec. (17.6.2.1b) y dos juegan al revés ($A_{Nc}/A_{Nco}$ salta
  a 2,00, tocando el tope $n\,A_{Nco}$, y $\psi_{ed,N}$ vuelve a 1). Le dio al post su tesis:
  entre 16,7 y 40 cm de embebido no se compra breakout, lo compra el ancho del pedestal.
  Corolario: **cuando el código ofrece dos ramas de hipótesis, se calculan las dos.** La
  R17.7.2.1 pide mirar el Caso 1 y el Caso 2 del cono de corte; calcularlos convirtió un
  «tomamos conservadoramente la fila delantera» en «la fila delantera es la que gobierna».
- **Una tabla de la norma no termina en la tabla: hay que leer las cláusulas que la acotan.**
  Es la variante interna de la regla anterior —la remisión no cruza de norma, cruza de párrafo— y
  es más fácil de pasar por alto, porque la fórmula que uno copió *es* la correcta. El 2026-08-02
  la planilla de la zapata aislada encontró que el post aplicaba la fila (c) de la Tabla 22.5.5.1
  y se detenía ahí, cuando la **22.5.5.1.1** acota esa misma tabla por arriba y por abajo. Acá el
  **piso mandaba**: la fila (c) daba $3{,}69$ kgf/cm² contra los $0{,}265\sqrt{f'_c} = 4{,}19$ que
  el código dice que no hace falta bajar, y $\phi V_c$ subía de 27,9 a **31,6 tonf** — el número
  insignia del ejemplo, de 0,86 a **0,76**. Ningún recálculo lo caza: la cadena publicada es
  aritméticamente correcta y además conservadora. **El síntoma que lo delata es de forma, no de
  número**: una tabla citada por su fila (`Tabla 22.5.5.1(c)`) sin que aparezca en la hoja ninguna
  de las subcláusulas `.1`, `.2`, `.3` que la siguen. En la planilla se traduce en declarar el
  piso y el tope como variables propias y **dejar escrito cuál de los tres manda** (`piso_manda :=
  v_bruto < v_piso`), que es un booleano que cuesta una línea y no puede quedar implícito.
  Corolario sobre la tesis: acá el efecto fue **subir** la capacidad, y eso obligó a reescribir el
  subargumento de la `Note` —el post atribuía −16 % al efecto de tamaño y con el piso son −4,4 %—.
  Un hallazgo que afloja el cálculo puede apretar la prosa.
- **Cuando una norma remite a otra, hay que ir a buscar la sección dedicada, no la genérica.**
  Una cláusula que dice «esto se diseña de acuerdo con la norma de material» es una frontera
  donde es fácil quedarse con el capítulo general que uno ya conoce. El 2026-08-02 la planilla
  del pedestal NCh2369 encontró que la **llave de corte** —que 8.5.3 obliga a poner pero no
  dimensiona— se verificaba con el §22.8 de aplastamiento genérico de ACI, cuando 318-25 tiene
  desde 318-19 una sección propia, la **§17.11 *Attachments with shear lugs***. Y no es un
  cambio de etiqueta: recorta el área efectiva a $b_{sl}\cdot 2t_{sl}$ (180 cm² de los 450
  embebidos), penaliza el levantamiento con $\psi_{brg,sl}$, y sobre todo **agrega un modo de
  falla que el cálculo genérico no tiene** —el cono del hormigón de la propia llave, 17.11.3—
  que ahí daba 1,23 y no pasaba. El síntoma que lo delata: **una pieza que el post dibuja y
  nombra pero verifica con menos chequeos que sus vecinas**. En la hoja se traduce en abrir el
  índice del capítulo de la norma remitida antes de escribir la primera fórmula de esa pieza.
- **En ACI, la trampa de edición no está en todos los coeficientes: hay que abrir cuál.** La
  regla de la columna métrica no significa que todo número empírico se mueva. El 2026-08-01 la
  planilla de la ménsula abrió el techo de la 16.5.2.4 rama por rama —(a) $0{,}2f'_c$,
  (b) $(3{,}3+0{,}08f'_c)$, (c) 11 MPa contra los (480 + 0,08f'c) y 1600 psi de la impresión
  inch-pound— y la diferencia resultó ser 0,18 % y 0,29 %, con la rama (a) gobernando: por ser
  **fracción de $f'_c$**, es idéntica en las dos ediciones. Lo mismo los $\beta_s$, $\beta_c$,
  $\beta_n$ del Cap. 23 y el $0{,}04(f'_c/f_y)$: adimensionales, insensibles. El criterio corto:
  **el coeficiente que arrastra unidad —el que multiplica $\sqrt{f'_c}$ o suma MPa— es el que
  hay que ir a buscar; el adimensional no.** Contrastar las ramas igual vale la pena: deja
  escrito que se miró.
- **`meta.esperadoFalso`**: dos usos, siempre con su razón escrita. (a) Los `false` que
  son la tesis del ejemplo («no pasa» es el punto del post). (b) Discrepancias
  encontradas, marcadas `HALLAZGO <fecha>` mientras el fix al post no se decida — nunca
  para tapar una discrepancia en silencio. Si el post se corrige, el runner avisa que la
  excepción quedó obsoleta y hay que borrarla.
- **Esquema paramétrico** (obligatorio): toda planilla lleva un SVG en
  `public/esquemas/<slug de la planilla>.svg` con tokens `{{expr}}` /
  `{{expr:unidad}}`, colgado de su región `image`. Una imagen muda no cumple: el
  esquema existe para que el lector vea **cuánto valen** las variables que el dibujo
  rotula, y para que al mover un dato el dibujo se mueva con los números. Reglas:
  - **De dónde sale**: se deriva de la figura del post — misma composición, mismos
    colores — y se guarda **aparte**, en `/esquemas/`. El post conserva su SVG
    estático (ahí los tokens saldrían crudos). Si el panel recortado solo existía
    para la planilla, se mueve a `/esquemas/` y no queda copia.
    **Y por eso hereda sus defectos de composición**: si la revisión visual encuentra un
    solape que no es de valor sino de disposición —un rótulo montado sobre otro, una
    flecha que cruza una leyenda—, hay que ir a mirar la figura de la que se derivó,
    porque casi seguro está ahí también. El 2026-08-02 la zapata aislada arregló dos en
    `/esquemas/` y los mismos dos estaban en `/ejemplos/zapata-aislada.svg`, donde nadie
    los había visto en tres semanas.
  - **Tokens**: `{{expr}}` acepta cualquier expresión mathjs contra el scope
    (`{{max(u_a, u_b)}}`, `{{d_v - t_fv:mm}}`). La forma con unidad convierte e
    imprime **solo el número**; la unidad la escribe el SVG con su propia tipografía
    (cm², tonf·m). Los valores salen con 4 cifras significativas, no con el redondeo
    del post. La sustitución barre **todo el archivo, comentarios incluidos**: un
    `{{expr}}` de ejemplo dentro de un `<!-- -->` también se evalúa y hace fallar
    la corrida. **En texto va el rótulo; en un atributo numérico va `{{expr:svg}}` y nada
    más**: `formatValor` sale con coma decimal a propósito —para que se note qué número puso
    la hoja y cuál escribió el autor—, así que un `width="{{0.92*Rd:tonf}}"` se sustituye por
    `width="211,4"`, que es SVG inválido, y la barra se dibuja con ancho cero. El contrato de
    tokens pasa igual: eso solo lo caza abrir el PNG. Por eso la forma cruda es un modificador
    propio y explícito.
  - **`{{expr:svg}}` — geometría calculada dentro de un atributo.** Emite punto decimal, sin
    unidad y sin el redondeo a 4 cifras, y **vuelca una matriz Nx2 como lista de puntos**
    (`points="{{pts_px:svg}}"` → `"40,310 52,287 …"`), que es lo que permite **dibujar una
    curva que la hoja calculó** — el diagrama de interacción P–M se arma barriendo el eje
    neutro, y entra al dibujo por un solo token. Se encadena con la unidad: `{{x:cm:svg}}`
    convierte y después formatea crudo. Reglas de uso:
    - **El mapeo a píxeles lo hace la hoja, no el motor.** Una región `program` devuelve ya
      las coordenadas de pantalla (`y_px := y_0 - P*s_P`), así la escala y la inversión del
      eje P quedan a la vista y auditables, que es la premisa del proyecto. El motor no sabe
      dibujar y no tiene por qué: solo formatea.
    - **`formatSvg` es más estricto que `formatValor`, no menos.** Lanza —o sea, el token cae
      en `faltantes` y `verify` falla— si el valor no es finito, si llega con unidad sin
      convertir, o si no es un escalar ni una Nx2. El caso que importa es el primero: un `NaN`
      en la coordenada 137 escribe `NaN` en el atributo, el navegador dibuja **nada**, y eso
      ningún booleano lo ve. El guard es lo único que lo caza.
    - **Una curva no se revisa como un rótulo.** Puede resolver todos sus tokens y salir
      espejada, fuera de escala o con el barrido corriendo al revés. El amarre es contrastar
      en la hoja los **puntos que anclan** el dibujo (acá: compresión pura con su tope, el
      balanceado y la flexión pura) contra los que el post publica, y rotularlos sobre la
      curva: si los tres caen en su sitio, la escala y el sentido de los ejes quedan
      verificados de paso. Lo mismo con la demanda: se contrasta su **distancia a la
      frontera**, no solo su posición.
    - Un barrido de 200 puntos en una región `program` con cabecera imprimiría 400 números
      en un solo bloque; `resultToTex` lo resume como `matriz 201×2` por encima de 12
      entradas. La variable queda íntegra en el scope: lo que se recorta es la impresión.
  - **Dónde va**: la región `image` ve el scope de su posición de lectura, así que
    va **después** de las variables que rotula. En la práctica: justo antes del
    encabezado «CONTRASTE CON EL POST», donde ya está todo definido.
  - **Banda de valores**: bajo el dibujo van dos o tres líneas con lo que la hoja
    concluye — demanda, la variable que el ejemplo hace hablar, y el estado límite
    que gobierna con su uso. Es lo que convierte el esquema en un resumen vivo.
    Si hace falta espacio, se estira el `viewBox` hacia abajo y se recalcula el `h`
    de la región (`h = w · alto/ancho del viewBox`).
  - **Contrato**: `verify:planillas` falla si un token no resuelve — variable no
    definida todavía en ese punto de la hoja, o unidad incoherente. El dibujo queda
    bajo el mismo contrato que los números.
  - **Revisión visual** (`npm run render:esquema`): el contrato de tokens es
    necesario y no suficiente. Un esquema puede cuadrar y verse mal, y eso
    ningún booleano lo ve: el valor sustituido es más largo que el rótulo que
    lo esperaba y se sale de su caja, un texto se pasa del `viewBox` y queda
    cortado, un rótulo cae encima de una línea del dibujo. Hay que abrir el
    PNG. La lista de lo que se mira: (a) nada cortado en los cuatro bordes;
    (b) ningún texto encima de otro texto ni de una línea que lo tache;
    (c) los valores sustituidos caben en su caja o su barra; (d) la banda de
    valores dice lo que la hoja concluye; (e) el símbolo del tubo es `□`
    (U+25A1), no `[]`; (f) **ningún valor pierde en el redondeo lo que el
    esquema quería mostrar** — `formatValor` imprime 4 cifras significativas,
    así que un uso de 1,0002 sale «1» y un margen del 0,02 % desaparece. Si el
    punto del rótulo es la diferencia, se rotula la diferencia: `{{(1-u)*100}}`
    en vez de `{{u}}`. Lo que se corrige va al SVG y se vuelve a renderizar.
  - **Seguridad**: solo `/esquemas/` se inyecta inline; cualquier otra imagen va
    por `<img>`.
- **Una región `math` es un paso, no una fórmula anidada.** Es tentador cerrar un estado
  límite en una línea —`Rd := phi * min((min(a,b)+c+min(a,b))^2, 4*9*h^2)/(9*h^2) * min(1, …) * N_b`—
  y el motor lo evalúa sin chistar. El problema aparece al imprimir: `usePaginacion` mide esa
  línea en el documento de impresión y el navegador la reparte distinto, y la hoja **anuncia una
  página que el PDF no tiene**. El 2026-08-01 la planilla del pedestal salió 12 contra 11 por
  exactamente cuatro regiones así; partidas en pasos intermedios con nombre, cuadró sin tocar
  nada más. El diagnóstico rápido cuando `pdf:planilla` reporta un desfase de una página es
  correr otra planilla conocida: si ésa cuadra, el problema es la hoja y no `paginacion.ts`.
  **El otro bloque que descuadra la cuenta es el esquema**, que es alto e imparte­ible: si el
  desfase persiste con las fórmulas ya partidas, un salto forzado en la región `image` lo
  resuelve y de paso le da al dibujo su propia página. Pero **se prueba, no se supone**: el
  2026-08-01 la ménsula lo necesitó y la viga a flexión y corte no —ahí el salto dejaba una
  página de 688 px y sin él quedó en 7 páginas parejas—. Y cuando el esquema es el que queda
  en el borde, **antes que el salto conviene achicarlo**: el 2026-08-02 el pedestal NCh2369
  pasó de 720×480 a 660×440 y cuadró sin salto, mientras que con salto cuadraba igual pero
  dejaba una página talón de 14 líneas.
- **Las líneas de texto van a ≤ 88 caracteres.** Es la otra causa de desfase de paginación, y
  no se parece a la anterior: una línea más larga se envuelve en el documento de impresión, y
  ahí `usePaginacion` la mide distinto de como Chromium la reparte. El error se **acumula**
  línea a línea, así que no aparece como un salto en un bloque concreto sino como un corrimiento
  que arranca en la página 1. **Por qué es su propia regla**: el 2026-08-02 la planilla del
  pedestal NCh2369 anunciaba 13 páginas y traía 12; correr `anclajes-pedestal` en paralelo
  descartó `paginacion.ts`, y partir las cuatro fórmulas anidadas —la receta del párrafo
  anterior— **empeoró** el desfase a dos páginas. Lo que lo causaba eran 16 líneas de texto de
  entre 89 y 99 caracteres. Las planillas que cuadran tienen 88 como máximo exacto, que es de
  dónde sale el número.
- **Disposición de los bloques**: la planilla se escribe con un paso vertical fijo, y eso
  vale mientras cada bloque sea una línea. No lo es: una región `program` ocupa una línea
  por instrucción —ocho, diez— y una `math` con una fracción también crece, así que el
  bloque de abajo termina dibujado encima del de arriba. `npm run reflow:planilla` lo
  arregla midiendo el alto **real** de cada región ya renderizada en el canvas (un modelo
  estático erraría justo en los casos que importan) y reasignando `y` en orden de lectura.
  No toca `x`, ni `pageBreak`, ni el orden: el scope y el PDF salen idénticos.
- **Cortes de página**: la planilla se lee en el canvas, pero también se imprime como
  memoria de cálculo, y ahí la hoja se parte en A4. El canvas anuncia dónde con una
  línea «── página N ──»; si un corte cae a mitad de una sección de cálculo, se
  selecciona la región que debería abrir la página y se pulsa **⇱ Salto de página**
  (queda como `"pageBreak": true` en el JSON, y viaja con la planilla). Para verlo
  impreso de verdad: `npm run pdf:planilla -- <slug>` con el sitio servido.
  **El salto se pone después de mirar, nunca antes.** Un salto en el encabezado de
  cada sección parece prolijo y no lo es: si el corte natural ya caía justo antes de
  ese encabezado, el forzado no mueve nada y en cambio deja una página de 300 px.
  El 2026-08-01 la planilla del doble ángulo empezó con cuatro saltos «de oficio»
  y los cuatro hicieron eso —11 páginas, de las cuales cuatro con 250-530 px de
  contenido—; sin ninguno quedó en 8 páginas parejas, y mirando el PDF resultó que
  hacía falta **uno solo**, en la única sección que arrancaba al pie. El criterio
  para leer el reporte es la distancia entre marcas consecutivas: dos muy juntas
  = página talón.
  **Y el salto no siempre es la herramienta: si al ponerlo aparece un desfase que antes
  no estaba, el salto es la causa y hay que empujar con contenido.** El 2026-08-02 el muro
  tenía el §13 arrancando a tres líneas del pie; el `pageBreak` lo movió pero el modelo
  pasó a anunciar **20 páginas contra las 19 del PDF**, porque en un corte *forzado*
  `paginacion.ts` conserva el margen y ahí el navegador no lo reproducía. Se resolvió
  agregando dos líneas de contenido legítimo a la sección anterior —una cita que
  faltaba—, con lo que el encabezado pasó a abrir la página siguiente **por corte
  natural** y la cuenta volvió a 19 = 19. **Es específico de la posición, no general**:
  en la misma hoja otros dos saltos, en el §18 y en el bloque de contrastes, cuadraron
  sin tocar nada. Por eso se prueba uno a la vez y se vuelve a imprimir.
- **Cómo se publica un ejemplo con planilla** (el estándar, fijado el 2026-08-02 con las 21
  alineadas). Tres piezas, y solo una se escribe:
  - **El enlace es automático: no se escribe.** `BlogPost.astro` pinta la caja «Planilla
    interactiva» cuando existe `public/planillas/<id del post sin `ejemplo-`>.json`
    (`src/lib/planillas.ts`), así que **basta con crear el archivo**. Mientras se escribió a
    mano faltaba en **8 de las 21** —las 7 de la tanda de acero del 2026-08-01 se saltaron
    todas juntas—: la hoja existía, cuadraba y estaba registrada acá, y el lector no tenía
    cómo llegar a ella.
  - **La sección se escribe una vez y se llama `## La planilla`**, al cierre del post, antes
    de la bibliografía. Es lo único a mano, y no es el enlace: es **qué aporta la hoja que el
    post no puede** — el booleano que decide, la variable que se deriva y mueve toda la
    cadena, el equilibrio que cierra, el factor que se obtiene en vez de citarse. El
    2026-08-02 convivían tres encabezados distintos (`La planilla`, `Reproducir esto con tus
    datos`, y cuatro posts donde el enlace flotaba al final del resumen); quedaron los 21 con
    el mismo.
  - **Los conteos los verifica el runner, no se cuentan a mano.** Si la sección declara
    «N pasos, M verificaciones y K contrastes», `verify:planilla` lo compara contra la hoja y
    **falla si no cuadra**. Declararlos es opcional; que mientan, no. **Por qué hizo falta**:
    esos números se desalinean solos —una planilla gana verificaciones en la auditoría
    siguiente y la prosa se queda con el número viejo—, y el 2026-08-02 estaban mal en **10 de
    los 21 posts**, con casos de 9 publicadas contra 34 reales. Es el tipo de dato que nadie
    vuelve a mirar justamente porque parece inofensivo.
  - **Contraste = verificación con id `c_*`.** Es lo que hace derivable el conteo anterior, y
    la frontera es de sentido: un contraste compara contra un número **que el post publica**;
    un chequeo interno de la hoja —un rango de tabla, un equilibrio, la colocación de una
    curva— es una verificación pero no un contraste, y lleva id `v*` o `r*`. Tres planillas lo
    tenían mezclado y se retagearon el 2026-08-02.
- Si un post con planilla cambia sus números, la planilla es la que dice si siguen
  cuadrando: correr `verify:planillas` antes de publicar.

## Estado

✅ cuadra (contrastes al día, sin hallazgos abiertos) · ⚠️ con hallazgos (ver `AUDIT.md`)
· ⬜ pendiente · 🚫 no candidato (dictamen del auditor)

### acero

| Post | Pasos | Verif. | Contrastes | Esq. | Págs. | Hallazgos | Última corrida | Estado |
|---|---|---|---|---|---|---|---|---|
| `ejemplo-gusset-simple-apernado` | 92 | 46 | 23 | 18 | 6 (1⇱) | 3 aplicados 2026-07-31 (tabla por-perno con t = 18 mm) | 2026-07-31 | ✅ |
| `ejemplo-gusset-simple-soldado` | 71 | 46 | 28 | 16 | 6 (2⇱) | 1 aplicado 2026-07-31 (387,2 → 387,1) | 2026-07-31 | ✅ |
| `ejemplo-gusset-esquina-apernado` | 146 | 99 | 69 | 51 | 10 (3⇱) | 1 aplicado 2026-07-31 (Resultado 143,00 → 140,55, con el alt) | 2026-07-31 | ✅ |
| `ejemplo-gusset-apice-chevron` | 105 | 81 | 57 | 38 | 8 (2⇱) | 1 aplicado 2026-07-31 (0,538 → 0,537) | 2026-07-31 | ✅ |
| `ejemplo-diagonal-hss-traccion` | 41 | 34 | 25 | 26 | 4 (1⇱) | 1 aplicado 2026-07-31 (56 340 kgf → 56 351) | 2026-07-31 | ✅ |
| `ejemplo-chevron-nch2369` | 134 | 97 | 82 | 38 | 10 (2⇱) | 5 aplicados 2026-07-31 (el 🟠: la fila R₁ = 2,0 invertía el signo del desequilibrio) | 2026-07-31 | ✅ |
| `ejemplo-columna-galpon-compresion` | 63 | 45 | 30 | 38 | 5 | 2 aplicados 2026-08-01 (el §5 confundía torsional puro con flexo-torsional, y ahora publica su cifra; «casi triplica» → ×2,6) + 1🔵 conservado | 2026-08-01 | ✅ |
| `ejemplo-conexion-apernada-corte` | 73 | 69 | 49 | 45 | 7 (4⇱) | 1 aplicado 2026-08-01 (🟠 el F_nv de la Tabla J3.2, 372 → 370 MPa: dio vuelta el 0,995 del perno extremo a 1,00) | 2026-08-01 | ✅ |
| `ejemplo-conexion-doble-angulo` | 107 | 88 | 58 | 67 | 9 (1⇱) | 3 aplicados 2026-08-01 (doblar y dividir el redondeado: 21 514 → 21 513 kgf · 0,461 → 0,460 · 0,42 → 0,41) | 2026-08-01 | ✅ |
| `ejemplo-conexion-momento-end-plate` | 76 | 52 | 38 | 21 | 6 (1⇱) | 0 | 2026-07-31 | ✅ |
| `ejemplo-conexion-momento-placas-ala` | 87 | 59 | 41 | 27 | 6 | 1 aplicado 2026-07-31 (97.5 → 97.6) | 2026-07-31 | ✅ |
| `ejemplo-empalme-apernado-viga` | 125 | 92 | 61 | 60 | 9 (2⇱) | 1 aplicado 2026-08-01 (🟠 el F_nv de la Tabla J3.2, 372 → 370 MPa: 86,5 → 86,1 tonf y el uso 0,52 → 0,53; era el último post con la conversión de las ksi) | 2026-08-01 | ✅ |
| `ejemplo-viga-carrilera-puente-grua` | 156 | 82 | 62 | 41 | 12 (1↱) | 13 aplicados 2026-08-01 (la Ec. A-3-1 con el C_f de 360-16 y el exponente 1/3; la flecha lateral que era la vertical escalada; y la sección compuesta, que ninguna hipótesis reproducía — al componerla bien la fatiga deja de gobernar en servicio severo y **la tesis de cierre se reescribió**) | 2026-08-01 | ✅ |
| `ejemplo-viga-columna` | 126 | 82 | 39 | 45 | 10 (1⇱) | 1 aplicado 2026-08-01 (M_r salía de `1,34 · 8,0`, los dos operandos redondeados; se declaró w_u = 1,306 y el uso insignia 0,94 quedó en pie) + 1🔵 conservado | 2026-08-01 | ✅ |
| `ejemplo-viga-ltb` | 73 | 52 | 31 | 44 | 6 | 3 aplicados 2026-08-01 (escalar el redondeado en las dos cadenas: 1458 → 1453 · 51,0 → 50,9 y 56,7 → 56,6 · «casi triplica» → ×2,7) | 2026-08-01 | ✅ |

**Esq.** = tokens del esquema paramétrico. Las 22 planillas publicadas lo tienen.
**Págs.** = páginas A4 al imprimir, y entre paréntesis los saltos forzados (⇱).

### hormigón

| Post | Pasos | Verif. | Contrastes | Esq. | Págs. | Hallazgos | Última corrida | Estado |
|---|---|---|---|---|---|---|---|---|
| `ejemplo-anclajes-pedestal` | 130 | 81 | 64 | 49 | 9 (1⇱) | 8 aplicados 2026-08-01 (el 🟠 raíz: no se aplicaba 17.6.2.1.2 —tres bordes a 25 cm < 1,5h_ef = 60 obligan a leer los 40 cm de embebido como 16,67—, que sube el breakout un 10,5 % y mueve la interacción 0,76 → 0,71 y la tesis de cierre. Más el A_brg de tuerca hex NORMAL en un post que declara PESADA, y el exponente de la Ec. 17.8.4, que es 2 y no 5/3) | 2026-08-01 | ✅ |
| `ejemplo-columna-interaccion-esbeltez` | 119 | 41 | 21 | 144 | 9 (2⇱) | 7 aplicados 2026-08-02 (el 🟠: la curva de diseño se armaba solo con la Tabla 21.2.2 y falta la **21.2.2.3**, que la acota interpolando en P_n entre 0,90 en 0,1f'cA_g y φ_cc en P_n,bal — en C2 baja φ de 0,90 a **0,874**, φM_n de 41,4 a 40,1 y el uso de 0,68 a **0,70**. Más el d redondeado de 43,75 a 44 hacia arriba, el E_s de 2,1e6 en vez del de 20.2.2.2, el balanceado que no reproducía ninguna hipótesis, las trabas de 25.7.2.3(b) de las que cuelga el 0,80P_o, y el «uso máximo 0,68» que contradecía a su propia tabla) | 2026-08-02 | ✅ |
| `ejemplo-losa-punzonamiento-momento` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-losa-unidireccional` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-mensula-puntal-tensor` | 128 | 83 | 59 | 51 | 10 (1⇱) | 11 aplicados 2026-08-01 (el 🟠: 16.5.3.4/16.5.3.5 no existen en 318-25 y 16.2.2.3(b) tarifa la reacción SOSTENIDA sin mayorar → los 5,6 tonf pasan a dato de diseño. El enrejado no cerraba ΣH por 0,78 tonf, la cuantía de 23.5.1 se comparaba contra el 0,0025 de la malla ortogonal, y ℓ_dh venía de 318-19: 24 → 32 cm) + 1🔵 conservado | 2026-08-01 | ✅ |
| `ejemplo-muro-flexocompresion` | 282 | 186 | 116 | 201 | 19 (2⇱) | 9 aplicados 2026-08-02 (el 🟠: falta la **21.2.2.3** otra vez, y acá el umbral 0,1f'cA_g = 450 tonf cae JUSTO entre las dos combinaciones —A con P_n = 616 encima, B con 432 dieciocho tonf debajo—, así que muerde sólo en A: φ 0,90 → **0,873** y el uso 0,86 → **0,89**, sin dar vuelta cuál gobierna. Más el E_s de 2,0e6 no declarado, que corría las cinco c un 0,3 %; cuatro coeficientes exhibiendo el operando SI y calculando con el de kgf/cm²; y el «+2 %» que era de M_n y en capacidad de diseño es **+3,4 %**, porque al engrosar el φ también se recupera) | 2026-08-02 | ✅ |
| `ejemplo-pedestal-anclaje-nch2369` | 224 | 143 | 105 | 59 | 14 | 14 aplicados 2026-08-02 (dos 🟠 propios: la llave se verificaba con el §22.8 y ACI 318-25 tiene **§17.11** —A_ef,sl = b·2t = 180 cm² de los 450 y ψ_brg,sl = 0,486 bajan el aplastamiento de 0,16 a 0,41—, y **faltaba el 17.11.3**, el cono del hormigón de la propia llave, que da **1,23 ✗** y depende del ancho del pedestal, no del embebido. El §5 dejó de ser detallado prescriptivo y pasó a ser el remedio que C9.5.2 nombra. Más el 🟠 heredado: 2,51 → **2,28**) | 2026-08-02 | ✅ |
| `ejemplo-viga-flexion-corte` | 81 | 59 | 40 | 46 | 7 | 13 aplicados 2026-08-01 (el 🟠 raíz: los coeficientes venían de la edición inch-pound —0,53 en vez de 0,543— citando tablas de la SI; movió diez números un 2 %. Y el `d` redondeado de 53,75 a 54, hacia arriba. De paso cerró el #4 de 2026-07-22: era 9.5.1.1, no 9.3.2.1) | 2026-08-01 | ✅ |
| `ejemplo-viga-t` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-zapata-aislada` | 95 | 70 | 56 | 45 | 8 (1⇱) | 7 aplicados 2026-08-02 (el 🟠 raíz: faltaba el **piso de 22.5.5.1.1** —la fila (c) da 3,69 y el código no obliga a bajar de 0,265√f'c = 4,19—, que sube φV_c de 27,9 a 31,6 y mueve el número insignia **0,86 → 0,76**; y con él se desarma el «−16 % del efecto de tamaño», que con el piso es −4,4 %. Más la familia inch-pound afirmada como identidad —0,17 ↔ 0,53 cuando la exacta es 0,5429— y el d redondeado de 45,7 a 46, hacia arriba) | 2026-08-02 | ✅ |

### geotecnia

| Post | Pasos | Verif. | Contrastes | Esq. | Págs. | Hallazgos | Última corrida | Estado |
|---|---|---|---|---|---|---|---|---|
| `ejemplo-fundacion-anclada-nch2369` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-losa-rigida-o-flexible-nch2369` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-pilotes-friccion-negativa-nch2369` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-zapata-galpon-nch2369` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-zapata-los-dos-criterios` |  |  |  |  |  |  |  | ⬜ |
