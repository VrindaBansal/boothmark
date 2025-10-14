import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use local copy from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface PDFExtractionResult {
  text: string;
  images: string[]; // Base64 data URLs
  numPages: number;
}

/**
 * Extract text and images from a PDF file
 */
export async function extractFromPDF(
  file: File,
  onProgress?: (progress: number) => void
): Promise<PDFExtractionResult> {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const numPages = pdf.numPages;
    const allText: string[] = [];
    const allImages: string[] = [];

    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (onProgress) {
        onProgress(Math.round((pageNum / numPages) * 100));
      }

      const page = await pdf.getPage(pageNum);

      // Extract text
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      allText.push(pageText);

      // Extract images by rendering page to canvas
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvas: canvas,
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        allImages.push(imageDataUrl);
      }
    }

    return {
      text: allText.join('\n\n'),
      images: allImages,
      numPages: numPages,
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract data from PDF: ' + (error as Error).message);
  }
}

/**
 * Check if a file is a PDF
 */
export function isPDF(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}
