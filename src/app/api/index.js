// api/index.js
require('dotenv').config({ path: './BD.env' }); // Cargar variables globalmente si es necesario
require('./Servidor/server');  // Arrancar el servidor


/*
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const productosRouter = require('./routes/productos');
app.use('/api/productos', productosRouter);
app.listen(3000, () => {
    console.log('API corriendo en http://localhost:3000');
});
*/