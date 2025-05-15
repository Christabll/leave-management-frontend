import { provideRouter } from '@angular/router';
import { authRoutes } from './auth/auth-routing.module';
import { staffRoutes } from './staff/staff-routes';
import { adminRoutes } from './admin/admin.routes'; 
import { managerRoutes } from './manager/manager.routes';
import { provideHttpClient } from '@angular/common/http'; 

export const appConfig = {
  providers: [
    provideRouter([
      { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
      ...authRoutes,
      ...adminRoutes,
      ...managerRoutes,
      ...staffRoutes, 
    ]),
    provideHttpClient(), 
  ],
};
