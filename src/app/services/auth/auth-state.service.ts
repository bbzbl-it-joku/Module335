import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISupabaseUser, IUserProfile, User } from 'src/app/models';
import { supabase } from 'src/app/supabase/supabase.config';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private currentUser = new BehaviorSubject<User | null>(null);

  getCurrentUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  async updateCurrentUser(authUser: ISupabaseUser, profile: IUserProfile): Promise<void> {
    const user = new User(authUser, profile);
    this.currentUser.next(user);
  }

  clearCurrentUser(): void {
    this.currentUser.next(null);
  }

  async getUserMetadata(): Promise<ISupabaseUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return {
      id: user.id,
      email: user.email!,
      username: user.user_metadata?.['username'],
      created_at: user.created_at!,
      updated_at: user.updated_at || user.created_at!,
    };
  }
}
