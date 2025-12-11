// -----------------------------
// File: src/main.jsx
// -----------------------------
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import PdfSplit from './pages/PdfSplit'
import PdfToImages from './pages/PdfToImages'
import ImagesToPdf from './pages/ImagesToPdf'
import PdfToDocx from './pages/PdfToDocx'
import PdfToText from './pages/PdfToText'
import Merge from './pages/Merge'
import Compress from './pages/Compress'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <main style={{padding: '20px'}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/split" element={<PdfSplit />} />
          <Route path="/pdf-to-images" element={<PdfToImages />} />
          <Route path="/image-to-pdf" element={<ImagesToPdf />} />
          <Route path="/pdf-to-docx" element={<PdfToDocx />} />
          <Route path="/pdf-to-text" element={<PdfToText />} />
          <Route path="/pdf-merge" element={<Merge />} />
          <Route path="/pdf-compress" element={<Compress />} />
        </Routes>
      </main>
    </BrowserRouter>
  </React.StrictMode>
)