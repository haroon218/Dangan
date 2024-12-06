import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminDataServicesService } from 'app/modules/admin/components/services/admin-data-services.service';
import { catchError, throwError } from 'rxjs';
// import { Buffer } from "buffer";
let routingService:any;

@Component({
  selector: 'app-zero-oauth2',
  templateUrl: './zero-oauth2.component.html',
  styleUrls: ['./zero-oauth2.component.css']
})

export class ZeroOauth2Component {
  xero:any={};
  
  loading=false;
    constructor(private route: ActivatedRoute, private _snackBar:MatSnackBar ,public dataservice:AdminDataServicesService,private router: Router, private http: HttpClient) {
    routingService = router;

    }

  code =localStorage.getItem('code');
  state = localStorage.getItem('state');
  client_id='4E4CBF8FDF604F84BE77AF5416472FC0';
  client_secret='wxr5-p5O7GRiC5dkAu8yPX3kZx3T4EqcaMRw5winab3lmy3F';
  str = this.client_id+":"+this.client_secret
  durationInSeconds = 3;
  horizontalPosition: MatSnackBarHorizontalPosition = "right";
  verticalPosition: MatSnackBarVerticalPosition = "bottom";
  openSnackBar(message: string, isSuccess: boolean) {
    const panelClass = isSuccess ? ["success-snackbar"] : ["error-snackbar"];

    this._snackBar.open(message, "✘", {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: panelClass,
    });
  }
  
  ngOnInit() {
    this.loading=true;
    var options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    
    this.http.get(`https://api.samotplatform.com/xero/token?code=${this.code}&state=${this.state}`, { headers: options })
    .pipe(
      catchError((error) => {
        if (error.status >= 400 && error.status < 500) {
          this.openSnackBar(
            "Client error occurred:  " + error.status,
            false
          );
          // this.loading = false;
        } else if (error.status >= 500) {
          this.openSnackBar(
            "Server error occurred: " + error.status,
            false
          );
          // this.loading = false;
        } else {
          this.openSnackBar(
            "An error occurred: " + error.status,
            false
          );
          // this.loading = false;
        }
        return throwError(error);
      })
    )  
    .subscribe(data => {
      routingService.navigate(['/admin/users']);
        this.loading=false;
        });
    
  }
}
