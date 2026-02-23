"use client";

import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { FilesList } from "./FilesList";

interface FileState {
  file: File;
  numPages: number;
  pageNumber: number;
  selectedPages: Set<number>;
}

interface NavigationBarProps {
  files: FileState[];
  activeFileIndex: number;
  selectedPages: Set<number>;
  numPages: number;
  pageNumber: number;
  showThumbnails: boolean;
  onToggleThumbnails: () => void;
  onThumbnailClick: (page: number) => void;
  onOpenExplainBar: () => void;
  language: string;
  onLanguageChange: (language: string) => void;
  onFileSelect: (index: number) => void;
  onAddFile: () => void;
  onRemoveFile: (index: number) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  files,
  activeFileIndex,
  selectedPages,
  numPages,
  pageNumber,
  showThumbnails,
  onToggleThumbnails,
  onThumbnailClick,
  onOpenExplainBar,
  language,
  onLanguageChange,
  onFileSelect,
  onAddFile,
  onRemoveFile,
}) => {
  const selectedPagesArray = Array.from(selectedPages).sort((a, b) => a - b);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState<boolean>(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const currentFile = files[activeFileIndex]?.file;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };

    if (isLanguageDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLanguageDropdownOpen]);

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between gap-3 pointer-events-none">
      <div className="flex flex-col items-start gap-3 pointer-events-auto max-w-[200px]">
        {files.length > 0 && (
          <FilesList
            files={files.map(f => f.file)}
            activeFileIndex={activeFileIndex}
            onFileSelect={onFileSelect}
            onAddFile={onAddFile}
            onRemoveFile={onRemoveFile}
          />
        )}
        {selectedPagesArray.length > 0 && (
          <div className="liquid-glass flex items-center gap-2 px-4 py-2 rounded-full bg-black/90">
            <span className="text-xs text-white/60">
              {selectedPagesArray.length} page{selectedPagesArray.length > 1 ? "s" : ""} selected
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="liquid-glass flex items-center justify-center rounded-full px-4 py-2 bg-black/90">
            <span className="text-xs text-white/60">
              {pageNumber} / {numPages}
            </span>
          </div>
          <button
            onClick={onToggleThumbnails}
            className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-all hover:bg-black/80 bg-black/90"
          >
            <span>Pages</span>
            {showThumbnails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
        <button
          onClick={onOpenExplainBar}
          className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white/80 transition-all hover:bg-black/80 bg-black/90"
        >
          <span>Open Explain</span>
        </button>
        
        {/* Language selector */}
        <div className="relative" ref={languageDropdownRef}>
          <button
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white/80 transition-all hover:bg-black/80 bg-black/90"
          >
            <span>{language}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${isLanguageDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          
          {isLanguageDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 liquid-glass rounded-lg bg-black/90 overflow-hidden min-w-[120px] z-30">
              {["English", "German", "Russian"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    onLanguageChange(lang);
                    setIsLanguageDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-xs text-left transition-all hover:bg-white/10 ${
                    language === lang ? "bg-white/10 text-white/90" : "text-white/60"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
