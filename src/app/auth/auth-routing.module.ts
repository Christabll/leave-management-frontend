import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CallbackComponent } from './callback/callback.component';

export const authRoutes: Routes = [
    {
      path: 'auth',
      children: [
        { path: 'login', component: LoginComponent },
        { path: 'callback', component: CallbackComponent },
      ]
    }
  ];
  