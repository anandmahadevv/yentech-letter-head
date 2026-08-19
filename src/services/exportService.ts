import { toJpeg, toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import { saveAs } from 'file-saver';
import { LetterData, Organization } from '../types';

/**
 * Export A4 Letter canvas to ultra-high-resolution PDF (210mm x 297mm)
 * Supports multi-page document export (Page 1 Letterhead + Page 2 Continuation Sheet)
 */
export async function exportToPdf(elementIdOrFilename: string, optionalFilename?: string): Promise<boolean> {
  const page1 = document.getElementById('letter-a4-canvas-page-1') || document.getElementById('letter-a4-canvas');
  const page2 = document.getElementById('letter-a4-canvas-page-2');

  if (!page1) {
    console.error('Target element not found for PDF export');
    window.print();
    return false;
  }

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    // 1. Render Page 1 (Official Letterhead)
    const imgData1 = await toJpeg(page1, {
      quality: 0.98,
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: false,
    });
    pdf.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    // 2. Render Page 2 (Continuation Sheet - if active)
    if (page2) {
      const imgData2 = await toJpeg(page2, {
        quality: 0.98,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: false,
      });
      pdf.addPage('a4', 'portrait');
      pdf.addImage(imgData2, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }

    const safeName = optionalFilename || elementIdOrFilename || 'yentech-letter-head';
    pdf.save(`${safeName.replace(/\.pdf$/i, '')}.pdf`);
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
  const page1 = document.getElementById('letter-a4-canvas-page-1') || document.getElementById('letter-a4-canvas');
  const page2 = document.getElementById('letter-a4-canvas-page-2');
  if (!page1) return false;

  try {
    const dataUrl1 = await toPng(page1, {
      pixelRatio: 3,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });

    const link = document.createElement('a');
    const safeName = filename || 'yentech-letter-head';
    link.download = `${safeName}-page-1.png`;
    link.href = dataUrl1;
    link.click();

    if (page2) {
      const dataUrl2 = await toPng(page2, {
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
      const link2 = document.createElement('a');
      link2.download = `${safeName}-page-2.png`;
      link2.href = dataUrl2;
      link2.click();
    }

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
          spacing: { after: 200 },
          children: [
            new TextRun({ text: letterData.subject, bold: true, size: 24, font: 'Calibri' }),
          ],
        })
      );
    }

    const paragraphs = letterData.bodyParagraphs || [];
    const tablePos =
      typeof letterData.tablePosition === 'number'
        ? Math.max(0, Math.min(letterData.tablePosition, paragraphs.length))
        : 1;

    const createTableDoc = () => {
      if (!letterData.keyDetailsTable || !letterData.keyDetailsTable.headers.length) return null;
      const tableHeaders = new TableRow({
        children: letterData.keyDetailsTable.headers.map(
          (header) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: header,
                      bold: true,
                      color: '179091',
                      size: 20,
                    }),
                  ],
                }),
              ],
            })
        ),
      });

      const tableRows = letterData.keyDetailsTable.rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: cell, size: 20 })],
                    }),
                  ],
                })
            ),
          })
      );

      return new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [tableHeaders, ...tableRows],
      });
    };

    const tableElement = createTableDoc();

    // If table is at position 0 (Top)
    if (tableElement && tablePos === 0) {
      docChildren.push(tableElement, new Paragraph({ spacing: { after: 180 } }));
    }

    // Paragraphs before table
    for (let i = 0; i < paragraphs.length; i++) {
      docChildren.push(
        new Paragraph({
          spacing: { after: 180, line: 280 },
          alignment: AlignmentType.LEFT,
          children: [new TextRun({ text: paragraphs[i], size: 22, font: 'Calibri' })],
        })
      );

      // Insert table if this matches tablePos
      if (tableElement && i + 1 === tablePos) {
        docChildren.push(tableElement, new Paragraph({ spacing: { after: 180 } }));
      }
    }

    // If table is after all paragraphs
    if (tableElement && tablePos >= paragraphs.length && paragraphs.length === 0) {
      docChildren.push(tableElement, new Paragraph({ spacing: { after: 180 } }));
    }

    // Page 2 Paragraphs (if multi-page)
    if (letterData.pageCount === 2 && letterData.page2Paragraphs && letterData.page2Paragraphs.length > 0) {
      docChildren.push(
        new Paragraph({
          pageBreakBefore: true,
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: `${org.name} - Continuation Sheet (Page 2)`,
              bold: true,
              size: 18,
              color: '179091',
            }),
          ],
        })
      );

      for (const p2 of letterData.page2Paragraphs) {
        docChildren.push(
          new Paragraph({
            spacing: { after: 180, line: 280 },
            alignment: AlignmentType.LEFT,
            children: [new TextRun({ text: p2, size: 22, font: 'Calibri' })],
          })
        );
      }
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
