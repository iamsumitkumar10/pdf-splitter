# app.py
import os
import io
import zipfile
import fitz
from flask import Flask, request, render_template, send_file, abort
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader, PdfWriter
from PIL import Image
import tempfile
from pdf2docx import Converter

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # max 200MB upload

ALLOWED_IMAGE_EXTS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}

def allowed_image_filename(filename):
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    return ext in ALLOWED_IMAGE_EXTS

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/pdfsplit")
def pdfsplit_page():
    return render_template('pdfsplit.html')

# ---- PAGE: PDF -> Images----
@app.route("/pdf-to-images")
def pdf_to_images_page():
    return render_template('pdf_to_images.html')

@app.route("/image-to-pdf")
def image_to_pdf_page():
    return render_template('image_to_pdf.html')

# add a page route if you plan to create a UI template for it
@app.route("/pdf-to-docx")
def pdf_to_docx_page():
    return render_template('pdf_to_docx.html')

@app.route("/split", methods=["POST"])
def split_pdf():
    if 'pdf_file' not in request.files:
        abort(400, "No file part")
    
    file = request.files['pdf_file']
    if file.filename == "":
        abort(400, "No selected file")
    
    filename = secure_filename(file.filename)

    try:
        reader = PdfReader(file.stream)
    except Exception as e:
        abort(400, f"Invalid PDF: {e}")

    # Create an in-memory ZIP with all split pages
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for i, page in enumerate(reader.pages):
            writer = PdfWriter()
            writer.add_page(page)

            page_bytes = io.BytesIO()
            writer.write(page_bytes)
            page_bytes.seek(0)

            page_name = f"{os.path.splitext(filename)[0]}_page_{i+1}.pdf"
            zf.writestr(page_name, page_bytes.read())

    zip_buffer.seek(0)
    return send_file(
        zip_buffer,
        mimetype="application/zip",
        as_attachment=True,
        download_name=f"{os.path.splitext(filename)[0]}_pages.zip"
    )


# ---- POST: Convert PDF to images ----
@app.route("/pdf-to-images-convert", methods=["POST"])
def pdf_to_images_convert():
    # basic checks
    if 'pdf_file' not in request.files:
        abort(400, "No file part")
    file = request.files['pdf_file']
    if file.filename == "":
        abort(400, "No selected file")

    filename = secure_filename(file.filename)
    if not filename.lower().endswith('.pdf'):
        abort(400, "Uploaded file is not a PDF")

    # options from form
    out_format = request.form.get('format', 'jpg').lower()  # 'jpg','png','webp','tiff'
    # normalize formats
    fmt_map = {
        'jpg': 'jpeg',
        'jpeg': 'jpeg',
        'png': 'png',
        'webp': 'webp',
        'tiff': 'tiff'
    }
    if out_format not in fmt_map:
        abort(400, f"Unsupported format: {out_format}")

    try:
        dpi = int(request.form.get('dpi', 150))
        if dpi <= 0 or dpi > 1200:
            dpi = 150
    except Exception:
        dpi = 150

    # optional page range (1-based inclusive)
    start_page = request.form.get('start_page', '').strip()
    end_page = request.form.get('end_page', '').strip()

    # whether to force zip even for single image (checkbox)
    force_zip = request.form.get('force_zip', 'off') == 'on'

    # read PDF bytes (we'll open from bytes)
    pdf_bytes = file.read()
    if not pdf_bytes:
        abort(400, "Empty file uploaded")

    # open PDF with PyMuPDF
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        abort(400, f"Invalid PDF: {e}")

    page_count = doc.page_count

    # parse page range
    try:
        if start_page and end_page:
            sp = max(1, int(start_page))
            ep = min(page_count, int(end_page))
            if sp > ep:
                sp, ep = ep, sp
        elif start_page and not end_page:
            sp = max(1, int(start_page))
            ep = page_count
        elif not start_page and end_page:
            sp = 1
            ep = min(page_count, int(end_page))
        else:
            sp = 1
            ep = page_count
    except Exception:
        sp, ep = 1, page_count

    # Convert pages sp..ep (inclusive)
    images = []  # list of tuples (name, bytes)
    try:
        zoom = dpi / 72.0  # default resolution multiplier (72 DPI is default PDF)
        mat = fitz.Matrix(zoom, zoom)
        # iterate requested pages (1-based)
        for p in range(sp - 1, ep):
            page = doc.load_page(p)
            pix = page.get_pixmap(matrix=mat, alpha=False)  # no transparency for JPEG
            # choose output format
            out_fmt = fmt_map[out_format]

            # PyMuPDF pix.tobytes accepts output= format name
            # For JPEG we can pass jpeg quality via .tobytes(...)? It doesn't accept quality param.
            # We'll use the raw bytes produced.
            img_bytes = pix.tobytes(output=out_fmt)
            page_name = f"{os.path.splitext(filename)[0]}_page_{p+1}.{out_format}"
            images.append((page_name, img_bytes))
    except Exception as e:
        doc.close()
        abort(500, f"Conversion error: {e}")

    doc.close()

    # Single image -> send directly unless force_zip
    if len(images) == 1 and not force_zip:
        name, data = images[0]
        mime = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'tiff': 'image/tiff'
        }.get(out_format, 'application/octet-stream')

        buf = io.BytesIO(data)
        buf.seek(0)
        return send_file(
            buf,
            mimetype=mime,
            as_attachment=True,
            download_name=name
        )

    # Multiple images -> return ZIP
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for name, data in images:
            zf.writestr(name, data)
    zip_buffer.seek(0)
    return send_file(
        zip_buffer,
        mimetype="application/zip",
        as_attachment=True,
        download_name=f"{os.path.splitext(filename)[0]}_images.zip"
    )


