import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUserProfile, UserProfile, UserRole } from 'src/app/models';
import { supabase } from 'src/app/supabase/supabase.config';
import { BaseService, QueryResult } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService extends BaseService<UserProfile> {
  protected tableName = 'user_profiles';
  private currentProfile = new BehaviorSubject<IUserProfile | null>(null);

  getCurrentProfile(): Observable<IUserProfile | null> {
    return this.currentProfile.asObservable();
  }

  async createInitialProfile(userId: string): Promise<QueryResult<UserProfile>> {
    return await supabase
      .from(this.tableName)
      .insert({
        user_id: userId,
        total_points: 0,
        role: UserRole.User,
        push_notifications: false,
        device_token: '',
      })
      .select()
      .single();
  }

  async loadProfile(userId: string): Promise<void> {
    const { data, error } = await this.getById(userId);
    if (error) throw error;
    this.currentProfile.next(data);
  }

  async getRankings(): Promise<QueryResult<UserProfile[]>> {
    return await supabase
      .from(this.tableName)
      .select('user_id, total_points, role, push_notifications, device_token, created_at, updated_at')
      .order('total_points', { ascending: false })
      .limit(10);
  }

  async getById(userId: string): Promise<QueryResult<UserProfile>> {
    return await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .single();
  }

  async update(userId: string, updates: Partial<UserProfile>): Promise<QueryResult<UserProfile>> {
    if (updates.total_points !== undefined && updates.total_points < 0) {
      throw new Error('Total points must be greater than or equal to 0');
    }

    const result = await supabase
      .from(this.tableName)
      .update({ ...updates })
      .eq('user_id', userId)
      .select()
      .single();

    if (!result.error) {
      await this.loadProfile(userId);
    }

    return result;
  }

  async updateUser(userId: string, username: string | null, email: string | null): Promise<void> {
    try {
      if (username) {
        await supabase.auth.updateUser({ data: { username } });
      }

      if (email) {
        await supabase.auth.updateUser({ email });
      }
    }
    catch (error) {
      console.error('Error updating user:', error);
      throw error;
      return;
    }
    await this.loadProfile(userId);
  }

  async togglePushNotifications(userId: string, currentState: boolean): Promise<QueryResult<UserProfile>> {
    return this.update(userId, { push_notifications: !currentState });
  }
}
