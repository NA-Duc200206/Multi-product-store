import { Schema, model, Document } from 'mongoose';

export interface ICartItem {
  productId: Schema.Types.ObjectId;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  color?: string;
  size?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'guest' | 'customer' | 'warehouse' | 'support' | 'sales' | 'admin' | 'super_admin';
  avatar?: string;
  cart: ICartItem[];
  wishlist: Schema.Types.ObjectId[];
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  color: { type: String },
  size: { type: String }
}, { _id: false });

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  role: {
    type: String,
    enum: ['guest', 'customer', 'warehouse', 'support', 'sales', 'admin', 'super_admin'],
    default: 'customer'
  },
  avatar: { type: String },
  cart: { type: [CartItemSchema], default: [] },
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  refreshTokens: { type: [String], default: [], select: false }
}, {
  timestamps: true
});

export const User = model<IUser>('User', UserSchema);
