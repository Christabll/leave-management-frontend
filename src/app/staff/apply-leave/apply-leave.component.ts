import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { LeaveService } from '../../core/services/leave.service';
import { ROLES } from '../../core/constants/roles';

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

interface LeaveBalance {
  leaveType: string;
  defaultBalance: number;
  usedLeave: number;
  remainingLeave: string;
  carryOver: number;
}

interface PublicHoliday {
  date: string;
  name: string;
}

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './apply-leave.component.html',
  styleUrls: ['../staff-dashboard/staff-dashboard.component.css'],
})
export class ApplyLeaveComponent implements OnInit {
  readonly ROLES = ROLES;
  leaveTypes: LeaveType[] = [];
  userBalances: LeaveBalance[] = [];
  publicHolidays: PublicHoliday[] = [];
  newLeaveRequest: LeaveRequest = {
    leaveTypeName: '',
    startDate: '',
    endDate: '',
    reason: ''
  };
  minDate: string = '';
  endDateMin: string = '';
  selectedFile: File | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  userRole: string = '';
  disableSubmit: boolean = false;
  isSubmitting: boolean = false;
  estimatedBusinessDays: number = 0;

  constructor(
    private leaveService: LeaveService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}


  get startDate(): string {
    return this.newLeaveRequest.startDate;
  }
  
  get endDate(): string {
    return this.newLeaveRequest.endDate;
  }
  
  get selectedLeaveType(): string {
    return this.newLeaveRequest.leaveTypeName;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.userRole = user.roles?.[0] || '';

      if (this.userRole !== ROLES.STAFF) {
        this.errorMessage = 'You do not have permission to access this page.';
        this.router.navigate(['/auth/login']);
        return;
      }

      this.minDate = new Date().toISOString().split('T')[0];
      this.endDateMin = this.minDate;
      this.fetchLeaveTypes();
      this.fetchUserBalances();
      this.fetchPublicHolidays();
    }
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

  fetchUserBalances(): void {
    const timestamp = new Date().getTime(); 
    this.leaveService.getLeaveBalance(timestamp).subscribe({
      next: (res) => {
        this.userBalances = res.data || [];
      },
      error: () => {
        this.errorMessage = 'Failed to load leave balances. Please try again later.';
      }
    });
  }

  fetchPublicHolidays(): void {
    this.leaveService.getPublicHolidays().subscribe({
      next: (res) => {
        this.publicHolidays = res.data || [];
      },
      error: () => {
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

  calculateBusinessDays(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let businessDays = 0;
    const currentDate = new Date(start);
    

    while (currentDate <= end) {

      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {

        const isHoliday = this.publicHolidays.some(holiday => 
          new Date(holiday.date).toDateString() === currentDate.toDateString()
        );
        
        if (!isHoliday) {
          businessDays++;
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return businessDays;
  }

  getAvailableBalance(leaveTypeName: string): number {
    const balance = this.userBalances.find(b => b.leaveType === leaveTypeName);
    return balance ? Number(balance.remainingLeave) : 0;
  }

  onDateChange(): void {
    if (this.startDate && this.endDate && this.selectedLeaveType) {
      this.estimatedBusinessDays = this.calculateBusinessDays(this.startDate, this.endDate);
      const availableBalance = this.getAvailableBalance(this.selectedLeaveType);
      
      if (this.estimatedBusinessDays > availableBalance) {
        const leaveTypeObj = this.leaveTypes.find(type => type.name === this.selectedLeaveType);
        const defaultDays = leaveTypeObj ? leaveTypeObj.defaultBalance : 0;
        
        this.errorMessage = `Unable to process request: ${this.selectedLeaveType} has an annual allocation of ${defaultDays} days. You currently have ${availableBalance} days available and are requesting ${this.estimatedBusinessDays} business days.`;
        this.disableSubmit = true;
      } else {
        this.errorMessage = null;
        this.disableSubmit = false;
      }
    }
  }

  submitLeaveRequest(): void {
    if (this.isSubmitting) return; 
    this.isSubmitting = true;
    
    if (this.userRole !== ROLES.STAFF) {
      this.errorMessage = 'You do not have permission to submit leave requests.';
      this.isSubmitting = false;
      return;
    }

    const { leaveTypeName, startDate, endDate, reason } = this.newLeaveRequest;

    if (!leaveTypeName || !startDate || !endDate || !reason) {
      this.errorMessage = 'Please fill in all required fields.';
      this.isSubmitting = false;
      return;
    }

    if (this.requiresDocument && !this.selectedFile) {
      this.errorMessage = 'This leave type requires a supporting document.';
      this.isSubmitting = false;
      return;
    }

    // Double-check the business day calculation
    const businessDays = this.calculateBusinessDays(startDate, endDate);
    const availableBalance = this.getAvailableBalance(leaveTypeName);
    
    if (businessDays <= 0) {
      this.errorMessage = 'Your selected date range doesn\'t include any business days.';
      this.isSubmitting = false;
      return;
    }
    
    if (businessDays > availableBalance) {
      const leaveTypeObj = this.leaveTypes.find(type => type.name === leaveTypeName);
      const defaultDays = leaveTypeObj ? leaveTypeObj.defaultBalance : 0;
      
      this.errorMessage = `Unable to process request: ${leaveTypeName} has an annual allocation of ${defaultDays} days. You currently have ${availableBalance} days available and are requesting ${businessDays} business days.`;
      
      this.disableSubmit = true;
      this.isSubmitting = false;
      return;
    }

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(this.newLeaveRequest)], { type: 'application/json' }));
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.leaveService.applyLeave(formData).subscribe({
      next: () => {
        this.successMessage = 'Leave request submitted successfully. Pending manager approval.';
        this.errorMessage = null;
        setTimeout(() => {
          this.onCancel();
          this.successMessage = null;
        }, 3000);
        this.isSubmitting = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to submit leave request. Please try again later.';
        this.isSubmitting = false;
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
    this.disableSubmit = false;
    this.isSubmitting = false;
    this.estimatedBusinessDays = 0;
  }
}