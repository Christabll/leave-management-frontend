import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BalanceService, LeaveBalanceDto } from '../../core/services/BalanceService';

interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  department?: string;
  role?: string;
}

interface LeaveType {
  id: number;
  name: string;
}

interface AdminLeaveBalanceDto extends Omit<LeaveBalanceDto, 'leaveType'> {
  leaveType: string | LeaveType;
  leaveTypeId?: number | string;
}

@Component({
  selector: 'app-admin-leave-balances',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-leave-balances.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.css']
})
export class AdminLeaveBalancesComponent implements OnInit {
  users: UserProfile[] = [];
  filteredUsers: UserProfile[] = [];
  searchTerm: string = '';
  selectedUser: UserProfile | null = null;
  userBalance: AdminLeaveBalanceDto[] = [];
  departments: string[] = [];
  selectedDepartment: string = '';
  isLoading: boolean = false;
  isLoadingBalance: boolean = false;
  errorMessage: string | null = null;
  balanceError: string | null = null;
  showAdjustModal: boolean = false;
  selectedBalance: AdminLeaveBalanceDto | null = null;
  newBalanceValue: number = 0;
  newUsedDaysValue: number = 0;
  newCarryOverValue: number = 0; // <-- Added for carry over adjustment
  adjustmentReason: string = '';
  isSubmitting: boolean = false;
  leaveTypesMap: Map<string, number> = new Map();
  leaveTypesLoaded: boolean = false;

  constructor(
    private http: HttpClient,
    private balanceService: BalanceService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUsers();
      this.loadDepartments();
      this.loadLeaveTypes();
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  loadUsers() {
    this.isLoading = true;
    const token = this.getToken();
    if (!token) {
      this.errorMessage = 'Authentication token not found. Please log in again.';
      this.isLoading = false;
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any>(`${environment.authApiUrl}/users`, { headers }).subscribe({
      next: (res) => {
        if (res.data && Array.isArray(res.data)) {
          this.users = res.data.map((user: any) => {
            const userProfile: UserProfile = {
              id: user.id,
              email: user.email,
              fullName: user.fullName || user.name || '',
              department: user.department || '',
              role: user.role || user.roles?.[0] || ''
            };
            return userProfile;
          });
        } else {
          this.users = [];
        }
        this.filteredUsers = [...this.users];
        this.isLoading = false;
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            this.users.forEach(user => this.loadUserDetails(user));
          }, 500);
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load users';
        this.isLoading = false;
      }
    });
  }

  loadUserDetails(user: UserProfile) {
    if (!user.id) return;
    const token = this.getToken();
    if (!token) return;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    if (!user.department) {
      this.http.get<any>(`${environment.authApiUrl}/users/${user.id}/department`, { headers })
        .subscribe({
          next: (res) => {
            if (res && typeof res === 'object') {
              if (res.data) {
                user.department = res.data;
              } else if (res.message) {
                user.department = res.message;
              }
            } else if (typeof res === 'string') {
              user.department = res;
            }
            if (!user.department) {
              user.department = 'N/A';
            }
            this.filteredUsers = [...this.users];
          },
          error: (err) => {
            user.department = 'N/A';
            this.filteredUsers = [...this.users];
          }
        });
    }
    if (!user.role) {
      this.http.get<any>(`${environment.authApiUrl}/users/${user.id}/role`, { headers })
        .subscribe({
          next: (res) => {
            if (res && typeof res === 'object') {
              if (res.data) {
                user.role = res.data;
              } else if (res.message) {
                user.role = res.message;
              }
            } else if (typeof res === 'string') {
              user.role = res;
            }
            if (!user.role) {
              user.role = 'N/A';
            }
            this.filteredUsers = [...this.users];
          },
          error: (err) => {
            user.role = 'N/A';
            this.filteredUsers = [...this.users];
          }
        });
    }
  }

  loadUserProfiles() {
    const token = this.getToken();
    if (!token) return;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const userPromises = this.users.map(user => {
      if (!user.id) return Promise.resolve(user);
      return this.http.get<any>(`${environment.authApiUrl}/users/email/${user.email}`, { headers })
        .toPromise()
        .then(res => {
          if (res && res.data) {
            const profile = res.data;
            return {
              ...user,
              department: profile.department || user.department || 'N/A',
              role: profile.role || user.role || 'N/A'
            };
          }
          return user;
        })
        .catch(err => user);
    });
    Promise.all(userPromises).then(updatedUsers => {
      this.users = updatedUsers;
      this.filteredUsers = [...this.users];
    });
  }

