import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { catchError } from 'rxjs';
import { read, utils } from 'xlsx';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-bulk-timesheet',
  templateUrl: './bulk-timesheet.component.html',
  styleUrls: ['./bulk-timesheet.component.css']
})
export class BulkTimesheetComponent {
  arrayBuffer: any = {};

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 1;

  constructor(
    public dialogRef: MatDialogRef<BulkTimesheetComponent>,
    private _snackBar: MatSnackBar,
    private http: HttpClient
  ) { }

  openSnackBar(message: string): void {
    this._snackBar.open(message, 'Ok', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
  }

  file: any = {};
  exceljsondata: any = [];

  onFileChange(event): void {
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];
      this.readExcelFile();

    }
  }

  readExcelFile(): void {
    const fileReader = new FileReader();
    
    fileReader.onload = (e) => {
      const arrayBuffer = fileReader.result as ArrayBuffer; 
      const data = new Uint8Array(arrayBuffer); 
      
      const workbook = XLSX.read(data, { type: 'array' }); 
      const first_sheet_name = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[first_sheet_name];
      
      this.exceljsondata = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: '' });
  
      // this.addBulkTimesheet();
    };
  
    fileReader.readAsArrayBuffer(this.file);
  }
  
  addBulkTimesheet(): void {
    if(this.exceljsondata){
      this.dialogRef.close(this.exceljsondata);

    }
  
  }
}
