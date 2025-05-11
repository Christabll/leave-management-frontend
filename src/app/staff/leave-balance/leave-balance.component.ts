import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';


interface LeaveBalanceDto {
  leaveType: string;
  defaultBalance: number;
  balance: number;
  carryOver: number;
  usedLeave: number;
}

@Component({
  selector: 'app-leave-balance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leave-balance.component.html',
  styleUrls: ['../staff-dashboard/staff-dashboard.component.css']
})
export class LeaveBalanceComponent implements OnInit {
  leaveBalance: LeaveBalanceDto[] = [];
  errorMessage: string | null = null;


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLeaveBalance();
  }

  loadLeaveBalance(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'You are not logged in. Please log in to view your leave balance.';
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.leaveApiUrl}/leave/balance`, { headers })
      .subscribe({
        next: (res) => {
          this.leaveBalance = res.data;
          this.errorMessage = null;
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to fetch leave balances. Please try again later.';
        }
      });
  }
}

