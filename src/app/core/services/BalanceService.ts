import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LeaveBalanceDto {
  leaveType: string;
  defaultBalance: number;
  balance: number;
  carryOver: number;
  usedLeave: number;
  remainingLeave: string;
}

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
 
  private balanceSubject = new BehaviorSubject<{ userId: string; balance: LeaveBalanceDto[] }>({ userId: '', balance: [] });
  balance$ = this.balanceSubject.asObservable();

  
  updateBalance(userId: string, balance: LeaveBalanceDto[]) {
    this.balanceSubject.next({ userId, balance });
  }

  
}