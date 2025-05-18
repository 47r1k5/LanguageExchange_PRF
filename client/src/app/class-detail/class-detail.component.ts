// src/app/class-detail/class-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { AuthService } from '../shared/services/auth.service';
import { Class } from '../shared/model/Class';
import { User } from '../shared/model/User';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

// Navbar
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
  ],
  templateUrl: './class-detail.component.html',
  styleUrls: ['./class-detail.component.scss'],
})
export class ClassDetailComponent implements OnInit {
  class$!: Observable<Class>;
  currentUser$!: Observable<User | null>;
  isTeacher$!: Observable<boolean>;
  isEnrolled$!: Observable<boolean>;
  canEnroll$!: Observable<boolean>;
  errorMessage = '';

  // for student‐view table
  displayedColumns = ['name', 'email', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.class$ = this.route.paramMap.pipe(
      switchMap((params) => this.authService.getClassById(params.get('id')!))
    );

    this.isTeacher$ = combineLatest([this.class$, this.currentUser$]).pipe(
      map(([c, u]) => !!u && c.teacherId._id === u._id)
    );
    this.isEnrolled$ = combineLatest([this.class$, this.currentUser$]).pipe(
      map(([c, u]) => !!u && c.studentsIds.some((s: any) => s._id === u._id))
    );
    this.canEnroll$ = combineLatest([this.class$, this.currentUser$]).pipe(
      map(
        ([c, u]) =>
          !!u &&
          u.languages_learning.includes(c.learn_language) &&
          u.languages_known.includes(c.speak_language)
      )
    );
  }

  onEnroll() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.errorMessage = '';
    this.authService.enrollInClass(id).subscribe({
      next: () => this.refresh(),
      error: (err) =>
        (this.errorMessage = err.error?.message || 'Enroll failed.'),
    });
  }

  onLeave() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.errorMessage = '';
    this.authService.leaveClass(id).subscribe({
      next: () => this.refresh(),
      error: (err) =>
        (this.errorMessage = err.error?.message || 'Leave failed.'),
    });
  }

  kickStudent(classId: string, studentId: string) {
    this.errorMessage = '';
    this.authService
      .kickStudent(classId, studentId)
      .pipe(
        tap({
          error: (err) =>
            (this.errorMessage = err.error?.message || 'Kick failed.'),
        })
      )
      .subscribe((updated) => {
        this.class$ = this.authService.getClassById(updated._id);
      });
  }

  onDelete() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.authService.deleteClass(id).subscribe({
      next: () => this.router.navigateByUrl('/my-classes'),
      error: (err) => {
        this.errorMessage = err.error?.message || 'Delete failed.';
      },
    });
  }

  onUpdate() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.router.navigateByUrl(`/mentor/updateClass/${id}`);
  }

  private refresh() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.class$ = this.authService.getClassById(id);
  }
}
