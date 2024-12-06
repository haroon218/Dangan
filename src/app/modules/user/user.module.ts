import { NgModule } from '@angular/core';

import {MatSelectModule} from '@angular/material/select';

import {MatDialogModule} from '@angular/material/dialog';

// import { FormControl, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UserRoutingModule } from './user-routing.module';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { UserLayoutComponent } from './user-layout/user-layout.component';
import { TableListComponent } from './employee/table-list.component';
import { UserProfileComponent } from 'app/modules/user/user-profile/user-profile.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';

import { MatSortModule} from '@angular/material/sort';

import {MatToolbarModule} from '@angular/material/toolbar';

import {MatCardModule} from '@angular/material/card';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatFormFieldModule} from '@angular/material/form-field';

import {MatListModule} from '@angular/material/list';
import { SidebarComponent } from './user-panel/sidebar/sidebar.component';
import { NavbarComponent } from './user-panel/navbar/navbar.component';
import { FooterComponent } from './user-panel/footer/footer.component';
import { EmployeeCreateComponent } from './employee-create/employee-create.component';
import { OrganizationComponent } from './organization/organization.component';
import { PayRollComponent } from './pay-roll/pay-roll.component';
import { OrganizationFormComponent } from './organization-form/organization-form.component';
import { PayrollFormComponent } from './payroll-form/payroll-form.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { HttpClientModule } from '@angular/common/http';
import { UserFormComponent } from '../admin/components/user-form/user-form.component';
//import { AppRoutingModule } from './app.routing';
// import {MatFormFieldModule} from '@angular/material/form-field';
// import { EmployesCreateComponent } from './employes-create/employes-create.component';
// import { DataServiceModule } from './employee-data.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DepartmentComponent } from './department/department.component';
import { TimeSheetComponent } from './time-sheet/time-sheet.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';
import { CreatedepartmentComponent } from './createdepartment/createdepartment.component';
import { ConfigdepartmentComponent } from './configdepartment/configdepartment.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import { TimeSheetDetailComponent } from './time-sheet-detail/time-sheet-detail.component';
import { RejectTimeSheetReasonComponent } from './reject-time-sheet-reason/reject-time-sheet-reason.component';
import { UserTimesheetRateComponent } from './user-timesheet-rate/user-timesheet-rate.component';
import { FixedTimesheetComponent } from './fixed-timesheet/fixed-timesheet.component';
import { AuditLogdetailComponent } from './audit-logdetail/audit-logdetail.component';
import { SaveChangeComponent } from './save-change/save-change.component';
import { DocumentTabComponent } from './document-tab/document-tab.component';
import { UploadDocumentComponent } from './upload-document/upload-document.component';

@NgModule({
  declarations: [
    UserDashboardComponent,
    UserFormComponent,
    UserLayoutComponent,
    TableListComponent,FooterComponent,
    SidebarComponent,
    NavbarComponent,
    UserProfileComponent,
    EmployeeCreateComponent,
    OrganizationComponent,
    PayRollComponent,
    OrganizationFormComponent,
    PayrollFormComponent,
    InvoicesComponent,
    InvoiceComponent,
    DepartmentComponent,
    TimeSheetComponent,
    AuditLogsComponent,
    CreatedepartmentComponent,
    ConfigdepartmentComponent,
    TimeSheetDetailComponent,
    RejectTimeSheetReasonComponent,
    UserTimesheetRateComponent,
    FixedTimesheetComponent,
    AuditLogdetailComponent,
    SaveChangeComponent,
    DocumentTabComponent,
    UploadDocumentComponent
    // EmployesCreateComponent
  ],
  imports: [
    MatNativeDateModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatSnackBarModule,
    CommonModule ,
    MatInputModule,
    MatSortModule,
    MatToolbarModule,
    MatCardModule,
    MatListModule,
    MatSelectModule,MatDialogModule,
    MatTableModule,
   FormsModule, ReactiveFormsModule,
    UserRoutingModule,
    MatAutocompleteModule,MatPaginatorModule,
    MatButtonModule,
    MatFormFieldModule,
    HttpClientModule,
    MatTabsModule,
    MatIconModule

  ]
})
export class UserModule { }
