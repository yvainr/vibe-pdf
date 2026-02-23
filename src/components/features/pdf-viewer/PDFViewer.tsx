"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { NavigationBar } from "./NavigationBar";
import { ControlBar } from "./ControlBar";
import { Sidebar } from "./Sidebar";
import { ThumbnailsList } from "./ThumbnailsList";
import { Check, Plus } from "lucide-react";
import { usePdfDocument } from "./hooks/usePdfDocument";
import { PdfCanvasPage } from "./components/PdfCanvasPage";
import { capturePageScreenshot, extractTextFromPage } from "./utils/pdfUtils";

interface FileState {
    file: File;
    numPages: number;
    pageNumber: number;
    selectedPages: Set<number>;
}

interface PDFViewerProps { }

/**
 * Multi-document PDF viewer with direct PDF.js integration
 * Optimized for low memory usage with strict resource cleanup
 */
export const PDFViewer: React.FC<PDFViewerProps> = () => {
    const [files, setFiles] = useState<FileState[]>([]);
    const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [sidebarContent, setSidebarContent] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
    const [scale, setScale] = useState<number>(1.4);
    const [language, setLanguage] = useState<string>("English");
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lastKeyPressRef = useRef<{ key: string; time: number } | null>(null);

    // Get current file state
    const currentFileState = files[activeFileIndex];
    const file = currentFileState?.file || null;
    const numPages = currentFileState?.numPages || 0;
    const pageNumber = currentFileState?.pageNumber || 1;
    const selectedPages = currentFileState?.selectedPages || new Set<number>();

    // Load PDF document for active file only (memory optimization)
    const { document: pdfDocument, isLoading: docLoading, error: docError } = usePdfDocument(file);

    // Update numPages when document loads
    useEffect(() => {
        if (pdfDocument && activeFileIndex >= 0 && files[activeFileIndex]) {
            setFiles(prev => {
                const newFiles = [...prev];
                if (newFiles[activeFileIndex] && newFiles[activeFileIndex].numPages === 0) {
                    newFiles[activeFileIndex] = {
                        ...newFiles[activeFileIndex],
                        numPages: pdfDocument.numPages
                    };
                }
                return newFiles;
            });
        }
    }, [pdfDocument, activeFileIndex]);

    // File management
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === "application/pdf") {
            const newFileState: FileState = {
                file: selectedFile,
                numPages: 0,
                pageNumber: 1,
                selectedPages: new Set()
            };
            
            setFiles(prev => {
                const newFiles = [...prev, newFileState];
                setActiveFileIndex(newFiles.length - 1);
                return newFiles;
            });
        }
    }, []);

    const handleAddFile = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
        }
    }, []);

    const handleRemoveFile = useCallback((index: number) => {
        setFiles(prev => {
            const newFiles = prev.filter((_, i) => i !== index);
            if (newFiles.length === 0) {
                setActiveFileIndex(0);
            } else if (activeFileIndex >= newFiles.length) {
                setActiveFileIndex(newFiles.length - 1);
            } else if (index < activeFileIndex) {
                setActiveFileIndex(activeFileIndex - 1);
            }
            return newFiles;
        });
    }, [activeFileIndex]);

    const handleFileSelect = useCallback((index: number) => {
        if (index >= 0 && index < files.length && index !== activeFileIndex) {
            setActiveFileIndex(index);
            setShowThumbnails(false);
        }
    }, [files, activeFileIndex]);

    // Page navigation
    const goToPreviousPage = useCallback(() => {
        setFiles(prev => {
            const newFiles = [...prev];
            if (newFiles[activeFileIndex]) {
                const currentPage = newFiles[activeFileIndex].pageNumber;
                const newPage = Math.max(1, currentPage - 1);
                newFiles[activeFileIndex] = {
                    ...newFiles[activeFileIndex],
                    pageNumber: newPage
                };
            }
            return newFiles;
        });
    }, [activeFileIndex]);

    const goToNextPage = useCallback(() => {
        setFiles(prev => {
            const newFiles = [...prev];
            if (newFiles[activeFileIndex]) {
                const currentPage = newFiles[activeFileIndex].pageNumber;
                const maxPages = newFiles[activeFileIndex].numPages;
                if (currentPage < maxPages) {
                    const newPage = currentPage + 1;
                    newFiles[activeFileIndex] = {
                        ...newFiles[activeFileIndex],
                        pageNumber: newPage
                    };
                }
            }
            return newFiles;
        });
    }, [activeFileIndex]);

    const goToPage = useCallback((page: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            if (newFiles[activeFileIndex]) {
                const clampedPage = Math.max(1, Math.min(page, newFiles[activeFileIndex].numPages));
                newFiles[activeFileIndex] = {
                    ...newFiles[activeFileIndex],
                    pageNumber: clampedPage
                };
            }
            return newFiles;
        });
    }, [activeFileIndex]);

    const togglePageSelection = useCallback((page: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            if (newFiles[activeFileIndex]) {
                const newSet = new Set(newFiles[activeFileIndex].selectedPages);
                if (newSet.has(page)) {
                    newSet.delete(page);
                } else {
                    newSet.add(page);
                }
                newFiles[activeFileIndex] = {
                    ...newFiles[activeFileIndex],
                    selectedPages: newSet
                };
            }
            return newFiles;
        });
    }, [activeFileIndex]);

    // Zoom controls
    const handleZoomIn = useCallback(() => {
        setScale(prev => Math.min(3.0, prev + 0.1));
    }, []);

    const handleZoomOut = useCallback(() => {
        setScale(prev => Math.max(0.5, prev - 0.1));
    }, []);

    const zoomLevel = useMemo(() => scale, [scale]);

    // AI Explanation handler (defined before handleKeyDown to avoid initialization error)
    const handleExplain = useCallback(async () => {
        if (!pdfDocument || !currentFileState) return;

        setIsLoading(true);
        setIsSidebarOpen(true);

        try {
            // Determine pages to explain
            let pagesToExplain: number[];
            if (selectedPages.size === 0) {
                setFiles(prev => {
                    const newFiles = [...prev];
                    if (newFiles[activeFileIndex]) {
                        newFiles[activeFileIndex] = {
                            ...newFiles[activeFileIndex],
                            selectedPages: new Set([pageNumber])
                        };
                    }
                    return newFiles;
                });
                pagesToExplain = [pageNumber];
            } else {
                pagesToExplain = Array.from(selectedPages);
            }

            const screenshots: string[] = [];
            const texts: string[] = [];

            // Capture screenshots
            for (const pageNum of pagesToExplain) {
                const screenshot = await capturePageScreenshot(pdfDocument, pageNum);
                if (screenshot) {
                    screenshots.push(screenshot);
                }
            }

            // Extract text from previous pages
            const startPage = Math.max(1, pageNumber - 10);
            for (let i = startPage; i < pageNumber; i++) {
                const text = await extractTextFromPage(pdfDocument, i);
                if (text) {
                    texts.push(`Page ${i}:\n${text}`);
                }
            }

            // Prepare prompt
            const languageNames: Record<string, string> = {
                "English": "English",
                "German": "German",
                "Russian": "Russian"
            };
            
            const prompt = `You are an AI assistant helping a student understand a PDF document. 

                            Context from previous pages:
                            ${texts.join("\n\n")}

                            The student is viewing page(s) ${pagesToExplain.join(", ")}. Please provide a detailed explanation of the content on these page(s), including:
                            1. Key concepts and ideas
                            2. Important details and context
                            3. How it relates to the previous pages
                            4. Any questions the student might have

                            IMPORTANT: Please respond in ${languageNames[language] || "English"}. Be clear, concise, and educational.`;

            // Call API
            const response = await fetch("/api/explain", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt,
                    screenshots,
                    pageNumbers: pagesToExplain,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get explanation");
            }

            const data = await response.json();
            setSidebarContent(data.explanation || "No explanation available.");

            // Deselect pages after explaining
            setFiles(prev => {
                const newFiles = [...prev];
                if (newFiles[activeFileIndex]) {
                    newFiles[activeFileIndex] = {
                        ...newFiles[activeFileIndex],
                        selectedPages: new Set()
                    };
                }
                return newFiles;
            });
        } catch (error) {
            console.error("Error explaining:", error);
            setSidebarContent("Error generating explanation. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [pdfDocument, selectedPages, pageNumber, currentFileState, activeFileIndex, language]);

    // Keyboard navigation with double-click detection
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (
                target?.tagName === "INPUT" ||
                target?.tagName === "TEXTAREA" ||
                target?.isContentEditable
            ) {
                return;
            }

            // Double-click detection (300ms threshold)
            const now = Date.now();
            const lastPress = lastKeyPressRef.current;
            const isDoubleClick = lastPress && 
                                 lastPress.key === e.key && 
                                 (now - lastPress.time) < 300;

            if (e.key === "ArrowLeft") {
                e.preventDefault();
                goToPreviousPage();
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                goToNextPage();
            } else if (e.key === " ") {
                e.preventDefault();
                togglePageSelection(pageNumber);
            } else if (e.key.toLowerCase() === "o" && isDoubleClick) {
                // Double-click O to add new file
                e.preventDefault();
                handleAddFile();
                lastKeyPressRef.current = null; // Reset after action
                return;
            } else if (e.key.toLowerCase() === "e" && isDoubleClick) {
                // Double-click E to trigger explain
                e.preventDefault();
                handleExplain();
                lastKeyPressRef.current = null; // Reset after action
                return;
            }

            // Track key press for double-click detection
            if (e.key.toLowerCase() === "o" || e.key.toLowerCase() === "e") {
                lastKeyPressRef.current = { key: e.key.toLowerCase(), time: now };
            }
        },
        [goToPreviousPage, goToNextPage, pageNumber, togglePageSelection, handleAddFile, handleExplain]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown, true);
        return () => window.removeEventListener("keydown", handleKeyDown, true);
    }, [handleKeyDown]);

    // Empty state
    if (files.length === 0 || !file) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-start pt-20">
                <h1 className="mb-16 text-6xl font-normal text-white/90">
                    <span className="font-[family-name:var(--font-ballet)] text-[hotpink]">Vibe</span> PDF
                </h1>
                <label className="relative cursor-pointer">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div className="liquid-glass relative flex h-96 w-96 items-center justify-center flex-col rounded-2xl 
                    border-1 border-dashed border-white/20 transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:scale-105">
                        <Plus className="relative h-32 w-32 text-white/5" strokeWidth={1} />
                        <div className="relative z-10 flex flex-col items-center gap-3">
                            <span className="text-sm font-medium text-white/60">
                                Click to open PDF file
                            </span>
                            <span className="text-xs text-white/40">
                                or drag and drop your PDF here
                            </span>
                        </div>
                    </div>
                </label>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative flex h-full w-full flex-col transition-all duration-300"
        >
            <NavigationBar
                files={files}
                activeFileIndex={activeFileIndex}
                selectedPages={selectedPages}
                numPages={numPages}
                pageNumber={pageNumber}
                showThumbnails={showThumbnails}
                onToggleThumbnails={() => setShowThumbnails(!showThumbnails)}
                onThumbnailClick={goToPage}
                onOpenExplainBar={() => setIsSidebarOpen(true)}
                language={language}
                onLanguageChange={setLanguage}
                onFileSelect={handleFileSelect}
                onAddFile={handleAddFile}
                onRemoveFile={handleRemoveFile}
            />

            <ThumbnailsList
                selectedPages={selectedPages}
                numPages={numPages}
                file={file}
                showThumbnails={showThumbnails}
                onThumbnailClick={goToPage}
                onToggleSelection={togglePageSelection}
                pdfDocument={pdfDocument}
            />

            <div
                className="relative flex flex-1 items-center justify-center overflow-y-auto pt-4 pb-20 min-h-0 transition-all duration-300"
                style={{
                    marginRight: isSidebarOpen ? "280px" : "0",
                }}
            >
                <div className="relative flex flex-col items-center gap-4 py-4">
                    {docLoading && (
                        <div className="flex flex-col items-center justify-center p-16 gap-6 animate-fade-in">
                            <div className="relative">
                                <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-white/60" />
                                <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-white/20 opacity-20" />
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-base font-medium text-white/80">Loading PDF...</div>
                                <div className="text-xs text-white/50">Please wait while we prepare your document</div>
                            </div>
                        </div>
                    )}

                    {docError && (
                        <div className="flex items-center justify-center p-8 animate-fade-in">
                            <div className="flex flex-col items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-6">
                                <div className="text-base font-medium text-red-400">Error loading PDF</div>
                                <div className="text-sm text-red-300/80">{docError}</div>
                            </div>
                        </div>
                    )}

                    {pdfDocument && !docLoading && (
                        <div className="relative animate-fade-in">
                            {/* Render current page only for memory efficiency */}
                            <PdfCanvasPage
                                document={pdfDocument}
                                pageNumber={pageNumber}
                                scale={scale}
                                className="rounded-lg"
                            />
                            
                            {/* Page selection button */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    togglePageSelection(pageNumber);
                                }}
                                className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all cursor-pointer ${
                                    selectedPages.has(pageNumber)
                                        ? "bg-blue-500 text-white"
                                        : "liquid-glass text-white/80 hover:bg-white/10"
                                }`}
                                aria-label={selectedPages.has(pageNumber) ? "Deselect page" : "Select page"}
                            >
                                <Check className={`h-5 w-5 ${!selectedPages.has(pageNumber) ? 'opacity-50' : ''}`} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ControlBar
                pageNumber={pageNumber}
                numPages={numPages}
                onPrevious={goToPreviousPage}
                onNext={goToNextPage}
                onExplain={handleExplain}
                isLoading={isLoading}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                zoomLevel={zoomLevel}
            />

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                content={sidebarContent}
                isLoading={isLoading}
            />

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};
