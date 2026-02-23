
<div align="center" style="font-size: 2rem">
    <i style="color: pink; font-family: cursive"> Vibe </i>
    PDF
</div>

<div align="center">

**A minimalistic, AI-native PDF reader built for students**

</div>

---


## About

Vibe PDF is a modern, memory-optimized PDF viewer designed for students who need to understand complex documents. With direct Mozilla PDF.js integration and AI-powered explanations, it provides an efficient and intelligent reading experience.

### Key Highlights

- **Memory Optimized**: Custom PDF.js integration with single-page rendering reduces memory usage from 1.5GB to ~100-200MB
- **AI-Powered**: Get instant explanations for selected pages using GPT-4
- **Student-Focused**: Clean interface designed for studying and comprehension
- **Keyboard-First**: Extensive keyboard shortcuts for efficient navigation

## Features

- **Efficient PDF Rendering** - Direct Mozilla PDF.js integration with optimized memory usage
- **Modern UI** - Dark theme with liquid glass effects and smooth animations
- **Keyboard Navigation** - Full keyboard support with double-tap shortcuts
- **Smart Zoom** - 140% initial scale with 10% increments (50%-300% range)
- **Page Selection** - Select multiple pages to build context for AI explanations
- **AI Explanations** - Context-aware explanations powered by OpenAI GPT-4
- **Thumbnail Navigation** - Visual page overview with quick navigation
- **Canvas-Based Rendering** - Hardware-accelerated rendering for smooth performance
- **Multi-File Support** - Open and switch between multiple PDFs

## Tech Stack

### Core Framework
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development

### PDF Processing
- **[Mozilla PDF.js](https://mozilla.github.io/pdf.js/)** (`pdfjs-dist`) - Direct PDF rendering engine
- **Custom React Hooks** - Optimized document loading and rendering lifecycle
- **Canvas API** - Hardware-accelerated page rendering
- **[html2canvas](https://html2canvas.hertzen.com/)** - Screenshot capture for AI context

### AI Integration
- **[OpenAI API](https://platform.openai.com/)** - GPT-4 powered explanations
- **Vision API** - Image-based document understanding

### UI/UX
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Lucide React](https://lucide.dev/)** - Icon system
- **Custom Animations** - Smooth transitions and loading states

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vibe-pdf.git
   cd vibe-pdf
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_api_key_here
   
   # Optional: Only needed for organization-level API keys
   # OPENAI_ORG_ID=your_organization_id_here
   # OPENAI_PROJECT_ID=your_project_id_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Usage

### Basic Workflow

1. **Open a PDF** - Click the upload area or press `O` twice
2. **Navigate** - Use arrow keys, scroll, or navigation buttons
3. **Select Pages** - Click checkboxes on pages you want explained
4. **Get Explanation** - Press `E` twice or click the "Explain" button
5. **View Results** - Read AI-generated explanations in the sidebar

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `↑` / `↓` | Navigate pages |
| `+` / `-` | Zoom in/out (10% steps) |
| `O` `O` | Double-tap to open new file |
| `E` `E` | Double-tap to submit explanation |
| `Scroll` | Navigate pages smoothly |

### Navigation Controls

- **Zoom Controls**: +/- buttons (10% increments, 50%-300% range)
- **Page Navigation**: Previous/Next buttons or arrow keys
- **Page Selector**: Direct page jump via dropdown
- **Thumbnails**: Visual page overview with click navigation
- **File Management**: Add/remove/switch between multiple PDFs

## Architecture

### PDF Optimization

The viewer uses a custom implementation with direct Mozilla PDF.js integration:

- **Single Page Rendering** - Only the current page is rendered to canvas
- **Render Task Management** - Proper cleanup of render tasks to prevent memory leaks
- **Document Lifecycle** - Documents are properly destroyed when inactive
- **No Text/Annotation Layers** - Simplified rendering reduces overhead
- **Canvas Reuse** - Efficient canvas management for thumbnails

**Memory Impact**: Reduced from 1.5GB (react-pdf) to ~100-200MB (direct PDF.js)

### Project Structure

```
vibe-pdf/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/explain/        # OpenAI API route
│   │   ├── layout.tsx          # Root layout with fonts
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   └── features/pdf-viewer/
│   │       ├── PDFViewer.tsx         # Main viewer orchestrator
│   │       ├── PdfCanvasPage.tsx     # Canvas page renderer
│   │       ├── ControlBar.tsx        # Zoom and file controls
│   │       ├── NavigationBar.tsx     # Page navigation
│   │       ├── ThumbnailsList.tsx    # Thumbnail strip
│   │       ├── Sidebar.tsx           # AI explanation display
│   │       ├── FilesList.tsx         # File management
│   │       └── hooks/
│   │           ├── usePdfDocument.ts # Document loading hook
│   │           └── usePdfRender.ts   # Canvas rendering hook
│   └── utils/
│       └── pdfUtils.ts               # Screenshot & text utilities
├── public/
│   └── pdf.worker.min.mjs            # PDF.js worker
└── ...config files
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- [Mozilla PDF.js](https://mozilla.github.io/pdf.js/) for the excellent PDF rendering engine
- [OpenAI](https://openai.com/) for GPT-4 and Vision API
- [Vercel](https://vercel.com/) for Next.js framework

---

<div align="center">

**Made with ❤️ for students**

</div>
