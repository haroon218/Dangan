import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-departmentform',
  templateUrl: './departmentform.component.html',
  styleUrls: ['./departmentform.component.css']
})
export class DepartmentformComponent {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  snackbar:any;
  Department:any = {};
  isEdit:boolean;
  constructor(private _formBuilder: FormBuilder,public dialogRef: MatDialogRef<DepartmentformComponent>,private _snackBar: MatSnackBar, private cdr:ChangeDetectorRef,private routers:Router,
   
    @Optional() @Inject(MAT_DIALOG_DATA) public data,private http:HttpClient,public route:Router) {
      this.Department ={...data};

    }
  usernameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5),
    Validators.maxLength(15),
  ]);
  durationInSeconds=1;
  openSnackBar(message) {
    this._snackBar.open(message, 'Ok', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,

    });
  }
 addOrganization() {
  this.usernameFormControl.markAsTouched();

  if (this.usernameFormControl.invalid) {
  } else {
    if (!this.Department.id) {
      var options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
      };

      this.http.post(`https://api.samotplatform.com/Organizations`, this.Department, { 'headers': options })
        .subscribe(data => {

          // Emit the new organization data to the parent component
          this.dialogRef.close({ org: data });
          this.openSnackBar("Organization Added Successfully");

          // Clear the organization object
          this.Department = {};
        });
    } else {
      var options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
      };

      this.http.put(`https://api.samotplatform.com/Organizations/` + this.Department.id, this.Department, { 'headers': options })
        .subscribe(data => {
          // Emit the updated organization data to the parent component
          this.dialogRef.close({ org: data });
          this.openSnackBar("Organization Updated Successfully");

          // Clear the organization object
          this.Department = {};
        });
    }
  }
}

  cancelDialog()
  {
    this.Department={}
    this.dialogRef.close();
    
  }
}
