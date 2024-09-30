import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@core';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { MatButtonModule } from '@angular/material/button';
import { NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.scss'],
    standalone: true,
    imports: [
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatFormFieldModule,
        NgClass,
        MatButtonModule,
    ],
})
export class SigninComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  loginForm!: UntypedFormGroup;
  submitted = false;
  error = '';
  hide = true;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    super();
  }
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      documentNumber: [
        '1030525189',
        [Validators.required],
      ],
      password: ['admin', Validators.required],
    });
  }

  get form(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    this.error = '';
    if (this.loginForm.invalid) {
      this.error = 'Usuario y contraseña Invalidos !! !';
      return;
    } else {
      this.subs.sink = this.authService
        .login(this.form['documentNumber'].value, this.form['password'].value)
        .subscribe(
          (res) => {
            if (res) {
              const token = this.authService.currentUserValue.token;
              if (token) {
                this.router.navigate(['/task']);
              }
            } else {
              this.error = 'Contraseña invalida';
            }
          },
          (error) => {
            this.error = error;
            this.submitted = false;
          }
        );
    }
  }
}
