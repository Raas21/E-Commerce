import { Component } from '@angular/core';
import { SupplierListComponent } from './components/supplier-list/supplier-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SupplierListComponent],
  template: `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
      <app-supplier-list></app-supplier-list>
    </body>
    </html>
  `,
  styleUrls: []
})
export class AppComponent {}