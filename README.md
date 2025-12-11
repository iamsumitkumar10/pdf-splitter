# 📄 ConvertIQ — All-in-One PDF Toolkit

ConvertIQ is a fast, clean, and user-friendly PDF utility web application.
It allows you to **split, merge, convert, and extract** PDF content — all processed securely in memory.

No data is stored, ensuring **complete privacy**.

## 🚀 Available Tools
- PDF Splitter
- PDF Merger
- PDF → Images
- Images → PDF
- PDF → Word (.docx)
- PDF → Text (.txt)

## 🌟 Highlights
- ⚡ Fast, in-memory processing (no disk writes except when required)
- 🔒 100% privacy — files are not saved on server
- 📦 Download ZIP when multiple outputs generated
- 🖥 Responsive and clean UI
- 🧾 Supports multiple image formats (JPG, PNG, WEBP, TIFF, etc.)
- 🔀 Page-range support for conversions
- 📚 Works with large PDFs (server memory-safe config included)

## 🛠 Installation
```bash
git clone <your-repository-url>
cd ConvertIQ
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

## 📁 Project Structure
```
ConvertIQ/
├── app.py
├── requirements.txt
├── templates/
├── static/
└── README.md
```

## ▶️ Run Server
```bash
python3 app.py
```

Visit:
```
http://127.0.0.1:5000
```

## 🧩 Dependencies
All requirements are listed in requirements.txt, including:

- Flask
- PyMuPDF (fitz)
- PyPDF2
- pdf2docx
- Pillow
- zipfile (built-in)

## 🤝 Contributing
Pull requests are welcome!
If you want to add features (OCR, Compress PDF, Rotate pages, etc.), feel free to open an issue.

