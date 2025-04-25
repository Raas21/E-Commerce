import { Component } from '@angular/core';
     import { CommonModule } from '@angular/common';

     @Component({
         selector: 'app-root',
         standalone: true,
         imports: [CommonModule],
         template: `
             <h1>Evolving UI Design</h1>
         `,
         styles: []
     })
     export class AppComponent {
         title = 'evolving-ui';
     }