---
description: Sync changes from static site (arsajid6) to WordPress plugin
---
This workflow synchronizes the booking system components (`booking-system.js` and `booking-system.css`) from the development folder to the WordPress plugin directory.

// turbo
1. Run the sync script using Node.js:
```powershell
node sync-to-wp.js
```

2. Verify that the files in `C:\xampp\htdocs\quranacademy\wp-content\plugins\quran-booking-plugin\assets` have been updated.
