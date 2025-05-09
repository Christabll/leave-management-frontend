import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LeaveType {
  id?: number;
  name: string;
  defaultBalance: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Component({
  selector: 'app-manage-employees',
  standalone: true,
  templateUrl: './manage-employees.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class ManageEmployeesComponent implements OnInit {
  users: any[] = [];
  departments: string[] = [];
  availableRoles: string[] = ['STAFF', 'MANAGER', 'ADMIN'];

  errorMessage: string | null = null;

  selectedUser: any = null;
  selectedUserBalance: any[] = [];

  showRoleEditor: string | null = null;
  showDepartmentEditor: string | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchUsers();
      this.fetchDepartments();
    }
  }

  fetchUsers(): void {
    this.http.get<any>('http://localhost:8081/api/v1/auth/users').subscribe({
      next: res => {
        this.users = res.data.map((u: any) => ({
          ...u,
          role: u.roles?.[0]?.replace('ROLE_', '') ?? '',
        }));
      },
      error: () => this.users = []
    });
  }

  fetchDepartments(): void {
    this.http.get<any>('http://localhost:8081/api/v1/auth/departments').subscribe({
      next: res => this.departments = res.data.map((d: any) => d.name),
      error: () => this.departments = []
    });
  }

  formatRole(role: string): string {
    return role?.replace('ROLE_', '')?.toLowerCase().replace(/^\w/, c => c.toUpperCase());
  }

  toggleRoleEditor(userId: string): void {
    this.showRoleEditor = this.showRoleEditor === userId ? null : userId;
  }

  toggleDepartmentEditor(userId: string): void {
    this.showDepartmentEditor = this.showDepartmentEditor === userId ? null : userId;
  }

  confirmRoleChange(user: any): void {
    const body = { role: user.role.toUpperCase() };
    this.http.put(`http://localhost:8081/api/v1/auth/users/${user.id}/role`, body).subscribe({
      next: () => {
        this.showRoleEditor = null;
        this.fetchUsers();
      }
    });
  }

  confirmDepartmentChange(user: any): void {
    const body = { department: user.department };
    this.http.put(`http://localhost:8081/api/v1/auth/users/${user.id}/department`, body).subscribe(() => {
      this.showDepartmentEditor = null;
    });
  }

  cancelRoleEdit(): void {
    this.showRoleEditor = null;
  }

  cancelDepartmentEdit(): void {
    this.showDepartmentEditor = null;
  }

  viewBalance(user: any): void {
    this.selectedUser = user;
    const token = localStorage.getItem('token');
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    this.http.get<any>(`http://localhost:8082/api/v1/leave/admin/leave/balance/${user.id}`, headers).subscribe({
      next: res => this.selectedUserBalance = res.data,
      error: () => this.selectedUserBalance = []
    });
  }

  closeBalanceModal(): void {
    this.selectedUser = null;
    this.selectedUserBalance = [];
  }
}
