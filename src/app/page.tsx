"use client";

import { PDFViewer } from "@/components/features/pdf-viewer/PDFViewer";

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      <PDFViewer />
    </main>
  );
}
