/**
 * Generate PDF from Markdown Audit Report
 * Uses a simple HTML conversion approach
 */

const fs = require('fs');
const path = require('path');

// Read the markdown file
const markdownPath = path.join(__dirname, '..', 'SECURITY_AND_PERFORMANCE_AUDIT_REPORT.md');
const markdownContent = fs.readFileSync(markdownPath, 'utf-8');

// Convert markdown to HTML (simple conversion)
function markdownToHTML(markdown) {
  let html = markdown;
  
  // Headers
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Lists
  html = html.replace(/^\- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  // Tables (simple)
  html = html.replace(/\|(.+)\|/g, function(match) {
    const cells = match.split('|').filter(c => c.trim());
    return '<tr>' + cells.map(c => '<td>' + c.trim() + '</td>').join('') + '</tr>';
  });
  
  return html;
}

// Create HTML with styling
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Security & Performance Audit Report - Extreme Dept Kidz</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #1a1a1a;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
      margin-top: 30px;
    }
    h2 {
      color: #2563eb;
      margin-top: 25px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 5px;
    }
    h3 {
      color: #4b5563;
      margin-top: 20px;
    }
    h4 {
      color: #6b7280;
      margin-top: 15px;
    }
    code {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    pre {
      background: #1f2937;
      color: #f9fafb;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 8px 12px;
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
      margin: 10px 0;
      padding-left: 30px;
    }
    li {
      margin: 5px 0;
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
      font-size: 1.2em;
      font-weight: bold;
      color: #2563eb;
    }
    .header-info {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .checklist {
      background: #f9fafb;
      padding: 15px;
      border-left: 4px solid #10b981;
      margin: 15px 0;
    }
    @media print {
      body {
        padding: 0;
      }
      h1 {
        page-break-after: avoid;
      }
      h2 {
        page-break-after: avoid;
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
console.log('📄 You can open this file in a browser and print to PDF');
console.log('   Or use: open audit-report.html');
