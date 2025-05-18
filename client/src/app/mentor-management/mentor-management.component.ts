// src/app/mentor-management/mentor-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatSelectModule }    from '@angular/material/select';
import { MatButtonModule }    from '@angular/material/button';
import { MatTableModule }     from '@angular/material/table';
import { NavbarComponent }    from '../shared/navbar/navbar.component';
import { AuthService }        from '../shared/services/auth.service';
import { User }               from '../shared/model/User';
import { Observable }         from 'rxjs';
import { tap }                from 'rxjs/operators';

@Component({
  selector: 'app-mentor-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    NavbarComponent
  ],
  templateUrl: './mentor-management.component.html',
  styleUrls: ['./mentor-management.component.scss']
})
export class MentorManagementComponent implements OnInit {
  mentors$!: Observable<User[]>;
  displayedColumns = ['first_name','last_name','email','languages_known','actions'];

  // create-mentor form
  createForm!: FormGroup;
  languagesList$: Observable<string[]>;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.languagesList$ = this.authService.getLanguages();
  }

  ngOnInit() {
    this.buildForm();
    this.loadMentors();
  }

  buildForm() {
    this.createForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name:  ['', Validators.required],
      email:      ['', [Validators.required, Validators.email]],
      password:   ['', [Validators.required, Validators.minLength(6)]],
      languages_known:    [[], Validators.required],
    });
  }

  loadMentors() {
    this.mentors$ = this.authService.getAllMentors();
  }

  deleteMentor(id: string) {
    if (!confirm('Are you sure you want to delete this mentor?')) return;
    this.authService.deleteMentor(id)
      .pipe(tap(() => this.loadMentors()))
      .subscribe({
        error: err => console.error('Failed to delete mentor', err)
      });
  }

  onCreate() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const { first_name, last_name, email, password, languages_known, languages_learning } = this.createForm.value;
    const payload = { first_name, last_name, email, password, 
      languages_known, languages_learning, role: 'mentor' };

    this.authService.createMentor(payload).pipe(
      tap(() => {
        this.createForm.reset();
        this.buildForm();
        this.loadMentors();
      })
    ).subscribe({
      error: err => console.error('Failed to create mentor', err)
    });
  }
}
