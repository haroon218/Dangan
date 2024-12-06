import { Injectable } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private snackBar: MatSnackBar) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    let role: string = "";
    const token = localStorage.getItem("token");
    const data = localStorage.getItem("roles");

    role = data;
    if (!role) {
      // Show snackbar notification if user is not logged in
      const snackBarConfig: MatSnackBarConfig = {
        duration: 3000, // Duration in milliseconds
        horizontalPosition: "end", // Position horizontally at the end of the screen
        verticalPosition: "bottom", // Position vertically at the bottom of the screen
        panelClass: ["blue-snackbar"], // Custom CSS class for styling
      };
      this.snackBar.open(
        "You Need to login first with SSO to continue",
        "Close",
        snackBarConfig
      );
      // Redirect to null path
      this.router.navigate([""]);
      return false;
    }

    const protectedAdminRoutes: string[] = ["/admin"];
    const protectedUserRoutes: string[] = ["/user"];
    const dashboardRoute: string = "/user/dashboard";
    const employeeRoute: string = "/user/employee";
    const login: any = [""];
    if (token) {
      if (
        (role === "User" || role === "Approver" || role ==="Client") &&
        protectedAdminRoutes.some((route) => state.url.startsWith(route))
      ) {
        if (role === "User") {
          this.router.navigate(["/user/dashboard"]);
          return false; 
        } else if (role === "Approver") {
          this.router.navigate(["/user/timeSheet"]);
          return false; 
           }else if (role === "Client") {
            this.router.navigate(["/user/dashboard"]);
            return false; 
             }
      } else if (
        role === "Admin" &&
        protectedUserRoutes.some((route) => state.url.startsWith(route))
      ) {
        
        this.router.navigate(["/admin/dashboard"]);
        return false; 
      }

      if (
        role === "Approver" &&
        (state.url.startsWith(dashboardRoute) ||
          state.url.startsWith(employeeRoute))
      ) {
        this.router.navigate(["/user/timeSheet"]); 
        return false;
      }

      return true; 
    }
  }
}
