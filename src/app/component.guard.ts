// import { CanActivateFn, Route } from '@angular/router';
// import { DataService } from './modules/user/services/data.service';
// import { map } from 'rxjs/operators';
// import { HttpClient } from '@angular/common/http'; // Import HttpClient

// export const componentGuard: CanActivateFn = (route, state) => {
//   const http = new HttpClient(null); // Create an instance of HttpClient (Passing null for the handler, as we're not using it here)
//   const router = null; // Pass null for the router argument as we don't have it here
//   const dataService = new DataService(http, router); // Create an instance of DataService with HttpClient and router

//   // Using DataService.getuser() which returns an Observable
//   return dataService.getuser().pipe(
//     map(user => {
//       console.log('User:', user); // Log the user object
//       if (user && user.length > 0) { // Ensure user is not null and has roles
//         const userRole = user[0]; // Assuming user is an array of roles, get the first role
//         return userRole === 'Approver'; // Return true if user role is 'Approver'
//       } else {
//         return false; // User not found or doesn't have any roles, cancel navigation
//       }
//     })
//   );
// };
