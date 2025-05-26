import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ROLES } from '../../core/constants/roles';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css'],
  imports: [CommonModule, RouterModule]
})
export class ManagerDashboardComponent implements OnInit {
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
      
      if (this.router.url === '/manager/dashboard') {
        this.router.navigate(['/manager/dashboard/employees']);
      }
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }
}
