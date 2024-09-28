import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleUserComponent } from './module-user.component';

describe('ModuleUserComponent', () => {
  let component: ModuleUserComponent;
  let fixture: ComponentFixture<ModuleUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
