import { provideRouter } from '@angular/router';
import { authRoutes } from './auth/auth-routing.module';
import { ManagerDashboardComponent } from '../app/manager/manager-dashboard.component';
import { staffRoutes } from './staff/staff-routes';
import { adminRoutes } from './admin/admin.routes'; 


export const appConfig = {
  providers: [
    provideRouter([
      { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
      ...authRoutes,
      ...adminRoutes,
      { path: 'manager/dashboard', component: ManagerDashboardComponent },
      ...staffRoutes, 
    ]),
  ],
};
