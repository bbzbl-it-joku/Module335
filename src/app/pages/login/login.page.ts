import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logIn, personAdd } from 'ionicons/icons';
import { ToastService } from '../../services/util/toast.service';
import { AuthService } from '../../services/auth/auth.service';
import { AuthStateService } from '../../services/auth/auth-state.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonText]
})
export class LoginPage implements OnInit, OnDestroy {
  loginForm: FormGroup;
  private authSubscription?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private authStateService: AuthStateService,
    private toastService: ToastService,
    private router: Router
  ) {
    addIcons({ logIn, personAdd });

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.authSubscription = this.authStateService.getCurrentUser().subscribe(user => {
      if (user) {
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
  }

  async login() {
    if (this.loginForm.valid) {
      try {
        const { email, password } = this.loginForm.value;
        const { error } = await this.authService.signIn(email, password);

        if (error) throw error;

        await this.toastService.presentToast('Successfully logged in!', 'success');
        await this.router.navigate(['/']);
      } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to login. Please try again.';
        await this.toastService.presentToast(errorMessage, 'danger');
      }
    } else {
      await this.toastService.presentToast('Please fill in all required fields correctly.', 'warning');
    }
  }
}