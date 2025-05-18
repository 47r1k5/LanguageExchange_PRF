import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { distinct, Observable } from 'rxjs';

@Component({
  selector: 'app-create-class',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  templateUrl: './create-class.component.html',
  styleUrls: ['./create-class.component.scss']
})
export class CreateClassComponent implements OnInit {
  createForm!: FormGroup;
  languagesList$: Observable<string[]>;
  levelsList = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.languagesList$ = this.authService.getLanguages();
  }

  ngOnInit(): void {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      learn_language: [[], Validators.required],
      speak_language: [[], Validators.required],
      level: ['', Validators.required],
      free_space: [1, [Validators.required, Validators.min(1)]],
      date: [null, Validators.required],           // single date picker
      startTime: ['', Validators.required],        // time picker
      endTime: ['', Validators.required],          // time picker
      loc: ['', Validators.required]
    }
  );
  }

  onCancel(){
    this.router.navigateByUrl('/my-classes');
  }

  onSubmit() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    // combine date and times into ISO strings
    const { date, startTime, endTime, ...rest } = this.createForm.value;
    const dateStr = date.toISOString().split('T')[0];
    const payload = {
      ...rest,
      startDate: new Date(`${dateStr}T${startTime}`).toISOString(),
      endDate:   new Date(`${dateStr}T${endTime}`).toISOString()
    };

    this.authService.createClass(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigateByUrl('/');
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Creation failed.';
      }
    });
  }
}