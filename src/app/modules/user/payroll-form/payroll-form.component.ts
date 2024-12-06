import { Component, Inject, Optional, ViewChild } from '@angular/core';
// import { Employee } from '../employee-create/employee-create.component';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payroll-form',
  templateUrl: './payroll-form.component.html',
  styleUrls: ['./payroll-form.component.css']
})
export class PayrollFormComponent {
  
  selectedOption: any;
  employees:Employee[] = [];
  rowSelected:Employee[]=[];
  organizations:Organization[] = [];
  displayedColumns: string[] = ['select', 'name', 'weight', 'symbol','client','payable',];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  selection = new SelectionModel<PeriodicElement>(true, []);
  selections = new SelectionModel<String>(true,[]);

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  payable:number;
  pays:Employee[] = [];
  isToolbarOpen = false;
  loading = false;
  selectedRow:any={};
  selected='option1';
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  constructor(private _liveAnnouncer: LiveAnnouncer,public dialog:MatDialog,private http: HttpClient,public dialogRef: MatDialogRef<PayrollFormComponent>,private routers:Router,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any)  {}
  ngOnInit(){
    this.selectedOption = this.data;
    this.getEmployees();
  }
  getEmployees():any{
  this.loading=true;

    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
      
    }
    console.log(this.selectedOption);
    this.http.get<Employee[]>(`https://api.samotplatform.com/organizationemployees/`+this.selectedOption, {'headers':options})
    .subscribe(data => {
      this.employees = data;
      //  this.dataSource.paginator = this.paginator;
       this.loading = false;
      console.log(this.employees);
    });
  }

 
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = ((this.dataSource.data.length)  );
    return numSelected === numRows;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }
   
  handleCheckboxChange( row: String): void {

    this.selections.toggle(row);
    this.selectedRow = this.selections.selected.length > 0 ? this.selections.selected[0] : undefined;
    
    console.log('Selected row:', this.selectedRow);
    this.rowSelected.push(this.selectedRow);

    // this.delId = this.selectedRow.id;
    console.log('Array Of SelectedRow:', this.rowSelected);
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

  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  payRequest(): void {
    if (this.selectedOption) {
      const options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
      };
      console.log(this.rowSelected);
      // this.rowSelected.forEach(p => p.payable = this.payable);
      var details:any = [];
      this.rowSelected.forEach(item => {
        console.log(item.payable);
        let detail:any = {};
        detail.employeeId = item.id;
        detail.payable = item.payable;
        details.push(detail);
      });
      var payRequest:any = {};
      payRequest.organizationId = this.selectedOption;
      payRequest.payRequestStatus = 1;
      payRequest.payRequestDetails = details;

      this.http.post(`https://api.samotplatform.com/payRequests`,payRequest, { 'headers': options })
        .subscribe(data => {
         console.log(data);
         this.routers.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.routers.navigate(["/user/payroll/"]);
        });
         this.dialogRef.close(data);
       
       
        });
        
    } else {
      console.error("No organization selected!");
    }
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
  canceldialog(){
    this.dialogRef.close();
  }
 
 

 
 
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: string;
  symbol: string;
  client:string;
  payable:string;
  icon:string;
  

}


const ELEMENT_DATA: PeriodicElement[] = [
     
];


export interface Employee {
  
  payable:number;
  id: string;
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
export interface Organization {
  name: string;
  id: string;
}


