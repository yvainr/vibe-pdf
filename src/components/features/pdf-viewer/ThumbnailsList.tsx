"use client";

import { Check } from "lucide-react";
import { useState, useCallback } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { PdfCanvasPage } from "./components/PdfCanvasPage";

interface ThumbnailsListProps {
  selectedPages: Set<number>;
  numPages: number;
  file: File | null;
  showThumbnails: boolean;
  onThumbnailClick: (page: number) => void;
  onToggleSelection: (page: number) => void;
  pdfDocument: pdfjsLib.PDFDocumentProxy | null;
}

export const ThumbnailsList: React.FC<ThumbnailsListProps> = ({
  selectedPages,
  numPages,
  file,
  showThumbnails,
  onThumbnailClick,
  onToggleSelection,
  pdfDocument,
}) => {
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());

  const handlePageLoad = useCallback((pageNum: number) => {
    setLoadedPages((prev) => new Set(prev).add(pageNum));
  }, []);

  if (!file || !pdfDocument) return null;

  return (
    <div
      className="absolute top-20 left-4 right-4 z-20 overflow-hidden transition-all duration-300 ease-out pointer-events-none"
      style={{
        maxHeight: showThumbnails ? "200px" : "0",
        opacity: showThumbnails ? 1 : 0,
        pointerEvents: showThumbnails ? "auto" : "none",
      }}
    >
      <div className="liquid-glass-strong flex gap-3 overflow-x-auto p-4 rounded-2xl bg-black/40" style={{ maxHeight: "200px" }}>
        {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
          const isSelected = selectedPages.has(pageNum);
          const isLoaded = loadedPages.has(pageNum);

          return (
            <div
              key={pageNum}
              className="relative flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                onThumbnailClick(pageNum);
              }}
            >
              <div
                className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-blue-400 shadow-lg shadow-blue-400/20"
                    : "border-white/20 hover:border-white/40"
                }`}
                style={{ width: "120px" }}
              >
                {/* Render thumbnail using canvas */}
                <div style={{ width: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PdfCanvasPage
                    document={pdfDocument}
                    pageNumber={pageNum}
                    scale={0.2}
                    className="w-full h-auto"
                    onPageRendered={() => handlePageLoad(pageNum)}
                  />
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}

                {/* Page number */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-center text-xs text-white">
                  {pageNum}
                </div>

                {/* Toggle selection button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelection(pageNum);
                  }}
                  className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-black/70 text-white/80 hover:bg-black/80"
                  }`}
                >
                  <Check className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
