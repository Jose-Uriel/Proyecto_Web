const express = require('express');
const router = express.Router();
const PaymentController = require('../../../controllers/PaymentController');

// Route for capturing an order after PayPal approval
router.post('/capture-order', PaymentController.captureOrder.bind(PaymentController));

// Add other payment routes here
router.post('/create-order', PaymentController.createOrder.bind(PaymentController));
router.post('/cancel-order', PaymentController.cancelOrder.bind(PaymentController));

module.exports = router;