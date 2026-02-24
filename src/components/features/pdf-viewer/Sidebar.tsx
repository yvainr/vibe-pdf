"use client";

import { X, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

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

  // Process math formulas and markdown
  const processContent = (text: string): string => {
    if (!text) return "No explanation available.";

    // Store math expressions temporarily with placeholders
    const mathExpressions: string[] = [];
    let processedText = text;

    // Process display math: $$...$$ or \[...\]
    processedText = processedText.replace(/\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g, (match, p1, p2) => {
      const mathContent = p1 || p2;
      try {
        const rendered = katex.renderToString(mathContent, {
          displayMode: true,
          throwOnError: false,
          output: 'html'
        });
        const placeholder = `__MATH_BLOCK_${mathExpressions.length}__`;
        mathExpressions.push(`<div class="my-4 overflow-x-auto">${rendered}</div>`);
        return placeholder;
      } catch (e) {
        return match;
      }
    });

    // Process inline math: \(...\)
    processedText = processedText.replace(/\\\((.*?)\\\)/g, (match, mathContent) => {
      try {
        const rendered = katex.renderToString(mathContent, {
          displayMode: false,
          throwOnError: false,
          output: 'html'
        });
        const placeholder = `__MATH_INLINE_${mathExpressions.length}__`;
        mathExpressions.push(`<span class="inline-block mx-0.5">${rendered}</span>`);
        return placeholder;
      } catch (e) {
        return match;
      }
    });

    // Apply markdown transformations
    let html = processedText
      .replace(/\r\n/g, '\n')

      // Headers
      .replace(/^### (.*)$/gm, '<h3 class="text-lg font-bold mt-8 mb-3 text-white border-l-2 border-gray-400 pl-2 py-1">$1</h3>')
      .replace(/^## (.*)$/gm, '<h2 class="text-xl font-bold mt-8 mb-4 text-white border-b border-white/20 pb-2">$1</h2>')
      .replace(/^# (.*)$/gm, '<h1 class="text-2xl font-bold mt-10 mb-5 text-white">$1</h1>')

      // Inline formatting
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')

      // Convert markdown list lines "- item" into <li>...</li>
      .replace(/^\s*-\s+(.*)$/gm, '<li class="ml-6 mb-2 list-disc">$1</li>')

      // Group consecutive <li> into one <ul>
      .replace(/(?:<li class="ml-6 mb-2 list-disc">.*?<\/li>\n?)+/g, (match) => {
        return `<ul class="mb-4">${match}</ul>`;
      })

      // Paragraphs (double line breaks)
      .replace(/\n\n+/g, '</p><p class="mb-4">')

    // Wrap whole content
    html = `<p class="mb-4">${html}</p>`;

    // Clean invalid <p> around block tags (important)
    html = html
      .replace(/<p class="mb-4">\s*(<h[1-3][^>]*>)/g, '$1')
      .replace(/(<\/h[1-3]>)\s*<\/p>/g, '$1')
      .replace(/<p class="mb-4">\s*(<ul[^>]*>)/g, '$1')
      .replace(/(<\/ul>)\s*<\/p>/g, '$1');

    // Restore math expressions
    mathExpressions.forEach((mathHtml, index) => {
      html = html.replace(`__MATH_BLOCK_${index}__`, mathHtml);
      html = html.replace(`__MATH_INLINE_${index}__`, mathHtml);
    });

    return html;
  };

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
                  __html: processContent(content)
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
