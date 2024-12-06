import { ChangeDetectorRef, Component } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { OrganizationFormComponent } from '../organization-form/organization-form.component';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { catchError, forkJoin, throwError } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.css']
})
export class OrganizationsComponent {
  showCreateDiv: boolean = true;
  Organizations:Organization[] = [];
  value='';
  displayedColumns: string[] = ['select', 'id','address'];
  dataSource = new MatTableDataSource<Organization>(this.Organizations);
  selection = new SelectionModel<Organization>(true, []);
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  selectedOption: string;
  loading = false;
  isSmallScreen: boolean = false;

  isToolbarOpen = false;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(private router:Router,public dialog: MatDialog,private _liveAnnouncer: LiveAnnouncer,private http: HttpClient,private _snackBar: MatSnackBar,public Headercds:ChangeDetectorRef,private breakpointObserver: BreakpointObserver )  {}
  durationInSeconds = 3;
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
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if token is missing
      this.router.navigate(['']);
      return;
    }
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });
    this.loading=true;
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
      
    }
    this.http.get<Organization[]>(`https://dgr.sso.id/myorganizations`, {'headers':options})
    .pipe(
      map((data: Organization[]) => {
          return data.map(org => {
              const transformedOrg: any = {};
              for (const key in org) {
                  if (org.hasOwnProperty(key)) {  
                      const lowerCaseKey = key.toLowerCase();
                      transformedOrg[lowerCaseKey === 'organizationid' ? 'organizationId' : lowerCaseKey] = org[key];
                  }
              }
              return transformedOrg;
          });
      }),
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
    
     this.Organizations = data; 
      this.loading=false;
      this.dataSource = new MatTableDataSource<Organization>(this.Organizations);
      //  this.dataSource.paginator = this.paginator;
       this.dataSource.paginator = this.paginator;
      //  this.dataSource.sort = this.sort;
      this.paginator.pageSize = this.selectedOption;
    });
  }
  

  selectedRow:any = {};
  selections = new SelectionModel<Organization>(true,[]);
  handlePage(event: any) {
  }
  handleCheckboxChange( row: Organization): void {
    this.selections.toggle(row);
    this.selectedRow = this.selections.selected.length > 0 ? this.selections.selected: undefined;
   console.log(this.selectedRow)
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
  checkboxLabel(row?: Organization): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    const index = this.dataSource.data.indexOf(row) + 1;
  
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${index}`;
  }
  organizationcreate() {
    const dialogConfig = new MatDialogConfig();

    if (this.isSmallScreen) {
      dialogConfig.height='79%';
      dialogConfig.width='80%';
    } else {
      // dialogConfig.height='76%';
      dialogConfig.width='65%';
    }
    const dialogRef = this.dialog.open(OrganizationFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const addedOrganization = result.org as Organization;
        this.Organizations.push(addedOrganization);

        this.dataSource.data = this.Organizations; // Update the MatTableDataSource with the updated data
      }else {
        this.selection.clear();
        this.selections.clear();
        this.openToolbar();
      }
    });
  }
  
  
  delOrganization(): void {
    if (this.selection.selected.length > 0) {
      const options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
      };
      this.loading=true;
      const deletefromSSO = this.selection.selected.map(Organization => 
        this.http.delete(`https://dgr.sso.id/Organizations/${Organization.organizationId}`, {'headers': options})
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
        ) );
        forkJoin(deletefromSSO).subscribe({
          next: () => {
            const deleteRequests = this.selection.selected.map(Organization => 
              this.http.delete(`https://api.samotplatform.com/Organizations/${Organization.organizationId}`, {'headers': options})
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
                this.Organizations = this.Organizations.filter(organization => 
                  !this.selection.selected.includes(organization)
                );
                
                this.dataSource.data = this.Organizations;
                // Display a success message
                const totalDeletedOrganization = deleteRequests.length;
                const successMessage = `${totalDeletedOrganization} Organization${totalDeletedOrganization > 1 ? 's' : ''} Deleted Successfully`;
                this.openSnackBar(successMessage,true);    
                this.selections.clear();
                this.selection.clear();
                this.showCreateDiv = this.selections.selected.length === 0;
                this.loading=false;
                this.openToolbar();
              },
              error: (error: HttpErrorResponse) => {
                this.openSnackBar("Please Remove dependencies!",false);
              }
            });
          },
          error: (error: HttpErrorResponse) => {
            this.loading=false;
            this.openSnackBar("Error deleting Organizations from SSO.id",false);
          }
        });

      

    } else {
      this.openSnackBar("Select at least one employee to delete",false);
      this.loading=false;

    }
  
  }
  
  
  editOrganization() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.selectedRow;
    if (this.isSmallScreen) {
      dialogConfig.height='79%';
      dialogConfig.width='80%';
    } else {
      // dialogConfig.height='76%';
      dialogConfig.width='65%';
    }
  
    const dialogRef = this.dialog.open(OrganizationFormComponent, dialogConfig);
  
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.org) {
        const updatedOrganization = result.org as Organization;
        const index = this.Organizations.findIndex(e => e.organizationId === updatedOrganization.organizationId);
  
        if (index !== -1) {
          this.Organizations[index] = updatedOrganization;
          this.dataSource.data = this.Organizations;
          this.selections.clear();
          this.selection.clear();
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
  

  

  @ViewChild(MatSort)
  sort: MatSort = new MatSort;
  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  } 
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
export interface Organization {
  name: string;
  organizationId:number;
  // OrganizationId:number;
 
}


 





