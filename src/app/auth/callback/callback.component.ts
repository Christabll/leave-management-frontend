import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-callback',
  template: '<p>Logging in...</p>',
})
export class CallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.route.queryParams.subscribe(params => {
        const token = params['token'];
        const role = params['role'];

        if (token && role) {
          localStorage.setItem('token', token);
          localStorage.setItem('role', role);

          if (role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'MANAGER') {
            this.router.navigate(['/manager/dashboard']);
          } else {
            this.router.navigate(['/staff/dashboard']);
          }
        } else {
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }
}
