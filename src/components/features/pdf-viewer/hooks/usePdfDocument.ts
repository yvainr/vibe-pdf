import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface PdfDocumentState {
  document: pdfjsLib.PDFDocumentProxy | null;
  numPages: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for loading and managing PDF documents with strict cleanup
 * 
 * @param source - File object or URL string
 * @returns Document state and loading status
 */
export function usePdfDocument(source: File | string | null): PdfDocumentState {
  const [state, setState] = useState<PdfDocumentState>({
    document: null,
    numPages: 0,
    isLoading: false,
    error: null,
  });

  const loadingTaskRef = useRef<pdfjsLib.PDFDocumentLoadingTask | null>(null);
  const currentSourceRef = useRef<File | string | null>(null);

  useEffect(() => {
    // No source provided
    if (!source) {
      setState({
        document: null,
        numPages: 0,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Cleanup previous document
    const cleanup = async () => {
      if (loadingTaskRef.current) {
        try {
          await loadingTaskRef.current.destroy();
        } catch (err) {
          console.warn('Error destroying loading task:', err);
        }
        loadingTaskRef.current = null;
      }

      if (state.document) {
        try {
          await state.document.destroy();
        } catch (err) {
          console.warn('Error destroying document:', err);
        }
      }
    };

    let isCancelled = false;

    const loadDocument = async () => {
      await cleanup();

      if (isCancelled) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        let documentInitParams: any;

        if (typeof source === 'string') {
          // URL source
          documentInitParams = { url: source };
        } else {
          // File source - convert to ArrayBuffer
          const arrayBuffer = await source.arrayBuffer();
          documentInitParams = { data: arrayBuffer };
        }

        const loadingTask = pdfjsLib.getDocument(documentInitParams);
        loadingTaskRef.current = loadingTask;

        const pdfDocument = await loadingTask.promise;

        if (isCancelled) {
          // If cancelled during loading, destroy immediately
          await pdfDocument.destroy();
          return;
        }

        setState({
          document: pdfDocument,
          numPages: pdfDocument.numPages,
          isLoading: false,
          error: null,
        });

        currentSourceRef.current = source;
      } catch (err) {
        if (!isCancelled) {
          console.error('Error loading PDF:', err);
          setState({
            document: null,
            numPages: 0,
            isLoading: false,
            error: err instanceof Error ? err.message : 'Failed to load PDF',
          });
        }
      }
    };

    loadDocument();

    // Cleanup on unmount or source change
    return () => {
      isCancelled = true;
      cleanup();
    };
  }, [source]);

  return state;
}
