import { Schema, model, Document } from 'mongoose';

export interface IOrderItem {
  productId: Schema.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
}

export interface IOrderStatusHistory {
  status: string;
  timestamp: Date;
  note?: string;
}

export interface IOrder extends Document {
  userId: Schema.Types.ObjectId;
  shippingAddress: string;
  billingAddress?: string;
  paymentMethod: 'cod' | 'vnpay';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'pending' | 'confirmed' | 'packaging' | 'shipping' | 'delivered' | 'completed' | 'cancelled' | 'refund_requested' | 'refund_completed';
  items: IOrderItem[];
  totalAmount: number;
  statusHistory: IOrderStatusHistory[];
  vnpayTxnRef?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  color: { type: String },
  size: { type: String }
}, { _id: false });

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String }
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  shippingAddress: { type: String, required: true },
  billingAddress: { type: String },
  paymentMethod: { type: String, enum: ['cod', 'vnpay'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'packaging', 'shipping', 'delivered', 'completed', 'cancelled', 'refund_requested', 'refund_completed'],
    default: 'pending'
  },
  items: { type: [OrderItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  statusHistory: { type: [OrderStatusHistorySchema], default: [] },
  vnpayTxnRef: { type: String }
}, {
  timestamps: true
});

export const Order = model<IOrder>('Order', OrderSchema);
