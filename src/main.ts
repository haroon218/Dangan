/*!

=========================================================
* Material Dashboard Angular - v2.8.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-angular2
* Copyright 2021 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-angular2/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import 'hammerjs';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppModule } from 'app/app.module';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule, {
  providers: [provideAnimations()],
})
  .catch(err => console.error(err));
  const url: URL = new URL(window.location.href);
const params: URLSearchParams = url.searchParams;
const code = params.get('code');
const state = params.get('state');
localStorage.setItem("code", code);
localStorage.setItem("state", state);