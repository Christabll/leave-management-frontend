import { provideRouter } from '@angular/router';
import { authRoutes } from './auth/auth-routing.module';
import { staffRoutes } from './staff/staff.routes';
import { adminRoutes } from './admin/admin.routes'; 

import { provideHttpClient } from '@angular/common/http'; 
import { ReportsComponent } from './admin/Reports/reports.component';
import { managerRoutes } from './manager/manager.routes';

export const appConfig = {
  providers: [
    provideRouter([
      { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
      ...authRoutes,
      ...adminRoutes,
      ...staffRoutes, 
      ...managerRoutes,
      { path: 'admin/reports', component: ReportsComponent },
    ]),
    provideHttpClient(), 
  ],
};
