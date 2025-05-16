import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Add user ID reference field
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',  // Reference to your user model
    required: false, // Not required for backward compatibility with existing orders
  },
  customerName: { type: String, required: true, trim: true },
  customerEmail: { type: String, required: true, trim: true, lowercase: true },
  shippingAddress: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'USA' }
  },
  paymentMethod: {type: String,required: true,
    enum: ['credit_card', 'paypal', 'bank_transfer'],
    default: 'credit_card'
  },
  items: [{
    productId: {type: String,required: true},
    name: {type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  }],
  orderTotal: { type: Number, required: true, min: 0 },
  tax: {
    type: Number,
    default: function() {
      return this.orderTotal * 0.08; // 8% tax
    }
  },
  shippingCost: { type: Number,
    default: 15.00
  },
  totalWithTaxAndShipping: {
    type: Number,
    default: function() {
      return this.orderTotal + this.tax + this.shippingCost;
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    default: null
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for frontend compatibility
orderSchema.virtual('id').get(function() {
  return this._id.toString();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;