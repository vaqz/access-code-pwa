/**
 * Access Code — lightweight, read-only Apps Script API.
 * Reads only columns B:C and F. Column A (Inbox) is never read.
 * Bind this script to the "Access Code" spreadsheet.
 */
const CONFIG = {
  SHEET_NAME: 'Access Code',
  HEADER_ROW: 1,
  MAX_ROWS: 5000
};

function doGet(e) {
  const callback = e && e.parameter ? String(e.parameter.callback || '') : '';
  if (callback && !/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(callback)) {
    return output({ error: 'Invalid callback' });
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) return respond({ error: 'Sheet not found' }, callback);

    const lastRow = Math.min(sheet.getLastRow(), CONFIG.MAX_ROWS);
    if (lastRow <= CONFIG.HEADER_ROW) return respond([], callback);

    const firstDataRow = CONFIG.HEADER_ROW + 1;
    const count = lastRow - CONFIG.HEADER_ROW;

    // Strict performance guardrail: never read Column A.
    const profileAndLink = sheet.getRange(firstDataRow, 2, count, 2).getDisplayValues();
    const timestampValues = sheet.getRange(firstDataRow, 6, count, 1).getValues();
    const timezone = ss.getSpreadsheetTimeZone();
    const records = [];

    for (let i = 0; i < count; i++) {
      const profile = String(profileAndLink[i][0] || '').trim();
      const link = String(profileAndLink[i][1] || '').trim();
      if (!link) continue;

      // Return only valid HTTPS Netflix travel-verification links.
      let parsed;
      try { parsed = new URL(link); } catch (_) { continue; }
      if (parsed.protocol !== 'https:' ||
          parsed.hostname !== 'www.netflix.com' ||
          parsed.pathname !== '/account/travel/verify') continue;

      const raw = timestampValues[i][0];
      let timestamp = '';
      if (raw instanceof Date && !isNaN(raw.getTime())) {
        timestamp = Utilities.formatDate(raw, timezone, "yyyy-MM-dd'T'HH:mm:ss");
      } else if (raw) {
        timestamp = String(raw);
      }

      records.push({
        _rowIndex: firstDataRow + i,
        profile: profile || 'Unnamed Profile',
        link: link,
        timestamp: timestamp
      });
    }

    records.sort((a, b) => {
      const ta = Date.parse(a.timestamp) || 0;
      const tb = Date.parse(b.timestamp) || 0;
      return tb - ta || b._rowIndex - a._rowIndex;
    });

    return respond(records, callback);
  } catch (err) {
    return respond({ error: 'Unable to retrieve access codes' }, callback);
  }
}

function respond(data, callback) {
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(data) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return output(data);
}

function output(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
