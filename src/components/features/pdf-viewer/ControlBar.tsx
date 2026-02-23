"use client";

import { ChevronLeft, ChevronRight, Sparkles, Plus, Minus } from "lucide-react";

interface ControlBarProps {
    pageNumber: number;
    numPages: number;
    onPrevious: () => void;
    onNext: () => void;
    onExplain: () => void;
    isLoading: boolean;
    onZoomIn: () => void;
    onZoomOut: () => void;
    zoomLevel: number;
}

export const ControlBar: React.FC<ControlBarProps> = ({
    pageNumber,
    numPages,
    onPrevious,
    onNext,
    onExplain,
    isLoading,
    onZoomIn,
    onZoomOut,
    zoomLevel,
}) => {
    return (
        <>


            {/* Main controls at bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-3 pointer-events-none flex-col">
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={onPrevious}
                        disabled={pageNumber <= 1}
                        className="liquid-glass flex h-12 w-12 items-center justify-center rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 active:scale-95 pointer-events-auto"
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="h-6 w-6 text-white/90" />
                    </button>

                    <button
                        onClick={onExplain}
                        disabled={isLoading}
                        className="liquid-glass flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white/90 transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 pointer-events-auto"
                        aria-label="Explain"
                    >
                        <Sparkles className="h-4 w-4" />
                        <span>{isLoading ? "Explaining..." : "Explain"}</span>
                    </button>

                    <button
                        onClick={onNext}
                        disabled={pageNumber >= numPages}
                        className="liquid-glass flex h-12 w-12 items-center justify-center rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 active:scale-95 pointer-events-auto"
                        aria-label="Next page"
                    >
                        <ChevronRight className="h-6 w-6 text-white/90" />
                    </button>
                </div>
                {/* Zoom controls on top */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onZoomOut}
                        disabled={zoomLevel <= 0.5}
                        className="liquid-glass flex h-7 w-7 items-center justify-center rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 active:scale-95 pointer-events-auto bg-black/90"
                        aria-label="Zoom out"
                    >
                        <Minus className="h-5 w-5 text-white/90" />
                    </button>
                    <div className="liquid-glass flex items-center justify-center rounded-full px-3 py-1.5 bg-black/90 pointer-events-auto">
                        <span className="text-xs text-white/60">
                            {Math.round(zoomLevel * 100)}%
                        </span>
                    </div>
                    <button
                        onClick={onZoomIn}
                        disabled={zoomLevel >= 2.0}
                        className="liquid-glass flex h-7 w-7 items-center justify-center rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 active:scale-95 pointer-events-auto bg-black/90"
                        aria-label="Zoom in"
                    >
                        <Plus className="h-5 w-5 text-white/90" />
                    </button>
                </div>
            </div>
        </>
    );
};
