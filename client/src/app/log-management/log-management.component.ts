import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { MatTableModule }    from '@angular/material/table';
import { MatButtonModule }   from '@angular/material/button';
import { NavbarComponent }   from '../shared/navbar/navbar.component';
import { Log }               from '../shared/model/Log';
import { Observable }        from 'rxjs';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-log-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    NavbarComponent
  ],
  templateUrl: './log-management.component.html',
  styleUrls: ['./log-management.component.scss']
})
export class LogManagementComponent implements OnInit {
  logs$!: Observable<Log[]>;
  displayedColumns = ['timestamp', 'level', 'message'];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.logs$ = this.authService.getLogs();
  }
}