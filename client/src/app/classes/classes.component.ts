import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, switchMap, map } from 'rxjs/operators';
import { AuthService } from '../shared/services/auth.service';
import { Class } from '../shared/model/Class';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss']
})
export class ClassesComponent implements OnInit {
  filterForm!: FormGroup;
  classes$!: Observable<Class[]>;
  levelsList = ['BEGINNER','INTERMEDIATE','ADVANCED'];
  languagesList$: Observable<string[]>; 

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.languagesList$ = this.authService.getLanguages();
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      learnLanguage: [[]],
      speakLanguage: [[]],
      level: ['']
    });

    this.authService.currentUser$.pipe(
      map(u => u?.languages_learning || []),
      startWith([])
    ).subscribe(defaultLearn => this.filterForm.patchValue({ learnLanguage: defaultLearn }));

    this.authService.currentUser$.pipe(
      map(u => u?.languages_known || []),
      startWith([])
    ).subscribe(defaultSpeak => this.filterForm.patchValue({ speakLanguage: defaultSpeak }));

    this.classes$ = this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      switchMap(filters => this.authService.getClasses(filters))
    );
  }
}