import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ManagerDashboardComponent {
  userEmail = 'manager@localhost.com';
  userRole = 'Manager';

  leaveRequests = [
    { id: 1, employee: 'John Doe', leaveType: 'Vacation', startDate: '2025-05-10', endDate: '2025-05-15' },
    { id: 2, employee: 'Jane Smith', leaveType: 'Sick', startDate: '2025-05-12', endDate: '2025-05-13' },
  ];

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }

  approveRequest(id: number) {
    console.log(`Approved leave request ${id}`);
    this.leaveRequests = this.leaveRequests.filter(req => req.id !== id);
  }

  rejectRequest(id: number) {
    console.log(`Rejected leave request ${id}`);
    this.leaveRequests = this.leaveRequests.filter(req => req.id !== id);
  }
}