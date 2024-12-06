import { LiveAnnouncer } from '@angular/cdk/a11y';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Optional, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pay-request-detail',
  templateUrl: './pay-request-detail.component.html',
  styleUrls: ['./pay-request-detail.component.css']
})
export class PayRequestDetailComponent {
  displayedColumns: string[] = ['position', 'name'];
  datasource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  payrequestdetails:any[];
  payrequest:any={};
  request:any={};
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds=2;

  constructor(private snackBar: MatSnackBar,private cdr:ChangeDetectorRef, private http:HttpClient,public dialogRef: MatDialogRef<PayRequestDetailComponent>,private _liveAnnouncer: LiveAnnouncer,@Optional() @Inject(MAT_DIALOG_DATA) public data:any,private routers:Router) {
      console.log('Upcoming data:', this.data.element);
      console.log('Upcoming data:', this.data.element);
   if (this.data.element) {
    console.log(this.data.element.payRequestDetails);
    this.payrequest = this.data.element;
   
} else {
    console.log('Invalid data structure');
}
    }
    

    @ViewChild(MatSort)
  sort: MatSort = new MatSort;
  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {

    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
  canceldialog(){
   
    this.dialogRef.close();
  }
  openSnackBar(message) {
    this.snackBar.open(message, 'Ok', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,

    });
  }
  AcceptRequest(){
    console.log("Helooo")
    this.request.id=this.payrequest.id;
    this.request.organizationId=this.payrequest.organizationId;
    this.request.payRequestStatus=2;
   

    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
      
    }
    this.http.patch(`https://api.samotplatform.com/payRequestStatus/`+this.request.id,this.request,{'headers':options})
    .subscribe(data => {
      this.openSnackBar("PayRequest Accept Successfully!");
      this.routers.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.routers.navigate(["/admin/payrequest/"]);
      });
       this.dialogRef.close({emp:data});
      this.cdr.detectChanges();
    });
  }
  RejectRequest(){
    console.log("Helooo")
    this.request.id=this.payrequest.id;
    this.request.organizationId=this.payrequest.organizationId;
    this.request.payRequestStatus=3;
  
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
      
    }
    this.http.patch(`https://api.samotplatform.com/payRequestStatus/`+this.request.id,this.request,{'headers':options})
    .subscribe(data => { 
      this.openSnackBar("PayRequest Reject!");
       this.dialogRef.close({emp:data});
        // Use Router to navigate to the same component to trigger a reload.
        this.routers.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.routers.navigate(["/admin/payrequest/"]);
        });
       console.log("Request is Rejected")
      this.cdr.detectChanges();
    });
  }
}
export interface PeriodicElement {
  name: string;
  position: number;

}
const ELEMENT_DATA: PeriodicElement[] = [
     
];