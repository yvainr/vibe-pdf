import * as pdfjsLib from 'pdfjs-dist';

/**
 * Utility functions for PDF operations
 */

/**
 * Capture a page screenshot as base64 PNG
 */
export async function capturePageScreenshot(
  pdfDocument: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number = 2.0
): Promise<string> {
  try {
    const page = await pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    
    const canvas = window.document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return '';
  }
}

/**
 * Extract text content from a page
 */
export async function extractTextFromPage(
  pdfDocument: pdfjsLib.PDFDocumentProxy,
  pageNumber: number
): Promise<string> {
  try {
    const page = await pdfDocument.getPage(pageNumber);
    const textContent = await page.getTextContent();
    return textContent.items
      .map((item: any) => item.str)
      .join(' ');
  } catch (error) {
    console.error('Error extracting text:', error);
    return '';
  }
}

/**
 * Get page viewport dimensions
 */
export async function getPageDimensions(
  pdfDocument: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number = 1.0
): Promise<{ width: number; height: number }> {
  try {
    const page = await pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    return {
      width: viewport.width,
      height: viewport.height,
    };
  } catch (error) {
    console.error('Error getting page dimensions:', error);
    return { width: 0, height: 0 };
  }
}
