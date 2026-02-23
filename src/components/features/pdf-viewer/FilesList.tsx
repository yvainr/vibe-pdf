"use client";

import { Plus, FileText, X } from "lucide-react";
import { useRef } from "react";

interface FilesListProps {
  files: File[];
  activeFileIndex: number;
  onFileSelect: (index: number) => void;
  onAddFile: () => void;
  onRemoveFile: (index: number) => void;
}

export const FilesList: React.FC<FilesListProps> = ({
  files,
  activeFileIndex,
  onFileSelect,
  onAddFile,
  onRemoveFile,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {files.map((file, index) => (
        <div
          key={index}
          className={`liquid-glass flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer group ${
            activeFileIndex === index
              ? "bg-white/10 border border-white/20"
              : "bg-black/60 hover:bg-black/80"
          }`}
          onClick={() => onFileSelect(index)}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileText className="h-3.5 w-3.5 text-white/60 flex-shrink-0" />
            <span
              className={`text-xs truncate ${
                activeFileIndex === index ? "text-white/90 font-medium" : "text-white/60"
              }`}
              title={file.name}
            >
              {file.name}
            </span>
          </div>
          {files.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFile(index);
              }}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
              aria-label="Remove file"
            >
              <X className="h-3 w-3 text-white/60 hover:text-white/80" />
            </button>
          )}
        </div>
      ))}
      
      <button
        onClick={onAddFile}
        className="liquid-glass flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-black/60 hover:bg-black/80 transition-all group"
      >
        <Plus className="h-3.5 w-3.5 text-white/60 group-hover:text-white/80" />
        <span className="text-xs text-white/60 group-hover:text-white/80">Add PDF</span>
      </button>
    </div>
  );
};
