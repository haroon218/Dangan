import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Organization } from '../organization/organization.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.css']
})
export class OrganizationFormComponent {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  snackbar:any;
  Organization:any = {};
  Organizations:any = [];
  isEdit:boolean;
  constructor(private _formBuilder: FormBuilder,public dialogRef: MatDialogRef<OrganizationFormComponent>,private _snackBar: MatSnackBar, private cdr:ChangeDetectorRef,private routers:Router,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data:Organization,private http:HttpClient,public route:Router) {
      this.Organization ={...data};
     

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
    if (!this.Organization.id) {
      var options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
      };

      this.http.post(`https://api.samotplatform.com/Organizations`, this.Organization, { 'headers': options })
        .subscribe(data => {

          // Emit the new organization data to the parent component
          this.dialogRef.close({ org: data });
          this.openSnackBar("Organization Added Successfully");

          // Clear the organization object
          this.Organization = {};
        });
    } else {
      var options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
      };

      this.http.put(`https://api.samotplatform.com/Organizations/` + this.Organization.id, this.Organization, { 'headers': options })
        .subscribe(data => {
          // Emit the updated organization data to the parent component
          this.dialogRef.close({ org: data });
          this.openSnackBar("Organization Updated Successfully");

          // Clear the organization object
          this.Organization = {};
        });
    }
  }
}

  cancelDialog()
  {
    this.Organization={}
    this.dialogRef.close();
    
  }
}
