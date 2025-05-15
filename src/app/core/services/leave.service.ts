import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private baseUrl = environment.leaveApiUrl; 

  constructor(private http: HttpClient) {}

  getLeaveTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leave-types`);
  }

  applyLeave(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/apply`, formData);
  }

  getLeaveBalance(timestamp?: number): Observable<any> {
    const url = timestamp ? 
      `${this.baseUrl}/balance?t=${timestamp}` : 
      `${this.baseUrl}/balance`;
    
    return this.http.get<any>(url);
  }
  
  getMyLeaveRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}/my-requests`);
  }
  
  getUserLeaveBalance(userId: string, timestamp?: number): Observable<any> {
    const url = timestamp ? 
      `${environment.adminApiUrl}/leave/balance/${userId}?t=${timestamp}` : 
      `${environment.adminApiUrl}/leave/balance/${userId}`;
    
    return this.http.get<any>(url);
  }

  getPublicHolidays(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/public-holidays`);
}
}