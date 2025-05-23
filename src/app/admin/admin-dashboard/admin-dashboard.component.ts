import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ROLES } from '../../core/constants/roles';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  imports: [CommonModule, RouterModule]
})
export class AdminDashboardComponent implements OnInit {
  userEmail = '';
  userRole = '';
  avatarUrl: string = 'https://www.gravatar.com/avatar?d=identicon';


  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.userEmail = user.email || '';
      this.userRole = user.roles?.[0] || '';
      this.avatarUrl = user.avatarUrl || 'https://www.gravatar.com/avatar?d=identicon';
      
      if (this.router.url === '/admin/dashboard') {
        this.router.navigate(['/admin/dashboard/employees']);
      }
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }
}
