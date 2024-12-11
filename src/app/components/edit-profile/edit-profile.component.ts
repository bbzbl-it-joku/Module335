import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonTitle, IonToolbar, ModalController, IonAvatar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { User } from 'src/app/models';
import { AuthStateService, ToastService, UserProfileService } from 'src/app/services';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent, IonList, IonLabel, IonInput, IonIcon]
})
export class EditProfileComponent implements OnInit {
  @Input({ required: true }) user!: User;
  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private toastService: ToastService,
    private userProfileService: UserProfileService,
    private authStateService: AuthStateService
  ) {
    addIcons({ closeOutline });
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    if (this.user) {
      this.profileForm.patchValue({
        username: this.user.username,
        email: this.user.email,
      });
    }
  }

  async onSubmit() {
    if (this.profileForm.valid && this.user?.id) {
      try {
        await this.userProfileService.updateUser(this.user.id, this.profileForm.value.username, this.profileForm.value.email);

        const authUser = await this.authStateService.getUserMetadata();
        if (authUser) {
          // Get updated profile
          const { data: profile } = await this.userProfileService.getById(this.user.id);
          if (profile) {
            // Update auth state
            await this.authStateService.updateCurrentUser(authUser, profile);
          }
        }

        await this.toastService.presentToast('Profile updated successfully', 'success');
        this.dismissModal(true);
      } catch (error) {
        console.error('Error updating profile:', error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        await this.toastService.presentToast(errorMessage, 'danger');
      }
    }
  }

  dismissModal(updated: boolean = false) {
    this.modalCtrl.dismiss({
      updated
    });
  }
}
