
import { Injectable } from '@angular/core';
import { Report, ReportStatus } from 'src/app/models';
import { supabase } from 'src/app/supabase/supabase.config';
import { BaseService, QueryResult, QueryResultList } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService extends BaseService<Report> {
  protected tableName = 'reports';

  async getAll(): Promise<QueryResultList<Report>> {
    return await supabase
      .from(this.tableName)
      .select('*, categories(*)')
      .order('created_at', { ascending: false });
  }

  async getPaged(page: number, limit: number): Promise<QueryResultList<Report>> {
    return await supabase
      .from(this.tableName)
      .select('*, categories(*)')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
  }

  async getById(id: string): Promise<QueryResult<Report>> {
    return await supabase
    .from(this.tableName)
    .select('*, categories(*)')
    .eq('id', id)
    .single();
  }

  async getByStatus(status: ReportStatus): Promise<QueryResultList<Report>> {
    return await supabase
      .from(this.tableName)
      .select('*, categories(*)')
      .eq('status', status)
      .order('created_at', { ascending: false });
  }

  async getByUserId(userId: string): Promise<QueryResultList<Report>> {
    return await supabase
      .from(this.tableName)
      .select('*, categories(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }

  async create(report: Omit<Report, 'id' | 'created_at' | 'updated_at'>): Promise<QueryResult<Report>> {
    return await supabase
      .from(this.tableName)
      .insert(report)
      .select()
      .single();
  }

  async updateStatus(id: string, status: ReportStatus): Promise<QueryResult<Report>> {
    return await supabase
      .from(this.tableName)
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
  }

  async update(id: string, report: Partial<Report>): Promise<QueryResult<Report>> {
    return await supabase
      .from(this.tableName)
      .update({ ...report, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
  }

  async delete(id: string): Promise<QueryResult<Report>> {
    return await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select()
      .single();
  }
}
