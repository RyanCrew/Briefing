# Calendar
## Cómo Ejecutar

### Backend
1. Instala las dependencias necesarias (asegúrate de tener Python instalado).
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Inicia el servidor de FastAPI.
   ```bash
   uvicorn backend.app:app --reload
   ```

### Frontend
1. Navega a la carpeta `frontend` e instala las dependencias.
   ```bash
   npm install
   ```
2. Inicia la aplicación React.
   ```bash
   npm start
   ```

## Funcionalidades
- Subir imágenes de horarios de vuelos.
- Extraer texto usando OCR.
- Mostrar datos procesados en una tabla.

## Despliegue

### Frontend
1. Usa [GitHub Pages](https://pages.github.com/) para alojar el contenido de la carpeta `frontend/public`.
2. Ve a **Settings > Pages** en tu repositorio de GitHub.
3. Configura la fuente como la rama donde están los archivos y selecciona `frontend/public`.

### Backend
Para desplegar el backend, puedes usar servicios gratuitos como:
- **[Render](https://render.com/):** Configuración rápida y gratuita para FastAPI.
- **[Heroku](https://www.heroku.com/):** Ideal para aplicaciones pequeñas.

Si necesitas ayuda con el despliegue, revisa la documentación o pide orientación adicional.
