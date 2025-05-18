import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

// Angular Material modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  login() {
    this.isLoading = true;
    setTimeout(() => {
      if (this.email && this.password) {
        this.errorMessage = '';
        this.authService.login(this.email, this.password).subscribe({
          next: (data) => {
            console.log(data);
            this.isLoading = false;
            this.router.navigateByUrl('/');
          },
          error: (err) => {
            console.error(err);
            this.isLoading = false;
            this.errorMessage = 'Login failed. Please try again.';
          }
        });
      } else {
        this.isLoading = false;
        this.errorMessage = 'Email and password are required.';
      }
    }, 1500);
  }

  navigate(to: string) {
    this.router.navigateByUrl(to);
  }
}