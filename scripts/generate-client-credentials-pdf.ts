/**
 * Generate a client-ready PDF with login credentials and links.
 * Run: npx tsx scripts/generate-client-credentials-pdf.ts
 * Output: client-login-and-links.pdf (project root)
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const desktopPath = path.join(process.env.HOME || '', 'Desktop');
const outputPath = path.join(desktopPath, 'client-login-and-links.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// ─── Links (share with client) ─────────────────────────────────────────────
const LINKS = [
  { label: 'Main store (customer site)', url: 'https://extremedeptkidz.com' },
  { label: 'Admin dashboard login', url: 'https://extremedeptkidz.com/admin/login' },
  { label: 'Warehouse app (Inventory & POS)', url: 'https://warehouse.extremedeptkidz.com' },
];

// ─── Credentials ───────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'info@extremedeptkidz.com';
const ADMIN_PASSWORD_PLACEHOLDER = '[Your existing admin password]';
const ROLE_PASSWORD = 'EDK-!@#';
const ROLE_USERS = [
  { role: 'Manager', email: 'manager@extremedeptkidz.com' },
  { role: 'Cashier', email: 'cashier@extremedeptkidz.com' },
  { role: 'Warehouse', email: 'warehouse@extremedeptkidz.com' },
  { role: 'Driver', email: 'driver@extremedeptkidz.com' },
  { role: 'Viewer', email: 'viewer@extremedeptkidz.com' },
];

// ─── PDF content ───────────────────────────────────────────────────────────
doc.font('Helvetica-Bold').fontSize(18).fillColor('#1a1a1a');
doc.text('Extreme Dept Kidz', { align: 'center' });
doc.moveDown(0.3);
doc.font('Helvetica').fontSize(12).fillColor('#555');
doc.text('Login credentials & links for client', { align: 'center' });
doc.moveDown(2);

// Section: Links
doc.font('Helvetica-Bold').fontSize(14).fillColor('#1a1a1a');
doc.text('Links to share');
doc.moveDown(0.8);
doc.font('Helvetica').fontSize(11).fillColor('#333');
for (const { label, url } of LINKS) {
  doc.text(label + ':', { continued: false });
  doc.fillColor('#0066cc').text(url, { indent: 10, link: url });
  doc.fillColor('#333').moveDown(0.5);
}
doc.moveDown(1.2);

// Section: Admin login
doc.font('Helvetica-Bold').fontSize(14).fillColor('#1a1a1a');
doc.text('Admin login (main dashboard)');
doc.moveDown(0.8);
doc.font('Helvetica').fontSize(11).fillColor('#333');
doc.text('URL:  ' + 'https://extremedeptkidz.com/admin/login');
doc.text('Email:  ' + ADMIN_EMAIL);
doc.text('Password:  ' + ADMIN_PASSWORD_PLACEHOLDER);
doc.moveDown(1.2);

// Section: Role logins (warehouse / POS)
doc.font('Helvetica-Bold').fontSize(14).fillColor('#1a1a1a');
doc.text('Role logins (Warehouse app – same password for all)');
doc.moveDown(0.5);
doc.font('Helvetica').fontSize(10).fillColor('#555');
doc.text('Use these at ' + 'https://warehouse.extremedeptkidz.com');
doc.moveDown(0.6);
doc.font('Helvetica').fontSize(11).fillColor('#333');
doc.text('Password for all roles below:  ' + ROLE_PASSWORD);
doc.moveDown(0.6);
for (const { role, email } of ROLE_USERS) {
  doc.text(role + ':  ' + email);
  doc.moveDown(0.35);
}
doc.moveDown(1.2);

// Footer note
doc.font('Helvetica').fontSize(9).fillColor('#666');
doc.text('Keep this document secure. Do not share publicly.', { align: 'center' });
doc.text('Change any default password after first login.', { align: 'center' });
doc.moveDown(0.5);
doc.font('Helvetica-Oblique').fontSize(8).fillColor('#999');
doc.text('Generated for Extreme Dept Kidz – ' + new Date().toISOString().slice(0, 10), {
  align: 'center',
});

doc.end();

stream.on('finish', () => {
  console.log('✅ PDF created on Desktop: ' + outputPath);
  console.log('   Share this file with your client (credentials + links).');
});

stream.on('error', (err) => {
  console.error('❌ Error creating PDF:', err);
  process.exit(1);
});
