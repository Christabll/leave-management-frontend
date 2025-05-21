import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

interface PublicHoliday {
  id: number;
  date: string;
  name: string;
}

@Component({
      selector: 'app-public-holiday',
      templateUrl: './public-holidays.component.html',
      styleUrls: ['../staff-dashboard/staff-dashboard.component.css'],
      standalone: true,
      imports: [CommonModule, FormsModule],
    })

export class PublicHolidayComponent implements OnInit {
  holidays: PublicHoliday[] = [];
  years: number[] = [];
  selectedYear: number = new Date().getFullYear();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.populateYears();
    this.fetchHolidaysForYear();
  }

  populateYears() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear, currentYear + 1]; 
  }

  fetchHolidaysForYear() {
      this.http.get<PublicHoliday[]>(`${environment.publicHolidayApiUrl}/rwanda/${this.selectedYear}`)
        .subscribe({
          next: (data) => this.holidays = data,
          error: () => this.holidays = []
        });
    }
}