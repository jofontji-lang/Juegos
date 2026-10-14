/**
 * Contador de visitas de juegos.matematicasjosepfont.es
 *
 * Hace dos cosas con una sola llamada:
 *   · devuelve el número de visita, para enseñarlo en el pie de la portada;
 *   · apunta la visita en una hoja, que es la analítica.
 *
 * NO guarda nada de quién visita: ni IP, ni cookie, ni identificador, ni
 * agente de usuario. Solo la fecha, qué página se abrió y de qué sitio venía
 * el enlace (el dominio, no la dirección entera). Por eso no hace falta
 * banner de consentimiento.
 *
 * ── Cómo se pone en marcha ───────────────────────────────────────────────
 *  1. Crea una hoja de cálculo nueva en Google Drive. Llámala como quieras.
 *  2. Extensiones → Apps Script. Borra lo que haya y pega este archivo.
 *  3. Guarda. Implementar → Nueva implementación → tipo «Aplicación web».
 *       Ejecutar como:    Yo
 *       Quién tiene acceso: Cualquier usuario
 *  4. Copia la URL que te da (termina en /exec) y pégala en el index.html
 *     de la portada, donde pone PEGA_AQUI_LA_URL.
 *  5. Cada vez que cambies este código hay que volver a implementar, o la
 *     web seguirá llamando a la versión vieja.
 *
 * ── Qué sale en la hoja ──────────────────────────────────────────────────
 *  «total»    A1 lleva la cuenta corrida. Es lo que se enseña en la web.
 *  «registro» una fila por visita: fecha, página y origen. Con eso puedes
 *             hacerte una tabla dinámica: visitas por día, por juego o por
 *             sitio desde el que llega la gente.
 */

const HOJA_TOTAL = 'total';
const HOJA_REGISTRO = 'registro';
const CADUCIDAD_REGISTRO_DIAS = 400;   // se van borrando las filas más viejas


function doGet(e) {
  const p = (e && e.parameter) || {};
  let cuerpo;
  try {
    cuerpo = JSON.stringify({ visitas: sumarUna_(p.pagina, p.origen) });
  } catch (err) {
    cuerpo = JSON.stringify({ error: String(err) });
  }
  // Se responde en JSONP porque la llamada va desde otro dominio y así no
  // depende de cómo Apps Script redirija ni de las cabeceras CORS.
  if (p.callback && /^[A-Za-z_$][A-Za-z0-9_$]{0,60}$/.test(p.callback)) {
    return ContentService
      .createTextOutput(p.callback + '(' + cuerpo + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(cuerpo)
    .setMimeType(ContentService.MimeType.JSON);
}


function sumarUna_(pagina, origen) {
  // El candado evita que dos visitas a la vez lean el mismo número y se pisen.
  const candado = LockService.getScriptLock();
  candado.waitLock(20000);
  try {
    const libro = SpreadsheetApp.getActiveSpreadsheet();

    const total = hoja_(libro, HOJA_TOTAL);
    const celda = total.getRange('A1');
    const n = Number(celda.getValue() || 0) + 1;
    celda.setValue(n);

    hoja_(libro, HOJA_REGISTRO).appendRow([
      new Date(),
      recortar_(pagina, 120) || '/',
      recortar_(origen, 80),
    ]);
    return n;
  } finally {
    candado.releaseLock();
  }
}


function hoja_(libro, nombre) {
  let h = libro.getSheetByName(nombre);
  if (h) return h;
  h = libro.insertSheet(nombre);
  if (nombre === HOJA_TOTAL) {
    h.getRange('A1').setValue(0);
    h.getRange('B1').setValue('visitas contadas desde que se puso en marcha');
  } else {
    h.appendRow(['fecha', 'página', 'origen']);
    h.setFrozenRows(1);
  }
  return h;
}


function recortar_(v, max) {
  return String(v == null ? '' : v).slice(0, max);
}


/**
 * Limpieza del registro. Conviene programarla una vez al mes:
 * Activadores → Añadir activador → limpiarRegistro, basado en tiempo, mensual.
 * El total no se toca nunca; solo se podan las filas viejas del detalle.
 */
function limpiarRegistro() {
  const h = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_REGISTRO);
  if (!h) return;
  const limite = new Date(Date.now() - CADUCIDAD_REGISTRO_DIAS * 864e5);
  const fechas = h.getRange(2, 1, Math.max(h.getLastRow() - 1, 0), 1).getValues();
  let viejas = 0;
  while (viejas < fechas.length && fechas[viejas][0] instanceof Date
         && fechas[viejas][0] < limite) {
    viejas++;
  }
  if (viejas > 0) h.deleteRows(2, viejas);
}
