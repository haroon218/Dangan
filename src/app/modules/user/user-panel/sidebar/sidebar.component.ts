import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Import Router to perform navigation
// import { LoggedInUser } from '../login/login.component';
import { DataService } from '../../services/data.service';
import { HttpClient } from '@angular/common/http';
import { finalize, tap } from 'rxjs';
import { element } from 'protractor';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    roles:any;
}
export const ROUTES= {
  menues:[
    { path: 'dashboard', title: 'Dashboard',  icon: 'dashboard', class: '',roles:['User','Client'] },
    { path: 'employee', title: 'Employees',  icon:'person', class: '',roles:['User' ,'Client'] },
    { path: 'timeSheet', title: 'Timesheets',  icon:'timeline', class: '',roles:['User','Approver','Client']  },
    { path: 'auditlog', title: 'Auditlogs',  icon:'assignment', class: '' ,roles:['User','Approver','Client'] },
    { path: 'document', title: 'Documents',  icon:'folder', class: '',roles:['User','Client'] },

]
} 

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menus:any=[]
  filteredMenus:any[]=[];

  role:string='';
  constructor(private router: Router, private service: DataService,private http:HttpClient) { 
    this.menus=ROUTES.menues;
  } // Inject Router and DataService

  ngOnInit() {
    // Check user role and hide Dashboard menu item if role is 'Approver'
    const userData = localStorage.getItem('roles');
    if(userData !=null){
      
    this.role=userData;
   
    }
    this.menus.forEach((element:any)=>{
      const isrolepresrent=element.roles.find((role:any)=>role==this.role);
      if(isrolepresrent !=undefined){
        this.filteredMenus.push(element);
      }
    })
  }

  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }
}
