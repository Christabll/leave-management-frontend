import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { LeaveService } from '../../core/services/leave.service';
import { BalanceService, LeaveBalanceDto } from '../../core/services/BalanceService';

@Component({
  selector: 'app-leave-balance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leave-balance.component.html',
  styleUrls: ['../staff-dashboard/staff-dashboard.component.css']
})
export class LeaveBalanceComponent implements OnInit, OnDestroy {
  leaveBalance: LeaveBalanceDto[] = [];
  errorMessage: string | null = null;
  isRefreshing: boolean = false;
  private routerSubscription!: Subscription;
  private refreshInterval: any;
  private currentUserId: string = '';
  currentYear: number = new Date().getFullYear();

  constructor(
    private leaveService: LeaveService,
    private balanceService: BalanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = user.id || '';
    
    this.balanceService.balance$.subscribe(({ userId, balance }) => {
      if (userId === this.currentUserId && balance && balance.length > 0) {
        this.leaveBalance = balance;
        this.errorMessage = null;
      }
    });
    
    this.loadLeaveBalance();
    
    this.refreshInterval = setInterval(() => {
      this.loadLeaveBalance(false);
    }, 30000);
    
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && this.router.url.includes('/dashboard/balance')) {
        this.loadLeaveBalance();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  refreshBalance(): void {
    this.loadLeaveBalance(true);
  }

  loadLeaveBalance(showRefreshing: boolean = true): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'You are not logged in. Please log in to view your leave balance.';
      return;
    }

    if (showRefreshing) {
      this.isRefreshing = true;
    }

    const timestamp = new Date().getTime();
    this.leaveService.getLeaveBalance(timestamp).subscribe({
      next: (res) => {
        this.leaveBalance = (res.data || []).map((item: any) => ({
          ...item,
          balance: item.defaultBalance || 0
        }));
        this.balanceService.updateBalance(this.currentUserId, this.leaveBalance); 
        this.errorMessage = null;
        this.isRefreshing = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to fetch leave balances. Please try again later.';
        this.isRefreshing = false;
      }
    });
  }
} 