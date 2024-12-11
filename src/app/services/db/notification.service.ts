
import { Injectable } from '@angular/core';
import { Notification } from 'src/app/models';
import { supabase } from 'src/app/supabase/supabase.config';
import { BaseService, QueryResult, QueryResultList } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends BaseService<Notification> {
  protected tableName = 'notifications';

  async getUserNotifications(userId: string, unreadOnly = false): Promise<QueryResultList<Notification>> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    return await query;
  }

  async markAsRead(id: string): Promise<QueryResult<Notification>> {
    return await supabase
      .from(this.tableName)
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
  }

  async markAllAsRead(userId: string): Promise<QueryResultList<Notification>> {
    return await supabase
      .from(this.tableName)
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
      .select();
  }

  async delete(id: string): Promise<QueryResult<Notification>> {
    return await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select()
      .single();
  }
}