@app.route("/images-to-pdf", methods=["POST"])
def images_to_pdf():
    files = request.files.getlist('images[]')
    if not files or len(files) == 0:
        abort(400, "No images uploaded")

    output_name = request.form.get('output_name', 'images_combined.pdf')
    output_name = secure_filename(output_name)
    if not output_name.lower().endswith('.pdf'):
        output_name = output_name + '.pdf'

    images = []
    try:
        for f in files:
            if f and f.filename:
                if not allowed_image_filename(f.filename):
                    abort(400, f"Unsupported image type: {f.filename}")
                img = Image.open(f.stream)
                img = img.convert("RGB")
                images.append(img.copy())
                img.close()
    except Exception as e:
        abort(400, f"Error processing images: {e}")

    if len(images) == 0:
        abort(400, "No valid images found")

    pdf_bytes = io.BytesIO()
    try:
        first_img, rest = images[0], images[1:]
        first_img.save(pdf_bytes, format='PDF', save_all=True, append_images=rest)
        pdf_bytes.seek(0)
    except Exception as e:
        abort(500, f"Failed to create PDF: {e}")
    finally:
        for im in images:
            try:
                im.close()
            except Exception:
                pass

    return send_file(
        pdf_bytes,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=output_name
    )

# convert endpoint
@app.route("/pdf-to-docx-convert", methods=["POST"])
def pdf_to_docx_convert():
    # basic checks (consistent with /split)
    if 'pdf_file' not in request.files:
        abort(400, "No file part")
    file = request.files['pdf_file']
    if file.filename == "":
        abort(400, "No selected file")

    filename = secure_filename(file.filename)
    if not filename.lower().endswith('.pdf'):
        abort(400, "Uploaded file is not a PDF")

    # create temporary files for conversion
    temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    temp_pdf_path = temp_pdf.name
    try:
        # write the uploaded PDF to disk for pdf2docx to read
        temp_pdf.write(file.read())
        temp_pdf.flush()
        temp_pdf.close()

        # output temporary docx path
        out_docx_path = tempfile.NamedTemporaryFile(delete=False, suffix='.docx').name

        # convert using pdf2docx. This preserves layout better than plain text extraction.
        try:
            cv = Converter(temp_pdf_path)
            # convert full document; you can pass start/end to convert pages range
            cv.convert(out_docx_path, start=0, end=None)
            cv.close()
        except Exception as e:
            # ensure conversion errors are reported cleanly
            abort(500, f"Conversion failed: {e}")

        # read the generated docx into memory so we can delete temp files safely
        try:
            with open(out_docx_path, "rb") as f:
                docx_bytes = f.read()
        except Exception as e:
            abort(500, f"Failed to read generated DOCX: {e}")

    finally:
        # cleanup temp files if they exist (ignore errors)
        try:
            if os.path.exists(temp_pdf_path):
                os.unlink(temp_pdf_path)
        except Exception:
            pass
        try:
            if 'out_docx_path' in locals() and os.path.exists(out_docx_path):
                os.unlink(out_docx_path)
        except Exception:
            pass

    # send result as attachment from memory
    docx_io = io.BytesIO(docx_bytes)
    docx_io.seek(0)
    download_name = f"{os.path.splitext(filename)[0]}.docx"
    return send_file(
        docx_io,
        mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        as_attachment=True,
        download_name=download_name
    )

if __name__ == "__main__":
    app.run(debug=True, port=5000)
