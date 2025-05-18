// src/app/class-management/class-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { MatTableModule }    from '@angular/material/table';
import { MatButtonModule }   from '@angular/material/button';
import { NavbarComponent }   from '../shared/navbar/navbar.component';
import { Class }             from '../shared/model/Class';
import { Observable }        from 'rxjs';
import { tap }               from 'rxjs/operators';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-class-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    NavbarComponent
  ],
  templateUrl: './class-management.component.html',
  styleUrls: ['./class-management.component.scss']
})
export class ClassManagementComponent implements OnInit {
  classes$!: Observable<Class[]>;
  displayedColumns = [
    'name',
    'learn_language',
    'speak_language',
    'level',
    'free_space',
    'startDate',
    'endDate',
    'loc',
    'teacher',
    'actions'
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadClasses();
  }

  loadClasses() {
    this.classes$ = this.authService.getAllClasses();
  }

  deleteClass(id: string) {
    if (!confirm('Are you sure you want to delete this class?')) return;
    this.authService.delClass(id)
      .pipe(tap(() => this.loadClasses()))
      .subscribe({
        error: err => console.error('Failed to delete class', err)
      });
  }
}
