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
              console.log('✅ ManageEmployeesComponent loaded successfully');
              return m.ManageEmployeesComponent;
            })
            .catch(err => {
              console.error('❌ Failed to load ManageEmployeesComponent:', err);
              throw err; 
            })
      }
    ]
  }
];
