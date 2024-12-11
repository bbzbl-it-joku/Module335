
import { supabase } from 'src/app/supabase/supabase.config';
import { BaseService, QueryResult } from './base.service';

export class LocationService extends BaseService<Location> {
  protected tableName = 'location';

  async getByReportId(reportId: string): Promise<QueryResult<Location>> {
    return await supabase
      .from(this.tableName)
      .select('*')
      .eq('report_id', reportId)
      .single();
  }

  async create(location: Omit<Location, 'id' | 'created_at' | 'updated_at'>): Promise<QueryResult<Location>> {
    return await supabase
      .from(this.tableName)
      .insert(location)
      .select()
      .single();
  }

  async update(id: string, location: Partial<Location>): Promise<QueryResult<Location>> {
    return await supabase
      .from(this.tableName)
      .update({ ...location, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
  }

  async delete(id: string): Promise<QueryResult<Location>> {
    return await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select()
      .single();
  }
}
