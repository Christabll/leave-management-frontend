import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private leaveTypesUrl = `${environment.leaveApiUrl}/leave-types`;
  private departmentsUrl = `${environment.authApiUrl}/departments`; 
  private statusesUrl = `${environment.leaveApiUrl}/statuses`; 
  private reportsUrl = `${environment.adminApiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getLeaveTypes(): Observable<string[]> {
    return this.http.get<any>(this.leaveTypesUrl).pipe(
      map(res => (res.data || []).map((t: any) => t.name))
    );
  }

  getDepartments(): Observable<string[]> {
    return this.http.get<any>(this.departmentsUrl).pipe(
      map(res => (res.data || []).map((d: any) => d.name)) 
    );
  }

  getStatuses(): Observable<string[]> {
    return this.http.get<any>(this.statusesUrl).pipe(
      map(res => res.data || [])
    );
  }

  getReports(type: string, department: string, status: string): Observable<any[]> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    if (department) params = params.set('department', department);
    if (status) params = params.set('status', status);

    return this.http.get<any>(this.reportsUrl, { params }).pipe(
      map(res => res.data || [])
    );
  }
}