import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

export const adminRoutes: Routes = [
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
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
    ]
  }
];
