// -----------------------------
// File: src/pages/Home.jsx
// -----------------------------
import React from 'react'
import "../styles/home.css"


export default function Home(){
  return (
    <div className="container">
      <div className="features" style={{padding:30, textAlign:'center'}}>
        <h3>Select a Tool</h3>
        <p style={{marginTop:12, color:'#666'}}>Choose from the tools above to begin.</p>
      </div>

      <div className="features">
        <h3>Features:</h3>
        <ul>
          <li>⚡ Fast, in-memory processing</li>
          <li>🔒 100% privacy — files are not saved on server</li>
          <li>📦 Download ZIP when multiple outputs generated</li>
          <li>🧾 Supports multiple image formats</li>
          <li>📚 Works with large PDFs</li>
        </ul>
      </div>
    </div>
  )
}