import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { Project, Part, Checkup, CheckupStatus } from '@prisma/client';

interface ProjectData {
  project: Project & { user: { username: string }; powerplant: { name: string; location: string | null } };
  parts: Array<Part & { checkups: Array<Checkup & { checkupStatuses: CheckupStatus[] }> }>;
}

export class PdfService {
  async generateProjectPdf(projectData: ProjectData): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 20 * 28.35, bottom: 20 * 28.35, left: 20 * 28.35, right: 20 * 28.35 },
      });

      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      try {
        // Header
        doc.fontSize(20).text('Wind Power Plant Investigation Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12);
        doc.text(`Project ID: ${projectData.project.id}`);
        doc.text(`Powerplant: ${projectData.project.powerplant.name}`);
        if (projectData.project.powerplant.location) {
          doc.text(`Location: ${projectData.project.powerplant.location}`);
        }
        doc.text(`Created: ${projectData.project.createdAt.toISOString().split('T')[0]}`);
        if (projectData.project.finishedAt) {
          doc.text(`Finished: ${projectData.project.finishedAt.toISOString().split('T')[0]}`);
        }
        doc.text(`User: ${projectData.project.user.username}`);
        doc.moveDown(2);

        // Parts and Checkups
        for (const part of projectData.parts) {
          doc.fontSize(16).text(part.name, { underline: true });
          if (part.description) {
            doc.fontSize(10).text(part.description);
          }
          doc.moveDown();

          for (const checkup of part.checkups) {
            doc.fontSize(12).text(`  • ${checkup.name}`);
            if (checkup.description) {
              doc.fontSize(10).text(`    ${checkup.description}`);
            }

            const status = checkup.checkupStatuses[0]?.statusValue || 'Not Set';
            doc.fontSize(10).text(`    Status: ${status}`, { continued: false });

            if (checkup.documentationText) {
              doc.fontSize(9).text(`    Documentation: ${checkup.documentationText}`);
            }

            // Handle images - process all images first
            if (checkup.documentationImages && checkup.documentationImages.length > 0) {
              const processedImages = await Promise.all(
                checkup.documentationImages.map((imageBuffer: Buffer) => this.processImage(imageBuffer))
              );

              for (const processedImage of processedImages) {
                if (processedImage) {
                  doc.image(processedImage, {
                    fit: [500, 300],
                    align: 'center',
                  });
                  doc.moveDown();
                }
              }
            }

            doc.moveDown();
          }

          doc.moveDown();
        }

        // Summary
        doc.addPage();
        doc.fontSize(16).text('Summary', { underline: true });
        doc.moveDown();
        doc.fontSize(12);

        const totalParts = projectData.parts.length;
        const totalCheckups = projectData.parts.reduce((sum, part) => sum + part.checkups.length, 0);
        const checkupsWithStatus = projectData.parts.reduce(
          (sum, part) => sum + part.checkups.filter((c: Checkup & { checkupStatuses: CheckupStatus[] }) => c.checkupStatuses.length > 0).length,
          0
        );

        doc.text(`Total Parts: ${totalParts}`);
        doc.text(`Total Checkups: ${totalCheckups}`);
        doc.text(`Checkups with Status: ${checkupsWithStatus}`);
        doc.text(`Checkups without Status: ${totalCheckups - checkupsWithStatus}`);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async processImage(imageBuffer: Buffer): Promise<Buffer | null> {
    try {
      const processed = await sharp(imageBuffer)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      return processed;
    } catch (error) {
      console.error('Image processing failed:', error);
      return null;
    }
  }
}

export const pdfService = new PdfService();