  loadDepartments() {
    const token = this.getToken();
    if (!token) return;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any>(`${environment.authApiUrl}/departments`, { headers }).subscribe({
      next: (res) => {
        this.departments = (res.data || []).map((dept: any) => dept.name || '');
      },
      error: (err) => {}
    });
  }

  loadLeaveTypes() {
    const token = this.getToken();
    if (!token) return;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any>(`${environment.adminApiUrl}/leave-types`, { headers }).subscribe({
      next: (res) => {
        this.processLeaveTypes(res);
      },
      error: (err) => {
        this.http.get<any>(`${environment.leaveApiUrl}/leave-types`, { headers }).subscribe({
          next: (res) => {
            this.processLeaveTypes(res);
          },
          error: (err2) => {}
        });
      }
    });
  }

  processLeaveTypes(res: any) {
    if (res.data && Array.isArray(res.data)) {
      res.data.forEach((leaveType: any) => {
        if (leaveType.name) {
          let id = leaveType.id;
          if (id !== undefined && id !== null) {
            this.leaveTypesMap.set(leaveType.name, Number(id));
          }
          else {
            const tempId = this.leaveTypesMap.size + 1;
            this.leaveTypesMap.set(leaveType.name, tempId);
          }
        }
      });
      this.leaveTypesLoaded = true;
    }
  }

