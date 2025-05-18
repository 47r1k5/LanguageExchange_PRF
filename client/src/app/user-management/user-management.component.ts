// src/app/user-management/user-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { User } from '../shared/model/User';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, NavbarComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent implements OnInit {
  users$!: Observable<User[]>;
  displayedColumns = [
    'first_name',
    'last_name',
    'email',
    'role',
    'languages_known',
    'languages_learning',
    'actions',
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.users$ = this.authService.getUsers();
  }

  deleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    this.authService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error('Failed to delete user', err),
    });
  }
}
