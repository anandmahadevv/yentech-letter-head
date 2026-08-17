import { toJpeg, toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { LetterData, Organization } from '../types';

/**
 * Export A4 Letter canvas to ultra-high-resolution PDF (210mm x 297mm)
 * Uses browser-native SVG rasterization via html-to-image for 100% pixel-perfect typography,
 * correct watermark opacity, zero color parsing bugs, and exact layout alignment.
 */
export async function exportToPdf(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Target element not found for PDF export:', elementId);
    window.print();
    return false;
  }

  try {
    // Generate high-resolution JPEG image (2.5x pixel ratio ~300 DPI)
    const imgData = await toJpeg(element, {
      quality: 0.98,
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: false,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(`${filename || 'yentech-letter-head'}.pdf`);
    return true;
  } catch (error) {
    console.error('High-fidelity PDF export error, falling back to browser print:', error);
    window.print();
    return true;
  }
}

/**
 * Export high-resolution PNG image (300 DPI)
 */
export async function exportToPng(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const dataUrl = await toPng(element, {
      pixelRatio: 3,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });

    const link = document.createElement('a');
    link.download = `${filename || 'yentech-letter-head'}.png`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (err) {
    console.error('Failed to export PNG:', err);
    return false;
  }
}

/**
 * Export letter data to standard Microsoft Word (.docx) format
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
