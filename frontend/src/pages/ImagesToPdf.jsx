// -----------------------------
// File: src/pages/ImagesToPdf.jsx
// Converted from templates/image_to_pdf HTML + script logic
// -----------------------------
import React, { useState, useRef } from 'react'
import UploadForm from '../components/UploadForm'
import { postFormData, downloadBlob } from '../api'

export default function ImagesToPdf(){
  const [storedFiles, setStoredFiles] = useState(new Map())
  const inputRef = useRef(null)
  const [loading, setLoading] = useState(false)

  function fileKey(f){ return `${f.name}::${f.size}::${f.lastModified}` }

  function onFilesSelected(list){
    const map = new Map(storedFiles)
    Array.from(list).forEach(f => {
      if (!f.type.startsWith('image/')) return
      const k = fileKey(f)
      if (!map.has(k)) map.set(k, f)
    })
    setStoredFiles(map)
  }

  function removeFile(k){
    const map = new Map(storedFiles)
    map.delete(k)
    setStoredFiles(map)
  }

  async function handleSubmit(e){
    e.preventDefault()
    if (storedFiles.size === 0) return alert('Please select at least one image.')
    setLoading(true)
    try{
      const fd = new FormData()
      for (const f of storedFiles.values()) fd.append('images[]', f, f.name)
      const res = await fetch('/images-to-pdf', { method: 'POST', body: fd })
      if (!res.ok) { const txt = await res.text(); throw new Error(txt || res.statusText) }
      const blob = await res.blob()
      const filename = 'converted.pdf'
      downloadBlob(blob, filename)
      setStoredFiles(new Map())
    }catch(err){ alert('Upload failed: ' + (err.message || err)) }
    finally{ setLoading(false) }
  }

  return (
    <div className="container">
      <div className="content">
        <div className="upload-section">
          <h2>Convert Images to PDF</h2>
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="file-input-wrapper">
              <input ref={inputRef} type="file" name="images[]" accept="image/*" id="imagesInput" multiple style={{display:'none'}} onChange={(e)=>onFilesSelected(e.target.files)} />
              <label htmlFor="imagesInput" className="file-input-label">
                <span className="file-icon">🖼️</span>
                <span className="file-text">Choose Images</span>
              </label>
            </div>

            {storedFiles.size>0 && (
              <div className="selected-file" style={{display:'block', marginTop:12}}>
                <strong>{storedFiles.size} image{storedFiles.size>1?'s':''} selected:</strong>
                <ul style={{marginTop:8, paddingLeft:18}}>
                  {Array.from(storedFiles.entries()).map(([k,f]) => (
                    <li key={k} style={{marginTop:6}}>
                      {f.name} — {(f.size/1024/1024).toFixed(2)} MB
                      <button type="button" style={{marginLeft:8}} onClick={()=>removeFile(k)}>Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <br />
            <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Uploading...' : 'Convert to PDF'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}