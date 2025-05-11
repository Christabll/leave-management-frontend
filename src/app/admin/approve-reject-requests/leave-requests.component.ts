import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-leave-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './leave-requests.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.css'],
})
export class ApproveRejectLeaveComponent implements OnInit {
  pendingRequests: any[] = [];
  selectedRequest: any = null;
  actionType: 'approve' | 'reject' | null = null;
  comment: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.fetchPendingRequests();
  }

  fetchPendingRequests(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const token = localStorage.getItem('token');
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    this.http.get<any>(`${environment.adminApiUrl}/leave-requests/pending`, headers)
      .subscribe({
        next: res => {
          console.log('Fetched pending requests:', res.data);
          this.pendingRequests = res.data || [];
          this.errorMessage = null;
        },
        error: (err) => {
          console.error('Error fetching pending requests:', err);
          this.pendingRequests = [];
          this.errorMessage = err?.error?.message || 'Sorry, we could not load the pending requests. Please try again later or contact support if the problem persists.';
        }
      });
  }

  viewDetails(request: any): void {
    console.log('View details for request:', request);
    this.selectedRequest = request;
    this.errorMessage = null;
    this.successMessage = null;
  }

  openAction(type: 'approve' | 'reject', request: any): void {
    console.log('openAction called with type:', type, 'request:', request);
    this.selectedRequest = request;
    this.actionType = type;
    this.comment = '';
    this.errorMessage = null;
    this.successMessage = null;
  }

  submitAction(): void {
    console.log('submitAction called with actionType:', this.actionType, 'selectedRequest:', this.selectedRequest, 'comment:', this.comment);
    if (!this.comment.trim()) {
      this.errorMessage = 'A comment is required to approve or reject a leave request.';
      this.successMessage = null;
      return;
    }
    const req = this.selectedRequest;
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    let url = '';
    if (this.actionType === 'approve') {
      url = `${environment.leaveApiUrl}/admin/leave-requests/${req.id}/approve?comment=${encodeURIComponent(this.comment)}`;
    } else if (this.actionType === 'reject') {
      url = `${environment.leaveApiUrl}/admin/leave-requests/${req.id}/reject?comment=${encodeURIComponent(this.comment)}`;
    }
    this.http.put(url, {}, { headers }).subscribe({
      next: () => {
        console.log('Request approved/rejected successfully');
        this.fetchPendingRequests();
        this.selectedRequest = null;
        this.actionType = null;
        this.comment = '';
        this.errorMessage = null;
        this.successMessage = `Leave request has been ${this.actionType === 'approve' ? 'approved' : 'rejected'} successfully and the user has been notified.`;
      },
      error: (err) => {
        console.error('Error approving/rejecting request:', err);
        this.successMessage = null;
        this.errorMessage = err?.error?.message || `Sorry, we could not ${this.actionType} the leave request. Please try again later or contact support if the problem persists.`;
      }
    });
  }

  downloadDocument(documentUrl: string) {
    const token = localStorage.getItem('token');
    const filename = documentUrl.split('/').pop();
    this.http.get('http://localhost:8082' + documentUrl + '?disposition=attachment', {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'document';
      a.click();
    }, error => {
      alert('Failed to download document');
    });
  }
  
  closeDetails(): void {
    this.selectedRequest = null;
    this.errorMessage = null;
    this.successMessage = null;
  }
  
  cancelAction(): void {
    console.log('cancelAction called');
    this.selectedRequest = null;
    this.actionType = null;
    this.comment = '';
    this.errorMessage = null;
    this.successMessage = null;
  }

  viewDocument(documentUrl: string) {
    const token = localStorage.getItem('token');
    this.http.get('http://localhost:8082' + documentUrl + '?disposition=inline', {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    }, error => {
      alert('Failed to open document');
    });
  }
}