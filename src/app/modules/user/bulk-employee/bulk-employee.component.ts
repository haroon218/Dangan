import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { read, utils } from "xlsx";
@Component({
  selector: 'app-bulk-employee',
  templateUrl: './bulk-employee.component.html',
  styleUrls: ['./bulk-employee.component.css']
})
export class BulkEmployeeComponent {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds=1;

  constructor(public dialogRef: MatDialogRef<BulkEmployeeComponent>,private _snackBar: MatSnackBar,){ };
    openSnackBar(message) {
      this._snackBar.open(message, 'Ok', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: this.durationInSeconds * 1000,
  
      });
    }

file:any={};
uploadEvent:any={};
arrayBuffer:any={};
exceljsondata:any=[];
employees:Employee[]=[];

  onFileChange(event) {
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];
      this.uploadEvent = event;
    }
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i)
        arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = read(bstr, {
        type: "binary"
      });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      this.exceljsondata= utils.sheet_to_json(worksheet, {
        raw: true,
        defval: "",
      });
    };
    fileReader.readAsArrayBuffer(this.file);
    //console.log(this.exceljsondata);
  }
  
  addBulkEmployees(){
    // for(let i=0;i<this.exceljsondata;i++){
       
    // }
     this.dialogRef.close(this.exceljsondata);

     
  }
}
export interface Employee {
  id: string;
  firstName:string;
  lastName:string;
  mobileNumber:string;
  gender:number;
  address: string;
  city: string;
  country:string;
  postalCode:string;
  zipCode: string;
  email: string;
  salary: number;
  employeeStatus: number;
}
