import { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { usePdfRender } from '../hooks/usePdfRender';

interface PdfCanvasPageProps {
  document: pdfjsLib.PDFDocumentProxy | null;
  pageNumber: number;
  scale: number;
  className?: string;
  onPageRendered?: () => void;
}

/**
 * Canvas-based PDF page renderer component
 * Renders a single PDF page to a canvas element with automatic cleanup
 */
export const PdfCanvasPage: React.FC<PdfCanvasPageProps> = ({
  document,
  pageNumber,
  scale,
  className = '',
  onPageRendered,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [isRendered, setIsRendered] = useState(false);

  // Use custom render hook for render task management
  usePdfRender(canvasRef, document, pageNumber, scale, () => {
    setIsRendering(false);
    setIsRendered(true);
    if (onPageRendered) {
      onPageRendered();
    }
  });

  // Reset rendering state when page or scale changes
  useEffect(() => {
    setIsRendering(true);
    setIsRendered(false);
  }, [pageNumber, scale]);

  if (!document) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-sm text-white/60">No document loaded</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white/80" />
            <div className="text-xs text-white/60">Rendering...</div>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`shadow-2xl transition-opacity duration-300 ${className} ${
          isRendered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </div>
  );
};
