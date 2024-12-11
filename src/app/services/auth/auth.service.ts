import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { firstValueFrom, Observable } from 'rxjs';
import { ISupabaseUser, User } from 'src/app/models';
import { AuthStateService, ToastService, UserProfileService } from 'src/app/services';
import { supabase } from 'src/app/supabase/supabase.config';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private initialized = false;

  constructor(
    private toastService: ToastService,
    private router: Router,
    private userProfileService: UserProfileService,
    private authStateService: AuthStateService
  ) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    if (this.initialized) return;

    try {
      // Set up auth listener first
      this.setupAuthListener();

      // Then check for existing session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.authStateService.clearCurrentUser();
    }
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const authUser: ISupabaseUser = {
        id: user.id,
        email: user.email!,
        username: user.user_metadata?.['username'],
        created_at: user.created_at!,
        updated_at: user.updated_at || user.created_at!,
      };

      await this.userProfileService.loadProfile(userId);
      const profile = await firstValueFrom(this.userProfileService.getCurrentProfile());

      if (!profile) throw new Error('Failed to load profile');

      await this.authStateService.updateCurrentUser(authUser, profile);
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
