import { CommonModule, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonSelectOption, IonText, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { OverlayEventDetail } from '@ionic/core';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { Category, Report, ReportStatus, User } from 'src/app/models';
import { AuthStateService, CategoryService, ReportService, ToastService } from 'src/app/services';

const DRAFT_STORAGE_KEY = 'report_draft';

@Component({
  selector: 'app-report-dialog',
  templateUrl: './report-dialog.component.html',
  styleUrls: ['./report-dialog.component.scss'],
  standalone: true,
  imports: [IonFab, IonFabButton, IonIcon, NgIf, NgFor, IonInput, IonText, IonHeader, IonToolbar, IonButtons, IonButton, IonContent, IonTitle, IonLabel, IonItem, IonModal, IonSelectOption, CommonModule, FormsModule, ReactiveFormsModule],
})
export class ReportDialogComponent implements OnInit, AfterViewInit {
  @Input() trigger?: string;
  @Input() triggerPostfix?: string;
  @Input({ required: true }) type!: 'create' | 'edit';
  @Input() report?: Report;
  @ViewChild(IonModal) modal!: IonModal;
  user: User | null = null;

  reportForm!: FormGroup;
  categories: Category[] = [];
  reportStatuses = Object.values(ReportStatus);
  private draftSaveTimeout?: any;

  constructor(
    private fb: FormBuilder,
    private authStateService: AuthStateService,
    private toastService: ToastService,
    private reportService: ReportService,
    private categoryService: CategoryService
  ) {
    addIcons({ add });
    this.initForm();
  }

  private initForm() {
    this.reportForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      category: [null, Validators.required],
      description: ['', [Validators.required, Validators.minLength(1)]],
      status: [ReportStatus.Pending],
      mediaUrls: [[]]
    });

    // Subscribe to form changes for draft saving
    this.reportForm.valueChanges.subscribe(() => {
      this.onFormChange();
    });
  }

  ngOnInit() {
    this.authStateService.getCurrentUser().subscribe(user => {
      this.user = user;
    });
    this.loadCategories();
    if (this.report) {
      this.reportForm.patchValue(this.report);
    } else {
      this.loadDraft();
    }
  }

  ngAfterViewInit() {
    if (!this.trigger) return;
    const triggerElement = document.querySelector(this.trigger);
    if (triggerElement) {
      triggerElement.addEventListener('click', () => {
        this.modal.present();
      });
    }
  }

  private async loadCategories() {
    this.categories = (await this.categoryService.getAll()).data as Category[];
  }

  private loadDraft() {
    const { userId, ...draftData } = this.reportForm.value;
    if (!this.user || !this.user.id === userId) {
      console.log('Clearing draft for different user');

      this.clearDraft();
      return;
    }
    if (draftData) {
      try {
        const draft = JSON.parse(draftData);
        // Convert date strings back to Date objects
        if (draft.createdAt) draft.createdAt = new Date(draft.createdAt);
        if (draft.updatedAt) draft.updatedAt = new Date(draft.updatedAt);
        this.reportForm.patchValue(draft);
      } catch (e) {
        console.error('Error loading draft:', e);
        this.clearDraft();
      }
    }
  }

  private saveDraft() {
    if (this.type === 'edit') return; // Don't save drafts in edit mode

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({...this.reportForm.value, userId: this.user?.id}));
    } catch (e) {
      console.error('Error saving draft:', e);
      this.toastService.presentToast('Error saving draft', 'danger');
    }
  }

  private clearDraft() {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  }

  onFormChange() {
    if (this.draftSaveTimeout) {
      clearTimeout(this.draftSaveTimeout);
    }
    this.draftSaveTimeout = setTimeout(() => {
      this.saveDraft();
    }, 500);
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.reportForm.invalid) {
      Object.keys(this.reportForm.controls).forEach(key => {
        const control = this.reportForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.toastService.presentToast('Please fill in all required fields', 'danger');
      return;
    }

    this.saveReport();
    this.clearDraft();
    this.modal.dismiss(this.reportForm.value, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<Report>>;
    if (ev.detail.role === 'confirm') {
      this.toastService.presentToastWithOptions({
        message: `Report "${ev.detail.data?.title ?? ''}" has been ${this.type === 'edit' ? 'edited' : 'created'}`
      });
    }
  }

  getModalTitle() {
    return this.type === 'edit' ? 'Edit Report' : 'Create Report';
  }

  private async saveReport() {
    const reportData = this.reportForm.value;
    if (this.type === 'edit' && this.report) {
      await this.reportService.update(this.report.id!, {
        ...reportData
      });
    } else {
      await this.reportService.create(reportData);
    }

    this.resetForm();
  }

  private resetForm() {
    this.reportForm.reset({
      title: '',
      description: '',
      category: null,
      status: ReportStatus.Pending,
      mediaUrls: []
    });
  }

  // Form getters for template
  get title() { return this.reportForm.get('title'); }
  get category() { return this.reportForm.get('category'); }
  get description() { return this.reportForm.get('description'); }
  get status() { return this.reportForm.get('status'); }
}
