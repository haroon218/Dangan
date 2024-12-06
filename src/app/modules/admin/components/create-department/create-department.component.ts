import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { DepartmentformComponent } from '../departmentform/departmentform.component';
import { DepartmentconfigComponent } from '../departmentconfig/departmentconfig.component';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { element } from 'protractor';
import { ConfigdepartmentComponent } from 'app/modules/user/configdepartment/configdepartment.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { catchError, forkJoin, throwError } from 'rxjs';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-department',
  templateUrl: './create-department.component.html',
  styleUrls: ['./create-department.component.css']
})
export class CreateDepartmentComponent {
  showCreateDiv: boolean = true;
  users: user[] = [];
  Organizations: Organization[] = [];
  Organization: any = {};
  groups: user[] = [];
  displayedColumns: string[] = ['select', 'id','name','config'];
  dataSource = new MatTableDataSource<user>(this.groups);
  selection = new SelectionModel<user>(true, []);
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
 loading =false;
  // selectedOrg: any = {};
  selectedOption: any = {};
  ssoUrl='https://dgr.sso.id/';
  baseUrl='https://api.samotplatform.com/'
  isToolbarOpen = false;
  isSmallScreen: boolean = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds=3;
  
  constructor(public dialog: MatDialog,private _liveAnnouncer: LiveAnnouncer,private http: HttpClient,public Headercds:ChangeDetectorRef,private breakpointObserver: BreakpointObserver,private _snackBar: MatSnackBar  )  {
   
  }
  openSnackBar(message: string, isSuccess: boolean) {
    const panelClass = isSuccess ? ['success-snackbar'] : ['error-snackbar'];
  
    this._snackBar.open(message, '✘', {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: panelClass 
    });
  }
  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });
   this.loading=true;
      var options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
          
      }
      this.http.get<Organization[]>(this.ssoUrl+`myorganizations`, {'headers':options})
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
        // if (data.length === 0) {
        //   this.loading = false; // Stop loader if there is no data
        //   return;
        // }
        var getOrganization = JSON.parse(localStorage.getItem('Organization'));
      if(getOrganization!==null){
       this.Organizations = data;
       this.selectedOption =  getOrganization.OrganizationId;
       }else{
       this.Organizations = data;
       this.selectedOption = this.Organizations[0].OrganizationId;
       this.loading = false;
      }
        // this.Organizations = data;
        // this.paginator.pageSize = this.selectedOption;
        // this.selectedOption = this.Organizations[0].OrganizationId;
        // this.loading=false;
       this.onOrganizationChange()

      });
     
  

  }
  onOrganizationChange(){
    this.Organizations.forEach(element => {
      if(element.OrganizationId==this.selectedOption){
        localStorage.removeItem('Organization')
        localStorage.setItem('Organization',JSON.stringify(element));
      }
  });
    this.loading = true;
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
        
    }
    this.http.get<user[]>(this.baseUrl+`Groups/organization/`+this.selectedOption, {'headers':options})
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
      // if (data.length === 0) {
      //   this.loading = false; // Stop loader if there is no data
      //   return;
      // }
      this.dataSource.data=data;
      this.dataSource.paginator = this.paginator;
      this.loading=false;

    });
  
  }

  

  
  selectedRow:any = {};
  selections = new SelectionModel<user>(true,[]);
  handlePage(event: any) {
  }
  handleCheckboxChange( row: user): void {
    this.selections.toggle(row);
    this.selectedRow = this.selections.selected.length > 0 ? this.selections.selected: undefined;
   
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
  checkboxLabel(row?: user): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    const index = this.dataSource.data.indexOf(row) + 1;
  
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${index}`;
  }
  editOrgUnit() {
    const dialogConfig =  new MatDialogConfig();
    dialogConfig.data = this.selectedRow;
    dialogConfig.data.isEdit=true;
    // this.selectedRow.isEdit=true;


    // dialogConfig.data = { element: this.selectedRow };

    // Set width and height based on screen size
    if (this.isSmallScreen) {
      dialogConfig.width = '80%';
      dialogConfig.height = '85%';
    } else {

      dialogConfig.width = '60%';
      // dialogConfig.height = '90%';
    }

    const dialogRef = this.dialog.open(DepartmentconfigComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.dataSource.data.findIndex(e => e.groupId === result.groupId);
        if (index !== -1) {
          this.dataSource.data[index] = result; // Update the existing employee in the local array
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

 

  // orgeditdialog() {
  //   const dialogRef = this.dialog.open(userEditDialogComponent,{
  //     height: '222px',
  //     width: '921px',
  //     disableClose:true,
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //   });
  // }
  // addDepartment() {
  //   const dialogRef = this.dialog.open(userFormComponent,{
  //     height: '222px',
  //     width: '921px',
      
  //   });
  createDepartment()  {
    this.selection.clear();
    var sendOrgId={
      organizationId:this.selectedOption,
    }
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data =[sendOrgId];

    // Set width and height based on screen size
    if (this.isSmallScreen) {
      dialogConfig.width = '80%';
      dialogConfig.height = '85%';
    } else {
      dialogConfig.width = '60%';
      // dialogConfig.height = '90%';
    }

    const dialogRef = this.dialog.open(DepartmentconfigComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const nextIndex = this.dataSource.data.length;
        this.dataSource.data[nextIndex] = result;
        this.dataSource.paginator = this.paginator;
        this.selection.clear();
        this.selections.clear();
      }else {
        this.selection.clear();
        this.selections.clear();
        this.showCreateDiv = this.selections.selected.length === 0;

        this.openToolbar();
      }
    });
  }
  // this.users.push(result);

  //   dialogRef.afterClosed().subscribe(result => {
  //     this.users.push(result.org);
  //      this.users = this.users.slice();
  //   });
  // }
  // orgnization() {
  //   const dialogRef = this.dialog.open(userSettingDialogComponent,{
  //     height: '564px',
  //     width: '921px',
      
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //   });
  // }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  delOrgUnit(): void {
 
    if (this.selection.selected.length > 0) {
      const options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
      };
     this.loading=true;
      const deleteFromSso = this.selection.selected.map(OrgUnit => 
        this.http.delete(`https://dgr.sso.id/groups/${OrgUnit.groupId}`, {'headers': options})
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
      forkJoin(deleteFromSso).subscribe({
        next: () => {
          const deleteRequests = this.selection.selected.map(OrgUnit => 
            this.http.delete(`https://api.samotplatform.com/Groups/${OrgUnit.groupId}`, {'headers': options})
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
              this.dataSource.data = this.dataSource.data.filter(OrgUnit => 
                !this.selection.selected.includes(OrgUnit)
              );
              
              this.selection.clear();
              this.dataSource.data = this.dataSource.data;
              // Display a success message
              const totalDeletedOrgUnit = deleteRequests.length;
              const successMessage = `${totalDeletedOrgUnit} OrganizationUnit${totalDeletedOrgUnit > 1 ? 's' : ''} Deleted Successfully`;
              this.openSnackBar(successMessage,true);    
              this.selections.clear();
              this.selection.clear();      
              this.showCreateDiv = this.selections.selected.length === 0;
              this.openToolbar();
            },
            error: (error: HttpErrorResponse) => {
              this.openSnackBar("Please Remove dependencies!",false);
            }
          });
          
          
        },
        error: (error: HttpErrorResponse) => {
          this.openSnackBar("Error deleting Organization Unit From SSO",false);
        }
      });
        
    
    } else {
      this.openSnackBar("Select at least one employee to delete",false);
    }
  }
  
  viewRequest(element: any, columnIndex: number) {
   element.OrganizationId=this.selectedOption;
   var options = {
    "Authorization": "Bearer " + localStorage.getItem('token')
  };
  this.http.get<Group[]>(`https://api.samotplatform.com/groups/users/` +  element.GroupId, { 'headers': options })
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
      
    const dialogRef = this.dialog.open(DepartmentconfigComponent, {
      data: { element },
      width:'60%',
      height:'80%',
    });
   
  } 
  /** The label for the checkbox on the passed row */
 
    
  @ViewChild(MatSort)
  sort: MatSort = new MatSort;
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  } 
 
}

export interface user {
  id : string;
  name: string;
  config: string;
  organizationId: string;
  idpId:string;
  groupId:number;

}
export interface Organization {
  name: string;
  id:string;
  OrganizationId:string;
  idpId:string;
}

export interface Group {
  GroupName: string;
  GroupId:string;
}
