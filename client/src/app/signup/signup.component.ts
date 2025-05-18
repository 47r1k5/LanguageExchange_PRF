import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { Observable } from 'rxjs';

// Angular Material modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  /** List of all available languages for selects */
  languagesList$: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private authService: AuthService,
    private router: Router
  ) {
    // load the language options
    this.languagesList$ = this.authService.getLanguages();
  }

  ngOnInit() {
    this.signupForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        first_name: ['', [Validators.required, Validators.minLength(2)]],
        last_name: ['', [Validators.required, Validators.minLength(2)]],
        languages_known: [[], [Validators.required]],
        languages_learning: [[], [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: [
          this.mustMatch('password', 'confirmPassword'),
          this.languagesDistinct('languages_known', 'languages_learning')
        ]
      }
    );
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }
      matchingControl.setErrors(
        control.value !== matchingControl.value ? { mustMatch: true } : null
      );
    };
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
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    const { confirmPassword, ...payload } = this.signupForm.value;
    this.authService.register(payload).subscribe({
      next: (message: string) => {
        this.isLoading = false;
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          typeof err.error === 'string'
            ? err.error
            : err.error?.message || 'Registration failed';
      }
    });
  }

  goBack() {
    this.location.back();
  }
}