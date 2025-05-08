// src/app/admin/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  imports: [CommonModule, RouterModule]
})
export class AdminDashboardComponent implements OnInit {
  userEmail = 'admin@localhost.com';
  userRole = 'Administrator';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    console.log('Admin Dashboard loaded ✅');

    if (isPlatformBrowser(this.platformId) && this.router.url === '/admin/dashboard') {
      this.router.navigate(['/admin/dashboard/employees']);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }
}
