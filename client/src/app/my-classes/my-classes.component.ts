import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { Class } from '../shared/model/Class';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

// Shared Navbar
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-my-classes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    MatToolbarModule,
    MatListModule,
    MatCardModule
  ],
  templateUrl: './my-classes.component.html',
  styleUrls: ['./my-classes.component.scss']
})
export class MyClassesComponent implements OnInit {
  role$!: Observable<string | null>;
  myClasses$!: Observable<Class[]>;

  constructor(
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.role$ = this.authService.checkRole().pipe(
      map(role => role || null)
    );

    this.myClasses$ = combineLatest([
      this.authService.currentUser$,
      this.role$
    ]).pipe(
      switchMap(([user, role]) => {
        if (!user) {
          return of([] as Class[]);
        }
        if (role === 'mentor') {
          return this.authService.getMentorClasses(user._id);
        }
        return this.authService.getMyClasses();
      })
    );
  }
}
