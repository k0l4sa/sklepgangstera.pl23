/**
 * ============================================
 * Google Apps Script — Newsletter Backend
 * sklepgangstera.pl — Kolekcja Konsekwencja
 * ============================================
 * 
 * INSTRUKCJA WDROŻENIA:
 * 
 * 1. Otwórz https://script.google.com i utwórz nowy projekt
 * 2. Skopiuj CAŁĄ zawartość tego pliku do edytora Apps Script (Code.gs)
 * 3. Kliknij "Wdróż" → "Nowe wdrożenie"
 * 4. Typ: "Aplikacja internetowa (Web app)"
 * 5. Opis: "Newsletter sklepgangstera.pl"
 * 6. Uruchom jako: "Ja" (Twoje konto)
 * 7. Kto ma dostęp: "Każdy" (Everyone)
 * 8. Kliknij "Wdróż" i skopiuj URL endpointu
 * 9. Wklej URL do pliku index.html w miejsce GOOGLE_SCRIPT_URL
 *
 * Arkusz Google Sheets zostanie utworzony automatycznie
 * przy pierwszym użyciu skryptu.
 */

// ── Nazwa arkusza (zmień jeśli chcesz) ────────────
var SHEET_NAME = 'sklepgangstera_newsletter';
var SPREADSHEET_NAME = 'sklepgangstera.pl — Newsletter Wspólników';

/**
 * Znajduje lub tworzy arkusz kalkulacyjny.
 * Przy pierwszym uruchomieniu tworzy nowy arkusz z nagłówkami.
 */
function getOrCreateSheet() {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty('SHEET_ID');
  var ss, sheet;

  // Spróbuj otworzyć istniejący arkusz
  if (sheetId) {
    try {
      ss = SpreadsheetApp.openById(sheetId);
      sheet = ss.getSheetByName(SHEET_NAME);
      if (sheet) return sheet;
    } catch (e) {
      // Arkusz został usunięty — utwórz nowy
    }
  }

  // Utwórz nowy arkusz
  ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  sheet = ss.getActiveSheet();
  sheet.setName(SHEET_NAME);

  // Nagłówki
  sheet.getRange('A1').setValue('Email');
  sheet.getRange('B1').setValue('Data zapisu');
  sheet.getRange('C1').setValue('Źródło');

  // Formatowanie nagłówków
  var headerRange = sheet.getRange('A1:C1');
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#c9a84c');
  headerRange.setFontColor('#0f0f0f');

  // Szerokości kolumn
  sheet.setColumnWidth(1, 280);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 150);

  // Zapisz ID arkusza
  props.setProperty('SHEET_ID', ss.getId());

  Logger.log('✅ Nowy arkusz utworzony: ' + ss.getUrl());
  return sheet;
}

/**
 * Obsługa GET — zwraca liczbę subskrybentów.
 * Endpoint: GET ?action=count
 */
function doGet(e) {
  var sheet = getOrCreateSheet();

  // Liczba wierszy z danymi (minus nagłówek)
  var lastRow = sheet.getLastRow();
  var count = lastRow > 0 ? lastRow - 1 : 0;

  var response = {
    status: 'ok',
    count: count
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Obsługa POST — dodaje email do arkusza.
 * Body: { "email": "user@example.com" }
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var email = (data.email || '').trim().toLowerCase();

    // Walidacja email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Nieprawidłowy adres email.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = getOrCreateSheet();

    // Sprawdź duplikaty
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var emails = sheet.getRange('A2:A' + lastRow).getValues().flat();
      if (emails.indexOf(email) !== -1) {
        return ContentService
          .createTextOutput(JSON.stringify({
            status: 'duplicate',
            message: 'Hej Wspólniku, już jesteś w Układzie!',
            count: lastRow - 1
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Dodaj nowy wiersz
    var now = new Date();
    var dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    sheet.appendRow([email, dateStr, 'landing-page']);

    var newCount = sheet.getLastRow() - 1;

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'ok',
        message: 'Jesteś w Układzie, Wspólniku.',
        count: newCount
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Błąd serwera: ' + err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Funkcja testowa — uruchom ją ręcznie w edytorze
 * aby sprawdzić czy arkusz został poprawnie utworzony.
 */
function testSetup() {
  var sheet = getOrCreateSheet();
  var ss = sheet.getParent();
  Logger.log('📊 Arkusz: ' + ss.getUrl());
  Logger.log('📧 Wierszy z danymi: ' + (sheet.getLastRow() - 1));
}
