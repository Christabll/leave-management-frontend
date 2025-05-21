import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ROLES } from '../core/constants/roles';

export const adminRoutes: Routes = [
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    data: { roles: [ROLES.ADMIN, ROLES.MANAGER] },
    children: [
      { path: '', redirectTo: 'employees', pathMatch: 'full' },
      {
        path: 'employees',
        loadComponent: () =>
          import('./Manage Employees/manage-employees.component')
            .then(m => {
              console.log('ManageEmployeesComponent loaded successfully');
              return m.ManageEmployeesComponent;
            })
            .catch(err => {
              console.error('Failed to load ManageEmployeesComponent:', err);
              throw err;
            })
      },
      {
        path: 'approval',
        loadComponent: () =>
          import('./approve-reject-requests/leave-requests.component')
            .then(m => {
              console.log('LeaveRequestsComponent loaded successfully');
              return m.ApproveRejectLeaveComponent;
            })
            .catch(err => {
              console.error('Failed to load LeaveRequestsComponent:', err);
              throw err;
            })
      },
      {
        path: 'leave-types',
        loadComponent: () =>
          import('./leave-types/leave-types.component')
            .then(m => m.LeaveTypesComponent)
            .catch(err => {
              console.error('Failed to load LeaveTypesComponent:', err);
              throw err;
            })
      },
      {
        path: 'departments',
        loadComponent: () =>
          import('./Departments/departments.component')
            .then(m => m.DepartmentComponent)
            .catch(err => {
              console.error('Failed to load DepartmentComponent:', err);
              throw err;
            })
      },
      {
        path: 'leave-balances',
        loadComponent: () =>
          import('./Leave-balance/admin-leave-balances.component')
            .then(m => {
              console.log('AdminLeaveBalancesComponent loaded successfully');
              return m.AdminLeaveBalancesComponent;
            })
            .catch(err => {
              console.error('Failed to load AdminLeaveBalancesComponent:', err);
              throw err;
            })
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./Reports/reports.component')
            .then(m => m.ReportsComponent)
            .catch(err => {
              console.error('Failed to load ReportsComponent:', err);
              throw err;
            })
      },

      {
        path: 'public-holiday',
        loadComponent: () =>
          import('./Public Holidays/public-holidays.component')
            .then(m => m.PublicHolidayComponent)
            .catch(err => {
              console.error('Failed to load PublicHolidayComponent:', err);
              throw err;
            })
      }
    ]
  }
];
