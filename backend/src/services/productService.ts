import { Product, Category } from '../models';

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  page?: string | number;
  limit?: string | number;
  sort?: string;
}

export const productService = {
  async getAll(params: ProductQueryParams) {
    const { search, categoryId, minPrice, maxPrice, page = '1', limit = '9', sort } = params;

    const query: any = {};

    if (search) {
      query.name = { $regex: search.toString(), $options: 'i' };
    }

    if (categoryId) {
      if (typeof categoryId === 'string' && categoryId.includes(',')) {
        query.categoryId = { $in: categoryId.split(',').filter(Boolean) };
      } else {
        query.categoryId = categoryId;
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice.toString());
      if (maxPrice) query.price.$lte = parseFloat(maxPrice.toString());
    }

    let sortOption: any = { createdAt: -1 };
    if (sort) {
      if (sort === 'price_asc') sortOption = { price: 1 };
      else if (sort === 'price_desc') sortOption = { price: -1 };
      else if (sort === 'name_asc') sortOption = { name: 1 };
      else if (sort === 'name_desc') sortOption = { name: -1 };
    }

    const pageNum = parseInt(page.toString()) || 1;
    const limitNum = parseInt(limit.toString()) || 9;
    const skip = (pageNum - 1) * limitNum;

    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalProducts / limitNum);

    const formattedProducts = products.map(p => {
      const obj = p.toObject();
      return {
        ...obj,
        id: obj._id,
        category: obj.categoryId
      };
    });

    return {
      products: formattedProducts,
      totalProducts,
      totalPages,
      currentPage: pageNum,
      limit: limitNum
    };
  },

  async getById(id: string) {
    const product = await Product.findById(id).populate('categoryId', 'name slug');
    if (!product) {
      const error: any = new Error('Product does not exist.');
      error.statusCode = 404;
      throw error;
    }

    const obj = product.toObject();
    return {
      ...obj,
      id: obj._id,
      category: obj.categoryId
    };
  },

  async create(data: {
    name: string;
    price: number;
    stock: number;
    description?: string;
    image?: string;
    options?: any;
    categoryId: string;
  }) {
    const { name, price, stock, description, image, options, categoryId } = data;

    if (!name || price === undefined || stock === undefined || !categoryId) {
      const error: any = new Error('Please provide all required fields.');
      error.statusCode = 400;
      throw error;
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      const error: any = new Error('Invalid category.');
      error.statusCode = 400;
      throw error;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await Product.create({
      name,
      slug,
      price,
      stock,
      description,
      image,
      options: options || { colors: [], sizes: [] },
      categoryId: categoryId as any
    });

    return product;
  },

  async update(id: string, data: any) {
    const product = await Product.findById(id);
    if (!product) {
      const error: any = new Error('Product does not exist.');
      error.statusCode = 404;
      throw error;
    }

    if (data.categoryId) {
      const category = await Category.findById(data.categoryId);
      if (!category) {
        const error: any = new Error('Invalid category.');
        error.statusCode = 400;
        throw error;
      }
      product.categoryId = data.categoryId;
    }

    if (data.name) {
      product.name = data.name;
      product.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (data.price !== undefined) product.price = data.price;
    if (data.stock !== undefined) product.stock = data.stock;
    if (data.description !== undefined) product.description = data.description;
    if (data.image !== undefined) product.image = data.image;
    if (data.options !== undefined) product.options = data.options;

    await product.save();
    return product;
  },

  async delete(id: string) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      const error: any = new Error('Product does not exist.');
      error.statusCode = 404;
      throw error;
    }
    return true;
  }
};
