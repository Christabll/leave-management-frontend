import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../core/services/leave.service'; 

interface LeaveType {
  name: string;
  defaultBalance: number;
  requiresDocument: boolean;
}

interface LeaveRequest {
  leaveTypeName: string; 
  startDate: string;
  endDate: string;
  reason: string;
}

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apply-leave.component.html',
  styleUrls: ['../staff-dashboard/staff-dashboard.component.css'],
})
export class ApplyLeaveComponent implements OnInit {
  leaveTypes: LeaveType[] = [];
  newLeaveRequest: LeaveRequest = {
    leaveTypeName: '',
    startDate: '',
    endDate: '',
    reason: ''
  };
  minDate: string = '';
  endDateMin: string = '';
  selectedFile: File | null = null;
  errorMessage: string | null = null; // User-friendly error message

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.minDate = new Date().toISOString().split('T')[0];
    this.endDateMin = this.minDate;
    this.fetchLeaveTypes();
  }

  fetchLeaveTypes(): void {
    this.leaveService.getLeaveTypes().subscribe({
      next: (res) => {
        this.leaveTypes = res.data;
        this.errorMessage = null; 
      },
      error: () => {
        this.errorMessage = 'Failed to load leave types. Please try again later.';
      }
    });
  }

  updateEndDateMin(): void {
    this.endDateMin = this.newLeaveRequest.startDate || this.minDate;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] || null;
  }

  get requiresDocument(): boolean {
    const selected = this.leaveTypes.find(type => type.name === this.newLeaveRequest.leaveTypeName);
    return selected?.requiresDocument || false;
  }

  submitLeaveRequest(): void {
    const { leaveTypeName, startDate, endDate, reason } = this.newLeaveRequest;

    if (!leaveTypeName || !startDate || !endDate || !reason) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    if (this.requiresDocument && !this.selectedFile) {
      this.errorMessage = 'This leave type requires a supporting document.';
      return;
    }

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(this.newLeaveRequest)], { type: 'application/json' }));
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.leaveService.applyLeave(formData).subscribe({
      next: () => {
        this.errorMessage = null;
        alert('Leave request submitted successfully.');
        this.onCancel(); // reset form
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to submit leave request. Please try again later.';
      }
    });
  }

  onCancel(): void {
    this.newLeaveRequest = {
      leaveTypeName: '',
      startDate: '',
      endDate: '',
      reason: ''
    };
    this.selectedFile = null;
    this.errorMessage = null;
  }
}