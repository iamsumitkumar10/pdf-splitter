// -----------------------------
// File: src/api.js
// -----------------------------
export async function postFormData(path, formData) {
  const res = await fetch(path, { method: 'POST', body: formData })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || `HTTP ${res.status}`)
  }
  const cd = res.headers.get('content-disposition') || ''
  const match = /filename\*=UTF-8''(.+)|filename=\"?(.+?)\"?(;|$)/.exec(cd)
  const filename = match ? decodeURIComponent(match[1] || match[2]) : 'download'
  const blob = await res.blob()
  return { blob, filename }
}

export function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}