import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '../services/data.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-document-tab',
  templateUrl: './document-tab.component.html',
  styleUrls: ['./document-tab.component.css']
})
export class DocumentTabComponent {

  showCreateDiv: boolean = true;
  Organizations: any[] = [];
   employees:any[]=[];
  displayedColumns: string[] = [ 'select','firstName','lastName','create','download'];
  dataSource = new MatTableDataSource<any>(this.employees);
  selection = new SelectionModel<any>(true, []);
  isToolbarOpen = false;
  deleteRecordSave:any = [];
  snackBar: any;
  delId:any;
  organization:any;

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
 
  loading = false;

  isSmallScreen: boolean = false;
  
  durationInSeconds=3;
  constructor(public dialog: MatDialog,private http: HttpClient, private _snackBar: MatSnackBar,private dataService: DataService,private breakpointObserver: BreakpointObserver)  {}
  openSnackBar(message: string, isSuccess: boolean) {
    const panelClass = isSuccess ? ['success-snackbar'] : ['error-snackbar'];
  
    this._snackBar.open(message, '✘', {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: panelClass 
    });
  }
 
  async  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });
    await this.dataService.me();
    if(!this.dataService.organizationId){
      this.openSnackBar("User is not a part of any Organization " , false);
        
      }
    this.loading = true;
    this.Organizations = await this.dataService.organizationName;
    this.organization = this.Organizations;
    this.getdocuments().then(() => {
      this.loading = false;
    });
  }
  async getdocuments(){
   
    this.loading = true;
    var options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    this.http
      .get<any[]>(
        `https://api.samotplatform.com/Documents/organization/` +
          this.dataService.organizationId,
        { headers: options }
      )
      // .pipe(
      //   catchError((error) => {
      //     if (error.status >= 400 && error.status < 500) {
      //       this.openSnackBar("Client error occurred:  " + error.status, false);
      //       this.loading = false;
      //     } else if (error.status >= 500) {
      //       this.openSnackBar("Server error occurred: " + error.status, false);
      //       this.loading = false;
      //     } else {
      //       this.openSnackBar("An error occurred: " + error.status, false);
      //       this.loading = false;
      //     }
      //     return throwError(error);
      //   })
      // )
      .subscribe((data) => {
        this.employees = data;
        this.dataSource = new MatTableDataSource<any>(this.employees);
        this.dataSource.paginator = this.paginator;
        this.loading = false;
        // this.paginator.pageSize = this.selectedOption;
      });
  }
  // getEmployees():any{
  //   this.loading=true;
  //   var options = {
  //     "Authorization": "Bearer " + localStorage.getItem('token')
  //   }
  //   console.log(this.selectedOption);
  //   this.http.get<any[]>(`https://api.samotplatform.com/organizationemployees/`+this.selectedOption, {'headers':options})
  //   .pipe(
  //     catchError(error => {
  //       if (error.status >= 400 && error.status < 500) {
  //         this.openSnackBar('Client error occurred:  ' + error.status,false);
  //         this.loading=false;
  //       } else if (error.status >= 500) {
  //         this.openSnackBar('Server error occurred: ' + error.status,false);
  //         this.loading=false;
  //       } else {
  //         this.openSnackBar('An error occurred: ' + error.status,false);
  //         this.loading=false;

  //       }
  //       return throwError(error);
  //     })
  //   )
  //   .subscribe(data => {
  //     this.dataSource.data=[];
  //     if (data.length === 0) {
  //       this.loading = false; // Stop loader if there is no data
  //       return;
  //     }
  //     console.log(data);
  //     this.employees = data;
  //     this.dataSource = new MatTableDataSource<any>(this.employees);
  //     this.dataSource.paginator = this.paginator;
  //      this.loading=false;
  //     // this.paginator.pageSize = this.selectedOption;

    
  //     console.log(this.employees);
  //   });
  // }
  downloadReport(documentId:number){
    if(!this.dataService.selectedOrganizationUnit){
   window.open("https://api.samotplatform.com/documents/"+documentId+"/"+this.dataService.organizationId,"_blank");
  }else{
    window.open("https://api.samotplatform.com/timesheets/"+documentId+"/auditreport","_blank");

  }
 
}
  selectedOption: string;
  selectedRow:any = {};
  selections = new SelectionModel<any>(true,[]);
  handlePage(event: any) {
  }
  handleCheckboxChange( row: any): void {
    this.selections.toggle(row);
    this.selectedRow = this.selections.selected.length > 0 ? this.selections.selected: undefined;
     // Show the div if no rows are selected
     this.showCreateDiv = this.selections.selected.length === 0;
   
  }
  openToolbar() {
    // this.deleteRecordSave = this.selection.selected;
    // console.log(this.deleteRecordSave);
    if (this.selection.selected.length > 0 ) {
      (document.getElementById("toolBar") as HTMLLIElement).style.display = 'block';
    } else {
      (document.getElementById("toolBar") as HTMLLIElement).style.display = 'none';
    }

    if (this.selection.selected.length > 1 ) {
      (document.getElementById("tool-bar-edit") as HTMLLIElement).style.display = 'none';
    } else {
      (document.getElementById("tool-bar-edit") as HTMLLIElement).style.display = 'block';
    }

  }
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.dataSource.data.forEach(row => this.selection.select(row));
  }
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    const index = this.dataSource.data.indexOf(row) + 1;
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${index}`;
  }




  //  delEmployees(): void {
 
  //   if (this.selection.selected.length > 0) {
  //     const options = {
  //       "Authorization": "Bearer " + localStorage.getItem('token')
  //     };
  
  //     // Map over each selected employee and send delete requests
  //     const deleteRequests = this.selection.selected.map(employee => 
  //       this.http.delete(`https://api.samotplatform.com/Employees/${employee.employeeId}/${employee.organizationId}`, {'headers': options})
  //       .pipe(
  //         catchError(error => {
  //           if (error.status >= 400 && error.status < 500) {
  //             this.openSnackBar('Client error occurred:  ' + error.status,false);
  //             this.loading=false;
  //           } else if (error.status >= 500) {
  //             this.openSnackBar('Server error occurred: ' + error.status,false);
  //             this.loading=false;
  //           } else {
  //             this.openSnackBar('An error occurred: ' + error.status,false);
  //             this.loading=false;
  
  //           }
  //           return throwError(error);
  //         })
  //       )
  //     );
 
  //     forkJoin(deleteRequests).subscribe({
  //       next: () => {
  //         this.loading=false;
  //         this.employees = this.employees.filter(employee => 
  //           !this.selection.selected.includes(employee)
  //         );
          
  //         this.selection.clear();
  //         this.dataSource.data = this.employees;
  //         // Display a success message
  //         const totalDeletedEmployees = deleteRequests.length;
  //         const successMessage = `${totalDeletedEmployees} Employee${totalDeletedEmployees > 1 ? 's' : ''} Deleted Successfully`;
  //         this.openSnackBar(successMessage,true);    
  //         this.selection.clear();  
  //         this.showCreateDiv = this.selections.selected.length === 0;

  //         // Update the toolbar 
  //         this.openToolbar();
  //       },
  //       error: (error: HttpErrorResponse) => {
  //         console.error("Error deleting employees:", error);
  //         this.openSnackBar("Please Remove dependencies!",false);
  //       }
  //     });
  //   } else {
  //     this.openSnackBar("Select at least one employee to delete",false);
  //   }
  // }
  
}
