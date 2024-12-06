import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { send } from 'process';
import { Observable, catchError, map, startWith, throwError } from 'rxjs';
export interface Department {
  id:string;
  name:string;
  OrganizationId:string;
}
export interface Employee {
  id: string;
  groupId:number;
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
}
export interface users {
  id : string;
  userId:number;
  firstName:string;
  lastName:string;
  email: string;
  margin:number;
  idpId:number;
}
@Component({
  selector: 'app-departmentconfig',
  templateUrl: './departmentconfig.component.html',
  styleUrls: ['./departmentconfig.component.css']
})
export class DepartmentconfigComponent {
  myControl = new FormControl('');
  // myControluser= new FormControl('');
  options: string[] = [];
  department: any = {};
  employees: Employee[] = [];
  users: any = [];
  value: string;
  // values: string;
  group: any = {};
  applicationId: any = {};
  application: string[] = [];
  roleId: any = {};
  roleArray: string[] = [];
  userIdArray: string[] = [];
  userId: any = {};
  searchcriteria: any = {};
  
  samotResponse: any = {};
  sendgroup: any = {};
  groupEmployees: string[] = [];
  empIdobj: any = {};
  empIdArray: string[] = [];
  userIdObj: any = {};
  userObjArray: string[] = [];
  isSmallScreen: boolean = false;
  loading =false;
  apiOptions= {
    "Authorization": "Bearer " + localStorage.getItem('token')
  };

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  filteredOptions: Observable<string[]>;
  filteredUsers: Observable<string[]>;
  NameFormControl = new FormControl('', [
    Validators.required,
  ]);
  AddressFormControl = new FormControl('', [
    Validators.required,
  ]);
  AccountemailFormControl= new FormControl('', [
    Validators.email,
    Validators.required,
  ]);
  displayedColumns: string[] = ['name', 'weight', 'symbol'];
  // dataSource = ELEMENT_DATA;
  dataSource = new MatTableDataSource<Employee>([]);
  userdataSource = new MatTableDataSource<users>([]);
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DepartmentconfigComponent>,
    private _snackBar: MatSnackBar,
    private router: Router,
    @Optional() @Inject(MAT_DIALOG_DATA) public data,
    private http: HttpClient,
    public route: Router,
    private cdr: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver 
  ) {

    if(data.length!=null){
    this.group = data[0];
  }
  }
  durationInSeconds=3;
  openSnackBar(message: string, isSuccess: boolean) {
    const panelClass = isSuccess ? ['success-snackbar'] : ['error-snackbar'];
  
    this._snackBar.open(message, '✘', {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: panelClass 
    });
  }
  isPOMode: boolean = false;
  onToggleChange() {
    if (this.isPOMode) {
    } else {
    }
  }
  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });
    //GetUsers
    if(this.group.groupId){
      this.http.get<users[]>(`https://api.samotplatform.com/groups/users/`+ this.group.groupId, { 'headers': this.apiOptions })
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
        this.userdataSource.data=data;
      });

   }else{
   }
    // GetEmployees
    if(this.group.groupId){
      this.http.get<Employee[]>(`https://api.samotplatform.com/groups/employees/`+ this.group.groupId, { 'headers': this.apiOptions })
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
        this.dataSource.data=data;
        
      });
   }else{
   }

  
  }

  
  // Employees Add
  addEmployees() {
    let foundEmployee = this.employees.find(employee => employee.firstName+ ' ' + employee.lastName === this.value);
    this.getEmployees();
      if (foundEmployee) {
        this.dataSource.data.push(foundEmployee);
        this.dataSource.data = [...this.dataSource.data];
        this.value='';
      } else {
      }
  }
  clearUser(){
    this.value = ''; 
  }
  clearInput() {
    this.value = ''; // Clear the input value
  }
  getEmployees(): any {
   this.loading=true;
    this.http.get<Employee[]>(`https://api.samotplatform.com/organizationemployees/` + this.group.organizationId, { 'headers': this.apiOptions })
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
    .subscribe((data:any[]) => {
   this.loading=false;

        if (data.length === 0) {
          this.openSnackBar("This Organization Have no Employees!",false);
        }
        this.options=[];
        this.employees = data;
        this.options = this.employees.map(employee => employee.firstName + ' ' + employee.lastName);
        this.filteredOptions = this.myControl.valueChanges.pipe(
          startWith(''),
          map(values => this._filter(values || '')),
        );
      });
  }
  private _filter(values: string): string[] {
    const filterValue = values.toLowerCase();
    // Exclude options that are already in the dataSource
    const availableOptions = this.options.filter(option => !this.dataSource.data.some(employee => (employee.firstName + ' ' + employee.lastName).toLowerCase() === option.toLowerCase()));
    return availableOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  // Delete data from dataSource
  deleteEmployees(user: Employee, index: number): void {
    const userId = user.id;

    const dataArray = this.dataSource.data;
  // Find the index of the user in the array
  const userIndex = dataArray.findIndex((item) => item.id === userId);
  if (userIndex !== -1) {
    // Remove the user from the data array
    dataArray.splice(userIndex, 1);
    // Update the MatTableDataSource with the modified data array
    this.dataSource.data = dataArray;
  }
  }
// ----------------------------------
// Add Function

  add(){
        if (this.NameFormControl.invalid || this.AddressFormControl.invalid  || this.AccountemailFormControl.invalid) {
          this.openSnackBar("Group Name & Address is required & Primary Email is required!",false);

        } else {
        this.applicationId.ApplicationId = 1;
        this.application.push(this.applicationId);
        this.group.Application_Group = this.application;
        this.roleId.RoleId = 3;//RoleId 2=Admin,3=User,4=approver
        this.roleArray.push(this.roleId);
        this.group.Group_Role = this.roleArray;
        this.group.GroupName=this.group.name;
        this.userdataSource.data.forEach(item => {
          this.userId = { UserId: item.userId };
          this.userIdArray.push(this.userId);
        });
        this.group.Group_User=this.userIdArray;

    if(!this.group.groupId){
      this.loading=true;
      this.http.post(`https://dgr.sso.id/groups`, this.group, { 'headers': this.apiOptions })
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
        this.samotResponse=data;
        this.sendgroup.OrganizationId=this.group.organizationId;
        this.sendgroup.groupId=this.samotResponse.GroupId;
        this.sendgroup.Name=this.samotResponse.GroupName;
        this.sendgroup.address = this.group.address;
        this.sendgroup.isPORequired = this.group.isPORequired;
        this.sendgroup.primaryContactEmail =this.group.primaryContactEmail;
        this.sendgroup.primaryContactName =this.group.primaryContactName;
        this.sendgroup.primaryContactNumber =this.group.primaryContactNumber;
        this.sendgroup.primaryContactPosition =this.group.primaryContactPosition;
        let order = 1;
        this.userIdArray.forEach((item :any) => {
              var user=this.userdataSource.data.find(x=>x.userId===item.UserId);
            this.userIdObj.UserId= user.userId;
            this.userIdObj.Order=order;

            this.userObjArray.push(this.userIdObj);
            this.userIdObj={};
            order++;
        });
        this.sendgroup.GroupUsers=this.userObjArray;
        this.dataSource.data.forEach(item => {
          this.empIdobj = { EmployeeId: item.employeeId };
          this.empIdArray.push(this.empIdobj);
        });
        this.sendgroup.GroupEmployees=this.empIdArray;
        var assignToOrg={
          OrganizationId :this.group.organizationId,
          GroupId:this.samotResponse.GroupId,
        }

        this.http.post(`https://dgr.sso.id/groups/assigntoorganization/`, assignToOrg, { 'headers': this.apiOptions })
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
        });

        this.http.post(`https://api.samotplatform.com/groups`, this.sendgroup, { 'headers': this.apiOptions })
        .pipe(
          catchError(error => {
            if (error.status >= 400 && error.status < 500) {
              console.log(error)
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
        .subscribe(orgUnit => {
          this.openSnackBar("OrganizationUnit Added Successfully!",true);
        this.loading=false;
        this.sendgroup={};
        this.dialogRef.close(orgUnit);
          return;
        });

      });
      }else{
        this.loading=true;
        this.sendgroup.groupId=this.group.groupId;
        this.sendgroup.OrganizationId=this.group.organizationId;
        // this.sendgroup.IdpId=this.group.idpId;
        this.sendgroup.Name=this.group.name;
        this.sendgroup.address = this.group.address;
        this.sendgroup.isPORequired = this.group.isPORequired;
        this.sendgroup.primaryContactEmail =this.group.primaryContactEmail;
        this.sendgroup.primaryContactName =this.group.primaryContactName;
        this.sendgroup.primaryContactNumber =this.group.primaryContactNumber;
        this.sendgroup.primaryContactPosition =this.group.primaryContactPosition;
        this.userIdArray.forEach((item :any) => {
              var user=this.userdataSource.data.find(x=>x.userId===item.UserId);
            this.userIdObj.UserId= user.userId;
            this.userObjArray.push(this.userIdObj);
            this.userIdObj={};
        });
        this.sendgroup.GroupUsers=this.userObjArray;
        this.dataSource.data.forEach(item => {
          this.empIdobj = { EmployeeId: item.employeeId };
          this.empIdArray.push(this.empIdobj);
        });
        this.sendgroup.GroupEmployees=this.empIdArray;



         this.http.put(`https://api.samotplatform.com/groups/`+this.group.groupId, this.sendgroup, { 'headers': this.apiOptions })
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
          const index = this.dataSource.data.findIndex(e => e.groupId === this.group.groupId);
            if (index !== -1) {
              this.group[index] = data; // Update the existing employee in the local array
            }
          this.openSnackBar("OrganizationUnit Updated Successfully!",true);
          this.loading=false;
          this.sendgroup={};
          this.dialogRef.close(this.data);

        });

    
      }
    }

}
//------//

