import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

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
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any>('http://localhost:8081/api/v1/auth/profile', { headers })
      .subscribe({
        next: (res) => {
          this.userEmail = res.data.email;
          this.userRole = res.data.roles[0];
          this.avatarUrl = res.data.avatarUrl || this.avatarUrl;
        },
        error: (err) => {
          console.error('Error fetching profile', err);
        }
      });
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }
}
