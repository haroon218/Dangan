import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent {
  constructor(private router: Router) { }

  goBack(): void {
    const userRole = localStorage.getItem('role');
    
    if (userRole === 'Admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (userRole === 'Approver') {
      this.router.navigate(['/user/timeSheet']);
    } else  {
      this.router.navigate(['/user/dashboard']); // Default route for other roles
    }
  }
  
}
