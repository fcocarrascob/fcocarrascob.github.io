#!/usr/bin/env python
"""Extrae de un PDF las etiquetas de ecuacion que la wiki NO ingirio.

    python scripts/extraer-tags-pdf.py

Dos casos, y por eso dos familias de patron:

1. Los APENDICES de AISC 360 y 341. Las extracciones de material_teorico cubren
   los capitulos (cap*.txt) pero no los apendices, y los posts publicados citan
   la Ec. A-3-1M (fatiga, viga carrilera) y las Ecs. A-8-3 / A-8-5 (el B_1 del
   analisis de segundo orden). Llevan TRES partes -letra, numero de apendice,
   numero de ecuacion- y a veces sufijo M de metrico. Nada que ver con la forma
   de capitulo (F4-9b), por eso van por separado.

2. La AISC DESIGN GUIDE 1, 3a ed., que no esta ingerida en material_teorico y
   que la serie de placas base cita de punta a punta. Sus etiquetas de apendice
   llevan DOS partes -letra y numero, con sufijo opcional de rama-: C-5, C-17a.
   Sin esto, `verify:ecuaciones` reporta huerfana cada cita del Apendice C,
   porque su detector las lee como si fueran del Cap. C de AISC 360-22 -que solo
   tiene C2-1 y C2-2a/b-.

Que la DG1 sea una GUIA y no una norma no la exime del control: una ecuacion mal
citada en un post la ve el lector igual. Lo que si cambia es el peso de la cita,
y eso se dice en el texto del post, no en este inventario.

Usar la capa de texto para INVENTARIAR es legitimo -lo que destruye es la
disposicion de la ecuacion, no la etiqueta entre parentesis-. Para transcribir la
ecuacion sigue mandando la pagina rasterizada (ver CLAUDE.md).

Escribe data/normas-apendices.json, que `npm run indice:normas` fusiona.
"""
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

# «(A-3-1M)», «(A-8-3)», «(A-1-6a)». Dos familias de sufijo que conviven: las
# letras minusculas parten la ecuacion en ramas, y la M es la MISMA ecuacion en
# unidades metricas -que para este sitio es la que se cita siempre-.
TAG_APENDICE = re.compile(r"\(([A-H])-(\d{1,2})-(\d{1,2})([A-Za-z]?)\)")

# «(C-5)», «(C-17a)», «(B-13b)» — la forma de la DG1. Y las de capitulo,
# «(4-30)», que van al mismo saco porque tambien son etiquetas de la guia.
TAG_DG1 = re.compile(r"\((?:([A-D])|(\d{1,2}))-(\d{1,3})([a-d]?)\)")

FUENTES = {
    "aisc360-22": (r"F:\OneDrive\Ingenieria\Normas\A360-22W-ewr.pdf", "apendice"),
    "aisc341-22": (r"F:\OneDrive\Ingenieria\Normas\A341-22W-oke.pdf", "apendice"),
    "dg1-3ed": (r"F:\OneDrive\Ingenieria\Normas\AISC Design Guide 1 - 3rd Edition.pdf", "dg1"),
}


def tags_de(doc, familia: str) -> dict[str, str]:
    """Etiquetas del documento, con la pagina PDF donde aparece cada una primero."""
    re_tag = TAG_APENDICE if familia == "apendice" else TAG_DG1
    tags: dict[str, str] = {}
    for i in range(doc.page_count):
        for m in re_tag.finditer(doc[i].get_text()):
            if familia == "apendice":
                tag = f"{m.group(1)}-{m.group(2)}-{m.group(3)}{m.group(4)}"
            else:
                tag = f"{m.group(1) or m.group(2)}-{m.group(3)}{m.group(4)}"
            # La primera aparicion gana: es donde el documento la define.
            tags.setdefault(tag, f"pdf p.{i + 1}")
    return tags


def main() -> None:
    try:
        import fitz  # PyMuPDF
    except ImportError:
        raise SystemExit("falta PyMuPDF: pip install pymupdf")

    salida = {}
    for clave, (ruta, familia) in FUENTES.items():
        if not Path(ruta).exists():
            print(f"· {clave}: no esta el PDF en {ruta}, se salta")
            continue
        tags = tags_de(fitz.open(ruta), familia)
        salida[clave] = tags
        etiqueta = "de apendice" if familia == "apendice" else "de la guia"
        print(f"{clave:14s} {len(tags)} etiquetas {etiqueta}")

    destino = RAIZ / "data" / "normas-apendices.json"
    destino.write_text(json.dumps(salida, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\n-> {destino.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
