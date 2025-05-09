// api/routes/payments.js
const express = require('express');
const router = express.Router();
const PaymentController = require('../../../controllers/PaymentController');

// Ruta para crear una orden de PayPal
router.post('/create-order', PaymentController.createOrder);

// Ruta para capturar un pago autorizado
router.post('/capture-order', PaymentController.captureOrder);

// Ruta para cancelar una orden
router.post('/cancel-order', PaymentController.cancelOrder);

module.exports = router;