import { Injectable } from '@angular/core';
import { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { Observable } from 'rxjs';
import { User } from '../../models';
import { supabase } from '../../supabase/supabase.config';
import { ToastService } from '../util/toast.service';
import { Router } from '@angular/router';
import { UserProfileService } from '../';
import { AuthStateService } from './auth-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private toastService: ToastService,
    private router: Router,
    private userProfileService: UserProfileService,
    private authStateService: AuthStateService
  ) {
    this.loadUser();
    this.setupAuthListener();
  }

  getCurrentUser(): Observable<User | null> {
    return this.authStateService.getCurrentUser();
  }

  async getSession(): Promise<{ data: { session: Session | null }, error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { data: { session: data.session }, error: null };
    } catch (error) {
      return { data: { session: null }, error: error as Error };
    }
  }

  private setupAuthListener(): void {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Check if profile exists
          const { data: existingProfile } = await this.userProfileService.getById(session.user.id);

          // If no profile exists, create one
          if (!existingProfile) {
            const { error: profileError } = await this.userProfileService.createInitialProfile(session.user.id);

            if (profileError) {
              this.toastService.presentToast('Failed to create user profile', 'danger');
              throw profileError;
            }
          }

          // Load the user profile
          await this.loadUserProfile(session.user.id);
        } catch (error) {
          console.error('Error in auth state change:', error);
          this.authStateService.clearCurrentUser();
        }
      } else if (!session?.user || event === 'SIGNED_OUT') {
        this.authStateService.clearCurrentUser();
      }
    });
  }

  private async loadUserProfile(userId: string): Promise<void> {
    try {
      const userMetadata = await this.authStateService.getUserMetadata();
      if (!userMetadata) throw new Error('No user found');

      await this.userProfileService.loadProfile(userId);
      const profile = await this.userProfileService.getById(userId);

      if (profile.error || !profile.data) throw new Error('Failed to load profile');

      await this.authStateService.updateCurrentUser(userMetadata, profile.data);
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.toastService.presentToast('Failed to load user profile', 'danger');
      this.authStateService.clearCurrentUser();
    }
  }

  async signUp(email: string, password: string, username: string): Promise<{
    data: { user: SupabaseAuthUser | null; session: Session | null } | null;
    error: Error | null;
  }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (authError) throw authError;

      await supabase.auth.updateUser({ data: { username } });
      return { data: authData, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async signIn(email: string, password: string): Promise<{
    data: { user: SupabaseAuthUser | null; session: Session | null } | null;
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (data?.user) {
        await this.loadUserProfile(data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateUsername(username: string): Promise<void> {
    const user = await this.authStateService.getUserMetadata();
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase.auth.updateUser({
      data: { username }
    });

    if (error) throw error;
    if (user.id) {
      await this.loadUserProfile(user.id);
    }
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    this.authStateService.clearCurrentUser();
    this.router.navigate(['/']);
  }

  private async loadUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await this.loadUserProfile(session.user.id);
    }
  }
}
