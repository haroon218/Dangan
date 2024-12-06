import { LiveAnnouncer } from '@angular/cdk/a11y';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Inject, Optional, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DataService } from 'app/modules/user/services/data.service';


@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent {
  snackbar:any;

  loading=false;
  user:any={};
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  constructor(private cdr:ChangeDetectorRef,private http:HttpClient,@Optional() @Inject(MAT_DIALOG_DATA) public data:any,public dialogRef: MatDialogRef<UserFormComponent>,private routers:Router)  {
    this.user=data;
  }

  NameFormControl = new FormControl('', [
    Validators.required,   
  ]);
  EmailFormControl= new FormControl('', [
    Validators.required, 
  ]);
  SalaryFormControl= new FormControl('', [
    Validators.required, 
  ]);
    // openSnackBar(message) {
    //   this._snackBar.open(message, 'Ok', {
    //     horizontalPosition: this.horizontalPosition,
    //     verticalPosition: this.verticalPosition,
    //   });
    // }
  updateUser(){
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
      
    }
    this.loading=true
    this.http.put(`https://api.samotplatform.com/users/`+this.user.userId,this.user,{'headers':options})
    .subscribe(data => {
      this.loading=false;
      // this.openSnackBar("User Updated Successfully");
       this.dialogRef.close({emp:data});
    //Use Router to navigate to the same component to trigger a reload.
 
     this.cdr.detectChanges();
    });
  }
  onCancelClick(){
    this.user={}
    this.dialogRef.close();
  }
}
export interface user {
  id : string;
  fullName: string;
  email: string;
  margin:number;

}
