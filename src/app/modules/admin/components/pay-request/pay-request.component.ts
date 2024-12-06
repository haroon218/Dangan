import { ChangeDetectorRef, Component } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { PayRequestDetailComponent } from '../pay-request-detail/pay-request-detail.component';
import { MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
@Component({
  selector: 'app-pay-request',
  templateUrl: './pay-request.component.html',
  styleUrls: ['./pay-request.component.css']
})
export class PayRequestComponent {

  selectedOption: any;
  // employees:Employee[] = [];
  organizations:Organization[] = [];
  displayedColumns: string[] = ['select','position', 'weight','symbol'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  selection = new SelectionModel<PeriodicElement>(true, []);
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  payable:number;
  // pays:Employee[] = [];
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds=2;

  results:any={};
  isToolbarOpen = false;
  loading=false;
  selected='option1';
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  constructor(private _liveAnnouncer: LiveAnnouncer,public dialog:MatDialog,private http: HttpClient,public Headercds:ChangeDetectorRef)  {}
  ngOnInit(){
    this.loading=true;
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
      
    }
    this.http.get<Organization[]>(`https://api.samotplatform.com/Organizations`, {'headers':options})
    .subscribe(data => {
     
      this.organizations = data;

      this.selectedOption = this.organizations[0].id;
      this.getpayrequests();
    });
  }
  getpayrequests():any{
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
      
    }
    console.log(this.selectedOption);
    this.http.get(`https://api.samotplatform.com/organizationpayrequests/`+this.selectedOption, {'headers':options})
    .subscribe(data => {
      this.results = data;
      this.loading=false;
      console.log(this.results);
      this.dataSource.data = this.results;
       this.dataSource.paginator = this.paginator;
    });
  }
  getStatusColorClass(status: number): string {
    switch (status) {
      case 1:
        return ''; // No additional class for 'Pending'
      case 2:
        return 'approved'; // Apply 'approved' class for 'Approved'
      case 3:
        return 'rejected'; // Apply 'rejected' class for 'Rejected'
      default:
        return 'unknown'; // Apply 'unknown' class for other statuses
    }
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

  
 
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  // payRequest(): void {
  //   if (this.selectedOption) {
  //     const options = {
  //       "Authorization": "Bearer " + localStorage.getItem('token')
  //     };
  //     console.log(this.employees);
  //     this.employees.forEach(p => p.payable = this.payable);
  //     var details:any = [];
  //     this.employees.forEach(item => {
  //       let detail:any = {};
  //       detail.employeeId = item.id;
  //       detail.payable = item.payable;
  //       details.push(detail);
  //     });
  //     var payRequest:any = {};
  //     payRequest.organizationId = this.selectedOption;
  //     payRequest.payRequestStatus = 1;
  //     payRequest.payRequestDetails = details;

  //     this.http.post(`https://api.samotplatform.com/payRequests`,payRequest, { 'headers': options })
  //       .subscribe(data => {
  //        console.log(data);
  //       });
  //   } else {
  //     console.error("No organization selected!");
  //   }
  // }
  

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
  editEmployee(){

  }
  // openSnackBar(message) {
  //   this.snackBar.open(message, 'Ok', {
  //     horizontalPosition: this.horizontalPosition,
  //     verticalPosition: this.verticalPosition,
  //     duration: this.durationInSeconds * 1000,

  //   });
  // }
  delEmployees(){
    // var options = {
    //   "Authorization": "Bearer " + localStorage.getItem('token')
      
    // }
    // this.http.patch(`https://api.samotplatform.com/payRequestStatus/`+this.request.id,this.request,{'headers':options})
    // .subscribe(data => {
    //   this.openSnackBar("PayRequest Accept Successfully!");
    //    this.dialogRef.close({emp:data});
    //   this.cdr.detectChanges();
    // });
  }

  selectedRow:any = {};
  selections = new SelectionModel<String>(true,[]);
  handlePage(event: any) {
  }
  handleCheckboxChange( row: String): void {
    // const dialogRef = this.dialog.open(PayRequestDetailComponent);

    this.selections.toggle(row);
    this.selectedRow = this.selections.selected.length > 0 ? this.selections.selected[0] : undefined;
    
    console.log('Selected:', this.selectedRow);
    // this.delId = this.selectedRow.id;
    // console.log('Selected:', this.delId);
  }
  viewRequest(element: any, columnIndex: number) {
    console.log('Clicked on View button for element:', element);
    const dialogRef = this.dialog.open(PayRequestDetailComponent, {
      data: { element },
      width:'500px',
      height:'500px'
    });
  }
//  
}
export interface PeriodicElement {
  // name: string;
  position: number;
  icon:string;
  symbol:string;
  select:string;
}


const ELEMENT_DATA: PeriodicElement[] = [
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},
  // {position: 1, name: 'AJ', icon:'/assets/setting.svg'	},


];


// export interface Employee {
  
//   payable:number;
//   id: string;
//   firstName:string;
//   lastName:string;
//   mobileNumber:string;
//   gender:number;
//   address: string;
//   city: string;
//   country:string;
//   postalCode:string;
//   zipCode: string;
//   email: string;
//   salary: number;
//   employeeStatus: number;
// }
export interface Organization {
  name: string;
  id: string;
}

