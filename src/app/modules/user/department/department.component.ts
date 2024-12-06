import { MatTableDataSource } from '@angular/material/table';
import { ChangeDetectorRef, Component } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Organization } from '../employee/table-list.component';
import { MatSort, Sort } from '@angular/material/sort';
import { CreatedepartmentComponent } from '../createdepartment/createdepartment.component';
import { ConfigdepartmentComponent } from '../configdepartment/configdepartment.component';
@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent {

  users: user[] = [];
  Organizations: Organization[] = [];
  
  displayedColumns: string[] = ['select', 'id','name','config'];
  dataSource = new MatTableDataSource<user>(this.users);
  selection = new SelectionModel<user>(true, []);
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
 loading =false;

  selectedOption: string;
  

  isToolbarOpen = false;
  

  
  
  constructor(public dialog: MatDialog,private _liveAnnouncer: LiveAnnouncer,private http: HttpClient,public Headercds:ChangeDetectorRef )  {

  }

 
  ngOnInit() {
   
   this.loading=true;
      var options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
          
      }
      this.http.get<Organization[]>(`https://api.samotplatform.com/userOrganizations`, {'headers':options})
      .subscribe(data => {
        this.Organizations = data;
        this.dataSource.paginator = this.paginator;
        this.paginator.pageSize = this.selectedOption;
          this.dataSource.data=ELEMENT_DATA;
        this.selectedOption = this.Organizations[0].id;
        //  this.dataSource.sort = this.sort;
         this.loading=false;
        // this.getEmployees();
      });
     
  

  }

  onOrganizationChange(){
  
  }

  

  // getUsers():any{
  //   var options = {
  //     "Authorization": "Bearer " + localStorage.getItem('token')
  //   }
  //   console.log(this.selectedOption);
  //   this.http.get<user[]>(`https://api.samotplatform.com/users`, {'headers':options})
  //   .subscribe(data => {
  //     this.users = data;
  //     this.dataSource = new MatTableDataSource<user>(this.users);
  //     //  this.dataSource.paginator = this.paginator;

  //     console.log(this.users);
  //   });
  // }
  selectedRow:any = {};
  selections = new SelectionModel<String>(true,[]);
  handlePage(event: any) {
  }
  handleCheckboxChange( row: String): void {
    this.selections.toggle(row);
    this.selectedRow = this.selections.selected.length > 0 ? this.selections.selected[0] : undefined;
    
   
  }
  
  editDepartment() {
    this.Headercds.detectChanges();
    const dialogConfig =  new MatDialogConfig();
    dialogConfig.data = this.selectedRow;
    this.selectedRow.isEdit=true;
    dialogConfig.width = '921px';
    dialogConfig.height = '222px';
    const dialogRef = this.dialog.open(CreatedepartmentComponent,dialogConfig);
    this.Headercds.detectChanges();
    
    

    // dialogRef.afterClosed().subscribe(result => {
    //    console.log(result.emp);  
    //    this.users.push(result.emp);
    //    this.users = this.users.slice();
    //  });
  }
  delDepartment(){
    
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = ((this.dataSource.data.length)  );
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
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
  // orgeditdialog() {
  //   const dialogRef = this.dialog.open(userEditDialogComponent,{
  //     height: '222px',
  //     width: '921px',
  //     disableClose:true,
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log(`Dialog result: ${result}`);
  //   });
  // }
  // addDepartment() {
  //   const dialogRef = this.dialog.open(userFormComponent,{
  //     height: '222px',
  //     width: '921px',
      
  //   });
  createDepartment()  {
    const dialogRef = this.dialog.open(CreatedepartmentComponent, {
      height: '222px',
      width: '921px',
    });
  
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result && result.org) {
    //     const addedOrganization = result.org as Organization;
    //     this.Organizations.push(addedOrganization);
    //     this.dataSource.data = this.Organizations; // Update the MatTableDataSource with the updated data
    //   }
    // });
  }

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
  //     console.log(`Dialog result: ${result}`);
  //   });
  // }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  delEmployees(){

  }
  editEmployee(){}
  viewRequest(element: any, columnIndex: number) {
   element.organizationId=this.selectedOption;
    const dialogRef = this.dialog.open(ConfigdepartmentComponent, {
      data: { element },
      width:'60%',
      height:'80%'
    });
  } 
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: user): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
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

export interface user {
  id : string;
  name: string;
  config: string;

}
const ELEMENT_DATA: user[] = [
  { id: "1", name: "AsianSoul", config: ""},
  { id: "2", name: "AlyHamza", config: ""},
]; 



 










