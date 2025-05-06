import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h2>Welcome, Admin 👋</h2>
      <p *ngIf="token">Your token is: <code>{{ token }}</code></p>
      <p *ngIf="!token" style="color: red;">No token found. You are not logged in.</p>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      font-family: Arial, sans-serif;
    }
    h2 {
      color: #2c3e50;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  token: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token');

    if (!this.token) {
      this.router.navigate(['/login']);
    }
  }
}
