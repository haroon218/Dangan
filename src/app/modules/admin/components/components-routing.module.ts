import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from 'app/dashboard/dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { PayRequestComponent } from './pay-request/pay-request.component';
import { UsersComponent } from './users/users.component';
import { EmployeeComponent } from './employee/employee.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';
import { TimeSheetComponent } from './time-sheet/time-sheet.component';
import { CreateDepartmentComponent } from './create-department/create-department.component';
import { JobsRateComponent } from './jobs-rate/jobs-rate.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import { XeroConfigComponent } from './xero-config/xero-config.component';
import { AuthGuard } from 'app/auth-guard.guard';
import { DocumentTabComponent } from './document-tab/document-tab.component';
import { TimeSheetFormComponent } from './time-sheet-form/time-sheet-form.component';

const routes: Routes = [
  {path:'', component:AdminLayoutComponent,children:[
  {path:'dashboard',component:AdminDashboardComponent},
  {path:'organizations',component:OrganizationsComponent},
  {path:'document',component:DocumentTabComponent},
  {path:'users',component:UsersComponent},
  {path:'timesheet',component:TimeSheetComponent},
  {path:'auditLog',component:AuditLogsComponent},
  {path:'employees',component:EmployeeComponent},
  {path:'groups',component:CreateDepartmentComponent}, 
  {path:'jobtitle',component:JobsRateComponent},
  {path: 'profile', component:AdminProfileComponent } ,
  {path: 'xeroConfig', component:XeroConfigComponent } ,
  // { path: 'timesheet/:OrganizationId/:timesheetId', component: TimeSheetComponent },

   

  ]},
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComponentsRoutingModule { }
