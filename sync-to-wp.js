/**
 * Nur al-Quran - Synchronization Script
 * Copies the booking system component from 'arsajid6' to the WordPress plugin.
 */
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = __dirname;
const PLUGIN_ASSETS_DIR = 'C:\\xampp\\htdocs\\quranacademy\\wp-content\\plugins\\quran-booking-plugin\\assets';

const filesToSync = [
    { src: 'booking-system.js', dest: 'js/booking.js' },
    { src: 'booking-system.css', dest: 'css/booking.css' }
];

console.log('--- Nur al-Quran Sync Started ---');

filesToSync.forEach(file => {
    const srcPath = path.join(SOURCE_DIR, file.src);
    const destPath = path.join(PLUGIN_ASSETS_DIR, file.dest);

    try {
        if (fs.existsSync(srcPath)) {
            // Read source
            let content = fs.readFileSync(srcPath, 'utf8');

            // Ensure destination directory exists
            const destDir = path.dirname(destPath);
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            // Write to destination
            fs.writeFileSync(destPath, content);
            console.log(`[SUCCESS] Synced ${file.src} -> ${file.dest}`);
        } else {
            console.warn(`[SKIP] Source file not found: ${file.src}`);
        }
    } catch (err) {
        console.error(`[ERROR] Failed to sync ${file.src}:`, err.message);
    }
});

console.log('--- Sync Completed ---');
