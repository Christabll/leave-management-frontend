import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ROLES } from '../../core/constants/roles';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private router: Router) {}

  handleGoogleLogin(): void {
    window.location.href = `${environment.authApiUrl}/login/google`;
  }

  handleLoginResponse(response: any): void {
    if (response.token && response.user) {
      try {

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        const primaryRole = response.user.roles?.[0];

        if (primaryRole === ROLES.ADMIN) {
          this.router.navigate(['/admin/dashboard']);
        } else if (primaryRole === ROLES.MANAGER) {
          this.router.navigate(['/manager/dashboard']); 
        } else if (primaryRole === ROLES.STAFF) {
          this.router.navigate(['/staff/dashboard']);
        } else {
          this.router.navigate(['/auth/login']);
        }
      } catch (error) {
        console.error('Error handling login response:', error);
        this.router.navigate(['/auth/login']);
      }
    } else {
      console.error('Invalid login response:', response);
      this.router.navigate(['/auth/login']);
    }
  }
}