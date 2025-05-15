import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ROLES } from '../../core/constants/roles';

@Component({
  selector: 'app-callback',
  template: '<p>Logging in...</p>',
})
export class CallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.route.queryParams.subscribe(params => {
        const token = params['token'];
        const role = params['role'];

        if (token && role) {
          localStorage.setItem('token', token);




          this.http.get<any>(`${environment.authApiUrl}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          }).subscribe({
            next: (res) => {
              console.log('User profile data:', res.data);
              if (!res.data.id || res.data.id.includes('@')) {
                console.error('Auth service returned email instead of UUID:', res.data);
              }
              localStorage.setItem('user', JSON.stringify(res.data));


              if (role === ROLES.ADMIN) {
                this.router.navigate(['/admin/dashboard']);
              } else if (role === ROLES.MANAGER) {
                this.router.navigate(['/admin/dashboard']);
              } else if (role === ROLES.STAFF) {
                this.router.navigate(['/staff/dashboard']);
              } else {
                this.router.navigate(['/auth/login']);
              }
            },
            error: () => {
              this.router.navigate(['/auth/login']);
            }
          });
        } else {
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }
}
