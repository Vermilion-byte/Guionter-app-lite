"""Prueba del botón flotante para subir y bajar por el texto.

Comprueba, en un navegador real, que:

  1. cada flecha se ofrece solo cuando sirve de algo;
  2. cuando no sirve ninguna, el botón se retira del todo (si no, su recuadro
     invisible interceptaría clics de lo que hay debajo);
  3. la flecha de subir devuelve el inicio del texto a la vista;
  4. la flecha de bajar lleva al final del texto;
  5. con el cuadro de texto con barra propia (ventana baja), las flechas mueven
     primero el texto DENTRO del cuadro y solo después la página;
  6. las flechas no se pisan entre sí ni con el contador flotante;
  6b. hay un botón a cada lado del editor, montado sobre su borde, y siguen al
     borde inferior del cuadro cuando se ve;
  7. el interruptor lo apaga y lo enciende, y la preferencia se recuerda.

Uso:

    python tests/test_float_nav.py            # sobre index.html
    python tests/test_float_nav.py <ruta>

Es la misma prueba que la de la versión completa: busca la app sola, así que
sirve igual aquí (index.html en la raíz) que allí (web/index.html).
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
    """La app está en index.html en la raíz de la Lite, pero en web/index.html
    en la versión completa. Se busca, para que la misma prueba sirva en las dos."""
    for candidato in (REPO_DIR / "index.html", REPO_DIR / "web" / "index.html"):
        if candidato.is_file():
            return candidato
    return REPO_DIR / "index.html"


INDEX_POR_DEFECTO = _index_por_defecto()

VIEWPORT_H = 800
VIEWPORT_ALTO_CORTO = 480
FIXTURE = "\n\n".join(
    f"Párrafo {i}: " + ("texto de prueba para que el guion sea largo. " * 12)
    for i in range(1, 46)
)

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
    raise RuntimeError(
        "No hay navegador disponible: usa `playwright install chromium` "
        "o ten Chrome/Edge instalado."
    )


def estado(page):
    """Todo lo que interesa del botón y del editor, en una sola consulta."""
    return page.evaluate(
        """() => {
            const nav = document.getElementById('floatNav');
            const input = document.getElementById('input');
            const badge = document.getElementById('floatCharStat');
            const r = input.getBoundingClientRect();
            const vis = (sel) => { const el = document.querySelector(sel); return !!el && getComputedStyle(el).display !== 'none'; };
            const rect = (sel) => { const el = document.querySelector(sel); const b = el.getBoundingClientRect(); return {top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), right: Math.round(b.right)}; };
            return {
                show: nav.classList.contains('show'),
                pos: nav.dataset.pos,
                hide: nav.dataset.hide,
                editor: {top: Math.round(r.top), bottom: Math.round(r.bottom)},
                up: vis('#btnFloatUp'),
                down: vis('#btnFloatDown'),
                upRect: rect('#btnFloatUp'),
                downRect: rect('#btnFloatDown'),
                badge: badge.classList.contains('show'),
                badgeRect: rect('#floatCharStat'),
                scrollY: Math.round(window.scrollY),
                maxScroll: Math.round(document.documentElement.scrollHeight - window.innerHeight),
            };
        }"""
    )


def solapan(a, b):
    if a["right"] <= a["left"] or b["right"] <= b["left"]:
        return False  # alguno no está en pantalla
    return not (a["right"] <= b["left"] or b["right"] <= a["left"]
                or a["bottom"] <= b["top"] or b["bottom"] <= a["top"])


def lados(page):
    """Los dos botones (izquierda y derecha) frente al cuadro del editor."""
    return page.evaluate(
        """() => {
            const card = (document.getElementById('input').closest('.editor-card') || document.getElementById('input')).getBoundingClientRect();
            const vis = (sel) => { const el = document.querySelector(sel); return !!el && getComputedStyle(el).display !== 'none'; };
            const rect = (sel) => { const b = document.querySelector(sel).getBoundingClientRect(); return {top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), right: Math.round(b.right)}; };
            const visible = (id) => { const up = '#' + id + ' .float-nav-up', down = '#' + id + ' .float-nav-down';
                return vis(up) ? rect(up) : vis(down) ? rect(down) : null; };
            const n = (id) => document.getElementById(id);
            return {
                card: {left: Math.round(card.left), right: Math.round(card.right), top: Math.round(card.top), bottom: Math.round(card.bottom)},
                vh: window.innerHeight,
                existe: !!n('floatNavLeft'),
                mismo: n('floatNavLeft') && n('floatNav').dataset.pos === n('floatNavLeft').dataset.pos
                       && n('floatNav').dataset.hide === n('floatNavLeft').dataset.hide
                       && n('floatNav').classList.contains('show') === n('floatNavLeft').classList.contains('show'),
                der: visible('floatNav'),
                izq: n('floatNavLeft') ? visible('floatNavLeft') : null,
                showIzq: n('floatNavLeft') ? n('floatNavLeft').classList.contains('show') : false,
                badge: rect('#floatCharStat'),
                badgeVis: document.getElementById('floatCharStat').classList.contains('show'),
            };
        }"""
    )


def mover(page, y, espera=500):
    page.evaluate(f"window.scrollTo(0, {y})")
    page.wait_for_timeout(espera)


def main():
    ruta = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else INDEX_POR_DEFECTO
    print(f"Probando: {ruta}")
    print()

    with sync_playwright() as p:
        browser = lanzar_navegador(p)
        page = browser.new_page(viewport={"width": 1280, "height": VIEWPORT_H})
        page.goto(ruta.as_uri())
        page.wait_for_load_state("load")
        page.fill("#input", FIXTURE)
        page.wait_for_timeout(600)

        max_scroll = estado(page)["maxScroll"]
        print(f"  (alto desplazable de la página: {max_scroll}px)")

        print("1) La regla de las flechas se cumple en cualquier posición")
        for fraccion in (0, 0.25, 0.6, 1.0):
            mover(page, int(max_scroll * fraccion))
            e = estado(page)
            espera_arriba = e["editor"]["top"] < -8
            espera_abajo = e["editor"]["bottom"] > VIEWPORT_H + 8
            check(
                f"a {int(fraccion * 100)}% del desplazamiento se ofrece exactamente lo que sirve",
                e["up"] == espera_arriba and e["down"] == espera_abajo,
                f"editor={e['editor']} up={e['up']}({espera_arriba}) down={e['down']}({espera_abajo})",
            )
            check(
                f"a {int(fraccion * 100)}% el botón no intercepta clics si no sirve",
                (e["show"] and e["hide"] == "0") if (espera_arriba or espera_abajo) else (not e["show"] and e["hide"] == "1"),
                f"show={e['show']} hide={e['hide']}",
            )

        print("2) Las flechas no se pisan entre sí ni con el contador flotante")
        mover(page, int(max_scroll * 0.6))
        e = estado(page)
        if e["up"] and e["down"]:
            check("las dos flechas no se solapan", not solapan(e["upRect"], e["downRect"]),
                  f"subir={e['upRect']} bajar={e['downRect']}")
        if e["badge"]:
            check("el botón no tapa el contador flotante",
                  not (e["up"] and solapan(e["upRect"], e["badgeRect"]))
                  and not (e["down"] and solapan(e["downRect"], e["badgeRect"])),
                  f"contador={e['badgeRect']} subir={e['upRect']} bajar={e['downRect']}")
        else:
            print("   (el contador flotante no está visible ahora mismo)")

        print("2b) Hay un botón a cada lado del editor, pegado al cuadro")
        mover(page, int(max_scroll * 0.6))
        L = lados(page)
        check("existe el botón de la izquierda", L["existe"])
        check("los dos muestran lo mismo", bool(L["mismo"]))
        if L["der"] and L["izq"]:
            centro_der = (L["der"]["left"] + L["der"]["right"]) / 2
            centro_izq = (L["izq"]["left"] + L["izq"]["right"]) / 2
            check("el de la derecha va sobre el borde derecho del cuadro",
                  abs(centro_der - L["card"]["right"]) <= 30, f"centro={centro_der} borde={L['card']['right']}")
            check("el de la izquierda va sobre el borde izquierdo del cuadro (o lo más cerca que cabe)",
                  abs(centro_izq - L["card"]["left"]) <= 30, f"centro={centro_izq} borde={L['card']['left']}")
            check("cada uno queda de su lado", centro_izq < centro_der)
            check("están a la misma altura", L["der"]["top"] == L["izq"]["top"], f"{L['der']['top']} / {L['izq']['top']}")
            if L["badgeVis"]:
                check("ninguno tapa el contador flotante",
                      not solapan(L["der"], L["badge"]) and not solapan(L["izq"], L["badge"]),
                      f"contador={L['badge']} der={L['der']} izq={L['izq']}")
        # Cuando el borde de abajo del cuadro se ve, las flechas lo acompañan.
        e = estado(page)
        mover(page, int(e["editor"]["bottom"] + e["scrollY"] - VIEWPORT_H * 0.5))
        L = lados(page)
        if L["der"] and 0 < L["card"]["bottom"] < L["vh"] - 120:
            check("siguen al borde inferior del cuadro cuando se ve",
                  abs(L["der"]["bottom"] - L["card"]["bottom"]) <= 30,
                  f"flecha={L['der']['bottom']} borde={L['card']['bottom']}")
        if L["izq"]:
            page.click("#floatNavLeft .float-nav-up")
            page.wait_for_timeout(1500)
            e = estado(page)
            check("la flecha de la izquierda también sube al inicio", -8 <= e["editor"]["top"] <= 40, str(e["editor"]))

        mover(page, int(max_scroll * 0.6))
        e = estado(page)
        print("3) La flecha de subir devuelve el inicio del texto a la vista")
        check("la flecha de subir está disponible", e["up"] and e["show"], f"pos={e['pos']}")
        if e["up"] and e["show"]:
            page.click("#btnFloatUp")
            page.wait_for_timeout(1500)
            e = estado(page)
            check("el inicio del editor volvió a la vista", -8 <= e["editor"]["top"] <= 40, str(e["editor"]))
            check("la flecha de subir ya no se ofrece", not e["up"] or not e["show"],
                  f"up={e['up']} show={e['show']}")

        print("4) La flecha de bajar lleva al final del texto")
        # Un punto donde el final del editor esté por debajo de la pantalla.
        e = estado(page)
        objetivo = max(0, int(e["editor"]["bottom"] + e["scrollY"] - VIEWPORT_H - 60))
        mover(page, objetivo)
        e = estado(page)
        check("la flecha de bajar está disponible", e["down"] and e["show"], f"pos={e['pos']}")
        if e["down"] and e["show"]:
            page.click("#btnFloatDown")
            page.wait_for_timeout(1600)
            e = estado(page)
            # Con textos muy largos, al llegar al final de la página el editor
            # no siempre puede alinearse con el borde de abajo (puede haber
            # contenido más abajo ocupando el último tramo). Lo que el botón
            # garantiza es que el final del texto quede a la vista.
            check("el final del editor quedó dentro de la pantalla",
                  e["editor"]["bottom"] <= VIEWPORT_H + 8, str(e["editor"]))

        print("5) El interruptor lo apaga y lo enciende")
        mover(page, int(max_scroll * 0.6))
        check("aparece antes de apagarlo", estado(page)["show"])
        page.evaluate("document.getElementById('floatNavToggle').scrollIntoView({block:'center'})")
        page.wait_for_timeout(400)
        page.uncheck("#floatNavToggle")
        page.wait_for_timeout(400)
        e = estado(page)
        check("desaparece al apagarlo", not e["show"])
        check("el de la izquierda también desaparece", not lados(page)["showIzq"])
        check("sus flechas dejan de interceptar clics", e["hide"] == "1", f"hide={e['hide']}")
        page.check("#floatNavToggle")
        page.wait_for_timeout(500)
        check("vuelve al encenderlo", estado(page)["show"])

        print("6) La preferencia se recuerda al recargar")
        page.evaluate("document.getElementById('floatNavToggle').scrollIntoView({block:'center'})")
        page.wait_for_timeout(300)
        page.uncheck("#floatNavToggle")
        page.wait_for_timeout(300)
        page.reload()
        page.wait_for_load_state("load")
        page.wait_for_timeout(500)
        check("sigue apagado tras recargar", not page.is_checked("#floatNavToggle"))
        page.evaluate("document.getElementById('floatNavToggle').scrollIntoView({block:'center'})")
        page.wait_for_timeout(300)
        page.check("#floatNavToggle")
        page.wait_for_timeout(300)
        check("y se puede volver a encender", page.is_checked("#floatNavToggle"))

        browser.close()

    # ------------------------------------------------------------------
    # Ventana baja: el cuadro de texto se queda sin sitio, así que tiene barra
    # propia. Aquí las flechas deben mover el texto DENTRO del cuadro (que era
    # lo que hacía falta) y solo después la página.
    # ------------------------------------------------------------------
    print("7) Con el cuadro con barra propia, las flechas mueven el texto dentro")
    with sync_playwright() as p:
        browser = lanzar_navegador(p)
        page = browser.new_page(viewport={"width": 1280, "height": VIEWPORT_ALTO_CORTO})
        page.goto(ruta.as_uri())
        page.wait_for_load_state("load")
        page.fill("#input", FIXTURE)
        page.wait_for_timeout(700)
        mover(page, 0)

        tiene_barra = page.evaluate(
            "() => { const i = document.getElementById('input'); return i.scrollHeight > i.clientHeight + 1; }"
        )
        print(f"   el cuadro tiene barra propia: {tiene_barra}")
        check("en una ventana baja el cuadro tiene barra propia", tiene_barra)
        if tiene_barra:
            print("   - la flecha de bajar mueve el texto, no la pagina de golpe")
            y_antes = estado(page)["scrollY"]
            page.click("#btnFloatDown")
            page.wait_for_timeout(900)
            dentro = page.evaluate("() => document.getElementById('input').scrollTop")
            y_despues = estado(page)["scrollY"]
            print(f"     posicion dentro del cuadro: {dentro} | pagina: {y_antes} -> {y_despues}")
            check("el texto se movio dentro del cuadro", dentro > 0, f"scrollTop={dentro}")
            check("el final del texto quedo a la vista",
                  estado(page)["editor"]["bottom"] <= VIEWPORT_ALTO_CORTO + 8, str(estado(page)["editor"]))

            print("   - la flecha de subir devuelve al principio del texto")
            page.click("#btnFloatUp")
            page.wait_for_timeout(900)
            e = estado(page)
            dentro = page.evaluate("() => document.getElementById('input').scrollTop")
            print(f"     posicion dentro del cuadro: {dentro} | editor: {e['editor']}")
            # Con la ventana baja, el cuadro no cabe entero: lo que importa es
            # que la PRIMERA linea del texto quede a la vista y que la pagina
            # no se haya ido al final del todo.
            check("el principio del texto quedo a la vista", -8 <= e["editor"]["top"] <= 40, str(e["editor"]))
            check("el cuadro no se bajo al final de la pagina", e["scrollY"] < e["maxScroll"] - 50,
                  f"scrollY={e['scrollY']} max={e['maxScroll']}")

        browser.close()

    print()
    if fallos:
        print(f"RESULTADO: {len(fallos)} comprobación(es) fallaron -> {fallos}")
        return 1
    print("RESULTADO: todas las comprobaciones pasaron")
    return 0


if __name__ == "__main__":
    sys.exit(main())
