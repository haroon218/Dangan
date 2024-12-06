import { ChangeDetectorRef, Component } from "@angular/core";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { SelectionModel } from "@angular/cdk/collections";
import { ViewChild } from "@angular/core";
import { MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
} from "@angular/common/http";
import { AdminDataServicesService } from "../services/admin-data-services.service";
import { UserFormComponent } from "../user-form/user-form.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { catchError, find, throwError } from "rxjs";
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from "@angular/material/snack-bar";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.css"],
})
export class UsersComponent {
  users: user[] = [];
  ssoUsers: any = [];
  samotUser:any={};
  sendUserInSSo:any={};
  // samotPlatformUsers:any={};
  value = '';
  displayedColumns: string[] = ["select", "id", "fullName", "email", "margin","Credit"];
  dataSource = new MatTableDataSource<user>(this.users);
  selection = new SelectionModel<user>(true, []);
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  selectedOption: string;
  isToolbarOpen = false;
  loading = false;
  isSmallScreen: boolean = false;
  durationInSeconds=3;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  client:any={};  
  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private AdminDataServicesService: AdminDataServicesService,
    public Headercds: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
    private _snackBar: MatSnackBar,
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
    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.XSmall])
      .subscribe((result) => {
        this.isSmallScreen = result.matches;
      });
       if(this.AdminDataServicesService.contacts.length){
        this.AdminDataServicesService.contacts.forEach(contact => {
          this.dataSource.data.push(contact);
          this.openSnackBar("User Added Succesfully" , true);

        });
         this.AdminDataServicesService.contacts=[];
       }else{
        }
        
        var options = {
          Authorization: "Bearer " + localStorage.getItem("token"),
        };
        // var searchcriteria = {
        //   allowOwner: false,
        //   appplicationId: 1,
        //   roleName:'Client'
        // };
        this.loading = true;
         this.http
      .get(`https://api.samotplatform.com/users`,{ headers: options })
      .subscribe((data:any) => {
        this.users=data;
        this.dataSource = new MatTableDataSource<user>(this.users);
          this.dataSource.paginator = this.paginator;
          this.loading = false; 
      //   data.map(element => {
      //     this.http.get(`https://api.samotplatform.com/users/`+element.UserId, {'headers': options})
      //     .pipe(
      //       catchError(error => {
      //         if (error.status >= 400 && error.status < 500) {
      //           this.openSnackBar('Client error occurred:  ' + error.status,false);
      //           this.loading=false;
      //         } else if (error.status >= 500) {
      //           this.openSnackBar('Server error occurred: ' + error.status,false);
      //           this.loading=false;
      //         } else {
      //           this.openSnackBar('An error occurred: ' + error.status,false);
      //           this.loading=false;
      
      //         }
      //         return throwError(error);
      //       })
      //     )
      //     .subscribe((SamotUser:any) => {
      //      console.log('SamotUser',SamotUser);
      //     element.samotPlatformMargin=SamotUser.samotPlatformMargin;
      //     element.creditLimit=SamotUser.creditLimit;
         
      //     });
      //   },
      //   () => {
          
      // });
        this.http.get(`https://api.samotplatform.com/xero/config`, {'headers': options})
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
          this.loading = false; 
         this.client=data;   
        });
      });
      
   
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  // getUsers(): any {
  //   var options = {
  //     Authorization: "Bearer " + localStorage.getItem("token"),
  //   };
  //   console.log(this.selectedOption);
  //   this.http
  //     .get<user[]>(`https://api.samotplatform.com/users`, { headers: options })
  //     .subscribe((data) => {
  //       console.log(data);
  //       this.users = data;
  //       this.loading = false;
  //       this.dataSource = new MatTableDataSource<user>(this.users);
  //       //  this.dataSource.paginator = this.paginator;
  //       this.dataSource.paginator = this.paginator;
  //       this.paginator.pageSize = this.selectedOption;

  //       console.log(this.users);
  //     });
  // }
  selectedRow: any = {};

  selections = new SelectionModel<String>(true, []);
  handlePage(event: any) {}
  handleCheckboxChange(row: String): void {
    this.selections.toggle(row);
    this.selectedRow =
      this.selections.selected.length > 0
        ? this.selections.selected[0]
        : undefined;

  }
  Synchronize() {
    this.loading=true;
    var options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    var searchcriteria = {
      allowOwner: false,
    };
    this.http
      .post(`https://dgr.sso.id/users/get`, searchcriteria, {
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
        this.ssoUsers=data;
       
        // Add user in Samotplatform
        this.ssoUsers.forEach((element) => {
          var findUser=this.users.find(x=>x.email == element.EmailAddress);
          if(!findUser){
            this.samotUser.FirstName=element.FirstName;
            this.samotUser.LastName=element.LastName;
            this.samotUser.Email = element.EmailAddress;
            this.samotUser.UserId=element.UserId;
            var options = {
              Authorization: "Bearer " + localStorage.getItem("token"),
            };
            this.http.post(`https://api.samotplatform.com/users/`,this.samotUser,{'headers':options})
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
            .subscribe((data: user) => {
              this.users.push(data)
              this.dataSource.data=this.users;
            //  this.openSnackBar('Users Synced in SamotPlatform Successfully!', true);
              // this.loading=false;
            });
          }else{
            // this.loading=false;
            // this.openSnackBar('Users Synced Successfully!', true);
          }
        });
        // Add user in Sso.id
     

          this.users.forEach(element => {
          var find=this.ssoUsers.find(x=>x.EmailAddress == element.email);
          if(!find){
                this.sendUserInSSo.FirstName = element.firstName;
                this.sendUserInSSo.LastName = element.lastName;
                this.sendUserInSSo.EmailAddress= element.email;
                this.sendUserInSSo.Password='asd'
                if(this.sendUserInSSo.EmailAddress== "admin@dangangroup.ie"){
                   return
                }else{
                 
                  var options = {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                  };
                  this.loading=true;
                  this.http.post(`https://dgr.sso.id/users`,this.sendUserInSSo, {headers: options,})
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
                    .subscribe(result => {
                      this.loading=false;
                      // this.openSnackBar('Users Synced in SSo.id Successfully!', true);
                      this.openSnackBar('Users Synced Successfully!', true);
      
                    });
                }
            }else{
              this.loading=false;
              this.openSnackBar('Users Synced Successfully!', true);
            }
          });
      });
  }

  editUser() {
    this.Headercds.detectChanges();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.selectedRow;
    this.selectedRow.isEdit = true;
    const dialogRef = this.dialog.open(UserFormComponent, dialogConfig);
    this.Headercds.detectChanges();
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.emp) {
        if (result.emp.status == 2) {
          result.emp.isCurrentAdmin = true;
        }
        const index = this.users.findIndex(e => e.userId === result.emp.userId);
        if (index !== -1) {
          this.users[index] = result.emp; // Update the existing employee in the local array
          this.dataSource.data = this.users;
          this.selection.clear(); // Update the MatTableDataSource
          this.selections.clear();
          this.openToolbar();
        }
      } else {
        this.selection.clear();
        this.selections.clear();
        this.openToolbar();
      }
    });
  }
  
  isAllSelected() {
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

    this.selection.select(...this.dataSource.data);
  }

  openToolbar() {
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
  
  
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: user): string {
    if (!row) {
      return `${this.isAllSelected() ? "deselect" : "select"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${
      row.id + 1
    }`;
  }


}

export interface user {
  id: string;
  userId:number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  margin: number;
}

