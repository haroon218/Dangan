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
import { Observable, catchError, forkJoin, map, startWith, throwError } from 'rxjs';
import { BulkEmployeeComponent } from '../bulk-employee/bulk-employee.component';
import { EmployeeCreateComponent } from '../employee-create/employee-create.component';
import { DataService } from 'app/modules/user/services/data.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FormControl } from '@angular/forms';
import { or } from 'ajv/dist/compile/codegen';
import { Router } from '@angular/router';
import { count } from 'console';

export interface Employee {
  id: string;
  employeeId: number;
  organizationId:number;
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
  annualSalary: number;
  employeeStatus: number;
  HourlySalary:number;
  extra:number;
}
@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent {
  myControl = new FormControl('');  
  filteredOrganization: Observable<any>;
  value: string;
  options: any = [];
  orgID:any;
  selectedOption:any;
  selectedRow:any = {};
  selections = new SelectionModel<Employee>(true,[]);
  searchText: string;
  showCreateDiv: boolean = true;
  Organizations: Organization[] = [];
   employees:Employee[]=[];
  displayedColumns: string[] = [ 'select','firstName','lastName','email','salary'];
  dataSource = new MatTableDataSource<Employee>(this.employees);
  selection = new SelectionModel<Employee>(true, []);
  isToolbarOpen = false;
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

  isSmallScreen: boolean = false;
  
  durationInSeconds=3;
  constructor(private router:Router,public dialog: MatDialog,private _liveAnnouncer: LiveAnnouncer,private changeDetectorRefs: ChangeDetectorRef,private http: HttpClient, private _snackBar: MatSnackBar,private dataService: DataService,public Headercds:ChangeDetectorRef,private breakpointObserver: BreakpointObserver)  {}
  openSnackBar(message: string, isSuccess: boolean) {
    const panelClass = isSuccess ? ['success-snackbar'] : ['error-snackbar'];
  
    this._snackBar.open(message, '✘', {
      duration: this.durationInSeconds * 1500,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: panelClass 
    });
  }
 
org:any;
orgIdlocalstorage:any;
  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if token is missing
      this.router.navigate(['']);
      return;
    }
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });
    this.loading = true;
    const options = {
      "Authorization": "Bearer " + localStorage.getItem('token')      
    };
    this.http.get<Organization[]>(`https://dgr.sso.id/myorganizations`, { 'headers': options })
      .pipe(
        catchError(error => {
          if (error.status >= 400 && error.status < 500) {
            this.openSnackBar('Client error occurred:  ' + error.status, false);
            this.loading = false;
          } else if (error.status >= 500) {
            this.openSnackBar('Server error occurred: ' + error.status, false);
            this.loading = false;
          } else {
            this.openSnackBar('An error occurred: ' + error.status, false);
            this.loading = false;
          }
          return throwError(error);
        })
      )
      .subscribe(data => {
        if (data.length === 0) {
          this.loading = false; // Stop loader if there is no data
          return;
        }
        this.Organizations = data.filter(org => org.Name).sort((a, b) => a.Name.localeCompare(b.Name));
        var getOrganization = JSON.parse(localStorage.getItem('Organization'));
        if(getOrganization!==null){
        this.org = getOrganization;
        this.selectedOption = getOrganization.Name;
        this.orgIdlocalstorage =getOrganization.OrganizationId;
        this.getEmployees(this.orgIdlocalstorage);
        this.loading = false;
        }else{
        this.org = this.Organizations[0];
        localStorage.setItem("Organization",JSON.stringify(this.org));
        this.selectedOption = this.Organizations[0].Name;
        var orgId =this.Organizations[0].OrganizationId;
        this.getEmployees(orgId);
        this.loading = false;
        }
        
      });
  }
  get filteredOrganizations(): Organization[] {
    const searchText = this.searchText ? this.searchText.toLowerCase() : '';
    return this.Organizations.filter(option => option.Name.toLowerCase().includes(searchText));
  }
  selectOrganization(){
        if(this.selectedOption.OrganizationId!=undefined){
         this.orgID=this.selectedOption.OrganizationId;
        this.org=this.selectedOption;
        localStorage.removeItem("Organization");
        localStorage.setItem("Organization",JSON.stringify(this.org));
        this.selectedOption=this.selectedOption.Name;
        this.loading=true;
            this.getEmployees(this.orgID);
            this.loading=false;
          }else{
          }
    this.loading=true;
    const options = {
      "Authorization": "Bearer " + localStorage.getItem('token')      
    };

    this.http.get<Organization[]>(`https://dgr.sso.id/myorganizations`, { 'headers': options })
      .pipe(
        catchError(error => {
          if (error.status >= 400 && error.status < 500) {
            this.openSnackBar('Client error occurred:  ' + error.status, false);
            this.loading = false;
          } else if (error.status >= 500) {
            this.openSnackBar('Server error occurred: ' + error.status, false);
            this.loading = false;
          } else {
            this.openSnackBar('An error occurred: ' + error.status, false);
            this.loading = false;
          }
          return throwError(error);
        })
      )
     .subscribe(data => {
      if (data.length === 0) {
        this.loading = false; // Stop loader if there is no data
        return;
      }
       this.options=[];
       this.options = data;
       this.filteredOrganization = this.myControl.valueChanges.pipe(
         startWith(''),
         map(value => this._filters(value || '')),
       );
       this.loading = false;
     });
  }
  private _filters(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.Name.toLowerCase().includes(filterValue));
  }

  
  clearInput() {
    this.selectedOption = ''; // Clear the input value
  }
  getEmployees(id:any):any{
    this.loading=true;
    var options = { 
      "Authorization": "Bearer " + localStorage.getItem('token')
    }
    this.http.get<Employee[]>(`https://api.samotplatform.com/organizationemployees/`+id, {'headers':options})
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
    .subscribe(data => {
      this.dataSource.data=[];
      if (data.length === 0) {
        this.loading = false; // Stop loader if there is no data
        return;
      }
       this.employees = data;
      this.dataSource = new MatTableDataSource<Employee>(this.employees);
      this.dataSource.paginator = this.paginator;
       this.dataSource.sort = this.sort;
       this.loading=false;
      // this.paginator.pageSize = this.selectedOption;

    
    });
  }
 
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
  openDialog() {
    const dialogConfig = new MatDialogConfig();
    if (this.selectedOption.OrganizationId!=undefined) {
      dialogConfig.data = [{ organizationId: this.selectedOption.OrganizationId }];
    } else {
      dialogConfig.data = [{ organizationId: this.org.OrganizationId }];       
    }
    if (this.isSmallScreen) {
      dialogConfig.width = '80%';
    } else {
      dialogConfig.width = '58%';
    }

    const dialogRef = this.dialog.open(EmployeeCreateComponent, dialogConfig);
 
  
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.emp) {
        this.employees=this.dataSource.data;  
        this.employees.push(result.emp);
        this.dataSource.data=this.employees; 
      }
      else {
        this.selection.clear();
        this.selections.clear();
        this.showCreateDiv = this.selections.selected.length === 0;

        this.openToolbar();
      }
    });
  }
  
