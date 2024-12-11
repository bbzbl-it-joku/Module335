import { Category } from './types';
import { categorySchema } from './schemas';

export class CategoryModel {
  private data: Category;

  constructor(data: Omit<Category, 'id' | 'createdAt'>) {
    this.data = categorySchema.parse(data);
  }

  public toJSON(): Category {
    return this.data;
  }
}
