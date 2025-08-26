// app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthLogin } from './auth-login/auth-login';
import { Dashboard } from './dashboard/dashboard';
import { CreateAccount } from './create-account/create-account';
import { ForgotPassword } from './forgot-password/forgot-password';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: AuthLogin },
  { path: 'dashboard', component: Dashboard },
  { path: 'create-account', component: CreateAccount },
  { path: 'forgot-password', component: ForgotPassword },
];
