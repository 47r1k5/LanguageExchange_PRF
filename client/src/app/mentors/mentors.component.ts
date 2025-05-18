/* src/app/mentors/mentors.component.ts */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { startWith, switchMap, map } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { Mentor } from '../shared/model/Mentor';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

// Shared Navbar
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-mentors',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NavbarComponent,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatListModule,
    MatCardModule
  ],
  templateUrl: './mentors.component.html',
  styleUrls: ['./mentors.component.scss']
})
export class MentorsComponent implements OnInit {
  filterForm!: FormGroup;
  mentors$!: Observable<Mentor[]>;
  languagesList$: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    // load languages for filter
    this.languagesList$ = this.authService.getLanguages();
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({ languages: [[]] });

    const userLangs$ = this.authService.currentUser$.pipe(
      map(user => user?.languages_learning || [])
    );

    const manualLangs$ = this.filterForm.get('languages')!.valueChanges.pipe(
      startWith(this.filterForm.get('languages')!.value)
    );

    this.mentors$ = combineLatest([userLangs$, manualLangs$]).pipe(
      switchMap(([userLangs, manualLangs]) => {
        const langs = manualLangs?.length ? manualLangs : userLangs;
        return this.authService.getMentors({ languages: langs });
      })
    );
  }
}
