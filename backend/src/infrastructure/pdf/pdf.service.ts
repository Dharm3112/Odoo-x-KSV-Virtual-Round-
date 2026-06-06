import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Render an HTML string to a PDF buffer.
   * Uses Puppeteer headless Chromium for high-fidelity rendering.
   */
  async generatePdfFromHtml(html: string): Promise<Buffer> {
    let browser: Browser | null = null;

    try {
      const executablePath = this.configService.get<string>('PUPPETEER_EXECUTABLE_PATH') || undefined;

      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        ...(executablePath ? { executablePath } : {}),
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '15mm',
          right: '15mm',
        },
      });

      this.logger.log('PDF generated successfully');
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`PDF generation failed: ${(error as Error).message}`);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
