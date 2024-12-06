import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { DataService } from '../services/data.service';
interface UploadFileData {
  fileBytes: Uint8Array | null;
  organization: number;
  fileType: string;
  fileName: string;
}
@Component({
  selector: 'app-upload-document',
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.css']
})
export class UploadDocumentComponent {
  fileBytes: Uint8Array | null = null;
  organization: string = ''; // Set organization value as needed
  fileType: string = ''; // Set fileType value as needed
  fileName: string = ''; // Set fileName value as needed

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds=1;
  constructor(public dialogRef: MatDialogRef<UploadDocumentComponent>,private _snackBar: MatSnackBar,public http:HttpClient,private dataservice:DataService){ };
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
    onFileChange(event) {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        this.readFileAsBytes(file);
      }
    }
    
    readFileAsBytes(file: File) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fileBytes = new Uint8Array(reader.result as ArrayBuffer);
        // Now you can send the fileBytes to your API
        this.uploadFileBytes();
      };
      reader.readAsArrayBuffer(file);
    }
    
    uploadFileBytes() {
      const uploadData: UploadFileData = {
        fileBytes: this.fileBytes,
        organization: this.dataservice.organization,
        fileType: this.fileType,
        fileName: this.fileName
      };
  
      // Your HTTP request to upload the uploadData object to your API
      this.http.post('your-api-url', uploadData).subscribe(
        (response) => {
          this.openSnackBar('File uploaded successfully');
          // Optionally, close the dialog or perform any other action upon successful upload
          this.dialogRef.close();
        },
        (error) => {
          this.openSnackBar('Error uploading file. Please try again.');
          // Handle error here
        }
      );
    }
}


