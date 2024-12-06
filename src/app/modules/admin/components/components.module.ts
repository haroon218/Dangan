import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {MatSelectModule} from '@angular/material/select';
import {MatDialogModule} from '@angular/material/dialog';
import {MatPaginatorModule} from '@angular/material/paginator';

import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';


import {MatInputModule} from '@angular/material/input';

import { MatSortModule} from '@angular/material/sort';

import {MatToolbarModule} from '@angular/material/toolbar';

import {MatCardModule} from '@angular/material/card';

import {MatListModule} from '@angular/material/list';

import { MatExpansionModule } from '@angular/material/expansion';
// import { AppRoutingModule } from './app-touting.module';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ComponentsRoutingModule } from './components-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
// import { UserProfileComponent } from 'app/user-profile/user-profile.component';
// import { SidebarComponent } from 'app/admin-panel/sidebar/sidebar.component';
// import { NavbarComponent } from 'app/admin-panel/navbar/navbar.component';
// import { FooterComponent } from 'app/admin-panel/footer/footer.component';
import { SidebarComponent } from './admin-panel/sidebar/sidebar.component';
import { NavbarComponent } from './admin-panel/navbar/navbar.component';
import { FooterComponent } from './admin-panel/footer/footer.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { MatTableModule } from '@angular/material/table';
import { UsersComponent } from './users/users.component';
import { PayRequestComponent } from './pay-request/pay-request.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { UserFormComponent } from './user-form/user-form.component';
import { InvoiceComponent } from '../../user/invoice/invoice.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { PayRequestDetailComponent } from './pay-request-detail/pay-request-detail.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { EmployeeComponent } from './employee/employee.component';
import { BulkEmployeeComponent } from './bulk-employee/bulk-employee.component';
import { EmployeeCreateComponent } from './employee-create/employee-create.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';
import {TimeSheetComponent  } from './time-sheet/time-sheet.component';

import { CreateDepartmentComponent } from './create-department/create-department.component';
import { DepartmentformComponent } from './departmentform/departmentform.component';
import { DepartmentconfigComponent } from './departmentconfig/departmentconfig.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { OrganizationFormComponent } from './organization-form/organization-form.component';
import { JobsRateComponent } from './jobs-rate/jobs-rate.component';
import { HourlyTimesheetComponent } from './hourly-timesheet/hourly-timesheet.component';
import { FixedSalaryTimesheetComponent } from './fixed-salary-timesheet/fixed-salary-timesheet.component';
import { JobFormComponent } from './job-form/job-form.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatIconModule} from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { HighlightWeekDirective } from './highlight-week.directive'
import {MatNativeDateModule} from '@angular/material/core';
import {FormGroup, FormControl, } from '@angular/forms';
import { TimesheetEmplyeesRateComponent } from './timesheet-emplyees-rate/timesheet-emplyees-rate.component';

import {MatDividerModule} from '@angular/material/divider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { TimeSheetFormComponent } from './time-sheet-form/time-sheet-form.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { AuditlogDetailComponent } from './auditlog-detail/auditlog-detail.component';
import { TimesheetDetailsComponent } from './timesheet-details/timesheet-details.component';
import { TimesheetDetailHourlyComponent } from './timesheet-detail-hourly/timesheet-detail-hourly.component';
import { TimesheetDetailRateComponent } from './timesheet-detail-rate/timesheet-detail-rate.component';
import { XeroConfigComponent } from './xero-config/xero-config.component';
import { BulkTimesheetComponent } from './bulk-timesheet/bulk-timesheet.component';
import { DocumentTabComponent } from './document-tab/document-tab.component';
import { UploadDocumentComponent } from './upload-document/upload-document.component';
@NgModule({
  declarations: [
    AdminDashboardComponent,
    SidebarComponent,
    NavbarComponent,
    FooterComponent,
    AdminLayoutComponent,
    // UserProfileComponent,
    UsersComponent,
    PayRequestComponent,
    OrganizationsComponent,
    PayRequestDetailComponent,
    EmployeeComponent,
    BulkEmployeeComponent,
    EmployeeCreateComponent,
    AuditLogsComponent,
    HighlightWeekDirective,
    CreateDepartmentComponent,
    DepartmentformComponent,
    DepartmentconfigComponent,
    OrganizationFormComponent,
    JobsRateComponent,
    TimeSheetFormComponent,
    TimeSheetComponent,
    HourlyTimesheetComponent,
    FixedSalaryTimesheetComponent,
    JobFormComponent,
    TimesheetEmplyeesRateComponent,
    AdminProfileComponent,
    AuditlogDetailComponent,
    TimesheetDetailsComponent,
    TimesheetDetailHourlyComponent,
    TimesheetDetailRateComponent,
    XeroConfigComponent,
    BulkTimesheetComponent,
    DocumentTabComponent,
    UploadDocumentComponent,
  ],
  imports: [
    CommonModule,MatNativeDateModule,
    ComponentsRoutingModule,
    FormsModule, ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,MatTableModule,MatSelectModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatInputModule,
    MatButtonModule,
    MatExpansionModule,
    MatSortModule,
    MatTooltipModule,
    MatToolbarModule,
    MatCardModule,
    MatListModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatIconModule,
    MatDividerModule,
    MatSlideToggleModule,
  ], 
  bootstrap: [],
  exports: [
    HighlightWeekDirective,
    // ... other components, directives, and pipes you want to export
  ],
})
export class ComponentsModule { }
