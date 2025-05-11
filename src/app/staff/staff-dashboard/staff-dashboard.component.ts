import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment'; 

@Component({
  selector: 'app-staff-dashboard',
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule]
})
export class StaffDashboardComponent implements OnInit {
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
    console.log('Staff Dashboard loaded');
    this.getUserProfile();

    if (isPlatformBrowser(this.platformId) && this.router.url === '/staff/dashboard') {
      this.router.navigate(['/staff/dashboard/balance']);
    }
  }

  getUserProfile(): void {
    if (!isPlatformBrowser(this.platformId)) return;
  
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'You are not logged in. Please log in to view your profile.';
      return;
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any>(`${environment.authApiUrl}/profile`, { headers })
      .subscribe({
        next: (res) => {
          this.userEmail = res.data.email;
          this.userRole = res.data.roles[0];
          this.avatarUrl = res.data.avatarUrl || this.avatarUrl;
          this.errorMessage = null; 
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to load profile. Please try again later.';
        }
      });
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }
}