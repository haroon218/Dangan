import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
//import { DataService } from 'app/modules/user/services/data.service';
import { catchError, forkJoin, throwError } from 'rxjs';
import { BulkEmployeeComponent } from '../bulk-employee/bulk-employee.component';
import { EmployeeCreateComponent } from '../employee-create/employee-create.component';
import { DataService } from 'app/modules/user/services/data.service';
import { TimeSheetFormComponent } from '../time-sheet-form/time-sheet-form.component';
import { JobFormComponent } from '../job-form/job-form.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
export interface Employee {
  id: string;
  jobTitle:string;
  rate: number;
  description:string;
organizationId:string;
}
@Component({
  selector: 'app-jobs-rate',
  templateUrl: './jobs-rate.component.html',
  styleUrls: ['./jobs-rate.component.css']
})
export class JobsRateComponent {


  Organizations: Organization[] = [];
  employees:Employee[]=[];
 displayedColumns: string[] = [ 'select','JobTitle','Rate','Description' ];
 dataSource = new MatTableDataSource<Employee>(this.employees);
 selection = new SelectionModel<Employee>(true, []);
 isToolbarOpen = false;
 isSmallScreen: boolean = false;
 deleteRecordSave:any = [];
 snackBar: any;
 delId:any;
 horizontalPosition: MatSnackBarHorizontalPosition = 'right';
 verticalPosition: MatSnackBarVerticalPosition = 'bottom';
 @ViewChild(MatPaginator)
 paginator!: MatPaginator;
 @ViewChild(MatSort)
 sort: MatSort = new MatSort;
 loading = false;

 
 durationInSeconds=3;
 constructor(public dialog: MatDialog,private _liveAnnouncer: LiveAnnouncer,private changeDetectorRefs: ChangeDetectorRef,private http: HttpClient, private _snackBar: MatSnackBar,private dataService: DataService,public Headercds:ChangeDetectorRef,private breakpointObserver: BreakpointObserver )  {}
 openSnackBar(message) {
   this._snackBar.open(message, 'Ok', {
     horizontalPosition: this.horizontalPosition,
     verticalPosition: this.verticalPosition,
     duration: this.durationInSeconds * 1000,

   });
 }


 ngOnInit() {
  this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).subscribe(result => {
    this.isSmallScreen = result.matches;
  });
   this.loading = true;
   var options = {
    "Authorization": "Bearer " + localStorage.getItem('token')
    
  }
  this.http.get<Organization[]>(`https://dgr.sso.id/myorganizations`, {'headers':options})
  // .pipe(
  //   catchError(error => {
  //     if (error.status >= 400 && error.status < 500) {
  //       this.openSnackBar('Client error occurred:  ' + error.status,false);
  //       this.loading=false;
  //     } else if (error.status >= 500) {
  //       this.openSnackBar('Server error occurred: ' + error.status,false);
  //       this.loading=false;
  //     } else {
  //       this.openSnackBar('An error occurred: ' + error.status,false);
  //       this.loading=false;

  //     }
  //     return throwError(error);
  //   })
  // )
  .subscribe(data => {
   console.log(data);
    this.Organizations = data;
    this.selectedOption = this.Organizations[0].OrganizationId;
    this.loading=false;
    this.getEmployees();
  });
 
}
 getEmployees():any{
   var options = {
     "Authorization": "Bearer " + localStorage.getItem('token')
   }
   console.log(this.selectedOption);
   this.http.get<Employee[]>(`https://api.samotplatform.com/jobs/organization/`+this.selectedOption, {'headers':options})
   .subscribe(data => {
     console.log(data);
     this.employees = data;
     this.dataSource = new MatTableDataSource<Employee>(this.employees);
     this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loading=false;
     this.paginator.pageSize = this.selectedOption;

   
     console.log(this.employees);
   });
 }
results:any={};

 selectedOption: string;
 selectedRow:any = {};
 selections = new SelectionModel<Employee>(true,[]);
 handlePage(event: any) {
 }
 handleCheckboxChange( row: Employee): void {
   this.changeDetectorRefs.detectChanges();
   this.selections.toggle(row);
   this.selectedRow = this.selections.selected.length > 0 ? this.selections.selected[0] : undefined;
   
   console.log('Selected:', this.selectedRow);
   this.delId = this.selectedRow.id;
   console.log('Selected:', this.delId);
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
 checkboxLabel(row?: Employee): string {
   if (!row) {
     return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
   }
   const index = this.dataSource.data.indexOf(row) + 1;
   return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${index}`;
 }

 openForm() {
   const dialogRef = this.dialog.open(JobFormComponent, {
    data: { organizationId: this.selectedOption },
    width: '600px',
    height:'320px',
   });
 
   dialogRef.afterClosed().subscribe(result => {
    console.log(`Dialog result: ${result.id}`);
     this.results=result;
     console.log(this.results);
     this.employees.push(this.results);
     console.log(this.employees);
   
     this.dataSource.data = this.employees;
  });
 }
 
editEmployee() {
 const dialogConfig = new MatDialogConfig();
 dialogConfig.data = this.selectedRow;
 this.selectedRow.isEdit = true;
 const dialogRef = this.dialog.open(JobFormComponent, dialogConfig);

 dialogRef.afterClosed().subscribe(result => {
   if (result && result.emp) {
     const index = this.employees.findIndex(e => e.id === result.emp.id);
     if (index !== -1) {
       this.employees[index] = result.emp; // Update the existing employee in the local array
       this.dataSource.data = this.employees; // Update the MatTableDataSource
       this.openToolbar();

       this.selections.clear();
       this.selection.clear(); // Clear the selection
     }
   }
 });
}


  delEmployees(): void {

   if (this.selection.selected.length > 0) {
     const options = {
       "Authorization": "Bearer " + localStorage.getItem('token')
     };
 
     // Map over each selected employee and send delete requests
     const deleteRequests = this.selection.selected.map(employee => 
       this.http.delete(`https://api.samotplatform.com/jobs/${employee.id}`, {'headers': options})
     
     );

     forkJoin(deleteRequests).subscribe({
       next: () => {
         this.employees = this.employees.filter(employee => 
           !this.selection.selected.includes(employee)
         );
         
         this.selection.clear();
  this.dataSource.data = this.employees;
         // Display a success message
         const totalDeletedEmployees = deleteRequests.length;
         const successMessage = `${totalDeletedEmployees} Jobs${totalDeletedEmployees > 1 ? 's' : ''} Deleted Successfully`;
         this.openSnackBar(successMessage);          
         // Update the toolbar 
         this.openToolbar();
       },
       error: (error: HttpErrorResponse) => {
         console.error("Error deleting employees:", error);
         this.openSnackBar("Error deleting employees");
       }
     });
   } else {
     this.openSnackBar("Select at least one employee to delete");
   }
 }
 
 

}
export interface Organization {
  name: string;
  OrganizationId:string;
}




