/* Guionter — analizador de texto (palabras, caracteres, oraciones, párrafos,
   nivel de lectura, tiempo de lectura/habla, densidad de palabras clave,
   corrector ortográfico y gramatical). 100% del conteo funciona sin conexión;
   solo el chequeo gramatical avanzado usa una API pública (LanguageTool). */

(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // i18n
  // ---------------------------------------------------------------------
  const STR = {
    es: {
      title: "Guionter",
      subtitle: "Analizador de texto en tiempo real",
      copy: "Copiar",
      clear: "Limpiar",
      editorHint: "Escribe o pega tu texto abajo. La ortografía se revisa automáticamente mientras escribes.",
      placeholder: "Empieza a escribir o pega tu texto aquí…",
      statsTitle: "Estadísticas",
      words: "Palabras",
      chars: "Caracteres (con espacios)",
      charsNoSpace: "Caracteres (sin espacios)",
      sentences: "Oraciones",
      paragraphs: "Párrafos",
      readTime: "Tiempo de lectura",
      speakTime: "Tiempo de habla",
      readLevelTitle: "Nivel de lectura",
      kwTitle: "Densidad de palabras clave",
      excludeCommon: "Excluir palabras comunes (el, la, de, and, the…)",
      grammarTitle: "Corrector ortográfico y gramatical",
      grammarHint: "El subrayado rojo del cuadro de texto ya corrige ortografía automáticamente (usa el corrector de tu navegador/sistema). Para un análisis más completo (gramática, estilo) usa el botón de abajo — necesita conexión a internet.",
      grammarBtn: "Revisar ortografía y gramática",
      grammarChecking: "Revisando…",
      grammarNone: "No se encontraron errores. ¡Buen trabajo!",
      grammarEmpty: "Escribe algo de texto primero.",
      grammarError: "No se pudo conectar con el servicio de revisión (revisa tu conexión a internet). El contador de palabras y el resto de estadísticas siguen funcionando sin conexión.",
      grammarFound: (n) => `Se encontraron ${n} sugerencia(s).`,
      suggestion: "Sugerencia",
      downloadWord: "Word",
      downloadPdf: "PDF",
      downloadWordTitle: "Descargar el texto como documento de Word (.doc)",
      downloadPdfTitle: "Descargar el texto como PDF",
      downloadSrt: "SRT",
      downloadSrtTitle: "Descargar el guion como subtítulos (.srt) con tiempos estimados por párrafo",
      downloadSrtError: "No se pudo generar el archivo .srt.",
      exportConfig: "Backup",
      exportConfigTitle: "Exportar tu diccionario TTS y guiones guardados en un archivo",
      exportConfigError: "No se pudo generar el archivo de respaldo.",
      importConfig: "Restaurar",
      importConfigTitle: "Importar un archivo de respaldo (combina con lo que ya tienes, no borra nada existente)",
      importConfigError: "No se pudo leer ese archivo de respaldo — revisa que sea un backup válido de Guionter.",
      importConfigDone: (dict, scriptsN) => `Restaurado: ${dict} palabra(s) del diccionario, ${scriptsN} guion(es).`,
      downloadEmpty: "Escribe algo de texto antes de descargar.",
      pdfStatsHeading: "Resumen",
      footer: 'Guionter funciona sin conexión para el conteo de texto. Instálalo desde el menú del navegador para usarlo como app de escritorio o en Android ("Agregar a pantalla de inicio" / "Instalar app").',
      tab1: "1 palabra",
      tab2: "2 palabras",
      tab3: "3 palabras",
      kwWord: "Palabra clave",
      kwCount: "Veces",
      kwDensity: "Densidad",
      kwEmpty: "Escribe texto para ver la densidad de palabras clave.",
      levels: {
        veryEasy: "Muy fácil", easy: "Fácil", fairlyEasy: "Bastante fácil",
        standard: "Estándar", fairlyDifficult: "Bastante difícil",
        difficult: "Difícil", veryConfusing: "Muy difícil",
        na: "Escribe texto para calcular"
      },
      gradeLabel: (g) => `Grado escolar aprox.: ${g}`,
      copied: "¡Copiado!",
      adaptNumbersBtn: "Adaptar texto para TTS",
      adaptNumbersNone: "No se encontró nada que adaptar (ni citas numéricas ni palabras de tu diccionario).",
      adaptNumbersDone: (n) => `${n} cambio${n === 1 ? "" : "s"} aplicado${n === 1 ? "" : "s"} al texto — revisa antes de generar el audio.`,
      scriptLibraryTitle: "Mis guiones guardados",
      scriptSelectLabel: "Guion guardado",
      scriptSelectPlaceholder: "— Elige un guion —",
      scriptNameLabel: "Nombre del guion",
      scriptNamePlaceholder: "Ej: Video de la semana 12",
      scriptSave: "Guardar guion actual",
      scriptDelete: "Eliminar",
      scriptNeedName: "Escribe un nombre para guardar el guion.",
      scriptSaved: (name) => `Guion "${name}" guardado.`,
      scriptLoaded: (name) => `Guion "${name}" cargado.`,
      scriptDeleted: (name) => `Guion "${name}" eliminado.`,
      ttsDictTitle: "Diccionario de pronunciación (TTS)",
      ttsDictFromLabel: "Palabra o frase",
      ttsDictToLabel: "Cómo debe sonar",
      ttsDictFromPlaceholder: "Amén",
      ttsDictToPlaceholder: "Amen",
      ttsDictAdd: "Agregar",
      ttsDictEmpty: "Aún no tienes reemplazos guardados.",
      ttsDictRemove: "Eliminar"
    },
    en: {
      title: "Guionter",
      subtitle: "Real-time text analyzer",
      copy: "Copy",
      clear: "Clear",
      editorHint: "Type or paste your text below. Spelling is checked automatically as you type.",
      placeholder: "Start typing or paste your text here…",
      statsTitle: "Statistics",
      words: "Words",
      chars: "Characters (with spaces)",
      charsNoSpace: "Characters (no spaces)",
      sentences: "Sentences",
      paragraphs: "Paragraphs",
      readTime: "Reading time",
      speakTime: "Speaking time",
      readLevelTitle: "Reading level",
      kwTitle: "Keyword density",
      excludeCommon: "Exclude common words (the, a, of, y, el…)",
      grammarTitle: "Spelling & grammar checker",
      grammarHint: "The red underline in the text box already corrects spelling automatically (uses your browser/system checker). For a deeper check (grammar, style) use the button below — needs an internet connection.",
      grammarBtn: "Check spelling & grammar",
      grammarChecking: "Checking…",
      grammarNone: "No issues found. Nice work!",
      grammarEmpty: "Write some text first.",
      grammarError: "Could not reach the checking service (check your internet connection). Word counting and the rest of the stats keep working offline.",
      grammarFound: (n) => `${n} suggestion(s) found.`,
      suggestion: "Suggestion",
      downloadWord: "Word",
      downloadPdf: "PDF",
      downloadWordTitle: "Download the text as a Word document (.doc)",
      downloadPdfTitle: "Download the text as a PDF",
      downloadSrt: "SRT",
      downloadSrtTitle: "Download the script as subtitles (.srt) with estimated per-paragraph timing",
      downloadSrtError: "Could not generate the .srt file.",
      exportConfig: "Backup",
      exportConfigTitle: "Export your TTS dictionary and saved scripts into a file",
      exportConfigError: "Could not generate the backup file.",
      importConfig: "Restore",
      importConfigTitle: "Import a backup file (merges with what you already have, deletes nothing existing)",
      importConfigError: "Could not read that backup file — check that it's a valid Guionter backup.",
      importConfigDone: (dict, scriptsN) => `Restored: ${dict} dictionary word(s), ${scriptsN} script(s).`,
      downloadEmpty: "Write some text before downloading.",
      pdfStatsHeading: "Summary",
      footer: 'Guionter works offline for text counting. Install it from your browser menu to use it as a desktop app or on Android ("Add to home screen" / "Install app").',
      tab1: "1 word",
      tab2: "2 words",
      tab3: "3 words",
      kwWord: "Keyword",
      kwCount: "Count",
      kwDensity: "Density",
      kwEmpty: "Type some text to see keyword density.",
      levels: {
        veryEasy: "Very easy", easy: "Easy", fairlyEasy: "Fairly easy",
        standard: "Standard", fairlyDifficult: "Fairly difficult",
        difficult: "Difficult", veryConfusing: "Very confusing",
        na: "Write text to calculate"
      },
      gradeLabel: (g) => `Approx. grade level: ${g}`,
      copied: "Copied!",
      adaptNumbersBtn: "Adapt text for TTS",
      adaptNumbersNone: "Nothing to adapt was found (no numeric citations or dictionary words).",
      adaptNumbersDone: (n) => `${n} change${n === 1 ? "" : "s"} applied to the text — check it before generating audio.`,
      scriptLibraryTitle: "My saved scripts",
      scriptSelectLabel: "Saved script",
      scriptSelectPlaceholder: "— Choose a script —",
      scriptNameLabel: "Script name",
      scriptNamePlaceholder: "E.g.: This week's video",
      scriptSave: "Save current script",
      scriptDelete: "Delete",
      scriptNeedName: "Type a name to save the script.",
      scriptSaved: (name) => `Script "${name}" saved.`,
      scriptLoaded: (name) => `Script "${name}" loaded.`,
      scriptDeleted: (name) => `Script "${name}" deleted.`,
      ttsDictTitle: "Pronunciation dictionary (TTS)",
      ttsDictFromLabel: "Word or phrase",
      ttsDictToLabel: "How it should sound",
      ttsDictFromPlaceholder: "Amen",
      ttsDictToPlaceholder: "Aymen",
      ttsDictAdd: "Add",
      ttsDictEmpty: "You don't have any saved replacements yet.",
      ttsDictRemove: "Remove"
    }
  };

  let lang = "es";
  let kwTab = 1;

  const STOPWORDS = {
    es: new Set("el la los las un una unos unas de del al a y o u en que qué es son fue ser estar era con por para su sus se lo le les mi mis tu tus nos os como más pero si no ya muy este esta estos estas ese esa esos esas cual cuales quien quienes donde cuando porque".split(" ")),
    en: new Set("the a an of and or to in on at for is are was were be been being with by from as that this these those it its he she they we you i your his her their our not but if so than then there here what which who whom".split(" "))
  };

  // ---------------------------------------------------------------------
  // DOM refs
  // ---------------------------------------------------------------------
  const $ = (id) => document.getElementById(id);
  const input = $("input");

  function applyTranslations() {
    const t = STR[lang];
    document.documentElement.lang = lang;
    $("t-title").textContent = t.title;
    $("t-subtitle").textContent = t.subtitle;
    $("t-copy").textContent = t.copy;
    $("t-clear").textContent = t.clear;
    $("t-editorHint").textContent = t.editorHint;
    input.placeholder = t.placeholder;
    input.lang = lang === "es" ? "es" : "en";
    $("t-statsTitle").textContent = t.statsTitle;
    $("t-words").textContent = t.words;
    $("t-chars").textContent = t.chars;
    $("t-charsNoSpace").textContent = t.charsNoSpace;
    $("t-sentences").textContent = t.sentences;
    $("t-paragraphs").textContent = t.paragraphs;
    $("t-readTime").textContent = t.readTime;
    $("t-speakTime").textContent = t.speakTime;
    $("t-readLevelTitle").textContent = t.readLevelTitle;
    $("t-kwTitle").textContent = t.kwTitle;
    $("t-excludeCommon").textContent = t.excludeCommon;
    $("t-grammarTitle").textContent = t.grammarTitle;
    $("t-grammarHint").textContent = t.grammarHint;
    $("t-grammarBtn").textContent = t.grammarBtn;
    $("t-footer").textContent = t.footer;
    $("tab1").textContent = t.tab1;
    $("tab2").textContent = t.tab2;
    $("tab3").textContent = t.tab3;
    $("t-downloadWord").textContent = t.downloadWord;
    $("t-downloadPdf").textContent = t.downloadPdf;
    $("btnWord").title = t.downloadWordTitle;
    $("btnPdf").title = t.downloadPdfTitle;
    $("t-downloadSrt").textContent = t.downloadSrt;
    $("btnSrt").title = t.downloadSrtTitle;
    $("t-exportConfig").textContent = t.exportConfig;
    $("btnExportConfig").title = t.exportConfigTitle;
    $("t-importConfig").textContent = t.importConfig;
    $("btnImportConfig").title = t.importConfigTitle;
    $("t-adaptNumbersBtn").textContent = t.adaptNumbersBtn;
    $("t-scriptLibraryTitle").textContent = t.scriptLibraryTitle;
    $("t-scriptSelectLabel").textContent = t.scriptSelectLabel;
    $("t-scriptNameLabel").textContent = t.scriptNameLabel;
    $("t-scriptSave").textContent = t.scriptSave;
    $("t-scriptDelete").textContent = t.scriptDelete;
    $("scriptName").placeholder = t.scriptNamePlaceholder;
    renderScriptSelect();
    $("t-ttsDictTitle").textContent = t.ttsDictTitle;
    $("t-ttsDictFromLabel").textContent = t.ttsDictFromLabel;
    $("t-ttsDictToLabel").textContent = t.ttsDictToLabel;
    $("t-ttsDictAdd").textContent = t.ttsDictAdd;
    $("t-ttsDictEmpty").textContent = t.ttsDictEmpty;
    $("ttsDictFrom").placeholder = t.ttsDictFromPlaceholder;
    $("ttsDictTo").placeholder = t.ttsDictToPlaceholder;
    renderTtsDictionary();
    document.title = t.title + " — " + (lang === "es" ? "Contador de Palabras y Caracteres" : "Word & Character Counter");
    recompute();
  }

  // ---------------------------------------------------------------------
  // Text metrics
  // ---------------------------------------------------------------------
  function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-záéíóúüñ]/gi, "");
    if (!word) return 0;
    const groups = word.match(/[aeiouyáéíóúü]+/g);
    let count = groups ? groups.length : 1;
    if (word.endsWith("e") && count > 1 && !word.endsWith("le")) count -= 1;
    return Math.max(count, 1);
  }

  function analyze(text) {
    const trimmed = text.trim();
    const words = trimmed.length ? trimmed.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;
    const charCount = text.length;
    const charNoSpace = text.replace(/\s/g, "").length;

    const sentenceMatches = trimmed.match(/[^.!?…]+[.!?…]+|\S+$/g);
    const sentenceCount = trimmed.length ? (sentenceMatches ? sentenceMatches.filter(s => s.trim().length).length : (wordCount ? 1 : 0)) : 0;

    const paragraphCount = trimmed.length
      ? trimmed.split(/\n+/).map(p => p.trim()).filter(Boolean).length
      : 0;

    let syllables = 0;
    words.forEach(w => { syllables += countSyllables(w); });

    let fleschEase = null, fkGrade = null;
    if (wordCount > 0 && sentenceCount > 0) {
      const wps = wordCount / sentenceCount;
      const spw = syllables / wordCount;
      fleschEase = 206.835 - 1.015 * wps - 84.6 * spw;
      fkGrade = 0.39 * wps + 11.8 * spw - 15.59;
    }

    const READ_WPM = 238;
    const SPEAK_WPM = 130;
    const readSeconds = Math.round((wordCount / READ_WPM) * 60);
    const speakSeconds = Math.round((wordCount / SPEAK_WPM) * 60);

    return {
      wordCount, charCount, charNoSpace, sentenceCount, paragraphCount,
      fleschEase, fkGrade, readSeconds, speakSeconds, words
    };
  }

  function fmtTime(totalSeconds) {
    if (!totalSeconds || totalSeconds < 1) return lang === "es" ? "< 1 s" : "< 1 sec";
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m === 0) return `${s} s`;
    return `${m} min ${s.toString().padStart(2, "0")} s`;
  }

  function readingLevelLabel(ease) {
    const L = STR[lang].levels;
    if (ease === null) return L.na;
    if (ease >= 90) return L.veryEasy;
    if (ease >= 80) return L.easy;
    if (ease >= 70) return L.fairlyEasy;
    if (ease >= 60) return L.standard;
    if (ease >= 50) return L.fairlyDifficult;
    if (ease >= 30) return L.difficult;
    return L.veryConfusing;
  }

  // ---------------------------------------------------------------------
  // Keyword density
  // ---------------------------------------------------------------------
  function tokenize(text) {
    return (text.toLowerCase().match(/[a-záéíóúüñ0-9']+/gi) || []);
  }

  function computeKeywordDensity(text, n, excludeCommon) {
    const tokens = tokenize(text);
    const stop = STOPWORDS[lang];
    const grams = new Map();
    let total = 0;
    for (let i = 0; i + n <= tokens.length; i++) {
      const slice = tokens.slice(i, i + n);
      if (excludeCommon && slice.some(w => stop.has(w))) continue;
      const key = slice.join(" ");
      total++;
      grams.set(key, (grams.get(key) || 0) + 1);
    }
    const rows = [...grams.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([word, count]) => ({ word, count, density: total ? (count / total) * 100 : 0 }));
    return rows;
  }

  function renderKeywordTable() {
    const t = STR[lang];
    const excludeCommon = $("excludeCommon").checked;
    const rows = computeKeywordDensity(input.value, kwTab, excludeCommon);
    const wrap = $("kwTableWrap");
    if (!rows.length) {
      wrap.innerHTML = `<div class="empty-hint">${t.kwEmpty}</div>`;
      return;
    }
    const maxCount = rows[0].count;
    let html = `<table class="kw"><thead><tr>
      <th>${t.kwWord}</th><th>${t.kwCount}</th><th>${t.kwDensity}</th>
    </tr></thead><tbody>`;
    rows.forEach(r => {
      const pct = Math.max(4, Math.round((r.count / maxCount) * 100));
      html += `<tr>
        <td class="kw-word">${escapeHtml(r.word)}</td>
        <td>${r.count}</td>
        <td><span class="kw-bar-wrap"><span class="kw-bar" style="width:${pct}%"></span></span>${r.density.toFixed(1)}%</td>
      </tr>`;
    });
    html += "</tbody></table>";
    wrap.innerHTML = html;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // ---------------------------------------------------------------------
  // Main recompute
  // ---------------------------------------------------------------------
  function recompute() {
    const t = STR[lang];
    const r = analyze(input.value);
    $("statWords").textContent = r.wordCount.toLocaleString(lang);
    $("statChars").textContent = r.charCount.toLocaleString(lang);
    $("statCharsNoSpace").textContent = r.charNoSpace.toLocaleString(lang);
    $("statSentences").textContent = r.sentenceCount.toLocaleString(lang);
    $("statParagraphs").textContent = r.paragraphCount.toLocaleString(lang);
    $("statReadTime").textContent = fmtTime(r.readSeconds);
    $("statSpeakTime").textContent = fmtTime(r.speakSeconds);

    $("readLevelBadge").textContent = readingLevelLabel(r.fleschEase);
    $("readLevelDetail").textContent = r.fkGrade !== null
      ? t.gradeLabel(Math.max(0, Math.round(r.fkGrade)))
      : "";

    renderKeywordTable();
  }

  // ---------------------------------------------------------------------
  // Grammar / spell check (LanguageTool public API)
  // ---------------------------------------------------------------------
  async function runGrammarCheck() {
    const t = STR[lang];
    const text = input.value.trim();
    const status = $("grammarStatus");
    const list = $("grammarList");
    list.innerHTML = "";
    if (!text) {
      status.textContent = t.grammarEmpty;
      return;
    }
    status.textContent = t.grammarChecking;
    $("btnGrammar").disabled = true;
    try {
      const langCode = lang === "es" ? "es" : "en-US";
      const body = new URLSearchParams({ text, language: langCode });
      const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
      });
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      const matches = data.matches || [];
      if (!matches.length) {
        status.textContent = t.grammarNone;
        return;
      }
      status.textContent = t.grammarFound(matches.length);
      matches.slice(0, 40).forEach(m => {
        const before = escapeHtml(text.slice(Math.max(0, m.offset - 25), m.offset));
        const bad = escapeHtml(text.slice(m.offset, m.offset + m.length));
        const after = escapeHtml(text.slice(m.offset + m.length, m.offset + m.length + 25));
        const suggestions = (m.replacements || []).slice(0, 5).map(r => r.value).join(", ");
        const div = document.createElement("div");
        div.className = "grammar-item";
        div.innerHTML = `
          <div class="msg">${escapeHtml(m.message)}</div>
          <div class="ctx">…${before}<mark>${bad}</mark>${after}…</div>
          ${suggestions ? `<div class="suggestions">${t.suggestion}: <b>${escapeHtml(suggestions)}</b></div>` : ""}
        `;
        list.appendChild(div);
      });
    } catch (e) {
      status.textContent = t.grammarError;
    } finally {
      $("btnGrammar").disabled = false;
    }
  }

  // ---------------------------------------------------------------------
  // Export: Word (.doc) and PDF
  // ---------------------------------------------------------------------
  function buildSummaryLines(r) {
    const t = STR[lang];
    return [
      `${t.words}: ${r.wordCount}`,
      `${t.chars}: ${r.charCount}`,
      `${t.charsNoSpace}: ${r.charNoSpace}`,
      `${t.sentences}: ${r.sentenceCount}`,
      `${t.paragraphs}: ${r.paragraphCount}`,
      `${t.readTime}: ${fmtTime(r.readSeconds)}`,
      `${t.speakTime}: ${fmtTime(r.speakSeconds)}`
    ];
  }

  function flashDownloadStatus(msg) {
    let toast = document.getElementById("downloadToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "downloadToast";
      toast.style.cssText = "position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:var(--text);color:var(--surface);padding:9px 18px;border-radius:999px;font-size:13px;font-weight:600;z-index:999;box-shadow:var(--shadow);transition:opacity .3s ease;";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = "1";
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = "0"; }, 2400);
  }

  function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  // Saves a generated file for the user. Inside the Claude Artifact viewer,
  // window.claude exposes a "downloads" capability that must be used instead
  // of a plain <a download> link (which the viewer sandbox ignores). Outside
  // that viewer (the standalone web/PWA, Electron, or Capacitor app) window.claude
  // does not exist, so we fall back to a normal browser download.
  async function saveGeneratedFile(filename, blob, failureMsg) {
    if (window.claude && typeof window.claude.use === "function") {
      let downloads = null;
      try {
        downloads = await window.claude.use("downloads");
      } catch (e) {
        downloads = null;
      }
      if (downloads) {
        try {
          await downloads.save({ filename, data: blob });
        } catch (e) {
          if (!e || e.code !== "declined") flashDownloadStatus(failureMsg);
        }
        return;
      }
    }
    triggerBlobDownload(blob, filename);
  }

  // ---- Minimal ZIP writer (stored/no compression) for building a real .docx ----
  const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function buildZip(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    files.forEach((f) => {
      const nameBytes = encoder.encode(f.name);
      const data = f.data;
      const crc = crc32(data);
      const size = data.length;

      const local = new Uint8Array(30 + nameBytes.length);
      const dv = new DataView(local.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 0, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, 0, true);
      dv.setUint16(12, 0, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, size, true);
      dv.setUint32(22, size, true);
      dv.setUint16(26, nameBytes.length, true);
      dv.setUint16(28, 0, true);
      local.set(nameBytes, 30);
      localParts.push(local, data);

      const central = new Uint8Array(46 + nameBytes.length);
      const cdv = new DataView(central.buffer);
      cdv.setUint32(0, 0x02014b50, true);
      cdv.setUint16(4, 20, true);
      cdv.setUint16(6, 20, true);
      cdv.setUint16(8, 0, true);
      cdv.setUint16(10, 0, true);
      cdv.setUint16(12, 0, true);
      cdv.setUint16(14, 0, true);
      cdv.setUint32(16, crc, true);
      cdv.setUint32(20, size, true);
      cdv.setUint32(24, size, true);
      cdv.setUint16(28, nameBytes.length, true);
      cdv.setUint16(30, 0, true);
      cdv.setUint16(32, 0, true);
      cdv.setUint16(34, 0, true);
      cdv.setUint16(36, 0, true);
      cdv.setUint32(38, 0, true);
      cdv.setUint32(42, offset, true);
      central.set(nameBytes, 46);
      centralParts.push(central);

      offset += local.length + data.length;
    });

    const centralSize = centralParts.reduce((a, p) => a + p.length, 0);
    const centralOffset = offset;

    const end = new Uint8Array(22);
    const edv = new DataView(end.buffer);
    edv.setUint32(0, 0x06054b50, true);
    edv.setUint16(4, 0, true);
    edv.setUint16(6, 0, true);
    edv.setUint16(8, files.length, true);
    edv.setUint16(10, files.length, true);
    edv.setUint32(12, centralSize, true);
    edv.setUint32(16, centralOffset, true);
    edv.setUint16(20, 0, true);

    return new Blob([...localParts, ...centralParts, end], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
  }

  // ---- Minimal .docx (Word) document builder ----
  function xmlEscape(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
  }

  function docxParagraph(text, opts) {
    opts = opts || {};
    const runProps = [];
    if (opts.bold) runProps.push("<w:b/>");
    if (opts.size) runProps.push(`<w:sz w:val="${opts.size}"/><w:szCs w:val="${opts.size}"/>`);
    const rPr = runProps.length ? `<w:rPr>${runProps.join("")}</w:rPr>` : "";
    return `<w:p><w:r>${rPr}<w:t xml:space="preserve">${xmlEscape(text || "")}</w:t></w:r></w:p>`;
  }

  function buildDocxBlob(title, summaryLines, paragraphs) {
    let body = "";
    body += docxParagraph(title, { bold: true, size: 36 });
    body += docxParagraph("", {});
    summaryLines.forEach((line) => { body += docxParagraph(line, { size: 20 }); });
    body += docxParagraph("", {});
    paragraphs.forEach((p) => { body += docxParagraph(p, { size: 22 }); });
    body += '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>';

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}</w:body></w:document>`;

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;

    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;

    const enc = new TextEncoder();
    return buildZip([
      { name: "[Content_Types].xml", data: enc.encode(contentTypesXml) },
      { name: "_rels/.rels", data: enc.encode(relsXml) },
      { name: "word/document.xml", data: enc.encode(documentXml) }
    ]);
  }

  async function downloadWord() {
    const t = STR[lang];
    const text = input.value;
    if (!text.trim()) { flashDownloadStatus(t.downloadEmpty); return; }
    const r = analyze(text);
    const blob = buildDocxBlob(t.title, buildSummaryLines(r), text.split(/\n+/));
    await saveGeneratedFile(
      "guionter-texto.docx",
      blob,
      lang === "es" ? "No se pudo guardar el documento de Word." : "Could not save the Word document."
    );
  }

  async function downloadPdf() {
    const t = STR[lang];
    const text = input.value;
    if (!text.trim()) { flashDownloadStatus(t.downloadEmpty); return; }
    if (!window.jspdf || !window.jspdf.jsPDF) {
      flashDownloadStatus(lang === "es" ? "No se pudo generar el PDF en este momento." : "Could not generate the PDF right now.");
      return;
    }
    const r = analyze(text);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 48;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - marginX * 2;
    let y = 56;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(t.title, marginX, y);
    y += 26;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(t.pdfStatsHeading, marginX, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    buildSummaryLines(r).forEach((line) => {
      doc.text(line, marginX, y);
      y += 14;
    });
    y += 10;
    doc.setDrawColor(200);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const paragraphs = text.split(/\n+/);
    paragraphs.forEach((para) => {
      const lines = doc.splitTextToSize(para.trim() ? para : " ", maxWidth);
      lines.forEach((line) => {
        if (y > pageHeight - 56) {
          doc.addPage();
          y = 56;
        }
        doc.text(line, marginX, y);
        y += 15;
      });
      y += 8;
    });

    const blob = doc.output("blob");
    await saveGeneratedFile(
      "guionter-texto.pdf",
      blob,
      lang === "es" ? "No se pudo guardar el PDF." : "Could not save the PDF."
    );
  }

  // ---------------------------------------------------------------------
  // SRT subtitle export — one cue per paragraph, timed with the same
  // words-per-minute assumption used for the "speaking time" stat, so the
  // estimate stays consistent with what the app already shows on screen.
  // ---------------------------------------------------------------------
  function srtTimestamp(totalSeconds) {
    const clamped = Math.max(0, totalSeconds);
    const wholeSeconds = Math.floor(clamped);
    const ms = Math.round((clamped - wholeSeconds) * 1000);
    const h = Math.floor(wholeSeconds / 3600);
    const m = Math.floor(wholeSeconds / 60) % 60;
    const s = wholeSeconds % 60;
    const pad = (n, len) => String(n).padStart(len, "0");
    return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)},${pad(ms, 3)}`;
  }

  function buildSrtFromText(text) {
    const SPEAK_WPM = 130; // matches the constant used in analyze() for statSpeakTime
    const paragraphs = text.trim().split(/\n+/).map(p => p.trim()).filter(Boolean);
    let cursor = 0;
    const blocks = [];
    paragraphs.forEach((para, i) => {
      const words = para.split(/\s+/).filter(Boolean).length;
      const duration = Math.max(1, (words / SPEAK_WPM) * 60);
      const start = cursor;
      const end = cursor + duration;
      blocks.push(`${i + 1}\n${srtTimestamp(start)} --> ${srtTimestamp(end)}\n${para}\n`);
      cursor = end;
    });
    return blocks.join("\n");
  }

  async function downloadSrt() {
    const t = STR[lang];
    const text = input.value;
    if (!text.trim()) { flashDownloadStatus(t.downloadEmpty); return; }
    const srt = buildSrtFromText(text);
    const blob = new Blob([srt], { type: "text/plain;charset=utf-8" });
    await saveGeneratedFile("guionter-subtitulos.srt", blob, t.downloadSrtError);
  }

  // ---------------------------------------------------------------------
  // Export/import configuration backup: bundles the TTS dictionary and
  // saved scripts into one JSON file, so the user can back them up or carry
  // them to another machine/browser. Import merges by name instead of
  // replacing, so it never silently deletes anything. (Other Guionter builds
  // may include extra fields in their own backups — those are simply
  // ignored here, and a backup made in this build imports cleanly there too.)
  // ---------------------------------------------------------------------
  async function exportConfigBackup() {
    const t = STR[lang];
    const payload = {
      guionterBackupVersion: 1,
      exportedAt: Date.now(),
      ttsDictionary: ttsDictionary,
      scripts: scripts
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    await saveGeneratedFile("guionter-backup.json", blob, t.exportConfigError);
  }

  async function importConfigBackup(file) {
    const t = STR[lang];
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      let dictCount = 0, scriptCount = 0;

      if (Array.isArray(data.ttsDictionary)) {
        data.ttsDictionary.forEach(entry => {
          if (!entry || !entry.from) return;
          const idx = ttsDictionary.findIndex(e => e.from.toLowerCase() === entry.from.toLowerCase());
          if (idx >= 0) ttsDictionary[idx] = entry; else ttsDictionary.push(entry);
          dictCount++;
        });
        saveTtsDictionary();
        renderTtsDictionary();
      }

      if (Array.isArray(data.scripts)) {
        data.scripts.forEach(entry => {
          if (!entry || !entry.name || typeof entry.text !== "string") return;
          const idx = scripts.findIndex(s => s.name.toLowerCase() === entry.name.toLowerCase());
          if (idx >= 0) scripts[idx] = entry; else scripts.push(entry);
          scriptCount++;
        });
        saveScriptsToStorage();
        renderScriptSelect();
      }

      flashDownloadStatus(t.importConfigDone(dictCount, scriptCount));
    } catch (e) {
      flashDownloadStatus(t.importConfigError);
    }
  }

  // ---------------------------------------------------------------------
  // TTS text adaptation: numeric citations (e.g. "3:16", a chapter:verse
  // reference) read out loud as if they were clock times ("three sixteen")
  // by some TTS voices. Spelling both numbers out as words and dropping the
  // colon avoids that misreading entirely.
  // ---------------------------------------------------------------------
  const NUM_ES_0_29 = [
    "cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
    "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
    "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"
  ];
  const NUM_ES_TENS = { 3: "treinta", 4: "cuarenta", 5: "cincuenta", 6: "sesenta", 7: "setenta", 8: "ochenta", 9: "noventa" };
  const NUM_ES_HUNDREDS = { 1: "ciento", 2: "doscientos", 3: "trescientos", 4: "cuatrocientos", 5: "quinientos", 6: "seiscientos", 7: "setecientos", 8: "ochocientos", 9: "novecientos" };

  function twoDigitsToWordsEs(n) {
    if (n < 30) return NUM_ES_0_29[n];
    const tens = Math.floor(n / 10);
    const units = n % 10;
    const tensWord = NUM_ES_TENS[tens];
    return units === 0 ? tensWord : `${tensWord} y ${NUM_ES_0_29[units]}`;
  }

  function threeDigitsToWordsEs(n) {
    if (n === 100) return "cien";
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    if (hundreds === 0) return twoDigitsToWordsEs(rest);
    const hWord = NUM_ES_HUNDREDS[hundreds];
    return rest === 0 ? hWord : `${hWord} ${twoDigitsToWordsEs(rest)}`;
  }

  function numberToWordsEs(n) {
    n = Math.trunc(Math.abs(n));
    if (n === 0) return "cero";
    if (n < 1000) return threeDigitsToWordsEs(n);
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    const thousandsWord = thousands === 1 ? "mil" : `${threeDigitsToWordsEs(thousands)} mil`;
    return rest === 0 ? thousandsWord : `${thousandsWord} ${threeDigitsToWordsEs(rest)}`;
  }

  const NUM_EN_0_19 = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"
  ];
  const NUM_EN_TENS = { 2: "twenty", 3: "thirty", 4: "forty", 5: "fifty", 6: "sixty", 7: "seventy", 8: "eighty", 9: "ninety" };

  function twoDigitsToWordsEn(n) {
    if (n < 20) return NUM_EN_0_19[n];
    const tens = Math.floor(n / 10);
    const units = n % 10;
    const tensWord = NUM_EN_TENS[tens];
    return units === 0 ? tensWord : `${tensWord}-${NUM_EN_0_19[units]}`;
  }

  function threeDigitsToWordsEn(n) {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    if (hundreds === 0) return twoDigitsToWordsEn(rest);
    const hWord = `${NUM_EN_0_19[hundreds]} hundred`;
    return rest === 0 ? hWord : `${hWord} ${twoDigitsToWordsEn(rest)}`;
  }

  function numberToWordsEn(n) {
    n = Math.trunc(Math.abs(n));
    if (n === 0) return "zero";
    if (n < 1000) return threeDigitsToWordsEn(n);
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    const thousandsWord = `${threeDigitsToWordsEn(thousands)} thousand`;
    return rest === 0 ? thousandsWord : `${thousandsWord} ${threeDigitsToWordsEn(rest)}`;
  }

  // Finds "N:N" (and "N:N:N") patterns anywhere in the text — e.g. Bible-verse
  // citations like "Juan 3:16", scores, or any other colon-separated numeric
  // reference — and rewrites them as spelled-out words with no colon, so the
  // TTS engine reads "tres dieciséis" instead of hearing "3:16" and reading
  // it back as a time of day ("las tres y dieciséis"). Spells using whichever
  // language Guionter's UI is currently set to, since that's the best signal
  // we have for which language the TTS voice will actually be speaking.
  function adaptNumericCitationsForTts(text) {
    const numberToWords = lang === "en" ? numberToWordsEn : numberToWordsEs;
    return text.replace(/\b(\d{1,3}):(\d{1,3})(?::(\d{1,3}))?\b/g, (match, a, b, c) => {
      const parts = [numberToWords(Number(a)), numberToWords(Number(b))];
      if (c !== undefined) parts.push(numberToWords(Number(c)));
      return parts.join(" ");
    });
  }

  // ---------------------------------------------------------------------
  // Saved scripts library: named text documents (not just the single
  // autosaved draft), so the user can keep several scripts/projects around
  // and switch between them without losing anything. Saved per-browser in
  // localStorage.
  // ---------------------------------------------------------------------
  const SCRIPTS_KEY = "guionter-scripts";

  function loadScripts() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SCRIPTS_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter(s => s && s.name && typeof s.text === "string") : [];
    } catch (e) {
      return [];
    }
  }
  function saveScriptsToStorage() {
    try { localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts)); } catch (e) {}
  }
  let scripts = loadScripts();

  function renderScriptSelect() {
    const t = STR[lang];
    const sel = $("scriptSelect");
    const current = sel.value;
    sel.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = t.scriptSelectPlaceholder;
    sel.appendChild(placeholder);
    scripts.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.name;
      opt.textContent = s.name;
      sel.appendChild(opt);
    });
    sel.value = scripts.some(s => s.name === current) ? current : "";
  }

  // Saving overwrites an existing script with the same name (case-insensitive)
  // rather than clearing the name field afterwards — scripts get edited
  // continuously, so keeping the name filled in makes the next save (an
  // update to the same script) a single click instead of retyping the name.
  function saveScript() {
    const t = STR[lang];
    const nameEl = $("scriptName");
    const name = nameEl.value.trim();
    const status = $("scriptStatus");
    status.classList.remove("ok", "err");
    if (!name) { status.textContent = t.scriptNeedName; status.classList.add("err"); return; }
    const existingIdx = scripts.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
    const entry = { name, text: input.value, updatedAt: Date.now() };
    if (existingIdx >= 0) scripts[existingIdx] = entry;
    else scripts.push(entry);
    saveScriptsToStorage();
    renderScriptSelect();
    $("scriptSelect").value = name;
    $("btnScriptDelete").disabled = false;
    status.textContent = t.scriptSaved(name);
    status.classList.add("ok");
  }

  function loadScriptByName(name) {
    const t = STR[lang];
    const status = $("scriptStatus");
    status.classList.remove("ok", "err");
    $("btnScriptDelete").disabled = !name;
    if (!name) { status.textContent = ""; return; }
    const scriptEntry = scripts.find(s => s.name === name);
    if (!scriptEntry) return;
    input.value = scriptEntry.text;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    $("scriptName").value = name;
    status.textContent = t.scriptLoaded(name);
    status.classList.add("ok");
  }

  function deleteSelectedScript() {
    const t = STR[lang];
    const sel = $("scriptSelect");
    const name = sel.value;
    if (!name) return;
    scripts = scripts.filter(s => s.name !== name);
    saveScriptsToStorage();
    renderScriptSelect();
    $("scriptName").value = "";
    $("btnScriptDelete").disabled = true;
    $("scriptStatus").textContent = t.scriptDeleted(name);
    $("scriptStatus").classList.remove("err");
    $("scriptStatus").classList.add("ok");
  }

  // ---------------------------------------------------------------------
  // Personal TTS pronunciation dictionary: user-defined "say X as Y" pairs
  // (e.g. "Amén" -> "Amen") for words the TTS voice mispronounces, which
  // varies per voice/model in ways we can't predict — the user has to hear
  // it and correct it themselves. Saved per-browser in localStorage.
  // ---------------------------------------------------------------------
  const TTS_DICT_KEY = "guionter-tts-dictionary";

  function loadTtsDictionary() {
    try {
      const parsed = JSON.parse(localStorage.getItem(TTS_DICT_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter(e => e && e.from && e.to) : [];
    } catch (e) {
      return [];
    }
  }
  function saveTtsDictionary() {
    try { localStorage.setItem(TTS_DICT_KEY, JSON.stringify(ttsDictionary)); } catch (e) {}
  }
  let ttsDictionary = loadTtsDictionary();

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  // Whole-word, case-insensitive match using Unicode letter/number classes
  // instead of the classic \b — plain \b treats accented letters (á, é, ñ…)
  // as "non-word" characters, which breaks matching for ordinary Spanish
  // words ending or starting in one (e.g. "café", "así").
  function wholeWordRegex(word) {
    return new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRegExp(word)}(?![\\p{L}\\p{N}_])`, "giu");
  }

  function renderTtsDictionary() {
    const t = STR[lang];
    const list = $("ttsDictList");
    list.innerHTML = "";
    $("t-ttsDictEmpty").style.display = ttsDictionary.length === 0 ? "" : "none";
    ttsDictionary.forEach((entry, idx) => {
      const row = document.createElement("div");
      row.className = "tts-dict-item";
      const span = document.createElement("span");
      span.className = "tts-dict-pair";
      span.textContent = `${entry.from} → ${entry.to}`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tts-dict-remove";
      btn.setAttribute("aria-label", t.ttsDictRemove);
      btn.textContent = "✕";
      btn.addEventListener("click", () => {
        ttsDictionary.splice(idx, 1);
        saveTtsDictionary();
        renderTtsDictionary();
      });
      row.appendChild(span);
      row.appendChild(btn);
      list.appendChild(row);
    });
  }

  function addTtsDictionaryEntry() {
    const fromEl = $("ttsDictFrom");
    const toEl = $("ttsDictTo");
    const from = fromEl.value.trim();
    const to = toEl.value.trim();
    if (!from || !to) return;
    const existingIdx = ttsDictionary.findIndex(e => e.from.toLowerCase() === from.toLowerCase());
    if (existingIdx >= 0) ttsDictionary[existingIdx] = { from, to };
    else ttsDictionary.push({ from, to });
    saveTtsDictionary();
    renderTtsDictionary();
    fromEl.value = "";
    toEl.value = "";
    fromEl.focus();
  }

  // Applies every saved dictionary entry to `text` and returns
  // { text, count } — count is the total number of replacements made,
  // across all entries, so the caller can report one combined tally.
  function applyTtsDictionary(text) {
    let result = text;
    let count = 0;
    ttsDictionary.forEach(({ from, to }) => {
      const re = wholeWordRegex(from);
      const matches = result.match(re);
      if (matches) count += matches.length;
      result = result.replace(re, to);
    });
    return { text: result, count };
  }

  // Rewrites the editor's own text in place — a deliberate, undoable (Ctrl+Z)
  // edit the user triggers manually, not an automatic/hidden transform.
  // Applies both the numeric-citation fix and the personal pronunciation
  // dictionary in one pass, so the TTS reads exactly what ends up in the
  // box, with no separate adaptation step needed at generation time.
  function adaptEditorTextForTts() {
    const t = STR[lang];
    const status = $("adaptNumbersStatus");
    const before = input.value;

    const citationMatches = before.match(/\b\d{1,3}:\d{1,3}(?::\d{1,3})?\b/g) || [];
    const afterCitations = adaptNumericCitationsForTts(before);
    const { text: afterDict, count: dictCount } = applyTtsDictionary(afterCitations);

    const totalChanges = citationMatches.length + dictCount;
    if (totalChanges === 0) {
      status.textContent = t.adaptNumbersNone;
      return;
    }
    input.value = afterDict;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    status.textContent = t.adaptNumbersDone(totalChanges);
  }

  // ---------------------------------------------------------------------
  // Draft autosave (keeps the text even if the tab/app is closed)
  // ---------------------------------------------------------------------
  const DRAFT_KEY = "guionter-draft-text";
  let saveDraftTimer = null;

  function loadDraft() {
    try {
      return localStorage.getItem(DRAFT_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function saveDraft(text) {
    try {
      if (text) localStorage.setItem(DRAFT_KEY, text);
      else localStorage.removeItem(DRAFT_KEY);
    } catch (e) {
      /* storage unavailable (private mode, quota, etc.) — ignore silently */
    }
  }

  function scheduleDraftSave() {
    clearTimeout(saveDraftTimer);
    saveDraftTimer = setTimeout(() => saveDraft(input.value), 400);
  }

  // ---------------------------------------------------------------------
  // Wiring
  // ---------------------------------------------------------------------
  input.addEventListener("input", () => {
    recompute();
    scheduleDraftSave();
  });

  $("langSelect").addEventListener("change", (e) => {
    lang = e.target.value;
    applyTranslations();
  });

  $("btnClear").addEventListener("click", () => {
    input.value = "";
    recompute();
    saveDraft("");
    input.focus();
  });

  $("btnCopy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(input.value);
      const btn = $("btnCopy");
      const original = btn.querySelector("span").textContent;
      btn.querySelector("span").textContent = STR[lang].copied;
      setTimeout(() => { btn.querySelector("span").textContent = original; }, 1200);
    } catch (e) { /* clipboard unavailable, ignore */ }
  });

  $("btnTheme").addEventListener("click", () => {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme");
    if (current === "dark") root.setAttribute("data-theme", "light");
    else if (current === "light") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", "dark");
  });

  ["tab1", "tab2", "tab3"].forEach(id => {
    $(id).addEventListener("click", (e) => {
      document.querySelectorAll(".tab").forEach(el => el.classList.remove("active"));
      e.target.classList.add("active");
      kwTab = parseInt(e.target.dataset.n, 10);
      renderKeywordTable();
    });
  });

  $("excludeCommon").addEventListener("change", renderKeywordTable);
  $("btnGrammar").addEventListener("click", runGrammarCheck);
  $("btnWord").addEventListener("click", downloadWord);
  $("btnPdf").addEventListener("click", downloadPdf);
  $("btnSrt").addEventListener("click", downloadSrt);
  $("btnExportConfig").addEventListener("click", exportConfigBackup);
  $("btnImportConfig").addEventListener("click", () => $("importConfigFile").click());
  $("importConfigFile").addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    await importConfigBackup(file);
    e.target.value = "";
  });
  $("btnScriptSave").addEventListener("click", saveScript);
  $("btnScriptDelete").addEventListener("click", deleteSelectedScript);
  $("scriptSelect").addEventListener("change", () => loadScriptByName($("scriptSelect").value));
  $("scriptName").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); saveScript(); } });
  $("btnAdaptNumbers").addEventListener("click", adaptEditorTextForTts);
  $("btnTtsDictAdd").addEventListener("click", addTtsDictionaryEntry);
  ["ttsDictFrom", "ttsDictTo"].forEach(id => {
    $(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); addTtsDictionaryEntry(); }
    });
  });

  // PWA service worker (best effort; ignored if unsupported/blocked)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    });
  }

  input.value = loadDraft();
  applyTranslations();
})();
