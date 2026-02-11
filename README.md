# Gestión de Pagos Vecinos 🏠

Una aplicación web minimalista y ultra-simple diseñada para gestionar pagos de mantenimiento en vecindarios, optimizada para ser usada por personas mayores.

## Características
- **Diseño Gigante**: Botones y textos grandes para fácil lectura.
- **Colores Claros**: Estado de pago visual (Verde = Pagado, Rojo = Pendiente).
- **Acciones Rápidas**:
  - **Marcar Pagado**: Actualiza visualmente el estado (simulado).
  - **WhatsApp**: Genera un mensaje prellenado para cobrar o agradecer el pago.
- **Sin Login**: Acceso directo y rápido.

## Cómo Usar con Google Sheets (Opcional)

Por defecto, la app usa datos de prueba. Para conectarla a tu propia hoja de cálculo de Google:

1. Crea una nueva hoja de cálculo en Google Sheets.
2. En la primera fila, escribe estos encabezados exactos:
   `Nombre`, `Casa`, `Estado`, `Telefono`
3. Llena los datos de tus vecinos.
   - En la columna `Estado`, usa "PAGADO" o "DEBE".
   - En `Telefono`, pon el número con código de país (ej. 52155...) sin símbolos.
4. Ve a **Archivo > Compartir > Publicar en la web**.
5. En "Enlace", selecciona "Todo el documento" y **Valores separados por comas (.csv)**.
6. Copia el enlace generado.
7. Abre el archivo `script.js` y pega el enlace en la variable `SHEET_URL`:
   ```javascript
   const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/.../pub?output=csv';
   ```

## Cómo Publicar en GitHub Pages

1. Sube estos archivos a un repositorio de GitHub.
2. Ve a **Settings > Pages**.
3. En "Source", selecciona `main` o `master` y la carpeta `/root`.
4. Guarda y espera unos minutos. ¡Tu app estará online!

## Tecnologías
- HTML5
- CSS3 (Diseño nativo simple)
- JavaScript (Vanilla)
