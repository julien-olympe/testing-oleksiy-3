import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const PDF_TIMEOUT = 60000; // 60 seconds

export async function generateProjectPDF(
  projectData: any,
  storagePath: string
): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    
    // Generate HTML content
    const html = generateHTML(projectData);
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF with timeout
    const pdfBuffer = await Promise.race([
      page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('PDF generation timeout')), PDF_TIMEOUT)
      ),
    ]);
    
    // Save PDF to filesystem
    const pdfFileName = `report_${projectData.id}.pdf`;
    const pdfPath = join(storagePath, pdfFileName);
    
    const fs = await import('fs/promises');
    await fs.writeFile(pdfPath, pdfBuffer);
    
    return pdfPath;
  } finally {
    await browser.close();
  }
}

function generateHTML(projectData: any): string {
  const parts = projectData.parts || [];
  
  let tocHtml = '<h2>Table of Contents</h2><ul>';
  parts.forEach((part: any, index: number) => {
    tocHtml += `<li><a href="#part-${index}">${part.name}</a></li>`;
  });
  tocHtml += '</ul>';
  
  let partsHtml = '';
  parts.forEach((part: any, index: number) => {
    partsHtml += `<div id="part-${index}" style="page-break-before: always; margin-top: 20px;">
      <h2>${part.name}</h2>`;
    
    if (part.description) {
      partsHtml += `<p>${escapeHtml(part.description)}</p>`;
    }
    
    if (part.checkups && part.checkups.length > 0) {
      partsHtml += '<h3>Checkups</h3><table border="1" style="width: 100%; border-collapse: collapse;">
        <thead><tr><th>Checkup</th><th>Status</th></tr></thead><tbody>';
      
      part.checkups.forEach((checkup: any) => {
        const statusText = checkup.status || 'Not set';
        const statusColor = getStatusColor(checkup.status);
        partsHtml += `<tr>
          <td>${escapeHtml(checkup.name)}</td>
          <td style="color: ${statusColor};">${escapeHtml(statusText)}</td>
        </tr>`;
      });
      
      partsHtml += '</tbody></table>';
    }
    
    if (part.documentation && part.documentation.length > 0) {
      partsHtml += '<h3>Documentation</h3>';
      part.documentation.forEach((doc: any) => {
        if (doc.file_type.startsWith('image/')) {
          // Note: In production, you'd need to embed images as base64 or use file URLs
          partsHtml += `<p><strong>${escapeHtml(doc.file_name)}</strong></p>`;
        } else {
          partsHtml += `<p><strong>${escapeHtml(doc.file_name)}</strong> - ${escapeHtml(doc.description || 'No description')}</p>`;
        }
      });
    }
    
    partsHtml += '</div>';
  });
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Project Report - ${escapeHtml(projectData.powerplantName)}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        h3 { color: #888; margin-top: 20px; }
        table { margin: 10px 0; }
        th, td { padding: 8px; text-align: left; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; }
      </style>
    </head>
    <body>
      <div style="text-align: center; margin-bottom: 50px;">
        <h1>Wind Power Plant Status Investigation Report</h1>
        <h2>${escapeHtml(projectData.powerplantName)}</h2>
        <p>Project Date: ${new Date(projectData.createdAt).toLocaleDateString()}</p>
      </div>
      ${tocHtml}
      ${partsHtml}
      <div class="footer">
        <p>Page <span class="pageNumber"></span></p>
      </div>
    </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function getStatusColor(status: string | null): string {
  switch (status) {
    case 'bad':
      return '#d32f2f';
    case 'average':
      return '#f57c00';
    case 'good':
      return '#388e3c';
    default:
      return '#757575';
  }
}
