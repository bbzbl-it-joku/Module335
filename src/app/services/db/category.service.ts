
import { Category } from 'src/app/models';
import { supabase } from 'src/app/supabase/supabase.config';
import { BaseService, QueryResult, QueryResultList } from './base.service';

export class CategoryService extends BaseService<Category> {
  protected tableName = 'categories';

  async getAll(): Promise<QueryResultList<Category>> {
    return await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });
  }

  async getById(id: string): Promise<QueryResult<Category>> {
    return await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
  }

  async create(category: Omit<Category, 'id' | 'created_at'>): Promise<QueryResult<Category>> {
    return await supabase
      .from(this.tableName)
      .insert(category)
      .select()
      .single();
  }

  async update(id: string, category: Partial<Category>): Promise<QueryResult<Category>> {
    return await supabase
      .from(this.tableName)
      .update(category)
      .eq('id', id)
      .select()
      .single();
  }

  async delete(id: string): Promise<QueryResult<Category>> {
    return await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select()
      .single();
  }
}
