import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import { DataService } from '../../services/data.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { RouteReuseStrategy, Router } from '@angular/router';
import { AdminDataServicesService } from 'app/modules/admin/components/services/admin-data-services.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
     currentUser:any={};
    private listTitles: any[];
    location: Location;
      mobile_menu_visible: any = 0;
    private toggleButton: any;
    private sidebarVisible: boolean;

    constructor(location: Location,private snackbar:MatSnackBar  ,private element: ElementRef,public admindataservice: AdminDataServicesService,private http: HttpClient ,private router: Router,private dataService: DataService,public dialog: MatDialog) {
      this.location = location;
          this.sidebarVisible = false;
    }

    ngOnInit(){
      // this.listTitles = ROUTES.filter(listTitle => listTitle);
      const navbar: HTMLElement = this.element.nativeElement;
      this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
      this.router.events.subscribe((event) => {
        this.sidebarClose();
         var $layer: any = document.getElementsByClassName('close-layer')[0];
         if ($layer) {
           $layer.remove();
           this.mobile_menu_visible = 0;
         }
     });
     var options = {
        "Authorization": "Bearer " + localStorage.getItem('token') 
      }
      this.http.get<loggedInUser>(`https://dgr.sso.id/oauth2/me`, {'headers': options})
      .subscribe(data => {
          this.currentUser=data;
      });

     


    }
    durationInSeconds = 3;

    openSnackBar(message: string) {
      this.snackbar.open(message, 'Close', {
        duration: 3000, // Adjust duration as needed
      });
    }
    async logout() {
      try {
        // Remove token from local storage
        this.admindataservice.clearToken();
    
        const imageUrl = 'https://dgr.sso.id/account/signout'; // Replace with your URL
        const img = new Image();
        img.src = imageUrl;
    
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = (error) => reject(error);
        });
    
        this.openSnackBar('Logout successful');
        this.router.navigate(['']);
      } catch (error) {
        this.router.navigate(['']);
      }
    }
    
  
    
    sidebarOpen() {
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        setTimeout(function(){
            toggleButton.classList.add('toggled');
        }, 500);

        body.classList.add('nav-open');

        this.sidebarVisible = true;
    };
    sidebarClose() {
        const body = document.getElementsByTagName('body')[0];
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        body.classList.remove('nav-open');
    };
    sidebarToggle() {
        // const toggleButton = this.toggleButton;
        // const body = document.getElementsByTagName('body')[0];
        var $toggle = document.getElementsByClassName('navbar-toggler')[0];

        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
        const body = document.getElementsByTagName('body')[0];

        if (this.mobile_menu_visible == 1) {
            // $('html').removeClass('nav-open');
            body.classList.remove('nav-open');
            if ($layer) {
                $layer.remove();
            }
            setTimeout(function() {
                $toggle.classList.remove('toggled');
            }, 400);

            this.mobile_menu_visible = 0;
        } else {
            setTimeout(function() {
                $toggle.classList.add('toggled');
            }, 430);

            var $layer = document.createElement('div');
            $layer.setAttribute('class', 'close-layer');


            if (body.querySelectorAll('.main-panel')) {
                document.getElementsByClassName('main-panel')[0].appendChild($layer);
            }else if (body.classList.contains('off-canvas-sidebar')) {
                document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
            }

            setTimeout(function() {
                $layer.classList.add('visible');
            }, 100);

            $layer.onclick = function() { //asign a function
              body.classList.remove('nav-open');
              this.mobile_menu_visible = 0;
              $layer.classList.remove('visible');
              setTimeout(function() {
                  $layer.remove();
                  $toggle.classList.remove('toggled');
              }, 400);
            }.bind(this);

            body.classList.add('nav-open');
            this.mobile_menu_visible = 1;

        }
    };

    getTitle(){
      var titlee = this.location.prepareExternalUrl(this.location.path());
      if(titlee.charAt(0) === '#'){
          titlee = titlee.slice( 1 );
      }

      for(var item = 0; item < this.listTitles.length; item++){
          if(this.listTitles[item].path === titlee){
              return this.listTitles[item].title;
          }
      }
      return 'Dashboard';
    }
}
export interface loggedInUser {
    user_id : number;
    firstName:string;
    lastName:string;
    email: string;
    margin:number;
    status: string;
    user_roles:any[];
    user_groups:any[];
    user_organizations:string[];
  }