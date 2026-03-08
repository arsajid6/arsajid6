# Google Sheets Backend Setup Guide

To make your booking system work on your Vercel site (`arsajid6.vercel.app`) without needing a live WordPress server, we will use a **Google Sheet** as your database. This is completely free and works perfectly.

PlNease follow these exact steps to set it up:

## Step 1: Create the Google Sheet
1. Go to [Google Sheets](https://sheets.google.com/) and create a new blank spreadsheet.
2. Name the spreadsheet something like **"Nur al-Quran Bookings"**.
3. In the first row (A1 to J1), type the following headers exactly as written:
   * A1: `time_created`
   * B1: `student_name`
   * C1: `age`
   * D1: `gender`
   * E1: `country`
   * F1: `email`
   * G1: `whatsapp`
   * H1: `course`
   * I1: `selected_time`
   * J1: `message`

## Step 2: Add the Apps Script Code
1. In your Google Sheet, click on **Extensions** > **Apps Script** in the top menu.
2. A new tab will open. Delete any code there (e.g., `function myFunction() {...}`) and paste the following code exactly:

```javascript
const SHEET_NAME = 'Sheet1'; // Change this if you renamed the tab at the bottom of your sheet

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = e.parameter;
  
  // Create a new row of data matching your headers
  const rowData = [
    new Date(), // time_created
    data['full-name'] || '', // student_name
    data['age'] || '',       // age
    data['gender'] || '',    // gender
    data['country'] || '',   // country
    data['email'] || '',     // email
    data['whatsapp'] || '',  // whatsapp
    data['course'] || '',    // course
    data['preferred-time'] || '', // selected_time
    data['message'] || ''    // message
  ];
  
  sheet.appendRow(rowData);
  
  // Return success response to the website
  return ContentService.createTextOutput(JSON.stringify({ 
    success: true, 
    data: "Application received successfully!" 
  })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  // This allows the website to fetch which slots are already booked
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  // Assuming 'selected_time' is column I (index 8)
  const TIME_INDEX = 8; 
  let bookedSlots = [];
  
  // Skip header row (i = 1)
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
```

## Step 3: Deploy the Script (CRITICAL)
1. In the Apps Script editor, click the blue **Deploy** button at the top right, then select **New deployment**.
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**.
3. Fill out the details:
   * **Description**: Booking System API
   * **Execute as**: Me (your email)
   * **Who has access**: **Anyone** *(This is very important! It must be "Anyone", NOT "Anyone with Google Account".)*
4. Click **Deploy**.
5. Google will ask for authorization. Click **Authorize access**, select your account.
6. **Important:** You will see a warning saying "Google hasn't verified this app". Click **Advanced** at the bottom, then click **Go to Untitled project (unsafe)**. Finally, click **Allow**.
7. You will now see a **Web app URL**. Copy this URL!

## Step 4: Add the URL to your Code
Once you have the Web app URL from Step 3, paste it to me in the chat. I will update your `booking-system.js` file so your Vercel website starts communicating with this new Google Sheet!
