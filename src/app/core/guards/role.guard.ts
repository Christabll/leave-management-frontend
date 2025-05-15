import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { ROLES } from '../constants/roles';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as string[];
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRoles: string[] = user.roles || [];

    const hasRole = userRoles.some(role => requiredRoles.includes(role));

    if (!hasRole) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    return true;
  }
} 