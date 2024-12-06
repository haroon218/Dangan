import { SelectionModel } from "@angular/cdk/collections";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";
import { DataService } from "app/modules/user/services/data.service";
import {
  Observable,
  catchError,
  forkJoin,
  map,
  startWith,
  throwError,
} from "rxjs";
import { UploadDocumentComponent } from "../upload-document/upload-document.component";
import { AdminDataServicesService } from "../services/admin-data-services.service";
import { FormControl } from "@angular/forms";
import { Route, Router } from "@angular/router";

@Component({
  selector: "app-document-tab",
  templateUrl: "./document-tab.component.html",
  styleUrls: ["./document-tab.component.css"],
})
export class DocumentTabComponent {
  myControl = new FormControl("");
  filteredOrganization: Observable<any>;
  organizationName: any;
  options: any = [];

  showCreateDiv: boolean = true;
  Organizations: any[] = [];
  employees: any[] = [];
  displayedColumns: string[] = [
    "select",
    "firstName",
    "lastName",
    "create",
    "download",
  ];
  dataSource = new MatTableDataSource<any>(this.employees);
  selection = new SelectionModel<any>(true, []);
  isToolbarOpen = false;
  deleteRecordSave: any = [];
  snackBar: any;
  delId: any;
  horizontalPosition: MatSnackBarHorizontalPosition = "right";
  verticalPosition: MatSnackBarVerticalPosition = "bottom";
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  loading = false;

  isSmallScreen: boolean = false;

