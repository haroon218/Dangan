import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OauthComponent } from './oauth/oauth.component';
import { LoginComponent } from './modules/user/user-panel/login/login.component';
import { UserProfileComponent } from './modules/user/user-profile/user-profile.component';
import { LogOutComponent } from './log-out/log-out.component';
import { ZeroOauth2Component } from './zero-oauth2/zero-oauth2.component';
import { AuthGuard } from './auth-guard.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TimeSheetComponent } from './modules/admin/components/time-sheet/time-sheet.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
// import { authGuardGuard } from './auth-guard.guard';

const routes: Routes =[
  {
    path: 'xero',
    component:ZeroOauth2Component
  },
  {
    path: 'user-profile',
    component:UserProfileComponent
  },
 {
     path:'',
     component:LoginComponent,
  
  
    },
    {
      path:'logout',
      component:LogOutComponent,
     
     },
    {
      path:'oauth/callback',
      component:OauthComponent
      },
 {path:'admin', loadChildren: ()=> import('./modules/admin/components/components.module').then((m)=>m.ComponentsModule),canActivate:[AuthGuard]},
  {path:'user', loadChildren: ()=> import('./modules/user/user.module').then((m)=>m.UserModule),canActivate:[AuthGuard]}, 
   { path: '**', component: PageNotFoundComponent },

  // {

  //   path: '',
  //   component: AdminLayoutComponent,
  //   children: [{
  //     path: '',
  //     loadChildren: () => import('./layouts/admin-layout/admin-layout.module').then(m => m.AdminLayoutModule)
  //   }]
  // },
  //  {path: '', component: LoginComponent},  
  // {path:'admin', loadChildren: ()=> import('./layouts/admin-layout/admin-layout.module').then((m)=>m.AdminLayoutModule)},




];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule
    .forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
 
})
export class AppRoutingModule { }
