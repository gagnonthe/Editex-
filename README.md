# Editex – LaTeX-Powered WYSIWYG Text Editor

Editex is an interactive web-based text editor that provides a familiar WYSIWYG (What You See Is What You Get) experience while generating LaTeX code in real time. It lets users format documents visually and export them as PDF via LaTeX compilation.

![Editex Editor](https://github.com/user-attachments/assets/07459c3a-656f-4aec-b7a0-e487ee8ba20e)

## Features

- **WYSIWYG Editor** – Rich text editing powered by Slate.js with bold, italic, underline, code, headings (H1–H3), block quotes, bulleted and numbered lists.
- **Real-Time LaTeX Generation** – Every formatting action is converted to LaTeX in real time. Toggle the LaTeX panel to view and copy the generated code.
- **Math Equation Support** – Insert LaTeX math expressions via a dedicated modal with common presets (fractions, integrals, sums, matrices, etc.).
- **PDF Export** – Send generated LaTeX to the backend for compilation and download the resulting PDF.
- **Download .tex** – Download the raw LaTeX source file directly.
- **Keyboard Shortcuts** – `Ctrl+B` (bold), `Ctrl+I` (italic), `Ctrl+U` (underline).
- **Responsive Design** – Works on desktop, tablet, and mobile screens.

## Project Structure

```
Editex-/
├── backend/            # Node.js / Express API server
│   ├── server.js       # API endpoints (health, compile, download)
│   ├── __tests__/      # Backend tests (Jest + Supertest)
│   └── package.json
├── frontend/           # React.js application
│   ├── src/
│   │   ├── components/ # EditexEditor, Toolbar, LatexPanel, MathModal
│   │   ├── utils/      # latexConverter, api helpers
│   │   └── App.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 16
- **pdflatex** (TeX Live or MiKTeX) – required for PDF export

### Installation

```bash
# Clone the repository
git clone https://github.com/gagnonthe/Editex-.git
cd Editex-

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

**Start the backend** (port 5000 by default):

```bash
cd backend
npm start
```

**Start the frontend** (port 3000 by default):

```bash
cd frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Usage

1. **Write** – Type in the editor area. Use the toolbar buttons or keyboard shortcuts to format text.
2. **View LaTeX** – Click **Show LaTeX** to open the side panel showing the generated LaTeX code.
3. **Insert Math** – Click **∑ Math** to open the equation modal. Choose a preset or type a custom LaTeX math expression.
4. **Export** – Click **📄 Export PDF** to compile and download a PDF, or **⬇ .tex** to download the raw LaTeX file.

## Technologies

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React.js, Slate.js, Tailwind CSS  |
| Backend  | Node.js, Express.js               |
| LaTeX    | pdflatex (TeX Live / MiKTeX)      |
| Testing  | Jest, Supertest, React Testing Library |