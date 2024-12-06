  import { Component, Input } from '@angular/core';
  import { ChangeDetectorRef,  OnInit, ViewChild } from '@angular/core';
  import { SelectionModel } from '@angular/cdk/collections';
  import { MatTableDataSource } from '@angular/material/table';
  import {
    MatSnackBar,
    MatSnackBarHorizontalPosition,
    MatSnackBarVerticalPosition,
  } from '@angular/material/snack-bar';
  import { MatPaginator } from '@angular/material/paginator';

  import { LiveAnnouncer } from '@angular/cdk/a11y';
  import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
  import { EmployeeCreateComponent } from '../employee-create/employee-create.component';
  import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
  import { DataService } from '../services/data.service';
  import {  catchError, forkJoin, throwError } from 'rxjs';
  import { BulkEmployeeComponent } from '../bulk-employee/bulk-employee.component';
  import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

  export interface Employee {
    id: string;
    employeeId:number;
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
    organizationId:number;
  }
  @Component({
    selector: 'app-table-list',
    templateUrl: './table-list.component.html',
    styleUrls: ['./table-list.component.css']
  })
  export class TableListComponent {
    Organizations: any;  //In Organizations array the employees organizations are stored 
    employees:Employee[]=[];//In employees array the  organizations employees are stored 
    selectedRow:any = {};
    organization:any;
    check:boolean;
    displayedColumns: string[] = [ 'select','firstName', 'lastName','email','salary' ];
    dataSource = new MatTableDataSource<Employee>(this.employees);
    selection = new SelectionModel<Employee>(true, []);
    selections = new SelectionModel<Employee>(true,[]);

    isToolbarOpen = false;
    snackBar: any;
    delId:any;
    horizontalPosition: MatSnackBarHorizontalPosition = 'right';
    verticalPosition: MatSnackBarVerticalPosition = 'bottom';
    @ViewChild(MatPaginator)
    paginator!: MatPaginator;
    loading = false;
    isSmallScreen: boolean = false;
    showCreateDiv: boolean = true;

    durationInSeconds=3;
    constructor(public dialog: MatDialog,private _liveAnnouncer: LiveAnnouncer,private changeDetectorRefs: ChangeDetectorRef,private http: HttpClient, private _snackBar: MatSnackBar,public dataService: DataService,public Headercds:ChangeDetectorRef,private breakpointObserver: BreakpointObserver)  {}
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
      this.getEmployees().then(() => {
        this.loading = false;
      });
    }
    async getEmployees(): Promise<void> {
      try {
       
  
        const options = {
          "Authorization": "Bearer " + localStorage.getItem('token')
        };
  
        const data = await this.http.get<Employee[]>(`https://api.samotplatform.com/organizationemployees/${this.dataService.organizationId}`, { 'headers': options }).toPromise();
  this.employees=data;
        this.dataSource = new MatTableDataSource<Employee>(data);
        this.dataSource.paginator = this.paginator;
        this.selection.clear(); // Clear the selection
      } catch (error) {
        // this.handleError(error);
      }
    }
  
    // handleError(error: any): void {
    //   this.loading = false;
    //   if (error.status >= 400 && error.status < 500) {
    //     this.openSnackBar('Client error occurred:  ' + error.status, false);
    //   } else if (error.status >= 500) {
    //     this.openSnackBar('Server error occurred: ' + error.status, false);
    //   } else {
    //     this.openSnackBar('An error occurred: ' + error.status, false);
    //   }
    // }
  
  
    
    handlePage(event: any) {
    }
   
    handleCheckboxChange( row: Employee): void {
      this.selections.toggle(row);
      this.selectedRow = this.selections.selected.length > 0 ? this.selections.selected: undefined;
     
      this.showCreateDiv = this.selections.selected.length === 0;
      
    }
    openToolbar() {
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
    
    toggleAllRows() {
      if (this.isAllSelected()) {
    
        this.selection.clear();
        this.selections.clear();
        this.showCreateDiv = this.isAllSelected.length === 0;
    
        return;
      }
      this.dataSource.data.forEach(row => this.selection.select(row));
      this.showCreateDiv = this.selection.selected.length === 0;
    
    }
    checkboxLabel(row?: Employee) {
      if (!row) {
        return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
      }
      const index = this.dataSource.data.indexOf(row) + 1;
    
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${index}`;
    }
    results:any={};

    openDialog() {
      const dialogRef = this.dialog.open(EmployeeCreateComponent, {
        data: [{ OrganizationId: this.dataService.organizationId }],
        height: 'fit-content'
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if(result!=undefined){
          this.results=result;

          this.dataSource.data.push(this.results) ; 
          this.dataSource= new MatTableDataSource<Employee>(this.employees);

          this.selection.clear(); // Clear the selection
          // Update the MatTableDataSource with the updated data
        }else {
          this.selection.clear();
          this.selections.clear();
          this.openToolbar();
        }
      });
    }
    
  editEmployee() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.selectedRow;
    this.selectedRow.isEdit = true;
    const dialogRef = this.dialog.open(EmployeeCreateComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if(result!=undefined){
        const index = this.employees.findIndex(e => e.employeeId === result.employeeId);
        if (index !== -1) {
          this.employees[index] = result;
          this.dataSource.data = this.employees;
          this.selection.clear();
          this.selections.clear(); // Clear the selection
          this.showCreateDiv = this.selections.selected.length === 0;
          this.openToolbar();
        }
      }else {
        this.selection.clear();
        this.selections.clear();
        this.showCreateDiv = this.selections.selected.length === 0;

        this.openToolbar();
      }
    });
  }


    delEmployees(): void {
  
      if (this.selection.selected.length > 0) {
        const options = {
          "Authorization": "Bearer " + localStorage.getItem('token')
        };
        this.loading=true;
        const deleteRequests = this.selection.selected.map(employee => 
          this.http.delete(`https://api.samotplatform.com/Employees/${employee.employeeId}/${employee.organizationId}`, {'headers': options})
          .pipe(
            catchError(error => {
              if (error.status >= 400 && error.status < 500) {
                this.openSnackBar('Client error occurred:  ' + error.status,false);
                this.loading=false;
              } else if (error.status >= 500) {
                this.openSnackBar('Server error occurred: ' + error.status,false);
                this.loading=false;
              } else {
                this.openSnackBar('An error occurred: ' + error.status,false);
                this.loading=false;
    
              }
              return throwError(error);
            })
          )
        );
  
        forkJoin(deleteRequests).subscribe({
          next: () => {
            this.loading=false;
            this.employees = this.employees.filter(employee => 
              !this.selection.selected.includes(employee)
            );
            
           this.dataSource.data = this.employees;
            // Display a success message
            const totalDeletedEmployees = deleteRequests.length;
            const successMessage = `${totalDeletedEmployees} Employee${totalDeletedEmployees > 1 ? 's' : ''} Deleted Successfully`;
            this.openSnackBar(successMessage,false);
            this.selections.clear();
            this.selection.clear();
            this.showCreateDiv = this.selections.selected.length === 0;
            // Update the toolbar
            this.openToolbar();

          },
          error: (error: HttpErrorResponse) => {
            this.openSnackBar("Error deleting employees",false);
          }
        });
      } else {
        this.openSnackBar("Select at least one employee to delete",false);
      }
    }
    
    AddBulk(){
      const dialogRef = this.dialog.open(BulkEmployeeComponent, {
        width: '400px',
        height: '250px', 
      });
      dialogRef.afterClosed().subscribe(result => {
       let countEmployee = result.length;
        
         result.forEach(emp => {
          var find = this.dataSource.data.find(x=>x.email==emp.email);
          if(find!== undefined){
             countEmployee= countEmployee-1;
             if(countEmployee!== 0){
           this.openSnackBar(countEmployee + "  Employee(s) Already exists!",false);
          }else{
           this.openSnackBar("Employee(s) Already exists!",false);
          }
             return
          }else{
            this.loading = true;
            if (this.dataService.organizationId!=undefined) {
              emp.organizationId=this.dataService.organizationId;
            } 
            emp.ppsn=emp.ppsn.toString();
            function ExcelDateToJSDate(serialnumber) {
              var utc_days  = Math.floor(serialnumber - 25569);
              var utc_value = utc_days * 86400;                                        
              var date_info = new Date(utc_value * 1000);
           
              var fractional_day = serialnumber - Math.floor(serialnumber) + 0.0000001;
           
              var total_seconds = Math.floor(86400 * fractional_day);
           
              var seconds = total_seconds % 60;
           
              total_seconds -= seconds;
           
              var hours = Math.floor(total_seconds / (60 * 60));
              var minutes = Math.floor(total_seconds / 60) % 60;
           
              return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
           }
           emp.dob=ExcelDateToJSDate(emp.dob);
            emp.startDate=ExcelDateToJSDate(emp.startDate);
  
            var options = {
              "Authorization": "Bearer " + localStorage.getItem('token')
              
            }
             this.http.post(`https://api.samotplatform.com/Employees`,emp,{'headers':options})
             .pipe(
              catchError(error => {
                if (error.status >= 400 && error.status < 500) {
                  this.openSnackBar('Client error occurred:  ' + error.status,false);
                  this.loading=false;
                } else if (error.status >= 500) {
                  this.openSnackBar('Server error occurred: ' + error.status,false);
                  this.loading=false;
                } else {
                  this.openSnackBar('An error occurred: ' + error.status,false);
                  this.loading=false;
      
                }
                return throwError(error);
              })
            )
             .subscribe((data:any) => {
              this.loading =  false;
              if(data!==null){
              this.employees=this.dataSource.data;
              this.employees.push(data);
                this.dataSource.data = this.employees;
                this.openSnackBar( countEmployee + "  Employee(s) Added Successfully!",true);
              }else{
                  this.openSnackBar("Employee(s)!",false);
                }
            });
          }    
         });
         if(countEmployee>0){
            // this.openSnackBar( countEmployee + "  Employee(s) Added Successfully!",true);
         }
      });
    
    }

  
  }
    export interface Organization {
      name: string;
      id: string;
      Name: string;
      OrganizationId: number;
    }
    export interface loggedInUser {
      user_id : number;
      firstName:string;
      lastName:string;
      email: string;
      margin:number;
      status: string;
      user_roles:any[];
      user_organizations:any[];
    }



