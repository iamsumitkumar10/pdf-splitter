
// -----------------------------
// File: src/components/Header.jsx
// -----------------------------
import React from 'react'
import { NavLink } from 'react-router-dom'
import "../styles/header.css"

export default function Header(){
  return (
    <header className="header">
      <div className="container-inner">
        <a href="/" style={{textDecoration:'none', color:'inherit'}}>
          <h1 style={{cursor:'pointer'}}>ConvertIQ</h1>
        </a>
        {/* <p>Keep Your Data Safe</p> */}

        <nav className="tabs" role="tablist" aria-label="Tools">
          <NavLink to="/split" className={({isActive}) => isActive ? 'tab active' : 'tab'}>PDF Splitter</NavLink>
          <NavLink to="/pdf-to-images" className={({isActive}) => isActive ? 'tab active' : 'tab'}>PDF → Images</NavLink>
          <NavLink to="/image-to-pdf" className={({isActive}) => isActive ? 'tab active' : 'tab'}>Images → PDF</NavLink>
          <NavLink to="/pdf-to-docx" className={({isActive}) => isActive ? 'tab active' : 'tab'}>PDF → Word</NavLink>
          <NavLink to="/pdf-to-text" className={({isActive}) => isActive ? 'tab active' : 'tab'}>PDF → Text</NavLink>
          <NavLink to="/pdf-merge" className={({isActive}) => isActive ? 'tab active' : 'tab'}>Merge PDFs</NavLink>
          <NavLink to="/pdf-compress" className={({isActive}) => isActive ? 'tab active' : 'tab'}>Compress PDFs</NavLink>
        </nav>
      </div>
    </header>
  )
}