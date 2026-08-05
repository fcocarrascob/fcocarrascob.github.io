#!/usr/bin/env python
"""Extrae del PDF de una norma las etiquetas de ecuacion que la wiki NO ingirio.

    python scripts/extraer-tags-pdf.py

Existe por los APENDICES. Las extracciones de material_teorico cubren los
capitulos (cap*.txt) pero no los apendices, y los posts publicados citan la
Ec. A-3-1M (fatiga, viga carrilera) y las Ecs. A-8-3 / A-8-5 (el B_1 del
analisis de segundo orden, que la viga-columna usa y el motor recibe como dato).
Sin esto, `verify:ecuaciones` las reporta como huerfanas y el libro mayor no
puede cubrir lo que el sitio de verdad cita.

Las etiquetas de apendice llevan TRES partes -letra, numero de apendice, numero
de ecuacion- y a veces sufijo M de metrico: A-3-1M, A-8-3, A-8-5. Nada que ver
con la forma de capitulo (F4-9b), por eso van por separado.

Escribe data/normas-apendices.json, que `npm run indice:normas` fusiona.
"""
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

NORMAS = {
    "aisc360-22": r"F:\OneDrive\Ingenieria\Normas\A360-22W-ewr.pdf",
    "aisc341-22": r"F:\OneDrive\Ingenieria\Normas\A341-22W-oke.pdf",
}

# «(A-3-1M)», «(A-8-3)», «(A-1-6a)». Dos familias de sufijo que conviven: las
# letras minusculas parten la ecuacion en ramas, y la M es la MISMA ecuacion en
# unidades metricas -que para este sitio es la que se cita siempre-.
TAG = re.compile(r"\(([A-H])-(\d{1,2})-(\d{1,2})([A-Za-z]?)\)")


def main() -> None:
    try:
        import fitz  # PyMuPDF
    except ImportError:
        raise SystemExit("falta PyMuPDF: pip install pymupdf")

    salida = {}
    for clave, ruta in NORMAS.items():
        if not Path(ruta).exists():
            print(f"· {clave}: no esta el PDF en {ruta}, se salta")
            continue
        doc = fitz.open(ruta)
        tags: dict[str, str] = {}
        for i in range(doc.page_count):
            for m in TAG.finditer(doc[i].get_text()):
                tag = f"{m.group(1)}-{m.group(2)}-{m.group(3)}{m.group(4)}"
                # La primera aparicion gana: es donde la norma la define.
                tags.setdefault(tag, f"pdf p.{i + 1}")
        salida[clave] = tags
        print(f"{clave:14s} {len(tags)} etiquetas de apendice")

    destino = RAIZ / "data" / "normas-apendices.json"
    destino.write_text(json.dumps(salida, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\n-> {destino.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
