# Sistema de Pedidos para Restaurante

Proyecto full-stack simple para tomar pedidos por WhatsApp.

## Tecnologías

- Frontend: HTML, CSS y JavaScript puro
- Backend: Python + Flask
- Base de datos local: `productos.json`
- Comunicación: API REST

## Archivos principales

- `index.html`: tienda para clientes
- `admin.html`: panel para el dueño del restaurante
- `app.js`: lógica de frontend para tienda y admin
- `styles.css`: estilos de la aplicación
- `app.py`: backend Flask con API REST
- `productos.json`: base de datos local de productos

## API disponible

- `GET /productos`
- `POST /productos`
- `DELETE /productos/<id>`

## Cómo ejecutar

### 1. Activar el entorno virtual

PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 2. Instalar Flask

```powershell
pip install Flask
```

### 3. Iniciar el backend

```powershell
python app.py
```

El servidor quedará en:

```text
http://127.0.0.1:5000
```

### 4. Abrir la aplicación

Opciones:

- Tienda: `http://127.0.0.1:5000/`
- Panel admin: `http://127.0.0.1:5000/admin`

También puedes abrir el frontend con Live Server. En ese caso, `app.js` intentará conectarse a `http://127.0.0.1:5000/productos` y, si Flask no está iniciado, usará `localStorage` como respaldo local.

## Flujo recomendado

1. Inicia Flask con `python app.py`
2. Abre `http://127.0.0.1:5000/admin`
3. Crea o elimina productos
4. Abre `http://127.0.0.1:5000/`
5. Verifica que la tienda muestre el catálogo actualizado

## Escalabilidad futura

Este proyecto está preparado para evolucionar a:

- autenticación para admin
- edición de productos
- categorías
- pedidos guardados en base de datos SQL
- despliegue en hosting para restaurantes
