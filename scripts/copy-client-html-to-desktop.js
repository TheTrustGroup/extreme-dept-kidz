#!/usr/bin/env node
/** Copy client-login-and-links.html to Desktop. Run: node scripts/copy-client-html-to-desktop.js */
const fs = require('fs');
const path = require('path');

const desktop = path.join(process.env.HOME || '', 'Desktop');
const src = path.join(__dirname, 'client-login-and-links.html');
const dest = path.join(desktop, 'client-login-and-links.html');

fs.copyFileSync(src, dest);
console.log('✅ Copied to Desktop:', dest);
console.log('   Open it in a browser, then Print → Save as PDF to create a PDF on Desktop.');