  durationInSeconds = 3;
  constructor(private router:Router,
    public dialog: MatDialog,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    public dataService: AdminDataServicesService,
    public Headercds: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver
  ) {}
  openSnackBar(message: string, isSuccess: boolean) {
    const panelClass = isSuccess ? ["success-snackbar"] : ["error-snackbar"];

    this._snackBar.open(message, "✘", {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: panelClass,
    });
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if token is missing
      this.router.navigate(['']);
      return;
    }
    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.XSmall])
      .subscribe((result) => {
        this.isSmallScreen = result.matches;
      });
    var options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    this.loading = true;
    this.http
      .get<any[]>(`https://dgr.sso.id/myorganizations`, { headers: options })
      .pipe(
        catchError((error) => {
          if (error.status >= 400 && error.status < 500) {
            this.openSnackBar("Client error occurred:  " + error.status, false);
            this.loading = false;
          } else if (error.status >= 500) {
            this.openSnackBar("Server error occurred: " + error.status, false);
            this.loading = false;
          } else {
            this.openSnackBar("An error occurred: " + error.status, false);
            this.loading = false;
          }
          return throwError(error);
        })
      )
      .subscribe((data) => {
        // if (data.length === 0) {
        //   this.loading = false; // Stop loader if there is no data
        //   return;
        // }
        var getOrganization = JSON.parse(localStorage.getItem("Organization"));
        if (getOrganization !== null) {
          this.Organizations = data;
          this.organizationName = getOrganization.Name;
          this.dataService.organization = getOrganization.OrganizationId;
         this.getOrg();

        } else {
          this.Organizations = data;
          this.organizationName = this.Organizations[0].Name;
          this.dataService.organization = this.Organizations[0].OrganizationId;
         this.getOrg();
          this.loading = false;
        }
      });
  }
  clearInput() {
    this.organizationName = "";
  }
  getOrg(): any {
    this.Organizations.forEach((element) => {
      if (element.Name == this.organizationName) {
        this.dataService.organization = element.OrganizationId;
        localStorage.removeItem("Organization");
        localStorage.setItem("Organization", JSON.stringify(element));
      }
    });
    this.loading=true;
    var options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    this.http
      .get<Organization[]>(`https://dgr.sso.id/myorganizations`, {
        headers: options,
      })
      .pipe(
        catchError((error) => {
          if (error.status >= 400 && error.status < 500) {
            this.openSnackBar("Client error occurred:  " + error.status, false);
            this.loading = false;
          } else if (error.status >= 500) {
            this.openSnackBar("Server error occurred: " + error.status, false);
            this.loading = false;
          } else {
            this.openSnackBar("An error occurred: " + error.status, false);
            this.loading = false;
          }
          return throwError(error);
        })
      )
      .subscribe((data) => {
        if (data.length === 0) {
          this.loading = false; // Stop loader if there is no data
          return;
        }
        this.options = [];
        this.options = data;
        this.filteredOrganization = this.myControl.valueChanges.pipe(
          startWith(""),
          map((value) => this._filters(value || ""))
        );
        this.getdocuments();
        //  this.loading = false;
      });
   
  }
  getdocuments(){
    this.loading = true;
    var options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    this.http
      .get<any[]>(
        `https://api.samotplatform.com/Documents/organization/` +
          this.dataService.organization,
        { headers: options }
      )
      .pipe(
        catchError((error) => {
          if (error.status >= 400 && error.status < 500) {
            this.openSnackBar("Client error occurred:  " + error.status, false);
            this.loading = false;
          } else if (error.status >= 500) {
            this.openSnackBar("Server error occurred: " + error.status, false);
            this.loading = false;
          } else {
            this.openSnackBar("An error occurred: " + error.status, false);
            this.loading = false;
          }
          return throwError(error);
        })
      )
      .subscribe((data) => {
        this.employees = data;
        this.dataSource = new MatTableDataSource<any>(this.employees);
        this.dataSource.paginator = this.paginator;
        this.loading = false;
        // this.paginator.pageSize = this.selectedOption;
      });
  }
  private _filters(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter((option) =>
      option.Name.toLowerCase().includes(filterValue)
    );
  }
  results: any = {};
  AddBulk() {
    const dialogRef = this.dialog.open(UploadDocumentComponent, {
      width: "400px",
      height: "250px",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result != undefined) {
        this.results = result;

        this.dataSource.data.push(this.results);
        this.dataSource = new MatTableDataSource<any>(this.employees);
      } else {
        this.selection.clear();
        this.selections.clear();
        this.openToolbar();
      }
    });
  }
  
  downloadDocuments(documentId:number){
    if(!this.dataService.selectedOrganizationUnit){
   window.open("https://api.samotplatform.com/documents/"+documentId+"/"+this.dataService.organization,"_blank");
  }else{
    window.open("https://api.samotplatform.com/timesheets/"+documentId+"/auditreport","_blank");

  }
 
}
  selectedOption: string;
  selectedRow: any = {};
  selections = new SelectionModel<any>(true, []);
  handlePage(event: any) {}
  handleCheckboxChange(row: any): void {
    this.selections.toggle(row);
    this.selectedRow =
      this.selections.selected.length > 0
        ? this.selections.selected
        : undefined;
        console.log(this.selectedRow);
    // Show the div if no rows are selected
    this.showCreateDiv = this.selections.selected.length === 0;
  }
  openToolbar() {
    // this.deleteRecordSave = this.selection.selected;
    if (this.selection.selected.length > 0) {
      (document.getElementById("toolBar") as HTMLLIElement).style.display =
        "block";
    } else {
      (document.getElementById("toolBar") as HTMLLIElement).style.display =
        "none";
    }

    if (this.selection.selected.length > 1) {
      (
        document.getElementById("tool-bar-edit") as HTMLLIElement
      ).style.display = "none";
    } else {
      (
        document.getElementById("tool-bar-edit") as HTMLLIElement
      ).style.display = "block";
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
    this.dataSource.data.forEach((row) => this.selection.select(row));
  }
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? "deselect" : "select"} all`;
    }
    const index = this.dataSource.data.indexOf(row) + 1;
    return `${
      this.selection.isSelected(row) ? "deselect" : "select"
    } row ${index}`;
  }

  delDocuments(): void {
    if (this.selection.selected.length > 0) {
      const options = {
        Authorization: "Bearer " + localStorage.getItem("token"),
      };
      this.loading=true;
      const deleteRequests = this.selection.selected.map(employee =>
        this.http
          .delete(
            `https://api.samotplatform.com/Documents/${employee.documentId}/${employee.organizationId}`,
            { headers: options }
          )
          .pipe(
            catchError((error) => {
              if (error.status >= 400 && error.status < 500) {
                this.openSnackBar(
                  "Client error occurred:  " + error.status,
                  false
                );
                this.loading = false;
              } else if (error.status >= 500) {
                this.openSnackBar(
                  "Server error occurred: " + error.status,
                  false
                );
                this.loading = false;
              } else {
                this.openSnackBar("An error occurred: " + error.status, false);
                this.loading = false;
              }
              return throwError(error);
            })
          )
      );

      forkJoin(deleteRequests).subscribe({
        next: () => {
          this.employees = this.dataSource.data.filter(timesheet =>
            !this.selection.selected.includes(timesheet)
          );
      this.loading=false;
          this.dataSource.data = this.employees;
          // Display a success message
          const totalDeletedEmployees = deleteRequests.length;
          const successMessage = `${totalDeletedEmployees} Document${
            totalDeletedEmployees > 1 ? "s" : ""
          } Deleted Successfully`;
          this.openSnackBar(successMessage, true);
          this.selections.clear();
          this.selection.clear();
                    this.showCreateDiv = this.selections.selected.length === 0;

          // Update the toolbar
          this.openToolbar();
        },
        error: (error: HttpErrorResponse) => {
          this.openSnackBar("Please Remove dependencies!", false);
        },
      });
    } else {
      this.openSnackBar("Select at least one employee to delete", false);
    }
  }
}
export interface Organization {
  name: string;
  Name: string;
  id: string;
  OrganizationId: number;
}
