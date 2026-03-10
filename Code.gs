// ============================================================
//   Nur al-Quran - Google Apps Script Backend (Code.gs)
//   PURPOSE: Handle form submissions, send emails, return booked slots
// ============================================================

const SHEET_NAME   = 'Sheet1';          // Tab name at the bottom of your Sheet
const ADMIN_EMAIL  = 'arsajid6@gmail.com'; // Your Gmail for admin notifications

// ─── Column Indexes (0-based) ────────────────────────────────
// A=0  B=1  C=2  D=3  E=4  F=5  G=6  H=7  I=8  J=9  K=10
const COL_TIME_CREATED  = 0;
const COL_NAME          = 1;
const COL_AGE           = 2;
const COL_GENDER        = 3;
const COL_COUNTRY       = 4;
const COL_EMAIL         = 5;
const COL_WHATSAPP      = 6;
const COL_COURSE        = 7;
const COL_SELECTED_TIME = 8;
const COL_MESSAGE       = 9;
const COL_STATUS        = 10;  // K column → 'Pending' / 'Approved' / 'Rejected'
const COL_DEBUG         = 11;  // L column → For logging email errors

// ─── Helper: Add CORS Headers ────────────────────────────────
function corsOutput(jsonString) {
  return ContentService
    .createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
//   doPost – receives form submissions from the website
// ============================================================
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    // Make sure header row exists (runs only if sheet is empty)
    ensureHeaders(sheet);

    const data = e.parameter;

    const studentEmail    = data['email']          || '';
    const studentName     = data['full-name']       || 'Student';
    const preferredTime   = data['preferred-time']  || 'Not specified';
    const course          = data['course']          || 'Not specified';
    const age             = data['age']             || '';
    const gender          = data['gender']          || '';
    const country         = data['country']         || '';
    const whatsapp        = data['whatsapp']        || '';
    const message         = data['message']         || '';

    // ── Append new row ────────────────────────────────────────
    const rowData = [
      new Date(),       // A – time_created
      studentName,      // B – student_name
      age,              // C – age
      gender,           // D – gender
      country,          // E – country
      studentEmail,     // F – email
      whatsapp,         // G – whatsapp
      course,           // H – course
      preferredTime,    // I – selected_time
      message,          // J – message
      'Pending'         // K – status  (change to 'Approved' in Sheet to confirm)
    ];

    sheet.appendRow(rowData);
    const newRowIndex = sheet.getLastRow();

    // ── Interactive Email to Admin ────────────────────────────
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbyhMlo2Vl9UQgaS5Rn8XwcuyYMCC1J_oB-0_MFRjsGkU1_j_tlxNV1RVnnFO6Qa4FTTAg/exec'; 
    const approveUrl = `${scriptUrl}?action=approve&row=${newRowIndex}`;
    const rejectUrl  = `${scriptUrl}?action=reject&row=${newRowIndex}`;

    const adminSubject = `📩 New Application: ${studentName}`;
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; border-radius: 15px; padding: 25px; background-color: #ffffff;">
        <h2 style="color: #2D5A27; text-align: center; margin-top: 0;">New Admission Application</h2>
        <div style="background-color: #f8fbf8; padding: 20px; border-radius: 10px; border: 1px solid #eef2ee; margin-bottom: 25px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Student:</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${studentName}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Age / Gender:</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${age} / ${gender}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Course:</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${course}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Time (PKT):</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #2D5A27; font-weight: bold;">${preferredTime}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">WhatsApp:</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="https://wa.me/${whatsapp.replace(/\D/g,'')}" style="color: #2D5A27; text-decoration: none;">${whatsapp}</a></td></tr>
          </table>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${approveUrl}" style="background-color: #2D5A27; color: white; padding: 15px 35px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">Approve Slot</a>
          &nbsp;&nbsp;&nbsp;
          <a href="${rejectUrl}" style="background-color: #fcf4f4; color: #c0392b; padding: 15px 35px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; border: 1px solid #f9ebeb;">Reject</a>
        </div>
      </div>
    `;

    try {
      GmailApp.sendEmail(ADMIN_EMAIL, adminSubject, '', {
        name: 'Nur al-Quran Academy',
        htmlBody: htmlBody
      });
      debugLog.push('Admin Email: OK');
    } catch (err) {
      debugLog.push('Admin Email Error: ' + err.message);
    }

    // ── Email to Student ──────────────────────────────────────
    if (studentEmail && studentEmail.includes('@')) {
      const studentSubject = `✅ Application Received – Nur al-Quran`;
      const studentBody =
        `Assalamu Alaikum ${studentName},\n\n` +
        `Jazakallah Khair for your interest in Nur al-Quran Academy.\n\n` +
        `We have successfully received your application for:\n` +
        `  • Course: ${course}\n` +
        `  • Preferred Time: ${preferredTime}\n\n` +
        `Your application is currently in 'Waiting' status. Our team will review it and contact you shortly to confirm your slot and arrange your FREE trial class, Insha'Allah!\n\n` +
        `If you have any urgent queries, please reach us on WhatsApp.\n\n` +
        `Wassalam,\nNur al-Quran Team`;

      try {
        GmailApp.sendEmail(studentEmail, studentSubject, studentBody, {
          name: 'Nur al-Quran Academy'
        });
        debugLog.push('Student Email: OK');
      } catch (err) {
        debugLog.push('Student Email Error: ' + err.message);
      }
    } else {
      debugLog.push('Student Email: Invalid or Missing (' + studentEmail + ')');
    }

    // Append debug log to the new row
    sheet.getRange(sheet.getLastRow(), COL_DEBUG + 1).setValue(debugLog.join(' | '));

    return corsOutput(JSON.stringify({
      success: true,
      data: 'Application received! Please check your email for confirmation.'
    }));

  } catch (err) {
    Logger.log('doPost error: ' + err.message);
    return corsOutput(JSON.stringify({ success: false, data: 'Server error: ' + err.message }));
  }
}

