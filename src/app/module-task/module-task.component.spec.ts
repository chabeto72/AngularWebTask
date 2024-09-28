import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleTaskComponent } from './module-task.component';

describe('ModuleTaskComponent', () => {
  let component: ModuleTaskComponent;
  let fixture: ComponentFixture<ModuleTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleTaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
