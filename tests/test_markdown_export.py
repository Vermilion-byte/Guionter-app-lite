"""Prueba de la exportación a Markdown (.md).

Comprueba, en un navegador real:
  1. el botón de Markdown existe y dice lo que debe;
  2. al pulsarlo se descarga guionter-texto.md;
  3. el archivo lleva título, resumen con estadísticas y el texto;
  4. las estadísticas del resumen coinciden con las de la pantalla;
  5. el texto se conserva (no se pierde ni se parte mal);
  6. los caracteres que Markdown interpretaría como formato van escapados;
  7. sin texto avisa en vez de descargar un archivo vacío;
  8. si hay un título escrito en el generador, se usa como título.

Uso:  python tests/test_markdown_export.py [ruta-al-index.html]

Es la misma prueba que la de la versión completa: busca la app sola, así que
sirve igual aquí (index.html en la raíz) que allí (web/index.html).
"""
import re
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

for _flujo in (sys.stdout, sys.stderr):
    try:
        _flujo.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

REPO_DIR = Path(__file__).resolve().parent.parent


def _index_por_defecto():
    for candidato in (REPO_DIR / "index.html", REPO_DIR / "web" / "index.html"):
        if candidato.is_file():
            return candidato
    return REPO_DIR / "index.html"


INDEX_POR_DEFECTO = _index_por_defecto()
TMP_DIR = Path(tempfile.mkdtemp(prefix="guionter-md-test-"))

TEXTO = (
    "Primer párrafo con **negritas** y un _guion_bajo, para ver el escapado.\n\n"
    "# Esto parecía un título de Markdown\n\n"
    "- Esto parecía una lista\n\n"
    "Último párrafo: cierre del guion."
)

fallos = []


def check(nombre, condicion, detalle=""):
    print(f"  [{'OK  ' if condicion else 'FALLA'}] {nombre}" + (f"  -> {detalle}" if detalle else ""))
    if not condicion:
        fallos.append(nombre)


