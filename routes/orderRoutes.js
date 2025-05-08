import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getCustomerOrders
} from '../controllers/orderController.js';
import userAuth from '../middleware/userAuth.js'; 

const router = express.Router();

// Create a new order
router.post('/', createOrder);

// Get all orders
router.get('/', getAllOrders);

// Get orders for the logged-in customer
// Move this route BEFORE the /:id route
router.get('/customer/mine', userAuth, getCustomerOrders);

// Get a specific order by ID
router.get('/:id', getOrderById);

// Update order status
router.put('/:id/status', updateOrderStatus);

export default router;