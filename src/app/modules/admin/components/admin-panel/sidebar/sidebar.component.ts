import { Component, OnInit } from '@angular/core';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: 'dashboard', title: 'Dashboard',  icon: 'dashboard', class: '' },
    { path: 'users', title: 'Users',  icon:'person', class: '' },
    { path: 'organizations', title: 'Organizations',  icon:'library_books', class: '' },
    { path: 'groups', title: 'Organizationunits',  icon:'group_work', class: '' },
    { path: 'employees', title: 'Employees',  icon:'person', class: '' },
    { path: 'timesheet', title: 'Timesheets',  icon:'timeline', class: '' },
    { path: 'auditLog', title: 'Auditlogs',  icon:'assignment', class: '' },
    { path: 'document', title: 'Documents',  icon:'folder', class: '' },
    { path: 'xeroConfig', title: 'XeroConfig',  icon:'settings', class: '' },




];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };
}
