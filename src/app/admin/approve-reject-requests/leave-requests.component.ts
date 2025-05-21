import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule, isPlatformBrowser, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ROLES } from '../../core/constants/roles';
import { BalanceService, LeaveBalanceDto } from '../../core/services/BalanceService';


interface LeaveRequest {
  id: number;
  userId: string;
  email: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  documentUrl: string;
}

@Component({
  selector: 'app-leave-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, TitleCasePipe],
  templateUrl: './leave-requests.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.css'],
})
export class ApproveRejectLeaveComponent implements OnInit {
  readonly ROLES = ROLES;
  pendingRequests: LeaveRequest[] = [];
  selectedRequest: LeaveRequest | null = null;
  actionType: 'approve' | 'reject' | null = null;
  comment: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  userRole: string = '';
  updatedBalance: LeaveBalanceDto[] | null = null;
  isSubmitting: boolean = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private balanceService: BalanceService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.userRole = user.roles?.[0] || '';
      if (this.userRole === ROLES.ADMIN || this.userRole === ROLES.MANAGER) {
        this.fetchPendingRequests();
      } else {
        this.errorMessage = 'You do not have permission to access this page.';
      }
    }
  }

  async fetchPendingRequests(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const token = localStorage.getItem('token');
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    this.http.get<any>(`${environment.managerApiUrl}/leave-requests/pending`, headers).subscribe({
      next: async (res) => {
        const requests = res.data || [];
        for (const req of requests) {
          if (req.email == null || req.email === 'N/A') {
            req.email = await this.fetchEmailForUserId(req.userId);
          }
        }
        this.pendingRequests = requests;
        this.errorMessage = null;
      },
      error: (err) => {
        this.pendingRequests = [];
        this.errorMessage =
          err?.error?.message ||
          'Sorry, we could not load the pending requests. Please try again later or contact support if the problem persists.';
      },
    });
  }

  viewDetails(request: any): void {
    this.selectedRequest = request;
    this.errorMessage = null;
    this.successMessage = null;
  }

  openAction(type: 'approve' | 'reject', request: any): void {
    this.selectedRequest = request;
    this.actionType = type;
    this.comment = '';
    this.errorMessage = null;
    this.successMessage = null;
  }

  submitAction(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;
  
    if (!this.selectedRequest || !this.actionType) {
      this.errorMessage = 'Invalid request or action type.';
      this.isSubmitting = false;
      return;
    }
  
    if (!this.comment.trim()) {
      this.errorMessage = 'A comment is required to approve or reject a leave request.';
      this.successMessage = null;
      this.isSubmitting = false;
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Authentication token not found. Please log in again.';
      this.isSubmitting = false;
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const url = `${environment.managerApiUrl}/leave-requests/${this.selectedRequest.id}/${this.actionType}?comment=${encodeURIComponent(this.comment)}`;
  
    this.http.put(url, {}, { headers }).subscribe({
      next: (response: any) => {
        const updatedRequest = response.data;
        if (updatedRequest && updatedRequest.userId) {
          this.http.get<any>(`${environment.managerApiUrl}/leave/balance/${updatedRequest.userId}`, { headers })
          .subscribe({
            next: (balanceRes) => {
              this.updatedBalance = Array.isArray(balanceRes.data) ? balanceRes.data.map((item: any) => ({
                ...item,
                balance: item.defaultBalance || 0
              })) : [];
              
              if (this.updatedBalance) {
                this.balanceService.updateBalance(updatedRequest.userId, this.updatedBalance);
              }
              this.cdr.detectChanges();
              this.successMessage = `Leave request has been ${this.actionType === 'approve' ? 'approved' : 'rejected'} successfully and the user has been notified.`;
              this.fetchPendingRequests();
              this.selectedRequest = null;
              this.actionType = null;
              this.comment = '';
              this.errorMessage = null;
              this.isSubmitting = false;
            },
            error: (err) => {
              this.errorMessage = 'Action completed, but failed to fetch updated balance: ' + (err?.error?.message || 'Unknown error');
              this.successMessage = `Leave request has been ${this.actionType === 'approve' ? 'approved' : 'rejected'} successfully, but balance update may not be reflected.`;
              this.fetchPendingRequests();
              this.selectedRequest = null;
              this.actionType = null;
              this.comment = '';
              this.isSubmitting = false;
            }
          });
        } else {
          this.errorMessage = 'Failed to get userId from response';
          this.isSubmitting = false;
        }
      },
      error: (err) => {
        this.successMessage = null;
        this.errorMessage = err?.error?.message || `Sorry, we could not ${this.actionType} the leave request. Please try again later or contact support if the problem persists.`;
        this.isSubmitting = false;
      }
    });
  }

  downloadDocument(documentUrl: string) {
    const token = localStorage.getItem('token');
    const filename = documentUrl.split('/').pop();
    this.http
      .get('http://localhost:8082' + documentUrl + '?disposition=attachment', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      })
      .subscribe(
        (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename || 'document';
          a.click();
        },
        (error) => {
          alert('Failed to download document');
        }
      );
  }

  closeDetails(): void {
    this.selectedRequest = null;
    this.errorMessage = null;
    this.successMessage = null;
  }

  cancelAction(): void {
    this.selectedRequest = null;
    this.actionType = null;
    this.comment = '';
    this.errorMessage = null;
    this.successMessage = null;
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

  fetchEmailForUserId(userId: string): Promise<string> {
    const token = localStorage.getItem('token');
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return this.http
      .get<any>(`${environment.authApiUrl}/users/${userId}/email`, headers)
      .toPromise()
      .then((res) => res.data)
      .catch(() => 'N/A');
  }
}