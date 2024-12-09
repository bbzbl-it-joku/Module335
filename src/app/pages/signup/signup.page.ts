import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonText } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { personAdd, logIn } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,IonHeader,IonToolbar,IonTitle,IonContent,IonCard,IonCardHeader,IonCardTitle,IonCardSubtitle,IonCardContent,IonItem,IonLabel,IonInput,IonButton,IonIcon,IonText]
})
export class SignupPage implements OnInit, OnDestroy {
  signupForm: FormGroup;
  private authSubscription?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    addIcons({personAdd,logIn});

    this.signupForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Check if user is already logged in
    this.authSubscription = this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.router.navigate(['/tabs/tab1']);
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async signup() {
    if (this.signupForm.valid) {
      try {
        const { email, password, username } = this.signupForm.value;
        await this.authService.signUp(email, password, username);

        await this.toastService.presentToast('Account created successfully!', 'success');
        await this.router.navigate(['/tabs/tab1']);
      } catch (error) {
        console.error('Signup error:', error);
        let errorMessage = 'Failed to create account. Please try again.';

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        await this.toastService.presentToast(errorMessage, 'danger');
      }
    } else {
      await this.toastService.presentToast('Please fill in all required fields correctly.', 'warning');
    }
  }
}
