import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LeaveTypeDto {
  name: string;
  defaultBalance: number;
}

@Component({
  selector: 'app-leave-types',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './leave-types.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.css']
})
export class LeaveTypesComponent implements OnInit {
  leaveTypes: LeaveTypeDto[] = [];
  showAddForm = false;
  name = '';
  defaultBalance: number | null = null;
  isSubmitting = false;
  errorMessage: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchLeaveTypes();
  }

  fetchLeaveTypes(): void {
    const token = localStorage.getItem('token');
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    this.http.get<any>('http://localhost:8082/api/v1/leave/leave-types', headers).subscribe({
      next: res => this.leaveTypes = res.data,
      error: err => this.errorMessage = 'Failed to fetch leave types'
    });
  }

  openAddForm(): void {
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
    if (!this.name || this.defaultBalance == null) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }
    this.isSubmitting = true;
    const token = localStorage.getItem('token');
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const body = {
      name: this.name,
      defaultBalance: this.defaultBalance
    };
    this.http.post<any>('http://localhost:8082/api/v1/admin/leave-types', body, headers).subscribe({
      next: res => {
        this.leaveTypes.push({
          name: res.data.name,
          defaultBalance: res.data.defaultBalance
        });
        this.closeAddForm();
        this.isSubmitting = false;
      },
      error: err => {
        this.errorMessage = err.error?.message || 'Failed to create leave type';
        this.isSubmitting = false;
      }
    });
  }
}