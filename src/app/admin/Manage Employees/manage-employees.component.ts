import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

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
  selectedBalanceDetail: any = null;

  showRoleEditor: string | null = null;
  showDepartmentEditor: string | null = null;

  private authApiUrl = environment.authApiUrl;
  private leaveApiUrl = environment.leaveApiUrl;

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
    this.http.get<any>(`${this.authApiUrl}/users`).subscribe({
      next: res => {
        this.users = res.data;
        this.errorMessage = null;
      },
      error: err => {
        this.users = [];
        this.errorMessage = err?.error?.message || 'Failed to fetch users. Please try again later.';
      }
    });
  }

  fetchDepartments(): void {
    this.http.get<any>(`${this.authApiUrl}/departments`).subscribe({
      next: res => {
        this.departments = res.data.map((d: any) => d.name);
        this.errorMessage = null;
      },
      error: err => {
        this.departments = [];
        this.errorMessage = err?.error?.message || 'Failed to fetch departments. Please try again later.';
      }
    });
  }

  formatRole(role: string): string {
    return role?.toLowerCase().replace(/^[a-z]/, c => c.toUpperCase());
  }

  toggleRoleEditor(userId: string): void {
    this.showRoleEditor = this.showRoleEditor === userId ? null : userId;
  }

  toggleDepartmentEditor(userId: string): void {
    this.showDepartmentEditor = this.showDepartmentEditor === userId ? null : userId;
  }

  confirmRoleChange(user: any): void {
    const body = { role: user.role.toUpperCase() };
    this.http.put(`${this.authApiUrl}/users/${user.id}/role`, body).subscribe({
      next: () => {
        this.showRoleEditor = null;
        this.fetchUsers();
        this.errorMessage = null;
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Failed to update role. Please try again later.';
      }
    });
  }

  confirmDepartmentChange(user: any): void {
    const body = { department: user.department };
    this.http.put(`${this.authApiUrl}/users/${user.id}/department`, body).subscribe({
      next: () => {
        this.showDepartmentEditor = null;
        this.errorMessage = null;
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Failed to update department. Please try again later.';
      }
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

    this.http.get<any>(`${environment.managerApiUrl}/leave/balance/${user.id}`, headers).subscribe({
      next: res => {
        this.selectedUserBalance = res.data;
        this.errorMessage = null;
      },
      error: err => {
        this.selectedUserBalance = [];
        this.errorMessage = err?.error?.message || 'Failed to fetch user balance. Please try again later.';
      }
    });
  }

  closeBalanceModal(): void {
    this.selectedUser = null;
    this.selectedUserBalance = [];
    this.selectedBalanceDetail = null;
  }

  viewBalanceDetails(balance: any): void {
    this.selectedBalanceDetail = balance;
  }

  closeBalanceDetails(): void {
    this.selectedBalanceDetail = null;
  }
}