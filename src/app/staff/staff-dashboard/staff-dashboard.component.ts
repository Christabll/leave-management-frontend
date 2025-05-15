import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ROLES } from '../../core/constants/roles';

interface UserProfile {
  email: string;
  roles: string[];
  avatarUrl?: string;
}

@Component({
  selector: 'app-staff-dashboard',
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule]
})
export class StaffDashboardComponent implements OnInit {
  readonly ROLES = ROLES;
  userEmail = '';
  userRole = '';
  avatarUrl = 'https://www.gravatar.com/avatar?d=identicon';
  errorMessage: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = user.roles?.[0];

      if (userRole !== ROLES.STAFF) {
        this.errorMessage = 'You do not have permission to access this page.';
        this.router.navigate(['/auth/login']);
        return;
      }

      this.getUserProfile();

      if (this.router.url === '/staff/dashboard') {
        this.router.navigate(['/staff/dashboard/balance']);
      }
    }
  }

  getUserProfile(): void {
    if (!isPlatformBrowser(this.platformId)) return;
  
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'You are not logged in. Please log in to view your profile.';
      this.router.navigate(['/auth/login']);
      return;
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<{ data: UserProfile }>(`${environment.authApiUrl}/profile`, { headers })
      .subscribe({
        next: (res) => {
          const userRole = res.data.roles?.[0];
          if (userRole !== ROLES.STAFF) {
            this.errorMessage = 'You do not have permission to access this page.';
            this.router.navigate(['/auth/login']);
            return;
          }

          this.userEmail = res.data.email;
          this.userRole = userRole;
          this.avatarUrl = res.data.avatarUrl || this.avatarUrl;
          this.errorMessage = null;
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to load profile. Please try again later.';
          if (err.status === 401) {
            this.router.navigate(['/auth/login']);
          }
        }
      });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }
}