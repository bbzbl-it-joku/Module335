import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonText, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { arrowBackOutline, logIn, personAdd } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService, AuthStateService, ToastService } from 'src/app/services';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonButtons, IonIcon, IonInput, IonButton, IonText, IonLabel, IonItem, IonCardContent, IonCardSubtitle, IonCardTitle, IonCard, IonCardHeader, IonContent, IonTitle, IonToolbar, IonHeader, CommonModule, ReactiveFormsModule,]
})
export class SignupPage implements OnInit, OnDestroy {
  signupForm: FormGroup;
  private authSubscription?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private authStateService: AuthStateService,
    private toastService: ToastService,
    private router: Router
  ) {
    addIcons({ arrowBackOutline, personAdd, logIn });

    this.signupForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
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

  async signup() {
    if (this.signupForm.valid) {
      try {
        const { email, password, username } = this.signupForm.value;
        const { error } = await this.authService.signUp(email, password, username);

        if (error) throw error;

        await this.toastService.presentToast('Account created successfully!', 'success');
        await this.router.navigate(['/tabs']);
      } catch (error) {
        console.error('Signup error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create account. Please try again.';
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
