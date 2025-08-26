import { Routes } from '@angular/router';
import { AuthLogin } from './auth-login/auth-login';
import { Dashboard } from './dashboard/dashboard';
import { CreateAccount } from './create-account/create-account';
import { ForgotPassword } from './forgot-password/forgot-password';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // ← default landing
  { path: 'login', component: AuthLogin },
  { path: 'dashboard', component: Dashboard },
  { path: 'create-account', component: CreateAccount },
  { path: 'forgot-password', component: ForgotPassword },
  { path: '**', redirectTo: 'login' }, // optional safety net
];
