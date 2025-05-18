import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Observable, map } from 'rxjs';
import { User } from '../model/User';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  user$: Observable<User|null>;
  isMentor$: Observable<boolean>;

  constructor(private auth: AuthService, private router: Router) {
    this.user$     = this.auth.currentUser$;
    this.isMentor$ = this.auth.checkRole().pipe(map(role => role === 'mentor'));
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigateByUrl('/');
    });
  }
}
