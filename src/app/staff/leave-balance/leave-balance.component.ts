import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLeaveBalance();
  }

  loadLeaveBalance(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>('http://localhost:8082/api/v1/leave/leave/balance', { headers })
      .subscribe({
        next: (res) => {
          this.leaveBalance = res.data;
        },
        error: (err) => {
          console.error('Failed to fetch leave balances:', err);
        }
      });
  }
}
