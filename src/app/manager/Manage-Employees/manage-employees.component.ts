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
  styleUrls: ['../manager-dashboard/manager-dashboard.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class ManageEmployeesComponent implements OnInit {
  users: any[] = [];
  departments: string[] = [];
  errorMessage: string | null = null;
  selectedUser: any = null;
  selectedUserBalance: any[] = [];

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

  viewBalance(user: any): void {
    this.selectedUser = user;
    const token = localStorage.getItem('token');
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    this.http.get<any>(`${this.leaveApiUrl}/admin/leave/balance/${user.id}`, headers).subscribe({
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
  }
}