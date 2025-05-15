import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ROLES } from '../../core/constants/roles';

interface Department {
  id?: string;
  name: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './departments.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.css']
})
export class DepartmentComponent implements OnInit {
  departments: Department[] = [];
  showAddForm = false;
  name = '';
  isSubmitting = false;
  errorMessage: string | null = null;
  userRole: string = '';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.userRole = user.roles?.[0] || '';
      if (this.userRole === ROLES.ADMIN || this.userRole === ROLES.MANAGER) {
        this.fetchDepartments();
      } else {
        this.errorMessage = 'You do not have permission to access this page.';
      }
    }
  }

  fetchDepartments(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    
    this.http.get<ApiResponse<Department[]>>(`${environment.authApiUrl}/departments`, { headers })
      .subscribe({
        next: res => {
          this.departments = res.data;
          this.errorMessage = null;
        },
        error: err => {
          console.error('Error fetching departments:', err);
          this.departments = [];
          this.errorMessage = err?.error?.message || 'Failed to fetch departments. Please try again later or contact support if the problem persists.';
        }
      });
  }

  openAddForm(): void {
    if (this.userRole !== ROLES.ADMIN) {
      this.errorMessage = 'Only administrators can add new departments.';
      return;
    }
    this.showAddForm = true;
    this.errorMessage = null;
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.name = '';
    this.errorMessage = null;
  }

  createDepartment(): void {
    if (!this.name.trim()) {
      this.errorMessage = 'Please enter a department name.';
      return;
    }

    if (this.userRole !== ROLES.ADMIN) {
      this.errorMessage = 'Only administrators can add new departments.';
      return;
    }

    this.isSubmitting = true;
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    const body = { name: this.name.trim() };

    this.http.post<ApiResponse<Department>>(`${environment.authApiUrl}/departments`, body, { headers })
      .subscribe({
        next: res => {
          this.departments.push(res.data);
          this.closeAddForm();
          this.isSubmitting = false;
        },
        error: err => {
          console.error('Error creating department:', err);
          this.errorMessage = err?.error?.message || 'Failed to create department. Please try again later or contact support if the problem persists.';
          this.isSubmitting = false;
        }
      });
  }
}