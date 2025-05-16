import Order from '../models/Order.js';

export const createOrder = async (req, res) => {
  try {
    // Extract userId from authenticated request
    const userId = req.user?.id || req.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required to create an order' 
      });
    }

    // Create a new order with the userId included
    const orderData = {
      ...req.body,
      userId, // Add userId to the order data
    };

    // Calculate totals
    const items = orderData.items || [];
    const orderTotal = items.reduce((total, item) => 
      total + (item.price * item.quantity), 0);
    
    const tax = orderTotal * 0.08; // 8% tax rate
    const shippingCost = orderData.shippingCost || 15; // Default shipping cost
    const totalWithTaxAndShipping = orderTotal + tax + shippingCost;

    // Create the order with all calculated fields
    const newOrder = new Order({
      ...orderData,
      orderTotal,
      tax,
      shippingCost,
      totalWithTaxAndShipping,
      status: 'pending'
    });

    // Save the order to the database
    const savedOrder = await newOrder.save();
    
    // Return success response with the created order
    res.status(201).json({
      message: 'Order created successfully',
      order: savedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: 'Failed to create order', 
      error: error.message 
    });
  }
};


export const getOrders = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required to view orders' 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find orders for the specific user
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ userId });

    res.status(200).json({
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      debug: {
        userId,
        email: req.user?.email || 'N/A'
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      message: 'Failed to fetch orders', 
      error: error.message 
    });
  }
};


export const getAllOrders = async (req, res) => {
    try {
        // Check if user is admin (assuming middleware sets this)
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Add pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Add sorting
        const sortField = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.order === 'asc' ? 1 : -1;
        const sortOptions = { [sortField]: sortOrder };

        // Count total documents for pagination
        const total = await Order.countDocuments();
        
        const orders = await Order.find()
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        res.json({
            orders,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Get all orders error:', err);
        res.status(500).json({ 
            message: 'Error retrieving orders',
            error: err.message 
        });
    }
};


export const getOrderById = async (req, res) => {
    try {
        // Validate that the ID is a valid MongoDB ObjectId
        if (!(/^[0-9a-fA-F]{24}$/).test(req.params.id)) {
            return res.status(400).json({ message: 'Invalid order ID format' });
        }
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is authorized to view this order
        const isAdmin = req.user?.isAdmin;
        const isOwner = req.user?.id === order.userId?.toString() || 
                        req.user?.email?.toLowerCase() === order.customerEmail;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(order);
    } catch (err) {
        console.error('Get order by ID error:', err);
        res.status(500).json({ 
            message: 'Error retrieving order',
            error: err.message 
        });
    }
};


export const updateOrderStatus = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Validate that the ID is a valid MongoDB ObjectId
        if (!(/^[0-9a-fA-F]{24}$/).test(req.params.id)) {
            return res.status(400).json({ message: 'Invalid order ID format' });
        }

        const { status, trackingNumber } = req.body;
        
        // Validate status
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Prepare update object
        const updateData = { status };
        
        // Add tracking number if provided and status is shipped
        if (status === 'shipped' && trackingNumber) {
            updateData.trackingNumber = trackingNumber;
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ 
            message: 'Error updating order status',
            error: err.message 
        });
    }
};


export const getCustomerOrders = async (req, res) => {
    try {
        const userId = req.user?.id;
        const email = req.user?.email;
        
        // Add debugging to see what auth data we're working with
        console.log('User data in getCustomerOrders:', {
            userId,
            email,
            fullUserObject: req.user
        });
        
        if (!userId && !email) {
            return res.status(401).json({ 
                message: 'Unauthorized',
                debug: 'No userId or email found in request'
            });
        }
        
        // Add pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Add sorting (newest first by default)
        const sortField = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.order === 'asc' ? 1 : -1;
        const sortOptions = { [sortField]: sortOrder };
        
        // Query by both userId and email to catch all orders
        const query = {
            $or: [
                { userId: userId },
                { customerEmail: email?.toLowerCase() }
            ]
        };
        
        // Log the query we're using
        console.log('Order query:', JSON.stringify(query));
        
        // Add status filter if provided
        if (req.query.status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(req.query.status)) {
            query.status = req.query.status;
        }

        // Count total documents for pagination
        const total = await Order.countDocuments(query);
        
        // Log count result
        console.log('Total orders found:', total);
        
        const orders = await Order.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);
        
        // Log the found orders
        console.log(`Found ${orders.length} orders for user`);
        
        res.json({
            orders,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            },
            debug: {
                userId,
                email
            }
        });
    } catch (err) {
        console.error('Get customer orders error:', err);
        res.status(500).json({ 
            message: 'Error retrieving customer orders',
            error: err.message 
        });
    }
};


export const deleteOrder = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Validate that the ID is a valid MongoDB ObjectId
        if (!(/^[0-9a-fA-F]{24}$/).test(req.params.id)) {
            return res.status(400).json({ message: 'Invalid order ID format' });
        }

        const order = await Order.findByIdAndDelete(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Delete order error:', err);
        res.status(500).json({ 
            message: 'Error deleting order',
            error: err.message 
        });
    }
};