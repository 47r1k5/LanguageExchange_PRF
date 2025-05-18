import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorDetailComponent } from './mentor-detail.component';

describe('MentorDetailComponent', () => {
  let component: MentorDetailComponent;
  let fixture: ComponentFixture<MentorDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
