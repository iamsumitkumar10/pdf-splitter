
// -----------------------------
// File: src/pages/PdfToImages.jsx
// -----------------------------
import React, { useState } from 'react'
import UploadForm from '../components/UploadForm'

export default function PdfToImages(){
  const [format, setFormat] = useState('jpg')
  const [dpi, setDpi] = useState('150')
  const [startPage, setStartPage] = useState('')
  const [endPage, setEndPage] = useState('')
  const [forceZip, setForceZip] = useState(false)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e){
    e.preventDefault()
    if (!file) return alert('Select a PDF file')
    setLoading(true)
    try{
      const fd = new FormData()
      fd.append('pdf_file', file, file.name)
      fd.append('format', format)
      fd.append('dpi', dpi)
      fd.append('start_page', startPage)
      fd.append('end_page', endPage)
      if (forceZip) fd.append('force_zip', 'on')

      const res = await fetch('/pdf-to-images-convert', { method:'POST', body: fd })
      if (!res.ok){ const txt = await res.text(); throw new Error(txt || res.statusText) }
      const cd = res.headers.get('content-disposition') || ''
      const match = /filename\*=UTF-8''(.+)|filename=\"?(.+?)\"?(;|$)/.exec(cd)
      const filename = match ? decodeURIComponent(match[1] || match[2]) : 'images.zip'
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
    }catch(err){ alert('Error: ' + (err.message || err)) }
    finally{ setLoading(false) }
  }

  return (
    <div className="container">
      <div className="content">
        <div className="upload-section">
          <h2>Convert PDF to Images (JPG / PNG / WEBP / TIFF)</h2>
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="file-input-wrapper">
              <input type="file" name="pdf_file" id="pdfInput" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0] ?? null)} style={{display:'none'}} />
              <label htmlFor="pdfInput" className="file-input-label">
                <span className="file-icon">📄</span>
                <span className="file-text">Choose PDF File</span>
              </label>
            </div>

            <div className="options" style={{marginTop:12}}>
              <label>Output format:
                <select value={format} onChange={e=>setFormat(e.target.value)}>
                  <option value="jpg">JPG (good general)</option>
                  <option value="png">PNG (lossless)</option>
                  <option value="webp">WEBP (smaller, modern)</option>
                  <option value="tiff">TIFF (high quality)</option>
                </select>
              </label>
              <br /><br />
              <label>
                <input type="checkbox" checked={forceZip} onChange={e=>setForceZip(e.target.checked)} /> Always return ZIP (even for single page)
              </label>
            </div>

            <br />
            <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Processing...' : 'Convert'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}