// ============================================================
//   doGet – returns the list of APPROVED booked time slots
//           so the website timetable can mark them as "Booked"
// ============================================================
function doGet(e) {
  try {
    const action = e.parameter.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    // ── Handle Email Actions (Approve/Reject) ─────────────────
    if (action === 'approve' || action === 'reject') {
      const row = parseInt(e.parameter.row);
      if (!row || row <= 1) return HtmlService.createHtmlOutput("<h3>❌ Invalid Request</h3>");

      const currentStatus = String(sheet.getRange(row, 11).getValue() || '').trim();
      if (currentStatus !== 'Pending') {
        return HtmlService.createHtmlOutput(`
          <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #333;">ℹ️ Already Processed</h2>
            <p>This application is already marked as <strong>${currentStatus}</strong>.</p>
            <a href="${ss.getUrl()}" target="_blank" style="color: #2D5A27;">Open Google Sheet</a>
          </div>
        `);
      }

      const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
      sheet.getRange(row, 11).setValue(newStatus);

      const color = action === 'approve' ? '#2D5A27' : '#c0392b';
      const icon = action === 'approve' ? '✅' : '❌';

      return HtmlService.createHtmlOutput(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: ${color};">${icon} Successfully ${newStatus}</h2>
          <p>The system has been updated and the student notified (if needed).</p>
          <br>
          <a href="${ss.getUrl()}" target="_blank" style="color: #2D5A27; text-decoration: none; font-weight: bold;">← Back to Google Sheet</a>
        </div>
      `);
    }

    // ── Handle Fetch Bookings (for website) ───────────────────
    const allData = sheet.getDataRange().getValues();
    let bookedSlots = [];

    for (let i = 1; i < allData.length; i++) {
      const time   = allData[i][COL_SELECTED_TIME];
      const status = String(allData[i][COL_STATUS] || '').trim();
      if (time && (status === 'Approved' || status === 'Pending' || status === 'new' || status === 'WAITING' || status === 'Waiting')) {
        bookedSlots.push({ selected_time: String(time).trim(), status: status });
      }
    }

    return corsOutput(JSON.stringify({ success: true, data: bookedSlots }));

  } catch (err) {
    Logger.log('doGet error: ' + err.message);
    return corsOutput(JSON.stringify({ success: false, data: [] }));
  }
}

// ============================================================
//   onEdit – Automatic trigger: fires whenever you edit a cell
//   When you change STATUS (col K) to 'Approved', this sends
//   a confirmation email to the student automatically.
// ============================================================
function onEdit(e) {
  const sheet = e.source.getActiveSheet();

  // Only run on our bookings sheet
  if (sheet.getName() !== SHEET_NAME) return;

  const editedCol = e.range.getColumn();
  const editedRow = e.range.getRow();

  // Column K = 11 (1-based). Skip header row (row 1).
  if (editedCol !== 11 || editedRow <= 1) return;

  const newValue = String(e.value || '').trim();

  if (newValue === 'Approved') {
    const rowData     = sheet.getRange(editedRow, 1, 1, 11).getValues()[0];
    const studentName = rowData[COL_NAME]          || 'Student';
    const studentEmail= rowData[COL_EMAIL]         || '';
    const course      = rowData[COL_COURSE]        || 'the course';
    const slotTime    = rowData[COL_SELECTED_TIME] || 'your preferred time';

    if (!studentEmail) return;

    const subject = `🎉 Booking Confirmed – Nur al-Quran`;
    const body = `Assalamu Alaikum ${studentName},

Masha'Allah! Your booking has been CONFIRMED.

  • Course:    ${course}
  • Time Slot: ${slotTime}

Please join your trial class at the above time. Our teacher will contact you before the session to provide the Zoom/link details.

Barakallahu feekum,
Nur al-Quran Team`;

    try {
      GmailApp.sendEmail(studentEmail, subject, body, {
        name: 'Nur al-Quran Academy'
      });
      Logger.log('Approval email sent to: ' + studentEmail);
    } catch (err) {
      Logger.log('Approval email error: ' + err.message);
    }

  } else if (newValue === 'Rejected') {
    const rowData     = sheet.getRange(editedRow, 1, 1, 11).getValues()[0];
    const studentName = rowData[COL_NAME]  || 'Student';
    const studentEmail= rowData[COL_EMAIL] || '';

    if (!studentEmail) return;

    const subject = `Regarding Your Application – Nur al-Quran`;
    const body = `Assalamu Alaikum ${studentName},

We appreciate your interest in Nur al-Quran Academy.

Unfortunately, we are unable to accommodate your application at this time due to limited slot availability. We encourage you to apply again when new slots open, InshaaAllah.

If you have any questions, please feel free to contact us on WhatsApp.

Wassalam,
Nur al-Quran Team`;

    try {
      GmailApp.sendEmail(studentEmail, subject, body, {
        name: 'Nur al-Quran Academy'
      });
      Logger.log('Rejection email sent to: ' + studentEmail);
    } catch (err) {
      Logger.log('Rejection email error: ' + err.message);
    }
  }
}

// ============================================================
//   ensureHeaders – Creates the header row if the sheet is empty
// ============================================================
function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'time_created', 'student_name', 'age', 'gender', 'country',
      'email', 'whatsapp', 'course', 'selected_time', 'message', 'status', 'debug_logs'
    ]);
    // Style the header row
    const headerRange = sheet.getRange(1, 1, 1, 12);
    headerRange.setBackground('#1a3c5e');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
  } else {
    // Check if col L exists, if not, add header
    const lastCol = sheet.getLastColumn();
    if (lastCol < 12) {
      sheet.getRange(1, 12).setValue('debug_logs');
      sheet.getRange(1, 12).setBackground('#1a3c5e').setFontColor('#ffffff').setFontWeight('bold');
    }
  }
}

// ============================================================
//   setupTrigger – Run this ONCE manually to register onEdit
//   Go to: Apps Script → Run → setupTrigger
// ============================================================
function setupTrigger() {
  // Delete old triggers to avoid duplicates
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  // Install a fresh onEdit trigger
  ScriptApp.newTrigger('onEdit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();

  Logger.log('✅ onEdit trigger installed successfully!');
}
