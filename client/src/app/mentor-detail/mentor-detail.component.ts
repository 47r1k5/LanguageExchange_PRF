import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../shared/services/auth.service';
import { Mentor } from '../shared/model/Mentor';
import { Class } from '../shared/model/Class';

import { NavbarComponent } from '../shared/navbar/navbar.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-mentor-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, MatCardModule, MatButtonModule],
  templateUrl: './mentor-detail.component.html',
  styleUrls: ['./mentor-detail.component.scss']
})
export class MentorDetailComponent implements OnInit {
  mentor$!: Observable<Mentor>;

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
    this.mentor$ = this.route.paramMap.pipe(
      switchMap(params => this.authService.getMentorById(params.get('id')!))
    );
  }
}
