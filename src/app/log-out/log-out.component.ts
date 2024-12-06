import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
let routingService:any;

@Component({
  selector: 'app-log-out',
  templateUrl: './log-out.component.html',
  styleUrls: ['./log-out.component.css']
})
export class LogOutComponent {
  constructor(private route: ActivatedRoute,private router: Router) {
    routingService = router;

    }
    ngOninit(){
      localStorage.removeItem('token');
      this.router.navigate(['']); 


    }

}
