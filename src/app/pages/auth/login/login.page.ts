import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, logIn, logOutOutline, personAdd } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService, AuthStateService, ToastService } from 'src/app/services';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonButtons, CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonText]
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
    addIcons({ logOutOutline, logIn, personAdd, arrowBackOutline });

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.authSubscription = this.authStateService.getCurrentUser().subscribe(user => {
      if (user) {
        this.router.navigate(['/tabs']);
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
        await this.router.navigate(['/tabs']);
      } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to login. Please try again.';
        await this.toastService.presentToast(errorMessage, 'danger');
      }
    } else {
      await this.toastService.presentToast('Please fill in all required fields correctly.', 'warning');
    }
  }

  async back() {
    await this.router.navigate(['/tabs']);
  }
}
