import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

import { Router } from '@angular/router';
import { secretmanager } from 'googleapis/build/src/apis/secretmanager';
import { Observable, catchError, map, startWith, throwError } from 'rxjs';
import { toUSVString } from 'util';
@Component({
  selector: 'app-organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.css']
})
export class OrganizationFormComponent {
  myControl = new FormControl('');
  value: string;
  
  ssoUsers: any = [];
  samotUser:any={};
  sendUserInSSo:any={};
  filteredUsers: Observable<string[]>;
  userdataSource = new MatTableDataSource<users>([]);
  displayedColumns: string[] = ['name', 'weight', 'symbol'];
  users: any = [];
  apiOptions= {
    "Authorization": "Bearer " + localStorage.getItem('token')
  };
  options: string[] = []; 
  OrganizationUsers: any = [];
  User:any={};
  
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  snackbar:any;
  Organization:any = {};
  Organizations:any = [];
  ssoOrganization:any = {};
  sendOrgInMain:any = {};
  
  sendOrg:any = {};
  isEdit:boolean;
  loading = false;

  constructor(private _formBuilder: FormBuilder,public dialogRef: MatDialogRef<OrganizationFormComponent>,private _snackBar: MatSnackBar, private cdr:ChangeDetectorRef,private routers:Router,
  
    @Optional() @Inject(MAT_DIALOG_DATA) public data:Organization,private http:HttpClient,public route:Router) {
      if(data!=null){
      this.Organization =data[0];
    }
    dialogRef.disableClose = true;
    
    }
  usernameFormControl = new FormControl('', [
    Validators.required,
    
  ]);
  addressFormControl = new FormControl('', [
    Validators.required,
  ]);
  regnumFormControl= new FormControl('', [
    Validators.required,
  ]);
  emailFormControl = new FormControl('', [
    Validators.email
  ]);
  AccountemailFormControl= new FormControl('', [
    Validators.email
  ]);
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
      this.Organization.isPORequired=this.isPOMode;
    } else {
    }
  }
  ngOnInit() {
    this.getUsers();
    
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token') 
    }
    if(this.Organization.organizationId!=undefined){
      this.loading=true;
    this.http.get<Organization[]>(`https://api.samotplatform.com/Organizations/`+ Number(this.Organization.organizationId ), {'headers':options})
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
      this.Organization=data;
     
      //---------Get Users------
        this.http.get<users[]>(`https://api.samotplatform.com/Organization/Users/`+ Number(this.Organization.organizationId ), { 'headers': this.apiOptions })
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
        .subscribe(getUsers => {
          this.userdataSource.data=getUsers;
        }); 
      //----------------------
     this.loading=false;
    });}
  }
  // Sync Users-------------------
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
        // Add users in samotplatform 
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
            this.loading=true;
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
            .subscribe(data => {
              this.loading=false;
            });
          }else{
            this.loading=false;
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
                      // this.openSnackBar('Approvers Synced in SSo.id Successfully!', true);
      
                    });
                }
            }else{
              this.loading=false;
              // this.openSnackBar('Approvers Synced Successfully!', true);
            }
          });
          this.openSnackBar('Approvers Synced Successfully!', true);

            
      });
  }
  // -----------------------------
  addUsers(){
    let foundUser = this.users.find(user => user.FirstName+ ' ' + user.LastName === this.value);
    this.getUsers();
    if (!this.Organization.organizationId) {
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
    }else{
      if (foundUser) {
        if (this.userdataSource.data.length >= 2) {
            this.openSnackBar("Only 2 approvers are allowed!",false);
        } else {
          var approver={
            userId:foundUser.UserId,
            organizationId:this.Organization.organizationId,
          }
          this.http.post("https://api.samotplatform.com/Organization/Approver",approver,{ 'headers': this.apiOptions })
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
            this.userdataSource.data.push(foundUser);
            this.userdataSource.data = [...this.userdataSource.data];
            this.value = '';
            this.openSnackBar("Approver add Successfully!",true);

          });
        
        }
    } else {
    }
    }
     
  }
  getUsers():any{
   this.loading=true;
   var searchcriteria = {
          allowOwner: false,
          applicationId: 1,
          roleName:'Approver'
        };
    this.http.post("https://dgr.sso.id/users/get",searchcriteria,{ 'headers': this.apiOptions })
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
      this.options=[];
      this.users = data;
      this.options = this.users.map(user => user.FirstName + ' ' + user.LastName);
      this.filteredUsers = this.myControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filters(value || '')),
      );
     this.loading=false;
    });
  }
  private _filters(value: string): string[] {
    const filterValue = value.toLowerCase();
    // Exclude options that are already in the dataSource
    const availableOptions = this.options.filter(option => !this.userdataSource.data.some(user => (user.FirstName + ' ' + user.LastName).toLowerCase() === option.toLowerCase()));
    return availableOptions.filter(option => option.toLowerCase().includes(filterValue));
  }
  clearInput() {
    this.value = ''; // Clear the input value
  }
  deleteUsers(User: users, index: number): void {
  
  if(!this.Organization.organizationId){
    const userId = User.UserId;
    const dataArray = this.userdataSource.data;
  const userIndex = dataArray.findIndex((item) => item.UserId === userId);
  if (userIndex !== -1) {
    dataArray.splice(userIndex, 1);
    this.userdataSource.data = dataArray;
  }
  }else{
    console.log(User);
   this.loading=true;
    this.http.delete(`https://api.samotplatform.com/Organization/${this.Organization.organizationId}/Approver/${User.userId || User.UserId}`,{ 'headers': this.apiOptions })
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
     
      this.loading=false;
      const userId = User.UserId;
      const dataArray = this.userdataSource.data;
    const userIndex = dataArray.findIndex((item) => item.UserId === userId);
    if (userIndex !== -1) {
      dataArray.splice(userIndex, 1);
      this.userdataSource.data = dataArray;
    }
    this.openSnackBar("Approver Delete Successfully!",true);

    });
  }
  } 
 addOrganization() {
  this.usernameFormControl.markAsTouched();
  this.addressFormControl.markAsTouched();
  this.regnumFormControl.markAsTouched();
  var options = {
    "Authorization": "Bearer " + localStorage.getItem('token')  
  }
  

  if (this.usernameFormControl.invalid || this.addressFormControl.invalid|| this.regnumFormControl.invalid ) {
    this.openSnackBar('OrganizationName, Address and RegistrationNumber is Required!',false);
  } else {
    if (!this.Organization.organizationId) {
      var options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
      };
      this.loading=true;
      this.http.post(`https://dgr.sso.id/organizations`, this.Organization, { 'headers': options })
      .pipe(
        catchError(error => {
          if (error.status >= 400 && error.status < 500) {
            this.openSnackBar('Client error occurred:  ' + error.status,false);
            this.loading=false;
          } else if (error.status >= 500) {
            this.openSnackBar(error.error.ExceptionMessage,false);
            this.loading=false;
          } else {
            console.log(error.ExceptionMessage)

            this.openSnackBar('An error occurred: ' + error.ExceptionMessage,false);
            this.loading=false;
  
          }
          return throwError(error);
        })
      )  
      .subscribe(data => {
          this.ssoOrganization = data;
          this.Organization.organizationId = this.ssoOrganization.OrganizationId;
          this.Organization.Name =  this.ssoOrganization.Name;
          // Add Approvers
          let order=1;
          this.userdataSource.data.forEach((item:any) => {
          // Assign Approvers in Organizations In dgr.sso.id
            this.http.post(`https://dgr.sso.id/organization/${this.ssoOrganization.OrganizationId}/user/${item.UserId}/assign`, { 'headers': options })
              .pipe(
                catchError(error => {
                  if (error.status >= 400 && error.status < 500) {
                    this.openSnackBar('Client error occurred(Approver Assigned In Organization Failed!):  ' + error.status,false);
                    this.loading=false;
                  } else if (error.status >= 500) {
                    this.openSnackBar('Server error occurred(Approver Assigned In Organization Failed!): ' + error.status,false);
                    this.loading=false;
                  } else {
                    this.openSnackBar('An error occurred(Approver Assigned In Organization Failed!): ' + error.status,false);
                    this.loading=false;
          
                  }
                  return throwError(error);
                })
              )  .subscribe(assignOrg => { 
               });
          // ------------------------------------------------
            this.User.UserId=item.UserId;
            this.User.OrganizationId=this.Organization.organizationId;
            this.User.Order=order;
            this.OrganizationUsers.push(this.User);
            this.User={};
            order++;
          });
          this.Organization.organizationUsers=this.OrganizationUsers;
          //----------------------------- 
          // Assign Organization in Application
          this.http.post(`https://dgr.sso.id/assignorgtoapp/orgid/${this.Organization.organizationId}/appid/1`, { 'headers': options })
          .pipe(
            catchError(error => {
              if (error.status >= 400 && error.status < 500) {
                this.openSnackBar('Client error occurred(Organization Assign in Application Failed!):  ' + error.status,false);
                this.loading=false;
              } else if (error.status >= 500) {
                this.openSnackBar('Server error occurred(Organization Assign in Application Failed!): ' + error.status,false);
                this.loading=false;
              } else {
                this.openSnackBar('An error occurred(Organization Assign in Application Failed!): ' + error.status,false);
                this.loading=false;
      
              }
              return throwError(error);
            })
          )
          .subscribe(result => {
            this.sendOrgInMain.organizationId=this.ssoOrganization.OrganizationId;
            this.sendOrgInMain.name = this.ssoOrganization.Name;
            this.dialogRef.close({ org: this.sendOrgInMain });
            this.loading=false;
                // ---Add Organization in SamotPlatform
            this.http.post(`https://api.samotplatform.com/Organizations`, this.Organization, { 'headers': options })
          .pipe(
            catchError(error => {
              if (error.status >= 400 && error.status < 500) {
                this.Organization = {};
                this.openSnackBar('Client error occurred:  ' + error.status,false);
                this.loading=false;
              } else if (error.status >= 500) {
                if(error.error.ExceptionMessage!==undefined ) { 
                this.openSnackBar(error.error.ExceptionMessage,false);
                this.Organization = {};
                this.loading=false;
                }else{
                this.openSnackBar('Server error occurred:  ' + error.status,false);
                this.Organization = {};
                this.loading=false;
                }
              } else {
                this.Organization = {};
                this.openSnackBar('An error occurred: ' + error.status,false);
                this.loading=false;
      
              }
              return throwError(error);
            })
          )
          .subscribe(data => {
            this.Organization = {};
            this.openSnackBar("Organization Added Successfully!",true);
          });
          });
          // -------------------------------------
          
        });
     

    } else {
      this.loading=true;
      var options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
      };
       // Add Approvers After Update
      //  this.userdataSource.data.forEach(item => {
      //    this.User.UserId=item.userId;
      //    this.User.OrganizationId=this.Organization.organizationId;
      //    this.OrganizationUsers.push(this.User);
      //    this.User={};
      //  });
      //  this.Organization.organizationUsers=this.OrganizationUsers;
       //-----------------------------
     
      this.http.put(`https://api.samotplatform.com/Organizations/` +  this.Organization.organizationId, this.Organization, { 'headers': options })
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
          // Emit the updated organization data to the parent component
          this.dialogRef.close({ org: data });
           this.loading=false;
      
          this.openSnackBar("Organization Updated Successfully",true);

          // Clear the organization object
          this.Organization = {};
        });
     
    }
  }

}

  cancelDialog()
  {
    this.Organization={}
    this.dialogRef.close();
    
  }
}
export interface users {
  id : string;
  UserId : number;
  userId:number;
  FirstName:string;
  LastName:string;
  email: string;
  margin:number;
  idpId:number;
}
export interface Organization{
       name:string;
       address:string;
       companyRegistrationNumber:number;
       vatNumber:number;
       primaryContactName:string;
       primaryContactEmail:string;
       primaryContactNumber:number;
       primaryContactPosition:number;
       accountsContactName:string;
       accountsContactEmail:string;
       isPORequired:string;
}