import Order from '../models/Order.js';

// Create Order (Simplified)
export const createOrder = async (req, res) => {
    try {
        const { customerName, customerEmail, shippingAddress, items } = req.body;

        if (!customerName || !customerEmail || !shippingAddress || !items?.length) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const order = new Order({
            customerName,
            customerEmail,
            shippingAddress,
            items,
            status: 'pending'
        });

        const saved = await order.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ message: 'Error creating order' });
    }
};

// Get All Orders (Simplified)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error getting orders' });
    }
};

// Get Order By ID (Simplified)
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Error getting order' });
    }
};

// Update Order Status (Simplified)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Error updating status' });
    }
};

// Get Orders for Logged-in Customer (Simplified)
export const getCustomerOrders = async (req, res) => {
    try {
        const email = req.user?.email;
        if (!email) return res.status(401).json({ message: 'Unauthorized' });

        const orders = await Order.find({ customerEmail: email });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error getting customer orders' });
    }
};
