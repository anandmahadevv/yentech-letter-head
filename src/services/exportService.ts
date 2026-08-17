import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { LetterData, Organization } from '../types';

/**
 * Isolated Sandboxed PDF Export Engine
 * Completely bypasses Tailwind v4 oklch CSS parser errors by rendering inside a clean, isolated iframe.
 */
export async function exportToPdf(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Target element not found for PDF export:', elementId);
    window.print();
    return false;
  }

  // Create isolated iframe sandbox
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '794px';
  iframe.style.height = '1123px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '-9999';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    window.print();
    return false;
  }

  // Setup clean document with standard typography
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Cormorant+Garamond:wght@600&family=Merriweather:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #ffffff; margin: 0; padding: 0; font-family: 'Poppins', sans-serif; color: #0f172a; }
          .w-full { width: 100%; }
          .h-full { height: 100%; }
          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .justify-start { justify-content: flex-start; }
          .justify-center { justify-content: center; }
          .relative { position: relative; }
          .absolute { position: absolute; }
          .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
          .overflow-hidden { overflow: hidden; }
          .whitespace-pre-wrap { white-space: pre-wrap; }
          .font-bold { font-weight: 700; }
          .font-black { font-weight: 900; }
          .font-mono { font-family: monospace, monospace; }
          .uppercase { text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div id="sandbox-root" style="width: 794px; min-height: 1123px; background: #ffffff; position: relative;"></div>
      </body>
    </html>
  `);
  iframeDoc.close();

  // Wait for iframe initialization
  await new Promise((resolve) => setTimeout(resolve, 200));

  const sandboxRoot = iframeDoc.getElementById('sandbox-root');
  if (!sandboxRoot) {
    document.body.removeChild(iframe);
    window.print();
    return false;
  }

  // Clone element into sandbox
  const cloned = element.cloneNode(true) as HTMLElement;
  cloned.style.transform = 'none';
  cloned.style.boxShadow = 'none';
  cloned.style.margin = '0';
  cloned.style.outline = 'none';
  cloned.style.width = '794px';
  cloned.style.minHeight = '1123px';

  // Strip contenteditable and active outlines
  cloned.querySelectorAll('[contenteditable]').forEach((el) => {
    el.removeAttribute('contenteditable');
    (el as HTMLElement).style.outline = 'none';
    (el as HTMLElement).style.backgroundColor = 'transparent';
  });

  sandboxRoot.appendChild(cloned);

  // Wait for all images inside iframe to complete loading
  const imgs = Array.from(cloned.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });
    })
  );

  try {
    const canvas = await html2canvas(cloned, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 794,
      height: 1123,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    pdf.save(`${filename || 'yentech-letter-head'}.pdf`);
    return true;
  } catch (err) {
    console.error('PDF export fallback:', err);
    window.print();
    return true;
  } finally {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }
}

/**
 * Isolated Sandboxed PNG Export Engine
 */
export async function exportToPng(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) return false;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '794px';
  iframe.style.height = '1123px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '-9999';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return false;
  }

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Cormorant+Garamond:wght@600&family=Merriweather:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #ffffff; margin: 0; padding: 0; font-family: 'Poppins', sans-serif; color: #0f172a; }
          .w-full { width: 100%; }
          .h-full { height: 100%; }
          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .justify-start { justify-content: flex-start; }
          .justify-center { justify-content: center; }
          .relative { position: relative; }
          .absolute { position: absolute; }
          .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
          .overflow-hidden { overflow: hidden; }
          .whitespace-pre-wrap { white-space: pre-wrap; }
          .font-bold { font-weight: 700; }
          .font-black { font-weight: 900; }
          .font-mono { font-family: monospace, monospace; }
          .uppercase { text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div id="sandbox-root" style="width: 794px; min-height: 1123px; background: #ffffff; position: relative;"></div>
      </body>
    </html>
  `);
  iframeDoc.close();

  await new Promise((resolve) => setTimeout(resolve, 200));

  const sandboxRoot = iframeDoc.getElementById('sandbox-root');
  if (!sandboxRoot) {
    document.body.removeChild(iframe);
    return false;
  }

  const cloned = element.cloneNode(true) as HTMLElement;
  cloned.style.transform = 'none';
  cloned.style.boxShadow = 'none';
  cloned.style.margin = '0';
  cloned.style.outline = 'none';
  cloned.style.width = '794px';
  cloned.style.minHeight = '1123px';

  cloned.querySelectorAll('[contenteditable]').forEach((el) => {
    el.removeAttribute('contenteditable');
    (el as HTMLElement).style.outline = 'none';
    (el as HTMLElement).style.backgroundColor = 'transparent';
  });

  sandboxRoot.appendChild(cloned);

  const imgs = Array.from(cloned.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });
    })
  );

  try {
    const canvas = await html2canvas(cloned, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 794,
      height: 1123,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${filename || 'yentech-letter-head'}.png`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (err) {
    console.error('Failed to export PNG:', err);
    return false;
  } finally {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }
}

/**
 * Export letter data to Microsoft Word (.docx) format
 */
export async function exportToDocx(letterData: LetterData, org: Organization): Promise<boolean> {
  try {
    const docChildren: any[] = [];

    // Header
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: org.name.toUpperCase(),
            bold: true,
            size: 26,
            color: '179091',
            font: 'Poppins',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: org.contactEmail || 'yentech.yset@gmail.com',
            size: 18,
            color: '555555',
            font: 'Poppins',
          }),
        ],
      })
    );

    // Headline / Subject
    if (letterData.subject) {
      docChildren.push(
        new Paragraph({
          spacing: { after: 240 },
          children: [
            new TextRun({ text: letterData.subject, bold: true, size: 24, font: 'Calibri' }),
          ],
        })
      );
    }

    // Body Paragraphs
    for (const p of letterData.bodyParagraphs) {
      docChildren.push(
        new Paragraph({
          spacing: { after: 180, line: 280 },
          alignment: AlignmentType.LEFT,
          children: [new TextRun({ text: p, size: 22, font: 'Calibri' })],
        })
      );
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                bottom: 1440,
                left: 1440,
                right: 1440,
              },
            },
          },
          children: docChildren,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'yentech-letter-head.docx');
    return true;
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return false;
  }
}
