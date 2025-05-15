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
          import('./Manage-Employees/manage-employees.component')
            .then(m => {
              console.log('ManageEmployeesComponent loaded successfully');
              return m.ManageEmployeesComponent;
            })
            .catch(err => {
              console.error('Failed to load ManageEmployeesComponent:', err);
              throw err;
            })
      },
    ]
  }
];
