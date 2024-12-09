import { Injectable } from '@angular/core';
import { Session, User as SupabaseAuthUser, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISupabaseUser, IUserProfile, User, UserRole } from '../data/user';
import { supabase } from '../supabase/supabase.config';
import { ToastService } from './util/toast.service';

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
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Check if profile exists
          const { data: existingProfile } = await this.supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          // If no profile exists, create one
          if (!existingProfile) {
            const { error: profileError } = await this.supabase
              .from('user_profiles')
              .insert({
                user_id: session.user.id,
                karen_level: 1,
                total_points: 0,
                role: UserRole.USER,
                push_notifications: false
              });

            if (profileError) {
              this.toastService.presentToast('Failed to create user profile', 'danger');
              throw profileError;
            }
          }

          // Load the user profile (either existing or newly created)
          await this.loadUserProfile(session.user.id);
        } catch (error) {
          console.error('Error in auth state change:', error);
          this.currentUser.next(null);
        }
      } else if (!session?.user) {
        this.currentUser.next(null);
      } else if (event === 'SIGNED_OUT') {
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
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const supabaseUser: ISupabaseUser = {
        id: user.id,
        email: user.email!,
        username: user.user_metadata?.['username'],
        created_at: user.created_at!,
        updated_at: user.updated_at || user.created_at!,
      };

      // Fetch profile data
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      // Combine the data into our User class (renamed from 'user' to 'userInstance')
      const userInstance = new User(supabaseUser, profile as IUserProfile);
      this.currentUser.next(userInstance);
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.toastService.presentToast('Failed to load user profile', 'danger');
      this.currentUser.next(null);
    }
  }


  async signUp(email: string, password: string, username: string): Promise<{
    data: { user: SupabaseAuthUser | null; session: Session | null } | null;
    error: Error | null;
  }> {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username } // Store username in user metadata
        }
      });

      if (authError) throw authError;

      // Return success - profile will be created on first sign in
      return { data: authData, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
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

    if (!currentUser.id) {
      throw new Error('Invalid user ID');
    }

    try {
      await this.updateProfile({
        push_notifications: !currentUser.pushNotifications
      });
    } catch (error) {
      console.error('Toggle notifications error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
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
