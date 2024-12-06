import { MatTableDataSource } from '@angular/material/table';
import { ChangeDetectorRef, Component } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Organization } from '../employee/table-list.component';
import { InvoicesComponent } from '../invoices/invoices.component';
@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent {
  users: user[] = [];
  Organizations: Organization[] = [];
  
  displayedColumns: string[] = [ 'id','fullName','email','margin'];
  dataSource = new MatTableDataSource<user>(this.users);
  selection = new SelectionModel<user>(true, []);
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  selectedOption: string;
  isToolbarOpen = false;
  loading = false;

  
  
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
        this.selectedOption = this.Organizations[0].id;
        //  this.dataSource.sort = this.sort;
        console.log(this.selectedOption);
        this.getInvoices();
        this.loading=false;
        // this.getEmployees();
      });
     
  

  }

  onOrganizationChange(){
    console.log(this.selectedOption);
    this.getInvoices();
  }

  getInvoices(){
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
      
    }
    this.http.get<user[]>(`https://api.samotplatform.com/OrganizationInvoices/`+this.selectedOption, {'headers':options})
    .subscribe(data => {
      this.users = data;
      this.dataSource = new MatTableDataSource<user>(this.users);
      this.dataSource.paginator = this.paginator;
     this.paginator.pageSize = this.selectedOption;
      console.log(this.users);
    });
  }
  invoiceDetail(id:any){
    const dialogRef = this.dialog.open(InvoicesComponent,{
      height: '550px',
      width: '650px',
      data:id
    });

    dialogRef.afterClosed().subscribe(result => {
      this.Organizations.push(result.org);
       this.Organizations = this.Organizations.slice();
    });
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
    
    console.log('Selected:', this.selectedRow);
   
  }
  
  editUser() {
    // this.Headercds.detectChanges();
    // const dialogConfig =  new MatDialogConfig();
    // dialogConfig.data = this.selectedRow;
    // this.selectedRow.isEdit=true;
    // const dialogRef = this.dialog.open(UserFormComponent,dialogConfig);
    // this.Headercds.detectChanges();
    
    

    // dialogRef.afterClosed().subscribe(result => {
    //    console.log(result.emp);  
    //    this.users.push(result.emp);
    //    this.users = this.users.slice();
    //  });
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
  // usercreate() {
  //   const dialogRef = this.dialog.open(userFormComponent,{
  //     height: '222px',
  //     width: '921px',
      
  //   });

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
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: user): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }
    
  

 
}

export interface user {
  id : string;
  fullName: string;
  email: string;
  margin:number;

}


 









