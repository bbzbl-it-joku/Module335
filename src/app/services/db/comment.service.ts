
import { supabase } from 'src/app/supabase/supabase.config';
import { BaseService, QueryResult, QueryResultList } from './base.service';

export class CommentService extends BaseService<Comment> {
  protected tableName = 'comment';

  async getByReportId(reportId: string): Promise<QueryResultList<Comment>> {
    return await supabase
      .from(this.tableName)
      .select('*, user_profiles(*)')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });
  }

  async create(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'>): Promise<QueryResult<Comment>> {
    return await supabase
      .from(this.tableName)
      .insert(comment)
      .select()
      .single();
  }

  async update(id: string, content: string): Promise<QueryResult<Comment>> {
    return await supabase
      .from(this.tableName)
      .update({ content, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
  }

  async delete(id: string): Promise<QueryResult<Comment>> {
    return await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select()
      .single();
  }
}