  getLeaveTypeIdByName(name: string): number | null {
    if (!name) return null;
    if (this.leaveTypesMap.has(name)) {
      const id = this.leaveTypesMap.get(name);
      return id || null;
    }
    for (const [key, value] of this.leaveTypesMap.entries()) {
      if (key.toLowerCase() === name.toLowerCase()) {
        return value;
      }
    }
    if (!this.leaveTypesLoaded || this.leaveTypesMap.size === 0) {
      if (name.toLowerCase().includes('annual') || name.toLowerCase().includes('pto')) {
        return 1;
      } else if (name.toLowerCase().includes('sick')) {
        return 2;
      } else if (name.toLowerCase().includes('personal')) {
        return 3;
      } else if (name.toLowerCase().includes('unpaid')) {
        return 4;
      } else if (name.toLowerCase().includes('compassionate')) {
        return 5;
      } else if (name.toLowerCase().includes('maternity')) {
        return 6;
      } else {
        return Math.floor(Math.random() * 1000) + 100;
      }
    }
    return null;
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (user.fullName && user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesDepartment = !this.selectedDepartment ||
        user.department === this.selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  }

  onDepartmentChange() {
    this.filterUsers();
  }

  viewUserBalance(userId: string) {
    this.isLoadingBalance = true;
    this.selectedUser = this.users.find(user => user.id === userId) || null;
    this.balanceError = null;
    const token = this.getToken();
    if (!token) {
      this.balanceError = 'Authentication token not found. Please log in again.';
      this.isLoadingBalance = false;
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any>(`${environment.managerApiUrl}/leave/balance/${userId}`, { headers }).subscribe({
    next: (res) => {
        this.userBalance = Array.isArray(res.data) ? res.data.map((item: any) => {
          let leaveTypeId = null;
          if (item.leaveTypeId && !isNaN(Number(item.leaveTypeId))) {
            leaveTypeId = Number(item.leaveTypeId);
          }
          else if (item.leaveType) {
            if (typeof item.leaveType === 'object' && item.leaveType !== null && item.leaveType.id) {
              leaveTypeId = Number(item.leaveType.id);
            }
          }
          return {
            ...item,
            balance: 'balance' in item ? item.balance : (item.defaultBalance || 0),
            leaveTypeId: leaveTypeId
          };
        }) : [];
        this.isLoadingBalance = false;
      },
      error: (err) => {
        if (err?.status === 404) {
          this.initializeUserBalance(userId);
        } else {
          this.balanceError = err?.error?.message || 'Failed to load user balance';
          this.isLoadingBalance = false;
        }
      }
    });
  }

  initializeUserBalance(userId: string) {
    const token = this.getToken();
    if (!token) {
      this.balanceError = 'Authentication token not found. Please log in again.';
      this.isLoadingBalance = false;
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.post<any>(`${environment.adminApiUrl}/leave/init-balance/${userId}`, {}, { headers }).subscribe({
      next: () => {
        this.http.get<any>(`${environment.adminApiUrl}/leave/balance/${userId}`, { headers }).subscribe({
          next: (res) => {
            this.userBalance = Array.isArray(res.data) ? res.data.map((item: any) => {
              let leaveTypeId = null;
              if (item.leaveTypeId && !isNaN(Number(item.leaveTypeId))) {
                leaveTypeId = Number(item.leaveTypeId);
              } else if (item.leaveType && typeof item.leaveType === 'object' && item.leaveType.id) {
                leaveTypeId = Number(item.leaveType.id);
              }
              return {
                ...item,
                balance: 'balance' in item ? item.balance : (item.defaultBalance || 0),
                leaveTypeId: leaveTypeId
              };
            }) : [];
            this.isLoadingBalance = false;
          },
          error: (err) => {
            this.balanceError = 'Failed to load user balance after initialization';
            this.isLoadingBalance = false;
          }
        });
      },
      error: (err) => {
        this.balanceError = 'Failed to initialize leave balance for user';
        this.isLoadingBalance = false;
      }
    });
  }

  backToList() {
    this.selectedUser = null;
    this.userBalance = [];
    this.balanceError = null;
  }

  openAdjustBalanceModal(balance: AdminLeaveBalanceDto) {
    this.selectedBalance = balance;
    this.newBalanceValue = balance.defaultBalance;
    this.newUsedDaysValue = balance.usedLeave;
    this.newCarryOverValue = balance.carryOver || 0;
    this.adjustmentReason = '';
    this.showAdjustModal = true;
  }

  closeModal() {
    this.showAdjustModal = false;
    this.selectedBalance = null;
    this.isSubmitting = false;
    this.adjustmentReason = '';
  }

  incrementBalance() {
    this.newBalanceValue++;
  }

  decrementBalance() {
    if (this.newBalanceValue > 0) {
      this.newBalanceValue--;
    }
  }

  incrementUsedDays() {
    this.newUsedDaysValue++;
  }

  decrementUsedDays() {
    if (this.newUsedDaysValue > 0) {
      this.newUsedDaysValue--;
    }
  }

  incrementCarryOver() {
    this.newCarryOverValue++;
  }

  decrementCarryOver() {
    if (this.newCarryOverValue > 0) {
      this.newCarryOverValue--;
    }
  }

  calculateNewRemaining(): string {
    if (!this.selectedBalance) return '0';
    const carryOver = this.selectedBalance.carryOver || 0;
    const usedLeave = this.selectedBalance.usedLeave || 0;
    const remaining = this.newBalanceValue + carryOver - usedLeave;
    return remaining % 1 === 0 ? `${Math.floor(remaining)}` : remaining.toFixed(1);
  }

  calculateNewRemainingAfterUsedAdjustment(): string {
    if (!this.selectedBalance) return '0';
    const defaultBalance = this.selectedBalance.defaultBalance || 0;
    const carryOver = this.selectedBalance.carryOver || 0;
    const remaining = defaultBalance + carryOver - this.newUsedDaysValue;
    return remaining % 1 === 0 ? `${Math.floor(remaining)}` : remaining.toFixed(1);
  }

  submitBalanceAdjustment() {
    if (!this.selectedBalance || !this.selectedUser) return;
    this.isSubmitting = true;
    const token = this.getToken();
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      this.isSubmitting = false;
      return;
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const request = {
      userId: this.selectedUser.id,
      leaveTypeId: this.selectedBalance.leaveTypeId || this.selectedBalance.leaveType,
      newBalance: this.newBalanceValue,
      reason: this.adjustmentReason || 'Manual adjustment by admin'
    };
    this.http.post<any>(`${environment.adminApiUrl}/adjust-balance`, request, { headers }).subscribe({
      next: (res) => {
        if (this.selectedBalance) {
          this.selectedBalance.defaultBalance = this.newBalanceValue;
          const carryOver = this.selectedBalance.carryOver || 0;
          const usedLeave = this.selectedBalance.usedLeave || 0;
          const remaining = this.newBalanceValue + carryOver - usedLeave;
          this.selectedBalance.remainingLeave = String(remaining);
        }
        this.viewUserBalance(this.selectedUser!.id);
        this.closeModal();
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to adjust balance');
        this.isSubmitting = false;
      }
    });
  }

  submitUsedDaysAdjustment() {
    if (!this.selectedBalance || !this.selectedUser) return;
    this.isSubmitting = true;
    let leaveTypeId = null;
    if (this.selectedBalance.leaveTypeId !== undefined && this.selectedBalance.leaveTypeId !== null) {
      leaveTypeId = Number(this.selectedBalance.leaveTypeId);
    } else if (typeof this.selectedBalance.leaveType === 'object' && this.selectedBalance.leaveType !== null) {
      if (this.selectedBalance.leaveType.id) {
        leaveTypeId = Number(this.selectedBalance.leaveType.id);
      }
    } else if (typeof this.selectedBalance.leaveType === 'string') {
      leaveTypeId = this.getLeaveTypeIdByName(this.selectedBalance.leaveType);
    }
    if (leaveTypeId === null || leaveTypeId === undefined || isNaN(leaveTypeId as number)) {
      if (typeof this.selectedBalance.leaveType === 'string') {
        leaveTypeId = this.getLeaveTypeIdByName(this.selectedBalance.leaveType);
      }
      if (leaveTypeId === null || leaveTypeId === undefined || isNaN(leaveTypeId as number)) {
        alert('Invalid leave type ID. Cannot process adjustment.');
        this.isSubmitting = false;
        return;
      }
    }
    const request = {
      userId: this.selectedUser.id,
      leaveTypeId: leaveTypeId,
      usedDays: this.newUsedDaysValue,
      reason: this.adjustmentReason || 'Manual adjustment of used days by admin'
    };
    if (this.selectedBalance) {
      const oldUsedDays = this.selectedBalance.usedLeave;
      this.selectedBalance.usedLeave = this.newUsedDaysValue;
      const defaultBalance = this.selectedBalance.defaultBalance || 0;
      const carryOver = this.selectedBalance.carryOver || 0;
      const remaining = defaultBalance + carryOver - this.newUsedDaysValue;
      this.selectedBalance.remainingLeave = String(remaining % 1 === 0 ? Math.floor(remaining) : remaining.toFixed(1));
      const index = this.userBalance.findIndex(
        b => b.leaveType === this.selectedBalance?.leaveType
      );
      if (index !== -1) {
        this.userBalance[index].usedLeave = this.newUsedDaysValue;
        this.userBalance[index].remainingLeave = this.selectedBalance.remainingLeave;
      }
    }
    this.balanceService.adjustUsedDaysV2(
      request.userId,
      request.leaveTypeId,
      request.usedDays,
      request.reason
    ).subscribe({
      next: (res) => {
        try {
          this.viewUserBalance(this.selectedUser!.id);
        } catch (err) {}
        this.closeModal();
      },
      error: (err) => {
        alert('Warning: Server returned an error but the UI has been updated. Changes may not persist after refresh.');
        this.isSubmitting = false;
        this.closeModal();
      }
    });
  }

  submitCarryOverAdjustment() {
    if (!this.selectedBalance || !this.selectedUser) return;
    this.isSubmitting = true;
    const token = this.getToken();
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      this.isSubmitting = false;
      return;
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const request = {
      userId: this.selectedUser.id,
      leaveTypeId: this.selectedBalance.leaveTypeId || this.selectedBalance.leaveType,
      carryOver: this.newCarryOverValue,
      reason: this.adjustmentReason || 'Manual carry over adjustment by admin'
    };
    this.http.post<any>(`${environment.adminApiUrl}/adjust-balance`, request, { headers }).subscribe({
      next: (res) => {
        this.viewUserBalance(this.selectedUser!.id);
        this.closeModal();
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to adjust carry over');
        this.isSubmitting = false;
      }
    });
  }

  initializeAllBalances() {
    if (!confirm('This will initialize leave balances for all users. Continue?')) {
      return;
    }
    const token = this.getToken();
    if (!token) {
      this.errorMessage = 'Authentication token not found. Please log in again.';
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.isLoading = true;
    this.http.post<any>(`${environment.adminApiUrl}/leave/init-balance-all`, {}, { headers }).subscribe({
      next: (res) => {
        alert(res.message || 'All leave balances initialized successfully');
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to initialize leave balances';
        this.isLoading = false;
      }
    });
  }
}