import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-leave-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './leave-requests.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.css'],})

export class ApproveRejectLeaveComponent implements OnInit {
  pendingRequests: any[] = [];
  selectedRequest: any = null;
  actionType: 'approve' | 'reject' | null = null;
  comment: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPendingRequests();
  }

  fetchPendingRequests(): void {
    this.http.get<any>('/api/v1/admin/leave-requests/pending')
      .subscribe({
        next: res => this.pendingRequests = res.data || [],
        error: () => this.pendingRequests = []
      });
  }

  viewDetails(request: any): void {
    // Implement modal or details logic as needed
    alert('Details for: ' + JSON.stringify(request, null, 2));
  }

  openAction(type: 'approve' | 'reject', request: any): void {
    this.selectedRequest = request;
    this.actionType = type;
    this.comment = '';
  }

  submitAction(): void {
    if (!this.comment.trim()) {
      alert('Comment is required!');
      return;
    }
    const req = this.selectedRequest;
    const url = `/api/v1/admin/leave-requests/${req.id}/${this.actionType}?comment=${encodeURIComponent(this.comment)}`;
    this.http.put(url, {}).subscribe(() => {
      this.fetchPendingRequests();
      this.selectedRequest = null;
      this.actionType = null;
      this.comment = '';
    });
  }

  cancelAction(): void {
    this.selectedRequest = null;
    this.actionType = null;
    this.comment = '';
  }
}
