import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getCustomerOrders,
  deleteOrder
} from '../controllers/orderController.js';
import userAuth from '../middleware/userAuth.js';
import Order from '../models/Order.js';  // Add this import

const router = express.Router();

// Public routes
// Create a new order
router.post('/',userAuth, createOrder);

// Protected routes (require authentication)
// Get orders for the logged-in customer (must be before /:id route)
router.get('/customer', userAuth, getCustomerOrders);

// Admin routes
// Get all orders - admin only
router.get('/', userAuth, getAllOrders);

// Update order status - admin only
router.patch('/:id/status', userAuth, updateOrderStatus);

// Delete order - admin only
router.delete('/:id', userAuth, deleteOrder);

// Mixed access routes
// Get a specific order by ID - user can access their own orders, admin can access any
router.get('/:id', userAuth, getOrderById);

export default router;