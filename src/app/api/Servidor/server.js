// api/Servidor/server.js
// Si server.js necesita acceder a otras variables de entorno, se puede cargar BD.env también
const path = require('path');
require('dotenv').config({ 
  path: path.resolve(__dirname, '../../api/BD.env') 
}); 

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Importar rutas (se asume que "productos.js" está en ../routes/)
const productosRoute = require('../routes/productos');
const categoriasRoute = require('../routes/categorias');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Uso de rutas
app.use('/api/products', productosRoute);
app.use('/api/categories', categoriasRoute);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('API de Tienda de Juegos - Endpoints disponibles: /api/products, /api/categories');
});

// Tomar el puerto desde las variables de entorno o usar 3000 por defecto
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`Base de datos: ${process.env.DB_DATABASE}`);
});
