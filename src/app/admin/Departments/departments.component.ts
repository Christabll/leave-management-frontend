import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface Department {
  id?: string;
  name: string;
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchDepartments();
  }

  fetchDepartments(): void {
    this.http.get<any>(`${environment.authApiUrl}/departments`).subscribe({
      next: res => {
        this.departments = res.data;
        this.errorMessage = null;
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Failed to fetch departments. Please try again later.';
      }
    });
  }

  openAddForm(): void {
    this.showAddForm = true;
    this.errorMessage = null;
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.name = '';
    this.errorMessage = null;
  }

  createDepartment(): void {
    if (!this.name) {
      this.errorMessage = 'Please enter a department name.';
      return;
    }
    this.isSubmitting = true;
    const token = localStorage.getItem('token');
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const body = { name: this.name };
    this.http.post<any>(`${environment.authApiUrl}/departments`, body, headers).subscribe({
      next: res => {
        this.departments.push(res.data);
        this.closeAddForm();
        this.isSubmitting = false;
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Failed to create department. Please try again later.';
        this.isSubmitting = false;
      }
    });
  }
}