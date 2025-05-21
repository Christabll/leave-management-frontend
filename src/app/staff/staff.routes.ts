import { Routes } from '@angular/router';
import { StaffDashboardComponent } from './staff-dashboard/staff-dashboard.component';
import { ROLES } from '../core/constants/roles';

export const staffRoutes: Routes = [
  {
    path: 'staff',
    children: [
      {
        path: 'dashboard',
        component: StaffDashboardComponent,
        data: { roles: [ROLES.STAFF] },
        children: [
          { path: '', redirectTo: 'balance', pathMatch: 'full' },
          {
            path: 'balance',
            loadComponent: () =>
              import('./leave-balance/leave-balance.component')
                .then(m => m.LeaveBalanceComponent)
          },
          {
            path: 'apply',
            loadComponent: () =>
              import('./apply-leave/apply-leave.component')
                .then(m => m.ApplyLeaveComponent)
          },
          {
            path: 'public-holidays',
            loadComponent: () =>
              import('./Public Holidays/public-holidays.component')
                .then(m => m.PublicHolidayComponent)
          }
        ]
      }
    ]
  }
]; 