
// -----------------------------
// File: src/pages/PdfSplit.jsx
// -----------------------------
import React, { useState } from 'react'

export default function PdfSplit(){
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e){
    e.preventDefault()
    if (!file) return alert('Select a PDF file')
    setLoading(true)
    try{
      const fd = new FormData(); fd.append('pdf_file', file, file.name)
      const res = await fetch('/split', { method:'POST', body: fd })
      if (!res.ok){ const txt = await res.text(); throw new Error(txt || res.statusText) }
      const blob = await res.blob(); const filename = 'pages.zip'
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
    }catch(err){ alert('Error: ' + (err.message || err)) }
    finally{ setLoading(false) }
  }

  return (
    <div className="container">
      <div className="content">
        <div className="upload-section">
          <h2>Split PDF into Pages</h2>
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="file-input-wrapper">
              <input type="file" name="pdf_file" id="fileInput" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0] ?? null)} style={{display:'none'}} />
              <label htmlFor="fileInput" className="file-input-label">
                <span className="file-icon">📄</span>
                <span className="file-text">Choose PDF File</span>
              </label>
            </div>
            {file && (
              <div className="selected-file" style={{display:'block'}}>
                <strong>Selected:</strong> {file.name}<br/>
                <small>{(file.size/1024/1024).toFixed(2)} MB</small>
              </div>
            )}
            <br />
            <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Splitting...' : 'Split PDF'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}