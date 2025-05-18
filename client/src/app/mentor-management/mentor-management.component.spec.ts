import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorManagementComponent } from './mentor-management.component';

describe('MentorManagementComponent', () => {
  let component: MentorManagementComponent;
  let fixture: ComponentFixture<MentorManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
