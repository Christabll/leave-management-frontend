import { provideRouter } from '@angular/router';
import { authRoutes } from './auth/auth-routing.module';
import { AdminDashboardComponent } from '../app/admin/admin-dashboard.component';

export const appConfig = {
  providers: [
    provideRouter([
      { path: '', redirectTo: 'auth/login', pathMatch: 'full' }, 
      ...authRoutes,
      { path: 'admin/dashboard', component: AdminDashboardComponent },
      { path: '**', redirectTo: 'auth/login' }, 
    ])
  ]
};
