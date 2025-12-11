// -----------------------------
// File: src/pages/Merge.jsx
// Converted from pdf_merge.html with drag & drop + preview
// -----------------------------
import React, { useState, useRef, useEffect } from 'react'

export default function Merge(){
  const [storedFiles, setStoredFiles] = useState([])
  const inputRef = useRef(null)

  function fileKey(f){ return `${f.name}_${f.size}_${f.lastModified}` }

  function addFiles(files){
    setStoredFiles(prev => {
      const existing = new Set(prev.map(f=>fileKey(f)))
      const next = [...prev]
      Array.from(files).forEach(f => {
        if (!existing.has(fileKey(f))) next.push(f)
      })
      return next
    })
  }

  function removeAt(i){ setStoredFiles(prev => prev.filter((_,idx)=>idx!==i)) }

  useEffect(()=>{
    // nothing
  }, [])

  async function handleSubmit(e){
    e.preventDefault()
    if (storedFiles.length < 2) return alert('Please select at least two PDF files.')
    if (storedFiles.length > 50) return alert('Maximum 50 files allowed.')
    const fd = new FormData()
    storedFiles.forEach(f => fd.append('pdf_files[]', f, f.name))
    try{
      const res = await fetch('/merge', { method:'POST', body: fd })
      if (!res.ok){ const txt = await res.text(); throw new Error(txt || res.statusText) }
      const blob = await res.blob(); const filename = 'merged.pdf'
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
      setStoredFiles([])
    }catch(err){ alert('Merge failed: ' + (err.message || err)) }
  }

  return (
    <div className="container">
      <div className="content">
        <div className="upload-section">
          <h2>Merge PDF Files</h2>
          <form onSubmit={handleSubmit} className="upload-form">
            <input ref={inputRef} type="file" id="pdfFiles" accept="application/pdf" multiple style={{display:'none'}} onChange={e=>addFiles(e.target.files)} />
            <label htmlFor="pdfFiles" id="dropZone" className="file-input-label" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); addFiles(e.dataTransfer.files)}}>
              <span className="file-icon">📄</span>
              <span className="file-text">Choose PDF File</span>
              <div style={{fontSize:13,color:'#666',marginTop:6}}>or drag & drop files here</div>
              <div id="dropPreview" style={{marginTop:12, textAlign:'left'}}>
                {storedFiles.length === 0 ? (
                  <div style={{color:'#999', fontSize:14}}>No files chosen</div>
                ) : storedFiles.map((f,i) => (
                  <div key={fileKey(f)} className="file-item">
                    <div className="file-name">{i+1}. {f.name}</div>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div style={{fontSize:12, color:'#666'}}>{(f.size/1024/1024).toFixed(2)} MB</div>
                      <button type="button" className="remove-btn" onClick={()=>removeAt(i)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </label>

            <br /><br />
            <button type="submit" className="submit-btn">Merge PDFs</button>
          </form>
        </div>
      </div>
    </div>
  )
}