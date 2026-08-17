import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { LetterData, Organization } from '../types';

/**
 * Export A4 Letter canvas to high-resolution vector/raster PDF (210mm x 297mm)
 * Uses an offscreen clone technique to ensure zoom transforms never distort the export.
 */
export async function exportToPdf(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Target element not found for PDF export:', elementId);
    return false;
  }

  // Create an offscreen wrapper to render the unscaled element perfectly
  const cloneWrapper = document.createElement('div');
  cloneWrapper.style.position = 'fixed';
  cloneWrapper.style.left = '-9999px';
  cloneWrapper.style.top = '0';
  cloneWrapper.style.width = '794px'; // Standard A4 width in px @ 96 DPI (210mm)
  cloneWrapper.style.background = '#ffffff';
  cloneWrapper.style.zIndex = '-9999';
  cloneWrapper.style.overflow = 'hidden';

  const clonedNode = element.cloneNode(true) as HTMLElement;
  clonedNode.style.transform = 'none';
  clonedNode.style.boxShadow = 'none';
  clonedNode.style.margin = '0';
  clonedNode.style.outline = 'none';
  clonedNode.style.width = '794px';
  clonedNode.style.minHeight = '1123px'; // Standard A4 height in px @ 96 DPI (297mm)

  // Remove any focused outlines or hover classes from cloned nodes
  const editableNodes = clonedNode.querySelectorAll('[contenteditable]');
  editableNodes.forEach((node) => {
    const el = node as HTMLElement;
    el.removeAttribute('contenteditable');
    el.style.outline = 'none';
    el.style.backgroundColor = 'transparent';
  });

  cloneWrapper.appendChild(clonedNode);
  document.body.appendChild(cloneWrapper);

  try {
    // Wait for fonts & assets in DOM
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Capture offscreen element at crisp 2.5x resolution (~250-300 DPI)
    const canvas = await html2canvas(clonedNode, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // Sanitize any modern CSS color functions from cloned stylesheets
        Array.from(clonedDoc.querySelectorAll('style')).forEach((styleTag) => {
          if (styleTag.innerHTML && styleTag.innerHTML.includes('oklch')) {
            styleTag.innerHTML = styleTag.innerHTML.replace(/oklch\([^)]+\)/g, '#0f172a');
          }
        });

        // Sanitize node computed styles
        const allNodes = clonedDoc.querySelectorAll('*');
        allNodes.forEach((node) => {
          const el = node as HTMLElement;
          if (el.style) {
            if (el.style.color && el.style.color.includes('oklch')) {
              el.style.color = '#0f172a';
            }
            if (el.style.backgroundColor && el.style.backgroundColor.includes('oklch')) {
              el.style.backgroundColor = '#ffffff';
            }
            if (el.style.borderColor && el.style.borderColor.includes('oklch')) {
              el.style.borderColor = '#e2e8f0';
            }
          }
        });
      },
      width: 794,
      height: 1123,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(`${filename || 'Official_Letter'}.pdf`);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  } finally {
    // Always clean up offscreen DOM
    if (document.body.contains(cloneWrapper)) {
      document.body.removeChild(cloneWrapper);
    }
  }
}

/**
 * Export high-resolution PNG image (300 DPI)
 */
export async function exportToPng(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) return false;

  const cloneWrapper = document.createElement('div');
  cloneWrapper.style.position = 'fixed';
  cloneWrapper.style.left = '-9999px';
  cloneWrapper.style.top = '0';
  cloneWrapper.style.width = '794px';
  cloneWrapper.style.background = '#ffffff';
  cloneWrapper.style.zIndex = '-9999';

  const clonedNode = element.cloneNode(true) as HTMLElement;
  clonedNode.style.transform = 'none';
  clonedNode.style.boxShadow = 'none';
  clonedNode.style.margin = '0';
  clonedNode.style.outline = 'none';
  clonedNode.style.width = '794px';
  clonedNode.style.minHeight = '1123px';

  cloneWrapper.appendChild(clonedNode);
  document.body.appendChild(cloneWrapper);

  try {
    const canvas = await html2canvas(clonedNode, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        Array.from(clonedDoc.querySelectorAll('style')).forEach((styleTag) => {
          if (styleTag.innerHTML && styleTag.innerHTML.includes('oklch')) {
            styleTag.innerHTML = styleTag.innerHTML.replace(/oklch\([^)]+\)/g, '#0f172a');
          }
        });
      },
      width: 794,
      height: 1123,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${filename || 'Official_Letter'}.png`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (err) {
    console.error('Failed to export PNG:', err);
    return false;
  } finally {
    if (document.body.contains(cloneWrapper)) {
      document.body.removeChild(cloneWrapper);
    }
  }
}

/**
 * Export letter data to standard editable Microsoft Word (.docx) format
 */
export async function exportToDocx(letterData: LetterData, org: Organization): Promise<boolean> {
  try {
    const docChildren: any[] = [];

    // Header - Organization details
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
                top: 1440, // 1 inch
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

/**
 * Trigger native browser print dialog for A4 page
 */
export function triggerPrint(): void {
  window.print();
}
