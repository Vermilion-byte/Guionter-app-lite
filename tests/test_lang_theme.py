"""Prueba de que el idioma y el tema se recuerdan al recargar.

Comprueba, en un navegador real, que:

  1. la primera vez la app arranca en español y con el tema del sistema;
  2. al elegir inglés, la interfaz cambia y sigue en inglés tras recargar;
  3. el botón de tema recorre oscuro -> claro -> sistema, y cada elección se
     mantiene tras recargar;
  4. volver a español también se recuerda;
  5. no aparece ningún error de JavaScript por el camino.

Uso:

    python tests/test_lang_theme.py            # sobre la app de este repositorio
    python tests/test_lang_theme.py <ruta>     # sobre otra copia (p. ej. la Lite)
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

# La consola de Windows no imprime por defecto los acentos ni las flechas.
for _flujo in (sys.stdout, sys.stderr):
    try:
        _flujo.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

REPO_DIR = Path(__file__).resolve().parent.parent


def _index_por_defecto():
    """web/index.html en la versión completa, index.html en la raíz de la Lite."""
    for candidato in (REPO_DIR / "web" / "index.html", REPO_DIR / "index.html"):
        if candidato.is_file():
            return candidato
    return REPO_DIR / "web" / "index.html"


fallos = []


def check(nombre, condicion, detalle=""):
    print(f"  [{'OK  ' if condicion else 'FALLA'}] {nombre}" + (f"  -> {detalle}" if detalle else ""))
    if not condicion:
        fallos.append(nombre)


def lanzar_navegador(p):
    """Chromium de Playwright si está descargado; si no, un Chrome o Edge ya
    instalados en el equipo (la descarga del CDN puede fallar)."""
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
    try:
        return p.chromium.launch()
    except Exception:
        raise RuntimeError(
            "No hay navegador disponible: usa `playwright install chromium` "
            "o ten Chrome/Edge instalado."
        )


def estado(page):
    return page.evaluate(
        """() => ({
            lang: document.documentElement.lang,
            select: document.getElementById('langSelect').value,
            palabras: document.getElementById('t-words').textContent.trim(),
            tema: document.documentElement.getAttribute('data-theme') || 'auto',
            fondo: getComputedStyle(document.body).backgroundColor,
        })"""
    )


def recargar(page):
    page.reload()
    page.wait_for_load_state("load")
    page.wait_for_timeout(300)


def main():
    ruta = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else _index_por_defecto()
    print(f"Probando: {ruta}")
    print()

    with sync_playwright() as p:
        browser = lanzar_navegador(p)
        # Sistema en modo claro, para que "auto" y "oscuro" se distingan.
        context = browser.new_context(color_scheme="light", viewport={"width": 1280, "height": 800})
        page = context.new_page()
        errores = []
        page.on("pageerror", lambda e: errores.append(str(e)))
        page.goto(ruta.as_uri())
        page.wait_for_load_state("load")
        page.evaluate("localStorage.removeItem('guionter-lang'); localStorage.removeItem('guionter-theme')")
        recargar(page)

        print("1) Primera visita")
        e = estado(page)
        check("arranca en español", e["lang"] == "es" and e["select"] == "es", e)
        check("arranca con el tema del sistema", e["tema"] == "auto", e["tema"])
        fondo_claro = e["fondo"]

        print("2) El idioma se recuerda")
        page.select_option("#langSelect", "en")
        page.wait_for_timeout(200)
        e = estado(page)
        check("la interfaz cambia a inglés", e["palabras"] == "Words", e["palabras"])
        recargar(page)
        e = estado(page)
        check("sigue en inglés tras recargar", e["lang"] == "en" and e["select"] == "en" and e["palabras"] == "Words", e)

        print("3) El tema se recuerda")
        page.click("#btnTheme")
        e = estado(page)
        check("primer clic: oscuro", e["tema"] == "dark", e["tema"])
        recargar(page)
        e = estado(page)
        check("sigue oscuro tras recargar", e["tema"] == "dark", e["tema"])
        check("y el fondo es realmente el oscuro", e["fondo"] != fondo_claro, e["fondo"])

        page.click("#btnTheme")
        recargar(page)
        e = estado(page)
        check("segundo clic: claro, y se mantiene", e["tema"] == "light", e["tema"])

        page.click("#btnTheme")
        recargar(page)
        e = estado(page)
        check("tercer clic: vuelve al del sistema, y se mantiene", e["tema"] == "auto", e["tema"])

        print("4) Volver a español también se recuerda")
        page.select_option("#langSelect", "es")
        recargar(page)
        e = estado(page)
        check("sigue en español tras recargar", e["lang"] == "es" and e["select"] == "es", e)

        print("5) Sin errores de JavaScript")
        check("ningún error en la página", not errores, errores)

        browser.close()

    print()
    if fallos:
        print(f"RESULTADO: {len(fallos)} comprobación(es) fallaron:")
        for f in fallos:
            print("  -", f)
        sys.exit(1)
    print("RESULTADO: todas las comprobaciones pasaron")


if __name__ == "__main__":
    main()
