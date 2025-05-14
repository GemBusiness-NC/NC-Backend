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

// GET /api/orders/debug (Temporary endpoint for debugging)
router.get('/debug/all', userAuth, async (req, res) => {
  // Check if user is admin
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  try {
    const allOrders = await Order.find({});
    res.json({
      totalOrders: allOrders.length,
      orders: allOrders
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error retrieving orders',
      error: err.message
    });
  }
});

// Add this debug endpoint to your routes file
router.get('/debug/emails', userAuth, async (req, res) => {
  // Check if user is admin
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  try {
    // Get all unique customer emails from orders
    const orders = await Order.find({}, 'customerEmail');
    const emails = orders.map(order => order.customerEmail);
    const uniqueEmails = [...new Set(emails)];
    
    res.json({
      totalOrders: orders.length,
      uniqueEmails: uniqueEmails
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error retrieving order emails',
      error: err.message
    });
  }
});

export default router;