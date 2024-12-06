import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { read, utils } from 'xlsx';
import { AdminDataServicesService } from '../services/admin-data-services.service';
import { catchError, throwError } from 'rxjs';
interface UploadFileData {
  FileBytes: Uint8Array | null;
  OrganizationId: number;
  Type: string;
  Name: string;
}
@Component({
  selector: 'app-upload-document',
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.css']
})
export class UploadDocumentComponent {
  loading=false;
  fileBytes: Uint8Array | null = null;
  organization: number ; 
  fileType: string = ''; 
  fileName: string = ''; 

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds=1;
  constructor(public dialogRef: MatDialogRef<UploadDocumentComponent>,private _snackBar: MatSnackBar,public http:HttpClient,private dataservice:AdminDataServicesService){ };
  openSnackBar(message: string, isSuccess: boolean) {
    const panelClass = isSuccess ? ["success-snackbar"] : ["error-snackbar"];

    this._snackBar.open(message, "✘", {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: panelClass,
    });
  }

    file:any={};
    uploadEvent:any={};
    arrayBuffer:any={};
    exceljsondata:any=[];
    onFileChange(event) {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        this.readFileAsBytes(file);
        this.fileName = file.name;
        this.fileType = file.type;
      }
    }
    
    
    readFileAsBytes(file: File) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fileBytes = new Uint8Array(reader.result as ArrayBuffer);
        // Now you can send the fileBytes to your API
      };
      reader.readAsArrayBuffer(file);
    }
   
    uploadFileBytes() {
      const formData = new FormData();
      formData.append('File', new Blob([this.fileBytes], { type: this.fileType }), this.fileName);
      formData.append('OrganizationId', this.dataservice.organization.toString());
      formData.append('Type', this.fileType);
      formData.append('Name', this.fileName);
      // Your HTTP request to upload the uploadData object to your API
      const options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
    };
    this.loading=true;
      this.http.post(`https://api.samotplatform.com/Documents`, formData, { 'headers': options })
      .pipe(
        catchError((error) => {
          if (error.status >= 400 && error.status < 500) {
            this.openSnackBar("Client error occurred:  " + error.status, false);
            this.loading = false;
          } else if (error.status >= 500) {
            this.openSnackBar("Server error occurred: " + error.status, false);
            this.loading = false;
          } else {
            this.openSnackBar("An error occurred: " + error.status, false);
            this.loading = false;
          }
          return throwError(error);
        })
      )  
      .subscribe(
          response => {
            this.loading=false;
            this.openSnackBar('File uploaded successfully',true);
            this.dialogRef.close(response);
          },
         
        );
    }
    

}
