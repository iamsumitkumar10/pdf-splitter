// -----------------------------
// File: src/components/UploadForm.jsx
// Reusable form used across pages.
// Props: endpoint, fields (array), fileFieldName, multiple
// -----------------------------
import React, { useState } from 'react'
import { postFormData, downloadBlob } from '../api'
import "../styles/uploadform.css"


export default function UploadForm({ endpoint, fields = [], fileFieldName = 'pdf_file', multiple = false, extraRender }){
  const [file, setFile] = useState(null)
  const [files, setFiles] = useState([])
  const [storedFilesMap, setStoredFilesMap] = useState(new Map())
  const [loading, setLoading] = useState(false)

  function handleSingleChange(e){
    setFile(e.target.files?.[0] ?? null)
  }

  function handleMultipleChange(e){
    const newFiles = Array.from(e.target.files || [])
    const map = new Map(storedFilesMap)
    newFiles.forEach(f => {
      const key = `${f.name}::${f.size}::${f.lastModified}`
      if (!map.has(key) && f.type.startsWith('image/') || fileFieldName !== 'images') {
        map.set(key, f)
      }
    })
    setStoredFilesMap(map)
  }

  function removeStoredFile(key){
    const map = new Map(storedFilesMap)
    map.delete(key)
    setStoredFilesMap(map)
  }

  function renderStoredList(){
    if (storedFilesMap.size === 0) return null
    return (
      <div className="selected-file" style={{display:'block'}}>
        <strong>{storedFilesMap.size} file{storedFilesMap.size>1?'s':''} selected</strong>
        <ul style={{marginTop:8, paddingLeft:18}}>
          {Array.from(storedFilesMap.entries()).map(([k,f]) => (
            <li key={k} style={{marginTop:6}}>
              {f.name} — {(f.size/1024/1024).toFixed(2)} MB
              <button type="button" style={{marginLeft:8}} onClick={() => removeStoredFile(k)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  async function handleSubmit(e){
    e.preventDefault()
    const fd = new FormData()
    if (multiple) {
      if (storedFilesMap.size === 0) return alert('Select files')
      for (const f of storedFilesMap.values()) fd.append(fileFieldName + (fileFieldName.endsWith('[]') || fileFieldName.includes('[]') ? '' : '[]'), f, f.name)
    } else {
      if (!file) return alert('Select file')
      fd.append(fileFieldName, file, file.name)
    }

    // include any fields from DOM (simple approach)
    fields.forEach(f => {
      // for checkbox, read from form by name
      // we'll allow consumer pages to pass in inputs in extraRender and keep this simple
    })

    setLoading(true)
    try{
      const { blob, filename } = await postFormData(endpoint, fd)
      downloadBlob(blob, filename)
      // reset after success
      setFile(null); setFiles([]); setStoredFilesMap(new Map())
    }catch(err){
      alert('Error: ' + (err.message || err))
    }finally{
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <div className="file-input-wrapper">
        {multiple ? (
          <>
            <input type="file" name={fileFieldName + '[]'} id={fileFieldName} multiple onChange={handleMultipleChange} style={{display:'none'}} />
            <label htmlFor={fileFieldName} className="file-input-label">
              <span className="file-icon">📄</span>
              <span className="file-text">Choose Files</span>
            </label>
            {renderStoredList()}
          </>
        ) : (
          <>
            <input type="file" name={fileFieldName} id={fileFieldName} onChange={handleSingleChange} style={{display:'none'}} />
            <label htmlFor={fileFieldName} className="file-input-label">
              <span className="file-icon">📄</span>
              <span className="file-text">Choose File</span>
            </label>
            {file ? (
              <div className="selected-file" style={{display:'block'}}>
                <strong>Selected:</strong> {file.name}<br/>
                <small>{(file.size/1024/1024).toFixed(2)} MB</small>
              </div>
            ) : null}
          </>
        )}

        {extraRender}

      </div>

      <br />
      <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Processing...' : 'Start'}</button>
    </form>
  )
}