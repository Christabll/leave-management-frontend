import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ROLES } from '../../core/constants/roles';

interface LeaveTypeDto {
  name: string;
  defaultBalance: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

@Component({
  selector: 'app-leave-types',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './leave-types.component.html',
  styleUrls: ['../manager-dashboard/manager-dashboard.component.css']
})

export class LeaveTypesComponent implements OnInit {
  leaveTypes: LeaveTypeDto[] = [];
  showAddForm = false;
  name = '';
  defaultBalance: number | null = null;
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
        this.fetchLeaveTypes();
      } else {
        this.errorMessage = 'You do not have permission to access this page.';
      }
    }
  }

  fetchLeaveTypes(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : {};
    
    this.http.get<ApiResponse<LeaveTypeDto[]>>(`${environment.leaveApiUrl}/leave-types`, { headers })
      .subscribe({
        next: res => {
          this.leaveTypes = res.data;
          this.errorMessage = null;
        },
        error: err => {
          console.error('Error fetching leave types:', err);
          this.leaveTypes = [];
          this.errorMessage = err?.error?.message || 'Failed to fetch leave types. Please try again later or contact support if the problem persists.';
        }
      });
  }

  openAddForm(): void {
    if (this.userRole !== ROLES.ADMIN) {
      this.errorMessage = 'Only administrators can add new leave types.';
      return;
    }
    this.showAddForm = true;
    this.errorMessage = null;
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.name = '';
    this.defaultBalance = null;
    this.errorMessage = null;
  }

  createLeaveType(): void {
    if (!this.name.trim() || this.defaultBalance == null) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.userRole !== ROLES.ADMIN) {
      this.errorMessage = 'Only administrators can add new leave types.';
      return;
    }

    this.isSubmitting = true;
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    const body = {
      name: this.name.trim(),
      defaultBalance: this.defaultBalance
    };

    this.http.post<ApiResponse<LeaveTypeDto>>(`${environment.adminApiUrl}/leave-types`, body, { headers })
      .subscribe({
        next: res => {
          this.leaveTypes.push(res.data);
          this.closeAddForm();
          this.isSubmitting = false;
        },
        error: err => {
          console.error('Error creating leave type:', err);
          this.errorMessage = err?.error?.message || 'Failed to create leave type. Please try again later or contact support if the problem persists.';
          this.isSubmitting = false;
        }
      });
  }
}