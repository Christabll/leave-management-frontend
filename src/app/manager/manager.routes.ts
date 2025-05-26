import { Routes } from '@angular/router';
import { ManagerDashboardComponent } from './manager-dashboard/manager-dashboard.component';
import { ROLES } from '../core/constants/roles';

export const managerRoutes: Routes = [
  {
    path: 'manager/dashboard',
    component: ManagerDashboardComponent,
    data: { roles: [ROLES.MANAGER] },
    children: [
      { path: '', redirectTo: 'employees', pathMatch: 'full' },
      {
        path: 'employees',
        loadComponent: () =>
          import('./Manage Employees/manage-employees.component')
            .then(m => m.ManageEmployeesComponent)
      },
      {
        path: 'approval',
        loadComponent: () =>
          import('./approve-reject-requests/leave-requests.component')
            .then(m => m.ApproveRejectLeaveComponent)
      },
      {
        path: 'leave-balances',
        loadComponent: () =>
          import('./Leave-balance/manager-leave-balances.component')
            .then(m => m.AdminLeaveBalancesComponent)
      },
      {
        path: 'public-holiday',
        loadComponent: () =>
          import('./Public Holidays/public-holidays.component')
            .then(m => m.PublicHolidayComponent)
      },
      {
        path: 'departments',
        loadComponent: () =>
          import('./Departments/departments.component')
            .then(m => m.DepartmentComponent)
      },
      {
        path: 'leave-types',
        loadComponent: () =>
          import('./leave-types/leave-types.component')
            .then(m => m.LeaveTypesComponent)
      }
    ]
  }
];
