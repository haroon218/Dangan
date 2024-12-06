import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css']
})
export class InvoicesComponent {

  invoiceNumber: string = 'INV123456';
  currentDate: Date = new Date();
  dueDate: Date = new Date(new Date().setDate(this.currentDate.getDate() + 30)); // Set due date 30 days from current date
  clientName: string = 'Thomas';
  clientAddress: string = 'usa';
  clientCity: string = 'New York';
  clientState: string = 'CA';
  clientZip: string = '12345';
  invoiceItems = [
    { description: 'Item 1', quantity: 2, price: 100 },
    // Add more items as needed
  ];
  displayedColumns: string[] = ['quantity', 'price', 'total'];
  invoiceDetails:any;
  loading = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data,private http:HttpClient) {}

  ngOnInit(): void {
    this.loading = true;
    console.log(this.data);
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    }
    this.http.get(`https://api.samotplatform.com/InvoiceDetails/`+this.data, {'headers':options})
    .subscribe(data => {
      this.invoiceDetails = data;
      this.loading = false;

      console.log(this.invoiceDetails);
    });
  }

  

 
}
