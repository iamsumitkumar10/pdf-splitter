

# import os
# import io
# import zipfile
# from flask import Flask, request, render_template, send_file, abort
# from werkzeug.utils import secure_filename
# from PyPDF2 import PdfReader, PdfWriter

# app = Flask(__name__)
# app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # max 200MB upload

# @app.route("/")
# def index():
#     return render_template('index.html')

# @app.route("/split", methods=["POST"])
# def split_pdf():
#     if 'pdf_file' not in request.files:
#         abort(400, "No file part")
    
#     file = request.files['pdf_file']
#     if file.filename == "":
#         abort(400, "No selected file")
    
#     filename = secure_filename(file.filename)

#     try:
#         reader = PdfReader(file.stream)
#     except Exception as e:
#         abort(400, f"Invalid PDF: {e}")

#     # Create an in-memory ZIP with all split pages
#     zip_buffer = io.BytesIO()
#     with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
#         for i, page in enumerate(reader.pages):
#             writer = PdfWriter()
#             writer.add_page(page)

#             page_bytes = io.BytesIO()
#             writer.write(page_bytes)
#             page_bytes.seek(0)

#             page_name = f"{os.path.splitext(filename)[0]}_page_{i+1}.pdf"
#             zf.writestr(page_name, page_bytes.read())

#     zip_buffer.seek(0)
#     return send_file(
#         zip_buffer,
#         mimetype="application/zip",
#         as_attachment=True,
#         download_name=f"{os.path.splitext(filename)[0]}_pages.zip"
#     )

# if __name__ == "__main__":
#     app.run(debug=True, port=5000)





#  image to pdf converter added

# app.py
import os
import io
import zipfile
from flask import Flask, request, render_template, send_file, abort
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader, PdfWriter
from PIL import Image

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # max 200MB upload

ALLOWED_IMAGE_EXTS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}

def allowed_image_filename(filename):
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    return ext in ALLOWED_IMAGE_EXTS

@app.route("/")
def index():
    return render_template('index.html')

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

@app.route("/images-to-pdf", methods=["POST"])
def images_to_pdf():
    """
    Accept multiple image files (input name 'images[]') and return a single PDF
    containing each image as a page (in the order sent).
    """
    # Support both single-file input and multiple files
    files = request.files.getlist('images[]')
    if not files or len(files) == 0:
        abort(400, "No images uploaded")

    # Optional: a filename input (form field) for the output PDF
    output_name = request.form.get('output_name', 'images_combined.pdf')
    output_name = secure_filename(output_name)
    if not output_name.lower().endswith('.pdf'):
        output_name = output_name + '.pdf'

    images = []
    try:
        for f in files:
            if f and f.filename:
                if not allowed_image_filename(f.filename):
                    # skip or abort - here we abort to be strict
                    abort(400, f"Unsupported image type: {f.filename}")
                # open with PIL
                img = Image.open(f.stream)
                # Convert all images to RGB (PDFs expect RGB or L)
                if img.mode in ("RGBA", "LA") or (img.mode == "P"):
                    img = img.convert("RGB")
                else:
                    img = img.convert("RGB")
                images.append(img.copy())  # copy to keep file stream free
                img.close()
    except Exception as e:
        abort(400, f"Error processing images: {e}")

    if len(images) == 0:
        abort(400, "No valid images found")

    pdf_bytes = io.BytesIO()
    try:
        # Pillow requires saving the first image, and pass rest via append_images
        first_img, rest = images[0], images[1:]
        # Save to bytes
        first_img.save(pdf_bytes, format='PDF', save_all=True, append_images=rest)
        pdf_bytes.seek(0)
    except Exception as e:
        abort(500, f"Failed to create PDF: {e}")
    finally:
        # close images
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

if __name__ == "__main__":
    app.run(debug=True, port=5000)