import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

/**
 * Custom hook for rendering PDF page to canvas with strict render task cleanup
 * 
 * @param canvasRef - Reference to the canvas element
 * @param pdfDocument - PDF document proxy
 * @param pageNumber - Page number to render (1-indexed)
 * @param scale - Render scale/zoom level
 * @param onRenderComplete - Callback when render completes successfully
 */
export function usePdfRender(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  pdfDocument: pdfjsLib.PDFDocumentProxy | null,
  pageNumber: number,
  scale: number,
  onRenderComplete?: () => void
): void {
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !pdfDocument || pageNumber < 1 || pageNumber > pdfDocument.numPages) {
      // Call completion if invalid to clear loading state
      if (onRenderComplete) {
        onRenderComplete();
      }
      return;
    }

    let isCancelled = false;
    let renderInProgress = false;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Failed to get canvas 2D context');
      if (onRenderComplete) {
        onRenderComplete();
      }
      return;
    }

    const render = async () => {
      // Prevent duplicate renders
      if (renderInProgress) {
        return;
      }
      
      renderInProgress = true;

      // Cancel previous render task if it exists
      if (renderTaskRef.current) {
        try {
          await renderTaskRef.current.cancel();
        } catch (err) {
          // Cancellation errors are expected
        }
        renderTaskRef.current = null;
      }

      try {
        const page = await pdfDocument.getPage(pageNumber);

        if (isCancelled) {
          renderInProgress = false;
          return;
        }

        const viewport = page.getViewport({ scale });

        // Set canvas dimensions
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;

        if (isCancelled) {
          renderInProgress = false;
          return;
        }

        // Successfully rendered - notify completion
        renderInProgress = false;
        if (onRenderComplete) {
          onRenderComplete();
        }
      } catch (err: any) {
        renderInProgress = false;
        if (err?.name === 'RenderingCancelledException' || isCancelled) {
          // Expected when cancelling or switching pages quickly
          return;
        }
        console.error('Error rendering PDF page:', err);
        // Still call completion on error to remove loader
        if (onRenderComplete && !isCancelled) {
          onRenderComplete();
        }
      }
    };

    render();

    // Cleanup function
    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (err) {
          // Ignore cancellation errors
        }
        renderTaskRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, pdfDocument, pageNumber, scale]); // Intentionally excluding onRenderComplete to prevent re-renders
}
