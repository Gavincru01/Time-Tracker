// auth-login.ts
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router'; // 👈 import Router

@Component({
  selector: 'auth-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth-login.html',
  styleUrls: ['./auth-login.css'],
})
export class AuthLogin {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router // 👈 inject it here
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  get username() {
    return this.loginForm.get('username')!;
  }
  get password() {
    return this.loginForm.get('password')!;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.router.navigate(['/dashboard']); // 👈 now this works
  }
}