editEmployee() {
  const dialogConfig = new MatDialogConfig();
  dialogConfig.data = this.selectedRow;
  this.selectedRow.isEdit = true;
  if (this.isSmallScreen) {
    dialogConfig.width = '80%';
  } else {
    dialogConfig.width = '58%';
  }

  const dialogRef = this.dialog.open(EmployeeCreateComponent, dialogConfig);
  // this.selection.clear(); // Clear the selection
  // this.openToolbar();
  dialogRef.afterClosed().subscribe(result => {
    if (result && result.emp) {
      const index = this.employees.findIndex(e => e.employeeId === result.emp.employeeId);
      if (index !== -1) {
        this.employees[index] = result.emp; // Update the existing employee in the local array
        this.dataSource.data = this.employees; // Update the MatTableDataSource
        this.selections.clear();
        this.selection.clear(); // Clear the selection
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
  
      // Map over each selected employee and send delete requests
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
          this.selections.clear();
          this.selection.clear(); 
          this.showCreateDiv = this.selections.selected.length === 0;
          this.openToolbar();
          this.openSnackBar(successMessage,true);    

        },
        error: (error: HttpErrorResponse) => {
          this.openSnackBar("Please Remove dependencies!",false);
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
    //  let excelEmployee = result.length;
     let countEmployee=0;
      let alreadyExist=0;
       result.forEach(emp => {
        var find = this.dataSource.data.find(x=>x.email==emp.email);
        if(find!== undefined){
          //  countEmployee= countEmployee-1;
            alreadyExist= alreadyExist+1;
           if(alreadyExist==result.length){
            this.openSnackBar("  Employees Already exists!",false);
             }
           return
        }else{
          this.loading = true;
          if (this.selectedOption.OrganizationId!=undefined) {
            emp.organizationId=this.selectedOption.OrganizationId;
          } else {
          emp.organizationId=this.orgIdlocalstorage; 
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
           
           .subscribe((data:any) => {
            this.loading =  false;
           countEmployee=countEmployee+1;
            if(data!==null){
              this.employees=this.dataSource.data;
            this.employees.push(data);
              this.dataSource.data = this.employees;
               this.dataSource.paginator = this.paginator;
               if(alreadyExist!==0){
              this.openSnackBar(alreadyExist +"   Employees Already exists! &&  ("+ countEmployee + ")  Employees Added Successfully!",true);
            }else{
              this.openSnackBar(countEmployee + "  Employees Added Successfully!",true);
            }
            }else{
                this.openSnackBar("Employees!",false);
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
    Name: string;
    id: string;
    OrganizationId: string;
    employeeId: number;
  }



