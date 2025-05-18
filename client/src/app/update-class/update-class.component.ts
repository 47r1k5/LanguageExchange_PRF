import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../shared/services/auth.service';
import { Class } from '../shared/model/Class';

// Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatSelectModule }    from '@angular/material/select';
import { MatDatepickerModule }from '@angular/material/datepicker';
import { MatNativeDateModule }from '@angular/material/core';
import { MatButtonModule }    from '@angular/material/button';

// Navbar
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-update-class',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  templateUrl: './update-class.component.html',
  styleUrls: ['./update-class.component.scss']
})
export class UpdateClassComponent implements OnInit {
  updateForm!: FormGroup;
  class$!: Observable<Class>;
  errorMessage = '';
  isLoading = false;
  levelsList = ['BEGINNER','INTERMEDIATE','ADVANCED'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Initialize form
    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      level: ['', Validators.required],
      free_space: [1, [Validators.required, Validators.min(1)]],
      date: [null, Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      loc: ['', Validators.required]
    });

    // Load existing class and patch form
    this.class$ = this.route.paramMap.pipe(
      switchMap(params => this.authService.getClassById(params.get('id')!))
    );

    this.class$.subscribe(c => {
      // patch form values
      this.updateForm.patchValue({
        name: c.name,
        description: c.description,
        level: c.level,
        free_space: c.free_space,
        date: new Date(c.startDate),
        startTime: new Date(c.startDate).toISOString().split('T')[1].substr(0,5),
        endTime:   new Date(c.endDate).toISOString().split('T')[1].substr(0,5),
        loc: c.loc
      });
    });
  }

  onCancel(){
    this.router.navigateByUrl(`/class/${this.route.snapshot.paramMap.get('id')}`);
  }

  onSubmit() {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id')!;
    const { date, startTime, endTime, ...rest } = this.updateForm.value;
    const dateStr = date.toISOString().split('T')[0];
    const payload = {
      ...rest,
      startDate: `${dateStr}T${startTime}:00.000Z`,
      endDate:   `${dateStr}T${endTime}:00.000Z`
    };

    this.authService.updateClass(id, payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigateByUrl(`/class/${id}`);
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Update failed.';
      }
    });
  }
}