import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import {MatFormFieldModule} from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing';
import {provideAnimations} from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OauthComponent } from './oauth/oauth.component';
import { IndexComponent } from './index/index.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { MomentModule } from 'ngx-moment';
import {MatSnackBarModule} from '@angular/material/snack-bar';
// import { EmployeeComponent } from './modules/admin/employee/employee.component';
// import { BulkEmployeeComponent } from './modules/admin/bulk-employee/bulk-employee.component';
// import { UsersComponent } from './modules/admin/users/users.component';
// import { UsersComponent } from './admin/components/users/users.component';
// import { authGuardGuard } from './auth-guard.guard';
import { MatCardModule } from '@angular/material/card';
import { LogOutComponent } from './log-out/log-out.component';
import { ZeroOauth2Component } from './zero-oauth2/zero-oauth2.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AuthInterceptor } from './auth.interceptor';
import { JwtHelperService , JWT_OPTIONS } from '@auth0/angular-jwt';
@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    NgbModule,
    MatFormFieldModule,
    MatCardModule,MomentModule,
    MatSnackBarModule,

    
  ],
  declarations: [
    AppComponent,
    OauthComponent,
    IndexComponent,
    LogOutComponent,
    ZeroOauth2Component,
    PageNotFoundComponent,
    
    // EmployeeComponent,
    // BulkEmployeeComponent,
    // UsersComponent,
    // UsersComponent,
  ],

  providers: [
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },JwtHelperService, {provide:HTTP_INTERCEPTORS, useClass:AuthInterceptor, multi:true}
],
  bootstrap: [AppComponent]
})

export class AppModule { }
