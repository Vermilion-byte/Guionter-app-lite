# Guionter Lite

Analizador de texto bilingüe (ES/EN): conteo de palabras/caracteres/oraciones/párrafos,
tiempo de lectura y de habla, nivel de lectura, densidad de palabras clave, corrector
ortográfico y gramatical, exportación a Word/PDF/SRT/Markdown, y un diccionario de pronunciación +
adaptación de citas numéricas para preparar texto antes de pasarlo a cualquier TTS.

100% en el navegador (sin backend), funciona sin conexión salvo el chequeo gramatical
avanzado (usa la API pública de LanguageTool). No incluye la integración con Applio
(clonación de voz) — para esa versión ver el repositorio "guionter" completo.

## Usar online

Este repo está pensado para publicarse con GitHub Pages: Settings → Pages → Deploy from
branch → `main` → `/ (root)`. Una vez activado, GitHub te da una URL propia
(`https://<usuario>.github.io/<repo>/`) donde la app queda disponible para cualquiera.

## Uso local

**Opción recomendada (Windows):** haz doble clic en `iniciar-guionter.bat`. Levanta un
servidor local (con Python o Node, lo que tengas instalado) y abre Guionter Lite en tu
navegador — así el service worker y la instalación como PWA ("Agregar a pantalla de
inicio" / "Instalar app") funcionan correctamente, algo que el navegador no permite si
abres el archivo directamente con `file://`.

**Alternativa rápida:** abre `index.html` directamente en el navegador. La app funciona
igual, pero sin caché sin conexión ni opción de instalarla como app.

## Pruebas

Necesitan Python con Playwright (`pip install playwright`). Usan el Chromium de
Playwright o, si no está, el Chrome/Edge del equipo.

```powershell
python tests\test_float_nav.py        # botón flotante para subir y bajar
python tests\test_markdown_export.py  # exportación a Markdown
python tests\test_lang_theme.py       # el idioma y el tema se recuerdan
```
