const SHEET_NAME = 'Sheet1';

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = e.parameter;
  
  const rowData = [
    new Date(),
    data['full-name'] || '',
    data['age'] || '',       
    data['gender'] || '',    
    data['country'] || '',   
    data['email'] || '',     
    data['whatsapp'] || '',  
    data['course'] || '',    
    data['preferred-time'] || '', 
    data['message'] || ''    
  ];
  
  sheet.appendRow(rowData);
  
  return ContentService.createTextOutput(JSON.stringify({ 
    success: true, 
    data: 'Application received successfully!' 
  })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  const TIME_INDEX = 8; 
  let bookedSlots = [];
  
  for (let i = 1; i < data.length; i++) {
    let time = data[i][TIME_INDEX];
    if (time) {
      bookedSlots.push({ selected_time: time });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: bookedSlots
  })).setMimeType(ContentService.MimeType.JSON);
}
