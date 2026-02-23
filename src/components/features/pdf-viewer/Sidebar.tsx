"use client";

import { X, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  isLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  content,
  isLoading,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-lg transform overflow-y-auto transition-transform duration-300 ease-out md:w-96 p-4"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
        onWheel={(e) => {
          // Prevent scroll from propagating to main page
          e.stopPropagation();
        }}
      >
        <div className="sticky top-4 z-10 liquid-glass rounded-2xl mb-6">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-lg font-semibold text-white/90">Explanation</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-white/10 active:scale-95"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-white/80" />
            </button>
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-white/60" />
              <p className="text-sm text-white/60">Generating explanation...</p>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none text-white/90">
              <div 
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: '<p class="mb-4">' + (content || "No explanation available.")
                    .replace(/\n\n+/g, '</p><p class="mb-4">')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                    .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
                    .replace(/^### (.*$)/gm, '</p><h3 class="text-lg font-bold mt-6 mb-3 text-white border-l-4 border-blue-400 pl-4 py-1">$1</h3><p class="mb-4">')
                    .replace(/^## (.*$)/gm, '</p><h2 class="text-xl font-bold mt-8 mb-4 text-white border-b border-white/20 pb-2">$1</h2><p class="mb-4">')
                    .replace(/^# (.*$)/gm, '</p><h1 class="text-2xl font-bold mt-10 mb-5 text-white">$1</h1><p class="mb-4">')
                    .replace(/^\d+\.\s+(.*$)/gm, '</p><ul class="list-decimal ml-6 mb-4"><li class="mb-2">$1</li></ul><p class="mb-4">')
                    .replace(/^-\s+(.*$)/gm, '</p><ul class="list-disc ml-6 mb-4"><li class="mb-2">$1</li></ul><p class="mb-4">')
                    + '</p>'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
