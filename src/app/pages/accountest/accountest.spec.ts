import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Accountest } from './accountest';

describe('Accountest', () => {
  let component: Accountest;
  let fixture: ComponentFixture<Accountest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Accountest],
    }).compileComponents();

    fixture = TestBed.createComponent(Accountest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
