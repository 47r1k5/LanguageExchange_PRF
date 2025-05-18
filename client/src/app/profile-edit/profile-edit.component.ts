import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { User } from '../shared/model/User';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  errorMessage = '';
  original!: User;
  languagesList$: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.languagesList$ = this.authService.getLanguages();
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.original = user;
        this.form = this.fb.group(
          {
            first_name: [user.first_name],
            last_name: [user.last_name],
            languages_known: [user.languages_known],
            languages_learning: [user.languages_learning]
          },
          {
            validators: [
              this.languagesDistinct('languages_known', 'languages_learning')
            ]
          }
        );
        this.form.updateValueAndValidity();
      }
    });
  }

  languagesDistinct(knownControl: string, learningControl: string) {
    return (formGroup: FormGroup) => {
      const known = formGroup.controls[knownControl].value as string[];
      const learn = formGroup.controls[learningControl].value as string[];
      const duplicates = known.filter((lang) => learn.includes(lang));
      const learning = formGroup.controls[learningControl];
      if (duplicates.length > 0) {
        learning.setErrors({ duplicateLanguage: true });
      } else if (learning.hasError('duplicateLanguage')) {
        learning.setErrors(null);
      }
    };
  }

  onSubmit() {
    if (!this.form) return;
    this.isLoading = true;
    this.errorMessage = '';

    const vals = this.form.value;
    const payload: Partial<User> = {
      first_name: vals.first_name || this.original.first_name,
      last_name: vals.last_name || this.original.last_name,
      languages_known: vals.languages_known?.length
        ? vals.languages_known
        : this.original.languages_known,
      languages_learning: vals.languages_learning?.length
        ? vals.languages_learning
        : this.original.languages_learning
    };

    this.authService.updateProfile(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigateByUrl('/profile');
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message || 'Update failed. Please try again.';
      }
    });
  }

  onCancel() {
    this.router.navigateByUrl('/profile');
  }
}