import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-xero-config',
  templateUrl: './xero-config.component.html',
  styleUrls: ['./xero-config.component.css']
})
export class XeroConfigComponent {
  client:any={};
  loading=false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  constructor(private cdr:ChangeDetectorRef,private http:HttpClient,private _snackBar:MatSnackBar ) { 

  }
  durationInSeconds=3;
  openSnackBar(message: string, isSuccess: boolean) {
    const panelClass = isSuccess ? ['success-snackbar'] : ['error-snackbar'];
  
    this._snackBar.open(message, '✘', {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: panelClass 
    });
  }
  ngOnInit() {
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    }

    this.loading=true;
    this.http.get(`https://api.samotplatform.com/xero/config`, {'headers': options})
    .pipe(
      catchError(error => {
        if (error.status >= 400 && error.status < 500) {
          this.openSnackBar('Client error occurred:  ' + error.status,false);
          this.loading=false;
        } else if (error.status >= 500) {
          this.openSnackBar('Server error occurred: ' + error.status,false);
          this.loading=false;
        } else {
          this.openSnackBar('An error occurred: ' + error.status,false);
          this.loading=false;

        }
        return throwError(error);
      })
    )
    .subscribe(data => {
      console.log(data)
      this.loading=false;
     this.client=data;
   
    });

  }
  Add(){
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    }

    this.loading=true;
    this.http.post(`https://api.samotplatform.com/xero/config`,this.client, {'headers': options})
    .pipe(
      catchError(error => {
        if (error.status >= 400 && error.status < 500) {
          this.openSnackBar('Client error occurred:  ' + error.status,false);
          this.loading=false;
        } else if (error.status >= 500) {
          this.openSnackBar('Server error occurred: ' + error.status,false);
          this.loading=false;
        } else {
          this.openSnackBar('An error occurred: ' + error.status,false);
          this.loading=false;

        }
        return throwError(error);
      })
    )
    .subscribe(data => {
      console.log(data);
      this.loading=false;
     this.openSnackBar('Save Successfully!',true);
   
   
    });
  }
}
// export interface client {
//   clientid: string;
//   weight: number;
//   symbol: string;
// }