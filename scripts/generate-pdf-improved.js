/**
 * Generate PDF from Markdown Audit Report
 * Improved version with better markdown parsing
 */

const fs = require('fs');
const path = require('path');

// Read the markdown file
const markdownPath = path.join(__dirname, '..', 'SECURITY_AND_PERFORMANCE_AUDIT_REPORT.md');
const markdownContent = fs.readFileSync(markdownPath, 'utf-8');

// Improved markdown to HTML conversion
function markdownToHTML(markdown) {
  let html = markdown;
  
  // Code blocks (do this first to avoid conflicts)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  
  // Headers (in order from largest to smallest)
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');
  
  // Checkboxes
  html = html.replace(/^- \[x\] /gm, '<li class="checked">✅ ');
  html = html.replace(/^- \[ \] /gm, '<li class="unchecked">☐ ');
  
  // Unordered lists
  html = html.replace(/^\- (.+)$/gm, '<li>$1</li>');
  
  // Ordered lists
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
  
  // Wrap consecutive list items
  html = html.replace(/(<li>.*<\/li>\n?)+/g, function(match) {
    return '<ul>' + match + '</ul>';
  });
  
  // Tables - simple conversion
  const lines = html.split('\n');
  let inTable = false;
  let tableRows = [];
  let result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('|') && line.trim().startsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length > 0 && !cells[0].match(/^-+$/)) {
        const isHeader = i > 0 && lines[i-1].includes('---');
        const tag = isHeader ? 'th' : 'td';
        tableRows.push('<tr>' + cells.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>');
      }
    } else {
      if (inTable) {
        result.push('<table>' + tableRows.join('') + '</table>');
        tableRows = [];
        inTable = false;
      }
      result.push(line);
    }
  }
  if (inTable) {
    result.push('<table>' + tableRows.join('') + '</table>');
  }
  html = result.join('\n');
  
  // Paragraphs (wrap text blocks)
  html = html.split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('<') || block.startsWith('#')) {
      return block;
    }
    return '<p>' + block + '</p>';
  }).join('\n');
  
  return html;
}

// Create HTML with professional styling
const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Security & Performance Audit Report - Extreme Dept Kidz</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #1f2937;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px;
      background: white;
    }
    h1 {
      color: #1a1a1a;
      border-bottom: 4px solid #2563eb;
      padding-bottom: 15px;
      margin-top: 40px;
      margin-bottom: 20px;
      font-size: 2em;
      page-break-after: avoid;
    }
    h2 {
      color: #2563eb;
      margin-top: 35px;
      margin-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
      font-size: 1.5em;
      page-break-after: avoid;
    }
    h3 {
      color: #4b5563;
      margin-top: 25px;
      margin-bottom: 12px;
      font-size: 1.25em;
      page-break-after: avoid;
    }
    h4 {
      color: #6b7280;
      margin-top: 20px;
      margin-bottom: 10px;
      font-size: 1.1em;
    }
    h5 {
      color: #9ca3af;
      margin-top: 15px;
      margin-bottom: 8px;
      font-size: 1em;
    }
    p {
      margin: 12px 0;
      text-align: justify;
    }
    code {
      background: #f3f4f6;
      padding: 3px 8px;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
      color: #dc2626;
    }
    pre {
      background: #1f2937;
      color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 15px 0;
      page-break-inside: avoid;
    }
    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 12px 15px;
      text-align: left;
    }
    th {
      background: #2563eb;
      color: white;
      font-weight: 600;
    }
    tr:nth-child(even) {
      background: #f9fafb;
    }
    ul, ol {
      margin: 15px 0;
      padding-left: 35px;
    }
    li {
      margin: 8px 0;
      line-height: 1.6;
    }
    li.checked {
      list-style: none;
      padding-left: 5px;
    }
    hr {
      border: none;
      border-top: 2px solid #e5e7eb;
      margin: 30px 0;
    }
    .status-good {
      color: #10b981;
      font-weight: 600;
    }
    .status-warning {
      color: #f59e0b;
      font-weight: 600;
    }
    .rating {
      font-size: 1.3em;
      font-weight: bold;
      color: #2563eb;
      display: inline-block;
      margin: 0 5px;
    }
    .header-info {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 10px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header-info p {
      margin: 8px 0;
      color: white;
    }
    .checklist {
      background: #f0fdf4;
      padding: 20px;
      border-left: 5px solid #10b981;
      margin: 20px 0;
      border-radius: 5px;
    }
    strong {
      color: #1f2937;
      font-weight: 600;
    }
    @media print {
      body {
        padding: 20px;
      }
      h1, h2, h3 {
        page-break-after: avoid;
      }
      table, pre {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  ${markdownToHTML(markdownContent)}
</body>
</html>
`;

// Save HTML file
const htmlPath = path.join(__dirname, '..', 'audit-report.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('✅ HTML file created:', htmlPath);

// Generate PDF using Chrome
const pdfPath = path.join(process.env.HOME, 'Desktop', 'Security_and_Performance_Audit_Report.pdf');
const htmlFileUrl = `file://${htmlPath}`;

const { execSync } = require('child_process');
try {
  execSync(`/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --headless --disable-gpu --print-to-pdf="${pdfPath}" --print-to-pdf-no-header "${htmlFileUrl}" 2>/dev/null`, { stdio: 'inherit' });
  console.log('✅ PDF created successfully at:', pdfPath);
} catch (error) {
  console.log('⚠️  Chrome headless failed, HTML file is ready at:', htmlPath);
  console.log('   You can open it in a browser and print to PDF manually');
}
