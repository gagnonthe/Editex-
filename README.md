# Editex — LaTeX-Powered Document Editor

Editex is a WYSIWYG (What You See Is What You Get) document editor that generates LaTeX in real-time behind the scenes — similar to Google Docs or Microsoft Word, but powered by LaTeX for professional typesetting.

![Editex Editor](docs/screenshot.png)

## Features

- ✍️ **WYSIWYG Editor** — Rich text editing with Slate.js (no LaTeX knowledge required)
- ⚡ **Real-time LaTeX generation** — Every formatting action maps to a LaTeX command instantly
- 📐 **Full formatting support** — Bold, italic, underline, strikethrough, headings (H1–H3), lists, quotes, code blocks
- ➗ **Math equations** — Insert block and inline equations using LaTeX math syntax (displayed with KaTeX preview)
- 📊 **Tables** — Visual table insertion with configurable rows and columns
- 📄 **PDF export** — Backend compiles LaTeX to PDF via `pdflatex` and streams the file to the browser
- 📥 **LaTeX source download** — Download the raw `.tex` file at any time
- 📋 **Copy LaTeX** — One-click copy of the generated LaTeX code
- 🎨 **Document settings** — Configure title, author, font size, and paper size
- �� **Responsive design** — Works on desktop, tablet, and mobile

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite |
| WYSIWYG editor | Slate.js + slate-react |
| Styling | Tailwind CSS v4 |
| Math rendering | KaTeX |
| Backend | Node.js + Express |
| PDF compilation | pdflatex (TeX Live / MiKTeX) |

## Project Structure

```
Editex-/
├── frontend/                  # React.js application
│   ├── src/
│   │   ├── components/
│   │   │   ├── EditorComponent.jsx  # Main Slate.js editor
│   │   │   ├── Toolbar.jsx          # Formatting toolbar
│   │   │   ├── LatexPanel.jsx       # Live LaTeX code viewer
│   │   │   ├── ExportPanel.jsx      # PDF export & settings
│   │   │   ├── MathDialog.jsx       # Math equation dialog
│   │   │   └── TableDialog.jsx      # Table insertion dialog
│   │   ├── utils/
│   │   │   └── latexSerializer.js   # Slate → LaTeX converter
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # App entry point
│   │   └── index.css                # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                   # Node.js + Express server
│   ├── src/
│   │   └── index.js           # Express app (compile & download endpoints)
│   └── package.json
│
└── README.md
```

## Prerequisites

- **Node.js** v18+ and **npm** v9+
- **pdflatex** (optional, required for PDF export)
  - Linux: `sudo apt install texlive-latex-base texlive-latex-recommended`
  - macOS: Install [MacTeX](https://www.tug.org/mactex/)
  - Windows: Install [MiKTeX](https://miktex.org/)

## Installation & Running

### 1. Clone the repository

```bash
git clone https://github.com/gagnonthe/Editex-.git
cd Editex-
```

### 2. Start the Backend

```bash
cd backend
npm install
npm start
```

The backend API will be available at `http://localhost:5000`.

For development with auto-reload:
```bash
npm run dev
```

### 3. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

## API Endpoints

### `GET /api/health`
Returns server status.

```json
{ "status": "ok", "message": "Editex backend is running" }
```

### `POST /api/compile`
Compiles LaTeX source to PDF and returns the binary PDF file.

**Request body:**
```json
{ "latex": "\\documentclass{article}..." }
```

**Response:**
- `200 OK` — PDF file (binary, `Content-Type: application/pdf`)
- `503 Service Unavailable` — pdflatex not installed on server
- `500 Internal Server Error` — Compilation error

### `POST /api/download-latex`
Returns the LaTeX source as a `.tex` file download.

**Request body:**
```json
{ "latex": "\\documentclass{article}..." }
```

## How It Works

### LaTeX Serialization

The Slate.js editor maintains a tree of document nodes. On every change, the `latexSerializer.js` utility walks the node tree and converts each node type to its LaTeX equivalent:

| Editor Action | Generated LaTeX |
|---|---|
| Bold text | `\textbf{...}` |
| Italic text | `\textit{...}` |
| Underline | `\underline{...}` |
| Heading 1 | `\section{...}` |
| Heading 2 | `\subsection{...}` |
| Heading 3 | `\subsubsection{...}` |
| Bullet list | `\begin{itemize}...\end{itemize}` |
| Numbered list | `\begin{enumerate}...\end{enumerate}` |
| Block quote | `\begin{quote}...\end{quote}` |
| Code block | `\begin{verbatim}...\end{verbatim}` |
| Math block | `\[ ... \]` |
| Inline math | `$ ... $` |
| Table | `\begin{tabular}{...}...\end{tabular}` |

The document is automatically wrapped in a complete LaTeX preamble including packages like `amsmath`, `geometry`, `hyperref`, and `ulem` based on which features are used.

### PDF Generation

1. User clicks **Export PDF**
2. Frontend sends the generated LaTeX string to `POST /api/compile`
3. Backend writes the LaTeX to a temporary `.tex` file
4. `pdflatex` compiles the document in a temporary directory
5. The resulting `.pdf` is streamed back to the browser
6. The temporary directory is cleaned up automatically

## Usage Guide

1. **Type** your content in the editor area
2. **Format** text using the toolbar (bold, italic, headings, lists, etc.)
3. **Insert equations** using ∑ Equation (block) or f(x) Inline buttons
4. **Insert tables** using ⊞ Table button
5. **View LaTeX** in the right panel — it updates in real-time
6. **Copy or download** the `.tex` source using buttons in the LaTeX panel
7. **Configure** document title, author, font size, and paper size
8. **Export PDF** using the Export PDF button (requires pdflatex on server)

## Example Generated LaTeX

For a document with a heading, bold text, and an equation, Editex generates:

```latex
\documentclass[12pt]{article}
\usepackage[a4paper,margin=2.5cm]{geometry}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage{hyperref}
\usepackage{amsmath}
\usepackage{amssymb}

\title{My Document}
\author{John Doe}
\date{\today}

\begin{document}
\maketitle

\section{Introduction}

This is \textbf{bold text} in the introduction.

\[
E = mc^2
\]

\end{document}
```

## Development

### Frontend linting

```bash
cd frontend
npm run lint
```

### Backend start in dev mode

```bash
cd backend
npm run dev
```

### Frontend production build

```bash
cd frontend
npm run build
```

## Deploy on Render

This repository includes a `render.yaml` Blueprint for one-click deployment.

### Option A — Blueprint (recommended)

1. Push your branch to GitHub.
2. In Render, click **New +** → **Blueprint**.
3. Select this repository.
4. Render will create:
   - `editex-api` (Node backend)
   - `editex-web` (static Vite frontend)
5. In the `editex-web` service settings, set:
   - `VITE_BACKEND_URL=https://<your-backend-service>.onrender.com`
6. Redeploy `editex-web` after saving the env var.

### Option B — Manual setup (2 services)

- **Backend (Web Service)**
  - Root Directory: `backend`
  - Build Command: `npm ci`
  - Start Command: `npm start`
  - Health Check Path: `/api/health`

- **Frontend (Static Site)**
  - Root Directory: `frontend`
  - Build Command: `npm ci && npm run build`
  - Publish Directory: `dist`
  - Environment variable: `VITE_BACKEND_URL=https://<your-backend-service>.onrender.com`

### Important note about PDF compilation

The `/api/compile` endpoint requires `pdflatex`. On Render, if `pdflatex` is not installed,
the app still works but PDF export returns `503` with a clear message.

If you want PDF export in production, deploy the backend with a Docker image that installs TeX Live.

## License

MIT
