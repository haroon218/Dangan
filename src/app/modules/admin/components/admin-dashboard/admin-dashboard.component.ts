import { Component } from '@angular/core';
import * as Chartist from 'chartist';
import { AdminDataServicesService } from '../services/admin-data-services.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  loading=false;
  status1Count: number = 0;
  status2Count: number = 0;
  status3Count:number=0
  totalusers: number = 0;
  totalOrg: number=0;
  constructor(private  AdminDataServicesService: AdminDataServicesService,private router:Router,private http: HttpClient,) { }
  ngOnInit(): void {
  
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if token is missing
      this.router.navigate(['']);
      return;
    }
    this.AdminDataServicesService.getUsers().then(users => {
      this.totalusers = users;
    });
  
    this.AdminDataServicesService.getTimeSheetData().then(counts => {
      this.status1Count = counts.status1Count;
      this.status2Count = counts.status2Count;
      this.status3Count = counts.status3Count;
    })
  }
  
  redirectToTimesheetComponent(status: number) {
    this.router.navigate(['/admin/timesheet'], { queryParams: { status: status } });
}
}
