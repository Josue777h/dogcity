#!/usr/bin/env python3
import argparse

from app import load_products, next_id, normalize_product, save_products


def parse_args():
    parser = argparse.ArgumentParser(description="Guardar un producto nuevo en productos.json")
    parser.add_argument("--name", required=True, help="Nombre del producto")
    parser.add_argument("--price", required=True, type=float, help="Precio del producto")
    parser.add_argument("--description", required=True, help="Descripción corta")
    parser.add_argument("--unit", default="unidad", help="Unidad de venta")
    parser.add_argument("--image", default="images/producto.svg", help="Ruta o URL de la imagen")
    return parser.parse_args()


def main():
    args = parse_args()
    products = load_products()
    product_data = normalize_product(vars(args))

    new_product = {
        "id": next_id(products),
        **product_data,
    }

    products.append(new_product)
    save_products(products)
    print("Producto guardado:")
    print(new_product)


if __name__ == "__main__":
    main()
