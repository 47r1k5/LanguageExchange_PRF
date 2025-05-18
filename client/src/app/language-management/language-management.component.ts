import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-language-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    NavbarComponent,
  ],
  templateUrl: './language-management.component.html',
  styleUrls: ['./language-management.component.scss'],
})
export class LanguageManagementComponent implements OnInit {
  languages$!: Observable<string[]>;
  displayedColumns = ['name', 'actions'];
  createForm!: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit() {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
    });
    this.loadLanguages();
  }

  loadLanguages() {
    this.languages$ = this.authService.getLanguages();
  }

  onCreate() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const name = this.createForm.value.name.trim();
    this.authService
      .createLanguage(name)
      .pipe(
        tap(() => {
          this.createForm.reset();
          this.loadLanguages();
        })
      )
      .subscribe();
  }

  deleteLanguage(name: string) {
    if (!confirm(`Delete language "${name}"?`)) return;
    this.authService
      .deleteLanguage(name)
      .pipe(tap(() => this.loadLanguages()))
      .subscribe();
  }
}
