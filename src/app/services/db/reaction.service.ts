
import { Injectable } from '@angular/core';
import { Reaction, ReactionType } from 'src/app/models';
import { supabase } from 'src/app/supabase/supabase.config';
import { BaseService, QueryResult, QueryResultList } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class ReactionService extends BaseService<Reaction> {
  protected tableName = 'reaction';

  async getByReportId(reportId: string): Promise<QueryResultList<Reaction>> {
    return await supabase
      .from(this.tableName)
      .select('*, user_profiles(*)')
      .eq('report_id', reportId);
  }

  async getUserReaction(reportId: string, userId: string): Promise<QueryResult<Reaction>> {
    return await supabase
      .from(this.tableName)
      .select('*')
      .eq('report_id', reportId)
      .eq('user_id', userId)
      .single();
  }

  async create(reaction: Omit<Reaction, 'id' | 'created_at' | 'updated_at'>): Promise<QueryResult<Reaction>> {
    return await supabase
      .from(this.tableName)
      .insert(reaction)
      .select()
      .single();
  }

  async update(id: string, reactionType: ReactionType): Promise<QueryResult<Reaction>> {
    return await supabase
      .from(this.tableName)
      .update({ reaction_type: reactionType, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
  }

  async delete(id: string): Promise<QueryResult<Reaction>> {
    return await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select()
      .single();
  }
}
