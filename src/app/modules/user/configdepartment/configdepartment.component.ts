import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
export interface Department {
  id:string;
  name:string;
  OrganizationId:string;
}
export interface Employee {
  id: string;
  firstName:string;
  lastName:string;
  mobileNumber:string;
  gender:number;
  address: string;
  city: string;
  country:string;
  postalCode:string;
  zipCode: string;
  email: string;
  salary: number;
  employeeStatus: number;
}
@Component({
  selector: 'app-configdepartment',
  templateUrl: './configdepartment.component.html',
  styleUrls: ['./configdepartment.component.css']
})
export class ConfigdepartmentComponent {
  myControl = new FormControl('');
  options: string[] = [];
  department: any = {};
  employees: Employee[] = [];
  value: string;
  
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  filteredOptions: Observable<string[]>;
  NameFormControl = new FormControl('', [
    Validators.required,
  ]);
  displayedColumns: string[] = ['name', 'weight', 'symbol'];
  // dataSource = ELEMENT_DATA;
  dataSource = new MatTableDataSource<{ name: string }>([]);
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ConfigdepartmentComponent>,
    private _snackBar: MatSnackBar,
    private router: Router,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Department,
    private http: HttpClient,
    public route: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.department = data;
   
  }
  durationInSeconds=1;
  openSnackBar(message) {
    this._snackBar.open(message, 'Ok', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,

    });
  }
  
  ngOnInit() {
   
    this.getEmployees();
  }
  addValue() {
    let foundEmployee = this.employees.find(employee => employee.firstName+ ' ' + employee.lastName === this.value);

      if (foundEmployee) {
      } else {
      }
    if (this.value && this.dataSource.data.findIndex(item => item.name === this.value) === -1) {
      this.dataSource.data.push({ name: this.value });
      this.dataSource.data = [...this.dataSource.data];
      this.openSnackBar(`${this.value}! Added Successfully!`);
    }
  }
  clearInput() {
    this.value = ''; // Clear the input value
  }
  getEmployees(): any {
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    };

    

    this.http.get<Employee[]>(`https://api.samotplatform.com/organizationemployees/` + this.department.element.organizationId, { 'headers': options })
      .subscribe(data => {
        this.employees = data;

        this.options = this.employees.map(employee => employee.firstName + ' ' + employee.lastName);
        this.filteredOptions = this.myControl.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value || '')),
        );
      });
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

}
export interface PeriodicElement {
  name: string;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [];