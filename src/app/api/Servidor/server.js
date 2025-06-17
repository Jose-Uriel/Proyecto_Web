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
const paymentsRoute = require('../routes/payments');
const usuariosRoute = require('../routes/usuarios'); // Add the usuarios route

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uso de rutas
app.use('/api/products', productosRoute);
app.use('/api/categories', categoriasRoute);
app.use('/api/payments', paymentsRoute);
app.use('/api/users', usuariosRoute); // Add this line
app.use('/api/usuarios', usuariosRoute); // Aquí se monta el router para /api/usuarios

// Ruta raíz
app.get('/', (req, res) => {
  res.send('API de Tienda de Juegos');
});

// Tomar el puerto desde las variables de entorno o usar 3000 por defecto
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
