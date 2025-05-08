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
      },
      error: (err) => {
        console.error('Failed to load leave types', err);
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
      alert('Please fill in all required fields.');
      return;
    }

    if (this.requiresDocument && !this.selectedFile) {
      alert('This leave type requires a supporting document.');
      return;
    }

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(this.newLeaveRequest)], { type: 'application/json' }));
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.leaveService.applyLeave(formData).subscribe({
      next: () => {
        alert('Leave request submitted successfully.');
        this.onCancel(); // reset form
      },
      error: (err) => {
        console.error('Error submitting leave request:', err);
        alert('Failed to submit leave request.');
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
  }
}
