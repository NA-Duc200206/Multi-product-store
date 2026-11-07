import { Schema, model, Document } from 'mongoose';

export interface IProductOptions {
  colors: string[];
  sizes: string[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
  options: IProductOptions;
  categoryId: Schema.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductOptionsSchema = new Schema<IProductOptions>({
  colors: { type: [String], default: [] },
  sizes: { type: [String], default: [] }
}, { _id: false });

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  description: { type: String },
  image: { type: String },
  options: { type: ProductOptionsSchema, default: { colors: [], sizes: [] } },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  isDeleted: { type: Boolean, required: true, default: false }
}, {
  timestamps: true
});

export const Product = model<IProduct>('Product', ProductSchema);