addUsers(){
  let foundUser = this.users.find(user => user.firstName+ ' ' + user.lastName === this.value);
  this.getUsers();
    
    if (foundUser) {
      if (this.userdataSource.data.length >= 2) {
          this.openSnackBar("Only 2 approvers are allowed!",false);
      } else {
          this.userdataSource.data.push(foundUser);
          this.userdataSource.data = [...this.userdataSource.data];
          this.value = '';
      }
  } else {
  }
}
getUsers():any{
 this.loading=true;
  this.http.get(`https://api.samotplatform.com/Organization/Users/`+ Number(this.group.organizationId ), { 'headers': this.apiOptions })
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
  .subscribe((data: any[]) => {
     this.loading=false;
    if (data.length === 0) {
      this.openSnackBar("This Organization Have no Approvers!",false);
    }
    this.options=[];
    this.users = data;
    this.options = this.users.map(user => user.firstName + ' ' + user.lastName);
    this.filteredUsers = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filters(value || '')),
    );
  });
}
private _filters(value: string): string[] {
  const filterValue = value.toLowerCase();
  // Exclude options that are already in the dataSource
  const availableOptions = this.options.filter(option => !this.userdataSource.data.some(user => (user.firstName + ' ' + user.lastName).toLowerCase() === option.toLowerCase()));
  return availableOptions.filter(option => option.toLowerCase().includes(filterValue));
} 
deleteUsers(User: users, index: number): void {
  const userId = User.id;

  const dataArray = this.userdataSource.data;
// Find the index of the user in the array
const userIndex = dataArray.findIndex((item) => item.id === userId);
if (userIndex !== -1) {
  // Remove the user from the data array
  dataArray.splice(userIndex, 1);
  // Update the MatTableDataSource with the modified data array
  this.userdataSource.data = dataArray;
}
}
cancelDialog() {
  this.dialogRef.close();
}

}
export interface PeriodicElement {
  name: string;
  weight: number;
  symbol: string;
}


const ELEMENT_DATA: PeriodicElement[] = [];