import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CallbackComponent } from './callback/callback.component';
import { AdminDashboardComponent } from '../admin/admin-dashboard/admin-dashboard.component';
import { ManagerDashboardComponent } from '../manager/manager-dashboard.component';
import { StaffDashboardComponent } from '../staff/staff-dashboard/staff-dashboard.component';


export const authRoutes: Routes = [
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'callback', component: CallbackComponent },
    ]
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent 
  },
  {
    path: 'manager/dashboard',
    component: ManagerDashboardComponent
  },
  {
    path: 'staff/dashboard',
    component: StaffDashboardComponent
  }
];
