import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../core/services/reports.service'; 
import { saveAs } from 'file-saver'; 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule], 
})
export class ReportsComponent implements OnInit {
  leaveTypes: string[] = [];
  departments: string[] = [];
  statuses: string[] = [];
  
  selectedType: string = '';
  selectedDepartment: string = '';
  selectedStatus: string = '';
  startDate: string = '';
  endDate: string = '';

  reports: any[] = [];
  selectedReport: any = null;

  constructor(
    private reportsService: ReportsService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchFilterOptions();
    this.fetchReports();
  }

  fetchFilterOptions() {
    this.reportsService.getLeaveTypes().subscribe(types => this.leaveTypes = types);
    this.reportsService.getDepartments().subscribe(depts => this.departments = depts);
    this.reportsService.getStatuses().subscribe(statuses => this.statuses = statuses);
  }

  fetchReports() {
    this.reportsService.getReports(
      this.selectedType,
      this.selectedDepartment,
      this.selectedStatus,
    ).subscribe(data => {
      this.reports = data || [];
    });
  }

  exportToCSV() {
    const header = [
      'Employee', 'Email', 'Department', 'Role', 'Leave Type', 'Status',
      'Start', 'End', 'Days', 'Reason', 'Document', 'Approver', 'Comment'
    ];
    const rows = this.reports.map(r => [
      r.employeeName, r.employeeEmail, r.department, r.role, r.leaveType, r.status,
      r.startDate, r.endDate, r.days, r.reason,
      r.documentUrl ? 'http://localhost:8082' + r.documentUrl : '',
      r.approverName, r.approverComment
    ]);
    const csvContent = [header, ...rows].map(e => e.map(x => `"${x || ''}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    saveAs(blob, 'leave-report.csv');
  }

  viewDetails(report: any) {
    this.selectedReport = report;
  }

  closeDetails() {
    this.selectedReport = null;
  }
  
  viewDocument(documentUrl: string) {
    const token = localStorage.getItem('token');
    this.http
      .get('http://localhost:8082' + documentUrl + '?disposition=inline', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      })
      .subscribe(
        (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        },
        (error) => {
          alert('Failed to open document');
        }
      );
  }
}