import { ChangeDetectorRef, Component } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';

import { OrganizationFormComponent } from '../organization-form/organization-form.component';
import { DataService } from '../services/data.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css']
})
export class OrganizationComponent {
  Organizations: Organization[] = [];
  delId:any;

  displayedColumns: string[] = ['select', 'id','name',];
  dataSource = new MatTableDataSource<Organization>(this.Organizations);
  selection = new SelectionModel<Organization>(true, []);
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  selectedOption: string;
  

  isToolbarOpen = false;
  loading = false;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  constructor(public dialog: MatDialog,private _liveAnnouncer: LiveAnnouncer,private http: HttpClient, public dataService:DataService,private _snackBar: MatSnackBar,public Headercds:ChangeDetectorRef)  {}
  durationInSeconds = 1;
  openSnackBar(message) {
    this._snackBar.open(message, 'Ok', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
  }
  ngOnInit() {
    this.loading=true;
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
      
    }
    this.http.get<Organization[]>(`https://api.samotplatform.com/userOrganizations`, {'headers':options})
    .subscribe(data => {
      if (data.length === 0) {
        this.loading = false; // Stop loader if there is no data
        return;
      }
      this.Organizations = data;
      this.dataSource = new MatTableDataSource<Organization>(this.Organizations);
      //  this.dataSource.paginator = this.paginator;
       this.dataSource.paginator = this.paginator;
      //  this.dataSource.sort = this.sort;
      this.paginator.pageSize = this.selectedOption;
      this.loading = false;
    });
  }
  

  selectedRow:any = {};
  selections = new SelectionModel<Organization>(true,[]);
  handlePage(event: any) {
  }
  handleCheckboxChange( row: Organization): void {

    this.selections.toggle(row);
    this.selectedRow = this.selections.selected.length > 0 ? this.selections.selected[0] : undefined;
  
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
  checkboxLabel(row?: Organization): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    const index = this.dataSource.data.indexOf(row) + 1;
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${index}`;
  }
  
  organizationcreate() {
    const dialogRef = this.dialog.open(OrganizationFormComponent, {
      height: '222px',
      width: '921px',
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.org) {
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
  
  delEmployees(): void {
    if (this.selection.selected.length > 0) {
      const options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
      };
  
      const deleteRequests = this.selection.selected.map(Organization => 
        this.http.delete(`https://api.samotplatform.com/Organizations/${Organization.id}`, {'headers': options})
      );
  
      forkJoin(deleteRequests).subscribe({
        next: () => {
          this.Organizations = this.Organizations.filter(organization => 
            !this.selection.selected.includes(organization)
          );
          this.selections.clear();
          this.selection.clear();
          this.dataSource.data = this.Organizations;
          // Display a success message
          const totalDeletedOrganization = deleteRequests.length;
          const successMessage = `${totalDeletedOrganization} Organization${totalDeletedOrganization > 1 ? 's' : ''} Deleted Successfully`;
          this.openSnackBar(successMessage);    
          // Update the toolbar 
          this.openToolbar();
        },
        error: (error: HttpErrorResponse) => {
          this.openSnackBar("Error deleting employees");
        }
      });
    } else {
      this.openSnackBar("Select at least one employee to delete");
    }
  }
  
  editOrganization() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.selectedRow;
    this.selectedRow.isEdit = true;
    dialogConfig.height='222px';
    dialogConfig.width= '921px';
    const dialogRef = this.dialog.open(OrganizationFormComponent, dialogConfig);
  
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.org) {
        const updatedOrganization = result.org as Organization;
        const index = this.Organizations.findIndex(e => e.id === updatedOrganization.id);
  
        if (index !== -1) {
          this.Organizations[index] = updatedOrganization;
          this.dataSource.data = this.Organizations;
          this.selections.clear();
          // Clear the selection after updating the data source
          this.selection.clear();
          this.openToolbar();
        }
      }else {
        this.selection.clear();
        this.selections.clear();
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
}
export interface Organization {
  name: string;
  id:string;
}


 





