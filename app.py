#!/usr/bin/env python3
import json
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename

BASE_DIR = Path(__file__).resolve().parent
PRODUCTS_FILE = BASE_DIR / "productos.json"
DEFAULT_IMAGE = "images/producto.svg"
UPLOADS_DIR = BASE_DIR / "images" / "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")


def load_products():
    """Lee los productos desde productos.json y devuelve siempre una lista."""
    if not PRODUCTS_FILE.exists():
        return []

    with PRODUCTS_FILE.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError("productos.json debe contener una lista de productos.")

    return data


def save_products(products):
    """Guarda los productos en productos.json."""
    with PRODUCTS_FILE.open("w", encoding="utf-8") as file:
        json.dump(products, file, indent=2, ensure_ascii=False)
        file.write("\n")


def normalize_product(payload):
    """Valida y normaliza un producto recibido por la API."""
    if not isinstance(payload, dict):
        raise ValueError("El cuerpo debe ser un objeto JSON.")

    name = str(payload.get("name", "")).strip()
    description = str(payload.get("description", "")).strip()
    unit = str(payload.get("unit", "unidad")).strip() or "unidad"
    image = str(payload.get("image", DEFAULT_IMAGE)).strip() or DEFAULT_IMAGE

    try:
        price = int(float(payload.get("price", 0)))
    except (TypeError, ValueError) as error:
        raise ValueError("El precio debe ser numérico.") from error

    if not name:
        raise ValueError("El nombre es obligatorio.")
    if len(name) > 80:
        raise ValueError("El nombre no puede superar 80 caracteres.")
    if not description:
        raise ValueError("La descripción es obligatoria.")
    if len(description) > 160:
        raise ValueError("La descripción no puede superar 160 caracteres.")
    if price <= 0:
        raise ValueError("El precio debe ser mayor que cero.")

    return {
        "name": name,
        "price": price,
        "description": description,
        "unit": unit[:20],
        "image": image,
    }


def parse_product_payload():
    """Acepta JSON o multipart/form-data para permitir subir imágenes desde móvil."""
    if request.content_type and "multipart/form-data" in request.content_type:
        payload = {
            "name": request.form.get("name", ""),
            "price": request.form.get("price", 0),
            "description": request.form.get("description", ""),
            "unit": request.form.get("unit", "unidad"),
            "image": request.form.get("image", DEFAULT_IMAGE),
        }
        product = normalize_product(payload)
        image_file = request.files.get("imageFile")
        if image_file and image_file.filename:
            product["image"] = save_uploaded_image(image_file)
        return product

    return normalize_product(request.get_json(silent=True) or {})


def save_uploaded_image(image_file):
    """Guarda una imagen subida y devuelve la ruta relativa para usar en el frontend."""
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    original_name = secure_filename(image_file.filename or "producto")
    extension = Path(original_name).suffix.lower() or ".jpg"

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF.")

    file_stem = Path(original_name).stem or "producto"
    target = UPLOADS_DIR / f"{file_stem}{extension}"
    counter = 1
    while target.exists():
        target = UPLOADS_DIR / f"{file_stem}-{counter}{extension}"
        counter += 1

    image_file.save(target)
    relative_path = target.relative_to(BASE_DIR).as_posix()
    return relative_path


def next_id(products):
    numeric_ids = [int(product.get("id", 0)) for product in products if str(product.get("id", "")).isdigit()]
    return max(numeric_ids, default=0) + 1


@app.after_request
def add_cors_headers(response):
    """Permite usar la API desde Live Server u otros orígenes locales."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response


@app.route("/productos", methods=["OPTIONS"])
@app.route("/productos/<int:product_id>", methods=["OPTIONS"])
def options_handler(product_id=None):
    return ("", 204)


@app.get("/")
def serve_store():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/admin")
def serve_admin():
    return send_from_directory(BASE_DIR, "admin.html")


@app.get("/productos")
def get_products():
    try:
        return jsonify(load_products())
    except (ValueError, json.JSONDecodeError) as error:
        return jsonify({"error": str(error)}), 500


@app.post("/productos")
def create_product():
    try:
        product_data = parse_product_payload()
        products = load_products()
    except (ValueError, json.JSONDecodeError) as error:
        return jsonify({"error": str(error)}), 400

    duplicate = next(
        (product for product in products if product.get("name", "").strip().lower() == product_data["name"].lower()),
        None,
    )
    if duplicate:
        return jsonify({"error": "Ya existe un producto con ese nombre."}), 409

    new_product = {
        "id": next_id(products),
        **product_data,
    }
    products.append(new_product)
    save_products(products)
    return jsonify(new_product), 201


@app.put("/productos/<int:product_id>")
def update_product(product_id):
    try:
        product_data = parse_product_payload()
        products = load_products()
    except (ValueError, json.JSONDecodeError) as error:
        return jsonify({"error": str(error)}), 400

    existing = next((product for product in products if int(product.get("id", 0)) == product_id), None)
    if not existing:
        return jsonify({"error": "Producto no encontrado."}), 404

    duplicate = next(
        (
            product for product in products
            if int(product.get("id", 0)) != product_id
            and product.get("name", "").strip().lower() == product_data["name"].lower()
        ),
        None,
    )
    if duplicate:
        return jsonify({"error": "Ya existe otro producto con ese nombre."}), 409

    updated_products = [
        {"id": product_id, **product_data} if int(product.get("id", 0)) == product_id else product
        for product in products
    ]
    save_products(updated_products)
    return jsonify({"id": product_id, **product_data})


@app.delete("/productos/<int:product_id>")
def delete_product(product_id):
    products = load_products()
    filtered = [product for product in products if int(product.get("id", 0)) != product_id]

    if len(filtered) == len(products):
        return jsonify({"error": "Producto no encontrado."}), 404

    save_products(filtered)
    return jsonify({"message": "Producto eliminado correctamente."})


@app.get("/<path:path>")
def serve_static(path):
    return send_from_directory(BASE_DIR, path)


if __name__ == "__main__":
    print("Servidor Flask iniciado en http://127.0.0.1:5000")
    print("Endpoints disponibles: GET /productos, POST /productos, PUT /productos/<id>, DELETE /productos/<id>")
    app.run(host="127.0.0.1", port=5000, debug=True)
