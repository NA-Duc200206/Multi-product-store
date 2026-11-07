import { Category } from '../models';

export const categoryService = {
  async getAll() {
    const categories = await Category.find();
    return categories.map(c => {
      const obj = c.toObject();
      return {
        ...obj,
        id: obj._id
      };
    });
  },

  async create(name: string, description?: string) {
    if (!name) {
      const error: any = new Error('Name is required.');
      error.statusCode = 400;
      throw error;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const category = await Category.create({ name, slug, description });
    return category;
  },

  async update(id: string, name?: string, description?: string) {
    const category = await Category.findById(id);
    if (!category) {
      const error: any = new Error('Category not found.');
      error.statusCode = 404;
      throw error;
    }

    if (name) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (description !== undefined) {
      category.description = description;
    }

    await category.save();
    return category;
  },

  async delete(id: string) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      const error: any = new Error('Category not found.');
      error.statusCode = 404;
      throw error;
    }
    return true;
  }
};
