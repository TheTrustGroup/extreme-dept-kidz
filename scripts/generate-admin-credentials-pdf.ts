import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const desktopPath = path.join(process.env.HOME || '', 'Desktop');
const outputPath = path.join(desktopPath, 'admin-login-credentials.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 50, right: 50 }
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Admin credentials
const email = 'info@extremedeptkidz.com';
const password = 'Admin123!@#';
const loginUrl = 'https://extremedeptkidz.com/admin/login';

// Use monospace font (coding font)
doc.font('Courier-Bold')
   .fontSize(16)
   .text('ADMIN LOGIN CREDENTIALS', { align: 'center' })
   .moveDown(2);

doc.font('Courier')
   .fontSize(12)
   .text('URL:', { continued: false })
   .font('Courier-Bold')
   .text(loginUrl, { indent: 20 })
   .moveDown(1.5);

doc.font('Courier')
   .fontSize(12)
   .text('Email:', { continued: false })
   .font('Courier-Bold')
   .text(email, { indent: 20 })
   .moveDown(1.5);

doc.font('Courier')
   .fontSize(12)
   .text('Password:', { continued: false })
   .font('Courier-Bold')
   .text(password, { indent: 20 })
   .moveDown(2);

doc.font('Courier')
   .fontSize(10)
   .fillColor('#666666')
   .text('Keep these credentials secure.', { align: 'center' })
   .text('Change password after first login.', { align: 'center' });

doc.end();

stream.on('finish', () => {
  console.log(`✅ PDF created successfully at: ${outputPath}`);
});

stream.on('error', (err) => {
  console.error('❌ Error creating PDF:', err);
  process.exit(1);
});
