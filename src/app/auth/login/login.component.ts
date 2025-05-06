import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
    handleGoogleLogin(): void {
        window.location.href = 'http://localhost:8081/api/v1/auth/login/google';
      }
      
}