def lanzar_navegador(p):
    cache = Path.home() / "AppData" / "Local" / "ms-playwright"
    if cache.is_dir():
        for carpeta in cache.glob("chromium*"):
            if any(carpeta.rglob("chrome.exe")) or any(carpeta.rglob("chrome-headless-shell.exe")):
                return p.chromium.launch()
    for ruta in (r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                 r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"):
        if Path(ruta).exists():
            print("  (usando el navegador del equipo:", ruta, ")")
            return p.chromium.launch(executable_path=ruta)
    for canal in ("chrome", "msedge"):
        try:
            return p.chromium.launch(channel=canal)
        except Exception:
            continue
    raise RuntimeError("No hay navegador disponible.")


def main():
    ruta = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else INDEX_POR_DEFECTO
    print(f"Probando: {ruta}")
    print()

    with sync_playwright() as p:
        browser = lanzar_navegador(p)
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        # Un error de JavaScript dejaría la exportación muda (el botón no hace
        # nada y no se descarga nada): se recoge para poder señalarlo.
        errores_js = []
        page.on("pageerror", lambda e: errores_js.append(str(e)))
        page.goto(ruta.as_uri())
        page.wait_for_load_state("load")
        page.wait_for_timeout(300)

        print("1) El botón existe y está traducido")
        check("el botón de Markdown está en la barra", page.locator("#btnMd").count() == 1)
        etiqueta = page.inner_text("#btnMd").strip()
        print(f"   etiqueta: {etiqueta!r} | title: {page.get_attribute('#btnMd', 'title')!r}")
        check("la etiqueta dice Markdown", "Markdown" in etiqueta)
        check("tiene explicación al pasar el ratón", bool((page.get_attribute("#btnMd", "title") or "").strip()))

        print("2) Sin texto avisa y no descarga")
        descargas = []
        page.on("download", lambda d: descargas.append(d))
        page.click("#btnMd")
        page.wait_for_timeout(500)
        check("no se descargó nada con el editor vacío", len(descargas) == 0)
        aviso = page.evaluate("() => { const t = document.getElementById('downloadToast'); return t ? t.textContent : ''; }")
        print(f"   aviso mostrado: {aviso!r}")
        check("avisó de que falta el texto", bool(aviso.strip()))

        print("3) Con texto, se descarga guionter-texto.md")
        page.fill("#input", TEXTO)
        page.wait_for_timeout(400)
        with page.expect_download() as info:
            page.click("#btnMd")
        descarga = info.value
        destino = TMP_DIR / "salida.md"
        descarga.save_as(str(destino))
        page.wait_for_timeout(400)
        print(f"   nombre sugerido: {descarga.suggested_filename}")
        check("el archivo se llama guionter-texto.md", descarga.suggested_filename == "guionter-texto.md")

        contenido = destino.read_text(encoding="utf-8")
        print("   --- primeras líneas del archivo ---")
        for linea in contenido.splitlines()[:12]:
            print("   |", linea)
        print("   -----------------------------------")

        print("4) Estructura del documento")
        check("empieza con un título de nivel 1", contenido.lstrip().startswith("# "), contenido.splitlines()[0][:60])
        check("lleva el resumen como sección", "## " in contenido)
        check("el resumen va en viñetas", re.search(r"^- ", contenido, re.M) is not None)
        check("separa resumen y texto con una línea horizontal", "\n---\n" in contenido)

        print("5) Las estadísticas coinciden con las de la pantalla")
        en_pantalla = {
            "palabras": page.inner_text("#statWords").strip(),
            "caracteres": page.inner_text("#statChars").strip(),
            "oraciones": page.inner_text("#statSentences").strip(),
            "párrafos": page.inner_text("#statParagraphs").strip(),
        }
        print(f"   en pantalla: {en_pantalla}")
        for nombre, valor in en_pantalla.items():
            # El resumen trae el número en la misma forma que la pantalla.
            check(f"el resumen incluye {nombre} = {valor}", re.search(rf"\b{re.escape(valor)}\b", contenido) is not None)

        print("6) El texto se conserva completo")
        for fragmento in ["Primer párrafo", "Último párrafo: cierre del guion.", "negritas", "guion_bajo"]:
            check(f"aparece: {fragmento!r}", fragmento in contenido)

        print("7) Se escapa lo que Markdown interpretaría como formato")
        check("las negritas del texto van escapadas", "\\*\\*negritas\\*\\*" in contenido,
              "debe verse \\*\\*negritas\\*\\*")
        # Un guion bajo suelto dentro de una palabra no significa nada para
        # Markdown, así que se deja tal cual: aparece en palabras normales.
        check("el guion bajo suelto se deja legible", "_guion_bajo" in contenido)
        check("no se duplican las barras invertidas", "\\\\" not in contenido,
              "cada escape debe llevar una sola barra")
        # Estas dos líneas empezaban por # y -, que crearían un título y una
        # lista falsos dentro del guion.
        cuerpo = contenido.split("\n---\n", 1)[1] if "\n---\n" in contenido else contenido
        check("el '#' del texto no crea un título falso", "\n# Esto parecía" not in cuerpo,
              "debe quedar escapado")
        check("el '-' del texto no crea una lista falsa",
              not re.search(r"^- Esto parecía una lista", cuerpo, re.M),
              "debe quedar escapado")
        check("las líneas escapadas conservan una sola barra invertida",
              "\\# Esto parecía" in contenido and "\\- Esto parecía" in contenido)

        print("8) Si hay un título escrito en el generador, se usa como título")
        page.fill("#titleGenInput", "Mi título de prueba")
        page.wait_for_timeout(200)
        with page.expect_download() as info2:
            page.click("#btnMd")
        destino2 = TMP_DIR / "salida2.md"
        info2.value.save_as(str(destino2))
        contenido2 = destino2.read_text(encoding="utf-8")
        print("   primera línea:", contenido2.splitlines()[0])
        check("usa el título del generador", contenido2.lstrip().startswith("# Mi título de prueba"))

        browser.close()

    if errores_js:
        check("no hubo errores de JavaScript en la página", False, "; ".join(errores_js[:3]))

    print()
    print("  archivo de ejemplo:", TMP_DIR / "salida.md")
    if fallos:
        print(f"RESULTADO: {len(fallos)} comprobación(es) fallaron -> {fallos}")
        return 1
    print("RESULTADO: todas las comprobaciones pasaron")
    return 0


if __name__ == "__main__":
    sys.exit(main())
