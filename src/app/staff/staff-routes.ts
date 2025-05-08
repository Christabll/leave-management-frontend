import { Routes } from '@angular/router';
import { StaffDashboardComponent } from './staff-dashboard/staff-dashboard.component';

export const staffRoutes: Routes = [
  {
    path: 'staff/dashboard',
    component: StaffDashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'balance',  
        pathMatch: 'full'
      },
      {
        path: 'balance',
        loadComponent: () =>
          import('./leave-balance/leave-balance.component').then((m) => m.LeaveBalanceComponent),
      },
      {
        path: 'apply',
        loadComponent: () =>
          import('./apply-leave/apply-leave.component').then((m) => m.ApplyLeaveComponent),
      },
    ],
  },
];
