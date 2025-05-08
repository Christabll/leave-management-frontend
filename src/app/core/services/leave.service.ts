import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private baseUrl = 'http://localhost:8082/api/v1/leave';

  constructor(private http: HttpClient) {}

  getLeaveTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leave-types`);
  }

  applyLeave(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/apply`, formData);
  }


  getLeaveBalance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leave/balance`);
  }
  
  getMyLeaveRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}/my-requests`);
  }
  

}

