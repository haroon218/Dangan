import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLayoutComponent } from './user-layout/user-layout.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { TableListComponent } from './employee/table-list.component';
import { UserProfileComponent } from 'app/modules/user/user-profile/user-profile.component';
import { OrganizationComponent } from './organization/organization.component';
import { PayRollComponent } from './pay-roll/pay-roll.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { TimeSheetComponent } from './time-sheet/time-sheet.component';
import { DepartmentComponent } from './department/department.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';
import { AuthGuard } from 'app/auth-guard.guard';
import { DocumentTabComponent } from './document-tab/document-tab.component';
// import { authGuardGuard } from 'app/auth-guard.guard';
// import { AuthGuard } from 'app/auth-guard.guard';

const routes: Routes = [ 
  {path:'', component:UserLayoutComponent,children:[
  {path:'dashboard',component:UserDashboardComponent,},
  {path:'employee',component:TableListComponent},
  {path:'organization',component:OrganizationComponent},
   {path:'payroll',component:PayRollComponent},
  {path:'timeSheet',component:TimeSheetComponent, },
  {path:'auditlog',component:AuditLogsComponent},
   {path:'invoices',component:InvoiceComponent},
  {path:'departments',component:DepartmentComponent},
  { path: 'profile', component:UserProfileComponent } ,
  { path: 'document', component:DocumentTabComponent } ,
  { path: 'timesheet/:OrganizationId/:timesheetId', component: TimeSheetComponent },


  ]},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
