import { Injectable } from '@angular/core';
import { Session, User as SupabaseAuthUser, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISupabaseUser, IUserProfile, User, UserRole } from '../data/user';
import { supabase } from '../supabase/supabase.config';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor(private toastService: ToastService) {
    this.supabase = supabase;
    this.loadUser();
    this.setupAuthListener();
  }

  private setupAuthListener(): void {
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      } else {
        this.currentUser.next(null);
      }
    });
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  private async loadUserProfile(userId: string): Promise<void> {
    try {
      // Fetch base user data
      let supabaseUser: ISupabaseUser;
      this.supabase.auth.getUser().then(user => {
        supabaseUser = {
          id: user?.data.user?.user_metadata?.['id'],
          email: user?.data.user?.email!,
          username: user?.data.user?.user_metadata?.['username'],
          created_at: user?.data.user?.created_at!,
          updated_at: user?.data.user?.updated_at || user?.data.user?.created_at!,
        }
      });

      // Fetch profile data
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      // Combine the data into our User class
      const user = new User(
        supabaseUser! as ISupabaseUser,
        profile as IUserProfile
      );

      this.currentUser.next(user);
    } catch (error) {
      this.toastService.presentToast('Failed to load user profile', 'danger');
      this.currentUser.next(null);
    }
  }

  async signUp(email: string, password: string, username: string): Promise<{
    data: { user: SupabaseAuthUser | null; session: Session | null } | null;
    error: Error | null;
  }> {
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password
    });

    if (authError) throw authError;

    if (authData?.user) {
      // Create initial user profile
      const { error: profileError } = await this.supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          karen_level: 1,
          total_points: 0,
          role: UserRole.USER,
          push_notifications: false
        });

      if (profileError) throw profileError;

      // Update username in users table
      const { error: userError } = await this.supabase
        .from('auth.users')
        .update({ username })
        .eq('id', authData.user.id);

      if (userError) throw userError;
    }

    return { data: authData, error: null };
  }

  async signIn(email: string, password: string): Promise<{
    data: { user: SupabaseAuthUser | null; session: Session | null } | null;
    error: Error | null;
  }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (data?.user) {
      await this.loadUserProfile(data.user.id);
    }

    return { data, error: null };
  }

  async updateProfile(updates: Partial<IUserProfile>): Promise<void> {
    const currentUser = this.currentUser.value;
    if (!currentUser) throw new Error('No user logged in');

    // Validate constraints
    if (updates.karen_level !== undefined && updates.karen_level < 1) {
      throw new Error('Karen level must be greater than or equal to 1');
    }
    if (updates.total_points !== undefined && updates.total_points < 0) {
      throw new Error('Total points must be greater than or equal to 0');
    }

    const { error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', currentUser.id);

    if (error) throw error;
    await this.loadUserProfile(currentUser.id);
  }

  async updateUsername(username: string): Promise<void> {
    const currentUser = this.currentUser.value;
    if (!currentUser) throw new Error('No user logged in');

    const { error } = await this.supabase
      .from('auth.users')
      .update({ username })
      .eq('id', currentUser.id);

    if (error) throw error;
    await this.loadUserProfile(currentUser.id);
  }

  async togglePushNotifications(): Promise<void> {
    const currentUser = this.currentUser.value;
    if (!currentUser) throw new Error('No user logged in');

    await this.updateProfile({
      push_notifications: !currentUser.pushNotifications
    });
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.currentUser.next(null);
  }

  async getSession() {
    return this.supabase.auth.getSession();
  }

  private async loadUser() {
    const { data: { session } } = await this.getSession();
    if (session?.user) {
      await this.loadUserProfile(session.user.id);
    }
  }
}
