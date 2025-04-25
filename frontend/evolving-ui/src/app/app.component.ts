import { Component } from '@angular/core';
       import { CommonModule } from '@angular/common';
       import { MatButtonModule } from '@angular/material/button';

       @Component({
           selector: 'app-root',
           standalone: true,
           imports: [CommonModule, MatButtonModule],
           template: `
               <h1>Welcome to Evolving UI</h1>
               <button mat-raised-button color="primary">Test Material Button</button>
           `,
           styles: []
       })
       export class AppComponent {
           title = 'evolving-ui';
       }